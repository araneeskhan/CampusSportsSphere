import { StyleSheet, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import HomeScreen from "../screens/user/HomeScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import { Colors } from "../../assets/colors/Colors";
import { useTheme } from "../../assets/theme/ThemeContext";
import EventScreen from "../screens/user/EventScreen";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { isDarkTheme } = useTheme();
  const navigation = useNavigation();

  const styles = getStyles(isDarkTheme);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBarStyle,
        }}
      >
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Entypo
                name="home"
                size={focused ? 36 : 28}
                color={focused ? Colors.SECONDARY : "black"}
              />
            ),
          }}
        />

        <Tab.Screen
          name="EventScreen"
          component={EventScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="event"
                size={focused ? 36 : 28}
                color={focused ? Colors.SECONDARY : "black"}
              />
            ),
          }}
        />

        <Tab.Screen
          name="profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <FontAwesome
                name="user"
                size={focused ? 36 : 28}
                color={focused ? "#ffffff" : "black"}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: "profile" }],
              });
            },
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default TabNavigator;

const getStyles = (isDarkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.SECONDARY,
    },
    tabBarStyle: {
      height: 80,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 20,
      backgroundColor: Colors.PRIMARY,
      borderTopWidth: 0,
      elevation: 0,
    },
  });
