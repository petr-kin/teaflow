import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../lib/theme';
import { useResponsive } from '../ResponsiveView';

type Variant = 'primary' | 'secondary' | 'ghost' | 'text';
type Size = 'sm' | 'md';

interface Props {
  variant?: Variant;
  size?: Size;
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({ variant = 'primary', size = 'md', title, onPress, disabled, style, textStyle }: Props) {
  const theme = useTheme();
  const { fontSize } = useResponsive();

  const bg =
    variant === 'primary' ? theme.colors.primary :
    variant === 'secondary' ? theme.colors.surfaceVariant :
    'transparent';

  const color =
    variant === 'primary' ? theme.colors.surface : theme.colors.text;

  const border = variant === 'ghost' ? { borderWidth: 1, borderColor: theme.colors.border } : null;

  const base: ViewStyle = {
    paddingHorizontal: size === 'md' ? 16 : 12,
    paddingVertical: size === 'md' ? 10 : 8,
    borderRadius: 16,
    backgroundColor: bg,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
  };

  const textBase: TextStyle = {
    color,
    fontSize: size === 'md' ? fontSize(16) : fontSize(14),
    fontWeight: variant === 'text' ? '500' : '600',
  };

  const containerStyle: ViewStyle = [base, border as any, style] as any;
  const finalTextStyle: TextStyle = [textBase, variant === 'text' && { color: theme.colors.textSecondary }, textStyle] as any;

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [containerStyle, pressed && styles.pressed] }>
      <Text style={finalTextStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
});

