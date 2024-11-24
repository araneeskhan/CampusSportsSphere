import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import SignIn from "./src/screens/SignIn";
import SignUp from "./src/screens/SignUp";
import HomeScreen from "./src/screens/user/HomeScreen";
import LandingPage from "./src/screens/LandingPage";
import DrawerContent from "./src/navigators/DrawerContent";
import { ThemeProvider, useTheme } from "./assets/theme/ThemeContext";
import { Colors } from "./assets/colors/Colors";
import { useFonts } from "expo-font";
import ForgotPassword from "./src/screens/ForgotPassword";
import ReserveScreen from "./src/screens/user/ReserveScreen";
import TabNavigator from "./src/navigators/TabNavigator";
import Notification from "./src/screens/user/Notification";
import StaffHome from "./src/screens/staff/StaffHome";
import EventManagerHome from "./src/screens/eventManager/EventManagerHome";
import StaffNotification from "./src/screens/staff/StaffNotification";
import CreateEventScreen from "./src/screens/eventManager/CreateEventScreen";
import EventManagerNotification from "./src/screens/eventManager/EventManagerNotification";
import SuccessfullyCreatedEvent from "./src/screens/eventManager/components/SuccessfullyCreatedEvent";
import RegisteredPlayers from "./src/screens/eventManager/RegisteredPlayers";
import TeamFormationScreen from "./src/screens/eventManager/TeamFormationScreen";
import ShowAllEvents from "./src/screens/eventManager/ShowAllEvents";
import ScheduleMatches from "./src/screens/eventManager/ScheduleMatches";
import ShowSchedule from "./src/screens/eventManager/ShowSchedule";
import ReservationsScreen from "./src/screens/staff/ReservationsScreen";
import AllReservationsRecord from "./src/screens/staff/AllReservationsRecord";
import ShowFormedTeams from "./src/screens/eventManager/ShowFormedTeams";
import GroundReservationScreen from "./src/screens/user/GroundReservationScreen";
import GroundSlots from "./src/screens/eventManager/GroundSlots";
import Requests from "./src/screens/eventManager/Request";
import ChatbotScreen from "./src/screens/user/ChatbotScreen"
import WebScrapping from "./src/screens/user/WebScrapping";
import HelpAndSupportScreen from "./src/screens/user/HelpAndSupportScreen";
import StaffSupportScreen from "./src/screens/staff/StaffSupportScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const UserStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="ReserveScreen" component={ReserveScreen} />
    <Stack.Screen name="Notification" component={Notification} />
    <Stack.Screen
      name="GroundReservationScreen"
      component={GroundReservationScreen}
    />
    <Stack.Screen name="WebScrapping" component={WebScrapping} />
    <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
    <Stack.Screen
      name="HelpAndSupportScreen"
      component={HelpAndSupportScreen}
    />
  </Stack.Navigator>
);

const StaffStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StaffHome" component={StaffHome} />
    <Stack.Screen name="StaffNotification" component={StaffNotification} />
    <Stack.Screen name="ReservationsScreen" component={ReservationsScreen} />
    <Stack.Screen
      name="AllReservationsRecord"
      component={AllReservationsRecord}
    />
    <Stack.Screen name="StaffSupportScreen" component={StaffSupportScreen} />
  </Stack.Navigator>
);

const EventManagerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EventManagerHome" component={EventManagerHome} />
    <Stack.Screen
      name="EventManagerNotification"
      component={EventManagerNotification}
    />
    <Stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
    <Stack.Screen
      name="SuccessfullyCreatedEvent"
      component={SuccessfullyCreatedEvent}
    />
    <Stack.Screen
      name="RegisteredPlayersScreen"
      component={RegisteredPlayers}
    />
    <Stack.Screen name="TeamFormationScreen" component={TeamFormationScreen} />
    <Stack.Screen name="ShowAllEvents" component={ShowAllEvents} />
    <Stack.Screen name="ScheduleMatches" component={ScheduleMatches} />
    <Stack.Screen name="ShowSchedule" component={ShowSchedule} />
    <Stack.Screen name="ShowFormedTeams" component={ShowFormedTeams} />
    <Stack.Screen name="GroundSlots" component={GroundSlots} />
    <Stack.Screen name="Requests" component={Requests} />
  </Stack.Navigator>
);

const MainDrawer = ({ route }) => {
  const { isDarkTheme } = useTheme();
  const userType = route.params?.userType || "user";

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => (
        <DrawerContent {...props} userType={userType} />
      )}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "transparent",
          width: "60%",
        },
      }}
    >
      {userType === "user" && (
        <Drawer.Screen name="Home" component={UserStack} />
      )}
      {userType === "staff" && (
        <Drawer.Screen name="Home" component={StaffStack} />
      )}
      {userType === "eventManager" && (
        <Drawer.Screen name="Home" component={EventManagerStack} />
      )}
    </Drawer.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LandingPage" component={LandingPage} />
    <Stack.Screen name="SignIn" component={SignIn} />
    <Stack.Screen name="SignUp" component={SignUp} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
  </Stack.Navigator>
);

const App = () => {
  useFonts({
    "outfit-regular": require("./assets/fonts/Outfit-Regular.ttf"),
    "outfit-medium": require("./assets/fonts/Outfit-Medium.ttf"),
    "outfit-bold": require("./assets/fonts/Outfit-Bold.ttf"),
    break: require("./assets/fonts/Break-Icognito.ttf"),
  });

  return (
    <ThemeProvider>
      <StatusBar hidden={true} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="Main" component={MainDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
