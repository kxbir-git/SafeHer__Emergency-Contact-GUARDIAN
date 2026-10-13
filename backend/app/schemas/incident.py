from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class IncidentCreateRequest(BaseModel):
    lat: float
    lng: float
    category: str
    description: str
    severity: str = "Medium"

class IncidentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    lat: float
    lng: float
    category: str
    description: str
    severity: str
    created_at: datetime
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

