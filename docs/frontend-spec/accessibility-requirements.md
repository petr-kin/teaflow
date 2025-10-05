# Accessibility Requirements

## Compliance Target
**Standard:** WCAG 2.1 AA compliance for app store approval and inclusive design

## Key Requirements

**Visual:**
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 2px Tea Green (#4A6741) outline with 4px offset for all interactive elements
- Text sizing: Support iOS/Android system text scaling up to 200% without layout breaking

**Interaction:**
- Keyboard navigation: Full app navigation via external keyboard for iPad users
- Screen reader support: VoiceOver/TalkBack compatibility with brewing instructions and timer announcements
- Touch targets: Minimum 44px with generous padding, especially for gesture controls

**Content:**
- Alternative text: Descriptive alt text for all tea images, brewing state indicators, and video loops
- Heading structure: Proper H1-H6 hierarchy for screen reader navigation
- Form labels: Clear labeling for tea entry forms and brewing parameter inputs

## Testing Strategy
**Automated Testing:** axe-react-native integration for continuous accessibility validation
**Manual Testing:** VoiceOver/TalkBack testing with actual tea brewing workflows
**User Testing:** Include users with visual impairments in beta testing program
