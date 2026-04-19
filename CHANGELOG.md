# Changelog

All notable changes to SpecIdol will be documented in this file.

## [Unreleased]

### Added
- **Join as Controller button** on session join page - rejoin existing sessions as controller
- **Session control panel** in controller interface:
  - Eject Judges button - disconnects all judges with confirmation
  - Shutdown Audience button - disconnects all audience screens with confirmation
  - Delete Session button - removes session and ejects all clients with confirmation
  - Judge count and audience count display
- **Makefile improvements**:
  - `make help` - show all available commands (default target)
  - `make docker` - build Docker image (renamed from `make build`)
  - `make clean` - stop and remove container and image
- **GitHub Actions workflow** - manual deployment to DigitalOcean Droplet
- **Deployment documentation** - complete guide in `docs/docker-deployment-plan.md`
- **Para-critique essay** - `docs/para-critique-acsl-specidol.md` discussing ACSL licensing and AI co-authorship

### Changed
- **Port standardization**:
  - Production (Docker): Port 80 for web, 8765 for WebSocket
  - Development (`make dev`): Port 8000 for web, 8765 for WebSocket (no sudo required)
- **WebSocket connection fix**: Production mode now correctly connects to port 8765
- **Docker architecture**: Single Dockerfile with nginx + relay via supervisord (no docker-compose)
- **Session info layout**: Redesigned controller header with three-column grid layout
- **Session stats**: Unified display across join page and controller (stories | judges | audience)

### Fixed
- Port 8765 already in use handling in `make dev-stop`
- WebSocket connection in production (was trying to connect to HTTP port instead of 8765)
- Dockerfile EXPOSE declarations now match actual ports
- All deployment documentation updated with correct ports

### Security
- Firewall configuration documented for ports 22, 80, 8765
- Controller-only authentication for session deletion commands

## [1.0.0] - 2024-04-18

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
- Retro/campy game show aesthetic
- No build step, no framework - pure HTML/CSS/JS + Python WebSocket server

### License
Licensed under Anti-Capitalist Software License v1.4
