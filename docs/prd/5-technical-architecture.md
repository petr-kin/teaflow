# 5. Technical Architecture

## 5.1 Technology Stack

**Core Framework:**
- React Native 0.79.5 + Expo SDK 53
- TypeScript for type safety
- React Native Reanimated 3 for gestures
- Skia for GPU-accelerated graphics

**Key Libraries:**
```javascript
{
  "react-native-gesture-handler": "^2.24.0",
  "@shopify/react-native-skia": "^2.2.6",
  "react-native-vision-camera": "^3.0.0",
  "ml-kit-text-recognition": "^1.0.0"
}
```

## 5.2 Performance Requirements (from Implementation Roadmap)

**Critical Performance Targets:**
- **Timer Accuracy:** ≤0.2s/min drift cross-platform (CRITICAL)
- **Animation:** 30fps sustained during 3-minute sessions
- **Gesture Accuracy:** >95% recognition rate (CRITICAL)
- **Battery Drain:** <2% per brewing session
- **Memory Usage:** <100MB active, no accumulation

**Cross-Platform Consistency:**
- **iOS:** 60fps capable but 30fps sufficient for zen
- **Android:** Plan for 30fps due to potential stutter
- **Background State:** Timer remains consistent when backgrounded

**Performance Optimization Strategy:**
```typescript
const deviceTier = getDevicePerformanceTier();
const animationComplexity = deviceTier === 'low' ? 0.5 : 1.0;
const leafCount = Math.floor(20 * animationComplexity);
const steamParticles = Math.floor(15 * animationComplexity);
```

## 5.3 Data Architecture

**Local Storage Schema:**
```typescript
interface TeaFlowData {
  teas: Tea[]
  sessions: BrewSession[]
  preferences: UserPreferences
  predictions: PredictionModel
  ocr: {
    templates: OCRTemplate[]
    corrections: Correction[]
  }
}
```

**Sync Strategy:**
- Offline-first with optional cloud backup
- Conflict resolution: Last-write-wins
- Data compression for cloud storage
- End-to-end encryption for privacy
