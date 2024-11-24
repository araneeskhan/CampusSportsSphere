import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { auth, createUserWithEmailAndPassword, db } from "../../index";
import { Colors } from "../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { setDoc, doc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regNo, setRegNo] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({});
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const navigation = useNavigation();

  const getErrors = (fullName, email, password, regNo) => {
    const errors = {};

    if (!fullName) {
      errors.fullName = "Please Enter your Full name";
    }
    if (!email) {
      errors.email = "Please Enter your Email";
    } else if (!email.includes("@") || !email.includes(".com")) {
      errors.email = "Please Enter Valid Email";
    }

    if (!password) {
      errors.password = "Enter your Password";
    } else if (password.length < 8) {
      errors.password = "Password length should be 8 ";
    }

    if (!regNo) {
      errors.regNo = "Please Enter your Registration Number";
    } else if (!/^[A-Z]{2}\d{2}-[A-Z]{3}-\d{3}$/.test(regNo)) {
      errors.regNo = "Invalid Registration Number format";
    }

    return errors;
  };

  const handleSignup = async () => {
    const errors = getErrors(fullName, email, password, regNo);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      setErrors(errors);
    } else {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          fullName: fullName,
          email: email,
          regNo: regNo,
          requiresVerification: true, // Flag to indicate this is a new user requiring verification
          emailVerified: false,
        });

        await sendEmailVerification(user);
        setIsVerificationSent(true);

        Alert.alert(
          "Verification Email Sent",
          "Please check your email and verify your account before signing in.",
          [{ text: "OK", onPress: () => navigation.navigate("SignIn") }]
        );
      } catch (error) {
        console.error("Registration failed:", error.message);
        setShowErrors(true);
        setErrors({ general: "Registration failed. Please try again." });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>Sign Up</Text>

        <View style={styles.whiteContainer}>
          <Text style={styles.text}>Full Name</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={(value) => setFullName(value)}
            />
            {errors.fullName && (
              <Text style={styles.warnings}>{errors.fullName}</Text>
            )}
          </View>

          <Text style={styles.text}>Email </Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(value) => setEmail(value)}
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.warnings}>{errors.email}</Text>
            )}
          </View>

          <Text style={styles.text}>Password</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(value) => setPassword(value)}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.warnings}>{errors.password}</Text>
            )}
          </View>

          <Text style={styles.text}>Registration Number</Text>
          <View style={styles.inputView}>
            <TextInput
              style={styles.input}
              value={regNo}
              onChangeText={(value) => setRegNo(value.toUpperCase())}
              autoCapitalize="characters"
              placeholder="XXXX-XXX-XXX"
            />
            {errors.regNo && (
              <Text style={styles.warnings}>{errors.regNo}</Text>
            )}
          </View>

          <View style={styles.registerView}>
            <TouchableOpacity
              style={styles.registerTouchableOpacity}
              onPress={handleSignup}
            >
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomText}>Already have an account?</Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("SignIn");
            }}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  header: {
    marginTop: responsiveHeight(14),
    textAlign: "center",
    fontSize: responsiveFontSize(4),
    color: Colors.SECONDARY,
    fontFamily: "outfit-bold",
  },
  whiteContainer: {
    flex: 1,
    marginTop: responsiveHeight(10),
    backgroundColor: "white",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    padding: responsiveWidth(3),
  },
  inputView: {
    alignItems: "center",
  },
  text: {
    marginTop: responsiveHeight(2),
    marginLeft: responsiveWidth(10),
    color: Colors.PRIMARY,
    fontSize: responsiveFontSize(2),
    fontFamily: "outfit-medium",
  },
  input: {
    width: "80%",
    paddingLeft: 30,
    borderRadius: 13,
    height: responsiveHeight(6),
    fontSize: responsiveFontSize(2),
    backgroundColor: "#F1F1F1",
  },
  registerView: {
    backgroundColor: Colors.PRIMARY,
    margin: responsiveHeight(5),
    marginLeft: responsiveWidth(8),
    width: responsiveWidth(78),
    height: responsiveHeight(7),
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(3),
    fontFamily: "outfit-bold",
  },
  bottomText: {
    textAlign: "center",
    fontFamily: "outfit-regular",
  },
  signInText: {
    textAlign: "center",
    fontSize: responsiveFontSize(2.5),
    fontFamily: "outfit-medium",
  },
  warnings: {
    color: "red",
    fontFamily: "break",
  },
});

export default SignUp;