# Component Lifecycle Optimization Patterns

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Author:** Winston, the Architect  
**Purpose:** Provide specific examples of React Native component optimization patterns for TeaFlow

## Core Optimization Philosophy

### TeaFlow-Specific Performance Requirements
1. **Timer Precision** - Components must not interfere with accurate timing
2. **Animation Smoothness** - Lifecycle events cannot cause frame drops
3. **Memory Stability** - Tea session components must cleanup completely
4. **Battery Efficiency** - Minimize unnecessary re-renders during brewing

## Critical Component Patterns

### 1. Timer Component Optimization

```typescript
// HIGH-PRIORITY: Timer component must maintain precision
const TeaTimer: React.FC<TeaTimerProps> = memo(({ 
  durationSeconds, 
  isRunning, 
  onComplete,
  onTick 
}) => {
  // Stable references prevent unnecessary re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  // Memoized callback prevents child re-renders
  const handleTick = useCallback((remainingSeconds: number) => {
    onTick?.(remainingSeconds);
    
    // Complete check without re-render
    if (remainingSeconds <= 0) {
      onComplete?.();
    }
  }, [onTick, onComplete]);
  
  // Effect cleanup prevents memory leaks
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, durationSeconds - elapsed / 1000);
        handleTick(remaining);
      }, 100); // 100ms precision sufficient for UI updates
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        pausedTimeRef.current = Date.now() - startTimeRef.current;
      }
    }
    
    // Critical cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, durationSeconds, handleTick]);
  
  // Prevent re-render on every tick
  const displayTime = useMemo(() => {
    return formatTime(durationSeconds);
  }, [durationSeconds]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.timeDisplay}>{displayTime}</Text>
    </View>
  );
});

// Optimization: Only re-render when essential props change
TeaTimer.displayName = 'TeaTimer';
```

### 2. Tea Animation Component Optimization

```typescript
// CRITICAL: Animation component must maintain 30fps minimum
const TeaVisualization: React.FC<TeaVisualizationProps> = memo(({
  brewingProgress,
  teaType,
  isAnimating,
  particleCount
}) => {
  // Stable animation values prevent recreation
  const animationProgress = useSharedValue(0);
  const leafPositions = useSharedValue<Float32Array>(new Float32Array(particleCount * 2));
  
  // Reanimated worklet for optimal performance
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isAnimating ? 1 : 0.7,
      transform: [
        {
          scale: interpolate(
            animationProgress.value,
            [0, 1],
            [0.95, 1],
            Extrapolate.CLAMP
          )
        }
      ]
    };
  }, [isAnimating]);
  
  // Effect optimization: Only update when brewing progresses
  useEffect(() => {
    if (isAnimating) {
      animationProgress.value = withTiming(brewingProgress, {
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      });
    }
  }, [brewingProgress, isAnimating, animationProgress]);
  
  // Particle system optimization
  const particleSystem = useMemo(() => {
    return createParticleSystem({
      count: particleCount,
      teaType,
      bounds: { width: 300, height: 400 }
    });
  }, [particleCount, teaType]); // Only recreate when essential props change
  
  // Cleanup particle system on unmount
  useEffect(() => {
    return () => {
      particleSystem.cleanup();
    };
  }, [particleSystem]);
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Canvas style={StyleSheet.absoluteFillObject}>
        <ParticleRenderer system={particleSystem} />
      </Canvas>
    </Animated.View>
  );
});
```

### 3. Tea Library Grid Optimization

```typescript
// VIRTUALIZATION: Handle large tea collections efficiently
const TeaLibraryGrid: React.FC<TeaLibraryProps> = memo(({ teas, onSelectTea }) => {
  // VirtualizedList for performance with large collections
  const [viewableItems, setViewableItems] = useState<ViewToken[]>([]);
  
  // Memoized data to prevent unnecessary re-renders
  const teaData = useMemo(() => {
    return teas.map((tea, index) => ({
      ...tea,
      key: tea.id,
      index
    }));
  }, [teas]);
  
  // Optimized item renderer
  const renderTeaCard = useCallback(({ item, index }: ListRenderItemInfo<TeaProfile>) => {
    const isVisible = viewableItems.some(viewable => viewable.index === index);
    
    return (
      <TeaCard
        tea={item}
        onPress={onSelectTea}
        isVisible={isVisible} // Only animate visible items
        priority={index < 6 ? 'high' : 'normal'} // Prioritize above-fold items
      />
    );
  }, [viewableItems, onSelectTea]);
  
  // Viewability configuration for performance
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100
  }), []);
  
  const onViewableItemsChanged = useCallback(({ viewableItems: newViewableItems }) => {
    setViewableItems(newViewableItems);
  }, []);
  
  // Key extractor for list optimization
  const keyExtractor = useCallback((item: TeaProfile) => item.id, []);
  
  return (
    <FlatList
      data={teaData}
      renderItem={renderTeaCard}
      keyExtractor={keyExtractor}
      numColumns={2}
      maxToRenderPerBatch={6}      // Render 6 items per batch
      windowSize={10}              // Keep 10 screens of items
      initialNumToRender={6}       // Start with 6 items
      removeClippedSubviews={true} // Remove off-screen items
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(data, index) => ({
        length: 160,               // Fixed item height for optimization
        offset: 160 * index,
        index
      })}
    />
  );
});
```

### 4. Gesture Handler Optimization

```typescript
// GESTURE PERFORMANCE: High-frequency gesture handling
const GestureCanvas: React.FC<GestureCanvasProps> = memo(({ 
  onGesture, 
  children 
}) => {
  // Shared values for gesture state
  const gestureActive = useSharedValue(false);
  const lastGestureTime = useSharedValue(0);
  
  // Debounced gesture handler to prevent excessive calls
  const debouncedGestureHandler = useMemo(() => 
    debounce((gestureType: GestureType, data: GestureData) => {
      onGesture(gestureType, data);
    }, 50), // 50ms debounce for non-critical gestures
  [onGesture]);
  
  // Optimized tap gesture with worklets
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onBegin(() => {
      'worklet';
      gestureActive.value = true;
    })
    .onEnd((event) => {
      'worklet';
      gestureActive.value = false;
      
      // Run on UI thread for immediate feedback
      runOnUI(() => {
        const now = Date.now();
        const timeSinceLastGesture = now - lastGestureTime.value;
        
        // Prevent gesture spam
        if (timeSinceLastGesture > 100) {
          lastGestureTime.value = now;
          
          // Classify gesture on UI thread for performance
          const gestureType = classifyTapGesture(event.x, event.y);
          
          // Only run callback on JS thread when necessary
          runOnJS(debouncedGestureHandler)(gestureType, {
            x: event.x,
            y: event.y,
            timestamp: now
          });
        }
      })();
    });
  
  // Cleanup gesture handler
  useEffect(() => {
    return () => {
      debouncedGestureHandler.cancel();
    };
  }, [debouncedGestureHandler]);
  
  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={styles.container}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
});
```

## Advanced Optimization Patterns

### 5. Memory-Efficient Asset Loading

```typescript
// ASSET MANAGEMENT: Load tea images efficiently
const TeaImageManager = () => {
  const [loadedImages, setLoadedImages] = useState<Map<string, string>>(new Map());
  const imageCache = useRef<Map<string, ImageCacheItem>>(new Map());
  
  // LRU cache implementation for tea images
  const loadTeaImage = useCallback(async (teaId: string, priority: 'high' | 'normal' = 'normal') => {
    // Check cache first
    if (loadedImages.has(teaId)) {
      return loadedImages.get(teaId);
    }
    
    // Add to loading queue with priority
    const cacheItem: ImageCacheItem = {
      teaId,
      priority,
      loadPromise: Image.getSize(`assets/teas/${teaId}.jpg`),
      lastAccessed: Date.now()
    };
    
    imageCache.current.set(teaId, cacheItem);
    
    try {
      await cacheItem.loadPromise;
      
      // Update loaded images map
      setLoadedImages(prev => new Map(prev).set(teaId, `assets/teas/${teaId}.jpg`));
      
      // Cleanup old images if cache too large
      if (imageCache.current.size > 20) {
        await cleanupImageCache();
      }
      
    } catch (error) {
      console.warn(`Failed to load tea image: ${teaId}`, error);
      imageCache.current.delete(teaId);
    }
  }, [loadedImages]);
  
  // Cleanup least recently used images
  const cleanupImageCache = useCallback(async () => {
    const cacheEntries = Array.from(imageCache.current.entries());
    const sortedByAccess = cacheEntries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest 5 images
    const toRemove = sortedByAccess.slice(0, 5);
    
    for (const [teaId] of toRemove) {
      imageCache.current.delete(teaId);
      setLoadedImages(prev => {
        const newMap = new Map(prev);
        newMap.delete(teaId);
        return newMap;
      });
    }
  }, []);
  
  // Preload visible tea images
  const preloadVisibleTeas = useCallback(async (visibleTeaIds: string[]) => {
    const loadPromises = visibleTeaIds.map(teaId => 
      loadTeaImage(teaId, 'high')
    );
    
    await Promise.allSettled(loadPromises);
  }, [loadTeaImage]);
  
  return { loadTeaImage, preloadVisibleTeas, loadedImages };
};
```

### 6. State Update Optimization

```typescript
// ZUSTAND STORE: Optimized state management for tea data
interface TeaStoreSlice {
  // State
  teas: TeaProfile[];
  selectedTea: TeaProfile | null;
  brewingSessions: BrewSession[];
  
  // Optimized actions that prevent unnecessary re-renders
  actions: {
    selectTea: (tea: TeaProfile) => void;
    updateTea: (teaId: string, updates: Partial<TeaProfile>) => void;
    addBrewSession: (session: BrewSession) => void;
  };
}

const useTeaStore = create<TeaStoreSlice>((set, get) => ({
  teas: [],
  selectedTea: null,
  brewingSessions: [],
  
  actions: {
    // Optimized: Only update if tea actually changed
    selectTea: (tea: TeaProfile) => {
      const current = get().selectedTea;
      if (current?.id !== tea.id) {
        set({ selectedTea: tea });
      }
    },
    
    // Optimized: Update specific tea without full array recreation
    updateTea: (teaId: string, updates: Partial<TeaProfile>) => {
      set((state) => ({
        teas: state.teas.map(tea => 
          tea.id === teaId 
            ? { ...tea, ...updates }
            : tea
        ),
        // Update selectedTea if it's the one being updated
        selectedTea: state.selectedTea?.id === teaId 
          ? { ...state.selectedTea, ...updates }
          : state.selectedTea
      }));
    },
    
    // Optimized: Batch session updates to prevent multiple re-renders
    addBrewSession: (session: BrewSession) => {
      set((state) => ({
        brewingSessions: [...state.brewingSessions, session]
      }));
    }
  }
}));

// Selector hook to prevent unnecessary re-renders
const useSelectedTea = () => useTeaStore(state => state.selectedTea);
const useTeaActions = () => useTeaStore(state => state.actions);
```

## Component Testing Patterns

### 7. Performance Testing Utilities

```typescript
// TESTING: Component performance validation
export const createPerformanceTest = (ComponentUnderTest: React.ComponentType<any>) => {
  describe(`${ComponentUnderTest.displayName} Performance`, () => {
    let renderCounter = 0;
    
    // Count renders using React DevTools profiler
    const ProfiledComponent = React.memo((props) => {
      renderCounter++;
      return <ComponentUnderTest {...props} />;
    });
    
    beforeEach(() => {
      renderCounter = 0;
    });
    
    test('does not re-render unnecessarily', async () => {
      const { rerender } = render(<ProfiledComponent prop1="value1" prop2="value2" />);
      
      expect(renderCounter).toBe(1);
      
      // Same props should not cause re-render
      rerender(<ProfiledComponent prop1="value1" prop2="value2" />);
      expect(renderCounter).toBe(1);
      
      // Different props should cause re-render
      rerender(<ProfiledComponent prop1="value1" prop2="newValue" />);
      expect(renderCounter).toBe(2);
    });
    
    test('handles rapid prop changes efficiently', async () => {
      const { rerender } = render(<ProfiledComponent progress={0} />);
      
      // Simulate rapid progress updates (like brewing timer)
      for (let i = 1; i <= 100; i++) {
        rerender(<ProfiledComponent progress={i / 100} />);
        
        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Should have rendered once per unique progress value
      expect(renderCounter).toBe(101);
    });
    
    test('cleans up resources on unmount', async () => {
      const mockCleanup = jest.fn();
      
      const TestComponent = () => {
        useEffect(() => {
          return mockCleanup;
        }, []);
        
        return <ComponentUnderTest />;
      };
      
      const { unmount } = render(<TestComponent />);
      
      unmount();
      
      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
  });
};

// Usage example
createPerformanceTest(TeaTimer);
createPerformanceTest(TeaVisualization);
createPerformanceTest(TeaLibraryGrid);
```

## Debugging Performance Issues

### 8. Performance Monitoring Hooks

```typescript
// DEBUGGING: Runtime performance monitoring
export const useComponentPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Log frequent re-renders in development
    if (__DEV__ && timeSinceLastRender < 100) {
      console.warn(
        `${componentName} rendered ${renderCount.current} times. ` +
        `Last render was ${timeSinceLastRender}ms ago.`
      );
    }
    
    lastRenderTime.current = now;
  });
  
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  };
};

// Memory leak detection hook
export const useMemoryLeakDetection = (componentName: string) => {
  const timers = useRef<Set<NodeJS.Timeout>>(new Set());
  const listeners = useRef<Set<() => void>>(new Set());
  
  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    timers.current.add(timer);
  }, []);
  
  const addListener = useCallback((cleanup: () => void) => {
    listeners.current.add(cleanup);
  }, []);
  
  useEffect(() => {
    return () => {
      // Cleanup all registered timers and listeners
      timers.current.forEach(timer => clearTimeout(timer));
      listeners.current.forEach(cleanup => cleanup());
      
      if (__DEV__ && (timers.current.size > 0 || listeners.current.size > 0)) {
        console.log(`${componentName} cleaned up ${timers.current.size} timers and ${listeners.current.size} listeners`);
      }
      
      timers.current.clear();
      listeners.current.clear();
    };
  }, [componentName]);
  
  return { addTimer, addListener };
};
```

These comprehensive component lifecycle optimization patterns ensure TeaFlow maintains smooth performance during critical tea brewing sessions while providing robust debugging capabilities for ongoing optimization.