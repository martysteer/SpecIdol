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

CONTROLLER_ONLY = {"add_story", "remove_story", "round_start", "speed_change",
                    "pause", "resume", "reset_round", "import_session"}

async def handle_message(websocket, message_data):
    """Process incoming message and broadcast responses"""
    msg_type = message_data.get("type")
    data = message_data.get("data", {})

    # Auth check for controller-only actions
    if msg_type in CONTROLLER_ONLY:
        client_info = session["clients"].get(websocket, {})
        if client_info.get("role") != "controller":
            await websocket.send(json.dumps({
                "type": "error",
                "data": {"message": "Only controller can perform this action"}
            }))
            return

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
                "client_info": session["clients"][websocket],
                "server_time": time.time()
            }
        }))

    elif msg_type == "add_story":
        title = data.get("title", "Untitled")
        text = data.get("text", "")
        session["stories"].append({"title": title, "text": text})
        await broadcast({
            "type": "story_added",
            "data": {"index": len(session["stories"]) - 1, "title": title}
        })

    elif msg_type == "remove_story":
        story_index = data.get("story_index")
        if story_index is not None and 0 <= story_index < len(session["stories"]):
            session["stories"].pop(story_index)
            await broadcast({
                "type": "story_removed",
                "data": {"index": story_index}
            })

    elif msg_type == "round_start":
        story_index = data.get("story_index", 0)
        if story_index >= len(session["stories"]):
            await websocket.send(json.dumps({
                "type": "error",
                "data": {"message": "Invalid story index"}
            }))
            return

        story = session["stories"][story_index]
        session["current_round"] = {
            "story_index": story_index,
            "title": story["title"],
            "text": story["text"],
            "start_time": time.time(),
            "speed": 1,
            "paused": False,
            "pause_time": None,
            "elapsed_at_pause": 0,
            "buzzes": [],
            "status": "running"
        }

        now = session["current_round"]["start_time"]
        await broadcast({
            "type": "round_started",
            "data": {
                "title": story["title"],
                "text": story["text"],
                "start_time": now,
                "server_time": now
            }
        })

    elif msg_type == "speed_change":
        speed = data.get("speed", 1)
        if speed not in session["config"]["speed_options"]:
            return
        session["current_round"]["speed"] = speed
        await broadcast({
            "type": "speed_changed",
            "data": {"speed": speed, "timestamp": time.time()}
        })

    elif msg_type == "pause":
        if session["current_round"]["status"] == "running":
            now = time.time()
            elapsed = now - session["current_round"]["start_time"]
            session["current_round"]["paused"] = True
            session["current_round"]["pause_time"] = now
            session["current_round"]["elapsed_at_pause"] = elapsed
            session["current_round"]["status"] = "paused"
            await broadcast({
                "type": "paused",
                "data": {"timestamp": now, "elapsed": elapsed}
            })

    elif msg_type == "resume":
        if session["current_round"]["status"] == "paused":
            now = time.time()
            session["current_round"]["start_time"] = now - session["current_round"]["elapsed_at_pause"]
            session["current_round"]["paused"] = False
            session["current_round"]["status"] = "running"
            await broadcast({
                "type": "resumed",
                "data": {
                    "timestamp": now,
                    "elapsed": session["current_round"]["elapsed_at_pause"]
                }
            })

    elif msg_type == "buzz":
        # Only accept buzzes during a running round
        if session["current_round"]["status"] != "running":
            return

        judge_id = data.get("judge_id")
        client_info = session["clients"].get(websocket, {})

        # Verify this is actually a judge
        if client_info.get("role") != "judge" or client_info.get("judge_id") != judge_id:
            return

        # Check if already buzzed
        if any(b["judge_id"] == judge_id for b in session["current_round"]["buzzes"]):
            return

        now = time.time()
        elapsed = now - session["current_round"]["start_time"]
        buzz_entry = {"judge_id": judge_id, "time": round(elapsed, 1)}
        session["current_round"]["buzzes"].append(buzz_entry)

        await broadcast({
            "type": "buzzed",
            "data": buzz_entry
        })

        # Check if all connected judges have buzzed
        connected_judges = sum(1 for slot in session["judge_slots"].values() if slot is not None)
        if len(session["current_round"]["buzzes"]) >= connected_judges:
            session["current_round"]["status"] = "defeat"
            outcome_data = {
                "outcome": "defeat",
                "buzzes": session["current_round"]["buzzes"],
                "duration": session["current_round"]["buzzes"][-1]["time"]
            }
            session["history"].append({
                "title": session["current_round"]["title"],
                **outcome_data
            })
            await broadcast({
                "type": "round_ended",
                "data": outcome_data
            })

    elif msg_type == "victory":
        # Client detected timer reached limit
        if session["current_round"]["status"] == "running":
            session["current_round"]["status"] = "victory"
            outcome_data = {
                "outcome": "victory",
                "buzzes": session["current_round"]["buzzes"],
                "duration": session["config"]["timer_duration"]
            }
            session["history"].append({
                "title": session["current_round"]["title"],
                **outcome_data
            })
            await broadcast({
                "type": "round_ended",
                "data": outcome_data
            })

    elif msg_type == "reset_round":
        session["current_round"] = {
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
        }
        await broadcast({
            "type": "round_reset",
            "data": {}
        })

    elif msg_type == "import_session":
        stories = data.get("stories", [])
        config = data.get("config", {})

        # Validate stories format
        if not isinstance(stories, list):
            await websocket.send(json.dumps({
                "type": "error",
                "data": {"message": "Invalid stories format"}
            }))
            return

        for story in stories:
            if not isinstance(story, dict) or "title" not in story or "text" not in story:
                await websocket.send(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid story format"}
                }))
                return

        # Merge config (only allowed keys)
        if "timer_duration" in config:
            session["config"]["timer_duration"] = int(config["timer_duration"])
        if "judge_count" in config:
            session["config"]["judge_count"] = int(config["judge_count"])

        # Replace stories
        session["stories"] = stories

        await broadcast({
            "type": "session_imported",
            "data": {"story_count": len(stories)}
        })

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
