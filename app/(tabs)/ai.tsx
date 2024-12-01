import { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import type { Event } from '@/types/event';
import { format } from 'date-fns';

export default function AIInsightsScreen() {
  const [flexibleEvents, setFlexibleEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    const events = await storage.getEvents();
    const filteredEvents = events.filter(event => event.type === 'flexible' && event.aiSuggestion);
    const sortedEvents = filteredEvents.sort((a, b) => 
      new Date(a.aiSuggestion!.startingTime).getTime() - new Date(b.aiSuggestion!.startingTime).getTime()
    );
    setFlexibleEvents(sortedEvents);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <ScrollView 
      className="flex-1 bg-white dark:bg-gray-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        <ThemedText type="title" className="mb-6">AI Suggestions</ThemedText>
        
        {flexibleEvents.map(event => (
          <View 
            key={event.id}
            className="p-4 mb-4 bg-blue-50 dark:bg-blue-900 rounded-lg"
          >
            <ThemedText type="defaultSemiBold" className="mb-2">
              {event.title}
            </ThemedText>
            
            <ThemedText className="mb-1">
              Suggested Time: {format(new Date(event.aiSuggestion!.startingTime), 'PPpp')}
            </ThemedText>
            
            <ThemedText className="text-gray-600 dark:text-gray-300">
              Reason: {event.aiSuggestion!.reason}
            </ThemedText>
            
            <View className="mt-2 p-2 bg-white dark:bg-gray-800 rounded">
              <ThemedText className="text-sm">
                Location: {event.location}
              </ThemedText>
              {event.note && (
                <ThemedText className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                  Note: {event.note}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
        
        {flexibleEvents.length === 0 && (
          <ThemedText className="text-center text-gray-500">
            No AI suggestions available. Add some flexible events to get started!
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
} 