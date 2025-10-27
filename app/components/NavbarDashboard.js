import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AddDocument from "../components/AddDocument";
import styles from "../styles/dashboardStyle";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("User");
  const [profileImage, setProfileImage] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // QR Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // AddDocument modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [scannedFileData, setScannedFileData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("savedUserData");
        const savedProfileImage = await AsyncStorage.getItem("profileImage");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          const displayName =
            userData.name ||
            userData.user_metadata?.username ||
            userData.email?.split("@")[0] ||
            "User";
          
          setUsername(displayName);
        }

        if (savedProfileImage) {
          setProfileImage(savedProfileImage);
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
      }
    };

    const date = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" };
    setCurrentDate(date.toLocaleDateString("en-US", options));

    fetchUserData();
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // Request camera permission and open scanner
  const handleOpenScanner = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
    
    if (status === "granted") {
      setShowScanner(true);
      setScanned(false);
    } else {
      Alert.alert("Permission Denied", "Camera access is required to scan QR codes.");
    }
  };

  // Download file from Cloud URL (Supabase storage)
  const downloadFileFromCloudUrl = async (cloudUrl) => {
    try {
      console.log("☁️ [CLOUD DOWNLOAD] Starting download from:", cloudUrl);
      setDownloading(true);

      // Extract filename from Supabase URL
      // Example URL: https://abc.supabase.co/storage/v1/object/public/docs/user_id/1234567890.pdf
      const urlParts = cloudUrl.split('/');
      const fileName = urlParts[urlParts.length - 1]; // Get "1234567890.pdf"
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      // Create local filename
      const timestamp = Date.now();
      const localFileName = `Scanned_${timestamp}.${fileExtension}`;
      const localUri = `${FileSystem.documentDirectory}${localFileName}`;

      console.log("📥 [DOWNLOADING]", { fileName, localFileName, localUri });

      // Download file from cloud to local storage
      const downloadResult = await FileSystem.downloadAsync(cloudUrl, localUri);

      console.log("✅ [DOWNLOAD SUCCESS]", downloadResult.uri);

      // Get file info to verify download
      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      
      if (!fileInfo.exists) {
        throw new Error("Downloaded file not found");
      }

      console.log("📊 [FILE INFO]", {
        size: fileInfo.size,
        exists: fileInfo.exists,
        uri: fileInfo.uri
      });

      // Determine MIME type based on extension
      const mimeTypes = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        txt: "text/plain",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
      };

      const mimeType = mimeTypes[fileExtension] || "application/octet-stream";

      return {
        uri: downloadResult.uri,
        name: localFileName,
        size: fileInfo.size,
        mimeType: mimeType,
        originalUrl: cloudUrl,
      };

    } catch (error) {
      console.error("❌ [DOWNLOAD ERROR]", error);
      throw error;
    } finally {
      setDownloading(false);
    }
  };

  // Handle QR code scan
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    
    console.log("📷 [QR SCANNED]", { type, data });

    // Validate if it's a URL
    if (!data || !(data.startsWith("http://") || data.startsWith("https://"))) {
      setShowScanner(false);
      Alert.alert(
        "Invalid QR Code",
        "The scanned QR code does not contain a valid URL."
      );
      return;
    }

    try {
      // Download the file from cloud URL
      const downloadedFile = await downloadFileFromCloudUrl(data);

      console.log("✅ [FILE READY FOR MODAL]", downloadedFile);

      // Close scanner
      setShowScanner(false);

      // Store downloaded file data
      setScannedFileData({
        uri: downloadedFile.uri,
        name: downloadedFile.name,
        size: downloadedFile.size,
        mimeType: downloadedFile.mimeType,
        originalUrl: downloadedFile.originalUrl,
      });

      // Open AddDocument modal
      setShowAddModal(true);

    } catch (error) {
      console.error("❌ [QR SCAN FLOW ERROR]", error);
      setShowScanner(false);
      
      Alert.alert(
        "Download Failed",
        `Unable to download the document from the scanned QR code.\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`
      );
    }
  };

  return (
    <>
      <View style={styles.navbar}>
        <View style={styles.navbarLeft}>
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={localStyles.profilePicImage} 
            />
          ) : (
            <View style={styles.profilePic}>
              <Icon name="user" size={24} color="white" />
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Hello, {username}!
            </Text>
            <Text style={styles.profileDate}>{currentDate}</Text>
          </View>
        </View>

        <View style={styles.navbarRight}>
          {/* QR Scanner Button */}
          <TouchableOpacity style={styles.iconBtn} onPress={handleOpenScanner}>
            <Icon name="camera" size={24} color="#333" />
          </TouchableOpacity>

          <View>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleDropdown}>
              <Icon name="bell" size={24} color="#333" />
            </TouchableOpacity>

            {showDropdown && (
              <View style={localStyles.dropdown}>
                <Text style={localStyles.dropdownText}>No updates available</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* QR Code Scanner Modal */}
      <Modal visible={showScanner} animationType="slide">
        <View style={localStyles.scannerContainer}>
          <CameraView
            style={localStyles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            <View style={localStyles.overlay}>
              {/* Scan Frame */}
              <View style={localStyles.scanFrame}>
                <View style={[localStyles.corner, localStyles.topLeft]} />
                <View style={[localStyles.corner, localStyles.topRight]} />
                <View style={[localStyles.corner, localStyles.bottomLeft]} />
                <View style={[localStyles.corner, localStyles.bottomRight]} />
              </View>

              <Text style={localStyles.scanText}>
                {downloading ? "⏳ Downloading from Cloud..." : "📷 Scan QR Code"}
              </Text>
              <Text style={localStyles.scanSubtext}>
                {downloading 
                  ? "Please wait while we fetch your document" 
                  : "Position the QR code within the frame"}
              </Text>
              
              {downloading && (
                <View style={localStyles.downloadingContainer}>
                  <ActivityIndicator 
                    size="large" 
                    color="#667eea" 
                  />
                  <Text style={localStyles.downloadingText}>
                    Downloading from cloud storage...
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  localStyles.closeButton,
                  downloading && localStyles.closeButtonDisabled
                ]}
                onPress={() => setShowScanner(false)}
                disabled={downloading}
              >
                <Text style={localStyles.closeButtonText}>
                  {downloading ? "Please Wait..." : "✕ Close"}
                </Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* AddDocument Modal with downloaded file data */}
      <AddDocument
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setScannedFileData(null);
        }}
        prefilledFile={scannedFileData}
        onDocumentAdded={() => {
          console.log("✅ Document saved from QR scan");
          setScannedFileData(null);
        }}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  profilePicImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dropdown: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    zIndex: 10,
    minWidth: 150,
  },
  dropdownText: {
    color: "#333",
    fontSize: 14,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 280,
    height: 280,
    marginBottom: 40,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#667eea",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  scanSubtext: {
    color: "#e0e0e0",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  downloadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  downloadingText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 50,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  closeButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.2,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Navbar;