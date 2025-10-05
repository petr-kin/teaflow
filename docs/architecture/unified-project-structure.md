# Unified Project Structure

```
teaflow/
├── .expo/                      # Expo build artifacts
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── test.yml           # Run tests on PR
│       ├── build.yml          # Build app previews  
│       └── deploy.yml         # Deploy to stores
├── assets/                     # Static assets
│   ├── images/
│   ├── sounds/
│   └── fonts/
├── src/                        # Main application code
│   ├── components/             # React components
│   │   ├── ui/                # Base UI components
│   │   ├── graphics/          # Visual/3D components  
│   │   ├── Advanced3D/        # Complex 3D scenes
│   │   ├── Interactive3D/     # Interactive elements
│   │   └── screens/           # Screen components
│   ├── lib/                   # Core utilities and services
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── store.ts           # Data persistence
│   │   ├── theme.ts           # Theme system
│   │   ├── sounds.ts          # Audio management
│   │   ├── bluetooth.ts       # Bluetooth integration
│   │   ├── learning.ts        # ML algorithms
│   │   ├── responsive.ts      # Device adaptation
│   │   ├── offline.ts         # Offline management
│   │   └── constants.ts       # App constants
│   ├── hooks/                 # Custom React hooks
│   │   ├── useTimer.ts
│   │   ├── useGestures.ts
│   │   ├── useTheme.ts
│   │   └── useResponsive.ts
│   └── utils/                 # Utility functions
├── cloud-api/                 # Optional cloud services
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   └── utils/             # Server utilities
│   ├── tests/                 # Backend tests
│   └── package.json
├── docs/                      # Documentation
│   ├── prd/                   # Product requirements
│   ├── architecture/          # Architecture docs
│   └── api/                   # API documentation
├── __tests__/                 # Test files
│   ├── components/
│   ├── lib/
│   └── e2e/
├── .env.example               # Environment template
├── app.json                   # Expo configuration
├── babel.config.js            # Babel configuration  
├── metro.config.js            # Metro bundler config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md
```
