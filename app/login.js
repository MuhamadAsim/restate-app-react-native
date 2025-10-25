import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved) setLanguage(saved);
    };
    loadLanguage();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          router.replace("/Dashboard");
        }
      } catch (err) {
        console.error("Error checking user:", err);
      }
    };
    checkUser();
  }, []);

  const t = translations[language];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Sign in the user
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

      // 2️⃣ Fetch user's profile info
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, picture")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      // 3️⃣ Merge auth user data with profile data
      const fullUser = {
        id: user.id,
        email: user.email,
        name: profile?.name || "",
        picture: profile?.picture || null,
      };

      // 4️⃣ Save to local storage
      await AsyncStorage.setItem("user", JSON.stringify(fullUser));

      // 5️⃣ Success feedback & redirect
      Alert.alert("Success", t.success);
      router.replace("/Dashboard");

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