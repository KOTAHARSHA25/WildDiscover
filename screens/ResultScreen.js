import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme, Linking, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ResultScreen({ route }) {
  const { result, type } = route.params;
  const theme = useColorScheme(); // Detect system theme

  // Log the received data
  console.log("ResultScreen Data:", result);

  // Function to open location in Google Maps
  const openInGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  // Helper function to check if a detail should be displayed
  const shouldDisplayDetail = (detail) => {
    return detail && !["Unknown", "N/A", "Not Available"].includes(detail);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, theme === "dark" && styles.darkMode]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Text style={[styles.title, theme === "dark" && styles.darkText]}>🔍 Identification Result</Text>

      {/* Centered Image */}
      <View style={styles.imageContainer}>
        {result.imageUri && <Image source={{ uri: result.imageUri }} style={styles.imagePreview} />}
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        {/* Name (Bold & Bigger) */}
        {shouldDisplayDetail(result.name) && (
          <Text style={[styles.nameText, theme === "dark" && styles.darkText]}>
            Name: {result.name}
          </Text>
        )}
        {shouldDisplayDetail(result.scientificName) && (
          <Text style={[styles.scientificNameText, theme === "dark" && styles.darkText]}>
            Scientific Name: {result.scientificName} {result.scientificNameAuthorship ? `(${result.scientificNameAuthorship})` : ""}
          </Text>
        )}

        {/* 📝 Description (Only Display if Available) */}
        {shouldDisplayDetail(result.description) && (
          <Text style={[styles.resultText, styles.descriptionText]}>
            📝 Description: {result.description}
          </Text>
        )}

        {/* 🌿 Flora Section */}
        {type === "flora" && (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>🌿 Flora Details</Text>
            {shouldDisplayDetail(result.commonNames) && result.commonNames.length > 0 && (
              <Text style={styles.resultText}>📗 Common Names: {result.commonNames.join(", ")}</Text>
            )}
            {shouldDisplayDetail(result.genus) && (
              <Text style={styles.resultText}>🌱 Genus: {result.genus} {result.genusAuthorship ? `(${result.genusAuthorship})` : ""}</Text>
            )}
            {shouldDisplayDetail(result.family) && (
              <Text style={styles.resultText}>🌳 Family: {result.family} {result.familyAuthorship ? `(${result.familyAuthorship})` : ""}</Text>
            )}
            {shouldDisplayDetail(result.habitat) && <Text style={styles.resultText}>🏡 Habitat: {result.habitat}</Text>}
            {shouldDisplayDetail(result.plantType) && <Text style={styles.resultText}>🌾 Plant Type: {result.plantType}</Text>}
            {shouldDisplayDetail(result.floweringSeason) && <Text style={styles.resultText}>🌸 Flowering Season: {result.floweringSeason}</Text>}
            {shouldDisplayDetail(result.uses) && <Text style={styles.resultText}>💡 Uses: {result.uses}</Text>}
            {result.remainingIdentificationRequests !== undefined && (
              <Text style={styles.resultText}>🔢 Remaining API Requests: {result.remainingIdentificationRequests}</Text>
            )}
          </View>
        )}

        {/* 🦁 Fauna Section */}
        {type === "fauna" && (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>🦁 Fauna Details</Text>
            {shouldDisplayDetail(result.scientificName) && <Text style={styles.resultText}>🔬 Scientific Name: {result.scientificName}</Text>}
            {shouldDisplayDetail(result.family) && <Text style={styles.resultText}>🌳 Family: {result.family}</Text>}
            {shouldDisplayDetail(result.diet) && <Text style={styles.resultText}>🍽 Diet: {result.diet}</Text>}
            {shouldDisplayDetail(result.lifespan) && <Text style={styles.resultText}>⏳ Lifespan: {result.lifespan}</Text>}
            {shouldDisplayDetail(result.habitat) && <Text style={styles.resultText}>🏡 Habitat: {result.habitat}</Text>}
            {shouldDisplayDetail(result.conservationStatus) && <Text style={styles.resultText}>🌍 Conservation Status: {result.conservationStatus}</Text>}
            {shouldDisplayDetail(result.prey) && <Text style={styles.resultText}>🦌 Prey: {result.prey}</Text>}
            {shouldDisplayDetail(result.groupBehavior) && <Text style={styles.resultText}>👥 Group Behavior: {result.groupBehavior}</Text>}
            {shouldDisplayDetail(result.topSpeed) && <Text style={styles.resultText}>🏃‍♂️ Top Speed: {result.topSpeed}</Text>}
            {shouldDisplayDetail(result.weight) && <Text style={styles.resultText}>⚖️ Weight: {result.weight}</Text>}
            {shouldDisplayDetail(result.height) && <Text style={styles.resultText}>📏 Height: {result.height}</Text>}
            {result.name === "Needs Verification" && (
              <Text style={[styles.warningText, theme === "dark" && styles.darkText]}>
                ⚠️ This identification has low confidence. Please verify the result.
              </Text>
            )}
          </View>
        )}

        {/* 📍 Landmark Section */}
        {type === "landmark" && (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>📍 Landmark Details</Text>
            {shouldDisplayDetail(result.name) && <Text style={styles.resultText}>🏛 Name: {result.name}</Text>}
            {shouldDisplayDetail(result.location) && typeof result.location === 'string' && (
              <Text style={styles.resultText}>📍 Location: {result.location}</Text>
            )}
            {result.latitude != null && result.longitude != null && (
              <Text style={styles.resultText} onPress={() => openInGoogleMaps(result.latitude, result.longitude)}>
                🌍 Coordinates: {parseFloat(result.latitude).toFixed(4)}, {parseFloat(result.longitude).toFixed(4)}
              </Text>
            )}
            {shouldDisplayDetail(result.built) && <Text style={styles.resultText}>🏗 Built: {result.built}</Text>}
            {shouldDisplayDetail(result.architect) && <Text style={styles.resultText}>🧑‍🎨 Architect: {result.architect}</Text>}
            {shouldDisplayDetail(result.style) && <Text style={styles.resultText}>🏛 Architectural Style: {result.style}</Text>}
            {shouldDisplayDetail(result.significance) && <Text style={styles.resultText}>📜 Significance: {result.significance}</Text>}
          </View>
        )}

        {/* Wikipedia Link */}
        {result.wikipediaLink && result.wikipediaLink.startsWith("http") && (
          <Text style={styles.wikipediaLink} onPress={() => Linking.openURL(result.wikipediaLink)}>
            Learn more on Wikipedia
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  darkMode: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2BA84A",
    marginBottom: 10,
    textAlign: "center",
  },
  darkText: {
    color: "#FFFFFF",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  detailsContainer: {
    width: "100%",
    alignItems: "center",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  scientificNameText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    alignSelf: "flex-start",
    color: "#2BA84A",
  },
  resultText: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  warningText: {
    fontSize: 16,
    color: "#FFA500",
    marginTop: 10,
    textAlign: "center",
  },
  wikipediaLink: {
    fontSize: 16,
    color: "#1E90FF",
    marginTop: 20,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
