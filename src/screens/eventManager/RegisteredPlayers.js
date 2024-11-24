import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import {
  collection,
  query,
  getDocs,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../../index';
import { Colors } from '../../../assets/colors/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const RegisteredPlayers = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'));
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const fetchRegisteredPlayers = async (eventId) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'registeredUsers'),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      const playerList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playerList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registered players:', error);
      setLoading(false);
    }
  };

  const deletePlayer = async (player) => {
    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${player.fullName} from this event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'registeredUsers', player.id));
              setPlayers(players.filter((p) => p.id !== player.id));
              Alert.alert('Success', 'Player has been removed from the event.');
            } catch (error) {
              console.error('Error deleting player:', error);
              Alert.alert(
                'Error',
                'Failed to remove player. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const renderEventItem = ({ item }) => {
    const eventDate = new Date(item.eventDate);
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => {
          setSelectedEvent(item);
          fetchRegisteredPlayers(item.id);
        }}
      >
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : require('../../../assets/images/placeholderImage.jpg')}
          style={styles.eventImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.eventGradient}
        >
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>
              {eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderPlayerItem = ({ item }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <View style={styles.playerIconContainer}>
          <Text style={styles.playerInitials}>
            {item.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.playerTextContainer}>
          <Text style={styles.playerName}>{item.fullName}</Text>
          <Text style={styles.playerRegNo}>Reg No: {item.regNo}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => deletePlayer(item)}
        style={styles.deleteButton}
      >
        <Feather name="trash-2" size={24} color={Colors.DANGER} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (selectedEvent) {
              setSelectedEvent(null);
              setPlayers([]);
            } else {
              navigation.goBack();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {selectedEvent ? 'Registered Players' : 'Select Event'}
        </Text>
      </View>
      <View style={styles.content}>
        {!selectedEvent ? (
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <>
            <Text style={styles.subHeaderText}>{selectedEvent.title}</Text>
            {players.length > 0 ? (
              <FlatList
                data={players}
                renderItem={renderPlayerItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.noPlayersContainer}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={50}
                  color={Colors.PRIMARY}
                />
                <Text style={styles.noPlayersText}>
                  No players registered for this event yet.
                </Text>
              </View>
            )}
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: responsiveWidth(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: responsiveWidth(4),
  },
  subHeaderText: {
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(2.2),
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(2),
  },
  listContainer: {
    marginTop:responsiveHeight(2),
    paddingBottom: responsiveHeight(4),
  },
  eventCard: {
    height: responsiveHeight(20),
    marginBottom: responsiveHeight(2),
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: responsiveWidth(4),
  },
  eventDetails: {
    justifyContent: 'flex-end',
  },
  eventTitle: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    marginBottom: responsiveHeight(0.5),
  },
  eventDate: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.SECONDARY,
    opacity: 0.8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
    marginBottom: responsiveHeight(1.5),
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: responsiveWidth(3),
  },
  playerIconContainer: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(3),
  },
  playerInitials: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },
  playerTextContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(0.5),
  },
  playerRegNo: {
    fontSize: responsiveFontSize(1.6),
    color: Colors.PRIMARY,
    opacity: 0.7,
  },
  deleteButton: {
    padding: responsiveWidth(3),
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  noPlayersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPlayersText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    textAlign: 'center',
    marginTop: responsiveHeight(2),
  },
});

export default RegisteredPlayers;