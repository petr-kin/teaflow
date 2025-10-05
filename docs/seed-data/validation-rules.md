# Validation Rules

## Tea Data Validation
```typescript
const teaValidation = {
  name: { required: true, maxLength: 50 },
  tempC: { min: 60, max: 100 },
  steepTime: { min: 10, max: 600 }, // seconds
  vesselSize: { min: 50, max: 1000 }, // ml
  leafAmount: { min: 1, max: 20 }, // grams
  steeps: { min: 1, max: 10 }
};
```

## Data Integrity Checks
```typescript
async function validateSeedData() {
  const teas = await getAllTeas();
  
  const issues = [];
  
  for (const tea of teas) {
    // Check required fields
    if (!tea.id || !tea.name || !tea.brewingProfiles) {
      issues.push(`Invalid tea: ${tea.id}`);
    }
    
    // Validate temperature ranges
    if (tea.brewingProfiles.western.tempC < 60 || 
        tea.brewingProfiles.western.tempC > 100) {
      issues.push(`Invalid temperature: ${tea.id}`);
    }
    
    // Validate steep times
    for (const steep of tea.brewingProfiles.western.steeps) {
      if (steep.time < 10 || steep.time > 600) {
        issues.push(`Invalid steep time: ${tea.id}`);
      }
    }
  }
  
  return issues;
}
```
