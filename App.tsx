import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { DEFAULTS } from './lib/teas';
import { loadLastSteeps, loadUserTeas, pushLastSteep, deleteUserTea } from './lib/store';
import { getTeaPrefs, setTeaPrefs } from './lib/prefs';
import type { LastSteep, TeaProfile } from './lib/types';
import HourglassGrains from './components/HourglassGrains';
import RadialBuckets from './components/RadialBuckets';
import GestureOverlay from './components/GestureOverlay';
import CameraScreen from './components/CameraScreen';
import TeaLibraryScreen from './components/TeaLibraryScreen';
import BrewFeedbackModal from './components/BrewFeedbackModal';
import CustomTeaCreator from './components/CustomTeaCreator';
import ExportImportScreen from './components/ExportImportScreen';
import TimerWithGestures from './components/TimerWithGestures';
import AnalyticsScreen from './components/AnalyticsScreen';
import OnboardingScreen from './components/OnboardingScreen';
import ThemeSettingsScreen from './components/ThemeSettingsScreen';
import { soundManager } from './lib/sounds';
import { ThemeContext, ThemeManager, useTheme } from './lib/theme';
import { useResponsive } from './components/ResponsiveView';
import Button from './components/ui/Button';
import Header from './components/ui/Header';
import IconButton from './components/ui/IconButton';
import Card from './components/ui/Card';
import TeaLogo from './components/graphics/TeaLogo';
import BackgroundWave from './components/graphics/BackgroundWave';
import ResponsiveManager from './lib/responsive';
import OfflineIndicator from './components/OfflineIndicator';
import OfflineManager from './lib/offline';
import KettleScreen from './components/KettleScreen';
import BluetoothKettleManager from './lib/bluetooth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveBrewFeedback } from './lib/learning';

function AppContent() {
  const [last, setLast] = useState<LastSteep[]>([]);
  const [userTeas, setUserTeas] = useState<TeaProfile[]>([]);
  const [selectedTea, setSelectedTea] = useState<TeaProfile | null>(null);
  const [vesselMl, setVesselMl] = useState(110);
  const [tempC, setTempC] = useState(95);
  const [currentSteep, setCurrentSteep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTeaCreator, setShowTeaCreator] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showKettle, setShowKettle] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [editingTea, setEditingTea] = useState<TeaProfile | null>(null);
  
  const theme = useTheme();
  const { isPhone, isTablet, isLandscape, spacing, fontSize } = useResponsive();
  const [completedSteep, setCompletedSteep] = useState<{tea: TeaProfile; steepIndex: number} | null>(null);

  // Load data and initialize sounds
  useEffect(() => {
    const f = async () => {
      const lastSteeps = await loadLastSteeps();
      const teas = await loadUserTeas();
      setLast(lastSteeps);
      setUserTeas(teas);
    };
    
    // Initialize sound manager
    soundManager.initialize();
    
    f();
    const id = setInterval(f, 2000);
    return () => {
      clearInterval(id);
      soundManager.cleanup();
    };
  }, []);

  // Check if onboarding should be shown
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setOnboardingChecked(true);
      }
    };
    
    checkOnboarding();
  }, []);

  // Timer countdown with haptic feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === 6) {
            // T-5 warning haptic and chime
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            soundManager.playChime();
          } else if (prev <= 1) {
            setIsRunning(false);
            handleSteepComplete();
            // Completion haptic and chime
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            soundManager.playChime();
            soundManager.stopAmbient();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  const tiles = ['green', 'black', 'oolong', 'puerh'].map(k => (DEFAULTS as any)[k]);

  const handleTeaSelect = async (tea: TeaProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTea(tea);
    
    // Load preferences for this tea
    const prefs = await getTeaPrefs(tea.id);
    setVesselMl(prefs.vesselMl || 110);
    setTempC(prefs.tempC || tea.baseTempC);
    
    setCurrentSteep(0);
    setTimerSeconds(tea.baseScheduleSec[0]);
    setShowTimer(true);
  };

  const handleTeaScanned = async (newTea: TeaProfile) => {
    // Refresh user teas list to include the new tea
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
    
    // Auto-select the newly scanned tea
    handleTeaSelect(newTea);
  };

  const handleTeaCreated = async (newTea: TeaProfile) => {
    // Refresh user teas list to include the new/updated tea
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
    
    // Auto-select the newly created/edited tea
    handleTeaSelect(newTea);
  };

  const handleEditTea = (tea: TeaProfile) => {
    setEditingTea(tea);
    setShowTeaCreator(true);
  };

  const handleRefreshTeas = async () => {
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleDeleteUserTea = async (teaId: string) => {
    await deleteUserTea(teaId);
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
  };

  const handleBrewFeedback = async (strength: 'weak' | 'perfect' | 'strong', enjoyment: number) => {
    if (completedSteep) {
      await saveBrewFeedback({
        teaId: completedSteep.tea.id,
        steepIndex: completedSteep.steepIndex,
        vesselMl,
        tempC,
        actualSec: completedSteep.tea.baseScheduleSec[completedSteep.steepIndex],
        strength,
        enjoyment
      });
      
      setCompletedSteep(null);
    }
  };

  const handleSteepComplete = async () => {
    if (selectedTea) {
      await pushLastSteep({
        teaId: selectedTea.id,
        name: selectedTea.name,
        infusionIndex: currentSteep,
        actualSec: selectedTea.baseScheduleSec[currentSteep],
        ts: Date.now()
      });
      
      // Save preferences
      await setTeaPrefs(selectedTea.id, { vesselMl, tempC });
      
      // Show feedback modal for learning
      setCompletedSteep({ tea: selectedTea, steepIndex: currentSteep });
      setShowFeedback(true);
      
      Alert.alert('Steep Complete!', `Your ${selectedTea.name} steep #${currentSteep + 1} is ready!`);
    }
  };

  const startTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    soundManager.startAmbient();
    setIsRunning(true);
  };
  
  const pauseTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    soundManager.stopAmbient();
    setIsRunning(false);
  };
  
  const nextSteep = () => {
    if (selectedTea && currentSteep < selectedTea.baseScheduleSec.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nextIndex = currentSteep + 1;
      setCurrentSteep(nextIndex);
      setTimerSeconds(selectedTea.baseScheduleSec[nextIndex]);
      setIsRunning(false);
    }
  };

  const backToHome = () => {
    setShowTimer(false);
    setSelectedTea(null);
    setIsRunning(false);
  };

  const adjustVessel = (delta: number) => {
    const newVessel = Math.max(70, Math.min(200, vesselMl + delta));
    setVesselMl(newVessel);
  };

  const adjustTemp = (delta: number) => {
    const newTemp = Math.max(60, Math.min(100, tempC + delta));
    setTempC(newTemp);
  };

  const resetTimer = () => {
    if (selectedTea) {
      setIsRunning(false);
      setTimerSeconds(selectedTea.baseScheduleSec[currentSteep]);
      soundManager.stopAmbient();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const skipToNextSteep = () => {
    if (selectedTea && currentSteep < selectedTea.baseScheduleSec.length - 1) {
      setIsRunning(false);
      const nextIndex = currentSteep + 1;
      setCurrentSteep(nextIndex);
      setTimerSeconds(selectedTea.baseScheduleSec[nextIndex]);
      soundManager.stopAmbient();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const skipToPrevSteep = () => {
    if (currentSteep > 0) {
      setIsRunning(false);
      const prevIndex = currentSteep - 1;
      setCurrentSteep(prevIndex);
      setTimerSeconds(selectedTea!.baseScheduleSec[prevIndex]);
      soundManager.stopAmbient();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const addTimeToTimer = (seconds: number) => {
    setTimerSeconds(prev => Math.max(1, prev + seconds));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Show onboarding if needed
  if (!onboardingChecked) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen onComplete={handleOnboardingComplete} />
    );
  }

  if (showTimer && selectedTea) {
    const progress = selectedTea.baseScheduleSec[currentSteep] 
      ? (selectedTea.baseScheduleSec[currentSteep] - timerSeconds) / selectedTea.baseScheduleSec[currentSteep] 
      : 0;

    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.timerContainer, { backgroundColor: theme.colors.background }]}>
          <BackgroundWave width={360} height={140} />
          <Pressable onPress={backToHome} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
          </Pressable>
          
          <Text style={[styles.timerTitle, { color: theme.colors.text }]}>{selectedTea.name}</Text>
          <Text style={[styles.timerTemp, { color: theme.colors.textSecondary }]}>Vessel: {vesselMl}ml • Temp: {tempC}°C</Text>
          
          <View style={styles.hourglassContainer}>
            {/* Background graphics */}
            <RadialBuckets vesselMl={vesselMl} progress={progress} />
            <HourglassGrains progress={progress} running={isRunning} />
            
            {/* Main Timer Display - centered and prominent */}
            <View style={styles.mainTimerCentered}>
              <Text style={[styles.mainTimerText, { color: theme.colors.text, fontSize: fontSize(48), textShadowColor: theme.colors.shadow }]}>
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.vesselInfo, { color: theme.colors.textSecondary, fontSize: fontSize(16) }]}>
                {vesselMl}ml • {tempC}°C
              </Text>
            </View>
            
            {/* Gesture overlay for interactions */}
            <GestureOverlay 
              vesselMl={vesselMl} 
              tempC={tempC}
              onChange={(vessel, temp) => {
                setVesselMl(vessel);
                setTempC(temp);
              }}
              onEnd={async (vessel, temp) => {
                if (selectedTea) {
                  await setTeaPrefs(selectedTea.id, { vesselMl: vessel, tempC: temp });
                }
              }}
            />
          </View>
          
          <Text style={[styles.steepInfo, { color: theme.colors.textSecondary }]}>Steep {currentSteep + 1} of {selectedTea.baseScheduleSec.length}</Text>
          
          <View style={styles.controls}>
            {!isRunning ? (
              <Button title="Start Steep" variant="primary" onPress={startTimer} />
            ) : (
              <Button title="Pause" variant="secondary" onPress={pauseTimer} />
            )}
            {currentSteep < selectedTea.baseScheduleSec.length - 1 && (
              <Button title="Next Steep" variant="secondary" onPress={nextSteep} />
            )}
          </View>

          <View style={styles.adjustControls}>
            <Button title="-10ml" variant="secondary" size="sm" onPress={() => adjustVessel(-10)} />
            <Button title="+10ml" variant="secondary" size="sm" onPress={() => adjustVessel(10)} />
            <Button title="-5°C" variant="secondary" size="sm" onPress={() => adjustTemp(-5)} />
            <Button title="+5°C" variant="secondary" size="sm" onPress={() => adjustTemp(5)} />
          </View>
        </View>
        
        <StatusBar style="light" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={[styles.content] }>
      <Header
        title={(
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TeaLogo size={22} />
            <Text style={[styles.title, { color: theme.colors.text, fontSize: fontSize(20) }]}>Gongfu Tea</Text>
          </View>
        )}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconButton name="library-outline" onPress={() => setShowLibrary(true)} />
            <IconButton name="color-palette-outline" onPress={() => setShowThemeSettings(true)} />
            <IconButton
              name="add-circle-outline"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'Add Tea',
                  'How would you like to add a tea?',
                  [
                    { text: 'Scan Package', onPress: () => setShowCamera(true) },
                    { text: 'Create Custom', onPress: () => setShowTeaCreator(true) },
                    { text: 'Smart Kettle', onPress: () => setShowKettle(true) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            />
          </View>
        }
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent steeps</Text>
        {last.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Steep something and it will appear here.</Text>
        ) : last.map((l, i) => (
          <Pressable key={i} onPress={() => {
            const tea = tiles.concat(userTeas).find(t => t.id === l.teaId);
            if (tea) handleTeaSelect(tea);
          }}>
            <Card style={styles.steepCard}>
              <Text style={[styles.steepName, { color: theme.colors.text }]}>{l.name} · Steep #{l.infusionIndex + 1}</Text>
              <Text style={[styles.steepTime, { color: theme.colors.textTertiary }]}>{l.actualSec}s</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <View style={[
        styles.teaGrid, 
        { 
          gap: spacing(12),
        }
      ]}>
        {tiles.concat(userTeas).map((tea: any) => (
          <Pressable 
            key={tea.id}
            style={{ width: isPhone ? '48%' : isTablet ? '31%' : '23%' }}
            onPress={() => handleTeaSelect(tea)}
          >
            <Card style={{ padding: spacing(16), minHeight: isPhone ? 100 : 120 }}>
              <Text style={[styles.teaName, { color: theme.colors.text, fontSize: fontSize(16) }]}>{tea.name}</Text>
              <Text style={[styles.teaTemp, { color: theme.colors.textSecondary, fontSize: fontSize(14) }]}>{tea.baseTempC}°C</Text>
              <Text style={[styles.teaSteeps, { color: theme.colors.textTertiary, fontSize: fontSize(12) }]}>{tea.baseScheduleSec.length} steeps</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <StatusBar style="light" />
      </ScrollView>
      
      {showCamera && (
        <CameraScreen 
          onClose={() => setShowCamera(false)}
          onTeaScanned={handleTeaScanned}
        />
      )}
      
      {showLibrary && (
        <TeaLibraryScreen
          teas={tiles}
          userTeas={userTeas}
          onClose={() => setShowLibrary(false)}
          onSelectTea={handleTeaSelect}
          onDeleteUserTea={handleDeleteUserTea}
          onEditTea={handleEditTea}
          onOpenExportImport={() => {
            setShowLibrary(false);
            setShowExportImport(true);
          }}
          onOpenAnalytics={() => {
            setShowLibrary(false);
            setShowAnalytics(true);
          }}
        />
      )}
      
      {showTeaCreator && (
        <CustomTeaCreator
          onClose={() => {
            setShowTeaCreator(false);
            setEditingTea(null);
          }}
          onTeaCreated={handleTeaCreated}
          editingTea={editingTea || undefined}
        />
      )}
      
      {showExportImport && (
        <ExportImportScreen
          onClose={() => setShowExportImport(false)}
          onRefreshTeas={handleRefreshTeas}
        />
      )}
      
      {showAnalytics && (
        <AnalyticsScreen
          onClose={() => setShowAnalytics(false)}
          userTeas={userTeas}
          defaultTeas={tiles}
        />
      )}
      
      {showThemeSettings && (
        <ThemeSettingsScreen
          onClose={() => setShowThemeSettings(false)}
        />
      )}
      
      {showKettle && (
        <KettleScreen
          onClose={() => setShowKettle(false)}
          suggestedTemp={tempC}
        />
      )}
      
      {/* Offline indicator */}
      <OfflineIndicator position="top" />
      
      {/* Manual onboarding trigger for testing/help */}
      {!showOnboarding && (
        <Pressable
          style={[styles.helpButton, { backgroundColor: `${theme.colors.primary}50`, borderColor: `${theme.colors.primary}80` }]}
          onPress={() => setShowOnboarding(true)}
        >
          <Text style={[styles.helpButtonText, { color: theme.colors.text }]}>?</Text>
        </Pressable>
      )}
      
      <BrewFeedbackModal
        visible={showFeedback}
        teaName={completedSteep?.tea.name || ''}
        steepNumber={completedSteep ? completedSteep.steepIndex + 1 : 1}
        onClose={() => {
          setShowFeedback(false);
          setCompletedSteep(null);
        }}
        onFeedback={handleBrewFeedback}
      />
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(ThemeManager.getInstance().getCurrentTheme());

  useEffect(() => {
    const themeManager = ThemeManager.getInstance();
    const responsiveManager = ResponsiveManager.getInstance();
    const offlineManager = OfflineManager.getInstance();
    
    // Initialize managers
    themeManager.initialize();
    
    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe((theme) => {
      setCurrentTheme(theme);
    });
    
    return unsubscribe;
  }, []);

  return (
    <ThemeContext.Provider value={currentTheme}>
      <AppContent />
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    fontWeight: '600',
  },
  moreButton: {
    fontWeight: '500',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 12,
  },
  steepCard: {
    padding: 12,
    borderRadius: 16,
  },
  steepName: {
    fontWeight: '500',
  },
  steepTime: {
    fontSize: 12,
  },
  teaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  teaCard: {
    borderRadius: 20,
  },
  teaName: {
    fontSize: 16,
    fontWeight: '600',
  },
  teaTemp: {
    fontSize: 14,
  },
  teaSteeps: {
    fontSize: 12,
  },
  timerContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backText: {
    color: '#2F7A55',
    fontSize: 16,
  },
  timerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  timerTemp: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginBottom: 40,
  },
  hourglassContainer: {
    position: 'relative',
    width: 220,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  steepInfo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#2F7A55',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  pauseText: {
    color: 'white',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  nextText: {
    color: 'white',
    fontSize: 14,
  },
  adjustControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  adjustButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  adjustText: {
    color: 'white',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  helpButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  helpButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  mainTimerCentered: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  mainTimerText: {
    fontWeight: '200',
    letterSpacing: 6,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  vesselInfo: {
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
