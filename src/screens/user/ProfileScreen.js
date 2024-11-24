import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { useFocusEffect } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import ProfileImage from "../../components/ProfileImage";
import { getAuth } from "firebase/auth";
import { app } from "../../../index";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [regNo, setRegNo] = useState("");
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app);
  const user = auth.currentUser;

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        if (!user || !user.email) {
          console.log("User not authenticated");
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log("Fetching user data for email:", user.email);

        const db = getFirestore(app);
        const reservationsRef = collection(db, "reservations");
        const registeredUsersRef = collection(db, "registeredUsers");
        const reservationsQuery = query(
          reservationsRef,
          where("userEmail", "==", user.email)
        );
        const registeredEventsQuery = query(
          registeredUsersRef,
          where("userId", "==", user.uid)
        );
        const docRef = doc(db, "users", user.uid);

        try {
          const [reservationsSnapshot, registeredEventsSnapshot, docSnap] =
            await Promise.all([
              getDocs(reservationsQuery),
              getDocs(registeredEventsQuery),
              getDoc(docRef),
            ]);

          const reservationsData = reservationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationsData);

          const registeredEventsData = registeredEventsSnapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );
          setRegisteredEvents(registeredEventsData);

          if (docSnap.exists()) {
            setFullName(docSnap.data().fullName);
            setProfileImage(docSnap.data().profileImage);
            setRegNo(docSnap.data().regNo);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, [user])
  );

  const cancelEventRegistration = async (eventId) => {
    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, "registeredUsers", eventId));
      setRegisteredEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      Alert.alert("Success", "Event registration cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling event registration:", error);
      Alert.alert(
        "Error",
        "Failed to cancel event registration. Please try again."
      );
    }
  };

  const renderReservationItem = ({ item }) => (
    <LinearGradient
      colors={[Colors.PRIMARY, Colors.SECONDARY]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.reservationItem}
    >
      <View style={styles.equipmentNameView}>
        <Ionicons name="cube-outline" size={24} color={Colors.SECONDARY} />
        <Text style={styles.equipmentName}>{item.itemName}</Text>
      </View>

      <View style={styles.equipmentNameView}>
        <Ionicons name="calendar-outline" size={24} color={Colors.SECONDARY} />
        <Text style={styles.reservationDate}>
          {new Date(item.reservationDate.toDate()).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.equipmentNameView}>
        <Ionicons name="time-outline" size={24} color={Colors.SECONDARY} />
        <Text style={styles.reservationDuration}>
          {item.duration.hours}h {item.duration.minutes}m
        </Text>
      </View>

      <View style={styles.equipmentNameView}>
        <Ionicons name="person-outline" size={24} color={Colors.SECONDARY} />
        <Text style={styles.reservationRegNo}>{item.userRegNo}</Text>
      </View>
    </LinearGradient>
  );

  const renderEventItem = ({ item }) => (
    <LinearGradient
      colors={[Colors.PRIMARY, Colors.SECONDARY]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.eventItem}
    >
      <View style={styles.subView}>
        <View style={styles.eventNameView}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={Colors.SECONDARY}
          />
          <Text style={styles.eventName}>{item.eventTitle}</Text>

          <Ionicons name="time-outline" size={24} color={Colors.SECONDARY} />
          <Text style={styles.eventDate}>
            {new Date(item.eventDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelEventRegistration(item.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.imageView}>
          <ProfileImage
            currentImage={profileImage}
            onImageChange={(newImage) => {
              setProfileImage(newImage);
            }}
          />
        </View>
        <Text style={styles.userName}>{fullName}</Text>
        <Text style={styles.userRegNo}>{regNo}</Text>
      </View>

      <View style={styles.whiteContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={[
              { title: "Reserved Equipments", data: reservations },
              { title: "Registered Events", data: registeredEvents },
            ]}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                {item.data.length > 0 ? (
                  <FlatList
                    data={item.data}
                    renderItem={
                      item.title === "Reserved Equipments"
                        ? renderReservationItem
                        : renderEventItem
                    }
                    keyExtractor={(subItem) => subItem.id}
                    contentContainerStyle={styles.listContainer}
                  />
                ) : (
                  <Text style={styles.noItemsText}>
                    No {item.title.toLowerCase()}
                  </Text>
                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  headerGradient: {
    paddingTop: responsiveHeight(4),
    paddingBottom: responsiveHeight(6),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
  },
  imageView: {
    marginTop: responsiveHeight(5),
  },

  userName: {
    color: Colors.SECONDARY,
    textAlign: "center",
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(3),
    fontFamily: "break",
    fontWeight: "bold",
  },
  userRegNo: {
    color: Colors.SECONDARY,
    textAlign: "center",
    marginTop: responsiveHeight(1),
    fontSize: responsiveFontSize(2),
    fontFamily: "break",
    opacity: 0.8,
  },
  whiteContainer: {
    flex: 1,
    marginTop: responsiveHeight(5),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.SECONDARY,
    paddingTop: responsiveHeight(3),
  },
  reservedEquipmentText: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: "outfit-bold",
    marginLeft: responsiveWidth(8),
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  listContainer: {
    paddingHorizontal: responsiveWidth(5),
  },
  reservationItem: {
    marginBottom: responsiveHeight(2),
    borderRadius: 15,
    marginHorizontal: responsiveWidth(5),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1),
    elevation: 3,
  },
  equipmentNameView: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(0.2),
  },
  equipmentName: {
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(2),
  },
  loader: {
    marginTop: responsiveHeight(5),
  },
  reservationRegNo: {
    fontSize: responsiveFontSize(1.5),
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(2),
  },
  reservationDate: {
    fontSize: responsiveFontSize(1.5),
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(2),
  },
  reservationDuration: {
    fontSize: responsiveFontSize(1.5),
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(2),
  },
  noReservationsText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    textAlign: "center",
    marginTop: responsiveHeight(10),
    fontStyle: "italic",
  },

  // events

  sectionTitle: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: "outfit-bold",
    marginLeft: responsiveWidth(8),
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  eventItem: {
    marginBottom: responsiveHeight(2),
    borderRadius: 15,
    marginHorizontal: responsiveWidth(5),
    padding: responsiveWidth(2),
    elevation: 1,
  },
  subView: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventNameView: {
    flexDirection: "coloumn",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  eventName: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(2),
  },
  eventDate: {
    fontSize: responsiveFontSize(2),
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(2),
  },
  cancelButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 5,
    alignSelf: "flex-start",
    marginTop: responsiveHeight(1),
  },
  cancelButtonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.8),
    fontWeight: "bold",
  },
  noItemsText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.5,
  },
});
