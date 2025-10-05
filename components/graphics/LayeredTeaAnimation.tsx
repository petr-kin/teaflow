import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, View, StyleSheet, Text, Pressable } from 'react-native';
import { Canvas, Circle, Group, LinearGradient, vec, Skia, Path as SkPathCmp, Mask, Rect, Blur, useFont, useImage } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withRepeat, withTiming, Easing, runOnJS, cancelAnimation, SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../lib/theme';
import PerformanceManager from '../../lib/performance';

interface LayeredTeaAnimationProps {
  width?: number;
  height?: number;
  temperature: number;
  brewingTime: number;
  teaType: string;
  isRunning: boolean;
  onGesture?: (gestureType: 'tap' | 'leftEdge' | 'rightEdge' | 'longPress' | 'doubleTap', value?: any) => void;
  showFeedback?: boolean;
}

// Tea color palettes optimized for each tea type
const TEA_COLORS = {
  green: { primary: '#4a7c59', secondary: '#6aa16f', steam: '#e8f5e9' },
  black: { primary: '#8b4513', secondary: '#a0522d', steam: '#fff5e6' },
  oolong: { primary: '#d2691e', secondary: '#daa520', steam: '#fffaf0' },
  white: { primary: '#f5f5dc', secondary: '#faf0e6', steam: '#ffffff' },
  puerh: { primary: '#704214', secondary: '#8b4513', steam: '#fff8dc' },
  herbal: { primary: '#ff6347', secondary: '#ff7f50', steam: '#ffe4e1' },
  custom: { primary: '#778899', secondary: '#b0c4de', steam: '#f0f8ff' }
};

const LayeredTeaAnimation: React.FC<LayeredTeaAnimationProps> = React.memo(({ 
  width = 220, 
  height = 200, 
  temperature = 85, 
  brewingTime = 0, 
  teaType = 'green',
  isRunning = false,
  onGesture,
  showFeedback = true
}) => {
  const theme = useTheme();
  const performanceManager = useMemo(() => PerformanceManager.getInstance(), []);
  const performanceSettings = useMemo(() => performanceManager.getSettings(), []);
  
  // Get tea colors with fallback
  const teaColors = useMemo(() => 
    TEA_COLORS[teaType as keyof typeof TEA_COLORS] || TEA_COLORS.custom,
    [teaType]
  );

  // Web fallback - optimized simple animated view
  if (Platform.OS === 'web') {
    return (
      <Pressable
        style={[
          styles.webFallback,
          {
            width,
            height,
            backgroundColor: teaColors.primary,
            opacity: isRunning ? 1 : 0.8,
          }
        ]}
        onPress={() => onGesture?.('tap')}
        onLongPress={() => onGesture?.('longPress')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Tea animation, ${teaType}, ${temperature} degrees, ${isRunning ? 'brewing' : 'paused'}`}
      >
        <View style={styles.webFallbackInner}>
          <Text style={styles.webFallbackEmoji}>
            {isRunning ? '🫖' : '☕'}
          </Text>
          {showFeedback && (
            <Text style={styles.webFallbackText}>
              {Math.floor(brewingTime)}s
            </Text>
          )}
        </View>
      </Pressable>
    );
  }
  
  // Shared values with optimized initial values
  const steamProgress = useSharedValue(0);
  const leafDriftX = useSharedValue(0);
  const leafDriftY = useSharedValue(0);
  const colorIntensity = useSharedValue(0);
  const touchHighlight = useSharedValue(0);
  const gestureGlow = useSharedValue(0);
  
  // Animation cleanup refs
  const animationRefs = useRef<SharedValue<number>[]>([
    steamProgress,
    leafDriftX,
    leafDriftY,
    colorIntensity,
    touchHighlight,
    gestureGlow
  ]);

  // Cleanup function to cancel all animations
  const cleanupAnimations = () => {
    animationRefs.current.forEach(ref => {
      cancelAnimation(ref);
    });
  };

  useEffect(() => {
    // Clean up previous animations before starting new ones
    cleanupAnimations();

    if (isRunning) {
      // Optimize animation durations based on performance tier
      const animationSpeed = performanceSettings.animationQuality === 'low' ? 1.5 : 1;
      
      // Steam animation with adaptive quality
      if (performanceSettings.animationQuality !== 'low') {
        steamProgress.value = withRepeat(
          withTiming(1, { 
            duration: 3000 * animationSpeed, 
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0) 
          }), 
          -1, 
          true
        );
      }
      
      // Leaf drift animation - reduce complexity on lower tier devices
      if (performanceSettings.tier !== 'low') {
        leafDriftX.value = withRepeat(
          withTiming(20, { 
            duration: 4000 * animationSpeed, 
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
          }), 
          -1, 
          true
        );
        leafDriftY.value = withRepeat(
          withTiming(15, { 
            duration: 3500 * animationSpeed, 
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
          }), 
          -1, 
          true
        );
      }
      
      // Color infusion animation
      colorIntensity.value = withTiming(
        Math.min(1, brewingTime / 120), 
        { 
          duration: 2000 * animationSpeed, 
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
        }
      );
    } else {
      // Pause animations smoothly
      steamProgress.value = withTiming(0, { duration: 500 });
      leafDriftX.value = withTiming(0, { duration: 800 });
      leafDriftY.value = withTiming(0, { duration: 800 });
    }
    
    return cleanupAnimations;
  }, [isRunning, brewingTime, performanceSettings]);
  
  // Touch feedback handlers
  const showTouchFeedback = () => {
    'worklet';
    touchHighlight.value = withTiming(0.8, { duration: 100 }, () => {
      touchHighlight.value = withTiming(0, { duration: 200 });
    });
  };

  const showGestureFeedback = () => {
    'worklet';
    gestureGlow.value = withTiming(1, { duration: 150 }, () => {
      gestureGlow.value = withTiming(0, { duration: 300 });
    });
  };
  
  // Optimized gesture handling with debouncing
  const lastGestureTime = useRef(0);
  const GESTURE_DEBOUNCE = 100; // ms
  
  const gesture = Gesture.Race(
    Gesture.Tap()
      .onEnd(() => {
        'worklet';
        const now = Date.now();
        if (now - lastGestureTime.current > GESTURE_DEBOUNCE) {
          lastGestureTime.current = now;
          showTouchFeedback();
          if (onGesture) {
            runOnJS(onGesture)('tap');
          }
        }
      }),
    // DoubleTap gesture removed - not available in current react-native-gesture-handler version
    // Gesture.DoubleTap()
    //   .onEnd(() => {
    //     'worklet';
    //     const now = Date.now();
    //     if (now - lastGestureTime.current > GESTURE_DEBOUNCE) {
    //       lastGestureTime.current = now;
    //       showGestureFeedback();
    //       if (onGesture) {
    //         runOnJS(onGesture)('doubleTap');
    //       }
    //     }
    //   }),
    Gesture.LongPress()
      .minDuration(600)
      .onEnd(() => {
        'worklet';
        showGestureFeedback();
        if (onGesture) {
          runOnJS(onGesture)('longPress');
        }
      })
  );
  
  // Memoized Skia path creation
  const cupPath = useMemo(() => {
    const path = Skia.Path.Make();
    const cupWidth = width * 0.6;
    const cupHeight = height * 0.5;
    const cupX = (width - cupWidth) / 2;
    const cupY = height * 0.35;
    
    // Cup shape with rounded bottom
    path.moveTo(cupX, cupY);
    path.cubicTo(
      cupX, cupY + cupHeight * 0.8,
      cupX + cupWidth * 0.2, cupY + cupHeight,
      cupX + cupWidth * 0.5, cupY + cupHeight
    );
    path.cubicTo(
      cupX + cupWidth * 0.8, cupY + cupHeight,
      cupX + cupWidth, cupY + cupHeight * 0.8,
      cupX + cupWidth, cupY
    );
    path.close();
    
    return path;
  }, [width, height]);
  
  // Memoized leaf positions for better performance
  const leafPositions = useMemo(() => {
    const count = Math.min(performanceSettings.maxParticles, 5);
    return Array.from({ length: count }, (_, i) => ({
      x: width * 0.3 + (i * width * 0.15),
      y: height * 0.5 + (i * height * 0.05),
      size: 8 + (i * 2),
      rotation: i * 45,
    }));
  }, [width, height, performanceSettings.maxParticles]);
  
  // Derived animation values
  const animatedLeafX = useDerivedValue(() => leafDriftX.value);
  const animatedLeafY = useDerivedValue(() => leafDriftY.value);
  const animatedSteamOpacity = useDerivedValue(() => 
    steamProgress.value * (temperature / 100) * 0.6
  );
  const animatedColorIntensity = useDerivedValue(() => colorIntensity.value);
  const animatedTouchOpacity = useDerivedValue(() => touchHighlight.value);
  const animatedGlowOpacity = useDerivedValue(() => gestureGlow.value);
  
  return (
    <GestureDetector gesture={gesture}>
      <View style={{ width, height }}>
        <Canvas style={{ flex: 1 }}>
          {/* Background gradient */}
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={[
                theme.colors.background,
                theme.colors.surface
              ]}
            />
          </Rect>
          
          {/* Cup/vessel shape */}
          <Group>
            <SkPathCmp path={cupPath} color={teaColors.primary}>
              <LinearGradient
                start={vec(width * 0.2, height * 0.35)}
                end={vec(width * 0.8, height * 0.85)}
                colors={[
                  teaColors.secondary,
                  teaColors.primary
                ]}
              />
            </SkPathCmp>
            
            {/* Tea liquid with color intensity based on brewing time */}
            <Mask
              mask={
                <SkPathCmp path={cupPath} color="white" />
              }
            >
              <Rect 
                x={width * 0.2} 
                y={height * 0.4} 
                width={width * 0.6} 
                height={height * 0.4}
                opacity={animatedColorIntensity}
              >
                <LinearGradient
                  start={vec(width * 0.2, height * 0.4)}
                  end={vec(width * 0.2, height * 0.8)}
                  colors={[
                    teaColors.secondary + 'cc',
                    teaColors.primary
                  ]}
                />
              </Rect>
            </Mask>
          </Group>
          
          {/* Tea leaves - render only based on performance settings */}
          {performanceSettings.tier !== 'low' && leafPositions.map((leaf, index) => {
            // Create derived values for proper animation
            const leafCx = useDerivedValue(() => leaf.x + animatedLeafX.value, [leaf.x, animatedLeafX]);
            const leafCy = useDerivedValue(() => leaf.y + animatedLeafY.value, [leaf.y, animatedLeafY]);

            return (
              <Circle
                key={index}
                cx={leafCx}
                cy={leafCy}
                r={leaf.size}
                color={teaColors.primary + '99'}
                opacity={0.7}
              />
            );
          })}
          
          {/* Steam effect - only on higher performance devices */}
          {performanceSettings.animationQuality !== 'low' && temperature > 70 && (
            <Group opacity={animatedSteamOpacity}>
              {Array.from({ length: 3 }, (_, i) => (
                <Circle
                  key={`steam-${i}`}
                  cx={width * 0.5 + (i - 1) * 20}
                  cy={height * 0.3 - steamProgress.value * 20}
                  r={10 + i * 3}
                  color={teaColors.steam}
                  opacity={0.3}
                >
                  {performanceSettings.enableBlur && (
                    <Blur blur={2} />
                  )}
                </Circle>
              ))}
            </Group>
          )}
          
          {/* Touch feedback overlay */}
          {showFeedback && (
            <>
              <Circle
                cx={width / 2}
                cy={height / 2}
                r={Math.min(width, height) * 0.4}
                color={theme.colors.primary}
                opacity={animatedTouchOpacity}
              />
              <Circle
                cx={width / 2}
                cy={height / 2}
                r={Math.min(width, height) * 0.45}
                color={theme.colors.accent}
                opacity={animatedGlowOpacity}
              >
                {performanceSettings.enableBlur && (
                  <Blur blur={4} />
                )}
              </Circle>
            </>
          )}
        </Canvas>
      </View>
    </GestureDetector>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to optimize re-renders
  return (
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.temperature === nextProps.temperature &&
    Math.floor(prevProps.brewingTime / 5) === Math.floor(nextProps.brewingTime / 5) && // Only re-render every 5 seconds
    prevProps.teaType === nextProps.teaType &&
    prevProps.isRunning === nextProps.isRunning &&
    prevProps.showFeedback === nextProps.showFeedback
  );
});

LayeredTeaAnimation.displayName = 'LayeredTeaAnimation';

const styles = StyleSheet.create({
  webFallback: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webFallbackInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFallbackEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  webFallbackText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default LayeredTeaAnimation;
