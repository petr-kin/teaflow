import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Mock BLE interface since expo-bluetooth is not available
// In a real implementation, you would use react-native-ble-plx or similar

export interface KettleDevice {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  isConnected: boolean;
  batteryLevel?: number;
  currentTemp?: number;
  targetTemp?: number;
  isHeating?: boolean;
  lastSeen: number;
}

export interface KettleCapabilities {
  canSetTemperature: boolean;
  canHeat: boolean;
  canKeepWarm: boolean;
  canReadTemperature: boolean;
  canReadBattery: boolean;
  temperatureRange: { min: number; max: number };
}

const PAIRED_KETTLES_KEY = 'gongfu:paired_kettles';
const KETTLE_PREFERENCES_KEY = 'gongfu:kettle_prefs';

class BluetoothKettleManager {
  private static instance: BluetoothKettleManager;
  private connectedKettle: KettleDevice | null = null;
  private pairedKettles: KettleDevice[] = [];
  private isScanning = false;
  private listeners: ((kettle: KettleDevice | null) => void)[] = [];
  private tempListeners: ((temp: number) => void)[] = [];

  private constructor() {
    this.loadPairedKettles();
  }

  static getInstance(): BluetoothKettleManager {
    if (!BluetoothKettleManager.instance) {
      BluetoothKettleManager.instance = new BluetoothKettleManager();
    }
    return BluetoothKettleManager.instance;
  }

  private async loadPairedKettles() {
    try {
      const stored = await AsyncStorage.getItem(PAIRED_KETTLES_KEY);
      if (stored) {
        this.pairedKettles = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading paired kettles:', error);
    }
  }

  private async savePairedKettles() {
    try {
      await AsyncStorage.setItem(PAIRED_KETTLES_KEY, JSON.stringify(this.pairedKettles));
    } catch (error) {
      console.error('Error saving paired kettles:', error);
    }
  }

  // Mock scanning implementation
  async startScanning(): Promise<KettleDevice[]> {
    if (this.isScanning) return [];

    this.isScanning = true;

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock discovered kettles
    const discoveredKettles: KettleDevice[] = [
      {
        id: 'mock_kettle_1',
        name: 'Smart Kettle Pro',
        manufacturer: 'TeaTech',
        model: 'TT-K100',
        isConnected: false,
        currentTemp: 22,
        lastSeen: Date.now(),
      },
      {
        id: 'mock_kettle_2', 
        name: 'Precision Kettle',
        manufacturer: 'BrewMaster',
        model: 'BM-500',
        isConnected: false,
        batteryLevel: 85,
        currentTemp: 25,
        lastSeen: Date.now(),
      },
      {
        id: 'mock_kettle_3',
        name: 'WiFi Tea Kettle',
        manufacturer: 'SmartBrew',
        model: 'SB-W200',
        isConnected: false,
        currentTemp: 20,
        isHeating: false,
        lastSeen: Date.now(),
      }
    ];

    this.isScanning = false;
    return discoveredKettles;
  }

  async stopScanning() {
    this.isScanning = false;
  }

  async connectToKettle(kettle: KettleDevice): Promise<boolean> {
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock connection success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        // Disconnect from current kettle if any
        if (this.connectedKettle) {
          this.connectedKettle.isConnected = false;
        }

        // Connect to new kettle
        this.connectedKettle = { 
          ...kettle, 
          isConnected: true,
          currentTemp: 20 + Math.random() * 10,
          batteryLevel: 60 + Math.random() * 40,
        };
        
        // Add to paired kettles if not already there
        const existingIndex = this.pairedKettles.findIndex(k => k.id === kettle.id);
        if (existingIndex >= 0) {
          this.pairedKettles[existingIndex] = this.connectedKettle;
        } else {
          this.pairedKettles.push(this.connectedKettle);
        }
        
        await this.savePairedKettles();
        this.notifyListeners();
        
        // Start temperature monitoring
        this.startTemperatureMonitoring();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to kettle:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedKettle) {
      this.connectedKettle.isConnected = false;
      this.connectedKettle = null;
      this.notifyListeners();
      this.stopTemperatureMonitoring();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  async setTargetTemperature(temperature: number): Promise<boolean> {
    if (!this.connectedKettle) return false;

    try {
      // Simulate setting temperature
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.connectedKettle.targetTemp = temperature;
      this.connectedKettle.isHeating = true;
      this.notifyListeners();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch (error) {
      console.error('Error setting temperature:', error);
      return false;
    }
  }

  async startHeating(): Promise<boolean> {
    if (!this.connectedKettle || !this.connectedKettle.targetTemp) return false;

    try {
      this.connectedKettle.isHeating = true;
      this.notifyListeners();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return true;
    } catch (error) {
      console.error('Error starting heating:', error);
      return false;
    }
  }

  async stopHeating(): Promise<boolean> {
    if (!this.connectedKettle) return false;

    try {
      this.connectedKettle.isHeating = false;
      this.notifyListeners();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true;
    } catch (error) {
      console.error('Error stopping heating:', error);
      return false;
    }
  }

  private temperatureTimer?: NodeJS.Timeout;

  private startTemperatureMonitoring() {
    this.stopTemperatureMonitoring();
    
    this.temperatureTimer = setInterval(() => {
      if (this.connectedKettle) {
        // Simulate temperature changes
        const currentTemp = this.connectedKettle.currentTemp || 20;
        const targetTemp = this.connectedKettle.targetTemp;
        
        if (this.connectedKettle.isHeating && targetTemp) {
          // Heat towards target temperature
          const tempDiff = targetTemp - currentTemp;
          const heatingRate = Math.min(2, Math.max(0.5, Math.abs(tempDiff) * 0.1));
          const newTemp = Math.min(targetTemp, currentTemp + heatingRate);
          
          this.connectedKettle.currentTemp = Math.round(newTemp * 10) / 10;
          
          // Check if target reached
          if (Math.abs(newTemp - targetTemp) < 0.5) {
            this.connectedKettle.isHeating = false;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          // Cool down naturally
          const ambientTemp = 20;
          const coolingRate = 0.2;
          const newTemp = Math.max(ambientTemp, currentTemp - coolingRate);
          this.connectedKettle.currentTemp = Math.round(newTemp * 10) / 10;
        }
        
        this.notifyListeners();
        this.notifyTempListeners(this.connectedKettle.currentTemp);
      }
    }, 1000);
  }

  private stopTemperatureMonitoring() {
    if (this.temperatureTimer) {
      clearInterval(this.temperatureTimer);
      this.temperatureTimer = undefined;
    }
  }

  async removePairedKettle(kettleId: string): Promise<void> {
    this.pairedKettles = this.pairedKettles.filter(k => k.id !== kettleId);
    await this.savePairedKettles();
  }

  getConnectedKettle(): KettleDevice | null {
    return this.connectedKettle;
  }

  getPairedKettles(): KettleDevice[] {
    return this.pairedKettles;
  }

  isScanningActive(): boolean {
    return this.isScanning;
  }

  getKettleCapabilities(kettle: KettleDevice): KettleCapabilities {
    // Mock capabilities based on model
    const baseCapabilities: KettleCapabilities = {
      canSetTemperature: true,
      canHeat: true,
      canKeepWarm: true,
      canReadTemperature: true,
      canReadBattery: false,
      temperatureRange: { min: 40, max: 100 },
    };

    // Different capabilities for different models
    if (kettle.model?.includes('BM-')) {
      baseCapabilities.canReadBattery = true;
      baseCapabilities.temperatureRange = { min: 35, max: 100 };
    }

    if (kettle.model?.includes('SB-')) {
      baseCapabilities.canKeepWarm = true;
      baseCapabilities.temperatureRange = { min: 30, max: 100 };
    }

    return baseCapabilities;
  }

  // Event subscription
  subscribe(listener: (kettle: KettleDevice | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  subscribeToTemperature(listener: (temp: number) => void): () => void {
    this.tempListeners.push(listener);
    return () => {
      const index = this.tempListeners.indexOf(listener);
      if (index >= 0) {
        this.tempListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.connectedKettle));
  }

  private notifyTempListeners(temp: number) {
    this.tempListeners.forEach(listener => listener(temp));
  }

  // Cleanup
  cleanup() {
    this.stopTemperatureMonitoring();
    this.disconnect();
  }
}

export default BluetoothKettleManager;
