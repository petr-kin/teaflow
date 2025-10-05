# Coding Standards

## Critical CI/CD Rules

- **Environment Configuration:** Always use environment-specific configuration files (eas.json profiles) - never hardcode environment values in source code
- **Secret Management:** Access secrets only through EAS Secrets or GitHub Secrets - never commit API keys or credentials to repository
- **Build Profiles:** Use appropriate EAS build profiles (development, preview, production) - never use development builds for production deployment
- **OTA Updates:** Validate OTA compatibility before publishing - never push breaking native changes via OTA
- **Version Management:** Follow semantic versioning and increment build numbers automatically - never manually edit version numbers in CI
- **Pipeline Dependencies:** Ensure all pipeline jobs have proper dependencies and never skip quality gates for faster deployment
- **Rollback Strategy:** Always maintain rollback capability - never deploy without previous stable reference point
- **Test Requirements:** All production deployments must pass complete test suite - never bypass testing for urgent deployments

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TeaTimerComponent.tsx` |
| Hooks | camelCase with 'use' | - | `useTeaTimer.ts` |
| API Routes | - | kebab-case | `/api/tea-library` |
| Database Tables | - | snake_case | `tea_brewing_sessions` |
| GitHub Actions | kebab-case | kebab-case | `deploy-production.yml` |
| Environment Variables | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `EXPO_PUBLIC_API_URL` |
| EAS Build Profiles | lowercase | lowercase | `production`, `preview` |
| Git Branches | kebab-case | kebab-case | `feature/timer-improvements` |
| Release Tags | semantic version | semantic version | `v1.2.3` |
| Slack Channels | kebab-case | kebab-case | `#teaflow-deployments` |
