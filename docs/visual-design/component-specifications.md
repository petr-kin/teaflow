# Component Specifications

## 1. Primary Button Component

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

## 2. Tea Card Component

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

## 3. Timer Display Component

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
