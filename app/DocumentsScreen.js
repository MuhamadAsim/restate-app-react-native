import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router"; // ✅ Use expo-router hooks
import { useCallback, useEffect, useState } from "react";
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
import NetInfo from "@react-native-community/netinfo";
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

  // Get filter parameters from expo-router params
  const filterTag = params?.tag || null; // e.g., "Voter Id", "Passport"
  const filterCategory = params?.category || null; // e.g., "Government services"
  const filterType = params?.filterType || null; // "tag" or "category"






  // Load documents from AsyncStorage and sync with cloud
 const loadDocuments = useCallback(async () => {
  try {
    setLoading(true);
    setSyncStatus("Loading local documents...");

    // 🧠 Get logged-in user data
    const savedUserData = await AsyncStorage.getItem("savedUserData");
    const user = savedUserData ? JSON.parse(savedUserData) : null;
    const userId = user?.id;
    const userEmail = user?.email;

    if (!userId) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    // 🗂️ Load local docs first
    const storageKey = `userDocuments_${userEmail}`;
    const stored = await AsyncStorage.getItem(storageKey);
    const localDocs = stored ? JSON.parse(stored) : [];
    setDocuments(localDocs);
    applyFilters(localDocs);

    // 🌐 Check Internet connection
    const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected;

    if (!isConnected) {
      setSyncStatus("Offline mode — showing local documents");
      return; // stop here if offline
    }

    setSyncStatus("Fetching documents from cloud...");

    // ☁️ Fetch from Supabase
    const { data: cloudDocs, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Cloud fetch error:", error);
      setSyncStatus("Cloud sync failed");
      return;
    }

    // 🧩 Merge cloud + local docs (avoid duplicates)
    const existingIds = localDocs.map((d) => d.id);
    const mergedDocs = [
      ...cloudDocs.map((d) => ({
        id: d.id,
        userEmail,
        name: d.name,
        category: d.category,
        tag: d.tag,
        fileUri: d.file_url, // online file
        fileUrl: d.file_url,
        fileName: d.file_name,
        mimeType: d.mime_type,
        fileSize: d.file_size,
        uploadedAt: d.uploaded_at,
        uploadedDate: new Date(d.uploaded_at).toLocaleDateString(),
        uploadedTime: new Date(d.uploaded_at).toLocaleTimeString(),
        uploadedToCloud: true,
      })),
      // Keep local-only docs (not uploaded yet)
      ...localDocs.filter((d) => !existingIds.includes(d.id)),
    ];

    // 💾 Save merged docs to local storage
    await AsyncStorage.setItem(storageKey, JSON.stringify(mergedDocs));

    // 🖥️ Update UI
    setDocuments(mergedDocs);
    applyFilters(mergedDocs);

    setSyncStatus(`Synced ${cloudDocs.length} cloud documents`);
    setTimeout(() => setSyncStatus(""), 2000);
  } catch (error) {
    console.error("Error loading documents:", error);
    Alert.alert("Error", "Failed to load documents.");
  } finally {
    setLoading(false);
  }
}, [filterTag, filterCategory, filterType]);







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

  // Open document
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
            const url = doc.cloudUrl || doc.fileUri;
            Linking.openURL(url).catch(() => {
              Alert.alert("Error", "Cannot open this document");
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Share cloud link
  const handleShare = async (doc) => {
    try {
      const shareUrl = doc.cloudUrl || doc.fileUri;
      const tagInfo = doc.tag ? `\n🏷️ Tag: ${doc.tag}` : "";
      await Share.share({
        message: `📄 ${doc.name}\n📁 Category: ${doc.category}${tagInfo}\n📅 Uploaded: ${doc.uploadedDate}\n\nAccess it here: ${shareUrl}`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share document link.");
    }
  };

  // Show QR Code
  const handleQR = (doc) => {
    setSelectedDoc(doc);
    setShowQR(true);
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
            const now = new Date();

            // 🧠 Get saved user data (to delete per-user)
            const savedUserData = await AsyncStorage.getItem("savedUserData");
            const user = savedUserData ? JSON.parse(savedUserData) : null;
            const userEmail = user?.email || "unknown_user";

            const storageKey = `userDocuments_${userEmail}`;
            const stored = await AsyncStorage.getItem(storageKey);
            const existingDocs = stored ? JSON.parse(stored) : [];

            // 🗑️ Remove from local
            const updatedDocs = existingDocs.filter((d) => d.id !== doc.id);
            await AsyncStorage.setItem(storageKey, JSON.stringify(updatedDocs));

            // 🌐 Check Internet
            const netState = await NetInfo.fetch();
            const isOnline = netState.isConnected;

            if (isOnline) {
              // 🔥 Try deleting from Supabase
              const { error } = await supabase.storage
                .from("documents")
                .remove([`${userEmail}/${doc.fileName}`]); // path structure used on upload

              if (error) throw error;
            } else {
              // 🚨 Store pending deletion if offline
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
            }

            // 📝 Log deletion
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

            setDocuments(updatedDocs);
            applyFilters(updatedDocs);
            Alert.alert("✅ Success", "Document deleted successfully");
          } catch (error) {
            console.log("Delete error:", error);
            Alert.alert("❌ Error", "Failed to delete document");
          }
        },
      },
    ]
  );
};






useEffect(() => {
  const syncPendingDeletions = async () => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;

    const pendingKey = "pendingDeletions";
    const stored = await AsyncStorage.getItem(pendingKey);
    const pending = stored ? JSON.parse(stored) : [];

    if (pending.length > 0) {
      for (const item of pending) {
        const { error } = await supabase.storage
          .from("documents")
          .remove([item.filePath]);
        if (!error) {
          console.log("✅ Synced deletion:", item.fileName);
        }
      }

      // 🧹 Clear pending after successful sync
      await AsyncStorage.removeItem(pendingKey);
    }
  };

  syncPendingDeletions();
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
          Alert.alert("Add Document", "This will open the add document modal");
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
              <View style={styles.qrContainer}>
                <QRCode
                  value={selectedDoc.cloudUrl || selectedDoc.fileUri}
                  size={220}
                  backgroundColor="white"
                />
              </View>
            )}

            <Text style={styles.qrInstruction}>
              Scan this code to access the document
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowQR(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
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
});