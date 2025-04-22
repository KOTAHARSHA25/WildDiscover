import axios from "axios";
import FormData from "form-data";
import * as FileSystem from "expo-file-system";
import fetchWikipedia from "./wikipediaAPI.js"; // Import fetchWikipedia

/**
 * Identifies a bird or insect using Pollinations.ai API.
 * @param {string} imageUri - Image URI.
 * @returns {object} - Formatted response with name and description.
 */
export async function identifyWithPollinations(imageUri) {
  if (!imageUri) {
    console.error("identifyWithPollinations: No image URI provided.");
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

    const base64Image = await FileSystem.readAsStringAsync(imageInfo.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const requestBody = {
      messages: [
        {
          role: "system",
          content: "You are a zoologist expert. Identify the animal in the image and provide its name and a brief description about it. The description should be 2-3 sentences maximum, written in simple language that anyone can understand. Include one interesting fact about it. Always respond in JSON format with keys 'name' and 'description'."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please identify this animal and provide its name and a brief description."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${imageType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      model: "openai",
      jsonMode: true,
      private: true
    };

    const response = await axios.post(
      'https://text.pollinations.ai/',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    if (!response.data) {
      throw new Error('API request failed');
    }

    const data = response.data;

    // Fetch Wikipedia data
    const wikiData = await fetchWikipedia(data.name);

    return {
      name: data.name || "Unknown",
      confidence: 0.9, // Default confidence
      description: data.description || "No description available.",
      ...wikiData // Wikipedia description & link
    };
  } catch (error) {
    console.error("Pollinations.ai API Error:", error.message);
    return { name: "Unknown", confidence: 0, message: "Identification failed. Try a clearer image." };
  }
}
