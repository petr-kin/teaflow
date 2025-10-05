# User Flows

## Flow 1: Quick Brew Session

**User Goal:** Brew a familiar tea with optimal timing and minimal friction

**Entry Points:** App launch, return from background, swipe to Timer from other sections

**Success Criteria:** User starts brewing within 10 seconds, receives proper timing guidance, logs session automatically

```mermaid
graph TD
    A[Launch TeaFlow] --> B[Timer Screen - Video Loop Active]
    B --> C{Recent Tea Available?}
    C -->|Yes| D[Tap Recent Tea Card]
    C -->|No| E[Tap Library Icon]
    D --> F[Confirm/Adjust Brewing Time]
    E --> G[Select from Tea Library]
    G --> F
    F --> H[Tap Start - Timer Begins]
    H --> I[Active Brewing State]
    I --> J[Timer Complete - Gentle Alert]
    J --> K{Multiple Steeps?}
    K -->|Yes| L[Show Next Steep Timer]
    K -->|No| M[Session Complete - Auto Log]
    L --> H
    M --> N[Return to Peaceful Timer Screen]
```

**Edge Cases & Error Handling:**
- No recent teas: Graceful fallback to library with suggested "popular" teas
- Timer interrupted: Auto-save session state, resume option
- App backgrounded during brewing: Background timer with notifications
- Multiple steep confusion: Clear visual indicators for current steep number

**Notes:** Optimizes for tea enthusiasts who have established routines and favorite teas. Minimizes cognitive load while maintaining precision. Auto-logging reduces friction while building valuable user data.

## Flow 2: New Tea Setup (OCR Scan)

**User Goal:** Add a new tea to their library using package scanning for accurate information

**Entry Points:** OCR camera icon from Timer screen, "Add Tea" from Library

**Success Criteria:** Tea information captured accurately, brewing parameters suggested, tea ready for first use

```mermaid
graph TD
    A[Tap OCR Camera Icon] --> B[Camera Permission Check]
    B -->|Granted| C[Camera View with Scan Frame]
    B -->|Denied| D[Settings Prompt]
    C --> E[Position Tea Package]
    E --> F[Auto-detect Package Text]
    F --> G{OCR Recognition Success?}
    G -->|Yes| H[Display Extracted Info]
    G -->|No| I[Manual Entry Fallback]
    H --> J[User Confirms/Edits Details]
    I --> J
    J --> K[AI Suggests Brewing Parameters]
    K --> L[User Reviews/Adjusts Settings]
    L --> M[Save to Tea Library]
    M --> N[Option: Start First Brew]
    N -->|Yes| O[Jump to Quick Brew Flow]
    N -->|No| P[Return to Timer Screen]
```

**Edge Cases & Error Handling:**
- Poor lighting: Torch toggle, guidance text
- Blurry image: Shake detection, capture guidance
- Unknown tea type: Fallback to generic parameters with learning note
- Duplicate detection: Suggest merge or create variant

## Flow 3: Session Review & Analysis  

**User Goal:** Review brewing history to improve technique and track preferences

**Entry Points:** Swipe to History section, tap session from Timer screen completion

**Success Criteria:** User gains insights into their brewing patterns, adjusts future sessions based on data

```mermaid
graph TD
    A[Enter History Section] --> B[Chronological Brew Log]
    B --> C{User Action}
    C -->|Tap Session| D[Session Detail View]
    C -->|View Charts| E[Analytics Dashboard]
    D --> F[Session Notes & Ratings]
    F --> G[Compare to Previous Brews]
    G --> H[Suggest Adjustments]
    E --> I[Usage Patterns Chart]
    I --> J[Favorite Teas Ranking]
    J --> K[Time of Day Analysis]
    H --> L[Apply Learning to Tea Profile]
    L --> M[Updated Brewing Parameters]
```

**Edge Cases & Error Handling:**
- No session data: Encourage first brew with helpful tips
- Incomplete sessions: Show partial data with context
- Data corruption: Graceful degradation with manual entry option

## Flow 4: First-Time User Onboarding

**User Goal:** Understand TeaFlow's capabilities and complete first successful brewing session

**Entry Points:** Fresh app install, reset from Settings

**Success Criteria:** User completes one full brewing session and understands core navigation

```mermaid
graph TD
    A[App First Launch] --> B[Welcome Screen with Video Preview]
    B --> C[Core Value Proposition]
    C --> D[Permission Requests]
    D --> E[Navigation Tutorial]
    E --> F[Add First Tea - Guided]
    F --> G{Tea Addition Method}
    G -->|OCR Scan| H[Guided OCR Tutorial]
    G -->|Manual Entry| I[Simplified Tea Form]
    H --> J[First Brew Session]
    I --> J
    J --> K[Timer Tutorial with Gestures]
    K --> L[Brewing Complete Celebration]
    L --> M[Exploration Encouragement]
    M --> N[Normal App Usage]
```

**Edge Cases & Error Handling:**
- Skip tutorial option: Available but discouraged with benefit messaging
- Tutorial interruption: Resume from last step on return
- Permission denial: Explain impact and provide workarounds

**Notes:** OCR flow leverages phone cameras for accuracy while maintaining simplicity. Session review is essential for tea enthusiasts who want to refine their technique. Onboarding must demonstrate value quickly for user retention.
