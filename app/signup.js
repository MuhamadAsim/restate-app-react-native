import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../constants/colors";
import { supabase } from "../lib/supabase";

const translations = {
  en: {
    createAccount: "Create Account",
    subtitle: "Sign up to get started",
    name: "Name",
    email: "Email",
    password: "Password",
    signUp: "SIGN UP",
    or: "or",
    signUpWith: "Sign up with",
    alreadyHaveAccount: "Already have an account? ",
    login: "Login",
    success: "✅ Successfully signed up! Please log in.",
  },
  np: {
    createAccount: "खाता बनाउनुहोस्",
    subtitle: "सुरु गर्न साइन अप गर्नुहोस्",
    name: "नाम",
    email: "इमेल",
    password: "पासवर्ड",
    signUp: "साइन अप",
    or: "वा",
    signUpWith: "साइन अप गर्नुहोस्",
    alreadyHaveAccount: "पहिले नै खाता छ? ",
    login: "लगइन गर्नुहोस्",
    success: "✅ सफलतापूर्वक साइन अप भयो! कृपया लगइन गर्नुहोस्।",
  },
};

export default function SignupScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved) setLanguage(saved);
    };
    loadLanguage();
  }, []);

  const t = translations[language];

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim();

    try {
      // 1️⃣ Try sign-in first to detect existing account
      const { data: loginTry, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!loginError) {
        Alert.alert("Email Exists", "This email is already registered. Please log in instead.");
        setLoading(false);
        router.push("/login");
        return;
      }

      // 2️⃣ Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name } },
      });

      if (error) {
        if (error.message.includes("invalid")) {
          Alert.alert("Invalid Email", "Please enter a valid email address.");
        } else {
          Alert.alert("Signup Failed", error.message);
        }
        return;
      }

      // 3️⃣ Handle verification case
      if (data.user && !data.session) {
        Alert.alert(
          "Check your email",
          "A confirmation email has been sent. Please verify your email before logging in."
        );
        router.push("/login");
      } else {
        Alert.alert("Success", "✅ Account created successfully!");
        router.push("/login");
      }
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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>{t.createAccount}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      {/* Name */}
      <TextInput
        placeholder={t.name}
        placeholderTextColor={colors.primary}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* Email */}
      <TextInput
        placeholder={t.email}
        placeholderTextColor={colors.primary}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password with Eye Toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={t.password}
          placeholderTextColor={colors.primary}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
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

      {/* Signup Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>{t.signUp}</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.or}>{t.or}</Text>
        <View style={styles.line} />
      </View>

      {/* Social Signup */}
      <Text style={styles.socialTitle}>{t.signUpWith}</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <Image
            source={require("../assets/facebook.jpeg")}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Already have account */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.signupText}>
          {t.alreadyHaveAccount}
          <Text style={styles.signupLink}>{t.login}</Text>
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