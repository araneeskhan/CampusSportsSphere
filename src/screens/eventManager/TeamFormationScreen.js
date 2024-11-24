import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Animated,
} from "react-native";
import {
  collection,
  query,
  getDocs,
  where,
  setDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "../../../index";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";

const Colors = {
  PRIMARY: "#235264",
  SECONDARY: "#FFC107",
  BACKGROUND: "#F5F5F5",
  TEXT: "#333333",
  CARD: "#FFFFFF",
  ACCENT: "#FF4081",
};

const TeamFormationScreen = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "events"), limit(10));
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedEvent]);

  const fetchRegisteredPlayers = useCallback(async (eventId, sportCategory) => {
    setLoadingPlayers(true);
    setError(null);
    try {
      const q = query(
        collection(db, "registeredUsers"),
        where("eventId", "==", eventId),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const playerList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playerList);
    } catch (err) {
      console.error("Error fetching players:", err);
      setError("Failed to load players. Please try again.");
    } finally {
      setLoadingPlayers(false);
    }
  }, []);

  const formTeams = useCallback(async () => {
    if (!selectedEvent || players.length === 0) return;

    const teamSize = getTeamSize(selectedEvent.category);
    if (teamSize === 0) {
      Alert.alert("Error", "Invalid team size for this sport category.");
      return;
    }

    const numberOfCompleteTeams = Math.floor(players.length / teamSize);
    const teams = [];

    for (let i = 0; i < numberOfCompleteTeams; i++) {
      const startIndex = i * teamSize;
      const team = players.slice(startIndex, startIndex + teamSize);
      teams.push(team);
    }

    try {
      for (let index = 0; index < teams.length; index++) {
        const teamName = `${selectedEvent.category}Team-${(index + 1)
          .toString()
          .padStart(2, "0")}`;
        await setDoc(doc(db, "teams", `${selectedEvent.id}_${teamName}`), {
          eventId: selectedEvent.id,
          sport: selectedEvent.category,
          teamName: teamName,
          players: teams[index].map((player) => ({
            id: player.id,
            fullName: player.fullName,
            regNo: player.regNo,
          })),
          createdAt: new Date(),
        });
      }

      const remainingPlayers = players.length % teamSize;
      if (remainingPlayers > 0) {
        Alert.alert(
          "Teams Formed",
          `${teams.length} team(s) formed successfully. ${remainingPlayers} player(s) could not be assigned to a team due to insufficient numbers.`
        );
      } else {
        Alert.alert(
          "Success",
          `${teams.length} team(s) have been formed and saved successfully!`
        );
      }
    } catch (err) {
      console.error("Error forming teams:", err);
      Alert.alert("Error", "Failed to form teams. Please try again.");
    }
  }, [selectedEvent, players]);

  const getTeamSize = (sportCategory) => {
    const teamSizes = {
      Basketball: 5,
      Cricket: 11,
      Football: 11,
      "Badminton Singles": 1,
      "Badminton Doubles": 2,
      "Table Tennis Singles": 1,
      "Table Tennis Doubles": 2,
      Volleyball: 6,
      "Tennis Singles": 1,
      "Tennis Doubles": 2,
    };
    return teamSizes[sportCategory] || 0;
  };

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        selectedEvent &&
          selectedEvent.id === item.id &&
          styles.selectedEventCard,
      ]}
      onPress={() => {
        setSelectedEvent(item);
        fetchRegisteredPlayers(item.id, item.category);
      }}
    >
      <LinearGradient
        colors={[Colors.PRIMARY, Colors.ACCENT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.eventCardGradient}
      >
        <FontAwesome5 name="trophy" size={24} color={Colors.SECONDARY} />
        <Text style={styles.eventCardTitle}>{item.title}</Text>
        {/* <Text style={styles.eventCardCategory}>{item.category}</Text> */}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPlayerCard = ({ item, index }) => (
    <Animated.View
      style={[
        styles.playerCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.playerCardContent}>
        <FontAwesome5 name="user-circle" size={40} color={Colors.PRIMARY} />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.fullName}</Text>
          <Text style={styles.playerRegNo}>{item.regNo}</Text>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerView}>
          <Text style={styles.headerText}>Team Formation</Text>
        </View>
        <View style={styles.eventSelectorContainer}>
          <Text style={styles.subHeaderText}>Select an Event</Text>
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventList}
          />
        </View>
        {selectedEvent && (
          <View style={styles.playersContainer}>
            <Text style={styles.teamHeaderText}>
              Players Registered for {selectedEvent.title}
            </Text>
            {loadingPlayers ? (
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            ) : (
              <FlatList
                data={players}
                renderItem={renderPlayerCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.playerList}
                showsVerticalScrollIndicator={false}
              />
            )}
            <TouchableOpacity
              style={styles.formTeamsButton}
              onPress={formTeams}
            >
              <LinearGradient
                colors={[Colors.PRIMARY, Colors.ACCENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formTeamsButtonGradient}
              >
                <Text style={styles.formTeamsButtonText}>Form Teams</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  },
  headerView: {
    width: "100%",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(1),
    marginBottom: responsiveHeight(3),
  },
  headerText: {
    fontSize: responsiveFontSize(3),
    color: "white",
    fontWeight: "bold",
    paddingHorizontal: responsiveWidth(10),
    paddingVertical: responsiveHeight(1),
    textAlign: "center",
  },
  eventSelectorContainer: {
    marginBottom: responsiveHeight(3),
  },
  subHeaderText: {
    fontSize: responsiveFontSize(2.5),
    color: Colors.TEXT,
    textAlign: "center",
    marginBottom: responsiveHeight(2),
    fontWeight: "600",
  },
  eventList: {
    paddingBottom: responsiveHeight(2),
    marginHorizontal: responsiveWidth(4),
  },
  eventCard: {
    width: responsiveWidth(40),
    marginRight: responsiveWidth(3),
    borderRadius: 18,
    overflow: "hidden",
    elevation: 3,
  },
  selectedEventCard: {
    borderWidth: 2,
    borderColor: Colors.ACCENT,
  },
  eventCardGradient: {
    padding: responsiveWidth(4),
    alignItems: "center",
    justifyContent: "center",
    height: responsiveHeight(15),
  },
  eventCardTitle: {
    fontSize: responsiveFontSize(2),
    color: Colors.CARD,
    fontWeight: "bold",
    marginTop: responsiveHeight(1),
    textAlign: "center",
  },
  eventCardCategory: {
    fontSize: responsiveFontSize(1.5),
    color: Colors.CARD,
    marginTop: responsiveHeight(0.5),
  },
  playersContainer: {
    flex: 1,
    backgroundColor: Colors.CARD,
    borderRadius: 16,
    padding: responsiveWidth(4),
    elevation: 3,
  },
  teamHeaderText: {
    fontSize: responsiveFontSize(2.2),
    textAlign: "center",
    color: Colors.PRIMARY,
    fontWeight: "bold",
    marginBottom: responsiveHeight(2),
  },
  playerList: {
    paddingBottom: responsiveHeight(2),
  },
  playerCard: {
    flex: 1,
    margin: responsiveWidth(1),
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.BACKGROUND,
    elevation: 2,
  },
  playerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveWidth(3),
  },
  playerInfo: {
    marginLeft: responsiveWidth(3),
    flex: 1,
  },
  playerName: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.TEXT,
    fontWeight: "bold",
  },
  playerRegNo: {
    fontSize: responsiveFontSize(1.5),
    color: Colors.TEXT,
    opacity: 0.8,
  },
  formTeamsButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: responsiveHeight(3),
  },
  formTeamsButtonGradient: {
    padding: responsiveWidth(4),
    alignItems: "center",
  },
  formTeamsButtonText: {
    color: Colors.CARD,
    fontSize: responsiveFontSize(2),
    fontWeight: "600",
  },
});

export default TeamFormationScreen;
