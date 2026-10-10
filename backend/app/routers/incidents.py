import math
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.incident import Incident
from app.schemas.incident import IncidentCreateRequest, IncidentResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents & Safety Map"])

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/nearby", response_model=List[IncidentResponse])
def get_nearby_incidents(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(15.0, description="Radius in kilometers"),
    db: Session = Depends(get_db)
):
    """
    Returns incident reports within the specified radius.
    Computes distance and provides data for safe route evaluation.
    """
    all_incidents = db.query(Incident).all()
    results = []

    for inc in all_incidents:
        dist = haversine_distance(lat, lng, inc.lat, inc.lng)
        if dist <= radius:
            resp = IncidentResponse.model_validate(inc)
            resp.distance_km = round(dist, 2)
            results.append(resp)

    # Sort closest first
    results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)
    return results

@router.post("/report", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(
    req: IncidentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new user-reported safety hazard or incident."""
    incident = Incident(
        user_id=current_user.id,
        lat=req.lat,
        lng=req.lng,
        category=req.category.strip(),
        description=req.description.strip(),
        severity=req.severity.strip(),
        created_at=datetime.utcnow()
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    return IncidentResponse.model_validate(incident)
