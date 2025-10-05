# TeaFlow Video-Based Visual Mockups

*Following BMAD UX Expert specifications - Sally 🎨*

## Core Visual Approach: Video Loops as Primary Graphics

Your TeaFlow app uses **looping videos** instead of complex 3D graphics, creating a zen, meditative experience while being performance-efficient. Here are the video-based visual mockups:

## 1. Timer Screen - Video Background with Minimal UI Overlay

```
┌─────────────────────────────────────┐
│  [Video Loop: Gentle tea steaming]  │
│                                     │
│  🌊🫖 Continuous tea brewing video   │ ← Full-screen background
│     with subtle steam animation     │   (looping seamlessly)
│                                     │
│     ╔═══════════════════╗           │
│     ║    Dragon Well    ║           │ ← Floating tea name
│     ║     85°C • 110ml  ║           │   (semi-transparent)
│     ╚═══════════════════╝           │
│                                     │
│          ⏱ 02:30                   │ ← Large timer overlay
│        Steep 2 of 4                │   (readable over video)
│                                     │
│     [ ⏸ Pause ]  [ Next ⏭ ]       │ ← Floating action buttons
│                                     │
│  Swipe ← → for navigation          │ ← Gesture hint
│  Swipe ↕ for adjustments           │   (subtle, bottom)
└─────────────────────────────────────┘
```

### Video Background Details:
- **Tea brewing video**: Close-up of tea leaves steeping in clear glass
- **Steam animation**: Gentle steam rising from cup/pot
- **Water color changes**: Gradual color deepening as tea steeps
- **Seamless loop**: 10-15 second loop, perfectly seamless
- **Different videos per tea type**: Green tea = light, Black tea = dark

## 2. Tea Library Screen - Video Thumbnails

```
┌─────────────────────────────────────┐
│ 🍃 Tea Library              [ × ]   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Search teas...               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [All] [Green] [Black] [Oolong]...   │ ← Filter tabs
│                                     │
│ ┌──────────┐ ┌──────────┐          │
│ │[Video👁️] │ │[Video👁️] │          │ ← Video thumbnails
│ │Green Tea │ │Black Tea │          │   (static frame or
│ │85°C•4s   │ │95°C•3s   │          │    mini-loop)
│ └──────────┘ └──────────┘          │
│                                     │
│ ┌──────────┐ ┌──────────┐          │
│ │[Video👁️] │ │[Video👁️] │          │
│ │Dragon    │ │Earl Grey │          │
│ │Well      │ │95°C•2s   │          │
│ │85°C•4s   │ │          │          │
│ └──────────┘ └──────────┘          │
│                                     │
│        [ + Add New Tea ]            │
└─────────────────────────────────────┘
```

### Video Thumbnail System:
- **Static preview frame**: Shows tea color at peak steeping
- **Hover/tap micro-animation**: 2-second mini preview loop
- **Tea type visual coding**: Different video styles per tea category
- **OCR Integration**: Capture package → Generate custom video thumbnail

## 3. Session History - Video Timeline

```
┌─────────────────────────────────────┐
│ 📊 Brewing History          [ × ]   │
│                                     │
│ This Week: 12 sessions • 45 min     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Today • 2:30 PM                 │ │
│ │ ┌─────┐ Dragon Well             │ │ ← Micro video
│ │ │[👁️] │ 3 steeps • 8 min        │ │   thumbnail
│ │ └─────┘ Perfect timing ⭐       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Yesterday • 9:15 AM             │ │
│ │ ┌─────┐ Earl Grey               │ │
│ │ │[👁️] │ 2 steeps • 4 min        │ │
│ │ └─────┘ Bit strong 😐          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Weekly Pattern               │ │ ← Simple charts
│ │ Morning: ████████ 8 sessions    │ │   (no video here)
│ │ Evening: ████ 4 sessions        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 4. OCR Scanning Interface - Video Preview

```
┌─────────────────────────────────────┐
│ 📷 Scan Tea Package         [ × ]   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ ← Live camera feed
│ │    📦 Position package text     │ │   (video stream)
│ │        in this frame            │ │
│ │                                 │ │
│ │    ┌─────────────────────┐      │ │ ← Scan overlay
│ │    │ "Dragon Well Tea"   │      │ │   guide rectangle
│ │    │ "85°C • 2 min"      │      │ │
│ │    └─────────────────────┘      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Detected Text:               │ │ ← Results overlay
│ │ "Jasmine Green Tea"             │ │   appears when
│ │ "85°C • 4 steeps • 60s each"    │ │   text recognized
│ │                                 │ │
│ │ ┌──────────┐                    │ │
│ │ │[Video👁️] │ ← Preview generated │ │ ← Shows what video
│ │ │Green Tea │   video thumbnail  │ │   will look like
│ │ └──────────┘                    │ │
│ │                                 │ │
│ │  [ ✓ Create Tea Profile ]       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 5. Video Performance & Technical Specs

### Video Requirements:
```yaml
Video Specifications:
  Format: MP4 (H.264)
  Resolution: 1080x1920 (vertical mobile)
  Duration: 10-15 seconds
  Loop: Seamless
  Audio: None (silent)
  Compression: High (small file size)
  
Tea Video Categories:
  Green Tea: Light amber, gentle movement
  Black Tea: Dark amber, robust steeping
  Oolong: Medium amber, swirling patterns
  Pu-erh: Deep reddish, rich brewing
  White Tea: Very light, delicate steeping
  Herbal: Various colors, floral movements

Performance Optimization:
  - Hardware acceleration enabled
  - Adaptive quality based on device
  - Preload next video in sequence
  - Background loading for library
  - Cache management for favorites
```

## 6. Gesture Interactions with Video

### Timer Screen Gestures:
```
Video Background Interactions:
┌─────────────────────────────────────┐
│  [Continuous tea brewing video]     │
│                                     │
│  ↕️ Vertical swipe over video:      │ ← Temperature control
│     Adjust temperature ±5°C         │   Visual feedback:
│     Visual: Overlay thermometer     │   Steam intensity
│                                     │
│  ↔️ Horizontal swipe over video:    │ ← Volume control  
│     Adjust vessel size ±10ml        │   Visual feedback:
│     Visual: Overlay vessel size     │   Cup size indicator
│                                     │
│  Long press on video:               │ ← Tea details
│     Show tea information overlay    │   Overlay appears
│     (origin, notes, etc.)           │   over video
│                                     │
│  Double tap on video:               │ ← Quick restart
│     Restart current steep           │   Video restarts
│     With confirmation animation     │   with flash effect
└─────────────────────────────────────┘
```

## 7. Video States & Animations

### Brewing Phase Videos:
```
Phase 1: Preparation
- Video: Empty vessel, tea leaves ready
- Duration: While user sets parameters
- Loop: Gentle ambient movement

Phase 2: Active Brewing  
- Video: Tea steeping, color developing
- Duration: Matches actual timer
- Loop: Continuous steeping motion
- Sync: Video progress = timer progress

Phase 3: Complete
- Video: Perfect tea color achieved
- Duration: 3-5 seconds
- Animation: Gentle glow/celebration
- Transition: Fade to next steep or done

Phase 4: Between Steeps
- Video: Gentle steam, ready for next
- Duration: Until user starts next steep
- Loop: Peaceful waiting state
```

## 8. Video-Based Onboarding

```
┌─────────────────────────────────────┐
│  Welcome to TeaFlow                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Welcome video: Tea ceremony]   │ │ ← Hero video
│ │ Peaceful tea preparation ritual │ │   Introduction
│ │ showcasing the zen experience   │ │   (15-20 seconds)
│ └─────────────────────────────────┘ │
│                                     │
│  "Experience mindful tea brewing    │
│   with video-guided timers"        │
│                                     │
│ [ 🎬 See it in action ] [ Skip ]   │ ← Demo video option
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Demo video: Quick brew flow]   │ │ ← Show actual
│ │ Shows: Select tea → Start timer │ │   interface in use
│ │ → Video background → Complete   │ │   (30 seconds)
│ └─────────────────────────────────┘ │
│                                     │
│        [ Get Started ]              │
└─────────────────────────────────────┘
```

## Implementation Notes

### Video Asset Management:
- **Local storage**: Keep core tea videos in app bundle
- **Cloud delivery**: Additional tea videos via CDN
- **Compression**: Multiple quality levels for different devices
- **Caching**: Smart caching of user's favorite tea videos

### Performance Considerations:
- **Memory usage**: Unload off-screen videos
- **Battery optimization**: Reduce video quality in power save mode
- **Network awareness**: Download hi-res videos on WiFi only
- **Frame rate**: Maintain 30fps minimum for smooth experience

### Accessibility:
- **Alternative descriptions**: Audio descriptions of video content for screen readers
- **Reduced motion**: Static images for users who prefer reduced motion
- **High contrast**: Enhanced UI overlays for better visibility over video

This video-based approach creates TeaFlow's unique zen aesthetic while being practical for mobile performance and user engagement. The videos become the core visual language of the app, making each tea brewing session feel special and meditative.