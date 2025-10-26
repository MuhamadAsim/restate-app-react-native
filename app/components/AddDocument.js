import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "../../lib/supabase"; // adjust path
import * as FileSystem from "expo-file-system";


import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const mainCategories = [
  { id: 1, name: "Government services", icon: "📋" },
  { id: 2, name: "Banking & Finance", icon: "💰" },
  { id: 3, name: "Education & Learning", icon: "🏫" },
  { id: 4, name: "Transport", icon: "🚗" },
  { id: 5, name: "Health & Insurance", icon: "🏥" },
  { id: 6, name: "Other Documents", icon: "📄" },
];

const quickTags = [
  { id: 1, name: "National Id", icon: "" },
  { id: 2, name: "Driving Licence", icon: "" },
  { id: 3, name: "Citizenship", icon: "" },
  { id: 4, name: "Passport", icon: "" },
  { id: 5, name: "Voter Id", icon: "" },
  { id: 6, name: "Birth Certificate", icon: "" },
  { id: 7, name: "Insurance", icon: "" },
  { id: 8, name: "Contract", icon: "" },
];

const AddDocumentModal = ({ visible, onClose, onDocumentAdded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [uploading, setUploading] = useState(false);







  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      setSelectedFile(result.assets[0]);
      
      // Auto-fill document name with original filename if not already set
      if (!documentName) {
        const fileName = result.assets[0].name;
        // Remove file extension for cleaner name
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
        setDocumentName(nameWithoutExt);
      }
    } catch (error) {
      console.log("Document pick error:", error);
    }
  };

  // Add log entry to AsyncStorage
  const addLog = async (logEntry) => {
    try {
      const stored = await AsyncStorage.getItem("documentLogs");
      const existingLogs = stored ? JSON.parse(stored) : [];
      const newLogs = [logEntry, ...existingLogs]; // Add new log at the beginning
      await AsyncStorage.setItem("documentLogs", JSON.stringify(newLogs));
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };







  





  

const handleSaveDocument = async () => {
  if (!selectedFile) {
    return Alert.alert("Missing File", "Please select a file to upload.");
  }
  if (!selectedCategory) {
    return Alert.alert("Missing Category", "Please select a category for this document.");
  }
  if (!documentName.trim()) {
    return Alert.alert("Missing Name", "Please enter a name for this document.");
  }

  setUploading(true);

  try {
    const savedUserData = await AsyncStorage.getItem("savedUserData");
    const user = savedUserData ? JSON.parse(savedUserData) : null;
    const userEmail = user?.email || "unknown_user";
    const userId = user?.id;

    const now = new Date();
    const storageKey = `userDocuments_${userEmail}`;

    // 🌐 1️⃣ Check Internet Connection
    const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected;

    let uploadedToCloud = false;
    let fileUrl = null;

    // ☁️ 2️⃣ If online → upload to Supabase Storage & Database
    if (isConnected && userId) {
      try {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Convert local file to base64
        const fileBase64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileBuffer = Buffer.from(fileBase64, "base64");

        // Upload to Supabase Storage bucket "docs"
        const { error: uploadError } = await supabase.storage
          .from("docs") // ✅ correct bucket name
          .upload(filePath, fileBuffer, {
            contentType: selectedFile.mimeType || "application/octet-stream",
          });

        if (uploadError) throw uploadError;

        // Get public URL from the same bucket
        const { data: publicUrlData } = supabase.storage
          .from("docs")
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
        uploadedToCloud = true;

        // 🗄️ Save document metadata to Supabase table "documents"
        const { error: insertError } = await supabase.from("documents").insert([
          {
            user_id: userId,
            name: documentName.trim(),
            category: selectedCategory.name,
            tag: selectedTag?.name || null,
            file_url: fileUrl,
            file_name: selectedFile.name,
            mime_type: selectedFile.mimeType,
            file_size: selectedFile.size,
            shared: false,
          },
        ]);

        if (insertError) throw insertError;
      } catch (err) {
        console.log("Cloud upload failed, saving locally instead:", err.message);
        uploadedToCloud = false;
      }
    }

    // 💾 3️⃣ Always save locally (for offline access)
    const docToSave = {
      id: Date.now(),
      userEmail,
      name: documentName.trim(),
      originalFileName: selectedFile.name,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      tag: selectedTag?.name || null,
      tagIcon: selectedTag?.icon || null,
      fileUri: selectedFile.uri,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.mimeType,
      uploadedAt: now.toISOString(),
      uploadedDate: now.toLocaleDateString(),
      uploadedTime: now.toLocaleTimeString(),
      uploadedToCloud, // ✅ true if uploaded successfully
      fileUrl: fileUrl || null,
    };

    const stored = await AsyncStorage.getItem(storageKey);
    const existingDocs = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(storageKey, JSON.stringify([...existingDocs, docToSave]));

    // 📝 4️⃣ Create Log Entry
    const logEntry = {
      id: Date.now(),
      userEmail,
      action: "DOCUMENT_ADDED",
      timestamp: now.toISOString(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      documentName: documentName.trim(),
      documentId: docToSave.id,
      category: selectedCategory.name,
      tag: selectedTag?.name || "None",
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      uploadedToCloud,
      details: uploadedToCloud
        ? `Document "${documentName.trim()}" uploaded to cloud and saved locally.`
        : `Document "${documentName.trim()}" saved locally (offline).`,
    };

    await addLog(logEntry);

    Alert.alert("✅ Success", uploadedToCloud ? "Uploaded to cloud!" : "Saved locally for now.");

    if (onDocumentAdded) onDocumentAdded();
    resetForm();
    onClose();
  } catch (err) {
    console.log("Save error:", err);
    Alert.alert("Error", "Failed to save document.");
  } finally {
    setUploading(false);
  }
};


















  const resetForm = () => {
    setSelectedFile(null);
    setSelectedCategory(null);
    setSelectedTag(null);
    setDocumentName("");
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 10,
        backgroundColor:
          selectedCategory?.id === item.id ? "#667eea" : "#f5f5f5",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: selectedCategory?.id === item.id ? "#667eea" : "#e5e5e5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        minWidth: 100,
      }}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={{
          fontSize: 24,
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        {item.icon}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: selectedCategory?.id === item.id ? "#fff" : "#333",
          textAlign: "center",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTagItem = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: selectedTag?.id === item.id ? "#667eea" : "#f5f5f5",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: selectedTag?.id === item.id ? "#667eea" : "#e5e5e5",
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => {
        // Toggle selection - click again to deselect
        setSelectedTag(selectedTag?.id === item.id ? null : item);
      }}
    >
      <Text style={{ fontSize: 18, marginRight: 6 }}>{item.icon}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: selectedTag?.id === item.id ? "#fff" : "#333",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#667eea",
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                📄 Add Document
              </Text>
              <Text style={{ fontSize: 14, color: "#e0e7ff" }}>
                Upload and organize your files
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 20, color: "#fff" }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* File Picker Section */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#333",
                marginBottom: 12,
              }}
            >
              Select File *
            </Text>
            <TouchableOpacity
              style={{
                padding: 16,
                backgroundColor: selectedFile ? "#f0f4ff" : "#667eea",
                borderRadius: 12,
                alignItems: "center",
                borderWidth: selectedFile ? 2 : 0,
                borderColor: "#667eea",
                borderStyle: selectedFile ? "dashed" : "solid",
              }}
              onPress={handlePickDocument}
            >
              <Text
                style={{
                  fontSize: 32,
                  marginBottom: 8,
                }}
              >
                {selectedFile ? "📎" : "📁"}
              </Text>
              <Text
                style={{
                  color: selectedFile ? "#667eea" : "#fff",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {selectedFile ? "Change File" : "Choose File"}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#f9fafb",
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: "#667eea",
                }}
              >
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 2 }}>
                  Original File:
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#333" }}
                  numberOfLines={1}
                >
                  {selectedFile.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </Text>
              </View>
            )}
          </View>

          {/* Document Name Section */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Document Name *
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 12,
              }}
            >
              Enter a name to identify this document
            </Text>
            <TextInput
              placeholder="e.g., My Passport, National ID Card"
              placeholderTextColor="#999"
              style={{
                borderWidth: 1.5,
                borderColor: documentName ? "#667eea" : "#e5e5e5",
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: "#333",
                backgroundColor: "#fafafa",
              }}
              value={documentName}
              onChangeText={setDocumentName}
            />
          </View>

          {/* Category Section */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Category *
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 12,
              }}
            >
              Choose the main category for this document
            </Text>
            <FlatList
              horizontal
              data={mainCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Quick Tags Section (Optional) */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#333",
                marginBottom: 8,
              }}
            >
              Quick Tag (Optional)
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 12,
              }}
            >
              Add a quick tag for easier filtering. Tap to select/deselect.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {quickTags.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: selectedTag?.id === item.id ? "#667eea" : "#f5f5f5",
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: selectedTag?.id === item.id ? "#667eea" : "#e5e5e5",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    setSelectedTag(selectedTag?.id === item.id ? null : item);
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 6 }}>{item.icon}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: selectedTag?.id === item.id ? "#fff" : "#333",
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View
          style={{
            padding: 20,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e5e5e5",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            onPress={handleSaveDocument}
            style={{
              backgroundColor: uploading ? "#9ca3af" : "#667eea",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 10,
              shadowColor: "#667eea",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }}
            disabled={uploading}
          >
            {uploading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{ color: "#fff", marginLeft: 10, fontWeight: "600" }}>
                  Uploading...
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                💾 Save Document
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#f5f5f5",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
            disabled={uploading}
          >
            <Text style={{ color: "#666", fontWeight: "600", fontSize: 16 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddDocumentModal;