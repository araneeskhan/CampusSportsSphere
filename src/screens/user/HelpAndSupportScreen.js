import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../../index";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const HelpAndSupportScreen = ({ route }) => {
  const navigation = useNavigation();
  const [userRegNo, setUserRegNo] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const fetchUserData = async () => {
      if (route.params?.userRegNo && route.params?.userFullName) {
        setUserRegNo(route.params.userRegNo);
        setUserFullName(route.params.userFullName);
      } else {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", currentUser.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data();
              setUserRegNo(userData.regNo);
              setUserFullName(userData.fullName);
            } else {
              console.error("User data not found");
            }
          } else {
            console.error("No user is currently logged in");
            navigation.navigate("Login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [route.params]);

  useEffect(() => {
    if (userRegNo) {
      fetchFeedbackHistory();
    }
  }, [userRegNo]);

  const fetchFeedbackHistory = async () => {
    try {
      const feedbackRef = collection(db, "feedback");
      const q = query(
        feedbackRef,
        where("userRegNo", "==", userRegNo),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const feedbackList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbackHistory(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
      setFeedbackHistory([]);
    }
  };

  const handleSectionPress = (section) => {
    setActiveSection(section);
    setModalVisible(true);
  };

  const handleSubmitSupport = async () => {
    if (supportMessage.trim()) {
      try {
        await addDoc(collection(db, "feedback"), {
          userRegNo,
          userFullName,
          feedback: supportMessage,
          createdAt: new Date(),
        });
        setSupportMessage("");
        setModalVisible(false);
        alert("Your support request has been submitted successfully!");
        fetchFeedbackHistory();
      } catch (error) {
        console.error("Error submitting support request:", error);
        alert("Failed to submit support request. Please try again.");
      }
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Instructions":
        return (
          <View>
            <Text style={styles.modalTitle}>Instructions</Text>
            <Text style={styles.modalSubTitle}>Steps to Reserve Equipment</Text>
            <Text style={styles.modalText}>
              1. Check available sports Equipment.
            </Text>
            <Text style={styles.modalText}>
              2. Select the Equipment from the list which you wish to Reserve or
              you can search it.
            </Text>
            <Text style={styles.modalText}>
              3. Choose your preferred Duration.
            </Text>
            <Text style={styles.modalText}>
              4. Confirm your reservation details.
            </Text>
            <Text style={styles.modalText}>
              5. Check your reservations in the User Profile.
            </Text>
            <Text style={styles.modalText}>
              6. Arrive on time to collect your Equipment.
            </Text>
            <Text style={styles.modalText}>7. Return Equipment after Use.</Text>
          </View>
        );
      case "FAQs":
        return (
          <View>
            <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
            <Text style={styles.modalQText}>
              Q: How do I reserve equipment?
            </Text>
            <Text style={styles.modalText}>
              A: You can Check the 'Instructions Section' for Step by Step guide
              of Reservation of Equipments .
            </Text>
            <Text style={styles.modalQText}>
              Q: How many reservations can I make at once?
            </Text>
            <Text style={styles.modalText}>
              A: You can have up to multiple active reservations at any given
              time.
            </Text>
            <Text style={styles.modalQText}>
              Q: How do I report damaged equipment?
            </Text>
            <Text style={styles.modalText}>
              A: Use the 'Contact Support Team' option to report any issues with
              equipment or facilities.
            </Text>
          </View>
        );
      case "Contact Support Team":
        return (
          <View>
            <Text style={styles.modalTitle}>Contact Support Team</Text>
            <Text style={styles.label}>Registration Number: {userRegNo}</Text>
            <Text style={styles.label}>Name: {userFullName}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your message"
              value={supportMessage}
              onChangeText={setSupportMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitSupport}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <Text style={styles.feedbackText}>{item.feedback}</Text>
      <Text style={styles.feedbackDate}>
        Sent: {moment(item.createdAt?.toDate()).format("MMM D, YYYY hh:mm A")}
      </Text>
      {item.staffResponse && (
        <View style={styles.staffResponse}>
          <Text style={styles.staffResponseText}>
            Staff Response: {item.staffResponse}
          </Text>
          <Text style={styles.staffResponseDate}>
            Responded:{" "}
            {moment(item.respondedAt?.toDate()).format("MMM D, YYYY hh:mm A")}
          </Text>
        </View>
      )}
    </View>
  );

  const renderListItem = ({ item }) => {
    if (item.type === "section") {
      return (
        <TouchableOpacity
          style={styles.section}
          onPress={() => handleSectionPress(item.title)}
        >
          <Text style={styles.sectionText}>{item.title}</Text>
        </TouchableOpacity>
      );
    } else if (item.type === "feedbackHistory") {
      return (
        <View style={styles.feedbackHistoryContainer}>
          <Text style={styles.sectionTitle}>Feedback History</Text>
          <FlatList
            data={feedbackHistory}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyStateText}>
                No feedback history available
              </Text>
            }
          />
        </View>
      );
    }
  };

  const listData = [
    { type: "section", title: "Instructions" },
    { type: "section", title: "FAQs" },
    { type: "section", title: "Contact Support Team" },
    { type: "feedbackInput" },
    { type: "feedbackHistory" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Help and Support</Text>
      </View>

      <FlatList
        data={listData}
        renderItem={renderListItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.content}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {renderContent()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveWidth(5),
    backgroundColor: Colors.PRIMARY,
  },
  backButton: {
    marginRight: responsiveWidth(3),
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(15),
  },
  content: {
    padding: responsiveWidth(5),
  },
  section: {
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
  sectionText: {
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(2),
  },
  feedbackContainer: {
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(3),
  },
  feedbackHistoryContainer: {
    marginBottom: responsiveHeight(3),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    height: responsiveHeight(15),
    borderRadius: 15,
    padding: responsiveWidth(3),
    marginBottom: responsiveHeight(2),
    fontSize: responsiveFontSize(1.8),
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(3),
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.8),
    fontWeight: "bold",
  },
  feedbackItem: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
  },
  feedbackText: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(1),
  },
  feedbackDate: {
    fontSize: responsiveFontSize(1.6),
    color: "gray",
    marginBottom: responsiveHeight(1),
  },
  staffResponse: {
    backgroundColor: Colors.PRIMARY + "20",
    padding: responsiveWidth(3),
    borderRadius: 5,
    marginTop: responsiveHeight(1),
  },
  staffResponseText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(0.5),
  },
  staffResponseDate: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.PRIMARY + "80",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(5),
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  modalSubTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  modalQText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "bold",
  },

  modalText: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(1),
  },
  label: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(1),
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(3),
    borderRadius: 5,
    alignItems: "center",
    marginTop: responsiveHeight(2),
  },
  emptyStateText: {
    fontSize: responsiveFontSize(1.8),
    color: "gray",
    textAlign: "center",
    marginTop: responsiveHeight(2),
  },
});

export default HelpAndSupportScreen;
