import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import { app } from "../../../index";
import { Colors } from "../../../assets/colors/Colors";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const AllReservationsRecord = () => {
  const navigation = useNavigation();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('reservationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservationsRef = collection(db, "all-reservation-records");
        const q = query(reservationsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reservationsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReservations(reservationsList);
          setFilteredReservations(reservationsList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    filterAndSortReservations();
  }, [searchQuery, sortBy, sortOrder, reservations]);

  const filterAndSortReservations = () => {
    let filtered = [...reservations];

    if (searchQuery) {
      filtered = filtered.filter(
        (reservation) =>
          (reservation.userRegNo?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (reservation.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (reservation.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    filtered.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === 'reservationDate' || sortBy === 'expirationTime') {
        valueA = valueA?.toDate?.() ?? new Date(0);
        valueB = valueB?.toDate?.() ?? new Date(0);
      } else if (sortBy === 'duration') {
        valueA = (a.duration?.hours ?? 0) * 60 + (a.duration?.minutes ?? 0);
        valueB = (b.duration?.hours ?? 0) * 60 + (b.duration?.minutes ?? 0);
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReservations(filtered);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (date) => {
    if (date && date.toDate instanceof Function) {
      return moment(date.toDate()).format('MMM D, YYYY');
    }
    return 'N/A';
  };

  const formatDateTime = (date) => {
    if (date && date.toDate instanceof Function) {
      return moment(date.toDate()).format('MMM D, YYYY hh:mm A');
    }
    return 'N/A';
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.reservationItem}>
      <View style={styles.reservationHeader}>
        <Text style={styles.userInfo}>{item.userRegNo ?? 'N/A'}</Text>
        <Text style={styles.dateInfo}>{formatDate(item.reservationDate)}</Text>
      </View>
      <Text style={styles.emailInfo}>{item.userEmail ?? 'N/A'}</Text>
      <Text style={styles.itemInfo}>{item.itemName ?? 'N/A'}</Text>
      <View style={styles.durationContainer}>
        <Text style={styles.durationInfo}>
          Duration: {item.duration?.hours ?? 0}h {item.duration?.minutes ?? 0}m
        </Text>
        <Text style={styles.expirationInfo}>
          Expires: {formatDateTime(item.expirationTime)}
        </Text>
      </View>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort By</Text>
          {['reservationDate', 'expirationTime', 'userRegNo', 'userEmail', 'itemName', 'duration'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.filterOption}
              onPress={() => {
                setSortBy(option);
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.title}>All Reservations</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.PRIMARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by user ID, email, or item"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Ionicons name="funnel-outline" size={20} color={Colors.PRIMARY} />
          <Text style={styles.filterButtonText}>Sort by: {sortBy}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortOrderButton} onPress={toggleSortOrder}>
          <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
      {filteredReservations.length > 0 ? (
        <FlatList
          data={filteredReservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={Colors.PRIMARY} />
          <Text style={styles.emptyStateText}>No reservations found</Text>
        </View>
      )}
      {renderFilterModal()}
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
    marginRight: responsiveWidth(3),
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
    margin: responsiveWidth(5),
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(3),
  },
  searchIcon: {
    marginRight: responsiveWidth(2),
  },
  searchInput: {
    flex: 1,
    paddingVertical: responsiveHeight(1.5),
    fontSize: responsiveFontSize(1.8),
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(2),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(2),
    borderRadius: 5,
  },
  filterButtonText: {
    marginLeft: responsiveWidth(2),
    fontSize: responsiveFontSize(1.6),
    color: Colors.PRIMARY,
  },
  sortOrderButton: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(2),
    borderRadius: 5,
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
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1),
  },
  userInfo: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  dateInfo: {
    fontSize: responsiveFontSize(1.6),
    color: 'gray',
  },
  emailInfo: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(0.5),
  },
  itemInfo: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500',
    marginBottom: responsiveHeight(1),
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationInfo: {
    fontSize: responsiveFontSize(1.6),
    color: 'gray',
  },
  expirationInfo: {
    fontSize: responsiveFontSize(1.6),
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(5),
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: responsiveHeight(1.5),
    borderBottomWidth: 1,
    borderBottomColor: Colors.BACKGROUND,
  },
  filterOptionText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
  },
  closeButton: {
    marginTop: responsiveHeight(2),
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
});

export default AllReservationsRecord;