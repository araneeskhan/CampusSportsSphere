import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../assets/colors/Colors";

const Categories = ({ selectedCategory, setSelectedCategory, categories }) => {
  const categoryImages = {
    Cricket: require("../../assets/images/categories/cricket.png"),
    Football: require("../../assets/images/categories/football.png"),
    Tennis: require("../../assets/images/categories/tennis.png"),
    TableTennis: require("../../assets/images/categories/tabletennis.png"),
    Badminton: require("../../assets/images/categories/badminton.png"),
    Volleyball: require("../../assets/images/categories/volleyball.png"),
    BasketBall: require("../../assets/images/categories/basketball.png"),
    All: require("../../assets/images/categories/all.png"),
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {categories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.categoryContainer,
            selectedCategory === category && { borderColor: Colors.PRIMARY, borderWidth: 1 },
          ]}
          onPress={() => setSelectedCategory(category)}
          accessibilityLabel={`Select ${category} category`}
        >
          <Image
            source={categoryImages[category] || categoryImages.Default}
            style={styles.images}
          />
          <Text style={styles.categoryText}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
 
    paddingHorizontal: responsiveWidth(3),
  },
  categoryContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BACKGROUND,
    width: responsiveWidth(23),
    height: responsiveHeight(13),
    marginHorizontal: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(0.5),
    borderRadius: 20,
  },
  images: {
    width: responsiveWidth(15),
    height: responsiveHeight(7),
    marginVertical: responsiveHeight(1),
  },
  categoryText: {
    fontSize: responsiveFontSize(2),
    marginHorizontal: responsiveWidth(1),
    textAlign: "center",
  },
});

export default Categories;