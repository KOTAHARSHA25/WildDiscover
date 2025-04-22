import axios from "axios";
import { ANIMAL_API_KEY } from "../config/config.js";
import fetchWikipedia from "./wikipediaAPI.js";
import { identifyWithGoogleVision } from "./googleVisionAPI.js";
import * as FileSystem from "expo-file-system";
import { identifyWithPollinations } from "./pollinationsAPI.js"; // Import Pollinations API

/**
 * Identifies an animal using API Ninjas' Animal API & fetches Wikipedia data.
 * @param {string} imageUri - Image URI.
 * @param {object} visionResult - Result from Google Vision API.
 * @returns {object} - Formatted response for ResultScreen.js.
 */
export async function identifyAnimal(imageUri, visionResult) {
  if (!imageUri) {
    console.error("identifyAnimal: No image URI provided.");
    return { name: "Error", confidence: 0, message: "No image URI provided." };
  }

  try {
    const imageInfo = await FileSystem.getInfoAsync(imageUri);
    if (!imageInfo.uri) {
      throw new Error("Image URI is undefined");
    }

    const imageType = imageInfo.uri.split('.').pop().toLowerCase();
    const supportedTypes = ['jpeg', 'jpg', 'png', 'bmp'];
    if (!supportedTypes.includes(imageType)) {
      throw new Error(`Unsupported image type: ${imageType}`);
    }

    const animalName = visionResult.name;

    if (!animalName || visionResult.confidence < 0.7) {
      return { name: "Unknown", confidence: 0, message: "Animal could not be confidently identified." };
    }

    // Determine if the detected fauna is a bird or insect
    const isBirdOrInsect = visionResult.labels.some(label => 
      label.name.toLowerCase().includes("bird") || label.name.toLowerCase().includes("insect") ||
      label.name.toLowerCase().includes("butterfly") || label.name.toLowerCase().includes("bee") ||
      label.name.toLowerCase().includes("wasp") || label.name.toLowerCase().includes("moth")
    );

    if (isBirdOrInsect) {
      console.log(`Fetching data from Pollinations.ai for: ${animalName}`);
      const pollinationsResult = await identifyWithPollinations(imageUri);

      if (pollinationsResult.name !== "Unknown") {
        console.log(`Fetching additional details from API Ninjas for: ${pollinationsResult.name}`);
        const additionalDetails = await fetchAnimalDetails(pollinationsResult.name);

        console.log("Additional Details from API Ninjas:", additionalDetails);

        return {
          ...pollinationsResult,
          ...additionalDetails // Merge API Ninjas data
        };
      }

      return pollinationsResult;
    }

    console.log(`identifyAnimal: Sending request for ${animalName}`);
    const response = await axios.get(
      `https://api.api-ninjas.com/v1/animals?name=${animalName}`,
      {
        headers: { "X-Api-Key": ANIMAL_API_KEY },
        timeout: 5000, // 5 seconds timeout
      }
    );

    if (response.status === 400) {
      console.error("Animal API Error: Bad Request");
      return { name: "Error", confidence: 0, message: "Bad Request to Animal API." };
    }

    const animalData = response.data?.[0]; // Get first result if available
    if (!animalData) return { name: "Unknown", confidence: 0 };

    const wikiData = await fetchWikipedia(animalName);

    return {
      name: animalName,
      confidence: animalData.confidence || 0.9, // Default to 90% if missing
      scientificName: animalData.taxonomy?.scientific_name || "N/A",
      family: animalData.taxonomy?.family || "N/A",
      diet: animalData.characteristics?.diet || "Unknown",
      lifespan: animalData.characteristics?.lifespan || "Unknown",
      habitat: animalData.characteristics?.habitat || "Unknown",
      conservationStatus: animalData.conservation_status || "Not Evaluated",
      prey: animalData.characteristics?.prey || "Unknown",
      groupBehavior: animalData.characteristics?.group_behavior || "Unknown",
      topSpeed: animalData.characteristics?.top_speed || "Unknown",
      weight: animalData.characteristics?.weight || "Unknown",
      height: animalData.characteristics?.height || "Unknown",
      ...wikiData // Wikipedia description & link
    };
  } catch (error) {
    console.error("Animal API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return { 
      name: "Unknown Animal", 
      confidence: 0, 
      message: "Identification failed. Try using a clearer image." 
    };
  }
}

// Helper function to fetch additional animal details from API Ninjas
export async function fetchAnimalDetails(animalName) {
  console.log(`Fetching details for ${animalName} from API Ninjas...`);
  try {
    const response = await axios.get(
      `https://api.api-ninjas.com/v1/animals?name=${animalName}`,
      {
        headers: { "X-Api-Key": ANIMAL_API_KEY },
        timeout: 5000, // 5 seconds timeout
      }
    );

    console.log("Full API Response:", JSON.stringify(response.data, null, 2));

    if (response.status === 400) {
      console.error("Animal API Error: Bad Request");
      return {};
    }

    const animalData = response.data?.[0]; // Get first result if available
    if (!animalData) {
      console.error("No additional details found.");
      return {};
    }

    return {
      scientificName: animalData.taxonomy?.scientific_name || "N/A",
      family: animalData.taxonomy?.family || "N/A",
      diet: animalData.characteristics?.diet || "Unknown",
      lifespan: animalData.characteristics?.lifespan || "Unknown",
      habitat: animalData.characteristics?.habitat || "Unknown",
      conservationStatus: animalData.conservation_status || "Not Evaluated",
      prey: animalData.characteristics?.prey || "Unknown",
      groupBehavior: animalData.characteristics?.group_behavior || "Unknown",
      topSpeed: animalData.characteristics?.top_speed || "Unknown",
      weight: animalData.characteristics?.weight || "Unknown",
      height: animalData.characteristics?.height || "Unknown"
    };
  } catch (error) {
    console.error("fetchAnimalDetails Error:", error.message);
    return {};
  }
}
