import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import * as DocumentPicker from "expo-document-picker";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "../lib/supabase";
import { translations } from "./translations/dashboardTranslation";
import { styles } from "./styles/dashboardScreenStyle";

export default function DashboardScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("allTime");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Add document states
  const [selectedFile, setSelectedFile] = useState(null);
  const [newDocCategory, setNewDocCategory] = useState("personal");
  const [newDocName, setNewDocName] = useState("");

  const t = translations[language];

  useEffect(() => {
    loadUserAndLanguage();
    loadDocuments();
    checkConnection();

    // Listen for connection changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [
    searchQuery,
    documents,
    selectedCategory,
    selectedDateRange,
    selectedStatus,
  ]);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsOnline(state.isConnected);
  };

  const loadUserAndLanguage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const savedLanguage = await AsyncStorage.getItem("appLanguage");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        // Load from cloud (mock)
        console.log("Loading documents from cloud...");
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

        const mockCloudDocuments = [
          {
            id: "1",
            title: "Project Proposal 2025",
            category: "work",
            date: new Date().toISOString(),
            size: "2.5 MB",
            syncedToCloud: true,
          },
          {
            id: "2",
            title: "Financial Report Q1",
            category: "financial",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            size: "1.8 MB",
            syncedToCloud: true,
          },
        ];
        setDocuments(mockCloudDocuments);
      } else {
        // Load from local storage
        console.log("Loading documents from local storage...");
        const localDocs = await AsyncStorage.getItem("localDocuments");
        if (localDocs) {
          setDocuments(JSON.parse(localDocs));
        } else {
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      Alert.alert("Error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = async (docs) => {
    try {
      await AsyncStorage.setItem("localDocuments", JSON.stringify(docs));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Filter by date range
    if (selectedDateRange !== "allTime") {
      const now = new Date();
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.date);
        const diffDays = Math.floor((now - docDate) / (1000 * 60 * 60 * 24));

        switch (selectedDateRange) {
          case "today":
            return diffDays === 0;
          case "thisWeek":
            return diffDays <= 7;
          case "thisMonth":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredDocuments(filtered);
  };

  const handleAddDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "success" || result.assets) {
        const file = result.assets ? result.assets[0] : result;
        setSelectedFile(file);
        setNewDocName(file.name || "");
        setShowAddModal(true);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document");
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "No document selected");
      return;
    }

    setUploading(true);

    try {
      const docName = newDocName.trim() || selectedFile.name;
      const newDoc = {
        id: Date.now().toString(),
        title: docName,
        category: newDocCategory,
        date: new Date().toISOString(),
        size: selectedFile.size
          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
          : "Unknown",
        syncedToCloud: false,
      };

      // Save to local storage first
      console.log("Saving document locally...");
      const updatedDocs = [...documents, newDoc];
      await saveToLocalStorage(updatedDocs);

      if (isOnline) {
        // Mock cloud upload
        console.log("Uploading to cloud...");
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate upload

        // Mark as synced
        newDoc.syncedToCloud = true;
        console.log("Document uploaded to cloud successfully");
        Alert.alert("Success", t.uploadSuccess);
      } else {
        console.log("Document saved locally (offline mode)");
        Alert.alert("Success", "Document saved locally");
      }

      setDocuments(updatedDocs);
      setShowAddModal(false);
      resetAddModal();
    } catch (error) {
      console.error("Error saving document:", error);
      Alert.alert("Error", t.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = (doc) => {
    Alert.alert(t.deleteConfirm, t.deleteMessage, [
      {
        text: t.cancel,
        style: "cancel",
      },
      {
        text: t.delete,
        style: "destructive",
        onPress: async () => {
          try {
            // Delete from cloud (mock)
            if (isOnline && doc.syncedToCloud) {
              console.log("Deleting from cloud...");
              await new Promise((resolve) => setTimeout(resolve, 800));
            }

            // Delete from local storage
            const updatedDocs = documents.filter((d) => d.id !== doc.id);
            setDocuments(updatedDocs);
            await saveToLocalStorage(updatedDocs);

            Alert.alert("Success", t.deleteSuccess);
          } catch (error) {
            console.error("Error deleting document:", error);
            Alert.alert("Error", t.deleteError);
          }
        },
      },
    ]);
  };

  const resetAddModal = () => {
    setSelectedFile(null);
    setNewDocName("");
    setNewDocCategory("personal");
  };

  const handleScanQR = () => {
    router.push("/qrScanner");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await supabase.auth.signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedDateRange("allTime");
    setSelectedStatus("all");
    setShowFilters(false);
  };

  const renderDocument = ({ item }) => (
    <TouchableOpacity style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>{item.title}</Text>
        <View style={styles.documentBadge}>
          <Text style={styles.badgeText}>{t[item.category]}</Text>
        </View>
      </View>

      <View style={styles.documentDetails}>
        <Text style={styles.documentSize}>{item.size}</Text>
        <Text style={styles.documentDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.documentActions}>
        {item.syncedToCloud && (
          <View style={styles.syncBadge}>
            <Text style={styles.syncText}>☁️ Synced</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => handleDeleteDocument(item)}
          >
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navHeader}>
          <Text style={styles.dashboardTitle}>{t.dashboard}</Text>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? "#4CAF50" : "#FF5722" },
              ]}
            />
            <Text style={styles.statusText}>
              {isOnline ? t.onlineMode : t.offlineMode}
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchIcon}>
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navButton} onPress={handleScanQR}>
            <View style={styles.navButtonContent}>
              <Text style={styles.navIcon}>📷</Text>
              <Text style={styles.navButtonText}>{t.scanQR}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <View style={styles.navButtonContent}>
              <Text style={styles.navIcon}>🔧</Text>
              <Text style={styles.navButtonText}>{t.filters}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleProfile}>
            <View style={styles.navButtonContent}>
              <Text style={styles.navIcon}>👤</Text>
              <Text style={styles.navButtonText}>{t.profile}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
            <View style={styles.navButtonContent}>
              <Text style={styles.navIcon}>🚪</Text>
              <Text style={styles.navButtonText}>{t.logout}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterTitle}>{t.filters}</Text>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["all", "personal", "work", "academic", "financial"].map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      selectedCategory === cat && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === cat &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {t[cat]}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>

          {/* Date Range Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{t.dateRange}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["allTime", "today", "thisWeek", "thisMonth"].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.filterChip,
                    selectedDateRange === range && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedDateRange(range)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDateRange === range &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {t[range]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>{t.clearFilters}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Documents List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.documentsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t.noDocuments}</Text>
            </View>
          }
        />
      )}

      {/* Add Document Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddDocument}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Document Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          resetAddModal();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addDocument}</Text>

            <View style={styles.modalBody}>
              {/* Selected File Name */}
              {selectedFile && (
                <View>
                  <Text style={styles.modalLabel}>{t.documentName}</Text>
                  <Text style={styles.uploadingText}>
                    📄 {selectedFile.name}
                  </Text>
                </View>
              )}

              {/* Rename Input */}
              <Text style={styles.modalLabel}>{t.rename}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t.enterDocumentName}
                placeholderTextColor="#999"
                value={newDocName}
                onChangeText={setNewDocName}
              />

              {/* Category Selection */}
              <Text style={styles.modalLabel}>{t.selectCategory}</Text>
              <View style={styles.categoryGrid}>
                {["personal", "work", "academic", "financial"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      newDocCategory === cat && styles.categoryOptionActive,
                    ]}
                    onPress={() => setNewDocCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newDocCategory === cat &&
                          styles.categoryOptionTextActive,
                      ]}
                    >
                      {t[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Upload Status */}
              {uploading && (
                <View style={{ marginTop: 20, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.uploadingText}>
                    {isOnline ? t.uploadingToCloud : t.savingLocally}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              {!uploading && (
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowAddModal(false);
                      resetAddModal();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveDocument}
                  >
                    <Text style={styles.saveButtonText}>{t.save}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}