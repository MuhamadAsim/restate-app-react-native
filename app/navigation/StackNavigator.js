// app/navigation/StackNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import QRScannerScreen from "../screens/QRScannerScreen";
import DocumentDetailScreen from "../screens/DocumentDetailScreen";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
    </Stack.Navigator>
  );
}
