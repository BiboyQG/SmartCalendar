import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { storage } from '@/utils/storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (username && password) {
      await storage.saveUser({ username, password });
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-gray-900">
      <View className="w-full max-w-sm space-y-4">
        <ThemedText type="title" className="text-center mb-8">
          Smart Calendar
        </ThemedText>
        
        <TextInput
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        
        <TextInput
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className="w-full bg-blue-500 p-3 rounded-lg"
          onPress={handleLogin}
        >
          <ThemedText className="text-white text-center font-semibold">
            Login
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
} 