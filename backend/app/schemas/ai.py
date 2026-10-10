from pydantic import BaseModel
from typing import List

class ScreamCheckResponse(BaseModel):
    is_scream: bool
    confidence: float
    features: dict = {}

class AccelerometerReading(BaseModel):
    x: float
    y: float
    z: float

class MotionCheckRequest(BaseModel):
    readings: List[AccelerometerReading]

class MotionCheckResponse(BaseModel):
    anomaly: bool
    score: float
    details: dict = {}
