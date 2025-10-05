# Usage in Your Existing Screens

## Integrating with TeaLibraryScreen.tsx

```tsx
// Update your existing TeaLibraryScreen.tsx
import { TeaCard } from './base/TeaCard';
import { Button } from './base/Button';
import { useEnhancedTheme } from '../lib/enhanced-theme';

// In your render method:
<FlatList
  data={teas}
  numColumns={2}
  renderItem={({ item }) => (
    <TeaCard
      tea={item}
      onPress={handleTeaSelect}
      onLongPress={handleTeaEdit}
      style={{ margin: theme.spacing.sm }}
    />
  )}
  contentContainerStyle={{ padding: theme.spacing.md }}
/>
```

## Integrating with RealisticCupInterface.tsx

```tsx
// Enhance your existing RealisticCupInterface.tsx
import { EnhancedTimerDisplay } from './enhanced/EnhancedTimerDisplay';
import { EnhancedGestureOverlay } from './enhanced/EnhancedGestureOverlay';

// Replace your timer display with:
<EnhancedGestureOverlay
  onTemperatureChange={handleTemperatureChange}
  onVolumeChange={handleVolumeChange}
  onTimerAdjust={handleTimerAdjust}
  currentTemp={currentTemperature}
  currentVolume={currentVesselSize}
>
  <EnhancedTimerDisplay
    timeRemaining={currentTimer}
    totalTime={initialTimer}
    isActive={isRunning}
    currentSteep={currentSteep}
    totalSteeps={totalSteeps}
    onTimerComplete={handleTimerComplete}
  />
</EnhancedGestureOverlay>
```

This implementation guide provides enhanced components that integrate seamlessly with your existing codebase while implementing the comprehensive design system from the specification. The components use your existing theme system, gesture handling, and responsive design patterns.