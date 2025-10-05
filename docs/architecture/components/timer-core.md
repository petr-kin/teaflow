# Timer Core

**Responsibility:** Manages precise countdown timing with background operation support and haptic feedback integration

**Key Interfaces:**
- startTimer(seconds: number): void
- pauseTimer(): void  
- resetTimer(): void
- onTimerComplete: () => void
- onTimeUpdate: (remaining: number) => void

**Dependencies:** Background task manager, haptics system, audio system

**Technology Stack:** React Native background tasks, Expo Haptics, high-precision intervals with drift compensation

**Critical Timer Accuracy Architecture (≤0.2s/min drift guarantee):**
```typescript
// High-precision timer implementation with drift compensation
class PrecisionTimer {
  private startTime: number;
  private expectedDuration: number;
  private driftCompensation: number = 0;
  
  startTimer(seconds: number) {
    this.startTime = Date.now();
    this.expectedDuration = seconds * 1000;
    this.scheduleNextTick();
  }
  
  private scheduleNextTick() {
    const elapsed = Date.now() - this.startTime;
    const expectedTicks = Math.floor(elapsed / 1000);
    const drift = elapsed - (expectedTicks * 1000);
    
    // Compensate for accumulated drift
    const nextTickDelay = 1000 - drift;
    setTimeout(() => this.tick(), nextTickDelay);
  }
  
  // Cross-platform synchronization
  syncWithSystemTime() {
    const systemTime = Date.now();
    const timerTime = this.startTime + this.getElapsedTime();
    this.driftCompensation = systemTime - timerTime;
  }
}
```

**Cross-Platform Timing Consistency:**
- iOS: Use CADisplayLink for 60Hz precision when app active
- Android: WorkManager for background timing with drift monitoring  
- Background: Notification scheduling with local timer validation
- Validation: System time cross-reference every 30 seconds
