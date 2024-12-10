import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import { aiService } from '@/services/ai';
import type { Event, EventType } from '@/types/event';

export default function AddEventScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EventType>('fixed');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      // Validate datetime format for fixed events
      if (type === 'fixed') {
        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegex.test(startTime) || !dateRegex.test(endTime)) {
          alert('Please enter dates in format: YYYY-MM-DD HH:mm');
          return;
        }
      }

      const newEvent: Event = {
        id: Date.now().toString(),
        title,
        location,
        type,
        startTime: type === 'fixed' ? new Date(startTime.replace(' ', 'T')).toISOString() : undefined,
        endTime: type === 'fixed' ? new Date(endTime.replace(' ', 'T')).toISOString() : undefined,
        duration: type === 'flexible' 
          ? parseInt(duration, 10) 
          : Math.round((new Date(endTime.replace(' ', 'T')).getTime() - new Date(startTime.replace(' ', 'T')).getTime()) / (1000 * 60)),
        note
      };

      console.log("[Debug] Before AI suggestion");
      if (type === 'flexible') {
        setIsLoading(true);
        try {
          const events = await storage.getEvents();
          console.log("[Debug] Calling AI service");
          const suggestion = await aiService.suggestTime(events, newEvent);
          console.log("[Debug] AI suggestion received:", suggestion);
          
          if (suggestion) {
            try {
              console.log("[Debug] Raw suggestion:", suggestion);
              console.log("[Debug] Suggestion type:", typeof suggestion);
              
              // Ensure we have a proper object by parsing if it's a string
              const suggestionData = typeof suggestion === 'string' ? JSON.parse(suggestion) : suggestion;
              console.log("[Debug] Processed suggestion:", suggestionData);
              
              const startDate = new Date(suggestionData.startingTime);
              console.log("[Debug] Start date components:", {
                input: suggestionData.startingTime,
                parsed: startDate,
                timestamp: startDate.getTime()
              });
              
              if (isNaN(startDate.getTime())) {
                throw new Error(`Invalid date format. Received: ${suggestionData.startingTime}`);
              }

              // Update the event with the suggestion
              newEvent.aiSuggestion = suggestionData;
              newEvent.startTime = new Date(suggestionData.startingTime).toISOString();
              
              // Calculate end time
              const durationInMs = (newEvent.duration as number) * 60000;
              const endTimeMs = startDate.getTime() + durationInMs;
              newEvent.endTime = new Date(endTimeMs).toISOString();
              
              console.log("[Debug] Final event data:", {
                startTime: newEvent.startTime,
                endTime: newEvent.endTime,
                duration: newEvent.duration,
                durationInMs
              });
            } catch (dateError) {
              console.error("[Debug] Date calculation error:", dateError);
              console.error("[Debug] Current event state:", newEvent);
              alert('Error processing the suggested time. Please try again.');
              return;
            }
          }
        } catch (dateError) {
          console.error("[Debug] Date calculation error:", dateError);
          console.error("[Debug] Current event state:", newEvent);
          alert('Error processing the suggested time. Please try again.');
          return;
        } finally {
          setIsLoading(false);
        }
      }

      const events = await storage.getEvents();
      console.log("[Debug] New event:", newEvent);
      await storage.saveEvents([...events, newEvent]);
      const savedEvents = await storage.getEvents();
      console.log("[Debug] Events saved:", savedEvents);
      
      // Reset all form values
      setTitle('');
      setLocation('');
      setType('fixed');
      setStartTime('');
      setEndTime('');
      setNote('');
      setDuration('');
      
      router.back();
    } catch (error) {
      setIsLoading(false);
      console.error("[Debug] Error in handleSubmit:", error);
      alert('An error occurred while saving the event');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-6">
        <View className="mb-6">
          <ThemedText className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
            Event Title
          </ThemedText>
          <TextInput
            className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
            placeholder="Enter event title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        <View className="mb-6">
          <ThemedText className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
            Location
          </ThemedText>
          <TextInput
            className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
            placeholder="Enter location"
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View className="flex-row items-center mb-6 justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <ThemedText className="text-base font-medium">Flexible Event</ThemedText>
          <Switch
            value={type === 'flexible'}
            onValueChange={(value: boolean) => setType(value ? 'flexible' : 'fixed')}
            ios_backgroundColor="#3B82F6"
          />
        </View>

        {type === 'flexible' ? (
          <View className="mb-6">
            <ThemedText className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
              Duration (minutes)
            </ThemedText>
            <TextInput
              className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
              placeholder="Enter duration in minutes"
              placeholderTextColor="#9CA3AF"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
        ) : (
          <View className="mb-6">
            <View className="mb-4">
              <ThemedText className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                Start Time (YYYY-MM-DD HH:mm)
              </ThemedText>
              <TextInput
                className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
                placeholder="2024-03-15 14:30"
                placeholderTextColor="#9CA3AF"
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
            <View>
              <ThemedText className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                End Time (YYYY-MM-DD HH:mm)
              </ThemedText>
              <TextInput
                className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
                placeholder="2024-03-15 15:30"
                placeholderTextColor="#9CA3AF"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>
        )}

        <View className="mb-6">
          <ThemedText className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
            Notes
          </ThemedText>
          <TextInput
            className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[120px]"
            placeholder="Add any additional notes"
            placeholderTextColor="#9CA3AF"
            multiline
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`p-4 rounded-xl ${isLoading ? 'bg-blue-400' : 'bg-blue-500'} shadow-sm`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText className="text-white text-center font-medium text-base">
              Add Event
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 