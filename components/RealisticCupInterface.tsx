import React, { useState, useRef } from 'react';
import { View, Image, Pressable, Dimensions, Animated, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';

interface RealisticCupInterfaceProps {
  onTimerChange: (seconds: number) => void;
  onStrengthChange: (strength: number) => void;
  onVesselSizeChange: (ml: number) => void;
  currentTimer: number;
  currentStrength: number;
  currentVesselSize: number;
  isRunning: boolean;
}

export default function RealisticCupInterface({
  onTimerChange,
  onStrengthChange,
  onVesselSizeChange,
  currentTimer,
  currentStrength,
  currentVesselSize,
  isRunning
}: RealisticCupInterfaceProps) {
  const theme = useTheme();
  const { isPhone } = useResponsive();
  const screenWidth = Dimensions.get('window').width;
  
  const cupScale = useRef(new Animated.Value(1)).current;
  const strengthOpacity = useRef(new Animated.Value(0.3)).current;
  
  const cupSize = isPhone ? screenWidth * 0.8 : 400;
  
  const handleCupPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const relativeY = locationY / cupSize;
    
    // Different areas of the cup control different sizes
    if (relativeY < 0.4) {
      onVesselSizeChange(110);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (relativeY < 0.7) {
      onVesselSizeChange(150);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      onVesselSizeChange(200);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Animation feedback
    Animated.sequence([
      Animated.timing(cupScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cupScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStrengthControl = (increase: boolean) => {
    const newStrength = Math.max(0.1, Math.min(1.0, currentStrength + (increase ? 0.1 : -0.1)));
    onStrengthChange(newStrength);
    
    Animated.timing(strengthOpacity, {
      toValue: newStrength,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    Haptics.selectionAsync();
  };

  const handleTimerControl = (increase: boolean) => {
    const newTime = Math.max(15, Math.min(600, currentTimer + (increase ? 15 : -15)));
    onTimerChange(newTime);
    Haptics.selectionAsync();
  };

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Main Interactive Cup */}
      <Animated.View style={{
        transform: [{ scale: cupScale }]
      }}>
        <Pressable
          onPress={handleCupPress}
          style={{
            width: cupSize,
            height: cupSize,
            borderRadius: cupSize / 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Base cup image */}
          <Image
            source={require('../assets/gaiwan-with-timer.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
          
          {/* Tea strength overlay */}
          <Animated.View style={{
            position: 'absolute',
            top: '40%',
            left: '30%',
            right: '30%',
            height: '20%',
            backgroundColor: `rgba(139, 69, 19, ${currentStrength * 0.8})`,
            borderRadius: 20,
            opacity: strengthOpacity,
          }} />
          
          {/* Size indicator rings */}
          <View style={{
            position: 'absolute',
            top: '35%',
            left: '35%',
            right: '35%',
            bottom: '35%',
            borderRadius: 1000,
            borderWidth: currentVesselSize === 110 ? 3 : 1,
            borderColor: currentVesselSize === 110 ? theme.colors.primary : 'rgba(255,255,255,0.3)',
          }} />
          <View style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            right: '25%',
            bottom: '25%',
            borderRadius: 1000,
            borderWidth: currentVesselSize === 150 ? 3 : 1,
            borderColor: currentVesselSize === 150 ? theme.colors.primary : 'rgba(255,255,255,0.2)',
          }} />
          <View style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            right: '15%',
            bottom: '15%',
            borderRadius: 1000,
            borderWidth: currentVesselSize === 200 ? 3 : 1,
            borderColor: currentVesselSize === 200 ? theme.colors.primary : 'rgba(255,255,255,0.1)',
          }} />
          
          {/* Timer progress indicator */}
          {isRunning && (
            <View style={{
              position: 'absolute',
              top: 5,
              left: 5,
              right: 5,
              bottom: 5,
              borderRadius: 1000,
              borderWidth: 4,
              borderColor: theme.colors.primary,
              borderStyle: 'dashed',
              opacity: 0.8,
            }} />
          )}
        </Pressable>
      </Animated.View>

      {/* Control Buttons */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
      }}>
        {/* Timer Controls */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text, fontSize: 12, marginBottom: 5 }}>
            Time
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => handleTimerControl(false)}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 8,
                borderRadius: 20,
                marginRight: 5,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleTimerControl(true)}
              style={{
                backgroundColor: theme.colors.primary,
                padding: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Strength Controls */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text, fontSize: 12, marginBottom: 5 }}>
            Strength
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => handleStrengthControl(false)}
              style={{
                backgroundColor: theme.colors.secondary,
                padding: 8,
                borderRadius: 20,
                marginRight: 5,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStrengthControl(true)}
              style={{
                backgroundColor: theme.colors.secondary,
                padding: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Status Display */}
      <View style={{
        marginTop: 15,
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        alignItems: 'center',
        width: '100%',
      }}>
        <Text style={{
          color: theme.colors.text,
          fontSize: 11,
          textAlign: 'center',
          marginBottom: 10,
        }}>
          Tap different cup areas to change size • Use buttons to adjust time & strength
        </Text>
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 11 }}>
            {currentVesselSize}ml
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 11 }}>
            {Math.round(currentStrength * 100)}% strength
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 11 }}>
            {Math.round(currentTimer)}s
          </Text>
        </View>
      </View>

      {/* Alternative cup with tea leaves */}
      <TouchableOpacity
        style={{
          marginTop: 15,
          width: cupSize * 0.4,
          height: cupSize * 0.4,
          borderRadius: 10,
          overflow: 'hidden',
          opacity: 0.6,
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Image
          source={require('../assets/gaiwan-with-leaves.png')}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
          }}
        />
      </TouchableOpacity>
    </View>
  );
}