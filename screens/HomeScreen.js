import React, { useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import { useFonts, Poppins_700Bold, Poppins_400Regular } from "@expo-google-fonts/poppins";
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto hiding
SplashScreen.preventAutoHideAsync();

const categories = [
  { name: "Flora", icon: "seedling", color: "#EAF6E9", route: "FloraScreen" },
  { name: "Fauna", icon: "dove", color: "#E9F2FF", route: "FaunaScreen" },
  { name: "Landmark", icon: "landmark", color: "#FFF7E6", route: "LandmarkScreen" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useColorScheme(); // Detect system theme
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_400Regular
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Prevent rendering before fonts load
  }

  return (
    <View style={[styles.container, theme === "dark" && styles.darkMode]} onLayout={onLayoutRootView}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Text style={[styles.title, theme === "dark" && styles.darkText]}>🌿 WildDiscover 🫎</Text>
      <Text style={[styles.subHeader, theme === "dark" && styles.darkSubHeader]}>
        Identify and explore wildlife & landmarks around you!
      </Text>

      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[styles.card, { backgroundColor: category.color, elevation: 5 }]}
            onPress={() => navigation.navigate(category.route)}
            activeOpacity={0.7}
          >
            <FontAwesome5 name={category.icon} size={40} color="black" />
            <Text style={[styles.cardText, theme === "dark" && styles.darkText]}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.footerText, theme === "dark" && styles.darkFooter]}>📸 Capture or Upload to Identify</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 20,
  },
  darkMode: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#2BA84A",
    marginBottom: 10,
  },
  darkText: {
    color: "#FFFFFF",
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    fontFamily: "Poppins_400Regular",
    marginBottom: 20,
  },
  darkSubHeader: {
    color: "#BBB",
  },
  categoryContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },
  darkFooter: {
    color: "#BBB",
  },
});
