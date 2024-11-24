import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../assets/theme/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "../../../assets/colors/Colors";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";
import EventManagerHeader from "./components/EventManagerHeader";

const { width, height } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.65;
const ITEM_HEIGHT = height * 0.4;

const EventManagerHome = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { isDarkTheme } = useTheme();

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

  return (
    <View style={[styles.container, isDarkTheme && styles.darkContainer]}>
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      <EventManagerHeader />
      {/* <ImageBackground
        source={require("../../../assets/images/registeredplayers.png")}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.3 }}
        resizeMode="cover"
      > */}
        <Text style={[styles.headerTitle, isDarkTheme && styles.darkText]}>
        Sports Event Arena
        </Text>
        <Text
          style={[styles.headerSubtitle, isDarkTheme && styles.darkSubText]}
        >
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
      {/* </ImageBackground> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  darkContainer: {
    backgroundColor: Colors.BACKGROUND,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginTop: responsiveHeight(20),
    
  },
  headerTitle: {
    fontSize: responsiveFontSize(3),
    fontWeight: "800",
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(5),
    marginLeft:responsiveWidth(10),
    marginBottom: responsiveHeight(1),
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(2.2),
    marginLeft:responsiveWidth(10),
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
});

export default EventManagerHome;
