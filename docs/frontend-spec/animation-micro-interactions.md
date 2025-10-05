# Animation & Micro-interactions

## Motion Principles
**Tea Ceremony Pacing:** All animations match contemplative brewing rhythm (300-500ms standard)
**Organic Movement:** Natural easing curves that mimic liquid flow and steam rising
**Purposeful Motion:** Every animation serves brewing experience or provides essential feedback
**Performance Priority:** Maintain 60fps with background video loops active

## Key Animations

**Core Interactions:**
- **Timer Start/Stop:** Gentle pulse animation with "liquid drain" confirmation (1000ms, Tea Flow easing)
- **Screen Transitions:** Horizontal slide with parallax layers (400ms, Standard easing)
- **Tea Selection:** Subtle card lift with shadow increase (200ms, Decelerate easing)
- **Brewing Progress:** Circular progress ring with smooth rotation (continuous, linear)
- **Session Complete:** Celebration animation with floating tea leaves (2000ms, Tea Flow easing)

**Micro-interactions:**
- **Button Press:** Scale to 0.95x with Tea Green highlight (150ms, Accelerate/Decelerate)
- **OCR Scanning:** Viewfinder pulse while detecting text (800ms loop, Standard easing)
- **Loading States:** Gentle fade-in for content, rotating tea leaf for processing
- **Error States:** Subtle shake animation for invalid inputs (300ms, Standard easing)

**Video Integration:**
- **Seamless Loops:** Background tea videos continue during all UI transitions
- **State Synchronization:** Video mood matches brewing phase (preparation/active/complete)
- **Performance Optimization:** Reduce animation complexity when video frame rate drops
