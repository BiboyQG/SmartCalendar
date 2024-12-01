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
    <View className="flex-1 justify-center items-center p-8 bg-gray-50 dark:bg-gray-900">
      <View className="w-full max-w-sm space-y-6">
        <View className="space-y-2">
          <ThemedText type="title" className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            👋 Smart Calendar
          </ThemedText>
        </View>
        
        <View className="space-y-4">
          <View className="space-y-2">
            <TextInput
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm mt-10"
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View className="space-y-2">
            <TextInput
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm mt-5"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>
        
        <TouchableOpacity
          className="w-full bg-blue-600 p-3 rounded-xl shadow-sm active:bg-blue-700 mt-6"
          onPress={handleLogin}
        >
          <ThemedText type="defaultSemiBold" style={{ color: 'white' }} className="text-center font-semibold text-base">
            Sign In
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
} 