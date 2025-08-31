import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function TeaLeafIcon({ size = 20, color = '#4CAF50' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.9" />
          <Stop offset="1" stopColor={color} stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      <Path d="M4 14c8 0 12-6 14-12c0 10-6 16-14 16c0 0 0-4 0-4z" fill="url(#leafFill)" />
      <Path d="M4 14c5 0 9-4 12-10" stroke="#2F7A55" strokeOpacity="0.4" strokeWidth="1.2" fill="none" />
    </Svg>
  );
}

