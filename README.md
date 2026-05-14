# SPECULATIVE IDOL

A live "Pop Idol for writers" web application for speculative fiction conventions. Readers read stories aloud with auto-scrolling text, three editor-judges buzz them out with big red buttons, and an audience watches on a projector. If the reader survives 2 minutes without all three judges buzzing, they win.

## Features

Four browser views connect over WebSockets to a Python relay server — no database, no build step, no framework. Everything is ephemeral and runs from static HTML/JS/CSS.

The **controller** manages the session: queueing stories, starting rounds, controlling scroll speed, and importing/exporting session data as JSON. The **judge view** is a mobile-optimized big red buzzer button — judges join a session and get auto-assigned IDs. The **audience view** is a projector-friendly display with CRT effects, animated judge panels, and a retro game show aesthetic (pixel fonts, neon colours, scanlines).

Sound is fully synthesized via Web Audio API — no audio files. A 3-2-1-GO countdown plays beeps synced to the visual countdown. Judge buzzes are EAS-style tones that escalate (1 beep, 2, 3) as each judge buzzes in sequence. Victory gets an ascending major arpeggio with shimmer; defeat gets an ahooga horn. Multiple sessions can run concurrently.

## Quick Start

```
make help
```

```
SpecIdol Makefile commands:

Docker commands:
  make docker      Build Docker image
  make servers     Run Docker container (port 80 + 8765)
  make stop        Stop and remove Docker container
  make restart     Stop, rebuild, and restart container
  make clean       Stop container, remove container and image

Local development commands:
  make dev         Run without Docker (port 80 + 8765, needs sudo)
  make dev-stop    Stop local dev servers

Quick start:
  make docker && make servers
  Then visit http://localhost
```

For deployment details, see [docs/docker-deployment-plan.md](docs/docker-deployment-plan.md).

## Using the App

Create a session from the landing page — this opens the controller. Judges and audience join by selecting the session from the list on their own devices. Load stories into the queue (or import a JSON bundle), select one, and start the round. The countdown plays, text begins scrolling, and judges can buzz at any time. If all judges buzz, the reader is out. If the timer runs out, they survive.

## Architecture

The server (`server/relay.py`) is a stateless WebSocket relay that holds session state in memory. Clients (`www/`) are static files served by nginx (Docker) or Python's http.server (dev). Timer and scroll are computed client-side; the server coordinates events.

### Behind the Scenes

The landing page handles session creation and joining. These pages aren't linked from the UI and need to be navigated to manually:

- **`/control.html`** — controller/host interface (if you close the tab after creating a session, navigate back here and rejoin)
- **`/judge-test.html`** — multi-judge testing scaffold, simulates multiple judges in one browser
- **`/buzz-tester.html`** — synthesizer workbench for designing and auditioning all the game sounds (71 single presets, combo stacks up to 15 layers, formant voice synthesis)

## License

[Anti-Capitalist Software License v1.4](LICENSE) — https://anticapitalist.software/

## Credits

Built for [TriCon Halifax](https://tricon-halifax.com/) (The Trident Conference for Speculative Fiction), Atlantic Canada's literary conference for writers of speculative fiction. Inspired by Pop Idol and game show aesthetics.
