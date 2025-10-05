# API Specification

## EAS Build API Integration

**OpenAPI 3.0 Specification for CI/CD Pipeline APIs:**

```yaml
openapi: 3.0.0
info:
  title: TeaFlow CI/CD Pipeline API
  version: 1.0.0
  description: API specification for TeaFlow's CI/CD automation endpoints
servers:
  - url: https://api.expo.dev/v2
    description: EAS Build and Submit API
  - url: https://api.github.com
    description: GitHub Actions API
  - url: https://teaflow-internal-api.vercel.app
    description: Internal pipeline coordination API

paths:
  /projects/{projectId}/builds:
    post:
      summary: Trigger new build
      operationId: createBuild
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BuildRequest'
      responses:
        '201':
          description: Build created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BuildResponse'
        '400':
          description: Invalid build configuration
        '401':
          description: Authentication failed

  /projects/{projectId}/builds/{buildId}:
    get:
      summary: Get build status
      operationId: getBuildStatus
      parameters:
        - name: projectId
          in: path
          required: true
          schema:
            type: string
        - name: buildId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Build status retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BuildStatus'

components:
  schemas:
    BuildRequest:
      type: object
      required:
        - platform
        - buildProfile
        - gitCommitHash
      properties:
        platform:
          type: string
          enum: [ios, android]
        buildProfile:
          type: string
          enum: [development, preview, production]
        gitCommitHash:
          type: string
        message:
          type: string
        metadata:
          type: object
          additionalProperties: true

    BuildResponse:
      type: object
      properties:
        id:
          type: string
        status:
          type: string
          enum: [pending, in-queue, in-progress, finished, errored, canceled]
        platform:
          type: string
        createdAt:
          type: string
          format: date-time
        artifacts:
          type: object
          properties:
            buildUrl:
              type: string
              format: uri

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
    GitHubToken:
      type: http
      scheme: bearer

security:
  - BearerAuth: []
  - GitHubToken: []
```

**Authentication Requirements:**
- **EAS API:** Bearer token from Expo access token
- **GitHub API:** Personal access token with repo and actions permissions
- **App Store Connect:** API key with app management permissions
- **Google Play:** Service account with publishing permissions
