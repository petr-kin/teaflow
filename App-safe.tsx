import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { ThemeContext, ThemeManager, useTheme } from './lib/theme';
import { DEFAULTS } from './lib/teas';
import WeatherTeaAdvisor from './lib/weather';

// Safe Tea Library Component
function TeaLibrary({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const [weatherRec, setWeatherRec] = useState<any>(null);

  // Load weather recommendation
  React.useEffect(() => {
    const loadWeather = async () => {
      try {
        const advisor = WeatherTeaAdvisor.getInstance();
        const rec = await advisor.getWeatherBasedRecommendation();
        setWeatherRec(rec);
      } catch (error) {
        console.log('Weather error:', error);
      }
    };
    loadWeather();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Tea Library</Text>
        
        {/* Weather Recommendation */}
        {weatherRec && (
          <View style={[styles.weatherCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.weatherTitle, { color: theme.colors.text }]}>🌤️ Weather Suggestion</Text>
            <Text style={[styles.weatherText, { color: theme.colors.textSecondary }]}>
              {weatherRec.recommendedTea.charAt(0).toUpperCase() + weatherRec.recommendedTea.slice(1)} Tea
            </Text>
            <Text style={[styles.weatherReason, { color: theme.colors.textTertiary }]}>
              {weatherRec.reason}
            </Text>
            <Text style={[styles.weatherConfidence, { color: theme.colors.primary }]}>
              {Math.round(weatherRec.confidence * 100)}% match
            </Text>
          </View>
        )}

        {/* Tea List */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Teas</Text>
        {Object.values(DEFAULTS).map((tea: any) => (
          <Pressable key={tea.id} style={[styles.teaItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.teaName, { color: theme.colors.text }]}>{tea.name}</Text>
            <Text style={[styles.teaDetails, { color: theme.colors.textSecondary }]}>
              {tea.baseTempC}°C • {tea.baseScheduleSec.length} steeps
            </Text>
          </Pressable>
        ))}
        
        <Pressable onPress={onClose} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Back to Timer</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Safe simplified App to identify issues
function AppContent() {
  const [showLibrary, setShowLibrary] = useState(false);
  const theme = useTheme();

  if (showLibrary) {
    return <TeaLibrary onClose={() => setShowLibrary(false)} />;
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>TeaFlow</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Anticipatory Tea Companion</Text>
        </View>

        <View style={[styles.timerContainer, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.timerText, { color: theme.colors.text }]}>2:30</Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowLibrary(true);
            }}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Tea Library</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              alert('Camera feature coming soon!');
            }}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Scan Tea</Text>
          </Pressable>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(ThemeManager.getInstance().getCurrentTheme());

  return (
    <ThemeContext.Provider value={currentTheme}>
      <AppContent />
    </ThemeContext.Provider>
  );
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'flex-start',
    width: '100%',
  },
  timerContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(47, 122, 85, 0.1)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
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
});