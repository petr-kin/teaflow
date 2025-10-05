# TeaFlow Seed Data Strategy

## Overview
This document defines the comprehensive seed data strategy for TeaFlow, ensuring users have immediate value upon first launch while maintaining cultural authenticity and brewing accuracy.

## Core Principles
1. **Immediate Usability** - Users can brew tea within 10 seconds of first launch
2. **Cultural Authenticity** - Respect traditional brewing methods
3. **Progressive Disclosure** - Start simple, reveal complexity as users engage
4. **Personalization Ready** - Defaults that adapt to user preferences

## Default Tea Presets

### Primary Tea Categories (6 Core Types)

#### 1. Green Tea
```typescript
{
  id: 'green_default',
  name: 'Green Tea',
  category: 'green',
  origin: 'Universal',
  description: 'Light, refreshing, grassy notes',
  brewingProfiles: {
    western: {
      tempC: 80,
      tempF: 176,
      steeps: [
        { time: 60, name: 'First Steep' },
        { time: 75, name: 'Second Steep' },
        { time: 90, name: 'Third Steep' }
      ],
      vesselSize: 250, // ml
      leafAmount: 2 // grams
    },
    gongfu: {
      tempC: 80,
      tempF: 176,
      steeps: [
        { time: 20, name: 'Rinse' },
        { time: 15, name: 'First Steep' },
        { time: 20, name: 'Second Steep' },
        { time: 25, name: 'Third Steep' },
        { time: 30, name: 'Fourth Steep' },
        { time: 40, name: 'Fifth Steep' }
      ],
      vesselSize: 150, // ml (gaiwan)
      leafAmount: 5 // grams
    }
  },
  flavor: {
    profile: ['grassy', 'fresh', 'vegetal', 'light'],
    strength: 2, // 1-5 scale
    caffeine: 2 // 1-5 scale
  },
  animation: {
    leafColor: '#8BC34A',
    waterColor: '#E8F5E9',
    steamIntensity: 0.3,
    leafDriftPattern: 'gentle'
  },
  icon: '🍃',
  defaultSelected: true // Shows on first launch
}
```

#### 2. Black Tea
```typescript
{
  id: 'black_default',
  name: 'Black Tea',
  category: 'black',
  origin: 'Universal',
  description: 'Bold, malty, full-bodied',
  brewingProfiles: {
    western: {
      tempC: 95,
      tempF: 203,
      steeps: [
        { time: 180, name: 'First Steep' },
        { time: 240, name: 'Second Steep' }
      ],
      vesselSize: 250,
      leafAmount: 3
    },
    gongfu: {
      tempC: 95,
      tempF: 203,
      steeps: [
        { time: 10, name: 'Rinse' },
        { time: 20, name: 'First Steep' },
        { time: 25, name: 'Second Steep' },
        { time: 30, name: 'Third Steep' },
        { time: 40, name: 'Fourth Steep' }
      ],
      vesselSize: 150,
      leafAmount: 6
    }
  },
  flavor: {
    profile: ['malty', 'robust', 'honey', 'astringent'],
    strength: 4,
    caffeine: 4
  },
  animation: {
    leafColor: '#6B4423',
    waterColor: '#FFEBCD',
    steamIntensity: 0.6,
    leafDriftPattern: 'swirling'
  },
  icon: '☕',
  defaultSelected: true
}
```

#### 3. Oolong Tea
```typescript
{
  id: 'oolong_default',
  name: 'Oolong',
  category: 'oolong',
  origin: 'Taiwan/Fujian',
  description: 'Complex, fruity, partially oxidized',
  brewingProfiles: {
    western: {
      tempC: 90,
      tempF: 194,
      steeps: [
        { time: 90, name: 'First Steep' },
        { time: 120, name: 'Second Steep' },
        { time: 150, name: 'Third Steep' }
      ],
      vesselSize: 250,
      leafAmount: 3
    },
    gongfu: {
      tempC: 90,
      tempF: 194,
      steeps: [
        { time: 20, name: 'Rinse' },
        { time: 30, name: 'First Steep' },
        { time: 40, name: 'Second Steep' },
        { time: 50, name: 'Third Steep' },
        { time: 60, name: 'Fourth Steep' },
        { time: 75, name: 'Fifth Steep' },
        { time: 90, name: 'Sixth Steep' }
      ],
      vesselSize: 150,
      leafAmount: 7
    }
  },
  flavor: {
    profile: ['floral', 'fruity', 'creamy', 'complex'],
    strength: 3,
    caffeine: 3
  },
  animation: {
    leafColor: '#8B7355',
    waterColor: '#FFF8DC',
    steamIntensity: 0.5,
    leafDriftPattern: 'dancing'
  },
  icon: '🌺',
  defaultSelected: true
}
```

#### 4. White Tea
```typescript
{
  id: 'white_default',
  name: 'White Tea',
  category: 'white',
  origin: 'Fujian',
  description: 'Delicate, subtle, naturally sweet',
  brewingProfiles: {
    western: {
      tempC: 85,
      tempF: 185,
      steeps: [
        { time: 120, name: 'First Steep' },
        { time: 150, name: 'Second Steep' },
        { time: 180, name: 'Third Steep' }
      ],
      vesselSize: 250,
      leafAmount: 2
    },
    gongfu: {
      tempC: 85,
      tempF: 185,
      steeps: [
        { time: 30, name: 'First Steep' },
        { time: 40, name: 'Second Steep' },
        { time: 50, name: 'Third Steep' },
        { time: 60, name: 'Fourth Steep' },
        { time: 75, name: 'Fifth Steep' }
      ],
      vesselSize: 150,
      leafAmount: 5
    }
  },
  flavor: {
    profile: ['delicate', 'sweet', 'light', 'hay-like'],
    strength: 1,
    caffeine: 1
  },
  animation: {
    leafColor: '#E0E0E0',
    waterColor: '#FFFEF7',
    steamIntensity: 0.2,
    leafDriftPattern: 'floating'
  },
  icon: '🕊️',
  defaultSelected: false
}
```

#### 5. Pu-erh Tea
```typescript
{
  id: 'puerh_default',
  name: 'Pu-erh',
  category: 'puerh',
  origin: 'Yunnan',
  description: 'Earthy, smooth, aged complexity',
  brewingProfiles: {
    western: {
      tempC: 95,
      tempF: 203,
      steeps: [
        { time: 120, name: 'First Steep' },
        { time: 150, name: 'Second Steep' },
        { time: 180, name: 'Third Steep' }
      ],
      vesselSize: 250,
      leafAmount: 3
    },
    gongfu: {
      tempC: 95,
      tempF: 203,
      steeps: [
        { time: 10, name: 'First Rinse' },
        { time: 10, name: 'Second Rinse' },
        { time: 20, name: 'First Steep' },
        { time: 30, name: 'Second Steep' },
        { time: 40, name: 'Third Steep' },
        { time: 50, name: 'Fourth Steep' },
        { time: 60, name: 'Fifth Steep' }
      ],
      vesselSize: 150,
      leafAmount: 8
    }
  },
  flavor: {
    profile: ['earthy', 'smooth', 'woody', 'mushroom'],
    strength: 4,
    caffeine: 3
  },
  animation: {
    leafColor: '#3E2723',
    waterColor: '#D2691E',
    steamIntensity: 0.7,
    leafDriftPattern: 'settling'
  },
  icon: '🍂',
  defaultSelected: false
}
```

#### 6. Herbal (Tisane)
```typescript
{
  id: 'herbal_default',
  name: 'Herbal Tea',
  category: 'herbal',
  origin: 'Various',
  description: 'Caffeine-free, soothing, varied',
  brewingProfiles: {
    western: {
      tempC: 100,
      tempF: 212,
      steeps: [
        { time: 300, name: 'Single Steep' }
      ],
      vesselSize: 250,
      leafAmount: 3
    }
  },
  flavor: {
    profile: ['varied', 'soothing', 'aromatic', 'caffeine-free'],
    strength: 2,
    caffeine: 0
  },
  animation: {
    leafColor: '#9C27B0',
    waterColor: '#FCE4EC',
    steamIntensity: 0.8,
    leafDriftPattern: 'blooming'
  },
  icon: '🌸',
  defaultSelected: false
}
```

### Premium Tea Presets (Unlockable/Discoverable)

#### Specialty Greens
```typescript
[
  {
    id: 'sencha',
    name: 'Sencha',
    category: 'green',
    origin: 'Japan',
    premium: true,
    brewingProfiles: { /* specific parameters */ }
  },
  {
    id: 'gyokuro',
    name: 'Gyokuro',
    category: 'green',
    origin: 'Japan',
    premium: true,
    brewingProfiles: { /* lower temp, longer steep */ }
  },
  {
    id: 'longjing',
    name: 'Longjing (Dragon Well)',
    category: 'green',
    origin: 'China',
    premium: true,
    brewingProfiles: { /* specific parameters */ }
  }
]
```

#### Regional Specialties
```typescript
[
  {
    id: 'tieguanyin',
    name: 'Tie Guan Yin',
    category: 'oolong',
    origin: 'Anxi, Fujian',
    premium: true
  },
  {
    id: 'dahongpao',
    name: 'Da Hong Pao',
    category: 'oolong',
    origin: 'Wuyi Mountains',
    premium: true
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling First Flush',
    category: 'black',
    origin: 'India',
    premium: true
  }
]
```

## Seed Data Loading Strategy

### Initial Load (First Launch)
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

### Progressive Disclosure
```typescript
function scheduleTeaDiscovery() {
  // After 3 successful brews, suggest exploring other teas
  // After 7 days, unlock premium tea knowledge
  // After specific achievements, reveal specialty teas
}
```

### User Preference Learning
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

## Migration from Existing Data

### Compatibility Check
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

## Customization & User Teas

### Custom Tea Creation
```typescript
interface CustomTea extends BaseTea {
  isCustom: true;
  createdAt: number;
  basedOn?: string; // ID of tea it's based on
  source: 'manual' | 'ocr' | 'import';
  confidence?: number; // For OCR-created teas
}
```

### Import/Export Format
```typescript
interface TeaExportFormat {
  version: '2.0';
  exportedAt: number;
  teas: {
    defaults: string[]; // IDs only
    custom: CustomTea[];
  };
  preferences: UserTeaProfile;
  stats: {
    totalBrews: number;
    favoriteTea: string;
    averageBrewTime: number;
  };
}
```

## Validation Rules

### Tea Data Validation
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

### Data Integrity Checks
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

## Testing Seed Data

### Unit Tests
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

### Integration Tests
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

## Localization Strategy

### Multi-language Support
```typescript
const teaTranslations = {
  'en': {
    'green_default': 'Green Tea',
    'black_default': 'Black Tea'
  },
  'zh': {
    'green_default': '绿茶',
    'black_default': '红茶'
  },
  'ja': {
    'green_default': '緑茶',
    'black_default': '紅茶'
  }
};
```

### Cultural Adaptations
```typescript
const regionalDefaults = {
  'CN': ['longjing', 'tieguanyin', 'puerh'],
  'JP': ['sencha', 'gyokuro', 'genmaicha'],
  'IN': ['darjeeling', 'assam', 'chai'],
  'GB': ['earl_grey', 'english_breakfast'],
  'US': ['green_default', 'black_default', 'herbal_default']
};
```

## Performance Considerations

### Lazy Loading
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

### Data Optimization
```typescript
// Compress tea data for storage
const compressedTea = {
  ...tea,
  // Store only IDs for commonly used profiles
  profile: tea.isCommon ? tea.id : tea.brewingProfiles
};
```

## Maintenance & Updates

### Version Management
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

### Remote Updates (Future)
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