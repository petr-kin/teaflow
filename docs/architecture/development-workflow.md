# Development Workflow

## Local Development Setup

```bash
# Prerequisites
npm install -g @expo/cli eas-cli
# Ensure Node.js 18+ is installed
# iOS: Xcode and iOS Simulator
# Android: Android Studio and emulator
```

```bash
# Initial setup
git clone <repository>
cd teaflow
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start development
expo start

# Platform-specific development
expo run:ios      # Run on iOS simulator
expo run:android  # Run on Android emulator
```

```bash
# Development commands
# Start metro bundler
npm start

# Run on specific platform  
npm run ios
npm run android  
npm run web

# Run tests
npm test                    # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report

# Code quality
npm run lint               # ESLint
npm run type-check         # TypeScript checking
npm run format             # Prettier formatting
```

## Environment Configuration

```bash
# App environment (.env)
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENABLE_CLOUD_SYNC=false

# Cloud API environment (.env in cloud-api/)
NODE_ENV=development
PORT=3000
AWS_REGION=us-east-1
AWS_S3_BUCKET=teaflow-dev-storage
FIREBASE_PROJECT_ID=teaflow-dev

# Shared secrets (stored in Expo secrets)
FIREBASE_PRIVATE_KEY=<encrypted>
AWS_ACCESS_KEY_ID=<encrypted>
AWS_SECRET_ACCESS_KEY=<encrypted>
```
