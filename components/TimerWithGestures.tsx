import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, AccessibilityInfo } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming, withRepeat, Easing } from 'react-native-reanimated';
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
  onStartPause: () => void;
}

export default function TimerWithGestures({
  timerSeconds,
  isRunning,
  onReset,
  onAddTime,
  onNextSteep,
  onPrevSteep,
  canGoNext,
  canGoPrev,
  onStartPause
}: Props) {
  const { isPhone, isTablet, spacing, fontSize } = useResponsive();
  const [isHighContrastEnabled, setIsHighContrastEnabled] = React.useState(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const feedbackOpacity = useSharedValue(0);
  const feedbackText = useSharedValue('');
  const breathingScale = useSharedValue(1);
  const touchHighlight = useSharedValue(0);
  const longPressStartTime = useRef(0);

  const announceToAccessibility = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  const showFeedback = (text: string) => {
    'worklet';
    feedbackText.value = text;
    feedbackOpacity.value = withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) }, () => {
      feedbackOpacity.value = withTiming(0, { duration: 1500, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
    });
    // Announce to screen readers
    runOnJS(announceToAccessibility)(text);
  };

  const showTouchHighlight = () => {
    'worklet';
    touchHighlight.value = withTiming(1, { duration: 100, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) }, () => {
      touchHighlight.value = withTiming(0, { duration: 200, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
    });
  };

  const handleLongPressReset = () => {
    onReset();
    showFeedback('Timer Reset');
  };

  // Check for high contrast mode
  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const highContrast = await AccessibilityInfo.isHighTextContrastEnabled?.();
        setIsHighContrastEnabled(highContrast || false);
      } catch (error) {
        // Fallback for platforms that don't support this API
        setIsHighContrastEnabled(false);
      }
    };
    checkAccessibilitySettings();
  }, []);

  // Subtle breathing animation when timer is not running
  useEffect(() => {
    if (!isRunning) {
      breathingScale.value = withRepeat(
        withTiming(1.02, { 
          duration: 2000, 
          easing: Easing.bezier(0.4, 0.0, 0.6, 1.0) 
        }), 
        -1, 
        true
      );
    } else {
      breathingScale.value = withTiming(1, { 
        duration: 300, 
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
      });
    }
  }, [isRunning, breathingScale]);

  const handleDoubleTagNextSteep = () => {
    if (canGoNext) {
      onNextSteep();
      showFeedback('Next Steep');
    } else {
      showFeedback('Last Steep');
    }
  };

  const handleCenterTap = () => {
    onStartPause();
    showFeedback(isRunning ? 'Paused' : 'Started');
    // Add visual pulse animation with organic spring physics
    scale.value = withSpring(1.1, { damping: 15, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    });
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
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      runOnJS(handleLongPressReset)();
    });

  // Single tap for start/pause
  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onBegin(() => {
      'worklet';
      showTouchHighlight();
    })
    .onEnd(() => {
      'worklet';
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      runOnJS(handleCenterTap)();
    });

  // Double tap for next steep
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1.05, { damping: 12, stiffness: 180 }, () => {
        scale.value = withSpring(1, { damping: 18, stiffness: 280 });
      });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      runOnJS(handleDoubleTagNextSteep)();
    });

  // Pan gesture for swipe navigation and edge taps
  const pan = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      const { x, absoluteX } = e;
      const screenWidth = Dimensions.get('window').width;
      // Check if tap is on edges (left 20% or right 20% of screen width)
      if (absoluteX < screenWidth * 0.2) {
        runOnJS(handleEdgeTap)('left');
      } else if (absoluteX > screenWidth * 0.8) {
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
      rotation.value = withSpring(0, { damping: 15, stiffness: 200 });
    });

  const combinedGestures = Gesture.Simultaneous(
    Gesture.Race(longPress, Gesture.Exclusive(doubleTap, singleTap)),
    pan,
    rotationGesture
  );

  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * breathingScale.value },
      { rotate: `${rotation.value}rad` }
    ]
  }));

  const animatedFeedbackStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [
      { scale: feedbackOpacity.value }
    ]
  }));

  const animatedTouchHighlightStyle = useAnimatedStyle(() => ({
    opacity: touchHighlight.value * 0.3,
    transform: [
      { scale: 1 + touchHighlight.value * 0.05 }
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
        <Animated.View 
          style={[
            styles.timerContainer, 
            animatedTimerStyle,
            { width: timerSize, height: timerSize }
          ]}
          accessible={true}
          accessibilityRole="timer"
          accessibilityLabel={`Tea timer: ${formatTime(timerSeconds)}${isRunning ? ' running' : ' paused'}`}
          accessibilityHint="Tap to start or pause timer. Long press to reset. Double tap for next steep. Swipe left or right to navigate steeps. Tap edges to adjust time."
        >
          {/* Touch highlight overlay */}
          <Animated.View style={[
            styles.touchHighlight,
            animatedTouchHighlightStyle,
            { width: timerSize, height: timerSize, borderRadius: timerSize / 2 }
          ]} pointerEvents="none" />
          
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
      <Animated.View style={[
        styles.feedbackOverlay, 
        animatedFeedbackStyle,
        isHighContrastEnabled && styles.feedbackOverlayHighContrast
      ]}>
        <Text style={[
          styles.feedbackText,
          isHighContrastEnabled && styles.feedbackTextHighContrast
        ]}>{feedbackText.value}</Text>
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
  touchHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(47,122,85,0.6)',
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
  feedbackOverlayHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  feedbackTextHighContrast: {
    color: '#FFFFFF',
    fontWeight: '700',
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