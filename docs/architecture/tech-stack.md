# Tech Stack

Based on proven reliable animation architecture analysis and performance requirements for zen tea brewing experience.

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.0+ | Type safety and development experience | Prevents runtime errors and improves maintainability in complex state management |
| Frontend Framework | React Native + Expo | RN 0.79.5, Expo SDK 53 | Cross-platform mobile development | Proven for complex mobile apps with native performance needs |
| Graphics Engine | React Native Skia + SVG | 2.2.6+ | Living tea metaphor animations | Vector-based = smooth, lightweight, scalable. Proven reliable for 30fps zen experience |
| Video System | Expo AV | Latest | Full-screen tea brewing video backgrounds | Primary graphics approach - video loops as core visual language. MP4 H.264, 1080x1920, 10-15s seamless loops, hardware acceleration |
| Gesture System | React Native Reanimated | 3.x | Smooth gesture interactions | Provides 120hz gesture recognition essential for brewing controls |
| Camera/ML | Vision Camera + ML Kit | 3.0+ | OCR tea package scanning | Best-in-class mobile OCR for tea package text recognition |
| Audio System | Expo AV | Latest | Ambient sounds and chimes | Built-in Expo integration for meditation soundscapes |
| Local Storage | AsyncStorage + SQLite | Latest | Offline-first data persistence | Combination provides both simple and complex data storage needs |
| State Management | React Context + Zustand | Latest | Predictable state updates | Lightweight solution suitable for offline-first architecture |
| Navigation | React Navigation | 6.x | Screen routing and modals | Industry standard for React Native navigation |
| Backend Language | Node.js + TypeScript | 18+ LTS | Cloud sync services | Shared language with frontend for type consistency |
| Backend Framework | Express.js | 4.x | RESTful API services | Minimal framework for simple cloud backup endpoints |
| Cloud Storage | AWS S3 | Latest | User data backup | Reliable, cost-effective storage for user tea profiles |
| Authentication | Firebase Auth | Latest | Optional user accounts | Handles auth complexity for cloud features |
| Testing Framework | Jest + React Native Testing Library | Latest | Unit and integration testing | Standard React Native testing tools |
| E2E Testing | Detox | Latest | End-to-end mobile testing | Mobile-specific E2E testing for gesture interactions |
| Build System | Expo Build Service | Latest | Native app compilation | Managed build process for app store deployment |
| CI/CD | GitHub Actions | Latest | Automated testing and deployment | Integrates with Expo build service |
