export type EventType = 'fixed' | 'flexible';

export interface Event {
  id: string;
  title: string;
  location: string;
  type: EventType;
  startTime?: string;
  endTime?: string;
  note?: string;
  aiSuggestion?: {
    startingTime: string;
    reason: string;
  };
}

export interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    dots?: Array<{ color: string }>;
  };
} 