# Gesture Controller

**Responsibility:** Processes touch gestures for timer control and brewing parameter adjustments

**Key Interfaces:**
- onSwipeGesture: (direction: SwipeDirection) => void
- onPinchGesture: (scale: number) => void
- onPressGesture: (duration: number) => void

**Dependencies:** React Native Reanimated, haptic feedback system

**Technology Stack:** React Native Gesture Handler with Reanimated worklets for 120fps response
