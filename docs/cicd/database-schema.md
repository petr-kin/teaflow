# Database Schema

## CI/CD Metadata Storage Schema

**Database Type:** PostgreSQL (hosted on Supabase for Expo integration)

```sql
-- Build tracking and artifact management
CREATE TABLE builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eas_build_id VARCHAR(255) UNIQUE NOT NULL,
    git_commit_hash VARCHAR(40) NOT NULL,
    git_branch VARCHAR(255) NOT NULL,
    platform build_platform NOT NULL,
    build_profile build_profile_type NOT NULL,
    version VARCHAR(50) NOT NULL,
    build_number INTEGER NOT NULL,
    status build_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    artifact_url TEXT,
    build_logs_url TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline execution tracking
CREATE TABLE pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_run_id BIGINT UNIQUE NOT NULL,
    trigger_event trigger_type NOT NULL,
    triggered_by VARCHAR(255) NOT NULL,
    git_ref VARCHAR(255) NOT NULL,
    status pipeline_status DEFAULT 'running',
    stages JSONB NOT NULL DEFAULT '[]',
    test_results JSONB DEFAULT '{}',
    duration_seconds INTEGER,
    rollback_point VARCHAR(40),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Custom enum types
CREATE TYPE build_platform AS ENUM ('ios', 'android');
CREATE TYPE build_profile_type AS ENUM ('development', 'preview', 'production');
CREATE TYPE build_status AS ENUM ('pending', 'in-queue', 'building', 'completed', 'failed', 'cancelled');
CREATE TYPE trigger_type AS ENUM ('push', 'pull_request', 'schedule', 'manual', 'tag');
CREATE TYPE pipeline_status AS ENUM ('running', 'completed', 'failed', 'cancelled');

-- Indexes for query performance
CREATE INDEX idx_builds_commit_platform ON builds(git_commit_hash, platform);
CREATE INDEX idx_builds_status_created ON builds(status, created_at DESC);
CREATE INDEX idx_pipeline_runs_trigger_status ON pipeline_runs(trigger_event, status);
```
