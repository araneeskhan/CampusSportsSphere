import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard,
  Dimensions
} from 'react-native';
import { Colors } from '../../../assets/colors/Colors';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    setMessages([{ text: "Welcome! How can I help you today?", user: false }]);
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;
  
    const userMessage = { text: inputText, user: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();
  
    try {
      const response = await fetch('https://campus-sports-sphere-fawuo1l7p-anees-ur-rehmans-projects.vercel.app/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputText }),
      });
  
      if (!response.ok) {
        console.error('Response failed:', response);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const botMessage = { text: data.answer, user: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error in request:', error);
      const errorMessage = { text: 'Sorry, there was an error. Please try again.', user: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.user ? styles.userMessage : styles.botMessage]}>
      <Text style={[styles.messageText, item.user ? styles.userMessageText : styles.botMessageText]}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? SCREEN_HEIGHT * 0.1 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chatbot Assistant</Text>
        </View>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({animated: true})}
          onLayout={() => flatListRef.current.scrollToEnd({animated: true})}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={Colors.DARK}
            onSubmitEditing={sendMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={Colors.SECONDARY} />
            ) : (
              <Ionicons name="send" size={24} color={Colors.SECONDARY} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  headerTitle: {
    color: Colors.SECONDARY,
    fontSize: 20,
    fontWeight: 'bold',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 15,
    paddingBottom: 30, 
  },
  messageBubble: {
    maxWidth: '90%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#000000',
  },
  botMessageText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: Colors.SECONDARY,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    color: Colors.DARK,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotScreen;