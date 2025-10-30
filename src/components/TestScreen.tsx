import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHAMPIONTRACKPRO</Text>
      <Text style={styles.subtitle}>THE TRAINING INTELLIGENCE</Text>
      <Text style={styles.status}>✅ Application chargée avec succès</Text>
      <Text style={styles.info}>Plateforme: {Platform.OS}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00E0FF',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: Platform.OS === 'web' ? "'Inter', sans-serif" : 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'web' ? "'Inter', sans-serif" : 'System',
  },
  status: {
    fontSize: 18,
    color: '#00E0FF',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'web' ? "'Inter', sans-serif" : 'System',
  },
  info: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
    fontFamily: Platform.OS === 'web' ? "'Inter', sans-serif" : 'System',
  },
});
