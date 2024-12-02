import { useState, useRef, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { aiService } from '@/services/ai';
import { format } from 'date-fns';
import { Event } from '@/types/event';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    const messageText = inputText.trim();
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const events = await storage.getEvents();
      const data = await aiService.identifyEventToReschedule(messageText, events);
      console.log('Response data:', data);

      const selectedEvent = events.find(event => event.id === data.event_id);
      
      if (data.event_id && selectedEvent) {
        // First response confirming the event
        const confirmMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I'll help you reschedule: ${selectedEvent.title} at ${selectedEvent.location} from ${selectedEvent.startTime ? format(new Date(selectedEvent.startTime), 'HH:mm') : ''} to ${selectedEvent.endTime ? format(new Date(selectedEvent.endTime), 'HH:mm') : ''}`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMessage]);

        // Get the rescheduling suggestion
        const otherEvents = events.filter(event => event.id !== data.event_id);
        const suggestion = await aiService.suggestRescheduleTime(selectedEvent, otherEvents);
        if (suggestion) {
            const suggestionData = typeof suggestion === 'string' ? JSON.parse(suggestion) : suggestion;
            suggestionData.startingTime = new Date(suggestionData.startingTime).toISOString();
            
            // Update the selected event with new times
            const updatedEvent: Event = {
              ...selectedEvent,
              startTime: suggestionData.startingTime,
              endTime: new Date(new Date(suggestionData.startingTime).getTime() + (selectedEvent.duration || 0) * 60000).toISOString(),
              aiSuggestion: suggestionData
            };

            // Update the events in storage
            console.log("[Debug] Events before update:", events);
            const updatedEvents = events.map(event => 
              event.id === selectedEvent.id ? updatedEvent : event
            );
            await storage.saveEvents(updatedEvents);
            console.log("[Debug] Events after update:", updatedEvents);
            
            const suggestionMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: `I suggest rescheduling to ${format(new Date(suggestionData.startingTime), 'HH:mm')}. ${suggestionData.reason}`,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, suggestionMessage]);
        }
      } else {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I couldn't identify which event you're referring to. Could you please be more specific?",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your request.",
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [inputText]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 max-w-[80%] ${
              message.sender === 'user' ? 'self-end ml-auto' : 'self-start'
            }`}
          >
            <View
              className={`p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}
            >
              <ThemedText
                className={message.sender === 'user' ? 'text-white' : ''}
              >
                {message.text}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <View className="flex-row items-center space-x-2">
          <TextInput
            className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-full mr-3"
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
          >
            <IconSymbol name="paperplane" color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
} 