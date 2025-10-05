# Components

## Video-Enhanced Core Components

Based on the proven reliable animation architecture and video-based visual approach.

## Timer Core

**Responsibility:** Manages precise countdown timing with background operation support and haptic feedback integration

**Key Interfaces:**
- startTimer(seconds: number): void
- pauseTimer(): void  
- resetTimer(): void
- onTimerComplete: () => void
- onTimeUpdate: (remaining: number) => void

**Dependencies:** Background task manager, haptics system, audio system

**Technology Stack:** React Native background tasks, Expo Haptics, high-precision intervals with drift compensation

**Critical Timer Accuracy Architecture (≤0.2s/min drift guarantee):**
```typescript
// High-precision timer implementation with drift compensation
class PrecisionTimer {
  private startTime: number;
  private expectedDuration: number;
  private driftCompensation: number = 0;
  
  startTimer(seconds: number) {
    this.startTime = Date.now();
    this.expectedDuration = seconds * 1000;
    this.scheduleNextTick();
  }
  
  private scheduleNextTick() {
    const elapsed = Date.now() - this.startTime;
    const expectedTicks = Math.floor(elapsed / 1000);
    const drift = elapsed - (expectedTicks * 1000);
    
    // Compensate for accumulated drift
    const nextTickDelay = 1000 - drift;
    setTimeout(() => this.tick(), nextTickDelay);
  }
  
  // Cross-platform synchronization
  syncWithSystemTime() {
    const systemTime = Date.now();
    const timerTime = this.startTime + this.getElapsedTime();
    this.driftCompensation = systemTime - timerTime;
  }
}
```

**Cross-Platform Timing Consistency:**
- iOS: Use CADisplayLink for 60Hz precision when app active
- Android: WorkManager for background timing with drift monitoring  
- Background: Notification scheduling with local timer validation
- Validation: System time cross-reference every 30 seconds

## Video Tea Background System

**Responsibility:** Manages full-screen looping tea brewing videos as primary graphics system, creating zen meditative experience

**Key Interfaces:**
- loadTeaVideo(teaType: string): Promise<VideoSource>
- syncVideoToBrewingPhase(progress: number): void
- setVideoQuality(level: 'low' | 'medium' | 'high'): void
- handleVideoLoop(): void

**Dependencies:** Expo AV, video asset management, device performance detection

**Technology Stack:** Expo AV video player, MP4 H.264 videos (1080x1920, 10-15 second seamless loops), hardware acceleration

**Video Asset Management System:**
```typescript
interface VideoAssetManager {
  // Video specifications for different tea types
  videoSpecs: {
    format: 'MP4 (H.264)';
    resolution: '1080x1920';  // Vertical mobile optimized
    duration: '10-15 seconds';
    loop: 'seamless';
    audio: 'none (silent)';
    compression: 'high';
  };
  
  // Tea-specific video categories
  teaVideoLibrary: {
    green: 'light amber, gentle movement',
    black: 'dark amber, robust steeping', 
    oolong: 'medium amber, swirling patterns',
    puerh: 'deep reddish, rich brewing',
    white: 'very light, delicate steeping',
    herbal: 'various colors, floral movements'
  };
  
  // Asset delivery and optimization
  assetManagement: {
    localStorage: 'core tea videos in app bundle',
    cloudDelivery: 'additional videos via CDN',
    compression: 'multiple quality levels for devices',
    caching: 'smart caching of favorite tea videos'
  };
}
```

**Phase-Based Video Synchronization:**
```typescript
class VideoPhaseController {
  // Synchronize video with brewing phases
  synchronizeWithTimer(progress: number, phase: BrewingPhase) {
    switch(phase) {
      case 'preparation':
        this.setVideoState('empty vessel, tea leaves ready');
        break;
      case 'activeBrewing':
        this.setVideoProgress(progress); // Video progress = timer progress
        break;
      case 'complete':
        this.playVideoState('perfect tea color achieved');
        break;
      case 'betweenSteeps':
        this.setVideoState('peaceful waiting state');
        break;
    }
  }
  
  // Dynamic video adaptation based on brewing state
  adaptVideoIntensity(brewingProgress: number) {
    const intensity = this.calculateIntensity(brewingProgress);
    this.adjustVideoPlaybackRate(intensity);
    this.synchronizeColorProgression(brewingProgress);
  }
}
```

## Living Tea Metaphor Animations

**Responsibility:** Renders SVG-based tea brewing visualizations layered over video backgrounds for enhanced zen experience

**Key Interfaces:**
- renderTeaLeafDrift(intensity: number): JSX.Element
- updateSteamWisps(phase: BrewingPhase): void
- animateColorInfusion(progress: number, teaType: string): void
- setMetaphorComplexity(level: 'minimal' | 'rich'): void

**Dependencies:** React Native Skia, React Native SVG, device performance detection

**Technology Stack:** Vector-based SVG animations, Skia particle effects, 30fps target for zen experience, adaptive complexity

**Layered Animation Architecture (MISSING CRITICAL SYSTEM!):**
```typescript
// Proven hybrid architecture from reliable-animation-architecture.md
interface LayeredAnimationSystem {
  gestureLayer: {
    component: 'react-native-gesture-handler';
    type: 'transparent overlay';
    responsibility: 'touch detection without blocking animations';
    gestures: ['edgeTap', 'centerTap', 'pinch', 'twist', 'longPress'];
  };
  
  feedbackLayer: {
    component: 'subtle overlays';
    type: 'visual response';
    responsibility: 'gesture confirmation and parameter changes';
    effects: ['touchGlow', 'parameterAdjustments', 'stateTransitions'];
  };
  
  animationLayer: {
    component: 'SVG + react-native-reanimated';
    type: 'core tea metaphor';
    responsibility: 'living tea animations with natural variability';
    elements: ['teaLeaves', 'steamWisps', 'hourglassSand', 'colorProgression'];
  };
  
  backgroundLayer: {
    component: 'video or static backgrounds';
    type: 'tea ambiance';
    responsibility: 'tea-specific visual context';
    content: ['teaVideos', 'zenGradients', 'subtleTextures'];
  };
}
```

**Animation Phase Parameters (Gesture-Controllable):**
```typescript
// Dynamic intensity phases mapped to brew cycle
interface TeaAnimationPhases {
  start_0_to_20_percent: {
    leafSpeed: 0.3;      // Slow drift
    steamIntensity: 0.1; // Barely visible  
    sandFlowRate: 0.5;   // Gentle fall
    colorSaturation: 0.2; // Pale tea color
  };
  
  midBrew_20_to_80_percent: {
    leafSpeed: 0.7;      // Faster swirling
    steamIntensity: 0.6; // More visible wisps
    sandFlowRate: 1.0;   // Active flow
    colorSaturation: 0.7; // Rich tea color  
  };
  
  finish_80_to_100_percent: {
    leafSpeed: 0.2;      // Settling down
    steamIntensity: 0.3; // Fading steam
    sandFlowRate: 0.3;   // Slowing flow
    colorSaturation: 0.9; // Full saturation
  };
}
```

**Cross-Platform Performance Optimization:**
```typescript
class PerformanceOptimizer {
  // Device-tier specific animation complexity
  getAnimationComplexity(deviceTier: 'low' | 'medium' | 'high'): number {
    return {
      low: 0.5,     // Reduced particle count, simplified effects
      medium: 0.75, // Standard effects with optimizations
      high: 1.0     // Full visual fidelity
    }[deviceTier];
  }
  
  // Platform-specific optimizations
  optimizeForPlatform(platform: 'ios' | 'android') {
    if (platform === 'android') {
      this.targetFPS = 30; // Plan for potential stutter
      this.enableBatteryOptimizations = true;
    } else {
      this.targetFPS = 60; // iOS can handle higher performance
      this.enableBatteryOptimizations = false;
    }
  }
}
```

**Performance-Adaptive Rendering System:**
```typescript
// Device capability detection and adaptation
class PerformanceAdaptiveRenderer {
  private deviceTier: 'low' | 'medium' | 'high';
  private frameRateTarget: number;
  
  constructor() {
    this.deviceTier = this.detectDeviceCapability();
    this.frameRateTarget = this.deviceTier === 'low' ? 30 : 60;
  }
  
  private detectDeviceCapability(): DeviceTier {
    const { totalMemory, cpuCores, gpuModel } = getDeviceSpecs();
    
    if (totalMemory < 2048 || cpuCores < 4) return 'low';
    if (totalMemory < 4096 || !hasModernGPU(gpuModel)) return 'medium';
    return 'high';
  }
  
  getAnimationComplexity(): number {
    return {
      low: 0.5,     // Reduced particle count, simplified effects
      medium: 0.75, // Standard effects with some optimizations
      high: 1.0     // Full visual fidelity
    }[this.deviceTier];
  }
  
  // Dynamic quality adjustment based on performance
  adaptQualityDynamically(currentFPS: number) {
    if (currentFPS < this.frameRateTarget * 0.8) {
      this.reduceComplexity();
    } else if (currentFPS > this.frameRateTarget * 0.95 && this.canIncreaseQuality()) {
      this.increaseComplexity();
    }
  }
}
```

**Adaptive Rendering Strategies:**
- **Low-tier devices:** Simple SVG animations, reduced particle counts, 30fps target
- **Medium-tier devices:** Standard effects with selective optimization, 45fps target  
- **High-tier devices:** Full visual fidelity, complex particle systems, 60fps target
- **Dynamic adaptation:** Real-time quality adjustment based on frame rate monitoring

## OCR Scanner

**Responsibility:** Processes camera feed to extract tea package information and create TeaProfile entries

**Key Interfaces:**
- scanPackage(imageUri: string): Promise<OCRResult>
- parseTeaInfo(text: string): Partial<TeaProfile>
- validateScanResult(result: OCRResult): boolean

**Dependencies:** Vision Camera, ML Kit Text Recognition, tea information parsing logic

**Technology Stack:** React Native Vision Camera for high-quality image capture, Google ML Kit for text recognition

**OCR Quality Architecture (80% Accuracy Requirement):**
```typescript
interface OCRQualitySystem {
  minimumAccuracy: 80; // Percent - user trust threshold
  confidenceScoring: 'character' | 'word' | 'line' | 'paragraph';
  fallbackStrategies: ['manual-correction', 'template-matching', 'crowd-sourcing'];
  
  // Multi-language support for tea packaging
  supportedLanguages: ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'];
  
  // Processing pipeline
  processTeaPackage(imageUri: string): Promise<OCRResult> {
    const rawText = await this.extractText(imageUri);
    const confidence = this.calculateConfidence(rawText);
    
    if (confidence >= 0.8) {
      return this.parseTeaInformation(rawText);
    } else {
      return this.triggerFallbackFlow(imageUri, rawText);
    }
  }
  
  // Pattern matching for common tea brands
  templateMatching: {
    'twinings': TeaTemplate;
    'celestial-seasonings': TeaTemplate;
    'harney-sons': TeaTemplate;
    'dilmah': TeaTemplate;
  };
}
```

**Quality Validation Strategies:**
- Character-level confidence scoring
- Template matching against known tea brands  
- Manual correction learning system
- Crowdsourced validation for ambiguous text
- Multi-pass OCR with different preprocessing

## Data Persistence Manager

**Responsibility:** Handles all local data storage with automatic backup and offline-first synchronization

**Key Interfaces:**
- saveTeaProfile(tea: TeaProfile): Promise<void>
- loadUserTeas(): Promise<TeaProfile[]>
- saveBrewSession(session: BrewSession): Promise<void>
- syncToCloud(): Promise<void>

**Dependencies:** AsyncStorage for simple data, SQLite for complex queries, cloud backup service

**Technology Stack:** AsyncStorage for app state, SQLite for session history, AWS S3 for cloud backup

## Gesture Controller

**Responsibility:** Processes touch gestures for timer control and brewing parameter adjustments

**Key Interfaces:**
- onSwipeGesture: (direction: SwipeDirection) => void
- onPinchGesture: (scale: number) => void
- onPressGesture: (duration: number) => void

**Dependencies:** React Native Reanimated, haptic feedback system

**Technology Stack:** React Native Gesture Handler with Reanimated worklets for 120fps response

## Zen Gesture Controller  

**Responsibility:** Processes tea ceremony-inspired gestures for timer control without cluttering zen interface

**Key Interfaces:**
- onEdgeTap: (side: 'left' | 'right') => void  // ±5s adjustments
- onCenterTap: () => void                      // Start/pause/reset
- onPinchGesture: (scale: number) => void      // Vessel size
- onTwistGesture: (rotation: number) => void   // Temperature

**Dependencies:** React Native Reanimated, haptic feedback system, gesture conflict resolution

**Technology Stack:** Transparent gesture overlay, zone-based gesture detection with conflict resolution, zen-appropriate haptic patterns

**Advanced Gesture Conflict Resolution:**
```typescript
// Sophisticated gesture detection from PRD specifications
gesturePriority: {
  verticalGestures: 'when angle <30° from vertical axis',
  gestureZones: 'timer controls in central 70%, navigation in edge 15%',
  smartDetection: '100ms delay to determine intent before execution',
  edgeMapping: {
    leftEdge: 'X < screen.width * 0.2 = -10 seconds',
    rightEdge: 'X > screen.width * 0.8 = +10 seconds',
    centerTap: 'toggle timer state',
    longPress: 'liquid drain confirmation animation (1.5s)',
    pinchGesture: 'vessel size adjustment (110-500ml)',
    twistGesture: 'temperature adjustment (±5°C)'
  }
}
```

**Zen Confirmation Patterns:**
- **Liquid Drain Animation:** Tea flowing from cup/hourglass visual for destructive actions
- **No Modal Popups:** Pure visual feedback maintaining zen interface
- **Cancellation Grace:** Release finger within 1.5s cancels action

**Gesture Video Integration (MISSING CRITICAL FEATURE!):**
```typescript
// Video background interactions from video-based-visual-mockups.md
interface GestureVideoController {
  // Gestures that work directly with video backgrounds
  videoGestureMapping: {
    verticalSwipe: {
      action: 'temperature adjustment ±5°C';
      visualFeedback: 'overlay thermometer appears over video';
      videoResponse: 'steam intensity changes based on temperature';
    };
    
    horizontalSwipe: {
      action: 'vessel size adjustment ±10ml';
      visualFeedback: 'overlay vessel size indicator';
      videoResponse: 'vessel appears larger/smaller in video frame';
    };
    
    longPress: {
      action: 'show tea information overlay';
      visualFeedback: 'tea details appear over video';
      videoResponse: 'video slightly dims to highlight overlay';
    };
    
    doubleTap: {
      action: 'restart current steep';
      visualFeedback: 'confirmation animation';
      videoResponse: 'video restarts with flash effect';
    };
  };
  
  // Seamless integration between gestures and video
  synchronizeGestureWithVideo(gesture: GestureType, intensity: number) {
    switch(gesture) {
      case 'temperatureAdjust':
        this.adjustVideoSteamIntensity(intensity);
        this.showTemperatureOverlay(intensity);
        break;
      case 'vesselSizeAdjust':
        this.adjustVideoVesselScale(intensity);
        this.showVesselSizeOverlay(intensity);
        break;
      case 'teaInfoRequest':
        this.dimVideoForOverlay();
        this.showTeaInformationOverlay();
        break;
    }
  }
}
```

## Tea-Specific Learning Engine

**Responsibility:** Analyzes brewing sessions to provide personalized recommendations respecting tea ceremony principles  

**Key Interfaces:**
- recordBrewFeedback(session: BrewSession, feedback: BrewFeedback): void
- getAnticipatedRecommendation(teaId: string, context: BrewingContext): TeaRecommendation  
- respectCulturalAuthenticity(recommendation: TeaRecommendation): boolean
- explainRecommendation(recommendation: TeaRecommendation): string

**Dependencies:** Session data, cultural tea knowledge base, statistical analysis utilities

**Technology Stack:** Local-only machine learning, cultural tea ceremony principles validation, transparent recommendation explanations

## Anticipatory Intelligence System (MISSING CRITICAL COMPONENT!)

**Responsibility:** Predicts user tea preferences based on context (time, weather, mood patterns) to transform TeaFlow into anticipatory companion

**Key Interfaces:**
- predictNextTea(context: BrewingContext): Promise<TeaPrediction>
- learnFromSession(session: BrewSession, context: BrewingContext): void
- getContextualRecommendations(timeOfDay: string, weather?: string): TeaProfile[]
- updatePredictionModel(feedback: UserFeedback): void

**Context Analysis Factors:**
```typescript
interface BrewingContext {
  timeOfDay: number;      // 0.3 weight - morning/afternoon/evening patterns
  lastTea: string;        // 0.2 weight - sequence preferences  
  weather: string;        // 0.15 weight - weather correlation
  dayOfWeek: string;      // 0.15 weight - weekend vs weekday
  userHistory: object;    // 0.2 weight - personal patterns
}

// Prediction Algorithm Implementation
predictNextTea() {
  return weightedPrediction({
    timeOfDay: getMorningAfternoonEvening() * 0.3,
    lastTea: getTeaSequencePattern() * 0.2,
    weather: getWeatherCorrelation() * 0.15,
    dayOfWeek: getWeekendPattern() * 0.15,
    userHistory: getPersonalPatterns() * 0.2
  });
}
```

**Dependencies:** Weather API integration, usage pattern analysis, machine learning algorithms, cultural tea knowledge base

**Technology Stack:** TensorFlow Lite for on-device ML, local pattern recognition, weather service integration, preference learning algorithms

## Premium Feature Gate System (MISSING CRITICAL COMPONENT!)

**Responsibility:** Manages separation between free and premium functionality, handles subscription management and feature unlocking

**Key Interfaces:**
- checkFeatureAccess(featureId: string): Promise<boolean>
- unlockPremiumFeatures(purchaseToken: string): Promise<void>
- validateSubscription(): Promise<SubscriptionStatus>
- getFeatureAvailability(): FeatureMatrix

**Feature Matrix Architecture:**
```typescript
interface FeatureMatrix {
  free: {
    teaProfiles: 3;           // 3 preset teas only
    timerAccuracy: 'basic';   // Standard timer, no drift compensation
    animations: 'simple';    // Basic hourglass, no living metaphors
    ocr: false;              // No package scanning
    learning: false;         // No adaptive recommendations
    cloudSync: false;        // Local only
    analytics: false;        // No session analytics
  };
  
  premium: {
    teaProfiles: 'unlimited'; // Unlimited custom teas
    timerAccuracy: 'precise'; // ≤0.2s/min drift compensation
    animations: 'full';      // Complete living tea metaphor animations
    ocr: true;               // Full package scanning with 80% accuracy
    learning: true;          // Anticipatory intelligence system
    cloudSync: false;        // Still local (incentive for subscription)
    analytics: 'basic';     // Session history and basic analytics
  };
  
  subscription: {
    teaProfiles: 'unlimited';
    timerAccuracy: 'precise';
    animations: 'premium';   // Exclusive animations + seasonal variants
    ocr: true;
    learning: 'advanced';    // Community wisdom + cultural recommendations
    cloudSync: true;         // Cross-device synchronization
    analytics: 'advanced';  // Advanced analytics + community insights
    communityFeatures: true; // Tea master learning + community sharing
  };
}
```

**Technical Implementation:**
```typescript
class PremiumGateManager {
  private purchaseState: 'free' | 'premium' | 'subscription';
  
  async checkFeatureGate(feature: string): Promise<boolean> {
    const userTier = await this.getCurrentTier();
    return this.featureMatrix[userTier][feature] !== false;
  }
  
  async promptUpgrade(feature: string): Promise<void> {
    const requiredTier = this.getRequiredTier(feature);
    await this.showUpgradeModal(feature, requiredTier);
  }
}
```

**Dependencies:** App Store/Play Store billing integration, local purchase state management, feature usage tracking

**Technology Stack:** React Native IAP, secure purchase validation, encrypted feature state storage, graceful feature degradation

## Community Wisdom Platform (MISSING CRITICAL COMPONENT!)

**Responsibility:** Anonymous aggregation and sharing of brewing preferences across the TeaFlow community while maintaining privacy

**Key Interfaces:**
- contributeAnonymousData(session: BrewSession): Promise<void>
- getCommunityWisdom(teaId: string): Promise<CommunityRecommendations>
- validateCulturalAuthenticity(brewingMethod: BrewingMethod): boolean
- getTeaMasterInsights(teaType: string): Promise<EducationalContent>

**Community Data Architecture:**
```typescript
interface CommunityWisdom {
  // Anonymous aggregate data
  aggregatedSessions: {
    teaId: string;
    averageTime: number;
    preferredTemperature: number;
    commonVesselSizes: number[];
    satisfactionRating: number;
    culturalAccuracy: number; // Validated by tea ceremony experts
  };
  
  // Cultural authenticity validation
  traditionalMethods: {
    [teaType: string]: {
      origin: string;           // Cultural origin
      traditionalTime: number;  // Historical brewing time
      ceremonyContext: string;  // When/how traditionally used
      culturalNotes: string;    // Respect and authenticity guidance
    };
  };
  
  // Tea master educational content  
  educationalContent: {
    beginnerTips: string[];
    advancedTechniques: string[];
    culturalBackground: string;
    commonMistakes: string[];
  };
}
```

**Privacy-Preserving Analytics:**
```typescript
class PrivacyPreservingAnalytics {
  // Differential privacy for brewing data
  async contributeSession(session: BrewSession): Promise<void> {
    const anonymizedData = this.addNoise(session);
    const aggregatedUpdate = this.createAggregateUpdate(anonymizedData);
    await this.submitToGlobalPool(aggregatedUpdate);
  }
  
  // No individual user tracking
  private addNoise(data: BrewSession): AnonymizedSession {
    return {
      teaType: data.teaType,
      time: this.addGaussianNoise(data.time, 5), // ±5s noise
      temperature: this.addGaussianNoise(data.temp, 2), // ±2°C noise
      satisfaction: data.rating,
      // Remove all personally identifiable information
    };
  }
}
```

**Cultural Authenticity System:**
```typescript
interface CulturalAuthenticityValidator {
  // Validate brewing methods against traditional practices
  validateBrewingMethod(method: BrewingMethod): ValidationResult {
    const traditional = this.getTraditionalMethod(method.teaType);
    
    return {
      authenticity: this.calculateAuthenticity(method, traditional),
      suggestions: this.generateCulturalGuidance(method, traditional),
      respectLevel: this.assessCulturalRespect(method),
      educationalNotes: this.getEducationalContent(method.teaType)
    };
  }
  
  // Repository of traditional tea ceremony knowledge
  traditionalKnowledge: {
    'longjing': { /* Green tea traditional methods */ },
    'tieguanyin': { /* Oolong traditional methods */ },
    'puerh': { /* Pu-erh traditional methods */ },
    'matcha': { /* Japanese tea ceremony methods */ },
    // ... extensive cultural knowledge base
  };
}
```

**Dependencies:** Backend analytics service, cultural tea knowledge database, privacy-preserving algorithms, educational content management

**Technology Stack:** Differential privacy algorithms, encrypted data aggregation, cultural knowledge APIs, educational content delivery system

## Research & Testing Framework (MISSING CRITICAL SYSTEM!)

**Responsibility:** Systematic validation of critical architecture decisions through structured research and testing phases

**Implementation Research Pipeline:**
```typescript
interface ImplementationResearchFramework {
  week1_2_CriticalResearch: {
    timerAccuracyTesting: {
      goal: "Test background timer drift across devices";
      method: "React Native timer accuracy measurement";
      successCriteria: "<0.2s/min drift across 10+ device types";
      blockerRisk: "High - affects user trust in core functionality";
    };
    
    gestureLibraryEvaluation: {
      goal: "Compare gesture handler options for conflict resolution";
      method: "React Native Gesture Handler vs alternatives";
      successCriteria: "<2% false positives in user testing";
      blockerRisk: "High - core interaction paradigm";
    };
    
    ocrLibraryAssessment: {
      goal: "Test ML Kit vs Tesseract vs cloud OCR for tea packages";
      method: "Accuracy testing on variety of tea packages";
      successCriteria: ">80% extraction rate on clear packages";
      blockerRisk: "Medium - fallback to manual entry available";
    };
    
    storageArchitecture: {
      goal: "Decide local-only vs cloud-sync architecture";
      method: "Privacy/performance tradeoff analysis";
      successCriteria: "Clear user acceptance of chosen approach";
      blockerRisk: "High - affects entire data architecture";
    };
  };
  
  week3_4_PrototypeTesting: {
    gesturePrototype: "Test tap/edge-tap/long-press recognition accuracy";
    timerReliability: "Extended testing across iOS/Android for consistency";
    ocrProofOfConcept: "Test parsing accuracy on variety of tea packages";
    accessibilityTesting: "Interview users with motor/visual impairments";
  };
  
  month2_UserValidation: {
    zenUXTesting: "Measure user calm/frustration with gesture-only interface";
    onboardingFlow: "Test how quickly users learn gesture system";
    learningAcceptance: "Validate adaptive suggestions feel helpful vs intrusive";
    culturalResonance: "Test visual design across different tea traditions";
  };
}
```

**Validation Metrics Architecture:**
```typescript
interface ValidationMetricsSystem {
  technicalMetrics: {
    timerDrift: {
      target: "<0.2s/min";
      measurement: "across 10+ device types";
      criticality: "BLOCKER - affects user trust";
    };
    gestureAccuracy: {
      target: "<2% false positives"; 
      measurement: "in user testing";
      criticality: "BLOCKER - core interaction";
    };
    ocrSuccess: {
      target: ">80% extraction rate";
      measurement: "on clear packages";
      criticality: "HIGH - affects onboarding";
    };
  };
  
  uxMetrics: {
    zenExperience: {
      target: "Users report feeling calmer, not stressed";
      measurement: "post-session surveys";
      criticality: "HIGH - core value proposition";
    };
    learningAcceptance: {
      target: ">70% users find suggestions helpful";
      measurement: "feedback surveys";
      criticality: "MEDIUM - premium feature";
    };
    accessibility: {
      target: "Alternative interactions work for impaired users";
      measurement: "accessibility user testing";
      criticality: "HIGH - app store compliance";
    };
  };
}
```

## Advanced UX Systems (MISSING FROM FRONT-END SPEC!)

**Responsibility:** Sophisticated gesture conflict resolution, voice control integration, and refined transition systems

**Diagonal Swipe Logic System:**
```typescript
interface DiagonalSwipeSystem {
  // Advanced gesture conflict resolution from front-end-spec.md
  conflictResolution: {
    prioritization: "Timer screen prioritizes vertical gestures when angle <30° from vertical axis";
    gestureZones: "Timer controls active in central 70%, navigation in edge 15%";
    smartDetection: "100ms delay to determine gesture intent before execution";
  };
  
  // Sophisticated gesture classification
  classifyGesture(angle: number, velocity: number, position: TouchPosition): GestureType {
    // Vertical gesture priority for timer control
    if (angle < 30 && Math.abs(angle - 90) < 30) {
      return 'verticalTimerAdjustment';
    }
    
    // Edge navigation zones
    if (position.x < screenWidth * 0.15 || position.x > screenWidth * 0.85) {
      return 'navigationSwipe';
    }
    
    // Default to parameter adjustment in central zone
    return 'parameterAdjustment';
  };
  
  // Smart gesture intent detection
  waitForIntentClarification(initialTouch: TouchEvent): Promise<GestureType> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const finalIntent = this.analyzeGestureTrajectory(initialTouch);
        resolve(finalIntent);
      }, 100); // 100ms delay for intent determination
    });
  }
}
```

**Voice Control Integration System:**
```typescript
interface VoiceControlSystem {
  // Accessibility integration for gesture-impaired users
  supportedCommands: [
    "Next screen", "Previous screen", "Start timer", "Pause timer",
    "Add tea", "Stop brewing", "Repeat last steep", "Show settings"
  ];
  
  // Platform integration
  speechRecognition: {
    ios: "iOS Speech Recognition Framework";
    android: "Android SpeechRecognizer";
    fallback: "Cloud speech API for complex commands";
  };
  
  // Voice command processing
  processVoiceCommand(command: string): Promise<ActionResult> {
    const normalizedCommand = this.normalizeCommand(command);
    const action = this.mapCommandToAction(normalizedCommand);
    return this.executeWithFeedback(action);
  };
  
  // Accessibility compliance
  accessibilityIntegration: {
    screenReader: "Full VoiceOver/TalkBack compatibility";
    voiceNavigation: "Alternative to gesture-only interface";
    confirmationAudio: "Spoken confirmation of all voice actions";
  };
}
```

**Refined Transition System:**
```typescript
interface RefinedTransitionSystem {
  // Layered animation priority from front-end-spec.md
  layeredAnimation: {
    backgroundVideo: {
      behavior: "Remains steady and continuous during all transitions";
      priority: "Highest - never interrupted";
      performance: "Hardware accelerated, maintains 30fps minimum";
    };
    
    midgroundUI: {
      behavior: "Gentle slide transitions between screens";
      duration: "400ms standard easing";
      fallback: "Reduce to fade if performance drops";
    };
    
    foregroundElements: {
      behavior: "Subtle parallax for depth without distraction";
      intensity: "Reduced on lower-tier devices";
      purpose: "Enhance zen experience without overwhelming";
    };
  };
  
  // Performance-adaptive transitions
  performancePriority: {
    rule: "Video rendering takes precedence, UI animations scale back if FPS drops";
    monitoring: "Real-time FPS monitoring during transitions";
    adaptation: "Graceful degradation to simpler animations";
    
    adaptTransition(currentFPS: number, targetFPS: number): TransitionConfig {
      if (currentFPS < targetFPS * 0.8) {
        return this.getSimplifiedTransition();
      }
      return this.getStandardTransition();
    }
  };
}
```

## AI UI Generation Component Specifications (MISSING CRITICAL SYSTEM!)

**Responsibility:** Detailed component specifications for AI-assisted development with specific implementation constraints and interfaces

**Core Component Specifications:**
```typescript
// VideoTimerScreen component specification
interface VideoTimerScreenSpec {
  filesToCreate: ["components/VideoTimerScreen.tsx", "components/CircularProgress.tsx"];
  dependencies: [
    "expo-av Video component as full-screen background",
    "expo-haptics for gesture feedback", 
    "useTheme hook from existing theme system"
  ];
  
  implementation: {
    videoBackground: {
      position: "absolute, top: 0, left: 0, right: 0, bottom: 0";
      resizeMode: "cover for proper aspect ratio";
      looping: "isLooping={true}";
      audio: "isMuted={true}";
      playback: "shouldPlay based on screen focus";
    };
    
    overlayStructure: {
      semiTransparentOverlay: "over video for text readability";
      floatingTeaCard: "tea name + temperature/volume info at top";
      circularTimer: "MM:SS format with progress ring in center";
      actionButtons: "Play/Pause + Next Steep at bottom";
      gestureHints: "minimal text at very bottom";
    };
  };
  
  interfaces: {
    Tea: "id, name, temperature, vesselSize, steepTimes, videoUrl";
    TimerState: "timeRemaining, currentSteep, isActive, totalSteeps";
  };
  
  constraints: {
    doNot: [
      "Use any 3D graphics or complex animations",
      "Add bottom navigation or persistent UI chrome", 
      "Include multiple video players simultaneously",
      "Modify existing navigation components"
    ];
    filesToNeverTouch: ["App.tsx", "navigation/ folder", "package.json"];
  };
}

// TeaLibraryGrid component specification  
interface TeaLibraryGridSpec {
  filesToCreate: ["components/TeaLibraryGrid.tsx", "components/TeaCard.tsx", "components/SearchInput.tsx"];
  
  features: {
    searchFunctionality: "TextInput with debounced search for performance";
    filterTabs: "All, Green, Black, Oolong, Pu-erh, White, Herbal";
    responsiveGrid: "2 columns phone, 3-4 tablet based on screen width";
    videoThumbnails: "Static frame or mini-loop for each tea";
    emptyStates: "No teas found, no search results, loading skeleton";
  };
  
  interfaces: {
    TeaLibraryGridProps: "teas[], onTeaSelect, onTeaEdit?, onAddTea, isLoading?";
    teaTypeColors: {
      green: "#4A6741", black: "#2D1810", oolong: "#8B4513",
      puerh: "#654321", white: "#F5F5DC", herbal: "#8FBC8F"
    };
  };
  
  constraints: {
    doNot: [
      "Use video streaming while scrolling (performance issue)",
      "Add complex animations to grid items",
      "Include edit/delete functionality (out of scope)"
    ];
  };
}

// OCRScannerScreen component specification
interface OCRScannerScreenSpec {
  filesToCreate: [
    "components/OCRScannerScreen.tsx",
    "components/ScanningOverlay.tsx", 
    "components/TextDetectionResults.tsx",
    "utils/textProcessing.ts"
  ];
  
  implementation: {
    cameraPermissions: "Request on mount, show denied state with settings link";
    cameraView: "Full-screen preview with overlay scanning guide rectangle";
    textDetection: "Real-time highlights with confidence indicators";
    resultProcessing: "Slide-up modal with editable fields";
  };
  
  textPatterns: {
    temperature: "/(\d+)°?[CF]/g",
    time: "/(\d+)\s*(min|sec|minutes|seconds)/g", 
    steeps: "/(\d+)\s*(steep|infusion|brew)/gi"
  };
  
  interfaces: {
    OCRResult: "detectedText, confidence, extractedData{teaName?, temperature?, steepTime?, steeps?}";
    ScannerProps: "onScanComplete, onCancel";
  };
  
  constraints: {
    doNot: [
      "Use third-party OCR services without offline fallback",
      "Store or transmit captured images without user consent",
      "Access photo library or other camera features"
    ];
  };
}
```

**Mobile-First Implementation Guidelines:**
```typescript
interface MobileFirstAdaptation {
  // Responsive adaptation patterns
  layoutChanges: {
    mobile: "Single column, full-width components";
    tablet: "Two-column layout for Library, side-by-side timer and controls";
    desktop: "Three-column layout with persistent navigation sidebar";
  };
  
  gridAdaptation: {
    phoneColumns: 2;
    tabletColumns: "3-4 instead of 2";
    textSizing: "Larger text sizes and touch targets for tablet/desktop";
  };
  
  videoPerformanceOptimization: {
    compression: "Videos should be compressed and optimized";
    lazyLoading: "Implement lazy loading for video thumbnails";
    placeholders: "Use placeholder images while videos load";
    deviceCapabilities: "Consider device capabilities for video quality";
  };
  
  fileConstraints: {
    // Strict scope boundaries for AI generation
    canReference: ["lib/theme.ts", "types/tea.ts existing interfaces"];
    neverModify: ["App.tsx", "navigation/ folder", "existing components", "package.json"];
    mustCreate: "New component files only, following existing patterns";
  };
}
```

## Priority Implementation Systems (MISSING FROM BRAINSTORMING!)

**Responsibility:** Top-priority systems from brainstorming that need immediate architectural support

**Priority #1: Gesture-Based Timer Core:**
```typescript
interface GestureBasedTimerCore {
  description: "Replace buttons with tap/edge-tap/long-press gestures on hourglass animation";
  
  implementation: {
    gestures: "edge-tap (±5s), center-tap (start/pause), long-press (reset)";
    visualFeedback: "Haptic + visual confirmation for each gesture";
    technology: "React Native Gesture Handler + hourglass video assets + timer logic";
    foundation: "Essential foundation for entire app experience";
  };
  
  timeline: "2-3 weeks for MVP functionality";
  
  successCriteria: {
    enablesGoal: "≤2 taps to start brewing from app launch";
    userExperience: "Intuitive gesture discovery without tutorial";
    technicalTarget: ">95% gesture recognition accuracy";
  };
  
  resources: {
    gestureHandlers: "React Native Gesture Handler library";
    videoAssets: "Hourglass animation videos for different tea types";
    timerLogic: "High-precision timer with drift compensation";
    hapticFeedback: "Expo Haptics for gesture confirmation";
  };
}
```

**Priority #2: Smart Quick Access System:**
```typescript
interface SmartQuickAccessSystem {
  description: "App opens directly to last used tea with vessel/temp settings ready";
  
  implementation: {
    lastTeaPersistence: "AsyncStorage for last selected tea profile";
    vesselMemory: "Remember user's preferred vessel size per tea";
    temperatureMemory: "Remember user's temperature adjustments";
    oneTabBrewing: "Single tap starts brewing with remembered settings";
  };
  
  timeline: "1-2 weeks alongside timer core";
  
  successCriteria: {
    coreGoal: "Directly supports ≤2 taps requirement and fast start";
    userJourney: "Returning users bypass tea selection step";
    stateManagement: "Seamless app restoration from background";
  };
  
  technology: {
    storage: "AsyncStorage implementation for preferences";
    stateManagement: "Context/Zustand for current session state";
    backgroundState: "Proper timer state preservation during app backgrounding";
  };
}
```

**Dual-Purpose Design Philosophy:**
```typescript
interface DualPurposeDesignSystem {
  // Core principle from brainstorming: every element serves aesthetic + functional roles
  principle: "Eliminate interface clutter while maximizing functionality through dual-purpose elements";
  
  examples: {
    hourglassGestural: "Hourglass animation serves as both visual metaphor AND gesture control surface";
    backgroundsAsState: "Video backgrounds indicate brewing phase and tea type simultaneously";
    feedbackAsProfile: "User feedback during brewing builds tea preference profile";
    visualFirstInterface: "Replace traditional controls with gesture-responsive visual elements";
  };
  
  implementation: {
    gestureAreas: "Invisible touch zones over beautiful animations";
    stateVisualization: "Animation intensity/color reflects brewing progress";
    contextualFeedback: "Visual responses that enhance rather than distract from zen experience";
    multimodalCues: "Combine visual, haptic, and audio feedback seamlessly";
  };
  
  goals: {
    beautyAndFunction: "Beauty and function merge rather than compete";
    zenSimplicity: "Less interface, more experience";
    contextAwareness: "Smart defaults based on usage patterns reduce friction";
  };
}
```

## Strategic Market Defense Architecture (MISSING FROM COMPETITOR ANALYSIS!)

**Responsibility:** Systematic market positioning and competitive defense strategies to protect TeaFlow's unique market position

**Market Defense Strategy System:**
```typescript
interface MarketDefenseArchitecture {
  // Primary competitive threats and response strategies
  competitiveMonitoring: {
    priority1Threats: {
      headspaceCalm: {
        threat: "Could add 'Mindful Tea Brewing' program with wellness ecosystem integration";
        defensiveResponse: "Establish tea expertise moat they can't quickly replicate";
        timeline: "Monitor weekly for meditation + tea content announcements";
      };
      
      appleEcosystem: {
        threat: "Platform-level timer integration with smart home and Apple Watch";
        defensiveResponse: "Focus on tea cultural authenticity and specialized experience";
        timeline: "Monitor iOS health app updates and HomeKit announcements";
      };
      
      perfectTeaTimer: {
        threat: "Established tea app could add gesture controls and animations";
        defensiveResponse: "Premium positioning and superior zen user experience";
        timeline: "Monitor app updates and feature additions monthly";
      };
    };
    
    emergingThreats: {
      teaBrandApps: "Direct-to-consumer apps from premium tea companies";
      techGiants: "Google Assistant, Alexa adding tea brewing voice commands";
      aestheticTimers: "Tide, Forest apps adding tea/ritual themes";
    };
  };
  
  // Core defensive moats 
  sustainableAdvantages: {
    culturalAuthenticity: {
      barrier: "Deep tea ceremony knowledge and philosophy integration";
      reinforcement: "Partner with tea masters and cultural institutions";
      validation: "Tea community practitioner approval system";
    };
    
    interactionInnovation: {
      barrier: "Gesture-based controls create unique user experience";
      reinforcement: "Continuous gesture control improvements and patent protection";
      validation: ">95% gesture recognition accuracy with intuitive discovery";
    };
    
    visualDifferentiation: {
      barrier: "Living tea metaphor animations distinctive and hard to replicate";
      reinforcement: "Advanced animation experiences and cultural variant systems";
      validation: "Zen experience measurement through user surveys";
    };
    
    focusedExperience: {
      barrier: "Pure tea brewing focus vs competitors' feature creep";
      reinforcement: "Resist feature expansion that dilutes core experience";
      validation: "Maintain zen simplicity as features expand";
    };
  };
  
  // Strategic positioning messages
  positioningStrategy: {
    coreMessage: "The Moleskine of Tea Apps - Premium, authentic, beautifully crafted";
    
    differentiationMessages: {
      vsMeditationApps: "Built by tea ceremony practitioners, for tea lovers - not borrowed wellness concepts";
      vsAppleEcosystem: "Designed by tea experts who understand cultural nuance, not generic engineers";
      vsBasicTeaApps: "Art meets precision - where beauty and function merge in tea brewing";
      vsTechGiants: "Focused tea ritual vs generic platform features that miss cultural authenticity";
    };
    
    targetCommunication: {
      teaEnthusiasts: "Cultural authenticity and tea ceremony expertise they can trust";
      premiumConsumers: "Moleskine-quality craftsmanship applied to tea technology";
      wellnessMarket: "Active tea ritual vs passive meditation content consumption";
    };
  };
  
  // Blue ocean market creation
  blueOceanOpportunities: {
    zenTeaTechnologyIntersection: {
      concept: "Combine ancient tea ceremony wisdom with modern gestural interfaces";
      marketGap: "Technology that enhances rather than disrupts traditional practices";
      execution: "Gesture controls that feel like natural tea ceremony movements";
    };
    
    premiumTeaAppCategory: {
      concept: "No established premium tea app brand ($10+ price point) exists";
      marketGap: "Tea enthusiasts willing to pay for quality experience vs free alternatives";
      execution: "Premium positioning with cultural authenticity and superior experience";
    };
    
    anticipatoryTeaCompanion: {
      concept: "Apps that predict and adapt to user preferences over time";
      marketGap: "AI-enhanced traditional rituals without losing authenticity";
      execution: "Learning system that respects tea ceremony principles";
    };
    
    crossCulturalTeaBridge: {
      concept: "Unify different tea traditions in single respectful experience";
      marketGap: "Global tea culture education through beautiful technology";
      execution: "Multi-cultural tea tradition support with authentic variation";
    };
  };
}
```

**Partnership Ecosystem Strategy:**
```typescript
interface PartnershipEcosystemStrategy {
  // Complementary collaboration opportunities
  strategicPartnerships: {
    premiumTeaRetailers: {
      value: "Exclusive brewing guides, tea pairing recommendations, purchase integration";
      examples: "Harney & Sons, Tea Forte, local tea ceremony schools";
      implementation: "White-label TeaFlow integration, co-branded experiences";
    };
    
    teaCeremonySchools: {
      value: "Educational partnerships, authentic cultural content validation";
      examples: "Japanese tea ceremony instructors, Chinese gongfu tea experts";
      implementation: "Cultural authenticity advisory board, educational content library";
    };
    
    wellnessCenters: {
      value: "Mindful tea brewing workshops and group experiences";
      examples: "Meditation centers, wellness retreats, corporate wellness programs";
      implementation: "B2B white-label versions, group session features";
    };
    
    smartHomeBrands: {
      value: "Integration with premium kettles, lighting, ambient sound systems";
      examples: "Fellow kettles, Philips Hue lighting, Sonos audio systems";
      implementation: "API integrations, smart home ecosystem expansion";
    };
  };
  
  // Strategic alliance potential
  strategicAlliances: {
    appleWatchPartnership: {
      opportunity: "Enhanced haptic feedback specifically designed for tea brewing phases";
      value: "Superior timing precision and zen feedback vs generic timer apps";
      implementation: "Apple Watch app with tea-specific haptic patterns and complications";
    };
    
    highEndTeaBrands: {
      opportunity: "Co-branded premium experiences with luxury tea companies";
      value: "Authentic tea expertise combined with premium technology experience";
      implementation: "Exclusive brewing profiles, limited edition tea + app bundles";
    };
    
    culturalInstitutions: {
      opportunity: "Museums, tea gardens, cultural centers for authentic content";
      value: "Educational credibility and cultural authenticity validation";
      implementation: "Digital tea ceremony guides, cultural education content";
    };
  };
  
  // Defensive alliance strategy
  competitiveAlliances: {
    exclusivityAgreements: "Prevent meditation apps from partnering with tea experts";
    platformPartnerships: "Preferred tea app status on wellness platforms";
    culturalValidation: "Tea community endorsements that competitors can't replicate";
  };
}
```

## Component Integration Architecture (MISSING FROM IMPLEMENTATION GUIDE!)

**Responsibility:** Complete integration patterns for enhanced components that seamlessly integrate with existing codebase architecture

**Enhanced Component Integration System:**
```typescript
interface ComponentIntegrationArchitecture {
  // Enhanced base components building on existing theme system
  enhancedBaseComponents: {
    enhancedButton: {
      integration: "Building on existing theme system with tea-inspired variants";
      variants: "primary (tea-green), secondary (cream/outline), ghost, text";
      enhancements: "Haptic feedback, brewing state colors, zen-appropriate sizing";
      codebaseIntegration: "Drop-in replacement for existing Button component";
    };
    
    enhancedTeaCard: {
      integration: "Integrating with existing tea data structure and gesture handling";
      features: "Video thumbnails, tea type color coding, favorite stars, brewing history";
      enhancements: "Long-press gestures, visual feedback, tea parameter display";
      codebaseIntegration: "Compatible with existing Tea interface, FlatList integration";
    };
    
    enhancedTimerDisplay: {
      integration: "Pulse animations, color-coded states, steeping progress visualization";
      features: "Circular progress ring, breathing animations, state-based colors";
      enhancements: "Haptic feedback integration, timer completion celebrations";
      codebaseIntegration: "Replaces basic timer display in RealisticCupInterface";
    };
    
    enhancedGestureOverlay: {
      integration: "Three-zone control (temperature/timer/volume) with haptic feedback";
      features: "Invisible gesture zones, visual feedback hints, conflict resolution";
      enhancements: "Smart gesture detection, adaptive sensitivity, zen-appropriate responses";
      codebaseIntegration: "Wraps existing screens with enhanced gesture capabilities";
    };
  };
  
  // Theme system enhancement and integration
  themeSystemIntegration: {
    enhancedTheme: {
      extension: "Extends existing theme with complete tea-inspired color palette";
      newTokens: "teaGreen, goldenOolong, steepingAmber, softBlack, clayGray, mistGray";
      functionalColors: "successTea, warningAmber, errorRed for brewing states";
      brewingStates: "preparation, activeBrew, complete colors for phase indication";
    };
    
    designTokens: {
      typography: "Display, H1-H3, body variants, timer-specific monospace fonts";
      spacing: "xs(4) through xxxl(64) consistent 8px grid system";
      animations: "fast(150), standard(300), slow(500), brewing(1000) timing";
      borderRadius: "subtle(4), standard(8), rounded(12), pill(24), circle(50%)";
    };
    
    responsivePatterns: {
      deviceAdaptation: "Phone, tablet, desktop layout variations";
      accessibilitySupport: "High contrast modes, motion reduction, voice control";
      performanceScaling: "Animation complexity based on device capabilities";
    };
  };
  
  // Integration with existing screens
  existingCodebaseIntegration: {
    teaLibraryScreen: {
      enhancement: "FlatList with enhanced TeaCard components, search, filtering";
      integration: "numColumns responsive grid, gesture-based interactions";
      compatibility: "Existing tea data structure, navigation patterns preserved";
    };
    
    realisticCupInterface: {
      enhancement: "EnhancedGestureOverlay wrapping existing timer functionality";
      integration: "Enhanced timer display with circular progress and animations";
      compatibility: "Existing timer logic, brewing session management preserved";
    };
    
    gestureOverlay: {
      enhancement: "Three-zone gesture detection with haptic feedback";
      integration: "Temperature, volume, timer controls via vertical gestures";
      compatibility: "Existing gesture handler patterns extended";
    };
    
    themeConsistency: {
      enhancement: "useEnhancedTheme hook extending base theme system";
      integration: "Backwards compatible with existing theme usage";
      compatibility: "All existing components continue working with enhanced colors";
    };
  };
}
```

**Advanced Animation Integration System:**
```typescript
interface AdvancedAnimationIntegration {
  // Core animation patterns for tea brewing experience
  coreAnimations: {
    pulseAnimations: {
      purpose: "Breathing effect for active timer states to create zen rhythm";
      implementation: "Animated.loop with 1000ms tea ceremony paced timing";
      performance: "useNativeDriver: true for transform animations";
      states: "active brewing, completion celebration, attention alerts";
    };
    
    progressAnimations: {
      purpose: "Smooth circular progress with color transitions based on brewing phase";
      implementation: "SVG Circle with strokeDashoffset animation";
      performance: "Hardware-accelerated rendering, 60fps target";
      states: "normal (tea green), attention (amber), urgent (red)";
    };
    
    gestureAnimations: {
      purpose: "Visual feedback for temperature/volume/timer adjustments";
      implementation: "Scale and opacity changes with haptic synchronization";
      performance: "Native driver transforms, cleanup on gesture end";
      feedback: "Immediate visual confirmation, parameter value display";
    };
    
    stateTransitions: {
      purpose: "Smooth transitions between brewing phases";
      phases: "preparation → active brewing → completion → between steeps";
      implementation: "Coordinated animation sequences with proper cleanup";
      performance: "Staggered animations to avoid frame drops";
    };
  };
  
  // Performance optimization strategies
  performanceOptimization: {
    nativeDriver: {
      usage: "All transform and opacity animations use native driver";
      benefit: "60fps performance even during JavaScript thread blocking";
      implementation: "useNativeDriver: true for all supported animation types";
    };
    
    animationCaching: {
      usage: "Reuse Animated.Value instances across component lifecycle";
      benefit: "Reduced memory allocation and garbage collection";
      implementation: "useRef for persistent animation values";
    };
    
    memoryManagement: {
      usage: "Cleanup animations on component unmount and navigation";
      benefit: "Prevent memory leaks and background animation processing";
      implementation: "Animation.stop() in cleanup effects";
    };
    
    adaptiveComplexity: {
      usage: "Reduce animation complexity on lower-tier devices";
      benefit: "Maintain zen experience across device spectrum";
      implementation: "Device performance detection with graceful degradation";
    };
  };
}
```

## Complete Video-Based Interface System (MISSING FROM VISUAL MOCKUPS!)

**Responsibility:** Full video-based interface system replacing traditional 3D graphics with zen tea brewing videos and seamless UI overlays

**Video System Architecture:**
```typescript
interface VideoBasedInterfaceSystem {
  // Timer screen video background system
  timerScreenVideo: {
    backgroundVideo: {
      content: "Full-screen tea brewing video with gentle steam animation";
      videoSpecs: "MP4 H.264, 1080x1920 vertical mobile, 10-15 second seamless loops";
      categories: {
        greenTea: "Light amber liquid, gentle movement, delicate steam";
        blackTea: "Dark amber liquid, robust steeping, dense steam"; 
        oolong: "Medium amber, swirling patterns, moderate steam";
        puerh: "Deep reddish brewing, rich steeping, heavy steam";
        whiteTea: "Very light liquid, delicate steeping, minimal steam";
        herbal: "Various colors, floral movements, aromatic steam";
      };
    };
    
    overlaySystem: {
      semiTransparentUI: "Semi-transparent overlays over video for text readability";
      floatingTeaCard: "Tea name + temperature/volume info at top";
      circularTimer: "MM:SS format with progress ring in center";
      actionButtons: "Play/Pause + Next Steep floating at bottom";
      gestureHints: "Minimal text at very bottom for user guidance";
    };
    
    gestureVideoIntegration: {
      verticalSwipe: "Temperature control ±5°C with overlay thermometer + steam intensity change";
      horizontalSwipe: "Volume control ±10ml with overlay vessel size + visual scaling";
      longPress: "Tea information overlay appears over dimmed video";
      doubleTap: "Restart current steep with video flash effect";
    };
  };
  
  // Tea library video thumbnail system
  teaLibraryVideoSystem: {
    videoThumbnails: {
      staticPreview: "Shows tea color at peak steeping as thumbnail";
      hoverMicroAnimation: "Tap triggers 2-second mini preview loop";
      teaTypeVisualCoding: "Different video styles per tea category for instant recognition";
    };
    
    ocrVideoIntegration: {
      captureToVideo: "OCR package capture → Generate custom video thumbnail preview";
      previewGeneration: "Show what video will look like before creating tea profile";
      customVideoCreation: "Generate personalized brewing video based on tea parameters";
    };
    
    libraryInterface: {
      searchOverVideo: "Search functionality with video thumbnails in grid";
      filterTabs: "All, Green, Black, Oolong filter tabs with video previews";
      addTeaButton: "Floating action button over video grid background";
    };
  };
  
  // Video performance optimization
  videoPerformanceSystem: {
    hardwareAcceleration: "Enabled for smooth 30fps playback on mid-range devices";
    adaptiveQuality: "Multiple quality levels based on device capabilities";
    preloadingStrategy: "Next video in sequence preloaded for seamless transitions";
    cacheManagement: "Smart caching of favorite tea videos with memory limits";
    batteryOptimization: "Reduce video quality in power save mode, pause when backgrounded";
  };
  
  // Video state synchronization
  videoStateSynchronization: {
    preparation: "Empty vessel, tea leaves ready - gentle ambient movement";
    activeBrewing: "Tea steeping, color developing - video progress matches timer progress";
    complete: "Perfect tea color achieved - 3-5 second glow/celebration animation";
    betweenSteeps: "Gentle steam, peaceful waiting state until next steep starts";
  };
}
```

## Living Tea Metaphor Animation System (MISSING FROM ANIMATION CONCEPT!)

**Responsibility:** Organic tea brewing animation system inspired by natural phenomena to create meditative focal point

**Analogical Inspiration Integration:**
```typescript
interface LivingTeaMetaphorSystem {
  // Inspiration from multiple natural systems
  analogicalFoundation: {
    meditationApps: {
      pattern: "Rhythmic visuals that adjust speed to match breathing/pace";
      teaflowApplication: "Hourglass sand flow speeds up as brewing intensifies, slows near completion";
      implementation: "Sand color/density shifts to show brewing strength progression";
    };
    
    weatherApps: {
      pattern: "Natural loops (clouds drift, rain falls) with dynamic intensity";
      teaflowApplication: "Brewing animation 'storms' more vigorously as steep time nears completion";
      implementation: "Sand/steam/tea color grows more active, then calms when finished";
    };
    
    musicVisualizers: {
      pattern: "Endless audio-reactive visuals that pulse in sync";
      teaflowApplication: "Hourglass sand grains pulse gently with timer ticks";
      implementation: "Tea background ripples like sound waves as brewing progresses";
    };
    
    lavaLampScreensavers: {
      pattern: "Hypnotic, endless motion with natural speed variations";
      teaflowApplication: "Tea leaves float and swirl naturally with organic unpredictability";
      implementation: "Occasional bubbles or steam wisps add natural variability";
    };
  };
  
  // Core visual metaphor elements
  coreVisualElements: {
    floatingHourglass: {
      design: "Feels alive, not rigidly mechanical";
      movement: "Gentle sway and breathing motion even when paused";
      materials: "Glass-like transparency with tea-colored contents";
    };
    
    teaLeavesAndSteam: {
      sandReplacement: "Sand replaced by tea leaves and steam drifting downward";
      leafPhysics: "Natural drift patterns with lava lamp-like swirling";
      steamBehavior: "Rising wisps that grow and fade with brewing intensity";
    };
    
    cleanBackground: {
      canvas: "Subtle gradients or tea textures, no UI clutter";
      colorProgression: "Background shifts from pale to rich tea color over time";
      ambientElements: "Occasional light effects or particle drifts";
    };
  };
  
  // Dynamic intensity phases mapped to brewing
  dynamicIntensityPhases: {
    phase1Start: {
      timeRange: "0% → 20% of brewing time";
      visualState: {
        color: "Pale tea (light jade for green, light amber for black)";
        leaves: "2-3 faint leaves slowly drifting downward";
        steam: "Very subtle wisps, occasional gentle pulses";
        mood: "Calm, almost still → signals brew has just begun";
      };
    };
    
    phase2MidBrew: {
      timeRange: "20% → 80% of brewing time";
      visualState: {
        color: "Gradually intensifying — water turns richer, fuller";
        leaves: "Many more leaves, drifting faster, lava lamp swirls";
        steam: "More visible, rising in soft curls and spirals";
        mood: "Dynamic but meditative → signals brewing is active";
      };
    };
    
    phase3Finish: {
      timeRange: "80% → 100% of brewing time";
      visualState: {
        color: "Fully saturated brew color, stable and rich";
        leaves: "Motion slows, leaves settle near bottom";
        steam: "Fades gradually, leaving only faint traces";
        mood: "Peaceful closure → signals time to pour tea";
        completion: "Soft glow + gentle gong sound at T-0";
      };
    };
  };
  
  // Animation parameter control system
  animationParameterSystem: {
    gestureControllableParameters: {
      leafSpeed: "0.3 → 0.7 → 0.2 - Drift velocity through brewing phases";
      steamIntensity: "0.1 → 0.6 → 0.3 - Density and rise speed";
      sandFlowRate: "0.5 → 1.0 → 0.3 - Hourglass particle speed"; 
      colorSaturation: "0.2 → 0.7 → 0.9 - Tea infusion intensity";
    };
    
    naturalVariability: {
      leafDriftRandomization: "Slightly randomize patterns so no two brews look identical";
      steamPulseVariation: "Organic steam pulse timing with natural irregularity";
      colorFluctuations: "Subtle color intensity variations during brewing";
    };
  };
}
```

## Complete Design Token Implementation System (MISSING FROM VISUAL DESIGN!)

**Responsibility:** Complete design token system with tea-inspired palette, typography, spacing, and animation specifications

**CSS Custom Properties Integration:**
```typescript
interface CompleteDesignTokenSystem {
  // Complete tea-inspired color system
  teaColorPalette: {
    primaryColors: {
      teaGreen: "#4A6741",        // Primary actions, active states
      goldenOolong: "#B8860B",    // Secondary actions, highlights  
      steepingAmber: "#D2691E",   // Active brewing, warm feedback
    };
    
    neutralPalette: {
      softBlack: "#2D2D2D",       // Primary text
      clayGray: "#6B6B6B",        // Secondary text
      mistGray: "#A8A8A8",        // Tertiary text, disabled
      steamWhite: "#FAFAFA",      // Backgrounds
      porcelain: "#F5F5F0",       // Card backgrounds
    };
    
    functionalColors: {
      successTea: "#22C55E",      // Confirmations, completed sessions
      warningAmber: "#F59E0B",    // Cautions, timer alerts
      errorRed: "#EF4444",        // Errors, destructive actions
    };
    
    brewingStateColors: {
      preparation: "#E5E7EB",     // Inactive/preparing state
      activeBrew: "#FCD34D",      // Timer running, gentle pulsing
      complete: "#10B981",        // Session finished successfully
    };
  };
  
  // Typography system with tea ceremony inspiration
  typographySystem: {
    fontFamilies: {
      primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      accent: "'Georgia', 'Times New Roman', serif",  // For tea names, ceremony text
      mono: "'SF Mono', Consolas, monospace",         // For timer display
    };
    
    typeScale: {
      display: { fontSize: 32, fontWeight: "700", lineHeight: 38 },  // Hero text
      timer: { fontSize: 48, fontWeight: "300", lineHeight: 52 },    // Timer display
      h1: { fontSize: 24, fontWeight: "600", lineHeight: 30 },       // Screen titles
      h2: { fontSize: 20, fontWeight: "600", lineHeight: 26 },       // Section headers
      h3: { fontSize: 18, fontWeight: "500", lineHeight: 24 },       // Sub-headers
      bodyLarge: { fontSize: 16, fontWeight: "400", lineHeight: 24 }, // Important body
      body: { fontSize: 14, fontWeight: "400", lineHeight: 20 },      // Standard body
      caption: { fontSize: 12, fontWeight: "400", lineHeight: 16 },   // Small text
    };
  };
  
  // Spacing system with 8px grid
  spacingSystem: {
    baseUnit: 4,  // 4px base for micro-adjustments
    scale: {
      xs: 4,      // Micro spacing
      sm: 8,      // Small spacing
      md: 16,     // Standard spacing
      lg: 24,     // Large spacing
      xl: 32,     // Extra large spacing
      xxl: 48,    // Section spacing
      xxxl: 64,   // Screen spacing
    };
  };
  
  // Animation system with tea ceremony timing
  animationSystem: {
    timingValues: {
      fast: 150,      // Micro-interactions, button press feedback
      standard: 300,  // State changes, transitions
      slow: 500,      // Screen transitions, major state changes
      brewing: 1000,  // Tea ceremony pace, celebration animations
      liquidDrain: 1500, // Zen confirmation animation duration
    };
    
    easingCurves: {
      teaFlow: "cubic-bezier(0.165, 0.84, 0.44, 1)",      // Zen-like, organic feel
      standard: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",   // Natural movement
      accelerate: "cubic-bezier(0.55, 0, 1, 0.45)",       // Exit animations
      decelerate: "cubic-bezier(0, 0.55, 0.45, 1)",       // Enter animations
    };
  };
  
  // Component implementation specifications
  componentImplementations: {
    primaryButton: {
      backgroundColor: "var(--tea-green)",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };
    
    teaCard: {
      backgroundColor: "var(--porcelain)",
      borderRadius: 8,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      teaTypeColorCoding: "Dynamic based on tea.type",
    };
    
    timerDisplay: {
      circularProgress: "SVG Circle with strokeDashoffset animation",
      timeDisplay: "48px SF Mono font, soft black color",
      progressColor: "Dynamic based on time remaining (green → amber → red)",
    };
    
    gestureImplementation: {
      verticalGestures: "Temperature control with thermometer overlay",
      horizontalGestures: "Volume control with vessel size indicator", 
      conflictResolution: "Math.abs(dy) > Math.abs(dx) determines priority",
      hapticFeedback: "Light, Medium, Strong based on gesture type",
    };
  };
}
```

## Critical Performance & Business Metrics Architecture (MISSING FROM PRD!)

**Responsibility:** Systematic tracking and validation of critical performance targets and business success metrics

**Performance Metrics Architecture:**
```typescript
interface CriticalPerformanceTargetsSystem {
  // Core functionality performance requirements
  technicalPerformance: {
    timerAccuracy: {
      target: "≤0.2s per minute drift cross-platform";
      measurement: "Measured across 10+ device types";
      criticality: "CRITICAL - affects user trust in core functionality";
      implementation: "High-precision intervals with drift compensation, system time cross-reference";
    };
    
    animationPerformance: {
      target: "30fps sustained during 3-minute brewing sessions";
      measurement: "Frame rate monitoring during active timer";
      criticality: "HIGH - maintains zen experience quality";
      implementation: "Hardware acceleration, adaptive quality, native driver animations";
    };
    
    gestureAccuracy: {
      target: ">95% recognition rate";
      measurement: "<2% false positives in user testing";
      criticality: "CRITICAL - core interaction paradigm depends on this";
      implementation: "Sophisticated gesture conflict resolution, zone-based detection";
    };
    
    batteryOptimization: {
      target: "<2% battery drain per brewing session";
      measurement: "Battery usage during 3-minute timer sessions";
      criticality: "HIGH - affects user retention and satisfaction";
      implementation: "Pause animations when backgrounded, efficient video rendering";
    };
    
    memoryManagement: {
      target: "<100MB active memory, no accumulation";
      measurement: "Memory profiling during extended usage";
      criticality: "MEDIUM - prevents app crashes and slowdowns";
      implementation: "Video unloading, animation cleanup, proper disposal";
    };
  };
  
  // Business success metrics tracking
  businessMetrics: {
    userAcquisition: {
      downloads: "50K users in Year 1";
      conversionRate: "20% to premium ($9.99 purchase)";
      retention: "60% at Day 30";
      revenueTarget: "$500K ARR";
    };
    
    engagementMetrics: {
      dauMau: ">0.25 (indicating strong habit formation)";
      sessionsPerDay: ">2 (multiple tea brewing sessions)";
      sessionLength: ">3 minutes (complete brewing cycles)";
      gestureAdoption: ">70% (users successfully using gesture controls)";
    };
    
    qualityMetrics: {
      crashFreeRate: ">99.8% (brewing cannot be interrupted)";
      appStoreRating: ">4.5 stars (premium positioning)";
      ocrAccuracy: ">85% (on clear tea packages)";
      supportTickets: "<5% (intuitive experience)";
    };
  };
  
  // Critical implementation research questions
  criticalResearchQuestions: {
    mustAnswerBeforeCoding: {
      timerAccuracyArchitecture: {
        question: "How to guarantee ≤0.2s/min drift across platforms?";
        researchMethod: "Test React Native background timers on 10+ devices";
        successCriteria: "<0.2s/min measured consistently";
        blockingRisk: "HIGH - affects core functionality trust";
      };
      
      gestureConflictResolution: {
        question: "How to prevent swipe vs tap overlap conflicts?";
        researchMethod: "Prototype with react-native-gesture-handler";
        successCriteria: "<2% false positives in user testing";
        blockingRisk: "HIGH - core interaction paradigm";
      };
      
      privacyStorageDecision: {
        question: "Local-only vs cloud sync user preference?";
        researchMethod: "User research on privacy vs convenience tradeoffs";
        successCriteria: "Clear user acceptance of chosen approach";
        blockingRisk: "HIGH - affects entire data architecture";
      };
      
      ocrQualityThreshold: {
        question: "What accuracy level makes users trust OCR?";
        researchMethod: "Test with real tea packages, measure user acceptance";
        successCriteria: ">80% extraction rate on clear packages";
        blockingRisk: "MEDIUM - fallback to manual entry available";
      };
    };
  };
}
```

## Learning Engine

**Responsibility:** Analyzes brewing sessions to provide personalized recommendations and parameter adjustments

**Key Interfaces:**
- recordBrewFeedback(session: BrewSession, feedback: BrewFeedback): void
- getRecommendedTime(teaId: string, steepIndex: number): number
- getRecommendedTemp(teaId: string): number

**Dependencies:** Session data, user feedback, statistical analysis utilities

**Technology Stack:** JavaScript-based ML algorithms optimized for mobile, local data processing only
