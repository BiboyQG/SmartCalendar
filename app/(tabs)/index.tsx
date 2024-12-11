import { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import type { Event } from '@/types/event';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ScheduleScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    const storedEvents = await storage.getEvents();
    setEvents(storedEvents);
  };

  const getDayEvents = () => {
    return events
      .filter(event => {
        if (!event.startTime) return false;
        const eventDate = format(new Date(event.startTime), 'yyyy-MM-dd');
        return eventDate === selectedDate;
      })
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
  };

  const getMarkedDates = () => {
    const marked: { [key: string]: { selected?: boolean; marked?: boolean } } = {
      [selectedDate]: { selected: true }
    };
    
    events.forEach(event => {
      if (event.startTime) {
        const eventDate = format(new Date(event.startTime), 'yyyy-MM-dd');
        if (eventDate !== selectedDate) {
          marked[eventDate] = { marked: true };
        }
      }
    });
    
    return marked;
  };

  const navigateToEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          selectedDayBackgroundColor: '#3b82f6',
          todayTextColor: '#3b82f6',
          arrowColor: '#3b82f6',
          dotColor: '#3b82f6',
        }}
      />
      
      <ScrollView className="flex-1 px-4 py-2">
        <ThemedText type="subtitle" className="mb-4">
          Events for {selectedDate}
        </ThemedText>
        
        {getDayEvents().map(event => (
          <TouchableOpacity 
            key={event.id}
            onPress={() => navigateToEventDetail(event.id)}
            className="mb-3"
          >
            <View className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <View className="flex-row justify-between items-start mb-2">
                <ThemedText type="defaultSemiBold" className="flex-1 mr-2">
                  {event.title}
                </ThemedText>
                <View className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                  <ThemedText className="text-xs text-blue-800 dark:text-blue-200">
                    {event.type}
                  </ThemedText>
                </View>
              </View>
              
              <View className="space-y-1">
                <View className="flex-row items-center">
                  <ThemedText className="text-gray-600 dark:text-gray-400">
                    📍 {event.location}
                  </ThemedText>
                </View>
                
                {event.startTime && (
                  <View className="flex-row items-center">
                    <ThemedText className="text-gray-600 dark:text-gray-400">
                      🕒 {format(new Date(event.startTime), 'HH:mm')}
                      {event.endTime && ` - ${format(new Date(event.endTime), 'HH:mm')}`}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        {getDayEvents().length === 0 && (
          <View className="py-8">
            <ThemedText className="text-center text-gray-500">
              No events scheduled for this day
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/add')}
      >
        <IconSymbol name="plus" color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}
