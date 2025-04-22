import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, useColorScheme, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { detectObject } from "../api/detectionAPI.js"; // Import the detection API

export default function FloraScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const theme = useColorScheme(); // Detect system theme
  const navigation = useNavigation(); // Get navigation object

  // Function to pick an image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Function to capture an image using camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Function to handle image analysis
  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please choose an image first!");
      return;
    }

    try {
      const result = await detectObject(selectedImage, "flora");
      navigation.navigate("ResultScreen", { result: { ...result, imageUri: selectedImage }, type: "flora" });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    }
  };

  return (
    <View style={[styles.container, theme === "dark" && styles.darkMode]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <Text style={[styles.title, theme === "dark" && styles.darkText]}>🌱 Identify Flora</Text>
      <Text style={[styles.subHeader, theme === "dark" && styles.darkSubHeader]}>
        Capture or upload an image to identify plants around you.
      </Text>

      {selectedImage ? (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="leaf-outline" size={100} color="#4CAF50" />
          <Text style={[styles.placeholderText, theme === "dark" && styles.darkSubHeader]}>
            No Image Selected
          </Text>
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
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 20,
  },
  darkMode: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2BA84A",
    marginBottom: 10,
    textAlign: "center",
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
    backgroundColor: "#DFFFD6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: "#4CAF50",
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
    width: "100%",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
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
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  analyzeEnabled: {
    backgroundColor: "#2BA84A",
  },
  analyzeDisabled: {
    backgroundColor: "#A5D6A7",
  },
  analyzeText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
