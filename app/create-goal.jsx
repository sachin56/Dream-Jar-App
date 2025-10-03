import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiRequest } from "./utils/apiHandler";



const CreateGoalScreen = () => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);

  const [categories, setCategories] = useState([]);
  const [icons, setIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // This calls the 'category-and-icon' endpoint
        const response = await apiRequest('POST', 'category-and-icon');
        
        // Assuming your Laravel API returns { data: { categories: [], icons: [] } }
        if (response.data) {
          setCategories(response.data.categories);
          setIcons(response.data.icons);
        }
      } catch (error) {
        Alert.alert("Error", "Could not fetch categories and icons from the server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddGoal = async () => {
    // --- Validation (remains the same) ---
    if (!goalName || !targetAmount || !selectedCategory || !selectedIcon) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }
    if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount.');
      return;
    }

    // --- Prepare data for the API (use snake_case for Laravel) ---
    const newGoalPayload = {
      name: goalName,
      target_amount: Number(targetAmount),
      category: selectedCategory,
      icon: selectedIcon,
    };

    try {
      // --- Call the API ---
      const response = await apiRequest('post', 'goal-store', newGoalPayload);
      
      // Check for a successful creation status (usually 201)
      if (response) {
        Alert.alert('Success!', 'Your new goal has been created.');
        router.back(); // Go back to the home screen
      }
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert('Error', 'Failed to save the new goal to the server.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Create a New Goal</Text>
        <Text style={styles.subHeader}>What are you saving for?</Text>

        {/* --- Goal Name Input --- */}
        <View style={styles.inputContainer}>
          <Feather name="flag" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., New MacBook Pro"
            placeholderTextColor="#9CA3AF"
            value={goalName}
            onChangeText={setGoalName}
          />
        </View>

        {/* --- Target Amount Input --- */}
        <View style={styles.inputContainer}>
          <Feather name="dollar-sign" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Target Amount"
            placeholderTextColor="#9CA3AF"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
          />
        </View>
        
        {/* --- Category Selector (from API) --- */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipContainer}>
          {categories.map(category => (
            <TouchableOpacity key={category.id} onPress={() => setSelectedCategory(category.id)}>
              <Text style={[styles.chip, selectedCategory === category.id && styles.activeChip]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- Icon Picker (from API) --- */}
        <Text style={styles.sectionTitle}>Choose an Icon</Text>
        <View style={styles.chipContainer}>
          {icons.map(icon => (
            <TouchableOpacity key={icon.id} style={[styles.iconChip, selectedIcon === icon.icon && styles.activeIconChip]} onPress={() => setSelectedIcon(icon.id)}>
              <Feather name={icon.icon} size={24} color={selectedIcon === icon.id ? '#34D399' : '#334155'} />
            </TouchableOpacity>
          ))}
        </View>

        
        <TouchableOpacity style={styles.createButton} onPress={handleAddGoal}>
          <Text style={styles.createButtonText}>Create Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1, padding: 24 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1E293B' },
  subHeader: { fontSize: 16, color: '#64748B', marginTop: 8, marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  inputIcon: { padding: 14, color: '#9CA3AF' },
  input: { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 16, color: '#1E293B' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#334155', marginTop: 24, marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { backgroundColor: '#FFFFFF', color: '#334155', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, fontWeight: '600', borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  activeChip: { backgroundColor: '#34D399', color: '#FFFFFF', borderColor: '#34D399' },
  iconChip: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  activeIconChip: { backgroundColor: '#34D399', borderColor: '#34D399' },
  createButton: { backgroundColor: '#34D399', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 40, shadowColor: "#34D399", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  createButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});

export default CreateGoalScreen;