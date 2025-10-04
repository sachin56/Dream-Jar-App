import { Stack } from 'expo-router';

export default function AuthLayout() {
  // This layout will have no header and no tabs.
  return <Stack screenOptions={{ headerShown: false }} />;
}