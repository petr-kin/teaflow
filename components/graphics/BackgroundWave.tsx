import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../lib/theme';

export default function BackgroundWave({ width = 360, height = 140 }: { width?: number; height?: number }) {
  const theme = useTheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 360 140" style={{ position: 'absolute', top: 0 }}>
      <Defs>
        <LinearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.25" />
          <Stop offset="1" stopColor={theme.colors.primaryVariant} stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      <Path
        d="M0 0H360V80C300 120 220 120 180 110C120 95 60 90 0 120Z"
        fill="url(#wave)"
      />
    </Svg>
  );
}

