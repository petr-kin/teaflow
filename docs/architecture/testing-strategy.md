# Testing Strategy

## Testing Pyramid

```
    E2E Tests (Detox)
    /              \
  Integration Tests  
  /                \
Unit Tests      Component Tests
(Jest)           (Testing Library)
```

## Test Organization

```
__tests__/
├── components/             # Component unit tests
│   ├── ui/
│   ├── graphics/
│   └── screens/
├── lib/                   # Business logic tests
│   ├── store.test.ts
│   ├── timer.test.ts
│   └── learning.test.ts
├── hooks/                 # Custom hook tests
│   ├── useTimer.test.ts
│   └── useGestures.test.ts
└── e2e/                   # End-to-end tests
    ├── tea-selection.e2e.ts
    ├── timer-flow.e2e.ts
    └── brewing-session.e2e.ts
```

```
cloud-api/tests/
├── routes/                # API endpoint tests
│   ├── sync.test.ts
│   └── auth.test.ts
├── services/              # Service layer tests
│   ├── storage.test.ts
│   └── encryption.test.ts
└── integration/           # Full API integration tests
    └── sync-flow.test.ts
```

```
e2e/                       # Cross-platform E2E tests
├── ios/
├── android/
└── shared/
    ├── tea-timer.spec.ts
    ├── gesture-controls.spec.ts  
    └── offline-sync.spec.ts
```

## Test Examples

```typescript
// Component test example
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimerDisplay } from '../src/components/TimerDisplay';

describe('TimerDisplay', () => {
  it('displays time in MM:SS format', () => {
    const { getByText } = render(
      <TimerDisplay seconds={125} isRunning={false} />
    );
    
    expect(getByText('02:05')).toBeTruthy();
  });
  
  it('calls onStart when play button pressed', () => {
    const onStart = jest.fn();
    const { getByLabelText } = render(
      <TimerDisplay seconds={60} isRunning={false} onStart={onStart} />
    );
    
    fireEvent.press(getByLabelText('Start timer'));
    expect(onStart).toHaveBeenCalled();
  });
});
```

```typescript
// API test example  
import request from 'supertest';
import { app } from '../src/server';

describe('POST /api/sync', () => {
  it('saves user data when authenticated', async () => {
    const userData = { teas: [], sessions: [] };
    const token = await getValidAuthToken();
    
    const response = await request(app)
      .post('/api/sync')
      .set('Authorization', `Bearer ${token}`)
      .send(userData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
  
  it('returns 401 without valid token', async () => {
    await request(app)
      .post('/api/sync')
      .send({})
      .expect(401);
  });
});
```

```typescript  
// E2E test example
describe('Tea Brewing Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full brewing session', async () => {
    // Select tea
    await element(by.text('Green Tea')).tap();
    
    // Start timer
    await element(by.id('startTimerButton')).tap();
    
    // Verify timer is running
    await expect(element(by.id('timerDisplay'))).toBeVisible();
    
    // Wait for completion (using shorter timer for testing)
    await waitFor(element(by.text('Steep Complete!')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Rate the brew
    await element(by.id('enjoymentRating')).tap();
    await element(by.text('Perfect')).tap();
    
    // Verify session saved
    await expect(element(by.text('Session saved'))).toBeVisible();
  });
});
```
