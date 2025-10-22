// app/components/Navbar.js
import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const navigation = useNavigation();

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      backgroundColor: "#f8f9fa",
      borderBottomWidth: 1,
      borderColor: "#ddd",
    }}>
      <TextInput
        placeholder="Search documents..."
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderRadius: 20,
          paddingHorizontal: 15,
          marginRight: 10,
          height: 40,
          borderWidth: 1,
          borderColor: "#ccc",
        }}
      />
      <TouchableOpacity onPress={() => navigation.navigate("QRScanner")}>
        <Ionicons name="qr-code-outline" size={25} color="#007bff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Ionicons name="person-circle-outline" size={28} color="#007bff" />
      </TouchableOpacity>
    </View>
  );
}
