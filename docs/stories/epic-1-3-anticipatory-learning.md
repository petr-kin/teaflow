# Epic 1.3: Anticipatory Learning Engine (Phase 3: Intelligence)

**Epic ID:** EPIC-1.3  
**Phase:** 3 - Intelligence (Week 5-6)  
**Priority:** P1 (Differentiation)  
**Dependencies:** Epic 1.1 (Gesture Timer), Epic 1.2 (Animations)  

## Epic Goal
Transform TeaFlow from a reactive timer into an anticipatory companion that learns user preferences and eliminates manual tea parameter entry through intelligent OCR scanning.

---

## Story 1.3.1: OCR Package Scanning for Automatic Tea Parameter Extraction

**As a** tea enthusiast  
**I want** to photograph tea packages to automatically extract brewing parameters  
**So that** I never have to manually enter tea information or guess at brewing instructions

### Acceptance Criteria
1. **Camera Integration**
   - Dedicated camera icon in header (non-intrusive placement)
   - Camera preview with capture button matching app's zen aesthetic
   - Image confirmation screen before processing
   - Retake option if capture quality is poor

2. **OCR Processing Pipeline**
   - Automatic text extraction from photographed packages
   - Processing indicator with estimated time (<3 seconds target)
   - Confidence scoring for extracted parameters
   - Fallback to manual entry if confidence <70%

3. **Parameter Extraction Requirements**
   - Tea name recognition: 95% accuracy for clear text
   - Brewing time extraction: 90% accuracy (formats: "3 min", "180 sec", "steep 3-5 minutes")
   - Temperature detection: 85% accuracy (formats: "85°C", "185°F", "boiling water")
   - Multi-language support: English, Chinese characters, Japanese

4. **Intelligent Parsing**
   - Differentiate marketing copy from brewing instructions
   - Extract multiple steeps when specified (e.g., "30s, 45s, 60s")
   - Handle temperature ranges (e.g., "80-85°C" → defaults to 82°C)
   - Recognize common tea terminology ("rolling boil" = 100°C)

5. **User Confirmation Workflow**
   ```
   Capture → OCR Processing → Extracted Parameters Display → 
   User Confirmation/Edit → Save to Library → Load into Timer
   ```

### Technical Requirements
- react-native-vision-camera for image capture
- ML Kit Text Recognition or Google Cloud Vision API
- Offline OCR capability with cloud fallback
- Image preprocessing for better accuracy

### OCR Processing Strategy
```typescript
interface OCRResult {
  teaName: string;
  confidence: number;
  brewingTime: number[]; // Array for multiple steeps
  temperature: number;
  source: 'ml-kit' | 'cloud-vision' | 'manual';
}

const processTeaPackage = async (imageUri: string): Promise<OCRResult> => {
  // 1. Image preprocessing (contrast, rotation)
  // 2. Text extraction (ML Kit first, cloud fallback)
  // 3. Pattern matching for brewing parameters
  // 4. Confidence scoring and validation
  // 5. Return structured result
};
```

### Common Brand Templates
- Pre-built templates for popular tea brands (Twinings, Celestial, etc.)
- Pattern recognition for common package layouts
- Brand-specific terminology handling
- Template learning from user corrections

### Definition of Done
- [ ] Camera integration works smoothly without disrupting timer flow
- [ ] OCR achieves target accuracy rates on test package dataset
- [ ] Multi-language text recognition functional
- [ ] User can easily correct OCR mistakes
- [ ] Extracted parameters properly populate timer settings
- [ ] Offline processing works without internet dependency

---

## Story 1.3.2: Preference Learning and Adjustment Tracking

**As a** tea enthusiast  
**I want** the app to learn my brewing preferences over time  
**So that** it suggests optimal parameters without me having to remember adjustments

### Acceptance Criteria
1. **Adjustment Pattern Learning**
   - Track consistent time adjustments per tea type
   - Learn temperature preferences (user always adds/subtracts)
   - Detect strength preferences (user feedback: "too strong"/"too weak")
   - Remember vessel size choices per tea

2. **Learning Algorithm**
   ```typescript
   interface UserPreference {
     teaId: string;
     adjustments: {
       timeOffset: number; // Average adjustment in seconds
       tempOffset: number; // Average temp adjustment in °C  
       strengthPreference: 'weaker' | 'normal' | 'stronger';
       vesselSize: number; // Preferred ml
     };
     confidence: number; // 0-1, increases with more data
     sessionCount: number; // Number of brewing sessions
   }
   ```

3. **Feedback Integration**
   - Post-brew rating system (1-5 stars, optional)
   - Simple strength feedback ("Perfect", "Too Strong", "Too Weak")
   - Adjustment suggestions based on feedback
   - Learning from declined suggestions

4. **Suggestion Engine**
   - Proactive parameter adjustment suggestions
   - "Based on your preferences, try +15s for stronger flavor"
   - Non-intrusive suggestion display (subtle, dismissible)
   - Learn from whether suggestions are accepted/declined

5. **Preference Transparency**
   - Optional preference visibility in tea details
   - "You typically brew this 20s longer than recommended"
   - Clear indication when parameters are AI-suggested vs original
   - User can reset to defaults if desired

### Learning Dimensions
1. **Time Adjustments**
   - Track ±time modifications consistently applied
   - Learn optimal steeping time for user's taste
   - Account for different vessel sizes affecting extraction

2. **Temperature Preferences**  
   - Detect if user prefers hotter/cooler brewing
   - Learn tea-specific temperature adjustments
   - Account for altitude/water differences

3. **Strength Patterns**
   - Correlate user feedback with brewing parameters
   - Learn strength preferences by tea category
   - Suggest parameter changes for desired strength

4. **Context Patterns**
   - Time of day preferences (stronger morning tea)
   - Day of week patterns (relaxing weekend teas)
   - Weather correlations (hot tea on cold days)

### Privacy & Data Handling
- All learning data stored locally (no cloud profiling)
- User can view and delete learning data
- Export/import preferences with data export
- No personal information collected or transmitted

### Definition of Done
- [ ] Algorithm successfully learns from ≥5 brewing sessions per tea
- [ ] Suggestions improve user satisfaction measurably
- [ ] Learning data persists correctly between app sessions
- [ ] User can view and control their learning data
- [ ] Privacy requirements met (local storage only)

---

## Story 1.3.3: Context-Aware Tea Suggestions (Time, Weather, History)

**As a** tea enthusiast  
**I want** intelligent tea recommendations based on context  
**So that** the app anticipates my needs and becomes a true brewing companion

### Acceptance Criteria
1. **Time-Based Suggestions**
   - Morning (6-10am): Energizing teas (black, green)
   - Afternoon (10am-4pm): Focus teas (oolong, green)  
   - Evening (4pm-8pm): Relaxing teas (white, herbal)
   - Night (8pm+): Caffeine-free options (herbal, decaf)

2. **Weather Integration** (optional, privacy-respecting)
   - Cold weather: Warming teas (chai, black, pu-erh)
   - Hot weather: Cooling teas (green, white, iced options)
   - Rainy days: Comforting teas (earl grey, herbal blends)
   - Sunny days: Light, refreshing teas (jasmine, white)

3. **Historical Pattern Recognition**
   ```typescript
   interface TeaPattern {
     timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
     dayOfWeek: string;
     weather?: 'cold' | 'hot' | 'rainy' | 'sunny';
     frequentTeas: string[]; // Most brewed teas in this context
     confidence: number;
   }
   ```

4. **Prediction Engine**
   - Analyze past 30 days of brewing data
   - Weight recent preferences more heavily
   - Account for seasonal changes in preferences
   - Learn from suggestion acceptance/rejection

5. **Suggestion Presentation**
   - Subtle "Suggested for you" section at top of tea grid
   - 2-3 contextually relevant recommendations
   - Brief reasoning: "Perfect for this rainy evening"
   - Easy dismissal if suggestions aren't wanted

6. **Learning from Context**
   - Track which suggestions are accepted
   - Learn user's context sensitivity (some ignore time, others follow strictly)
   - Adapt suggestion frequency based on user engagement
   - Improve reasoning accuracy over time

### Prediction Algorithm
```typescript
const predictTea = (context: BrewingContext): TeaSuggestion[] => {
  const factors = {
    timeOfDay: 0.3,      // Strongest predictor
    recentHistory: 0.25,  // Recent brewing patterns
    weather: 0.15,       // Moderate influence
    dayOfWeek: 0.15,     // Weekday vs weekend
    seasonality: 0.15    // Long-term trends
  };
  
  return weightedPrediction(context, factors);
};
```

### Context Data Sources
1. **Device Time/Date** (always available)
2. **Weather API** (optional, with permission)
3. **User's Brewing History** (local data)
4. **Seasonal Patterns** (learned over time)

### Privacy Considerations
- Location data never stored (only current weather if permitted)
- All pattern recognition happens locally
- User can disable contextual suggestions
- No behavioral data leaves the device

### Definition of Done
- [ ] Time-based suggestions show appropriate teas for time of day
- [ ] Weather integration works without compromising privacy
- [ ] Historical pattern recognition improves over 30+ brewing sessions
- [ ] Users find suggestions helpful >60% of the time
- [ ] Suggestion accuracy improves with usage
- [ ] All contextual data processing happens locally

---

## Story 1.3.4: Tea Library Management and Collection Building

**As a** tea enthusiast  
**I want** a comprehensive tea library that grows automatically from OCR scans  
**So that** I can manage my tea collection without manual data entry

### Acceptance Criteria
1. **Automatic Library Building**
   - Every successful OCR scan creates/updates library entry
   - Library entry includes: tea name, parameters, package photo, scan date
   - Duplicate detection (same tea scanned multiple times)
   - Merge capability for same tea, different packages

2. **Library Organization**
   - Searchable by tea name, type, or brewing parameters
   - Filterable by tea category (green, black, etc.)
   - Sortable by: name, recently added, frequently brewed
   - Recently brewed teas appear at top

3. **Enhanced Tea Profiles**
   ```typescript
   interface LibraryTea {
     id: string;
     name: string;
     type: 'green' | 'black' | 'oolong' | 'white' | 'puerh' | 'herbal';
     parameters: {
       temperature: number;
       steeps: number[];
       vesselSize: number;
     };
     userAdjustments: {
       timeOffset: number;
       tempOffset: number;
       notes?: string;
     };
     metadata: {
       source: 'ocr' | 'manual' | 'preset';
       packagePhoto?: string;
       dateAdded: Date;
       brewCount: number;
       lastBrewed?: Date;
       rating?: number; // 1-5 stars
     };
   }
   ```

4. **Tea Detail Management**
   - View full tea details (parameters, photo, notes)
   - Edit parameters and add personal notes
   - Delete teas from library
   - Mark favorites for quick access

5. **Integration with Timer**
   - Tap any library tea loads it into timer
   - Quick brew button for immediate start
   - Recently used teas prominently displayed
   - Favorites section for easy access

6. **Library Statistics**
   - Total teas in collection
   - Most frequently brewed teas
   - Brewing streak tracking
   - Tea discovery timeline

### Library Interface Design
- Clean, zen-aesthetic list view
- Tea cards show: name, type icon, last brewed, rating
- Search bar at top (hidden until needed)
- Filter chips: All, Green, Black, Oolong, etc.
- Pull-to-refresh for manual library refresh

### Data Management
- Local storage via AsyncStorage
- Efficient storage (compress images)
- Export/import capability for backup
- Migration handling for schema changes

### OCR Library Integration
- Successful OCR automatically creates library entry
- User can confirm/edit before saving
- Duplicate detection prevents library bloat
- Package photos stored with appropriate compression

### Definition of Done
- [ ] OCR scans automatically populate library correctly
- [ ] Library search and filtering work smoothly
- [ ] Tea detail editing preserves all user customizations
- [ ] Library integrates seamlessly with timer functionality
- [ ] Performance remains good with 100+ tea library
- [ ] Data export/import preserves all library information

---

## Epic 1.3 Success Metrics

### Intelligence Features Adoption
- OCR usage: >60% of active users try scanning within first month
- OCR accuracy: >85% successful parameter extraction on clear packages
- Learning acceptance: >70% of users find adaptive suggestions helpful
- Library growth: Average 5+ teas added per user within 3 months

### User Experience Enhancement
- Time to brew new tea: 75% reduction vs manual entry
- Parameter accuracy: OCR+learning reduces user corrections by 60%
- Tea discovery: Users try 30% more tea varieties vs manual setup
- Suggestion relevance: Context-aware suggestions accepted >50% of time

### Technical Performance
- OCR processing time: <3 seconds on 90% of devices
- Learning algorithm accuracy improves >20% after 10 brewing sessions
- Library performance: Search/filter remains responsive with 100+ teas
- Offline functionality: All features work without internet connectivity

### Business Impact
- User retention: Intelligence features increase 30-day retention by 15%
- Engagement: Users with >10 library teas have 40% higher session frequency
- Differentiation: OCR+learning cited as primary differentiator vs competitors
- Premium conversion: Intelligence features drive 25% premium upgrade rate

---

## Integration with Previous Epics

Epic 1.3 builds upon the foundation:
- **Epic 1.1:** Gesture controls remain primary interaction method
- **Epic 1.2:** Animations adapt to learned tea preferences
- **OCR Integration:** Scanned parameters properly load into gesture timer
- **Learning Data:** Influences animation color progressions and timing

---

*Epic 1.3 transforms TeaFlow from a beautiful timer into an intelligent brewing companion that anticipates user needs and eliminates manual tea management friction.*