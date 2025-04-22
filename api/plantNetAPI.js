import axios from "axios";
import { PLANT_NET_API_KEY } from "../config/config.js";
import fetchWikipedia from "./wikipediaAPI.js";
import FormData from "form-data";
import * as FileSystem from "expo-file-system";

/**
 * Identifies a plant using PlantNet API & fetches Wikipedia data.
 * @param {string} imageUri - Image URI.
 * @returns {object} - Formatted response for ResultScreen.js.
 */
export async function identifyPlant(imageUri) {
  if (!imageUri) {
    console.error("identifyPlant: No image URI provided.");
    return { name: "Error", confidence: 0, message: "No image URI provided." };
  }

  try {
    const form = new FormData();
    form.append("organs", "leaf");

    const imageInfo = await FileSystem.getInfoAsync(imageUri);
    if (!imageInfo.uri) {
      throw new Error("Image URI is undefined");
    }

    const imageType = imageInfo.uri.split('.').pop().toLowerCase();
    const supportedTypes = ['jpeg', 'jpg', 'png', 'bmp'];
    if (!supportedTypes.includes(imageType)) {
      throw new Error(`Unsupported image type: ${imageType}`);
    }

    form.append("images", {
      uri: imageInfo.uri,
      type: `image/${imageType}`,
      name: `photo.${imageType}`,
    });

    const response = await axios.post(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANT_NET_API_KEY}`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    const plantData = response.data.results?.[0];

    if (!plantData) return { name: "Unknown", confidence: 0 };

    const scientificName = plantData.species?.scientificNameWithoutAuthor || "N/A";
    const family = plantData.species?.family?.scientificName || "Unknown";
    const plantType = plantData.species?.vegetationType || "Unknown";
    const confidence = (plantData.score * 100).toFixed(2) || 0;
    
    const wikiData = await fetchWikipedia(scientificName);

    return {
      name: scientificName,
      confidence,
      scientificName,
      family,
      plantType,
      ...wikiData, // Wikipedia description & link
    };
  } catch (error) {
    console.error("PlantNet API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return { 
      name: "Unknown Plant", 
      confidence: 0, 
      message: "Identification failed. Try a clearer image." 
    };
  }
}
