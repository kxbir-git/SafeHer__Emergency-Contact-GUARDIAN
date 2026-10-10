from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    blood_group: Optional[str] = ""

# Import for forward reference
from app.schemas.user import UserResponse
Token.model_rebuild()
