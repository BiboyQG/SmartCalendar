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
  events: [],
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