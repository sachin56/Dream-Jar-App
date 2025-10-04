import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dream Jar</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34D399', 
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'sans-serif-medium', 
  },
  spinner: {
    marginTop: 50,
  },
});

export default SplashScreen;