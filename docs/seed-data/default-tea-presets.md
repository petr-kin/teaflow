# Default Tea Presets

## Primary Tea Categories (6 Core Types)

### 1. Green Tea
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

### 2. Black Tea
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

### 3. Oolong Tea
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

### 4. White Tea
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

### 5. Pu-erh Tea
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

### 6. Herbal (Tisane)
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

## Premium Tea Presets (Unlockable/Discoverable)

### Specialty Greens
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

### Regional Specialties
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
