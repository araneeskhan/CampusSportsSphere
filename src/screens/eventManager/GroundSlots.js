import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Feather } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../../index';
import { Colors } from '../../../assets/colors/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';


const GroundSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const slotsSnapshot = await getDocs(collection(db, 'groundSlots'));
      if (!slotsSnapshot.empty) {
        const slotsData = slotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSlots(slotsData);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      Alert.alert('Error', 'Failed to fetch slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (selectedDate) => {
    hideDatePicker();
    setDate(moment(selectedDate).format('YYYY-MM-DD'));
  };

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (selectedTime) => {
    hideStartTimePicker();
    setStartTime(moment(selectedTime).format('HH:mm'));
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (selectedTime) => {
    hideEndTimePicker();
    setEndTime(moment(selectedTime).format('HH:mm'));
  };

  const addSlot = async () => {
    if (!date || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'groundSlots'), {
        date,
        startTime,
        endTime,
        isAvailable: true,
      });
      Alert.alert('Success', 'Slot added successfully!');
      setShowAddSlotModal(false);
      setDate('');
      setStartTime('');
      setEndTime('');
      fetchSlots();
    } catch (error) {
      console.error('Error adding slot:', error);
      Alert.alert('Error', 'Failed to add slot. Please try again.');
    }
  };

  const updateSlot = async () => {
    if (!date || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'groundSlots', selectedSlot.id), {
        date,
        startTime,
        endTime,
      });
      Alert.alert('Success', 'Slot updated successfully!');
      setShowAddSlotModal(false);
      setDate('');
      setStartTime('');
      setEndTime('');
      fetchSlots();
    } catch (error) {
      console.error('Error updating slot:', error);
      Alert.alert('Error', 'Failed to update slot. Please try again.');
    }
  };

  const deleteSlot = async () => {
    try {
      await deleteDoc(doc(db, 'groundSlots', selectedSlot.id));
      Alert.alert('Success', 'Slot deleted successfully!');
      setShowAddSlotModal(false);
      setDate('');
      setStartTime('');
      setEndTime('');
      fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      Alert.alert('Error', 'Failed to delete slot. Please try again.');
    }
  };

  const renderSlot = ({ item: slot }) => (
    <TouchableOpacity
      style={styles.slotButton}
      onPress={() => {
        setSelectedSlot(slot);
        setDate(slot.date);
        setStartTime(slot.startTime);
        setEndTime(slot.endTime);
        setShowAddSlotModal(true);
      }}
    >
      <Text style={styles.slotText}>
        {slot.date} - {slot.startTime} to {slot.endTime}
      </Text>
      <Feather name="edit" size={24} color={Colors.PRIMARY} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ground Slots</Text>
        <TouchableOpacity
          style={styles.addSlotButton}
          onPress={() => {
            setSelectedSlot(null);
            setDate('');
            setStartTime('');
            setEndTime('');
            setShowAddSlotModal(true);
          }}
        >
          <Feather name="plus" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loader} />
      ) : (
        <FlatList
          data={slots}
          renderItem={renderSlot}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.slotList}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddSlotModal}
        onRequestClose={() => setShowAddSlotModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {selectedSlot ? 'Update Slot' : 'Add New Slot'}
            </Text>
            
            <TouchableOpacity style={styles.inputField} onPress={showDatePicker}>
              <Text style={styles.inputText}>{date || 'Select Date'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputField} onPress={showStartTimePicker}>
              <Text style={styles.inputText}>{startTime || 'Select Start Time'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputField} onPress={showEndTimePicker}>
              <Text style={styles.inputText}>{endTime || 'Select End Time'}</Text>
            </TouchableOpacity>

            {selectedSlot ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.updateButton]}
                  onPress={updateSlot}
                >
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={deleteSlot}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={addSlot}
              >
                <Text style={styles.buttonText}>Add Slot</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddSlotModal(false)}
            >
              <Feather name="x" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={hideStartTimePicker}
      />

      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={hideEndTimePicker}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(4),
    backgroundColor: Colors.PRIMARY,
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
  },
  addSlotButton: {
    padding: responsiveWidth(2),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotList: {
    padding: responsiveWidth(4),
  },
  slotButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderRadius: 8,
    backgroundColor: Colors.SECONDARY,
    elevation: 2,
  },
  slotText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: Colors.SECONDARY,
    borderRadius: 20,
    padding: responsiveWidth(6),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: responsiveHeight(2),
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  inputField: {
    width: '100%',
    height: responsiveHeight(6),
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 8,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    justifyContent: 'center',
  },
  inputText: {
    color: Colors.PRIMARY,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: responsiveWidth(4),
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: responsiveHeight(2),
  },
  addButton: {
    backgroundColor: Colors.PRIMARY,
    width: '100%',
  },
  updateButton: {
    backgroundColor: Colors.PRIMARY,
    width: '48%',
  },
  deleteButton: {
    backgroundColor: Colors.DANGER,
    width: '48%',
  },
  buttonText: {
    fontSize: responsiveFontSize(2),
    color: Colors.SECONDARY,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: responsiveHeight(2),
    right: responsiveWidth(4),
  },
});

export default GroundSlots;