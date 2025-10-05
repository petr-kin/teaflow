# Enhanced Base Components

## 1. Enhanced Button Component (building on your theme system)

```tsx
// components/base/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../lib/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'text';
  size?: 'small' | 'medium' | 'large';
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };
    
    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 12, paddingHorizontal: 24 },
      large: { paddingVertical: 16, paddingHorizontal: 32 },
    };
    
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary, // Your tea green
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      text: {
        backgroundColor: 'transparent',
      },
    };
    
    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };
  
  const getTextStyle = (): TextStyle => {
    const variantTextStyles = {
      primary: { color: '#FFFFFF', fontWeight: '600' as const },
      secondary: { color: theme.colors.text, fontWeight: '500' as const },
      ghost: { color: theme.colors.primary, fontWeight: '500' as const },
      text: { color: theme.colors.primary, fontWeight: '500' as const },
    };
    
    return {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      ...variantTextStyles[variant],
    };
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
};
```

## 2. Enhanced Tea Card Component (integrating with your tea data structure)

```tsx
// components/base/TeaCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../lib/theme';
import { Tag } from './Tag';

interface Tea {
  id: string;
  name: string;
  type: string;
  temperature: number;
  steepTime: number;
  steeps: number;
  image?: string;
  notes?: string;
  isFavorite?: boolean;
}

interface TeaCardProps {
  tea: Tea;
  onPress: (tea: Tea) => void;
  onLongPress?: (tea: Tea) => void;
  style?: ViewStyle;
}

export const TeaCard: React.FC<TeaCardProps> = ({
  tea,
  onPress,
  onLongPress,
  style,
}) => {
  const theme = useTheme();
  
  const getTeaTypeColor = (type: string): string => {
    const typeColors = {
      green: '#4A6741',
      black: '#2D1810',
      oolong: '#8B4513',
      puerh: '#654321',
      white: '#F5F5DC',
      herbal: '#8FBC8F',
    };
    return typeColors[type.toLowerCase() as keyof typeof typeColors] || theme.colors.primary;
  };
  
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
      onPress={() => onPress(tea)}
      onLongPress={() => onLongPress?.(tea)}
      activeOpacity={0.9}
    >
      {/* Tea Image */}
      {tea.image && (
        <Image
          source={{ uri: tea.image }}
          style={{
            width: '100%',
            height: 100,
            borderRadius: 8,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      )}
      
      {/* Tea Name */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
          marginBottom: 6,
        }}
        numberOfLines={1}
      >
        {tea.name}
      </Text>
      
      {/* Tea Parameters */}
      <Text
        style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
          marginBottom: 8,
        }}
      >
        {tea.temperature}°C • {tea.steepTime}s • {tea.steeps} steeps
      </Text>
      
      {/* Tea Type Tag */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Tag
          text={tea.type}
          color={getTeaTypeColor(tea.type)}
          size="small"
        />
        {tea.isFavorite && (
          <Text style={{ marginLeft: 8, fontSize: 16 }}>⭐</Text>
        )}
      </View>
      
      {/* Notes Preview */}
      {tea.notes && (
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textTertiary,
            marginTop: 8,
            fontStyle: 'italic',
          }}
          numberOfLines={2}
        >
          {tea.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

## 3. Enhanced Timer Display (integrating with your RealisticCupInterface)

```tsx
// components/enhanced/EnhancedTimerDisplay.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../lib/theme';

interface EnhancedTimerDisplayProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
  currentSteep: number;
  totalSteeps: number;
  onTimerComplete?: () => void;
}

export const EnhancedTimerDisplay: React.FC<EnhancedTimerDisplayProps> = ({
  timeRemaining,
  totalTime,
  isActive,
  currentSteep,
  totalSteeps,
  onTimerComplete,
}) => {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;
  const circumference = 2 * Math.PI * 90; // radius = 90
  
  // Pulse animation when active
  useEffect(() => {
    if (isActive) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [isActive]);
  
  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  // Timer completion
  useEffect(() => {
    if (timeRemaining === 0 && totalTime > 0) {
      onTimerComplete?.();
    }
  }, [timeRemaining, totalTime]);
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getTimerColor = (): string => {
    if (timeRemaining <= 10) return '#EF4444'; // Red for urgency
    if (timeRemaining <= 30) return '#F59E0B'; // Amber for attention
    return theme.colors.primary; // Tea green for normal
  };
  
  return (
    <Animated.View
      style={{
        alignItems: 'center',
        transform: [{ scale: pulseAnim }],
      }}
    >
      {/* Progress Circle */}
      <View style={{ position: 'relative' }}>
        <Svg width={200} height={200} style={{ position: 'absolute' }}>
          {/* Background Circle */}
          <Circle
            cx={100}
            cy={100}
            r={90}
            stroke={theme.colors.border}
            strokeWidth={6}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={100}
            cy={100}
            r={90}
            stroke={getTimerColor()}
            strokeWidth={6}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </Svg>
        
        {/* Timer Content */}
        <View
          style={{
            width: 200,
            height: 200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: '300',
              color: theme.colors.text,
              fontFamily: 'monospace',
            }}
          >
            {formatTime(timeRemaining)}
          </Text>
          
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginTop: 4,
            }}
          >
            Steep {currentSteep} of {totalSteeps}
          </Text>
          
          {/* Brewing State Indicator */}
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isActive ? getTimerColor() : theme.colors.border,
              marginTop: 8,
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};
```

## 4. Enhanced Gesture Overlay (building on your GestureOverlay)

```tsx
// components/enhanced/EnhancedGestureOverlay.tsx
import React, { useRef } from 'react';
import { View, PanResponder, Dimensions, Text } from 'react-native';
import { useTheme } from '../lib/theme';
import * as Haptics from 'expo-haptics';

interface EnhancedGestureOverlayProps {
  onTemperatureChange: (delta: number) => void;
  onVolumeChange: (delta: number) => void;
  onTimerAdjust: (delta: number) => void;
  currentTemp: number;
  currentVolume: number;
  children: React.ReactNode;
}

export const EnhancedGestureOverlay: React.FC<EnhancedGestureOverlayProps> = ({
  onTemperatureChange,
  onVolumeChange,
  onTimerAdjust,
  currentTemp,
  currentVolume,
  children,
}) => {
  const theme = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  
  const lastGesture = useRef<{ type: string; value: number } | null>(null);
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to significant gestures
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    
    onPanResponderGrant: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy, x0 } = gestureState;
      const gestureThreshold = 20;
      
      // Determine gesture type based on initial position and movement
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > gestureThreshold) {
        // Vertical gestures
        if (x0 < screenWidth / 3) {
          // Left third: Temperature control
          const tempDelta = -dy / 10; // Invert for intuitive up/down
          const newTemp = Math.max(60, Math.min(100, currentTemp + tempDelta));
          if (Math.abs(newTemp - currentTemp) >= 1) {
            onTemperatureChange(Math.round(newTemp - currentTemp));
            lastGesture.current = { type: 'temperature', value: newTemp };
          }
        } else if (x0 > (screenWidth * 2) / 3) {
          // Right third: Volume control
          const volumeDelta = -dy / 5;
          const newVolume = Math.max(50, Math.min(500, currentVolume + volumeDelta));
          if (Math.abs(newVolume - currentVolume) >= 5) {
            onVolumeChange(Math.round(newVolume - currentVolume));
            lastGesture.current = { type: 'volume', value: newVolume };
          }
        } else {
          // Center: Timer adjustment
          const timerDelta = -dy / 3;
          if (Math.abs(timerDelta) >= 5) {
            onTimerAdjust(Math.round(timerDelta));
            lastGesture.current = { type: 'timer', value: timerDelta };
          }
        }
      }
    },
    
    onPanResponderRelease: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      lastGesture.current = null;
    },
  });
  
  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
      
      {/* Gesture Hints */}
      <View
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          opacity: 0.6,
        }}
      >
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          Temp\n{currentTemp}°C
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          Swipe for\ncontrols
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          Volume\n{currentVolume}ml
        </Text>
      </View>
    </View>
  );
};
```

## 5. Integration with Your Existing Theme System

```tsx
// lib/enhanced-theme.ts
import { useTheme as useBaseTheme } from './theme';

export interface EnhancedTheme {
  colors: {
    // Existing theme colors
    primary: string;
    surface: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    
    // New tea-inspired colors
    teaGreen: string;
    goldenOolong: string;
    steepingAmber: string;
    softBlack: string;
    clayGray: string;
    mistGray: string;
    steamWhite: string;
    porcelain: string;
    
    // Functional colors
    successTea: string;
    warningAmber: string;
    errorRed: string;
    
    // Brewing state colors
    preparation: string;
    activeBrew: string;
    complete: string;
  };
  
  // Design tokens
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  typography: {
    display: { fontSize: number; fontWeight: string; lineHeight: number };
    h1: { fontSize: number; fontWeight: string; lineHeight: number };
    h2: { fontSize: number; fontWeight: string; lineHeight: number };
    h3: { fontSize: number; fontWeight: string; lineHeight: number };
    bodyLarge: { fontSize: number; fontWeight: string; lineHeight: number };
    body: { fontSize: number; fontWeight: string; lineHeight: number };
    caption: { fontSize: number; fontWeight: string; lineHeight: number };
    timer: { fontSize: number; fontWeight: string; lineHeight: number };
  };
  
  animations: {
    fast: number;
    standard: number;
    slow: number;
    brewing: number;
  };
}

export const useEnhancedTheme = (): EnhancedTheme => {
  const baseTheme = useBaseTheme();
  
  return {
    colors: {
      ...baseTheme.colors,
      
      // Tea-inspired palette
      teaGreen: '#4A6741',
      goldenOolong: '#B8860B',
      steepingAmber: '#D2691E',
      softBlack: '#2D2D2D',
      clayGray: '#6B6B6B',
      mistGray: '#A8A8A8',
      steamWhite: '#FAFAFA',
      porcelain: '#F5F5F0',
      
      // Functional colors
      successTea: '#22C55E',
      warningAmber: '#F59E0B',
      errorRed: '#EF4444',
      
      // Brewing states
      preparation: '#E5E7EB',
      activeBrew: '#FCD34D',
      complete: '#10B981',
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64,
    },
    
    typography: {
      display: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
      h1: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
      h2: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
      h3: { fontSize: 18, fontWeight: '500', lineHeight: 24 },
      bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
      body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
      caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
      timer: { fontSize: 48, fontWeight: '300', lineHeight: 52 },
    },
    
    animations: {
      fast: 150,
      standard: 300,
      slow: 500,
      brewing: 1000,
    },
  };
};
```
