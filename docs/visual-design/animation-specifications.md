# Animation Specifications

## 1. Tea Flow Easing Curves

```css
/* CSS Custom Easing */
--easing-tea-flow: cubic-bezier(0.165, 0.84, 0.44, 1);
--easing-standard: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--easing-accelerate: cubic-bezier(0.55, 0, 1, 0.45);
--easing-decelerate: cubic-bezier(0, 0.55, 0.45, 1);
```

## 2. Timer Progress Animation

```jsx
// React Native Animated Implementation
const progressAnimation = useRef(new Animated.Value(0)).current;

const startTimer = () => {
  Animated.timing(progressAnimation, {
    toValue: 1,
    duration: timerDuration * 1000,
    easing: Easing.linear,
    useNativeDriver: false,
  }).start();
};

// Animated circle stroke
const animatedStrokeDasharray = progressAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: ['0 565', '565 565'],
});
```

## 3. Button Press Animation

```jsx
const ButtonPress = ({ children, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};
```
