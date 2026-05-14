# Changelog

All notable changes to SpecIdol will be documented in this file.

## [Unreleased]

### Added
- **Sound system overhaul** — ported synth engine from buzz-tester with distortion, bandpass filters, and dual oscillators. All sounds defined as param objects:
  - Judge buzzes: single EAS-style tone, beep count cycles 1→2→3 by buzz order
  - Victory fanfare: ascending C major arpeggio (C4→E4→G4→C5) with overlapping shimmer on final note
  - Ahooga horn: two-tone car horn with light distortion
  - Countdown beeps: sine 880 Hz, one per second synced to visual countdown, with a major-third "GO" chord
  - Final combo: rapid EAS burst then ahooga, with 900ms delay so last judge beeps finish first
- **Buzz tester** (`buzz-tester.html`) — synthesizer workbench for designing game sounds:
  - 71 single presets across 8 categories (Game Show, Emergency, Retro Tech, Extreme, Horns/Bells, Musical, Sci-Fi, Nature, Industrial)
  - Combo stack presets (2, 3, 5, 10, 15 layers) including formant voice synthesis
  - Auto-stack mode with edit-in-place, layer delay controls, up to 15 simultaneous layers
  - Code export for copying sounds into game
- **Judge test dashboard** (`judge-test.html`) — multi-judge testing scaffold, simulates multiple judges in one browser
- **QR-first homepage** — session cards with QR codes for direct audience joining
- **Countdown system** — visual 3-2-1-GO with synced audio, wired into all views
- **QR code overlays** on audience and controller views
- **Story text preview** — dimmed full text shown when story selected but round not started (controller clears on countdown start)
- **Pause/resume button** on controller
- **Keyboard shortcuts** — spacebar and right arrow to advance text
- **State-aware round controls** — visual differentiation based on round status
- **Smart status text** — integrated progress display, preserved on pause/resume
- **Focus trap in modal dialogs**
- **Favicon and service worker** to prevent 404 errors
- **Vendored qrcode-generator** library (kazuhikoarase v1.4.4)

### Changed
- **Sound architecture** — replaced 5 per-judge buzz functions with single `playSynthSound(params, delay)` engine and param objects
- **README simplified** — narrative features, `make help` as quick start, hidden pages documented
- **CSS custom properties** replacing hard-coded hex colours throughout
- **Shared app.js** — consolidated `renderJudgePanels`, `escapeHtml`, `Countdown` class
- **Controller layout** — responsive two-column breakpoint, inline styles extracted to CSS classes
- **Session rendering** — DOM API instead of innerHTML for XSS safety
- **Lazy AudioContext creation** on audience page

### Fixed
- Controller dimmed story preview not clearing on countdown start
- Final combo sound overlapping last judge buzz (delay increased to 900ms)
- Judge footer not showing buzz state with single judge
- Doubled paragraph bug and dynamic story list status
- Outcome overlay containment, mobile footer, story list markers
- Round transition timing — controller countdown sends round_start after completion
- Reconnect to dead session redirects to index
- Story count display using increment/decrement instead of reading missing field
- Modal button styling consistency across all pages
- Copy JSON button moved out of h2, footer double border removed

## [1.0.0] - 2026-04-18

Initial release of SpecIdol - Pop Idol for speculative fiction writers at conventions.

### Features
- Real-time WebSocket coordination between controller, judges, and audience
- Multiple concurrent sessions with 4-letter session codes
- Auto-assign judge IDs (sequential: 1, 2, 3...)
- Auto-scrolling story text synchronized across all clients
- Judge buzzer system with big red buttons
- Audience projector view with CRT effects and animations
- Controller interface with story queue management
- Import/Export session functionality
- Dynamic judge indicators (panels generated from connected judges)
- UI refinements: two-column controller layout, session list grid, collapsible sections
- Retro/campy game show aesthetic
- No build step, no framework - pure HTML/CSS/JS + Python WebSocket server
- Consistent headers across all pages with contextual info and session stats
- Custom judge names with initials display
- Session control panel (eject judges, shutdown audience, delete session)
- History export with Copy JSON button

### License
Licensed under Anti-Capitalist Software License v1.4
