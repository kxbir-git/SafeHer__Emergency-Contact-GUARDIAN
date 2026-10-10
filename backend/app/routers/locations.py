from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.location import Location
from app.schemas.location import LocationUpdateRequest, LocationResponse
from app.services.socket_manager import socket_manager
from app.utils.security import get_current_user

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.post("/update", response_model=LocationResponse)
async def update_location(
    req: LocationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the user's real-time geographic location and broadcasts to active guardian listeners."""
    loc = db.query(Location).filter(Location.user_id == current_user.id).first()
    if not loc:
        loc = Location(user_id=current_user.id, lat=req.lat, lng=req.lng, updated_at=datetime.utcnow())
        db.add(loc)
    else:
        loc.lat = req.lat
        loc.lng = req.lng
        loc.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(loc)

    payload = {
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "lat": loc.lat,
        "lng": loc.lng,
        "updated_at": loc.updated_at.isoformat()
    }

    # Broadcast location update to guardians
    await socket_manager.broadcast({
        "event": "location_updated",
        "data": payload
    })

    resp = LocationResponse.model_validate(loc)
    resp.user_name = current_user.full_name
    return resp

@router.get("/{user_id}/live", response_model=LocationResponse)
def get_live_location(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches the latest live location coordinates for a user."""
    target_id = current_user.id if user_id in ("me", "0") else int(user_id)
    loc = db.query(Location).filter(Location.user_id == target_id).first()
    if not loc:
        # Default placeholder if not reported yet (e.g. Connaught Place, New Delhi)
        return LocationResponse(
            id=0,
            user_id=target_id,
            lat=28.6315,
            lng=77.2167,
            updated_at=datetime.utcnow(),
            user_name=current_user.full_name
        )

    target_user = db.query(User).filter(User.id == target_id).first()
    resp = LocationResponse.model_validate(loc)
    resp.user_name = target_user.full_name if target_user else "User"
    return resp
