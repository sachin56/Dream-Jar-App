import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router, useRootNavigationState } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. --- Auth Context ---
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// 2. --- Session Provider ---
function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const MIN_SPLASH_TIME = 1500; // 1.5 seconds

      try {
        const startTime = Date.now();
        const token = await AsyncStorage.getItem('token');
        setSession(token);
        console.log("Session restored. Token found:", token ? 'Yes' : 'No');
        
        const elapsedTime = Date.now() - startTime;
        const delay = Math.max(MIN_SPLASH_TIME - elapsedTime, 0);

        setTimeout(() => {
          setIsLoading(false);
        }, delay);
        
      } catch (e) {
        console.error("Failed to load token from storage", e);
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signIn = async (token) => {
    setSession(token);
    await AsyncStorage.setItem('token', token);
    router.replace('/(app)/home');
  };

  const signOut = async () => {
    setSession(null);
    await AsyncStorage.removeItem('token');
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ signIn, signOut, session, isLoading }}>
      {children}
    </AuthContext.Provider> // ✅ CORRECTED CLOSING TAG
  );
}

// 3. --- The Main Layout Component ---
function RootLayout() {
  const { session, isLoading } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    console.log('Auth state changed. isLoading:', isLoading, 'Has session:', !!session);
    
    if (isLoading || !navigationState?.key) {
      console.log('Navigation not ready or still loading, waiting...');
      return;
    }

    if (session) {
      console.log('Redirecting to app home...');
      router.replace('/(app)/home');
    } else {
      console.log('Redirecting to login...');
      router.replace('/(auth)/login');
    }
  }, [isLoading, session, navigationState?.key]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

// 4. --- Final Export ---
export default function Layout() {
  return (
    <SessionProvider>
      <RootLayout />
    </SessionProvider>
  );
}