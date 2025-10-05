/**
 * Animation Fallback System for TeaFlow Phase 1
 * 
 * Provides graceful degradation for tea-inspired animations when:
 * - Device performance is insufficient (<30fps)
 * - Memory pressure detected
 * - User preference for reduced motion
 * - Cross-platform compatibility issues
 */

import { Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AnimationLevel = 'full' | 'reduced' | 'minimal' | 'disabled';
export type PerformanceTier = 'high' | 'medium' | 'low';

export interface AnimationConfig {
  level: AnimationLevel;
  teaLeafCount: number;
  steamIntensity: number;
  frameRate: number;
  enableComplexEasing: boolean;
  enableParticleEffects: boolean;
  enableColorTransitions: boolean;
}

class AnimationFallbackSystem {
  private static instance: AnimationFallbackSystem;
  private currentLevel: AnimationLevel = 'full';
  private performanceTier: PerformanceTier = 'medium';
  private monitoringEnabled: boolean = true;
  private performanceHistory: number[] = [];
  private memoryWarnings: number = 0;

  static getInstance(): AnimationFallbackSystem {
    if (!AnimationFallbackSystem.instance) {
      AnimationFallbackSystem.instance = new AnimationFallbackSystem();
    }
    return AnimationFallbackSystem.instance;
  }

  async initialize(): Promise<void> {
    // Check for reduced motion preference
    const reducedMotionPref = await AsyncStorage.getItem('teaflow:reduced-motion');
    if (reducedMotionPref === 'true') {
      this.setAnimationLevel('minimal');
      return;
    }

    // Detect device performance tier
    this.performanceTier = this.detectPerformanceTier();
    
    // Set initial animation level based on device capabilities
    const initialLevel = this.getRecommendedLevelForTier(this.performanceTier);
    this.setAnimationLevel(initialLevel);

    // Start performance monitoring
    if (this.monitoringEnabled) {
      this.startPerformanceMonitoring();
    }

    console.log(`Animation system initialized: ${this.currentLevel} (${this.performanceTier} tier device)`);
  }

  private detectPerformanceTier(): PerformanceTier {
    const { width, height } = Dimensions.get('window');
    const pixelCount = width * height;

    if (Platform.OS === 'web') {
      // Web performance detection
      const hardwareConcurrency = (navigator as any).hardwareConcurrency || 2;
      const memory = (performance as any).memory?.usedJSHeapSize || 50000000;
      
      if (hardwareConcurrency >= 8 && pixelCount >= 1440 * 900) return 'high';
      if (hardwareConcurrency >= 4 && pixelCount >= 1080 * 720) return 'medium';
      return 'low';
    }

    if (Platform.OS === 'ios') {
      // iOS device detection based on screen resolution and known devices
      if (pixelCount >= 1179 * 2556) return 'high'; // iPhone 14 Pro and newer
      if (pixelCount >= 828 * 1792) return 'medium'; // iPhone XR and newer
      return 'low'; // Older devices
    }

    if (Platform.OS === 'android') {
      // Android performance estimation
      if (pixelCount >= 1440 * 3120) return 'high'; // Flagship devices
      if (pixelCount >= 1080 * 2340) return 'medium'; // Mid-range devices
      return 'low'; // Budget devices
    }

    return 'medium'; // Default fallback
  }

  private getRecommendedLevelForTier(tier: PerformanceTier): AnimationLevel {
    switch (tier) {
      case 'high': return 'full';
      case 'medium': return 'reduced';
      case 'low': return 'minimal';
      default: return 'reduced';
    }
  }

  getAnimationConfig(): AnimationConfig {
    switch (this.currentLevel) {
      case 'full':
        return {
          level: 'full',
          teaLeafCount: 20,
          steamIntensity: 1.0,
          frameRate: 60,
          enableComplexEasing: true,
          enableParticleEffects: true,
          enableColorTransitions: true
        };

      case 'reduced':
        return {
          level: 'reduced',
          teaLeafCount: 10,
          steamIntensity: 0.6,
          frameRate: 30,
          enableComplexEasing: true,
          enableParticleEffects: false,
          enableColorTransitions: true
        };

      case 'minimal':
        return {
          level: 'minimal',
          teaLeafCount: 3,
          steamIntensity: 0.3,
          frameRate: 15,
          enableComplexEasing: false,
          enableParticleEffects: false,
          enableColorTransitions: false
        };

      case 'disabled':
        return {
          level: 'disabled',
          teaLeafCount: 0,
          steamIntensity: 0,
          frameRate: 0,
          enableComplexEasing: false,
          enableParticleEffects: false,
          enableColorTransitions: false
        };

      default:
        return this.getAnimationConfig(); // Recursive call with valid level
    }
  }

  setAnimationLevel(level: AnimationLevel): void {
    const previousLevel = this.currentLevel;
    this.currentLevel = level;

    // Persist user preference
    AsyncStorage.setItem('teaflow:animation-level', level);

    if (previousLevel !== level) {
      console.log(`Animation level changed: ${previousLevel} → ${level}`);
    }
  }

  private startPerformanceMonitoring(): void {
    // Monitor frame rate and adjust animations accordingly
    let frameCount = 0;
    let lastTime = performance.now();

    const monitorPerformance = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 1000) { // Check every second
        const fps = Math.round((frameCount * 1000) / deltaTime);
        this.recordPerformance(fps);
        frameCount = 0;
        lastTime = currentTime;
      } else {
        frameCount++;
      }

      if (this.monitoringEnabled) {
        requestAnimationFrame(monitorPerformance);
      }
    };

    requestAnimationFrame(monitorPerformance);

    // Monitor memory pressure (if available)
    if (Platform.OS === 'web' && (performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        if (memoryUsage > 0.8) { // 80% memory usage
          this.handleMemoryPressure();
        }
      }, 5000); // Check every 5 seconds
    }
  }

  private recordPerformance(fps: number): void {
    this.performanceHistory.push(fps);
    
    // Keep only last 10 measurements
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }

    // Calculate average FPS
    const avgFps = this.performanceHistory.reduce((sum, fps) => sum + fps, 0) / this.performanceHistory.length;

    // Auto-adjust animation level based on performance
    if (avgFps < 20 && this.currentLevel === 'full') {
      console.warn(`Performance degraded (${avgFps}fps), reducing to 'reduced' animations`);
      this.setAnimationLevel('reduced');
    } else if (avgFps < 15 && this.currentLevel === 'reduced') {
      console.warn(`Performance critical (${avgFps}fps), reducing to 'minimal' animations`);
      this.setAnimationLevel('minimal');
    } else if (avgFps < 10 && this.currentLevel === 'minimal') {
      console.error(`Performance critical (${avgFps}fps), disabling animations`);
      this.setAnimationLevel('disabled');
    }
    
    // Recovery: improve animation level if performance is good
    else if (avgFps > 45 && this.currentLevel === 'reduced' && this.performanceTier === 'high') {
      console.log(`Performance recovered (${avgFps}fps), upgrading to 'full' animations`);
      this.setAnimationLevel('full');
    } else if (avgFps > 25 && this.currentLevel === 'minimal' && this.performanceTier !== 'low') {
      console.log(`Performance improved (${avgFps}fps), upgrading to 'reduced' animations`);
      this.setAnimationLevel('reduced');
    } else if (avgFps > 15 && this.currentLevel === 'disabled') {
      console.log(`Performance recovered (${avgFps}fps), enabling 'minimal' animations`);
      this.setAnimationLevel('minimal');
    }
  }

  private handleMemoryPressure(): void {
    this.memoryWarnings++;
    console.warn(`Memory pressure detected (warning #${this.memoryWarnings})`);

    // Reduce animations on repeated memory warnings
    if (this.memoryWarnings >= 2 && this.currentLevel === 'full') {
      this.setAnimationLevel('reduced');
    } else if (this.memoryWarnings >= 4 && this.currentLevel === 'reduced') {
      this.setAnimationLevel('minimal');
    } else if (this.memoryWarnings >= 6) {
      this.setAnimationLevel('disabled');
    }
  }

  // Manual controls for user preferences
  async setReducedMotion(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem('teaflow:reduced-motion', enabled.toString());
    
    if (enabled) {
      this.setAnimationLevel('minimal');
    } else {
      const recommendedLevel = this.getRecommendedLevelForTier(this.performanceTier);
      this.setAnimationLevel(recommendedLevel);
    }
  }

  getCurrentLevel(): AnimationLevel {
    return this.currentLevel;
  }

  getPerformanceTier(): PerformanceTier {
    return this.performanceTier;
  }

  // Utility methods for components
  shouldUseComplexEasing(): boolean {
    return this.getAnimationConfig().enableComplexEasing;
  }

  getTeaLeafCount(): number {
    return this.getAnimationConfig().teaLeafCount;
  }

  getSteamIntensity(): number {
    return this.getAnimationConfig().steamIntensity;
  }

  getTargetFrameRate(): number {
    return this.getAnimationConfig().frameRate;
  }

  shouldShowParticleEffects(): boolean {
    return this.getAnimationConfig().enableParticleEffects;
  }

  shouldAnimateColorTransitions(): boolean {
    return this.getAnimationConfig().enableColorTransitions;
  }

  // Emergency fallback
  emergencyFallback(): void {
    console.error('Animation system emergency fallback triggered');
    this.setAnimationLevel('disabled');
    this.monitoringEnabled = false;
  }

  // Testing and debugging
  forceLevel(level: AnimationLevel): void {
    if (__DEV__) {
      console.log(`[DEBUG] Forcing animation level: ${level}`);
      this.setAnimationLevel(level);
    }
  }

  getPerformanceStats(): {
    currentLevel: AnimationLevel;
    performanceTier: PerformanceTier;
    avgFps: number;
    memoryWarnings: number;
  } {
    const avgFps = this.performanceHistory.length > 0 
      ? Math.round(this.performanceHistory.reduce((sum, fps) => sum + fps, 0) / this.performanceHistory.length)
      : 0;

    return {
      currentLevel: this.currentLevel,
      performanceTier: this.performanceTier,
      avgFps,
      memoryWarnings: this.memoryWarnings
    };
  }
}

export default AnimationFallbackSystem;