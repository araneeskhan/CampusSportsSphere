import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Linking,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Colors } from "../../../assets/colors/Colors";

const WebScrapping = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://10.113.76.183:5000/scrape");
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const handlePress = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  const renderDescription = (description) => {
    return description.map((para, index) => {
      if (para.startsWith("**") && para.endsWith("**")) {
        return (
          <Text key={index} style={styles.sectionTitle}>
            {para.replace(/\*\*/g, "")}
          </Text>
        );
      } else if (para.startsWith("*")) {
        return (
          <Text key={index} style={styles.listItem}>
            {para}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.paragraph}>
            {para.split(/\s+/).map((word, wordIndex) => {
              if (word.startsWith("http://") || word.startsWith("https://")) {
                return (
                  <TouchableOpacity
                    key={wordIndex}
                    onPress={() => handlePress(word)}
                  >
                    <Text style={styles.link}>{word}</Text>
                  </TouchableOpacity>
                );
              } else if (word.includes("@") && word.includes(".")) {
                return (
                  <TouchableOpacity
                    key={wordIndex}
                    onPress={() => handlePress(`mailto:${word}`)}
                  >
                    <Text style={styles.link}>{word}</Text>
                  </TouchableOpacity>
                );
              }
              return `${word} `;
            })}
          </Text>
        );
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
        </View>

        <View style={styles.content}>
          {renderDescription(data.description)}
        </View>

        <Section title="Sports Table">
          <View style={styles.table}>
            <TableHeader />
            {data.sports_table.map((sport, index) => (
              <TableRow key={index} sport={sport} />
            ))}
          </View>
        </Section>

        {data.contact_details && data.contact_details.length > 0 && (
          <Section title="Contact Details">
            {data.contact_details.map((contact, index) => (
              <Text key={index} style={styles.contactDetail}>
                {contact}
              </Text>
            ))}
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const TableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={[styles.tableHeaderCell, styles.smallCell]}>Sr#</Text>
    <Text style={[styles.tableHeaderCell, styles.largeCell]}>Sports</Text>
    <Text style={[styles.tableHeaderCell, styles.smallCell]}>Men</Text>
    <Text style={[styles.tableHeaderCell, styles.smallCell]}>Women</Text>
  </View>
);

const TableRow = ({ sport }) => (
  <View style={styles.tableRow}>
    <Text style={[styles.tableCell, styles.smallCell]}>{sport.Sr}</Text>
    <Text style={[styles.tableCell, styles.largeCell]}>{sport.Sports}</Text>
    <Text style={[styles.tableCell, styles.smallCell]}>{sport.Men}</Text>
    <Text style={[styles.tableCell, styles.smallCell]}>{sport.Women}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.SECONDARY,
  },
  scrollContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.SECONDARY,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  link: {
    color: Colors.PRIMARY,
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "#cc0000",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  content: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    textAlign: "center",
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333333",
    marginBottom: 5,
    marginLeft: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.PRIMARY,
    padding: 10,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    padding: 10,
  },
  tableCell: {
    color: "#333333",
  },
  smallCell: {
    flex: 1,
    fontSize: 14,
  },
  largeCell: {
    flex: 3,
    fontSize: 14,
  },
  contactDetail: {
    fontSize: 18,
    color: "#333333",
    marginBottom: 8,
  },
});

export default WebScrapping;
