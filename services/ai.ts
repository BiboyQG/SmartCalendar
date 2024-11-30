import OpenAI from 'openai';
import { Event } from '../types/event';

const openai = new OpenAI({
  apiKey: "dummy",
  baseURL: "http://192.168.0.72:8000/v1",
});

interface AISuggestion {
  startingTime: string;
  reason: string;
}

export const aiService = {
  async suggestTime(fixedEvents: Event[], flexibleEvent: Event): Promise<AISuggestion | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "Qwen/Qwen2.5-14B-Instruct-AWQ",
        messages: [
          {
            role: "system",
            content: "You are a smart calendar assistant. You help schedule flexible events around fixed events. Always respond with a JSON object containing startingTime (ISO string) and reason (string explaining the choice)."
          },
          {
            role: "user",
            content: `Fixed events: ${JSON.stringify(fixedEvents)}. Please suggest a time for this flexible event: ${JSON.stringify(flexibleEvent)}`
          }
        ]
      });

      const content = response.choices[0].message.content;
      if (!content) return null;
      const suggestion = JSON.parse(content);
      return suggestion as AISuggestion;
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      return null;
    }
  }
}; 