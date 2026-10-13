from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.services.socket_manager import socket_manager

try:
    from jose import JWTError, jwt
except ImportError:
    import jwt
    class JWTError(Exception):
        pass

router = APIRouter(prefix="/ws", tags=["WebSocket"])

async def handle_ws_session(websocket: WebSocket, token: Optional[str] = None):
    user_id = None
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            user_id_str = payload.get("sub")
            if user_id_str:
                user_id = int(user_id_str)
        except Exception:
            pass

    await socket_manager.connect(websocket, user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event":"pong"}')
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket, user_id=user_id)
    except Exception:
        socket_manager.disconnect(websocket, user_id=user_id)

@router.websocket("/alerts")
async def websocket_alerts_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """Real-time WebSocket alerts channel (subscribed by frontend clients & guardians)."""
    await handle_ws_session(websocket, token)

@router.websocket("/connect")
async def websocket_connect_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """Backwards-compatible WebSocket connect endpoint."""
    await handle_ws_session(websocket, token)

