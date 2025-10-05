# Maintenance & Updates

## Version Management
```typescript
const SEED_DATA_VERSION = '2.0.0';

async function checkSeedDataUpdates() {
  const currentVersion = await AsyncStorage.getItem('@seed_version');
  
  if (currentVersion !== SEED_DATA_VERSION) {
    // Apply incremental updates
    await updateSeedData(currentVersion, SEED_DATA_VERSION);
    await AsyncStorage.setItem('@seed_version', SEED_DATA_VERSION);
  }
}
```

## Remote Updates (Future)
```typescript
// Allow updating tea knowledge without app update
async function fetchTeaKnowledge() {
  try {
    const response = await fetch('https://api.teaflow.app/tea-knowledge');
    const knowledge = await response.json();
    
    // Merge with local data
    await mergeTeasKnowledge(knowledge);
  } catch (error) {
    // Fall back to local seed data
    console.log('Using offline tea knowledge');
  }
}
```