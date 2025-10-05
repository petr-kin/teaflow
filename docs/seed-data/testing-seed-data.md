# Testing Seed Data

## Unit Tests
```typescript
describe('Seed Data', () => {
  test('All default teas have valid brewing profiles', () => {
    SEED_TEAS.forEach(tea => {
      expect(tea.brewingProfiles.western).toBeDefined();
      expect(tea.brewingProfiles.western.steeps.length).toBeGreaterThan(0);
    });
  });
  
  test('Default selection includes essential teas', () => {
    const defaults = SEED_TEAS.filter(t => t.defaultSelected);
    expect(defaults).toHaveLength(3);
    expect(defaults.map(t => t.category)).toContain('green');
    expect(defaults.map(t => t.category)).toContain('black');
  });
  
  test('Animation parameters are valid', () => {
    SEED_TEAS.forEach(tea => {
      expect(tea.animation.steamIntensity).toBeGreaterThanOrEqual(0);
      expect(tea.animation.steamIntensity).toBeLessThanOrEqual(1);
    });
  });
});
```

## Integration Tests
```typescript
describe('Seed Data Loading', () => {
  test('First launch loads correct defaults', async () => {
    await initializeSeedData();
    const teas = await AsyncStorage.getItem('@teaflow_teas');
    const parsed = JSON.parse(teas);
    
    expect(parsed).toHaveLength(3);
    expect(parsed[0].id).toBe('green_default');
  });
  
  test('Migration preserves user customizations', async () => {
    // Set up old format data
    await AsyncStorage.setItem('@teas', JSON.stringify([
      { type: 'green', customTime: 90 }
    ]));
    
    await migrateExistingTeas();
    
    const migrated = await AsyncStorage.getItem('@teaflow_teas');
    const parsed = JSON.parse(migrated);
    
    expect(parsed[0].customTime).toBe(90);
  });
});
```
