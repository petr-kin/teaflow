# Migration from Existing Data

## Compatibility Check
```typescript
async function migrateExistingTeas() {
  const existingTeas = await AsyncStorage.getItem('@teas');
  
  if (existingTeas) {
    const parsed = JSON.parse(existingTeas);
    
    // Map old format to new schema
    const migrated = parsed.map(oldTea => ({
      ...getDefaultTeaById(oldTea.type),
      ...oldTea, // Preserve user customizations
      migratedAt: Date.now()
    }));
    
    await AsyncStorage.setItem('@teaflow_teas', JSON.stringify(migrated));
    
    // Archive old data
    await AsyncStorage.setItem('@teas_archive', existingTeas);
  }
}
```
