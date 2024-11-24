import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../../../assets/colors/Colors";
import successIcon from "../../../../assets/images/icons/successfull.png";
import { useNavigation } from '@react-navigation/native';

const SuccessfullyCreatedEvent = ({ route }) => {
  const navigation = useNavigation();
  const eventDetails = route.params?.eventDetails || {};

  return (
    <View style={styles.container}>
      <View style={styles.confirmationCard}>
        <Text style={styles.confirmationText}>Event Created Successfully</Text>
        <Image source={successIcon} style={styles.successIcon} />
        
        <Text style={styles.confirmationDetails}>Event Title</Text>
        <Text style={styles.confirmationName}>{eventDetails.title || 'N/A'}</Text>
        
        <Text style={styles.confirmationDetails}>Date</Text>
        <Text style={styles.confirmationName}>{eventDetails.eventDate || 'N/A'}</Text>
        
        <Text style={styles.confirmationDetails}>Time</Text>
        <Text style={styles.confirmationName}>{eventDetails.eventTime || 'N/A'}</Text>
        
        <Text style={styles.confirmationDetails}>Description</Text>
        <Text style={styles.confirmationDescription}>{eventDetails.description || 'N/A'}</Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("EventManagerHome")}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
    backgroundColor: Colors.SECONDARY,
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
  },
  confirmationText: {
    fontSize: responsiveFontSize(3),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(2),
  },
  successIcon: {
    width: responsiveWidth(20),
    height: responsiveWidth(20),
    marginBottom: responsiveHeight(2),
  },
  confirmationDetails: {
    fontSize: responsiveFontSize(2),
    color: "#888",
    marginTop: responsiveHeight(1),
  },
  confirmationName: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    color: "#555",
    marginBottom: responsiveHeight(1),
  },
  confirmationDescription: {
    fontSize: responsiveFontSize(2),
    color: "#555",
    textAlign: "center",
    marginBottom: responsiveHeight(1),
  },
  continueButton: {
    marginTop: responsiveHeight(3),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
    width: responsiveWidth(80),
    height: responsiveHeight(7),
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
  },
});

export default SuccessfullyCreatedEvent;