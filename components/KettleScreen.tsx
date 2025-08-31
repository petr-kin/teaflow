import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import BluetoothKettleManager, { KettleDevice } from '../lib/bluetooth';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';
import Header from './ui/Header';
import Button from './ui/Button';
import Card from './ui/Card';
import KettleIllustration from './graphics/KettleIllustration';

interface Props {
  onClose: () => void;
  suggestedTemp?: number;
}

export default function KettleScreen({ onClose, suggestedTemp }: Props) {
  const [connectedKettle, setConnectedKettle] = useState<KettleDevice | null>(null);
  const [pairedKettles, setPairedKettles] = useState<KettleDevice[]>([]);
  const [discoveredKettles, setDiscoveredKettles] = useState<KettleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [targetTemp, setTargetTemp] = useState(suggestedTemp || 80);
  
  const theme = useTheme();
  const { isPhone, spacing, fontSize } = useResponsive();

  useEffect(() => {
    const kettleManager = BluetoothKettleManager.getInstance();
    
    // Initial state
    setConnectedKettle(kettleManager.getConnectedKettle());
    setPairedKettles(kettleManager.getPairedKettles());
    
    // Subscribe to kettle changes
    const unsubscribe = kettleManager.subscribe((kettle) => {
      setConnectedKettle(kettle);
      setPairedKettles(kettleManager.getPairedKettles());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    const kettleManager = BluetoothKettleManager.getInstance();
    
    try {
      const discovered = await kettleManager.startScanning();
      setDiscoveredKettles(discovered);
    } catch (error) {
      Alert.alert('Scan Error', 'Failed to scan for kettles. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (kettle: KettleDevice) => {
    setIsConnecting(kettle.id);
    const kettleManager = BluetoothKettleManager.getInstance();
    
    try {
      const success = await kettleManager.connectToKettle(kettle);
      if (success) {
        Alert.alert('Connected', `Successfully connected to ${kettle.name}`);
      } else {
        Alert.alert('Connection Failed', `Failed to connect to ${kettle.name}. Please try again.`);
      }
    } catch (error) {
      Alert.alert('Connection Error', 'An error occurred while connecting.');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    const kettleManager = BluetoothKettleManager.getInstance();
    await kettleManager.disconnect();
    Alert.alert('Disconnected', 'Kettle has been disconnected.');
  };

  const handleSetTemperature = async () => {
    if (!connectedKettle) return;
    
    const kettleManager = BluetoothKettleManager.getInstance();
    const success = await kettleManager.setTargetTemperature(targetTemp);
    
    if (success) {
      Alert.alert('Temperature Set', `Target temperature set to ${targetTemp}°C`);
    } else {
      Alert.alert('Error', 'Failed to set temperature on kettle.');
    }
  };

  const handleStartHeating = async () => {
    if (!connectedKettle) return;
    
    const kettleManager = BluetoothKettleManager.getInstance();
    const success = await kettleManager.startHeating();
    
    if (success) {
      Alert.alert('Heating Started', 'Kettle is now heating to target temperature.');
    } else {
      Alert.alert('Error', 'Failed to start heating.');
    }
  };

  const handleStopHeating = async () => {
    if (!connectedKettle) return;
    
    const kettleManager = BluetoothKettleManager.getInstance();
    const success = await kettleManager.stopHeating();
    
    if (success) {
      Alert.alert('Heating Stopped', 'Kettle heating has been stopped.');
    } else {
      Alert.alert('Error', 'Failed to stop heating.');
    }
  };

  const handleRemoveKettle = (kettle: KettleDevice) => {
    Alert.alert(
      'Remove Kettle',
      `Remove ${kettle.name} from paired devices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const kettleManager = BluetoothKettleManager.getInstance();
            await kettleManager.removePairedKettle(kettle.id);
            setPairedKettles(kettleManager.getPairedKettles());
          }
        }
      ]
    );
  };

  const getTemperatureColor = (temp: number, target?: number) => {
    if (target && Math.abs(temp - target) < 2) return theme.colors.success;
    if (temp < 40) return theme.colors.textTertiary;
    if (temp < 70) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Header title="Smart Kettle" onBack={onClose} />

        {/* Illustration */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <KettleIllustration width={220} />
        </View>

        {/* Connected Kettle */}
        {connectedKettle && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Connected Kettle</Text>
            <Card style={[styles.kettleCard, styles.connectedCard]}>
              <View style={styles.kettleHeader}>
                <View>
                  <Text style={[styles.kettleName, { color: theme.colors.text }]}>
                    {connectedKettle.name}
                  </Text>
                  <Text style={[styles.kettleModel, { color: theme.colors.textSecondary }]}>
                    {connectedKettle.manufacturer} {connectedKettle.model}
                  </Text>
                </View>
                
                <View style={[styles.statusIndicator, { backgroundColor: theme.colors.success }]}>
                  <Text style={styles.statusText}>●</Text>
                </View>
              </View>

              {/* Temperature Display */}
              <View style={styles.temperatureSection}>
                <View style={styles.tempDisplay}>
                  <Text style={[
                    styles.currentTemp, 
                    { color: getTemperatureColor(connectedKettle.currentTemp || 0, connectedKettle.targetTemp) }
                  ]}>
                    {connectedKettle.currentTemp?.toFixed(1) || '--'}°C
                  </Text>
                  <Text style={[styles.tempLabel, { color: theme.colors.textSecondary }]}>Current</Text>
                </View>
                
                {connectedKettle.targetTemp && (
                  <View style={styles.tempDisplay}>
                    <Text style={[styles.targetTemp, { color: theme.colors.primary }]}>
                      {connectedKettle.targetTemp}°C
                    </Text>
                    <Text style={[styles.tempLabel, { color: theme.colors.textSecondary }]}>Target</Text>
                  </View>
                )}
              </View>

              {/* Status Info */}
              <View style={styles.statusInfo}>
                {connectedKettle.isHeating && (
                  <Text style={[styles.statusText, { color: theme.colors.warning }]}>
                    🔥 Heating...
                  </Text>
                )}
                
                {connectedKettle.batteryLevel && (
                  <Text style={[styles.batteryText, { color: theme.colors.textSecondary }]}>
                    🔋 {connectedKettle.batteryLevel}%
                  </Text>
                )}
              </View>

              {/* Temperature Control */}
              <View style={styles.tempControl}>
                <Text style={[styles.controlLabel, { color: theme.colors.text }]}>
                  Set Temperature: {targetTemp}°C
                </Text>
                <View style={styles.tempSlider}>
                  <Pressable
                    style={[styles.tempButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setTargetTemp(Math.max(40, targetTemp - 5))}
                  >
                    <Text style={[styles.tempButtonText, { color: theme.colors.text }]}>-5°</Text>
                  </Pressable>
                  
                  <View style={styles.tempRange}>
                    {[60, 70, 80, 90, 100].map(temp => (
                      <Pressable
                        key={temp}
                        style={[
                          styles.presetTemp,
                          targetTemp === temp && { backgroundColor: theme.colors.primary }
                        ]}
                        onPress={() => setTargetTemp(temp)}
                      >
                        <Text style={[
                          styles.presetTempText,
                          { color: targetTemp === temp ? 'white' : theme.colors.textSecondary }
                        ]}>
                          {temp}°
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  
                  <Pressable
                    style={[styles.tempButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setTargetTemp(Math.min(100, targetTemp + 5))}
                  >
                    <Text style={[styles.tempButtonText, { color: theme.colors.text }]}>+5°</Text>
                  </Pressable>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.kettleControls}>
                <Button title={`Set ${targetTemp}°C`} variant="primary" onPress={handleSetTemperature} />
                {connectedKettle.isHeating ? (
                  <Button title="Stop Heating" variant="secondary" onPress={handleStopHeating} />
                ) : (
                  <Button title="Start Heating" variant="secondary" onPress={handleStartHeating} />
                )}
                <Button title="Disconnect" variant="ghost" onPress={handleDisconnect} />
              </View>
            </Card>
          </View>
        )}

        {/* Paired Kettles */}
        {pairedKettles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Paired Kettles</Text>
            {pairedKettles.map(kettle => (
              <Card key={kettle.id} style={styles.kettleCard}>
                <View style={styles.kettleHeader}>
                  <View>
                    <Text style={[styles.kettleName, { color: theme.colors.text }]}>
                      {kettle.name}
                    </Text>
                    <Text style={[styles.kettleModel, { color: theme.colors.textSecondary }]}>
                      {kettle.manufacturer} {kettle.model}
                    </Text>
                  </View>
                  
                  <View style={styles.kettleActions}>
                    {!kettle.isConnected && (
                      <Button title={isConnecting === kettle.id ? 'Connecting…' : 'Connect'} variant="primary" onPress={() => handleConnect(kettle)} />
                    )}
                    
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemoveKettle(kettle)}
                    >
                      <Text style={[styles.removeButtonText, { color: theme.colors.error }]}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Discovered Kettles */}
        <View style={styles.section}>
          <View style={styles.scanHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Kettles</Text>
            <Button title={isScanning ? 'Scanning…' : 'Scan'} variant="primary" onPress={handleScan} />
          </View>
          
          {discoveredKettles.length > 0 ? (
            discoveredKettles.map(kettle => (
              <Card key={kettle.id} style={styles.kettleCard}>
                <View style={styles.kettleHeader}>
                  <View>
                    <Text style={[styles.kettleName, { color: theme.colors.text }]}>
                      {kettle.name}
                    </Text>
                    <Text style={[styles.kettleModel, { color: theme.colors.textSecondary }]}>
                      {kettle.manufacturer} {kettle.model}
                    </Text>
                  </View>
                  
                  <Button title={isConnecting === kettle.id ? 'Connecting…' : 'Connect'} variant="primary" onPress={() => handleConnect(kettle)} />
                </View>
              </Card>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {isScanning ? 'Scanning for kettles...' : 'No kettles found. Tap "Scan" to search for nearby smart kettles.'}
              </Text>
            </View>
          )}
        </View>

        {/* Help */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About Smart Kettles</Text>
          <View style={[styles.helpCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
              • Smart kettles can automatically heat water to precise temperatures{'\n'}
              • Perfect for different tea types that require specific temperatures{'\n'}
              • Monitor temperature in real-time during brewing{'\n'}
              • Some kettles support keep-warm functionality{'\n'}
              • Make sure your kettle is in pairing mode before scanning
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
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  kettleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  connectedCard: {
    borderWidth: 2,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  kettleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kettleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  kettleModel: {
    fontSize: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 8,
  },
  temperatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tempDisplay: {
    alignItems: 'center',
  },
  currentTemp: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  targetTemp: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  tempLabel: {
    fontSize: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  batteryText: {
    fontSize: 14,
  },
  tempControl: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  tempSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tempButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tempButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tempRange: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  presetTemp: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  presetTempText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kettleControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  kettleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpCard: {
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
