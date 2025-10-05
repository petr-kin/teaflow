# Data Models

## TeaProfile

**Purpose:** Represents a specific tea with brewing parameters and user customizations

**Key Attributes:**
- id: string - Unique identifier for the tea
- name: string - Display name of the tea  
- baseScheduleSec: number[] - Default steeping times for each infusion
- baseTempC: number - Recommended brewing temperature
- category: 'green' | 'black' | 'oolong' | 'puerh' - Tea type classification
- isUserCreated: boolean - Distinguishes user-added teas from defaults
- ocrSource?: OCRResult - Original package scanning data if applicable

```typescript
interface TeaProfile {
  id: string;
  name: string;
  baseScheduleSec: number[];
  baseTempC: number;
  category: TeaCategory;
  isUserCreated: boolean;
  ocrSource?: {
    packageText: string;
    confidence: number;
    timestamp: number;
  };
  notes?: string;
  origin?: string;
}
```

**Relationships:**
- One-to-many with BrewSession (tea can have multiple brewing sessions)
- One-to-many with UserPreferences (user can have custom settings per tea)

## BrewSession

**Purpose:** Records a completed tea brewing session for learning and analytics

**Key Attributes:**
- id: string - Unique session identifier
- teaId: string - Reference to the TeaProfile
- steepIndex: number - Which infusion number (0-based)
- actualSec: number - Actual steeping time used
- vesselMl: number - Vessel size used
- tempC: number - Water temperature used  
- timestamp: number - When the session occurred
- feedback?: BrewFeedback - User rating of the brew

```typescript
interface BrewSession {
  id: string;
  teaId: string;
  steepIndex: number;
  actualSec: number;
  vesselMl: number;
  tempC: number;
  timestamp: number;
  feedback?: {
    strength: 'weak' | 'perfect' | 'strong';
    enjoyment: number; // 1-5 rating
  };
}
```

**Relationships:**
- Many-to-one with TeaProfile (sessions belong to specific tea)
- Used by learning algorithms to adjust future recommendations

## UserPreferences

**Purpose:** Stores user-specific customizations for tea brewing parameters

**Key Attributes:**
- teaId: string - Tea these preferences apply to
- vesselMl: number - User's preferred vessel size for this tea
- tempC: number - User's preferred temperature adjustment
- soundEnabled: boolean - Audio feedback preference
- hapticsEnabled: boolean - Haptic feedback preference

```typescript
interface UserPreferences {
  teaId: string;
  vesselMl: number;
  tempC: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  visualComplexity: 'low' | 'medium' | 'high';
}
```

**Relationships:**
- One-to-one with TeaProfile (each tea can have user preferences)
- Influences default values in brewing interface
