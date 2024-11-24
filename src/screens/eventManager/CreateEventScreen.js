import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "../../../assets/colors/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropdownComponent from "./components/DropDown";
import PrimaryButton from "./components/PrimaryButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import UploadImage from "./UploadImage";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, storage, ref, uploadBytes, getDownloadURL } from "../../../index";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

 function CreateEventScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingEvent = route.params?.event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [inputBorderColor, setInputBorderColor] = useState("#dedede");
  const [DescriptionInputBorderColor, setDescriptionInputBorderColor] = useState("#dedede");
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const category = [
    { label: "All", value: "All" },
    { label: "Cricket", value: "Cricket" },
    { label: "Football", value: "Football" },
    { label: "Basketball", value: "Basketball" },
    { label: "Tennis", value: "Tennis" },
    { label: "Volleyball", value: "Volleyball" },
    { label: "Table Tennis", value: "Table Tennis" },
  ];

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description);
      setEventDate(editingEvent.eventDate);
      setEventTime(editingEvent.eventTime);
      setSelectedCategory(editingEvent.category);
      setSelectedImage(editingEvent.imageUrl);
    }
  }, [editingEvent]);

  useEffect(() => {
    console.log("Selected category changed:", selectedCategory);
  }, [selectedCategory]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleFocus = () => {
    setInputBorderColor("blue");
  };

  const handleBlur = () => {
    setInputBorderColor("#dedede");
  };

  const handleFocusDes = () => {
    setDescriptionInputBorderColor("blue");
  };

  const handleBlurDes = () => {
    setDescriptionInputBorderColor("#dedede");
  };

  const toggleDatePicker = () => {
    setShowDatePicker((prev) => !prev);
  };

  const toggleTimePicker = () => {
    setShowTimePicker((prev) => !prev);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);

    if (Platform.OS === "android" && event.type !== "dismissed") {
      setEventDate(currentDate.toDateString());
      toggleDatePicker();
    }
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setDate(currentTime);

    if (Platform.OS === "android" && event.type !== "dismissed") {
      setEventTime(
        currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      toggleTimePicker();
    }
  };

  const confirmDateiOS = () => {
    setEventDate(date.toDateString());
    toggleDatePicker();
  };

  const cancelDateiOS = () => {
    toggleDatePicker();
  };

  const confirmTimeiOS = () => {
    setEventTime(
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
    toggleTimePicker();
  };

  const cancelTimeiOS = () => {
    toggleTimePicker();
  };

  async function imagePicker(option) {
    let result;

    try {
      if (option === "gallery") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access gallery is required!");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else if (option === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access camera is required!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      if (
        result &&
        !result.cancelled &&
        result.assets &&
        result.assets.length > 0
      ) {
        setSelectedImage(result.assets[0].uri);
      }

      setModalIsVisible(false);
    } catch (error) {
      console.error("Error picking image:", error);
      alert("An error occurred while picking the image. Please try again.");
    }
  }

  function removeImage() {
    setSelectedImage(null);
    setModalIsVisible(false);
  }

  async function uploadImageAsync(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const imageRef = ref(storage, `images/${Date.now()}-${title}.jpg`);
      await uploadBytes(imageRef, blob);

      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  async function eventHandler() {
    if (
      !title ||
      !description ||
      !eventDate ||
      !eventTime ||
      !selectedCategory
    ) {
      Alert.alert("Error", "Please fill in all fields including category. Image is optional.");
      return;
    }

    try {
      let imageUrl = "";
      if (selectedImage) {
        if (selectedImage !== editingEvent?.imageUrl) {
          imageUrl = await uploadImageAsync(selectedImage);
        } else {
          imageUrl = selectedImage;
        }
      }

      const eventData = {
        title,
        description,
        eventDate,
        eventTime,
        category: selectedCategory,
        imageUrl,
        createdAt: new Date(),
      };

      if (editingEvent) {
      
        await updateDoc(doc(db, "events", editingEvent.id), eventData);
        Alert.alert("Success", "Event updated successfully");
      } else {
      
        const docRef = await addDoc(collection(db, "events"), eventData);
        console.log("Event Created with ID: ", docRef.id);
        Alert.alert("Success", "Event created successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving event:", error);
      Alert.alert("Error", "Failed to save event. Please try again.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      backgroundColor={Colors.SECONDARY}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.appContainer}
          contentContainerStyle={styles.scrollviewcontent}
        >
          <View style={styles.headerView}>
            <Text style={styles.headerText}>{editingEvent ? "Edit Event" : "Create Event"}</Text>
          </View>

          <View style={styles.imageContainerWrapper}>
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? [styles.imageContainer, styles.buttonPressed]
                  : styles.imageContainer
              }
              android_ripple={{
                color: "rgba(170, 169, 169, 0.2)",
                borderless: false,
              }}
              onPress={() => setModalIsVisible(true)}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.uploadedImage}
                />
              ) : (
                <>
                  <Feather name="camera" size={24} color="black" />
                  <Text style={styles.imageContainerText}>Upload Image</Text>
                </>
              )}
            </Pressable>

            <UploadImage
              showModal={modalIsVisible}
              closeModal={() => setModalIsVisible(false)}
              openGallery={() => imagePicker("gallery")}
              openCamera={() => imagePicker("camera")}
              remove={removeImage}
            />
          </View>

          <View style={styles.titleView}>
            <Text style={styles.labelText}>Event Title</Text>
            <TextInput
              style={[
                styles.eventTitleTextInput,
                { borderColor: inputBorderColor },
              ]}
              placeholder="Campus Sports Gala"
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.labelText}>Date</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={styles.dateTextInput}
                  placeholder="Select a date"
                  value={eventDate}
                  onChangeText={setEventDate}
                  editable={false}
                />
                <View style={styles.iconWrapper}>
                  <Pressable
                    onPress={toggleDatePicker}
                    android_ripple={{
                      color: "#ADD8E6",
                      borderless: false,
                      radius: 20,
                    }}
                    style={({ pressed }) => [
                      styles.iconContainer,
                      pressed && styles.iconPressed,
                    ]}
                  >
                    <Feather
                      name="calendar"
                      size={24}
                      color="#075985"
                      style={styles.icon}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.labelText}>Time</Text>
              <View style={styles.timeInputContainer}>
                <TextInput
                  style={styles.timeTextInput}
                  placeholder="Select a time"
                  value={eventTime}
                  onChangeText={setEventTime}
                  editable={false}
                />
                <View style={styles.iconWrapper}>
                  <Pressable
                    onPress={toggleTimePicker}
                    android_ripple={{
                      color: "#ADD8E6",
                      borderless: false,
                      radius: 20,
                    }}
                    style={({ pressed }) => [
                      styles.iconContainer,
                      pressed && styles.iconPressed,
                    ]}
                  >
                    <Feather
                      name="clock"
                      size={24}
                      color="#075985"
                      style={styles.icon}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {showDatePicker && Platform.OS === "ios" && (
            <>
              <DateTimePicker
                mode="date"
                display="spinner"
                value={date}
                onChange={onChangeDate}
                style={styles.datePicker}
              />
              <View style={styles.confirmDateButtoniOS}>
                <TouchableOpacity
                  style={styles.datePickerCancelButton}
                  onPress={cancelDateiOS}
                >
                  <Text style={styles.datePickerCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.datePickerConfirmButton}
                  onPress={confirmDateiOS}
                >
                  <Text style={styles.datePickerConfirmButtonText}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {showTimePicker && Platform.OS === "ios" && (
            <>
              <DateTimePicker
                mode="time"
                display="spinner"
                value={date}
                onChange={onChangeTime}
                style={styles.datePicker}
              />
              <View style={styles.confirmDateButtoniOS}>
                <TouchableOpacity
                  style={styles.datePickerCancelButton}
                  onPress={cancelTimeiOS}
                >
                  <Text style={styles.datePickerCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.datePickerConfirmButton}
                  onPress={confirmTimeiOS}
                >
                  <Text style={styles.datePickerConfirmButtonText}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              mode="date"
              display="calendar"
              value={date}
              onChange={onChangeDate}
              style={styles.datePicker}
            />
          )}

          {showTimePicker && Platform.OS === "android" && (
            <DateTimePicker
              mode="time"
              display="spinner"
              value={date}
              onChange={onChangeTime}
              style={styles.datePicker}
            />
          )}

          <View style={styles.categoryContainer}>
            <DropdownComponent
              data={category}
              value={selectedCategory}
              onValueChange={(value) => {
                console.log("Category selected:", value);
                setSelectedCategory(value);
              }}
            />
          </View>

          <View style={styles.titleView}>
            <Text style={styles.labelText}>Description</Text>
            <TextInput
              style={[
                styles.descriptionTextInput,
                { borderColor: DescriptionInputBorderColor },
              ]}
              multiline
              numberOfLines={4}
              scrollEnabled={false}
              placeholder="Event details"
              onFocus={handleFocusDes}
              onBlur={handleBlurDes}
              value={description}
              onChangeText={setDescription}
            />
                   </View>
          <View style={styles.createButtonContainer}>
            <PrimaryButton onPress={eventHandler}>
              {editingEvent ? "Update Event" : "Create Event"}
            </PrimaryButton>
          </View>

          <View style={styles.cancelButtonContainer}>
            <PrimaryButton onPress={handleCancel}>Cancel</PrimaryButton>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  scrollviewcontent: {
    alignItems: "center",
  },
  headerView: {
    backgroundColor: Colors.PRIMARY,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: Colors.SECONDARY,
    fontSize: responsiveFontSize(2.5),
    fontWeight: "bold",
    paddingVertical: responsiveHeight(2),
  },
  imageContainerWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: responsiveHeight(4),
  },
  imageContainer: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 20,
    width: responsiveWidth(80),
    height: responsiveHeight(18),
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadedImage: {
    width: responsiveWidth(80),
    height: responsiveHeight(18),
  },
  buttonPressed: {
    opacity: 0.25,
  },
  imageContainerText: {
    color: "black",
    fontSize: 15,
    textAlign: "center",
  },
  titleView: {
    width: "80%",
    marginHorizontal: responsiveWidth(15),
  },
  labelText: {
    color: "black",
    fontSize: responsiveFontSize(2),
    fontWeight: "bold",
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(0.5),
  },
  eventTitleTextInput: {
    width: responsiveWidth(80),
    height: responsiveHeight(5),
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
    marginLeft: 70,
  },
  dateContainer: {
    flex: 1,
    marginRight: 0,
  },
  timeContainer: {
    flex: 1,
  },
  dateTextInput: {
    backgroundColor: "#F1F1F1",
    borderColor: "#DDDDDD",
    borderWidth: 1,
    height: 46,
    borderRadius: 8,
    padding: 13,
    color: "black",
  },
  timeTextInput: {
    backgroundColor: "#F1F1F1",
    borderColor: "#DDDDDD",
    borderWidth: 1,
    height: 46,
    borderRadius: 8,
    padding: 13,
    color: "black",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    margin: 1,
  },
  iconContainer: {
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10,
    marginLeft: 5,
  },
  iconPressed: {
    backgroundColor: "#ADD8E6",
  },
  icon: {
    alignContent: "center",
    marginLeft: 7,
  },
  datePicker: {
    height: 150,
    marginTop: 10,
  },
  confirmDateButtoniOS: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  datePickerCancelButton: {
    backgroundColor: "#F1F1F1",
    borderColor: "#DDDDDD",
    borderWidth: 1,
    paddingHorizontal: 20,
    height: 50,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    marginRight: 30,
  },
  datePickerCancelButtonText: {
    color: "#075985",
  },
  datePickerConfirmButton: {
    backgroundColor: "#075985",
    paddingHorizontal: 20,
    height: 50,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  datePickerConfirmButtonText: {
    color: "#ffff",
  },
  categoryContainer: {
    marginTop: 1,
  },
  descriptionTextInput: {
    width: responsiveWidth(80),
    height: responsiveHeight(5),
    backgroundColor: "#F1F1F1",
    borderColor: "#DDDDDD",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  createButtonContainer: {
    marginTop: responsiveHeight(5),
    marginBottom: responsiveHeight(2),
  },
  cancelButtonContainer: {
    marginBottom: responsiveHeight(2),
  },
});

export default CreateEventScreen;