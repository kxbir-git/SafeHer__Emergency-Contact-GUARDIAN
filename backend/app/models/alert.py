import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # SOS, scream, shake, voice
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    status = Column(String(50), default="triggered", nullable=False)  # triggered, acknowledged, resolved
    confidence = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="alerts")
