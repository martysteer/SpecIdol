# Docker Deployment Plan

## Overview

Containerize the Python WebSocket server with Docker for portable, reproducible deployments.

## Implementation

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server/ ./server/

# Expose WebSocket port
EXPOSE 8765

# Run relay server
CMD ["python", "server/relay.py"]
```

### 2. Create docker-compose.yml (Local Dev)

```yaml
# docker-compose.yml
version: '3.8'

services:
  relay:
    build: .
    ports:
      - "8765:8765"
    restart: unless-stopped

  web:
    image: nginx:alpine
    ports:
      - "8000:80"
    volumes:
      - ./www:/usr/share/nginx/html:ro
    restart: unless-stopped
```

### 3. Update Makefile

```makefile
# Makefile
.PHONY: servers stop build dev

# Production (Docker)
build:
	docker compose build

servers:
	docker compose up -d
	@echo ""
	@echo "Servers running:"
	@echo "  - WebSocket relay: ws://localhost:8765"
	@echo "  - HTTP server: http://localhost:8000"
	@echo ""
	@echo "Run 'make stop' to stop servers"

stop:
	docker compose down

# Development (Local Python + HTTP server)
dev:
	@echo "Starting WebSocket relay server..."
	@python3 server/relay.py & echo $$! > .relay.pid
	@echo "Starting HTTP server..."
	@python3 -m http.server 8000 --directory www & echo $$! > .http.pid
	@echo "Run 'make stop-dev' to stop"

stop-dev:
	@if [ -f .relay.pid ]; then kill `cat .relay.pid` 2>/dev/null || true; rm .relay.pid; fi
	@if [ -f .http.pid ]; then kill `cat .http.pid` 2>/dev/null || true; rm .http.pid; fi
	@lsof -ti :8765 | xargs kill -9 2>/dev/null || true
	@lsof -ti :8000 | xargs kill -9 2>/dev/null || true
```

### 4. Update app.js for Production

```javascript
// www/app.js
class SpecIdolClient {
    connect(wsUrl) {
        // Auto-detect WebSocket URL based on environment
        if (!wsUrl) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            // In production, WebSocket on same host
            // In dev, localhost:8765
            wsUrl = host === 'localhost' || host === '127.0.0.1'
                ? 'ws://localhost:8765'
                : `${protocol}//${host}`;
        }

        this.ws = new WebSocket(wsUrl);
        // ... rest of code
    }
}
```

### 5. Environment Variables

Create `.env` for configuration:

```bash
# .env (don't commit - add to .gitignore)
WEBSOCKET_PORT=8765
ALLOWED_ORIGINS=https://yourdomain.com
```

Update relay.py:
```python
import os
from dotenv import load_dotenv

load_dotenv()

port = int(os.getenv('WEBSOCKET_PORT', 8765))
```

## Production Considerations

### SSL/TLS (wss://)

For production, use SSL/TLS for encrypted WebSocket connections (wss://). Most container platforms provide automatic SSL certificates.

### Scaling

**Horizontal (multiple instances):**
- Problem: Multiple containers = separate session state
- Solution: Use Redis or shared database for session storage

**Current limitation:** In-memory sessions don't work across instances.

**For small events (<100 concurrent):** Single instance sufficient.

**For scaling:** Refactor to use Redis/Postgres for session state.

### Backup Strategy

**Session data:** Currently in-memory (lost on restart).

**Options:**
1. Export/Import JSON (manual backup via controller)
2. Add persistence layer (SQLite, Postgres)
3. Automated snapshots (platform-dependent)

## Testing Locally

```bash
# Build and run containers
make build
make servers

# Test in browser
open http://localhost:8000

# View logs
docker compose logs -f relay

# Stop
make stop
```

## Migration Checklist

- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Update Makefile with Docker commands
- [ ] Add .env support to relay.py
- [ ] Update app.js for auto-detection
- [ ] Test locally with Docker
- [ ] Choose hosting platform
- [ ] Deploy to staging
- [ ] Test production deployment
- [ ] Update DNS (if custom domain)
- [ ] Monitor logs for 24 hours

## Next Steps

1. **Create Docker files:** Dockerfile, docker-compose.yml
2. **Update Makefile:** Add Docker commands
3. **Test locally:** `make build && make servers`
4. **Deploy:** Push to container hosting platform of choice
5. **Monitor:** Check logs for errors
