# Component Library / Design System

## Design System Approach

**Build on Existing Foundation:** Extend current component library (Button, Tag, Header, Card, IconButton) rather than adopting external systems that would compromise the zen aesthetic.

**TeaFlow Design Language:** Custom system optimized for calm, meditative tea brewing experience with tea-inspired design tokens.

## Core Components

### Button
**Purpose:** Primary interaction element for all user actions
**Variants:** 
- Primary (tea-leaf green) - main actions
- Secondary (cream/outline) - secondary actions  
- Subtle (icon only) - contextual controls
**States:** Default, pressed, disabled, loading
**Usage Guidelines:** Use primary sparingly to maintain focus hierarchy

### Tag  
**Purpose:** Tea type identification and state indication
**Variants:**
- Tea Types (green, oolong, pu-erh, black, white) - color-coded by tea category
- State Tags (brewing, complete, favorite) - functional status
**States:** Active, inactive, selected
**Usage Guidelines:** Maximum 3 tags visible per tea card to prevent clutter

### Card
**Purpose:** Content containers for teas and sessions
**Variants:**
- Tea Card (with thumbnail, brewing parameters)
- Session Card (timeline view, brewing history)
- Info Card (tips, guidance content)
**States:** Default, selected, expanded
**Usage Guidelines:** Consistent padding and shadow depth across all card types

### Timer Display
**Purpose:** Central brewing timer with progress visualization
**Variants:**
- Circular Progress Ring - primary timer display
- Linear Progress Bar - multiple steep indicator
- Compact Timer - secondary screens
**States:** Idle, countdown, paused, complete, celebration
**Usage Guidelines:** Always maintain readability over video backgrounds

### Tea Profile Component
**Purpose:** Standardized tea information display across screens
**Variants:**
- Card View (library grid)
- List View (selection lists)
- Detail View (full screen)
- Quick Select (timer screen)
**States:** Available, brewing, depleted, favorite
**Usage Guidelines:** Consistent information hierarchy and visual treatment

## Design Token System

### Color System - Tea-Inspired Palette

**Primary Colors:**
- **Tea Green:** `#4A6741` (primary actions, active states)
- **Golden Oolong:** `#B8860B` (secondary actions, highlights) 
- **Steeping Amber:** `#D2691E` (active brewing, warm feedback)

**Neutral Palette:**
- **Soft Black:** `#2D2D2D` (primary text)
- **Clay Gray:** `#6B6B6B` (secondary text)
- **Mist Gray:** `#A8A8A8` (tertiary text, disabled)
- **Steam White:** `#FAFAFA` (backgrounds)
- **Porcelain:** `#F5F5F0` (card backgrounds)

**Functional Colors:**
- **Success Tea:** `#22C55E` (confirmations, completed sessions)
- **Warning Amber:** `#F59E0B` (cautions, timer alerts)
- **Error Red:** `#EF4444` (errors, destructive actions)

**Brewing State Colors:**
- **Preparation:** `#E5E7EB` (inactive/preparing)
- **Active Brew:** `#FCD34D` (timer running, gentle pulsing)
- **Complete:** `#10B981` (session finished)

### Typography Scale

**Font Stack:**
- **Primary:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Accent:** `'Georgia', 'Times New Roman', serif` (headings only)
- **Monospace:** `'SF Mono', Consolas, monospace` (timer digits, parameters)

**Type Scale:**
- **Display:** 32px / 700 weight / 38px line-height (onboarding, celebrations)
- **H1:** 24px / 600 weight / 30px line-height (screen titles)
- **H2:** 20px / 600 weight / 26px line-height (section headers)
- **H3:** 18px / 500 weight / 24px line-height (subsections)
- **Body Large:** 16px / 400 weight / 24px line-height (primary content)
- **Body:** 14px / 400 weight / 20px line-height (standard text)
- **Caption:** 12px / 400 weight / 16px line-height (metadata, timestamps)
- **Timer Display:** 48px / 300 weight / 52px line-height (main timer)

### Spacing Scale (8px Base Grid)
- **xs:** 4px (tight spacing, icon padding)
- **sm:** 8px (component internal spacing)
- **md:** 16px (standard component spacing)
- **lg:** 24px (section spacing)
- **xl:** 32px (screen margins)
- **xxl:** 48px (major section breaks)
- **xxxl:** 64px (screen-level spacing)

### Motion & Animation Tokens

**Duration:**
- **Fast:** 150ms (micro-interactions, hovers)
- **Standard:** 300ms (state changes, transitions)
- **Slow:** 500ms (screen transitions, major state changes)
- **Brewing:** 1000ms (tea ceremony pace, celebrations)

**Easing Functions:**
- **Standard:** `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (natural movement)
- **Accelerate:** `cubic-bezier(0.55, 0, 1, 0.45)` (exit animations)
- **Decelerate:** `cubic-bezier(0, 0.55, 0.45, 1)` (enter animations)
- **Tea Flow:** `cubic-bezier(0.165, 0.84, 0.44, 1)` (zen-like, organic feel)

### Border Radius & Shadows

**Border Radius:**
- **Subtle:** 4px (tags, small buttons)
- **Standard:** 8px (cards, inputs)
- **Rounded:** 12px (primary buttons)
- **Pill:** 24px (toggle buttons)
- **Circle:** 50% (avatar, floating actions)

**Shadow Elevation:**
- **Level 0:** `none` (flat elements)
- **Level 1:** `0 1px 3px rgba(45, 45, 45, 0.12)` (cards)
- **Level 2:** `0 4px 6px rgba(45, 45, 45, 0.1)` (modals, dropdowns)
- **Level 3:** `0 10px 15px rgba(45, 45, 45, 0.1)` (floating elements)

## Consistency Strategy

**Tokenization:** All spacing, colors, typography, and motion values extracted to `/theme/tokens.ts`

**Variant System:** Consistent variant prop across all components (`<Button variant="primary" />`)

**Component Documentation:** Each component includes usage README with examples and guidelines

**Design-Dev Mapping:** Figma components mirror React Native props for seamless handoff
