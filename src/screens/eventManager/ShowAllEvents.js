import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../index';
import { Colors } from '../../../assets/colors/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ShowAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'));
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', eventId));
              setEvents(events.filter(event => event.id !== eventId));
              Alert.alert("Success", "Event has been deleted.");
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert("Error", "Failed to delete event. Please try again.");
            }
          }
        }
      ]
    );
  };

  const editEvent = (event) => {
    navigation.navigate('CreateEventScreen', { event });
  };

  const renderEventItem = ({ item }) => {
    const eventDate = new Date(item.eventDate);
    return (
      <View style={styles.eventItem}>
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : require("../../../assets/images/placeholderImage.jpg")}
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
            <Text style={styles.eventTime}>{item.eventTime}</Text>
            <Text style={styles.eventCategory}>{item.category}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => editEvent(item)} style={styles.actionButton}>
              <Feather name="edit" size={24} color={Colors.SECONDARY} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteEvent(item.id)} style={styles.actionButton}>
              <Feather name="trash-2" size={24} color={Colors.SECONDARY} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.headerText}>All Events</Text>
      </View>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: responsiveWidth(2),
  },
  headerText: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
  },
  listContainer: {
    padding: responsiveWidth(4),
  },
  eventItem: {
    height: responsiveHeight(15),
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  dateBox: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(2),
    justifyContent: 'center',
    alignItems: 'center',
    width: responsiveWidth(15),
  },
  dateText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.5),
  },
  dateNumber: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },
  eventDetails: {
    flex: 1,
    padding: responsiveWidth(2),
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    marginBottom: responsiveHeight(0.5),
  },
  eventTime: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.SECONDARY,
    marginBottom: responsiveHeight(0.5),
  },
  eventCategory: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.SECONDARY,
  },
  actionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: responsiveWidth(2),
  },
  actionButton: {
    padding: responsiveWidth(2),
  },
});

export default ShowAllEvents;