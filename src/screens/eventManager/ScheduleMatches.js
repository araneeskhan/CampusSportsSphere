import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "../../../assets/colors/Colors";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../index";
import { useNavigation } from "@react-navigation/native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";

const ScheduleMatches = () => {
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchEventsAndTeams();
  }, []);

  const fetchEventsAndTeams = async () => {
    setLoading(true);
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);

      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teamsData = {};
      teamsSnapshot.forEach((doc) => {
        const team = doc.data();
        if (!teamsData[team.sport]) {
          teamsData[team.sport] = [];
        }
        teamsData[team.sport].push({ id: doc.id, ...team });
      });
      setTeams(teamsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to fetch data");
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    if (!selectedEvent) {
      Alert.alert("Error", "Please select an event");
      return;
    }

    const event = events.find((e) => e.id === selectedEvent);
    const sportTeams = teams[event.category];

    if (!sportTeams || sportTeams.length < 2) {
      Alert.alert(
        "Error",
        "Not enough teams in this category to generate a schedule"
      );
      return;
    }

    const eventDate = new Date(event.eventDate);
    const matchStartDate = new Date(
      eventDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const newSchedule = generateSportSchedule(
      event.category,
      sportTeams,
      matchStartDate
    );

    try {
      for (const match of newSchedule) {
        await addDoc(collection(db, "matches"), match);
      }
      Alert.alert("Success", "Match schedule generated and saved successfully");
      navigation.navigate("ShowSchedule", { eventId: selectedEvent });
    } catch (error) {
      console.error("Error saving schedule:", error);
      Alert.alert("Error", "Failed to save match schedule");
    }
  };

  const generateSportSchedule = (sport, sportTeams, startDate) => {
    const schedule = [];
    const usedTimes = new Set();
    let currentDate = new Date(startDate);

    for (let i = 0; i < sportTeams.length; i++) {
      for (let j = i + 1; j < sportTeams.length; j++) {
        const matchTime = generateMatchTime(sport, usedTimes);
        usedTimes.add(matchTime.start);

        if (usedTimes.size >= 5) {
          currentDate.setDate(currentDate.getDate() + 1);
          usedTimes.clear();
        }

        schedule.push({
          sport,
          teamAId: sportTeams[i].id,
          teamBId: sportTeams[j].id,
          teamAName: sportTeams[i].teamName,
          teamBName: sportTeams[j].teamName,
          matchNumber: schedule.length + 1,
          date: currentDate.toISOString(),
          startTime: matchTime.start,
          endTime: matchTime.end,
          status: "Scheduled",
          eventId: selectedEvent,
        });
      }
    }
    return schedule;
  };

  const generateMatchTime = (sport, usedTimes) => {
    const sportDurations = {
      Cricket: 200,
      Football: 90,
      Basketball: 50,
      Tennis: 120,
      TableTennis: 40,
      Volleyball: 90,
    };

    const duration = sportDurations[sport] || 60;
    let startTime, endTime;

    do {
      const hour = 8 + Math.floor(Math.random() * 7);
      const minute = 30 * Math.floor(Math.random() * 2);
      startTime = new Date(2023, 0, 1, hour, minute);
      endTime = new Date(startTime.getTime() + duration * 60000);
    } while (
      usedTimes.has(startTime.toTimeString().slice(0, 5)) ||
      endTime.getHours() >= 17
    );

    return {
      start: startTime.toTimeString().slice(0, 5),
      end: endTime.toTimeString().slice(0, 5),
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.PRIMARY, Colors.SECONDARY]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Image
            source={require("../../../assets/images/eventmanagerlogo.png")}
            style={styles.pageImage}
           
          />
        </View>
        <Text style={styles.headerTitle}>Schedule Matches</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedEvent}
            onValueChange={(itemValue) => setSelectedEvent(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select an event" value="" />
            {events.map((event) => (
              <Picker.Item
                key={event.id}
                label={event.title}
                value={event.id}
              />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.button} onPress={generateSchedule}>
          <Text style={styles.buttonText}>Generate Match Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.viewButton]}
          onPress={() => navigation.navigate("ShowSchedule")}
        >
          <Text style={styles.buttonText}>View Existing Schedules</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: responsiveHeight(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pageImage: {
    height: responsiveHeight(40),
    width: responsiveWidth(80), 
    resizeMode:"contain"
  },
  headerTitle: {
    color: Colors.PRIMARY,
    fontSize: responsiveFontSize(3.5),
    fontWeight: "bold",
    marginBottom: responsiveHeight(5),
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 10,
    width: "80%",
    marginBottom: responsiveHeight(3),
    overflow: "hidden",
  },
  picker: {
    height: responsiveHeight(6),
    width: "100%",
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
    borderRadius: 25,
    marginBottom: responsiveHeight(2),
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewButton: {
    backgroundColor: Colors.PRIMARY,
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
  },
});

export default ScheduleMatches;
