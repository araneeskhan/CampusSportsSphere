import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { collection, query, orderBy, getDocs, addDoc, getDoc, doc, where } from "firebase/firestore";
import { db, storage, auth } from "../../../index";
import { ref, getDownloadURL } from "firebase/storage";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sportOptions = [
  "Cricket",
  "Football",
  "Basketball",
  "Tennis",
  "Volleyball",
  "Table Tennis",
  "Badminton",
];

const EventScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSports, setSelectedSports] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [registeringEvents, setRegisteringEvents] = useState({});
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    loadSavedPreferences();
    fetchEvents();
    fetchRegisteredEvents();
  }, []);


  const loadSavedPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem("sportPreferences");
      if (savedPreferences !== null) {
        setSelectedSports(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error("Error loading saved preferences:", error);
    }
  };

  const savePreferences = async (preferences) => {
    try {
      await AsyncStorage.setItem("sportPreferences", JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      let q = query(collection(db, "events"), orderBy("eventDate"));
      
      const querySnapshot = await getDocs(q);
      const eventList = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let imageUrl = null;
          if (data.imageUrl) {
            try {
              const imageRef = ref(storage, data.imageUrl);
              imageUrl = await getDownloadURL(imageRef);
            } catch (error) {
              console.error("Error fetching image URL:", error);
            }
          }
          return { id: doc.id, ...data, imageUrl };
        })
      );
  
      setEvents(eventList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events: ", error);
      setLoading(false);
      Alert.alert("Error", "An error occurred while fetching events. Please try again later.");
    }
  };


  const filterEvents = useCallback((eventList, excludePastEvents = false) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    return eventList.filter(event => {
      const eventDate = new Date(event.eventDate);
      eventDate.setHours(0, 0, 0, 0); 

      return (
        (!excludePastEvents || eventDate >= currentDate) &&
        (!searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [searchQuery]);



  const handleSearch = (text) => {
    setSearchQuery(text);
  };


  const fetchRegisteredEvents = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "registeredUsers"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const registeredEventIds = querySnapshot.docs.map(doc => doc.data().eventId);
      setRegisteredEvents(registeredEventIds);
    } catch (error) {
      console.error("Error fetching registered events:", error);
    }
  };

  
  const registerForEvent = async (event) => {
    if (registeringEvents[event.id]) return;
    setRegisteringEvents(prev => ({ ...prev, [event.id]: true }));
  
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to register for an event.");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        Alert.alert("Error", "User data not found.");
        return;
      }
  
      const userData = userDoc.data();
  
      await addDoc(collection(db, "registeredUsers"), {
        userId: user.uid,
        fullName: userData.fullName,
        email: userData.email,
        regNo: userData.regNo,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        registrationDate: new Date().toISOString(),
      });
  
      await addDoc(collection(db, "EventManagerNotifications"), {
        userId: "eventmanager@gmail.com", 
        message: `${userData.regNo} has registered for the event: ${event.title}`,
        read: false,
        createdAt: new Date().toISOString(),
        type: 'event_registration'
      });
  
      setRegisteredEvents(prev => [...prev, event.id]);
  
      Alert.alert("Success", "You have successfully registered for the event!");
    } catch (error) {
      console.error("Error registering for event:", error);
      Alert.alert("Error", "Failed to register for the event. Please try again.");
    } finally {
      setRegisteringEvents(prev => ({ ...prev, [event.id]: false }));
    }
  };



  const renderEventItem = ({ item, section }) => {
    const eventDate = new Date(item.eventDate);
    const isPastEvent = eventDate < new Date();
    const isUpcoming = section.title === "Upcoming Events";
    const isRegistering = registeringEvents[item.id] || false;
    const isRegistered = registeredEvents.includes(item.id);

    return (
      <View style={[styles.eventItem, isUpcoming && styles.upcomingEventItem]}>
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require("../../../assets/images/placeholderImage.jpg")
          }
          style={styles.eventImage}
        />
        <View style={styles.eventOverlay}>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>
              {eventDate.toLocaleString("default", { month: "short" })}
            </Text>
            <Text style={styles.dateNumber}>{eventDate.getDate()}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <TouchableOpacity
              style={[
                styles.registerButton,
                isPastEvent && styles.pastEventButton,
                isRegistered && styles.registeredButton,
              ]}
              disabled={isPastEvent || isRegistering || isRegistered}
              onPress={() => registerForEvent(item)}
            >
              <Text style={styles.registerButtonText}>
                {isPastEvent ? "Event Passed" : isRegistering ? "Registering..." : isRegistered ? "Registered" : "Register"}
              </Text>
              {isRegistered && <Feather name="check" size={24} color={Colors.SECONDARY} style={styles.tickIcon} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const toggleSportSelection = (sport) => {
    setSelectedSports((prev) => {
      const newSelection = prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport];
      savePreferences(newSelection);
      return newSelection;
    });
  };

  const renderSportOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sportOption,
        selectedSports.includes(item) && styles.selectedSportOption,
      ]}
      onPress={() => toggleSportSelection(item)}
    >
      <Text style={[
        styles.sportOptionText,
        selectedSports.includes(item) && styles.selectedSportOptionText
      ]}>{item}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  const allFilteredEvents = filterEvents(events);
  const recommendedEvents = allFilteredEvents
    .filter((event) => selectedSports.includes(event.category))
    .slice(0, 3);
  const popularEvents = allFilteredEvents.slice(0, 3);
  const upcomingEvents = filterEvents(events, true);

  const sections = [
    { title: "Recommended Events", data: recommendedEvents.length > 0 ? recommendedEvents : [{ id: "placeholder", title: "No recommended events" }] },
    { title: "Popular Events", data: popularEvents },
    { title: "Upcoming Events", data: upcomingEvents },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.headerDay}>
          {new Date().toLocaleDateString("en-US", { weekday: "long" })}
        </Text>
        <TouchableOpacity
          style={styles.personalizationIcon}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="sliders" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={24}
          color={Colors.PRIMARY}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Events"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={sections}
        renderItem={({ item }) => (
          <>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <FlatList
              data={item.data}
              renderItem={({ item: event }) =>
                event.id === "placeholder" ? (
                  <Text style={styles.placeholderText}>{event.title}</Text>
                ) : (
                  renderEventItem({ item: event, section: item })
                )
              }
              keyExtractor={(event) => event.id}
              horizontal={item.title !== "Upcoming Events"}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                item.title === "Upcoming Events" &&
                styles.upcomingEventsContainer
              }
            />
          </>
        )}
        keyExtractor={(item) => item.title}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Sports Preferences</Text>
            <FlatList
              data={sportOptions}
              renderItem={renderSportOption}
              keyExtractor={(item) => item}
              numColumns={2}
              contentContainerStyle={styles.sportOptionsContainer}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }, personalizationIcon: {
    position: 'absolute',
    right: responsiveWidth(4),
    top: responsiveHeight(3),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 10,
    padding: responsiveWidth(4),
    width: '80%',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
  sportOptionsContainer: {
    alignItems: 'center',
  },
  sportOption: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(2),
    borderRadius: 5,
    margin: responsiveWidth(1),
  },
  selectedSportOption: {
    backgroundColor: Colors.SECONDARY,
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  selectedSportOptionText: {
    color: Colors.PRIMARY,
  },
  sportOptionText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.8),
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveHeight(1),
    borderRadius: 5,
    marginTop: responsiveHeight(2),
    alignSelf: 'center',
  },
  closeButtonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },
  header: {
    marginTop: responsiveHeight(3),
    marginLeft: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
  },
  headerDate: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  headerDay: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginHorizontal: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
  },
  searchIcon: {
    marginRight: responsiveWidth(2),
  },
  searchInput: {
    flex: 1,
    height: responsiveHeight(5),
    fontSize: responsiveFontSize(1.8),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    marginBottom: responsiveHeight(1),
    marginLeft: responsiveWidth(3),
    color: Colors.PRIMARY,
  },
  eventItem: {
    width: responsiveWidth(60),
    height: responsiveHeight(15),
    marginRight: responsiveWidth(2),
    marginLeft: responsiveWidth(2),
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    overflow: "hidden",
  },
  upcomingEventItem: {
    width: responsiveWidth(85),
    alignSelf: "center",
    marginRight: 0,
  },
  upcomingEventsContainer: {
    alignItems: "center",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
  },
  dateBox: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(2),
    justifyContent: "center",
    alignItems: "center",
    width: responsiveWidth(15),
  },
  dateText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.5),
  },
  dateNumber: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
  },
  eventDetails: {
    flex: 1,
    padding: responsiveWidth(2),
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "bold",
    color: Colors.SECONDARY,
  },
  registerButton: {
    backgroundColor: Colors.PRIMARY,
    width: responsiveWidth(40),
    padding: responsiveHeight(0.5),
    borderRadius: 5,
    alignSelf: "flex-start",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastEventButton: {
    backgroundColor: "gray",
    opacity: 0.7,
  },
  registeredButton: {
    backgroundColor: Colors.PRIMARY,
    opacity:0.9,
    borderColor:Colors.SECONDARY,
    borderWidth:1,
  },
  registerButtonText: {
    color: Colors.SECONDARY,
    textAlign: "center",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    marginRight: 5,
  },
  tickIcon: {
    marginLeft: 5,
    color: Colors.SECONDARY,
    
  },
  placeholderText: {
    color: "red",
    fontSize: responsiveFontSize(2),
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(2),
    marginLeft:responsiveWidth(1)
  },
});

export default EventScreen;
