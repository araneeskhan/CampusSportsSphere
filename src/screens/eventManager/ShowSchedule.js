import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import { Colors } from "../../../assets/colors/Colors";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../index";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const ShowSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState("start");
  const [filterSport, setFilterSport] = useState("");
  const [expandedMatch, setExpandedMatch] = useState(null);

  const sportsList = [
    "Football",
    "Basketball",
    "Cricket",
    "Tennis",
    "Table Tennis",
    "Volleyball",
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchTeamPlayers = async (teamId) => {
    try {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (teamDoc.exists()) {
        return teamDoc.data().players || [];
      }
    } catch (error) {
      console.error("Error fetching team players:", error);
      return [];
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const matchesSnapshot = await getDocs(collection(db, "matches"));
      const matchesData = await Promise.all(
        matchesSnapshot.docs.map(async (doc) => {
          const match = doc.data();
          const teamAPlayers = await fetchTeamPlayers(match.teamAId);
          const teamBPlayers = await fetchTeamPlayers(match.teamBId);
          return { id: doc.id, ...match, teamAPlayers, teamBPlayers };
        })
      );
      setSchedule(matchesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      Alert.alert("Error", "Failed to fetch schedule");
      setLoading(false);
    }
  };

  const deleteMatch = async (matchId) => {
    try {
      await deleteDoc(doc(db, "matches", matchId));
      Alert.alert("Success", "Match deleted successfully");
      fetchSchedule();
    } catch (error) {
      console.error("Error deleting match:", error);
      Alert.alert("Error", "Failed to delete match");
    }
  };

  const openEditModal = (match) => {
    setEditingMatch(match);
    setEditDate(new Date(match.date));
    setEditStartTime(match.startTime);
    setEditEndTime(match.endTime);
    setEditModalVisible(true);
  };

  const saveEditedMatch = async () => {
    try {
      await updateDoc(doc(db, "matches", editingMatch.id), {
        date: editDate.toISOString(),
        startTime: editStartTime,
        endTime: editEndTime,
      });
      Alert.alert("Success", "Match updated successfully");
      setEditModalVisible(false);
      fetchSchedule();
    } catch (error) {
      console.error("Error updating match:", error);
      Alert.alert("Error", "Failed to update match");
    }
  };

  const handleFilter = (category) => {
    setFilterSport(category);
    setExpandedMatch(null);
  };

  const toggleExpandMatch = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleExpandMatch(item.id)}>
      <View style={styles.matchItem}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchSport}>{item.sport}</Text>
          <Text style={styles.matchDate}>
            {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.teamMatchContainer}>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{item.teamAName}</Text>
          </View>
          <View style={styles.vsContainer}>
            <Ionicons
              name="football-outline"
              size={20}
              color={Colors.ACCENT}
              style={styles.vsIcon}
            />
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{item.teamBName}</Text>
          </View>
        </View>
        <View style={styles.matchFooter}>
          <Text style={styles.matchTime}>
            Time: {item.startTime} - {item.endTime}
          </Text>
        </View>
        {expandedMatch === item.id && (
          <View style={styles.expandedContent}>
            <View style={styles.teamPlayersContainer}>
              <View style={styles.teamColumn}>
                <Text style={styles.teamPlayersHeader}>{item.teamAName} Players:</Text>
                {item.teamAPlayers &&
                  item.teamAPlayers.map((player, index) => (
                    <Text key={index} style={styles.playerName}>
                      {player.fullName}
                    </Text>
                  ))}
              </View>
              <View style={styles.teamColumn}>
                <Text style={styles.teamPlayersHeader}>{item.teamBName} Players:</Text>
                {item.teamBPlayers &&
                  item.teamBPlayers.map((player, index) => (
                    <Text key={index} style={styles.playerName}>
                      {player.fullName}
                    </Text>
                  ))}
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="create-outline" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteMatch(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal visible={editModalVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Match Details</Text>
          <Text style={styles.timePickerSeparator}>Select New Date</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {editDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <View style={styles.timePickerContainer}>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => {
                setTimePickerMode("start");
                setShowTimePicker(true);
              }}
            >
              
              <Text style={styles.timePickerButtonText}>{editStartTime}</Text>
            </TouchableOpacity>
            <Text style={styles.timePickerSeparator}>to</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => {
                setTimePickerMode("end");
                setShowTimePicker(true);
              }}
            >
              <Text style={styles.timePickerButtonText}>{editEndTime}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={editDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setEditDate(selectedDate);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={
                new Date(
                  `2000-01-01T${
                    timePickerMode === "start" ? editStartTime : editEndTime
                  }:00`
                )
              }
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const timeString = selectedTime.toTimeString().slice(0, 5);
                  if (timePickerMode === "start") {
                    setEditStartTime(timeString);
                  } else {
                    setEditEndTime(timeString);
                  }
                }
              }}
            />
          )}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveEditedMatch}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Match Schedule</Text>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !filterSport && styles.filterButtonActive,
          ]}
          onPress={() => handleFilter("")}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        {sportsList.map((sport) => (
          <TouchableOpacity
            key={sport}
            style={[
              styles.filterButton,
              filterSport === sport && styles.filterButtonActive,
            ]}
            onPress={() => handleFilter(sport)}
          >
            <Text style={styles.filterButtonText}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={
            filterSport
              ? schedule.filter((item) => item.sport === filterSport)
              : schedule
          }
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  headerContainer: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  headerTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    color: Colors.SECONDARY,
    textAlign: "center",
  },
  filterContainer: {
    display:"flex",
    flexDirection: "row",
    justifyContent:"center",
    alignItems:"center",
    flexWrap: "wrap",
    padding: responsiveWidth(2),
    backgroundColor: Colors.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: Colors.PRIMARY,
  },
  filterButton: {

    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
    margin: responsiveWidth(1),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  filterButtonActive: {
    backgroundColor: Colors.PRIMARY,
  },
  filterButtonText: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: responsiveWidth(2),
  },
 
  matchItem: {
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(14),
  },
  matchSport: {
    fontSize: responsiveFontSize(2),
    color: Colors.SECONDARY,
    fontWeight: 'bold',
  },
  matchDate: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.SECONDARY,
  },
  teamMatchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: responsiveFontSize(2.2),
    color: "#ac7e00",
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: responsiveWidth(2),
  },
  vsIcon: {
    color: "red",
    marginBottom: responsiveHeight(0.5),
  },
  vsText: {
    fontSize: responsiveFontSize(1.6),
    color: "red",
    fontWeight: 'bold',
  },
  matchFooter: {
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
  },
  matchTime: {
    fontSize: responsiveFontSize(2),
    fontWeight:"bold",
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  expandedContent: {
    padding: responsiveWidth(4),
  },
  teamPlayersContainer: {
    display:"flex",
    flexDirection: 'row',
    alignItems:"center",
    justifyContent: 'center',
  },
  teamColumn: {
    flex: 1,
    display:"flex",
    flexDirection: 'coloumn',
    alignItems:"center",
    justifyContent: 'center',
  },
  teamPlayersHeader: {
    backgroundColor:Colors.SECONDARY,
    borderRadius:10,
    paddingHorizontal:responsiveWidth(3),
    fontSize: responsiveFontSize(2),
    color: Colors.TEXT,
    fontWeight: 'bold',
    marginBottom: responsiveHeight(1),
  },
  playerName: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(0.5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: responsiveHeight(2),
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "green",
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 5,
    marginRight: responsiveWidth(2),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.DANGER,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(3),
    borderRadius: 5,
  },
  buttonText: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.SECONDARY,
    marginLeft: responsiveWidth(1),
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
  },
  modalContent: {
    backgroundColor: Colors.SECONDARY,
    borderRadius: 15,
    padding: responsiveWidth(5),
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    marginBottom: responsiveHeight(5),
    textAlign: "center",
  },
  datePickerButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(3),
    borderRadius: 5,
    marginBottom: responsiveHeight(2),
  },
  datePickerButtonText: {
    fontSize: responsiveFontSize(2),
    textAlign:"center",
    color: Colors.SECONDARY,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(2),

  },
  timePickerButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(3),
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  timePickerButtonText: {
    fontSize: responsiveFontSize(2),
    color: Colors.SECONDARY,
  },
  timePickerSeparator: {
    fontSize: responsiveFontSize(2),
    alignSelf: "center",
    color: Colors.PRIMARY,
    marginHorizontal:responsiveWidth(2),
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: Colors.DANGER,
    padding: responsiveWidth(3),
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: responsiveWidth(1),
  },
  saveButton: {
    backgroundColor: "green",
  },

  modalButtonText: {
    fontSize: responsiveFontSize(2),
    color: Colors.SECONDARY,
  },
});

export default ShowSchedule;
