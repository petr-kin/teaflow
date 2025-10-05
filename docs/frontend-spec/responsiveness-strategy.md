# Responsiveness Strategy

## Breakpoints
| Breakpoint | Min Width | Max Width | Target Devices |
|------------|-----------|-----------|----------------|
| Mobile | 320px | 767px | iPhone SE to iPhone Pro Max |
| Tablet | 768px | 1024px | iPad, iPad Pro, landscape phones |
| Desktop | 1025px | - | iPad Pro 12.9", external displays |

## Adaptation Patterns

**Layout Changes:** 
- Mobile: Single column, full-width components
- Tablet: Two-column layout for Library, side-by-side timer and controls
- Desktop: Three-column layout with persistent navigation sidebar

**Navigation Changes:**
- Mobile: Horizontal swipe navigation as primary
- Tablet: Optional tab bar overlay for faster navigation
- Desktop: Persistent sidebar with timer always visible

**Content Priority:**
- Mobile: Timer-first, everything else secondary
- Tablet: Timer + tea selection/history in split view
- Desktop: Multi-area dashboard view

**Interaction Changes:**
- Mobile: Touch gestures optimized for one-handed use
- Tablet: Two-handed gestures, keyboard shortcuts
- Desktop: Hover states, keyboard navigation, cursor interactions
