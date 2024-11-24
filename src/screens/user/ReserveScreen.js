import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getFirestore,
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../../index";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../../assets/colors/Colors";
import SuccessfullyReserved from "./SuccessfullyReserved";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ReserveScreen = ({ route }) => {
  const { item } = route.params;
  console.log("Received item data:", item);
  const [duration, setDuration] = useState({ hours: 0, minutes: 0 });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userRegNo, setUserRegNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState(null);

  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      setShowConfirmation(false);
      setDuration({ hours: 0, minutes: 0 });
      fetchUserRegNo();
    }, [])
  );

  const fetchUserRegNo = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore(app);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const regNo = userDoc.data().regNo || "";
          setUserRegNo(regNo);
        }
      }
    } catch (error) {
      console.error("Error fetching user regNo:", error);
      Alert.alert(
        "Error",
        "Failed to fetch user information. Please try again."
      );
    }
  };

  const handleDurationChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setDuration((prev) => ({ ...prev, [field]: numValue }));
    updateEndTime({ ...duration, [field]: numValue });
  };

  const updateEndTime = (newDuration) => {
    const totalMinutes = newDuration.hours * 60 + newDuration.minutes;
    const newEndTime = new Date(Date.now() + totalMinutes * 60 * 1000);
    setEndTime(newEndTime);
  };

  const handleReservation = async () => {
    console.log("Reservation process started.");

    if (duration.hours === 0 && duration.minutes === 0) {
      Alert.alert(
        "Invalid Duration",
        "Please select a duration for your reservation."
      );
      console.log("Invalid duration selected.");
      return;
    }

    setLoading(true);
    console.log("Loading started.");

    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;
    const itemRef = doc(db, "items", item.id);
    const reservationsRef = collection(db, "reservations");
    const allReservationsRef = collection(db, "all-reservation-records");

    const totalMinutes = duration.hours * 60 + duration.minutes;
    const reservationEndTime = new Date(Date.now() + totalMinutes * 60 * 1000);
    const expirationTime = new Date(reservationEndTime.getTime() + 3 * 1000);

    try {
      console.log("Fetching item document...");
      const itemDoc = await getDoc(itemRef);
      console.log("Item document fetched.");

      if (itemDoc.exists() && itemDoc.data().itemQuantity > 0) {
        console.log("Item available for reservation.");

        await updateDoc(itemRef, {
          itemQuantity: increment(-1),
        });

        const reservationData = {
          itemName: item.itemName,
          itemId: item.id,
          userEmail: user.email,
          userRegNo: userRegNo,
          reservationDate: serverTimestamp(),
          duration: {
            hours: duration.hours,
            minutes: duration.minutes,
          },
          endTime: reservationEndTime,
          expirationTime: expirationTime,
        };

        const reservationDocRef = await addDoc(
          reservationsRef,
          reservationData
        );

        const reservationId = reservationDocRef.id;

        console.log("Reservation created with ID:", reservationId);

        await addDoc(allReservationsRef, reservationData);

        // Schedule expiration ---> OF Reservation which we made
        const timeUntilExpiration = expirationTime.getTime() - Date.now();
        setTimeout(async () => {
          try {
            console.log("Timeout reached. Checking reservation expiration...");

            const db = getFirestore(app);
            const reservationDocRef = doc(db, "reservations", reservationId);
            const reservationDoc = await getDoc(reservationDocRef);

            if (reservationDoc.exists()) {
              console.log("Reservation exists, proceeding to delete...");

              await updateDoc(itemRef, {
                itemQuantity: increment(1),
              });
              await deleteDoc(reservationDocRef);

              console.log("Reservation deleted successfully.");

              const notificationsRef = collection(db, "notifications");
              await addDoc(notificationsRef, {
                userId: user.uid,
                message: `Reservation time has Expired for ${item.itemName}. Kindly Return it Back. Thank you :)`,
                createdAt: serverTimestamp(),
                read: false,
              });

              console.log("Notification created successfully.");
            } else {
              console.log("Reservation document not found.");
            }
          } catch (error) {
            console.error("Error handling reservation expiration:", error);
          }
        }, timeUntilExpiration);

        setShowConfirmation(true);
      } else {
        Alert.alert("Reservation Failed", "This item is no longer available.");
      }
    } catch (error) {
      console.error("Error reserving item:", error);
      Alert.alert(
        "Reservation Failed",
        "An error occurred while reserving the item. Please try again."
      );
    } finally {
      setLoading(false);
      console.log("Loading stopped.");
    }
  };

  const renderDurationPicker = () => (
    <View style={styles.durationPicker}>
      <View style={styles.durationInputContainer}>
        <TextInput
          style={styles.durationInput}
          keyboardType="numeric"
          value={duration.hours.toString()}
          onChangeText={(value) => handleDurationChange("hours", value)}
          maxLength={2}
        />
        <Text style={styles.durationLabel}>Hours</Text>
      </View>
      <View style={styles.durationInputContainer}>
        <TextInput
          style={styles.durationInput}
          keyboardType="numeric"
          value={duration.minutes.toString()}
          onChangeText={(value) => handleDurationChange("minutes", value)}
          maxLength={2}
        />
        <Text style={styles.durationLabel}>Minutes</Text>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {!showConfirmation ? (
        <View style={styles.container}>
          <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
          <View style={styles.contentContainer}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={20} color={Colors.SECONDARY} />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Select Duration</Text>
            {renderDurationPicker()}
            {endTime && (
              <Text style={styles.endTimeText}>
                End Time: {endTime.toLocaleTimeString()}
              </Text>
            )}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityText}>Available Quantity</Text>
              <Text style={styles.itemQuantity}>{item.itemQuantity}</Text>
            </View>
            <TouchableOpacity
              onPress={handleReservation}
              style={styles.reserveButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.PRIMARY} />
              ) : (
                <Text style={styles.buttonText}>Reserve</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <SuccessfullyReserved
          item={item}
          duration={duration}
          navigation={navigation}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.PRIMARY,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.SECONDARY,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  itemImage: {
    width: responsiveWidth(60),
    height: responsiveHeight(30),
    resizeMode: "contain",
    marginVertical: 20,
  },
  itemName: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 15,
    textAlign: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  dateText: {
    fontSize: responsiveFontSize(2),
    color: Colors.SECONDARY,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "600",
    color: Colors.PRIMARY,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  durationPicker: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  durationInputContainer: {
    alignItems: "center",
  },
  durationInput: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 10,
    width: responsiveWidth(20),
    textAlign: "center",
    fontSize: responsiveFontSize(2.5),
    color: Colors.PRIMARY,
  },
  durationLabel: {
    marginTop: 5,
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
  },
  endTimeText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    marginBottom: 15,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  quantityText: {
    fontSize: responsiveFontSize(2.2),
    color: Colors.PRIMARY,
  },
  itemQuantity: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    backgroundColor: "transparent",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.PRIMARY,
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
  },
});

export default ReserveScreen;
