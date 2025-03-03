import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../assets/theme/ThemeContext";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";
import EventManagerHeader from "./components/EventManagerHeader";
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../index';

const { width, height } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.65;
const ITEM_HEIGHT = height * 0.4;

const EventManagerHome = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { isDarkTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalTeams: 0,
    popularSports: []
  });

  useEffect(() => {
    fetchEventStats();
  }, []);

  const fetchEventStats = async () => {
    try {
      // Fetch events
      const eventsRef = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsRef);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch teams
      const teamsRef = collection(db, "teams");
      const teamsSnapshot = await getDocs(teamsRef);
      const teams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate upcoming events
      const today = new Date();
      const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= today;
      }).length;

      // Calculate popular sports
      const sportCounts = events.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {});

      const popularSports = Object.entries(sportCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalEvents: events.length,
        upcomingEvents,
        totalTeams: teams.length,
        popularSports
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching event stats:", error);
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: "Create Event",
      icon: "plus-circle",
      screen: "CreateEventScreen",
      image: require("../../../assets/images/logo.png"),
      color: "#f58686",
    },
    {
      title: "Show All Events",
      icon: "calendar-alt",
      screen: "ShowAllEvents",
      image: require("../../../assets/images/logo.png"),
      color: "#4ECDC4",
    },
    {
      title: "Schedule Matches",
      icon: "clock",
      screen: "ScheduleMatches",
      image: require("../../../assets/images/logo.png"),
      color: "#36d2f5",
    },
    {
      title: "Show Registered Players",
      icon: "users",
      screen: "RegisteredPlayersScreen",
      image: require("../../../assets/images/logo.png"),
      color: "#f1fa48",
    },
    {
      title: "Auto Team Formation",
      icon: "users-cog",
      screen: "TeamFormationScreen",
      image: require("../../../assets/images/logo.png"),
      color: "#4de8c1",
    },
    {
      title: "Show Teams",
      icon: "users-cog",
      screen: "ShowFormedTeams",
      image: require("../../../assets/images/logo.png"),
      color: "#e254ff",
    },
  ];

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate(item.screen)}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.itemContainer,
            { transform: [{ scale }], opacity, backgroundColor: item.color },
          ]}
        >
          <Image source={item.image} style={styles.itemImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5
                name={item.icon}
                size={30}
                color={Colors.WHITE}
                style={styles.icon}
              />
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <EventManagerHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDarkTheme && styles.darkContainer]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      <EventManagerHeader />

      <Text style={[styles.headerTitle, isDarkTheme && styles.darkText]}>
        Sports Event Arena
      </Text>
      <Text style={[styles.headerSubtitle, isDarkTheme && styles.darkSubText]}>
        Organize and Lead Your Sports Events with Precision!
      </Text>

      <View style={styles.content}>
        <Animated.FlatList
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.statsOuterContainer}>
        <Text style={styles.statsTitle}>Event Analytics</Text>
        <View style={styles.statsCardsContainer}>
          <View style={[styles.statsCard, { backgroundColor: '#4ECDC4' }]}>
            <MaterialCommunityIcons name="calendar-multiple" size={30} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalEvents}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          
          <View style={[styles.statsCard, { backgroundColor: '#FF6B6B' }]}>
            <MaterialCommunityIcons name="calendar-clock" size={30} color="#fff" />
            <Text style={styles.statNumber}>{stats.upcomingEvents}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={[styles.statsCard, { backgroundColor: '#4A90E2' }]}>
            <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalTeams}</Text>
            <Text style={styles.statLabel}>Teams Formed</Text>
          </View>
        </View>

        {stats.popularSports.length > 0 && (
          <View style={styles.popularItemsCard}>
            <View style={styles.popularItemsHeader}>
              <MaterialCommunityIcons name="trophy-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.popularItemsTitle}>Popular Sports</Text>
            </View>
            {stats.popularSports.map((sport, index) => (
              <View key={index} style={styles.popularItem}>
                <View style={styles.popularItemLeft}>
                  <Text style={styles.popularItemRank}>{index + 1}</Text>
                  <Text style={styles.popularItemName}>{sport.name}</Text>
                </View>
                <View style={styles.popularItemRight}>
                  <Text style={styles.popularItemCount}>{sport.count}</Text>
                  <Text style={styles.popularItemLabel}>events</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  darkContainer: {
    backgroundColor: Colors.DARK_BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginTop: responsiveHeight(2),
  },
  headerTitle: {
    fontSize: responsiveFontSize(3),
    fontWeight: "800",
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(5),
    marginLeft: responsiveWidth(10),
    marginBottom: responsiveHeight(1),
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(2.2),
    marginLeft: responsiveWidth(10),
    color: Colors.SECONDARY,
    opacity: 0.8,
    marginBottom: responsiveHeight(3),
  },
  darkText: {
    color: Colors.PRIMARY,
  },
  darkSubText: {
    color: Colors.PRIMARY,
  },
  flatListContent: {
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(5),
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 50,
    overflow: "hidden",
    marginHorizontal: responsiveWidth(2),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 35,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.7,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: responsiveHeight(3),
  },
  iconContainer: {
    width: responsiveWidth(15),
    height: responsiveWidth(15),
    borderRadius: responsiveWidth(7.5),
    backgroundColor: "rgba(255,255,255,0.3)",
    color: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(1.5),
  },
  icon: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  itemTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
    color: Colors.SECONDARY,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  // New styles for stats section
  statsOuterContainer: {
    padding: responsiveWidth(4),
    marginTop: responsiveHeight(2),
  },
  statsTitle: {
    fontSize: responsiveFontSize(2.4),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: responsiveHeight(2),
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: responsiveHeight(3),
  },
  statsCard: {
    width: '31%',
    padding: responsiveWidth(3),
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: responsiveHeight(12),
  },
  statNumber: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: responsiveHeight(1),
  },
  statLabel: {
    fontSize: responsiveFontSize(1.4),
    color: '#fff',
    textAlign: 'center',
  },
  popularItemsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: responsiveWidth(4),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: responsiveHeight(2),
  },
  popularItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveHeight(2),
  },
  popularItemsTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginLeft: responsiveWidth(2),
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  popularItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularItemRank: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    width: responsiveWidth(8),
  },
  popularItemName: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
  },
  popularItemRight: {
    alignItems: 'flex-end',
  },
  popularItemCount: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  popularItemLabel: {
    fontSize: responsiveFontSize(1.4),
    color: Colors.SECONDARY,
  },
});

export default EventManagerHome;