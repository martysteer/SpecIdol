# SPECULATIVE IDOL

A live "Pop Idol for writers" web application for speculative fiction conventions. Readers read stories aloud with auto-scrolling text, three editor-judges buzz them out with big red buttons, and an audience watches on a projector. If the reader survives 2 minutes without all three judges buzzing, they win.

## Features

- **Multiple concurrent sessions** - run many games simultaneously
- **Auto-assign judge IDs** - judges join, get sequential numbers (1, 2, 3...)
- **Session list interface** - click to select session, no typing codes
- **Real-time WebSocket coordination** between multiple clients
- **Auto-scrolling story text** synchronized across all views
- **Judge buzzer system** with big red buttons (mobile-optimized)
- **Audience projector view** with CRT effects, judge panels, animations, sound
- **Controller interface** with story queue, round controls, import/export
- **Retro/campy aesthetic** with pixel fonts, neon colors, game show vibe
- **No build step, no framework** - pure HTML/CSS/JS + Python WebSocket server

## Quick Start

### 1. Install Dependencies

```bash
cd server
pip3 install -r requirements.txt
```

### 2. Start Servers

```bash
make servers
```

This starts both:
- WebSocket relay on `ws://localhost:8765`
- HTTP server on `http://localhost:8000`

To stop: `make stop`

### 3. Create a Session

1. Open `http://localhost:8000` in a browser
2. Click **"Create Session"** → redirects to controller
3. Note the 4-letter session code displayed

### 4. Join as Judge

1. Open `http://localhost:8000` on mobile devices (or browser tabs)
2. Click **"Join Session"**
3. Select the session from the list of active sessions
4. Click **"Join as Judge"**
5. Each judge auto-assigned sequential ID (1, 2, 3...)
6. Each judge gets a big red BUZZ button

### 5. Join as Audience

1. Open `http://localhost:8000` on the projector laptop
2. Click **"Join Session"**
3. Select the session from the list
4. Click **"Join as Audience"**
5. This view shows on the projector for the audience to watch

### 6. Run the Event

In the **Controller** view:
1. Add stories: enter title + text, click "Add Story"
2. Click a story row to select it from the queue
3. Click **"Start Round"** to begin
4. Use speed controls (1x/2x/3x) and play/pause as needed
5. Judges press their BUZZ buttons when they've heard enough
6. When all connected judges buzz → "BUZZED OUT" (defeat)
7. If timer reaches limit → "SURVIVOR!" (victory)

## Architecture

- **Server**: Python WebSocket relay (`server/relay.py`) holds session state in memory
- **Clients**: Static HTML/CSS/JS (`www/`) connect via WebSocket, compute timer/scroll locally
- **No database**: Session lost on server restart (ephemeral event app)

## Import/Export Sessions

In the Controller, use the **Import/Export** panel to:
- **Export**: Copy session JSON (stories + config) to clipboard
- **Import**: Paste session JSON to pre-load stories

Example JSON:
```json
{
  "stories": [
    {"title": "Story One", "text": "Once upon a time..."},
    {"title": "Story Two", "text": "In a galaxy far away..."}
  ],
  "config": {
    "timer_duration": 120,
    "judge_count": 3
  }
}
```

## Configuration

Edit `server/relay.py` to change defaults:
- `timer_duration`: seconds (default 120 = 2:00)

Judge count is unlimited - as many judges as connect will participate.

## Deployment

### Option A: Local Network

1. Run server on a laptop connected to venue WiFi
2. Replace `localhost` with laptop's local IP in `www/app.js`:
   ```javascript
   connect(wsUrl = 'ws://192.168.x.x:8765')
   ```
3. Devices connect to same WiFi, access via IP

### Option B: Hosted Server

1. Deploy `server/relay.py` to a VPS (e.g., DigitalOcean, Linode)
2. Update `www/app.js` with server's public WebSocket URL
3. Serve `www/` files via Apache/Nginx
4. Use `wss://` (secure WebSocket) in production

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (Web Audio API works)
- **Mobile Safari/Chrome**: Optimized for portrait (judge view)

## License

Anti-Capitalist Software License v1.4

See [LICENSE](LICENSE) file for full text.

https://anticapitalist.software/

## Credits

Built for a speculative fiction writers' convention. Inspired by Pop Idol and game show aesthetics.