import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useSpring } from 'react-spring';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import TeaCup3D from './TeaCup3D';
import SandTimer3D from './SandTimer3D';

interface InteractiveBrewingInterfaceProps {
  selectedTea: any;
  vesselMl: number;
  tempC: number;
  timerSeconds: number;
  isRunning: boolean;
  currentSteep: number;
  onVesselChange: (ml: number) => void;
  onTempChange: (temp: number) => void;
  onTimerChange: (seconds: number) => void;
  onStartStop: () => void;
}

export default function InteractiveBrewingInterface({
  selectedTea,
  vesselMl,
  tempC,
  timerSeconds,
  isRunning,
  currentSteep,
  onVesselChange,
  onTempChange,
  onTimerChange,
  onStartStop
}: InteractiveBrewingInterfaceProps) {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;
  
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate brewing progress
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setProgress(newTime / timerSeconds);
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, timerSeconds]);

  // Reset progress when stopped
  useEffect(() => {
    if (!isRunning) {
      setElapsedTime(0);
      setProgress(0);
    }
  }, [isRunning]);

  // Animated progress ring
  const { circumference } = useSpring({
    circumference: progress * 283, // 2 * π * 45 (radius)
    config: { tension: 280, friction: 60 }
  });

  // Control button animations
  const { buttonScale } = useSpring({
    buttonScale: isRunning ? 1.05 : 1,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  const handleVesselSizeChange = (size: number) => {
    onVesselChange(size);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleTimeAdjust = (delta: number) => {
    const newTime = Math.max(15, Math.min(600, timerSeconds + delta));
    onTimerChange(newTime);
    Haptics.selectionAsync();
  };

  const handleTempAdjust = (delta: number) => {
    const newTemp = Math.max(70, Math.min(100, tempC + delta));
    onTempChange(newTemp);
    Haptics.selectionAsync();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const brewingStrength = Math.min(1, (tempC - 70) / 30);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#1a1a1a',
      alignItems: 'center',
      padding: 20,
    }}>
      {/* Main 3D Scene Container */}
      <View style={{
        position: 'relative',
        width: screenWidth - 40,
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Progress Ring SVG Overlay */}
        <svg
          width={300}
          height={300}
          style={{
            position: 'absolute',
            top: 50,
            left: (screenWidth - 340) / 2,
            zIndex: 10,
          }}
        >
          {/* Background ring */}
          <circle
            cx={150}
            cy={150}
            r={120}
            fill="none"
            stroke="rgba(74, 124, 89, 0.2)"
            strokeWidth={3}
          />
          {/* Progress ring */}
          <circle
            cx={150}
            cy={150}
            r={120}
            fill="none"
            stroke="#4a7c59"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={754} // 2 * π * 120
            strokeDashoffset={754 - (progress * 754)}
            transform="rotate(-90 150 150)"
          />
        </svg>

        {/* Timer Display */}
        <View style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 20,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: '300',
            color: 'white',
            fontFamily: 'monospace',
            textShadowColor: 'rgba(0,0,0,0.8)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 3,
          }}>
            {formatTime(isRunning ? timerSeconds - elapsedTime : timerSeconds)}
          </Text>
        </View>

        {/* 3D Tea Cup */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <TeaCup3D
            size={vesselMl}
            brewingStrength={brewingStrength}
            temperature={tempC}
            isRunning={isRunning}
          />
        </View>

        {/* 3D Sand Timer */}
        <View style={{ 
          position: 'absolute', 
          bottom: -50, 
          right: 20,
          width: 120,
          height: 150,
        }}>
          <SandTimer3D
            progress={progress}
            duration={timerSeconds}
            isRunning={isRunning}
          />
        </View>
      </View>

      {/* Control Interface */}
      <View style={{ width: '100%', marginTop: 40 }}>
        {/* Time and Strength Controls */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: 20,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>Time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => handleTimeAdjust(-15)}
                style={{
                  backgroundColor: '#4a7c59',
                  padding: 12,
                  borderRadius: 25,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>-</Text>
              </Pressable>
              <Pressable
                onPress={() => handleTimeAdjust(15)}
                style={{
                  backgroundColor: '#4a7c59',
                  padding: 12,
                  borderRadius: 25,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>Strength</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => handleTempAdjust(-5)}
                style={{
                  backgroundColor: '#d4af37',
                  padding: 12,
                  borderRadius: 25,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>-</Text>
              </Pressable>
              <Pressable
                onPress={() => handleTempAdjust(5)}
                style={{
                  backgroundColor: '#d4af37',
                  padding: 12,
                  borderRadius: 25,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Status Display */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: 15,
          borderRadius: 15,
          marginBottom: 20,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 10,
          }}>
            Tap different cup areas to change size • Use buttons to adjust time & strength
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={{ color: 'white', fontSize: 11 }}>{vesselMl}ml</Text>
            <Text style={{ color: 'white', fontSize: 11 }}>
              Steep {currentSteep + 1} of 3
            </Text>
            <Text style={{ color: 'white', fontSize: 11 }}>~{Math.round(brewingStrength * 100)}% strength</Text>
            <Text style={{ color: 'white', fontSize: 11 }}>{tempC}°C</Text>
          </View>
        </View>

        {/* Main Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
          <View>
            <Pressable
              onPress={onStartStop}
              style={{
                backgroundColor: isRunning ? '#e74c3c' : '#4a7c59',
                paddingHorizontal: 40,
                paddingVertical: 15,
                borderRadius: 25,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                {isRunning ? 'Stop Steep' : 'Start Steep'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              // Logic for next steep
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              backgroundColor: '#8b4513',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 25,
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Next Steep
            </Text>
          </Pressable>
        </View>

        {/* Volume and Temperature Fine Controls */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 15,
          gap: 10,
        }}>
          <Pressable
            onPress={() => handleVesselSizeChange(vesselMl - 10)}
            style={{ backgroundColor: '#666', padding: 8, borderRadius: 15 }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>-10ml</Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleVesselSizeChange(vesselMl + 10)}
            style={{ backgroundColor: '#666', padding: 8, borderRadius: 15 }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>+10ml</Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleTempAdjust(-5)}
            style={{ backgroundColor: '#4a90e2', padding: 8, borderRadius: 15 }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>-5°C</Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleTempAdjust(5)}
            style={{ backgroundColor: '#e74c3c', padding: 8, borderRadius: 15 }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>+5°C</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}