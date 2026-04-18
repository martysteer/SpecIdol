.PHONY: servers stop

servers:
	@echo "Starting WebSocket relay server on port 8765..."
	@python3 server/relay.py & echo $$! > .relay.pid
	@echo "Starting HTTP server on port 8000..."
	@python3 -m http.server 8000 --directory www & echo $$! > .http.pid
	@echo ""
	@echo "Servers running:"
	@echo "  - WebSocket relay: ws://localhost:8765"
	@echo "  - HTTP server: http://localhost:8000"
	@echo ""
	@echo "Run 'make stop' to stop servers"
	@wait

stop:
	@if [ -f .relay.pid ]; then \
		kill `cat .relay.pid` 2>/dev/null || true; \
		rm .relay.pid; \
		echo "Stopped WebSocket relay server"; \
	fi
	@if [ -f .http.pid ]; then \
		kill `cat .http.pid` 2>/dev/null || true; \
		rm .http.pid; \
		echo "Stopped HTTP server"; \
	fi
	@lsof -ti :8765 | xargs kill -9 2>/dev/null || true
	@lsof -ti :8000 | xargs kill -9 2>/dev/null || true
