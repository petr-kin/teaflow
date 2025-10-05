# Screen Layout Specifications

## 1. Timer Screen Layout

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

## 2. Tea Library Grid Layout

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
