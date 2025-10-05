# TeaFlow AI Agent Guide

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Purpose:** Comprehensive playbook for AI agents working on TeaFlow enhancements

## Environment Matrix

### Development Environments

| Environment | Features Available | Use Case | Setup Command |
|-------------|-------------------|----------|---------------|
| **Expo Go** | Basic app functionality | Quick testing, UI changes | `expo start` |
| **Dev Client** | Full features (OCR, BLE) | Complete development | `expo start --dev-client` |
| **Physical Device** | All features + real gestures | Final testing, haptics | Deploy via EAS or cable |

### Feature Flag Matrix

| Feature | Expo Go | Dev Client | Physical Device | Notes |
|---------|---------|-----------|----------------|-------|
| Timer & Gestures | ✅ | ✅ | ✅ | Core functionality |
| SVG Animations | ✅ | ✅ | ✅ | Primary animation system |
| Skia Graphics | ❌ | ✅ | ✅ | Optional enhancement |
| OCR Camera | ❌ | ✅ | ✅ | Requires native modules |
| BLE Kettle | ❌ | ⚠️ | ✅ | Behind feature flag |
| Haptic Feedback | ❌ | ⚠️ | ✅ | Simulator limited |
| Local Notifications | ❌ | ✅ | ✅ | Timer alerts |

## Task Playbook

### 1. Adding New Tea Types

**Files to Modify**:
- `lib/types.ts` - Add to TeaType union
- `lib/teas.ts` - Add to DEFAULTS object
- Components using tea colors/themes

**Example Implementation**:
```typescript
// lib/types.ts
export type TeaType = 'oolong'|'puerh'|'green'|'white'|'black'|'herbal'|'rooibos'|'custom';

// lib/teas.ts
export const DEFAULTS: Record<string, TeaProfile> = {
  // ... existing teas
  rooibos: { 
    id:'rooibos', 
    name:'Rooibos', 
    type:'rooibos', 
    baseTempC:100, 
    defaultRatio:1/12, 
    baseScheduleSec:[10,15,20,25,30] 
  },
};
```

**Testing Checklist**:
- [ ] Tea appears in library screen
- [ ] Timer loads correct default schedule
- [ ] Theme colors apply correctly
- [ ] Learning system handles new type
- [ ] Export/import preserves data

### 2. Enhancing Gesture Recognition

**Primary File**: `components/GestureOverlay.tsx`

**Key Areas for Enhancement**:

**Directional Locking**:
```typescript
// Current pattern - enhance thresholds as needed
const isVerticalGesture = Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > VERTICAL_THRESHOLD;
const isHorizontalGesture = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > HORIZONTAL_THRESHOLD;
```

**Edge Detection**:
```typescript
// Screen-size adaptive edge zones
const edgeZoneLeft = screenWidth * EDGE_RATIO; // Usually 0.15-0.25
const edgeZoneRight = screenWidth * (1 - EDGE_RATIO);
```

**Conflict Resolution Priority**:
1. Long press (1000ms+) → Reset timer
2. Velocity-based swipes → Navigation
3. Edge taps → Time adjustment
4. Center taps → Play/pause

**Testing Strategy**:
- Test on multiple screen sizes (phone/tablet)
- Verify accessibility with VoiceOver/TalkBack
- Check performance under rapid gesture sequences
- Validate haptic feedback timing

### 3. Animation Performance Optimization

**Primary Files**: 
- `components/HourglassGrains.tsx`
- `components/graphics/`

**Performance Budgets**:
```typescript
// Device tier detection
const getDeviceTier = () => {
  // Low: <4GB RAM, older processors
  // Medium: 4-8GB RAM, standard processors  
  // High: >8GB RAM, latest processors
};

// Adaptive particle counts
const PARTICLE_COUNTS = {
  low: { leaves: 8, steam: 4 },
  medium: { leaves: 15, steam: 8 },
  high: { leaves: 25, steam: 12 }
};
```

**Animation Patterns**:
```typescript
// Use shared values for smooth performance
const animationProgress = useSharedValue(0);
const leafPositions = useSharedValue(new Float32Array(leafCount * 2));

// Batch updates to minimize re-renders
const updateParticles = useCallback(() => {
  'worklet';
  // Perform calculations on UI thread
  runOnJS(updateState)(newState);
}, []);
```

**Optimization Checklist**:
- [ ] Frame rate >30fps on medium-tier devices
- [ ] Memory usage <100MB during animations
- [ ] Smooth background/foreground transitions
- [ ] Graceful degradation when performance drops
- [ ] Animation cleanup on component unmount

### 4. OCR Pipeline Implementation

**Current State**: Camera capture ✅, Cloud integration ❌

**Files to Complete**:
- `lib/ocr.ts` - Cloud service integration
- `components/CameraScreen.tsx` - Enhanced UX

**Implementation Steps**:

**1. Cloud OCR Integration**:
```typescript
// lib/ocr.ts enhancement
export class CloudOCRService {
  async processImage(imageUri: string): Promise<OCRResult> {
    // 1. Image preprocessing (resize, enhance contrast)
    const processedImage = await preprocessImage(imageUri);
    
    // 2. Cloud API call (Vision/Textract)
    const ocrResponse = await callCloudOCR(processedImage);
    
    // 3. Text parsing with confidence scoring
    return parseTeaInformation(ocrResponse);
  }
}
```

**2. Text Parsing Patterns**:
```typescript
// Temperature extraction patterns
const tempPatterns = [
  /(\d+)°?\s*[CcFf]/g,           // "85°C", "185F"
  /temp[erature]*:?\s*(\d+)/gi,   // "Temperature: 85"
  /(\d+)\s*degrees?/gi,           // "85 degrees"
];

// Time extraction patterns  
const timePatterns = [
  /(\d+)\s*min[utes]*\s*(\d+)\s*sec[onds]*/gi,  // "3 minutes 30 seconds"
  /(\d+)[-:](\d+)/g,                             // "3:30", "3-4"
  /steep\s*(?:for\s*)?(\d+)/gi,                  // "steep for 3"
];
```

**3. Confidence Scoring**:
```typescript
interface OCRConfidence {
  temperature: number;    // 0-1 confidence
  steepTime: number;     // 0-1 confidence
  teaName: number;       // 0-1 confidence
  overall: number;       // Combined confidence
}

// Require >0.7 overall confidence for auto-acceptance
```

**Testing Requirements**:
- [ ] Test with real tea packages (20+ varieties)
- [ ] Handle multilingual text (Chinese, Japanese)
- [ ] Graceful fallback when OCR fails
- [ ] Performance <3s end-to-end
- [ ] Proper error handling and user feedback

### 5. Persistence Migrations

**File**: `lib/store.ts`

**Migration Patterns**:
```typescript
// Version-based migration system
const SCHEMA_VERSION = '2.0';

const migrateFromV1 = async (data: any) => {
  // Example: Add new fields to existing TeaProfile objects
  const updatedTeas = data.userTeas.map(tea => ({
    ...tea,
    defaultRatio: tea.defaultRatio || 1/15, // Add missing field
    cover: tea.cover || null,               // Add missing field
  }));
  
  return { ...data, userTeas: updatedTeas };
};

const MIGRATIONS = {
  '1.0': migrateFromV1,
  '1.5': migrateFromV1_5,
  // Add new migrations here
};
```

**Critical Migration Rules**:
1. **Never lose user data** - Always preserve existing fields
2. **Test with real data** - Use exported user libraries for testing
3. **Provide fallbacks** - Handle corrupted or incomplete data
4. **Log migration events** - Help debug issues in production

### 6. Background Timer Resilience

**Problem**: JS timers unreliable when app backgrounded

**Solution Pattern**:
```typescript
// Store timestamp when timer starts
const startTimestamp = useRef<number>(Date.now());
const targetEndTime = useRef<number>(Date.now() + durationMs);

// On app foreground, reconcile elapsed time
const onAppStateChange = (nextAppState: string) => {
  if (nextAppState === 'active' && isTimerRunning) {
    const now = Date.now();
    const elapsedMs = now - startTimestamp.current;
    const remainingMs = Math.max(0, targetEndTime.current - now);
    
    // Update timer display with actual remaining time
    updateTimerDisplay(remainingMs);
    
    // Check if timer expired while backgrounded
    if (remainingMs === 0) {
      onTimerComplete();
    }
  }
};
```

**Notification Backup**:
```typescript
// Schedule local notification as backup
import * as Notifications from 'expo-notifications';

const scheduleTimerNotification = (durationMs: number) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tea Timer',
      body: 'Your tea is ready! ✨',
    },
    trigger: { seconds: durationMs / 1000 },
  });
};
```

## Environment Setup for AI Agents

### Required Capabilities Check

```typescript
// lib/capabilities.ts
export const checkCapabilities = async () => {
  const capabilities = {
    camera: await Camera.requestCameraPermissionsAsync(),
    notifications: await Notifications.requestPermissionsAsync(),
    haptics: await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => false),
    bluetooth: Platform.OS !== 'web', // Simplified check
  };
  
  return capabilities;
};
```

### Development Environment Setup

**For UI/Animation Work**:
```bash
expo start --web  # Quick iteration on animations
```

**For Gesture Testing**:
```bash
expo start --dev-client  # Full gesture support
```

**For OCR/BLE Development**:
```bash
expo start --dev-client
# Deploy to physical device for full testing
```

### Common Development Gotchas

**Gesture Testing**:
- Simulator gestures behave differently than real devices
- Haptic feedback only works on physical devices
- Edge detection varies by screen size - always test multiple

**Animation Performance**:
- Web performance doesn't predict mobile performance
- Always profile on actual devices, not simulators
- Memory pressure affects animation smoothness

**AsyncStorage**:
- Data persists between development sessions
- Clear storage when testing migrations
- Large data sets slow cold app startup

**Timer Accuracy**:
- Background timing unreliable in development
- Test with device going to sleep
- Notifications may be delayed in simulator

## Performance Monitoring for Agents

### Frame Rate Monitoring

```typescript
// Add to animation components for performance tracking
const useFrameRateMonitor = () => {
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  
  const monitorFrame = useCallback(() => {
    frameCount.current++;
    const now = Date.now();
    
    if (now - lastTime.current >= 1000) {
      const fps = frameCount.current;
      console.log(`FPS: ${fps}`);
      
      if (fps < 24) {
        console.warn('Performance degradation detected');
      }
      
      frameCount.current = 0;
      lastTime.current = now;
    }
  }, []);
  
  return monitorFrame;
};
```

### Memory Usage Tracking

```typescript
// Monitor memory growth during development
const useMemoryMonitor = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (__DEV__ && (performance as any).memory) {
        const memory = (performance as any).memory;
        console.log(`Memory: ${Math.round(memory.usedJSHeapSize / 1048576)}MB`);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
};
```

## Debugging Workflows

### Common Issues and Solutions

**1. Gestures Not Responding**:
```bash
# Check gesture handler setup
# Verify GestureHandlerRootView wraps App
# Test on physical device if simulator issues
```

**2. Animations Stuttering**:
```bash
# Monitor CPU usage during animations
# Reduce particle counts
# Check for memory leaks in useEffect cleanup
```

**3. Timer Drift**:
```bash
# Test background/foreground transitions
# Verify notification scheduling
# Check system clock synchronization
```

**4. OCR Poor Accuracy**:
```bash
# Test image quality before processing
# Verify preprocessing steps
# Check lighting conditions in test images
```

**5. Persistence Issues**:
```bash
# Clear AsyncStorage for clean testing
# Verify JSON serialization/deserialization
# Test migration with actual user data
```

### Development Tools

**React Native Debugger**:
```bash
# Install and configure for advanced debugging
npm install -g react-native-debugger
```

**Flipper Integration**:
```bash
# Monitor performance, network, async storage
# Built into Expo Dev Client
```

**Expo Development Tools**:
```bash
# Access via expo://localhost:19002 in browser
# View logs, clear cache, reload app
```

This comprehensive agent guide ensures AI systems can effectively contribute to TeaFlow development while understanding the nuances of mobile app development, gesture recognition, animation performance, and tea brewing domain requirements.