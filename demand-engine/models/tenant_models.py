"""
SQLAlchemy Models for Multi-Tenant System
Ready to use when you have database access
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, DECIMAL, JSON, Text, Date, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class Tenant(Base):
    """
    Voice Agent Customers (HVAC/Plumbing Companies)
    """
    __tablename__ = 'tenants'
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Identification
    slug = Column(String(100), unique=True, nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    subdomain = Column(String(100), unique=True, index=True)
    
    # Business Information
    industry = Column(String(100), default='hvac')
    website_url = Column(Text)
    logo_url = Column(Text)
    
    # Contact Information
    owner_name = Column(String(255), nullable=False)
    owner_email = Column(String(255), nullable=False, unique=True, index=True)
    owner_phone = Column(String(50))
    billing_email = Column(String(255))
    
    # Voice Agent Configuration (Core Product)
    twilio_phone_number = Column(String(20), unique=True, index=True)
    twilio_account_sid = Column(String(100))
    twilio_auth_token = Column(String(100))
    forward_to_number = Column(String(20))
    emergency_phone = Column(String(20))
    
    # Business Hours & Location
    timezone = Column(String(50), default='America/Chicago')
    business_hours = Column(JSON, default={})
    service_areas = Column(JSON, default=[])
    
    # AI Voice Settings
    ai_model = Column(String(50), default='gpt-4o-mini')
    ai_voice = Column(String(50), default='alloy')
    ai_temperature = Column(DECIMAL(3, 2), default=0.7)
    use_elevenlabs = Column(Boolean, default=False)
    elevenlabs_voice_id = Column(String(100))
    
    # Custom Prompts & Instructions
    custom_system_prompt = Column(Text)
    greeting_message = Column(Text)
    company_description = Column(Text)
    emergency_keywords = Column(JSON, default=[])
    
    # Subscription & Billing
    plan_tier = Column(String(50), default='professional', index=True)
    subscription_status = Column(String(50), default='trial', index=True)
    
    # Trial & Subscription Dates
    trial_starts_at = Column(DateTime, default=datetime.utcnow)
    trial_ends_at = Column(DateTime)
    subscription_started_at = Column(DateTime)
    subscription_ends_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    
    # Usage Limits (based on plan)
    max_monthly_calls = Column(Integer, default=1500)
    max_concurrent_calls = Column(Integer, default=3)
    current_month_calls = Column(Integer, default=0)
    
    # Feature Flags (SECRET TIP #2)
    features = Column(JSON, default={
        "call_recording": True,
        "voicemail": True,
        "sms_notifications": True,
        "email_notifications": True,
        "analytics": True,
        "voice_cloning": False,
        "advanced_analytics": False,
        "sentiment_analysis": False,
        "white_label": False
    })
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    is_test_mode = Column(Boolean, default=False)  # SECRET TIP #7: Sandbox Mode
    
    # Tracking
    total_calls = Column(Integer, default=0)
    total_appointments = Column(Integer, default=0)
    last_call_at = Column(DateTime)
    
    # SECRET TIP #3: Health Score
    health_score = Column(Integer, default=100)
    
    # Metadata
    notes = Column(Text)
    onboarded_by = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Relationships
    users = relationship("TenantUser", back_populates="tenant", cascade="all, delete-orphan")
    api_keys = relationship("TenantAPIKey", back_populates="tenant", cascade="all, delete-orphan")
    call_logs = relationship("CallLog", back_populates="tenant", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="tenant", cascade="all, delete-orphan")


class TenantUser(Base):
    """
    Users who can access tenant dashboard
    """
    __tablename__ = 'tenant_users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # User Information
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255))
    name = Column(String(255))
    phone = Column(String(50))
    
    # Role & Permissions
    role = Column(String(50), default='member')  # owner, admin, member, viewer
    permissions = Column(JSON, default={})
    
    # Status
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")


class TenantAPIKey(Base):
    """
    API keys for programmatic access
    """
    __tablename__ = 'tenant_api_keys'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Key Information
    key_hash = Column(String(255), unique=True, nullable=False, index=True)
    key_prefix = Column(String(20))
    name = Column(String(255))
    
    # Permissions & Limits
    permissions = Column(JSON, default={})
    rate_limit = Column(Integer, default=100)
    
    # Usage Tracking
    last_used_at = Column(DateTime)
    total_requests = Column(Integer, default=0)
    
    # Expiration
    expires_at = Column(DateTime)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="api_keys")


class CallLog(Base):
    """
    All voice agent calls per tenant
    """
    __tablename__ = 'call_logs'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Call Identification
    call_sid = Column(String(100), unique=True, nullable=False, index=True)
    
    # Call Details
    from_number = Column(String(20))
    to_number = Column(String(20))
    direction = Column(String(20))
    
    # Call Status
    status = Column(String(50))
    duration = Column(Integer)
    
    # Call Outcome
    outcome = Column(String(100), index=True)
    appointment_scheduled = Column(Boolean, default=False)
    transferred = Column(Boolean, default=False)
    
    # AI Interaction
    transcript = Column(Text)
    ai_summary = Column(Text)
    sentiment = Column(String(50))
    
    # Customer Information
    customer_name = Column(String(255))
    customer_phone = Column(String(20))
    customer_email = Column(String(255))
    service_requested = Column(Text)
    urgency_level = Column(String(50))
    
    # Recording
    recording_url = Column(Text)
    recording_duration = Column(Integer)
    
    # Costs
    call_cost = Column(DECIMAL(10, 4))
    ai_cost = Column(DECIMAL(10, 4))
    total_cost = Column(DECIMAL(10, 4))
    
    # Timestamps
    started_at = Column(DateTime, index=True)
    ended_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="call_logs")


class Appointment(Base):
    """
    Appointments scheduled by AI voice agent
    """
    __tablename__ = 'appointments'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    call_log_id = Column(UUID(as_uuid=True), ForeignKey('call_logs.id'))
    
    # Customer Information
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False, index=True)
    customer_email = Column(String(255))
    customer_address = Column(Text)
    
    # Appointment Details
    scheduled_date = Column(Date, nullable=False, index=True)
    scheduled_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, default=60)
    service_type = Column(String(255))
    description = Column(Text)
    
    # Status
    status = Column(String(50), default='scheduled', index=True)
    confirmed_at = Column(DateTime)
    completed_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    cancellation_reason = Column(Text)
    
    # Reminders
    reminder_sent = Column(Boolean, default=False)
    reminder_sent_at = Column(DateTime)
    
    # Notes
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="appointments")


class TenantUsage(Base):
    """
    Usage tracking for billing (SECRET TIP #6: Webhook Retry Logic ready)
    """
    __tablename__ = 'tenant_usage'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Period
    period_start = Column(Date, nullable=False, index=True)
    period_end = Column(Date, nullable=False)
    
    # Usage Metrics
    total_calls = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    total_appointments = Column(Integer, default=0)
    total_transfers = Column(Integer, default=0)
    
    # Costs
    call_costs = Column(DECIMAL(10, 2), default=0)
    ai_costs = Column(DECIMAL(10, 2), default=0)
    total_costs = Column(DECIMAL(10, 2), default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Helper function to calculate health score (SECRET TIP #3)
def calculate_health_score(tenant: Tenant) -> int:
    """
    Calculate tenant health score (0-100)
    Predicts churn risk
    """
    score = 100
    
    # Usage score (20-80% of limit is healthy)
    if tenant.max_monthly_calls > 0:
        usage_pct = (tenant.current_month_calls / tenant.max_monthly_calls) * 100
        if usage_pct < 20:
            score -= 20  # Too low usage
        elif usage_pct > 90:
            score -= 10  # Approaching limit
    
    # Engagement score (recent activity)
    if tenant.last_call_at:
        days_since_call = (datetime.utcnow() - tenant.last_call_at).days
        if days_since_call > 7:
            score -= 30  # No calls in a week
        elif days_since_call > 3:
            score -= 15  # No calls in 3 days
    
    # Payment score
    if tenant.subscription_status == 'past_due':
        score -= 50
    elif tenant.subscription_status == 'cancelled':
        score -= 100
    
    # Trial expiration
    if tenant.subscription_status == 'trial' and tenant.trial_ends_at:
        days_until_expiry = (tenant.trial_ends_at - datetime.utcnow()).days
        if days_until_expiry < 3:
            score -= 20
    
    return max(0, min(100, score))
