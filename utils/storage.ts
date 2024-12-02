import { Event } from '../types/event';

interface UserData {
  username: string;
  password: string;
}

// In-memory storage
const memoryStorage: {
  events: Event[];
  userData: UserData | null;
} = {
  events: [{"duration": 60, "endTime": "2024-12-02T18:00:00.000Z", "id": "1733003579275", "location": "Zoom", "note": "", "startTime": "2024-12-02T17:00:00.000Z", "title": "Morning meeting for CS 409", "type": "fixed"}, {"duration": 60, "endTime": "2024-12-02T23:00:00.000Z", "id": "1733003642173", "location": "SCD Room 1001", "note": "", "startTime": "2024-12-02T22:00:00.000Z", "title": "Afternoon appointment for DTX 495", "type": "fixed"}],
  userData: null
};

export const storage = {
  async saveEvents(events: Event[]): Promise<void> {
    try {
      memoryStorage.events = events;
    } catch (error) {
      console.error('Error saving events:', error);
    }
  },

  async getEvents(): Promise<Event[]> {
    try {
      return memoryStorage.events;
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  },

  async saveUser(userData: UserData): Promise<void> {
    try {
      memoryStorage.userData = userData;
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser(): Promise<UserData | null> {
    try {
      return memoryStorage.userData;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}; 