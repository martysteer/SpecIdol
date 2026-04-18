# PHP Refactor Plan

## Problem
Current Python WebSocket server requires long-running process. Shared PHP hosting typically doesn't support persistent WebSocket connections.

## Research Summary

### PHP WebSocket Libraries
- **[Ratchet](http://socketo.me/)** - Most popular, requires long-running process
- **[AMPHP WebSocket Server](https://amphp.org/websocket-server)** - Modern fiber-based, requires CLI
- **[Textalk/websocket-php](https://github.com/Textalk/websocket-php)** - Client/server, needs persistent process

### Key Issue
All PHP WebSocket servers require **persistent processes** (CLI scripts) that typical shared hosting doesn't support. They need:
- Command-line access
- Long-running PHP processes
- Process supervisor (e.g., supervisord)
- Open ports for WebSocket connections

### Alternatives for Shared Hosting

Based on research from [WebSocket.org comparisons](https://websocket.org/comparisons/), [SSE vs WebSockets article](https://germano.dev/sse-websockets/), and [real-time technology comparison](https://medium.com/@kamlesh90/long-polling-vs-sse-vs-websockets-vs-webhooks-which-real-time-technology-should-developers-choose-e965388a6174):

1. **Server-Sent Events (SSE)** - One-way streaming, HTTP-based
2. **Long Polling** - Request/response cycles, works everywhere
3. **External WebSocket Service** - Pusher, Ably, Socket.io cloud
4. **Upgrade Hosting** - VPS/dedicated with process management

## Recommended Approaches

### Option 1: Server-Sent Events + AJAX (Hybrid)
**Best for: Shared hosting, moderate real-time needs**

**Architecture:**
- SSE endpoint (`server/events.php`) - Streams updates to clients
- API endpoints (`server/api.php`) - Handle client actions (buzz, start round)
- Session storage in files or SQLite
- Clients use EventSource API + fetch() for actions

**Pros:**
- Works on any PHP hosting
- Native browser support (EventSource API)
- Auto-reconnect built-in
- Simpler than WebSockets

**Cons:**
- One-way server→client (need AJAX for client→server)
- Less efficient than WebSockets for high-frequency updates
- Browser connection limits (6 per domain)

**Effort:** Medium (2-3 days)

### Option 2: Long Polling
**Best for: Maximum compatibility, lower traffic**

**Architecture:**
- Polling endpoint (`server/poll.php`) - Returns updates since last check
- API endpoints for actions
- Clients poll every 1-2 seconds

**Pros:**
- Works everywhere
- Easy to debug
- Standard HTTP

**Cons:**
- Higher latency (1-2s delay)
- More server load (constant requests)
- Inefficient for multiple concurrent games

**Effort:** Low (1-2 days)

### Option 3: External WebSocket Service
**Best for: Production use, scalability**

**Services:**
- [Pusher](https://pusher.com/) - Free tier: 100 connections
- [Ably](https://ably.com/) - Free tier: 3M messages/month
- [Socket.io Cloud](https://socket.io/) - Managed Socket.io

**Pros:**
- True WebSockets
- Handles scaling, reconnection, fallbacks
- No server management

**Cons:**
- Third-party dependency
- Cost at scale
- Vendor lock-in

**Effort:** Low (1-2 days client-side changes)

### Option 4: Upgrade Hosting + Ratchet
**Best for: Self-hosted control**

**Requirements:**
- VPS or dedicated server
- Shell access
- Supervisor/systemd
- Open port (8765)

**Architecture:**
- Ratchet WebSocket server (as per [Ratchet deployment guide](http://socketo.me/docs/deploy))
- Supervisor keeps process alive
- Nginx reverse proxy (optional, for wss://)

**Pros:**
- Full control
- True WebSockets
- Best performance

**Cons:**
- Requires VPS ($5-10/mo)
- Server administration
- Process management

**Effort:** Medium (2-3 days including deployment)

## Detailed Implementation: SSE + AJAX (Recommended)

### File Structure
```
server/
  events.php       # SSE endpoint (streams updates)
  api.php          # REST API (handle actions)
  session.php      # Session management (file/SQLite)
  config.php       # Configuration

www/
  app.js           # Replace WebSocket client with SSE + fetch
  [existing HTML files]
```

### Key Changes

**server/events.php** (SSE Stream):
```php
<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no'); // Nginx

$sessionCode = $_GET['code'] ?? '';
$lastEventId = $_GET['lastEventId'] ?? 0;

// Loop: check for updates, send events, sleep
while (true) {
    $updates = getUpdates($sessionCode, $lastEventId);

    foreach ($updates as $update) {
        echo "id: {$update['id']}\n";
        echo "data: " . json_encode($update['data']) . "\n\n";
        flush();
    }

    sleep(1); // Adjust based on needs
}
```

**server/api.php** (REST API):
```php
<?php
$action = $_POST['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true);

switch ($action) {
    case 'create_session':
        $code = createSession();
        echo json_encode(['code' => $code]);
        break;
    case 'join':
        joinSession($data['code'], $data['role']);
        break;
    case 'buzz':
        handleBuzz($data['code'], $data['judge_id']);
        break;
    // ... other actions
}
```

**www/app.js** (Client):
```javascript
class SpecIdolClient {
    constructor() {
        this.eventSource = null;
        this.sessionCode = null;
    }

    connect(code) {
        this.sessionCode = code;
        this.eventSource = new EventSource(
            `../server/events.php?code=${code}`
        );

        this.eventSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this.handleMessage(data);
        };

        this.eventSource.onerror = () => {
            // Auto-reconnects
        };
    }

    async send(action, data) {
        await fetch('../server/api.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action, data})
        });
    }
}
```

### Session Storage

**Option A: File-based** (simplest):
```php
// Store in server/sessions/{code}.json
function saveSession($code, $data) {
    file_put_contents(
        "sessions/{$code}.json",
        json_encode($data)
    );
}
```

**Option B: SQLite** (better for concurrent access):
```php
$db = new PDO('sqlite:sessions.db');
// Create tables for sessions, clients, rounds
```

## Migration Steps

1. **Keep Python server running** (backward compatible during migration)
2. **Implement PHP SSE endpoints** (events.php, api.php)
3. **Add feature flag in app.js** to switch between WebSocket/SSE
4. **Test SSE version** with existing HTML clients
5. **Deploy PHP version**
6. **Remove Python server**

## Performance Considerations

### SSE Connection Limits
- Browsers limit SSE connections per domain (usually 6)
- For projector + judges + controller: OK
- For large audiences: Consider external service

### PHP Process Timeouts
- SSE requires long-running PHP scripts
- Set `set_time_limit(0)` in events.php
- Configure `max_execution_time` in php.ini
- Some shared hosts may still kill long processes

### Shared Hosting Limitations
- Check hosting provider allows long-running scripts
- Test SSE endpoint doesn't timeout
- If timeouts persist: Use short polling instead

## Testing Checklist

- [ ] SSE connection establishes and stays open
- [ ] Multiple clients can connect simultaneously
- [ ] Actions via AJAX trigger SSE updates to other clients
- [ ] Reconnection works after network interruption
- [ ] No memory leaks in long-running events.php
- [ ] Works across different browsers
- [ ] PHP error logs clean

## Hosting Provider Questions

Before refactoring, verify with your ISP:
1. Does hosting support long-running PHP scripts?
2. What's max_execution_time limit?
3. Are there process limits per account?
4. Can you use SQLite or only MySQL?
5. Is command-line PHP access available? (If yes, Ratchet possible)

## Cost-Benefit Analysis

| Approach | Setup Time | Ongoing Cost | Performance | Hosting Reqs |
|----------|-----------|--------------|-------------|--------------|
| SSE + AJAX | 2-3 days | $0 | Good | Shared PHP |
| Long Polling | 1-2 days | $0 | Fair | Any PHP |
| External Service | 1-2 days | $0-20/mo | Excellent | Any |
| VPS + Ratchet | 2-3 days | $5-10/mo | Excellent | VPS |

## Recommendation

**For immediate deployment on shared hosting: SSE + AJAX**

1. Works on standard PHP hosting
2. Reasonable performance for small-medium events
3. No external dependencies
4. Easiest migration path

**If ISP confirms no long-running script support: External Service (Pusher/Ably)**

## Resources

- [Ratchet Documentation](http://socketo.me/)
- [PHP WebSocket Guide](https://websocket.org/guides/languages/php/)
- [SSE vs WebSockets Comparison](https://germano.dev/sse-websockets/)
- [Real-Time Technology Comparison](https://medium.com/@kamlesh90/long-polling-vs-sse-vs-websockets-vs-webhooks-which-real-time-technology-should-developers-choose-e965388a6174)
- [WebSocket Alternatives](https://www.pubnub.com/blog/websockets-alternatives-for-realtime-communication/)
- [Ratchet Deployment Tutorial](https://tutorialsjoint.com/php-websocket-ratchet/)
