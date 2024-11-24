import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import logo from "./../../assets/images/logo.png";
import { Colors } from "../../assets/colors/Colors";
import { useNavigation } from "@react-navigation/native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { height } from "@fortawesome/free-solid-svg-icons/fa0";

const LandingPage = () => {
  const navigation = useNavigation();

  const handleNavigation = () => {
    navigation.navigate("SignUp");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Campus Sports </Text>
      <Text style={styles.header}>Sphere</Text>


      <View style={styles.logoView}>
        <Image source={logo} style={styles.logo} />
      </View>


      <View style={styles.touchableOpacityView}>
        <TouchableOpacity
          style={styles.touchableOpacity}
          onPress={handleNavigation}
        >
          <Text style={styles.Text}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontFamily: "outfit-bold",
    fontSize: responsiveFontSize(4),
    color: '#235264'
  },
  logoView: {
    marginTop: responsiveHeight(13),
  },
  logo:{
    height:responsiveHeight(25),
    width:responsiveWidth(50)
  },
  touchableOpacityView: {
    marginTop: responsiveHeight(25),
    backgroundColor: Colors.PRIMARY,
    width: responsiveWidth(80),
    height: responsiveHeight(7),
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  Text: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(3),
    fontFamily: "outfit-bold",
  },
});
