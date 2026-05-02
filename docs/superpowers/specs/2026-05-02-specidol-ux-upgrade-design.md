# SpecIdol UX Upgrade Design

**Date:** 2026-05-02
**Status:** Approved
**Author:** Marty + Claude (brainstorming session)

---

## Overview

Comprehensive UX upgrade for SpecIdol covering gameplay workflow improvements, QR code joining, sound effects, UI restructuring, and bug fixes. This design consolidates multiple enhancement requests into one coherent upgrade while maintaining the project's vanilla-JS, no-build philosophy.

---

## Background

SpecIdol is a live "Pop Idol for writers" web application for speculative fiction conventions. Readers read stories aloud while judges buzz them out with big red buttons. The app coordinates real-time gameplay across controller, judge, and audience screens via WebSocket.

**Tech stack:**
- Frontend: Vanilla HTML/CSS/JS (no frameworks, no build step)
- Backend: Python WebSocket relay (`relay.py`)
- ~3,800 lines total
- Retro aesthetic (Press Start 2P font, neon colors, CRT effects)

---

## Motivation

### Initial Braindump (User Requirements)

**1. Bug: Judge interface doesn't reset**
- When controller starts next story, judge screens still show buzzed-out state
- Need to fix message coordination flow
- Maybe document message flow (decided: separate task)

**2. Round start workflow needs improvement**
- Press "Start round" → 3-2-1 countdown on audience/judge screens
- First paragraph displays after countdown
- Timer starts at 0 when countdown finishes
- Controller advances text chunks as before (keep existing behavior)
- Remove PAUSE button (decided: keep but de-emphasize)

**3. Story selection UI is "janky"**
- Reset button/story selection flow feels awkward
- Explore better layout options

**4. Buzz time tracking**
- Record judge buzz-out times in log
- Display in controller history (for post-round commentary)

**5. QR codes for joining**
- Audience screen shows QR for audience joining
- Controller screen shows QR for judge joining (judges join from controller, not homepage)
- Homepage shows session cards with QR codes (click/scan to join as audience)
- Simplify joining workflow (remove modals, prioritize audience participation)

**6. Sound effects**
- Every phone plays sounds (audience, judges, controller)
- 5 different buzz sounds, randomly assigned per judge
- Buzz count progression (1st buzz = 1x sound, 2nd = 2x, 3rd = 3x)
- Final combo: All judge sounds overlapping + AHOOGA (when last judge buzzes out)
- Victory fanfare (when timer expires without all judges buzzing)
- Prefer Web Audio API (generated sounds, no MP3 files)
- Fallback: Base64-encoded MP3s if needed (decided: Web Audio only)

---

## Goals

1. **Fix judge reset bug** — Judges see clean state when new round starts
2. **Add round start countdown** — 3-2-1-GO animation, coordinated start
3. **Improve story management UI** — 2-column layout, intuitive editing
4. **Add QR code joining** — Scan to join (audience + judges), simplify homepage
5. **Add sound effects** — Buzz variations, fanfare, final combo (Web Audio API)
6. **Track buzz times** — Record in controller history for post-round discussion
7. **Maintain vanilla architecture** — No frameworks, minimal dependencies

---

## Requirements Gathering

### Key Questions & Decisions

**Q: Timer starts when countdown finishes or on first Advance click?**
**A:** Timer starts when countdown finishes (at GO/0). First paragraph visible immediately after countdown.

**Q: Replace auto-scroll with manual advancement?**
**A:** Keep existing behavior — controller manually advances chunks, they scroll smoothly into view. Just add: first paragraph scrolls in during countdown.

**Q: Remove PAUSE button entirely?**
**A:** Keep for emergencies, but make less prominent (de-emphasized, smaller).

**Q: What feels "janky" about story selection?**
**A:** Workflow after selecting stories, reset button behavior. Proposed solution: 2-column layout (queue left, edit form right), similar to round controls + story text.

**Q: "Close round" means?**
**A:** Same as reset (clear buzzed state, ready to replay same story). Button text: "Close round". Confirmation: "Close this round early?"

**Q: Where do QR codes display?**
**A:** Different placement:
- Audience screen: Bottom-right overlay (200px)
- Controller screen: Bottom-right of round controls (200px)
- Homepage: Session cards show QR + info, click/scan joins as audience

**Q: How does controller rejoin session?**
**A:** Must remember/bookmark URL (e.g., `control.html#XKRM`). No UI for controller rejoining from homepage.

**Q: Countdown coordination — server ticks or client-side?**
**A:** Client-side. Controller sends `countdown_start`, clients handle countdown locally (setTimeout). Less traffic, simpler, drift negligible for 3 seconds.

**Q: Sound approach — MP3 samples or Web Audio API?**
**A:** Web Audio API (generated sounds). Avoid asset files/downloads.

**Q: Sound progression style?**
**A:** Combination:
- 5 random buzz sounds (Web Audio variations)
- Randomly assigned per judge on join
- Buzz count increases (1st = 1x, 2nd = 2x, 3rd = 3x)
- Final combo: All sounds overlapping + AHOOGA (when last judge out)
- Victory fanfare (timer expires, not all judges buzzed)

**Q: Victory fanfare on timer expiry?**
**A:** Yes.

**Q: Where display buzz times?**
**A:** Controller history/log only (not audience or judge screens).

**Q: Judge button behavior on new round start?**
**A:** Button inactive until countdown ends and round starts. Shows "waiting" state during countdown.

**Q: Countdown visual treatment?**
**A:** Large animated numbers (scale/fade effects). Respects `prefers-reduced-motion`.

**Q: Timer location?**
**A:** Old: bottom-left (now occupied by judge panels). New: header, next to header-left content, full height (like story title). Same on audience and judge screens.

**Q: Homepage "Create Session" button placement?**
**A:** Always bottom-right (whether sessions exist or not). Simpler, consistent.

**Q: QR code library — vanilla or jQuery?**
**A:** Pure vanilla. Use qrcode-generator (kazuhikoarase), ~3kb, no dependencies.

**Q: Controller toggle for audience QR visibility?**
**A:** Yes. Button on controller to show/hide QR on audience screens (sends message).

**Q: Need speed controls (1x, 2x, 3x)?**
**A:** No, remove them.

---

## Approach Evaluation

### Approach 1: Minimal Additions (SELECTED)

Keep vanilla architecture, add features as simple enhancements:

- **QR codes:** qrcode-generator library (~3kb vanilla JS), vendored locally
- **Sounds:** Web Audio API with 5 buzzer generators, judge sound assignment in session state
- **UI:** CSS Grid refactoring for controller, existing HTML patterns
- **Countdown:** Client-side (controller sends `countdown_start`, clients handle locally)
- **Judge test:** Separate standalone HTML page

**Pros:** Stays true to no-build philosophy, one small dependency, easy to maintain, delivers everything coherently
**Cons:** Adds qrcode-generator dependency (though tiny and vendored)

### Approach 2: Server-Enhanced Coordination

Move timing/coordination server-side:

- QR codes generated server-side (SVG data URIs)
- Server tracks judge sounds, broadcasts playback commands
- Server broadcasts countdown ticks for perfect sync

**Pros:** Perfect timing sync, zero client dependencies for QR
**Cons:** Breaks "simple relay" pattern, adds complexity to relay.py

### Approach 3: Pure Vanilla (No Dependencies)

Avoid all external libraries:

- Hand-rolled QR generator (or just show session codes)
- Web Audio only, no fallbacks
- Client-side timing (may drift)

**Pros:** Zero dependencies
**Cons:** Writing QR generator complex, or skip QR entirely

**Decision:** Approach 1. Adds one tiny vendored library, keeps server simple, delivers all features cleanly.

---

## Architecture Overview

**Core principle:** Keep existing vanilla architecture. Add features as minimal enhancements.

**New dependencies:**
- `qrcode-generator` (kazuhikoarase) — 3kb vanilla JS, vendored locally at `www/lib/qrcode-generator.js`

**Client-side additions:**
- `sounds.js` — Web Audio API buzzer generators (5 variations), fanfare, AHOOGA
- QR code generation helpers (wrap qrcode-generator library)
- Countdown renderer (animate 3-2-1-GO on judge/audience screens)

**Server-side changes:**
- Session state: Track judge sound assignments (random 0-4 index per judge), audience QR visibility toggle, buzz history
- New message types: `countdown_start`, `toggle_audience_qr`
- Modified messages: `buzz` (add buzz count, timestamp)
- Bug fix: Send reset messages when round starts (clear judge buzzed state)

**UI restructuring:**
- Controller: 2-column layout for story management (queue left, edit right)
- Homepage: QR-first workflow (sessions display QR codes, click/scan joins as audience)
- Audience/Judge: QR code overlays (bottom-right positioning), timer in header
- Controller: Remove speed controls, de-emphasize pause button, rename reset to "Close round"

**Pages:**
- Existing: index.html, control.html, judge.html, audience.html
- New: judge-test.html (standalone testing dashboard)

---

## Detailed Design

### 1. QR Code Implementation

**Library:** qrcode-generator (kazuhikoarase), vendored locally at `www/lib/qrcode-generator.js`

**QR code locations:**

**Audience screen (audience.html):**
- Bottom-right overlay (fixed position, 200px square)
- Contains: Session join URL for audience (`http://host/index.html#XKRM`)
- Visibility controlled by controller toggle (default: visible)
- Controller sends `toggle_audience_qr` message (true/false)
- Mobile: Stacks at bottom (may go offscreen — acceptable)
- Styling: Semi-transparent background, retro border, glow

**Controller screen (control.html):**
- Bottom-right corner of round controls section (200px square)
- Contains: Judge join URL (`http://host/judge.html#XKRM`)
- Always visible during session (not affected by toggle)
- Mobile: Stacks below buttons, same size
- Styling: Matches round controls aesthetic
- Toggle button: "Show/Hide Audience QR" (sends `toggle_audience_qr` message)

**Homepage (index.html):**
- Session cards display 200px QR + session info (code, judge count, story count)
- QR contains audience join URL
- Click QR or session card = join as audience (no modal)
- "Create Session" button: Always bottom-right corner
- Styling: Card layout, QR prominent at top, info below

**Generation:**
- Client-side on page load
- Regenerate if session code changes
- Error correction level: M (medium, ~15% recovery)
- Fallback: If generation fails, show session code as text

---

### 2. Round Start Workflow & Countdown

**Trigger:** Controller clicks "Start round" button (story must be selected)

**Message flow:**
1. Controller sends `countdown_start` message
2. Server broadcasts to all clients (judge, audience, controller)
3. Each client runs countdown locally (setTimeout, 1s intervals: 3 → 2 → 1 → GO)
4. During countdown: First paragraph scrolls into view smoothly
5. At GO (countdown end): Timer starts at 0, first paragraph fully visible, judge buttons activate

**Judge screen behavior:**
- Before countdown: Button inactive, shows "Waiting for round..."
- During countdown: Large animated numbers (3, 2, 1, GO) center screen — scale in (0.5 → 1.2 → 1.0), fade in, hold 0.8s, fade out
- After countdown: Button active, ready to buzz

**Audience screen behavior:**
- During countdown: Large animated numbers center screen (same animation as judge)
- After countdown: Timer visible in header, story text visible, scrolling begins on controller advance

**Controller screen behavior:**
- During countdown: Shows countdown (smaller, less prominent than judge/audience)
- After countdown: "Advance text" button active, can advance story chunks

**Countdown animation:**
- Numbers scale in (0.5 → 1.2 → 1.0), fade in, hold 0.8s, fade out
- "GO" displays briefly (0.3s), then disappears
- Respects `prefers-reduced-motion` (simple fade only, no scaling)

**Timer location:**
- Old: Bottom-left (now occupied by judge panels)
- New: Header, next to header-left content (session code/label), full height like story title
- Appears on: Audience screen, judge screen (moved from center-top), controller screen
- Consistent across all screens

---

### 3. Sound System

**Technology:** Web Audio API (no external audio files, generated sounds)

**Sound types:**

**1) Buzz sounds (5 variations):**
- Buzz 0: Sawtooth wave (220 Hz, harsh)
- Buzz 1: Square wave (180 Hz, aggressive)
- Buzz 2: Sawtooth + square mix (200 Hz, distorted)
- Buzz 3: Triangle wave + noise (240 Hz, mechanical)
- Buzz 4: Pulse width modulation (190 Hz, warbling)

Each ~200ms duration, slight decay envelope

**2) Victory fanfare:**
- Note sequence: C4 → E4 → G4 → C5 (major chord arpeggio)
- Trumpet-like timbre (sawtooth + harmonics)
- ~1.5s duration

**3) AHOOGA (final combo):**
- Classic car horn sound (frequency sweep 400→220 Hz)
- ~800ms duration

**Sound assignment:**
- Judge joins → server assigns random buzz sound index (0-4)
- Stored in session state `judge_sounds` dict (judge ID → sound index)
- Broadcast to all clients in judge list updates
- Judge reconnects: Reuse existing assignment (don't reassign)

**Playback logic:**

**Judge buzzes:**
- Judge clicks buzz → sends `buzz` message
- Server adds buzz count (1st, 2nd, 3rd judge out based on message arrival order)
- Server broadcasts buzz with `{judge_id, buzz_count, timestamp}`
- All clients play: assigned buzz sound × buzz count
  - 1st judge out: buzz × 1
  - 2nd judge out: buzz × 2
  - 3rd judge out: buzz × 3

**Final combo (all judges out):**
- Last judge buzzes → clients detect all judges buzzed (check judge list)
- Play: All assigned buzz sounds overlapping (slight 50ms offset between layers) + AHOOGA on top
- Dramatic ending

**Victory (timer expires, not all judges buzzed):**
- Client detects timer expired (local timer hits duration)
- Play: Victory fanfare

**Implementation:**
- `sounds.js` — Web Audio generators, playback functions
- Loaded on all pages (audience, judge, controller)
- Respects `prefers-reduced-motion` (skip sounds if enabled)
- Fallback: If Web Audio API not supported, silent (game continues, no sounds)

---

### 4. Story Management UI (Controller)

**Current:** Story queue (collapsible list) + separate story management section (collapsible form)

**New:** 2-column layout (similar to round controls + story text columns)

**Layout:**

**Left column (Story Queue):**
- List of stories (title, click to select)
- Selected story: Highlighted/border
- Bottom buttons:
  - "Add Story" (clears form on right, sets to "create mode")
  - "Import Session" (disclosure triangle, shows/hides import form below button)
  - "Export Session" (copies JSON to clipboard, existing behavior)

**Right column (Story Edit Form):**
- Only visible when story selected from queue (or Add clicked)
- Fields: Title input, Text textarea
- Buttons:
  - "Update" (disabled by default, enables when content changes, disables after successful update)
  - "Remove" (confirmation modal: "Remove this story?")
- No "Cancel" button — clicking away = silent discard (user responsibility to click Update)

**Import form:**
- Sits below "Import Session" button (when disclosed)
- Textarea for JSON paste
- "Import" button
- Too large to sit permanently visible, uses disclosure pattern (triangle icon rotates)

**Behavior:**
- Click story in queue → fills edit form on right
- Edit title/text → "Update" button enables
- Click "Update" → saves changes, button disables until next edit
- Click away from form (select different story, click elsewhere) → discards unsaved edits (no warning)
- Click "Add Story" → clears form, "Update" button becomes "Create"
- Click "Create" → adds new story, returns to edit mode
- Remove story → confirmation modal, deletes story, clears form

**Responsive (mobile ≤900px):**
- Columns stack vertically (queue top, form bottom)

---

### 5. Homepage Workflow (index.html)

**Current:** Session list → click session → modal "Join as?" → select role → join

**New:** QR-first, audience-focused workflow (no modals)

**States:**

**No sessions exist:**
- Empty/placeholder message center ("No active sessions.")
- "Create Session" button (bottom-right corner)

**Sessions exist:**
- Session cards (grid layout, auto-fit columns, responsive)
- Each card shows:
  - 200px QR code at top (audience join URL)
  - Session code (e.g., "XKRM")
  - Judge count (e.g., "3 judges")
  - Story count (e.g., "5 stories")
- Click card or QR → joins as audience (direct, no modal)
- "Create Session" button (bottom-right corner, same location as no-sessions state)

**Session card styling:**
- Retro border, glow effect
- QR code prominent at top
- Info text below QR (monospace, small, yellow)
- Hover state (brightness increase, border glow intensifies)

**Removed:**
- "Join as..." modal dialogs
- Role selection buttons (audience/judge/controller)

**Controller rejoining:**
- Controller must bookmark/remember URL (e.g., `control.html#XKRM`)
- No UI for controller rejoining from homepage
- Prioritizes audience participation, simplifies homepage

**Responsive:**
- Cards scale down on mobile
- Single column on narrow screens (<600px)

---

### 6. Judge Reset Bug Fix

**Problem:** Judge screens don't reset when controller starts next round (still show buzzed-out state from previous round)

**Root cause:** No message sent to clear judge state when new round starts

**Fix:**

**Message flow when controller starts round:**
1. Controller sends `countdown_start` message
2. Server broadcasts `countdown_start` to all clients
3. Judge clients receive `countdown_start` → reset to "waiting" state:
   - Clear buzzed status (remove "BUZZED OUT" message, red X, etc.)
   - Disable buzz button
   - Show "Waiting for countdown..." message
4. Countdown runs (3, 2, 1, GO) — judge sees animated numbers
5. At GO: Judge button activates, ready to buzz

**Additional reset triggers:**
- Controller clicks "Close round" → sends `reset_round` message → judges reset to waiting
- Controller selects different story (without starting) → no reset (judges stay in current state until round starts)

**Session state cleanup on round start:**
- Server clears `buzzed_judges` list on `countdown_start`
- Server clears timer state on `countdown_start`
- Fresh round state for each start

---

### 7. Controller Controls

**Changes:**

**1) "Reset round" → "Close round":**
- Button text: "Close round"
- Confirmation modal: "Close this round early?"
- Behavior: Same as reset (clears buzzed state, stops timer, ready to replay same story)
- Message name: Keep `reset_round` internally (no breaking change needed)

**2) Pause button:**
- Move to less prominent location (not primary action)
- Visual treatment: Smaller, de-emphasized (gray color, smaller font)
- Position: Below primary actions (grouped with "Close round" as secondary actions)
- Still functional for emergencies (technical issues, clarification needed)

**3) Speed controls:**
- Remove entirely (1x, 2x, 3x buttons removed)
- Simplifies round controls, not needed

**4) Round controls layout:**
- Primary actions (top): "Start round" (green, prominent), "Advance text" (yellow, prominent during active round)
- Secondary actions (below): "Pause" (gray, small), "Close round" (red, warning color)
- Judge QR code: Bottom-right corner of round controls section (200px, always visible)

**Button hierarchy (visual emphasis):**
- Start round: Green, large, glow effect
- Advance text: Yellow, large, glow effect (only visible during active round)
- Pause: Gray, small, no glow
- Close round: Red, medium, subtle glow (warning color)

---

### 8. Judge Test Page

**Purpose:** Testing dashboard to simulate multiple judges joining/buzzing without needing real devices

**File:** `www/judge-test.html` (standalone page, completely separate from existing features)

**UI:**

**Setup section (top):**
- Input: Number of judges (1-10, default 3)
- Button: "Spawn Judges" (creates WebSocket connections, assigns names automatically)

**Judge panel (per judge):**
- Judge ID/name display (e.g., "Judge 1", "Judge 2", "Judge 3")
- Assigned buzz sound index (e.g., "Buzz sound: 2")
- "Buzz" button (sends buzz message for that judge)
- Connection status indicator (green dot = connected, red dot = disconnected)

**Session controls (bottom):**
- Session code input (connect all judges to specific session)
- "Connect All" button (joins all spawned judges to session)
- "Disconnect All" button (closes all WebSocket connections, resets)

**Layout:**
- Setup section: Top bar
- Judge panels: Grid layout (auto-fit, 3 columns on desktop, 1 column on mobile)
- Session controls: Bottom bar
- Responsive on mobile

**Behavior:**
- Each judge gets separate WebSocket connection (simulates real judge clients)
- Judge names: Auto-generated (Judge 1, Judge 2, ...)
- Buzz buttons send actual `buzz` messages (server assigns sound index same as real judges)
- Can test: Sound assignment, buzz counting, final combo, timing, reset behavior

**Styling:**
- Match existing retro aesthetic (Press Start 2P, neon colors, glow effects)
- Clearly marked "TESTING DASHBOARD" in header (large, yellow, impossible to miss)
- Warning text: "This page is for testing only. Do not use during live events."

---

## Data & Message Changes

### New Message Types

**Client → Server:**

```javascript
{
  type: "countdown_start",
  data: {
    story_id: "story_123"  // Selected story ID
  }
}
```

```javascript
{
  type: "toggle_audience_qr",
  data: {
    visible: true  // or false
  }
}
```

**Server → Client:**

```javascript
{
  type: "countdown_start",
  data: {
    story_id: "story_123",
    story_title: "The Last Sunset",
    story_text: "..."
  }
}
```

```javascript
{
  type: "toggle_audience_qr",
  data: {
    visible: true  // or false
  }
}
// Broadcast to audience clients only, not controller/judge
```

### Modified Message Types

**buzz (modified):**

```javascript
{
  type: "buzz",
  data: {
    judge_id: "judge_2",
    buzz_count: 2,  // NEW: 1st, 2nd, 3rd judge out
    timestamp: "2026-05-02T14:23:45.123Z"  // NEW: ISO timestamp
  }
}
```

### Session State Additions

```python
session = {
    # Existing fields
    "code": "XKRM",
    "judges": [
        {"id": "judge_1", "name": "Alice"},
        {"id": "judge_2", "name": "Bob"},
        {"id": "judge_3", "name": "Carol"}
    ],
    "stories": [...],
    "buzzed_judges": [],
    "timer_state": {...},

    # NEW FIELDS

    "judge_sounds": {
        # Judge ID → sound index (0-4)
        "judge_1": 2,
        "judge_2": 0,
        "judge_3": 4
    },

    "audience_qr_visible": True,  # Controller toggle state (default: visible)

    "buzz_history": [
        # For controller history/log display
        {
            "judge_id": "judge_2",
            "judge_name": "Bob",
            "time": 5.3,  # Seconds into round
            "timestamp": "2026-05-02T14:23:45.123Z"
        },
        {
            "judge_id": "judge_1",
            "judge_name": "Alice",
            "time": 12.8,
            "timestamp": "2026-05-02T14:23:58.456Z"
        }
    ]
}
```

### Sound Assignment Logic

**When judge joins:**
1. Server receives `join` message with role "judge"
2. Server checks if judge ID already in `judge_sounds` (reconnection case)
3. If new judge: Generate random int (0-4), store in `judge_sounds[judge_id]`
4. If reconnecting: Reuse existing assignment (don't reassign)
5. Broadcast updated judge list to all clients (include sound assignments)

**When judge buzzes:**
1. Server receives `buzz` message from judge
2. Server counts how many judges have already buzzed (buzz_count = len(buzzed_judges) + 1)
3. Add judge to `buzzed_judges` list
4. Add entry to `buzz_history` with timestamp and elapsed time
5. Broadcast `buzz` message with judge_id, buzz_count, timestamp to all clients

**Client-side playback:**
1. Receive `buzz` message
2. Look up judge's assigned sound index from session state
3. Play that buzz sound × buzz_count times (with 100ms gap between repetitions)
4. Check if all judges now buzzed → trigger final combo (all sounds + AHOOGA)

---

## Error Handling & Edge Cases

### QR Code Generation Failures

- If qrcode-generator fails to load or generate: Show session code as fallback text
- Log error to console (`console.error("QR generation failed: ...")`), don't break page
- User can still manually type session code or URL

### Sound Playback Failures

- Web Audio API not supported (old browsers): Silent fallback, game continues normally
- Check `AudioContext` availability on page load
- Log warning if unavailable (`console.warn("Web Audio not supported, sounds disabled")`)
- No error message to user (sounds are enhancement, not critical)

### Countdown Timing Drift

- Acceptable: 3-second countdown may drift ~50-100ms between clients (network latency, setTimeout precision)
- No correction needed (imperceptible in practice, countdown is just visual cue)
- Timer sync happens after countdown (existing clock offset logic)

### Judge Sound Assignment

- Server assigns random sound (0-4) on join, persists in session state
- Judge reconnects: Reuse existing assignment from `judge_sounds` dict (check if judge_id exists)
- Don't reassign on reconnect (maintains consistency for that judge throughout session)

### Audience QR Toggle

- Default state: visible (`audience_qr_visible: true`)
- Toggle state persists in session (new audience members joining see current state)
- If toggle message fails (network error): QR stays in previous state, no error to user
- Controller can retry toggle if needed

### Story Edit Form

- Unsaved edits: Silent discard on click-away (no confirmation, user responsibility to click Update)
- Empty title/text: Disable Update/Create button (validation, prevent empty stories)
- Update fails (network error): Show error modal ("Failed to update story. Try again."), don't clear form (preserve user's edits)

### Countdown Interrupted

- Controller clicks "Close round" during countdown: Stop countdown immediately, reset state, clear countdown display
- Network disconnect during countdown: Client continues countdown locally (best effort), reconnects after countdown ends
- If controller disconnects during countdown: Other clients complete countdown, timer starts (game continues)

### Multiple Judges Buzz Simultaneously

- Server assigns buzz count based on message arrival order (first message received = 1, second = 2, etc.)
- Clients play sounds based on received buzz_count (may hear sounds in slightly different order if messages arrive out of sync — acceptable, adds to chaos/humor)
- Server is source of truth for buzz order

---

## Testing Approach

### Manual Testing Workflow

**1) QR Code Testing:**
- Test on mobile: Scan QR from audience screen → verify joins as audience
- Test on mobile: Scan QR from controller screen → verify joins as judge
- Test homepage: Scan session card QR → verify joins as audience
- Test toggle: Controller clicks "Show/Hide Audience QR" → verify QR disappears on audience screen (projector), reappears on second click
- Test fallback: Disable JavaScript QR generation → verify session code displays as text

**2) Round Start & Countdown:**
- Start round → verify countdown (3-2-1-GO) displays on judge screens (large, animated)
- Verify countdown displays on audience screen (large, animated)
- Verify first paragraph scrolls in during countdown (smooth scroll, 3 seconds)
- Verify timer starts at 0:00.0 when countdown ends (in header, next to session code)
- Verify judge button activates after countdown (clickable, ready to buzz)
- Test "waiting" state: Verify judge button inactive before countdown starts

**3) Sound Effects:**
- Test each buzz variation: Use judge-test page, spawn 5+ judges, buzz each one individually → verify different sounds
- Test buzz count progression: Spawn 3 judges, buzz in sequence → verify 1st plays once, 2nd plays twice, 3rd plays three times
- Test final combo: Buzz all judges → verify all sounds play overlapping + AHOOGA plays on top
- Test victory fanfare: Start round, let timer expire without all judges buzzing → verify fanfare plays
- Test on multiple devices: Phones (iPhone, Android), tablets, laptops → verify sounds play on all
- Test `prefers-reduced-motion`: Enable setting in OS → verify sounds still play but animations simplified

**4) Story Management UI:**
- Add story → verify form clears, "Update" button becomes "Create", creating works
- Edit story → verify "Update" button disabled initially, enables when content changes, disables after clicking Update
- Click away without saving → verify edits discard (select different story, form updates without saving previous)
- Remove story → verify confirmation modal ("Remove this story?"), deletion works, form clears after removal
- Import session → verify disclosure triangle works (click to show/hide), JSON paste works, stories import correctly
- Export session → verify JSON copies to clipboard, paste works in import

**5) Homepage Workflow:**
- Test with 0 sessions → verify empty message displays, "Create Session" button in bottom-right
- Test with sessions → verify session cards display, QR visible and scannable, session info correct (code, judge count, story count)
- Click session card → verify joins as audience (no modal, direct join)
- Test controller rejoin → verify must use bookmarked URL (e.g., `control.html#XKRM`), homepage doesn't offer controller join
- Test "Create Session" button → verify always in bottom-right corner (consistent placement)

**6) Judge Reset Bug Fix:**
- Play round, judges buzz out → verify judge screens show "BUZZED OUT"
- Controller starts new round → verify judge screens reset to "Waiting for countdown...", then countdown plays, then button activates
- Verify buzzed state cleared (no red X, no "BUZZED OUT" message)
- Test "Close round" → verify judges reset to waiting state

**7) Controller Controls:**
- Verify "Start round" button green, prominent
- Verify "Advance text" button yellow, prominent (appears during active round)
- Verify "Pause" button gray, small, de-emphasized (below primary actions)
- Verify "Close round" button red, warning color (confirmation modal works)
- Verify speed controls removed (no 1x/2x/3x buttons)
- Verify judge QR in bottom-right of round controls section (200px, always visible)

**8) Judge Test Page:**
- Navigate to `judge-test.html`
- Spawn 5 judges → verify connections show green, sound assignments display (0-4)
- Enter session code, click "Connect All" → verify all judges join session
- Buzz judges in sequence → verify sounds play correctly (in main session, on audience/judge/controller screens)
- Test final combo with 3+ judges → verify all sounds + AHOOGA
- Disconnect all → verify connections close, status indicators turn red
- Verify page clearly marked "TESTING DASHBOARD" (impossible to mistake for production)

**9) Timer Location:**
- Verify timer in header on audience screen (next to session code, full height)
- Verify timer in header on judge screen (same location, replacing old center-top placement)
- Verify timer updates during round (counts up from 0:00.0)
- Verify timer responsive on mobile (stacks appropriately in header)

**10) Responsive Design:**
- Test all pages on mobile (≤900px): index, control, judge, audience, judge-test
- Verify layouts stack correctly (story management columns, session cards, judge panels)
- Verify QR codes visible on mobile (may go offscreen at very bottom — acceptable)
- Verify touch targets adequate (buttons, QR codes)

---

## Implementation Notes

### File Changes

**New files:**
- `www/lib/qrcode-generator.js` — Vendored library (kazuhikoarase)
- `www/sounds.js` — Web Audio API generators and playback functions
- `www/judge-test.html` — Testing dashboard

**Modified files:**
- `www/index.html` — Homepage workflow (session cards, QR codes, simplified joining)
- `www/control.html` — Story management UI (2-column layout), round controls (button changes, QR), timer moved to header
- `www/judge.html` — Countdown display, timer moved to header, reset bug fix
- `www/audience.html` — Countdown display, timer moved to header, QR overlay, toggle visibility
- `www/app.js` — Add QR generation helpers, countdown logic, sound playback coordination
- `www/style.css` — Layout changes (2-column grids), button styling updates, timer header positioning, QR overlay styles
- `server/relay.py` — Session state additions (judge_sounds, audience_qr_visible, buzz_history), new message handlers (countdown_start, toggle_audience_qr), buzz message modifications (add buzz_count, timestamp)

### Implementation Order

Suggested implementation order (can be done in phases or all at once):

1. **Vendor QR library** — Copy qrcode-generator.js to `www/lib/`
2. **Judge reset bug fix** — Modify relay.py and judge.html (message handling for countdown_start reset)
3. **Countdown workflow** — Add countdown_start message, client-side countdown rendering (judge, audience, controller)
4. **Timer relocation** — Move timer to header on judge/audience screens (CSS + HTML changes)
5. **Sound system** — Create sounds.js, integrate playback on buzz/victory messages, add judge sound assignment logic
6. **QR codes** — Add QR generation to index/control/audience pages, controller toggle button
7. **Story management UI** — Refactor controller layout (2-column, edit form behavior)
8. **Homepage workflow** — Simplify index.html (session cards, remove modals)
9. **Controller controls** — Update button hierarchy (rename reset, de-emphasize pause, remove speed, add QR)
10. **Judge test page** — Create judge-test.html (separate, can be done last)

### Code Style

- Follow existing conventions from `BOOTSTRAP.md`
- Vanilla JS (no frameworks, ES6+ features OK for modern browser support)
- Inline styles initially, refactor to CSS later if needed
- CSS custom properties for colors (already defined in `style.css :root`)
- Message format: `{type: "...", data: {...}}`
- Comment complex logic (countdown timing, sound generation, QR fallback)

### Accessibility

- Respects `prefers-reduced-motion` (simplify animations, skip scaling/vibration)
- Countdown numbers: Use `aria-live="polite"` for screen readers
- QR codes: Include alt text with session code (fallback for screen readers)
- Buttons: Proper labels, keyboard accessible (existing patterns)
- Modals: Keyboard support (Escape to close, Tab focus trap — existing modal.js)

---

## Future Considerations

**Not in this design, but noted for future:**

1. **Message flow documentation** — Document all message types, flows, state transitions (separate task, user noted)
2. **Persistent sessions** — Store session state in database instead of in-memory (would enable session recovery on server restart)
3. **Sound customization** — Let controller choose from multiple sound packs (retro, sci-fi, horror, etc.)
4. **Advanced analytics** — Track buzz patterns, average survival times, judge "harshness" scores
5. **Multi-language support** — i18n for UI text (messages, buttons, etc.)
6. **Accessibility audit** — Comprehensive review of screen reader support, keyboard navigation, color contrast
7. **Progressive Web App** — Service worker for offline support, installable app

---

## Summary

This design consolidates six major features (bug fix, countdown, QR codes, sounds, UI improvements, testing tool) into one coherent UX upgrade. It maintains SpecIdol's vanilla-JS philosophy while adding meaningful enhancements to gameplay flow, audience engagement, and testing capabilities.

**Key wins:**
- **Simpler joining** — Scan QR, play immediately (no modals, no role pickers)
- **Better gameplay flow** — Countdown creates anticipation, sounds add excitement
- **Improved controller UX** — 2-column story management, clearer button hierarchy
- **Testing support** — Judge-test page enables rapid iteration without physical devices
- **Maintains simplicity** — One tiny vendored library, no build step, no frameworks

**Total additions:** ~1000-1500 lines (estimated) across all files, keeps codebase under 5.5K lines total.

---

## Approval

**Design approved:** 2026-05-02
**Approved by:** Marty (user)
**Next step:** Write implementation plan

---

*End of design document*
