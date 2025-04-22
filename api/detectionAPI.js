import { identifyWithGoogleVision } from './googleVisionAPI.js';
import { identifyPlant } from './plantNetAPI.js';
import { identifyAnimal, fetchAnimalDetails } from './animalAPI.js'; // Import fetchAnimalDetails
import { identifyWithPollinations } from './pollinationsAPI.js'; // Import Pollinations API

/**
 * Detects an object (flora, fauna, or landmark) using the appropriate API.
 * @param {string} imageUri - Image URI.
 * @param {string} type - Object type: "flora", "fauna", or "landmark".
 * @returns {object} - Detection results with name, confidence, and additional info.
 */
export async function detectObject(imageUri, type) {
  if (!imageUri) {
    console.error("detectObject: No image data provided.");
    return { name: "Error", confidence: 0, message: "No image data." };
  }

  if (!["flora", "fauna", "landmark"].includes(type)) {
    console.error(`detectObject: Invalid type '${type}'`);
    return { name: "Error", confidence: 0, message: "Invalid detection type." };
  }

  try {
    switch (type) {
      case "flora":
        return await identifyPlant(imageUri);

      case "fauna":
        // First, use Google Vision API to identify possible fauna
        const visionResult = await identifyWithGoogleVision(imageUri);

        // If Google Vision fails, return its result directly
        if (visionResult.name === "Not Recognized") {
          return visionResult;
        }

        // Determine if the detected fauna is a bird or insect
        const isBirdOrInsect = visionResult.labels.some(label => 
          label.name.toLowerCase().includes("bird") || label.name.toLowerCase().includes("insect") ||
          label.name.toLowerCase().includes("butterfly") || label.name.toLowerCase().includes("bee") ||
          label.name.toLowerCase().includes("wasp") || label.name.toLowerCase().includes("moth")
        );

        if (isBirdOrInsect) {
          // Use Pollinations.ai for birds and insects
          const pollinationsResult = await identifyWithPollinations(imageUri);
          
          if (pollinationsResult.name !== "Unknown") {
            console.log(`Passing Pollinations result to API Ninjas: ${pollinationsResult.name}`);
            const additionalDetails = await fetchAnimalDetails(pollinationsResult.name);
            return { ...pollinationsResult, ...additionalDetails };
          }

          return pollinationsResult;
        } else {
          // Use API Ninjas' Animal API for other animals
          const animalResult = await identifyAnimal(imageUri, visionResult);

          // If it's a low-confidence result, return "Needs Verification"
          if (animalResult.name === "Needs Verification") {
            return animalResult;
          }

          return animalResult;
        }

      case "landmark":
        return await identifyWithGoogleVision(imageUri);

      default:
        throw new Error("Unknown detection type.");
    }
  } catch (error) {
    console.error(`detectObject Error (${type}):`, error.message || "Unknown error");

    let errorMessage = "Detection failed.";
    if (error.response?.data) {
      errorMessage += ` API Response: ${JSON.stringify(error.response.data)}`;
    }

    return { name: "Error", confidence: 0, message: errorMessage };
  }
}
