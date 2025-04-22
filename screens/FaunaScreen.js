import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { detectObject } from "../api/detectionAPI.js"; // Import the detection API

export default function FaunaScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const theme = useColorScheme(); // Detect system theme
  const navigation = useNavigation(); // Get navigation object

  // Pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert("Image Selection Failed", "Please select a valid image.");
    }
  };

  // Capture an image using the camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    } else {
      Alert.alert("Image Selection Failed", "Please select a valid image.");
    }
  };

  // Function to handle image analysis
  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please choose an image first!");
      return;
    }

    try {
      const result = await detectObject(selectedImage, "fauna");
      navigation.navigate("ResultScreen", { result: { ...result, imageUri: selectedImage }, type: "fauna" });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && styles.darkMode]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <Text style={[styles.title, theme === "dark" && styles.darkText]}>🦉 Identify Fauna</Text>
      <Text style={[styles.subHeader, theme === "dark" && styles.darkSubHeader]}>
        Capture or upload an image to identify animals, birds, or insects around you.
      </Text>

      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="paw-outline" size={100} color="#FF9800" />
          <Text style={[styles.placeholderText, theme === "dark" && styles.darkSubHeader]}>No Image Selected</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Ionicons name="camera" size={22} color="white" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="image" size={22} color="white" />
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, selectedImage ? styles.analyzeEnabled : styles.analyzeDisabled]}
        onPress={analyzeImage}
        disabled={!selectedImage}
      >
        <Text style={styles.analyzeText}>{selectedImage ? "Analyze Image" : "Select Image First"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 20,
  },
  darkMode: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FF9800",
    marginBottom: 10,
  },
  darkText: {
    color: "#FFFFFF",
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  darkSubHeader: {
    color: "#BBB",
  },
  placeholder: {
    width: 250,
    height: 250,
    borderRadius: 10,
    backgroundColor: "#FFD699",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: "#FF9800",
    marginTop: 10,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  analyzeButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  analyzeEnabled: {
    backgroundColor: "#FF9800",
  },
  analyzeDisabled: {
    backgroundColor: "#FFCC80",
  },
  analyzeText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
