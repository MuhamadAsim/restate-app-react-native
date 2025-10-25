import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRouter, usePathname } from "expo-router"; // 👈 usePathname gives current route
import styles from "../styles/dashboardStyle";

const BottomNav = () => {
  const [active, setActive] = useState("home");
  const router = useRouter();
  const pathname = usePathname(); // 👈 get current route path

  useEffect(() => {
    // Automatically update active tab when route changes
    if (pathname === "/Dashboard") setActive("home");
    else if (pathname === "/profile") setActive("profile");
    else if (pathname === "/documents") setActive("documents");
    else if (pathname === "/activity") setActive("activity");
  }, [pathname]);

  const handleNavigation = (screen) => {
    setActive(screen);

    if (screen === "home") {
      // ✅ Only navigate if we're not already on the Dashboard
      if (pathname !== "/Dashboard") {
        router.push("/Dashboard");
      }
    } else if (screen === "profile") {
      if (pathname !== "/profile") router.push("/profile");
    } else if (screen === "documents") {
      if (pathname !== "/documents") router.push("/documents");
    } else if (screen === "activity") {
      if (pathname !== "/activity") router.push("/activity");
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation("home")}
      >
        <Icon
          name="home"
          size={24}
          color={active === "home" ? "#667eea" : "#888"}
        />
        <Text
          style={[styles.navItemText, active === "home" && styles.navItemActive]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation("documents")}
      >
        <Icon
          name="file-text"
          size={24}
          color={active === "documents" ? "#667eea" : "#888"}
        />
        <Text
          style={[
            styles.navItemText,
            active === "documents" && styles.navItemActive,
          ]}
        >
          Documents
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navItem, styles.addBtn]}>
        <View style={styles.addCircle}>
          <Icon name="plus" size={28} color="white" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation("activity")}
      >
        <Icon
          name="activity"
          size={24}
          color={active === "activity" ? "#667eea" : "#888"}
        />
        <Text
          style={[
            styles.navItemText,
            active === "activity" && styles.navItemActive,
          ]}
        >
          Activity
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleNavigation("profile")}
      >
        <Icon
          name="user"
          size={24}
          color={active === "profile" ? "#667eea" : "#888"}
        />
        <Text
          style={[
            styles.navItemText,
            active === "profile" && styles.navItemActive,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNav;
