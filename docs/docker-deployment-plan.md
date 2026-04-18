# Docker Deployment Plan

## Overview

Keep Python WebSocket server, containerize with Docker for easy deployment to various hosting platforms.

## Why Docker > PHP Refactor

**Advantages:**
- ✅ Keep existing Python code (no rewrite)
- ✅ Works exactly as tested locally
- ✅ Portable across hosting providers
- ✅ Makefile works inside container
- ✅ Modern deployment practice
- ✅ Easy rollbacks (container versions)

**vs PHP Options:**
- PHP SSE: 2-3 days rewrite + potential hosting issues
- PHP Long Polling: Less efficient, higher latency
- External Service: Ongoing cost, vendor lock-in
- PHP + Ratchet: Still needs VPS/CLI access

**Docker: 1 day setup, runs anywhere containers supported**

## Container Hosting Options (2026)

Based on research from [DigitalOcean's Fly.io alternatives](https://www.digitalocean.com/resources/articles/flyio-alternative) and [Railway vs Render comparison](https://northflank.com/blog/railway-vs-render):

### 1. Railway (Recommended for Simplicity)
**Best for: Quick deployment, usage-based pricing**

- **Pricing:** $5/month credit, usage-based after (~$0.01/hr)
- **Features:** GitHub auto-deploy, env variables, logs, metrics
- **Pros:** Simplest deployment, great DX, generous free trial
- **Cons:** Single region (US-West), usage can spike
- **Deployment:** Push to Git → auto-deploy

**Use case:** Events with <100 concurrent users, prototype/testing

[Railway Platform](https://railway.app/)

### 2. Fly.io (Recommended for Global)
**Best for: Low-latency worldwide, more control**

- **Pricing:** Free allowance (3 shared-CPU VMs), then $0.0000022/sec
- **Features:** 35+ regions, anycast, edge deployment
- **Pros:** Global distribution, auto-scaling, better performance
- **Cons:** Slightly more complex config, regional pricing varies
- **Deployment:** CLI tool (`flyctl deploy`)

**Use case:** Multi-regional events, international audience

[Fly.io Platform](https://fly.io/)

### 3. Render (Good Balance)
**Best for: Predictable pricing, features**

- **Pricing:** Free tier (spins down after 15min idle), $7/month always-on
- **Features:** Auto-deploy, SSL, zero-downtime, Postgres free 90 days
- **Pros:** Clean free tier, Docker native, good docs
- **Cons:** Slower cold starts on free tier
- **Deployment:** GitHub connect or Docker registry

**Use case:** Occasional events, budget-conscious

[Render Platform](https://render.com/)

### 4. DigitalOcean App Platform
**Best for: Predictable costs, DigitalOcean ecosystem**

- **Pricing:** $5/month basic container
- **Features:** Auto-scaling, managed databases, CDN
- **Pros:** Fixed pricing, DO droplets available, good support
- **Cons:** Less "magic" than Railway/Fly.io
- **Deployment:** GitHub or Container Registry

**Use case:** Already using DigitalOcean, need databases/storage

[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

### 5. Self-Hosted Options

**Coolify** (Open source PaaS):
- Host on any VPS ($4-6/month)
- Docker Compose + Traefik
- Self-managed

**Traditional VPS** (Liquid Web, Hostinger ~$3.50-4.49/month):
- SSH access, run `docker compose up`
- Most control, most work

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

## Deployment Steps

### Railway (Easiest)

1. Create account at [railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select SpecIdol repository
4. Railway auto-detects Dockerfile and deploys
5. Get public URL: `yourapp.railway.app`
6. Update www/app.js with production URL (or use auto-detection)

**Time: 5 minutes**

### Fly.io (Best Performance)

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Initialize: `flyctl launch`
   - Choose app name
   - Select region(s)
   - Fly generates fly.toml
4. Deploy: `flyctl deploy`
5. Scale: `flyctl scale count 2` (for redundancy)

**Time: 15 minutes**

### Render

1. Create account at [render.com](https://render.com/)
2. New → Web Service
3. Connect GitHub repo
4. Environment: Docker
5. Set PORT env var to 8765
6. Deploy

**Time: 10 minutes**

### DigitalOcean App Platform

1. Create account at [digitalocean.com](https://www.digitalocean.com/)
2. Apps → Create App
3. Choose GitHub or DockerHub
4. Configure: Dockerfile path, port 8765
5. Deploy

**Time: 10 minutes**

## Production Considerations

### SSL/TLS (wss://)

Most platforms auto-provide SSL:
- Railway: Automatic
- Fly.io: Automatic
- Render: Automatic
- DigitalOcean: Automatic

WebSocket upgrades from `ws://` to `wss://` automatically.

### Scaling

**Horizontal (multiple instances):**
- Problem: Multiple containers = separate session state
- Solution: Use Redis or shared database for session storage

**Current limitation:** In-memory sessions don't work across instances.

**For small events (<100 concurrent):** Single instance sufficient.

**For scaling:** Refactor to use Redis/Postgres for session state.

### Monitoring

All platforms provide:
- Logs (real-time viewing)
- Metrics (CPU, RAM, network)
- Alerts (downtime notifications)

### Backup Strategy

**Session data:** Currently in-memory (lost on restart).

**Options:**
1. Export/Import JSON (manual backup via controller)
2. Add persistence layer (SQLite, Postgres)
3. Automated snapshots (platform-dependent)

### Cost Estimates

**Small event (1-10 concurrent users, occasional use):**
- Railway: $0-5/month (usage-based)
- Fly.io: Free tier sufficient
- Render: Free (with cold starts) or $7/month

**Medium event (10-50 concurrent, weekly use):**
- Railway: ~$10-15/month
- Fly.io: ~$5-10/month
- Render: $7/month (single instance)

**Large event (100+ concurrent, daily use):**
- Need Redis for state
- Railway: $20-30/month
- Fly.io: $15-25/month (multi-region)
- DigitalOcean: $10-15/month + $8 managed Redis

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

## Comparison: Docker vs PHP Refactor

| Factor | Docker | PHP SSE | PHP Ratchet |
|--------|--------|---------|-------------|
| Code Changes | Minimal | Major rewrite | Major rewrite |
| Time to Deploy | 1 day | 2-3 days | 2-3 days |
| Hosting Cost | $0-7/month | Included | $5-10/month |
| Performance | Excellent | Good | Excellent |
| Scalability | Easy (add instances) | Limited | Good |
| Complexity | Low | Medium | Medium |
| Maintenance | Low | Medium | Medium |
| Risk | Low | Medium | Low |

## Recommendation

**Use Docker + Railway/Fly.io:**
- Keeps working Python code
- Deploys in minutes
- Costs $0-7/month for typical use
- Easy to migrate between platforms
- Standard modern practice

**PHP only makes sense if:**
- You must use current shared hosting (no budget for $5/month)
- Absolutely cannot use external services
- Willing to rewrite and test extensively

## Next Steps

1. **Test locally:** `make build && make servers`
2. **Choose platform:** Railway (simplest) or Fly.io (global)
3. **Deploy:** 5-15 minutes following platform guide
4. **Test production:** Create session, join as judge/audience
5. **Monitor:** Check logs for first event

## Resources

- [Docker Python WebSocket Guide](https://medium.com/@isaacwilhite987/leveraging-docker-for-efficient-websocket-communication-with-flask-4cddd6aede48)
- [Free Python Hosting 2026](https://snapdeploy.dev/blog/host-python-web-app-free-2026-guide)
- [Railway vs Render Comparison](https://northflank.com/blog/railway-vs-render)
- [Fly.io vs Railway 2026](https://thesoftwarescout.com/fly-io-vs-railway-2026-which-developer-platform-should-you-deploy-on/)
- [Fly.io Alternatives Guide](https://www.digitalocean.com/resources/articles/flyio-alternative)
- [Docker VPS Hosting](https://cybernews.com/best-web-hosting/docker-hosting/)
