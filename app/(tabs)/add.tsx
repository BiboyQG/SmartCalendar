import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import { aiService } from '@/services/ai';
import type { Event, EventType } from '@/types/event';

export default function AddEventScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EventType>('fixed');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [note, setNote] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      location,
      type,
      startTime: type === 'fixed' ? startTime.toISOString() : undefined,
      endTime: type === 'fixed' ? endTime.toISOString() : undefined,
      duration: type === 'flexible' ? parseInt(duration, 10) : undefined,
      note
    };

    if (type === 'flexible') {
      const events = await storage.getEvents();
      const fixedEvents = events.filter(e => e.type === 'fixed');
      const suggestion = await aiService.suggestTime(fixedEvents, newEvent);
      if (suggestion) {
        newEvent.aiSuggestion = suggestion;
      }
    }

    const events = await storage.getEvents();
    await storage.saveEvents([...events, newEvent]);
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
          onValueChange={(value) => setType(value ? 'flexible' : 'fixed')}
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
            <ThemedText>Start Time:</ThemedText>
            <DateTimePicker
              value={startTime}
              mode="datetime"
              onChange={(_, date) => date && setStartTime(date)}
            />
          </View>
          <View>
            <ThemedText>End Time:</ThemedText>
            <DateTimePicker
              value={endTime}
              mode="datetime"
              onChange={(_, date) => date && setEndTime(date)}
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