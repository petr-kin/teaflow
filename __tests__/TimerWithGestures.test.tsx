import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TimerWithGestures from '../components/TimerWithGestures';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => require('react-native-gesture-handler/jestSetup'));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock responsive view
jest.mock('../components/ResponsiveView', () => ({
  useResponsive: () => ({
    isPhone: true,
    isTablet: false,
    spacing: (n: number) => n,
    fontSize: (n: number) => n,
  }),
}));

describe('TimerWithGestures', () => {
  const mockProps = {
    timerSeconds: 120,
    isRunning: false,
    onReset: jest.fn(),
    onAddTime: jest.fn(),
    onNextSteep: jest.fn(),
    onPrevSteep: jest.fn(),
    canGoNext: true,
    canGoPrev: false,
    onStartPause: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders timer display correctly', () => {
    const { getByText } = render(<TimerWithGestures {...mockProps} />);
    expect(getByText('2:00')).toBeTruthy();
  });

  it('displays gesture hints for users', () => {
    const { getByText } = render(<TimerWithGestures {...mockProps} />);
    expect(getByText(/Long press: Reset/)).toBeTruthy();
    expect(getByText(/Double tap: Next/)).toBeTruthy();
    expect(getByText(/Edge: ±10s/)).toBeTruthy();
  });

  it('formats timer display correctly for different durations', () => {
    const { rerender, getByText } = render(<TimerWithGestures {...mockProps} />);
    
    // Test 2 minutes
    expect(getByText('2:00')).toBeTruthy();
    
    // Test 1 minute 30 seconds
    rerender(<TimerWithGestures {...mockProps} timerSeconds={90} />);
    expect(getByText('1:30')).toBeTruthy();
    
    // Test 5 seconds
    rerender(<TimerWithGestures {...mockProps} timerSeconds={5} />);
    expect(getByText('0:05')).toBeTruthy();
  });

  it('shows edge indicators for time adjustment', () => {
    const { getByText } = render(<TimerWithGestures {...mockProps} />);
    expect(getByText('-10s')).toBeTruthy();
    expect(getByText('+10s')).toBeTruthy();
  });

  it('handles gesture state correctly when canGoNext/canGoPrev changes', () => {
    const { rerender, getByText } = render(
      <TimerWithGestures {...mockProps} canGoNext={false} canGoPrev={true} />
    );
    
    // Should render properly regardless of navigation state
    expect(getByText('2:00')).toBeTruthy();
    
    // Test state change
    rerender(<TimerWithGestures {...mockProps} canGoNext={true} canGoPrev={false} />);
    expect(getByText('2:00')).toBeTruthy();
  });

  it('updates display when isRunning changes', () => {
    const { rerender, getByText } = render(<TimerWithGestures {...mockProps} />);
    
    // Should render when not running
    expect(getByText('2:00')).toBeTruthy();
    
    // Should render when running  
    rerender(<TimerWithGestures {...mockProps} isRunning={true} />);
    expect(getByText('2:00')).toBeTruthy();
  });
});