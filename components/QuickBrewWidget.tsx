import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';
import { TeaProfile } from '../lib/types';
import { DEFAULTS } from '../lib/teas';
import Card from './ui/Card';

interface QuickBrewWidgetProps {
  onStartBrewing: (tea: TeaProfile) => void;
  recentTeas?: TeaProfile[];
  favoriteTeaId?: string;
}

interface TeaRecommendation {
  tea: TeaProfile;
  reason: string;
  icon: string;
}

const { width: screenWidth } = Dimensions.get('window');

const QuickBrewWidget: React.FC<QuickBrewWidgetProps> = ({
  onStartBrewing,
  recentTeas = [],
  favoriteTeaId,
}) => {
  const theme = useTheme();
  const { isPhone, spacing, fontSize } = useResponsive();
  const [recommendation, setRecommendation] = useState<TeaRecommendation | null>(null);
  const [lastBrewedTea, setLastBrewedTea] = useState<TeaProfile | null>(null);
  const [favoriteTea, setFavoriteTea] = useState<TeaProfile | null>(null);
  
  const scaleAnimation = useSharedValue(1);
  
  // Get smart recommendation based on time of day
  const getSmartRecommendation = useCallback((): TeaRecommendation => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 10) {
      return {
        tea: DEFAULTS.green,
        reason: "Light morning tea for gentle energy",
        icon: "sunny"
      };
    } else if (hour >= 10 && hour < 14) {
      return {
        tea: DEFAULTS.oolong,
        reason: "Balanced midday brew",
        icon: "partly-sunny"
      };
    } else if (hour >= 14 && hour < 17) {
      return {
        tea: DEFAULTS.black,
        reason: "Afternoon pick-me-up",
        icon: "cafe"
      };
    } else if (hour >= 17 && hour < 20) {
      return {
        tea: DEFAULTS.white,
        reason: "Light evening tea",
        icon: "moon"
      };
    } else {
      return {
        tea: DEFAULTS.herbal,
        reason: "Relaxing nighttime brew",
        icon: "bed"
      };
    }
  }, []);
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Get last brewed tea
        const lastTeaId = await AsyncStorage.getItem('lastUsedTea');
        if (lastTeaId) {
          const tea = Object.values(DEFAULTS).find(t => t.id === lastTeaId);
          if (tea) setLastBrewedTea(tea);
        }
        
        // Get favorite tea
        if (favoriteTeaId) {
          const tea = Object.values(DEFAULTS).find(t => t.id === favoriteTeaId);
          if (tea) setFavoriteTea(tea);
        }
        
        // Set recommendation
        setRecommendation(getSmartRecommendation());
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
    
    // Update recommendation every minute
    const interval = setInterval(() => {
      setRecommendation(getSmartRecommendation());
    }, 60000);
    
    return () => clearInterval(interval);
  }, [favoriteTeaId, getSmartRecommendation]);
  
  const handleQuickBrew = useCallback((tea: TeaProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scaleAnimation.value = withSpring(0.95, {}, () => {
      scaleAnimation.value = withSpring(1);
    });
    onStartBrewing(tea);
  }, [onStartBrewing, scaleAnimation]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));
  
  // Quick action cards
  const QuickActionCard = memo(({ 
    title, 
    subtitle, 
    tea, 
    icon, 
    color 
  }: { 
    title: string; 
    subtitle: string; 
    tea: TeaProfile; 
    icon: string; 
    color: string;
  }) => (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={() => handleQuickBrew(tea)}>
        <Card style={[styles.quickCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
          <View style={styles.quickCardContent}>
            <View style={styles.quickCardIcon}>
              <Ionicons name={icon as any} size={28} color={color} />
            </View>
            <View style={styles.quickCardText}>
              <Text style={[styles.quickCardTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.quickCardSubtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
              <View style={styles.quickCardMeta}>
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                  {tea.baseTempC}°C
                </Text>
                <Text style={[styles.metaDivider, { color: theme.colors.textTertiary }]}>•</Text>
                <Text style={[styles.metaText, { color: theme.colors.textTertiary }]}>
                  {tea.baseScheduleSec[0]}s first steep
                </Text>
              </View>
            </View>
            <Ionicons name="play-circle" size={32} color={theme.colors.primary} />
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  ));
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: fontSize(20) }]}>
          Quick Brew
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: fontSize(14) }]}>
          Start brewing with one tap
        </Text>
      </View>
      
      {/* Smart Recommendation */}
      {recommendation && (
        <QuickActionCard
          title="Recommended Now"
          subtitle={recommendation.reason}
          tea={recommendation.tea}
          icon={recommendation.icon}
          color={theme.colors.primary}
        />
      )}
      
      {/* Last Brewed */}
      {lastBrewedTea && lastBrewedTea.id !== recommendation?.tea.id && (
        <QuickActionCard
          title="Continue Last Session"
          subtitle={`${lastBrewedTea.name}`}
          tea={lastBrewedTea}
          icon="time"
          color={theme.colors.accent}
        />
      )}
      
      {/* Favorite Tea */}
      {favoriteTea && favoriteTea.id !== lastBrewedTea?.id && favoriteTea.id !== recommendation?.tea.id && (
        <QuickActionCard
          title="Your Favorite"
          subtitle={`${favoriteTea.name}`}
          tea={favoriteTea}
          icon="heart"
          color={theme.colors.warning}
        />
      )}
      
      {/* Quick Presets */}
      <View style={styles.presetsContainer}>
        <Text style={[styles.presetsTitle, { color: theme.colors.text, fontSize: fontSize(16) }]}>
          Quick Presets
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsList}
        >
          <PresetButton
            label="Morning"
            icon="sunny"
            tea={DEFAULTS.green}
            onPress={handleQuickBrew}
            theme={theme}
          />
          <PresetButton
            label="Energy"
            icon="flash"
            tea={DEFAULTS.black}
            onPress={handleQuickBrew}
            theme={theme}
          />
          <PresetButton
            label="Focus"
            icon="bulb"
            tea={DEFAULTS.oolong}
            onPress={handleQuickBrew}
            theme={theme}
          />
          <PresetButton
            label="Relax"
            icon="moon"
            tea={DEFAULTS.white}
            onPress={handleQuickBrew}
            theme={theme}
          />
          <PresetButton
            label="Digest"
            icon="nutrition"
            tea={DEFAULTS.puerh}
            onPress={handleQuickBrew}
            theme={theme}
          />
          <PresetButton
            label="Sleep"
            icon="bed"
            tea={DEFAULTS.herbal}
            onPress={handleQuickBrew}
            theme={theme}
          />
        </ScrollView>
      </View>
      
      {/* One-Tap Timer */}
      <View style={styles.oneTapSection}>
        <Text style={[styles.oneTapTitle, { color: theme.colors.text, fontSize: fontSize(16) }]}>
          One-Tap Timers
        </Text>
        <View style={styles.oneTapGrid}>
          <OneTapTimer seconds={30} label="Flash" onStart={() => {}} theme={theme} />
          <OneTapTimer seconds={60} label="Quick" onStart={() => {}} theme={theme} />
          <OneTapTimer seconds={120} label="Standard" onStart={() => {}} theme={theme} />
          <OneTapTimer seconds={180} label="Long" onStart={() => {}} theme={theme} />
        </View>
      </View>
    </View>
  );
};

// Preset button component
const PresetButton = memo(({ 
  label, 
  icon, 
  tea, 
  onPress, 
  theme 
}: { 
  label: string; 
  icon: string; 
  tea: TeaProfile; 
  onPress: (tea: TeaProfile) => void; 
  theme: any;
}) => (
  <Pressable 
    style={[styles.presetButton, { backgroundColor: theme.colors.surface }]}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(tea);
    }}
  >
    <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
    <Text style={[styles.presetLabel, { color: theme.colors.text }]}>{label}</Text>
    <Text style={[styles.presetTemp, { color: theme.colors.textTertiary }]}>
      {tea.baseTempC}°C
    </Text>
  </Pressable>
));

// One-tap timer component
const OneTapTimer = memo(({ 
  seconds, 
  label, 
  onStart, 
  theme 
}: { 
  seconds: number; 
  label: string; 
  onStart: () => void; 
  theme: any;
}) => (
  <Pressable 
    style={[styles.oneTapButton, { backgroundColor: theme.colors.surface }]}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onStart();
    }}
  >
    <Text style={[styles.oneTapTime, { color: theme.colors.primary }]}>
      {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
    </Text>
    <Text style={[styles.oneTapLabel, { color: theme.colors.textSecondary }]}>
      {label}
    </Text>
  </Pressable>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: '400',
  },
  quickCard: {
    marginBottom: 12,
    padding: 16,
  },
  quickCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickCardText: {
    flex: 1,
  },
  quickCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickCardSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  quickCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
  },
  metaDivider: {
    marginHorizontal: 6,
  },
  presetsContainer: {
    marginTop: 24,
  },
  presetsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  presetsList: {
    paddingRight: 16,
  },
  presetButton: {
    width: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  presetTemp: {
    fontSize: 10,
    marginTop: 2,
  },
  oneTapSection: {
    marginTop: 24,
  },
  oneTapTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  oneTapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  oneTapButton: {
    width: (screenWidth - 52) / 4,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  oneTapTime: {
    fontSize: 18,
    fontWeight: '700',
  },
  oneTapLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default memo(QuickBrewWidget);
