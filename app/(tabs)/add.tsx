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

    if (type === 'flexible') {
      const events = await storage.getEvents();
      const fixedEvents = events.filter(e => e.type === 'fixed');
      const suggestion = await aiService.suggestTime(fixedEvents, newEvent);
      if (suggestion) {
        newEvent.aiSuggestion = suggestion;
        newEvent.startTime = suggestion.startingTime;
        const startDate = new Date(suggestion.startingTime);
        newEvent.endTime = new Date(startDate.getTime() + (newEvent.duration as number) * 60000).toISOString();
      }
    }

    const events = await storage.getEvents();
    await storage.saveEvents([...events, newEvent]);
    console.log('Events saved:', [...events, newEvent]);
    
    // Reset all form values
    setTitle('');
    setLocation('');
    setType('fixed');
    setStartTime('');
    setEndTime('');
    setNote('');
    setDuration('');
    
    router.back();
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