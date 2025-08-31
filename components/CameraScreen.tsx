import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { TeaProfile } from '../lib/types';
import { saveUserTea } from '../lib/store';

interface Props {
  onClose: () => void;
  onTeaScanned: (tea: TeaProfile) => void;
}

export default function CameraScreen({ onClose, onTeaScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need camera access to scan tea packages</Text>
        <Pressable onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (!cameraRef.current || isScanning) return;
    
    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        await processTeaImage(photo.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      console.log('Camera error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsScanning(true);
        await processTeaImage(result.assets[0].uri);
        setIsScanning(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.log('Image picker error:', error);
      setIsScanning(false);
    }
  };

  const processTeaImage = async (imageUri: string) => {
    try {
      // Simulate OCR processing for now
      // In real implementation, would use expo-mlkit-ocr or similar
      
      // Mock tea detection based on common tea types
      const mockTeaData = await simulateOCR(imageUri);
      
      // Create new tea profile
      const newTea: TeaProfile = {
        id: `custom_${Date.now()}`,
        name: mockTeaData.name,
        type: mockTeaData.type,
        baseTempC: mockTeaData.temperature,
        defaultRatio: 1.0,
        baseScheduleSec: mockTeaData.steepTimes,
        user: true
      };

      await saveUserTea(newTea);
      onTeaScanned(newTea);
      onClose();

      Alert.alert('Tea Scanned!', `Added ${mockTeaData.name} to your collection`);
    } catch (error) {
      Alert.alert('Error', 'Failed to process tea image');
      console.log('OCR error:', error);
    }
  };

  const simulateOCR = async (imageUri: string): Promise<{
    name: string;
    type: 'green' | 'black' | 'oolong' | 'white' | 'puerh' | 'herbal';
    temperature: number;
    steepTimes: number[];
  }> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock detection results - in real app would analyze image text
    const mockResults = [
      { name: 'Earl Grey Black Tea', type: 'black' as const, temperature: 95, steepTimes: [45, 60, 75, 90] },
      { name: 'Dragon Well Green Tea', type: 'green' as const, temperature: 75, steepTimes: [30, 45, 60, 75] },
      { name: 'Ti Kuan Yin Oolong', type: 'oolong' as const, temperature: 95, steepTimes: [45, 60, 90, 120] },
      { name: 'White Peony Tea', type: 'white' as const, temperature: 85, steepTimes: [60, 90, 120, 150] },
      { name: 'Aged Puerh Tea', type: 'puerh' as const, temperature: 100, steepTimes: [20, 30, 45, 60] },
    ];
    
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  };

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
            <Text style={styles.title}>Scan Tea Package</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
            <Text style={styles.instructions}>
              Position tea package within frame
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable onPress={handleImagePicker} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>📷 Gallery</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleTakePicture} 
              style={[styles.captureButton, isScanning && styles.captureButtonDisabled]}
              disabled={isScanning}
            >
              <Text style={styles.captureButtonText}>
                {isScanning ? 'Scanning...' : '📸'}
              </Text>
            </Pressable>
            
            <Pressable onPress={() => Alert.alert('Manual Entry', 'Manual tea entry would open here')} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>✏️ Manual</Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: '#2F7A55',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    backgroundColor: '#2F7A55',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(47,122,85,0.5)',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 32,
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2F7A55',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});