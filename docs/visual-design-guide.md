# TeaFlow Visual Design Guide

## Design Token Implementation

### Color Tokens (CSS/React Native)
```css
/* Primary Colors */
--tea-green: #4A6741;
--golden-oolong: #B8860B;
--steeping-amber: #D2691E;

/* Neutral Palette */
--soft-black: #2D2D2D;
--clay-gray: #6B6B6B;
--mist-gray: #A8A8A8;
--steam-white: #FAFAFA;
--porcelain: #F5F5F0;

/* Functional Colors */
--success-tea: #22C55E;
--warning-amber: #F59E0B;
--error-red: #EF4444;

/* Brewing States */
--preparation: #E5E7EB;
--active-brew: #FCD34D;
--complete: #10B981;
```

### Typography Tokens
```css
/* Font Families */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-accent: 'Georgia', 'Times New Roman', serif;
--font-mono: 'SF Mono', Consolas, monospace;

/* Type Scale */
--text-display: 32px;
--text-h1: 24px;
--text-h2: 20px;
--text-h3: 18px;
--text-body-large: 16px;
--text-body: 14px;
--text-caption: 12px;
--text-timer: 48px;
```

### Spacing Tokens
```css
/* Spacing Scale */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-xxl: 48px;
--space-xxxl: 64px;
```

## Component Specifications

### 1. Primary Button Component

```jsx
// React Native Implementation
<TouchableOpacity style={styles.primaryButton}>
  <Text style={styles.primaryButtonText}>Start Brewing</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#4A6741',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

### 2. Tea Card Component

```jsx
// Tea Card with Image and Info
const TeaCard = ({ tea, onPress }) => (
  <TouchableOpacity style={styles.teaCard} onPress={onPress}>
    <Image source={tea.image} style={styles.teaImage} />
    <View style={styles.teaInfo}>
      <Text style={styles.teaName}>{tea.name}</Text>
      <Text style={styles.teaDetails}>{tea.temperature}°C • {tea.steeps} steeps</Text>
      <View style={styles.teaTags}>
        {tea.tags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  teaCard: {
    backgroundColor: '#F5F5F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  teaImage: {
    width: '100%',
    height: 120,
    borderRadius: 4,
    marginBottom: 12,
  },
  teaName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  teaDetails: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  teaTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#4A6741',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
```

### 3. Timer Display Component

```jsx
// Circular Timer with Progress Ring
const TimerDisplay = ({ timeRemaining, totalTime, isActive }) => {
  const progress = (totalTime - timeRemaining) / totalTime;
  
  return (
    <View style={styles.timerContainer}>
      <Svg width={200} height={200} style={styles.timerSvg}>
        {/* Background Circle */}
        <Circle
          cx={100}
          cy={100}
          r={90}
          stroke="#E5E7EB"
          strokeWidth={8}
          fill="transparent"
        />
        {/* Progress Circle */}
        <Circle
          cx={100}
          cy={100}
          r={90}
          stroke="#4A6741"
          strokeWidth={8}
          fill="transparent"
          strokeDasharray={`${progress * 565} 565`}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      </Svg>
      <View style={styles.timerText}>
        <Text style={styles.timeDisplay}>{formatTime(timeRemaining)}</Text>
        <Text style={styles.steepInfo}>Steep 2 of 4</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerText: {
    alignItems: 'center',
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '300',
    color: '#2D2D2D',
    fontFamily: 'SF Mono',
  },
  steepInfo: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 8,
  },
});
```

## Screen Layout Specifications

### 1. Timer Screen Layout

```jsx
const TimerScreen = () => (
  <View style={styles.container}>
    {/* Background Video */}
    <Video
      source={require('./assets/tea-brewing-background.mp4')}
      style={styles.backgroundVideo}
      resizeMode="cover"
      repeat
      muted
    />
    
    {/* Overlay Content */}
    <View style={styles.overlay}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <Icon name="help-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tea Info */}
      <View style={styles.teaInfo}>
        <Text style={styles.teaName}>Jasmine Green Tea</Text>
        <Text style={styles.teaParams}>110ml • 85°C • 4 steeps</Text>
      </View>
      
      {/* Timer Display */}
      <View style={styles.timerSection}>
        <TimerDisplay 
          timeRemaining={135}
          totalTime={180}
          isActive={true}
        />
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Next Steep</Text>
        </TouchableOpacity>
      </View>
      
      {/* Quick Adjustments */}
      <View style={styles.adjustments}>
        <TouchableOpacity style={styles.adjustButton}>
          <Text style={styles.adjustText}>-10ml</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjustButton}>
          <Text style={styles.adjustText}>+10ml</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjustButton}>
          <Text style={styles.adjustText}>-5°C</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjustButton}>
          <Text style={styles.adjustText}>+5°C</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 40,
  },
  teaInfo: {
    alignItems: 'center',
    marginBottom: 60,
  },
  teaName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  teaParams: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  adjustments: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  adjustButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  adjustText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
```

### 2. Tea Library Grid Layout

```jsx
const TeaLibrary = ({ teas }) => (
  <View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.title}>Tea Library</Text>
      <TouchableOpacity style={styles.closeButton}>
        <Icon name="x" size={24} color="#2D2D2D" />
      </TouchableOpacity>
    </View>
    
    {/* Search Bar */}
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#6B6B6B" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search teas..."
        placeholderTextColor="#A8A8A8"
      />
    </View>
    
    {/* Filter Tabs */}
    <ScrollView horizontal style={styles.filterTabs}>
      {['All', 'Green', 'Black', 'Oolong', 'Pu-erh', 'White'].map(filter => (
        <TouchableOpacity key={filter} style={styles.filterTab}>
          <Text style={styles.filterText}>{filter}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    
    {/* Tea Grid */}
    <FlatList
      data={teas}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={styles.teaCardContainer}>
          <TeaCard tea={item} />
        </View>
      )}
      contentContainerStyle={styles.grid}
    />
    
    {/* Add Tea Button */}
    <TouchableOpacity style={styles.addButton}>
      <Icon name="plus" size={24} color="#FFFFFF" />
      <Text style={styles.addButtonText}>Add Tea</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: 0,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D2D2D',
  },
  filterTabs: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 12,
    elevation: 1,
  },
  filterText: {
    fontSize: 14,
    color: '#4A6741',
    fontWeight: '500',
  },
  grid: {
    padding: 20,
    paddingTop: 0,
  },
  teaCardContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6741',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
```

## Animation Specifications

### 1. Tea Flow Easing Curves

```css
/* CSS Custom Easing */
--easing-tea-flow: cubic-bezier(0.165, 0.84, 0.44, 1);
--easing-standard: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--easing-accelerate: cubic-bezier(0.55, 0, 1, 0.45);
--easing-decelerate: cubic-bezier(0, 0.55, 0.45, 1);
```

### 2. Timer Progress Animation

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

### 3. Button Press Animation

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

## Gesture Implementation

### 1. Timer Adjustment Gestures

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

### 2. Swipe Navigation

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

## Implementation Notes

### Performance Optimization
- Use `useNativeDriver: true` for transform and opacity animations
- Implement video background with hardware acceleration
- Use FlatList for large tea collections with `getItemLayout`
- Optimize image loading with lazy loading and caching

### Accessibility
- Add semantic labels to all interactive elements
- Implement proper focus management for keyboard navigation
- Ensure color contrast meets WCAG guidelines
- Provide alternative text for images and icons

### Responsive Design
- Use Flexbox for adaptive layouts
- Implement breakpoint-based component variants
- Test on various screen sizes and orientations
- Consider tablet-specific layouts for larger screens

This comprehensive visual design guide provides all the components, layouts, and implementation details needed to build TeaFlow's zen-focused interface.