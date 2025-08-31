import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TeaProfile } from '../lib/types';
import { loadUserTeas, saveUserTea } from '../lib/store';
import { getBrewFeedbacks, getTeaAnalytics } from '../lib/learning';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';
import Header from './ui/Header';
import Button from './ui/Button';
import Card from './ui/Card';

interface Props {
  onClose: () => void;
  onRefreshTeas: () => void;
}

interface ExportData {
  version: string;
  exportDate: string;
  userTeas: TeaProfile[];
  brewFeedbacks?: any[];
  analytics?: any[];
}

export default function ExportImportScreen({ onClose, onRefreshTeas }: Props) {
  const theme = useTheme();
  const { spacing } = useResponsive();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [showManualImport, setShowManualImport] = useState(false);

  const handleExport = async (includeAnalytics = false) => {
    setIsExporting(true);
    
    try {
      const userTeas = await loadUserTeas();
      
      if (userTeas.length === 0) {
        Alert.alert('No Data', 'You don\'t have any custom teas to export.');
        setIsExporting(false);
        return;
      }

      const exportData: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userTeas,
      };

      if (includeAnalytics) {
        const feedbacks = await getBrewFeedbacks();
        const analytics = [];
        
        // Collect analytics for each tea
        for (const tea of userTeas) {
          const teaAnalytics = await getTeaAnalytics(tea.id);
          analytics.push({ teaId: tea.id, ...teaAnalytics });
        }
        
        exportData.brewFeedbacks = feedbacks;
        exportData.analytics = analytics;
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `teaflow_export_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Tea Collection',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Your tea collection has been exported to:\n${fileName}\n\nYou can find it in your device's Documents folder.`
        );
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Error', 'Failed to export tea collection. Please try again.');
    }
    
    setIsExporting(false);
  };

  const handleImportFile = async () => {
    setIsImporting(true);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        await processImportData(fileContent);
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Error', 'Failed to read the selected file. Please try again.');
    }
    
    setIsImporting(false);
  };

  const handleManualImport = async () => {
    if (!importData.trim()) {
      Alert.alert('Error', 'Please paste the export data first.');
      return;
    }

    setIsImporting(true);
    await processImportData(importData);
    setIsImporting(false);
  };

  const processImportData = async (jsonString: string) => {
    try {
      const data: ExportData = JSON.parse(jsonString);
      
      if (!data.userTeas || !Array.isArray(data.userTeas)) {
        throw new Error('Invalid export format');
      }

      if (data.userTeas.length === 0) {
        Alert.alert('No Data', 'The import file doesn\'t contain any tea profiles.');
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        'Import Tea Collection',
        `Found ${data.userTeas.length} tea profiles from ${data.exportDate ? new Date(data.exportDate).toLocaleDateString() : 'unknown date'}.\n\nThis will add these teas to your collection. Existing teas with the same names will be updated.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Import', 
            onPress: async () => {
              let importedCount = 0;
              let updatedCount = 0;
              
              for (const tea of data.userTeas) {
                // Validate tea structure
                if (!tea.id || !tea.name || !tea.type || !tea.baseTempC || !tea.baseScheduleSec) {
                  console.warn('Skipping invalid tea:', tea);
                  continue;
                }

                const existingTeas = await loadUserTeas();
                const existing = existingTeas.find(t => t.name === tea.name);
                
                // Generate new ID to avoid conflicts
                const importedTea: TeaProfile = {
                  ...tea,
                  id: existing ? existing.id : `imported_${Date.now()}_${importedCount}`,
                  user: true, // Ensure it's marked as user tea
                };

                await saveUserTea(importedTea);
                
                if (existing) {
                  updatedCount++;
                } else {
                  importedCount++;
                }
              }

              onRefreshTeas();
              
              const message = `Successfully imported ${importedCount} new teas${updatedCount > 0 ? ` and updated ${updatedCount} existing teas` : ''}.`;
              Alert.alert('Import Complete', message);
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setImportData('');
              setShowManualImport(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Parse error:', error);
      Alert.alert('Import Error', 'The selected file is not a valid Teaflow export. Please check the file format.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { padding: spacing(20) }]}>
        {/* Header */}
        <Header title="Export & Import" onBack={onClose} />

        {/* Export Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📤 Export Collection</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Save your custom tea profiles to share or backup your collection.
          </Text>

          <View style={styles.exportOptions}>
            <Card>
              <View style={{ gap: 6 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                  {isExporting ? 'Exporting…' : '📋 Export Teas Only'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                  Export just your custom tea profiles
                </Text>
                <Button title={isExporting ? 'Working…' : 'Export'} variant="primary" onPress={() => handleExport(false)} disabled={isExporting} />
              </View>
            </Card>
            <Card>
              <View style={{ gap: 6 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                  {isExporting ? 'Exporting…' : '📊 Export with Analytics'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                  Include brewing history and preferences
                </Text>
                <Button title={isExporting ? 'Working…' : 'Export'} variant="secondary" onPress={() => handleExport(true)} disabled={isExporting} />
              </View>
            </Card>
          </View>
        </View>

        {/* Import Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📥 Import Collection</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Import tea profiles from a Teaflow export file.
          </Text>

          <View style={styles.importOptions}>
            <Card>
              <View style={{ gap: 6, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                  {isImporting ? 'Importing…' : '📁 Select File'}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                  Choose a .json export file
                </Text>
                <Button title={isImporting ? 'Working…' : 'Select'} variant="primary" onPress={handleImportFile} disabled={isImporting} />
              </View>
            </Card>

            <Text style={[styles.orText, { color: theme.colors.textTertiary }]}>or</Text>

            <Card>
              <View style={{ gap: 6, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>✏️ Manual Import</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13, textAlign: 'center' }}>
                  Paste export data directly
                </Text>
                <Button title={showManualImport ? 'Hide' : 'Show'} variant="secondary" onPress={() => setShowManualImport(!showManualImport)} />
              </View>
            </Card>
          </View>

          {showManualImport && (
            <View style={[styles.manualImportContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.manualImportLabel, { color: theme.colors.text }] }>
                Paste export data here:
              </Text>
              <TextInput
                style={[
                  styles.manualImportInput,
                  { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }
                ]}
                value={importData}
                onChangeText={setImportData}
                placeholder="Paste JSON export data..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              
              <Button
                title={isImporting ? 'Processing…' : 'Import Data'}
                variant="primary"
                onPress={handleManualImport}
                disabled={!importData.trim() || isImporting}
              />
            </View>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>ℹ️ About Export & Import</Text>
          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            • Export files are saved in JSON format{'\n'}
            • Analytics include brewing history and preferences{'\n'}
            • Imported teas are added to your collection{'\n'}
            • Existing teas with same names will be updated{'\n'}
            • Export files can be shared between devices
          </Text>
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  exportOptions: {
    gap: 12,
  },
  importOptions: {
    gap: 12,
    alignItems: 'center',
  },
  orText: {
    fontSize: 14,
    margin: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  manualImportContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  manualImportLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  manualImportInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
