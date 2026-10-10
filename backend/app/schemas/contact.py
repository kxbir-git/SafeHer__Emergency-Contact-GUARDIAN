from pydantic import BaseModel, EmailStr
from typing import Optional

class ContactBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    relation: str = "Family"
    is_guardian: bool = False

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    relation: Optional[str] = None
    is_guardian: Optional[bool] = None

class ContactResponse(ContactBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
