# Video Tea Background System

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
