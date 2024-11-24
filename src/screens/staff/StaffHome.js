import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { useTheme } from "../../../assets/theme/ThemeContext";
import { useNavigation } from '@react-navigation/native';
import StaffHeader from './StaffHeader';
import { Colors } from "../../../assets/colors/Colors";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";

const StaffHome = () => {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.PRIMARY} barStyle="light-content" />
      <StaffHeader />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>Staff Dashboard</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ReservationsScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={28} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.buttonText}>Current Reservations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AllReservationsRecord')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={28} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.buttonText}>All Reservations Record</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: responsiveWidth(5),
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(5),
  },
  welcomeText: {
    fontSize: responsiveFontSize(2.5),
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(1),
  },
  title: {
    fontSize: responsiveFontSize(4),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: responsiveHeight(5),
  },
  button: {
    backgroundColor: Colors.SECONDARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveHeight(2.5),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 15,
    marginBottom: responsiveHeight(3),
    elevation: 3,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    padding: responsiveWidth(2),
    marginRight: responsiveWidth(4),
  },
  buttonText: {
    color: Colors.PRIMARY,
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    flex: 1,
  },
});

export default StaffHome;