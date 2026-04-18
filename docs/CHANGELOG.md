# Speculative Idol - Changelog

## Recent Changes

### Multiple Sessions Support
**Date:** 2026-04-18

Server now supports multiple concurrent game sessions:
- Each session has unique 4-letter code
- Sessions isolated (separate stories, judges, rounds, history)
- Join screen shows all active sessions as buttons
- Click session → select → join as audience/judge

**Technical:**
- `sessions = {code: session_data}` dict
- `websocket_sessions = {websocket: code}` tracking
- `broadcast_to_session(code, msg)` for session-specific broadcasts

### Auto-Assign Judge IDs
**Date:** 2026-04-18

Judges auto-assigned sequential IDs (1, 2, 3...) on join:
- No dropdown selection needed
- Supports unlimited judges (not limited to 3)
- Join screen: just "Join as Judge" button
- Server assigns next available ID

**Technical:**
- `next_judge_id` counter per session
- `judge_slots = {}` dynamic dict
- Broadcast `judge_joined`/`judge_left` events

### Dynamic Judge Indicators
**Date:** 2026-04-18

Judge panels/indicators now dynamic:
- **Audience screen:** Judge panels generated from `connected_judges`
- **Judge screen:** Status indicators show all connected judges
- Updates in real-time as judges join/leave

### UI Refinements
**Date:** 2026-04-18

**Controller:**
- Two-column layout (50/50 split)
- Left: Add Story + Import/Export (collapsible)
- Right: Story Queue
- Click entire row to select story
- Disclosure arrow collapses Add Story column (queue expands to 90%)

**Judge:**
- Text: "session code:" and "you are judge X" (lowercase)
- Timer moved to bottom left footer (matches audience)

**Join:**
- Session list buttons instead of code input
- Shows story count and judge count per session
- Select session → enables join buttons

## Architecture

### Server (relay.py)
- WebSocket relay on port 8765
- In-memory session storage (no persistence)
- Message types: `list_sessions`, `create_session`, `join`, `add_story`, `round_start`, `buzz`, etc.
- Broadcasts to session clients only

### Client (www/)
- Vanilla HTML/CSS/JS (no framework)
- `app.js`: Shared WebSocket client + utilities
- `index.html`: Landing/join screen
- `control.html`: Controller interface (create stories, start rounds)
- `judge.html`: Judge view (buzz button)
- `audience.html`: Audience view (story text + auto-scroll + timer)

### Protocol
- Clock sync: Server sends `server_time`, clients calculate offset
- State restoration: Late joiners receive full `session_state`
- Real-time: Judge buzzes, round events broadcast immediately
