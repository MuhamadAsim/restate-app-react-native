import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import styles from "./styles/loginStyle";
import { Ionicons } from "@expo/vector-icons";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // ✅ Handle deep links (password recovery)
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      console.log("🔗 Opened with URL:", url);

      try {
        // Extract hash parameters after "#"
        const hashParams = {};
        const hash = url.split("#")[1];
        if (hash) {
          hash.split("&").forEach((pair) => {
            const [key, value] = pair.split("=");
            hashParams[key] = decodeURIComponent(value);
          });
        }

        // If recovery link detected
        if (hashParams.access_token && hashParams.type === "recovery") {
          const { data, error } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token:
              hashParams.refresh_token || hashParams.access_token,
          });

          if (error) {
            console.error("❌ Session error:", error);
          } else {
            console.log("✅ Session set successfully:", data);
          }
        }
      } catch (err) {
        console.error("⚠️ Error handling deep link:", err);
      }
    };

    // Handle app opened directly from deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Listen for future deep links (when app already open)
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => subscription.remove();
  }, []);

  // ✅ Handle password update
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill both fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Password updated successfully!");
      router.replace("/login");
    }
  };

  return (
    <View style={[styles.container, { justifyContent: "center" }]}>
      <Text style={styles.welcome}>Change Password</Text>
      <Text style={styles.subtitle}>Enter and confirm your new password</Text>

      {/* New Password Field */}
      <View style={{ position: "relative", width: "100%" }}>
        <TextInput
          placeholder="New Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
          style={[styles.input, { paddingRight: 50 }]}
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword(!showNewPassword)}
          style={{
            position: "absolute",
            right: 15,
            top: "50%",
            transform: [{ translateY: -12 }],
          }}
        >
          <Ionicons
            name={showNewPassword ? "eye-off" : "eye"}
            size={24}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Field */}
      <View style={{ position: "relative", width: "100%" }}>
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={[styles.input, { paddingRight: 50 }]}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{
            position: "absolute",
            right: 15,
            top: "50%",
            transform: [{ translateY: -12 }],
          }}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      {/* Update Password Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleUpdatePassword}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
