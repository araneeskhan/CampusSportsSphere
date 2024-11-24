import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
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

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const StaffNotificationScreen = () => {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState([]);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsRef = collection(db, "reservations");
        const q = query(reservationsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reservationsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationsList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  const handleDeleteReservation = async (reservationId) => {
    try {
      await deleteDoc(doc(db, "reservations", reservationId));
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  const renderReservation = ({ item, index }) => {
    const translateY = scrollY.interpolate({
      inputRange: [-1, 0, index * 90, (index + 2) * 90],
      outputRange: [0, 0, 0, 100],
    });

    return (
      <Animated.View
        style={[styles.reservationItem, { transform: [{ translateY }] }]}
      >
        <View style={styles.reservationContent}>
          <View style={styles.reservationHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.SECONDARY}
              />
            </View>
          </View>
          <Text style={styles.reservationText}>
            User {item.userRegNo} has reserved {item.itemName} for{" "}
            {item.duration.hours} hours and {item.duration.minutes} minutes.
          </Text>
        </View>
        <View style={styles.reservationActions}>
          <TouchableOpacity
            onPress={() => handleDeleteReservation(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Reservations</Text>
      </View>

      {reservations.length > 0 ? (
        <AnimatedFlatList
          data={reservations}
          renderItem={renderReservation}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.reservationList}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={64} color={Colors.PRIMARY} />
          <Text style={styles.noReservationsText}>No New Reservations</Text>
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
    paddingHorizontal: responsiveWidth(4),
    backgroundColor: Colors.PRIMARY,
    height: 70, 
    zIndex: 1000,
  },
  backButton: {
    paddingHorizontal: responsiveWidth(2),
  },
  title: {
    fontWeight: "bold",
    marginLeft: responsiveWidth(15), 
    fontSize: responsiveFontSize(2.5), 
    color: Colors.SECONDARY,
  },
  reservationList: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(2),
  },
  reservationItem: {
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
  reservationContent: {
    flex: 1,
    marginRight: responsiveWidth(2),
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  reservationText: {
    fontSize: responsiveFontSize(1.8),
    color: "#2C3E50",
    lineHeight: responsiveFontSize(2.4),
  },
  reservationActions: {
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
  noReservationsText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(1),
  },
});

export default StaffNotificationScreen;
