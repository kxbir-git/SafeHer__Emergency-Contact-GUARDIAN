from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import oauth2_scheme, get_current_user
from app.services.socket_manager import socket_manager

router = APIRouter(prefix="/ws", tags=["WebSocket"])

@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """WebSocket connection for real-time alerts.
    Clients must provide a valid JWT token as a query parameter `token`.
    The connection is registered with the socket manager and receives broadcast messages.
    """
    # Authenticate user
    try:
        user = get_current_user(token=token, db=db)
    except Exception as e:
        await websocket.close(code=1008)
        return

    await socket_manager.connect(websocket, user_id=user.id)
    try:
        while True:
            # Keep connection alive; we don't expect messages from client.
            await websocket.receive_text()
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket, user_id=user.id)
    except Exception:
        socket_manager.disconnect(websocket, user_id=user.id)
