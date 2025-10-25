import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mainCategories = [
  { id: 1, name: "Government services", icon: "📋" },
  { id: 2, name: "Banking & Finance", icon: "💰" },
  { id: 3, name: "Education & Learning", icon: "🏫" },
  { id: 4, name: "Transport", icon: "🚗" },
  { id: 5, name: "Health & Insurance", icon: "🏥" },
  { id: 6, name: "Other Documents", icon: "📄" },
];

const documents = [
  { id: 1, name: "National Id", icon: "🪪" },
  { id: 2, name: "Driving Licence", icon: "📝" },
  { id: 3, name: "Citizenship", icon: "📜" },
  { id: 4, name: "Passport", icon: "📘" },
  { id: 5, name: "Voter Id", icon: "🪑" },
];

const AddDocumentModal = ({ visible, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [customName, setCustomName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      setSelectedFile(result.assets[0]);
    } catch (error) {
      console.log("Document pick error:", error);
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedFile || !selectedCategory)
      return Alert.alert("Missing Info", "Please select a category and file.");

    setUploading(true);

    // mock supabase upload delay
    setTimeout(async () => {
      try {
        const now = new Date();
        const docToSave = {
          id: Date.now(),
          name: customName || selectedDocType?.name || selectedFile.name,
          category: selectedCategory.name,
          docType: selectedDocType?.name || "Other",
          fileUri: selectedFile.uri,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          uploadedAt: now.toISOString(),
          uploadedDate: now.toLocaleDateString(),
          uploadedTime: now.toLocaleTimeString(),
        };

        const stored = await AsyncStorage.getItem("userDocuments");
        const existingDocs = stored ? JSON.parse(stored) : [];
        await AsyncStorage.setItem(
          "userDocuments",
          JSON.stringify([...existingDocs, docToSave])
        );

        Alert.alert("✅ Success", "Document uploaded successfully!");
        resetForm();
        onClose();
      } catch (err) {
        console.log("Save error:", err);
        Alert.alert("Error", "Failed to save document");
      } finally {
        setUploading(false);
      }
    }, 2000);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedCategory(null);
    setSelectedDocType(null);
    setCustomName("");
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

  const renderDocItem = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginRight: 8,
        backgroundColor: selectedDocType?.id === item.id ? "#667eea" : "#f5f5f5",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: selectedDocType?.id === item.id ? "#667eea" : "#e5e5e5",
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => setSelectedDocType(item)}
    >
      <Text style={{ fontSize: 20, marginRight: 6 }}>{item.icon}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: selectedDocType?.id === item.id ? "#fff" : "#333",
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
              Select File
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
                  Selected File:
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#333" }}
                  numberOfLines={1}
                >
                  {selectedFile.name}
                </Text>
              </View>
            )}
          </View>

          {/* Document Type Section */}
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
              Document Type
            </Text>
            <FlatList
              horizontal
              data={documents}
              renderItem={renderDocItem}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
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
                marginBottom: 12,
              }}
            >
              Category *
            </Text>
            <FlatList
              horizontal
              data={mainCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Custom Name Section */}
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
                marginBottom: 12,
              }}
            >
              Custom Name (Optional)
            </Text>
            <TextInput
              placeholder="Enter a custom name for this document"
              placeholderTextColor="#999"
              style={{
                borderWidth: 1.5,
                borderColor: "#e5e5e5",
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: "#333",
                backgroundColor: "#fafafa",
              }}
              value={customName}
              onChangeText={setCustomName}
            />
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
              <ActivityIndicator color="#fff" size="small" />
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