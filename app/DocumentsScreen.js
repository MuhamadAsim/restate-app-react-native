import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import { supabase } from "../lib/supabase";




const DocumentsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // ✅ Get params from expo-router

  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("");
  const qrCodeRef = useRef(null);


  // Get filter parameters from expo-router params
  const filterTag = params?.tag || null; // e.g., "Voter Id", "Passport"
  const filterCategory = params?.category || null; // e.g., "Government services"
  const filterType = params?.filterType || null; // "tag" or "category"




















  const loadDocuments = useCallback(async () => {
    try {
      console.log("🔵 [START] Loading documents...");
      setLoading(true);
      setSyncStatus("Loading local documents...");

      // 🧠 Get logged-in user data
      console.log("👤 [USER] Fetching user data...");
      const savedUserData = await AsyncStorage.getItem("savedUserData");
      const user = savedUserData ? JSON.parse(savedUserData) : null;
      const userId = user?.id;
      const userEmail = user?.email;

      console.log("👤 [USER DATA]", { userId, userEmail });

      if (!userId || !userEmail) {
        console.log("❌ [ERROR] User not logged in");
        Alert.alert("Error", "User not logged in.");
        setLoading(false);
        return;
      }

      // 🗂️ Load local docs first
      const storageKey = `userDocuments_${userEmail}`;
      console.log("📦 [STORAGE] Loading from key:", storageKey);

      const stored = await AsyncStorage.getItem(storageKey);
      const localDocs = stored ? JSON.parse(stored) : [];

      console.log(`📦 [LOCAL DOCS] Found ${localDocs.length} local documents`);
      console.log("📄 [LOCAL DOCS SAMPLE]", localDocs.slice(0, 2)); // Show first 2 docs

      // Show local docs immediately
      setDocuments(localDocs);
      applyFilters(localDocs);

      // 🌐 Check Internet connection
      console.log("🌐 [NETWORK] Checking connection...");
      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected;
      console.log(`🌐 [NETWORK] Connected: ${isConnected}`);

      if (!isConnected) {
        console.log("⚠️ [OFFLINE] No internet - showing local docs only");
        setSyncStatus("Offline mode — showing local documents");
        setLoading(false);
        return;
      }

      setSyncStatus("Fetching documents from cloud...");

      // 🔐 Check Supabase session
      console.log("🔐 [AUTH] Checking session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.log("⚠️ [AUTH] No session - using local docs only", sessionError);
        setSyncStatus("Not authenticated - showing local documents");
        setLoading(false);
        return;
      }

      console.log("✅ [AUTH] Session active");

      // ☁️ Fetch from Supabase
      console.log("☁️ [CLOUD] Fetching documents from Supabase...");
      const { data: cloudDocs, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false }); // ✅ use uploaded_at instead of created_at

      if (error) {
        console.error("❌ [CLOUD ERROR]", error);
        setSyncStatus("Cloud sync failed - showing local documents");
        setLoading(false);
        return;
      }

      console.log(`☁️ [CLOUD DOCS] Found ${cloudDocs?.length || 0} cloud documents`);
      console.log("📄 [CLOUD DOCS SAMPLE]", cloudDocs?.slice(0, 2));

      if (!cloudDocs || cloudDocs.length === 0) {
        console.log("ℹ️ [CLOUD] No cloud documents found");
        setSyncStatus("No cloud documents found");
        setLoading(false);
        return;
      }

      // 🧩 Map cloud documents to local format
      console.log("🔄 [MAPPING] Converting cloud docs to local format...");
      const mappedCloudDocs = cloudDocs.map((d) => {
        const uploadDate = new Date(d.uploaded_at);
        return {
          id: d.id,
          cloudId: d.id,
          userEmail,
          name: d.name,
          originalFileName: d.file_name,
          category: d.category,
          categoryIcon: getCategoryIcon(d.category),
          tag: d.tag,
          tagIcon: getTagIcon(d.tag),
          fileUri: d.file_url,
          fileUrl: d.file_url,
          fileName: d.file_name,
          mimeType: d.mime_type,
          fileSize: d.file_size,
          uploadedAt: d.uploaded_at,
          uploadedDate: uploadDate.toLocaleDateString(),
          uploadedTime: uploadDate.toLocaleTimeString(),
          uploadedToCloud: true,
          cloudSynced: true,
        };
      });

      console.log("✅ [MAPPING] Mapped cloud docs:", mappedCloudDocs.length);

      // 🧠 Smart duplicate removal using name + size + tag
      const mergedDocsMap = new Map();

      // Step 1: Add cloud docs first (priority)
      for (const doc of mappedCloudDocs) {
        const key = `${doc.name}_${doc.fileSize}_${doc.tag || ""}`;
        mergedDocsMap.set(key, doc);
      }

      // Step 2: Add local docs only if not duplicated
      for (const doc of localDocs) {
        const key = `${doc.name}_${doc.fileSize}_${doc.tag || ""}`;
        if (!mergedDocsMap.has(key)) {
          mergedDocsMap.set(key, doc);
        }
      }

      // Step 3: Convert back to array
      const mergedDocs = Array.from(mergedDocsMap.values());

      console.log(`✅ [MERGE] Total unique documents: ${mergedDocs.length}`);
      console.log("📊 [BREAKDOWN]", {
        cloudDocs: mappedCloudDocs.length,
        localOnly: localDocs.length - (mergedDocs.length - mappedCloudDocs.length),
        total: mergedDocs.length,
      });

      // 💾 Save merged docs to local storage
      console.log("💾 [SAVE] Saving merged docs to AsyncStorage...");
      await AsyncStorage.setItem(storageKey, JSON.stringify(mergedDocs));
      console.log("✅ [SAVE] Saved successfully");

      // 🖥️ Update UI
      setDocuments(mergedDocs);
      applyFilters(mergedDocs);

      setSyncStatus(`Synced ${cloudDocs.length} cloud documents`);
      console.log("🎉 [SUCCESS] Documents loaded and synced");

      setTimeout(() => setSyncStatus(""), 2000);
    } catch (error) {
      console.error("❌ [CRITICAL ERROR] Loading documents failed:", error);
      console.error("Stack:", error.stack);
      Alert.alert("Error", `Failed to load documents: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("🏁 [END] loadDocuments completed");
    }
  }, [filterTag, filterCategory, filterType]);















  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      "Government services": "📋",
      "Banking & Finance": "💰",
      "Education & Learning": "🏫",
      "Transport": "🚗",
      "Health & Insurance": "🏥",
      "Other Documents": "📄",
    };
    return icons[category] || "📄";
  };

  // Helper function to get tag icon
  const getTagIcon = (tag) => {
    // Return empty string if no tag, as your quickTags don't have icons
    return "";
  };




  // Apply filters based on tag or category
  const applyFilters = (docs) => {
    let filtered = docs;

    if (filterType === "tag" && filterTag) {
      // Filter by tag
      console.log("Filtering by tag:", filterTag);
      filtered = docs.filter((doc) => doc.tag === filterTag);
      console.log("Filtered documents:", filtered.length);
    } else if (filterType === "category" && filterCategory) {
      // Filter by category
      console.log("Filtering by category:", filterCategory);
      filtered = docs.filter((doc) => doc.category === filterCategory);
      console.log("Filtered documents:", filtered.length);
    }
    // If no filter, show all documents

    setFilteredDocuments(filtered);
  };






  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  }, [loadDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Re-apply filters when documents change
  useEffect(() => {
    applyFilters(documents);
  }, [filterTag, filterCategory, filterType, documents]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Get icon based on tag
  const getDocIcon = (tag, tagIcon) => {
    if (tagIcon) return tagIcon;

    const icons = {
      "National Id": "card-outline",
      "Driving Licence": "car-outline",
      Citizenship: "flag-outline",
      Passport: "airplane-outline",
      "Voter Id": "checkbox-outline",
      "Birth Certificate": "document-outline",
      Insurance: "shield-outline",
      Contract: "document-text-outline",
    };
    return icons[tag] || "document-text-outline";
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      "Government services": "#3B82F6",
      "Banking & Finance": "#10B981",
      "Education & Learning": "#F59E0B",
      Transport: "#8B5CF6",
      "Health & Insurance": "#EF4444",
      "Other Documents": "#6B7280",
    };
    return colors[category] || "#6B7280";
  };




  // Update handleView to use fileUrl
  const handleView = (doc) => {
    Alert.alert(
      "Open Document",
      `Do you want to view "${doc.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open",
          onPress: () => {
            const url = doc.fileUrl || doc.fileUri; // ✅ FIXED: Use fileUrl
            Linking.openURL(url).catch(() => {
              Alert.alert("Error", "Cannot open this document");
            });
          },
        },
      ],
      { cancelable: true }
    );
  };



  // Update handleShare to use fileUrl
  const handleShare = async (doc) => {
    try {
      const shareUrl = doc.fileUrl || doc.fileUri; // ✅ FIXED: Use fileUrl
      const tagInfo = doc.tag ? `\n🏷️ Tag: ${doc.tag}` : "";
      await Share.share({
        message: `📄 ${doc.name}\n📁 Category: ${doc.category}${tagInfo}\n📅 Uploaded: ${doc.uploadedDate}\n\nAccess it here: ${shareUrl}`,
        title: `Share ${doc.name}`, // Added title for better UX
      });
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Unable to share document link.");
    }
  };

  // Show QR Code
  const handleQR = (doc) => {
    setSelectedDoc(doc);
    setShowQR(true);
  };


  const shareQRCode = async () => {
    if (!selectedDoc) return;

    try {
      // Capture the QR code as an image
      const uri = await captureRef(qrCodeRef, {
        format: 'png',
        quality: 1,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the QR code image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Share QR Code - ${selectedDoc.name}`,
      });
    } catch (error) {
      console.error('QR Share error:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };




  const handleDelete = (doc) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${doc.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🧩 Starting deletion for:", doc.name, doc);

              const now = new Date();

              // 🧠 Load user
              const savedUserData = await AsyncStorage.getItem("savedUserData");
              const user = savedUserData ? JSON.parse(savedUserData) : null;
              const userEmail = user?.email || "unknown_user";
              console.log("👤 User email:", userEmail);

              const storageKey = `userDocuments_${userEmail}`;
              const stored = await AsyncStorage.getItem(storageKey);
              const existingDocs = stored ? JSON.parse(stored) : [];

              console.log("📦 Existing local docs:", existingDocs.length);

              // 🗑️ Remove locally
              const updatedDocs = existingDocs.filter((d) => d.id !== doc.id);
              await AsyncStorage.setItem(storageKey, JSON.stringify(updatedDocs));
              console.log("🗑️ Removed from local AsyncStorage");

              // 🌐 Check Internet
              const netState = await NetInfo.fetch();
              const isOnline = netState.isConnected;
              console.log("🌐 Internet available:", isOnline);

              if (isOnline) {
                // Delete from Supabase storage
                const storagePath = `${userEmail}/${doc.fileName}`;
                console.log("🚀 Attempting Supabase delete for:", storagePath);

                const { error: storageError } = await supabase.storage
                  .from("documents")
                  .remove([storagePath]);

                if (storageError) {
                  console.log("⚠️ Storage delete error:", storageError.message);
                } else {
                  console.log(`✅ Deleted ${doc.fileName} from Supabase Storage`);
                }

                // Delete from Supabase DB
                console.log("🧾 Deleting from Supabase DB table: documents");
                const { error: dbError } = await supabase
                  .from("documents")
                  .delete()
                  .eq("id", doc.id);

                if (dbError) {
                  console.log("⚠️ Database delete error:", dbError.message);
                } else {
                  console.log("✅ Deleted record from Supabase DB");
                }
              } else {
                // 🚨 Offline — store pending deletion
                console.log("📴 Offline, storing pending deletion info");

                const pendingKey = "pendingDeletions";
                const pendingStored = await AsyncStorage.getItem(pendingKey);
                const pendingDeletions = pendingStored
                  ? JSON.parse(pendingStored)
                  : [];

                pendingDeletions.push({
                  userEmail,
                  fileName: doc.fileName,
                  docId: doc.id,
                  filePath: `${userEmail}/${doc.fileName}`,
                  addedAt: now.toISOString(),
                });

                await AsyncStorage.setItem(
                  pendingKey,
                  JSON.stringify(pendingDeletions)
                );

                console.log("💾 Saved pending deletion:", doc.fileName);
              }

              // 📝 Add log
              const logEntry = {
                id: Date.now(),
                userEmail,
                action: "DOCUMENT_DELETED",
                timestamp: now.toISOString(),
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
                documentName: doc.name,
                documentId: doc.id,
                category: doc.category,
                tag: doc.tag || "None",
                details: `Document "${doc.name}" deleted from ${doc.category}`,
              };

              const storedLogs = await AsyncStorage.getItem("documentLogs");
              const existingLogs = storedLogs ? JSON.parse(storedLogs) : [];
              await AsyncStorage.setItem(
                "documentLogs",
                JSON.stringify([logEntry, ...existingLogs])
              );

              console.log("🧾 Log entry saved:", logEntry);

              setDocuments(updatedDocs);
              applyFilters(updatedDocs);
              Alert.alert("✅ Success", "Document deleted successfully");
            } catch (error) {
              console.log("❌ Delete error:", error);
              Alert.alert("❌ Error", "Failed to delete document");
            }
          },
        },
      ]
    );
  };











  // 🧩 Function to sync pending deletions when online
  const syncPendingDeletions = async () => {
    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) return;

      const pendingKey = "pendingDeletions";
      const pendingStored = await AsyncStorage.getItem(pendingKey);
      const pendingDeletions = pendingStored ? JSON.parse(pendingStored) : [];

      if (pendingDeletions.length === 0) return;

      const remaining = [];

      for (const item of pendingDeletions) {
        try {
          const { error } = await supabase.storage
            .from("documents")
            .remove([item.filePath]);

          if (error) throw error;

          console.log(`🗑️ Synced and deleted pending file: ${item.fileName}`);
        } catch (err) {
          console.log("⚠️ Failed to sync deletion:", item.fileName, err.message);
          remaining.push(item); // keep it if failed
        }
      }

      await AsyncStorage.setItem(pendingKey, JSON.stringify(remaining));
    } catch (error) {
      console.error("Sync pending deletions error:", error);
    }
  };

  // 🚀 Run on page load (e.g., inside useEffect of Documents page)
  useEffect(() => {
    const interval = setInterval(syncPendingDeletions, 5000); // retry every 5s
    syncPendingDeletions(); // also run immediately on mount
    return () => clearInterval(interval);
  }, []);










  const renderItem = ({ item }) => {
    const isIconEmoji = item.tagIcon && /\p{Emoji}/u.test(item.tagIcon);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getCategoryColor(item.category) + "20" },
              ]}
            >
              {isIconEmoji ? (
                <Text style={{ fontSize: 24 }}>{item.tagIcon}</Text>
              ) : (
                <Ionicons
                  name={getDocIcon(item.tag, item.tagIcon)}
                  size={24}
                  color={getCategoryColor(item.category)}
                />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.categoryBadge}>
                <Text
                  style={[
                    styles.categoryText,
                    { color: getCategoryColor(item.category) },
                  ]}
                >
                  {item.categoryIcon} {item.category}
                </Text>
              </View>
              {item.tag && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>
                    {item.tagIcon} {item.tag}
                  </Text>
                </View>
              )}
            </View>
            {item.cloudSynced && (
              <View style={styles.cloudBadge}>
                <Ionicons name="cloud-done-outline" size={16} color="#10B981" />
              </View>
            )}
          </View>
        </View>

        {/* Document Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.uploadedDate} at {item.uploadedTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {item.originalFileName || item.fileName || "Document"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="file-tray-outline" size={14} color="#6B7280" />
            <Text style={styles.detailText}>
              {formatFileSize(item.fileSize)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleView(item)}
          >
            <Ionicons name="eye-outline" size={20} color="#2563EB" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-social-outline" size={20} color="#059669" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleQR(item)}
          >
            <Ionicons name="qr-code-outline" size={20} color="#D97706" />
            <Text style={styles.actionText}>QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get header title based on filter
  const getHeaderTitle = () => {
    if (filterType === "tag" && filterTag) {
      return `${filterTag} Documents`;
    } else if (filterType === "category" && filterCategory) {
      return `${filterCategory}`;
    }
    return "📄 My Documents";
  };

  // Get empty state message based on filter
  const getEmptyMessage = () => {
    if (filterType === "tag" && filterTag) {
      return `No ${filterTag} documents yet`;
    } else if (filterType === "category" && filterCategory) {
      return `No documents in ${filterCategory} yet`;
    }
    return "No documents yet";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          {(filterTag || filterCategory) && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>{getHeaderTitle()}</Text>
            <Text style={styles.subHeader}>
              {filteredDocuments.length} document
              {filteredDocuments.length !== 1 ? "s" : ""}
              {filterTag || filterCategory ? " found" : " stored"}
            </Text>
          </View>
        </View>

        {/* Filter Info Badge */}
        {(filterTag || filterCategory) && (
          <View style={styles.filterBadge}>
            <Ionicons name="funnel-outline" size={14} color="#3B82F6" />
            <Text style={styles.filterText}>
              Filtered by: {filterTag || filterCategory}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // Clear filter and show all documents
                router.push("/DocumentsScreen");
              }}
              style={styles.clearFilterBtn}
            >
              <Ionicons name="close-circle" size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sync Status */}
      {syncStatus ? (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.syncText}>{syncStatus}</Text>
        </View>
      ) : null}

      {filteredDocuments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
          <Text style={styles.emptySubText}>
            {filterTag || filterCategory
              ? "Try uploading documents with this filter or view all documents"
              : "Tap the + button to upload your first document"}
          </Text>
          {(filterTag || filterCategory) && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                router.push("/DocumentsScreen");
              }}
            >
              <Text style={styles.viewAllText}>View All Documents</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
            />
          }
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // Navigate to add document screen
          router.push("/components/AddDocument");
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* QR Modal */}

      <Modal visible={showQR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.qrTitle}>QR Code</Text>
            <Text style={styles.qrSubtitle}>{selectedDoc?.name}</Text>

            {selectedDoc && (
              <View
                ref={qrCodeRef}
                style={styles.qrContainer}
                collapsable={false} // Important for Android
              >
                <QRCode
                  value={selectedDoc.fileUrl}
                  size={220}
                  backgroundColor="white"
                />
              </View>
            )}

            <Text style={styles.qrInstruction}>
              Scan this code to access the document
            </Text>

            {/* Document Details */}
            {selectedDoc && (
              <View style={styles.qrDetails}>
                <Text style={styles.qrDetailText}>
                  📁 {selectedDoc.category}
                </Text>
                {selectedDoc.tag && (
                  <Text style={styles.qrDetailText}>
                    🏷️ {selectedDoc.tag}
                  </Text>
                )}
                <Text style={styles.qrDetailText}>
                  📅 {selectedDoc.uploadedDate}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.qrActions}>
              {/* Share QR Code Button */}
              <TouchableOpacity
                style={styles.qrShareBtn}
                onPress={shareQRCode}
              >
                <Ionicons name="share-social-outline" size={20} color="#fff" />
                <Text style={styles.qrShareText}>Share QR Code</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowQR(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: "#6B7280",
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  filterText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500",
    marginLeft: 6,
    flex: 1,
  },
  clearFilterBtn: {
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  syncText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tagBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  cloudBadge: {
    backgroundColor: "#D1FAE5",
    padding: 6,
    borderRadius: 8,
  },
  detailsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 11,
    marginTop: 4,
    color: "#4B5563",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  viewAllButton: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  viewAllText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#3B82F6",
    borderRadius: 50,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  qrSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 16,
  },
  qrInstruction: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 20,
    textAlign: "center",
  },
  closeBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  closeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  qrInstruction: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
    textAlign: "center",
  },
  qrDetails: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  qrDetailText: {
    fontSize: 13,
    color: "#4B5563",
    marginVertical: 2,
  },
  qrActions: {
    width: "100%",
    gap: 10,
  },
  qrShareBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  qrShareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  qrInstruction: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
    textAlign: "center",
  },
  qrDetails: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  qrDetailText: {
    fontSize: 13,
    color: "#4B5563",
    marginVertical: 2,
  },
  qrActions: {
    width: "100%",
    gap: 10,
  },
  qrShareBtn: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  qrShareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeBtn: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
});