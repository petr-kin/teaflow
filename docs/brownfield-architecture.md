# TeaFlow Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the TeaFlow codebase - a sophisticated React Native + Expo tea brewing companion app with gesture-first UX, animated SVG graphics, and adaptive learning. It serves as a reference for AI agents working on enhancements, documenting actual implementation patterns, technical debt, workarounds, and real-world constraints.

### Document Scope
Comprehensive documentation of the entire TeaFlow system, focused on implementation reality vs architectural vision.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-10 | 1.0 | Initial brownfield analysis | Winston, the Architect |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `App.tsx` (main component with lazy loading)
- **Configuration**: `app.json` (Expo config), `package.json` (dependencies)
- **Core Business Logic**: `lib/` directory (all core services)
- **Timer & Gestures**: `components/TimerWithGestures.tsx`, `components/GestureOverlay.tsx`
- **Tea Data**: `lib/teas.ts` (defaults), `lib/store.ts` (persistence), `lib/types.ts` (interfaces)
- **Animation Engine**: `components/HourglassGrains.tsx`, `components/graphics/`
- **Learning System**: `lib/learning.ts`, `lib/scheduler.ts`
- **OCR Pipeline**: `components/CameraScreen.tsx`, `lib/ocr.ts` (stub)

### Implementation Reality vs Architectural Vision

**CRITICAL GAPS TO UNDERSTAND:**
- **3D/Three.js**: NOT in scope. Current app uses React Native + SVG/Reanimated, not true 3D
- **Zen visuals**: Implemented as animated SVG components, not heavy video loops
- **BLE kettle**: Present as stub behind Dev Client flag - not production-ready
- **OCR**: Starter implementation exists but cloud OCR integration not wired for production

## High Level Architecture

### Technical Summary

TeaFlow is a React Native + Expo mobile app that uses **SVG animations with Reanimated** (not 3D) to create a gesture-controlled tea brewing timer with adaptive learning and OCR capabilities. The app operates offline-first with AsyncStorage persistence.

### Actual Tech Stack (from package.json)

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| Runtime | React Native | 0.79.5 | Expo SDK 53 |
| Framework | Expo | ~53.0.22 | Dev Client required for OCR/BLE |
| Graphics | React Native Skia | ^2.2.6 | Optional - SVG/Reanimated primary |
| Gestures | react-native-gesture-handler | ~2.24.0 | Core interaction system |
| Animation | react-native-reanimated | ^3.19.1 | Primary animation engine |
| 3D (Limited) | @react-three/fiber | ^9.3.0 | Demo components only |
| Storage | AsyncStorage | 2.1.2 | Primary persistence |
| Audio | expo-av | ~15.1.7 | Chimes and ambient sounds |
| Camera | expo-camera | ~16.1.11 | OCR capture |
| Haptics | expo-haptics | ~14.1.4 | Gesture feedback |

### Repository Structure Reality Check

- **Type**: Single React Native app (not monorepo)
- **Package Manager**: npm (package-lock.json present)
- **Build System**: Expo managed workflow
- **Notable**: Heavy use of lazy loading for performance

## Source Tree and Module Organization

### Project Structure (Actual)

```text
teaflow/
├── App.tsx                    # Main entry with lazy loading patterns
├── app.json                   # Expo configuration
├── package.json              # Dependencies
├── lib/                       # Core business logic
│   ├── types.ts              # TypeScript interfaces (minimal, compact)
│   ├── teas.ts               # Default tea profiles (5 types)
│   ├── store.ts              # AsyncStorage operations
│   ├── learning.ts           # Adaptive scheduling algorithms
│   ├── scheduler.ts          # Tea timing calculations
│   ├── prefs.ts              # User preferences
│   ├── theme.ts              # Theme system with tea colors
│   ├── sounds.ts             # Audio management
│   ├── bluetooth.ts          # BLE kettle (stub behind feature flag)
│   ├── offline.ts            # Network state management
│   └── responsive.ts         # Device adaptation
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── Button.tsx        # Themed button component
│   │   ├── Card.tsx          # Tea card component
│   │   ├── Header.tsx        # Screen headers
│   │   ├── IconButton.tsx    # Icon buttons
│   │   └── Tag.tsx           # Tea type tags
│   ├── graphics/             # Visual components (SVG-based)
│   │   ├── TeaLogo.tsx       # App logo
│   │   ├── BackgroundWave.tsx # Animated backgrounds
│   │   ├── BackgroundWaveSkia.tsx # Skia version (optional)
│   │   └── HourglassSkia.tsx # Skia hourglass (optional)
│   ├── Advanced3D/           # Demo 3D components (NOT core functionality)
│   ├── Interactive3D/        # Interactive demos
│   ├── TimerWithGestures.tsx # CORE: Main timer interface
│   ├── GestureOverlay.tsx    # CORE: Gesture recognition
│   ├── HourglassGrains.tsx   # CORE: Timer animation (SVG)
│   ├── CameraScreen.tsx      # OCR camera interface
│   ├── TeaLibraryScreen.tsx  # Tea collection management
│   ├── BrewFeedbackModal.tsx # Learning system UI
│   ├── OnboardingScreen.tsx  # First-time user flow
│   └── [Other screens]       # Settings, analytics, etc.
├── assets/                   # Images, sounds, icons
├── docs/                     # Comprehensive documentation
└── .expo/                    # Expo build artifacts
```

### Key Modules and Their Purpose

- **Timer Core**: `components/TimerWithGestures.tsx` - State machine (running/paused/reset), T-5/T-0 cues
- **Gesture System**: `components/GestureOverlay.tsx` - Edge-tap zones, directional locking, conflict resolution
- **Animation Engine**: `components/HourglassGrains.tsx` - SVG-based hourglass with tea leaf particles
- **Learning System**: `lib/learning.ts` + `lib/scheduler.ts` - Adaptive timing with per-tea/per-vessel offsets
- **Persistence**: `lib/store.ts` - AsyncStorage operations with versioned schemas
- **OCR Pipeline**: `components/CameraScreen.tsx` + `lib/ocr.ts` - Camera capture and text parsing (partial)

## Data Models and APIs

### Data Models

Core interfaces defined in `lib/types.ts`:

```typescript
export type TeaType = 'oolong'|'puerh'|'green'|'white'|'black'|'herbal'|'custom';

export interface TeaProfile { 
  id: string; 
  name: string; 
  type: TeaType; 
  baseTempC: number; 
  defaultRatio: number; 
  baseScheduleSec: number[]; 
  cover?: string; 
  user?: boolean; 
}

export interface LastSteep { 
  teaId: string; 
  name: string; 
  infusionIndex: number; 
  actualSec: number; 
  ts: number; 
}

export type VesselBucket = '≤80'|'81–120'|'≥121';
```

### Persistence Schema (AsyncStorage Keys)

**CRITICAL STORAGE KEYS** - Used by `lib/store.ts`:

- `gongfu:lastSteeps` - Array of LastSteep objects
- `gongfu:userTeas` - User-created TeaProfile objects
- `gongfu:prefs` - User preferences object
- `gongfu:learning` - Learning offsets and statistics
- `gongfu:library` - Tea library metadata

### API Specifications

- **Local Only**: No external APIs in core functionality
- **OCR Integration**: Planned cloud OCR (Vision/Textract) not yet wired
- **BLE Integration**: Kettle commands via expo-bluetooth (behind feature flag)

## Technical Debt and Known Issues

### Critical Technical Debt

1. **OCR Implementation**: Starter code exists but cloud integration incomplete
   - `lib/ocr.ts` is mostly stub
   - Camera capture works but parsing needs cloud service wiring
   - On-device OCR models would inflate app size significantly

2. **BLE Kettle Integration**: Behind Dev Client flag, not production-ready
   - `lib/bluetooth.ts` has basic structure but needs real device testing
   - Requires physical kettle hardware for validation

3. **3D Components Mismatch**: Advanced3D folder exists but not used in core app
   - Architectural docs reference 3D but implementation is SVG/Reanimated
   - Three.js components are demos only, not integrated

4. **Timer Background Reliability**: JS timers not guaranteed when backgrounded
   - Workaround: Use local notifications for T-5/T-0 cues
   - Must reconcile elapsed time on app resume

### Workarounds and Gotchas

- **Expo Go vs Dev Client**: OCR and BLE require Dev Client; silently no-op in Expo Go
- **Audio Preloading**: Must preload chime/ambient sounds before first use to avoid T-0 lag
- **Gesture Priority**: Timer controls trump navigation unless swipe angle > ~30° and velocity threshold met
- **Background Timing**: On resume, compute elapsed time from stored timestamp, don't trust intervals
- **Image Memory**: Always downscale camera images before OCR; store thumbnails only

## Complexity Hotspots for AI Agents

### 1. Gesture-First Timer UX (HIGH COMPLEXITY)

**File**: `components/TimerWithGestures.tsx` + `components/GestureOverlay.tsx`

**Critical Issues**:
- **Directional Locking**: Vertical adjust vs horizontal navigation conflicts
- **Edge-Tap Hit Areas**: Screen-size adaptive zones for -10s/+10s
- **Long-Press Reset**: 1-second threshold with haptic feedback
- **Conflict Avoidance**: Gestures must not interfere with camera/OCR screens

**Implementation Patterns**:
```typescript
// Gesture priority rules from actual code
if (Math.abs(dy) > Math.abs(dx) && velocity > threshold) {
  // Vertical gesture - temperature/volume adjustment
} else if (Math.abs(dx) > Math.abs(dy) && velocity > threshold) {
  // Horizontal gesture - navigation
} else {
  // Tap gesture - timer control
}
```

### 2. Animation System (MEDIUM COMPLEXITY)

**Files**: `components/HourglassGrains.tsx`, `components/graphics/`

**Architecture**: SVG + Reanimated (NOT Skia primary, NOT video loops)

**Performance Constraints**:
- 30-60 FPS target on mid-range devices
- Low CPU/GPU usage during 3+ minute brewing sessions
- Backgrounding safety - pause animations when app backgrounded

**Technical Implementation**:
- Uses `react-native-svg` + `react-native-reanimated`
- Shared values for smooth animations
- Particle count adaptive to device performance tier

### 3. Adaptive Scheduling (HIGH COMPLEXITY)

**Files**: `lib/learning.ts`, `lib/scheduler.ts`

**Algorithm**: Per-tea + per-vessel learning offsets applied consistently

**Critical Concerns**:
- **Compounding Drift**: Guard against runaway adjustments
- **Bucket Mapping**: Vessel size affects timing calculations
- **Smoothing**: Apply gradual changes, not sudden jumps

**Data Flow**:
```
BrewSession → Learning Analysis → Offset Calculation → Schedule Adjustment → Timer Update
```

### 4. OCR Pipeline (PHASE 2 - PARTIAL IMPLEMENTATION)

**Files**: `components/CameraScreen.tsx`, `lib/ocr.ts`

**Current State**: Camera UX complete, parsing incomplete

**Planned Flow**:
1. Camera capture (✅ implemented)
2. Image preprocessing (🔄 partial)
3. Cloud OCR (❌ not wired)
4. Text parsing (🔄 basic patterns)
5. Temperature/time extraction (❌ needs work)
6. TeaProfile creation (✅ implemented)

**Performance Target**: Latency <3s end-to-end

### 5. Persistence Model (MEDIUM COMPLEXITY)

**File**: `lib/store.ts`

**Schema Compatibility**: Must maintain AsyncStorage schema across versions

**Critical Data**:
- Last steeps history
- User-created teas
- Learning offsets
- User preferences

**Migration Strategy**: Version checks + gradual data transformation

## Integration Points and External Dependencies

### Internal Integration Points

- **Timer ↔ Learning**: Actual brew times feed learning algorithm
- **Gestures ↔ Timer**: Gesture overlay sends commands to timer state machine
- **OCR ↔ Tea Library**: Parsed tea data creates new TeaProfile objects
- **Theme ↔ All Components**: Tea-inspired color system used throughout

### External Services (Planned/Partial)

| Service | Purpose | Integration Status | Notes |
|---------|---------|-------------------|-------|
| Cloud OCR | Text recognition | Not wired | Vision API or Textract planned |
| BLE Devices | Smart kettle control | Behind feature flag | Physical hardware needed |
| Analytics | Usage tracking | Basic local only | No external service yet |

## Development and Deployment

### Local Development Setup

**Prerequisites**:
```bash
npm install -g @expo/cli
# iOS: Xcode and iOS Simulator
# Android: Android Studio and emulator
```

**Setup Steps**:
```bash
git clone <repository>
cd teaflow
npm install
expo start
```

**Development Modes**:
- `expo start` - Expo Go (limited features)
- `expo start --dev-client` - Dev Client (full features including OCR/BLE)

### Build and Deployment Process

- **Development**: `expo start`
- **Web Build**: `npm run build` (uses expo export)
- **Mobile Build**: Use Expo Application Services (EAS)
- **Distribution**: App Store/Google Play via EAS Submit

## Testing Reality

### Current Test Coverage

- **Unit Tests**: None currently implemented
- **Integration Tests**: None
- **E2E Tests**: None
- **Manual Testing**: Primary QA method

### Testing Strategy for AI Agents

**Gesture Testing**:
```bash
# Test on multiple device sizes
# Verify edge-tap zones scale correctly
# Check conflict resolution between gestures
```

**Timer Accuracy Testing**:
```bash
# Background/foreground transitions
# Device sleep scenarios
# Long-duration timing validation
```

## Performance Considerations & Patterns

### Animation Performance

**Pattern**: Prefer `react-native-reanimated` + `react-native-svg`
- Minimize state churn during animations
- Avoid heavy setState per animation tick
- Batch updates with shared values
- Keep particle counts adaptive to device class

### Frame Budget Management

**Target**: 30-60 FPS animations
- Cap particle counts on lower-end devices
- Reduce animation complexity when performance drops
- Use device performance tier detection

### Work Distribution

**Off Main Thread**:
- OCR processing
- Image decode operations
- Schedule recomputation
- Learning algorithm calculations

**Keep UI Thread Free**:
- Animation updates
- Gesture recognition
- Timer display updates

### Battery Optimization

**Strategies**:
- Reduce animation loops when screen idle
- Pause ambient audio when timer paused
- Keep notification chimes short
- Background app state handling

## Agent Task Playbook

### Common Agent Tasks

1. **Add/Modify Tea Defaults**
   - Edit `lib/teas.ts` DEFAULTS object
   - Follow existing TeaProfile interface
   - Update baseScheduleSec arrays for timing sequences

2. **Enhance Gesture Recognition**
   - Modify `components/GestureOverlay.tsx`
   - Adjust thresholds and locking logic
   - Add accessibility fallbacks

3. **Improve Animations**
   - Work with `components/HourglassGrains.tsx`
   - Maintain performance budgets
   - Test on multiple device tiers

4. **Implement OCR Features**
   - Complete `lib/ocr.ts` cloud integration
   - Enhance parsing confidence heuristics
   - Handle multilingual text (future)

5. **Extend Tea Library**
   - Modify `components/TeaLibraryScreen.tsx`
   - Add search, edit, merge capabilities
   - Implement image thumbnail pipeline

### Development Gotchas for Agents

**Environment**:
- Always test in Dev Client for full features
- Expo Go silently disables OCR/BLE
- Use capability checks before feature access

**Performance**:
- Always profile animations on mid-range devices
- Monitor AsyncStorage size growth
- Test background/foreground transitions

**Data**:
- Never break AsyncStorage schema compatibility
- Always provide migration paths
- Test with existing user data

## Persistence Deep Dive

### Storage Schema Details

**AsyncStorage Keys** (from `lib/store.ts`):

```typescript
// Last brewing sessions
'gongfu:lastSteeps': LastSteep[]

// User-created tea profiles  
'gongfu:userTeas': TeaProfile[]

// User preferences
'gongfu:prefs': {
  vesselSize: VesselBucket,
  soundEnabled: boolean,
  hapticEnabled: boolean,
  // ... other preferences
}

// Learning algorithm data
'gongfu:learning': {
  offsets: Record<string, number>, // teaId -> time offset
  bucketStats: Record<VesselBucket, any>,
  // ... learning statistics
}
```

### Migration Strategy

**Version Detection**:
```typescript
// Check for schema version in stored data
const version = await AsyncStorage.getItem('gongfu:version');
if (!version || version < CURRENT_VERSION) {
  await migrateData(version);
}
```

## Appendix - Useful Commands and Scripts

### Development Commands

```bash
# Start development
npm start                 # Expo Go mode
expo start --dev-client  # Dev Client mode (full features)

# Platform specific
npm run ios              # iOS simulator
npm run android          # Android emulator
npm run web             # Web development (Python server)

# Build for production
npm run build           # Expo export for web
```

### Debugging Commands

```bash
# Clear Expo cache
expo start --clear

# Reset AsyncStorage (for testing)
# Use Expo dev tools in browser

# View logs
npx react-native log-ios     # iOS logs
npx react-native log-android # Android logs
```

### Common Troubleshooting

**Gesture Issues**:
- Check device simulator gesture settings
- Verify screen dimensions in responsive calculations
- Test on physical device for haptic feedback

**Animation Performance**:
- Monitor frame rate in Flipper/dev tools
- Reduce particle counts if stuttering
- Check for memory leaks in animation cleanup

**Timer Accuracy**:
- Test background/foreground transitions
- Verify notification permissions
- Check system time synchronization

---

*This brownfield architecture document reflects the actual implementation state of TeaFlow as of 2025-09-10. It serves as the definitive guide for AI agents working on enhancements, capturing both the sophisticated design vision and real-world implementation constraints.*