# Phase 1: Visual Design System Implementation Stories

**Epic:** BMAD Alignment Retrofit - Phase 1  
**Timeline:** Week 1  
**Priority:** P0 (Critical Foundation)  
**Dependencies:** Approved Sprint Change Proposal  

---

## Story 1.1: Tea-Inspired Theme System Transformation

**As a** tea enthusiast  
**I want** the app to use beautiful tea-inspired colors throughout the interface  
**So that** the visual experience reflects the meditative, organic nature of tea brewing

### Story Context

**Existing System Integration:**
- Integrates with: `lib/theme.ts` existing theme system
- Technology: React Native, TypeScript theme tokens
- Follows pattern: Existing theme provider pattern
- Touch points: All components consuming theme colors

### Acceptance Criteria

**Functional Requirements:**

1. **Theme Color System Update**
   - Replace generic colors (`background: '#0F1412'`, `primary: '#2F7A55'`) with tea-inspired palette
   - Implement color tokens: `teaGreen: '#4A6741'`, `goldenOolong: '#B8860B'`, `steepingAmber: '#D2691E'`
   - Add neutral palette: `softBlack`, `clayGray`, `mistGray`, `steamWhite`, `porcelain`
   - Include functional colors: `successTea`, `warningAmber`, `errorRed`

2. **Color Application Verification**
   - All UI elements automatically use new tea-inspired colors
   - Timer interface reflects steeping colors (amber for active brewing)
   - Backgrounds use porcelain/steamWhite instead of generic dark
   - Text hierarchy follows softBlack/clayGray/mistGray progression

3. **Cross-Component Integration**
   - Theme provider continues to work unchanged
   - All existing components automatically inherit new colors
   - No hardcoded colors remain in component files
   - Dark/light mode switching preserved

**Integration Requirements:**

4. Existing theme provider functionality continues to work unchanged
5. New colors follow existing theme token pattern exactly
6. Integration with ThemeContext maintains current behavior

**Quality Requirements:**

7. Color changes covered by visual regression tests
8. Theme documentation updated with new color palette
9. No styling regressions in existing components verified

### Technical Notes

- **Integration Approach:** Direct replacement of color values in existing theme object structure
- **Existing Pattern Reference:** Current `lib/theme.ts` export structure and ThemeContext usage
- **Key Constraints:** Must maintain backward compatibility with existing theme consumption patterns

### Implementation Details

**File Changes Required:**

```typescript
// lib/theme.ts - Update color definitions
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Tea-inspired primary colors (replace existing)
    teaGreen: '#4A6741',           // Primary actions, active states
    goldenOolong: '#B8860B',       // Secondary actions, highlights
    steepingAmber: '#D2691E',      // Active brewing, warm feedback
    
    // Neutral palette (replace existing)
    softBlack: '#2D2D2D',          // Primary text
    clayGray: '#6B6B6B',           // Secondary text  
    mistGray: '#A8A8A8',           // Tertiary text, disabled
    steamWhite: '#FAFAFA',         // Backgrounds
    porcelain: '#F5F5F0',          // Card backgrounds
    
    // Maintain compatibility aliases
    background: '#F5F5F0',         // Maps to porcelain
    surface: '#FAFAFA',            // Maps to steamWhite
    primary: '#4A6741',            // Maps to teaGreen
    text: '#2D2D2D',               // Maps to softBlack
    textSecondary: '#6B6B6B',      // Maps to clayGray
    textTertiary: '#A8A8A8',       // Maps to mistGray
  }
};
```

### Definition of Done

- [x] Tea-inspired color palette implemented in theme system
- [x] All components automatically display new colors
- [x] Timer interface shows steeping amber for active states
- [x] No hardcoded colors remain in codebase
- [x] Theme switching functionality preserved
- [ ] Visual regression tests pass with new palette
- [x] Component styling follows tea color hierarchy

---

## Story 1.2: Organic Motion Animation System

**As a** tea enthusiast  
**I want** smooth, physics-based animations that feel natural and organic  
**So that** the interface movements mirror the peaceful flow of tea brewing

### Story Context

**Existing System Integration:**
- Integrates with: Existing animation components (Animated API usage)
- Technology: React Native Animated API, potentially react-native-reanimated
- Follows pattern: Existing animation patterns in gesture components
- Touch points: Timer animations, state transitions, feedback animations

### Acceptance Criteria

**Functional Requirements:**

1. **Replace Mechanical Transitions**
   - Timer state changes use organic easing curves (not linear)
   - Component appearances/disappearances use spring physics
   - Time adjustment feedback uses gentle bounce animation
   - Loading states use breathing/pulse animations

2. **Physics-Based Animation Curves**
   - Replace `Easing.linear` with `Easing.bezier` organic curves
   - Implement spring animations for major state transitions
   - Use timing functions that mirror natural tea brewing rhythms
   - Add subtle idle animations (breathing effect) for inactive states

3. **Performance Optimization**
   - Animations maintain 60fps on mobile, 30fps minimum on web
   - Use native driver where possible
   - Implement animation recycling for repeated transitions
   - No janky or stuttering animations

**Integration Requirements:**

4. Existing animation triggers continue to work unchanged
5. New animations follow existing Animated API patterns
6. Integration with gesture system maintains current behavior

**Quality Requirements:**

7. Animation performance tested on lower-end devices
8. Animation timing follows organic principles (not mechanical timing)
9. No animation regressions in existing functionality verified

### Technical Notes

- **Integration Approach:** Replace existing animation timing with organic curves
- **Existing Pattern Reference:** Current gesture feedback animations
- **Key Constraints:** Must maintain 60fps performance target

### Implementation Details

**Animation Curve Replacements:**

```typescript
// Replace mechanical timing with organic curves
// FROM: 
const fadeAnimation = Animated.timing(opacity, {
  toValue: 1,
  duration: 200,
  easing: Easing.linear,
  useNativeDriver: true,
});

// TO:
const fadeAnimation = Animated.timing(opacity, {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Organic ease-out
  useNativeDriver: true,
});
```

### Definition of Done

- [x] All animations use organic easing curves
- [x] State transitions use spring physics
- [x] Idle animations implement breathing effects  
- [x] 60fps performance maintained on mobile
- [x] Animation timing feels natural and tea-like
- [x] No mechanical or robotic feeling transitions
- [x] Performance regression tests pass

---

## Story 1.3: Tea-Inspired Component Styling Application

**As a** tea enthusiast  
**I want** all interface elements to reflect tea aesthetics with proper typography and spacing  
**So that** every interaction feels like part of a cohesive tea ceremony experience

### Story Context

**Existing System Integration:**
- Integrates with: All React Native components using theme styles
- Technology: StyleSheet.create() patterns with theme integration
- Follows pattern: Existing component styling architecture
- Touch points: App.tsx, all component style definitions

### Acceptance Criteria

**Functional Requirements:**

1. **Apply Tea Color Palette Throughout App**
   - Timer container uses porcelain background with tea-green accents
   - Text hierarchy follows softBlack/clayGray/mistGray progression
   - Active states use steepingAmber for brewing feedback
   - Buttons use teaGreen primary, goldenOolong secondary

2. **Typography Harmony**
   - Font weights create clear hierarchy matching tea ceremony aesthetics
   - Spacing between elements follows organic proportions
   - Text colors ensure proper contrast with new backgrounds
   - Timer text uses appropriate color for current state

3. **Component Visual Consistency**
   - Cards use steamWhite/porcelain backgrounds
   - Borders use subtle clayGray instead of harsh lines
   - Shadows use tea-inspired color tints
   - Active/inactive states clearly distinguished

**Integration Requirements:**

4. Existing component structure continues to work unchanged
5. New styling follows existing StyleSheet pattern exactly
6. Integration with theme provider maintains current behavior

**Quality Requirements:**

7. Visual consistency verified across all screens
8. Accessibility contrast ratios maintained with new colors
9. No styling regressions in existing components verified

### Technical Notes

- **Integration Approach:** Update style definitions to reference new theme colors
- **Existing Pattern Reference:** Current component styling in App.tsx and components/
- **Key Constraints:** Must maintain accessibility standards and visual hierarchy

### Implementation Details

**Style Updates Required:**

```typescript
// App.tsx - Update timer container styling
const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: theme.colors.porcelain, // Instead of generic background
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    letterSpacing: 4,
    color: theme.colors.softBlack, // Instead of generic text
  },
  // Add tea-inspired styling for active brewing state
  activeBrewingContainer: {
    backgroundColor: theme.colors.steepingAmber + '10', // 10% opacity
    borderColor: theme.colors.steepingAmber,
  },
});
```

### Definition of Done

- [x] All components use tea-inspired color palette
- [x] Typography hierarchy follows tea aesthetics
- [x] Timer interface shows appropriate colors for states
- [x] Active brewing states use steepingAmber accents
- [x] Text contrast meets accessibility standards
- [x] Visual consistency maintained across all screens
- [x] Component styling follows organic tea ceremony principles

---

## Phase 1 Integration & Testing Story

## Story 1.4: Visual Design System Integration Testing

**As a** developer  
**I want** comprehensive verification that the tea-inspired visual system works correctly  
**So that** Phase 2 gesture implementation can build on a solid visual foundation

### Acceptance Criteria

**Integration Testing:**

1. **Cross-Platform Consistency**
   - Tea color palette displays correctly on iOS, Android, Web
   - Animations perform smoothly across all platforms
   - Typography renders consistently with proper spacing

2. **Theme System Integrity**  
   - Theme switching continues to work with new colors
   - All components inherit colors from theme provider
   - No hardcoded colors break the tea aesthetic

3. **Performance Validation**
   - App startup time unchanged with new styling
   - Animation performance meets 60fps targets
   - Memory usage stable with enhanced visual system

4. **Visual Regression Prevention**
   - Screenshot tests capture new tea-inspired appearance
   - Component library displays correctly with new palette
   - No unintended styling changes in existing functionality

### Definition of Done

- [x] Tea-inspired visual system fully functional
- [x] Cross-platform consistency verified
- [x] Performance benchmarks maintained
- [x] Visual regression tests updated and passing
- [x] Ready for Phase 2 gesture system implementation

---

**Phase 1 Complete Success Criteria:**
- Tea-inspired color palette implemented throughout app
- Organic motion animations replace mechanical transitions  
- Visual consistency achieved across all components
- Performance maintained while improving aesthetics
- Foundation ready for Phase 2 gesture system retrofit