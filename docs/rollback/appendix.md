# Appendix

## Emergency Contacts

| Role | Name | Phone | Email | Escalation |
|------|------|-------|-------|------------|
| On-Call Engineer | Rotating | Via PagerDuty | oncall@ | Primary |
| Engineering Lead | [Name] | [Phone] | [Email] | Secondary |
| Product Head | [Name] | [Phone] | [Email] | Decisions |
| CTO | [Name] | [Phone] | [Email] | Critical only |
| CEO | [Name] | [Phone] | [Email] | Data loss/breach |

## Quick Reference Commands

```bash
# Check rollback status
./scripts/rollback-status.sh

# Execute feature rollback
./scripts/rollback-feature.sh [FEATURE_NAME] [ENVIRONMENT]

# Restore user data
./scripts/restore-user-data.sh [USER_ID]

# Generate rollback report
./scripts/generate-rollback-report.sh [INCIDENT_ID]

# Test rollback procedures
./scripts/test-rollback.sh --dry-run
```

## Related Documents
- Incident Response Plan
- Feature Flag Guidelines
- Monitoring & Alerting Setup
- Data Recovery Procedures
- Communication Templates