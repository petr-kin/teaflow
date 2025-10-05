# Rollback Automation Scripts

## Feature Flag Rollback Script
```bash
#!/bin/bash
# rollback-feature.sh

FEATURE=$1
ENVIRONMENT=$2
ROLLBACK_REASON=$3

echo "🔄 Initiating rollback for $FEATURE in $ENVIRONMENT"

# 1. Disable feature flag
curl -X PATCH "https://api.launchdarkly.com/flags/$FEATURE" \
  -H "Authorization: $LD_API_KEY" \
  -d '{"enabled": false}'

# 2. Clear CDN cache
aws cloudfront create-invalidation \
  --distribution-id $CF_DISTRIBUTION_ID \
  --paths "/*"

# 3. Trigger client refresh
curl -X POST "https://api.teaflow.app/admin/force-refresh" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "'$ROLLBACK_REASON'"}'

# 4. Log rollback
echo "{
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"feature\": \"$FEATURE\",
  \"environment\": \"$ENVIRONMENT\",
  \"reason\": \"$ROLLBACK_REASON\",
  \"initiated_by\": \"$USER\"
}" >> rollback.log

# 5. Notify team
curl -X POST $SLACK_WEBHOOK \
  -d '{"text": "🚨 Rollback executed for '$FEATURE' in '$ENVIRONMENT'. Reason: '$ROLLBACK_REASON'"}'

echo "✅ Rollback complete"
```

## Database Rollback Script
```sql
-- rollback-migration.sql

BEGIN TRANSACTION;

-- Create rollback point
SAVEPOINT before_rollback;

-- Restore user preferences
INSERT INTO user_preferences_backup
SELECT * FROM user_preferences
WHERE updated_at > :migration_start_time;

-- Revert schema changes
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS gesture_config;

ALTER TABLE user_preferences 
ADD COLUMN legacy_config JSONB;

-- Restore data from backup
UPDATE user_preferences p
SET legacy_config = b.legacy_config
FROM user_preferences_backup b
WHERE p.user_id = b.user_id;

-- Verify data integrity
DO $$
DECLARE
  corrupted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO corrupted_count
  FROM user_preferences
  WHERE legacy_config IS NULL 
  AND user_id IN (
    SELECT user_id FROM migrations 
    WHERE status = 'completed'
  );
  
  IF corrupted_count > 0 THEN
    RAISE EXCEPTION 'Data corruption detected: % records', corrupted_count;
  END IF;
END $$;

-- Commit if successful
COMMIT;

-- Log rollback completion
INSERT INTO rollback_log (
  executed_at,
  affected_users,
  rollback_type,
  success
) VALUES (
  NOW(),
  (SELECT COUNT(*) FROM user_preferences_backup),
  'migration_rollback',
  true
);
```
