# Screen Transition Animations Specification

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Author:** Winston, the Architect  
**Purpose:** Define detailed screen transition animations that maintain TeaFlow's zen philosophy

## Tea-Inspired Transition Philosophy

### Core Animation Principles
1. **Organic Flow** - Transitions mimic natural tea brewing processes
2. **Zen Timing** - Unhurried, meditative pacing (never rushed)
3. **Cultural Authenticity** - Inspired by Japanese tea ceremony movements
4. **Functional Beauty** - Each transition serves the user's brewing journey

## Navigation Transition Specifications

### Primary Navigation Flow

```typescript
// Tea ceremony-inspired navigation timing
const TRANSITION_TIMING = {
  // Based on actual tea ceremony movements
  gentle: 800,     // Lifting tea cup (Home → Timer)
  flowing: 600,    // Pouring water (Timer → Library)  
  settling: 1000,  // Tea settling (Library → Settings)
  returning: 500,  // Returning to focus (Back transitions)
  
  // Gesture-triggered transitions (faster)
  swipeTriggered: 400,
  
  // Modal transitions (overlay context)
  modalPresent: 300,
  modalDismiss: 250
};

const TRANSITION_EASINGS = {
  // Custom bezier curves inspired by tea pouring
  teaFlow: 'cubic-bezier(0.165, 0.84, 0.44, 1)',      // Main navigation
  waterPour: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // Smooth entry
  steamRise: 'cubic-bezier(0.19, 1, 0.22, 1)',        // Gentle exit
  leafSettle: 'cubic-bezier(0.55, 0, 1, 0.45)'        // Quick return
};
```

### Screen-Specific Transition Patterns

#### Home → Timer Transition (Most Critical)
```typescript
// "Lifting the tea cup" - User's focus shifts to brewing
const HomeToTimerTransition = {
  duration: TRANSITION_TIMING.gentle, // 800ms
  easing: TRANSITION_EASINGS.teaFlow,
  
  // Home screen exit animation
  homeExit: {
    // Tea grid fades and scales down like steam dissipating
    teaGrid: {
      opacity: 1 → 0,
      scale: 1 → 0.85,
      translateY: 0 → -30,
      stagger: 50 // Each tea card animates 50ms after previous
    },
    
    // Background shifts from selection to focus mode
    background: {
      saturation: 1 → 0.7,     // Slightly desaturated
      brightness: 1 → 0.9      // Slightly dimmed for focus
    }
  },
  
  // Timer screen enter animation  
  timerEnter: {
    // Main tea animation grows from center like blooming flower
    teaVisualization: {
      opacity: 0 → 1,
      scale: 0.3 → 1,
      rotate: -5° → 0°,       // Gentle settling rotation
      timing: 'delayed 200ms'  // After home grid disappears
    },
    
    // Timer controls fade in gently
    gestureZones: {
      opacity: 0 → 0.8,       // Subtle visibility
      timing: 'delayed 400ms'
    },
    
    // Brewing parameters slide up from bottom
    brewingInfo: {
      translateY: 50 → 0,
      opacity: 0 → 1,
      timing: 'delayed 300ms'
    }
  }
};
```

#### Timer → Library Transition
```typescript
// "Reviewing tea collection" - Contemplative browsing
const TimerToLibraryTransition = {
  duration: TRANSITION_TIMING.flowing, // 600ms
  easing: TRANSITION_EASINGS.waterPour,
  
  timerExit: {
    // Tea animation shrinks to thumbnail size
    teaVisualization: {
      scale: 1 → 0.3,
      translateX: 0 → -120,   // Moves to library card position
      opacity: 1 → 0.7
    },
    
    // Gesture zones fade out
    gestureZones: {
      opacity: 0.8 → 0
    }
  },
  
  libraryEnter: {
    // Library grid materializes like tea leaves settling
    teaCollection: {
      opacity: 0 → 1,
      scale: 0.9 → 1,
      stagger: 30,            // Faster than home transition
      ease: 'steamRise'
    },
    
    // Current tea highlighted with gentle glow
    currentTeaCard: {
      shadowOpacity: 0 → 0.3,
      shadowRadius: 0 → 8,
      borderWidth: 0 → 2,
      borderColor: 'transparent' → 'teaGreen'
    }
  }
};
```

#### Modal Presentations (OCR Scanner, Settings)
```typescript
// "Opening tea ceremony tools" - Quick but respectful
const ModalTransitions = {
  // OCR Scanner modal
  cameraModal: {
    duration: TRANSITION_TIMING.modalPresent, // 300ms
    
    // Backdrop appears with gentle fade
    backdrop: {
      opacity: 0 → 0.8,
      backgroundColor: 'black'
    },
    
    // Camera view slides up from bottom like scroll unrolling
    cameraView: {
      translateY: '100%' → 0,
      opacity: 0.8 → 1,
      borderTopRadius: 0 → 16,
      ease: 'waterPour'
    },
    
    // Camera controls fade in after view settles
    controls: {
      opacity: 0 → 1,
      translateY: 20 → 0,
      timing: 'delayed 150ms'
    }
  },
  
  // Settings modal  
  settingsModal: {
    duration: TRANSITION_TIMING.modalPresent,
    
    // Settings panel slides from right like opening cabinet
    settingsPanel: {
      translateX: '100%' → 0,
      opacity: 0.9 → 1,
      ease: 'teaFlow'
    },
    
    // Options appear with gentle stagger
    settingItems: {
      opacity: 0 → 1,
      translateX: 30 → 0,
      stagger: 40,
      timing: 'delayed 100ms'
    }
  }
};
```

## Gesture-Triggered Transitions

### Swipe Navigation Animations
```typescript
// Horizontal swipes between steeps
const SteepTransitions = {
  duration: TRANSITION_TIMING.swipeTriggered, // 400ms
  
  // Previous steep slides out left, next steep slides in right
  swipeLeft: {
    currentSteep: {
      translateX: 0 → '-100%',
      opacity: 1 → 0.3,
      scale: 1 → 0.9
    },
    nextSteep: {
      translateX: '100%' → 0,
      opacity: 0.3 → 1,
      scale: 0.9 → 1
    }
  },
  
  // Reverse for swipe right
  swipeRight: {
    // Mirror of swipeLeft with opposite directions
    currentSteep: {
      translateX: 0 → '100%',
      opacity: 1 → 0.3,
      scale: 1 → 0.9
    },
    previousSteep: {
      translateX: '-100%' → 0,
      opacity: 0.3 → 1,
      scale: 0.9 → 1
    }
  }
};
```

## Animation Performance Optimization

### Memory-Efficient Transition System
```typescript
class TransitionManager {
  private activeTransitions = new Map<string, Animation>();
  private preloadedAnimations = new Map<string, AnimationConfig>();
  
  // Preload critical transitions during app launch
  async preloadCriticalTransitions(): Promise<void> {
    const critical = [
      'home_to_timer',
      'timer_back_to_home',
      'modal_dismiss'
    ];
    
    for (const transitionId of critical) {
      const config = await this.loadTransitionConfig(transitionId);
      this.preloadedAnimations.set(transitionId, config);
    }
  }
  
  // Execute transition with automatic cleanup
  async executeTransition(
    from: ScreenName, 
    to: ScreenName, 
    trigger: 'navigation' | 'gesture' | 'modal'
  ): Promise<void> {
    const transitionId = `${from}_to_${to}`;
    
    // Use preloaded config if available
    const config = this.preloadedAnimations.get(transitionId) 
      || await this.loadTransitionConfig(transitionId);
    
    // Execute with performance monitoring
    const startTime = performance.now();
    
    try {
      await this.runTransitionAnimation(config);
    } finally {
      // Cleanup and performance logging
      this.activeTransitions.delete(transitionId);
      const duration = performance.now() - startTime;
      this.logTransitionPerformance(transitionId, duration);
    }
  }
  
  // Adaptive quality based on device performance
  private adaptTransitionToDevice(config: AnimationConfig): AnimationConfig {
    const deviceTier = getDevicePerformanceTier();
    
    if (deviceTier === DeviceTier.LOW || deviceTier === DeviceTier.MINIMUM) {
      return {
        ...config,
        duration: config.duration * 0.7,  // Faster transitions
        disableParallax: true,            // Remove expensive effects
        reduceStagger: true               // Less staggered animations
      };
    }
    
    return config;
  }
}
```

## React Navigation Integration

### Custom Transition Configuration
```typescript
// React Navigation screen options with tea-inspired transitions
const screenOptions = {
  // Home → Timer (critical path)
  Timer: {
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
                extrapolate: 'clamp'
              })
            },
            {
              rotate: current.progress.interpolate({
                inputRange: [0, 1], 
                outputRange: ['-5deg', '0deg'],
                extrapolate: 'clamp'
              })
            }
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0, 0.7, 1],
            extrapolate: 'clamp'
          })
        }
      };
    },
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: TRANSITION_TIMING.gentle,
          easing: Easing.bezier(0.165, 0.84, 0.44, 1) // teaFlow curve
        }
      },
      close: {
        animation: 'timing', 
        config: {
          duration: TRANSITION_TIMING.returning,
          easing: Easing.bezier(0.55, 0, 1, 0.45) // leafSettle curve
        }
      }
    }
  },
  
  // Library screen
  Library: {
    cardStyleInterpolator: ({ current }) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
              extrapolate: 'clamp'
            })
          }
        ]
      }
    }),
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: TRANSITION_TIMING.flowing,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) // waterPour curve
        }
      }
    }
  }
};
```

## Accessibility Considerations

### Reduced Motion Support
```typescript
// Respect user's reduced motion preferences
const TransitionAccessibility = () => {
  const reducedMotion = useReducedMotion();
  
  const getAccessibleTransition = (standard: TransitionConfig): TransitionConfig => {
    if (reducedMotion) {
      return {
        ...standard,
        duration: 150,        // Much faster
        disableScale: true,   // No scaling animations
        disableRotation: true,// No rotation
        fadeOnly: true        // Simple opacity transitions only
      };
    }
    
    return standard;
  };
  
  return { getAccessibleTransition };
};
```

## Performance Monitoring

### Transition Performance Metrics
```typescript
interface TransitionMetrics {
  transitionId: string;
  actualDuration: number;
  targetDuration: number;
  frameDrops: number;
  memoryDelta: number;
  userTriggered: boolean;
}

class TransitionPerformanceMonitor {
  private metrics: TransitionMetrics[] = [];
  
  trackTransition(config: TransitionConfig): Promise<TransitionMetrics> {
    return new Promise((resolve) => {
      const startMemory = performance.memory?.usedJSHeapSize || 0;
      const startTime = performance.now();
      let frameDrops = 0;
      
      // Monitor frame rate during transition
      const frameMonitor = setInterval(() => {
        if (this.getCurrentFPS() < 24) {
          frameDrops++;
        }
      }, 16);
      
      // Cleanup after transition completes
      setTimeout(() => {
        clearInterval(frameMonitor);
        
        const metrics: TransitionMetrics = {
          transitionId: config.id,
          actualDuration: performance.now() - startTime,
          targetDuration: config.duration,
          frameDrops,
          memoryDelta: (performance.memory?.usedJSHeapSize || 0) - startMemory,
          userTriggered: config.trigger === 'gesture'
        };
        
        this.metrics.push(metrics);
        resolve(metrics);
      }, config.duration + 100);
    });
  }
}
```

This comprehensive screen transition specification ensures TeaFlow maintains its zen philosophy while providing smooth, performant navigation that feels natural and meditative to tea enthusiasts.