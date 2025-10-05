import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, Text, Pressable } from 'react-native';
import { Canvas, Circle, Group, LinearGradient, vec, Skia, Path as SkPathCmp, Mask, Rect, Blur } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue, withRepeat, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../lib/theme';

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

export default function LayeredTeaAnimation({ 
  width = 220, 
  height = 200, 
  temperature = 85, 
  brewingTime = 0, 
  teaType = 'green',
  isRunning = false,
  onGesture,
  showFeedback = true
}: LayeredTeaAnimationProps) {
  const theme = useTheme();

  // Web fallback - simple animated view
  if (Platform.OS === 'web') {
    return (
      <Pressable
        style={{
          width,
          height,
          backgroundColor: '#4a7c59',
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: isRunning ? 1 : 0.7,
        }}
        onPress={() => onGesture?.('tap')}
      >
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#6aa16f',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 24,
            color: '#fff',
            textAlign: 'center',
          }}>
            {isRunning ? '🫖' : '☕'}
          </Text>
        </View>
      </Pressable>
    );
  }
  
  // Animation timing values
  const steamProgress = useSharedValue(0);
  const leafDriftX = useSharedValue(0);
  const leafDriftY = useSharedValue(0);
  const colorIntensity = useSharedValue(0);
  
  // Feedback layer values
  const touchHighlight = useSharedValue(0);
  const gestureGlow = useSharedValue(0);
  const stateTransition = useSharedValue(0);
  const parameterFeedback = useSharedValue(0);
  
  useEffect(() => {
    if (isRunning) {
      // Steam animation with organic breathing pattern
      steamProgress.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.bezier(0.4, 0.0, 0.6, 1.0) }), 
        -1, 
        true
      );
      
      // Leaf drift animation with natural floating motion
      leafDriftX.value = withRepeat(
        withTiming(20, { duration: 4000, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) }), 
        -1, 
        true
      );
      leafDriftY.value = withRepeat(
        withTiming(15, { duration: 3500, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) }), 
        -1, 
        true
      );
      
      // Color infusion based on brewing time with organic spread
      colorIntensity.value = withTiming(Math.min(1, brewingTime / 120), { 
        duration: 1000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94)
      });
    } else {
      steamProgress.value = withTiming(0, { duration: 500, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
    }
  }, [isRunning, brewingTime]);

  // Feedback animations
  useEffect(() => {
    if (showFeedback) {
      if (isRunning) {
        stateTransition.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
      } else {
        stateTransition.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
      }
    }
  }, [isRunning, showFeedback]);

  // Gesture handling
  const handleGestureCallback = (gestureType: 'tap' | 'leftEdge' | 'rightEdge' | 'longPress' | 'doubleTap', value?: any) => {
    if (onGesture) {
      onGesture(gestureType, value);
    }
  };

  const showTouchHighlight = () => {
    'worklet';
    touchHighlight.value = withTiming(1, { duration: 100 }, () => {
      touchHighlight.value = withTiming(0, { duration: 200 });
    });
  };

  const showGestureGlow = () => {
    'worklet';
    gestureGlow.value = withTiming(0.8, { duration: 150 }, () => {
      gestureGlow.value = withTiming(0, { duration: 300 });
    });
  };

  const showParameterFeedback = () => {
    'worklet';
    parameterFeedback.value = withTiming(1, { duration: 200 }, () => {
      parameterFeedback.value = withTiming(0, { duration: 800 });
    });
  };

  // Gesture definitions
  const tapGesture = Gesture.Tap()
    .onStart((event) => {
      'worklet';
      showTouchHighlight();
      showGestureGlow();
      
      const tapX = event.x;
      const tapY = event.y;
      
      // Determine gesture type based on tap location
      if (tapX < width * 0.2) {
        // Left edge - decrease time
        showParameterFeedback();
        runOnJS(handleGestureCallback)('leftEdge', -10);
      } else if (tapX > width * 0.8) {
        // Right edge - increase time
        showParameterFeedback();
        runOnJS(handleGestureCallback)('rightEdge', 10);
      } else {
        // Center tap - start/pause
        runOnJS(handleGestureCallback)('tap');
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      'worklet';
      showTouchHighlight();
      showGestureGlow();
      runOnJS(handleGestureCallback)('doubleTap');
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(1000)
    .onStart((event) => {
      'worklet';
      showTouchHighlight();
      showGestureGlow();
      runOnJS(handleGestureCallback)('longPress');
    });

  const composedGestures = Gesture.Exclusive(doubleTapGesture, longPressGesture, tapGesture);

  // Tea type color mapping
  const getTeaColors = (type: string) => {
    switch (type.toLowerCase()) {
      case 'green':
        return { primary: '#4a7c59', secondary: '#6aa16f', accent: '#8db88a' };
      case 'black':
        return { primary: '#5d3a2b', secondary: '#8b5a3c', accent: '#a67c52' };
      case 'oolong':
        return { primary: '#7a5c3f', secondary: '#a67c52', accent: '#c49b6b' };
      case 'white':
        return { primary: '#9ca89c', secondary: '#b5c4b5', accent: '#d4e2d4' };
      case 'puerh':
        return { primary: '#3d2817', secondary: '#5a3e28', accent: '#7a5439' };
      case 'herbal':
        return { primary: '#c49b6b', secondary: '#d4b380', accent: '#e8d0a3' };
      default:
        return { primary: '#4a7c59', secondary: '#6aa16f', accent: '#8db88a' };
    }
  };

  const teaColors = getTeaColors(teaType);

  // Story 1.2.2: Phase-based animation parameters
  const getAnimationParams = (progress: number, randomSeed: number) => {
    if (progress < 0.2) {
      // Start phase (0-20%): 2-3 faint leaves, slow drift
      return { 
        leafSpeed: 0.3, 
        steamIntensity: 0.1, 
        leafCount: Math.floor(2 + randomSeed * 2), // 2-3 leaves
        leafOpacityBase: 0.2,
        steamHeight: 0.2
      };
    } else if (progress < 0.8) {
      // Mid phase (20-80%): Many leaves, faster movement
      return { 
        leafSpeed: 0.7, 
        steamIntensity: 0.6, 
        leafCount: Math.floor(12 + randomSeed * 6), // 12-18 leaves
        leafOpacityBase: 0.6,
        steamHeight: 0.4
      };
    } else {
      // Finish phase (80-100%): Leaves settle, slow movement
      return { 
        leafSpeed: 0.2, 
        steamIntensity: 0.3, 
        leafCount: Math.floor(6 + randomSeed * 4), // 6-10 leaves
        leafOpacityBase: 0.4,
        steamHeight: 0.3
      };
    }
  };

  // Dynamic animation parameters based on brewing progress and time
  const animParams = useDerivedValue(() => {
    const brewingProgress = Math.min(1, brewingTime / 120); // Assuming 2-minute base brew time
    const randomSeed = Math.sin(Date.now() / 10000) * 0.5 + 0.5; // Slow-changing seed
    return getAnimationParams(brewingProgress, randomSeed);
  });

  // Layer 1: Background ambiance
  const backgroundPath = useDerivedValue(() => {
    const t = Date.now() / 2000;
    const wave1 = 10 * Math.sin(t * 0.8);
    const wave2 = 8 * Math.sin(t * 1.2 + Math.PI / 3);
    const d = `M0 ${height * 0.7 + wave1}Q${width * 0.3} ${height * 0.6 + wave2} ${width * 0.6} ${height * 0.75 + wave1}T${width} ${height * 0.7}V${height}H0Z`;
    return Skia.Path.MakeFromSVGString(d)!;
  });

  // Layer 2: Dynamic tea leaf particles with phase-based animation
  const leafPositions = useDerivedValue(() => {
    const leaves = [];
    const t = Date.now() / 1000;
    
    // Use dynamic animation parameters based on brewing phase
    for (let i = 0; i < animParams.value.leafCount; i++) {
      // Lava lamp-style organic movement with multiple oscillations
      const baseX = (width / (animParams.value.leafCount + 1)) * (i + 1);
      const baseY = height * 0.3 + Math.random() * height * 0.4;
      
      // Multi-layered organic movement (lava lamp style)
      const slowDrift = Math.sin(t * 0.2 + i * 0.7) * 25 * animParams.value.leafSpeed;
      const mediumWave = Math.sin(t * 0.5 + i * 1.3) * 15 * animParams.value.leafSpeed;
      const fastFlutter = Math.sin(t * 1.2 + i * 2.1) * 8 * animParams.value.leafSpeed;
      
      const slowVertical = Math.cos(t * 0.3 + i * 0.9) * 20 * animParams.value.leafSpeed;
      const mediumVertical = Math.cos(t * 0.7 + i * 1.7) * 12 * animParams.value.leafSpeed;
      const fastVertical = Math.cos(t * 1.5 + i * 2.3) * 6 * animParams.value.leafSpeed;
      
      leaves.push({
        x: baseX + slowDrift + mediumWave + fastFlutter,
        y: baseY + slowVertical + mediumVertical + fastVertical,
        size: 2.5 + Math.sin(t * 0.8 + i * 1.9) * 1.5,
        opacity: animParams.value.leafOpacityBase + Math.sin(t * 0.4 + i * 1.1) * 0.3,
        rotationPhase: t * 0.6 + i * 2.8 // For future rotation animation
      });
    }
    return leaves;
  });

  // Layer 3: Dynamic steam wisps with phase-based intensity
  const steamPath = useDerivedValue(() => {
    if (temperature < 75) return null;
    
    const t = Date.now() / 1500;
    // Use phase-based steam parameters
    const steamHeight = steamProgress.value * height * animParams.value.steamHeight;
    const intensity = animParams.value.steamIntensity;
    
    // Multi-wisp steam with variable intensity
    const centerX = width / 2;
    const startY = height * 0.3;
    
    // Primary steam wisp with organic movement
    const wisp1 = 15 * Math.sin(t * 1.5) * intensity;
    const wisp2 = 12 * Math.sin(t * 1.8 + Math.PI / 4) * intensity;
    const wisp3 = 8 * Math.sin(t * 2.1 + Math.PI / 2) * intensity;
    
    // Create path with multiple control points for more organic steam
    const d = `M${centerX - 3} ${startY}
               Q${centerX + wisp1} ${startY - steamHeight * 0.2} 
                ${centerX + wisp2 + wisp3} ${startY - steamHeight * 0.4}
               Q${centerX - wisp1 + wisp3} ${startY - steamHeight * 0.6} 
                ${centerX + wisp2} ${startY - steamHeight * 0.8}
               Q${centerX - wisp2} ${startY - steamHeight * 0.9} 
                ${centerX} ${startY - steamHeight}
               M${centerX + 3} ${startY}
               Q${centerX - wisp2} ${startY - steamHeight * 0.25} 
                ${centerX - wisp1 - wisp3} ${startY - steamHeight * 0.45}
               Q${centerX + wisp2 - wisp3} ${startY - steamHeight * 0.65} 
                ${centerX - wisp1} ${startY - steamHeight * 0.85}`;
    return Skia.Path.MakeFromSVGString(d);
  });

  // Steam dynamic properties
  const steamStrokeWidth = useDerivedValue(() => {
    return 1 + animParams.value.steamIntensity * 2;
  });

  const steamOpacity = useDerivedValue(() => {
    return Math.round(animParams.value.steamIntensity * 180).toString(16).padStart(2, '0');
  });

  // Feedback layer animated values
  const touchHighlightStyle = useDerivedValue(() => {
    return touchHighlight.value;
  });

  const gestureGlowStyle = useDerivedValue(() => {
    return gestureGlow.value;
  });

  const parameterFeedbackStyle = useDerivedValue(() => {
    return parameterFeedback.value;
  });

  const stateTransitionStyle = useDerivedValue(() => {
    return stateTransition.value;
  });

  return (
    <GestureDetector gesture={composedGestures}>
      <View style={styles.container}>
        <Canvas style={{ width, height }}>
          <Group>
        {/* Layer 1: Background Tea Liquid */}
        <SkPathCmp path={backgroundPath}>
          <LinearGradient 
            start={vec(0, height * 0.6)} 
            end={vec(0, height)} 
            colors={[
              `${teaColors.primary}${Math.round(40 + colorIntensity.value * 60).toString(16).padStart(2, '0')}`,
              `${teaColors.secondary}${Math.round(60 + colorIntensity.value * 80).toString(16).padStart(2, '0')}`
            ]} 
          />
        </SkPathCmp>

        {/* Layer 2: Tea Leaf Particles */}
        {leafPositions.value.map((leaf, index) => (
          <Circle 
            key={index}
            cx={leaf.x} 
            cy={leaf.y} 
            r={leaf.size}
            color={`${teaColors.accent}${Math.round(leaf.opacity * 255).toString(16).padStart(2, '0')}`}
          />
        ))}

        {/* Layer 3: Steam Wisps */}
        {steamPath.value && (
          <SkPathCmp 
            path={steamPath.value} 
            style="stroke" 
            strokeWidth={steamStrokeWidth.value}
            color={`${theme.colors.textSecondary}${steamOpacity.value}`}
          />
        )}

        {/* Layer 4: Color Infusion Overlay */}
        <Rect 
          x={0} 
          y={height * 0.7} 
          width={width} 
          height={height * 0.3}
          color={`${teaColors.primary}${Math.round(colorIntensity.value * 60).toString(16).padStart(2, '0')}`}
        />

        {/* Feedback Layer: Touch Highlights */}
        {showFeedback && (
          <Circle
            cx={width / 2}
            cy={height / 2}
            r={Math.min(width, height) * 0.4 * touchHighlightStyle.value}
            color={`${theme.colors.primary}${Math.round(touchHighlightStyle.value * 60).toString(16).padStart(2, '0')}`}
          />
        )}

        {/* Feedback Layer: Gesture Glow */}
        {showFeedback && (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            color={`${theme.colors.accent}${Math.round(gestureGlowStyle.value * 30).toString(16).padStart(2, '0')}`}
          />
        )}

        {/* Feedback Layer: State Transition */}
        {showFeedback && isRunning && (
          <Circle
            cx={width / 2}
            cy={height / 2}
            r={Math.min(width, height) * 0.35}
            style="stroke"
            strokeWidth={2 + stateTransitionStyle.value * 3}
            color={`${teaColors.accent}${Math.round(stateTransitionStyle.value * 120).toString(16).padStart(2, '0')}`}
          />
        )}
      </Group>

      {/* Gesture Layer: Invisible Touch Zones */}
      <Group>
        {/* Left edge zone */}
        <Rect
          x={0}
          y={0}
          width={width * 0.2}
          height={height}
          color={`#00000000`} // Transparent
        />
        
        {/* Center zone */}
        <Rect
          x={width * 0.2}
          y={0}
          width={width * 0.6}
          height={height}
          color={`#00000000`} // Transparent
        />
        
        {/* Right edge zone */}
        <Rect
          x={width * 0.8}
          y={0}
          width={width * 0.2}
          height={height}
          color={`#00000000`} // Transparent
        />
      </Group>
    </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});