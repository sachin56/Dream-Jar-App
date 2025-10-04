import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiRequest } from '../utils/apiHandler';

const Coin = ({ style }) => {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[styles.coin, style, { transform: [{ scale }] }]}>
      <Text style={styles.coinText}>$</Text>
    </Animated.View>
  );
};

const SavingsJar = ({ progress = 0 }) => {
  const jarHeight = 280;
  const jarWidth = 220;
  const coinCount = 30;
  const visibleCoins = Math.floor(coinCount * progress);

  return (
    <View style={[styles.jar, { width: jarWidth, height: jarHeight }]}>
      <View style={styles.jarLid} />
      <View style={styles.jarBody}>
        <View style={styles.coinsContainer}>
          {Array.from({ length: visibleCoins }).map((_, index) => {
            const style = {
              bottom: (index % 5) * 15,
              left: `${Math.random() * 70 + 5}%`,
              transform: [{ rotate: `${Math.random() * 20 - 10}deg` }],
              zIndex: index,
            };
            return <Coin key={index} style={style} />;
          })}
        </View>
      </View>
    </View>
  );
};


const GoalDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [currentGoal, setCurrentGoal] = useState(null);
  const [contribution, setContribution] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState();

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
           require('../assets/sounds/coin.mp3') 
        );
        setSound(sound);
      } catch (error) {
        console.error("Could not load sound file:", error);
      }
    };
    loadSound();

    return () => { 
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (id) {
      const fetchGoalDetails = async () => {
        try {
          setIsLoading(true);
          const response = await apiRequest('post', `goal-details/${id}`);
          if (response.data) {
            setCurrentGoal(response.data);
          }
        } catch (error) {
          Alert.alert("Error", "Could not fetch goal details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchGoalDetails();
    }
  }, [id]);

  const addContribution = async () => {
    if (!contribution || isNaN(contribution) || Number(contribution) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution.');
      return;
    }

    try {
      const payload = { amount: Number(contribution) };
      const response = await apiRequest('put', `goals/${currentGoal.id}/contribute`, payload);
      
      if (response.data) {
        if (sound) {
          await sound.replayAsync();
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setCurrentGoal(response.data);
        setContribution('');
        Alert.alert('Success!', 'Contribution added.');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save contribution.');
    }
  };

  if (isLoading || !currentGoal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const progress = currentGoal.target_amount > 0 ? currentGoal.current_amount / currentGoal.target_amount : 0;
  const remaining = currentGoal.target_amount - currentGoal.current_amount;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <View style={styles.iconContainer}>
                <Feather name={currentGoal.icon || 'target'} size={24} color="#10B981" />
            </View>
            <Text style={styles.title}>{currentGoal.name}</Text>
        </View>

        <SavingsJar progress={progress} />

        <View style={styles.statsContainer}>
          <Text style={styles.savedText}>
            Saved: <Text style={{fontWeight: 'bold'}}>${(currentGoal.current_amount || 0).toLocaleString()}</Text>
          </Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{Math.round(progress * 100)}% Complete</Text>
          </View>
        </View>
        <Text style={styles.remainingText}>
          ${remaining > 0 ? remaining.toLocaleString() : 0} left to go!
        </Text>
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.logButton} onPress={addContribution}>
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Log Contribution"
            placeholderTextColor="#9CA3AF"
            value={contribution}
            onChangeText={setContribution}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Recent Activity</Text>
            {currentGoal.contributions && currentGoal.contributions.slice(0, 3).map((item, index) => (
                <View key={item.id || index} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                        <Feather name="trending-up" size={20} color="#10B981" />
                    </View>
                    <View style={styles.historyTextContainer}>
                        <Text style={styles.historyLabel}>Contribution Added</Text>
                        <Text style={styles.historyDate}>
                            {new Date(item.date).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={styles.historyAmount}>+${item.amount}</Text>
                </View>
            ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
  container: { flex: 1, backgroundColor: '#F0F4F8',paddingTop: 65 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: 24, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  statsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 24 },
  savedText: { fontSize: 20, color: '#334155', fontWeight: '500' },
  pill: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12, marginLeft: 12, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  pillText: { color: '#059669', fontWeight: '700', fontSize: 14 },
  remainingText: { fontSize: 16, color: '#64748B', marginBottom: 32 },
  inputContainer: { flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 32 },
  logButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 30, marginRight: 12, shadowColor: '#10B981', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6 },
  input: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, fontSize: 16, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  jar: { alignItems: 'center' },
  jarLid: { height: 20, width: '60%', backgroundColor: '#E2E8F0', borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 2, borderColor: '#CBD5E0' },
  jarBody: { flex: 1, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.8)', borderTopWidth: 0, borderBottomLeftRadius: 60, borderBottomRightRadius: 60, justifyContent: 'flex-end', overflow: 'hidden' },
  coinsContainer: { width: '100%', height: '100%', position: 'relative' },
  coin: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: '#FBBF24', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F59E0B' },
  coinText: { color: '#D97706', fontWeight: 'bold', fontSize: 18 },
  historyContainer: { width: '100%' },
  historyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  historyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyTextContainer: { flex: 1 },
  historyLabel: { fontSize: 16, fontWeight: '600', color: '#334155' },
  historyDate: { fontSize: 12, color: '#64748B' },
  historyAmount: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
});

export default GoalDetailScreen;