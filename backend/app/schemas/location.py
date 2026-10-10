from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LocationUpdateRequest(BaseModel):
    lat: float
    lng: float

class LocationResponse(BaseModel):
    id: int
    user_id: int
    lat: float
    lng: float
    updated_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
