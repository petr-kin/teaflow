import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/theme';

interface Props {
  title: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export default function Header({ title, onBack, right, style }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.container, style]}> 
      <View style={styles.side}>
        {onBack && (
          <Pressable onPress={onBack}>
            <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
          </Pressable>
        )}
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title as any}</Text>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  side: { width: 80 },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  backText: { fontSize: 16, fontWeight: '500' },
});
