# Gesture Conflict Resolution Specification

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Author:** Winston, the Architect  
**Purpose:** Eliminate gesture conflicts to achieve >95% recognition accuracy target

## Mathematical Gesture Detection Algorithms

### Primary Conflict Prevention Algorithm

```typescript
interface GestureEvent {
  x: number;
  y: number;
  timestamp: number;
  velocity: { x: number; y: number };
  pressure: number;
}

class GestureResolver {
  private readonly EDGE_THRESHOLD = 0.2; // 20% of screen width
  private readonly TAP_MAX_DURATION = 200; // milliseconds
  private readonly TAP_MAX_DISTANCE = 10; // pixels
  private readonly SWIPE_MIN_VELOCITY = 500; // pixels/second
  private readonly LONG_PRESS_DURATION = 1000; // milliseconds

  resolveGesture(events: GestureEvent[]): GestureType {
    if (events.length === 0) return GestureType.NONE;
    
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const duration = lastEvent.timestamp - firstEvent.timestamp;
    const distance = this.calculateDistance(firstEvent, lastEvent);
    const velocity = this.calculateVelocity(events);
    
    // Priority hierarchy to prevent conflicts
    
    // 1. LONG PRESS (highest priority - overrides all)
    if (duration >= this.LONG_PRESS_DURATION && distance < this.TAP_MAX_DISTANCE) {
      return GestureType.LONG_PRESS;
    }
    
    // 2. SWIPE (high velocity overrides tap)
    if (velocity.magnitude > this.SWIPE_MIN_VELOCITY) {
      return this.classifySwipe(velocity, firstEvent);
    }
    
    // 3. EDGE TAP (specific zones)
    if (duration < this.TAP_MAX_DURATION && distance < this.TAP_MAX_DISTANCE) {
      return this.classifyTap(firstEvent);
    }
    
    // 4. PINCH/TWIST (multi-touch)
    if (events.length > 1) {
      return this.classifyMultiTouch(events);
    }
    
    return GestureType.NONE;
  }
  
  private classifyTap(event: GestureEvent): GestureType {
    const screenWidth = Dimensions.get('window').width;
    const relativeX = event.x / screenWidth;
    
    if (relativeX < this.EDGE_THRESHOLD) {
      return GestureType.EDGE_TAP_LEFT; // -10 seconds
    }
    
    if (relativeX > (1 - this.EDGE_THRESHOLD)) {
      return GestureType.EDGE_TAP_RIGHT; // +10 seconds
    }
    
    return GestureType.CENTER_TAP; // Start/Pause
  }
  
  private classifySwipe(velocity: Velocity, startEvent: GestureEvent): GestureType {
    const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    
    // Horizontal swipes (±30 degrees from horizontal)
    if (Math.abs(angle) < 30 || Math.abs(angle) > 150) {
      return velocity.x > 0 ? GestureType.SWIPE_RIGHT : GestureType.SWIPE_LEFT;
    }
    
    // Vertical swipes (±30 degrees from vertical)
    if (Math.abs(angle - 90) < 30 || Math.abs(angle + 90) < 30) {
      return velocity.y > 0 ? GestureType.SWIPE_DOWN : GestureType.SWIPE_UP;
    }
    
    return GestureType.NONE;
  }
}
```

## Device-Specific Touch Zone Mappings

### Screen Size Adaptations

```typescript
interface DeviceProfile {
  screenSize: 'small' | 'medium' | 'large';
  edgeThreshold: number;
  tapTargetSize: number;
  gestureDeadZone: number;
}

const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  // iPhone SE, small Android phones
  small: {
    screenSize: 'small',
    edgeThreshold: 0.25, // 25% edge zones (larger for easier access)
    tapTargetSize: 44,   // Apple HIG minimum
    gestureDeadZone: 8   // Pixels around edges to ignore
  },
  
  // iPhone 12/13/14, standard Android
  medium: {
    screenSize: 'medium', 
    edgeThreshold: 0.2,  // 20% edge zones (standard)
    tapTargetSize: 44,
    gestureDeadZone: 10
  },
  
  // iPhone 14 Plus/Pro Max, large Android
  large: {
    screenSize: 'large',
    edgeThreshold: 0.15, // 15% edge zones (smaller relative zones)
    tapTargetSize: 48,   // Slightly larger for one-handed use
    gestureDeadZone: 12
  }
};

function getDeviceProfile(): DeviceProfile {
  const { width, height } = Dimensions.get('window');
  const diagonal = Math.sqrt(width * width + height * height);
  
  if (diagonal < 1000) return DEVICE_PROFILES.small;
  if (diagonal < 1400) return DEVICE_PROFILES.medium;
  return DEVICE_PROFILES.large;
}
```

## Fallback Interaction Patterns

### Accessibility and Motor Impairment Support

```typescript
interface AccessibilityConfig {
  enableButtonFallbacks: boolean;
  increaseTapTargets: boolean;
  disableComplexGestures: boolean;
  enableVoiceControl: boolean;
}

const AccessibilityFallbacks: React.FC = () => {
  const config = useAccessibilityConfig();
  
  if (config.enableButtonFallbacks) {
    return (
      <View style={styles.buttonOverlay}>
        <TouchableOpacity 
          style={styles.decreaseButton}
          onPress={() => adjustTime(-10)}
          accessibilityLabel="Decrease time by 10 seconds"
        >
          <Text>-10s</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.playPauseButton}
          onPress={() => toggleTimer()}
          accessibilityLabel="Start or pause timer"
        >
          <Text>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.increaseButton}
          onPress={() => adjustTime(+10)}
          accessibilityLabel="Increase time by 10 seconds"
        >
          <Text>+10s</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return null; // Gesture-only interface
};
```

## Testing Validation Criteria

### Automated Testing Framework

```typescript
describe('Gesture Conflict Resolution', () => {
  const gestureResolver = new GestureResolver();
  
  describe('Edge Case Scenarios', () => {
    test('fast tap near edge should register as edge tap, not swipe start', () => {
      const events = [
        { x: 50, y: 400, timestamp: 0, velocity: { x: 0, y: 0 }, pressure: 1 },
        { x: 52, y: 402, timestamp: 150, velocity: { x: 13, y: 13 }, pressure: 0 }
      ];
      
      expect(gestureResolver.resolveGesture(events)).toBe(GestureType.EDGE_TAP_LEFT);
    });
    
    test('slow movement should not register as swipe', () => {
      const events = createSlowMovementEvents(100, 400, 200, 400, 2000);
      expect(gestureResolver.resolveGesture(events)).toBe(GestureType.NONE);
    });
    
    test('accidental brush while reaching should not trigger gesture', () => {
      const events = createAccidentalBrushEvents();
      expect(gestureResolver.resolveGesture(events)).toBe(GestureType.NONE);
    });
  });
  
  describe('Cross-Device Validation', () => {
    test.each(['iPhone_SE', 'iPhone_14', 'Pixel_7', 'Galaxy_S23'])(
      'gesture recognition on %s',
      (deviceType) => {
        mockDevice(deviceType);
        const profile = getDeviceProfile();
        const testEvents = generateStandardGestureSet(profile);
        
        testEvents.forEach(({ events, expectedGesture }) => {
          expect(gestureResolver.resolveGesture(events)).toBe(expectedGesture);
        });
      }
    );
  });
});
```

### Manual Testing Protocol

```markdown
## Manual Testing Checklist

### Phase 1: Basic Gesture Recognition (All Devices)
- [ ] Center tap starts/pauses timer
- [ ] Left edge tap decreases time by 10s
- [ ] Right edge tap increases time by 10s  
- [ ] Long press (1s) resets timer
- [ ] Double tap advances to next steep
- [ ] Horizontal swipe changes steep
- [ ] Pinch adjusts vessel size
- [ ] Twist adjusts temperature

### Phase 2: Conflict Prevention (Device-Specific)
- [ ] Fast tap near edge doesn't trigger swipe
- [ ] Slow drag doesn't trigger swipe
- [ ] Accidental touches during reaching ignored
- [ ] Multi-finger touches don't create false taps
- [ ] Rapid gesture sequences handled correctly

### Phase 3: Edge Cases
- [ ] Gestures work with phone case thickness
- [ ] Gestures work with screen protector
- [ ] One-handed operation feasible
- [ ] Wet fingers don't cause false positives
- [ ] Gloved operation (when possible)

### Phase 4: Accessibility
- [ ] VoiceOver announces gesture areas
- [ ] Alternative button controls functional
- [ ] Reduced motion settings respected
- [ ] High contrast mode doesn't break gesture zones
```

## Performance Requirements

### Response Time Targets

```typescript
const PERFORMANCE_TARGETS = {
  gestureRecognition: {
    maxLatency: 16, // milliseconds (60fps frame budget)
    averageLatency: 8, // milliseconds
    p99Latency: 32 // milliseconds
  },
  
  feedbackDelay: {
    haptic: 10,    // milliseconds
    visual: 16,    // milliseconds (1 frame)
    audio: 20      // milliseconds
  },
  
  accuracyTargets: {
    tapRecognition: 0.98,     // 98% accuracy
    swipeDirection: 0.96,     // 96% accuracy
    gestureConflicts: 0.02    // <2% false positives
  }
};
```

## Implementation Notes

### React Native Gesture Handler Integration

```typescript
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';

const TeaTimerGestureCanvas: React.FC = () => {
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onEnd((event) => {
      const gestureType = classifyTap(event);
      handleGesture(gestureType);
    });
    
  const longPressGesture = Gesture.LongPress()
    .minDuration(1000)
    .onEnd(() => {
      handleGesture(GestureType.LONG_PRESS);
    });
    
  const swipeGesture = Gesture.Pan()
    .minDistance(20)
    .onEnd((event) => {
      const gestureType = classifySwipe(event.velocityX, event.velocityY);
      handleGesture(gestureType);
    });
    
  const composedGesture = Gesture.Race(longPressGesture, Gesture.Exclusive(swipeGesture, tapGesture));
  
  return (
    <GestureDetector gesture={composedGesture}>
      <TeaAnimation />
    </GestureDetector>
  );
};
```

This specification provides the mathematical foundation and implementation guidance needed to achieve the >95% gesture recognition accuracy target while preventing conflicts across diverse device types and usage scenarios.