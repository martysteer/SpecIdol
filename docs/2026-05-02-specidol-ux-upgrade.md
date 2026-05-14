# SpecIdol UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add QR joining, round start countdown, sound effects, improved story management UI, buzz time tracking, and judge reset bug fix to SpecIdol while maintaining vanilla-JS architecture.

**Architecture:** Client-side enhancements (QR generation, Web Audio sounds, countdown animation) + minimal server changes (judge sound assignment, buzz history tracking, new message types). Vendor qrcode-generator library locally, keep relay.py simple.

**Tech Stack:** Vanilla JS/HTML/CSS, Python WebSockets, qrcode-generator (kazuhikoarase), Web Audio API

---

## File Structure

### New Files

- **`www/lib/qrcode-generator.js`** — Vendored QR code generation library (kazuhikoarase)
- **`www/sounds.js`** — Web Audio API sound generators (5 buzz variations, fanfare, AHOOGA) and playback logic
- **`www/judge-test.html`** — Testing dashboard for simulating multiple judges

### Modified Files

- **`server/relay.py`** — Add session state fields (judge_sounds, audience_qr_visible, buzz_history), new message handlers (countdown_start, toggle_audience_qr), modify buzz message (add buzz_count, timestamp)
- **`www/app.js`** — Add QR generation helpers, countdown rendering, sound playback coordination
- **`www/style.css`** — Layout changes (2-column grids, timer header positioning, QR overlay styles), button styling updates
- **`www/index.html`** — Simplify homepage (session cards with QR, remove modals, direct audience joining)
- **`www/control.html`** — 2-column story management UI, round controls updates (rename reset, remove speed, add QR toggle), timer to header
- **`www/judge.html`** — Countdown display, timer to header, reset bug fix (handle countdown_start)
- **`www/audience.html`** — Countdown display, timer to header, QR overlay with toggle visibility

---

## Task 1: Vendor QR Code Library

**Files:**
- Create: `www/lib/qrcode-generator.js`

- [ ] **Step 1: Download qrcode-generator library**

Visit: https://github.com/kazuhikoarase/qrcode-generator/releases
Download: `qrcode.js` (standalone vanilla JS version, ~3KB minified)

Alternatively, use CDN source and save locally:
```bash
curl -o www/lib/qrcode-generator.js https://unpkg.com/qrcode-generator@1.4.4/qrcode.js
```

- [ ] **Step 2: Verify library loads**

Create test HTML file to verify:
```html
<!DOCTYPE html>
<html>
<head>
    <title>QR Test</title>
    <script src="lib/qrcode-generator.js"></script>
</head>
<body>
    <div id="qr"></div>
    <script>
        const qr = qrcode(0, 'M');
        qr.addData('TEST');
        qr.make();
        document.getElementById('qr').innerHTML = qr.createImgTag(4);
        console.log('QR library loaded successfully');
    </script>
</body>
</html>
```

Open in browser, verify QR code image appears and console shows success message.

- [ ] **Step 3: Commit**

```bash
git add www/lib/qrcode-generator.js
git commit -m "chore: vendor qrcode-generator library (kazuhikoarase)"
```

---

## Task 2: Server-Side Session State Extensions

**Files:**
- Modify: `server/relay.py:22-47` (create_new_session function)

- [ ] **Step 1: Add new session state fields**

In `create_new_session()` function, add three new fields to the returned dict:

```python
def create_new_session(code):
    """Create a new session with the given code"""
    return {
        "code": code,
        "config": {
            "timer_duration": 120,
            "speed_options": [1, 2, 3]
        },
        "clients": {},
        "stories": [],
        "current_round": {
            "story_index": None,
            "title": None,
            "text": None,
            "start_time": None,
            "speed": 1,
            "paused": False,
            "pause_time": None,
            "elapsed_at_pause": 0,
            "buzzes": [],
            "status": "waiting"
        },
        "history": [],
        "judge_slots": {},
        "next_judge_id": 1,
        # NEW FIELDS
        "judge_sounds": {},  # {judge_id: sound_index (0-4)}
        "audience_qr_visible": True,  # Default: QR visible
        "buzz_history": []  # [{judge_id, judge_name, time, timestamp}, ...]
    }
```

- [ ] **Step 2: Verify server starts without errors**

Run: `python server/relay.py`
Expected: No errors, server starts on port 8765

- [ ] **Step 3: Commit**

```bash
git add server/relay.py
git commit -m "feat: add session state fields for sounds, QR toggle, buzz history"
```

---

## Task 3: Judge Sound Assignment on Join

**Files:**
- Modify: `server/relay.py:115-141` (join message handler)

- [ ] **Step 1: Assign random sound on judge join**

In the `join` message handler, after creating judge slot, assign random sound:

```python
if role == "judge":
    # Auto-assign next judge ID
    judge_id = session["next_judge_id"]
    session["next_judge_id"] += 1
    judge_name = data.get("name") or f"Judge {judge_id}"
    judge_name = judge_name[:20]  # max 20 chars
    session["judge_slots"][judge_id] = {"websocket": websocket, "name": judge_name}
    session["clients"][websocket] = {"role": "judge", "judge_id": judge_id}

    # NEW: Assign random sound if not already assigned (reconnection case)
    if judge_id not in session["judge_sounds"]:
        session["judge_sounds"][judge_id] = random.randint(0, 4)
```

- [ ] **Step 2: Include sound assignments in session_state broadcast**

Find the `session_state` response in the join handler (around line 144-160). Modify to include judge_sounds:

```python
await websocket.send(json.dumps({
    "type": "session_state",
    "data": {
        "code": session["code"],
        "config": session["config"],
        "stories": session["stories"],
        "current_round": session["current_round"],
        "connected_judges": connected_judges,
        "judge_sounds": session["judge_sounds"],  # NEW
        "audience_qr_visible": session["audience_qr_visible"],  # NEW
        "role": role,
        "judge_id": judge_id if role == "judge" else None
    }
}))
```

- [ ] **Step 3: Broadcast judge_update with sound assignments**

Find where `judge_update` is broadcast (after judge joins). Add judge_sounds to broadcast:

```python
# Broadcast judge list update to all clients in session
await broadcast_to_session(session, {
    "type": "judge_update",
    "data": {
        "judges": connected_judges,
        "judge_sounds": session["judge_sounds"]  # NEW
    }
})
```

- [ ] **Step 4: Test judge join**

Run server, create session, join as judge, verify:
- Console shows judge_sounds in session_state message
- Sound index is 0-4

- [ ] **Step 5: Commit**

```bash
git add server/relay.py
git commit -m "feat: assign random buzz sound (0-4) to judges on join"
```

---

## Task 4: Countdown Start Message Handler

**Files:**
- Modify: `server/relay.py:49-50` (CONTROLLER_ONLY set)
- Modify: `server/relay.py` (add countdown_start handler after join handler)

- [ ] **Step 1: Add countdown_start to CONTROLLER_ONLY**

```python
CONTROLLER_ONLY = {"add_story", "remove_story", "round_start", "speed_change",
                    "pause", "resume", "reset_round", "text_advance", "import_session",
                    "eject_judges", "shutdown_audience", "delete_session", "countdown_start"}  # NEW
```

- [ ] **Step 2: Add countdown_start message handler**

After the `join` handler (around line 170), add new handler:

```python
elif msg_type == "countdown_start":
    story_index = data.get("story_index")
    if story_index is None or story_index >= len(session["stories"]):
        await websocket.send(json.dumps({
            "type": "error",
            "data": {"message": "Invalid story index"}
        }))
        return

    story = session["stories"][story_index]

    # Reset round state
    session["current_round"] = {
        "story_index": story_index,
        "title": story["title"],
        "text": story["text"],
        "start_time": None,  # Will be set after countdown
        "speed": 1,
        "paused": False,
        "pause_time": None,
        "elapsed_at_pause": 0,
        "buzzes": [],
        "status": "countdown"
    }

    # Clear buzzed judges from previous round
    session["current_round"]["buzzes"] = []

    # Broadcast countdown_start to all clients
    await broadcast_to_session(session, {
        "type": "countdown_start",
        "data": {
            "story_index": story_index,
            "story_title": story["title"],
            "story_text": story["text"]
        }
    })
```

- [ ] **Step 3: Define broadcast_to_session helper if not exists**

Check if `broadcast_to_session()` function exists. If not, add after `get_connected_judges()`:

```python
async def broadcast_to_session(session, message):
    """Send message to all clients in a session"""
    if session:
        websockets_to_send = [ws for ws in session["clients"].keys()]
        if websockets_to_send:
            await asyncio.gather(
                *[ws.send(json.dumps(message)) for ws in websockets_to_send],
                return_exceptions=True
            )
```

- [ ] **Step 4: Test countdown_start**

Start server, create session, add story, send countdown_start message from controller.
Verify all clients receive countdown_start broadcast.

- [ ] **Step 5: Commit**

```bash
git add server/relay.py
git commit -m "feat: add countdown_start message handler and broadcast"
```

---

## Task 5: Modify Buzz Message (Add Count and Timestamp)

**Files:**
- Modify: `server/relay.py` (buzz message handler, around line 250-280)

- [ ] **Step 1: Update buzz handler to add buzz_count and timestamp**

Find the `buzz` message handler. Modify to:

```python
elif msg_type == "buzz":
    client_info = session["clients"].get(websocket)
    if not client_info or client_info.get("role") != "judge":
        return

    judge_id = client_info.get("judge_id")
    if not judge_id:
        return

    # Check if already buzzed
    if judge_id in [b["judge_id"] for b in session["current_round"]["buzzes"]]:
        return

    # Calculate elapsed time (reuse existing timer logic)
    start_time = session["current_round"].get("start_time")
    if start_time:
        elapsed = time.time() - start_time + session["current_round"].get("elapsed_at_pause", 0)
    else:
        elapsed = 0

    # Add buzz to round state
    buzz_data = {
        "judge_id": judge_id,
        "time": elapsed
    }
    session["current_round"]["buzzes"].append(buzz_data)

    # Calculate buzz count (how many judges have buzzed so far)
    buzz_count = len(session["current_round"]["buzzes"])

    # Add to buzz_history
    judge_name = session["judge_slots"][judge_id]["name"]
    timestamp = datetime.utcnow().isoformat() + "Z"
    session["buzz_history"].append({
        "judge_id": judge_id,
        "judge_name": judge_name,
        "time": elapsed,
        "timestamp": timestamp
    })

    # Broadcast buzz with count and timestamp
    await broadcast_to_session(session, {
        "type": "buzz",
        "data": {
            "judge_id": judge_id,
            "buzz_count": buzz_count,
            "timestamp": timestamp
        }
    })
```

- [ ] **Step 2: Test buzz with count**

Create session, start round, have judges buzz in sequence.
Verify buzz messages include buzz_count (1, 2, 3, ...)

- [ ] **Step 3: Commit**

```bash
git add server/relay.py
git commit -m "feat: add buzz_count and timestamp to buzz messages"
```

---

## Task 6: Toggle Audience QR Message Handler

**Files:**
- Modify: `server/relay.py:49-50` (CONTROLLER_ONLY set)
- Modify: `server/relay.py` (add toggle_audience_qr handler)

- [ ] **Step 1: Add toggle_audience_qr to CONTROLLER_ONLY**

```python
CONTROLLER_ONLY = {"add_story", "remove_story", "round_start", "speed_change",
                    "pause", "resume", "reset_round", "text_advance", "import_session",
                    "eject_judges", "shutdown_audience", "delete_session", "countdown_start",
                    "toggle_audience_qr"}  # NEW
```

- [ ] **Step 2: Add toggle_audience_qr handler**

After countdown_start handler:

```python
elif msg_type == "toggle_audience_qr":
    visible = data.get("visible", True)
    session["audience_qr_visible"] = visible

    # Broadcast only to audience clients
    audience_clients = [ws for ws, info in session["clients"].items()
                        if info.get("role") == "audience"]

    message = json.dumps({
        "type": "toggle_audience_qr",
        "data": {"visible": visible}
    })

    await asyncio.gather(
        *[ws.send(message) for ws in audience_clients],
        return_exceptions=True
    )
```

- [ ] **Step 3: Test QR toggle**

Create session, join as audience, send toggle_audience_qr from controller.
Verify only audience clients receive message.

- [ ] **Step 4: Commit**

```bash
git add server/relay.py
git commit -m "feat: add toggle_audience_qr message handler"
```

---

## Task 7: Web Audio Sound Generators

**Files:**
- Create: `www/sounds.js`

- [ ] **Step 1: Create sounds.js with AudioContext setup**

```javascript
// Web Audio API sound generators for SpecIdol

let audioContext = null;

// Lazy initialization (avoids autoplay policy issues)
function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn('Web Audio API not supported, sounds disabled');
            return null;
        }
        audioContext = new AudioContextClass();
    }
    return audioContext;
}

// Check if user prefers reduced motion (skip sounds if so)
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 2: Add buzz sound generators (5 variations)**

```javascript
// Buzz sound variations (0-4)
function playBuzz(soundIndex, repeatCount = 1) {
    if (prefersReducedMotion()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const duration = 0.2; // 200ms per buzz
    const gap = 0.1; // 100ms gap between repeats

    for (let i = 0; i < repeatCount; i++) {
        const startTime = ctx.currentTime + (i * (duration + gap));

        switch(soundIndex) {
            case 0:
                playBuzz0(ctx, startTime, duration);
                break;
            case 1:
                playBuzz1(ctx, startTime, duration);
                break;
            case 2:
                playBuzz2(ctx, startTime, duration);
                break;
            case 3:
                playBuzz3(ctx, startTime, duration);
                break;
            case 4:
                playBuzz4(ctx, startTime, duration);
                break;
        }
    }
}

// Buzz 0: Sawtooth wave (220 Hz, harsh)
function playBuzz0(ctx, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 220;

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

// Buzz 1: Square wave (180 Hz, aggressive)
function playBuzz1(ctx, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 180;

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

// Buzz 2: Sawtooth + square mix (200 Hz, distorted)
function playBuzz2(ctx, startTime, duration) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 200;
    osc2.type = 'square';
    osc2.frequency.value = 200;

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
}

// Buzz 3: Triangle wave + noise (240 Hz, mechanical)
function playBuzz3(ctx, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 240;

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

// Buzz 4: Pulse width modulation (190 Hz, warbling)
function playBuzz4(ctx, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = 190;

    // Warble effect
    osc.frequency.setValueAtTime(190, startTime);
    osc.frequency.exponentialRampToValueAtTime(150, startTime + duration);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}
```

- [ ] **Step 3: Add victory fanfare**

```javascript
// Victory fanfare: C4 → E4 → G4 → C5 arpeggio
function playVictoryFanfare() {
    if (prefersReducedMotion()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const noteDuration = 0.35;

    notes.forEach((freq, i) => {
        const startTime = ctx.currentTime + (i * noteDuration);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
    });
}
```

- [ ] **Step 4: Add AHOOGA sound**

```javascript
// AHOOGA: Classic car horn (frequency sweep 400→220 Hz)
function playAhooga() {
    if (prefersReducedMotion()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const duration = 0.8;
    const startTime = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, startTime);
    osc.frequency.exponentialRampToValueAtTime(220, startTime + duration);

    gain.gain.setValueAtTime(0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}
```

- [ ] **Step 5: Add final combo function**

```javascript
// Final combo: All judge sounds overlapping + AHOOGA
function playFinalCombo(judgeSounds) {
    if (prefersReducedMotion()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Play all judge sounds with 50ms offset
    judgeSounds.forEach((soundIndex, i) => {
        setTimeout(() => {
            playBuzz(soundIndex, 1);
        }, i * 50);
    });

    // Play AHOOGA after all buzzes start
    setTimeout(() => {
        playAhooga();
    }, judgeSounds.length * 50 + 100);
}
```

- [ ] **Step 6: Test sounds in browser console**

Open browser console, load sounds.js, test:
```javascript
playBuzz(0, 1); // Buzz 0, once
playBuzz(2, 3); // Buzz 2, three times
playVictoryFanfare();
playAhooga();
playFinalCombo([0, 2, 4]);
```

Verify sounds play correctly.

- [ ] **Step 7: Commit**

```bash
git add www/sounds.js
git commit -m "feat: add Web Audio API sound generators (buzzes, fanfare, AHOOGA)"
```

---

## Task 8: QR Code Generation Helpers in app.js

**Files:**
- Modify: `www/app.js` (add after escapeHtml function)

- [ ] **Step 1: Add QR generation helper function**

```javascript
// Generate QR code as data URL
function generateQRCode(text, size = 200) {
    try {
        // Check if qrcode library is loaded
        if (typeof qrcode === 'undefined') {
            console.error('QR code library not loaded');
            return null;
        }

        const qr = qrcode(0, 'M'); // Type 0 (auto), error correction level M
        qr.addData(text);
        qr.make();

        // Generate as data URL (base64 image)
        const cellSize = Math.floor(size / qr.getModuleCount());
        const imgTag = qr.createDataURL(cellSize);

        return imgTag;
    } catch (e) {
        console.error('QR generation failed:', e);
        return null;
    }
}

// Create QR code element (img tag or fallback text)
function createQRElement(url, sessionCode, size = 200) {
    const container = document.createElement('div');
    container.className = 'qr-code';

    const dataURL = generateQRCode(url, size);

    if (dataURL) {
        const img = document.createElement('img');
        img.src = dataURL;
        img.alt = `Scan to join session ${sessionCode}`;
        img.width = size;
        img.height = size;
        container.appendChild(img);
    } else {
        // Fallback: show session code as text
        const fallback = document.createElement('div');
        fallback.className = 'qr-fallback';
        fallback.textContent = `Session: ${sessionCode}`;
        container.appendChild(fallback);
    }

    return container;
}
```

- [ ] **Step 2: Test QR generation in browser**

Open control.html in browser, test in console:
```javascript
const qrEl = createQRElement('http://localhost:8000/index.html#TEST', 'TEST', 200);
document.body.appendChild(qrEl);
```

Verify QR code appears.

- [ ] **Step 3: Commit**

```bash
git add www/app.js
git commit -m "feat: add QR code generation helpers to app.js"
```

---

## Task 9: Countdown Rendering in app.js

**Files:**
- Modify: `www/app.js` (add countdown class)

- [ ] **Step 1: Add Countdown class**

```javascript
// Countdown animation (3, 2, 1, GO)
class Countdown {
    constructor(containerId, onComplete) {
        this.container = document.getElementById(containerId);
        this.onComplete = onComplete;
        this.currentNumber = 3;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    start() {
        this.showNumber(this.currentNumber);
    }

    showNumber(num) {
        if (!this.container) return;

        const display = document.createElement('div');
        display.className = 'countdown-number';
        display.textContent = num === 0 ? 'GO!' : num;

        // Accessibility
        display.setAttribute('aria-live', 'polite');

        this.container.innerHTML = '';
        this.container.appendChild(display);

        // Animation (skip if prefers-reduced-motion)
        if (!this.prefersReducedMotion) {
            display.style.animation = 'countdownPulse 1s ease-in-out';
        }

        // Next number after 1 second (or GO after 0.3s)
        const delay = num === 0 ? 300 : 1000;

        setTimeout(() => {
            if (num > 0) {
                this.currentNumber--;
                this.showNumber(this.currentNumber);
            } else {
                // Countdown complete
                this.container.innerHTML = '';
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, delay);
    }
}
```

- [ ] **Step 2: Test countdown in browser**

Test in console:
```javascript
const countdown = new Countdown('test-container', () => {
    console.log('Countdown complete!');
});
countdown.start();
```

Verify 3, 2, 1, GO appears in sequence.

- [ ] **Step 3: Commit**

```bash
git add www/app.js
git commit -m "feat: add Countdown class for 3-2-1-GO animation"
```

---

## Task 10: Countdown Animation Styles

**Files:**
- Modify: `www/style.css` (add countdown styles and animation)

- [ ] **Step 1: Add countdown animation keyframes**

```css
/* Countdown animation */
@keyframes countdownPulse {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    40% {
        transform: scale(1.2);
        opacity: 1;
    }
    60% {
        transform: scale(1.0);
        opacity: 1;
    }
    100% {
        opacity: 1;
    }
}

/* Countdown number display */
.countdown-number {
    font-family: var(--font-heading);
    font-size: 8rem;
    color: var(--neon-yellow);
    text-shadow: 0 0 20px var(--neon-yellow), 0 0 40px var(--neon-yellow);
    text-align: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
    .countdown-number {
        animation: none !important;
    }

    @keyframes countdownPulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
    }
}
```

- [ ] **Step 2: Test countdown animation**

Open any page, trigger countdown, verify animation works (or skips if prefers-reduced-motion enabled).

- [ ] **Step 3: Commit**

```bash
git add www/style.css
git commit -m "style: add countdown animation styles"
```

---

## Task 11: Judge Page - Countdown and Reset Fix

**Files:**
- Modify: `www/judge.html` (add countdown container, handle countdown_start message)

- [ ] **Step 1: Add countdown container to HTML**

In judge.html, add countdown container before existing content:

```html
<div id="countdown-container"></div>
```

Add styles in `<style>` block:

```css
#countdown-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
}
```

- [ ] **Step 2: Add countdown_start message handler**

In the inline `<script>`, add message handler:

```javascript
client.on('countdown_start', (data) => {
    // Reset judge state
    isBuzzed = false;
    document.getElementById('buzz-button').disabled = true;
    document.getElementById('status').textContent = 'Waiting for countdown...';
    document.getElementById('status').className = 'status waiting';

    // Clear any previous buzzed indicator
    const buzzedEl = document.getElementById('buzzed-indicator');
    if (buzzedEl) {
        buzzedEl.remove();
    }

    // Start countdown
    const countdown = new Countdown('countdown-container', () => {
        // Countdown complete - activate buzz button
        document.getElementById('buzz-button').disabled = false;
        document.getElementById('status').textContent = 'Ready to buzz';
        document.getElementById('status').className = 'status ready';
    });
    countdown.start();
});
```

- [ ] **Step 3: Load sounds.js script**

Add before closing `</body>`:

```html
<script src="sounds.js"></script>
```

- [ ] **Step 4: Test judge reset and countdown**

Create session, join as judge, buzz out, start new round.
Verify:
- Judge screen resets (clears buzzed state)
- Shows "Waiting for countdown..."
- Countdown plays (3, 2, 1, GO)
- Button activates after countdown

- [ ] **Step 5: Commit**

```bash
git add www/judge.html
git commit -m "fix: reset judge state on countdown_start, add countdown display"
```

---

## Task 12: Judge Page - Move Timer to Header

**Files:**
- Modify: `www/judge.html` (move timer display to header)

- [ ] **Step 1: Remove old timer from center**

Find and remove the large center timer element (usually a `<div id="timer">` in main content area).

- [ ] **Step 2: Add timer to header**

In the header section, add timer after header-left:

```html
<header>
    <div class="header-left">
        <span class="page-label">JUDGING</span>
        <span class="session-info" id="session-info"></span>
    </div>
    <div class="header-timer" id="header-timer">0:00.0</div>
    <div class="header-right">
        <span id="judge-name-display"></span>
    </div>
</header>
```

- [ ] **Step 3: Add timer styles**

In `<style>` block:

```css
.header-timer {
    font-family: var(--font-mono);
    font-size: 2rem;
    color: var(--neon-green);
    text-shadow: 0 0 10px var(--neon-green);
    padding: 1rem;
    display: flex;
    align-items: center;
}

@media (max-width: 900px) {
    .header-timer {
        font-size: 1.5rem;
        padding: 0.5rem;
    }
}
```

- [ ] **Step 4: Update timer rendering code**

Find timer update code (usually in a `setInterval` or timer callback). Change to update `#header-timer` instead of old timer element.

Example:
```javascript
function updateTimer() {
    const elapsed = /* calculate elapsed time */;
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    const deciseconds = Math.floor((elapsed % 1) * 10);
    document.getElementById('header-timer').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}.${deciseconds}`;
}
```

- [ ] **Step 5: Test timer in header**

Start round, verify timer appears in header (not center), updates correctly.

- [ ] **Step 6: Commit**

```bash
git add www/judge.html
git commit -m "refactor: move timer from center to header on judge page"
```

---

## Task 13: Audience Page - Countdown and Timer

**Files:**
- Modify: `www/audience.html` (add countdown, move timer to header)

- [ ] **Step 1: Add countdown container**

Add countdown container at top of body:

```html
<div id="countdown-container"></div>
```

With styles:

```css
#countdown-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
}
```

- [ ] **Step 2: Add countdown_start handler**

```javascript
client.on('countdown_start', (data) => {
    // Start countdown
    const countdown = new Countdown('countdown-container', () => {
        // Countdown complete - timer will start automatically
        console.log('Countdown complete, round starting');
    });
    countdown.start();
});
```

- [ ] **Step 3: Move timer to header**

Remove old timer, add to header:

```html
<header>
    <div class="header-left">
        <span class="page-label">WATCHING</span>
        <span class="session-info" id="session-info"></span>
    </div>
    <div class="header-timer" id="header-timer">0:00.0</div>
    <div class="header-right">
        <!-- Session stats -->
    </div>
</header>
```

Add same `.header-timer` styles as judge page.

- [ ] **Step 4: Update timer rendering**

Change timer update code to target `#header-timer`.

- [ ] **Step 5: Load sounds.js**

```html
<script src="sounds.js"></script>
```

- [ ] **Step 6: Test countdown and timer**

Join as audience, start round, verify countdown plays and timer appears in header.

- [ ] **Step 7: Commit**

```bash
git add www/audience.html
git commit -m "feat: add countdown display and move timer to header on audience page"
```

---

## Task 14: Audience Page - QR Code Overlay with Toggle

**Files:**
- Modify: `www/audience.html` (add QR overlay, handle toggle message)

- [ ] **Step 1: Add QR overlay container**

Add after countdown container:

```html
<div id="qr-overlay" class="qr-overlay"></div>
```

With styles:

```css
.qr-overlay {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid var(--neon-green);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 0 20px var(--neon-green);
    z-index: 500;
}

.qr-overlay img {
    display: block;
}

.qr-overlay.hidden {
    display: none;
}

@media (max-width: 900px) {
    .qr-overlay {
        bottom: 0.5rem;
        right: 0.5rem;
        padding: 0.5rem;
    }
}
```

- [ ] **Step 2: Generate and display QR on session join**

In session_state handler:

```javascript
client.on('session_state', (data) => {
    // ... existing code ...

    // Generate QR code for audience joining
    const sessionCode = data.code;
    const joinURL = `${window.location.origin}/index.html#${sessionCode}`;
    const qrElement = createQRElement(joinURL, sessionCode, 200);

    const overlay = document.getElementById('qr-overlay');
    overlay.innerHTML = '';
    overlay.appendChild(qrElement);

    // Set initial visibility from session state
    if (data.audience_qr_visible === false) {
        overlay.classList.add('hidden');
    }
});
```

- [ ] **Step 3: Add toggle_audience_qr handler**

```javascript
client.on('toggle_audience_qr', (data) => {
    const overlay = document.getElementById('qr-overlay');
    if (data.visible) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
});
```

- [ ] **Step 4: Test QR overlay and toggle**

Join as audience, verify QR appears bottom-right.
From controller, toggle visibility, verify QR shows/hides.

- [ ] **Step 5: Commit**

```bash
git add www/audience.html
git commit -m "feat: add QR code overlay with controller toggle on audience page"
```

---

## Task 15: Buzz Sound Playback on All Clients

**Files:**
- Modify: `www/judge.html`, `www/audience.html`, `www/control.html` (add buzz message handlers for sound)

- [ ] **Step 1: Add buzz sound handler to judge.html**

```javascript
client.on('buzz', (data) => {
    // ... existing buzz handling ...

    // Play buzz sound
    const judgeId = data.judge_id;
    const buzzCount = data.buzz_count;

    // Look up sound index from session state
    if (client.sessionState && client.sessionState.judge_sounds) {
        const soundIndex = client.sessionState.judge_sounds[judgeId];
        if (soundIndex !== undefined) {
            playBuzz(soundIndex, buzzCount);
        }
    }

    // Check if all judges have buzzed (final combo)
    const totalJudges = Object.keys(client.sessionState.judge_sounds || {}).length;
    if (buzzCount === totalJudges) {
        // Play final combo
        const allSounds = Object.values(client.sessionState.judge_sounds);
        setTimeout(() => {
            playFinalCombo(allSounds);
        }, 500);
    }
});
```

- [ ] **Step 2: Store session state in client**

In SpecIdolClient class (app.js), add:

```javascript
handleMessage(message) {
    // Store session state for reference
    if (message.type === 'session_state' || message.type === 'judge_update') {
        this.sessionState = this.sessionState || {};
        if (message.data.judge_sounds) {
            this.sessionState.judge_sounds = message.data.judge_sounds;
        }
    }

    const handler = this.messageHandlers[message.type];
    if (handler) {
        handler(message.data);
    } else {
        console.log('Unhandled message type:', message.type, message.data);
    }
}
```

- [ ] **Step 3: Add same buzz handler to audience.html and control.html**

Copy buzz sound playback code to audience and controller pages.

- [ ] **Step 4: Test buzz sounds**

Start round, have judges buzz in sequence.
Verify sounds play on all clients (judge, audience, controller).
Verify final combo plays when all judges buzz.

- [ ] **Step 5: Commit**

```bash
git add www/judge.html www/audience.html www/control.html www/app.js
git commit -m "feat: play buzz sounds on all clients with count progression"
```

---

## Task 16: Victory Fanfare on Timer Expiry

**Files:**
- Modify: `www/judge.html`, `www/audience.html`, `www/control.html` (add victory detection and fanfare)

- [ ] **Step 1: Add victory fanfare to judge.html**

Find where timer expiry is detected (usually in timer update loop or victory message handler):

```javascript
client.on('victory', (data) => {
    // ... existing victory handling ...

    // Play victory fanfare
    playVictoryFanfare();
});
```

If victory detection is client-side (timer reaches duration), add:

```javascript
function checkVictory() {
    const elapsed = /* calculate elapsed time */;
    const duration = client.sessionState.config.timer_duration;

    if (elapsed >= duration) {
        // Timer expired, check if all judges buzzed
        const totalJudges = Object.keys(client.sessionState.judge_sounds || {}).length;
        const buzzedCount = /* get buzzed count from state */;

        if (buzzedCount < totalJudges) {
            // Victory! Not all judges buzzed
            playVictoryFanfare();
        }
    }
}
```

- [ ] **Step 2: Add same logic to audience.html and control.html**

Copy victory fanfare playback to other pages.

- [ ] **Step 3: Test victory fanfare**

Start round, let timer expire without all judges buzzing.
Verify fanfare plays on all clients.

- [ ] **Step 4: Commit**

```bash
git add www/judge.html www/audience.html www/control.html
git commit -m "feat: play victory fanfare when timer expires (not all judges buzzed)"
```

---

## Task 17: Controller Page - Add QR Code for Judges

**Files:**
- Modify: `www/control.html` (add QR to round controls section)

- [ ] **Step 1: Add QR container to round controls**

In round controls section, add QR container:

```html
<div id="judge-qr-container" class="judge-qr"></div>
```

With styles:

```css
.judge-qr {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid var(--neon-yellow);
    border-radius: 8px;
    padding: 0.5rem;
    box-shadow: 0 0 10px var(--neon-yellow);
}

.judge-qr img {
    display: block;
}

@media (max-width: 900px) {
    .judge-qr {
        position: static;
        margin-top: 1rem;
    }
}
```

- [ ] **Step 2: Generate judge QR on session join**

```javascript
client.on('session_state', (data) => {
    // ... existing code ...

    // Generate QR for judge joining
    const sessionCode = data.code;
    const judgeURL = `${window.location.origin}/judge.html#${sessionCode}`;
    const qrElement = createQRElement(judgeURL, sessionCode, 200);

    const container = document.getElementById('judge-qr-container');
    container.innerHTML = '';
    container.appendChild(qrElement);
});
```

- [ ] **Step 3: Test judge QR**

Open controller, verify QR appears bottom-right of round controls.
Scan with phone, verify opens judge page with correct session.

- [ ] **Step 4: Commit**

```bash
git add www/control.html
git commit -m "feat: add judge QR code to controller round controls"
```

---

## Task 18: Controller Page - QR Toggle Button

**Files:**
- Modify: `www/control.html` (add toggle button in round controls)

- [ ] **Step 1: Add toggle button to round controls**

Add button after other round control buttons:

```html
<button id="toggle-qr-btn" class="btn btn-secondary">Hide Audience QR</button>
```

With styles:

```css
.btn-secondary {
    background: var(--neon-yellow);
    color: var(--black);
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
}

.btn-secondary:hover {
    filter: brightness(1.2);
}
```

- [ ] **Step 2: Add click handler**

```javascript
let audienceQRVisible = true;

document.getElementById('toggle-qr-btn').addEventListener('click', () => {
    audienceQRVisible = !audienceQRVisible;

    client.send('toggle_audience_qr', { visible: audienceQRVisible });

    const btn = document.getElementById('toggle-qr-btn');
    btn.textContent = audienceQRVisible ? 'Hide Audience QR' : 'Show Audience QR';
});
```

- [ ] **Step 3: Initialize button state from session**

```javascript
client.on('session_state', (data) => {
    // ... existing code ...

    // Set initial QR visibility state
    audienceQRVisible = data.audience_qr_visible !== false;
    const btn = document.getElementById('toggle-qr-btn');
    btn.textContent = audienceQRVisible ? 'Hide Audience QR' : 'Show Audience QR';
});
```

- [ ] **Step 4: Test QR toggle**

Click toggle button, verify:
- Button text changes
- Audience screens hide/show QR
- State persists (new audience members see correct state)

- [ ] **Step 5: Commit**

```bash
git add www/control.html
git commit -m "feat: add audience QR toggle button to controller"
```

---

## Task 19: Controller Page - Update Round Controls (Remove Speed, Rename Reset, De-emphasize Pause)

**Files:**
- Modify: `www/control.html` (update button layout and styles)

- [ ] **Step 1: Remove speed control buttons**

Find and remove speed buttons (1x, 2x, 3x) and their event handlers.

- [ ] **Step 2: Rename Reset to Close Round**

Change button text and confirmation message:

```html
<button id="close-round-btn" class="btn btn-danger">Close Round</button>
```

Update click handler:

```javascript
document.getElementById('close-round-btn').addEventListener('click', () => {
    showConfirmModal('Close this round early?', (confirmed) => {
        if (confirmed) {
            client.send('reset_round');
        }
    });
});
```

- [ ] **Step 3: De-emphasize Pause button**

Update pause button styles:

```css
#pause-btn {
    background: #666;
    color: #ccc;
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    margin-top: 0.5rem;
}

#pause-btn:hover {
    background: #777;
}
```

- [ ] **Step 4: Reorganize button layout**

Group buttons visually:

```html
<!-- Primary actions -->
<div class="primary-actions">
    <button id="start-round-btn" class="btn btn-primary">Start Round</button>
    <button id="advance-text-btn" class="btn btn-accent">Advance Text</button>
</div>

<!-- Secondary actions -->
<div class="secondary-actions">
    <button id="pause-btn" class="btn btn-muted">Pause</button>
    <button id="close-round-btn" class="btn btn-danger">Close Round</button>
</div>
```

With styles:

```css
.primary-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.secondary-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.btn-primary {
    background: var(--neon-green);
    font-size: 1.2rem;
    padding: 1rem 2rem;
}

.btn-accent {
    background: var(--neon-yellow);
    font-size: 1.2rem;
    padding: 1rem 2rem;
}

.btn-danger {
    background: var(--neon-red);
    font-size: 1rem;
    padding: 0.6rem 1.2rem;
}

.btn-muted {
    background: #666;
    color: #ccc;
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
}
```

- [ ] **Step 5: Test controller buttons**

Verify:
- Speed controls gone
- Reset → Close Round (confirmation works)
- Pause visually de-emphasized
- Button hierarchy clear (Start/Advance prominent)

- [ ] **Step 6: Commit**

```bash
git add www/control.html
git commit -m "refactor: remove speed controls, rename reset to close round, de-emphasize pause"
```

---

## Task 20: Controller Page - 2-Column Story Management UI

**Files:**
- Modify: `www/control.html` (restructure story management section)

- [ ] **Step 1: Create 2-column layout structure**

Replace existing story management section with:

```html
<section id="story-management">
    <h2>Story Management</h2>
    <div class="story-columns">
        <!-- Left column: Story queue -->
        <div class="story-queue">
            <h3>Story Queue</h3>
            <div id="story-list"></div>
            <div class="queue-actions">
                <button id="add-story-btn" class="btn btn-secondary">Add Story</button>
                <details id="import-disclosure">
                    <summary>Import Session</summary>
                    <div class="import-form">
                        <textarea id="import-json" placeholder="Paste session JSON here"></textarea>
                        <button id="import-btn" class="btn btn-secondary">Import</button>
                    </div>
                </details>
                <button id="export-btn" class="btn btn-secondary">Export Session</button>
            </div>
        </div>

        <!-- Right column: Story edit form -->
        <div class="story-edit" id="story-edit-form" style="display: none;">
            <h3>Edit Story</h3>
            <input type="text" id="edit-title" placeholder="Story title">
            <textarea id="edit-text" placeholder="Story text"></textarea>
            <div class="edit-actions">
                <button id="update-story-btn" class="btn btn-primary" disabled>Update</button>
                <button id="remove-story-btn" class="btn btn-danger">Remove</button>
            </div>
        </div>
    </div>
</section>
```

- [ ] **Step 2: Add 2-column grid styles**

```css
.story-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
}

.story-queue h3,
.story-edit h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: var(--neon-yellow);
}

#story-list {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 1rem;
    border: 1px solid var(--neon-green);
    padding: 0.5rem;
}

.story-item {
    padding: 0.5rem;
    cursor: pointer;
    border-bottom: 1px solid #333;
}

.story-item:hover {
    background: rgba(0, 255, 0, 0.1);
}

.story-item.selected {
    background: rgba(0, 255, 0, 0.2);
    border-left: 4px solid var(--neon-green);
}

.queue-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.import-form {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
}

.import-form textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 0.5rem;
}

.story-edit input,
.story-edit textarea {
    width: 100%;
    margin-bottom: 1rem;
    padding: 0.5rem;
    font-family: var(--font-mono);
    background: var(--black);
    border: 1px solid var(--neon-green);
    color: var(--neon-green);
}

.story-edit textarea {
    min-height: 300px;
    resize: vertical;
}

.edit-actions {
    display: flex;
    gap: 1rem;
}

@media (max-width: 900px) {
    .story-columns {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 3: Implement story selection and form population**

```javascript
let selectedStoryIndex = null;
let formDirty = false;

function renderStoryList(stories) {
    const list = document.getElementById('story-list');
    list.innerHTML = '';

    stories.forEach((story, index) => {
        const item = document.createElement('div');
        item.className = 'story-item';
        if (index === selectedStoryIndex) {
            item.classList.add('selected');
        }
        item.textContent = story.title || `Story ${index + 1}`;
        item.addEventListener('click', () => selectStory(index));
        list.appendChild(item);
    });
}

function selectStory(index) {
    if (formDirty) {
        // Silent discard (user's responsibility to click Update)
    }

    selectedStoryIndex = index;
    const story = client.sessionState.stories[index];

    document.getElementById('edit-title').value = story.title;
    document.getElementById('edit-text').value = story.text;
    document.getElementById('story-edit-form').style.display = 'block';
    document.getElementById('update-story-btn').disabled = true;
    formDirty = false;

    renderStoryList(client.sessionState.stories);
}

// Enable Update button on edits
document.getElementById('edit-title').addEventListener('input', () => {
    formDirty = true;
    document.getElementById('update-story-btn').disabled = false;
});

document.getElementById('edit-text').addEventListener('input', () => {
    formDirty = true;
    document.getElementById('update-story-btn').disabled = false;
});
```

- [ ] **Step 4: Implement Add Story button**

```javascript
document.getElementById('add-story-btn').addEventListener('click', () => {
    selectedStoryIndex = null;
    document.getElementById('edit-title').value = '';
    document.getElementById('edit-text').value = '';
    document.getElementById('story-edit-form').style.display = 'block';
    document.getElementById('update-story-btn').textContent = 'Create';
    document.getElementById('update-story-btn').disabled = false;
    document.getElementById('remove-story-btn').style.display = 'none';
    formDirty = true;

    renderStoryList(client.sessionState.stories);
});
```

- [ ] **Step 5: Implement Update/Create button**

```javascript
document.getElementById('update-story-btn').addEventListener('click', () => {
    const title = document.getElementById('edit-title').value.trim();
    const text = document.getElementById('edit-text').value.trim();

    if (!title || !text) {
        showModal('Title and text are required');
        return;
    }

    if (selectedStoryIndex !== null) {
        // Update existing
        client.send('update_story', {
            index: selectedStoryIndex,
            title: title,
            text: text
        });
    } else {
        // Create new
        client.send('add_story', {
            title: title,
            text: text
        });
    }

    document.getElementById('update-story-btn').disabled = true;
    formDirty = false;
});
```

- [ ] **Step 6: Implement Remove button**

```javascript
document.getElementById('remove-story-btn').addEventListener('click', () => {
    showConfirmModal('Remove this story?', (confirmed) => {
        if (confirmed && selectedStoryIndex !== null) {
            client.send('remove_story', { index: selectedStoryIndex });
            document.getElementById('story-edit-form').style.display = 'none';
            selectedStoryIndex = null;
        }
    });
});
```

- [ ] **Step 7: Add update_story message handler to relay.py**

In relay.py, add new message handler:

```python
elif msg_type == "update_story":
    index = data.get("index")
    if index is None or index >= len(session["stories"]):
        await websocket.send(json.dumps({
            "type": "error",
            "data": {"message": "Invalid story index"}
        }))
        return

    session["stories"][index] = {
        "title": data.get("title", ""),
        "text": data.get("text", "")
    }

    # Broadcast updated story list
    await broadcast_to_session(session, {
        "type": "stories_update",
        "data": {"stories": session["stories"]}
    })
```

- [ ] **Step 8: Test story management UI**

Verify:
- Click story → fills form
- Edit → Update enables
- Update → saves, button disables
- Add → clears form, Create button
- Remove → confirmation, deletes
- Click away → discards edits (no save)

- [ ] **Step 9: Commit**

```bash
git add www/control.html server/relay.py
git commit -m "feat: 2-column story management UI with inline edit form"
```

---

## Task 21: Homepage - QR-First Session Cards

**Files:**
- Modify: `www/index.html` (simplify join workflow, add QR codes)

- [ ] **Step 1: Remove modal dialogs**

Remove "Join as..." modal HTML and handlers.

- [ ] **Step 2: Create session card layout**

Replace session list with card grid:

```html
<div id="sessions-container">
    <div id="empty-state" style="display: none;">
        <p>No active sessions.</p>
    </div>
    <div id="session-grid" class="session-grid"></div>
</div>

<button id="create-session-btn" class="btn-create">Create Session</button>
```

With styles:

```css
.session-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.session-card {
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid var(--neon-green);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.session-card:hover {
    border-color: var(--neon-yellow);
    box-shadow: 0 0 20px var(--neon-yellow);
    filter: brightness(1.2);
}

.session-card .qr-code {
    margin-bottom: 1rem;
}

.session-card .session-code {
    font-size: 1.5rem;
    font-family: var(--font-heading);
    color: var(--neon-yellow);
    margin-bottom: 0.5rem;
}

.session-card .session-stats {
    font-size: 0.9rem;
    color: var(--neon-green);
    font-family: var(--font-mono);
}

.btn-create {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--neon-green);
    color: var(--black);
    font-family: var(--font-heading);
    font-size: 1.2rem;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 0 20px var(--neon-green);
}

.btn-create:hover {
    filter: brightness(1.2);
}

@media (max-width: 600px) {
    .session-grid {
        grid-template-columns: 1fr;
    }
}
```

- [ ] **Step 3: Render session cards with QR codes**

```javascript
function renderSessions(sessions) {
    const grid = document.getElementById('session-grid');
    const emptyState = document.getElementById('empty-state');

    if (sessions.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = '';

    sessions.forEach(session => {
        const card = document.createElement('div');
        card.className = 'session-card';

        // Generate QR code
        const joinURL = `${window.location.origin}/audience.html#${session.code}`;
        const qrElement = createQRElement(joinURL, session.code, 200);

        // Create card content
        const code = document.createElement('div');
        code.className = 'session-code';
        code.textContent = session.code;

        const stats = document.createElement('div');
        stats.className = 'session-stats';
        stats.textContent = `${session.judge_count} judges · ${session.story_count} stories`;

        card.appendChild(qrElement);
        card.appendChild(code);
        card.appendChild(stats);

        // Click to join as audience
        card.addEventListener('click', () => {
            window.location.href = `/audience.html#${session.code}`;
        });

        grid.appendChild(card);
    });
}
```

- [ ] **Step 4: Update sessions_list handler**

```javascript
client.on('sessions_list', (data) => {
    renderSessions(data.sessions);
});
```

- [ ] **Step 5: Test homepage**

Verify:
- No sessions → empty state + create button
- Sessions → cards with QR codes
- Click card → joins as audience
- Create button always bottom-right

- [ ] **Step 6: Commit**

```bash
git add www/index.html
git commit -m "feat: QR-first homepage with session cards and direct audience joining"
```

---

## Task 22: Controller Page - Move Timer to Header and Countdown

**Files:**
- Modify: `www/control.html` (add timer to header, countdown support)

- [ ] **Step 1: Add timer and countdown container**

Add to header:

```html
<header>
    <div class="header-left">
        <span class="page-label">CONTROLLING</span>
        <span class="session-info" id="session-info"></span>
    </div>
    <div class="header-timer" id="header-timer">0:00.0</div>
    <div class="header-right">
        <span id="selected-story-title"></span>
    </div>
</header>

<div id="countdown-container"></div>
```

With styles (same as judge/audience).

- [ ] **Step 2: Update Start Round to send countdown_start**

Change start round button handler:

```javascript
document.getElementById('start-round-btn').addEventListener('click', () => {
    if (selectedStoryIndex === null) {
        showModal('Please select a story first');
        return;
    }

    client.send('countdown_start', { story_index: selectedStoryIndex });
});
```

- [ ] **Step 3: Add countdown_start handler**

```javascript
client.on('countdown_start', (data) => {
    // Show countdown (smaller, less prominent than audience/judge)
    const countdown = new Countdown('countdown-container', () => {
        console.log('Countdown complete');
    });
    countdown.start();
});
```

Add controller-specific countdown styles:

```css
#countdown-container .countdown-number {
    font-size: 4rem; /* Smaller than judge/audience */
    top: 20%;
    opacity: 0.7;
}
```

- [ ] **Step 4: Update timer rendering**

Change timer update to target `#header-timer`.

- [ ] **Step 5: Load sounds.js**

```html
<script src="sounds.js"></script>
```

- [ ] **Step 6: Test controller countdown and timer**

Start round, verify countdown plays (smaller), timer appears in header.

- [ ] **Step 7: Commit**

```bash
git add www/control.html
git commit -m "feat: add countdown and move timer to header on controller"
```

---

## Task 23: Judge Test Page

**Files:**
- Create: `www/judge-test.html`

- [ ] **Step 1: Create judge-test.html structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SpecIdol Judge Testing Dashboard</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            padding: 2rem;
        }

        .warning {
            background: var(--neon-red);
            color: var(--black);
            padding: 1rem;
            margin-bottom: 2rem;
            text-align: center;
            font-family: var(--font-heading);
            font-size: 1.5rem;
        }

        .setup {
            margin-bottom: 2rem;
            padding: 1rem;
            border: 2px solid var(--neon-yellow);
        }

        .setup h2 {
            color: var(--neon-yellow);
            margin-bottom: 1rem;
        }

        .setup input,
        .setup button {
            margin-right: 1rem;
        }

        .judge-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .judge-panel {
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid var(--neon-green);
            padding: 1rem;
        }

        .judge-panel.disconnected {
            border-color: var(--neon-red);
            opacity: 0.5;
        }

        .judge-panel h3 {
            color: var(--neon-green);
            margin-bottom: 0.5rem;
        }

        .judge-panel .status {
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
        }

        .judge-panel .status.connected {
            color: var(--neon-green);
        }

        .judge-panel .status.disconnected {
            color: var(--neon-red);
        }

        .session-controls {
            padding: 1rem;
            border: 2px solid var(--neon-magenta);
            background: rgba(0, 0, 0, 0.5);
        }

        .session-controls h2 {
            color: var(--neon-magenta);
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="warning">⚠️ TESTING DASHBOARD ⚠️<br>This page is for testing only. Do not use during live events.</div>

    <div class="setup">
        <h2>Setup</h2>
        <label>Number of judges:</label>
        <input type="number" id="judge-count" min="1" max="10" value="3">
        <button id="spawn-btn" class="btn btn-primary">Spawn Judges</button>
    </div>

    <div id="judge-grid" class="judge-grid"></div>

    <div class="session-controls">
        <h2>Session Controls</h2>
        <label>Session code:</label>
        <input type="text" id="session-code" placeholder="e.g., XKRM" maxlength="4">
        <button id="connect-all-btn" class="btn btn-accent">Connect All</button>
        <button id="disconnect-all-btn" class="btn btn-danger">Disconnect All</button>
    </div>

    <script src="lib/qrcode-generator.js"></script>
    <script src="app.js"></script>
    <script src="sounds.js"></script>
    <script src="modal.js"></script>
    <script>
        // Testing dashboard logic
        const judges = [];

        document.getElementById('spawn-btn').addEventListener('click', () => {
            const count = parseInt(document.getElementById('judge-count').value);
            spawnJudges(count);
        });

        function spawnJudges(count) {
            // Clear existing
            judges.forEach(j => j.client.ws?.close());
            judges.length = 0;

            // Create new judges
            for (let i = 1; i <= count; i++) {
                const judge = {
                    id: i,
                    name: `Judge ${i}`,
                    client: new SpecIdolClient(),
                    soundIndex: null,
                    connected: false
                };

                judge.client.onConnect = () => {
                    judge.connected = true;
                    renderJudges();
                };

                judge.client.on('session_state', (data) => {
                    // Store sound assignment
                    if (data.judge_sounds && data.judge_id) {
                        judge.soundIndex = data.judge_sounds[data.judge_id];
                    }
                    renderJudges();
                });

                judges.push(judge);
            }

            renderJudges();
        }

        function renderJudges() {
            const grid = document.getElementById('judge-grid');
            grid.innerHTML = '';

            judges.forEach((judge, index) => {
                const panel = document.createElement('div');
                panel.className = `judge-panel ${judge.connected ? 'connected' : 'disconnected'}`;

                const name = document.createElement('h3');
                name.textContent = judge.name;

                const status = document.createElement('div');
                status.className = `status ${judge.connected ? 'connected' : 'disconnected'}`;
                status.textContent = judge.connected ? '● Connected' : '○ Disconnected';

                const soundInfo = document.createElement('div');
                soundInfo.textContent = `Buzz sound: ${judge.soundIndex !== null ? judge.soundIndex : 'N/A'}`;

                const buzzBtn = document.createElement('button');
                buzzBtn.className = 'btn btn-danger';
                buzzBtn.textContent = 'Buzz';
                buzzBtn.disabled = !judge.connected;
                buzzBtn.addEventListener('click', () => {
                    judge.client.send('buzz');
                });

                panel.appendChild(name);
                panel.appendChild(status);
                panel.appendChild(soundInfo);
                panel.appendChild(buzzBtn);

                grid.appendChild(panel);
            });
        }

        document.getElementById('connect-all-btn').addEventListener('click', () => {
            const code = document.getElementById('session-code').value.trim().toUpperCase();
            if (!code) {
                showModal('Please enter a session code');
                return;
            }

            judges.forEach(judge => {
                judge.client.connect();
                setTimeout(() => {
                    judge.client.send('join', {
                        code: code,
                        role: 'judge',
                        name: judge.name
                    });
                }, 500);
            });
        });

        document.getElementById('disconnect-all-btn').addEventListener('click', () => {
            judges.forEach(judge => {
                if (judge.client.ws) {
                    judge.client.ws.close();
                    judge.connected = false;
                }
            });
            renderJudges();
        });
    </script>
</body>
</html>
```

- [ ] **Step 2: Test judge-test page**

Open `judge-test.html`, spawn 5 judges, connect to session.
Verify:
- Judges connect, show sound assignments
- Buzz buttons send buzz messages
- Sounds play correctly
- Can disconnect all

- [ ] **Step 3: Commit**

```bash
git add www/judge-test.html
git commit -m "feat: add judge testing dashboard page"
```

---

## Task 24: Documentation and Final Testing

**Files:**
- Create: `docs/superpowers/specs/2026-05-02-testing-checklist.md`

- [ ] **Step 1: Create testing checklist document**

```markdown
# SpecIdol UX Upgrade - Testing Checklist

Date: 2026-05-02

## QR Code Testing
- [ ] Audience screen QR (bottom-right) generates correctly
- [ ] Controller screen judge QR (bottom-right) generates correctly
- [ ] Homepage session card QRs generate correctly
- [ ] Scan QR from audience screen → joins as audience
- [ ] Scan QR from controller → joins as judge
- [ ] QR fallback (show session code if generation fails)

## Round Start & Countdown
- [ ] Start round triggers countdown on all screens
- [ ] Judge screen: 3-2-1-GO animation (large, center)
- [ ] Audience screen: 3-2-1-GO animation (large, center)
- [ ] Controller screen: countdown (smaller, subtle)
- [ ] First paragraph scrolls in during countdown
- [ ] Timer starts at 0:00.0 after countdown
- [ ] Judge button activates after countdown

## Sound Effects
- [ ] 5 different buzz sounds assigned to judges
- [ ] Buzz count progression (1st=1x, 2nd=2x, 3rd=3x)
- [ ] Sounds play on all clients (judge, audience, controller)
- [ ] Final combo (all buzzes + AHOOGA) on last judge out
- [ ] Victory fanfare on timer expiry (not all judges buzzed)
- [ ] Respects prefers-reduced-motion

## Story Management UI
- [ ] 2-column layout (queue left, edit right)
- [ ] Click story → fills edit form
- [ ] Edit content → Update button enables
- [ ] Update → saves, button disables
- [ ] Add Story → clears form, Create mode
- [ ] Remove → confirmation, deletes, clears form
- [ ] Click away → discards unsaved edits
- [ ] Import disclosure works
- [ ] Export copies JSON to clipboard

## Homepage Workflow
- [ ] 0 sessions → empty state + create button (bottom-right)
- [ ] Sessions → cards with QR codes
- [ ] Click card → joins as audience (no modal)
- [ ] Create button always bottom-right

## Judge Reset Bug
- [ ] Judge buzzes, then controller starts new round
- [ ] Judge screen resets (clears buzzed state)
- [ ] Judge button inactive during countdown
- [ ] Judge button activates after countdown

## Controller Controls
- [ ] Start round button (green, prominent)
- [ ] Advance text button (yellow, prominent)
- [ ] Pause button (gray, small, de-emphasized)
- [ ] Close round button (red, confirmation works)
- [ ] Speed controls removed
- [ ] QR toggle button works

## Timer Location
- [ ] Audience: timer in header (next to session code)
- [ ] Judge: timer in header (replaces old center timer)
- [ ] Controller: timer in header
- [ ] Timer updates correctly during round

## QR Toggle
- [ ] Controller clicks toggle → audience QRs hide/show
- [ ] Button text updates (Show/Hide)
- [ ] State persists (new audience members see correct state)

## Judge Test Page
- [ ] Spawn judges → creates connections
- [ ] Connect all → joins session
- [ ] Buzz buttons send messages
- [ ] Sound assignments display
- [ ] Disconnect all works
- [ ] Page clearly marked "TESTING DASHBOARD"

## Responsive Design
- [ ] Mobile (≤900px): layouts stack correctly
- [ ] QR codes visible on mobile (may go offscreen at bottom)
- [ ] Touch targets adequate
- [ ] All pages responsive (index, control, judge, audience, judge-test)
```

- [ ] **Step 2: Run through testing checklist**

Systematically test each item. Fix any issues found.

- [ ] **Step 3: Update CHANGELOG.md**

```markdown
## [Unreleased]

### Added
- QR code joining for audience and judges (qrcode-generator library)
- 3-2-1-GO countdown animation before round starts
- Web Audio API sound effects (5 buzz variations, victory fanfare, AHOOGA)
- Judge sound assignment (random 0-4 index on join)
- Buzz count progression (1st=1x, 2nd=2x, 3rd=3x sounds)
- Final combo (all buzzes + AHOOGA when last judge out)
- Victory fanfare (timer expires without all judges buzzing)
- QR toggle button on controller (show/hide audience QR)
- 2-column story management UI (queue + inline edit form)
- Judge test page for simulating multiple judges
- Buzz history tracking (timestamps, elapsed times)
- Homepage session cards with QR codes (direct audience joining)

### Changed
- Timer moved from center to header (audience, judge, controller)
- Round start now triggers countdown instead of immediate start
- Homepage simplified (removed role selection modals, QR-first)
- Controller "Reset round" renamed to "Close round"
- Controller pause button de-emphasized (smaller, gray)
- Controller speed controls removed (1x, 2x, 3x)
- Story edit form shows Update button disabled until content changes

### Fixed
- Judge screens now reset properly when controller starts new round
- Judge button inactive during countdown, activates after
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-05-02-testing-checklist.md docs/CHANGELOG.md
git commit -m "docs: add testing checklist and update CHANGELOG"
```

---

## Self-Review

**Spec coverage check:**

✅ QR codes (audience, controller, homepage) — Tasks 8, 14, 17, 21
✅ Round start countdown (3-2-1-GO) — Tasks 4, 9, 10, 11, 13, 22
✅ Sound effects (buzzes, fanfare, AHOOGA) — Tasks 7, 15, 16
✅ Story management UI (2-column) — Task 20
✅ Judge reset bug fix — Tasks 4, 11
✅ Buzz time tracking — Task 5
✅ Controller controls updates — Task 19
✅ Timer relocation — Tasks 12, 13, 22
✅ QR toggle — Tasks 6, 14, 18
✅ Homepage workflow — Task 21
✅ Judge test page — Task 23

**Placeholder scan:** No TBD, TODO, or "implement appropriate" phrases found.

**Type consistency:**
- `judge_sounds` dict used consistently (session state, messages)
- `buzz_count` field used consistently in buzz messages
- `audience_qr_visible` boolean used consistently
- `countdown_start` message type used consistently
- QR function names (`generateQRCode`, `createQRElement`) consistent

All clear.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-02-specidol-ux-upgrade.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
