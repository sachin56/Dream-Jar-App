import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function AppTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Each screen inside can have its own header if needed
        tabBarActiveTintColor: '#34D399',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0'
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-goal"
        options={{
          title: 'Add Goal',
          tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
      
      {/* This screen is part of the (app) group but is hidden from the tab bar */}
      <Tabs.Screen name="goal-detail" options={{ href: null }} />
    </Tabs>
  );
}