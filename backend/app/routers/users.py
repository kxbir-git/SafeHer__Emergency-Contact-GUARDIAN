from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves current authenticated user's profile and contacts."""
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user profile details such as name, phone, or blood group."""
    if req.full_name is not None:
        current_user.full_name = req.full_name.strip()
    if req.phone is not None:
        current_user.phone = req.phone.strip()
    if req.blood_group is not None:
        current_user.blood_group = req.blood_group.strip()

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
