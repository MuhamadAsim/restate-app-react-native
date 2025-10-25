import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { styles } from './styles/profileStyle';
import { translations } from "./translations/profileTranslation";

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




export default function ProfileScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // NEW: Track photo upload
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
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
      const savedProfileImageUrl = await AsyncStorage.getItem("profileImageUrl");
      const savedBiometric = await AsyncStorage.getItem("biometricEnabled");

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        const displayName =
          userData.name ||
          userData.user_metadata?.username ||
          userData.email?.split("@")[0] ||
          "User";

        setUsername(displayName);
        setEmail(userData.email || "");

        // Handle Profile Image
        const imageUrl = userData.picture;

        if (imageUrl && imageUrl !== savedProfileImageUrl) {
          const fileUri = `${FileSystem.documentDirectory}profile.jpg`;
          const downloadResumable = FileSystem.createDownloadResumable(
            imageUrl,
            fileUri
          );
          await downloadResumable.downloadAsync();

          await AsyncStorage.setItem("profileImage", fileUri);
          await AsyncStorage.setItem("profileImageUrl", imageUrl);

          setProfileImage(fileUri);
        } else if (savedProfileImage) {
          setProfileImage(savedProfileImage);
        }
      }

      if (savedLanguage) setLanguage(savedLanguage);
      if (savedBiometric) setBiometricEnabled(savedBiometric === "true");

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
    setShowPhotoOptions(false); // Close modal immediately
    setUploadingPhoto(true); // Show loading state
    
    try {
      let result;

      // 1️⃣ Pick new image
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Error", "Camera permission is required!");
          setUploadingPhoto(false);
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
          Alert.alert("Error", "Gallery permission is required!");
          setUploadingPhoto(false);
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
        const newImageUri = result.assets[0].uri;

        const user = await AsyncStorage.getItem("user");
        const userData = JSON.parse(user);
        const userId = userData.id || userData.user?.id;

        if (!userId) {
          console.warn("No userId found — skipping remote upload");
          setUploadingPhoto(false);
          return;
        }

        // 2️⃣ Remove old image locally
        const oldLocalUri = await AsyncStorage.getItem("profileImage");
        if (oldLocalUri) {
          await FileSystem.deleteAsync(oldLocalUri).catch(() => { });
        }

        // 3️⃣ Remove old image from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.storage.from("profile-pics").remove([`user_${userId}.jpg`]).catch(() => { });
        }

        // 4️⃣ Copy new image locally
        const fileName = `profile_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: newImageUri, to: fileUri });
        await AsyncStorage.setItem("profileImage", fileUri);
        setProfileImage(fileUri);

        // 5️⃣ Upload new image to Supabase
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const fileData = decode(base64);

        if (session) {
          const { error: uploadError } = await supabase.storage
            .from("profile-pics")
            .upload(`user_${userId}.jpg`, fileData, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            console.error("Upload failed:", uploadError.message);
            Alert.alert("Error", "Failed to upload image.");
            setUploadingPhoto(false);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from("profile-pics")
            .getPublicUrl(`user_${userId}.jpg`);

          const imageUrl = publicUrlData?.publicUrl;
          if (imageUrl) {
            await AsyncStorage.setItem("profileImageUrl", imageUrl);
            await supabase.from("profiles").update({ picture: imageUrl }).eq("id", userId);
            Alert.alert("Success", "Profile photo updated!");
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    } finally {
      setUploadingPhoto(false);
    }
  };


 const handleRemovePhoto = async () => {
  setShowPhotoOptions(false); // Close modal immediately
  setUploadingPhoto(true); // Show loading state
  
  try {
    // 1️⃣ Get the local file URI before removing from AsyncStorage
    const localImageUri = await AsyncStorage.getItem("profileImage");
    
    // 2️⃣ Delete local file from device storage
    if (localImageUri) {
      try {
        await FileSystem.deleteAsync(localImageUri);
        console.log("Local file deleted successfully");
      } catch (fileError) {
        console.error("Error deleting local file:", fileError);
      }
    }
    
    // 3️⃣ Remove from AsyncStorage
    await AsyncStorage.removeItem("profileImage");
    await AsyncStorage.removeItem("profileImageUrl");
    
    // 4️⃣ Update UI state
    setProfileImage(null);

    // 5️⃣ Get user data for backend deletion
    const user = await AsyncStorage.getItem("user");
    const userData = JSON.parse(user);
    const userId = userData.id || userData.user?.id;

    // 6️⃣ Delete from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert("Not logged in", "Please log in to remove your profile photo.");
      setUploadingPhoto(false);
      return;
    }

    if (userId) {
      // Delete from storage bucket
      const { error: deleteError } = await supabase
        .storage
        .from("profile-pics")
        .remove([`user_${userId}.jpg`]);
      
      if (deleteError) {
        console.error("Error deleting from storage:", deleteError.message);
      }

      // Update profile table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ picture: null })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Error updating profile:", updateError.message);
      }
    }

    Alert.alert(t.success, t.photoUpdated);
  } catch (error) {
    console.error("Error removing photo:", error);
    Alert.alert(t.error, "Failed to remove photo");
  } finally {
    setUploadingPhoto(false);
  }
};
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert(t.error, "Username cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert("Not logged in", "Please log in to update your username.");
        return;
      }

      const userId = session.user.id;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ name: newUsername.trim() })
        .eq("id", userId);

      if (updateError) throw updateError;

      const updatedUser = {
        ...user,
        name: newUsername.trim(),
      };

      setUser(updatedUser);
      setUsername(newUsername.trim());
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

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
          <TouchableOpacity 
            onPress={() => !uploadingPhoto && setShowPhotoOptions(true)}
            disabled={uploadingPhoto}
          >
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
                {uploadingPhoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.cameraIcon}>📷</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{username}</Text>
          <Text style={styles.profileEmail} numberOfLines={1} ellipsizeMode="tail">
            {email}
          </Text>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{t.email}</Text>
                <Text style={styles.settingValue} numberOfLines={1} ellipsizeMode="tail">
                  {email}
                </Text>
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
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Loading Overlay for Photo Upload */}
      {uploadingPhoto && (
        <View style={StyleSheet.absoluteFill}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: '#fff',
              padding: 30,
              borderRadius: 15,
              alignItems: 'center',
            }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{
                marginTop: 15,
                fontSize: 16,
                color: colors.primary,
                fontWeight: '600',
              }}>
                Updating photo...
              </Text>
            </View>
          </View>
        </View>
      )}

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
              style={[styles.modalButton, styles.modalButtonCompact]}
              onPress={() => handleImagePick("camera")}
            >
              <Text style={styles.modalButtonText}>📷 {t.camera}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCompact]}
              onPress={() => handleImagePick("gallery")}
            >
              <Text style={styles.modalButtonText}>🖼️ {t.gallery}</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger, styles.modalButtonCompact]}
                onPress={handleRemovePhoto}
              >
                <Text style={styles.modalButtonTextDanger}>🗑️ {t.removePhoto}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel, styles.modalButtonCompact]}
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