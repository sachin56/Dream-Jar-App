import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { apiRequest } from "./utils/apiHandler"; // Make sure this path is correct

// --- Reusable Donut Chart Component ---
const DonutChart = ({ progress = 0, size = 48, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#34D399"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Feather name="target" size={16} color="#34D399" style={{ position: 'absolute' }} />
    </View>
  );
};

const HomeScreen = () => {
  const [homeData, setHomeData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);
          
          const [homeResponse, categoryResponse] = await Promise.all([
            apiRequest('post', 'home'),
            apiRequest('post', 'categories')
          ]);
          
          if (homeResponse.data) {
            setHomeData(homeResponse.data);
          }
          if (categoryResponse.data) {
            setCategories(['All', ...categoryResponse.data.map(c => c.name)]);
          }

        } catch (error) {
          if (error.response && error.response.status === 401) {
            Alert.alert('Session Expired', 'Please log in again.');
            handleLogout(false);
          } else {
            Alert.alert('Error', 'Failed to load data from the server.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }, [])
  );

  

  const handleLogout = (showAlert = true) => {
    const logoutAction = async () => {
      try {
        await apiRequest('post', 'logout');
      } catch (error) {
        console.error("Failed to logout on server:", error);
      } finally {
        await AsyncStorage.multiRemove(['user', 'token']);
        router.replace('/');
      }
    };

    if (showAlert) {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log Out", onPress: logoutAction, style: 'destructive' }
        ]
      );
    } else {
      logoutAction();
    }
  };

  if (isLoading || !homeData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }

  const filteredGoals = activeCategory === 'All' 
    ? homeData.goals 
    : homeData.goals.filter(g => g.category_name === activeCategory);

  const renderGoal = ({ item }) => {
    const currentAmount = item.current_amount || 0;
    const targetAmount = item.target_amount || 0;
    const progress = targetAmount > 0 ? currentAmount / targetAmount : 0;
    
    return (
      <TouchableOpacity
        style={styles.goalCard}
        onPress={() => router.push({ pathname: '/goal-detail', params: { id: item.id } })}
      >
        <DonutChart progress={progress} />
        <View style={styles.goalTextContainer}>
          <Text style={styles.goalTitle}>{item.name}</Text>
          <Text style={styles.goalAmount}>
            ${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()}
          </Text>
        </View>
        <Text style={styles.goalPercentage}>{Math.round(progress * 100)}%</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
            <Feather name="user" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Saved</Text>
            <Text style={styles.summaryValue}>${(homeData.total_savings || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Goals</Text>
            <Text style={styles.summaryValue}>{homeData.goal_count || 0}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setActiveCategory(item)}>
              <Text style={[styles.categoryChip, activeCategory === item && styles.activeCategoryChip]}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10 }}
        />
        
        <Text style={styles.sectionTitle}>Your Goals</Text>
        <FlatList
          data={filteredGoals}
          renderItem={renderGoal}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No goals in this category.</Text>}
        />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-goal')}
      >
        <Feather name="plus" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerDate: { fontSize: 14, color: '#64748B' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#64748B' },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
  summaryDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', paddingHorizontal: 24, marginTop: 24, marginBottom: 8 },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    color: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  activeCategoryChip: {
    backgroundColor: '#34D399',
    color: '#FFFFFF',
    borderColor: '#34D399',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalTextContainer: { flex: 1, marginLeft: 16 },
  goalTitle: { fontSize: 16, fontWeight: '600', color: '#334155' },
  goalAmount: { fontSize: 14, color: '#64748B', marginTop: 4 },
  goalPercentage: { fontSize: 16, fontWeight: 'bold', color: '#34D399' },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    backgroundColor: '#34D399',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#34D399',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#64748B' },
});

export default HomeScreen;