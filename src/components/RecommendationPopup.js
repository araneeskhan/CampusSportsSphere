import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../assets/colors/Colors";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../index";

const RecommendationPopup = () => {
  const [recommendedEquipment, setRecommendedEquipment] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState({ hours: 0, minutes: 0 });
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [userRegNo, setUserRegNo] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    getRecommendation();
    fetchUserRegNo();
  }, []);

  const getRecommendation = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore(app);
        const reservationsRef = collection(db, "all-reservation-records");
        const userReservationsQuery = query(
          reservationsRef,
          where("userEmail", "==", user.email)
        );
        const querySnapshot = await getDocs(userReservationsQuery);
        const reservations = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          reservationDate: doc.data().reservationDate.toDate(),
        }));
        const equipment = recommendEquipment(reservations);
        if (equipment) {
          setRecommendedEquipment(equipment);
          setPopupVisible(true);
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

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
    }
  };

  const recommendEquipment = (reservations) => {
    reservations.sort((a, b) => b.reservationDate - a.reservationDate);

    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    const equipmentScores = {};

    reservations.forEach((reservation) => {
      const { itemName, itemId, reservationDate } = reservation;
      const timeSinceReservation = now - reservationDate;

      let recencyScore;
      if (timeSinceReservation <= threeDays) {
        recencyScore = 1;
      } else if (timeSinceReservation <= oneWeek) {
        recencyScore = 0.7;
      } else {
        recencyScore = 0.3;
      }

      if (equipmentScores[itemId]) {
        equipmentScores[itemId].score += recencyScore;
        equipmentScores[itemId].count++;
      } else {
        equipmentScores[itemId] = { score: recencyScore, count: 1, itemName };
      }
    });

    const finalScores = Object.entries(equipmentScores).map(
      ([itemId, data]) => ({
        itemId,
        score: data.score / Math.sqrt(data.count),
        itemName: data.itemName,
      })
    );

    finalScores.sort((a, b) => b.score - a.score);

    return finalScores[0] || null;
  };

  const fetchItemDetails = async (itemId) => {
    try {
      const db = getFirestore(app);
      const itemDoc = doc(db, "items", itemId);
      const itemSnapshot = await getDoc(itemDoc);
      if (itemSnapshot.exists()) {
        return itemSnapshot.data();
      } else {
        console.error("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      return null;
    }
  };

  const handleDurationChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setDuration((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleReserve = async () => {
    if (!recommendedEquipment?.itemId) {
      console.error("Equipment data is not available");
      return;
    }

    if (duration.hours === 0 && duration.minutes === 0) {
      Alert.alert(
        "Invalid Duration",
        "Please select a duration for your reservation."
      );
      return;
    }

    setLoading(true);
    console.log("Reservation process started.");

    const db = getFirestore(app);
    const auth = getAuth(app);
    const user = auth.currentUser;
    const itemRef = doc(db, "items", recommendedEquipment.itemId);
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
          itemName: recommendedEquipment.itemName,
          itemId: recommendedEquipment.itemId,
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

        const timeUntilExpiration = expirationTime.getTime() - Date.now();
        setTimeout(async () => {
          try {
            console.log("Timeout reached. Checking reservation expiration...");

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
                message: `Reservation time has Expired for ${recommendedEquipment.itemName}. Kindly Return it Back. Thank you :)`,
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

        Alert.alert(
          "Success",
          `Equipment reserved successfully for ${duration.hours} hours and ${duration.minutes} minutes!`
        );
        setPopupVisible(false);
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
      console.log("Reservation process ended.");
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

  if (!recommendedEquipment) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={popupVisible}
      onRequestClose={() => setPopupVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.popupContainer}>
          <Text style={styles.title}>Recommended Equipment</Text>
          <Text style={styles.equipmentName}>
            {recommendedEquipment.itemName || "Unknown Equipment"}
          </Text>
          <Text style={styles.description}>
            Based on your recent activity, we think you might be interested in
            this equipment.
          </Text>
          {showDurationPicker ? (
            <>
              <Text style={styles.durationTitle}>Select Duration</Text>
              {renderDurationPicker()}
              <TouchableOpacity
                style={styles.button}
                onPress={handleReserve}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.SECONDARY} />
                ) : (
                  <Text style={styles.buttonText}>Confirm Reservation</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowDurationPicker(true)}
            >
              <Text style={styles.buttonText}>Reserve Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.closeButton]}
            onPress={() => setPopupVisible(false)}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.closeButtonText]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 20,
    padding: responsiveWidth(5),
    width: responsiveWidth(80),
    alignItems: "center",
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: "outfit-bold",
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  equipmentName: {
    fontSize: responsiveFontSize(3),
    fontFamily: "outfit-bold",
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  description: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: "outfit-medium",
    textAlign: "center",
    marginBottom: responsiveHeight(3),
    color: Colors.PRIMARY,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(5),
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.8),
    fontFamily: "outfit-bold",
  },
  closeButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  closeButtonText: {
    color: Colors.PRIMARY,
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
  durationTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 10,
  },
});

export default RecommendationPopup;
