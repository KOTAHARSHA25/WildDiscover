import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Import screens
import HomeScreen from './screens/HomeScreen';
import FloraScreen from './screens/FloraScreen';
import FaunaScreen from './screens/FaunaScreen';
import LandmarkScreen from './screens/LandmarkScreen';
import ResultScreen from './screens/ResultScreen';

const Stack = createStackNavigator();

export default function App() {
  const theme = useColorScheme(); // Detect system theme

  useEffect(() => {
    (async () => {
      try {
        // Request permissions for camera and gallery
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          Alert.alert('Permissions Required', 'Camera and media permissions are required to use this app.');
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    })();
  }, []);

  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="Home">
        {/* Home screen (no header for a clean look) */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* Category Screens */}
        <Stack.Screen name="FloraScreen" component={FloraScreen} options={{ title: 'Identify Flora' }} />
        <Stack.Screen name="FaunaScreen" component={FaunaScreen} options={{ title: 'Identify Fauna' }} />
        <Stack.Screen name="LandmarkScreen" component={LandmarkScreen} options={{ title: 'Identify Landmark' }} />

        {/* Result Screen */}
        <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ title: 'Identification Result' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
