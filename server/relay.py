import asyncio
import json
import random
import string
import time
from datetime import datetime
import websockets
from websockets.server import serve

# Single session state (in memory)
session = {
    "code": None,
    "config": {
        "timer_duration": 120,
        "speed_options": [1, 2, 3],
        "judge_count": 3
    },
    "clients": {},  # {websocket: {"role": "judge", "judge_id": 1}}
    "stories": [],
    "current_round": {
        "story_index": None,
        "title": None,
        "text": None,
        "start_time": None,
        "speed": 1,
        "paused": False,
        "pause_time": None,
        "elapsed_at_pause": 0,
        "buzzes": [],
        "status": "waiting"
    },
    "history": [],
    "judge_slots": {1: None, 2: None, 3: None}  # {judge_id: websocket}
}

def generate_code():
    """Generate 4 uppercase letter code"""
    return ''.join(random.choices(string.ascii_uppercase, k=4))

async def handle_message(websocket, message_data):
    """Process incoming message and broadcast responses"""
    msg_type = message_data.get("type")
    data = message_data.get("data", {})

    if msg_type == "create_session":
        session["code"] = generate_code()
        session["clients"][websocket] = {"role": "controller"}
        await websocket.send(json.dumps({
            "type": "session_created",
            "data": {"code": session["code"]}
        }))

    elif msg_type == "join":
        code = data.get("code")
        role = data.get("role")
        judge_id = data.get("judge_id")

        if session["code"] and code != session["code"]:
            await websocket.send(json.dumps({
                "type": "error",
                "data": {"message": "Invalid session code"}
            }))
            return

        if role == "judge":
            if judge_id not in session["judge_slots"]:
                await websocket.send(json.dumps({
                    "type": "error",
                    "data": {"message": f"Invalid judge number: {judge_id}"}
                }))
                return
            if session["judge_slots"][judge_id] is not None:
                await websocket.send(json.dumps({
                    "type": "error",
                    "data": {"message": f"Judge {judge_id} slot already taken"}
                }))
                return
            session["judge_slots"][judge_id] = websocket
            session["clients"][websocket] = {"role": "judge", "judge_id": judge_id}
        else:
            session["clients"][websocket] = {"role": role}

        # Send full session state to joining client
        await websocket.send(json.dumps({
            "type": "session_state",
            "data": {
                "code": session["code"],
                "config": session["config"],
                "stories": session["stories"],
                "current_round": session["current_round"],
                "history": session["history"],
                "client_info": session["clients"][websocket]
            }
        }))

async def broadcast(message, exclude=None):
    """Send message to all connected clients except exclude"""
    websockets_to_send = [
        ws for ws in session["clients"].keys()
        if ws != exclude and ws.open
    ]
    if websockets_to_send:
        await asyncio.gather(
            *[ws.send(json.dumps(message)) for ws in websockets_to_send],
            return_exceptions=True
        )

async def handler(websocket):
    """Handle WebSocket connection"""
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                await handle_message(websocket, data)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid JSON"}
                }))
    finally:
        # Clean up on disconnect
        client_info = session["clients"].pop(websocket, None)
        if client_info and client_info.get("role") == "judge":
            judge_id = client_info.get("judge_id")
            if session["judge_slots"].get(judge_id) == websocket:
                session["judge_slots"][judge_id] = None

async def main():
    async with serve(handler, "localhost", 8765):
        print("WebSocket server running on ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
