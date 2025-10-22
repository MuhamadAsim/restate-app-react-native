import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../constants/colors";
import { supabase } from "../lib/supabase";

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

  const t = translations[language];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
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

      // ✅ Login successful
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      Alert.alert("Success", t.success);
      router.push("/home");

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
      <TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 30,
    fontWeight: "900",
    color: "#4B00FF",
  },
  header: {
    marginBottom: 40,
  },
  welcome: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4B00FF",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B00FF",
    marginTop: 5,
  },
  input: {
    borderBottomWidth: 1.5,
    borderColor: "#4B00FF",
    fontSize: 16,
    color: "#4B00FF",
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginVertical: 10,
  },
  passwordContainer: {
    position: "relative",
    marginVertical: 10,
  },
  passwordInput: {
    borderBottomWidth: 1.5,
    borderColor: "#4B00FF",
    fontSize: 16,
    color: "#4B00FF",
    paddingVertical: 12,
    paddingHorizontal: 6,
    paddingRight: 45, // Space for eye icon
  },
  eyeButton: {
    position: "absolute",
    right: 5,
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: 5,
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeOpen: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeClosed: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeOutline: {
    width: 20,
    height: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  eyePupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  eyeSlash: {
    position: "absolute",
    width: 22,
    height: 2,
    backgroundColor: colors.primary,
    transform: [{ rotate: "45deg" }],
    top: 11,
  },
  loginButton: {
    backgroundColor: "#4B00FF",
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotText: {
    color: "#4B00FF",
    textAlign: "center",
    marginVertical: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#4B00FF",
  },
  or: {
    marginHorizontal: 10,
    color: "#4B00FF",
  },
  socialTitle: {
    textAlign: "center",
    color: "#4B00FF",
    marginVertical: 10,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    color: "#4B00FF",
  },
  signupLink: {
    color: "#4B00FF",
    fontWeight: "bold",
  },
});