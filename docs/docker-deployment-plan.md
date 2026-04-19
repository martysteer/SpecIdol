# Docker Deployment on DigitalOcean Droplet

## Overview

Deploy SpecIdol to a DigitalOcean Droplet using Docker with automated GitHub Actions deployment.

## Architecture

- **Single Docker container** with nginx + Python relay using supervisord
- **Two ports exposed**: 8080 (web), 8765 (WebSocket)
- **Clean separation**: Infrastructure doesn't force app changes
- **Manual deployment**: GitHub Actions workflow triggered on-demand

## Setup

### 1. Create DigitalOcean Droplet

1. **Create Droplet:**
   - Go to DigitalOcean → Create → Droplets
   - Choose: Ubuntu 22.04 LTS
   - Plan: Basic ($4/mo minimum - supports Docker)
   - Choose datacenter region
   - Add SSH key (or create one)
   - Create Droplet

2. **Install Docker on Droplet:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   curl -fsSL https://get.docker.com | sh
   ```

3. **Clone repository:**
   ```bash
   mkdir -p /opt
   cd /opt
   git clone https://github.com/YOUR_USERNAME/SpecIdol.git specidol
   cd specidol
   ```

4. **Initial build and run:**
   ```bash
   docker build -t specidol .
   docker run -d --name specidol --restart unless-stopped -p 8080:8080 -p 8765:8765 specidol
   ```

5. **Configure firewall:**
   ```bash
   ufw allow 22/tcp    # SSH
   ufw allow 8080/tcp  # Web interface
   ufw allow 8765/tcp  # WebSocket
   ufw enable
   ```

6. **Test deployment:**
   - Visit: `http://YOUR_DROPLET_IP:8080`
   - Should see SpecIdol join screen

### 2. Configure GitHub Secrets

1. **Generate SSH key for GitHub Actions (on your local machine):**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/specidol-deploy
   ```

2. **Add public key to Droplet:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
   ```

3. **Add secrets to GitHub:**
   - Go to: GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Add two secrets:
     - **Name:** `DROPLET_HOST`
       **Value:** Your Droplet IP address (e.g., `123.45.67.89`)
     - **Name:** `DROPLET_SSH_KEY`
       **Value:** Contents of `~/.ssh/specidol-deploy` (private key)

### 3. Deploy via GitHub Actions

1. **Push changes to GitHub:**
   ```bash
   git push origin main
   ```

2. **Trigger deployment:**
   - Go to: GitHub repo → Actions tab
   - Click: "Deploy to DigitalOcean Droplet"
   - Click: "Run workflow" → "Run workflow"

3. **Monitor deployment:**
   - Watch workflow progress in Actions tab
   - Check Droplet logs: `ssh root@YOUR_DROPLET_IP "docker logs -f specidol"`

## Workflow Details

The GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. SSHs into Droplet
2. Pulls latest code from GitHub
3. Stops running container
4. Rebuilds Docker image
5. Starts new container with `--restart unless-stopped`
6. Cleans up old Docker images

## Local Development

Use `make dev` for local development without Docker:

```bash
make dev        # Start relay + HTTP server
make dev-stop   # Stop servers
```

Or test with Docker locally:

```bash
make build      # Build Docker image
make servers    # Run container
make stop       # Stop container
```

## Production Considerations

### Custom Domain

1. **Add A record:** Point domain to Droplet IP
2. **Update ports:** Use 80 (HTTP) or 443 (HTTPS)
3. **Add TLS:** Use Caddy or Certbot for HTTPS/WSS

### SSL/TLS (Recommended)

For production, add reverse proxy with automatic HTTPS:

```bash
# Install Caddy on Droplet
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy

# Configure Caddyfile
cat > /etc/caddy/Caddyfile <<EOF
yourdomain.com {
    reverse_proxy localhost:8080
    reverse_proxy /ws localhost:8765
}
EOF

systemctl restart caddy
```

Then update Docker ports to only expose locally: `-p 127.0.0.1:8080:8080 -p 127.0.0.1:8765:8765`

### Monitoring

**View logs:**
```bash
docker logs -f specidol
```

**Check container status:**
```bash
docker ps
```

**Restart container:**
```bash
docker restart specidol
```

### Backup

**Current limitation:** Sessions stored in-memory (lost on restart).

**Export/Import:**
- Controller has Import/Export buttons
- Manual backup before updates
- Future: Add database persistence

### Scaling

**Single instance sufficient for:**
- <100 concurrent users
- Small events/classes

**For scaling:**
- Add Redis for shared session state
- Deploy multiple instances
- Load balancer in front

## Troubleshooting

**Container won't start:**
```bash
docker logs specidol
```

**Ports in use:**
```bash
lsof -i :8080
lsof -i :8765
# Kill process if needed
```

**GitHub Actions fails:**
- Check Droplet SSH access: `ssh -i ~/.ssh/specidol-deploy root@YOUR_DROPLET_IP`
- Verify secrets are set correctly
- Check workflow logs in Actions tab

**WebSocket won't connect:**
- Verify port 8765 open: `ufw status`
- Check browser console for errors
- Confirm relay running: `docker exec specidol ps aux | grep relay`

## Cost Estimate

**DigitalOcean Droplet:**
- Basic plan: $4/mo (512MB RAM, 10GB disk)
- Recommended: $6/mo (1GB RAM, 25GB disk)
- Bandwidth: 500GB-1TB included

**DNS (optional):**
- DigitalOcean: Free with Droplet
- Namecheap/Cloudflare: ~$10-15/year

## Next Steps

1. Create Droplet and install Docker
2. Add GitHub secrets
3. Run initial deployment via Actions
4. Test at `http://YOUR_DROPLET_IP:8080`
5. (Optional) Add custom domain + HTTPS
