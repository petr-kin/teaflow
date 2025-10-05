# 3. Core Product Requirements

## 3.1 Gesture-Based Timer Interface

**Interaction Model:**
```
┌─────────────────────────────────┐
│                                 │
│     [Animated Tea Visual]       │
│                                 │
│  Left Edge        Right Edge    │
│   (-10s)           (+10s)       │
│                                 │
│      Center Tap = Start/Pause   │
│      Long Press = Reset         │
│      Double Tap = Next Steep    │
│                                 │
└─────────────────────────────────┘
```

**Gesture Specifications:**

| Gesture | Action | Feedback | Implementation |
|---------|--------|----------|----------------|
| Center Tap | Toggle timer | Haptic + visual pulse | GestureDetector.Tap() |
| Edge Tap Left | -10 seconds | Haptic + "-10s" overlay | X < screen.width * 0.2 |
| Edge Tap Right | +10 seconds | Haptic + "+10s" overlay | X > screen.width * 0.8 |
| Long Press (1s) | Reset timer | Strong haptic + fade | GestureDetector.LongPress() |
| Double Tap | Next steep | Haptic + steep counter | numberOfTaps(2) |
| Swipe Left/Right | Prev/Next steep | Smooth transition | GestureDetector.Pan() |
| Pinch | Vessel size (110-500ml) | Size indicator | scale gesture |
| Twist | Temperature (±5°C) | Temp overlay | rotation gesture |

## 3.2 Living Tea Metaphor Animations (Layered Architecture)

**Proven Hybrid Architecture:**
```
┌─────────────────────────┐
│   Gesture Layer         │ ← react-native-gesture-handler (transparent)
├─────────────────────────┤
│   Feedback Layer        │ ← Subtle overlays, parameter changes
├─────────────────────────┤
│   Animation Layer       │ ← SVG + react-native-reanimated
├─────────────────────────┤
│   Background Layer      │ ← Tea/zen backgrounds, static or simple
└─────────────────────────┘
```

**Core Visual Metaphor (from Analogical Analysis):**
- **Floating hourglass** that feels alive, not rigidly mechanical
- **Sand replaced by tea leaves and steam** drifting downward
- **Lava lamp hypnotic quality** with natural variability
- **Weather app dynamics** - intensity changes naturally
- **Fireplace endless loops** - designed to run for hours

**Animation Parameters (Gesture-Controllable):**
- `leafSpeed: 0.3 → 0.7 → 0.2` - Drift velocity through phases
- `steamIntensity: 0.1 → 0.6 → 0.3` - Density and rise speed
- `sandFlowRate: 0.5 → 1.0 → 0.3` - Hourglass particle speed
- `colorSaturation: 0.2 → 0.7 → 0.9` - Tea infusion intensity

**Dynamic Intensity Phases:**

**Phase 1: Start (0 → 20%)**
- Color: Pale tea (light jade for green, light amber for black)
- Leaves: 2-3 faint leaves slowly drifting
- Steam: Very subtle wisps, occasional pulses
- Mood: Calm, almost still

**Phase 2: Mid-Brew (20% → 80%)**
- Color: Gradually intensifying, water turns richer
- Leaves: Many more leaves, drifting faster, lava lamp swirls
- Steam: More visible, rising in soft curls
- Motion: Slight acceleration (fitness "work" phase)

**Phase 3: Finish (80% → 100%)**
- Color: Fully saturated brew color, stable
- Leaves: Motion slows, leaves settle near bottom
- Steam: Fades gradually, leaving faint traces
- Cue: Soft glow + gentle gong at T-0

## 3.3 Anticipatory Learning Engine

**Learning Dimensions:**

1. **Time Adjustments** - Track consistent ±time modifications
2. **Temperature Preferences** - Learn preferred temp by tea type
3. **Strength Patterns** - Understand strong/weak preferences
4. **Context Patterns** - Time of day, day of week correlations
5. **Weather Correlation** - Tea choice based on weather
6. **Sequence Patterns** - Common tea progressions

**Prediction Model:**
```javascript
predictNextTea() {
  factors = {
    timeOfDay: 0.3,
    lastTea: 0.2,
    weather: 0.15,
    dayOfWeek: 0.15,
    userHistory: 0.2
  }
  return weightedPrediction(factors)
}
```

## 3.4 OCR Package Scanner

**Extraction Requirements:**
- Tea name recognition: 95% accuracy
- Brewing time extraction: 90% accuracy
- Temperature detection: 85% accuracy
- Multi-language support: English, Chinese, Japanese

**Processing Flow:**
1. Camera capture → 2. Image preprocessing → 3. OCR extraction → 
4. Pattern matching → 5. Confidence scoring → 6. User confirmation

**Fallback Strategy:**
- Manual correction interface
- Learning from corrections
- Template matching for common brands

## 3.5 Quick Access & Memory

**State Persistence:**
```javascript
{
  lastTea: {
    id: "oolong_phoenix",
    vessel: 150,
    temp: 90,
    lastBrewed: timestamp,
    adjustments: {time: +5, temp: -2}
  },
  predictions: {
    morning: "green_sencha",
    afternoon: "black_earl_grey",
    evening: "herbal_chamomile"
  }
}
```

**Launch Behavior:**
1. App opens to last tea with saved adjustments
2. Single tap starts brewing immediately
3. Swipe reveals predicted alternatives
4. No menus or configuration needed
