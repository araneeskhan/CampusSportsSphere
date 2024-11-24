import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../../index";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Notification = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("userId", "==", user.uid));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsList);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const renderNotification = ({ item, index }) => {
    const translateY = scrollY.interpolate({
      inputRange: [-1, 0, index * 90, (index + 2) * 90],
      outputRange: [0, 0, 0, 100],
    });

    let icon = "alert-circle";
    let iconColor = Colors.PRIMARY;

    if (item.type === "reservationApproved") {
      icon = "checkmark-circle";
      iconColor = "green";
    }

    return (
      <Animated.View
        style={[
          styles.notificationItem,
          item.read ? styles.readNotification : styles.unreadNotification,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
              <Ionicons
                name={icon}
                size={24}
                color={Colors.SECONDARY}
              />
            </View>
          </View>
          <Text style={styles.notificationText}>{item.message}</Text>
        </View>
        <View style={styles.notificationActions}>
          {!item.read && (
            <TouchableOpacity
              onPress={() => handleMarkAsRead(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="checkmark-outline" size={20} color="green" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDeleteNotification(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [120, 70],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Animated.Text
          style={[
            styles.title,
            {
              fontSize: scrollY.interpolate({
                inputRange: [0, 120],
                outputRange: [responsiveFontSize(3), responsiveFontSize(2.5)],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          Notifications
        </Animated.Text>
      </Animated.View>

      {notifications.length > 0 ? (
        <AnimatedFlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notificationList}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color={Colors.PRIMARY}
          />
          <Text style={styles.noNotificationsText}>No notifications</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
    backgroundColor: Colors.PRIMARY,
    zIndex: 1000,
  },
  backButton: {
    padding: responsiveWidth(2),
  },
  title: {
    fontWeight: "bold",
    marginLeft: responsiveWidth(15),
    color: Colors.SECONDARY,
  },
  notificationList: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(2),
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderRadius: 15,
    backgroundColor: Colors.SECONDARY,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.PRIMARY,
  },
  readNotification: {
    opacity: 0.6,
  },
  notificationContent: {
    flex: 1,
    marginRight: responsiveWidth(2),
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadIconContainer: {
    backgroundColor: Colors.PRIMARY,
  },
  readIconContainer: {
    backgroundColor: "#4A7A8C",
  },
  notificationText: {
    fontSize: responsiveFontSize(1.8),
    color: "#2C3E50",
    lineHeight: responsiveFontSize(2.4),
  },
  notificationActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: responsiveWidth(2),
    marginLeft: responsiveWidth(2),
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noNotificationsText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(2),
  },
});

export default Notification;
