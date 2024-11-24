import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Colors } from "../../assets/colors/Colors";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setModalVisible(true);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("No user found with this email address");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forgot Password</Text>
      <View style={styles.whiteContainer}>
        <Text style={styles.text}>Enter your email address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FontAwesomeIcon
              icon={faCheckCircle}
              size={50}
              color={Colors.PRIMARY}
            />
            <Text style={styles.modalText}>Password Reset Email Sent</Text>
            <Text style={styles.modalSubText}>
              Check your email for instructions to reset your password.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setModalVisible(!modalVisible);
                navigation.navigate("SignIn");
              }}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  header: {
    marginTop: 130,
    textAlign: "center",
    fontSize: 38,
    color: Colors.SECONDARY,
    fontFamily: "outfit-bold",
  },
  whiteContainer: {
    flex: 1,
    marginTop: 200,
    backgroundColor: "white",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    padding: 20,
    alignItems: "center",
  },
  text: {
    marginTop: 20,
    color: Colors.PRIMARY,
    fontSize: 18,
    fontFamily: "outfit-medium",
  },
  input: {
    width: "80%",
    height: 58,
    backgroundColor: "#F1F1F1",
    borderRadius: 13,
    marginTop: 20,
    paddingLeft: 30,
    fontSize: 18,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    width: "90%",
    height: 70,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: 24,
    fontFamily: "outfit-bold",
  },
  error: {
    color: "red",
    marginTop: 10,
    fontFamily: "break",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 35,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "outfit-bold",
    color: Colors.PRIMARY,
  },
  modalSubText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "outfit-medium",
    color: Colors.PRIMARY,
  },
  buttonClose: {
    backgroundColor: Colors.PRIMARY,
    width: 200,
  },
});

export default ForgotPassword;
