// Simple debug version to test if React is working
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function DebugApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TeaFlow Debug</Text>
      <Text style={styles.text}>If you can see this, React is working!</Text>
      <Pressable style={styles.button} onPress={() => alert('Button works!')}>
        <Text style={styles.buttonText}>Test Button</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F7A55',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2F7A55',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});