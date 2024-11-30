import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import type { Event } from '@/types/event';

export default function ScheduleScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const storedEvents = await storage.getEvents();
    setEvents(storedEvents);
  };

  const getDayEvents = () => {
    return events.filter(event => {
      const eventDate = event.startTime?.split('T')[0];
      return eventDate === selectedDate;
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true }
        }}
        theme={{
          selectedDayBackgroundColor: '#3b82f6',
          todayTextColor: '#3b82f6',
          arrowColor: '#3b82f6',
        }}
      />
      
      <ScrollView className="flex-1 px-4 py-2">
        <ThemedText type="subtitle" className="mb-4">
          Events for {selectedDate}
        </ThemedText>
        
        {getDayEvents().map(event => (
          <View 
            key={event.id}
            className="p-4 mb-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
            <ThemedText>{event.location}</ThemedText>
            {event.startTime && (
              <ThemedText>
                {format(new Date(event.startTime), 'HH:mm')}
                {event.endTime && ` - ${format(new Date(event.endTime), 'HH:mm')}`}
              </ThemedText>
            )}
            <ThemedText className="text-gray-600 dark:text-gray-400">
              {event.type}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}