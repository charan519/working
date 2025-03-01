import axios from 'axios';

// Use a public API key for demo purposes - in production, this should be secured
const GEMINI_API_KEY = "AIzaSyBmQToauNZi5ZILZqTj58JKVQleIj9oJKU";

/**
 * Generate an AI-powered travel itinerary using Google's Gemini API
 * @param destination The destination for the itinerary
 * @param days Number of days for the trip
 * @param preferences User preferences (e.g., "family-friendly", "outdoor activities")
 * @returns The generated itinerary text
 */
export async function generateAIItinerary(destination: string, days: number, preferences: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: `Create a detailed travel itinerary for ${destination} for ${days} days. 
                  Consider preferences: ${preferences}. 
                  Include places to visit, activities, and food recommendations.
                  Format the response with clear day headers, times, and activities.
                  Use markdown format with:
                  - # for the title
                  - ## for day headers
                  - Times in bold (e.g., **8:00 AM**)
                  - Activities after each time
                  - A notes section at the end`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      // Return a string error message instead of throwing an Error object
      return formatMockItinerary(destination, days, preferences);
    }
  } catch (error) {
    // Handle the error safely without throwing
    console.error('Error generating AI itinerary:', error instanceof Error ? error.message : String(error));
    return formatMockItinerary(destination, days, preferences);
  }
}

/**
 * Format a mock itinerary when the API call fails
 */
function formatMockItinerary(destination: string, days: number, preferences: string): string {
  return `# ${destination} Itinerary - ${days} Day${days > 1 ? 's' : ''}

## Day 1
- **8:00 AM**: Breakfast at local café
- **9:30 AM**: Visit the main attractions in ${destination}
- **12:30 PM**: Lunch at a popular local restaurant
- **2:00 PM**: Explore museums and cultural sites
- **6:00 PM**: Dinner with local cuisine
- **8:00 PM**: Evening walk or entertainment

${days > 1 ? `
## Day 2
- **8:30 AM**: Morning coffee and pastries
- **10:00 AM**: Outdoor activities${preferences.includes('outdoor') ? ' (hiking, parks, or nature reserves)' : ''}
- **1:00 PM**: Lunch at a trendy spot
- **3:00 PM**: Shopping or relaxation time
- **7:00 PM**: Dinner at a highly-rated restaurant
- **9:00 PM**: Nightlife or relaxing evening${preferences.includes('family') ? ' with family' : ''}
` : ''}

${days > 2 ? `
## Day 3
- **9:00 AM**: Leisurely breakfast
- **10:30 AM**: Day trip to nearby attractions
- **1:30 PM**: Picnic lunch or local eatery
- **3:30 PM**: Visit to unique local spots
- **6:30 PM**: Farewell dinner
- **8:30 PM**: Final evening activities
` : ''}

**Notes:**
- This itinerary is customized based on your preferences: ${preferences}
- All times are approximate and can be adjusted
- Transportation options include: public transit, walking, or rental car
`;
}

/**
 * Generate AI recommendations for places to visit based on user preferences
 * @param location Current location coordinates [lat, lon]
 * @param preferences User preferences
 * @returns List of recommended places with descriptions
 */
export async function generatePlaceRecommendations(
  location: [number, number], 
  preferences: string
): Promise<any[]> {
  try {
    const [lat, lon] = location;
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: `Based on the location coordinates (${lat}, ${lon}), suggest 5 interesting places to visit nearby. 
                  Consider preferences: ${preferences}.
                  Return the response as a JSON array with each place having: name, description, category, and estimated distance.`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const text = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response text
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Error parsing JSON from AI response:', e instanceof Error ? e.message : String(e));
          return [];
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error generating place recommendations:', error instanceof Error ? error.message : String(error));
    return [];
  }
}