# Rollback Metrics & Reporting

## Key Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Detection | <5 minutes | Issue created → Detection |
| Time to Decision | <10 minutes | Detection → Rollback initiated |
| Time to Rollback | <15 minutes | Initiated → Complete |
| User Impact Duration | <30 minutes | Issue start → Resolution |
| Data Recovery Rate | 100% | Successful recoveries / Total |
| Communication Lag | <5 minutes | Rollback → User notified |

## Rollback Report Template

```markdown
# Rollback Report

**Date:** [DATE]
**Feature:** [FEATURE_NAME]
**Duration:** [START] - [END]
**Affected Users:** [COUNT] ([PERCENTAGE]%)

## Timeline
- Detection: [TIME] via [METHOD]
- Decision: [TIME] by [PERSON]
- Rollback Started: [TIME]
- Rollback Completed: [TIME]
- Users Notified: [TIME]

## Root Cause
[Description of what caused the issue]

## Impact
- Users Affected: [COUNT]
- Data Loss: [NONE/DESCRIPTION]
- Revenue Impact: [AMOUNT]
- Support Tickets: [COUNT]

## Actions Taken
1. [Action 1]
2. [Action 2]
3. [Action 3]

## Lessons Learned
- [Learning 1]
- [Learning 2]

## Prevention Measures
- [Measure 1]
- [Measure 2]

## Sign-offs
- Engineering: [NAME]
- Product: [NAME]
- Leadership: [NAME]
```
