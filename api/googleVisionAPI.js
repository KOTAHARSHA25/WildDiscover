import axios from "axios";
import { GOOGLE_VISION_API_KEY } from "../config/config.js";
import fetchWikipedia from "./wikipediaAPI.js";
import * as FileSystem from "expo-file-system"; // Import FileSystem

// Helper function to convert image to Base64
async function getBase64(imageUri) {
  return await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/**
 * Identifies an object using Google Vision API and fetches Wikipedia info.
 * @param {string} imageUri - Image URI.
 * @returns {object} - Detection result formatted for ResultScreen.
 */
export async function identifyWithGoogleVision(imageUri) {
  if (!imageUri) {
    console.error("identifyWithGoogleVision: No image URI provided.");
    return { name: "Error", confidence: 0, message: "No image URI provided." };
  }

  try {
    const base64Image = await getBase64(imageUri); // Convert image to Base64

    const requestBody = {
      requests: [
        {
          image: { content: base64Image }, // Pass Base64-encoded image
          features: [
            { type: "LABEL_DETECTION", maxResults: 20 }, // Increase maxResults for better accuracy
            { type: "LANDMARK_DETECTION", maxResults: 5 }, // Ensure LANDMARK_DETECTION is specified
          ],
        },
      ],
    };

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      requestBody
    );

    const data = response.data.responses?.[0] || {};

    if (data.error) {
      console.error("Google Vision API Response Error:", data.error.message);
      return { name: "Error", confidence: 0, message: data.error.message };
    }

    if (!data.labelAnnotations?.length && !data.landmarkAnnotations?.length) {
      return { name: "Not Recognized", confidence: 0, message: "No objects recognized in the image." };
    }

    const labels = data.labelAnnotations || [];
    const landmarks = data.landmarkAnnotations || [];

    let result = {
      name: "Unknown",
      confidence: 0,
      imageUri,
      labels: labels.map((label) => ({
        name: label.description,
        confidence: label.score,
      })),
    };

    if (landmarks.length > 0) {
      const landmark = landmarks[0];
      result = {
        ...result,
        name: landmark.description,
        confidence: landmark.score,
        location: landmark.locations?.[0]?.latLng || null,
        latitude: landmark.locations?.[0]?.latLng?.latitude || null,
        longitude: landmark.locations?.[0]?.latLng?.longitude || null,
        description: landmark.description?.trim() || "No description available",
        built: landmark.properties?.built || "Unknown", // Ensure built is set
        architect: landmark.properties?.architect || "Unknown", // Ensure architect is set
        style: landmark.properties?.style || "Unknown", // Ensure style is set
        significance: landmark.properties?.significance || "Unknown", // Ensure significance is set
      };
    } else if (labels.length > 0) {
      const bestMatch = labels[0];
      result.name = bestMatch.description;
      result.confidence = bestMatch.score;
    }

    // Fetch Wikipedia only if a valid name is detected
    const wikiData = result.name !== "Unknown" ? await fetchWikipedia(result.name) : {};
    return { ...result, ...wikiData };
  } catch (error) {
    console.error("Google Vision API Error:", error?.response?.data || error.message);

    return { name: "Error", confidence: 0, message: "Google Vision API request failed." };
  }
}
