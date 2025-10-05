import React from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../lib/theme';

interface Props {
  label: string;
  tone?: 'primary' | 'neutral';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Tag({ label, tone = 'primary', style, textStyle }: Props) {
  const theme = useTheme();
  const bg = tone === 'primary' ? theme.colors.primary : theme.colors.surfaceVariant;
  const color = tone === 'primary' ? theme.colors.surface : theme.colors.textSecondary;
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }, style]}>
      <Text style={[{ color, fontSize: 10, fontWeight: '600' }, textStyle]}>{label}</Text>
    </View>
  );
}

