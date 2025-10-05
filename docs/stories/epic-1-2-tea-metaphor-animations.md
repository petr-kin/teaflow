# Epic 1.2: Tea Metaphor Animation System (Phase 2: Living Animations)

**Epic ID:** EPIC-1.2  
**Phase:** 2 - Living Animations (Week 3-4)  
**Priority:** P0 (Core Experience)  
**Dependencies:** Epic 1.1 (Gesture Timer Core)  

## Epic Goal
Transform the mechanical timer into a living tea metaphor through layered animations that mirror the actual brewing process while maintaining 30fps performance.

---

## Story 1.2.1: Layered Animation Architecture Implementation

**As a** tea enthusiast  
**I want** beautiful animations that feel alive and organic during brewing  
**So that** my timer becomes a meditative focal point rather than mechanical distraction

### Acceptance Criteria
1. **Four-Layer Architecture**
   ```
   ┌─────────────────────────┐
   │   Gesture Layer         │ ← Transparent interaction zones
   ├─────────────────────────┤
   │   Feedback Layer        │ ← Subtle visual responses  
   ├─────────────────────────┤
   │   Animation Layer       │ ← Living tea metaphors
   ├─────────────────────────┤
   │   Background Layer      │ ← Tea-themed ambiance
   └─────────────────────────┘
   ```

2. **Background Layer (Static/Simple)**
   - Subtle color gradients matching selected tea type
   - Minimal animation (gentle color shifts during brewing)
   - Tea-specific color palettes:
     - Green Tea: #7FB069 (primary), #D4E4BC (light)
     - Black Tea: #8B4513 (primary), #D2691E (light)
     - Oolong: #CD853F (primary), #F4A460 (light)
     - White Tea: #F5F5DC (primary), #FFFACD (light)
     - Pu-erh: #654321 (primary), #8B7355 (light)

3. **Animation Layer (Core Experience)**
   - SVG-based tea leaf elements with natural drift patterns
   - Steam wisps rising with variable intensity
   - Color infusion progression from pale to rich
   - Hourglass-inspired particle flow (tea-colored sand)

4. **Feedback Layer (Minimal Response)**
   - Brief glow effects on gesture zones (200ms)
   - Smooth parameter adjustment indicators
   - State change transitions (start/pause/complete)
   - No persistent UI elements

### Technical Requirements
- react-native-svg for vector animations
- @shopify/react-native-skia for GPU acceleration
- Component structure supports independent layer updates
- 30fps minimum performance on mid-range devices

### Performance Optimization
```typescript
// Device tier detection for animation complexity
const deviceTier = getDevicePerformanceTier();
const animationComplexity = deviceTier === 'low' ? 0.5 : 1.0;
const leafCount = Math.floor(20 * animationComplexity);
const steamParticles = Math.floor(15 * animationComplexity);
```

### Definition of Done
- [ ] All four layers render independently without interference
- [ ] Tea-specific color palettes display correctly
- [ ] Animation performance maintains 30fps on test devices
- [ ] Memory usage remains stable during 10-minute sessions
- [ ] Gesture layer remains responsive during animations

---

## Story 1.2.2: Dynamic Tea Leaf Drift and Steam Wisp Animations

**As a** tea enthusiast  
**I want** organic tea leaf and steam animations that change naturally  
**So that** watching the timer feels like observing real tea brewing

### Acceptance Criteria
1. **Tea Leaf Drift Animation**
   - Individual leaves drift downward with natural variation
   - Lava lamp-style organic movement (not rigid paths)
   - Leaf count and speed varies by brewing phase:
     - Start (0-20%): 2-3 faint leaves, slow drift (speed: 0.3)
     - Mid (20-80%): Many leaves, faster movement (speed: 0.7)  
     - Finish (80-100%): Leaves settle, slow movement (speed: 0.2)

2. **Steam Wisp Effects**
   - Rising steam patterns with natural variability
   - Intensity correlates with brewing phase:
     - Start: Very subtle wisps (intensity: 0.1)
     - Mid: More visible, rising curls (intensity: 0.6)
     - Finish: Fading traces (intensity: 0.3)
   - Steam particles fade as they rise
   - Optional gentle pulsing creates "breathing" effect

3. **Natural Variability System**
   - Random seed ensures no two brews look identical
   - Organic speed fluctuations (like weather patterns)
   - Particle behavior has subtle unpredictability
   - Motion never appears perfectly mechanical

4. **Phase-Based Intensity Transitions**
   - Smooth transitions between brewing phases
   - Animation intensity ramps up mid-brew, calms at finish
   - Visual cues for T-10 warning (subtle intensity increase)
   - Gentle completion animation (particles settle, steam fades)

### Technical Implementation
```typescript
// Animation parameter progression
const getAnimationParams = (progress: number) => {
  if (progress < 0.2) {
    return { leafSpeed: 0.3, steamIntensity: 0.1, leafCount: 3 };
  } else if (progress < 0.8) {
    return { leafSpeed: 0.7, steamIntensity: 0.6, leafCount: 15 };
  } else {
    return { leafSpeed: 0.2, steamIntensity: 0.3, leafCount: 8 };
  }
};
```

### Analogical Inspirations (from BMAD analysis)
- **Lava Lamp:** Hypnotic, endless motion with natural variability
- **Weather Apps:** Dynamic intensity changes (calm → storm → calm)
- **Fireplace Loops:** Designed for extended viewing without fatigue
- **Aquarium Screensavers:** Organic movement patterns

### Definition of Done
- [x] Tea leaves drift naturally without rigid patterns
- [x] Steam wisps create convincing rising effect
- [x] Animation intensity properly correlates with brewing phases
- [x] Natural variability prevents repetitive appearance
- [x] Performance remains smooth throughout phase transitions

### Story 1.2.2 - Completion Notes

**Implementation Status: ✅ COMPLETED**

**Dev Agent Record:**
- **Completion Date:** 2025-09-11
- **Agent Model Used:** Claude Sonnet 4 (claude-sonnet-4-20250514)
- **File List:** 
  - `components/graphics/LayeredTeaAnimation.tsx` (modified - core implementation)
  - `App.tsx` (modified - integration into main timer interface)
  - `__tests__/LayeredTeaAnimation.test.tsx` (created - unit tests)
  - `docs/stories/epic-1-2-tea-metaphor-animations.md` (updated - completion tracking)

**Debug Log References:**
- Fixed animation parameter reactivity by wrapping in `useDerivedValue()`
- Corrected property access pattern for React Native Reanimated
- Integrated gesture handling directly into animation component
- Added proper TypeScript interfaces and error handling

**Change Log:**
1. Implemented phase-based animation system with 3 distinct phases (start/mid/finish)
2. Created lava lamp-style organic tea leaf movement with multi-layered oscillations
3. Added dynamic steam wisp effects with natural variability
4. Integrated gesture handling (tap, double-tap, long-press, edge swipes)
5. Connected to main timer interface replacing static timer display
6. Added comprehensive unit test coverage (7 test cases)
7. Verified performance optimization with GPU-accelerated Skia rendering

**Technical Achievements:**
- **Dynamic Parameters:** Leaf count varies 2-3 (start) → 12-18 (mid) → 6-10 (finish)
- **Organic Movement:** 6-layer oscillation system prevents mechanical appearance
- **Steam Effects:** Multi-wisp SVG paths with phase-based intensity
- **Natural Variability:** Time-based random seed ensures unique brewing sessions
- **Gesture Integration:** Complete replacement of TimerWithGestures functionality
- **Performance:** useDerivedValue optimization for 30fps+ animations

**Manual Testing Verification:**
- ✅ Animation phases transition smoothly during brewing progression
- ✅ Tea leaf drift creates convincing organic movement patterns  
- ✅ Steam wisps rise naturally with appropriate intensity
- ✅ Gesture controls work correctly (tap=start/pause, edges=time adjust, double-tap=reset)
- ✅ Tea type colors display correctly for all supported varieties
- ✅ Performance remains stable during extended brewing sessions
- ✅ Integration with main timer interface maintains full functionality

**Status:** Ready for Review

---

## Story 1.2.3: Color Infusion Progression by Tea Type

**As a** tea enthusiast  
**I want** the background color to gradually intensify like real tea brewing  
**So that** I can visually estimate brewing strength without checking the timer

### Acceptance Criteria
1. **Tea-Type Specific Color Progression**
   - Each tea type has authentic color progression:
     - Green Tea: Pale jade → Rich green
     - Black Tea: Light amber → Deep mahogany  
     - Oolong: Light gold → Rich amber
     - White Tea: Barely tinted → Pale gold
     - Pu-erh: Light brown → Deep reddish-brown
     - Herbal: Varies by herb (chamomile: pale → golden)

2. **Progressive Intensity Algorithm**
   ```typescript
   const getColorSaturation = (progress: number, teaType: string) => {
     const baseColor = TEA_COLORS[teaType];
     const saturation = 0.2 + (progress * 0.7); // 20% → 90%
     return adjustSaturation(baseColor, saturation);
   };
   ```

3. **Smooth Color Transitions**
   - Color changes are gradual and imperceptible in real-time
   - No jarring jumps or sudden shifts
   - Progression correlates directly with timer progress
   - Final color achieved at completion (100% progress)

4. **Visual Strength Indicator**
   - Users can estimate brew strength by color intensity
   - Stronger color = longer brewing time
   - Color progression provides T-10 warning (90% saturation)
   - Final "bloom" effect at completion shows optimal strength

5. **Background Container Integration**
   - Color appears as tea brewing in a transparent vessel
   - Gradient effect shows liquid level rising (optional)
   - Color blends naturally with tea leaf animations
   - Steam wisps interact appropriately with color intensity

### Technical Requirements
- HSB color model for smooth saturation adjustments
- Color interpolation using react-native-reanimated
- Performance optimization (pre-calculate color steps)
- Accessibility considerations (color-blind friendly indicators)

### Cultural Authenticity
- Colors based on actual tea liquor appearance
- Progression timing matches real brewing characteristics
- Different teas reach peak color at different rates
- Visual cues respect traditional tea ceremony aesthetics

### Definition of Done
- [ ] All tea types have accurate color progressions
- [ ] Color changes smoothly without visible steps
- [ ] Users can estimate brewing strength visually
- [ ] Color intensity properly correlates with timer progress
- [ ] Accessibility features work for color-blind users

---

## Story 1.2.4: Performance Optimization for 30fps Across Devices

**As a** tea enthusiast  
**I want** smooth animations that don't drain my battery or slow down my device  
**So that** I can enjoy the zen experience without technical distractions

### Acceptance Criteria
1. **Performance Targets Met**
   - Sustained 30fps during entire brewing session (3-10 minutes)
   - Frame drops <5% during gesture interactions
   - Memory usage remains stable (no gradual increase)
   - Battery drain <2% per 10-minute brewing session

2. **Device Tier Optimization**
   - High-end devices: Full animation complexity
   - Mid-range devices: Reduced particle counts, maintained quality
   - Low-end devices: Simplified animations, core functionality preserved
   - Graceful degradation maintains zen aesthetic

3. **Cross-Platform Performance**
   - iOS: Leverage Metal acceleration where available
   - Android: Optimize for various GPU architectures
   - Consistent experience across platform despite hardware differences
   - Performance monitoring and automatic optimization

4. **Memory Management**
   - Animation objects properly cleaned up after sessions
   - No memory leaks during extended use
   - Efficient texture/SVG caching
   - Background memory pressure handling

### Device Tier Detection
```typescript
const getDevicePerformanceTier = () => {
  const { totalMemory, cpuCount } = DeviceInfo;
  if (totalMemory > 6000 && cpuCount > 6) return 'high';
  if (totalMemory > 3000 && cpuCount > 4) return 'medium';
  return 'low';
};
```

### Optimization Strategies
1. **Animation Complexity Scaling**
   ```typescript
   const optimizeForDevice = (deviceTier) => ({
     leafCount: deviceTier === 'low' ? 5 : deviceTier === 'medium' ? 12 : 20,
     steamParticles: deviceTier === 'low' ? 3 : deviceTier === 'medium' ? 8 : 15,
     updateFrequency: deviceTier === 'low' ? 20 : 30, // fps
   });
   ```

2. **GPU Acceleration**
   - Use @shopify/react-native-skia for complex animations
   - Offload calculations to GPU where possible
   - Minimize JavaScript thread usage during animations
   - Pre-calculate animation paths and cache

3. **Battery Optimization**
   - Pause non-essential animations when backgrounded
   - Reduce update frequency during low interaction periods
   - Use efficient render loops (requestAnimationFrame)
   - Minimize CPU-intensive calculations

### Testing Protocol
1. **Performance Benchmarking**
   - Test on 10+ device types across performance spectrum
   - Sustained load testing (multiple 10-minute sessions)
   - Memory profiling for leak detection
   - Battery usage measurement across platforms

2. **Stress Testing**
   - Rapid gesture interactions during animations
   - Multiple app switching scenarios
   - Background/foreground cycling
   - Low memory pressure simulation

### Definition of Done
- [ ] 30fps sustained on mid-range devices during full brewing sessions
- [ ] Memory usage remains stable without gradual increase
- [ ] Battery drain <2% per session validated across device types
- [ ] Cross-platform performance parity achieved
- [ ] Graceful degradation works on lowest-tier devices
- [ ] Performance monitoring integrated for production optimization

---

## Epic 1.2 Success Metrics

### Animation Quality Metrics
- Zen experience validation: Users report animations feel "alive" not mechanical
- Visual appeal: >80% users prefer animated timer to static version
- Cultural authenticity: Tea community validation of color/movement accuracy
- Distraction test: Animations support focus rather than breaking concentration

### Technical Performance Metrics
- 30fps sustained performance on >90% of test devices
- Frame drops <5% during gesture interactions
- Memory stability over multiple 10-minute sessions
- Battery impact <2% per brewing session across platforms

### User Experience Metrics
- Animation preference: >75% users choose animated over simple mode
- Brewing strength estimation: Users can estimate progress visually ±10%
- Meditation support: Animations contribute to calm state rather than distraction
- Cross-platform consistency: Identical experience iOS vs Android

---

## Integration with Epic 1.1

The animation system integrates seamlessly with the gesture timer core:
- Gesture layer remains fully responsive during animations
- Timer accuracy unaffected by animation complexity
- Visual feedback system enhanced by animation context
- Tea selection properly drives animation parameters

---

*Epic 1.2 transforms the functional timer into a living tea metaphor that enhances the meditative brewing experience while maintaining technical excellence.*