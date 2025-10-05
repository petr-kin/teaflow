# Seed Data Loading Strategy

## Initial Load (First Launch)
```typescript
async function initializeSeedData() {
  const hasLaunched = await AsyncStorage.getItem('@teaflow_launched');
  
  if (!hasLaunched) {
    // Load only the 3 default selected teas
    const defaultTeas = SEED_TEAS.filter(tea => tea.defaultSelected);
    await AsyncStorage.setItem('@teaflow_teas', JSON.stringify(defaultTeas));
    
    // Set green tea as the initial selection
    await AsyncStorage.setItem('@teaflow_last_tea', 'green_default');
    
    // Mark as launched
    await AsyncStorage.setItem('@teaflow_launched', 'true');
    
    // Schedule progressive disclosure
    scheduleTeaDiscovery();
  }
}
```

## Progressive Disclosure
```typescript
function scheduleTeaDiscovery() {
  // After 3 successful brews, suggest exploring other teas
  // After 7 days, unlock premium tea knowledge
  // After specific achievements, reveal specialty teas
}
```

## User Preference Learning
```typescript
interface UserTeaProfile {
  preferredStrength: number; // 1-5
  preferredCaffeine: number; // 0-5
  favoriteProfiles: string[]; // ['floral', 'fruity', etc]
  brewingStyle: 'western' | 'gongfu' | 'grandpa';
  timeAdjustmentPattern: number; // average % adjustment
  temperaturePreference: 'cooler' | 'standard' | 'hotter';
}
```
