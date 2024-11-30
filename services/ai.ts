import { Event } from '../types/event';

interface AISuggestion {
  startingTime: string;
  reason: string;
}

export const aiService = {
  async suggestTime(fixedEvents: Event[], flexibleEvent: Event): Promise<AISuggestion | null> {
    try {
      const response = await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fixedEvents: JSON.stringify(fixedEvents),
          flexibleEvent: JSON.stringify(flexibleEvent)
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorBody}`);
      }

      const suggestion = await response.json();
      console.log(suggestion);
      return suggestion as AISuggestion;
      
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      return null;
    }
  }
}; 