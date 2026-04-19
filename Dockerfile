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
