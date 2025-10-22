import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import colors from "../constants/colors";

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState(null);

  const languages = [
    { code: "en", name: "English", flag: require("../assets/flags/uk.jpeg") },
    { code: "np", name: "नेपाली (Nepali)", flag: require("../assets/flags/nepal.png") },
  ];

  const saveLanguage = async () => {
    if (!selectedLang) return;
    await AsyncStorage.setItem("appLanguage", selectedLang);
    router.replace("/login"); // Go to login after selecting
  };

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await AsyncStorage.getItem("appLanguage");
      // if (saved) router.replace("/login");
    };
    loadLanguage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>

      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.langOption,
            selectedLang === lang.code && styles.selectedOption,
          ]}
          onPress={() => setSelectedLang(lang.code)}
        >
          <Image source={lang.flag} style={styles.flag} />
          <Text style={styles.langText}>{lang.name}</Text>
          <View style={[styles.radioOuter, selectedLang === lang.code && styles.radioOuterActive]}>
            {selectedLang === lang.code && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.continueButton, !selectedLang && { opacity: 0.6 }]}
        disabled={!selectedLang}
        onPress={saveLanguage}
      >
        <Text style={styles.continueText}>
          {selectedLang === "np" ? "जारी राख्नुहोस्" : "Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30, color: colors.primary },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    width: "75%",
    justifyContent: "space-between",
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "#EDE7FF",
  },
  flag: { width: 35, height: 25, borderRadius: 5, marginRight: 10 },
  langText: { flex: 1, fontSize: 16, color: "#333", marginLeft: 10 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    width: "75%",
  },
  continueText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "600" },
});
