import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRouter, usePathname } from "expo-router";
import styles from "../styles/dashboardStyle";
import AddDocument from "../components/AddDocument";

const BottomNav = () => {
  const [active, setActive] = useState("home");
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Update active tab when route changes
  useEffect(() => {
    if (pathname === "/DashboardScreen") setActive("home");
    else if (pathname === "/DocumentsScreen") setActive("documents");
    else if (pathname === "/ActivityScreen") setActive("activity");
    else if (pathname === "/profile") setActive("profile");
  }, [pathname]);

  // Prevent redundant navigation
  const handleNavigation = (screen) => {
    if (active === screen) return; // 👈 stop navigation if already active

    setActive(screen);

    if (screen === "home") router.push("/DashboardScreen");
    else if (screen === "documents") router.push("/DocumentsScreen");
    else if (screen === "activity") router.push("/ActivityScreen");
    else if (screen === "profile") router.push("/profile");
  };

  return (
    <View>
      <View style={styles.bottomNav}>
        {/* Home */}
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("home")}>
          <Icon name="home" size={24} color={active === "home" ? "#667eea" : "#888"} />
          <Text style={[styles.navItemText, active === "home" && styles.navItemActive]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Documents */}
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("documents")}>
          <Icon name="file-text" size={24} color={active === "documents" ? "#667eea" : "#888"} />
          <Text style={[styles.navItemText, active === "documents" && styles.navItemActive]}>
            Documents
          </Text>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.navItem, styles.addBtn]}
          onPress={() => setShowAddModal(true)}
        >
          <View style={styles.addCircle}>
            <Icon name="plus" size={28} color="white" />
          </View>
        </TouchableOpacity>

        {/* Activity */}
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("activity")}>
          <Icon name="activity" size={24} color={active === "activity" ? "#667eea" : "#888"} />
          <Text style={[styles.navItemText, active === "activity" && styles.navItemActive]}>
            Activity
          </Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation("profile")}>
          <Icon name="user" size={24} color={active === "profile" ? "#667eea" : "#888"} />
          <Text style={[styles.navItemText, active === "profile" && styles.navItemActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Document Modal */}
      <AddDocument visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </View>
  );
};

export default BottomNav;
