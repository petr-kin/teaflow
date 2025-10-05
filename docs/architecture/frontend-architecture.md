# Frontend Architecture

**Core Visual Approach:** TeaFlow uses looping videos as primary graphics instead of complex 3D, creating a zen, meditative experience while maintaining performance efficiency. This video-based approach becomes the core visual language of the app.

## Tea-Inspired Design System

Based on comprehensive visual design specifications, TeaFlow implements a complete design system with tea-inspired tokens:

```typescript
// Enhanced theme system with tea-inspired palette
export const teaTheme = {
  colors: {
    // Primary tea colors
    teaGreen: '#4A6741',           // Primary actions, active states
    goldenOolong: '#B8860B',       // Secondary actions, highlights
    steepingAmber: '#D2691E',      // Active brewing, warm feedback
    
    // Neutral palette
    softBlack: '#2D2D2D',          // Primary text
    clayGray: '#6B6B6B',           // Secondary text
    mistGray: '#A8A8A8',           // Tertiary text, disabled
    steamWhite: '#FAFAFA',         // Backgrounds
    porcelain: '#F5F5F0',          // Card backgrounds
    
    // Functional colors
    successTea: '#22C55E',         // Confirmations, completed sessions
    warningAmber: '#F59E0B',       // Cautions, timer alerts
    errorRed: '#EF4444',           // Errors, destructive actions
    
    // Brewing state colors
    preparation: '#E5E7EB',        // Inactive/preparing
    activeBrew: '#FCD34D',         // Timer running, gentle pulsing
    complete: '#10B981',           // Session finished
  },
  
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64
  },
  
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      accent: 'Georgia, "Times New Roman", serif',
      mono: 'SF Mono, Consolas, monospace',
    },
    scale: {
      display: { size: 32, weight: '700', lineHeight: 38 },
      timer: { size: 48, weight: '300', lineHeight: 52 },
      h1: { size: 24, weight: '600', lineHeight: 30 },
      body: { size: 14, weight: '400', lineHeight: 20 },
      caption: { size: 12, weight: '400', lineHeight: 16 },
    }
  },
  
  animations: {
    fast: 150,      // Micro-interactions, hovers
    standard: 300,  // State changes, transitions  
    slow: 500,      // Screen transitions, major state changes
    brewing: 1000,  // Tea ceremony pace, celebrations
    liquidDrain: 1500,  // Zen confirmation animation duration
    easings: {
      teaFlow: 'cubic-bezier(0.165, 0.84, 0.44, 1)', // Zen-like, organic feel
      standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Natural movement
      accelerate: 'cubic-bezier(0.55, 0, 1, 0.45)',     // Exit animations
      decelerate: 'cubic-bezier(0, 0.55, 0.45, 1)',     // Enter animations
    }
  },
};
```

## Component Architecture

```
src/
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx  
│   │   ├── Header.tsx
│   │   └── IconButton.tsx
│   ├── graphics/               # Visual components
│   │   ├── TeaLogo.tsx
│   │   ├── BackgroundWave.tsx
│   │   ├── BackgroundWaveSkia.tsx
│   │   └── HourglassSkia.tsx
│   ├── Advanced3D/             # Complex 3D scenes
│   │   ├── Advanced3DTeaScene.tsx
│   │   ├── CSSTeaVisualization.tsx
│   │   └── Simple3DDemo.tsx
│   ├── Interactive3D/          # Interactive elements
│   │   ├── InteractiveBrewingInterface.tsx
│   │   └── SimpleInteractiveInterface.tsx
│   └── screens/                # Screen-level components
│       ├── OnboardingScreen.tsx
│       ├── TimerWithGestures.tsx
│       ├── CameraScreen.tsx
│       └── TeaLibraryScreen.tsx
├── lib/                        # Core utilities
│   ├── types.ts               # Shared TypeScript interfaces
│   ├── store.ts               # Data persistence
│   ├── theme.ts               # Theme system
│   ├── sounds.ts              # Audio management
│   ├── bluetooth.ts           # Kettle integration
│   ├── learning.ts            # ML recommendations
│   └── responsive.ts          # Device adaptation
└── hooks/                      # Custom React hooks
    ├── useTimer.ts
    ├── useGestures.ts
    ├── useTheme.ts
    └── useLiquidDrainAnimation.ts  # Zen confirmation animations
```

```typescript
// Component template with proper TypeScript patterns
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../lib/theme';
import { useResponsive } from '../lib/responsive';

interface ComponentProps {
  // Props with explicit types
}

const Component = memo<ComponentProps>(({ /* props */ }) => {
  const theme = useTheme();
  const { spacing, fontSize, isPhone } = useResponsive();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Component content */}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Component;
```

## State Management Architecture

```typescript
// Global app state structure using Zustand
interface AppState {
  // Tea data
  selectedTea: TeaProfile | null;
  userTeas: TeaProfile[];
  
  // Timer state  
  timerSeconds: number;
  isTimerRunning: boolean;
  currentSteep: number;
  
  // UI state
  currentScreen: 'home' | 'timer' | 'library' | 'settings';
  showOnboarding: boolean;
  
  // User preferences
  globalSettings: {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    themeMode: 'light' | 'dark' | 'auto';
    graphicsQuality: 'low' | 'medium' | 'high';
  };
}
```

**State Management Patterns:**
- Immutable updates using Zustand
- Separate stores for different concerns (tea data, timer, UI)
- Persist critical state to AsyncStorage automatically
- Optimistic updates with rollback for offline scenarios

## Routing Architecture

```
Navigation Structure:
├── App Navigator (Stack)
│   ├── Home Screen (Tea Selection)
│   ├── Timer Screen (Brewing Interface)
│   ├── Library Screen (Tea Management)
│   ├── Camera Screen (OCR Scanning)
│   ├── Settings Screen (User Preferences)
│   └── Onboarding Screen (First-time Setup)
└── Modal Stack
    ├── Tea Creator Modal
    ├── Brew Feedback Modal
    ├── Export/Import Modal
    └── Analytics Modal
```

```typescript
// Protected route pattern for premium features
const PremiumRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPremium = useStore(state => state.user.isPremium);
  
  if (!isPremium) {
    return <PremiumUpgradeScreen />;
  }
  
  return <>{children}</>;
};
```

## Frontend Services Layer

```typescript
// API client setup for cloud features (optional)
class CloudSyncService {
  private static instance: CloudSyncService;
  private baseUrl: string;
  
  static getInstance(): CloudSyncService {
    if (!this.instance) {
      this.instance = new CloudSyncService();
    }
    return this.instance;
  }
  
  async syncUserData(data: UserData): Promise<void> {
    // Upload user data to cloud storage
  }
  
  async downloadUserData(): Promise<UserData | null> {
    // Download user data from cloud storage
  }
}

// Service layer example
export const teaService = {
  async loadDefaultTeas(): Promise<TeaProfile[]> {
    return DEFAULTS_TEAS;
  },
  
  async saveUserTea(tea: TeaProfile): Promise<void> {
    await AsyncStorage.setItem(`userTea_${tea.id}`, JSON.stringify(tea));
  },
  
  async deleteUserTea(teaId: string): Promise<void> {
    await AsyncStorage.removeItem(`userTea_${teaId}`);
  }
};
```
