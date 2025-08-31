import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface OfflineAction {
  id: string;
  type: 'tea_save' | 'feedback_save' | 'analytics_update' | 'preferences_save' | 'steep_log';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  lastSyncTime: number;
  pendingActions: OfflineAction[];
  cacheStatus: {
    teas: boolean;
    analytics: boolean;
    preferences: boolean;
  };
}

const OFFLINE_ACTIONS_KEY = 'gongfu:offline_actions';
const OFFLINE_STATE_KEY = 'gongfu:offline_state';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

class OfflineManager {
  private static instance: OfflineManager;
  private state: OfflineState;
  private listeners: ((state: OfflineState) => void)[] = [];
  private syncInProgress = false;

  private constructor() {
    this.state = {
      isConnected: true,
      isInternetReachable: null,
      connectionType: 'unknown',
      lastSyncTime: 0,
      pendingActions: [],
      cacheStatus: {
        teas: false,
        analytics: false,
        preferences: false,
      }
    };
    
    this.initialize();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initialize() {
    // Load previous offline state
    try {
      const savedState = await AsyncStorage.getItem(OFFLINE_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.state = { ...this.state, ...parsed };
      }

      const savedActions = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
      if (savedActions) {
        this.state.pendingActions = JSON.parse(savedActions);
      }
    } catch (error) {
      console.error('Error loading offline state:', error);
    }

    // Set up network listener
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.handleNetworkChange(state);
    });

    // Initial network check
    NetInfo.fetch().then((state) => {
      this.handleNetworkChange(state);
    });
  }

  private async handleNetworkChange(netState: NetInfoState) {
    const wasOffline = !this.state.isConnected;
    
    this.state.isConnected = netState.isConnected ?? false;
    this.state.isInternetReachable = netState.isInternetReachable;
    this.state.connectionType = netState.type;

    await this.saveState();
    this.notifyListeners();

    // If we just came back online, sync pending actions
    if (wasOffline && this.state.isConnected && this.state.pendingActions.length > 0) {
      await this.syncPendingActions();
    }
  }

  private async saveState() {
    try {
      await AsyncStorage.setItem(OFFLINE_STATE_KEY, JSON.stringify({
        lastSyncTime: this.state.lastSyncTime,
        cacheStatus: this.state.cacheStatus,
      }));

      await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(this.state.pendingActions));
    } catch (error) {
      console.error('Error saving offline state:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Queue action for offline execution
  async queueAction(type: OfflineAction['type'], data: any): Promise<string> {
    const action: OfflineAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.state.pendingActions.push(action);
    await this.saveState();

    // Try to sync immediately if online
    if (this.state.isConnected) {
      this.syncPendingActions();
    }

    return action.id;
  }

  // Execute action immediately or queue for later
  async executeAction(type: OfflineAction['type'], data: any): Promise<boolean> {
    if (this.state.isConnected) {
      try {
        await this.performAction(type, data);
        return true;
      } catch (error) {
        console.log('Action failed, queueing for offline sync:', error);
        await this.queueAction(type, data);
        return false;
      }
    } else {
      await this.queueAction(type, data);
      return false;
    }
  }

  private async performAction(type: OfflineAction['type'], data: any): Promise<void> {
    switch (type) {
      case 'tea_save':
        // In a real app, this would sync to a server
        console.log('Syncing tea save:', data);
        break;
      case 'feedback_save':
        console.log('Syncing feedback:', data);
        break;
      case 'analytics_update':
        console.log('Syncing analytics:', data);
        break;
      case 'preferences_save':
        console.log('Syncing preferences:', data);
        break;
      case 'steep_log':
        console.log('Syncing steep log:', data);
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  private async syncPendingActions() {
    if (this.syncInProgress || !this.state.isConnected) return;

    this.syncInProgress = true;
    const actionsToSync = [...this.state.pendingActions];
    const successfulActions: string[] = [];

    for (const action of actionsToSync) {
      try {
        await this.performAction(action.type, action.data);
        successfulActions.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        // Increment retry count
        const actionIndex = this.state.pendingActions.findIndex(a => a.id === action.id);
        if (actionIndex >= 0) {
          this.state.pendingActions[actionIndex].retryCount++;
          
          // Remove actions that have failed too many times
          if (this.state.pendingActions[actionIndex].retryCount >= 3) {
            this.state.pendingActions.splice(actionIndex, 1);
          }
        }
      }
    }

    // Remove successful actions
    this.state.pendingActions = this.state.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    );

    this.state.lastSyncTime = Date.now();
    await this.saveState();
    this.notifyListeners();
    
    this.syncInProgress = false;
  }

  // Cache management
  async updateCacheStatus(type: keyof OfflineState['cacheStatus'], status: boolean) {
    this.state.cacheStatus[type] = status;
    await this.saveState();
    this.notifyListeners();
  }

  async clearCache() {
    try {
      // Clear cached data
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('gongfu:') && 
        !key.includes('offline') && 
        !key.includes('onboarding') &&
        !key.includes('theme')
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      
      // Reset cache status
      this.state.cacheStatus = {
        teas: false,
        analytics: false,
        preferences: false,
      };
      
      await this.saveState();
      this.notifyListeners();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('gongfu:'));
      
      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  // Check if cached data is expired
  isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_EXPIRY;
  }

  // Subscription methods
  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getState(): OfflineState {
    return this.state;
  }

  // Manual sync trigger
  async forcSync(): Promise<boolean> {
    if (!this.state.isConnected) {
      return false;
    }
    
    await this.syncPendingActions();
    return true;
  }

  // Get sync status
  getSyncInfo(): {
    pendingCount: number;
    lastSync: string;
    canSync: boolean;
  } {
    return {
      pendingCount: this.state.pendingActions.length,
      lastSync: this.state.lastSyncTime > 0 ? 
        new Date(this.state.lastSyncTime).toLocaleString() : 
        'Never',
      canSync: this.state.isConnected && !this.syncInProgress,
    };
  }
}

// React hook for offline state
export const useOffline = () => {
  return OfflineManager.getInstance().getState();
};

export default OfflineManager;