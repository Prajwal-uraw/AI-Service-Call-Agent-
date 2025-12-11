"""
Database models for HVAC Voice Agent.

Models:
- Location: Service locations (Dallas, Fort Worth, etc.)
- Appointment: Customer appointments
- EmergencyLog: Emergency call tracking
- CallLog: All call history for analytics
"""

from datetime import datetime, date, time
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
    Enum,
    Float,
)
from sqlalchemy.orm import declarative_base, relationship
import enum


Base = declarative_base()


class CallStatus(enum.Enum):
    """Call status enumeration."""
    INITIATED = "initiated"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    TRANSFERRED = "transferred"
    EMERGENCY = "emergency"
    FAILED = "failed"


class EmergencyType(enum.Enum):
    """Emergency type classification."""
    GAS_LEAK = "gas_leak"
    NO_HEAT_EXTREME_COLD = "no_heat_extreme_cold"
    NO_AC_EXTREME_HEAT = "no_ac_extreme_heat"
    CARBON_MONOXIDE = "carbon_monoxide"
    ELECTRICAL_FIRE = "electrical_fire"
    FLOODING = "flooding"
    OTHER = "other"


class Location(Base):
    """HVAC service location model."""
    __tablename__ = "locations"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(100), nullable=False)  # e.g. "Dallas"
    code: str = Column(String(10), unique=True, index=True)  # e.g. "DAL"
    timezone: Optional[str] = Column(String(50), nullable=True)
    address: Optional[str] = Column(String(255), nullable=True)
    phone: Optional[str] = Column(String(20), nullable=True)
    emergency_phone: Optional[str] = Column(String(20), nullable=True)
    is_active: bool = Column(Boolean, default=True)
    opening_hour: int = Column(Integer, default=8)  # 24-hour format
    closing_hour: int = Column(Integer, default=18)  # 24-hour format
    created_at: datetime = Column(DateTime, default=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="location")
    emergency_logs = relationship("EmergencyLog", back_populates="location")

    def __repr__(self) -> str:
        return f"<Location {self.code} ({self.name})>"

    def is_open(self, check_hour: int) -> bool:
        """Check if location is open at given hour."""
        return self.opening_hour <= check_hour < self.closing_hour


class Appointment(Base):
    """Customer appointment model."""
    __tablename__ = "appointments"

    id: int = Column(Integer, primary_key=True, index=True)
    customer_name: str = Column(String(100), nullable=False)
    customer_phone: Optional[str] = Column(String(20), nullable=True)
    date: date = Column(Date, nullable=False)
    time: time = Column(Time, nullable=False)
    issue: str = Column(String(500), nullable=False)
    issue_category: Optional[str] = Column(String(50), nullable=True)  # AC, Heating, Maintenance, etc.
    priority: int = Column(Integer, default=3)  # 1=High, 2=Medium, 3=Normal
    notes: Optional[str] = Column(Text, nullable=True)
    is_confirmed: bool = Column(Boolean, default=False)
    is_cancelled: bool = Column(Boolean, default=False)
    estimated_duration: int = Column(Integer, default=60)  # minutes
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    location_id: int = Column(Integer, ForeignKey("locations.id"), nullable=False)
    call_sid: Optional[str] = Column(String(50), nullable=True)  # Twilio CallSid

    location = relationship("Location", back_populates="appointments")

    def __repr__(self) -> str:
        d: date = self.date
        t: time = self.time
        return f"<Appointment {self.customer_name} {d.isoformat()} {t.strftime('%H:%M')} @ {self.location_id}>"


class EmergencyLog(Base):
    """Emergency call log for tracking urgent situations."""
    __tablename__ = "emergency_logs"

    id: int = Column(Integer, primary_key=True, index=True)
    call_sid: str = Column(String(50), nullable=False, index=True)
    caller_phone: str = Column(String(20), nullable=False)
    emergency_type: str = Column(String(50), nullable=False)
    description: str = Column(Text, nullable=False)
    was_transferred: bool = Column(Boolean, default=False)
    transfer_number: Optional[str] = Column(String(20), nullable=True)
    resolution_notes: Optional[str] = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    resolved_at: Optional[datetime] = Column(DateTime, nullable=True)
    location_id: Optional[int] = Column(Integer, ForeignKey("locations.id"), nullable=True)

    location = relationship("Location", back_populates="emergency_logs")

    def __repr__(self) -> str:
        return f"<EmergencyLog {self.emergency_type} @ {self.created_at}>"


class CallLog(Base):
    """Call history for analytics and debugging."""
    __tablename__ = "call_logs"

    id: int = Column(Integer, primary_key=True, index=True)
    call_sid: str = Column(String(50), nullable=False, unique=True, index=True)
    caller_phone: str = Column(String(20), nullable=False)
    called_number: str = Column(String(20), nullable=False)
    status: str = Column(String(20), default="initiated")
    duration_seconds: Optional[int] = Column(Integer, nullable=True)
    transcript: Optional[str] = Column(Text, nullable=True)
    sentiment_score: Optional[float] = Column(Float, nullable=True)  # -1 to 1
    intent_detected: Optional[str] = Column(String(100), nullable=True)
    was_successful: bool = Column(Boolean, default=False)
    error_message: Optional[str] = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    ended_at: Optional[datetime] = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<CallLog {self.call_sid} - {self.status}>"
