import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Switch } from 'react-native';
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
      console.error("[Debug] Error in handleSubmit:", error);
      alert('An error occurred while saving the event');
    }
  };

  return (
    <View className="flex-1 p-4 bg-white dark:bg-gray-900">
      <TextInput
        className="p-2 mb-4 border border-gray-300 dark:border-gray-700 rounded"
        placeholder="Event Title"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        className="p-2 mb-4 border border-gray-300 dark:border-gray-700 rounded"
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <View className="flex-row items-center mb-4">
        <ThemedText>Flexible Event</ThemedText>
        <Switch
          value={type === 'flexible'}
          onValueChange={(value: boolean) => setType(value ? 'flexible' : 'fixed')}
        />
      </View>

      {type === 'flexible' ? (
        <View className="mb-4">
          <TextInput
            className="p-2 border border-gray-300 dark:border-gray-700 rounded"
            placeholder="Duration (minutes)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>
      ) : (
        <View className="mb-4">
          <View className="mb-2">
            <ThemedText>Start Time (YYYY-MM-DD HH:mm):</ThemedText>
            <TextInput
              className="p-2 border border-gray-300 dark:border-gray-700 rounded"
              placeholder="2024-03-15 14:30"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View>
            <ThemedText>End Time (YYYY-MM-DD HH:mm):</ThemedText>
            <TextInput
              className="p-2 border border-gray-300 dark:border-gray-700 rounded"
              placeholder="2024-03-15 15:30"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>
      )}

      <TextInput
        className="p-2 mb-4 h-32 border border-gray-300 dark:border-gray-700 rounded"
        placeholder="Notes"
        multiline
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity
        className="bg-blue-500 p-3 rounded"
        onPress={handleSubmit}
      >
        <ThemedText className="text-white text-center">Add Event</ThemedText>
      </TouchableOpacity>
    </View>
  );
} 