# Living Tea Metaphor Animations

**Responsibility:** Renders SVG-based tea brewing visualizations layered over video backgrounds for enhanced zen experience

**Key Interfaces:**
- renderTeaLeafDrift(intensity: number): JSX.Element
- updateSteamWisps(phase: BrewingPhase): void
- animateColorInfusion(progress: number, teaType: string): void
- setMetaphorComplexity(level: 'minimal' | 'rich'): void

**Dependencies:** React Native Skia, React Native SVG, device performance detection

**Technology Stack:** Vector-based SVG animations, Skia particle effects, 30fps target for zen experience, adaptive complexity

**Layered Animation Architecture (MISSING CRITICAL SYSTEM!):**
```typescript
// Proven hybrid architecture from reliable-animation-architecture.md
interface LayeredAnimationSystem {
  gestureLayer: {
    component: 'react-native-gesture-handler';
    type: 'transparent overlay';
    responsibility: 'touch detection without blocking animations';
    gestures: ['edgeTap', 'centerTap', 'pinch', 'twist', 'longPress'];
  };
  
  feedbackLayer: {
    component: 'subtle overlays';
    type: 'visual response';
    responsibility: 'gesture confirmation and parameter changes';
    effects: ['touchGlow', 'parameterAdjustments', 'stateTransitions'];
  };
  
  animationLayer: {
    component: 'SVG + react-native-reanimated';
    type: 'core tea metaphor';
    responsibility: 'living tea animations with natural variability';
    elements: ['teaLeaves', 'steamWisps', 'hourglassSand', 'colorProgression'];
  };
  
  backgroundLayer: {
    component: 'video or static backgrounds';
    type: 'tea ambiance';
    responsibility: 'tea-specific visual context';
    content: ['teaVideos', 'zenGradients', 'subtleTextures'];
  };
}
```

**Animation Phase Parameters (Gesture-Controllable):**
```typescript
// Dynamic intensity phases mapped to brew cycle
interface TeaAnimationPhases {
  start_0_to_20_percent: {
    leafSpeed: 0.3;      // Slow drift
    steamIntensity: 0.1; // Barely visible  
    sandFlowRate: 0.5;   // Gentle fall
    colorSaturation: 0.2; // Pale tea color
  };
  
  midBrew_20_to_80_percent: {
    leafSpeed: 0.7;      // Faster swirling
    steamIntensity: 0.6; // More visible wisps
    sandFlowRate: 1.0;   // Active flow
    colorSaturation: 0.7; // Rich tea color  
  };
  
  finish_80_to_100_percent: {
    leafSpeed: 0.2;      // Settling down
    steamIntensity: 0.3; // Fading steam
    sandFlowRate: 0.3;   // Slowing flow
    colorSaturation: 0.9; // Full saturation
  };
}
```

**Cross-Platform Performance Optimization:**
```typescript
class PerformanceOptimizer {
  // Device-tier specific animation complexity
  getAnimationComplexity(deviceTier: 'low' | 'medium' | 'high'): number {
    return {
      low: 0.5,     // Reduced particle count, simplified effects
      medium: 0.75, // Standard effects with optimizations
      high: 1.0     // Full visual fidelity
    }[deviceTier];
  }
  
  // Platform-specific optimizations
  optimizeForPlatform(platform: 'ios' | 'android') {
    if (platform === 'android') {
      this.targetFPS = 30; // Plan for potential stutter
      this.enableBatteryOptimizations = true;
    } else {
      this.targetFPS = 60; // iOS can handle higher performance
      this.enableBatteryOptimizations = false;
    }
  }
}
```

**Performance-Adaptive Rendering System:**
```typescript
// Device capability detection and adaptation
class PerformanceAdaptiveRenderer {
  private deviceTier: 'low' | 'medium' | 'high';
  private frameRateTarget: number;
  
  constructor() {
    this.deviceTier = this.detectDeviceCapability();
    this.frameRateTarget = this.deviceTier === 'low' ? 30 : 60;
  }
  
  private detectDeviceCapability(): DeviceTier {
    const { totalMemory, cpuCores, gpuModel } = getDeviceSpecs();
    
    if (totalMemory < 2048 || cpuCores < 4) return 'low';
    if (totalMemory < 4096 || !hasModernGPU(gpuModel)) return 'medium';
    return 'high';
  }
  
  getAnimationComplexity(): number {
    return {
      low: 0.5,     // Reduced particle count, simplified effects
      medium: 0.75, // Standard effects with some optimizations
      high: 1.0     // Full visual fidelity
    }[this.deviceTier];
  }
  
  // Dynamic quality adjustment based on performance
  adaptQualityDynamically(currentFPS: number) {
    if (currentFPS < this.frameRateTarget * 0.8) {
      this.reduceComplexity();
    } else if (currentFPS > this.frameRateTarget * 0.95 && this.canIncreaseQuality()) {
      this.increaseComplexity();
    }
  }
}
```

**Adaptive Rendering Strategies:**
- **Low-tier devices:** Simple SVG animations, reduced particle counts, 30fps target
- **Medium-tier devices:** Standard effects with selective optimization, 45fps target  
- **High-tier devices:** Full visual fidelity, complex particle systems, 60fps target
- **Dynamic adaptation:** Real-time quality adjustment based on frame rate monitoring
