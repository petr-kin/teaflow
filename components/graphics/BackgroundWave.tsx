import React, { useEffect } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../lib/theme';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedProps, Easing } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function BackgroundWave({ width = 360, height = 140 }: { width?: number; height?: number }) {
  const theme = useTheme();
  // Shared phase for continuous wave motion
  const phase = useSharedValue(0);

  useEffect(() => {
    // Loop phase smoothly for subtle background motion with organic easing
    phase.value = withRepeat(
      withTiming(2 * Math.PI, { duration: 6000, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) }),
      -1,
      false
    );
  }, [phase]);

  const animatedProps = useAnimatedProps(() => {
    // Gentle wave oscillation using sine on control points
    const a = 6; // amplitude
    const p = phase.value;
    const y1 = 80 + a * Math.sin(p);
    const y2 = 120 + a * Math.sin(p + Math.PI / 2);
    const y3 = 110 + a * Math.sin(p + Math.PI);
    const path = `M0 0H360V${y1}C300 ${y2} 220 ${y2} 180 ${y3}C120 ${y3 - 15} 60 ${y3 - 20} 0 ${y2 + 10}Z`;
    return { d: path } as any;
  });
  return (
    <Svg width={width} height={height} viewBox="0 0 360 140" style={{ position: 'absolute', top: 0 }}>
      <Defs>
        <LinearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.25" />
          <Stop offset="1" stopColor={theme.colors.primaryVariant} stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      <AnimatedPath animatedProps={animatedProps} fill="url(#wave)" />
    </Svg>
  );
}
