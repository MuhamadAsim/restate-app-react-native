import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import colors from "../constants/colors";
import styles from "./styles/qrScannerStyle";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

const translations = {
  en: {
    qrScanner: "QR Scanner",
    scanQRCode: "Scan QR Code",
    pointCamera: "Point your camera at a QR code",
    scanning: "Scanning...",
    processing: "Processing...",
    accessDocument: "Access Document",
    documentFound: "Document Found",
    viewDocument: "View Document",
    cancel: "Cancel",
    close: "Close",
    permissionRequired: "Camera Permission Required",
    permissionMessage: "We need camera access to scan QR codes",
    grantPermission: "Grant Permission",
    permissionDenied: "Permission Denied",
    openSettings: "Open Settings",
    invalidQR: "Invalid QR Code",
    invalidQRMessage: "This QR code is not a valid document link",
    errorScanning: "Error Scanning",
    documentDetails: "Document Details",
    documentName: "Document Name",
    sharedBy: "Shared By",
    size: "Size",
    date: "Date",
    download: "Download",
    scanAgain: "Scan Again",
    success: "Success!",
    documentAdded: "Document added to your shared documents",
    tapToFocus: "Tap anywhere to focus",
  },
  np: {
    qrScanner: "QR स्क्यानर",
    scanQRCode: "QR कोड स्क्यान गर्नुहोस्",
    pointCamera: "QR कोडमा आफ्नो क्यामेरा पोइन्ट गर्नुहोस्",
    scanning: "स्क्यान गर्दै...",
    processing: "प्रशोधन गर्दै...",
    accessDocument: "कागजात पहुँच गर्नुहोस्",
    documentFound: "कागजात फेला पर्यो",
    viewDocument: "कागजात हेर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    close: "बन्द गर्नुहोस्",
    permissionRequired: "क्यामेरा अनुमति आवश्यक छ",
    permissionMessage: "QR कोडहरू स्क्यान गर्न हामीलाई क्यामेरा पहुँच चाहिन्छ",
    grantPermission: "अनुमति दिनुहोस्",
    permissionDenied: "अनुमति अस्वीकृत",
    openSettings: "सेटिङहरू खोल्नुहोस्",
    invalidQR: "अवैध QR कोड",
    invalidQRMessage: "यो QR कोड वैध कागजात लिङ्क होइन",
    errorScanning: "स्क्यान गर्दा त्रुटि",
    documentDetails: "कागजात विवरणहरू",
    documentName: "कागजात नाम",
    sharedBy: "द्वारा साझा गरिएको",
    size: "आकार",
    date: "मिति",
    download: "डाउनलोड",
    scanAgain: "फेरि स्क्यान गर्नुहोस्",
    success: "सफल!",
    documentAdded: "तपाईंको साझा कागजातहरूमा कागजात थपियो",
    tapToFocus: "फोकस गर्न कहीं पनि ट्याप गर्नुहोस्",
  },
};

export default function QRScannerScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [scanLineAnim] = useState(new Animated.Value(0));
  const [focusAnim] = useState(new Animated.Value(1));

  const t = translations[language];

  useEffect(() => {
    loadLanguage();
    startScanLineAnimation();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("appLanguage");
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const startScanLineAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateFocus = () => {
    Animated.sequence([
      Animated.timing(focusAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || scanning) return;

    setScanned(true);
    setScanning(true);
    animateFocus();

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Parse QR code data
      const parsedData = parseQRData(data);

      if (!parsedData) {
        Alert.alert(t.invalidQR, t.invalidQRMessage);
        resetScanner();
        return;
      }

      // Fetch document details (simulated)
      const document = await fetchDocumentDetails(parsedData.documentId);

      if (document) {
        setDocumentData(document);
        setShowDocumentModal(true);
      } else {
        Alert.alert(t.errorScanning, "Document not found");
        resetScanner();
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      Alert.alert(t.errorScanning, error.message);
      resetScanner();
    } finally {
      setScanning(false);
    }
  };

  const parseQRData = (data) => {
    try {
      // Check if it's a URL format
      if (data.includes("yourapp.com/document/")) {
        const documentId = data.split("/document/")[1];
        return { documentId };
      }

      // Check if it's JSON format
      const parsed = JSON.parse(data);
      if (parsed.documentId) {
        return parsed;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchDocumentDetails = async (documentId) => {
    // Simulate API call to fetch document details
    // In production, replace with actual Supabase query
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock document data
    return {
      id: documentId,
      title: "Shared Project Document",
      sharedBy: "john.doe@example.com",
      size: "3.2 MB",
      date: new Date().toLocaleDateString(),
      category: "work",
      description: "Project planning document for Q4 2025",
    };
  };

  const handleAccessDocument = async () => {
    try {
      // Add document to user's shared documents
      // In production, save to Supabase
      await AsyncStorage.setItem(
        `shared_document_${documentData.id}`,
        JSON.stringify(documentData)
      );

      Alert.alert(t.success, t.documentAdded, [
        {
          text: "OK",
          onPress: () => {
            setShowDocumentModal(false);
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error accessing document:", error);
      Alert.alert(t.errorScanning, "Failed to access document");
    }
  };

  const resetScanner = () => {
    setTimeout(() => {
      setScanned(false);
      setScanning(false);
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowDocumentModal(false);
    resetScanner();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.qrScanner}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.qrScanner}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>{t.permissionRequired}</Text>
          <Text style={styles.permissionMessage}>{t.permissionMessage}</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{t.grantPermission}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.qrScanner}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top overlay */}
            <View style={styles.overlayTop}>
              <Text style={styles.instructionText}>{t.pointCamera}</Text>
            </View>

            {/* Middle section with scan area */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              
              {/* Scan area */}
              <Animated.View
                style={[
                  styles.scanArea,
                  { transform: [{ scale: focusAnim }] },
                ]}
              >
                {/* Corner borders */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />

                {/* Animated scan line */}
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineTranslateY }] },
                  ]}
                />

                {scanning && (
                  <View style={styles.scanningIndicator}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.scanningText}>{t.processing}</Text>
                  </View>
                )}
              </Animated.View>

              <View style={styles.overlaySide} />
            </View>

            {/* Bottom overlay */}
            <View style={styles.overlayBottom}>
              <Text style={styles.hintText}>{t.tapToFocus}</Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Document Details Modal */}
      <Modal
        visible={showDocumentModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.documentFound}</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {documentData && (
              <View style={styles.documentInfo}>
                <View style={styles.documentIcon}>
                  <Text style={styles.documentIconText}>📄</Text>
                </View>

                <View style={styles.documentDetail}>
                  <Text style={styles.detailLabel}>{t.documentName}</Text>
                  <Text style={styles.detailValue}>{documentData.title}</Text>
                </View>

                <View style={styles.documentDetail}>
                  <Text style={styles.detailLabel}>{t.sharedBy}</Text>
                  <Text style={styles.detailValue}>{documentData.sharedBy}</Text>
                </View>

                <View style={styles.documentDetailRow}>
                  <View style={styles.documentDetailHalf}>
                    <Text style={styles.detailLabel}>{t.size}</Text>
                    <Text style={styles.detailValue}>{documentData.size}</Text>
                  </View>
                  <View style={styles.documentDetailHalf}>
                    <Text style={styles.detailLabel}>{t.date}</Text>
                    <Text style={styles.detailValue}>{documentData.date}</Text>
                  </View>
                </View>

                {documentData.description && (
                  <View style={styles.documentDetail}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailDescription}>
                      {documentData.description}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAccessDocument}
              >
                <Text style={styles.modalButtonText}>{t.accessDocument}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonTextSecondary}>{t.scanAgain}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
