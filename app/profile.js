import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/colors";
import { supabase } from "../lib/supabase";

const translations = {
  en: {
    profile: "Profile",
    accountSettings: "Account Settings",
    securitySettings: "Security Settings",
    languageSettings: "Language Settings",
    profilePicture: "Profile Picture",
    changePhoto: "Change Photo",
    username: "Username",
    email: "Email",
    updateUsername: "Update Username",
    language: "App Language",
    english: "English",
    nepali: "नेपाली (Nepali)",
    biometric: "Biometric Authentication",
    biometricDesc: "Use fingerprint or face recognition to unlock",
    passkey: "Passkey Login",
    passkeyDesc: "Enable passwordless authentication",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    logout: "Logout",
    back: "Back",
    success: "Success",
    error: "Error",
    usernameUpdated: "Username updated successfully!",
    languageChanged: "Language changed successfully!",
    biometricEnabled: "Biometric authentication enabled!",
    biometricDisabled: "Biometric authentication disabled!",
    passkeyEnabled: "Passkey login enabled!",
    passkeyDisabled: "Passkey login disabled!",
    photoUpdated: "Profile picture updated!",
    biometricNotAvailable: "Biometric authentication not available on this device",
    biometricNotEnrolled: "No biometric credentials enrolled. Please set up fingerprint or face recognition in device settings.",
    selectSource: "Select Photo Source",
    camera: "Take Photo",
    gallery: "Choose from Gallery",
    removePhoto: "Remove Photo",
  },
  np: {
    profile: "प्रोफाइल",
    accountSettings: "खाता सेटिङहरू",
    securitySettings: "सुरक्षा सेटिङहरू",
    languageSettings: "भाषा सेटिङहरू",
    profilePicture: "प्रोफाइल तस्बिर",
    changePhoto: "तस्बिर परिवर्तन गर्नुहोस्",
    username: "प्रयोगकर्ता नाम",
    email: "इमेल",
    updateUsername: "प्रयोगकर्ता नाम अपडेट गर्नुहोस्",
    language: "एप भाषा",
    english: "English (अङ्ग्रेजी)",
    nepali: "नेपाली",
    biometric: "बायोमेट्रिक प्रमाणीकरण",
    biometricDesc: "अनलक गर्न फिंगरप्रिन्ट वा अनुहार पहिचान प्रयोग गर्नुहोस्",
    passkey: "पासकी लगइन",
    passkeyDesc: "पासवर्ड रहित प्रमाणीकरण सक्षम गर्नुहोस्",
    saveChanges: "परिवर्तनहरू सुरक्षित गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    logout: "लग आउट",
    back: "पछाडि",
    success: "सफल",
    error: "त्रुटि",
    usernameUpdated: "प्रयोगकर्ता नाम सफलतापूर्वक अपडेट गरियो!",
    languageChanged: "भाषा सफलतापूर्वक परिवर्तन गरियो!",
    biometricEnabled: "बायोमेट्रिक प्रमाणीकरण सक्षम गरियो!",
    biometricDisabled: "बायोमेट्रिक प्रमाणीकरण असक्षम गरियो!",
    passkeyEnabled: "पासकी लगइन सक्षम गरियो!",
    passkeyDisabled: "पासकी लगइन असक्षम गरियो!",
    photoUpdated: "प्रोफाइल तस्बिर अपडेट गरियो!",
    biometricNotAvailable: "यो उपकरणमा बायोमेट्रिक प्रमाणीकरण उपलब्ध छैन",
    biometricNotEnrolled: "कुनै बायोमेट्रिक प्रमाणहरू दर्ता गरिएको छैन। कृपया उपकरण सेटिङहरूमा फिंगरप्रिन्ट वा अनुहार पहिचान सेटअप गर्नुहोस्।",
    selectSource: "तस्बिर स्रोत चयन गर्नुहोस्",
    camera: "तस्बिर लिनुहोस्",
    gallery: "ग्यालरीबाट छान्नुहोस्",
    removePhoto: "तस्बिर हटाउनुहोस्",
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  
  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  const t = translations[language];

  useEffect(() => {
    loadUserData();
    checkBiometricAvailability();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const savedLanguage = await AsyncStorage.getItem("appLanguage");
      const savedProfileImage = await AsyncStorage.getItem("profileImage");
      const savedBiometric = await AsyncStorage.getItem("biometricEnabled");
      const savedPasskey = await AsyncStorage.getItem("passkeyEnabled");

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setUsername(userData.user_metadata?.username || userData.email?.split("@")[0] || "User");
        setEmail(userData.email || "");
      }

      if (savedLanguage) setLanguage(savedLanguage);
      if (savedProfileImage) setProfileImage(savedProfileImage);
      if (savedBiometric) setBiometricEnabled(savedBiometric === "true");
      if (savedPasskey) setPasskeyEnabled(savedPasskey === "true");
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricAvailable(compatible && enrolled);
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("Face Recognition");
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("Fingerprint");
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("Iris");
      }
    } catch (error) {
      console.error("Error checking biometric:", error);
      setBiometricAvailable(false);
    }
  };

  const handleImagePick = async (source) => {
    try {
      let result;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(t.error, "Camera permission is required!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(t.error, "Gallery permission is required!");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await AsyncStorage.setItem("profileImage", imageUri);
        Alert.alert(t.success, t.photoUpdated);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t.error, "Failed to pick image");
    } finally {
      setShowPhotoOptions(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setProfileImage(null);
      await AsyncStorage.removeItem("profileImage");
      Alert.alert(t.success, t.photoUpdated);
    } catch (error) {
      console.error("Error removing photo:", error);
    } finally {
      setShowPhotoOptions(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert(t.error, "Username cannot be empty");
      return;
    }

    setLoading(true);
    try {
      // Update in Supabase
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername.trim() }
      });

      if (error) throw error;

      // Update local state
      setUsername(newUsername.trim());
      const updatedUser = { ...user, user_metadata: { ...user.user_metadata, username: newUsername.trim() } };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      Alert.alert(t.success, t.usernameUpdated);
      setShowUsernameModal(false);
      setNewUsername("");
    } catch (error) {
      console.error("Error updating username:", error);
      Alert.alert(t.error, "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    try {
      await AsyncStorage.setItem("appLanguage", newLanguage);
      setLanguage(newLanguage);
      Alert.alert(t.success, translations[newLanguage].languageChanged);
      setShowLanguageModal(false);
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert(t.error, "Failed to change language");
    }
  };

  const handleBiometricToggle = async (value) => {
    if (value && !biometricAvailable) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible) {
        Alert.alert(t.error, t.biometricNotAvailable);
        return;
      }
      
      if (!enrolled) {
        Alert.alert(t.error, t.biometricNotEnrolled);
        return;
      }
    }

    if (value) {
      // Authenticate before enabling
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to enable biometric login",
          fallbackLabel: "Use passcode",
        });

        if (result.success) {
          setBiometricEnabled(true);
          await AsyncStorage.setItem("biometricEnabled", "true");
          Alert.alert(t.success, t.biometricEnabled);
        }
      } catch (error) {
        console.error("Biometric authentication error:", error);
        Alert.alert(t.error, "Biometric authentication failed");
      }
    } else {
      setBiometricEnabled(false);
      await AsyncStorage.setItem("biometricEnabled", "false");
      Alert.alert(t.success, t.biometricDisabled);
    }
  };

  const handlePasskeyToggle = async (value) => {
    // Simulate passkey setup (in production, use actual passkey API)
    if (value) {
      Alert.alert(
        "Enable Passkey",
        "This will enable passwordless login using passkeys. Continue?",
        [
          { text: t.cancel, style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              setPasskeyEnabled(true);
              await AsyncStorage.setItem("passkeyEnabled", "true");
              Alert.alert(t.success, t.passkeyEnabled);
            },
          },
        ]
      );
    } else {
      setPasskeyEnabled(false);
      await AsyncStorage.setItem("passkeyEnabled", "false");
      Alert.alert(t.success, t.passkeyDisabled);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: t.cancel, style: "cancel" },
      {
        text: t.logout,
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user");
            await supabase.auth.signOut();
            router.replace("/");
          } catch (error) {
            console.error("Error logging out:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.profile}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => setShowPhotoOptions(true)}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profilePlaceholderText}>
                    {username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{username}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.accountSettings}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setNewUsername(username);
              setShowUsernameModal(true);
            }}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>👤</Text>
              <View>
                <Text style={styles.settingLabel}>{t.username}</Text>
                <Text style={styles.settingValue}>{username}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📧</Text>
              <View>
                <Text style={styles.settingLabel}>{t.email}</Text>
                <Text style={styles.settingValue}>{email}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.languageSettings}</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌐</Text>
              <View>
                <Text style={styles.settingLabel}>{t.language}</Text>
                <Text style={styles.settingValue}>
                  {language === "en" ? "English" : "नेपाली"}
                </Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.securitySettings}</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔐</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.biometric}</Text>
                <Text style={styles.settingDescription}>{t.biometricDesc}</Text>
                {biometricType && (
                  <Text style={styles.biometricType}>({biometricType})</Text>
                )}
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#d1d1d1", true: colors.primary + "60" }}
              thumbColor={biometricEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔑</Text>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t.passkey}</Text>
                <Text style={styles.settingDescription}>{t.passkeyDesc}</Text>
              </View>
            </View>
            <Switch
              value={passkeyEnabled}
              onValueChange={handlePasskeyToggle}
              trackColor={{ false: "#d1d1d1", true: colors.primary + "60" }}
              thumbColor={passkeyEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.selectSource}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImagePick("camera")}
            >
              <Text style={styles.modalButtonText}>📷 {t.camera}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImagePick("gallery")}
            >
              <Text style={styles.modalButtonText}>🖼️ {t.gallery}</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleRemovePhoto}
              >
                <Text style={styles.modalButtonTextDanger}>🗑️ {t.removePhoto}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowPhotoOptions(false)}
            >
              <Text style={styles.modalButtonTextCancel}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Username Modal */}
      <Modal
        visible={showUsernameModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUsernameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.updateUsername}</Text>

            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder={t.username}
              placeholderTextColor={colors.primary + "60"}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionButtonCancel]}
                onPress={() => setShowUsernameModal(false)}
              >
                <Text style={styles.modalActionTextCancel}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.modalActionButtonSave]}
                onPress={handleUpdateUsername}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalActionTextSave}>{t.saveChanges}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.language}</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "en" && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange("en")}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "en" && styles.languageOptionTextActive,
                ]}
              >
                {translations.en.english}
              </Text>
              {language === "en" && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "np" && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange("np")}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === "np" && styles.languageOptionTextActive,
                ]}
              >
                {translations.np.nepali}
              </Text>
              {language === "np" && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalButtonTextCancel}>{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.primary,
  },
  profilePlaceholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  cameraIcon: {
    fontSize: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: "#666",
  },
  settingDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  biometricType: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    fontStyle: "italic",
  },
  settingArrow: {
    fontSize: 24,
    color: colors.primary,
    marginLeft: 10,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonDanger: {
    backgroundColor: "#FF3B30",
  },
  modalButtonTextDanger: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonCancel: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonTextCancel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalActionButtonCancel: {
    backgroundColor: "#f0f0f0",
  },
  modalActionButtonSave: {
    backgroundColor: colors.primary,
  },
  modalActionTextCancel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalActionTextSave: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageOptionActive: {
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
  },
  languageOptionText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  languageOptionTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "bold",
  },
});