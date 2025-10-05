import React, { memo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';

interface EnhancedTimerProps {
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
  currentSteep: number;
  totalSteeps: number;
  teaName: string;
  temperature: number;
  onToggle: () => void;
  onReset: () => void;
  onAdjustTime: (delta: number) => void;
  onNextSteep: () => void;
  onPrevSteep: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const EnhancedTimer: React.FC<EnhancedTimerProps> = ({
  seconds,
  totalSeconds,
  isRunning,
  currentSteep,
  totalSteeps,
  teaName,
  temperature,
  onToggle,
  onReset,
  onAdjustTime,
  onNextSteep,
  onPrevSteep,
}) => {
  const theme = useTheme();
  const { isPhone, spacing, fontSize } = useResponsive();
  
  const progress = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const completionAnimation = useSharedValue(0);
  
  // Calculate progress
  useEffect(() => {
    const progressValue = totalSeconds > 0 ? (totalSeconds - seconds) / totalSeconds : 0;
    progress.value = withTiming(progressValue, { duration: 300 });
  }, [seconds, totalSeconds]);
  
  // Pulse animation when running
  useEffect(() => {
    if (isRunning) {
      pulseAnimation.value = withSpring(1.05, {}, () => {
        pulseAnimation.value = withSpring(1);
      });
    }
  }, [isRunning]);
  
  // Completion animation
  useEffect(() => {
    if (seconds === 0 && !isRunning) {
      completionAnimation.value = withSpring(1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      completionAnimation.value = withTiming(0);
    }
  }, [seconds, isRunning]);
  
  const formatTime = useCallback((sec: number): string => {
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);
  
  const handleQuickAdjust = useCallback((delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdjustTime(delta);
  }, [onAdjustTime]);
  
  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  }, [onToggle]);
  
  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReset();
  }, [onReset]);
  
  const circleRadius = isPhone ? 90 : 120;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * circleRadius;
  const progressStroke = progress.value * circumference;
  
  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));
  
  const animatedCompletionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      completionAnimation.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP
    ),
    transform: [
      { scale: interpolate(completionAnimation.value, [0, 1], [0.8, 1]) }
    ],
  }));
  
  return (
    <View style={styles.container}>
      {/* Tea Info Header */}
      <View style={styles.header}>
        <Text style={[styles.teaName, { color: theme.colors.text, fontSize: fontSize(24) }]}>
          {teaName}
        </Text>
        <View style={styles.steepInfo}>
          <Text style={[styles.steepText, { color: theme.colors.textSecondary, fontSize: fontSize(16) }]}>
            Steep {currentSteep + 1} / {totalSteeps}
          </Text>
          <Text style={[styles.tempText, { color: theme.colors.textSecondary, fontSize: fontSize(16) }]}>
            {temperature}°C
          </Text>
        </View>
      </View>
      
      {/* Circular Timer */}
      <Animated.View style={[styles.timerContainer, animatedCircleStyle]}>
        <Svg width={circleRadius * 2 + 20} height={circleRadius * 2 + 20}>
          <G rotation="-90" origin={`${circleRadius + 10}, ${circleRadius + 10}`}>
            {/* Background Circle */}
            <Circle
              cx={circleRadius + 10}
              cy={circleRadius + 10}
              r={circleRadius}
              stroke={theme.colors.surface}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Progress Circle */}
            <Circle
              cx={circleRadius + 10}
              cy={circleRadius + 10}
              r={circleRadius}
              stroke={theme.colors.primary}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progressStroke}
              strokeLinecap="round"
            />
          </G>
          
          {/* Time Text */}
          <SvgText
            x={circleRadius + 10}
            y={circleRadius + 10}
            fontSize={isPhone ? 48 : 56}
            fontWeight="600"
            fill={theme.colors.text}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {formatTime(seconds)}
          </SvgText>
        </Svg>
        
        {/* Completion Overlay */}
        <Animated.View style={[styles.completionOverlay, animatedCompletionStyle]}>
          <Ionicons name="checkmark-circle" size={64} color={theme.colors.accent} />
          <Text style={[styles.completionText, { color: theme.colors.text }]}>
            Steep Complete!
          </Text>
        </Animated.View>
      </Animated.View>
      
      {/* Quick Adjust Buttons */}
      <View style={styles.quickAdjustContainer}>
        <Pressable
          style={[styles.adjustButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleQuickAdjust(-30)}
        >
          <Text style={[styles.adjustButtonText, { color: theme.colors.text }]}>-30s</Text>
        </Pressable>
        
        <Pressable
          style={[styles.adjustButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleQuickAdjust(-10)}
        >
          <Text style={[styles.adjustButtonText, { color: theme.colors.text }]}>-10s</Text>
        </Pressable>
        
        <Pressable
          style={[styles.adjustButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleQuickAdjust(10)}
        >
          <Text style={[styles.adjustButtonText, { color: theme.colors.text }]}>+10s</Text>
        </Pressable>
        
        <Pressable
          style={[styles.adjustButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleQuickAdjust(30)}
        >
          <Text style={[styles.adjustButtonText, { color: theme.colors.text }]}>+30s</Text>
        </Pressable>
      </View>
      
      {/* Main Controls */}
      <View style={styles.mainControls}>
        <Pressable
          style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleReset}
        >
          <Ionicons name="refresh" size={28} color={theme.colors.text} />
        </Pressable>
        
        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: isRunning ? theme.colors.warning : theme.colors.primary }
          ]}
          onPress={handleToggle}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={48}
            color="#FFFFFF"
          />
        </Pressable>
        
        <Pressable
          style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]}
          onPress={onNextSteep}
          disabled={currentSteep >= totalSteeps - 1}
        >
          <Ionicons 
            name="arrow-forward" 
            size={28} 
            color={currentSteep >= totalSteeps - 1 ? theme.colors.textTertiary : theme.colors.text} 
          />
        </Pressable>
      </View>
      
      {/* Steep Navigation */}
      <View style={styles.steepNavigation}>
        <Pressable
          onPress={onPrevSteep}
          disabled={currentSteep === 0}
          style={styles.steepNavButton}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentSteep === 0 ? theme.colors.textTertiary : theme.colors.text}
          />
        </Pressable>
        
        <View style={styles.steepDots}>
          {Array.from({ length: totalSteeps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.steepDot,
                {
                  backgroundColor: index === currentSteep 
                    ? theme.colors.primary 
                    : index < currentSteep
                    ? theme.colors.accent
                    : theme.colors.surface,
                }
              ]}
            />
          ))}
        </View>
        
        <Pressable
          onPress={onNextSteep}
          disabled={currentSteep >= totalSteeps - 1}
          style={styles.steepNavButton}
        >
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentSteep >= totalSteeps - 1 ? theme.colors.textTertiary : theme.colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  teaName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  steepInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  steepText: {
    fontWeight: '500',
  },
  tempText: {
    fontWeight: '500',
  },
  timerContainer: {
    position: 'relative',
    marginVertical: 30,
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 200,
  },
  completionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  quickAdjustContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  adjustButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  primaryButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  steepNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  steepNavButton: {
    padding: 8,
  },
  steepDots: {
    flexDirection: 'row',
    gap: 8,
  },
  steepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default memo(EnhancedTimer);
