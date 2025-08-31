import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

interface Props {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
}

export default function IconButton({ name, size = 20, onPress, color, style }: Props) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.7 : 1 }, style] }>
      <Ionicons name={name} size={size} color={color || theme.colors.textSecondary} />
    </Pressable>
  );
}

