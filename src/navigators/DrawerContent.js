import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Image,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import {
  FontAwesome,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTheme } from "../../assets/theme/ThemeContext";
import { Colors } from "../../assets/colors/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DrawerContent = ({ userType }) => {
  const auth = getAuth();
  const [userEmail, setUserEmail] = useState("");
  const navigation = useNavigation();
  const { isDarkTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("@popup_shown");
      navigation.navigate("SignIn");
      setUserEmail("");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const styles = getStyles(isDarkTheme);

  return (
    <View style={styles.container}>
      <View style={styles.ImageContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Home")}
        >
          <FontAwesome
            name="home"
            size={24}
            color={isDarkTheme ? "white" : "black"}
          />
          <Text style={styles.menuItemText}>Home</Text>
        </TouchableOpacity>

        {userType === "user" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("GroundReservationScreen")}
          >
            <MaterialIcons
              name="event-available"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Ground Reservation</Text>
          </TouchableOpacity>
        )}

        {userType === "user" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("WebScrapping")}
          >
            <MaterialCommunityIcons
              name="web"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>HEC Events</Text>
          </TouchableOpacity>
        )}

        {userType === "user" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons
              name="notifications"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Notifications</Text>
          </TouchableOpacity>
        )}

        {userType === "user" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ChatbotScreen")}
          >
            <MaterialIcons
              name="chat"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Chat Bot</Text>
          </TouchableOpacity>
        )}

        {userType === "user" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("HelpAndSupportScreen")}
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Help And Support</Text>
          </TouchableOpacity>
        )}

        {userType === "staff" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("StaffSupportScreen")}
          >
            <MaterialIcons
              name="support-agent"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Staff Support</Text>
          </TouchableOpacity>
        )}

        {userType === "staff" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("StaffNotification")}
          >
            <Ionicons
              name="notifications"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Staff Notifications</Text>
          </TouchableOpacity>
        )}

        {userType === "eventManager" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("GroundSlots")}
          >
            <FontAwesome
              name="calendar"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Ground Slots</Text>
          </TouchableOpacity>
        )}

        {userType === "eventManager" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EventManagerNotification")}
          >
            <Ionicons
              name="notifications"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Notifications</Text>
          </TouchableOpacity>
        )}

        {userType === "eventManager" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Requests")}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color={isDarkTheme ? "white" : "black"}
            />
            <Text style={styles.menuItemText}>Requests</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.themeToggle}>
        <Text style={styles.menuItemText}>Dark Theme </Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={32}
          color={isDarkTheme ? "black" : "white"}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (isDarkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkTheme ? Colors.PRIMARY : Colors.SECONDARY,
      padding: 20,
      borderTopRightRadius: 50,
      borderBottomRightRadius: 50,
    },
    ImageContainer: {
      marginTop: 50,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    logo: {
      width: 100,
      height: 100,
    },
    email: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkTheme ? "white" : "black",
    },
    content: {
      flex: 1,
      marginTop: 50,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
    },
    menuItemText: {
      marginLeft: 20,
      fontSize: 18,
      color: isDarkTheme ? "white" : "black",
    },
    themeToggle: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    logoutButton: {
      flexDirection: "row",
      backgroundColor: isDarkTheme ? "white" : "black",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 40,
      alignItems: "center",
    },
    logoutText: {
      marginLeft: 25,
      fontSize: 20,

      color: isDarkTheme ? "black" : "white",
      fontWeight: "bold",
    },
  });

export default DrawerContent;
