import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
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

const DocumentsScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("");

  // Load documents from AsyncStorage and sync with cloud
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setSyncStatus("Loading local documents...");

      // Get local documents
      const stored = await AsyncStorage.getItem("userDocuments");
      const localDocs = stored ? JSON.parse(stored) : [];

      setDocuments(localDocs);
      setSyncStatus("Syncing with cloud...");

      // Mock cloud sync (simulate API call)
      await mockCloudSync(localDocs);

      setSyncStatus("");
    } catch (error) {
      console.error("Error loading documents:", error);
      Alert.alert("Error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock cloud sync function
  const mockCloudSync = async (localDocs) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // Simulate fetching from cloud
          const mockCloudDocs = [
            {
              id: Date.now() + 1000,
              name: "Cloud Synced Passport",
              category: "Government services",
              docType: "Passport",
              uploadedAt: new Date(Date.now() - 86400000).toISOString(),
              uploadedDate: new Date(Date.now() - 86400000).toLocaleDateString(),
              uploadedTime: new Date(Date.now() - 86400000).toLocaleTimeString(),
              fileUri: "cloud://passport.pdf",
              fileName: "passport_cloud.pdf",
              fileSize: 524288,
              cloudSynced: true,
              cloudUrl: "https://cloud.example.com/docs/passport_" + Date.now(),
            },
          ];

          // Check if cloud docs already exist locally
          const existingIds = localDocs.map((doc) => doc.id);
          const newCloudDocs = mockCloudDocs.filter(
            (doc) => !existingIds.includes(doc.id)
          );

          if (newCloudDocs.length > 0) {
            // Merge cloud docs with local
            const mergedDocs = [...localDocs, ...newCloudDocs];
            await AsyncStorage.setItem(
              "userDocuments",
              JSON.stringify(mergedDocs)
            );
            setDocuments(mergedDocs);
            setSyncStatus(`Synced ${newCloudDocs.length} documents from cloud`);
            setTimeout(() => setSyncStatus(""), 2000);
          } else {
            setSyncStatus("All documents up to date");
            setTimeout(() => setSyncStatus(""), 2000);
          }
        } catch (error) {
          console.error("Cloud sync error:", error);
        }
        resolve();
      }, 1500); // Simulate network delay
    });
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Get icon based on document type
  const getDocIcon = (docType) => {
    const icons = {
      "National Id": "card-outline",
      "Driving Licence": "car-outline",
      Citizenship: "flag-outline",
      Passport: "airplane-outline",
      "Voter Id": "checkbox-outline",
      Other: "document-outline",
    };
    return icons[docType] || "document-text-outline";
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
      await Share.share({
        message: `📄 ${doc.name}\n📁 Category: ${doc.category}\n📅 Uploaded: ${doc.uploadedDate}\n\nAccess it here: ${shareUrl}`,
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

  // Delete document
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
              const updatedDocs = documents.filter((d) => d.id !== doc.id);
              await AsyncStorage.setItem(
                "userDocuments",
                JSON.stringify(updatedDocs)
              );
              setDocuments(updatedDocs);
              Alert.alert("Success", "Document deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete document");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.row}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getCategoryColor(item.category) + "20" },
            ]}
          >
            <Ionicons
              name={getDocIcon(item.docType)}
              size={24}
              color={getCategoryColor(item.category)}
            />
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
                {item.category}
              </Text>
            </View>
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
          <Text style={styles.detailText}>{item.docType || "Document"}</Text>
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
        <Text style={styles.header}>📄 My Documents</Text>
        <Text style={styles.subHeader}>
          {documents.length} document{documents.length !== 1 ? "s" : ""} stored
        </Text>
      </View>

      {/* Sync Status */}
      {syncStatus ? (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.syncText}>{syncStatus}</Text>
        </View>
      ) : null}

      {documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyText}>No documents yet</Text>
          <Text style={styles.emptySubText}>
            Tap the + button to upload your first document
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
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
          // navigation.navigate('AddDocument');
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
  },
  categoryText: {
    fontSize: 13,
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