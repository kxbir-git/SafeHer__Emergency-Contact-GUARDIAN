from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime

class AlertTriggerRequest(BaseModel):
    type: str  # SOS, scream, shake, voice
    lat: float
    lng: float
    meta: Optional[Dict[str, Any]] = None

class AlertResponse(BaseModel):
    id: int
    user_id: int
    type: str
    lat: float
    lng: float
    status: str
    confidence: float
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    user_name: Optional[str] = None
    user_phone: Optional[str] = None

    class Config:
        from_attributes = True

class AlertStatusUpdate(BaseModel):
    status: str
