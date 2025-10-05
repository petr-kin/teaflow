import { Platform } from 'react-native';

interface DevicePerformance {
  tier: 'high' | 'mid' | 'low';
  targetFps: number;
  maxParticles: number;
  enableBlur: boolean;
  animationQuality: 'high' | 'medium' | 'low';
}

class PerformanceManager {
  private static instance: PerformanceManager;
  private deviceTier: DevicePerformance;
  private frameCount = 0;
  private lastFpsCheck = Date.now();
  private currentFps = 60;

  private constructor() {
    this.deviceTier = this.detectDevicePerformance();
    this.startFpsMonitoring();
  }

  static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  private detectDevicePerformance(): DevicePerformance {
    // Default to mid-tier, can be enhanced with actual device detection
    if (Platform.OS === 'web') {
      return {
        tier: 'high',
        targetFps: 60,
        maxParticles: 12,
        enableBlur: true,
        animationQuality: 'high'
      };
    }

    // Conservative mobile defaults to ensure 30fps minimum
    return {
      tier: 'mid',
      targetFps: 30,
      maxParticles: 8,
      enableBlur: false,
      animationQuality: 'medium'
    };
  }

  private startFpsMonitoring() {
    const checkFps = () => {
      this.frameCount++;
      const now = Date.now();
      const elapsed = now - this.lastFpsCheck;
      
      if (elapsed >= 1000) {
        this.currentFps = (this.frameCount * 1000) / elapsed;
        this.frameCount = 0;
        this.lastFpsCheck = now;
        
        // Adaptive quality adjustment
        if (this.currentFps < this.deviceTier.targetFps * 0.8) {
          this.adaptPerformance('down');
        } else if (this.currentFps > this.deviceTier.targetFps * 1.2) {
          this.adaptPerformance('up');
        }
      }
      
      requestAnimationFrame(checkFps);
    };
    requestAnimationFrame(checkFps);
  }

  private adaptPerformance(direction: 'up' | 'down') {
    if (direction === 'down' && this.deviceTier.tier !== 'low') {
      // Reduce quality to maintain performance
      this.deviceTier.maxParticles = Math.max(4, this.deviceTier.maxParticles - 2);
      this.deviceTier.enableBlur = false;
      if (this.deviceTier.animationQuality === 'high') {
        this.deviceTier.animationQuality = 'medium';
      } else if (this.deviceTier.animationQuality === 'medium') {
        this.deviceTier.animationQuality = 'low';
      }
    } else if (direction === 'up' && this.deviceTier.tier !== 'high') {
      // Increase quality if performance allows
      this.deviceTier.maxParticles = Math.min(12, this.deviceTier.maxParticles + 1);
      if (this.deviceTier.animationQuality === 'low') {
        this.deviceTier.animationQuality = 'medium';
      } else if (this.deviceTier.animationQuality === 'medium') {
        this.deviceTier.animationQuality = 'high';
        this.deviceTier.enableBlur = true;
      }
    }
  }

  getSettings(): DevicePerformance {
    return { ...this.deviceTier };
  }

  getCurrentFps(): number {
    return this.currentFps;
  }

  getAnimationInterval(): number {
    // Return interval in ms for target FPS
    return 1000 / this.deviceTier.targetFps;
  }
}

export default PerformanceManager;