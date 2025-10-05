import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Canvas, Path as SkPathCmp, LinearGradient, vec, Skia, Group, BlurMask } from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

export default function BackgroundWaveSkia({ width = 360, height = 140 }: { width?: number; height?: number }) {
  const theme = useTheme();
  const clock = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      clock.value = Date.now();
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  // Animated SVG-like path calculated each frame
  const pathValue = useDerivedValue(() => {
    const t = clock.value / 1000; // seconds
    const a = 6; // amplitude
    const y1 = 80 + a * Math.sin(t * 1.0);
    const y2 = 120 + a * Math.sin(t * 1.0 + Math.PI / 2);
    const y3 = 110 + a * Math.sin(t * 1.0 + Math.PI);
    const d = `M0 0H360V${y1}C300 ${y2} 220 ${y2} 180 ${y3}C120 ${y3 - 15} 60 ${y3 - 20} 0 ${y2 + 10}Z`;
    return Skia.Path.MakeFromSVGString(d)!;
  }, [clock]);

  return (
    <Canvas style={{ width, height, position: 'absolute', top: 0 }}>
      <Group>
        <SkPathCmp path={pathValue}>
          <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={[`${theme.colors.primary}40`, `${theme.colors.primaryVariant}0D`]} />
        </SkPathCmp>
        {/* Subtle glow */}
        <SkPathCmp path={pathValue} color={`${theme.colors.primary}20`}>
          <BlurMask blur={8} style="outer" />
        </SkPathCmp>
      </Group>
    </Canvas>
  );
}

