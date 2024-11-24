import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../index";

const ProfileImage = ({ currentImage, onImageChange }) => {
  const [image, setImage] = useState(currentImage);
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    setImage(currentImage);
  }, [currentImage]);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, []);

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage(app);
    const storageRef = ref(storage, `profileImages/${user.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const updateUserProfile = async (imageUrl) => {
    const db = getFirestore(app);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { profileImage: imageUrl });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uploadedImageUrl = await uploadImage(result.assets[0].uri);
      setImage(uploadedImageUrl);
      updateUserProfile(uploadedImageUrl);
      onImageChange(uploadedImageUrl);
    }
  };

  const handleImagePress = () => {
    if (image) {
      Alert.alert("Profile Image", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        { text: "Change Image", onPress: pickImage },
        {
          text: "Delete Image",
          onPress: async () => {
            const storage = getStorage(app);
            const storageRef = ref(storage, `profileImages/${user.uid}`);
            await deleteObject(storageRef);
            setImage(null);
            updateUserProfile(null);
            onImageChange(null);
          },
          style: "destructive",
        },
      ]);
    } else {
      pickImage();
    }
  };

  return (
    <TouchableOpacity onPress={handleImagePress} style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="camera" size={40} color="#ffffff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#cccccc",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileImage;
