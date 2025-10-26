import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import * as LocalAuthentication from "expo-local-authentication";

import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import colors from "../constants/colors";
import { supabase } from "../lib/supabase";
import styles from "./styles/loginStyle";

const translations = {
  en: {
    welcome: "Welcome!",
    subtitle: "Sign in to continue",
    email: "Email",
    password: "Password",
    login: "LOGIN",
    forgotPassword: "Forgot Password?",
    or: "or",
    socialLogin: "Social Media Login",
    noAccount: "Don't have an account? ",
    signUp: "Sign up",
    success: "✅ Logged in successfully!",
    biometricLogin: "Login with Biometric",
    biometricPrompt: "Authenticate to login",
  },
  np: {
    welcome: "स्वागत छ!",
    subtitle: "जारी राख्न साइन इन गर्नुहोस्",
    email: "इमेल",
    password: "पासवर्ड",
    login: "लग इन",
    forgotPassword: "पासवर्ड बिर्सनुभयो?",
    or: "वा",
    socialLogin: "सोशल मिडिया लगइन",
    noAccount: "खाता छैन? ",
    signUp: "साइन अप गर्नुहोस्",
    success: "✅ सफलतापूर्वक लगइन भयो!",
    biometricLogin: "बायोमेट्रिक लगइन",
    biometricPrompt: "प्रमाणीकरण गर्नुहोस्",
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved) setLanguage(saved);
    };
    loadLanguage();
  }, []);

  // Check if biometric is available and enabled, then auto-trigger
  useEffect(() => {
    const checkAndTriggerBiometric = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        const savedBiometric = await AsyncStorage.getItem("biometricEnabled");
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        
        // Auto-trigger biometric if:
        // 1. Device supports biometric
        // 2. User has enrolled biometric
        // 3. User has enabled it in settings
        // 4. There are saved credentials
        const shouldTrigger = compatible && enrolled && savedBiometric === "true" && savedEmail !== null;
        
        setBiometricAvailable(compatible && enrolled);
        setBiometricEnabled(savedBiometric === "true" && savedEmail !== null);

        // Auto-trigger biometric authentication on page load
        if (shouldTrigger) {
          // Small delay to ensure UI is ready
          setTimeout(() => {
            handleBiometricLogin();
          }, 500);
        }
      } catch (error) {
        console.error("Error checking biometric:", error);
        setBiometricAvailable(false);
      }
    };
    checkAndTriggerBiometric();
  }, []);

  const t = translations[language];

  // Biometric Login Handler
  const handleBiometricLogin = async () => {
    try {
      // 1️⃣ Authenticate with biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t.biometricPrompt,
        fallbackLabel: "Use password",
        disableDeviceFallback: false,
      });

      if (!result.success) {
        // User cancelled or failed - stay on login screen
        return;
      }

      // 2️⃣ Get saved credentials
      const savedEmail = await AsyncStorage.getItem("savedEmail");
      const savedPassword = await AsyncStorage.getItem("savedPassword");

      if (!savedEmail || !savedPassword) {
        Alert.alert("Error", "No saved credentials found. Please login with email and password first.");
        return;
      }

      setLoading(true);

      // 3️⃣ Check internet connection
      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected;

      if (!isConnected) {
        // 📴 Offline - verify credentials match locally
        Alert.alert("Offline Mode", "Logged in offline successfully!");
        router.replace("/DashboardScreen");
        return;
      }

      // 🌍 Online - authenticate with Supabase using saved credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: savedEmail,
        password: savedPassword,
      });

      if (error) {
        Alert.alert("Login Failed", "Unable to login. Your saved credentials may be outdated. Please login manually.");
        console.error("Biometric login error:", error);
        return;
      }

      const user = data.user;

      // 4️⃣ Fetch profile (optional - for updated data)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, picture")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      // 5️⃣ Update saved user data if needed
      const fullUser = {
        id: user.id,
        email: user.email,
        name: profile?.name || "",
        picture: profile?.picture || null,
      };

      await AsyncStorage.setItem("savedUserData", JSON.stringify(fullUser));

      Alert.alert("Success", t.success);
      router.replace("/DashboardScreen");

    } catch (err) {
      console.error("Biometric login error:", err);
      Alert.alert("Error", "Biometric login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Manual Login Handler
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // 🌐 1️⃣ Check Internet connection
      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected;

      // 📴 2️⃣ If offline → try local credential match
      if (!isConnected) {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPassword = await AsyncStorage.getItem("savedPassword");

        if (savedEmail && savedPassword) {
          if (email.trim() === savedEmail && password === savedPassword) {
            Alert.alert("Offline Mode", "Logged in offline successfully!");
            router.replace("/DashboardScreen");
            return;
          } else {
            Alert.alert("Offline Login Failed", "Email or password does not match saved credentials.");
            return;
          }
        } else {
          Alert.alert("No Offline Access", "Please connect to the internet for first login.");
          return;
        }
      }

      // 🌍 3️⃣ Online login → verify with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert("Login Failed", "Incorrect email or password.");
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert("Email Not Verified", "Please verify your email first.");
        } else {
          Alert.alert("Error", error.message);
        }
        return;
      }

      const user = data.user;

      // 4️⃣ Fetch user's profile info from Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, picture")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      // 5️⃣ Save user data for offline/biometric use
      const fullUser = {
        id: user.id,
        email: user.email,
        name: profile?.name || "",
        picture: profile?.picture || null,
      };

      await AsyncStorage.setItem("savedUserData", JSON.stringify(fullUser));

      // 🧠 6️⃣ Save email/password for biometric & offline login
      await AsyncStorage.setItem("savedEmail", email.trim());
      await AsyncStorage.setItem("savedPassword", password);

      // ✅ 7️⃣ Success
      Alert.alert("Success", t.success);
      router.replace("/DashboardScreen");

    } catch (err) {
      console.error("⚠️ Unexpected Error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/signup")}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>{t.welcome}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      {/* Email Input */}
      <TextInput
        placeholder={t.email}
        placeholderTextColor={colors.primary}
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          { borderColor: focusedInput === "email" ? colors.primary : colors.primary },
        ]}
        onFocus={() => setFocusedInput("email")}
        onBlur={() => setFocusedInput(null)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input with Eye Toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={t.password}
          placeholderTextColor={colors.primary}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[
            styles.passwordInput,
            { borderColor: focusedInput === "password" ? colors.primary : colors.primary },
          ]}
          onFocus={() => setFocusedInput("password")}
          onBlur={() => setFocusedInput(null)}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <View style={styles.eyeIconContainer}>
            {showPassword ? (
              // Eye open
              <View style={styles.eyeOpen}>
                <View style={styles.eyeOutline}>
                  <View style={styles.eyePupil} />
                </View>
              </View>
            ) : (
              // Eye closed with slash
              <View style={styles.eyeClosed}>
                <View style={styles.eyeOutline}>
                  <View style={styles.eyePupil} />
                </View>
                <View style={styles.eyeSlash} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>{t.login}</Text>
        )}
      </TouchableOpacity>

      {/* Biometric Login Option - Below Login Button */}
      {biometricAvailable && biometricEnabled && (
        <TouchableOpacity
          style={styles.biometricOption}
          onPress={handleBiometricLogin}
          disabled={loading}
        >
          <Image 
            source={require("../assets/bio.png")} 
            style={styles.biometricIcon}
          />
          <Text style={styles.biometricOptionText}>{t.biometricLogin}</Text>
        </TouchableOpacity>
      )}

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => router.push("/ForgotPasswordScreen")}>
        <Text style={styles.forgotText}>{t.forgotPassword}</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.or}>{t.or}</Text>
        <View style={styles.line} />
      </View>

      {/* Social Login */}
      <Text style={styles.socialTitle}>{t.socialLogin}</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <Image
            source={require("../assets/facebook.jpeg")}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Signup Redirect */}
      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.signupText}>
          {t.noAccount}
          <Text style={styles.signupLink}>{t.signUp}</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}