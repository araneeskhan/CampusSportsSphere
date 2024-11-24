import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../../../assets/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../assets/colors/Colors";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, app } from "../../../../index";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const EventManagerHeader = () => {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(app);
    const user = auth.currentUser;

    if (user) {
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.drawer}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <Ionicons
            name="menu"
            size={32}
            color={isDarkTheme ? Colors.SECONDARY : Colors.PRIMARY}
          />
        </TouchableOpacity>
      </View>
  
      <View style={styles.name}>
        <Text style={styles.helloText}>Hello Event Manager</Text>
      </View>
  
      <View style={styles.notification}>
        <TouchableOpacity onPress={() => navigation.navigate("EventManagerNotification")}>
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

export default EventManagerHeader;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#2d4a55",
    paddingBottom: responsiveHeight(0.5),
  },
  drawer: {
    paddingTop: responsiveHeight(3),
    paddingLeft: responsiveWidth(5),
  },
  name: {
    display: "flex",
    flexDirection: "row",
    marginTop: responsiveHeight(3),
    marginLeft: responsiveWidth(7),
  },
  helloText: {
    fontSize: responsiveFontSize(2.5),
    opacity: 0.5,
    color: Colors.SECONDARY,
  },
  notification: {
    marginTop: responsiveHeight(5),
    marginLeft: responsiveWidth(48),
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
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
