# Gesture Implementation

## 1. Timer Adjustment Gestures

```jsx
const TimerGestures = ({ onTemperatureChange, onVolumeChange }) => {
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      
      // Vertical gesture for temperature
      if (Math.abs(dy) > Math.abs(dx)) {
        const tempChange = -dy / 10; // Invert for intuitive up/down
        onTemperatureChange(tempChange);
      }
      
      // Horizontal gesture for volume
      if (Math.abs(dx) > Math.abs(dy)) {
        const volumeChange = dx / 10;
        onVolumeChange(volumeChange);
      }
    },
  });
  
  return (
    <View {...panResponder.panHandlers} style={styles.gestureArea}>
      {/* Timer display content */}
    </View>
  );
};
```

## 2. Swipe Navigation

```jsx
const SwipeNavigation = ({ onSwipeLeft, onSwipeRight }) => {
  const swipeGesture = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50) {
        onSwipeRight();
      } else if (gestureState.dx < -50) {
        onSwipeLeft();
      }
    },
  });
  
  return (
    <View {...swipeGesture.panHandlers} style={styles.swipeArea}>
      {/* Screen content */}
    </View>
  );
};
```
