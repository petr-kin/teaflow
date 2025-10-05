# 9. Critical Questions & Decisions (from Implementation Roadmap)

## 9.1 Must Answer Before Coding (CRITICAL)

| Question | Decision Required | Research Method | Success Criteria |
|----------|------------------|-----------------|------------------|
| Timer accuracy architecture | How to guarantee ≤0.2s/min drift? | Test React Native background timers | <0.2s/min measured across 10+ devices |
| Gesture conflict resolution | How to prevent swipe vs tap overlap? | Prototype with gesture-handler | <2% false positives in testing |
| Privacy/storage architecture | Local only or cloud sync? | User research on privacy preferences | Clear user acceptance |
| OCR quality threshold | What accuracy makes users trust? | Test with real tea packages | >80% extraction on clear packages |
| Accessibility fallback | Alternative for motor impairments? | Interview impaired users | Alternative interactions validated |

## 9.2 High Priority Decisions

| Question | Impact | Timeline | Resolution |
|----------|--------|----------|------------|
| Feedback weighting algorithm | Learning system design | Week 3-4 | Balance single vs long-term trends |
| Conflicting feedback resolution | User trust | Week 3-4 | Weighted averaging with recency bias |
| Cold start problem | New user experience | Week 2 | Default profiles by tea type |
| OCR offline processing | Core functionality | Week 2 | Queue for cloud when online |
| Battery optimization | User retention | Week 1-2 | Pause animations when backgrounded |
