# Testing Strategy

## Testing Pyramid

```
                E2E Tests (Detox)
               /                 \
           Integration Tests
          /                    \
    Jest Unit Tests      Component Tests
```

**Test Distribution:**
- **70% Unit Tests:** Fast, isolated testing of functions and components
- **20% Integration Tests:** API integration and service interaction testing  
- **10% E2E Tests:** Critical user journey validation with device simulation

## Test Organization

### Frontend Tests
```
src/
├── components/
│   ├── Timer/
│   │   ├── Timer.tsx
│   │   └── __tests__/
│   │       ├── Timer.test.tsx           # Component behavior
│   │       ├── Timer.integration.test.tsx  # Timer with services
│   │       └── Timer.snapshot.test.tsx  # UI regression
│   └── TeaLibrary/
│       ├── TeaLibrary.tsx
│       └── __tests__/
│           ├── TeaLibrary.test.tsx
│           └── TeaLibrary.accessibility.test.tsx
├── services/
│   ├── TimerService/
│   │   ├── TimerService.ts
│   │   └── __tests__/
│   │       ├── TimerService.test.ts     # Logic validation
│   │       └── TimerService.mock.ts     # Test doubles
└── hooks/
    ├── useTimer/
    │   ├── useTimer.ts
    │   └── __tests__/
    │       └── useTimer.test.tsx        # Hook behavior testing
```

### E2E Tests
```
e2e/
├── tests/
│   ├── critical-flows/
│   │   ├── tea-timer-complete-flow.e2e.js    # Full timer workflow
│   │   ├── tea-library-browse.e2e.js         # Library navigation
│   │   └── settings-configuration.e2e.js     # App configuration
│   ├── regression/
│   │   ├── gesture-interactions.e2e.js       # Touch and swipe testing
│   │   ├── background-behavior.e2e.js        # App backgrounding
│   │   └── orientation-changes.e2e.js        # Device rotation
│   └── accessibility/
│       ├── screen-reader.e2e.js              # VoiceOver/TalkBack
│       └── high-contrast.e2e.js              # Visual accessibility
├── fixtures/
│   ├── tea-data.json                         # Test tea varieties
│   ├── user-preferences.json                 # Mock user settings
│   └── timer-configurations.json             # Timer test scenarios
└── helpers/
    ├── device-helpers.js                     # Device simulation utilities
    ├── tea-helpers.js                        # Tea-specific test utilities
    └── timer-helpers.js                      # Timer testing utilities
```

## Test Examples

### Frontend Component Test
```typescript
// src/components/Timer/__tests__/Timer.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Timer } from '../Timer';
import { TimerProvider } from '../../../contexts/TimerContext';

describe('Timer Component', () => {
  const mockTimerConfig = {
    duration: 180000, // 3 minutes
    teaType: 'green',
    temperature: 80
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start timer countdown when play button is pressed', async () => {
    const { getByTestId, getByText } = render(
      <TimerProvider>
        <Timer config={mockTimerConfig} />
      </TimerProvider>
    );

    const playButton = getByTestId('timer-play-button');
    fireEvent.press(playButton);

    await waitFor(() => {
      expect(getByText('02:59')).toBeTruthy();
    });

    // Advance timer by 1 second
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(getByText('02:58')).toBeTruthy();
    });
  });

  it('should trigger haptic feedback on timer completion', async () => {
    const mockHapticFeedback = jest.fn();
    
    const { getByTestId } = render(
      <TimerProvider hapticFeedback={mockHapticFeedback}>
        <Timer config={{...mockTimerConfig, duration: 1000}} />
      </TimerProvider>
    );

    fireEvent.press(getByTestId('timer-play-button'));
    
    // Fast-forward to timer completion
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockHapticFeedback).toHaveBeenCalledWith('success');
    });
  });
});
```

### E2E Test
```javascript
// e2e/tests/critical-flows/tea-timer-complete-flow.e2e.js
describe('Complete Tea Timer Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete a full tea brewing session', async () => {
    // Navigate to tea library
    await element(by.id('tab-library')).tap();
    
    // Select a tea variety
    await element(by.id('tea-green-dragon-well')).tap();
    
    // Verify tea details screen
    await expect(element(by.text('Dragon Well Green Tea'))).toBeVisible();
    await expect(element(by.text('80°C • 3 minutes'))).toBeVisible();
    
    // Start brewing timer
    await element(by.id('start-brewing-button')).tap();
    
    // Verify timer screen is displayed
    await expect(element(by.id('timer-display'))).toBeVisible();
    await expect(element(by.text('03:00'))).toBeVisible();
    
    // Test pause/resume functionality
    await element(by.id('timer-pause-button')).tap();
    await expect(element(by.id('timer-play-button'))).toBeVisible();
    
    await element(by.id('timer-play-button')).tap();
    
    // Wait for timer to count down (accelerated for testing)
    await device.setURLBlacklist(['.*']); // Disable network for predictable timing
    await device.shake(); // Simulate timer completion
    
    // Verify completion notification
    await expect(element(by.text('Tea is ready!'))).toBeVisible();
    await expect(element(by.id('timer-complete-actions'))).toBeVisible();
    
    // Test rating functionality
    await element(by.id('rating-5-stars')).tap();
    await element(by.id('save-brewing-session')).tap();
    
    // Verify return to home screen
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```
