# Deployment Architecture

## Deployment Strategy

**Mobile App Deployment:**
- **Platform:** Expo Application Services (EAS)
- **Build Command:** `eas build --platform all`
- **Distribution:** App Store + Google Play Store via EAS Submit
- **Updates:** Over-the-air updates via Expo Updates

**Cloud API Deployment:**
- **Platform:** AWS Lambda (serverless functions)
- **Build Command:** `npm run build && zip -r function.zip dist/`
- **Deployment Method:** AWS SAM or Serverless Framework

```yaml
# CI/CD Pipeline (.github/workflows/deploy.yml)
name: Deploy TeaFlow
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci  
      - run: eas build --platform all --non-interactive
      
  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: cd cloud-api && npm ci && npm run deploy
```

## Environments

| Environment | Mobile App | Cloud API | Purpose |
|-------------|------------|-----------|---------|
| Development | Expo Dev Client | Local server (localhost:3000) | Local development |
| Staging | Expo Preview Build | AWS Lambda (staging) | Pre-production testing |
| Production | App Store/Play Store | AWS Lambda (prod) | Live environment |
