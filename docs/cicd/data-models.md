# Data Models

## Build Artifact Model

**Purpose:** Represents the structure of compiled mobile application builds, their metadata, and deployment status throughout the CI/CD pipeline.

**Key Attributes:**
- `buildId`: string - Unique EAS build identifier
- `version`: string - Semantic version (e.g., "1.2.3")
- `buildNumber`: number - Incremental build number for app stores
- `platform`: "ios" | "android" - Target platform
- `channel`: string - Expo Updates channel (development, staging, production)
- `commitHash`: string - Git commit that triggered the build
- `status`: BuildStatus - Current build state
- `artifacts`: ArtifactUrls - Download URLs for build outputs
- `createdAt`: Date - Build initiation timestamp
- `completedAt`: Date | null - Build completion timestamp

### TypeScript Interface

```typescript
interface BuildArtifact {
  buildId: string;
  version: string;
  buildNumber: number;
  platform: "ios" | "android";
  channel: string;
  commitHash: string;
  status: BuildStatus;
  artifacts: ArtifactUrls;
  metadata: BuildMetadata;
  createdAt: Date;
  completedAt: Date | null;
}

type BuildStatus = 
  | "pending" 
  | "building" 
  | "completed" 
  | "failed" 
  | "cancelled";

interface ArtifactUrls {
  binary?: string; // .ipa or .aab file
  sourceMap?: string;
  buildLogs: string;
}
```

### Relationships
- **Belongs to** Deployment Pipeline
- **Contains** Test Results
- **Links to** Git Commit

## Deployment Configuration Model

**Purpose:** Defines environment-specific deployment settings, secrets, and feature flags that control app behavior across development, staging, and production environments.

**Key Attributes:**
- `environment`: string - Environment identifier (dev, staging, prod)
- `apiEndpoints`: Record<string, string> - Backend service URLs
- `featureFlags`: Record<string, boolean> - Environment-specific feature toggles
- `secrets`: SecretReference[] - Encrypted credential references
- `updateChannel`: string - Expo Updates channel mapping
- `storeConfig`: StoreConfiguration - App store specific settings

### TypeScript Interface

```typescript
interface DeploymentConfig {
  environment: string;
  apiEndpoints: Record<string, string>;
  featureFlags: Record<string, boolean>;
  secrets: SecretReference[];
  updateChannel: string;
  storeConfig: StoreConfiguration;
  monitoring: MonitoringConfig;
}

interface SecretReference {
  key: string;
  source: "github" | "eas";
  required: boolean;
}
```

### Relationships
- **Used by** Build Artifact
- **References** Secret Store
- **Configures** Environment

## Pipeline Execution Model

**Purpose:** Tracks the execution state of CI/CD workflows, including test results, deployment status, and rollback capabilities.

**Key Attributes:**
- `runId`: string - GitHub Actions run identifier
- `triggerEvent`: TriggerType - What initiated the pipeline
- `stages`: PipelineStage[] - Sequential execution stages
- `testResults`: TestSuite[] - Comprehensive test outcomes
- `deploymentStatus`: DeploymentStatus - Current deployment state
- `rollbackPoint`: string | null - Safe rollback commit reference

### TypeScript Interface

```typescript
interface PipelineExecution {
  runId: string;
  triggerEvent: TriggerType;
  stages: PipelineStage[];
  testResults: TestSuite[];
  deploymentStatus: DeploymentStatus;
  rollbackPoint: string | null;
  duration: number;
  initiatedBy: string;
}

type TriggerType = 
  | "push" 
  | "pull_request" 
  | "schedule" 
  | "manual";
```

### Relationships
- **Produces** Build Artifacts
- **Executes** Test Suites
- **Triggers** Deployments
