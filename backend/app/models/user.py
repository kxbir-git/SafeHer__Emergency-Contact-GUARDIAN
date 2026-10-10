import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False, default="")
    blood_group = Column(String(10), nullable=True, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="reporter")
