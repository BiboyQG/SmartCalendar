import { Event } from '../types/event';
import { format } from 'date-fns';

interface AISuggestion {
  startingTime: string;
  reason: string;
}

const timeOffset = 6;

export const aiService = {
  async suggestTime(fixedEvents: Event[], flexibleEvent: Event): Promise<AISuggestion | null> {
    try {
      // Convert UTC times to local times for fixed events
      const localFixedEvents = fixedEvents.map(event => ({
        ...event,
        startTime: event.startTime ? format(new Date(event.startTime), 'yyyy-MM-dd HH:mm') : undefined,
        endTime: event.endTime ? format(new Date(event.endTime), 'yyyy-MM-dd HH:mm') : undefined
      }));

      const response = await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fixedEvents: JSON.stringify(localFixedEvents),
          flexibleEvent: JSON.stringify(flexibleEvent)
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorBody}`);
      }

      const suggestion = await response.json();
      console.log('Raw suggestion:', suggestion);
      
      return suggestion as AISuggestion;
      
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      return null;
    }
  }
}; 