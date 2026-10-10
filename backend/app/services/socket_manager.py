import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("safeher.sockets")

class ConnectionManager:
    """Manages active WebSocket connections for real-time safety alert broadcasting."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
        logger.info(f"WebSocket client connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast an event payload to all connected subscribers (guardians/responders)."""
        payload = json.dumps(message)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                dead_connections.append(connection)
        
        for dead in dead_connections:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

    async def send_to_user(self, user_id: int, message: Dict[str, Any]):
        """Send message specifically to a target user's connections."""
        if user_id in self.user_connections:
            payload = json.dumps(message)
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(payload)
                except Exception:
                    pass

socket_manager = ConnectionManager()
