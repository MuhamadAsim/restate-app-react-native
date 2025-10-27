import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import Icon from "react-native-vector-icons/Feather";

const QRScannerModal = ({ visible, onClose, onQRScanned }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Request camera permission
  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
    
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required to scan QR codes");
      onClose();
    }
  };

  // Handle modal open
  const handleModalOpen = () => {
    if (visible) {
      requestPermission();
      setScanned(false);
      setScanning(false);
    }
  };

  // Handle QR code scan
  const handleBarCodeScanned = ({ data }) => {
    if (scanned || scanning) return;
    
    setScanned(true);
    setScanning(true);

    // Validate if it's a URL
    if (data && (data.startsWith("http://") || data.startsWith("https://"))) {
      onQRScanned(data);
      onClose();
    } else {
      Alert.alert(
        "Invalid QR Code",
        "This QR code doesn't contain a valid document link.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setScanned(false);
              setScanning(false);
            },
          },
          {
            text: "Cancel",
            onPress: onClose,
            style: "cancel",
          },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={handleModalOpen}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        {hasPermission === null ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Requesting camera permission...</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.centerContent}>
            <Icon name="camera-off" size={64} color="#ccc" />
            <Text style={styles.errorText}>No camera access</Text>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            >
              {/* Scanning Overlay */}
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                
                <Text style={styles.instructionText}>
                  Position QR code within the frame
                </Text>
                
                {scanned && (
                  <View style={styles.scannedBadge}>
                    <Icon name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.scannedText}>Scanned!</Text>
                  </View>
                )}
              </View>
            </CameraView>

            {/* Manual Reset */}
            {scanned && !scanning && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => {
                  setScanned(false);
                  setScanning(false);
                }}
              >
                <Text style={styles.scanAgainText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#667eea",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#ccc",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#667eea",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    marginTop: 30,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  scannedBadge: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  scannedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#667eea",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QRScannerModal;