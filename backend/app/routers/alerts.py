from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertTriggerRequest, AlertResponse
from app.services.alert_service import alert_service
from app.services.socket_manager import socket_manager
from app.utils.security import get_current_user

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])

@router.post("/trigger", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def trigger_alert(
    req: AlertTriggerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers an emergency alert (SOS, scream, shake, voice).
    Persists alert in database and broadcasts in real-time across WebSockets and SMS.
    """
    alert = Alert(
        user_id=current_user.id,
        type=req.type.lower(),
        lat=req.lat,
        lng=req.lng,
        status="triggered",
        confidence=float(req.meta.get("confidence", 1.0)) if req.meta else 1.0,
        created_at=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Dispatch via multi-channel real-time service
    await alert_service.dispatch_alert(db=db, alert=alert, user=current_user, meta=req.meta)

    resp = AlertResponse.model_validate(alert)
    resp.user_name = current_user.full_name
    resp.user_phone = current_user.phone
    return resp

@router.get("/history", response_model=List[AlertResponse])
def get_alert_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all past alerts for the user or guardian oversight feed."""
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .limit(limit)
        .all()
    )
    results = []
    for a in alerts:
        res = AlertResponse.model_validate(a)
        res.user_name = current_user.full_name
        res.user_phone = current_user.phone
        results.append(res)
    return results

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks an active alert as acknowledged by a responder or guardian."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")

    alert.status = "acknowledged"
    alert.acknowledged_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)

    await socket_manager.broadcast({
        "event": "alert_acknowledged",
        "data": {
            "alert_id": alert.id,
            "status": alert.status,
            "acknowledged_at": alert.acknowledged_at.isoformat()
        }
    })

    resp = AlertResponse.model_validate(alert)
    resp.user_name = alert.user.full_name if alert.user else "Unknown"
    resp.user_phone = alert.user.phone if alert.user else ""
    return resp

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks an active alert as successfully resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")

    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)

    await socket_manager.broadcast({
        "event": "alert_resolved",
        "data": {
            "alert_id": alert.id,
            "status": alert.status,
            "resolved_at": alert.resolved_at.isoformat()
        }
    })

    resp = AlertResponse.model_validate(alert)
    resp.user_name = alert.user.full_name if alert.user else "Unknown"
    resp.user_phone = alert.user.phone if alert.user else ""
    return resp
