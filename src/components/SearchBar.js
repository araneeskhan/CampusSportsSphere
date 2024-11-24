import React from "react";
import { View, SafeAreaView, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../assets/theme/ThemeContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../assets/colors/Colors";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  const { isDarkTheme } = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputSearch}>
        <TextInput
          placeholder="Search Equipment"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.input}
          placeholderTextColor={"gray"}
        />
        <TouchableOpacity>
          <FontAwesome
            name="search"
            size={21}
            color={isDarkTheme ? Colors.PRIMARY : Colors.SECONDARY}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: responsiveHeight(2),
  },
  inputSearch: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.PRIMARY,
    height: responsiveHeight(6),
    width: responsiveWidth(85),
    borderRadius: 15,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(5),
    fontSize: responsiveFontSize(2),
  },
  input: {
    fontSize: responsiveFontSize(1.8),
    flex: 1,
  },
});