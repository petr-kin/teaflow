# Performance Considerations

## Lazy Loading
```typescript
// Load full tea details only when needed
async function getTeaDetails(teaId: string) {
  // Check memory cache first
  if (teaCache.has(teaId)) {
    return teaCache.get(teaId);
  }
  
  // Load from storage
  const tea = await loadTeaById(teaId);
  
  // Cache for future use
  teaCache.set(teaId, tea);
  
  return tea;
}
```

## Data Optimization
```typescript
// Compress tea data for storage
const compressedTea = {
  ...tea,
  // Store only IDs for commonly used profiles
  profile: tea.isCommon ? tea.id : tea.brewingProfiles
};
```
