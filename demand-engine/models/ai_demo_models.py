"""
SQLAlchemy Models for AI Demo System
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, DECIMAL, JSON, Text, Date, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class AIDemoMeeting(Base):
    """
    AI Demo Meetings Table
    Stores scheduled AI demo meetings with Daily.co integration
    """
    __tablename__ = 'ai_demo_meetings'
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Meeting Identification
    meeting_id = Column(String(100), unique=True, nullable=False)
    
    # Customer Info
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    customer_phone = Column(String(50))
    
    # Scheduling
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    timezone = Column(String(100), default='America/New_York')
    duration_minutes = Column(Integer, default=15)
    
    # Daily.co Integration
    daily_room_name = Column(String(255), unique=True, nullable=False)
    daily_room_url = Column(Text, nullable=False)
    customer_join_url = Column(Text)
    customer_token = Column(Text)
    ai_token = Column(Text)
    shadow_token = Column(Text)
    
    # Calendar Integration
    calendar_event_id = Column(String(255))
    calendar_provider = Column(String(50))  # 'google', 'outlook', 'cal.com'
    
    # Meeting Status
    status = Column(String(50), default='scheduled')  # 'scheduled', 'ai_joined', 'in_progress', 'completed', 'cancelled', 'no_show'
    ai_joined_at = Column(DateTime(timezone=True))
    customer_joined_at = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    cancelled_at = Column(DateTime(timezone=True))
    actual_duration_seconds = Column(Integer)
    
    # Takeover Information
    taken_over = Column(Boolean, default=False)
    taken_over_by = Column(String(255))  # Email or user ID
    taken_over_at = Column(DateTime(timezone=True))
    
    # Meeting Outcomes
    icp_fit = Column(Boolean)  # Ideal Customer Profile fit
    cta_taken = Column(String(100))  # Call-to-action taken: 'book_call', 'start_trial', 'get_deck', 'none'
    
    # Metadata
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    created_by = Column(String(255))
    notes = Column(Text)


class AIDemoAnalytics(Base):
    """
    AI Demo Analytics Table
    Daily aggregated analytics for AI demo performance
    """
    __tablename__ = 'ai_demo_analytics'
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Date
    date = Column(Date, nullable=False, unique=True)
    
    # Volume Metrics
    total_demos_scheduled = Column(Integer, default=0)
    total_demos_completed = Column(Integer, default=0)
    total_demos_no_show = Column(Integer, default=0)
    total_demos_cancelled = Column(Integer, default=0)
    
    # Success Metrics
    icp_fit_count = Column(Integer, default=0)
    icp_fit_rate = Column(DECIMAL(5,2), default=0.0)
    cta_conversion_count = Column(Integer, default=0)
    cta_conversion_rate = Column(DECIMAL(5,2), default=0.0)
    
    # CTA Breakdown
    cta_book_call_count = Column(Integer, default=0)
    cta_start_trial_count = Column(Integer, default=0)
    cta_get_deck_count = Column(Integer, default=0)
    
    # Quality Metrics
    avg_demo_duration_seconds = Column(Integer)
    avg_ai_speaking_time_seconds = Column(Integer)
    avg_customer_engagement_score = Column(DECIMAL(3,2))
    
    # Human Intervention
    human_takeover_count = Column(Integer, default=0)
    human_takeover_rate = Column(DECIMAL(5,2), default=0.0)
    
    # Cost Metrics
    total_ai_cost_usd = Column(DECIMAL(10,2))
    avg_cost_per_demo_usd = Column(DECIMAL(10,4))
    
    # Performance Metrics
    avg_latency_ms = Column(Integer)
    avg_ai_response_time_ms = Column(Integer)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class AIDemoShadowUser(Base):
    """
    Shadow Users Table
    Users who can observe and take over AI demo calls
    """
    __tablename__ = 'ai_demo_shadow_users'
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # User Information
    user_email = Column(String(255), unique=True, nullable=False)
    user_name = Column(String(255), nullable=False)
    user_role = Column(String(100))  # 'sales', 'support', 'admin'
    
    # Permissions
    can_shadow = Column(Boolean, default=True)
    can_takeover = Column(Boolean, default=True)
    can_view_analytics = Column(Boolean, default=True)
    
    # Activity Tracking
    total_shadows = Column(Integer, default=0)
    total_takeovers = Column(Integer, default=0)
    last_shadow_at = Column(DateTime(timezone=True))
    last_takeover_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
