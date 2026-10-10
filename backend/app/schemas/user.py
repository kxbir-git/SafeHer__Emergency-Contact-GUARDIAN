from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    blood_group: Optional[str] = ""

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None

class EmergencyContactBrief(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = ""
    relation: str
    is_guardian: bool

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    created_at: datetime
    contacts: List[EmergencyContactBrief] = []

    class Config:
        from_attributes = True
