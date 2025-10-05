# Coding Standards

## Critical Tea App Rules (Based on Implementation Analysis)

- **Timer Accuracy:** Guarantee ≤0.2s/min drift cross-platform using high-precision intervals with background state management
- **Gesture Conflict Resolution:** Implement gesture zones and priority system - timer controls in central 70%, navigation in edge 15%
- **Video Performance:** 30fps sustained target, adaptive quality based on device performance, video preloading for smooth experience
- **Zen Interface Priority:** All UI decisions must serve tea brewing process and user's connection to tea - no mechanical interactions
- **Haptic Tea Ceremony:** Use haptic feedback that matches tea ceremony rhythm - gentle pulses, not jarring buzzes
- **Cultural Authenticity:** All tea-related features must respect traditional tea ceremony principles and terminology
- **Living Tea Metaphor:** Animations must mirror actual brewing process - leaves drift naturally, steam rises organically
- **Offline-First Zen:** Core brewing experience must work completely offline with no cloud dependencies
- **Premium Quality:** Every interaction should feel crafted and intentional, matching $9.99 premium positioning
- **Learning Transparency:** User must understand why recommendations are made without complexity overwhelming zen experience

## Critical Success Metrics (From PRD)

**Core Functionality Targets:**
- **Timer Accuracy:** Drift ≤0.2s per minute (CRITICAL - affects trust)
- **Crash-Free Sessions:** ≥99.8% (CRITICAL - brewing cannot be interrupted)
- **Gesture Recognition:** ≥95% accuracy (CRITICAL - zen interface depends on this)
- **Animation Performance:** 30fps on mid-range devices (maintains zen experience)

**User Experience Targets:**
- **Complete Brewing Flow:** 3+ steeps end-to-end without confusion
- **Fast Start:** Begin brewing in ≤2 taps from app launch
- **Zero Configuration:** No settings required for first successful session
- **Full Offline:** Core functionality works completely offline

## Traditional Development Rules (Still Apply)

- **Type Safety:** All components must use TypeScript interfaces with no 'any' types
- **Performance First:** Graphics components must implement shouldComponentUpdate or memo
- **Offline Resilience:** All user actions must work offline with proper error boundaries
- **Theme Compliance:** All colors must use teaTheme system, no hardcoded colors
- **Data Persistence:** Critical data must persist immediately, not on app background

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TimerDisplay.tsx` |
| Hooks | camelCase with 'use' | - | `useTimer.ts` |
| API Routes | - | kebab-case | `/api/sync-data` |
| Database Tables | - | snake_case | `brew_sessions` |
