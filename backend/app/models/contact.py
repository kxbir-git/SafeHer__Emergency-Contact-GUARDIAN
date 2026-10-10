from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True, default="")
    relation = Column(String(100), nullable=False, default="Family")
    is_guardian = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="contacts")
