import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { DEFAULTS } from './lib/teas';

// Inline theme to avoid import issues
const theme = {
  colors: {
    background: '#0F1412',
    surface: '#1A2420',
    text: '#FFFFFF',
    textSecondary: '#8A9A8E',
    textTertiary: '#6B7B6F',
    primary: '#2F7A55',
    secondary: '#4A6741',
    border: '#2A3830',
  }
};

// Safe weather recommendation function (inlined to avoid imports)
const getWeatherRecommendation = async () => {
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer'; 
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const season = getCurrentSeason();
  const seasonalTeas = {
    spring: { tea: 'green', reason: 'Fresh, delicate flavor for renewal season', confidence: 0.82 },
    summer: { tea: 'white', reason: 'Light, cooling properties for warm weather', confidence: 0.78 },
    autumn: { tea: 'oolong', reason: 'Balanced flavor for transitional season', confidence: 0.85 },
    winter: { tea: 'black', reason: 'Rich, warming tea for cold months', confidence: 0.90 }
  };

  return seasonalTeas[season];
};

// Tea Library Component
function TeaLibrary({ onClose, onSelectTea }: { onClose: () => void; onSelectTea: (tea: any) => void }) {
  const [weatherRec, setWeatherRec] = useState<any>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const rec = await getWeatherRecommendation();
        setWeatherRec(rec);
      } catch (error) {
        console.log('Weather loading error:', error);
      }
    };
    loadWeather();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.libraryContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Tea Library</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Select your perfect tea</Text>
        </View>

        {/* Weather Suggestion */}
        <View style={[styles.weatherCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>🌤️ Today's Suggestion</Text>
          <Text style={[styles.weatherText, { color: theme.colors.textSecondary }]}>
            {weatherRec ? `${weatherRec.tea.charAt(0).toUpperCase() + weatherRec.tea.slice(1)} Tea` : 'Loading...'}
          </Text>
          <Text style={[styles.weatherReason, { color: theme.colors.textTertiary }]}>
            {weatherRec ? weatherRec.reason : 'Analyzing current conditions...'}
          </Text>
          <Text style={[styles.weatherConfidence, { color: theme.colors.primary }]}>
            {weatherRec ? `${Math.round(weatherRec.confidence * 100)}% match` : '...'}
          </Text>
        </View>

        {/* Tea List */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Teas</Text>
        {Object.values(DEFAULTS).map((tea: any) => (
          <Pressable 
            key={tea.id} 
            style={[styles.teaItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTea(tea);
            }}
          >
            <Text style={[styles.teaName, { color: theme.colors.text }]}>{tea.name}</Text>
            <Text style={[styles.teaDetails, { color: theme.colors.textSecondary }]}>
              {tea.baseTempC}°C • {tea.baseScheduleSec.length} steeps
            </Text>
          </Pressable>
        ))}
        
        <Pressable onPress={onClose} style={[styles.backButton, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.backButtonText}>Back to Timer</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Timer Component
function TimerScreen({ onShowLibrary, selectedTea, setSelectedTea }: { onShowLibrary: () => void; selectedTea: any; setSelectedTea: (tea: any) => void }) {
  const [timeLeft, setTimeLeft] = useState(150); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentSteep, setCurrentSteep] = useState(0);
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.colors.primary }]}>TeaFlow</Text>
          <Text style={[styles.appSubtitle, { color: theme.colors.textSecondary }]}>Anticipatory Tea Companion</Text>
        </View>

        <View style={styles.selectedTea}>
          <Text style={[styles.currentTeaLabel, { color: theme.colors.textTertiary }]}>Current Selection</Text>
          <Text style={[styles.currentTeaName, { color: theme.colors.text }]}>{selectedTea}</Text>
        </View>

        <View style={[styles.timerContainer, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.timerText, { color: theme.colors.text }]}>{timerTime}</Text>
          <Text style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>Steep 1 of 4</Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setTimerTime(timerTime === "2:30" ? "0:00" : "2:30");
            }}
          >
            <Text style={styles.controlButtonText}>Start/Pause</Text>
          </Pressable>

          <Pressable
            style={[styles.controlButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onShowLibrary();
            }}
          >
            <Text style={styles.controlButtonText}>Tea Library</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              alert('Camera scanning coming soon!');
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>📷 Scan Tea</Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              alert('Analytics coming soon!');
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>📊 Analytics</Text>
          </Pressable>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

// Main App Component
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'timer' | 'library'>('timer');
  const [selectedTea, setSelectedTea] = useState<any>(null);

  const handleSelectTea = (tea: any) => {
    setSelectedTea(tea);
    setCurrentScreen('timer');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
  };

  if (currentScreen === 'library') {
    return (
      <TeaLibrary 
        onClose={() => setCurrentScreen('timer')} 
        onSelectTea={handleSelectTea}
      />
    );
  }

  return <TimerScreen onShowLibrary={() => setCurrentScreen('library')} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  libraryContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  selectedTea: {
    alignItems: 'center',
    marginBottom: 30,
  },
  currentTeaLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  currentTeaName: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(47, 122, 85, 0.1)',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '600',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  weatherCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  weatherReason: {
    fontSize: 14,
    marginBottom: 8,
  },
  weatherConfidence: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  teaItem: {
    width: '100%',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  teaName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teaDetails: {
    fontSize: 14,
  },
  backButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});