import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../assets/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../assets/colors/Colors";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, app } from "../../index";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const Header = () => {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const db = getFirestore(app);
      const user = auth.currentUser;

      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFullName(docSnap.data().fullName);
        }

        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("userId", "==", user.uid),
          where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          setNotificationCount(querySnapshot.size);
        });

        return () => unsubscribe();
      }
    };
    fetchUserData();
  }, []);

  const styles = getStyles(isDarkTheme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.iconContainer}>
          <Ionicons
            name="menu"
            size={32}
            color={isDarkTheme ? Colors.SECONDARY : Colors.PRIMARY}
          />
        </TouchableOpacity>
  
        <View style={styles.nameContainer}>
          <Text style={styles.helloText}>Hello</Text>
          <Text style={styles.userName}> {fullName}</Text>
        </View>
  
        <TouchableOpacity onPress={() => navigation.navigate("Notification")} style={styles.iconContainer}>
          <Ionicons
            name="notifications-outline"
            size={32}
            color={isDarkTheme ? Colors.SECONDARY : Colors.PRIMARY}
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const getStyles = (isDarkTheme) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: isDarkTheme ? Colors.PRIMARY : Colors.SECONDARY,
    },
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: responsiveWidth(4),
      paddingVertical: responsiveHeight(1),
    },
    iconContainer: {
      padding: responsiveWidth(2),
    },
    nameContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    helloText: {
      fontSize: responsiveFontSize(2.5),
      opacity: 0.5,
      color: isDarkTheme ? Colors.SECONDARY : Colors.PRIMARY
    },
    userName: {
      fontSize: responsiveFontSize(2.5),
      fontFamily: "outfit-bold",
      color: isDarkTheme ? Colors.SECONDARY : Colors.PRIMARY
    },
    badge: {
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundColor: 'red',
      borderRadius: 9,
      width: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });