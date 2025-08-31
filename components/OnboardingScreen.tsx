import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  onComplete: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  illustration: string;
  tips: string[];
}

const { width, height } = Dimensions.get('window');

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gongfu Tea',
    description: 'Master the ancient art of Chinese tea brewing with personalized guidance and intelligent learning.',
    illustration: '🍵',
    tips: [
      'Track multiple steeps for each tea',
      'Learn from your brewing preferences',
      'Discover new teas with camera scanning'
    ]
  },
  {
    id: 'brewing',
    title: 'Intelligent Brewing',
    description: 'Select a tea to begin brewing. The app adapts to your preferences over time.',
    illustration: '⏱️',
    tips: [
      'Timer automatically sets optimal steep times',
      'Audio chimes alert you at T-5 seconds',
      'Haptic feedback guides your brewing'
    ]
  },
  {
    id: 'gestures',
    title: 'Gesture Controls',
    description: 'Use intuitive gestures to control brewing parameters and timer functions.',
    illustration: '👆',
    tips: [
      'Pinch to adjust vessel size (70-200ml)',
      'Rotate to change temperature (60-100°C)',
      'Long-press timer to reset steep'
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Timer Gestures',
    description: 'Professional-grade timer controls for precision brewing.',
    illustration: '⚡',
    tips: [
      'Double-tap timer: Next steep',
      'Swipe left/right: Navigate steeps',
      'Edge taps: Quick time adjustments (±10s)',
      'Rotation: Fine-tune timing (±5s)'
    ]
  },
  {
    id: 'learning',
    title: 'Adaptive Learning',
    description: 'Rate your brews to help the app learn your preferences.',
    illustration: '🧠',
    tips: [
      'Rate strength: Weak, Perfect, or Strong',
      'Give enjoyment ratings (1-5 stars)',
      'App adjusts parameters automatically'
    ]
  },
  {
    id: 'library',
    title: 'Tea Library',
    description: 'Manage your tea collection with advanced organization tools.',
    illustration: '📚',
    tips: [
      'Search and filter by type or name',
      'Create custom tea profiles',
      'Edit brewing parameters',
      'Export/import your collection'
    ]
  },
  {
    id: 'scanning',
    title: 'Tea Scanning',
    description: 'Add new teas by scanning packages with your camera.',
    illustration: '📷',
    tips: [
      'Point camera at tea package',
      'AI recognizes tea type and parameters',
      'Manual entry option available',
      'Automatically saved to your library'
    ]
  },
  {
    id: 'analytics',
    title: 'Brewing Analytics',
    description: 'Track your progress and discover brewing patterns.',
    illustration: '📊',
    tips: [
      'Monitor brewing streaks and habits',
      'See your favorite tea types',
      'Track improvement over time',
      'Discover brewing insights'
    ]
  }
];

export default function OnboardingScreen({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const skipToStep = (stepIndex: number) => {
    if (stepIndex !== currentStep) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(stepIndex);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {TUTORIAL_STEPS.map((_, index) => (
              <Pressable
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted
                ]}
                onPress={() => skipToStep(index)}
              />
            ))}
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustration}>{currentStepData.illustration}</Text>
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
            <Text style={styles.stepDescription}>{currentStepData.description}</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Key Features:</Text>
            {currentStepData.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <View style={styles.navLeft}>
          {currentStep > 0 && (
            <Pressable onPress={prevStep} style={styles.navButton}>
              <Text style={styles.navButtonText}>← Back</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.navCenter}>
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {TUTORIAL_STEPS.length}
          </Text>
        </View>

        <View style={styles.navRight}>
          {isLastStep ? (
            <Pressable onPress={handleComplete} style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Get Started</Text>
            </Pressable>
          ) : (
            <Pressable onPress={nextStep} style={styles.navButton}>
              <Text style={styles.navButtonText}>Next →</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Skip Button */}
      <Pressable onPress={handleComplete} style={styles.skipButton}>
        <Text style={styles.skipButtonText}>Skip Tutorial</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1412',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 140,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#2F7A55',
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(47,122,85,0.6)',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    fontSize: 80,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tipsContainer: {
    width: '100%',
    maxWidth: 320,
  },
  tipsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  tipBullet: {
    color: '#2F7A55',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  navigation: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#2F7A55',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepCounter: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 8,
  },
  skipButtonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});