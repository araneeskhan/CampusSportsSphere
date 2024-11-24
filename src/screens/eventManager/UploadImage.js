import React from "react";
import { View, Text, Modal, StyleSheet, Pressable, Button,TouchableOpacity } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

function UploadImage(props) {

  return (
    <Modal visible={props.showModal} animationType='slide' transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
        <View style={styles.crossIcon}>
            <Pressable onPress={props.closeModal} style={styles.touchArea}>
                <Entypo name="cross" size={20} color="black" />
            </Pressable>
        </View>
          <Text style={styles.headerText}>Cover Image</Text>

          <View style={styles.optionsWrapper}>

          <View style={styles.optionOuterContainer}>
            <Pressable  
              style={({ pressed }) => [
                  styles.optionContainer,
                  pressed && styles.optionPressed, 
                ]}
            onPress={props.openCamera}>
              <Entypo name="camera" size={24} color="#075985" />
              <Text style={styles.iconLabel}>Camera</Text>
            </Pressable>
          </View>
            
            <View style={styles.optionOuterContainer}>
              <Pressable  
                style={({ pressed }) => [
                    styles.optionContainer,
                    pressed && styles.optionPressed, 
                  ]}
              onPress={props.openGallery}>
                <FontAwesome name="photo" size={24} color="#075985" />
                <Text style={styles.iconLabel}>Gallery</Text>
              </Pressable>
            </View>

            <View style={styles.optionOuterContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.optionContainer,
                  pressed && styles.optionPressed, 
                ]}
                onPress={props.remove}
              >
                <AntDesign name="delete" size={24} color="#075985" />
                <Text style={styles.iconLabel}>Remove</Text>
              </Pressable>
            </View>


          </View>
        </View>
      </View>
    </Modal>
  );
}

export default UploadImage;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(42, 42, 42, 0.5)", 
  },
  container: {
    width: 300,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, 
  },
  headerText: {
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 20,
    padding:10,
  },
  optionsWrapper: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    width: "100%", 
    marginTop:20,
    marginBottom: 40,
  },
  optionOuterContainer:{
    borderRadius: 15,
    marginTop:3,
    overflow: 'hidden',
  },
  optionContainer: {
    borderRadius: 15,
    backgroundColor: "#e8e8e8",
    height: 70,
    width: 70,
    alignItems:'center',
    justifyContent: 'center',
  },
  optionPressed:{
    opacity: 0.25,
  },
  iconLabel:{
    fontSize: 12,
    padding:3,
  },
  crossIcon:{
    height:30,
    width:30,
    position: 'absolute',
    top: 6,
    bottom:10,
    right:10,
  },
  touchArea: {
    height: 40,
    width: 40,  
    alignItems: 'center',
    justifyContent: 'center',
   
  },
});
