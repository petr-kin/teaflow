import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { useTheme } from '../../lib/theme';

export default function KettleIllustration({ width = 200 }: { width?: number }) {
  const theme = useTheme();
  const height = width * 0.6;
  return (
    <Svg width={width} height={height} viewBox="0 0 200 120">
      <Defs>
        <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.colors.surface} />
          <Stop offset="1" stopColor={theme.colors.surfaceVariant} />
        </LinearGradient>
        <LinearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.colors.primary} />
          <Stop offset="1" stopColor={theme.colors.secondary} />
        </LinearGradient>
      </Defs>
      <G opacity={0.95}>
        <Path d="M40 90h120c0 0 12-30-30-50H70C28 60 40 90 40 90Z" fill="url(#body)" stroke={theme.colors.border} />
        <Path d="M150 55c12 0 24 10 24 22" stroke="url(#accent)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <Path d="M50 52c0-12 10-22 22-22h56c12 0 22 10 22 22" stroke={theme.colors.border} strokeOpacity="0.6" />
        <Circle cx="100" cy="88" r="8" fill="url(#accent)" />
      </G>
    </Svg>
  );
}

