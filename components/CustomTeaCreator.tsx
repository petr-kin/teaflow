import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { TeaProfile, TeaType } from '../lib/types';
import { saveUserTea } from '../lib/store';

interface Props {
  onClose: () => void;
  onTeaCreated: (tea: TeaProfile) => void;
  editingTea?: TeaProfile;
}

const TEA_TYPES: { type: TeaType; name: string; defaultTemp: number; defaultTimes: number[] }[] = [
  { type: 'green', name: 'Green Tea', defaultTemp: 75, defaultTimes: [30, 45, 60, 75] },
  { type: 'black', name: 'Black Tea', defaultTemp: 95, defaultTimes: [45, 60, 75, 90] },
  { type: 'oolong', name: 'Oolong', defaultTemp: 95, defaultTimes: [45, 60, 90, 120] },
  { type: 'white', name: 'White Tea', defaultTemp: 85, defaultTimes: [60, 90, 120, 150] },
  { type: 'puerh', name: 'Pu-erh', defaultTemp: 100, defaultTimes: [20, 30, 45, 60] },
  { type: 'herbal', name: 'Herbal', defaultTemp: 100, defaultTimes: [300, 420, 540] },
];

export default function CustomTeaCreator({ onClose, onTeaCreated, editingTea }: Props) {
  const [name, setName] = useState(editingTea?.name || '');
  const [selectedType, setSelectedType] = useState<TeaType>(editingTea?.type || 'green');
  const [temperature, setTemperature] = useState(editingTea?.baseTempC || 75);
  const [steepTimes, setSteepTimes] = useState<string[]>(
    editingTea?.baseScheduleSec.map(s => s.toString()) || ['30', '45', '60', '75']
  );
  const [notes, setNotes] = useState('');
  const [region, setRegion] = useState('');
  const [vendor, setVendor] = useState('');

  const handleTypeSelect = (type: TeaType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
    
    // Auto-fill defaults when type changes (but not when editing)
    if (!editingTea) {
      const typeData = TEA_TYPES.find(t => t.type === type);
      if (typeData) {
        setTemperature(typeData.defaultTemp);
        setSteepTimes(typeData.defaultTimes.map(t => t.toString()));
      }
    }
  };

  const handleSteepTimeChange = (index: number, value: string) => {
    const newTimes = [...steepTimes];
    newTimes[index] = value;
    setSteepTimes(newTimes);
  };

  const addSteepTime = () => {
    const lastTime = parseInt(steepTimes[steepTimes.length - 1] || '60');
    const newTime = lastTime + Math.min(30, lastTime * 0.5);
    setSteepTimes([...steepTimes, Math.round(newTime).toString()]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeSteepTime = (index: number) => {
    if (steepTimes.length > 1) {
      setSteepTimes(steepTimes.filter((_, i) => i !== index));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a tea name');
      return;
    }

    const parsedTimes = steepTimes
      .map(t => parseInt(t.trim()))
      .filter(t => !isNaN(t) && t > 0);

    if (parsedTimes.length === 0) {
      Alert.alert('Error', 'Please enter at least one valid steep time');
      return;
    }

    try {
      const newTea: TeaProfile = {
        id: editingTea?.id || `custom_${Date.now()}`,
        name: name.trim(),
        type: selectedType,
        baseTempC: temperature,
        defaultRatio: 1.0,
        baseScheduleSec: parsedTimes,
        user: true
      };

      await saveUserTea(newTea);
      onTeaCreated(newTea);
      onClose();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', `${editingTea ? 'Updated' : 'Created'} ${name}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save tea profile');
    }
  };

  const presetTimes = TEA_TYPES.find(t => t.type === selectedType)?.defaultTimes || [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>{editingTea ? 'Edit Tea' : 'Create Custom Tea'}</Text>
          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        {/* Tea Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Tea Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter tea name..."
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>

        {/* Tea Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Tea Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {TEA_TYPES.map(({ type, name: typeName }) => (
              <Pressable
                key={type}
                style={[styles.typeButton, selectedType === type && styles.typeButtonSelected]}
                onPress={() => handleTypeSelect(type)}
              >
                <Text style={[styles.typeText, selectedType === type && styles.typeTextSelected]}>
                  {typeName}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Temperature */}
        <View style={styles.section}>
          <Text style={styles.label}>Brewing Temperature (°C)</Text>
          <View style={styles.temperatureContainer}>
            <Pressable 
              style={styles.tempButton}
              onPress={() => setTemperature(Math.max(60, temperature - 5))}
            >
              <Text style={styles.tempButtonText}>-5°</Text>
            </Pressable>
            
            <View style={styles.tempDisplay}>
              <Text style={styles.tempValue}>{temperature}°C</Text>
            </View>
            
            <Pressable 
              style={styles.tempButton}
              onPress={() => setTemperature(Math.min(100, temperature + 5))}
            >
              <Text style={styles.tempButtonText}>+5°</Text>
            </Pressable>
          </View>
        </View>

        {/* Steep Times */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Steep Times (seconds)</Text>
            <Pressable onPress={addSteepTime} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
          
          {steepTimes.map((time, index) => (
            <View key={index} style={styles.steepTimeRow}>
              <Text style={styles.steepLabel}>Steep {index + 1}:</Text>
              <TextInput
                style={styles.steepInput}
                value={time}
                onChangeText={(value) => handleSteepTimeChange(index, value)}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              <Text style={styles.steepUnit}>sec</Text>
              {steepTimes.length > 1 && (
                <Pressable
                  onPress={() => removeSteepTime(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
          
          {/* Preset suggestions */}
          {presetTimes.length > 0 && (
            <View style={styles.presetsContainer}>
              <Text style={styles.presetsLabel}>Suggested times:</Text>
              <Pressable
                style={styles.presetButton}
                onPress={() => setSteepTimes(presetTimes.map(t => t.toString()))}
              >
                <Text style={styles.presetText}>
                  {presetTimes.join('s, ')}s
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Region (optional)</Text>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            placeholder="e.g., Fujian, Darjeeling..."
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vendor (optional)</Text>
          <TextInput
            style={styles.input}
            value={vendor}
            onChangeText={setVendor}
            placeholder="Tea shop or brand..."
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Tasting notes, brewing tips..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1412',
  },
  scrollContainer: {
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2F7A55',
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
    marginBottom: 24,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
  },
  typeScroll: {
    marginHorizontal: -4,
  },
  typeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeButtonSelected: {
    backgroundColor: '#2F7A55',
    borderColor: '#2F7A55',
  },
  typeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  typeTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  tempButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tempDisplay: {
    backgroundColor: 'rgba(47,122,85,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(47,122,85,0.4)',
  },
  tempValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: 'rgba(47,122,85,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#2F7A55',
    fontSize: 14,
    fontWeight: '600',
  },
  steepTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  steepLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    width: 60,
  },
  steepInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  steepUnit: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: 'rgba(244,67,54,0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  presetsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  presetsLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 6,
  },
  presetButton: {
    alignSelf: 'flex-start',
  },
  presetText: {
    color: '#2F7A55',
    fontSize: 14,
    fontWeight: '500',
  },
});