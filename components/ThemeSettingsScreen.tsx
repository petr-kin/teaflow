import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, ThemeMode, ThemeManager, lightTheme, darkTheme } from '../lib/theme';

interface Props {
  onClose: () => void;
}

export default function ThemeSettingsScreen({ onClose }: Props) {
  const theme = useTheme();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(theme.mode);
  const [previewMode, setPreviewMode] = useState<ThemeMode>(theme.mode);
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);

  useEffect(() => {
    setSelectedMode(theme.mode);
    setPreviewMode(theme.mode);
  }, [theme.mode]);

  const themeManager = ThemeManager.getInstance();

  const handleModeSelect = async (mode: ThemeMode) => {
    setSelectedMode(mode);
    if (!isPreviewEnabled) {
      await themeManager.setTheme(mode);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePreviewToggle = async (enabled: boolean) => {
    setIsPreviewEnabled(enabled);
    if (enabled) {
      setPreviewMode(selectedMode);
    } else {
      await themeManager.setTheme(selectedMode);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePreviewMode = async (mode: ThemeMode) => {
    setPreviewMode(mode);
    if (isPreviewEnabled) {
      await themeManager.setTheme(mode);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    await themeManager.setTheme(selectedMode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const handleCancel = async () => {
    // Restore original theme if we were previewing
    if (isPreviewEnabled && previewMode !== theme.mode) {
      await themeManager.setTheme(theme.mode);
    }
    onClose();
  };

  const getPreviewTheme = (mode: ThemeMode) => {
    return mode === 'light' ? lightTheme : darkTheme;
  };

  const modes: { mode: ThemeMode; title: string; description: string; icon: string }[] = [
    {
      mode: 'light',
      title: 'Light Theme',
      description: 'Clean and bright interface perfect for daytime brewing',
      icon: '☀️'
    },
    {
      mode: 'dark',
      title: 'Dark Theme',
      description: 'Easy on the eyes for evening tea sessions',
      icon: '🌙'
    },
    {
      mode: 'auto',
      title: 'Auto Theme',
      description: 'Follows your system preference (currently dark)',
      icon: '🌓'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.colors.primary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text }]}>Theme Settings</Text>
          <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        {/* Preview Toggle */}
        <View style={[styles.section, styles.previewSection]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Live Preview</Text>
            <Switch
              value={isPreviewEnabled}
              onValueChange={handlePreviewToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={isPreviewEnabled ? theme.colors.background : theme.colors.textTertiary}
            />
          </View>
          <Text style={[styles.previewDescription, { color: theme.colors.textSecondary }]}>
            See theme changes instantly while browsing options
          </Text>
        </View>

        {/* Theme Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Theme</Text>
          
          {modes.map(({ mode, title, description, icon }) => {
            const isSelected = selectedMode === mode;
            const previewTheme = getPreviewTheme(mode);
            
            return (
              <Pressable
                key={mode}
                style={[
                  styles.modeOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => handleModeSelect(mode)}
                onLongPress={() => isPreviewEnabled && handlePreviewMode(mode)}
              >
                <View style={styles.modeContent}>
                  <View style={styles.modeHeader}>
                    <Text style={styles.modeIcon}>{icon}</Text>
                    <View style={styles.modeInfo}>
                      <Text style={[styles.modeTitle, { color: theme.colors.text }]}>
                        {title}
                      </Text>
                      <Text style={[styles.modeDescription, { color: theme.colors.textSecondary }]}>
                        {description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.selectedCheckmark}>✓</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Theme Preview */}
                  <View style={styles.previewContainer}>
                    <View style={[styles.preview, { backgroundColor: previewTheme.colors.background }]}>
                      <View style={[styles.previewSurface, { backgroundColor: previewTheme.colors.surface }]}>
                        <View style={[styles.previewText, { backgroundColor: previewTheme.colors.text }]} />
                        <View style={[styles.previewTextSecondary, { backgroundColor: previewTheme.colors.textSecondary }]} />
                      </View>
                      <View style={[styles.previewButton, { backgroundColor: previewTheme.colors.primary }]} />
                    </View>
                  </View>
                </View>
                
                {isPreviewEnabled && (
                  <Text style={[styles.previewHint, { color: theme.colors.textTertiary }]}>
                    Long press to preview
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Theme Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About Themes</Text>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              • Light theme provides better visibility in bright environments{'\n'}
              • Dark theme reduces eye strain in low light conditions{'\n'}
              • Auto theme will adapt based on your system settings{'\n'}
              • All brewing data and preferences are preserved across themes
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 30,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modeOption: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  modeContent: {
    marginBottom: 8,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: 120,
    height: 80,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  previewSurface: {
    flex: 1,
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
  },
  previewText: {
    height: 8,
    borderRadius: 2,
    marginBottom: 4,
    width: '80%',
  },
  previewTextSecondary: {
    height: 6,
    borderRadius: 2,
    width: '60%',
  },
  previewButton: {
    height: 16,
    borderRadius: 4,
    width: '40%',
  },
  previewHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});