import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiRequest } from './utils/apiHandler'; // Make sure this path is correct

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        const netInfoState = await NetInfo.fetch();

        if (netInfoState.isConnected) {
          try {
            // Online: Fetch fresh data from API and update local storage
            const [profileResponse, homeResponse] = await Promise.all([
              apiRequest('post', 'profile'),
              apiRequest('post', 'home'),
            ]);

            if (profileResponse.data) {
              const userData = profileResponse.data;
              setName(userData.name || '');
              setEmail(userData.email || '');
              await AsyncStorage.setItem('user', JSON.stringify(userData));
            }

            if (homeResponse.data && homeResponse.data.goals) {
              setGoals(homeResponse.data.goals);
              await AsyncStorage.setItem('goals', JSON.stringify(homeResponse.data.goals));
            }
          } catch (error) {
            Alert.alert("API Error", "Could not fetch latest data. Loading from device storage.");
            await loadOfflineData();
          }
        } else {
          // Offline: Load from local storage
          Alert.alert("You are Offline", "Showing previously saved data.");
          await loadOfflineData();
        }
        setIsLoading(false);
      };
      
      const loadOfflineData = async () => {
        try {
          const [userDataString, goalsDataString] = await Promise.all([
            AsyncStorage.getItem('user'),
            AsyncStorage.getItem('goals'),
          ]);

          if (userDataString) {
            const userData = JSON.parse(userDataString);
            setName(userData.name || '');
            setEmail(userData.email || '');
          }
          if (goalsDataString) {
            setGoals(JSON.parse(goalsDataString));
          }
        } catch (error) {
          Alert.alert("Storage Error", "Could not load saved data from device.");
        }
      };

      loadData();
    }, [])
  );

  const handleUpdateProfile = async () => {
    // Logic to update user profile via API
    const payload = { name, email };
    try {
        await apiRequest('put', 'profile', payload);
        Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
        Alert.alert('Error', 'Failed to update profile.');
    }
  };
  
  const handleDeleteGoal = (goalId) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to permanently delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest('delete', `goals/${goalId}`);
              setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
              Alert.alert("Success", "Goal has been deleted.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete the goal.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#34D399" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.headerTitle}>Profile & Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Profile</Text>
        <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
        />
        <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Goals</Text>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { padding: 24, paddingTop: 60 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginBottom: 24 },
    section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginBottom: 16 },
    input: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 8, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B' },
    button: { backgroundColor: '#34D399', padding: 14, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    goalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    goalName: { fontSize: 16, color: '#334155' },
});

export default ProfileScreen;