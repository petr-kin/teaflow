# Performance Baseline Matrix

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Author:** Winston, the Architect  
**Purpose:** Define specific performance targets by device tier for TeaFlow development and testing

## Device Tier Classification

### Tier Definition Algorithm

```typescript
interface DeviceCapabilities {
  ram: number;           // GB
  cpuCores: number;      // Physical cores
  gpuTier: 'low' | 'medium' | 'high';
  screenDensity: number; // DPI
  osVersion: string;
}

function classifyDevice(capabilities: DeviceCapabilities): DeviceTier {
  let score = 0;
  
  // RAM scoring (40% weight)
  if (capabilities.ram >= 8) score += 40;
  else if (capabilities.ram >= 6) score += 32;
  else if (capabilities.ram >= 4) score += 24;
  else if (capabilities.ram >= 3) score += 16;
  else score += 8;
  
  // CPU scoring (30% weight)
  if (capabilities.cpuCores >= 8) score += 30;
  else if (capabilities.cpuCores >= 6) score += 24;
  else if (capabilities.cpuCores >= 4) score += 18;
  else score += 12;
  
  // GPU scoring (20% weight)
  if (capabilities.gpuTier === 'high') score += 20;
  else if (capabilities.gpuTier === 'medium') score += 14;
  else score += 8;
  
  // Screen density bonus (10% weight)
  if (capabilities.screenDensity >= 400) score += 10;
  else if (capabilities.screenDensity >= 300) score += 7;
  else score += 4;
  
  if (score >= 80) return DeviceTier.HIGH;
  if (score >= 60) return DeviceTier.MEDIUM;
  if (score >= 40) return DeviceTier.LOW;
  return DeviceTier.MINIMUM;
}
```

### Representative Device Examples

| Tier | Example Devices | RAM | CPU | Target Year |
|------|----------------|-----|-----|-------------|
| **HIGH** | iPhone 14 Pro, Galaxy S23 Ultra, Pixel 7 Pro | 6-12GB | A16/Snapdragon 8 Gen 2 | 2022+ |
| **MEDIUM** | iPhone 12, Galaxy S21, Pixel 6 | 4-8GB | A14/Snapdragon 888 | 2020-2021 |
| **LOW** | iPhone XR, Galaxy S20 FE, Pixel 4a | 3-6GB | A12/Snapdragon 765G | 2018-2019 |
| **MINIMUM** | iPhone 8, Galaxy A50, Pixel 3a | 2-4GB | A11/Snapdragon 660 | 2016-2017 |

## Animation Performance Targets

### Frame Rate Requirements by Device Tier

```typescript
const ANIMATION_TARGETS = {
  HIGH: {
    targetFPS: 60,
    minFPS: 45,
    maxFrameDrops: 5,        // per minute
    leafParticles: 25,       // tea leaves in animation
    steamParticles: 20,      // steam effects
    effectComplexity: 1.0,   // full effects enabled
    memoryBudget: 150        // MB for animations
  },
  
  MEDIUM: {
    targetFPS: 45,
    minFPS: 30,
    maxFrameDrops: 8,
    leafParticles: 18,
    steamParticles: 15,
    effectComplexity: 0.8,   // reduced effects
    memoryBudget: 120
  },
  
  LOW: {
    targetFPS: 30,
    minFPS: 24,
    maxFrameDrops: 12,
    leafParticles: 12,
    steamParticles: 10,
    effectComplexity: 0.6,   // simplified effects
    memoryBudget: 90
  },
  
  MINIMUM: {
    targetFPS: 24,
    minFPS: 20,
    maxFrameDrops: 15,
    leafParticles: 8,
    steamParticles: 6,
    effectComplexity: 0.4,   // basic effects only
    memoryBudget: 60
  }
};
```

### Adaptive Quality System

```typescript
class PerformanceManager {
  private currentTier: DeviceTier;
  private frameHistory: number[] = [];
  private memoryPressureLevel = 0;
  
  constructor() {
    this.currentTier = this.detectDeviceTier();
    this.startPerformanceMonitoring();
  }
  
  getAnimationConfig(): AnimationConfig {
    const baseConfig = ANIMATION_TARGETS[this.currentTier];
    
    // Dynamic quality adjustment based on performance
    if (this.getAverageFPS() < baseConfig.minFPS) {
      return this.downgradeQuality(baseConfig);
    }
    
    if (this.memoryPressureLevel > 0.8) {
      return this.reduceMemoryUsage(baseConfig);
    }
    
    return baseConfig;
  }
  
  private downgradeQuality(config: AnimationConfig): AnimationConfig {
    return {
      ...config,
      leafParticles: Math.floor(config.leafParticles * 0.7),
      steamParticles: Math.floor(config.steamParticles * 0.7),
      effectComplexity: config.effectComplexity * 0.8
    };
  }
}
```

## Memory Usage Thresholds

### Memory Budget Allocation

```typescript
const MEMORY_BUDGET = {
  // Total app memory budget by device tier
  HIGH: {
    totalBudget: 200,    // MB
    animations: 60,      // 30% for animations
    textures: 40,        // 20% for textures
    audioAssets: 20,     // 10% for audio
    appState: 30,        // 15% for React Native
    systemReserve: 50    // 25% buffer for iOS/Android
  },
  
  MEDIUM: {
    totalBudget: 150,
    animations: 45,
    textures: 30,
    audioAssets: 15,
    appState: 25,
    systemReserve: 35
  },
  
  LOW: {
    totalBudget: 100,
    animations: 30,
    textures: 20,
    audioAssets: 10,
    appState: 20,
    systemReserve: 20
  },
  
  MINIMUM: {
    totalBudget: 80,
    animations: 20,
    textures: 15,
    audioAssets: 8,
    appState: 17,
    systemReserve: 20
  }
};
```

### Memory Pressure Monitoring

```typescript
class MemoryMonitor {
  private readonly WARNING_THRESHOLD = 0.75;
  private readonly CRITICAL_THRESHOLD = 0.9;
  
  async checkMemoryPressure(): Promise<MemoryPressureLevel> {
    const usage = await this.getCurrentMemoryUsage();
    const budget = MEMORY_BUDGET[this.deviceTier].totalBudget;
    const pressure = usage / budget;
    
    if (pressure > this.CRITICAL_THRESHOLD) {
      this.triggerMemoryCleanup();
      return MemoryPressureLevel.CRITICAL;
    }
    
    if (pressure > this.WARNING_THRESHOLD) {
      this.reduceNonEssentialAssets();
      return MemoryPressureLevel.WARNING;
    }
    
    return MemoryPressureLevel.NORMAL;
  }
  
  private async triggerMemoryCleanup(): Promise<void> {
    // Aggressive cleanup for memory pressure
    await this.clearTextureCache();
    await this.pauseNonVisibleAnimations();
    await this.reduceParticleCount();
    this.requestGarbageCollection();
  }
}
```

## Battery Drain Acceptable Limits

### Power Consumption Targets

```typescript
const BATTERY_TARGETS = {
  // Battery drain per 3-minute brewing session
  perSession: {
    HIGH: 0.8,      // % battery drain (ample power budget)
    MEDIUM: 1.2,    // % battery drain
    LOW: 1.5,       // % battery drain
    MINIMUM: 2.0    // % battery drain (accept higher drain)
  },
  
  // Hourly drain during active use
  hourlyActive: {
    HIGH: 8,        // % per hour
    MEDIUM: 12,     // % per hour
    LOW: 15,        // % per hour
    MINIMUM: 20     // % per hour
  },
  
  // Background drain (timer running, app backgrounded)
  backgroundHourly: {
    ALL_TIERS: 0.5  // % per hour (critical - brewing cannot drain battery)
  }
};
```

### Power Optimization Strategies

```typescript
class PowerManager {
  private isBackgrounded = false;
  private batteryLevel = 1.0;
  
  optimizeForBatteryLevel(level: number): void {
    this.batteryLevel = level;
    
    if (level < 0.15) {
      // Critical battery - minimal features only
      this.enableLowPowerMode();
    } else if (level < 0.30) {
      // Low battery - reduce non-essential animations
      this.reduceAnimationComplexity(0.5);
    }
  }
  
  onAppBackgrounded(): void {
    this.isBackgrounded = true;
    
    // Immediately reduce power consumption
    this.pauseVisualAnimations();
    this.reduceTimerUpdateFrequency();
    this.suspendNonEssentialServices();
  }
  
  private enableLowPowerMode(): void {
    // Drastic power saving measures
    this.disableAnimations();
    this.useMinimalUI();
    this.reduceHapticFeedback();
    this.lowerAudioQuality();
  }
}
```

## Timer Drift Tolerance by Platform

### Precision Requirements

```typescript
const TIMER_PRECISION_TARGETS = {
  iOS: {
    maxDriftPerMinute: 0.1,    // seconds (iOS typically more precise)
    maxCumulativeDrift: 0.5,   // seconds over 10 minutes
    measurementMethod: 'CFAbsoluteTimeGetCurrent',
    backgroundAccuracy: 0.2    // seconds (iOS background limitations)
  },
  
  Android: {
    maxDriftPerMinute: 0.2,    // seconds (Android more variable)
    maxCumulativeDrift: 1.0,   // seconds over 10 minutes
    measurementMethod: 'System.nanoTime',
    backgroundAccuracy: 0.5    // seconds (Android background restrictions)
  }
};
```

### Timer Accuracy Testing Protocol

```typescript
class TimerAccuracyTester {
  async validateTimerAccuracy(deviceInfo: DeviceInfo): Promise<TimerAccuracyResult> {
    const tests = [
      { duration: 30, iterations: 10 },   // 30-second tests
      { duration: 180, iterations: 5 },   // 3-minute tests (typical brewing)
      { duration: 600, iterations: 2 }    // 10-minute tests (long steeps)
    ];
    
    const results: TestResult[] = [];
    
    for (const test of tests) {
      for (let i = 0; i < test.iterations; i++) {
        const result = await this.runSingleTimerTest(test.duration);
        results.push(result);
        
        // Test under various conditions
        await this.runWithBackgroundTransition(test.duration);
        await this.runWithMemoryPressure(test.duration);
        await this.runWithCPULoad(test.duration);
      }
    }
    
    return this.analyzeResults(results);
  }
  
  private async runSingleTimerTest(durationSeconds: number): Promise<TestResult> {
    const startTime = this.getHighPrecisionTime();
    const expectedEndTime = startTime + (durationSeconds * 1000);
    
    // Start TeaFlow timer
    const timerPromise = this.startTeaFlowTimer(durationSeconds);
    
    // Wait for completion
    await timerPromise;
    
    const actualEndTime = this.getHighPrecisionTime();
    const drift = Math.abs(actualEndTime - expectedEndTime);
    
    return {
      expectedDuration: durationSeconds * 1000,
      actualDuration: actualEndTime - startTime,
      drift,
      driftPerMinute: (drift / durationSeconds) * 60,
      passed: drift <= this.getMaxAllowedDrift(durationSeconds)
    };
  }
}
```

## Performance Testing Framework

### Automated Benchmarking

```typescript
describe('Performance Baseline Validation', () => {
  let deviceTier: DeviceTier;
  let performanceTargets: AnimationConfig;
  
  beforeAll(async () => {
    deviceTier = await classifyCurrentDevice();
    performanceTargets = ANIMATION_TARGETS[deviceTier];
  });
  
  describe('Animation Performance', () => {
    test('maintains target FPS during 3-minute brew session', async () => {
      const monitor = new PerformanceMonitor();
      
      // Start brewing session with full animations
      await startBrewingSession({
        duration: 180,
        teaType: 'green',
        enableAllAnimations: true
      });
      
      // Monitor for full duration
      const fpsData = await monitor.collectFPSData(180000);
      
      expect(fpsData.averageFPS).toBeGreaterThanOrEqual(performanceTargets.minFPS);
      expect(fpsData.frameDrops).toBeLessThanOrEqual(performanceTargets.maxFrameDrops);
    });
    
    test('memory usage stays within budget', async () => {
      const memoryMonitor = new MemoryMonitor();
      const baseline = await memoryMonitor.getCurrentUsage();
      
      await startBrewingSession({ duration: 180 });
      
      const peakUsage = await memoryMonitor.getPeakUsage();
      const memoryIncrease = peakUsage - baseline;
      
      expect(memoryIncrease).toBeLessThanOrEqual(MEMORY_BUDGET[deviceTier].animations);
    });
  });
  
  describe('Timer Accuracy', () => {
    test.each([30, 180, 600])('timer accuracy for %d second duration', async (duration) => {
      const tester = new TimerAccuracyTester();
      const result = await tester.runSingleTimerTest(duration);
      
      const maxDrift = TIMER_PRECISION_TARGETS[Platform.OS].maxDriftPerMinute;
      expect(result.driftPerMinute).toBeLessThanOrEqual(maxDrift);
    });
  });
  
  describe('Battery Consumption', () => {
    test('battery drain within acceptable limits', async () => {
      const batteryMonitor = new BatteryMonitor();
      const initialLevel = await batteryMonitor.getCurrentLevel();
      
      await startBrewingSession({ duration: 180 });
      
      const finalLevel = await batteryMonitor.getCurrentLevel();
      const drainPercent = (initialLevel - finalLevel) * 100;
      
      expect(drainPercent).toBeLessThanOrEqual(BATTERY_TARGETS.perSession[deviceTier]);
    });
  });
});
```

## Device-Specific Optimization Rules

### iOS Optimizations

```typescript
const iOS_OPTIMIZATIONS = {
  // Take advantage of iOS Metal performance
  useMetalAcceleration: true,
  
  // iOS-specific memory management
  enableAutomaticMemoryManagement: true,
  
  // Background timer precision
  useBackgroundTaskAssertions: true,
  
  // Battery optimization
  respectLowPowerMode: true,
  
  // iOS 15+ performance features
  useSharedTimerCoalescing: true
};
```

### Android Optimizations

```typescript
const ANDROID_OPTIMIZATIONS = {
  // Handle Android doze mode
  enableDozeWhitelisting: false, // Respect battery optimization
  
  // Android-specific rendering
  useVulkanWhenAvailable: true,
  
  // Background processing
  useForegroundServiceForTimer: true,
  
  // Memory management
  enableManualGarbageCollection: true,
  
  // Performance per manufacturer
  applyVendorSpecificOptimizations: {
    samsung: { reduceAnimationComplexity: 0.9 },
    xiaomi: { increaseMemoryBuffer: 1.2 },
    oneplus: { enableHighRefreshOptimization: true }
  }
};
```

This comprehensive performance baseline matrix provides concrete targets and implementation guidance for achieving optimal performance across the full range of supported devices while maintaining the zen tea brewing experience.