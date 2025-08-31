import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../lib/theme';

interface Props {
  visible: boolean;
  teaName: string;
  steepNumber: number;
  onClose: () => void;
  onFeedback: (strength: 'weak' | 'perfect' | 'strong', enjoyment: number) => void;
}

export default function BrewFeedbackModal({ visible, teaName, steepNumber, onClose, onFeedback }: Props) {
  const theme = useTheme();
  const [selectedStrength, setSelectedStrength] = useState<'weak' | 'perfect' | 'strong' | null>(null);
  const [selectedEnjoyment, setSelectedEnjoyment] = useState<number>(0);

  const handleSubmit = () => {
    if (selectedStrength && selectedEnjoyment > 0) {
      onFeedback(selectedStrength, selectedEnjoyment);
      setSelectedStrength(null);
      setSelectedEnjoyment(0);
      onClose();
    }
  };

  const handleStrengthSelect = (strength: 'weak' | 'perfect' | 'strong') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedStrength(strength);
  };

  const handleEnjoymentSelect = (rating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEnjoyment(rating);
  };

  const getStrengthColor = (strength: 'weak' | 'perfect' | 'strong') => {
    const active = strength === 'weak' ? theme.colors.warning : strength === 'strong' ? theme.colors.error : theme.colors.success;
    return selectedStrength === strength ? active : theme.colors.surfaceVariant;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>How was your brew?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {teaName} • Steep #{steepNumber}
          </Text>

          {/* Strength Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Strength</Text>
            <View style={styles.strengthOptions}>
              {(['weak', 'perfect', 'strong'] as const).map(strength => (
                <Pressable
                  key={strength}
                  style={[
                    styles.strengthButton,
                    { backgroundColor: getStrengthColor(strength), borderColor: theme.colors.border }
                  ]}
                  onPress={() => handleStrengthSelect(strength)}
                >
                  <Text style={styles.strengthIcon}>
                    {strength === 'weak' ? '💧' : strength === 'perfect' ? '✨' : '💪'}
                  </Text>
                  <Text
                    style={[
                      styles.strengthText,
                      { color: theme.colors.textSecondary },
                      selectedStrength === strength && { color: theme.colors.text, fontWeight: '600' }
                    ]}
                  >
                    {strength.charAt(0).toUpperCase() + strength.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Enjoyment Rating */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overall Enjoyment</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map(rating => (
                <Pressable
                  key={rating}
                  style={styles.starButton}
                  onPress={() => handleEnjoymentSelect(rating)}
                >
                  <Text
                    style={[
                      styles.star,
                      { opacity: 0.35 },
                      rating <= selectedEnjoyment && { opacity: 1 }
                    ]}
                  >
                    ⭐
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.ratingLabel, { color: theme.colors.textSecondary }]}>
              {selectedEnjoyment === 0 ? 'Tap to rate' :
               selectedEnjoyment === 1 ? 'Poor' :
               selectedEnjoyment === 2 ? 'Fair' :
               selectedEnjoyment === 3 ? 'Good' :
               selectedEnjoyment === 4 ? 'Great' : 'Excellent'}
            </Text>
          </View>

          {/* Learning Insight */}
          {selectedStrength && (
            <View style={[styles.insightBox, { backgroundColor: `${theme.colors.primary}20`, borderColor: theme.colors.border }]}>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                {selectedStrength === 'weak' ? 
                  '💡 Next time: Try increasing steep time by 10-15 seconds or raising temperature by 5°C' :
                 selectedStrength === 'strong' ?
                  '💡 Next time: Try reducing steep time by 5-10 seconds or lowering temperature by 5°C' :
                  '💡 Perfect! I\'ll remember these parameters for future brews'}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.skipButton, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
                (!selectedStrength || selectedEnjoyment === 0) && { backgroundColor: `${theme.colors.primary}50` }
              ]}
              disabled={!selectedStrength || selectedEnjoyment === 0}
            >
              <Text
                style={[
                  styles.submitText,
                  { color: '#fff' },
                  (!selectedStrength || selectedEnjoyment === 0) && { color: 'rgba(255,255,255,0.7)' }
                ]}
              >
                Save Feedback
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  strengthOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  strengthButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  strengthIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
  },
  ratingLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  insightBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
