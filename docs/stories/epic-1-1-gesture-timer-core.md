# Epic 1.1: Gesture-Based Timer Core (Phase 1: Foundation)

**Epic ID:** EPIC-1.1  
**Phase:** 1 - Foundation (Week 1-2)  
**Priority:** P0 (Critical Foundation)  
**Dependencies:** None  

## Epic Goal
Establish the foundational gesture-based timer system that eliminates UI clutter and enables ≤2 taps to start brewing any tea.

---

## Story 1.1.1: Basic Gesture Recognition and Timer Controls

**As a** tea enthusiast  
**I want** to control my brewing timer through intuitive gestures on the animation  
**So that** I can brew tea without visual menu clutter disrupting my zen experience

### Acceptance Criteria
1. **Center Tap (Start/Pause)**
   - Single tap starts timer from selected tea's first steep time
   - Tap during countdown pauses timer with visual confirmation
   - Tap while paused resumes timer from exact position
   - Visual pulse animation confirms gesture recognition

2. **Edge Tap Time Adjustment**
   - Left edge tap (X < 20% screen width) subtracts 10 seconds
   - Right edge tap (X > 80% screen width) adds 10 seconds
   - Minimum timer: 10 seconds, Maximum: 600 seconds (10 minutes)
   - Visual "-10s" or "+10s" overlay appears for 1 second

3. **Long Press Reset**
   - 1-second long press resets timer to selected tea's current steep default
   - Strong haptic feedback confirms reset action
   - Visual fade animation shows timer returning to default

4. **Double Tap Next Steep**
   - Double tap advances to next steep in tea's schedule
   - Shows "Next Steep" confirmation overlay
   - Gracefully handles last steep (shows "Final Steep")

### Technical Requirements
- Use react-native-gesture-handler for reliable cross-platform recognition
- Gesture recognition accuracy >95% in user testing
- Response time <100ms from gesture to visual feedback
- Works consistently across iOS and Android devices

### Definition of Done
- [x] All 4 gesture types work reliably on test devices
- [x] Haptic feedback appropriate for each gesture type
- [x] Visual confirmations appear within 100ms
- [x] Timer state remains consistent during gesture interactions
- [x] Edge cases handled (double gestures, rapid tapping)

---

## Story 1.1.2: Haptic Feedback and Visual Confirmation System

**As a** tea enthusiast  
**I want** immediate tactile and visual feedback when I perform gestures  
**So that** I know my interactions are recognized without breaking focus

### Acceptance Criteria
1. **Haptic Feedback Hierarchy**
   - Light impact: Time adjustments (±10s), navigation
   - Medium impact: Timer state changes (start/pause), confirmations  
   - Strong impact: Reset actions, warnings
   - Success pattern: Brew completion (custom vibration sequence)

2. **Visual Feedback System**
   - Touch zones briefly highlight on contact (200ms glow)
   - Parameter changes show floating overlays ("+10s", "Paused", etc.)
   - Gesture recognition shows immediate visual response
   - State transitions have smooth morphing animations

3. **Audio Feedback (Optional)**
   - Subtle system sounds for major state changes
   - T-10 warning: gentle temple bell sound
   - Completion: singing bowl resonance
   - All sounds respect system volume and mute settings

4. **Accessibility Support**
   - VoiceOver/TalkBack announces gesture results
   - High contrast mode for visual feedback elements
   - Adjustable haptic intensity in settings
   - Alternative button controls for gesture-impaired users

### Technical Requirements
- iOS: Use Haptics.ImpactFeedbackStyle enum
- Android: Use Vibration.vibrate() with patterns
- Audio: expo-av for optional sound effects
- Accessibility: react-native-accessibility-info integration

### Definition of Done
- [x] Haptic feedback works correctly on both platforms
- [x] Visual feedback appears consistently and smoothly
- [x] Audio feedback is subtle and respectful of system settings
- [x] Accessibility features tested with screen readers
- [x] Users can distinguish different gesture types by feel alone

---

## Story 1.1.3: Tea Preset Selection and Quick Access Memory

**As a** tea enthusiast  
**I want** the app to remember my last tea choice and commonly used teas  
**So that** I can start brewing immediately without setup

### Acceptance Criteria
1. **Last Tea Quick Access**
   - App opens to previously used tea with last-used adjustments
   - Shows tea name, temperature, current steep, vessel size
   - Single center tap starts brewing immediately
   - Preserves user's ±time adjustments from previous sessions

2. **Tea Grid Selection**
   - Swipe down reveals tea selection grid
   - Built-in presets: Green, Black, Oolong, White, Pu-erh, Herbal
   - Custom user teas appear alongside presets
   - Grid layout responsive: 2 columns (phone), 3 (tablet), 4 (desktop)

3. **Tea Card Information**
   - Tea name prominently displayed
   - Base temperature shown (e.g., "85°C")
   - Number of steeps (e.g., "5 steeps")
   - Tap any card loads that tea and returns to timer view

4. **State Persistence**
   - Last-used tea remembered between app launches
   - User adjustments (±time, temperature) persist per tea
   - Recently used teas appear at top of grid
   - All data stored locally via AsyncStorage

### Technical Requirements
- AsyncStorage for local data persistence
- Responsive grid layout using Flexbox
- Tea profiles stored as structured objects
- Memory-efficient loading (lazy load custom teas if large collection)

### Tea Preset Specifications
```typescript
const DEFAULT_TEAS = {
  green: { name: "Green Tea", tempC: 80, steeps: [60, 75, 90] },
  black: { name: "Black Tea", tempC: 95, steeps: [180, 240] },
  oolong: { name: "Oolong", tempC: 90, steeps: [30, 40, 50, 60, 75] },
  white: { name: "White Tea", tempC: 85, steeps: [120, 150, 180] },
  puerh: { name: "Pu-erh", tempC: 95, steeps: [20, 30, 40, 50] },
  herbal: { name: "Herbal", tempC: 100, steeps: [300] }
}
```

### Definition of Done
- [x] App consistently opens to last-used tea
- [x] Tea grid displays correctly across device sizes
- [x] All default tea presets have correct parameters
- [x] State persistence works after app restart
- [x] Loading performance <2 seconds on slower devices

---

## Story 1.1.4: Cross-Platform Timer Accuracy Validation

**As a** tea enthusiast  
**I want** precise and reliable timer accuracy across all devices  
**So that** my tea brewing times are consistent and trustworthy

### Acceptance Criteria
1. **Timer Accuracy Requirements**
   - Drift ≤0.2 seconds per minute across all test scenarios
   - Consistent timing whether app is foreground or background
   - Accurate countdown display updates (no visual lag or jumps)
   - Timer completion triggers exactly at 0:00

2. **Background State Resilience**
   - Timer continues accurately when app is backgrounded
   - Haptic/audio notifications work from background
   - State restored correctly when returning to foreground
   - No time loss during app switching or phone calls

3. **Cross-Platform Consistency**
   - Identical timing behavior on iOS vs Android
   - Same accuracy on various device performance levels
   - Consistent behavior across different OS versions
   - Battery optimization doesn't affect timer accuracy

4. **Edge Case Handling**
   - Device sleep/wake cycles don't affect timer
   - System time changes don't corrupt countdown
   - Low memory conditions don't pause timer
   - App crash recovery restores timer state

### Technical Requirements
- Use performance.now() or equivalent high-resolution timer
- Background task management (expo-background-fetch)
- Timer state persistence for crash recovery
- Platform-specific timing optimization (iOS/Android)

### Testing Protocol
1. **Accuracy Testing**
   - 10-minute timer test with stopwatch comparison
   - Background/foreground switching during countdown
   - Multiple device types and OS versions
   - Battery saving modes enabled

2. **Stress Testing**
   - Multiple rapid gesture interactions
   - Memory pressure conditions
   - Network connectivity changes
   - System notification interruptions

### Definition of Done
- [x] Timer accuracy ≤0.2s/min validated on 10+ device types
- [x] Background timing works correctly on both platforms
- [x] Edge cases tested and handled gracefully
- [x] Performance benchmarks documented
- [x] Recovery from crashes preserves timer state

---

## Epic 1.1 Success Metrics

### User Experience Metrics
- ≤2 taps to start brewing (target: 1 tap for returning users)
- Gesture recognition accuracy >95% in user testing
- User preference for gesture vs button controls >70%
- Time from app launch to brewing start <5 seconds

### Technical Performance Metrics  
- Timer accuracy ≤0.2s/min across all test devices
- Gesture response time <100ms on 90% of interactions
- App crash rate <0.5% during timer operation
- Memory usage stable during extended timer sessions

### Quality Metrics
- Zero regressions in existing app functionality
- Accessibility compliance with platform guidelines
- Battery drain <2% per 10-minute brewing session
- Cross-platform behavioral consistency >98%

---

*Epic 1.1 provides the foundational gesture-based timer system that enables the zen brewing experience. All subsequent epics build upon this reliable foundation.*