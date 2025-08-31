import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../../lib/theme';

export default function TeaLogo({ size = 28 }: { size?: number }) {
  const theme = useTheme();
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="1" />
          <Stop offset="1" stopColor={theme.colors.secondary} stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B9E4C9" />
          <Stop offset="1" stopColor="#3E9C6E" />
        </LinearGradient>
      </Defs>
      <G>
        <Circle cx="20" cy="20" r="18" stroke="url(#ring)" strokeWidth="2.5" fill="none" />
        <Path
          d="M14 24c8-2 11-8 12-14c-6 1-11 4-12 9c-1 3 0 5 0 5z"
          fill="url(#leaf)"
          stroke="#2F7A55"
          strokeOpacity="0.4"
        />
        <Path d="M14 24c4-1 8-5 10-10" stroke="#2F7A55" strokeOpacity="0.4" strokeWidth="1" fill="none" />
      </G>
    </Svg>
  );
}

