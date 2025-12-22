"""
Pydantic models for calculator input/output validation
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator, EmailStr
from enum import Enum


class BusinessType(str, Enum):
    """Supported business types"""
    HVAC = "HVAC"
    PLUMBING = "Plumbing"
    ELECTRICAL = "Electrical"
    ROOFING = "Roofing"
    GENERAL_CONTRACTOR = "General Contractor"


class CalculatorInput(BaseModel):
    """Input data for calculator"""
    
    # Required fields
    business_type: BusinessType
    avg_ticket_value: float = Field(gt=0, le=100000, description="Average job value")
    calls_per_day: int = Field(gt=0, le=1000, description="Incoming calls per day")
    current_answer_rate: float = Field(ge=0, le=100, description="% of calls answered")
    
    # Optional fields
    hours_open_per_day: Optional[float] = Field(default=8, ge=1, le=24)
    days_open_per_week: Optional[int] = Field(default=5, ge=1, le=7)
    conversion_rate: Optional[float] = Field(default=30, ge=0, le=100, description="% of answered calls that book")
    
    # Lead capture fields
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    
    # Tracking
    session_id: Optional[str] = None
    referral_source: Optional[str] = None
    
    @validator('current_answer_rate')
    def validate_answer_rate(cls, v):
        if v > 100:
            raise ValueError("Answer rate cannot exceed 100%")
        return v
    
    @validator('conversion_rate')
    def validate_conversion_rate(cls, v):
        if v and v > 100:
            raise ValueError("Conversion rate cannot exceed 100%")
        return v
    
    class Config:
        use_enum_values = True


class CalculatorResult(BaseModel):
    """Output from calculator with all metrics"""
    
    # Core metrics
    total_calls_per_month: int
    calls_answered: int
    calls_missed: int
    missed_call_percentage: float
    
    # Revenue calculations
    potential_jobs_from_answered: int
    potential_jobs_from_missed: int
    revenue_captured: float
    revenue_lost: float
    monthly_loss: float
    annual_loss: float
    
    # Improvement projections
    improved_answer_rate: float
    additional_calls_answered: int
    additional_revenue: float
    roi_percentage: float
    
    # Benchmarks
    industry_average_answer_rate: float
    your_performance_vs_industry: str
    
    # Lead scoring
    lead_score: float
    lead_tier: str
    
    # Metadata
    calculated_at: datetime
    session_id: Optional[str] = None
    
    # Raw input for reference
    input_data: Dict[str, Any]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class LeadSubmission(BaseModel):
    """Lead data stored in database"""
    
    id: Optional[str] = None
    session_id: str
    
    # Contact info
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    
    # Calculator data
    business_type: str
    monthly_loss: float
    annual_loss: float
    
    # Lead scoring
    lead_score: float
    lead_tier: str
    
    # Engagement tracking
    viewed_full_report: bool = False
    downloaded_pdf: bool = False
    clicked_cta: bool = False
    email_opened: bool = False
    
    # Timestamps
    submitted_at: datetime
    last_activity_at: Optional[datetime] = None
    
    # Source tracking
    referral_source: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    
    # Raw data
    raw_input: Dict[str, Any]
    raw_output: Dict[str, Any]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
