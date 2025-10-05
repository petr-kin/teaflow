# AI UI Generation Component Specifications (MISSING CRITICAL SYSTEM!)

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
