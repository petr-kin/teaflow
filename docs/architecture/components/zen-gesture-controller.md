# Zen Gesture Controller  

**Responsibility:** Processes tea ceremony-inspired gestures for timer control without cluttering zen interface

**Key Interfaces:**
- onEdgeTap: (side: 'left' | 'right') => void  // ±5s adjustments
- onCenterTap: () => void                      // Start/pause/reset
- onPinchGesture: (scale: number) => void      // Vessel size
- onTwistGesture: (rotation: number) => void   // Temperature

**Dependencies:** React Native Reanimated, haptic feedback system, gesture conflict resolution

**Technology Stack:** Transparent gesture overlay, zone-based gesture detection with conflict resolution, zen-appropriate haptic patterns

**Advanced Gesture Conflict Resolution:**
```typescript
// Sophisticated gesture detection from PRD specifications
gesturePriority: {
  verticalGestures: 'when angle <30° from vertical axis',
  gestureZones: 'timer controls in central 70%, navigation in edge 15%',
  smartDetection: '100ms delay to determine intent before execution',
  edgeMapping: {
    leftEdge: 'X < screen.width * 0.2 = -10 seconds',
    rightEdge: 'X > screen.width * 0.8 = +10 seconds',
    centerTap: 'toggle timer state',
    longPress: 'liquid drain confirmation animation (1.5s)',
    pinchGesture: 'vessel size adjustment (110-500ml)',
    twistGesture: 'temperature adjustment (±5°C)'
  }
}
```

**Zen Confirmation Patterns:**
- **Liquid Drain Animation:** Tea flowing from cup/hourglass visual for destructive actions
- **No Modal Popups:** Pure visual feedback maintaining zen interface
- **Cancellation Grace:** Release finger within 1.5s cancels action

**Gesture Video Integration (MISSING CRITICAL FEATURE!):**
```typescript
// Video background interactions from video-based-visual-mockups.md
interface GestureVideoController {
  // Gestures that work directly with video backgrounds
  videoGestureMapping: {
    verticalSwipe: {
      action: 'temperature adjustment ±5°C';
      visualFeedback: 'overlay thermometer appears over video';
      videoResponse: 'steam intensity changes based on temperature';
    };
    
    horizontalSwipe: {
      action: 'vessel size adjustment ±10ml';
      visualFeedback: 'overlay vessel size indicator';
      videoResponse: 'vessel appears larger/smaller in video frame';
    };
    
    longPress: {
      action: 'show tea information overlay';
      visualFeedback: 'tea details appear over video';
      videoResponse: 'video slightly dims to highlight overlay';
    };
    
    doubleTap: {
      action: 'restart current steep';
      visualFeedback: 'confirmation animation';
      videoResponse: 'video restarts with flash effect';
    };
  };
  
  // Seamless integration between gestures and video
  synchronizeGestureWithVideo(gesture: GestureType, intensity: number) {
    switch(gesture) {
      case 'temperatureAdjust':
        this.adjustVideoSteamIntensity(intensity);
        this.showTemperatureOverlay(intensity);
        break;
      case 'vesselSizeAdjust':
        this.adjustVideoVesselScale(intensity);
        this.showVesselSizeOverlay(intensity);
        break;
      case 'teaInfoRequest':
        this.dimVideoForOverlay();
        this.showTeaInformationOverlay();
        break;
    }
  }
}
```
