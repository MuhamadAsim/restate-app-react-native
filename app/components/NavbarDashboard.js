import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import styles from "../styles/dashboardStyle";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("User");
  const [profileImage, setProfileImage] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("savedUserData");
        const savedProfileImage = await AsyncStorage.getItem("profileImage");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Get username - same logic as profile.js
          const displayName =
            userData.name ||
            userData.user_metadata?.username ||
            userData.email?.split("@")[0] ||
            "User";
          
          setUsername(displayName);
        }

        // Load local profile image
        if (savedProfileImage) {
          setProfileImage(savedProfileImage);
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
      }
    };

    // Get current day and date
    const date = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" };
    setCurrentDate(date.toLocaleDateString("en-US", options));

    fetchUserData();
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <View style={styles.navbar}>
      <View style={styles.navbarLeft}>
        {profileImage ? (
          <Image 
            source={{ uri: profileImage }} 
            style={localStyles.profilePicImage} 
          />
        ) : (
          <View style={styles.profilePic}>
            <Icon name="user" size={24} color="white" />
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            Hello, {username}!
          </Text>
          <Text style={styles.profileDate}>{currentDate}</Text>
        </View>
      </View>

      <View style={styles.navbarRight}>
        <TouchableOpacity style={styles.iconBtn}>
          <Icon name="camera" size={24} color="#333" />
        </TouchableOpacity>

        <View>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleDropdown}>
            <Icon name="bell" size={24} color="#333" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={localStyles.dropdown}>
              <Text style={localStyles.dropdownText}>No updates available</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  profilePicImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dropdown: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    zIndex: 10,
    minWidth: 150,
  },
  dropdownText: {
    color: "#333",
    fontSize: 14,
  },
});

export default Navbar;