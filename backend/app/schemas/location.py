from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)

