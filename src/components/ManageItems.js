import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../index";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Colors } from "../../assets/colors/Colors";
import { useNavigation } from '@react-navigation/native';

const ManageItems = ({ selectedCategory, searchQuery }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const db = getFirestore(app);
        const itemsSnapshot = await getDocs(collection(db, "items"));
        const filteredItems = [];

        itemsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (selectedCategory === "All" || data.category === selectedCategory) {
            filteredItems.push({ id: doc.id, ...data });
          }
        });

        setItems(filteredItems);
      } catch (error) {
        console.error("Error fetching items: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory]);

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView
      vertical
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      {filteredItems.length > 0 ? (
        filteredItems.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            {item.itemImage && (
              <Image
                source={{ uri: item.itemImage }}
                style={styles.itemImage}
              />
            )}
            <View style={styles.itemDetails}>
              {item.itemName && (
                <Text style={styles.itemName}>{item.itemName}</Text>
              )}
              {item.itemQuantity && (
                <Text style={styles.itemQuantity}>
                  Available: {item.itemQuantity}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={() => navigation.navigate('ReserveScreen', { item })}
            >
              <Text style={styles.reserveButtonText}>Reserve Now</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noItemsText}>
          No items found for this category.
        </Text>
      )}
    </ScrollView>
  );
};

export default ManageItems;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveWidth(2),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND,
    marginVertical: responsiveHeight(1),
    marginHorizontal: responsiveWidth(2),
    padding: responsiveWidth(3),
    borderRadius: 20,
  },
  itemImage: {
    width: responsiveWidth(12),
    height: responsiveHeight(6),
    borderRadius: 10,
    resizeMode: 'contain', 
  },
  itemDetails: {
    flex: 1,
    marginLeft: responsiveWidth(3),
  },
  itemName: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: "bold",
  },
  itemQuantity: {
    fontSize: responsiveFontSize(2),
    color: Colors.TEXT_SECONDARY,
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    marginTop: responsiveHeight(4),
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(4),
    borderRadius: 15,
  },
  reserveButtonText: {
    color: Colors.SECONDARY,
    textAlign: "center",
    fontSize: responsiveFontSize(2),
  },
  noItemsText: {
    textAlign: "center",
    marginTop: responsiveHeight(2),
    fontSize: responsiveFontSize(2),
    color: Colors.TEXT_SECONDARY,
  },
  loaderContainer:{
    marginTop: responsiveHeight(10)
  }
});