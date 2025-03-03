import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../index';
import { useTheme } from "../../../assets/theme/ThemeContext";
import { useNavigation } from '@react-navigation/native';
import StaffHeader from './StaffHeader';
import { Colors } from "../../../assets/colors/Colors";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const StaffHome = () => {
  const navigation = useNavigation();
  const { isDarkTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    thisMonthReservations: 0,
    activeReservations: 0,
    popularItems: []
  });

  useEffect(() => {
    fetchReservationStats();
  }, []);

  const fetchReservationStats = async () => {
    try {
      const reservationsRef = collection(db, "all-reservation-records");
      const now = Timestamp.now();
      
      // Get start of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

      // Fetch all reservations
      const querySnapshot = await getDocs(reservationsRef);
      const allReservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate statistics
      const totalReservations = allReservations.length;

      // Count this month's reservations
      const thisMonthReservations = allReservations.filter(reservation => 
        reservation.reservationDate >= startOfMonthTimestamp
      ).length;

      // Count active reservations (not expired)
      const activeReservations = allReservations.filter(reservation => 
        reservation.expirationTime >= now
      ).length;

      // Get popular items
      const itemCounts = allReservations.reduce((acc, reservation) => {
        acc[reservation.itemName] = (acc[reservation.itemName] || 0) + 1;
        return acc;
      }, {});

      const popularItems = Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalReservations,
        thisMonthReservations,
        activeReservations,
        popularItems
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reservation stats:", error);
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: "Current Reservations",
      icon: "calendar-outline",
      screen: "ReservationsScreen",
      color: "#4ECDC4",
    },
    {
      title: "All Reservations Record",
      icon: "document-text-outline",
      screen: "AllReservationsRecord",
      color: "#f58686",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StaffHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <StatusBar backgroundColor={Colors.PRIMARY} barStyle="light-content" />
      <StaffHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>Staff Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage your reservations efficiently and effectively
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.gradient}
              >
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={item.icon} 
                    size={40} 
                    color={Colors.WHITE}
                    style={styles.icon}
                  />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsOuterContainer}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsCardsContainer}>
            <View style={[styles.statsCard, { backgroundColor: '#4ECDC4' }]}>
              <MaterialCommunityIcons name="calendar-check" size={30} color="#fff" />
              <Text style={styles.statNumber}>{stats.totalReservations}</Text>
              <Text style={styles.statLabel}>Total Reservations</Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: '#FF6B6B' }]}>
              <MaterialCommunityIcons name="calendar-month" size={30} color="#fff" />
              <Text style={styles.statNumber}>{stats.thisMonthReservations}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: '#4A90E2' }]}>
              <MaterialCommunityIcons name="calendar-clock" size={30} color="#fff" />
              <Text style={styles.statNumber}>{stats.activeReservations}</Text>
              <Text style={styles.statLabel}>Active Now</Text>
            </View>
          </View>

          {stats.popularItems.length > 0 && (
            <View style={styles.popularItemsCard}>
              <View style={styles.popularItemsHeader}>
                <MaterialCommunityIcons name="trophy-outline" size={24} color={Colors.PRIMARY} />
                <Text style={styles.popularItemsTitle}>Most Reserved Items</Text>
              </View>
              {stats.popularItems.map((item, index) => (
                <View key={index} style={styles.popularItem}>
                  <View style={styles.popularItemLeft}>
                    <Text style={styles.popularItemRank}>{index + 1}</Text>
                    <Text style={styles.popularItemName}>{item.name}</Text>
                  </View>
                  <View style={styles.popularItemRight}>
                    <Text style={styles.popularItemCount}>{item.count}</Text>
                    <Text style={styles.popularItemLabel}>reservations</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
    padding: responsiveWidth(5),
  },
  welcomeSection: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(4),
  },
  welcomeText: {
    fontSize: responsiveFontSize(2.2),
    color: Colors.PRIMARY,
    opacity: 0.8,
  },
  title: {
    fontSize: responsiveFontSize(3.5),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(1),
  },
  subtitle: {
    fontSize: responsiveFontSize(1.8),
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(1),
    opacity: 0.8,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(4),
  },
  card: {
    width: responsiveWidth(42),
    height: responsiveHeight(20),
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(4),
  },
  iconContainer: {
    width: responsiveWidth(15),
    height: responsiveWidth(15),
    borderRadius: responsiveWidth(7.5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  icon: {
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardTitle: {
    color: Colors.WHITE,
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsOuterContainer: {
    padding: responsiveWidth(4),
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

export default StaffHome;