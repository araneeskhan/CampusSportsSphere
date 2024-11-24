import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../index';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Colors = {
  PRIMARY: '#235264',
  SECONDARY: '#FF6B6B',
  BACKGROUND: '#ffffff',
  TEXT: '#333333',
  CARD: '#FFFFFF',
  ACCENT: '#4CAF50',
};

const ShowFormedTeams = () => {
  const [sportCategories, setSportCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchSportCategories();
  }, []);

  const fetchSportCategories = async () => {
    try {
      const categoriesSet = new Set();
      const q = query(collection(db, 'events'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        categoriesSet.add(doc.data().category);
      });
      setSportCategories(Array.from(categoriesSet));
    } catch (error) {
      console.error('Error fetching sport categories:', error);
    }
  };

  const fetchTeams = useCallback(async (category) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'teams'), where('sport', '==', category));
      const querySnapshot = await getDocs(q);
      const teamsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchTeams(category);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setModalVisible(true);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton,
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === item && styles.selectedCategoryButtonText
      ]}>{item}</Text>
    </TouchableOpacity>
  );

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleTeamSelect(item)}
    >
      <LinearGradient
        colors={[Colors.SECONDARY, Colors.PRIMARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.teamCardGradient}
      >
        <FontAwesome5 name="basketball-ball" size={24} color={Colors.CARD} />
        <Text style={styles.teamName}>{item.teamName}</Text>
        <Text style={styles.playerCount}>{item.players.length} Players</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPlayerLineup = () => (
    <View style={styles.courtOverlay}>
      <Text style={styles.lineupTitle}>{selectedTeam.teamName} Lineup</Text>
      <View style={styles.courtContainer}>
        {selectedTeam.players.slice(0, 5).map((player, index) => (
          <View key={player.id} style={[styles.playerIcon, styles[`playerPosition${index}`]]}>
            <LinearGradient
              colors={[Colors.SECONDARY, Colors.PRIMARY]}
              style={styles.playerIconGradient}
            >
              <FontAwesome5 name="user" size={24} color={Colors.CARD} />
            </LinearGradient>
            <Text style={styles.playerName}>{player.fullName}</Text>
            <Text style={styles.playerPosition}>
              {index === 0 ? 'PG' : index === 1 ? 'SG' : index === 2 ? 'SF' : index === 3 ? 'PF' : 'C'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.PRIMARY, Colors.SECONDARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerText}>Sports Teams</Text>
      </LinearGradient>
      <View style={styles.categoryContainer}>
        <FlatList
          data={sportCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loader} />
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.teamList}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedTeam && renderPlayerLineup()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: Colors.CARD,
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: Colors.CARD,
    paddingVertical: height * 0.01,
    marginBottom: height * 0.02,
  },
  categoryListContent: {
    paddingHorizontal: width * 0.04,
  },
  categoryButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    marginRight: width * 0.02,
    borderRadius: 20,
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.PRIMARY,
  },
  categoryButtonText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  selectedCategoryButtonText: {
    color: Colors.CARD,
  },
  teamList: {
    paddingHorizontal: width * 0.02,
  },
  teamCard: {
    flex: 1,
    margin: width * 0.02,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamCardGradient: {
    padding: width * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.15,
  },
  teamName: {
    fontSize: width * 0.04,
    color: Colors.CARD,
    fontWeight: 'bold',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  playerCount: {
    fontSize: width * 0.035,
    color: Colors.CARD,
    marginTop: height * 0.005,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    width: '90%',
    height: '70%',
    overflow: 'hidden',
  },
  courtOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: width * 0.04,
    justifyContent: 'space-between',
  },
  lineupTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: Colors.CARD,
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  courtContainer: {
    flex: 1,
    position: 'relative',
  },
  playerIcon: {
    position: 'absolute',
    alignItems: 'center',
  },
  playerPosition0: { left: '40%', top: '10%' },
  playerPosition1: { left: '20%', top: '30%' },
  playerPosition2: { right: '20%', top: '30%' },
  playerPosition3: { left: '28%', bottom: '20%' },
  playerPosition4: { right: '30%', bottom: '20%' },
  playerIconGradient: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    fontSize: width * 0.03,
    color: Colors.CARD,
    marginTop: height * 0.005,
    textAlign: 'center',
    fontWeight: '600',
  },
  playerPosition: {
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: Colors.ACCENT,
    marginTop: height * 0.005,
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 30,
    alignSelf: 'center',
    marginVertical: height * 0.02,
  },
  closeButtonText: {
    color: Colors.CARD,
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShowFormedTeams;
