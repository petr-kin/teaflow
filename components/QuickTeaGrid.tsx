import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TeaProfile } from '../lib/types';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';
import TeaLeafIcon from './graphics/TeaLeafIcon';

interface Props {
  teas: TeaProfile[];
  onSelectTea: (tea: TeaProfile) => void;
  onClose: () => void;
}

export default function QuickTeaGrid({ teas, onSelectTea, onClose }: Props) {
  const theme = useTheme();
  const { isPhone, isTablet, spacing } = useResponsive();
  
  // Responsive grid columns based on device
  const numColumns = isPhone ? 2 : isTablet ? 3 : 4;
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - spacing(8) - (numColumns - 1) * spacing(3)) / numColumns;

  const handleTeaSelect = (tea: TeaProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectTea(tea);
    onClose();
  };

  const formatSteeps = (steeps: number[]) => {
    return `${steeps.length} steeps`;
  };

  const formatTemperature = (tempC: number) => {
    return `${tempC}°C`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Select Tea
        </Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>
            ✕
          </Text>
        </Pressable>
      </View>
      
      <View style={[styles.grid, { gap: spacing(3) }]}>
        {teas.map((tea) => (
          <Pressable
            key={tea.id}
            style={[
              styles.teaCard,
              {
                width: cardWidth,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accent + '20',
              }
            ]}
            onPress={() => handleTeaSelect(tea)}
          >
            <View style={styles.cardHeader}>
              <TeaLeafIcon 
                type={tea.type} 
                size={24} 
                color={theme.colors.accent}
              />
              <Text style={[styles.teaName, { color: theme.colors.text }]}>
                {tea.name}
              </Text>
            </View>
            
            <View style={styles.cardDetails}>
              <Text style={[styles.teaDetail, { color: theme.colors.textSecondary }]}>
                {formatTemperature(tea.baseTempC)}
              </Text>
              <Text style={[styles.teaDetail, { color: theme.colors.textSecondary }]}>
                {formatSteeps(tea.baseScheduleSec)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Account for status bar
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  teaCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teaName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  cardDetails: {
    gap: 4,
  },
  teaDetail: {
    fontSize: 12,
    fontWeight: '500',
  },
});