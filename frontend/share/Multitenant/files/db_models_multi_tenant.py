"""
Multi-Tenant Database Models for HVAC Voice Agent.

NEW MODELS:
- Tenant: HVAC company tenant
- TenantUsage: Daily usage tracking
- TenantAPIKey: Programmatic access
- TenantUser: Dashboard users

UPDATED MODELS:
- Location: Added tenant_id
- Appointment: Added tenant_id
- EmergencyLog: Added tenant_id
- CallLog: Added tenant_id
"""

from datetime import datetime, date, time
from typing import Optional, Dict, Any
import json

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
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import JSONB
import enum


Base = declarative_base()


# ============================================================================
# ENUMERATIONS
# ============================================================================

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


class PricingTier(enum.Enum):
    """Tenant pricing tiers."""
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class UserRole(enum.Enum):
    """Tenant user roles."""
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"


# ============================================================================
# CORE TENANT MODEL
# ============================================================================

class Tenant(Base):
    """
    Multi-tenant HVAC company model.
    
    Each tenant represents one HVAC company using the AI agent.
    """
    __tablename__ = "tenants"

    # Primary identification
    id: str = Column(String(50), primary_key=True, index=True)  # e.g., 'acme_hvac'
    company_name: str = Column(String(200), nullable=False)
    display_name: Optional[str] = Column(String(200))  # For voice prompts
    website: Optional[str] = Column(String(255))
    
    # Twilio configuration
    twilio_phone_number: str = Column(String(20), unique=True, nullable=False, index=True)
    twilio_account_sid: Optional[str] = Column(String(100))
    twilio_auth_token: Optional[str] = Column(String(100))
    forward_to_number: str = Column(String(20), nullable=False)
    emergency_phone: Optional[str] = Column(String(20))
    
    # Business configuration
    timezone: str = Column(String(50), default='America/Chicago')
    business_hours: Dict[str, Any] = Column(JSONB, default=dict)
    service_areas: list = Column(JSONB, default=list)
    
    # AI configuration
    ai_model: str = Column(String(50), default='gpt-4o-mini')
    ai_voice: str = Column(String(50), default='alloy')
    ai_temperature: float = Column(Numeric(3, 2), default=0.7)
    use_elevenlabs: bool = Column(Boolean, default=False)
    elevenlabs_voice_id: Optional[str] = Column(String(100))
    
    # Custom AI instructions
    custom_system_prompt: Optional[str] = Column(Text)
    greeting_message: Optional[str] = Column(Text)
    emergency_keywords: list = Column(JSONB, default=list)
    qualification_criteria: Dict[str, Any] = Column(JSONB, default=dict)
    
    # Pricing & billing
    pricing_tier: str = Column(String(20), default='basic')
    monthly_rate: Optional[float] = Column(Numeric(10, 2))
    setup_fee: Optional[float] = Column(Numeric(10, 2))
    max_concurrent_calls: int = Column(Integer, default=5)
    
    # Feature flags
    features: Dict[str, Any] = Column(JSONB, default=dict)
    
    # Status
    is_active: bool = Column(Boolean, default=True, index=True)
    is_test_mode: bool = Column(Boolean, default=False)
    onboarded_at: datetime = Column(DateTime, default=datetime.utcnow)
    onboarded_by: Optional[str] = Column(String(100))
    
    # Usage tracking
    total_calls: int = Column(Integer, default=0)
    total_appointments: int = Column(Integer, default=0)
    last_call_at: Optional[datetime] = Column(DateTime)
    
    # Timestamps
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    locations = relationship("Location", back_populates="tenant", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="tenant", cascade="all, delete-orphan")
    emergency_logs = relationship("EmergencyLog", back_populates="tenant", cascade="all, delete-orphan")
    call_logs = relationship("CallLog", back_populates="tenant", cascade="all, delete-orphan")
    usage_records = relationship("TenantUsage", back_populates="tenant", cascade="all, delete-orphan")
    api_keys = relationship("TenantAPIKey", back_populates="tenant", cascade="all, delete-orphan")
    users = relationship("TenantUser", back_populates="tenant", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Tenant {self.id} ({self.company_name})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "company_name": self.company_name,
            "display_name": self.display_name,
            "twilio_phone_number": self.twilio_phone_number,
            "forward_to_number": self.forward_to_number,
            "timezone": self.timezone,
            "service_areas": self.service_areas,
            "pricing_tier": self.pricing_tier,
            "is_active": self.is_active,
            "total_calls": self.total_calls,
            "total_appointments": self.total_appointments,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ============================================================================
# UPDATED EXISTING MODELS WITH TENANT SUPPORT
# ============================================================================

class Location(Base):
    """HVAC service location model (multi-tenant)."""
    __tablename__ = "locations"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    
    name: str = Column(String(100), nullable=False)
    code: str = Column(String(10), index=True)
    timezone: Optional[str] = Column(String(50))
    address: Optional[str] = Column(String(255))
    phone: Optional[str] = Column(String(20))
    emergency_phone: Optional[str] = Column(String(20))
    is_active: bool = Column(Boolean, default=True)
    opening_hour: int = Column(Integer, default=8)
    closing_hour: int = Column(Integer, default=18)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="locations")
    appointments = relationship("Appointment", back_populates="location")
    emergency_logs = relationship("EmergencyLog", back_populates="location")

    def __repr__(self) -> str:
        return f"<Location {self.code} ({self.name}) - Tenant: {self.tenant_id}>"

    def is_open(self, check_hour: int) -> bool:
        """Check if location is open at given hour."""
        return self.opening_hour <= check_hour < self.closing_hour


class Appointment(Base):
    """Customer appointment model (multi-tenant)."""
    __tablename__ = "appointments"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    
    customer_name: str = Column(String(100), nullable=False)
    customer_phone: Optional[str] = Column(String(20))
    customer_email: Optional[str] = Column(String(255))
    date: date = Column(Date, nullable=False, index=True)
    time: time = Column(Time, nullable=False)
    issue: str = Column(String(500), nullable=False)
    issue_category: Optional[str] = Column(String(50))
    priority: int = Column(Integer, default=3)
    notes: Optional[str] = Column(Text)
    is_confirmed: bool = Column(Boolean, default=False)
    is_cancelled: bool = Column(Boolean, default=False)
    estimated_duration: int = Column(Integer, default=60)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    location_id: int = Column(Integer, ForeignKey("locations.id"), nullable=False)
    call_sid: Optional[str] = Column(String(50))

    # Relationships
    tenant = relationship("Tenant", back_populates="appointments")
    location = relationship("Location", back_populates="appointments")

    def __repr__(self) -> str:
        return f"<Appointment {self.customer_name} - Tenant: {self.tenant_id}>"


class EmergencyLog(Base):
    """Emergency call log (multi-tenant)."""
    __tablename__ = "emergency_logs"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    
    call_sid: str = Column(String(50), nullable=False, index=True)
    caller_phone: str = Column(String(20), nullable=False)
    emergency_type: str = Column(String(50), nullable=False)
    description: str = Column(Text, nullable=False)
    was_transferred: bool = Column(Boolean, default=False)
    transfer_number: Optional[str] = Column(String(20))
    resolution_notes: Optional[str] = Column(Text)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at: Optional[datetime] = Column(DateTime)
    location_id: Optional[int] = Column(Integer, ForeignKey("locations.id"))

    # Relationships
    tenant = relationship("Tenant", back_populates="emergency_logs")
    location = relationship("Location", back_populates="emergency_logs")

    def __repr__(self) -> str:
        return f"<EmergencyLog {self.emergency_type} - Tenant: {self.tenant_id}>"


class CallLog(Base):
    """Call history (multi-tenant)."""
    __tablename__ = "call_logs"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    
    call_sid: str = Column(String(50), nullable=False, unique=True, index=True)
    caller_phone: str = Column(String(20), nullable=False)
    called_number: str = Column(String(20), nullable=False)
    status: str = Column(String(20), default="initiated")
    duration_seconds: Optional[int] = Column(Integer)
    transcript: Optional[str] = Column(Text)
    sentiment_score: Optional[float] = Column(Float)
    intent_detected: Optional[str] = Column(String(100))
    was_successful: bool = Column(Boolean, default=False)
    error_message: Optional[str] = Column(Text)
    created_at: datetime = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at: Optional[datetime] = Column(DateTime)

    # Relationships
    tenant = relationship("Tenant", back_populates="call_logs")

    def __repr__(self) -> str:
        return f"<CallLog {self.call_sid} - Tenant: {self.tenant_id}>"


# ============================================================================
# NEW MULTI-TENANT SUPPORTING MODELS
# ============================================================================

class TenantUsage(Base):
    """Daily usage tracking per tenant."""
    __tablename__ = "tenant_usage"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    date: date = Column(Date, nullable=False, index=True)
    
    # Usage metrics
    calls_count: int = Column(Integer, default=0)
    calls_duration_seconds: int = Column(Integer, default=0)
    appointments_booked: int = Column(Integer, default=0)
    emergencies_handled: int = Column(Integer, default=0)
    transfers_count: int = Column(Integer, default=0)
    
    # Cost tracking
    openai_tokens_used: int = Column(Integer, default=0)
    elevenlabs_characters_used: int = Column(Integer, default=0)
    twilio_minutes_used: float = Column(Numeric(10, 2), default=0)
    
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="usage_records")
    
    __table_args__ = (
        UniqueConstraint('tenant_id', 'date', name='uq_tenant_usage_date'),
    )

    def __repr__(self) -> str:
        return f"<TenantUsage {self.tenant_id} - {self.date}>"


class TenantAPIKey(Base):
    """API keys for programmatic tenant access."""
    __tablename__ = "tenant_api_keys"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    
    key_hash: str = Column(String(100), unique=True, nullable=False, index=True)
    key_prefix: str = Column(String(10))  # First 8 chars for display
    
    name: Optional[str] = Column(String(100))
    scopes: list = Column(JSONB, default=list)
    
    is_active: bool = Column(Boolean, default=True, index=True)
    last_used_at: Optional[datetime] = Column(DateTime)
    
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    created_by: Optional[str] = Column(String(100))
    expires_at: Optional[datetime] = Column(DateTime)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="api_keys")

    def __repr__(self) -> str:
        return f"<TenantAPIKey {self.key_prefix}... - Tenant: {self.tenant_id}>"


class TenantUser(Base):
    """Users who can access tenant dashboard."""
    __tablename__ = "tenant_users"

    id: int = Column(Integer, primary_key=True, index=True)
    tenant_id: str = Column(String(50), ForeignKey("tenants.id"), nullable=False, index=True)
    
    email: str = Column(String(255), unique=True, nullable=False, index=True)
    password_hash: str = Column(String(255))
    full_name: Optional[str] = Column(String(200))
    
    role: str = Column(String(20), default='admin')
    
    is_active: bool = Column(Boolean, default=True)
    email_verified: bool = Column(Boolean, default=False)
    
    last_login_at: Optional[datetime] = Column(DateTime)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")

    def __repr__(self) -> str:
        return f"<TenantUser {self.email} - Tenant: {self.tenant_id}>"
