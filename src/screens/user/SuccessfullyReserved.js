import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../../assets/colors/Colors";
import successIcon from "../../../assets/images/icons/successfull.png"; 

const SuccessfullyReserved = ({ item, duration, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.confirmationCard}>
        <Text style={styles.confirmationText}>Reservation Successful</Text>
        <Image source={successIcon} />
        <Text style={styles.confirmationDetails}>Equipment</Text>
        <Text style={styles.confirmationName}>{item.itemName}</Text>
        <Text style={styles.confirmationDetails}>Reservation Date</Text>
        <Text style={styles.confirmationName}>
          {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.confirmationDetails}>Reservation Time</Text>
        <Text style={styles.confirmationName}>
          {`${duration.hours} hours ${duration.minutes} minutes`}
        </Text>

        <TouchableOpacity
          style={styles.ReserveButton}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <Text style={styles.Buttontext}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationCard: {
    width: "90%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 2,
  },
  confirmationText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  confirmationDetails: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  confirmationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 10,
  },
  ReserveButton: {
    marginTop: responsiveHeight(5),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
    width: responsiveWidth(80),
    height: responsiveHeight(7),
    borderRadius: 10,
  },
  Buttontext: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(3),
  },
});

export default SuccessfullyReserved;
