import React, { useRef } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useResponsive } from './ResponsiveView';

interface Props {
  timerSeconds: number;
  isRunning: boolean;
  onReset: () => void;
  onAddTime: (seconds: number) => void;
  onNextSteep: () => void;
  onPrevSteep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export default function TimerWithGestures({
  timerSeconds,
  isRunning,
  onReset,
  onAddTime,
  onNextSteep,
  onPrevSteep,
  canGoNext,
  canGoPrev
}: Props) {
  const { isPhone, isTablet, spacing, fontSize } = useResponsive();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const feedbackOpacity = useSharedValue(0);
  const feedbackText = useSharedValue('');
  const longPressStartTime = useRef(0);

  const showFeedback = (text: string) => {
    'worklet';
    feedbackText.value = text;
    feedbackOpacity.value = withTiming(1, { duration: 200 }, () => {
      feedbackOpacity.value = withTiming(0, { duration: 1500 });
    });
  };

  const handleLongPressReset = () => {
    onReset();
    showFeedback('Timer Reset');
  };

  const handleDoubleTagNextSteep = () => {
    if (canGoNext) {
      onNextSteep();
      showFeedback('Next Steep');
    } else {
      showFeedback('Last Steep');
    }
  };

  const handleSwipeLeft = () => {
    if (canGoPrev) {
      onPrevSteep();
      showFeedback('Previous Steep');
    } else {
      showFeedback('First Steep');
    }
  };

  const handleSwipeRight = () => {
    if (canGoNext) {
      onNextSteep();
      showFeedback('Next Steep');
    } else {
      showFeedback('Last Steep');
    }
  };

  const handleEdgeTap = (side: 'left' | 'right') => {
    const timeToAdd = side === 'left' ? -10 : 10;
    onAddTime(timeToAdd);
    showFeedback(`${timeToAdd > 0 ? '+' : ''}${timeToAdd}s`);
  };

  // Long press gesture for reset
  const longPress = Gesture.LongPress()
    .minDuration(1000)
    .onStart(() => {
      'worklet';
      longPressStartTime.current = Date.now();
      scale.value = withSpring(0.95);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);
      runOnJS(handleLongPressReset)();
    });

  // Double tap for next steep
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1.05, {}, () => {
        scale.value = withSpring(1);
      });
      runOnJS(handleDoubleTagNextSteep)();
    });

  // Pan gesture for swipe navigation and edge taps
  const pan = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      const { x, absoluteX } = e;
      // Check if tap is on edges (first 60px or last 60px)
      if (absoluteX < 60) {
        runOnJS(handleEdgeTap)('left');
      } else if (absoluteX > 300 - 60) { // Assuming timer width ~300px
        runOnJS(handleEdgeTap)('right');
      }
    })
    .onEnd((e) => {
      'worklet';
      const { velocityX, translationX } = e;
      
      // Swipe detection
      if (Math.abs(velocityX) > 500 || Math.abs(translationX) > 50) {
        if (translationX > 0) {
          runOnJS(handleSwipeRight)();
        } else {
          runOnJS(handleSwipeLeft)();
        }
      }
    });

  // Rotation gesture for fine time adjustment
  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      'worklet';
      rotation.value = e.rotation * 0.5; // Dampen the rotation
      const rotationDegrees = (e.rotation * 180) / Math.PI;
      if (Math.abs(rotationDegrees) > 15) {
        const timeChange = rotationDegrees > 0 ? 5 : -5;
        runOnJS(onAddTime)(timeChange);
        rotation.value = 0; // Reset rotation
      }
    })
    .onEnd(() => {
      'worklet';
      rotation.value = withSpring(0);
    });

  const combinedGestures = Gesture.Simultaneous(
    Gesture.Race(longPress, doubleTap),
    pan,
    rotationGesture
  );

  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}rad` }
    ]
  }));

  const animatedFeedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [
      { scale: feedbackOpacity.value }
    ]
  }));

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const timerSize = isPhone ? 180 : isTablet ? 220 : 250;
  const timerFontSize = isPhone ? 28 : isTablet ? 36 : 40;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGestures}>
        <Animated.View style={[
          styles.timerContainer, 
          animatedTimerStyle,
          { width: timerSize, height: timerSize }
        ]}>
          <View style={[
            styles.timerDisplay,
            { 
              width: timerSize - 40, 
              height: timerSize - 40,
              borderRadius: (timerSize - 40) / 2 
            }
          ]}>
            <Text style={[styles.timerText, { fontSize: timerFontSize }]}>
              {formatTime(timerSeconds)}
            </Text>
          </View>
          
          {/* Edge tap indicators */}
          <View style={styles.edgeIndicator} pointerEvents="none">
            <View style={styles.leftEdge}>
              <Text style={styles.edgeText}>-10s</Text>
            </View>
            <View style={styles.rightEdge}>
              <Text style={styles.edgeText}>+10s</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      
      {/* Gesture feedback overlay */}
      <Animated.View style={[styles.feedbackOverlay, animatedFeedbackStyle]}>
        <Text style={styles.feedbackText}>{feedbackText.value}</Text>
      </Animated.View>
      
      {/* Gesture hints */}
      <View style={styles.hintsContainer}>
        <Text style={[styles.hintText, { fontSize: fontSize(10) }]}>
          {isPhone ? 
            'Long press: Reset \u2022 Double tap: Next\nSwipe: Navigate \u2022 Edge: \u00b110s \u2022 Rotate: \u00b15s' :
            'Long press: Reset \u2022 Double tap: Next steep \u2022 Swipe: Navigate \u2022 Edge tap: \u00b110s \u2022 Rotate: \u00b15s'
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 2,
    borderColor: 'rgba(47,122,85,0.3)',
  },
  timerText: {
    color: 'white',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  edgeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  leftEdge: {
    backgroundColor: 'rgba(244,67,54,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    opacity: 0.7,
  },
  rightEdge: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    opacity: 0.7,
  },
  edgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: -40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(47,122,85,0.5)',
  },
  feedbackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  hintsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});