import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { storage } from '@/utils/storage';
import { useColorScheme } from '@/hooks/useColorScheme';

import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    // Consider (tabs) and event routes as protected routes, but allow 'add' route
    const inProtectedRoute = segments[0] === '(tabs)' || 
                           segments[0] === 'event' || 
                           segments[0] === 'add';

    const checkAuth = async () => {
      const user = await storage.getUser();
      
      if (!user && inProtectedRoute) {
        // Redirect to login if no user and trying to access protected routes
        router.replace('/login');
      } else if (user && !inProtectedRoute && segments[0] !== '+not-found') {
        // Redirect to home if user exists and on auth screens
        router.replace('/(tabs)');
      }
    };

    checkAuth();
  }, [segments, navigationState?.key]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="login">
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: 'Event Details',
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff',
            }
          }} 
        />
        <Stack.Screen 
          name="add" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Add Event',
            headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#111827' : '#fff',
            }
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
