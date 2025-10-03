import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // Consistent styles for all screens
        headerStyle: { backgroundColor: '#F7F9FC' }, // Matches the light background
        headerTintColor: '#1A202C', // Dark text for readability
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false, // Removes the bottom border for a flat, modern look
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          // The Login screen should not have a header
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home"
        options={{
          // Hide the default header to use the custom one inside the component
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-goal"
        options={{
          title: 'Create a New Goal',
          // Use presentation: 'modal' for a slide-up effect
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Feather name="x" size={24} color="#1A202C" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="goal-detail"
        options={{
          title: 'Goal Details',
          // Customize back button for consistency
          headerBackTitleVisible: false,
        }}
      />
    </Stack>
  );
}