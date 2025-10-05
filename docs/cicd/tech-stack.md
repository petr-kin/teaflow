# Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| CI/CD Platform | GitHub Actions | Latest | Workflow orchestration and automation | Native GitHub integration, extensive marketplace, cost-effective |
| Build Platform | EAS Build | Latest | Native iOS/Android compilation | Managed React Native builds, automatic signing, Expo ecosystem |
| Deployment Platform | EAS Submit | Latest | Automated app store submission | Direct integration with App Store Connect and Play Console APIs |
| OTA Updates | Expo Updates | SDK 53+ | Over-the-air app updates | Instant bug fixes without store review, managed by Expo |
| Mobile Testing | Jest + Detox | Jest ^29, Detox ^20 | Unit and E2E testing | React Native standard, reliable gesture testing |
| Code Quality | ESLint + Prettier | ESLint ^8, Prettier ^3 | Linting and formatting | Code consistency, automated formatting |
| Security Scanning | CodeQL | Latest | Static security analysis | GitHub native, comprehensive vulnerability detection |
| Artifact Storage | GitHub Packages | Latest | Build artifact storage | Integrated with Actions, version management |
| Secret Management | GitHub Secrets | Latest | Secure credential storage | Encrypted, role-based access, audit logging |
| Monitoring | Expo Analytics | Latest | Build and deployment monitoring | Native Expo integration, crash reporting |
| Environment Config | Expo Constants | SDK 53+ | Runtime configuration management | Type-safe config, environment-specific values |
| iOS Signing | EAS Credentials | Latest | Automated certificate management | Managed provisioning profiles, automatic renewal |
| Android Signing | EAS Credentials | Latest | Automated keystore management | Secure key storage, consistent signing |
| Notifications | GitHub Notifications | Latest | Build status communication | Slack/email integration, team alerts |
| Caching | GitHub Actions Cache | Latest | Dependency and build caching | Faster builds, reduced network usage |
| Documentation | GitHub Wiki | Latest | Pipeline documentation | Version-controlled, team accessible |
