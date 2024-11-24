import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Colors } from "../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({});
  const [hidePassword, setHidePassword] = useState(true);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();

  const getErrors = (email, password) => {
    const errors = {};
    if (!email) errors.email = "Please enter your email";
    else if (!email.includes("@") || !email.includes(".com"))
      errors.email = "Please enter a valid email";

    if (!password) errors.password = "Please enter your password";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters long";

    return errors;
  };

  const handleLogin = async () => {
    const errors = getErrors(email, password);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      setErrors(errors);
    } else {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (userCredential.user) {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          const userData = userDoc.data();

          const specialEmails = ['admin@gmail.com', 'staff@gmail.com', 'eventmanager@gmail.com'];
          if (!specialEmails.includes(email.toLowerCase())) {
            if (userData.requiresVerification && !userCredential.user.emailVerified) {
              setErrorMessage("Please verify your email before signing in.");
              setErrorModalVisible(true);
              return;
            }
          }

          console.log("Logged in", userCredential.user);

          const token = userCredential.user.uid;
          await AsyncStorage.setItem("authToken", token);

          let userType = "user";
          if (email.toLowerCase() === "admin@gmail.com") {
            userType = "admin";
          } else if (email.toLowerCase() === "staff@gmail.com") {
            userType = "staff";
          } else if (email.toLowerCase() === "eventmanager@gmail.com") {
            userType = "eventManager";
          }

          navigation.navigate("Main", {
            userType: userType,
          });
        }
      } catch (error) {
        console.error("Authentication failed:", error.message);
        setErrorMessage("Invalid Email or Password");
        setErrorModalVisible(true);
      }
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          navigation.navigate("Main");
          alert("Please Login Again")
        }
      } catch (error) {
        console.error("Error checking login:", error);
      }
    };

    checkLogin();
  }, []);

  const ErrorModal = ({ visible, message, onClose }) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <View style={styles.whiteContainer}>
        <Text style={styles.Text}>Email</Text>

        <View style={styles.InputView}>
          <TextInput
            style={styles.Input}
            value={email}
            onChangeText={(value) => setEmail(value)}
            autoCapitalize="none"
          />
          {showErrors && errors.email && (
            <Text style={styles.warnings}>{errors.email}</Text>
          )}
        </View>

        <Text style={styles.Text}>Password</Text>
        <View style={styles.InputView}>
          <TextInput
            style={styles.Input}
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={(value) => setPassword(value)}
          />
          {password !== "" && (
            <TouchableOpacity
              onPress={() => setHidePassword(!hidePassword)}
              style={styles.eyeIcon}
            >
              <FontAwesomeIcon
                icon={hidePassword ? faEyeSlash : faEye}
                size={24}
                style={{ color: Colors.SECONDARY }}
              />
            </TouchableOpacity>
          )}
          {showErrors && errors.password && (
            <Text style={styles.warnings}>{errors.password}</Text>
          )}
        </View>

        <View style={styles.loginView}>
          <TouchableOpacity
            style={styles.LogintouchableOpacity}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.BottomText}>Don't Remember Password?</Text>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.ForgotPasswordText}>Forgot Password</Text>
        </TouchableOpacity>

        <Text style={styles.BottomText}>Don't have an account?</Text>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("SignUp");
          }}
        >
          <Text style={styles.SignUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <ErrorModal
        visible={errorModalVisible}
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  header: {
    marginTop: responsiveHeight(13),
    textAlign: "center",
    fontSize: responsiveFontSize(4),
    color: Colors.SECONDARY,
    fontFamily: "outfit-bold",
  },
  whiteContainer: {
    flex: 1,
    marginTop: responsiveHeight(16),
    backgroundColor: "white",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  loginView: {
    backgroundColor: Colors.PRIMARY,
    marginTop: responsiveHeight(3),
    marginLeft: responsiveWidth(10),
    width: responsiveWidth(80),
    height: responsiveHeight(6),
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(3),
    fontFamily: "outfit-bold",
  },
  InputView: {
    alignItems: "center",
  },
  Text: {
    marginTop: responsiveHeight(3),
    marginLeft: responsiveWidth(12),
    color: Colors.PRIMARY,
    fontSize: responsiveFontSize(2),
    fontFamily: "outfit-medium",
  },
  Input: {
    width: responsiveWidth(80),
    paddingLeft: responsiveWidth(5),
    borderRadius: 13,
    fontSize: responsiveFontSize(2),
    height: responsiveHeight(6),
    backgroundColor: "#F1F1F1",
  },
  BottomText: {
    marginTop: responsiveHeight(3),
    textAlign: "center",
    fontFamily: "outfit-regular",
  },
  ForgotPasswordText: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "outfit-medium",
    marginBottom: responsiveHeight(1),
  },
  SignUpText: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "outfit-medium",
  },
  warnings: {
    color: "red",
    fontFamily: "break",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: responsiveFontSize(2.2),
    color: Colors.DANGER,
    fontFamily: "outfit-medium",
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal:responsiveWidth(20),
    elevation: 2
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: responsiveFontSize(2),
    fontFamily: "outfit-medium",
  },
  eyeIcon: {
    position: 'absolute',
    right: responsiveWidth(5),
    top: responsiveHeight(1.5),
  },
});

export default SignIn;