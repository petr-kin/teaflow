# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** EAS Build + App Store Distribution
- **Build Command:** `eas build --platform all --profile production`
- **Output Directory:** Cloud-hosted artifacts via EAS
- **CDN/Edge:** Expo Updates global CDN with edge caching

**Backend Deployment:**
- **Platform:** Serverless functions (if needed) via Vercel/Netlify
- **Build Command:** `npm run build:api`
- **Deployment Method:** Automated via GitHub Actions integration

**Mobile App Distribution:**
- **iOS:** App Store Connect with TestFlight beta distribution
- **Android:** Google Play Console with internal testing tracks
- **OTA Updates:** Expo Updates for JavaScript bundle updates

## CI/CD Pipeline Configuration

```yaml
name: TeaFlow CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  EAS_PROJECT_ID: ${{ secrets.EAS_PROJECT_ID }}
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  test:
    name: Run Tests and Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build-production:
    name: Build Production Release
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build production apps
        run: eas build --platform all --profile production --non-interactive
      
      - name: Submit to app stores
        run: |
          eas submit --platform ios --profile production --non-interactive
          eas submit --platform android --profile production --non-interactive
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-ota:
    name: Deploy OTA Update
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && !startsWith(github.ref, 'refs/tags/')
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish to staging
        run: eas update --channel staging --message "Staging deployment from ${{ github.sha }}"
      
      - name: Run E2E tests against staging
        run: npm run test:e2e:staging
      
      - name: Promote to production
        if: success()
        run: eas update --channel production --message "Production deployment from ${{ github.sha }}"
```

## Environment Configuration

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | expo://localhost:8081 | http://localhost:3000 | Local development |
| Staging | staging.teaflow.app | api-staging.teaflow.app | Pre-production testing |
| Production | teaflow.app | api.teaflow.app | Live environment |
