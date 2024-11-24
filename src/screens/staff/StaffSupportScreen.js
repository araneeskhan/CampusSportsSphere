import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { app } from "../../../index";
import { Colors } from "../../../assets/colors/Colors";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

const StaffSupportScreen = () => {
  const navigation = useNavigation();
  const [supportRequests, setSupportRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchSupportRequests = async () => {
      try {
        const supportRequestsRef = collection(db, "feedback");
        const q = query(supportRequestsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const requestsList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.userFullName, 
              regNo: data.userRegNo,   
              feedback: data.feedback,
              createdAt: data.createdAt,
              staffResponse: data.staffResponse,
            };
          });
          console.log("Fetched requests:", requestsList); 
          setSupportRequests(requestsList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching support requests:", error);
      }
    };

    fetchSupportRequests();
  }, []);

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleSendResponse = async () => {
    if (selectedRequest && responseText) {
      try {
        const requestRef = doc(db, "feedback", selectedRequest.id);
        await updateDoc(requestRef, {
          staffResponse: responseText,
          respondedAt: new Date(),
        });
        setModalVisible(false);
        setResponseText('');
      } catch (error) {
        console.error("Error sending response:", error);
      }
    }
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity style={styles.requestItem} onPress={() => handleSelectRequest(item)}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestText}>From: {item.name} ({item.regNo})</Text>
        <Text style={styles.dateInfo}>{moment(item.createdAt?.toDate()).format('MMM D, YYYY')}</Text>
      </View>
      <Text style={styles.messageText} numberOfLines={2}>Message: {item.feedback}</Text>
      <Text style={[styles.requestStatus, item.staffResponse ? styles.responded : styles.pending]}>
        {item.staffResponse ? 'Responded' : 'Pending'}
      </Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.title}>Support Requests</Text>
      </View>
      {supportRequests.length > 0 ? (
        <FlatList
          data={supportRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbox-ellipses-outline" size={64} color={Colors.PRIMARY} />
          <Text style={styles.emptyStateText}>No support requests found</Text>
        </View>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <Text style={styles.modalTitle}>Respond to Request</Text>
                <Text style={styles.modalText}>From: {selectedRequest.name} - Reg No: ({selectedRequest.regNo})</Text>
                <Text style={styles.modalText}>Message: {selectedRequest.feedback}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your response"
                  value={responseText}
                  onChangeText={setResponseText}
                  multiline
                />
                <TouchableOpacity style={styles.button} onPress={handleSendResponse}>
                  <Text style={styles.buttonText}>Send Response</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveWidth(5),
    backgroundColor: Colors.PRIMARY,
  },
  backButton: {
    marginRight: responsiveWidth(3),
  },
  title: {
    fontSize: responsiveFontSize(2.5),
    fontWeight: 'bold',
    color: Colors.SECONDARY,
  },
  listContent: {
    padding: responsiveWidth(5),
  },
  requestItem: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(4),
    marginBottom: responsiveHeight(2),
    borderRadius: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveHeight(1),
  },
  requestText: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  dateInfo: {
    fontSize: responsiveFontSize(1.6),
    color: 'gray',
  },
  messageText: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(1),
  },
  requestStatus: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: 'bold',
  },
  responded: {
    color: 'green',
  },
  pending: {
    color: 'orange',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: responsiveFontSize(2),
    color: Colors.PRIMARY,
    marginTop: responsiveHeight(2),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.SECONDARY,
    padding: responsiveWidth(5),
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
    color: Colors.PRIMARY,
  },
  modalText: {
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(1),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 5,
    padding: responsiveWidth(2),
    marginBottom: responsiveHeight(2),
    fontSize: responsiveFontSize(1.8),
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(3),
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: responsiveHeight(1),
  },
  buttonText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(1.8),
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    padding: responsiveWidth(3),
    borderRadius: 5,
    alignItems: 'center',
    marginTop: responsiveHeight(1),
  },
});

export default StaffSupportScreen;