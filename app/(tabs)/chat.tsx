import { useState, useRef, useCallback } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { aiService } from '@/services/ai';

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

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const events = await storage.getEvents();
      const data = await aiService.identifyEventToReschedule(inputText, events);
      console.log('Response data:', data);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.event_id 
          ? `Found event with ID: ${data.event_id}` 
          : "I couldn't identify which event you're referring to. Could you please be more specific?",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      const selectedEvent = events.find(event => event.id === data.event_id);

      if (selectedEvent) {
        console.log('Selected event:', selectedEvent);
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