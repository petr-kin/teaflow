# TeaFlow Persistence Architecture

**Document Version:** 1.0  
**Date:** 2025-09-10  
**Purpose:** Comprehensive guide to TeaFlow's data storage, schemas, and migration patterns

## Overview

TeaFlow uses AsyncStorage as the primary persistence layer with a versioned schema system to ensure data compatibility across app updates. All data is stored locally by default, with optional cloud sync capabilities.

## Storage Keys and Schemas

### Primary Storage Keys

All TeaFlow data uses the `gongfu:` prefix for namespacing:

| Key | Type | Purpose | Schema Version |
|-----|------|---------|----------------|
| `gongfu:version` | string | Schema version tracking | N/A |
| `gongfu:lastSteeps` | LastSteep[] | Recent brewing sessions | 1.0+ |
| `gongfu:userTeas` | TeaProfile[] | User-created tea profiles | 1.0+ |
| `gongfu:prefs` | UserPreferences | App settings and preferences | 1.0+ |
| `gongfu:learning` | LearningData | Adaptive timing data | 1.5+ |
| `gongfu:library` | LibraryMetadata | Tea collection metadata | 2.0+ |

### Schema Definitions

#### LastSteep Schema
```typescript
interface LastSteep {
  teaId: string;         // Reference to TeaProfile.id
  name: string;          // Display name for quick access
  infusionIndex: number; // Which steep (0-based)
  actualSec: number;     // Actual brewing time used
  ts: number;           // Timestamp (Date.now())
}

// Storage example
{
  "gongfu:lastSteeps": [
    {
      "teaId": "oolong",
      "name": "Oolong",
      "infusionIndex": 0,
      "actualSec": 12,
      "ts": 1704067200000
    },
    // ... up to 20 most recent steeps
  ]
}
```

#### TeaProfile Schema
```typescript
interface TeaProfile {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: TeaType;                // Category
  baseTempC: number;            // Default temperature (Celsius)
  defaultRatio: number;         // Tea to water ratio (1/15 = 1g per 15ml)
  baseScheduleSec: number[];    // Default steeping times
  cover?: string;               // Image path/URL (optional)
  user?: boolean;               // User-created vs default
  created?: number;             // Creation timestamp
  modified?: number;            // Last modification timestamp
}

// Storage example
{
  "gongfu:userTeas": [
    {
      "id": "user_dragon_well",
      "name": "Dragon Well Green",
      "type": "green",
      "baseTempC": 80,
      "defaultRatio": 0.05,
      "baseScheduleSec": [5, 7, 10, 15, 20],
      "cover": "file://dragon_well_thumb.jpg",
      "user": true,
      "created": 1704067200000,
      "modified": 1704067200000
    }
  ]
}
```

#### UserPreferences Schema
```typescript
interface UserPreferences {
  vesselSize: VesselBucket;     // '≤80' | '81–120' | '≥121'
  soundEnabled: boolean;        // Audio feedback
  hapticEnabled: boolean;       // Haptic feedback
  themeMode: 'light' | 'dark' | 'auto';
  animationQuality: 'low' | 'medium' | 'high';
  temperatureUnit: 'C' | 'F';
  onboardingComplete: boolean;
  privacyAnalytics: boolean;    // Allow anonymous analytics
  notifications: {
    t5Warning: boolean;         // 5-second warning
    t0Complete: boolean;        // Completion notification
    background: boolean;        // Background notifications
  };
  accessibility: {
    reduceMotion: boolean;      // Simplified animations
    buttonFallbacks: boolean;   // Alternative to gestures
    highContrast: boolean;      // Enhanced visibility
  };
}

// Storage example
{
  "gongfu:prefs": {
    "vesselSize": "81–120",
    "soundEnabled": true,
    "hapticEnabled": true,
    "themeMode": "auto",
    "animationQuality": "medium",
    "temperatureUnit": "C",
    "onboardingComplete": true,
    "privacyAnalytics": false,
    "notifications": {
      "t5Warning": true,
      "t0Complete": true,
      "background": true
    },
    "accessibility": {
      "reduceMotion": false,
      "buttonFallbacks": false,
      "highContrast": false
    }
  }
}
```

#### LearningData Schema (v1.5+)
```typescript
interface LearningData {
  version: string;              // Learning algorithm version
  offsets: Record<string, TeaOffsets>;  // Per-tea adjustments
  bucketStats: Record<VesselBucket, BucketStats>;
  globalStats: {
    totalSessions: number;
    avgAccuracy: number;        // Feedback-based accuracy
    lastUpdated: number;
  };
}

interface TeaOffsets {
  teaId: string;
  timeOffset: number;           // Seconds adjustment (-30 to +30)
  tempOffset: number;           // Temperature adjustment (-10 to +10)
  confidence: number;           // Confidence in adjustment (0-1)
  sessionCount: number;         // Sessions used for learning
  lastFeedback: 'weak' | 'perfect' | 'strong' | null;
}

interface BucketStats {
  vesselSize: VesselBucket;
  avgTimeMultiplier: number;    // Vessel size adjustment factor
  sessionCount: number;
  lastUpdated: number;
}

// Storage example
{
  "gongfu:learning": {
    "version": "1.5",
    "offsets": {
      "oolong": {
        "teaId": "oolong",
        "timeOffset": 3,
        "tempOffset": -2,
        "confidence": 0.8,
        "sessionCount": 15,
        "lastFeedback": "perfect"
      }
    },
    "bucketStats": {
      "81–120": {
        "vesselSize": "81–120",
        "avgTimeMultiplier": 1.0,
        "sessionCount": 42,
        "lastUpdated": 1704067200000
      }
    },
    "globalStats": {
      "totalSessions": 127,
      "avgAccuracy": 0.82,
      "lastUpdated": 1704067200000
    }
  }
}
```

#### LibraryMetadata Schema (v2.0+)
```typescript
interface LibraryMetadata {
  version: string;
  totalTeas: number;            // Count of all teas (default + user)
  userTeasCount: number;        // Count of user-created teas
  lastSync: number | null;      // Last cloud sync timestamp
  thumbnailCache: Record<string, string>;  // teaId -> thumbnail path
  searchIndex: {
    tags: string[];             // Searchable tags
    categories: Record<TeaType, number>;  // Count per category
  };
  collections: {               // User-defined tea collections
    id: string;
    name: string;
    teaIds: string[];
    created: number;
  }[];
}

// Storage example
{
  "gongfu:library": {
    "version": "2.0",
    "totalTeas": 23,
    "userTeasCount": 18,
    "lastSync": null,
    "thumbnailCache": {
      "user_dragon_well": "file://thumbnails/dragon_well.jpg"
    },
    "searchIndex": {
      "tags": ["organic", "mountain", "spring", "premium"],
      "categories": {
        "green": 8,
        "oolong": 6,
        "puerh": 4,
        "black": 3,
        "white": 2
      }
    },
    "collections": [
      {
        "id": "daily_teas",
        "name": "Daily Favorites",
        "teaIds": ["oolong", "green", "user_dragon_well"],
        "created": 1704067200000
      }
    ]
  }
}
```

## Migration System

### Version Detection and Migration Flow

```typescript
// lib/migrations.ts
const CURRENT_SCHEMA_VERSION = '2.0';

export const checkAndMigrate = async (): Promise<void> => {
  try {
    const storedVersion = await AsyncStorage.getItem('gongfu:version');
    
    if (!storedVersion) {
      // First install - initialize with current schema
      await initializeStorage();
      return;
    }
    
    if (storedVersion === CURRENT_SCHEMA_VERSION) {
      return; // No migration needed
    }
    
    // Perform step-by-step migrations
    await performMigrations(storedVersion, CURRENT_SCHEMA_VERSION);
    
  } catch (error) {
    console.error('Migration failed:', error);
    // Fallback: backup user data and reinitialize
    await backupAndReinitialize();
  }
};

const performMigrations = async (fromVersion: string, toVersion: string) => {
  const migrations = [
    { from: '1.0', to: '1.5', migrate: migrateFrom1_0To1_5 },
    { from: '1.5', to: '2.0', migrate: migrateFrom1_5To2_0 },
  ];
  
  let currentVersion = fromVersion;
  
  for (const migration of migrations) {
    if (shouldApplyMigration(currentVersion, migration.from, toVersion)) {
      console.log(`Migrating from ${migration.from} to ${migration.to}`);
      await migration.migrate();
      currentVersion = migration.to;
      await AsyncStorage.setItem('gongfu:version', currentVersion);
    }
  }
};
```

### Migration Examples

#### Migration 1.0 → 1.5: Add Learning System
```typescript
const migrateFrom1_0To1_5 = async (): Promise<void> => {
  // Initialize learning data structure
  const learningData: LearningData = {
    version: '1.5',
    offsets: {},
    bucketStats: {
      '≤80': { vesselSize: '≤80', avgTimeMultiplier: 0.8, sessionCount: 0, lastUpdated: Date.now() },
      '81–120': { vesselSize: '81–120', avgTimeMultiplier: 1.0, sessionCount: 0, lastUpdated: Date.now() },
      '≥121': { vesselSize: '≥121', avgTimeMultiplier: 1.2, sessionCount: 0, lastUpdated: Date.now() },
    },
    globalStats: {
      totalSessions: 0,
      avgAccuracy: 0,
      lastUpdated: Date.now(),
    },
  };
  
  await AsyncStorage.setItem('gongfu:learning', JSON.stringify(learningData));
  
  // Add missing fields to existing preferences
  const prefsRaw = await AsyncStorage.getItem('gongfu:prefs');
  if (prefsRaw) {
    const prefs = JSON.parse(prefsRaw);
    const updatedPrefs = {
      ...prefs,
      privacyAnalytics: prefs.privacyAnalytics ?? false,
      accessibility: prefs.accessibility ?? {
        reduceMotion: false,
        buttonFallbacks: false,
        highContrast: false,
      },
    };
    
    await AsyncStorage.setItem('gongfu:prefs', JSON.stringify(updatedPrefs));
  }
};
```

#### Migration 1.5 → 2.0: Add Library Metadata
```typescript
const migrateFrom1_5To2_0 = async (): Promise<void> => {
  // Read existing tea data to populate library metadata
  const userTeasRaw = await AsyncStorage.getItem('gongfu:userTeas');
  const userTeas: TeaProfile[] = userTeasRaw ? JSON.parse(userTeasRaw) : [];
  
  const categoryCount: Record<TeaType, number> = {
    oolong: 0, puerh: 0, green: 0, white: 0, black: 0, herbal: 0, custom: 0
  };
  
  // Count teas by category (including defaults)
  const defaultTeaCount = Object.keys(DEFAULTS).length;
  userTeas.forEach(tea => categoryCount[tea.type]++);
  Object.values(DEFAULTS).forEach(tea => categoryCount[tea.type]++);
  
  const libraryMetadata: LibraryMetadata = {
    version: '2.0',
    totalTeas: defaultTeaCount + userTeas.length,
    userTeasCount: userTeas.length,
    lastSync: null,
    thumbnailCache: {},
    searchIndex: {
      tags: extractTagsFromUserTeas(userTeas),
      categories: categoryCount,
    },
    collections: [],
  };
  
  await AsyncStorage.setItem('gongfu:library', JSON.stringify(libraryMetadata));
  
  // Add timestamps to existing user teas if missing
  const updatedUserTeas = userTeas.map(tea => ({
    ...tea,
    created: tea.created ?? Date.now(),
    modified: tea.modified ?? Date.now(),
  }));
  
  if (updatedUserTeas.length !== userTeas.length) {
    await AsyncStorage.setItem('gongfu:userTeas', JSON.stringify(updatedUserTeas));
  }
};
```

### Backup and Recovery

```typescript
// lib/backup.ts
export const createBackup = async (): Promise<string> => {
  const backup = {
    version: await AsyncStorage.getItem('gongfu:version'),
    timestamp: Date.now(),
    data: {},
  };
  
  const keys = [
    'gongfu:lastSteeps',
    'gongfu:userTeas', 
    'gongfu:prefs',
    'gongfu:learning',
    'gongfu:library',
  ];
  
  for (const key of keys) {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      backup.data[key] = JSON.parse(value);
    }
  }
  
  return JSON.stringify(backup, null, 2);
};

export const restoreFromBackup = async (backupJson: string): Promise<void> => {
  try {
    const backup = JSON.parse(backupJson);
    
    // Validate backup structure
    if (!backup.version || !backup.data) {
      throw new Error('Invalid backup format');
    }
    
    // Clear existing data
    await clearAllData();
    
    // Restore data
    for (const [key, value] of Object.entries(backup.data)) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
    
    // Set version and trigger migration if needed
    await AsyncStorage.setItem('gongfu:version', backup.version);
    await checkAndMigrate();
    
  } catch (error) {
    console.error('Backup restoration failed:', error);
    throw new Error('Failed to restore backup');
  }
};
```

## Storage Utilities

### Safe Read/Write Operations

```typescript
// lib/storage-utils.ts
export const safeReadJSON = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read ${key}:`, error);
    return defaultValue;
  }
};

export const safeWriteJSON = async (key: string, value: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to write ${key}:`, error);
    return false;
  }
};

export const safeClear = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to clear ${key}:`, error);
    return false;
  }
};
```

### Data Validation

```typescript
// lib/validation.ts
export const validateTeaProfile = (tea: any): tea is TeaProfile => {
  return (
    typeof tea === 'object' &&
    typeof tea.id === 'string' &&
    typeof tea.name === 'string' &&
    typeof tea.baseTempC === 'number' &&
    Array.isArray(tea.baseScheduleSec) &&
    tea.baseScheduleSec.every((time: any) => typeof time === 'number')
  );
};

export const validateLastSteep = (steep: any): steep is LastSteep => {
  return (
    typeof steep === 'object' &&
    typeof steep.teaId === 'string' &&
    typeof steep.name === 'string' &&
    typeof steep.infusionIndex === 'number' &&
    typeof steep.actualSec === 'number' &&
    typeof steep.ts === 'number'
  );
};

export const sanitizeUserInput = (tea: Partial<TeaProfile>): Partial<TeaProfile> => {
  return {
    ...tea,
    name: tea.name?.trim().slice(0, 50), // Limit name length
    baseTempC: Math.max(60, Math.min(100, tea.baseTempC || 85)), // Clamp temperature
    baseScheduleSec: tea.baseScheduleSec?.slice(0, 12), // Limit steep count
  };
};
```

## Performance Considerations

### Storage Size Management

```typescript
// lib/storage-manager.ts
export const getStorageSize = async (): Promise<number> => {
  const keys = await AsyncStorage.getAllKeys();
  const teaflowKeys = keys.filter(key => key.startsWith('gongfu:'));
  
  let totalSize = 0;
  for (const key of teaflowKeys) {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      totalSize += value.length;
    }
  }
  
  return totalSize;
};

export const cleanupOldData = async (): Promise<void> => {
  // Limit last steeps to 20 most recent
  const steepsRaw = await AsyncStorage.getItem('gongfu:lastSteeps');
  if (steepsRaw) {
    const steeps: LastSteep[] = JSON.parse(steepsRaw);
    if (steeps.length > 20) {
      const recent = steeps
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 20);
      await AsyncStorage.setItem('gongfu:lastSteeps', JSON.stringify(recent));
    }
  }
  
  // Clean up orphaned thumbnails
  await cleanupOrphanedThumbnails();
};
```

### Batch Operations

```typescript
// lib/batch-operations.ts
export const batchUpdate = async (operations: Array<{key: string, value: any}>): Promise<void> => {
  const updates = operations.map(op => [op.key, JSON.stringify(op.value)]);
  await AsyncStorage.multiSet(updates);
};

export const batchRead = async (keys: string[]): Promise<Record<string, any>> => {
  const results = await AsyncStorage.multiGet(keys);
  const data: Record<string, any> = {};
  
  for (const [key, value] of results) {
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch (error) {
        console.warn(`Failed to parse ${key}:`, error);
      }
    }
  }
  
  return data;
};
```

## Testing and Debugging

### Development Utilities

```typescript
// lib/dev-utils.ts (development only)
export const debugStorage = async (): Promise<void> => {
  if (!__DEV__) return;
  
  const keys = await AsyncStorage.getAllKeys();
  const teaflowKeys = keys.filter(key => key.startsWith('gongfu:'));
  
  console.log('=== TeaFlow Storage Debug ===');
  for (const key of teaflowKeys) {
    const value = await AsyncStorage.getItem(key);
    console.log(`${key}:`, value ? JSON.parse(value) : null);
  }
  console.log('=== End Storage Debug ===');
};

export const resetStorage = async (): Promise<void> => {
  if (!__DEV__) return;
  
  const keys = await AsyncStorage.getAllKeys();
  const teaflowKeys = keys.filter(key => key.startsWith('gongfu:'));
  await AsyncStorage.multiRemove(teaflowKeys);
  
  console.log('Storage reset complete');
};
```

### Migration Testing

```typescript
// __tests__/migrations.test.ts
describe('Storage Migrations', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });
  
  test('migrates from 1.0 to 1.5', async () => {
    // Set up 1.0 data
    await AsyncStorage.setItem('gongfu:version', '1.0');
    await AsyncStorage.setItem('gongfu:prefs', JSON.stringify({
      vesselSize: '81–120',
      soundEnabled: true,
    }));
    
    // Run migration
    await checkAndMigrate();
    
    // Verify 1.5 data structure
    const version = await AsyncStorage.getItem('gongfu:version');
    expect(version).toBe('1.5');
    
    const learning = await safeReadJSON('gongfu:learning', null);
    expect(learning).toBeTruthy();
    expect(learning.version).toBe('1.5');
  });
});
```

This comprehensive persistence documentation ensures AI agents understand TeaFlow's data architecture, can safely perform migrations, and maintain data integrity across app updates.