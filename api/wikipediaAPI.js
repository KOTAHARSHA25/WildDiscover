import axios from "axios";

/**
 * Fetches Wikipedia summary and link for a given query.
 * @param {string} query - The search term.
 * @returns {object} - Wikipedia link and description.
 */
export default async function fetchWikipedia(query) {
  if (!query) {
    console.warn("fetchWikipedia: Empty query provided.");
    return { wikipediaLink: null, description: "No valid query provided." };
  }

  const wikipediaURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(wikipediaURL, { timeout: 5000 }); // 5s timeout

    if (response.status === 200 && response.data?.title) {
      return {
        wikipediaLink: response.data?.content_urls?.desktop?.page || null,
        description: response.data?.extract || "No description available.",
      };
    }

    console.warn(`fetchWikipedia: No Wikipedia data found for "${query}".`);
    return {
      wikipediaLink: `https://www.google.com/search?q=${encodeURIComponent(query)}+site:wikipedia.org`,
      description: "No Wikipedia information found. Try searching manually.",
    };
  } catch (error) {
    console.error(`Wikipedia API Error for "${query}":`, error?.response?.status || error.message);

    return {
      wikipediaLink: `https://www.google.com/search?q=${encodeURIComponent(query)}+site:wikipedia.org`,
      description: "Error fetching Wikipedia data. Click the link to search manually.",
    };
  }
}
