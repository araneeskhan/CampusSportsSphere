import React, { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../assets/theme/ThemeContext";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import Categories from "../../components/Categories";
import ManageItems from "../../components/ManageItems";
import RecommendationPopup from "../../components/RecommendationPopup";
import { Colors } from "../../../assets/colors/Colors";

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [hasShownPopup, setHasShownPopup] = useState(false);

  const { isDarkTheme } = useTheme();
  
  const categories = ['All', 'Cricket', 'Football', 'Tennis', 'TableTennis', 'Badminton', 'Volleyball', 'BasketBall'];

  useEffect(() => {
    const checkPopupStatus = async () => {
      try {
        const popupShown = await AsyncStorage.getItem('@popup_shown');
        if (popupShown !== 'true') {
          setHasShownPopup(false);
          await AsyncStorage.setItem('@popup_shown', 'true');
        } else {
          setHasShownPopup(true);
        }
      } catch (e) {
        console.error('Failed to load popup status:', e);
      }
    };
  
    checkPopupStatus();
  }, []);


  return (
    <View style={styles.container(isDarkTheme)}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Header />
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.projectName}>Campus Sports Sphere</Text>
            <Text style={styles.welcomeText}>
              Reserve Your Equipment with Ease
            </Text>
          </View>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <View>
            <Text style={styles.CategoriesText}>Categories</Text>
            <Categories 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory} 
              categories={categories}
            />
          </View>
          <Text style={styles.CategoriesText}>Equipments</Text>
          <ManageItems selectedCategory={selectedCategory} searchQuery={searchQuery} />
        </ScrollView>
      </SafeAreaView>

      {!hasShownPopup && <RecommendationPopup onClose={() => setHasShownPopup(true)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: (isDarkTheme) => ({
    flex: 1,
    backgroundColor: Colors.SECONDARY,
  }),
  safeArea: {
    flex: 1,
  },
  welcomeText: {
    marginTop: responsiveHeight(3.5),
    fontSize: responsiveFontSize(2),
    opacity: 0.7,
    fontFamily: "outfit-medium",
    marginLeft: responsiveWidth(10),
  },
  projectName: {
    fontSize: responsiveFontSize(3),
    fontFamily: "outfit-bold",
    marginLeft: responsiveWidth(10),
  },
  CategoriesText: {
    fontSize: responsiveFontSize(2),
    fontFamily: "outfit-bold",
    marginTop: responsiveHeight(2),
    marginLeft: responsiveWidth(5),
  },
});

export default HomeScreen;
