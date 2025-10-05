# Unified Project Structure

```plaintext
teaflow/
├── .github/                              # CI/CD workflows and automation
│   ├── workflows/
│   │   ├── ci.yml                        # Main CI pipeline (test, lint, build)
│   │   ├── deploy-staging.yml            # Staging deployment automation
│   │   ├── deploy-production.yml         # Production release pipeline
│   │   ├── ota-update.yml                # Over-the-air update workflow
│   │   └── rollback.yml                  # Emergency rollback automation
│   ├── ISSUE_TEMPLATE/                   # GitHub issue templates
│   └── PULL_REQUEST_TEMPLATE.md          # PR template with CI checklist
├── .expo/                                # Expo development configuration
│   ├── settings.json                     # Local Expo settings
│   └── packager-info.json               # Metro bundler cache info
├── assets/                               # Static application assets
│   ├── images/                           # App icons, splash screens
│   │   ├── icon.png                      # App icon (1024x1024)
│   │   ├── adaptive-icon.png             # Android adaptive icon
│   │   └── splash.png                    # Splash screen image
│   ├── fonts/                            # Custom typography
│   ├── animations/                       # Lottie/animation files
│   └── sounds/                           # Audio assets for tea timers
├── src/                                  # Application source code
│   ├── components/                       # Reusable UI components
│   │   ├── ui/                           # Base UI components (Button, Input)
│   │   ├── tea/                          # Tea-specific components
│   │   ├── timer/                        # Timer and countdown components
│   │   ├── graphics/                     # Custom graphics components
│   │   └── __tests__/                    # Component unit tests
│   ├── screens/                          # Screen/page components
│   │   ├── HomeScreen/                   # Main tea selection screen
│   │   ├── TimerScreen/                  # Active brewing timer
│   │   ├── LibraryScreen/                # Tea library and favorites
│   │   ├── SettingsScreen/               # App configuration
│   │   └── __tests__/                    # Screen integration tests
│   ├── navigation/                       # React Navigation setup
│   │   ├── AppNavigator.tsx              # Main navigation container
│   │   ├── TabNavigator.tsx              # Bottom tab navigation
│   │   └── types.ts                      # Navigation type definitions
│   ├── services/                         # Business logic and API clients
│   │   ├── tea/                          # Tea data and brewing logic
│   │   ├── timer/                        # Timer management service
│   │   ├── storage/                      # Local storage abstractions
│   │   ├── analytics/                    # Usage tracking service
│   │   └── __tests__/                    # Service unit tests
│   ├── hooks/                            # Custom React hooks
│   │   ├── useTimer.ts                   # Timer state management
│   │   ├── useTeaLibrary.ts              # Tea data management
│   │   ├── useHaptics.ts                 # Device vibration control
│   │   └── __tests__/                    # Hook unit tests
│   ├── store/                            # State management (Redux/Zustand)
│   │   ├── slices/                       # Feature-specific state slices
│   │   ├── middleware/                   # Custom store middleware
│   │   └── types.ts                      # Store type definitions
│   ├── constants/                        # App-wide constants
│   │   ├── Colors.ts                     # Theme and color definitions
│   │   ├── TeaTypes.ts                   # Tea variety constants
│   │   ├── Timings.ts                    # Default brewing times
│   │   └── Config.ts                     # App configuration constants
│   ├── utils/                            # Utility functions
│   │   ├── formatters.ts                 # Data formatting utilities
│   │   ├── validators.ts                 # Input validation helpers
│   │   ├── animations.ts                 # Animation utilities
│   │   └── __tests__/                    # Utility function tests
│   └── types/                            # TypeScript type definitions
│       ├── tea.ts                        # Tea-related types
│       ├── timer.ts                      # Timer-related types
│       ├── navigation.ts                 # Navigation types
│       └── global.d.ts                   # Global type declarations
├── e2e/                                  # End-to-end tests (Detox)
│   ├── tests/                            # E2E test scenarios
│   │   ├── timer-flow.e2e.js             # Timer creation and management
│   │   ├── tea-selection.e2e.js          # Tea library navigation
│   │   └── settings-config.e2e.js        # Settings functionality
│   ├── config/                           # Detox configuration
│   └── fixtures/                         # Test data and mocks
├── scripts/                              # Build and deployment scripts
│   ├── build-preview.sh                  # Preview build automation
│   ├── deploy-ota.sh                     # OTA deployment script
│   ├── generate-assets.sh                # Asset processing script
│   ├── version-bump.sh                   # Automated version management
│   └── setup-env.sh                      # Environment setup automation
├── docs/                                 # Project documentation
│   ├── prd.md                            # Product requirements document
│   ├── architecture/                     # Architecture documentation
│   │   ├── cicd-architecture.md          # This document
│   │   ├── mobile-architecture.md        # Mobile app architecture
│   │   └── data-architecture.md          # Data and storage design
│   ├── deployment/                       # Deployment guides
│   │   ├── release-process.md            # Release workflow documentation
│   │   ├── environment-setup.md          # Environment configuration
│   │   └── troubleshooting.md            # Common deployment issues
│   └── api/                              # API documentation
├── infrastructure/                       # Infrastructure as Code
│   ├── expo/                             # EAS configuration
│   │   ├── eas.json                      # EAS Build and Submit config
│   │   ├── app.config.js                 # Dynamic app configuration
│   │   └── credentials.json              # Credential management
│   ├── monitoring/                       # Monitoring and alerting
│   │   ├── sentry.config.js              # Error tracking setup
│   │   └── analytics.config.js           # Usage analytics configuration
│   └── secrets/                          # Secret management templates
│       ├── .env.example                  # Environment variable template
│       ├── github-secrets.md             # GitHub Secrets documentation
│       └── eas-secrets.md                # EAS Secrets management guide
├── .env.example                          # Environment configuration template
├── .gitignore                            # Git ignore patterns
├── .eslintrc.js                          # ESLint configuration
├── .prettierrc                           # Prettier formatting rules
├── babel.config.js                       # Babel transpilation config
├── metro.config.js                       # Metro bundler configuration
├── jest.config.js                        # Jest testing configuration
├── detox.config.js                       # Detox E2E testing setup
├── tsconfig.json                         # TypeScript configuration
├── app.json                              # Expo app configuration
├── package.json                          # Dependencies and scripts
├── package-lock.json                     # Dependency lock file
└── README.md                             # Project overview and setup
```
