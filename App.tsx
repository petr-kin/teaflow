import React, { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert, AppState, AppStateStatus, Platform } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { DEFAULTS } from './lib/teas';
import { loadLastSteeps, loadUserTeas, pushLastSteep, deleteUserTea } from './lib/store';
import { getTeaPrefs, setTeaPrefs } from './lib/prefs';
import type { LastSteep, TeaProfile } from './lib/types';
import HourglassGrains from './components/HourglassGrains';
import RadialBuckets from './components/RadialBuckets';
import GestureOverlay from './components/GestureOverlay';
import BrewFeedbackModal from './components/BrewFeedbackModal';
import OnboardingScreen from './components/OnboardingScreen';
import TimerWithGestures from './components/TimerWithGestures';
import EnhancedTimer from './components/EnhancedTimer';
import QuickBrewWidget from './components/QuickBrewWidget';

// Load components directly to fix white screen issue
import CameraScreen from './components/CameraScreen';
import TeaLibraryScreen from './components/TeaLibraryScreen';
import CustomTeaCreator from './components/CustomTeaCreator';
import QuickTeaGrid from './components/QuickTeaGrid';
import ExportImportScreen from './components/ExportImportScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import ThemeSettingsScreen from './components/ThemeSettingsScreen';
import KettleScreen from './components/KettleScreen';
import { soundManager } from './lib/sounds';
import { ThemeContext, ThemeManager, useTheme } from './lib/theme';
import { useResponsive } from './components/ResponsiveView';
import Button from './components/ui/Button';
import Header from './components/ui/Header';
import IconButton from './components/ui/IconButton';
import Card from './components/ui/Card';
import TeaLogo from './components/graphics/TeaLogo';
import BackgroundWave from './components/graphics/BackgroundWave';
import BackgroundWaveSkia from './components/graphics/BackgroundWaveSkia';
import HourglassSkia from './components/graphics/HourglassSkia';
import VideoTeaVisualization from './components/graphics/VideoTeaVisualization';
import LayeredTeaAnimation from './components/graphics/LayeredTeaAnimation';
import ResponsiveManager from './lib/responsive';
import OfflineIndicator from './components/OfflineIndicator';
import OfflineManager from './lib/offline';
import BluetoothKettleManager from './lib/bluetooth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveBrewFeedback } from './lib/learning';
import RealisticCupInterface from './components/RealisticCupInterface';
import InteractiveBrewingInterface from './components/Interactive3D/InteractiveBrewingInterface';
import SimpleInteractiveInterface from './components/Interactive3D/SimpleInteractiveInterface';
// Temporarily disable 3D components that might be causing crashes
// import Advanced3DTeaScene from './components/Advanced3D/Advanced3DTeaScene.web';
// import Simple3DDemo from './components/Advanced3D/Simple3DDemo';
// import CSSTeaVisualization from './components/Advanced3D/CSSTeaVisualization';

// Performance constants
const TIMER_UPDATE_INTERVAL = 100; // ms
const DATA_REFRESH_INTERVAL = 5000; // ms - reduced from 2000ms

interface TeaCardProps {
  tea: TeaProfile;
  onPress: () => void;
  isPhone: boolean;
  isTablet: boolean;
  spacing: (n: number) => number;
  fontSize: (n: number) => number;
  theme: any;
}

// Memoized TeaCard component with better typing
const TeaCard = memo<TeaCardProps>(({ tea, onPress, isPhone, isTablet, spacing, fontSize, theme }) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Pressable
      style={{ width: isPhone ? '48%' : isTablet ? '31%' : '23%' }}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${tea.name}, ${tea.baseTempC} degrees celsius, ${tea.baseScheduleSec.length} steeps`}
    >
      <Card style={{ padding: spacing(16), minHeight: isPhone ? 100 : 120 }}>
        <Text style={[styles.teaName, { color: theme.colors.text, fontSize: fontSize(16) }]}>{tea.name}</Text>
        <Text style={[styles.teaTemp, { color: theme.colors.textSecondary, fontSize: fontSize(14) }]}>{tea.baseTempC}°C</Text>
        <Text style={[styles.teaSteeps, { color: theme.colors.textTertiary, fontSize: fontSize(12) }]}>{tea.baseScheduleSec.length} steeps</Text>
      </Card>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return prevProps.tea.id === nextProps.tea.id &&
    prevProps.isPhone === nextProps.isPhone &&
    prevProps.isTablet === nextProps.isTablet &&
    prevProps.theme.colors.text === nextProps.theme.colors.text;
});

interface TeaGridProps {
  tiles: TeaProfile[];
  userTeas: TeaProfile[];
  onSelectTea: (tea: TeaProfile) => void;
  spacing: (n: number) => number;
  fontSize: (n: number) => number;
  theme: any;
  isPhone: boolean;
  isTablet: boolean;
}

// Memoized TeaGrid component with better typing
const TeaGrid = memo<TeaGridProps>(({ tiles, userTeas, onSelectTea, spacing, fontSize, theme, isPhone, isTablet }) => {
  const allTeas = useMemo(() => tiles.concat(userTeas), [tiles, userTeas]);

  return (
    <View style={[styles.teaGrid, { gap: spacing(12) }]}>
      {allTeas.map((tea) => (
        <TeaCard
          key={tea.id}
          tea={tea}
          onPress={() => onSelectTea(tea)}
          isPhone={isPhone}
          isTablet={isTablet}
          spacing={spacing}
          fontSize={fontSize}
          theme={theme}
        />
      ))}
    </View>
  );
});

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
  const [showQuickTeaGrid, setShowQuickTeaGrid] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [editingTea, setEditingTea] = useState<TeaProfile | null>(null);
  
  // Background timer state tracking with proper typing
  const backgroundStartTime = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const dataRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const animationFrame = useRef<number | null>(null);
  
  const theme = useTheme();
  const { isPhone, isTablet, isLandscape, spacing, fontSize } = useResponsive();
  const [completedSteep, setCompletedSteep] = useState<{tea: TeaProfile; steepIndex: number} | null>(null);

  // Memoized default teas to prevent recreation
  const tiles = useMemo(() =>
    ['green', 'black', 'oolong', 'white', 'puerh', 'herbal'].map(k => (DEFAULTS as any)[k]),
    []
  );

  // Clean up function for animations and timers
  const cleanupResources = useCallback(() => {
    if (dataRefreshInterval.current) {
      clearInterval(dataRefreshInterval.current);
      dataRefreshInterval.current = null;
    }
    if (timerInterval.current) {
      clearTimeout(timerInterval.current);
      timerInterval.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    soundManager.cleanup();
  }, []);

  // Load data with error handling and cleanup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [lastSteeps, teas] = await Promise.all([
          loadLastSteeps(),
          loadUserTeas()
        ]);
        setLast(lastSteeps);
        setUserTeas(teas);
      } catch (error) {
        console.error('Error loading data:', error);
        // Set default empty data to prevent crashes
        setLast([]);
        setUserTeas([]);
      }
    };

    // Initialize sound manager with error handling
    soundManager.initialize().catch(console.error);

    loadData();
    // Reduce refresh frequency for better performance
    dataRefreshInterval.current = setInterval(loadData, DATA_REFRESH_INTERVAL);

    return cleanupResources;
  }, [cleanupResources]);

  // Check if onboarding should be shown with error handling
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding && !showOnboarding) {
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

  // Load last used tea on app start
  useEffect(() => {
    const loadLastTea = async () => {
      try {
        const lastTeaId = await AsyncStorage.getItem('lastUsedTea');
        if (lastTeaId) {
          // Find tea in defaults first, then user teas
          const defaultTea = Object.values(DEFAULTS).find(tea => tea.id === lastTeaId);
          if (defaultTea) {
            setSelectedTea(defaultTea);
            // Load last used steep index and timer adjustments
            const lastSteepIndex = await AsyncStorage.getItem(`lastSteepIndex_${lastTeaId}`);
            const lastTimerAdjustment = await AsyncStorage.getItem(`timerAdjustment_${lastTeaId}`);
            
            if (lastSteepIndex) {
              setCurrentSteep(parseInt(lastSteepIndex));
            }
            
            const baseTime = defaultTea.baseScheduleSec[parseInt(lastSteepIndex || '0')];
            const adjustment = lastTimerAdjustment ? parseInt(lastTimerAdjustment) : 0;
            setTimerSeconds(baseTime + adjustment);
          } else {
            // Check user teas
            const userTeasData = await AsyncStorage.getItem('userTeas');
            if (userTeasData) {
              const userTeas = JSON.parse(userTeasData);
              const userTea = userTeas.find((tea: TeaProfile) => tea.id === lastTeaId);
              if (userTea) {
                setSelectedTea(userTea);
                const lastSteepIndex = await AsyncStorage.getItem(`lastSteepIndex_${lastTeaId}`);
                if (lastSteepIndex) {
                  setCurrentSteep(parseInt(lastSteepIndex));
                }
                const baseTime = userTea.baseScheduleSec[parseInt(lastSteepIndex || '0')];
                const lastTimerAdjustment = await AsyncStorage.getItem(`timerAdjustment_${lastTeaId}`);
                const adjustment = lastTimerAdjustment ? parseInt(lastTimerAdjustment) : 0;
                setTimerSeconds(baseTime + adjustment);
              }
            }
          }
        } else {
          // Default to first tea if no last tea saved
          setSelectedTea(DEFAULTS.oolong);
          setTimerSeconds(DEFAULTS.oolong.baseScheduleSec[0]);
        }
      } catch (error) {
        console.error('Error loading last tea:', error);
        // Fallback to default tea
        setSelectedTea(DEFAULTS.oolong);
        setTimerSeconds(DEFAULTS.oolong.baseScheduleSec[0]);
      }
    };

    const checkCrashRecovery = async () => {
      try {
        const runningTimerData = await AsyncStorage.getItem('runningTimerState');
        if (runningTimerData) {
          const timerState = JSON.parse(runningTimerData);
          const { timerSeconds: savedSeconds, backgroundStartTime: savedStartTime, selectedTeaId, currentSteep: savedSteep } = timerState;
          
          if (savedStartTime && savedSeconds > 0) {
            const timeElapsed = Math.floor((Date.now() - savedStartTime) / 1000);
            const remainingTime = Math.max(0, savedSeconds - timeElapsed);
            
            // Find the tea that was running
            const crashTea = Object.values(DEFAULTS).find(tea => tea.id === selectedTeaId);
            if (crashTea) {
              setSelectedTea(crashTea);
              setCurrentSteep(savedSteep);
              
              if (remainingTime > 0) {
                setTimerSeconds(remainingTime);
                setIsRunning(true);
                setShowTimer(true);
                Alert.alert('Timer Recovered', `Your ${crashTea.name} timer was running when the app closed. Continuing with ${remainingTime} seconds remaining.`);
              } else {
                // Timer completed during crash
                setTimerSeconds(0);
                setIsRunning(false);
                setShowTimer(true);
                Alert.alert('Steep Complete', `Your ${crashTea.name} steep completed while the app was closed.`);
              }
            }
          }
          
          // Clear crash recovery data
          await AsyncStorage.removeItem('runningTimerState');
        }
      } catch (error) {
        console.error('Error during crash recovery:', error);
      }
    };

    if (onboardingChecked) {
      loadLastTea();
      checkCrashRecovery();
    }
  }, [onboardingChecked]);

  // Optimized background/foreground timer state management
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      try {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          // App came to foreground
          if (backgroundStartTime.current && isRunning) {
            const timeElapsed = Math.floor((Date.now() - backgroundStartTime.current) / 1000);
            const newTimerSeconds = Math.max(0, timerSeconds - timeElapsed);

            if (newTimerSeconds <= 0) {
              // Timer completed while in background
              setIsRunning(false);
              setTimerSeconds(0);
              handleSteepComplete();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              soundManager.playChime();
            } else {
              // Update timer with elapsed time
              setTimerSeconds(newTimerSeconds);
            }

            backgroundStartTime.current = null;
          }
        } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          // App going to background
          if (isRunning && timerSeconds > 0) {
            backgroundStartTime.current = Date.now();
            // Save timer state for crash recovery
            await AsyncStorage.setItem('runningTimerState', JSON.stringify({
              timerSeconds,
              isRunning: true,
              backgroundStartTime: backgroundStartTime.current,
              selectedTeaId: selectedTea?.id,
              currentSteep
            }));
          }
        }

        appState.current = nextAppState;
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription?.remove();
    };
  }, [isRunning, timerSeconds, selectedTea, currentSteep]);

  // Optimized timer with refs to avoid excessive state updates
  const timerRef = useRef(timerSeconds);
  const displayTimerRef = useRef(timerSeconds);
  
  // Update refs when timer seconds changes from external sources
  useEffect(() => {
    timerRef.current = timerSeconds;
    displayTimerRef.current = timerSeconds;
  }, [timerSeconds]);

  // High-precision timer countdown with drift correction (≤0.2s/min accuracy)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let animationId: number;
    let startTime: number;
    let expectedTime: number;
    
    if (isRunning && timerRef.current > 0) {
      startTime = Date.now();
      expectedTime = startTime + (timerRef.current * 1000);
      
      const tick = () => {
        const currentTime = Date.now();
        const remainingMs = Math.max(0, expectedTime - currentTime);
        const remainingSec = Math.ceil(remainingMs / 1000);
        
        // Update timer only if seconds changed to avoid excessive updates
        if (remainingSec !== timerRef.current) {
          timerRef.current = remainingSec;
          
          if (timerRef.current === 5) {
            // T-5 warning haptic and chime
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            soundManager.playChime();
          } else if (timerRef.current <= 0) {
            setIsRunning(false);
            handleSteepComplete();
            // Completion haptic and chime
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            soundManager.playChime();
            soundManager.stopAmbient();
            timerRef.current = 0;
            return; // Exit early to avoid scheduling next tick
          }
          
          // Update display smoothly using requestAnimationFrame
          animationId = requestAnimationFrame(() => {
            setTimerSeconds(timerRef.current);
          });
        }
        
        // Schedule next tick with high precision (100ms intervals for accuracy)
        if (timerRef.current > 0) {
          interval = setTimeout(tick, 100);
        }
      };
      
      tick(); // Start immediately
    }
    
    return () => {
      clearTimeout(interval);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRunning]);

  const handleTeaSelect = useCallback(async (tea: TeaProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTea(tea);
    
    // Save as last used tea
    try {
      await AsyncStorage.setItem('lastUsedTea', tea.id);
      await AsyncStorage.setItem(`lastSteepIndex_${tea.id}`, '0');
      await AsyncStorage.removeItem(`timerAdjustment_${tea.id}`); // Reset adjustments for new selection
    } catch (error) {
      console.error('Error saving last tea:', error);
    }
    
    // Load preferences for this tea
    const prefs = await getTeaPrefs(tea.id);
    setVesselMl(prefs.vesselMl || 110);
    setTempC(prefs.tempC || tea.baseTempC);
    
    setCurrentSteep(0);
    setTimerSeconds(tea.baseScheduleSec[0]);
    setShowTimer(true);
  }, []);

  const handleTeaScanned = useCallback(async (newTea: TeaProfile) => {
    // Refresh user teas list to include the new tea
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
    
    // Auto-select the newly scanned tea
    handleTeaSelect(newTea);
  }, [handleTeaSelect]);

  const handleTeaCreated = useCallback(async (newTea: TeaProfile) => {
    // Refresh user teas list to include the new/updated tea
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
    
    // Auto-select the newly created/edited tea
    handleTeaSelect(newTea);
  }, [handleTeaSelect]);

  const handleEditTea = (tea: TeaProfile) => {
    setEditingTea(tea);
    setShowTeaCreator(true);
  };

  const handleRefreshTeas = useCallback(async () => {
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleDeleteUserTea = useCallback(async (teaId: string) => {
    await deleteUserTea(teaId);
    const updatedTeas = await loadUserTeas();
    setUserTeas(updatedTeas);
  }, []);

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
      
      // Clear timer state for crash recovery
      AsyncStorage.removeItem('runningTimerState').catch(console.error);
      
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

  const toggleStartPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const addTime = (seconds: number) => {
    setTimerSeconds(prev => {
      const newTime = Math.max(10, Math.min(600, prev + seconds));
      
      // Save timer adjustment
      if (selectedTea) {
        const baseTime = selectedTea.baseScheduleSec[currentSteep];
        const adjustment = newTime - baseTime;
        AsyncStorage.setItem(`timerAdjustment_${selectedTea.id}`, adjustment.toString()).catch(console.error);
      }
      
      return newTime;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const nextSteep = () => {
    if (selectedTea && currentSteep < selectedTea.baseScheduleSec.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const nextIndex = currentSteep + 1;
      setCurrentSteep(nextIndex);
      setTimerSeconds(selectedTea.baseScheduleSec[nextIndex]);
      setIsRunning(false);
      
      // Save current steep index
      AsyncStorage.setItem(`lastSteepIndex_${selectedTea.id}`, nextIndex.toString()).catch(console.error);
      // Reset timer adjustment for new steep
      AsyncStorage.removeItem(`timerAdjustment_${selectedTea.id}`).catch(console.error);
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
      
      // Clear timer state for crash recovery
      AsyncStorage.removeItem('runningTimerState').catch(console.error);
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
    if (currentSteep > 0 && selectedTea) {
      setIsRunning(false);
      const prevIndex = currentSteep - 1;
      setCurrentSteep(prevIndex);
      setTimerSeconds(selectedTea.baseScheduleSec[prevIndex]);
      soundManager.stopAmbient();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Save current steep index
      AsyncStorage.setItem(`lastSteepIndex_${selectedTea.id}`, prevIndex.toString()).catch(console.error);
      // Reset timer adjustment for new steep
      AsyncStorage.removeItem(`timerAdjustment_${selectedTea.id}`).catch(console.error);
    }
  };

  // Swipe down gesture to open quick tea grid
  const swipeDownGesture = Gesture.Pan()
    .onEnd((e) => {
      'worklet';
      const { velocityY, translationY } = e;
      
      // Detect swipe down
      if (velocityY > 500 || translationY > 100) {
        runOnJS(setShowQuickTeaGrid)(true);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

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
    return (
      <GestureHandlerRootView style={styles.container}>
        <GestureDetector gesture={swipeDownGesture}>
          <View style={[
            styles.timerContainer,
            { backgroundColor: theme.colors.background },
            isRunning && {
              backgroundColor: theme.colors.accent + '15',
              borderWidth: 2,
              borderColor: theme.colors.accent + '40'
            }
          ]}>
            <Pressable onPress={backToHome} style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
            </Pressable>

            <EnhancedTimer
              seconds={timerSeconds}
              totalSeconds={selectedTea.baseScheduleSec[currentSteep]}
              isRunning={isRunning}
              currentSteep={currentSteep}
              totalSteeps={selectedTea.baseScheduleSec.length}
              teaName={selectedTea.name}
              temperature={tempC}
              onToggle={toggleStartPause}
              onReset={resetTimer}
              onAdjustTime={addTime}
              onNextSteep={nextSteep}
              onPrevSteep={() => {
                if (currentSteep > 0) {
                  setCurrentSteep(currentSteep - 1);
                  setTimerSeconds(selectedTea.baseScheduleSec[currentSteep - 1]);
                  setIsRunning(false);
                }
              }}
            />
          </View>
        </GestureDetector>

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

      {/* Quick Brew Widget for fast tea selection */}
      <QuickBrewWidget
        onStartBrewing={handleTeaSelect}
        recentTeas={last.slice(0, 3).map(l => {
          return tiles.concat(userTeas).find(t => t.id === l.teaId);
        }).filter(Boolean) as TeaProfile[]}
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

      <TeaGrid 
        tiles={tiles}
        userTeas={userTeas}
        onSelectTea={handleTeaSelect}
        spacing={spacing}
        fontSize={fontSize}
        theme={theme}
        isPhone={isPhone}
        isTablet={isTablet}
      />

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

      {showQuickTeaGrid && (
        <QuickTeaGrid
          teas={tiles}
          onSelectTea={handleTeaSelect}
          onClose={() => setShowQuickTeaGrid(false)}
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
    // Note: CSS gradients not supported in React Native StyleSheet
    // background: 'linear-gradient(135deg, #1a2420, #0f1412)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backText: {
    fontSize: 16,
  },
  timerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  timerTemp: {
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
    fontSize: 16,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  startButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  pauseText: {
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  nextText: {
    fontSize: 14,
  },
  adjustControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  adjustButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  adjustText: {
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
  simpleTimer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: 4,
  },
});
