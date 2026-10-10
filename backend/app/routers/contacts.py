from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.contact import EmergencyContact
from app.schemas.contact import ContactCreate, ContactResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/contacts", tags=["Emergency Contacts"])

@router.get("", response_model=List[ContactResponse])
def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all emergency contacts for the authenticated user."""
    return db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def add_contact(
    req: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a new emergency contact (max 5 contacts per user)."""
    count = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).count()
    if count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum limit of 5 emergency contacts reached. Please remove one before adding."
        )

    contact = EmergencyContact(
        user_id=current_user.id,
        name=req.name.strip(),
        phone=req.phone.strip(),
        email=req.email.strip() if req.email else "",
        relation=req.relation.strip(),
        is_guardian=req.is_guardian
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an emergency contact."""
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found."
        )

    db.delete(contact)
    db.commit()
    return None
