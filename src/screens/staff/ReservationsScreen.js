import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from "../../../index";
import { Colors } from "../../../assets/colors/Colors";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const ReservationsScreen = () => {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsRef = collection(db, "reservations");
        const q = query(reservationsRef, where("status", "==", "active"));

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

  const renderReservationItem = ({ item }) => (
    <View style={styles.reservationItem}>
      <Text style={styles.userInfo}>User: {item.userRegNo}</Text>
      <Text style={styles.itemInfo}>Item: {item.itemName}</Text>
      <Text style={styles.durationInfo}>
        Duration: {item.duration.hours}h {item.duration.minutes}m
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Current Reservations</Text>
      </View>
      {reservations.length > 0 ? (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={Colors.PRIMARY} />
          <Text style={styles.emptyStateText}>No active reservations</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(5),
    backgroundColor: Colors.PRIMARY,
  },
  backButton: {
    marginRight: responsiveWidth(13),
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
  },
  listContent: {
    padding: responsiveWidth(5),
  },
  reservationItem: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(1),
    color: Colors.PRIMARY,
  },
  itemInfo: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(0.5),
  },
  durationInfo: {
    fontSize: responsiveFontSize(1.8),
    color: 'gray',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(2),
  },
});

export default ReservationsScreen;