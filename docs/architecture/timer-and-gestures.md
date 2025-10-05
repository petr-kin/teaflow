# TeaFlow Timer and Gesture System

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Purpose:** Comprehensive guide to TeaFlow's gesture-first timer interface and interaction patterns

## Overview

TeaFlow's core innovation is a gesture-controlled timer that eliminates traditional buttons in favor of intuitive touch interactions on the brewing animation itself. This creates a zen-like experience where the interface becomes part of the meditation.

## Timer State Machine

### Core Timer States

```typescript
enum TimerState {
  IDLE = 'idle',           // Timer ready, showing duration
  RUNNING = 'running',     // Timer counting down
  PAUSED = 'paused',       // Timer paused, can resume
  COMPLETE = 'complete',   // Timer finished, showing completion
  RESETTING = 'resetting'  // Brief transition state
}

interface TimerContext {
  state: TimerState;
  durationSec: number;     // Total duration for current steep
  remainingSec: number;    // Time remaining
  steepIndex: number;      // Current infusion (0-based)
  teaProfile: TeaProfile;  // Current tea being brewed
  startTime: number;       // Timestamp when timer started
  pausedTime: number;      // Accumulated pause duration
}
```

### State Transitions

```typescript
// Primary state transitions
const timerTransitions = {
  [TimerState.IDLE]: {
    start: TimerState.RUNNING,
    reset: TimerState.IDLE,        // No-op but allowed
    adjust: TimerState.IDLE,       // Time adjustment
  },
  
  [TimerState.RUNNING]: {
    pause: TimerState.PAUSED,
    complete: TimerState.COMPLETE, // Auto-transition at T-0
    reset: TimerState.IDLE,
    adjust: TimerState.RUNNING,    // Adjust while running
  },
  
  [TimerState.PAUSED]: {
    resume: TimerState.RUNNING,
    reset: TimerState.IDLE,
    adjust: TimerState.PAUSED,     // Adjust while paused
  },
  
  [TimerState.COMPLETE]: {
    next: TimerState.IDLE,         // Next steep
    reset: TimerState.IDLE,        // Same steep again
  },
  
  [TimerState.RESETTING]: {
    // Brief state, auto-transitions to IDLE
    idle: TimerState.IDLE,
  }
};
```

### Timer Accuracy and Background Handling

```typescript
// High-precision timing with background support
class TeaTimer {
  private startTimestamp: number = 0;
  private targetEndTime: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private notificationId: string | null = null;
  
  start(durationSec: number): void {
    this.startTimestamp = Date.now();
    this.targetEndTime = this.startTimestamp + (durationSec * 1000);
    
    // Schedule backup notification
    this.scheduleNotification(durationSec);
    
    // Start high-frequency updates for UI
    this.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 100); // 100ms for smooth updates
  }
  
  private updateDisplay(): void {
    const now = Date.now();
    const remainingMs = Math.max(0, this.targetEndTime - now);
    const remainingSec = Math.floor(remainingMs / 1000);
    
    // Update UI
    this.onTimeUpdate(remainingSec);
    
    // Check for completion
    if (remainingMs === 0) {
      this.complete();
    }
  }
  
  // Handle app backgrounding/foregrounding
  onAppStateChange(nextAppState: AppStateStatus): void {
    if (nextAppState === 'active' && this.state === TimerState.RUNNING) {
      // Reconcile time when app returns to foreground
      const now = Date.now();
      const remainingMs = Math.max(0, this.targetEndTime - now);
      
      if (remainingMs === 0) {
        this.complete();
      } else {
        this.onTimeUpdate(Math.floor(remainingMs / 1000));
      }
    }
  }
  
  private scheduleNotification(durationSec: number): void {
    // T-5 warning
    if (durationSec > 5) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tea Timer',
          body: '5 seconds remaining',
          sound: 'gentle_chime.wav',
        },
        trigger: { seconds: durationSec - 5 },
      });
    }
    
    // T-0 completion
    this.notificationId = Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tea Timer Complete',
        body: 'Your tea is ready! ✨',
        sound: 'completion_bell.wav',
      },
      trigger: { seconds: durationSec },
    });
  }
}
```

## Gesture Recognition System

### Gesture Priority Hierarchy

1. **Long Press (1000ms+)** → Reset timer (highest priority)
2. **Velocity-based Swipes** → Navigation between steeps
3. **Edge Taps** → Time adjustment (-10s/+10s)
4. **Center Taps** → Play/pause toggle
5. **Multi-touch** → Advanced controls (temperature, vessel)

### Gesture Detection Algorithm

```typescript
interface GestureEvent {
  x: number;
  y: number;
  timestamp: number;
  velocity: { x: number; y: number };
  force?: number; // 3D Touch on supported devices
}

class GestureRecognizer {
  private readonly EDGE_THRESHOLD = 0.2;      // 20% of screen width
  private readonly TAP_MAX_DURATION = 200;    // milliseconds
  private readonly TAP_MAX_DISTANCE = 10;     // pixels
  private readonly LONG_PRESS_DURATION = 1000; // milliseconds
  private readonly SWIPE_MIN_VELOCITY = 300;   // pixels/second
  private readonly DIRECTIONAL_LOCK_ANGLE = 30; // degrees
  
  recognize(events: GestureEvent[]): GestureType {
    if (events.length === 0) return GestureType.NONE;
    
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const duration = lastEvent.timestamp - firstEvent.timestamp;
    const distance = this.calculateDistance(firstEvent, lastEvent);
    const velocity = this.calculateVelocity(events);
    
    // Priority 1: Long press detection
    if (duration >= this.LONG_PRESS_DURATION && distance < this.TAP_MAX_DISTANCE) {
      return GestureType.LONG_PRESS;
    }
    
    // Priority 2: Swipe detection with directional locking
    if (velocity.magnitude > this.SWIPE_MIN_VELOCITY) {
      return this.classifySwipe(velocity, firstEvent);
    }
    
    // Priority 3: Tap detection (edge vs center)
    if (duration < this.TAP_MAX_DURATION && distance < this.TAP_MAX_DISTANCE) {
      return this.classifyTap(firstEvent);
    }
    
    return GestureType.NONE;
  }
  
  private classifySwipe(velocity: Velocity, startEvent: GestureEvent): GestureType {
    const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    
    // Directional locking prevents diagonal conflicts
    const isHorizontal = Math.abs(angle) < this.DIRECTIONAL_LOCK_ANGLE || 
                        Math.abs(angle) > (180 - this.DIRECTIONAL_LOCK_ANGLE);
    const isVertical = Math.abs(angle - 90) < this.DIRECTIONAL_LOCK_ANGLE || 
                      Math.abs(angle + 90) < this.DIRECTIONAL_LOCK_ANGLE;
    
    if (isHorizontal) {
      return velocity.x > 0 ? GestureType.SWIPE_RIGHT : GestureType.SWIPE_LEFT;
    }
    
    if (isVertical) {
      return velocity.y > 0 ? GestureType.SWIPE_DOWN : GestureType.SWIPE_UP;
    }
    
    // Diagonal gestures are ignored to prevent conflicts
    return GestureType.NONE;
  }
  
  private classifyTap(event: GestureEvent): GestureType {
    const screenWidth = Dimensions.get('window').width;
    const relativeX = event.x / screenWidth;
    
    // Screen-size adaptive edge zones
    if (relativeX < this.EDGE_THRESHOLD) {
      return GestureType.EDGE_TAP_LEFT;  // -10 seconds
    }
    
    if (relativeX > (1 - this.EDGE_THRESHOLD)) {
      return GestureType.EDGE_TAP_RIGHT; // +10 seconds
    }
    
    return GestureType.CENTER_TAP; // Play/pause
  }
}
```

### Device-Specific Adaptations

```typescript
// Adaptive gesture zones based on screen size
const getGestureConfig = (): GestureConfig => {
  const { width, height } = Dimensions.get('window');
  const diagonal = Math.sqrt(width * width + height * height);
  
  // Small phones (iPhone SE, small Android)
  if (diagonal < 1000) {
    return {
      edgeThreshold: 0.25,    // Larger edge zones for easier access
      tapTargetSize: 44,      // Minimum Apple HIG size
      longPressThreshold: 800, // Shorter for small screens
    };
  }
  
  // Large phones/tablets
  if (diagonal > 1400) {
    return {
      edgeThreshold: 0.15,    // Smaller relative zones
      tapTargetSize: 48,      // Larger absolute targets
      longPressThreshold: 1200, // Longer to prevent accidental
    };
  }
  
  // Standard phones
  return {
    edgeThreshold: 0.2,
    tapTargetSize: 44,
    longPressThreshold: 1000,
  };
};
```

## Gesture Actions and Feedback

### Primary Gesture Mappings

| Gesture | Action | Visual Feedback | Haptic | Audio |
|---------|--------|----------------|--------|--------|
| **Center Tap** | Play/Pause timer | Button highlight | Light impact | Soft click |
| **Edge Tap Left** | -10 seconds | "-10s" overlay | Medium impact | Tick down |
| **Edge Tap Right** | +10 seconds | "+10s" overlay | Medium impact | Tick up |
| **Long Press** | Reset timer | Fade to initial state | Heavy impact | Confirmation chime |
| **Swipe Left** | Previous steep | Slide transition | Light impact | Page turn |
| **Swipe Right** | Next steep | Slide transition | Light impact | Page turn |
| **Swipe Up** | Increase temperature | Temp overlay | Light impact | None |
| **Swipe Down** | Decrease temperature | Temp overlay | Light impact | None |

### Feedback Implementation

```typescript
class GestureFeedback {
  // Visual feedback with animation
  showTimeAdjustment(seconds: number, position: { x: number; y: number }): void {
    const overlay = (
      <Animated.View style={[
        styles.feedbackOverlay,
        { left: position.x - 20, top: position.y - 20 }
      ]}>
        <Text style={styles.feedbackText}>
          {seconds > 0 ? '+' : ''}{seconds}s
        </Text>
      </Animated.View>
    );
    
    // Animate in, hold, fade out
    Animated.sequence([
      Animated.timing(overlay.opacity, { toValue: 1, duration: 150 }),
      Animated.delay(800),
      Animated.timing(overlay.opacity, { toValue: 0, duration: 300 }),
    ]).start();
  }
  
  // Haptic feedback with appropriate intensity
  triggerHaptic(gestureType: GestureType): void {
    switch (gestureType) {
      case GestureType.CENTER_TAP:
      case GestureType.SWIPE_LEFT:
      case GestureType.SWIPE_RIGHT:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
        
      case GestureType.EDGE_TAP_LEFT:
      case GestureType.EDGE_TAP_RIGHT:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
        
      case GestureType.LONG_PRESS:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }
  
  // Audio feedback with tea ceremony sounds
  playAudio(gestureType: GestureType): void {
    const soundMap = {
      [GestureType.CENTER_TAP]: 'soft_click.wav',
      [GestureType.EDGE_TAP_LEFT]: 'tick_down.wav',
      [GestureType.EDGE_TAP_RIGHT]: 'tick_up.wav',
      [GestureType.LONG_PRESS]: 'confirmation_chime.wav',
      [GestureType.SWIPE_LEFT]: 'page_turn.wav',
      [GestureType.SWIPE_RIGHT]: 'page_turn.wav',
    };
    
    const soundFile = soundMap[gestureType];
    if (soundFile && this.soundEnabled) {
      Audio.Sound.createAsync({ uri: soundFile })
        .then(({ sound }) => sound.playAsync())
        .catch(error => console.warn('Audio playback failed:', error));
    }
  }
}
```

## Conflict Resolution

### Common Gesture Conflicts

1. **Diagonal Swipes**: Could trigger both horizontal navigation and vertical adjustment
2. **Fast Taps Near Edges**: Might be interpreted as swipe start
3. **Accidental Touches**: During tea preparation or drinking
4. **Multi-finger Gestures**: Unintentional when setting down device

### Resolution Strategies

```typescript
class ConflictResolver {
  private gestureHistory: GestureEvent[] = [];
  private lockDirection: 'horizontal' | 'vertical' | null = null;
  private lockTimeout: NodeJS.Timeout | null = null;
  
  resolveConflict(events: GestureEvent[]): GestureType {
    // Strategy 1: Directional locking
    if (events.length > 1) {
      const direction = this.detectInitialDirection(events);
      if (direction && !this.lockDirection) {
        this.lockDirection = direction;
        this.lockTimeout = setTimeout(() => {
          this.lockDirection = null;
        }, 500); // 500ms lock duration
      }
    }
    
    // Strategy 2: Velocity thresholding
    const velocity = this.calculateVelocity(events);
    if (velocity.magnitude < this.SWIPE_MIN_VELOCITY) {
      // Too slow to be intentional swipe, treat as tap
      return this.classifyTap(events[0]);
    }
    
    // Strategy 3: Distance validation
    const distance = this.calculateDistance(events[0], events[events.length - 1]);
    if (distance < this.TAP_MAX_DISTANCE) {
      // Movement too small, definitely a tap
      return this.classifyTap(events[0]);
    }
    
    // Strategy 4: Respect directional lock
    if (this.lockDirection === 'horizontal') {
      const angle = this.calculateAngle(events);
      if (Math.abs(angle) < 45 || Math.abs(angle) > 135) {
        return this.classifyHorizontalSwipe(events);
      }
    }
    
    if (this.lockDirection === 'vertical') {
      const angle = this.calculateAngle(events);
      if (Math.abs(angle - 90) < 45 || Math.abs(angle + 90) < 45) {
        return this.classifyVerticalSwipe(events);
      }
    }
    
    return GestureType.NONE; // Ambiguous gesture, ignore
  }
  
  private detectInitialDirection(events: GestureEvent[]): 'horizontal' | 'vertical' | null {
    if (events.length < 2) return null;
    
    const dx = events[1].x - events[0].x;
    const dy = events[1].y - events[0].y;
    
    if (Math.abs(dx) > Math.abs(dy) * 1.5) {
      return 'horizontal';
    }
    
    if (Math.abs(dy) > Math.abs(dx) * 1.5) {
      return 'vertical';
    }
    
    return null; // Too ambiguous initially
  }
}
```

## Accessibility Support

### Alternative Input Methods

```typescript
// Fallback button interface for accessibility
const AccessibleTimerControls: React.FC<{ visible: boolean }> = ({ visible }) => {
  const a11ySettings = useAccessibilitySettings();
  
  if (!visible || !a11ySettings.buttonFallbacks) {
    return null;
  }
  
  return (
    <View style={styles.accessibilityControls}>
      <TouchableOpacity
        style={styles.a11yButton}
        onPress={() => adjustTime(-10)}
        accessibilityLabel="Decrease timer by 10 seconds"
        accessibilityRole="button"
      >
        <Text style={styles.a11yButtonText}>-10s</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.a11yPlayButton}
        onPress={() => toggleTimer()}
        accessibilityLabel={isRunning ? "Pause timer" : "Start timer"}
        accessibilityRole="button"
      >
        <Text style={styles.a11yButtonText}>{isRunning ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.a11yButton}
        onPress={() => adjustTime(10)}
        accessibilityLabel="Increase timer by 10 seconds"
        accessibilityRole="button"
      >
        <Text style={styles.a11yButtonText}>+10s</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.a11yResetButton}
        onPress={() => resetTimer()}
        accessibilityLabel="Reset timer"
        accessibilityRole="button"
      >
        <Text style={styles.a11yButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Voice Control Integration

```typescript
// Voice commands for hands-free operation
const useVoiceControl = () => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // iOS Shortcuts integration
      const setupSiriShortcuts = async () => {
        await SiriShortcuts.suggestShortcuts([
          {
            activityType: 'com.teaflow.start-timer',
            title: 'Start Tea Timer',
            userInfo: { action: 'start' },
            keywords: ['tea', 'timer', 'start', 'brew'],
          },
          {
            activityType: 'com.teaflow.pause-timer',
            title: 'Pause Tea Timer',
            userInfo: { action: 'pause' },
            keywords: ['tea', 'timer', 'pause', 'stop'],
          },
        ]);
      };
      
      setupSiriShortcuts();
    }
  }, []);
};
```

### Screen Reader Support

```typescript
// Dynamic accessibility announcements
const useTimerAnnouncements = (state: TimerState, remainingSec: number) => {
  const announce = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);
  
  useEffect(() => {
    switch (state) {
      case TimerState.RUNNING:
        announce(`Timer started. ${remainingSec} seconds remaining.`);
        break;
        
      case TimerState.PAUSED:
        announce(`Timer paused. ${remainingSec} seconds remaining.`);
        break;
        
      case TimerState.COMPLETE:
        announce('Timer complete. Your tea is ready.');
        break;
        
      case TimerState.IDLE:
        announce(`Timer reset. Ready to brew for ${remainingSec} seconds.`);
        break;
    }
  }, [state, announce]);
  
  // Announce time milestones
  useEffect(() => {
    if (state === TimerState.RUNNING) {
      if (remainingSec === 30) {
        announce('30 seconds remaining');
      } else if (remainingSec === 10) {
        announce('10 seconds remaining');
      } else if (remainingSec === 5) {
        announce('5 seconds');
      }
    }
  }, [remainingSec, state, announce]);
};
```

## Testing and Validation

### Gesture Testing Framework

```typescript
// Automated gesture testing
describe('Gesture Recognition', () => {
  let recognizer: GestureRecognizer;
  
  beforeEach(() => {
    recognizer = new GestureRecognizer();
  });
  
  test('recognizes center tap', () => {
    const events = [
      { x: 200, y: 400, timestamp: 0, velocity: { x: 0, y: 0 } },
      { x: 202, y: 402, timestamp: 150, velocity: { x: 13, y: 13 } },
    ];
    
    expect(recognizer.recognize(events)).toBe(GestureType.CENTER_TAP);
  });
  
  test('recognizes edge tap left', () => {
    const events = [
      { x: 50, y: 400, timestamp: 0, velocity: { x: 0, y: 0 } },
      { x: 52, y: 402, timestamp: 100, velocity: { x: 20, y: 20 } },
    ];
    
    expect(recognizer.recognize(events)).toBe(GestureType.EDGE_TAP_LEFT);
  });
  
  test('prevents diagonal swipe conflicts', () => {
    const events = [
      { x: 100, y: 300, timestamp: 0, velocity: { x: 0, y: 0 } },
      { x: 150, y: 350, timestamp: 200, velocity: { x: 250, y: 250 } },
    ];
    
    // Diagonal gesture should be ignored
    expect(recognizer.recognize(events)).toBe(GestureType.NONE);
  });
  
  test('respects long press threshold', () => {
    const events = [
      { x: 200, y: 400, timestamp: 0, velocity: { x: 0, y: 0 } },
      { x: 203, y: 402, timestamp: 1100, velocity: { x: 3, y: 2 } },
    ];
    
    expect(recognizer.recognize(events)).toBe(GestureType.LONG_PRESS);
  });
});
```

### Performance Testing

```typescript
// Gesture recognition performance monitoring
const useGesturePerformance = () => {
  const recognitionTimes = useRef<number[]>([]);
  
  const measureRecognition = useCallback((startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    recognitionTimes.current.push(duration);
    
    // Keep only last 100 measurements
    if (recognitionTimes.current.length > 100) {
      recognitionTimes.current.shift();
    }
    
    // Warn if recognition taking too long
    if (duration > 16) { // More than one frame at 60fps
      console.warn(`Slow gesture recognition: ${duration}ms`);
    }
  }, []);
  
  const getAverageRecognitionTime = useCallback(() => {
    if (recognitionTimes.current.length === 0) return 0;
    
    const sum = recognitionTimes.current.reduce((a, b) => a + b, 0);
    return sum / recognitionTimes.current.length;
  }, []);
  
  return { measureRecognition, getAverageRecognitionTime };
};
```

This comprehensive timer and gesture documentation ensures AI agents can effectively enhance and maintain TeaFlow's innovative gesture-first interface while preserving the zen-like user experience that makes it unique.