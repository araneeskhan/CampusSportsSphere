import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../../index";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "reservationRequests"),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert("Error", "Failed to fetch reservation requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      const requestRef = doc(db, "reservationRequests", requestId);
      const requestDoc = await getDoc(requestRef);
      const requestData = requestDoc.data();

      await updateDoc(requestRef, { status });

      if (status === "approved") {
        const slotRef = doc(db, "groundSlots", requestData.slotId);
        await updateDoc(slotRef, { isAvailable: false });

        const reservationRef = doc(collection(db, "reservations"));
        await setDoc(reservationRef, {
          userId: requestData.userId,
          slotId: requestData.slotId,
          date: requestData.date,
          startTime: requestData.startTime,
          endTime: requestData.endTime,
          createdAt: new Date(),
        });

        await addDoc(collection(db, "notifications"), {
          userId: requestData.userId,
          type: "reservationApproved",
          message: `Your Ground Reservation for Date: ${requestData.date} from ${requestData.startTime} to ${requestData.endTime} has been Approved.`,
          createdAt: new Date(),
          read: false,
        });
      }

      Alert.alert(
        "Success",
        `Request ${
          status === "approved" ? "approved" : "declined"
        } successfully.`
      );
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      Alert.alert("Error", `Failed to ${status} the request.`);
    }
  };
 
  
  const renderRequest = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <MaterialCommunityIcons
          name="calendar-clock"
          size={24}
          color={Colors.PRIMARY}
        />
        <Text style={styles.requestDate}>{item.date}</Text>
      </View>
      <View style={styles.requestDetails}>
        <Text style={styles.requestText}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.PRIMARY} />
          {" "}{item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.requestText}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color={Colors.PRIMARY} />
          {" "}Requested: {moment(item.createdAt.toDate()).format("MMM D, YYYY [at] h:mm A")}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleRequest(item.id, "approved")}
        >
          <MaterialCommunityIcons name="check" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleRequest(item.id, "declined")}
        >
          <MaterialCommunityIcons name="close" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.PRIMARY} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Ground Reservation Requests</Text>
      </View>
      <View style={styles.container}>
        {requests.length === 0 ? (
          <View style={styles.noRequestsContainer}>
            <MaterialCommunityIcons
              name="playlist-remove"
              size={48}
              color={Colors.SECONDARY}
            />
            <Text style={styles.noRequestsText}>No pending requests</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(4),
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.SECONDARY,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: responsiveHeight(2),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND,
  },
  listContainer: {
    padding: responsiveWidth(4),
  },
  requestItem: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 10,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },
  requestDate: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    color: Colors.PRIMARY,
    marginLeft: responsiveWidth(2),
  },
  requestDetails: {
    marginBottom: responsiveHeight(2),
  },
  requestText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(0.5),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 8,
    flex: 1,
  },
  approveButton: {
    backgroundColor: Colors.PRIMARY,
    marginRight: responsiveWidth(2),
  },
  declineButton: {
    backgroundColor: Colors.DANGER,
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
    marginLeft: responsiveWidth(1),
  },
  noRequestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRequestsText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(1),
  },
});

export default Requests;