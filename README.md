# SPECULATIVE IDOL

A live "Pop Idol for writers" web application for speculative fiction conventions. Readers read stories aloud with auto-scrolling text, three editor-judges buzz them out with big red buttons, and an audience watches on a projector. If the reader survives 2 minutes without all three judges buzzing, they win.

## Features

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

### 2. Start WebSocket Server

```bash
cd server
python3 relay.py
```

Server runs on `ws://localhost:8765`

### 3. Start Web Server

```bash
cd www
python3 -m http.server 8000
```

Web UI available at `http://localhost:8000/index.html`

### 4. Create a Session

1. Open `http://localhost:8000/index.html` in a browser
2. Click **"Create Session"** → redirects to controller
3. Note the 4-letter session code

### 5. Join as Judge (x3)

1. Open `http://localhost:8000/index.html` on 3 mobile devices (or browser tabs)
2. Click **"Join Session"**, enter the session code
3. Select **"Judge"**, pick judge number (1, 2, or 3)
4. Each judge gets a big red BUZZ button

### 6. Join as Audience

1. Open `http://localhost:8000/index.html` on the projector laptop
2. Click **"Join Session"**, enter the session code
3. Select **"Audience"**
4. This view shows on the projector for the audience to watch

### 7. Run the Event

In the **Controller** view:
1. Add stories: enter title + text, click "Add Story"
2. Select a story from the queue
3. Click **"Start Round"** to begin
4. Use speed controls (1x/2x/3x) and play/pause as needed
5. Judges press their BUZZ buttons when they've heard enough
6. When all 3 buzz → "BUZZED OUT" (defeat)
7. If timer reaches 2:00 → "SURVIVOR!" (victory)

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
- `judge_count`: number of judges (default 3)

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

MIT

## Credits

Built for a speculative fiction writers' convention. Inspired by Pop Idol and game show aesthetics.