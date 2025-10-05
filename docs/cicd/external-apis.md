# External APIs

## Apple App Store Connect API

- **Purpose:** Automated iOS app submission, metadata management, and TestFlight distribution
- **Documentation:** https://developer.apple.com/documentation/appstoreconnectapi
- **Base URL(s):** https://api.appstoreconnect.apple.com/v1
- **Authentication:** JWT bearer token with App Store Connect API key
- **Rate Limits:** 1000 requests per hour per team

**Key Endpoints Used:**
- `POST /apps/{id}/builds` - Upload new build for review
- `GET /builds/{id}` - Check build processing status  
- `POST /betaAppReviewSubmissions` - Submit to TestFlight
- `PATCH /appStoreVersions/{id}` - Update app metadata

**Integration Notes:** Requires Apple Developer Program membership and API key generation. JWT tokens must be refreshed every 20 minutes. Build processing can take 10-60 minutes before availability in TestFlight.

## Google Play Console API

- **Purpose:** Automated Android app publishing, release management, and Play Console integration
- **Documentation:** https://developers.google.com/android-publisher
- **Base URL(s):** https://androidpublisher.googleapis.com/androidpublisher/v3
- **Authentication:** OAuth 2.0 service account with Google Play Console permissions
- **Rate Limits:** 200,000 requests per day, burst of 2000 requests per 100 seconds

**Key Endpoints Used:**
- `POST /applications/{packageName}/edits` - Create new edit session
- `POST /applications/{packageName}/edits/{editId}/bundles` - Upload AAB file
- `POST /applications/{packageName}/edits/{editId}/tracks/{track}/releases` - Create release
- `POST /applications/{packageName}/edits/{editId}:commit` - Publish changes

**Integration Notes:** Requires Google Play Developer account and service account setup. Edit sessions must be committed within 24 hours. Production releases require app signing by Google Play.

## Expo Application Services API

- **Purpose:** Native mobile builds, credential management, and over-the-air updates
- **Documentation:** https://docs.expo.dev/eas/
- **Base URL(s):** https://api.expo.dev/v2
- **Authentication:** Bearer token from Expo access token
- **Rate Limits:** Varies by plan (Hobby: 30 builds/month, Production: unlimited)

**Key Endpoints Used:**
- `POST /projects/{id}/builds` - Trigger new iOS/Android build
- `GET /builds/{id}` - Monitor build progress and status
- `POST /projects/{id}/updates` - Publish OTA update to channel
- `GET /projects/{id}/credentials` - Manage signing certificates

**Integration Notes:** Builds typically take 5-20 minutes. OTA updates are distributed via global CDN. Requires eas.json configuration file in project root.

## Slack Webhooks API

- **Purpose:** Real-time notifications for build status, deployment events, and pipeline alerts
- **Documentation:** https://api.slack.com/messaging/webhooks
- **Base URL(s):** Custom webhook URLs per channel
- **Authentication:** Webhook URL contains authentication token
- **Rate Limits:** 1 message per second per webhook

**Key Endpoints Used:**
- `POST {webhook_url}` - Send formatted message to Slack channel

**Integration Notes:** Supports rich message formatting with blocks and attachments. Configure separate webhooks for different environments (dev, staging, prod) to control notification routing.
