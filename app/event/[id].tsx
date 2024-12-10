import { useLocalSearchParams, router } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      const events = await storage.getEvents();
      const foundEvent = events.find(e => e.id === id);
      setEvent(foundEvent || null);
    };
    loadEvent();
  }, [id]);

  if (!event) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header Section */}
      <View className="p-6 bg-blue-50 dark:bg-blue-900">
        <View className="flex-row justify-between items-start mb-4">
          <ThemedText type="title" className="text-2xl flex-1 mr-2">
            {event.title}
          </ThemedText>
          <View className="px-3 py-1.5 bg-blue-200 dark:bg-blue-800 rounded-full">
            <ThemedText className="text-xs font-medium text-blue-800 dark:text-blue-200">
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Details Section */}
      <View className="px-6 -mt-6">
        <View className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          {/* Location */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-2">
                <ThemedText>📍</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold">Location</ThemedText>
            </View>
            <ThemedText className="text-gray-600 dark:text-gray-400 ml-10">
              {event.location}
            </ThemedText>
          </View>

          {/* Time */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-2">
                <ThemedText>🕒</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold">Time</ThemedText>
            </View>
            <View className="ml-10">
              {event.startTime && (
                <ThemedText className="text-gray-600 dark:text-gray-400">
                  {format(new Date(event.startTime), 'PPp')}
                  {event.endTime && `\n↳ ${format(new Date(event.endTime), 'p')}`}
                </ThemedText>
              )}
              {event.duration && (
                <View className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full self-start">
                  <ThemedText className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: {event.duration} minutes
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Notes */}
          {event.note && (
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-2">
                  <ThemedText>📝</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold">Notes</ThemedText>
              </View>
              <ThemedText className="text-gray-600 dark:text-gray-400 ml-10">
                {event.note}
              </ThemedText>
            </View>
          )}

          {/* AI Suggestion */}
          {event.aiSuggestion && (
            <View className="mt-2">
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-2">
                  <ThemedText>✨</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold">AI Suggestion</ThemedText>
              </View>
              <View className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg ml-10">
                <View className="flex-row items-center mb-2">
                  <ThemedText className="text-blue-800 dark:text-blue-200">
                    Suggested Time: {format(new Date(event.aiSuggestion.startingTime), 'PPp')}
                  </ThemedText>
                </View>
                <ThemedText className="text-gray-600 dark:text-gray-400">
                  {event.aiSuggestion.reason}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Actions Section */}
      <View className="p-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl flex-row items-center justify-center"
        >
          <IconSymbol name="chevron.left" color="#3b82f6" />
          <ThemedText className="ml-2 text-blue-500">
            Back to Schedule
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 