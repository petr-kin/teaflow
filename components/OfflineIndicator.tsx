import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import OfflineManager, { OfflineState } from '../lib/offline';
import { useTheme } from '../lib/theme';
import { useResponsive } from './ResponsiveView';

interface Props {
  position?: 'top' | 'bottom';
}

export default function OfflineIndicator({ position = 'top' }: Props) {
  const [offlineState, setOfflineState] = useState<OfflineState>(OfflineManager.getInstance().getState());
  const [showDetails, setShowDetails] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('');
  const theme = useTheme();
  const { isPhone, spacing, fontSize } = useResponsive();

  useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    const unsubscribe = offlineManager.subscribe(setOfflineState);
    
    // Load cache size
    loadCacheSize();
    
    return unsubscribe;
  }, []);

  const loadCacheSize = async () => {
    try {
      const size = await OfflineManager.getInstance().getCacheSize();
      const sizeInKB = size / 1024;
      const sizeInMB = sizeInKB / 1024;
      
      if (sizeInMB >= 1) {
        setCacheSize(`${sizeInMB.toFixed(1)} MB`);
      } else {
        setCacheSize(`${sizeInKB.toFixed(0)} KB`);
      }
    } catch (error) {
      setCacheSize('Unknown');
    }
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await OfflineManager.getInstance().forcSync();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearCache = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await OfflineManager.getInstance().clearCache();
    await loadCacheSize();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const syncInfo = OfflineManager.getInstance().getSyncInfo();

  // Don't show indicator if online and no pending actions
  if (offlineState.isConnected && offlineState.pendingActions.length === 0) {
    return null;
  }

  const indicatorStyle = {
    top: position === 'top' ? spacing(12) : undefined,
    bottom: position === 'bottom' ? spacing(12) : undefined,
  };

  const statusColor = offlineState.isConnected ? 
    (offlineState.pendingActions.length > 0 ? theme.colors.warning : theme.colors.success) :
    theme.colors.error;

  const statusText = offlineState.isConnected ?
    (offlineState.pendingActions.length > 0 ? 
      `Syncing ${offlineState.pendingActions.length} items...` : 
      'Online') :
    'Offline';

  return (
    <>
      <Pressable
        style={[
          styles.indicator,
          indicatorStyle,
          { 
            backgroundColor: `${statusColor}20`,
            borderColor: `${statusColor}60`
          }
        ]}
        onPress={() => {
          setShowDetails(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.indicatorText, { color: theme.colors.text, fontSize: fontSize(12) }]}>
          {statusText}
        </Text>
      </Pressable>

      <Modal visible={showDetails} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              maxWidth: isPhone ? '90%' : '80%',
              maxHeight: isPhone ? '80%' : '70%'
            }
          ]}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text, fontSize: fontSize(20) }]}>
                  Offline Status
                </Text>
                <Pressable
                  onPress={() => setShowDetails(false)}
                  style={styles.closeButton}
                >
                  <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
                </Pressable>
              </View>

              {/* Connection Status */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Connection</Text>
                <View style={[styles.statusCard, { backgroundColor: theme.colors.background }]}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Status:</Text>
                    <View style={styles.statusValue}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, { color: theme.colors.text }]}>
                        {offlineState.isConnected ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Type:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {offlineState.connectionType}
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Internet:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {offlineState.isInternetReachable === null ? 'Unknown' :
                       offlineState.isInternetReachable ? 'Reachable' : 'Unreachable'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sync Status */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sync Status</Text>
                <View style={[styles.statusCard, { backgroundColor: theme.colors.background }]}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Pending:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {syncInfo.pendingCount} items
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Last Sync:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {syncInfo.lastSync}
                    </Text>
                  </View>
                </View>
                
                {offlineState.pendingActions.length > 0 && (
                  <View style={styles.pendingActions}>
                    <Text style={[styles.pendingTitle, { color: theme.colors.textSecondary }]}>
                      Pending Actions:
                    </Text>
                    {offlineState.pendingActions.slice(0, 5).map((action, index) => (
                      <View key={action.id} style={styles.pendingItem}>
                        <Text style={[styles.pendingType, { color: theme.colors.text }]}>
                          {action.type.replace('_', ' ')}
                        </Text>
                        <Text style={[styles.pendingTime, { color: theme.colors.textTertiary }]}>
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                    ))}
                    {offlineState.pendingActions.length > 5 && (
                      <Text style={[styles.pendingMore, { color: theme.colors.textTertiary }]}>
                        +{offlineState.pendingActions.length - 5} more...
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Cache Status */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cache</Text>
                <View style={[styles.statusCard, { backgroundColor: theme.colors.background }]}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Size:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {cacheSize}
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Teas:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {offlineState.cacheStatus.teas ? 'Cached' : 'Not cached'}
                    </Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>Analytics:</Text>
                    <Text style={[styles.statusText, { color: theme.colors.text }]}>
                      {offlineState.cacheStatus.analytics ? 'Cached' : 'Not cached'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {syncInfo.canSync && syncInfo.pendingCount > 0 && (
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleSync}
                  >
                    <Text style={styles.actionButtonText}>Sync Now</Text>
                  </Pressable>
                )}
                
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                  onPress={handleClearCache}
                >
                  <Text style={styles.actionButtonText}>Clear Cache</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 1000,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorText: {
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '90%',
    width: '100%',
  },
  modalScroll: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusCard: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pendingActions: {
    marginTop: 12,
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pendingType: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  pendingTime: {
    fontSize: 12,
  },
  pendingMore: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});