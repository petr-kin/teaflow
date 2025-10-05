# Phase 1 Rollback Procedures - TeaFlow BMAD Alignment

**Document Version:** 1.0  
**Date:** 2025-09-11  
**Purpose:** Emergency rollback procedures for each Phase 1 story to restore previous functionality  
**Author:** Sarah (Product Owner)

## 🚨 Emergency Rollback Protocol

**WHEN TO TRIGGER ROLLBACK:**
- App crashes on startup after theme changes
- Animation system causes performance degradation >50%
- User reports inability to use core timer functionality
- Visual changes break accessibility
- Cross-platform rendering failures

**ROLLBACK AUTHORITY:** Any team member can trigger rollback for P0 issues

---

## Story 1.1: Tea-Inspired Theme System Rollback

### Files Modified in Story 1.1:
- `lib/theme.ts` - Color definitions
- All component style references using theme colors

### Rollback Procedure:

#### Step 1: Immediate Git Revert
```bash
# Revert theme system changes (replace COMMIT_HASH with actual commit)
git revert COMMIT_HASH --no-edit

# If multiple commits, revert range
git revert HEAD~3..HEAD --no-edit

# Push revert immediately
git push origin main
```

#### Step 2: Verify Core Functionality
```bash
# Test app startup
npm run start
# Open app and verify:
# - App launches without crashes
# - Timer screen accessible
# - Tea selection functional
# - No white screens or UI breaks
```

#### Step 3: Manual Color Restoration (if git revert fails)
```typescript
// lib/theme.ts - Restore original colors
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F1412',        // RESTORE: Was tea-inspired porcelain
    surface: '#1A2F23',          // RESTORE: Was steamWhite  
    primary: '#2F7A55',          // RESTORE: Was teaGreen
    text: '#FFFFFF',             // RESTORE: Was softBlack
    textSecondary: 'rgba(255,255,255,0.7)', // RESTORE: Was clayGray
    // ... restore all original colors from git history
  }
};
```

#### Step 4: Component Style Cleanup
```bash
# Search for hardcoded tea colors that need restoration
grep -r "teaGreen\|goldenOolong\|steepingAmber\|softBlack\|clayGray" components/
grep -r "porcelain\|steamWhite\|mistGray" components/

# Replace any hardcoded values with theme references
```

#### Step 5: Cache Clearing
```bash
# Clear all caches to ensure clean state
npx expo start --clear
rm -rf node_modules/.cache
rm -rf .expo
```

### Rollback Validation:
- [ ] App launches successfully on web
- [ ] App launches successfully on iOS simulator  
- [ ] App launches successfully on Android emulator
- [ ] Timer functionality works end-to-end
- [ ] All modals open without crashes
- [ ] Color scheme matches pre-change screenshots

### Expected Time: **5-15 minutes**

---

## Story 1.2: Organic Motion Animation System Rollback

### Files Modified in Story 1.2:
- Animation timing curves in components
- Easing functions throughout app
- Spring animation implementations

### Rollback Procedure:

#### Step 1: Git Revert Animation Changes
```bash
git revert ANIMATION_COMMIT_HASH --no-edit
git push origin main
```

#### Step 2: Manual Animation Restoration
```typescript
// Restore mechanical timing (example pattern)
// FROM: Organic animations
Animated.timing(value, {
  toValue: 1,
  duration: 400,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // REMOVE
  useNativeDriver: true,
});

// TO: Original mechanical timing  
Animated.timing(value, {
  toValue: 1,
  duration: 200,
  easing: Easing.linear, // RESTORE
  useNativeDriver: true,
});
```

#### Step 3: Performance Validation
```bash
# Test animation performance
# - Timer countdown smooth
# - Modal transitions smooth
# - No frame drops during interactions
# - Battery usage normal
```

### Rollback Validation:
- [ ] All animations perform at 30+ fps
- [ ] No animation-related crashes
- [ ] Timer countdown visually smooth
- [ ] Modal transitions functional

### Expected Time: **10-20 minutes**

---

## Story 1.3: Tea-Inspired Component Styling Rollback

### Files Modified in Story 1.3:
- Component style definitions
- Typography implementations  
- App.tsx styling updates

### Rollback Procedure:

#### Step 1: Git Revert Component Styling
```bash
git revert STYLING_COMMIT_HASH --no-edit
git push origin main
```

#### Step 2: Manual Style Restoration
```typescript
// App.tsx - Restore original timer container styling
const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F1412', // RESTORE: Remove porcelain reference
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200', 
    letterSpacing: 4,
    color: '#FFFFFF', // RESTORE: Remove softBlack reference
  }
});
```

#### Step 3: Component Style Cleanup
```bash
# Find and fix any broken style references
grep -r "theme.colors.teaGreen\|theme.colors.steepingAmber" components/
# Replace with original theme references
```

### Rollback Validation:
- [ ] All components render correctly
- [ ] Text is readable with proper contrast
- [ ] Timer interface displays properly
- [ ] No styling-related crashes

### Expected Time: **5-10 minutes**

---

## Story 1.4: Visual Design System Integration Testing Rollback

### Files Modified in Story 1.4:
- Test files and configurations
- Performance monitoring code
- Cross-platform validation scripts

### Rollback Procedure:

#### Step 1: Remove Testing Infrastructure
```bash
# Revert test-related changes
git revert TESTING_COMMIT_HASH --no-edit

# Remove any temporary test files
rm -rf visual-tests/
rm -f performance-baseline.json
```

#### Step 2: Clean Build
```bash
npx expo start --clear
```

### Expected Time: **2-5 minutes**

---

## Full Phase 1 Nuclear Rollback

**USE ONLY IF:** Multiple stories are broken and individual rollbacks fail

### Procedure:
```bash
# Find the commit before Phase 1 began
git log --oneline | grep -B5 -A5 "Phase 1"

# Hard reset to pre-Phase 1 state (DESTRUCTIVE)
git reset --hard PRE_PHASE_1_COMMIT_HASH

# Force push (DANGEROUS - coordinate with team)
git push --force-with-lease origin main

# Rebuild completely
rm -rf node_modules .expo
npm install
npx expo start --clear
```

### Nuclear Rollback Validation:
- [ ] App identical to pre-Phase 1 state
- [ ] All functionality working
- [ ] Performance baseline restored
- [ ] Visual appearance matches baseline screenshots

### Expected Time: **15-30 minutes**

---

## Communication Protocol

### Immediate Notifications (within 5 minutes of rollback):
1. **Slack/Discord:** "🚨 ROLLBACK: Phase 1 Story X.X rolled back due to [REASON]"
2. **Team Email:** Include rollback reason, impact, and resolution timeline
3. **User Communications:** If users affected, prepare hotfix notification

### Post-Rollback Actions (within 24 hours):
1. **Root Cause Analysis:** Why did the story fail?
2. **Prevention Plan:** How to prevent similar issues?
3. **Re-implementation Strategy:** When/how to retry the story?
4. **Testing Improvements:** What tests would have caught this?

---

## Rollback Decision Matrix

| Issue Severity | Rollback Speed | Authority Required |
|---------------|----------------|-------------------|
| P0 - App won't start | Immediate (<5 min) | Any team member |
| P0 - Core timer broken | Immediate (<10 min) | Any team member |
| P1 - Visual regression | Within 30 min | PO or Tech Lead approval |
| P1 - Performance degradation | Within 1 hour | PO or Tech Lead approval |
| P2 - Minor visual issues | Next business day | PO approval |

---

## Emergency Contacts

**Rollback Authority:**
- Sarah (Product Owner): Immediate approval for any rollback
- Tech Lead: Immediate approval for technical rollbacks
- Any Developer: Can execute P0 rollbacks without approval

**Communication Channels:**
- Slack: #teaflow-alerts (immediate notifications)
- Email: team@teaflow.app (detailed updates)
- Phone: Emergency contact list (P0 issues only)

---

**This document ensures Phase 1 changes can be safely reverted within minutes if issues arise, protecting user experience and development velocity.**