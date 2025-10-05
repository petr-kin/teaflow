# Database Schema

```sql
-- TeaProfiles table
CREATE TABLE tea_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_schedule_sec TEXT NOT NULL, -- JSON array
    base_temp_c INTEGER NOT NULL,
    category TEXT NOT NULL,
    is_user_created BOOLEAN NOT NULL DEFAULT FALSE,
    ocr_source TEXT, -- JSON object
    notes TEXT,
    origin TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- BrewSessions table for analytics and learning
CREATE TABLE brew_sessions (
    id TEXT PRIMARY KEY,
    tea_id TEXT NOT NULL REFERENCES tea_profiles(id),
    steep_index INTEGER NOT NULL,
    actual_sec INTEGER NOT NULL,
    vessel_ml INTEGER NOT NULL,
    temp_c INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    feedback_strength TEXT, -- 'weak', 'perfect', 'strong'
    feedback_enjoyment INTEGER, -- 1-5 rating
    created_at INTEGER NOT NULL
);

-- UserPreferences table
CREATE TABLE user_preferences (
    tea_id TEXT PRIMARY KEY REFERENCES tea_profiles(id),
    vessel_ml INTEGER NOT NULL DEFAULT 110,
    temp_c INTEGER, -- NULL means use tea default
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    haptics_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    visual_complexity TEXT NOT NULL DEFAULT 'medium',
    updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_brew_sessions_tea_id ON brew_sessions(tea_id);
CREATE INDEX idx_brew_sessions_timestamp ON brew_sessions(timestamp);
CREATE INDEX idx_tea_profiles_category ON tea_profiles(category);
```
