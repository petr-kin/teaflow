import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Test if basic theme works
const mockTheme = {
  colors: {
    background: '#0F1412',
    text: '#FFFFFF',
    primary: '#2F7A55',
    textSecondary: '#8A9A8E',
  }
};

export default function TestTheme() {
  return (
    <View style={[styles.container, { backgroundColor: mockTheme.colors.background }]}>
      <Text style={[styles.text, { color: mockTheme.colors.text }]}>Theme Test Works!</Text>
      <Text style={[styles.primary, { color: mockTheme.colors.primary }]}>Primary Color Works!</Text>
      <Text style={[styles.secondary, { color: mockTheme.colors.textSecondary }]}>Secondary Color Works!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 10,
  },
  primary: {
    fontSize: 18,
    marginBottom: 10,
  },
  secondary: {
    fontSize: 16,
  },
});