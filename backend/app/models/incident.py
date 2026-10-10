import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)  # Harassment, Poor Lighting, Suspicious Activity, Stalking, Other
    description = Column(String(1000), nullable=False)
    severity = Column(String(50), default="Medium", nullable=False)  # Low, Medium, High, Critical
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    reporter = relationship("User", back_populates="incidents")
