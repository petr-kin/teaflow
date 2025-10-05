import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';

interface SimpleInteractiveInterfaceProps {
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

export default function SimpleInteractiveInterface({
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
}: SimpleInteractiveInterfaceProps) {
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

  const handleVesselSizeChange = (size: number) => {
    onVesselChange(size);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleTimeAdjust = (delta: number) => {
    const newTime = Math.max(15, Math.min(600, timerSeconds + delta));
    onTimerChange(newTime);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleTempAdjust = (delta: number) => {
    const newTemp = Math.max(70, Math.min(100, tempC + delta));
    onTempChange(newTemp);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const brewingStrength = Math.min(1, (tempC - 70) / 30);
  const progressDegrees = progress * 360;

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#1a1a1a',
      alignItems: 'center',
      padding: 20,
    }}>
      {/* Main Brewing Display */}
      <View style={{
        position: 'relative',
        width: 300,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(74, 124, 89, 0.1)',
        borderRadius: 150,
        marginBottom: 30,
      }}>
        {/* Progress Ring */}
        <View style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          borderWidth: 6,
          borderColor: 'rgba(74, 124, 89, 0.3)',
        }} />
        
        {/* Progress Indicator */}
        <View style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          borderWidth: 6,
          borderColor: '#4a7c59',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          transform: [{ rotate: `${progressDegrees - 90}deg` }],
        }} />

        {/* 3D Tea Cup Placeholder */}
        <View style={{
          width: 120,
          height: 120,
          backgroundColor: '#f5f5dc',
          borderRadius: 60,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Tea liquid simulation */}
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: `hsl(${25 + brewingStrength * 15}, ${60 + brewingStrength * 20}%, ${80 - brewingStrength * 30}%)`,
            borderRadius: 40,
            opacity: 0.8,
          }} />
        </View>

        {/* Timer Display */}
        <Text style={{
          fontSize: 28,
          fontWeight: '300',
          color: 'white',
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          textShadowColor: 'rgba(0,0,0,0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}>
          {formatTime(isRunning ? timerSeconds - elapsedTime : timerSeconds)}
        </Text>

        {/* Sand Timer Indicator */}
        <View style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 40,
          height: 60,
          backgroundColor: 'rgba(139, 69, 19, 0.7)',
          borderRadius: 5,
        }}>
          <View style={{
            width: '100%',
            height: `${(1 - progress) * 50}%`,
            backgroundColor: '#c5a572',
            borderRadius: 5,
            position: 'absolute',
            top: 5,
          }} />
          <View style={{
            width: '100%',
            height: `${progress * 40}%`,
            backgroundColor: '#c5a572',
            borderRadius: 5,
            position: 'absolute',
            bottom: 5,
          }} />
        </View>
      </View>

      {/* Control Interface */}
      <View style={{ width: '100%' }}>
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
                  minWidth: 40,
                  alignItems: 'center',
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
                  minWidth: 40,
                  alignItems: 'center',
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
                  minWidth: 40,
                  alignItems: 'center',
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
                  minWidth: 40,
                  alignItems: 'center',
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
            {selectedTea?.name || 'Green Tea'} • Steep {currentSteep + 1} of 3
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <Text style={{ color: 'white', fontSize: 11 }}>{vesselMl}ml</Text>
            <Text style={{ color: 'white', fontSize: 11 }}>
              {Math.round(brewingStrength * 100)}% strength
            </Text>
            <Text style={{ color: 'white', fontSize: 11 }}>{tempC}°C</Text>
          </View>
        </View>

        {/* Main Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 15 }}>
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

          <Pressable
            onPress={() => {
              // Logic for next steep
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
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

        {/* Volume Controls */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 15,
        }}>
          <Pressable
            onPress={() => handleVesselSizeChange(110)}
            style={{
              backgroundColor: vesselMl === 110 ? '#4a7c59' : '#666',
              padding: 10,
              borderRadius: 15,
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>110ml</Text>
          </Pressable>

          <Pressable
            onPress={() => handleVesselSizeChange(150)}
            style={{
              backgroundColor: vesselMl === 150 ? '#4a7c59' : '#666',
              padding: 10,
              borderRadius: 15,
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>150ml</Text>
          </Pressable>

          <Pressable
            onPress={() => handleVesselSizeChange(200)}
            style={{
              backgroundColor: vesselMl === 200 ? '#4a7c59' : '#666',
              padding: 10,
              borderRadius: 15,
            }}
          >
            <Text style={{ color: 'white', fontSize: 14 }}>200ml</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}