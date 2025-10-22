// app/screens/DashboardScreen.js
import React from "react";
import { View, Text } from "react-native";
import Navbar from "./components/Navbar";

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>📄 Your Documents will appear here!</Text>
      </View>
    </View>
  );
}
