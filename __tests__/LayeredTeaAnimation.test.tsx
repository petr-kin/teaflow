import React from 'react';
import { render } from '@testing-library/react-native';
import LayeredTeaAnimation from '../components/graphics/LayeredTeaAnimation';

// Mock react-native-skia
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: ({ children }: any) => children,
  Circle: () => null,
  Group: ({ children }: any) => children,
  LinearGradient: () => null,
  vec: () => ({ x: 0, y: 0 }),
  Skia: {
    Path: {
      MakeFromSVGString: () => null
    }
  },
  Path: () => null,
  Rect: () => null,
  Blur: () => null,
  Mask: () => null
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useDerivedValue: (fn: () => any) => ({ value: fn() }),
  useSharedValue: (initial: any) => ({ value: initial }),
  withRepeat: (animation: any) => animation,
  withTiming: (value: any) => value,
  Easing: {
    bezier: () => 'bezier'
  },
  runOnJS: (fn: any) => fn
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Tap: () => ({
      numberOfTaps: () => ({
        onStart: () => ({})
      }),
      onStart: () => ({})
    }),
    LongPress: () => ({
      minDuration: () => ({
        onStart: () => ({})
      })
    }),
    Exclusive: () => ({})
  },
  GestureDetector: ({ children }: any) => children
}));

// Mock theme
jest.mock('../lib/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      accent: '#FF9500',
      textSecondary: '#666666'
    }
  })
}));

describe('LayeredTeaAnimation', () => {
  const defaultProps = {
    width: 220,
    height: 200,
    temperature: 85,
    brewingTime: 0,
    teaType: 'green',
    isRunning: false
  };

  it('renders without crashing', () => {
    const { getByTestId } = render(<LayeredTeaAnimation {...defaultProps} />);
    // The component should render a View container
    expect(() => render(<LayeredTeaAnimation {...defaultProps} />)).not.toThrow();
  });

  it('handles different tea types correctly', () => {
    const teaTypes = ['green', 'black', 'oolong', 'white', 'puerh', 'herbal'];
    
    teaTypes.forEach(teaType => {
      expect(() => render(
        <LayeredTeaAnimation 
          {...defaultProps} 
          teaType={teaType} 
        />
      )).not.toThrow();
    });
  });

  it('responds to isRunning state changes', () => {
    const { rerender } = render(<LayeredTeaAnimation {...defaultProps} />);
    
    // Should not throw when switching to running state
    rerender(<LayeredTeaAnimation {...defaultProps} isRunning={true} />);
    
    // Should not throw when switching back to stopped state
    rerender(<LayeredTeaAnimation {...defaultProps} isRunning={false} />);
  });

  it('handles gesture callbacks when provided', () => {
    const mockGestureCallback = jest.fn();
    
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        onGesture={mockGestureCallback}
      />
    )).not.toThrow();
  });

  it('works with different brewing phases', () => {
    // Start phase (0-20%)
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        brewingTime={10}
      />
    )).not.toThrow();

    // Mid phase (20-80%)
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        brewingTime={60}
      />
    )).not.toThrow();

    // Finish phase (80-100%)
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        brewingTime={100}
      />
    )).not.toThrow();
  });

  it('handles temperature variations', () => {
    // Below steam threshold
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        temperature={70}
      />
    )).not.toThrow();

    // Above steam threshold
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        temperature={90}
      />
    )).not.toThrow();
  });

  it('works with showFeedback disabled', () => {
    expect(() => render(
      <LayeredTeaAnimation 
        {...defaultProps} 
        showFeedback={false}
      />
    )).not.toThrow();
  });
});