import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { auth, db } from "../../../index";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const OPENWEATHERMAP_API_KEY = "cc37c59b31778f49d0ec6d3b4ed08213";

const timePreferences = [
  "Morning (9AM - 12PM)",
  "Afternoon (12PM - 2PM)",
  "Evening (2PM - 6PM)",
];

const temperaturePreferences = [
  "Cool (15-20°C)",
  "Moderate (20-25°C)",
  "Warm (25-30°C)",
];

const weatherPreferences = ["Sunny", "Cloudy", "Rainy"];

const GroundReservationScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [recommendedSlot, setRecommendedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [userPreferences, setUserPreferences] = useState({});
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
      getWeatherData();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (
      weatherData &&
      availableSlots.length > 0 &&
      Object.keys(userPreferences).length > 0
    ) {
      getAIRecommendation();
    }
  }, [weatherData, availableSlots, userPreferences]);

  const fetchUserPreferences = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not logged in");
      }
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const preferences = userDoc.data().preferences || {};
        setUserPreferences(preferences);
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      Alert.alert("Error", "Could not fetch user preferences");
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const slotsSnapshot = await getDocs(
        query(
          collection(db, "groundSlots"),
          where("date", "==", selectedDate),
          where("isAvailable", "==", true)
        )
      );
      if (!slotsSnapshot.empty) {
        const slots = slotsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableSlots(slots);
      } else {
        console.log("No slots available for the selected date");
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      Alert.alert(
        "Error",
        "Failed to fetch available slots. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getWeatherData = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=Islamabad,PK&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
      );
      const data = await response.json();

      const selectedForecast = data.list.find((item) => {
        const forecastDate = new Date(item.dt * 1000)
          .toISOString()
          .split("T")[0];
        return forecastDate === selectedDate;
      });

      if (selectedForecast) {
        setWeatherData({
          temperature: selectedForecast.main.temp,
          condition: selectedForecast.weather[0].main.toLowerCase(),
        });
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const getAIRecommendation = () => {
    const scoredSlots = availableSlots.map((slot) => {
      let score = 0;
      const slotHour = parseInt(slot.startTime.split(":")[0]);

      if (
        userPreferences.timePreference === "Morning (6AM - 12PM)" &&
        slotHour >= 6 &&
        slotHour < 12
      )
        score += 3;
      else if (
        userPreferences.timePreference === "Afternoon (12PM - 5PM)" &&
        slotHour >= 12 &&
        slotHour < 17
      )
        score += 3;
      else if (
        userPreferences.timePreference === "Evening (5PM - 10PM)" &&
        slotHour >= 17 &&
        slotHour < 22
      )
        score += 3;

      const tempRange = userPreferences.temperaturePreference
        ?.split(" ")[1]
        .replace("(", "")
        .replace(")", "")
        .split("-");
      const minTemp = parseInt(tempRange[0]);
      const maxTemp = parseInt(tempRange[1]);
      if (
        weatherData.temperature >= minTemp &&
        weatherData.temperature <= maxTemp
      )
        score += 3;
      else if (
        Math.abs(weatherData.temperature - minTemp) <= 5 ||
        Math.abs(weatherData.temperature - maxTemp) <= 5
      )
        score += 1;

      if (
        userPreferences.weatherPreference?.toLowerCase() ===
        weatherData.condition
      )
        score += 3;
      else if (
        (userPreferences.weatherPreference === "Sunny" &&
          weatherData.condition === "clear") ||
        (userPreferences.weatherPreference === "Cloudy" &&
          weatherData.condition === "clouds")
      )
        score += 2;

      return { ...slot, score };
    });

    scoredSlots.sort((a, b) => b.score - a.score);
    setRecommendedSlot(scoredSlots[0]);
  };

  const handleReservation = async () => {
    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const reservationRef = await addDoc(
        collection(db, "reservationRequests"),
        {
          userId: auth.currentUser.uid,
          slotId: selectedSlot.id,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      );

      await addDoc(collection(db, "notifications"), {
        recipientId: "eventManager",
        type: "reservationRequest",
        reservationId: reservationRef.id,
        message: `New ground reservation request for ${selectedDate}`,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        "Success",
        "Reservation request sent successfully! You will be notified when it's approved."
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error sending reservation request:", error);
      Alert.alert(
        "Error",
        "Failed to send reservation request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const PreferencesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPreferencesModal}
      onRequestClose={() => setShowPreferencesModal(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Your Preferences</Text>

          <Text style={styles.preferenceTitle}>Time Preference</Text>
          <FlatList
            data={timePreferences}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.preferenceOption,
                  userPreferences.timePreference === item &&
                    styles.selectedPreferenceOption,
                ]}
                onPress={() =>
                  setUserPreferences((prev) => ({
                    ...prev,
                    timePreference: item,
                  }))
                }
              >
                <Text style={styles.preferenceOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          <Text style={styles.preferenceTitle}>Temperature Preference</Text>
          <FlatList
            data={temperaturePreferences}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.preferenceOption,
                  userPreferences.temperaturePreference === item &&
                    styles.selectedPreferenceOption,
                ]}
                onPress={() =>
                  setUserPreferences((prev) => ({
                    ...prev,
                    temperaturePreference: item,
                  }))
                }
              >
                <Text style={styles.preferenceOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          <Text style={styles.preferenceTitle}>Weather Preference</Text>
          <FlatList
            data={weatherPreferences}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.preferenceOption,
                  userPreferences.weatherPreference === item &&
                    styles.selectedPreferenceOption,
                ]}
                onPress={() =>
                  setUserPreferences((prev) => ({
                    ...prev,
                    weatherPreference: item,
                  }))
                }
              >
                <Text style={styles.preferenceOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={async () => {
              try {
                await updateDoc(doc(db, "users", auth.currentUser.uid), {
                  preferences: userPreferences,
                });
                setShowPreferencesModal(false);
                Alert.alert("Success", "Preferences saved successfully!");
              } catch (error) {
                console.error("Error saving preferences:", error);
                Alert.alert(
                  "Error",
                  "Failed to save preferences. Please try again."
                );
              }
            }}
          >
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSlot = ({ item: slot }) => (
    <TouchableOpacity
      style={[
        styles.slotButton,
        selectedSlot?.id === slot.id && styles.selectedSlot,
        recommendedSlot?.id === slot.id && styles.recommendedSlot,
      ]}
      onPress={() => setSelectedSlot(slot)}
    >
      <Text style={styles.slotTime}>
        {slot.startTime} - {slot.endTime}
      </Text>
      {recommendedSlot?.id === slot.id && (
        <View style={styles.recommendedTag}>
          <MaterialCommunityIcons name="star" size={16} color={Colors.ACCENT} />
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const WeatherInfo = () => (
    <View style={styles.weatherContainer}>
      <MaterialCommunityIcons
        name={
          weatherData.condition === "clear"
            ? "weather-sunny"
            : weatherData.condition === "clouds"
            ? "weather-cloudy"
            : "weather-rainy"
        }
        size={24}
        color={Colors.PRIMARY}
      />
      <Text style={styles.weatherText}>
        {weatherData.temperature}°C, {weatherData.condition}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reserve Ground</Text>
          <TouchableOpacity
            style={styles.preferencesButton}
            onPress={() => setShowPreferencesModal(true)}
          >
            <Feather name="sliders" size={24} color={Colors.SECONDARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: Colors.PRIMARY },
            }}
            minDate={new Date().toISOString().split("T")[0]}
            theme={{
              calendarBackground: Colors.SECONDARY,
              todayTextColor: Colors.PRIMARY,
              selectedDayBackgroundColor: Colors.PRIMARY,
              selectedDayTextColor: Colors.SECONDARY,
              dotColor: Colors.ACCENT,
              monthTextColor: Colors.PRIMARY,
              textDayFontWeight: "300",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {selectedDate && (
          <View style={styles.slotsContainer}>
            <Text style={styles.subtitle}>
              Available Slots for {selectedDate}
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            ) : (
              <>
                {weatherData && <WeatherInfo />}
                <FlatList
                  data={availableSlots}
                  renderItem={renderSlot}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.slotList}
                  ListEmptyComponent={
                    <Text style={styles.noSlotsText}>
                      No available slots for this date.
                    </Text>
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.reserveButton,
                    (!selectedSlot || loading) && styles.disabledButton,
                  ]}
                  onPress={handleReservation}
                  disabled={!selectedSlot || loading}
                >
                  <Text style={styles.reserveButtonText}>
                    {loading ? "Sending Request..." : "Request Reservation"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
      <PreferencesModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.SECONDARY,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.SECONDARY,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
    backgroundColor: Colors.PRIMARY,
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.SECONDARY,
  },
  preferencesButton: {
    padding: responsiveWidth(2),
  },
  calendarContainer: {
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slotsContainer: {
    backgroundColor: Colors.SECONDARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: responsiveWidth(4),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subtitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "600",
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(2),
    backgroundColor: Colors.BACKGROUND,
    padding: responsiveWidth(3),
    borderRadius: 8,
  },
  weatherText: {
    fontSize: responsiveFontSize(1.8),
    marginLeft: responsiveWidth(2),
    color: Colors.PRIMARY,
  },
  slotList: {
    paddingBottom: responsiveHeight(2),
  },
  slotButton: {
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(1.5),
    borderRadius: 8,
    backgroundColor: Colors.BACKGROUND,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedSlot: {
    backgroundColor: Colors.PRIMARY,
  },
  recommendedSlot: {
    borderWidth: 2,
    borderColor: Colors.ACCENT,
  },
  slotTime: {
    fontSize: responsiveFontSize(2),
    color: Colors.DARK,
  },
  recommendedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND + "20",
    paddingHorizontal: responsiveWidth(2),
    paddingVertical: responsiveHeight(0.5),
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.PRIMARY,
    marginLeft: responsiveWidth(1),
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(4),
    borderRadius: 8,
    alignItems: "center",
    marginTop: responsiveHeight(2),
  },
  disabledButton: {
    backgroundColor: Colors.BACKGROUND,
  },
  reserveButtonText: {
    fontSize: responsiveFontSize(2.2),
    color: Colors.SECONDARY,
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 20,
    padding: responsiveWidth(5),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalText: {
    marginBottom: responsiveHeight(2),
    textAlign: "center",
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    padding: responsiveWidth(3),
    elevation: 2,
  },
  textStyle: {
    color: Colors.SECONDARY,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  preferenceTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
    alignSelf: "flex-start",
    color: Colors.PRIMARY,
  },
  preferenceOption: {
    backgroundColor: Colors.BACKGROUND,
    padding: responsiveWidth(2),
    borderRadius: 5,
    marginRight: responsiveWidth(2),
    marginBottom: responsiveHeight(1),
  },
  selectedPreferenceOption: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  preferenceOptionText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.DARK,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(4),
    borderRadius: 8,
    marginTop: responsiveHeight(3),
  },
  saveButtonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
  },
  noSlotsText: {
    textAlign: "center",
    color: Colors.PRIMARY,
    fontSize: responsiveFontSize(2),
    marginTop: responsiveHeight(2),
  },
});

export default GroundReservationScreen;
