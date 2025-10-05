# Development Workflow

## Local Development Setup

### Prerequisites

```bash
# Node.js and package management
node --version  # Requires Node.js 18.x or higher
npm --version   # npm 9.x or higher

# Mobile development tools
npx expo install --check  # Verify Expo CLI compatibility

# iOS development (macOS only)
xcode-select --version     # Xcode Command Line Tools
xcrun simctl list         # iOS Simulator availability

# Android development
echo $ANDROID_HOME        # Android SDK path
adb --version            # Android Debug Bridge

# Version control and CI tools
git --version            # Git 2.x or higher
gh --version             # GitHub CLI (optional but recommended)
```

### Initial Setup

```bash
# Clone repository and install dependencies
git clone https://github.com/teaflow/mobile-app.git
cd teaflow
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your development API keys

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Verify setup with health check
npm run health-check

# Initialize EAS development build
npx eas build:configure
npx eas secret:create --scope project --name API_KEY --value "your-dev-api-key"
```

### Development Commands

```bash
# Start all services (Metro bundler + simulators)
npm run dev

# Start frontend only (Metro bundler)
npm run start

# Platform-specific development
npm run ios        # Start iOS simulator
npm run android    # Start Android emulator
npm run web        # Start web development server

# Run tests
npm test           # Jest unit tests with watch mode
npm run test:e2e   # Detox end-to-end tests
npm run test:coverage  # Generate test coverage report
npm run lint       # ESLint code quality checks
npm run type-check # TypeScript compilation check

# Build commands
npm run build:preview     # EAS preview build for testing
npm run build:production  # EAS production build
npm run ota:staging      # Deploy OTA update to staging
npm run ota:production   # Deploy OTA update to production
```

## Environment Configuration

### Required Environment Variables

```bash
# Frontend (.env.local)
EXPO_PUBLIC_API_BASE_URL=https://api-dev.teaflow.app
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_OTA_CHANNEL=development

# Backend/Services (.env)
EAS_PROJECT_ID=your-eas-project-id
APPLE_TEAM_ID=your-apple-developer-team-id
GOOGLE_SERVICES_KEY_PATH=./google-services.json
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# Shared CI/CD Variables
GITHUB_TOKEN=ghp_your-github-personal-access-token
EAS_ACCESS_TOKEN=your-expo-access-token
APP_STORE_CONNECT_API_KEY=your-app-store-api-key
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY=your-google-play-key
```
