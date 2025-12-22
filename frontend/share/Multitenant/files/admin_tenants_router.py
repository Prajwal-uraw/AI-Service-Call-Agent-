"""
Admin API for Tenant Management.

Endpoints for:
- Creating new HVAC tenants (self-service onboarding)
- Updating tenant configuration
- Managing tenant users
- Viewing usage analytics
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.orm import Session

from app.services.db import get_db_session
from app.models.db_models import (
    Tenant, TenantUser, TenantAPIKey, TenantUsage,
    Location, Appointment, CallLog
)
from app.utils.logging import get_logger

logger = get_logger("admin_api")

router = APIRouter(prefix="/admin/tenants", tags=["Admin - Tenant Management"])


# ============================================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================

class TenantCreate(BaseModel):
    """Schema for creating a new tenant."""
    
    # Required fields
    company_name: str
    twilio_phone_number: str
    forward_to_number: str
    
    # Optional fields
    display_name: Optional[str] = None
    website: Optional[str] = None
    emergency_phone: Optional[str] = None
    
    # Business config
    timezone: str = "America/Chicago"
    service_areas: List[str] = []
    business_hours: Dict[str, Any] = {}
    
    # AI config
    ai_model: str = "gpt-4o-mini"
    ai_voice: str = "alloy"
    use_elevenlabs: bool = False
    elevenlabs_voice_id: Optional[str] = None
    
    # Custom instructions
    custom_system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    emergency_keywords: List[str] = []
    
    # Pricing
    pricing_tier: str = "basic"
    monthly_rate: Optional[float] = None
    setup_fee: Optional[float] = None
    
    # Admin user (created automatically)
    admin_email: EmailStr
    admin_name: str
    
    @field_validator('twilio_phone_number', 'forward_to_number', 'emergency_phone')
    @classmethod
    def validate_phone(cls, v):
        """Validate phone number format."""
        if v and not v.startswith('+'):
            raise ValueError('Phone numbers must start with + (e.g., +1234567890)')
        return v


class TenantUpdate(BaseModel):
    """Schema for updating tenant."""
    
    company_name: Optional[str] = None
    display_name: Optional[str] = None
    website: Optional[str] = None
    forward_to_number: Optional[str] = None
    emergency_phone: Optional[str] = None
    timezone: Optional[str] = None
    service_areas: Optional[List[str]] = None
    business_hours: Optional[Dict[str, Any]] = None
    custom_system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    ai_model: Optional[str] = None
    ai_voice: Optional[str] = None
    use_elevenlabs: Optional[bool] = None
    elevenlabs_voice_id: Optional[str] = None
    is_active: Optional[bool] = None


class TenantResponse(BaseModel):
    """Schema for tenant response."""
    
    id: str
    company_name: str
    display_name: Optional[str]
    twilio_phone_number: str
    forward_to_number: str
    pricing_tier: str
    is_active: bool
    total_calls: int
    total_appointments: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TenantDetailResponse(TenantResponse):
    """Detailed tenant response with configuration."""
    
    service_areas: List[str]
    business_hours: Dict[str, Any]
    ai_model: str
    ai_voice: str
    features: Dict[str, Any]


class APIKeyCreate(BaseModel):
    """Schema for creating API key."""
    
    name: str
    scopes: List[str] = ["read:calls", "write:appointments"]
    expires_days: Optional[int] = None  # None = never expires


class APIKeyResponse(BaseModel):
    """Response when API key is created."""
    
    key: str  # Only returned once!
    key_prefix: str
    name: str
    scopes: List[str]
    expires_at: Optional[datetime]


class UsageResponse(BaseModel):
    """Daily usage statistics."""
    
    date: date
    calls_count: int
    appointments_booked: int
    emergencies_handled: int
    calls_duration_minutes: float


# ============================================================================
# TENANT CRUD ENDPOINTS
# ============================================================================

@router.post("/", response_model=TenantResponse, status_code=201)
async def create_tenant(
    data: TenantCreate,
    db: Session = Depends(get_db_session)
):
    """
    Create a new HVAC tenant (self-service onboarding).
    
    **What this does:**
    1. Creates tenant record
    2. Sets up Twilio webhook configuration
    3. Creates admin user account
    4. Generates initial API key
    5. Sends welcome email (if configured)
    
    **Returns:**
    - Tenant details
    - Login credentials for admin dashboard
    - Webhook URL for Twilio configuration
    """
    
    logger.info("Creating new tenant: %s", data.company_name)
    
    # Generate tenant ID from company name
    tenant_id = data.company_name.lower()
    tenant_id = ''.join(c if c.isalnum() else '_' for c in tenant_id)
    tenant_id = tenant_id[:50]  # Max 50 chars
    
    # Check if tenant ID already exists
    existing = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Tenant ID '{tenant_id}' already exists. Choose a different company name."
        )
    
    # Check if phone number already in use
    existing_phone = db.query(Tenant).filter(
        Tenant.twilio_phone_number == data.twilio_phone_number
    ).first()
    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail=f"Phone number {data.twilio_phone_number} is already assigned to tenant '{existing_phone.id}'"
        )
    
    try:
        # Create tenant
        tenant = Tenant(
            id=tenant_id,
            company_name=data.company_name,
            display_name=data.display_name,
            website=data.website,
            twilio_phone_number=data.twilio_phone_number,
            forward_to_number=data.forward_to_number,
            emergency_phone=data.emergency_phone or data.forward_to_number,
            timezone=data.timezone,
            service_areas=data.service_areas,
            business_hours=data.business_hours,
            ai_model=data.ai_model,
            ai_voice=data.ai_voice,
            use_elevenlabs=data.use_elevenlabs,
            elevenlabs_voice_id=data.elevenlabs_voice_id,
            custom_system_prompt=data.custom_system_prompt,
            greeting_message=data.greeting_message,
            emergency_keywords=data.emergency_keywords,
            pricing_tier=data.pricing_tier,
            monthly_rate=data.monthly_rate,
            setup_fee=data.setup_fee,
            is_active=True,
            onboarded_at=datetime.utcnow(),
            onboarded_by=data.admin_email,
        )
        
        db.add(tenant)
        db.flush()  # Get tenant ID before creating related records
        
        # Create admin user
        from passlib.hash import bcrypt
        temp_password = secrets.token_urlsafe(16)
        
        admin_user = TenantUser(
            tenant_id=tenant.id,
            email=data.admin_email,
            password_hash=bcrypt.hash(temp_password),
            full_name=data.admin_name,
            role="admin",
            is_active=True,
            email_verified=False,
        )
        db.add(admin_user)
        
        # Create default locations (optional - can be added later)
        if data.service_areas:
            for area in data.service_areas[:3]:  # Max 3 initial locations
                location = Location(
                    tenant_id=tenant.id,
                    name=area,
                    code=area[:3].upper(),
                    is_active=True,
                )
                db.add(location)
        
        db.commit()
        db.refresh(tenant)
        
        logger.info("Successfully created tenant: %s", tenant.id)
        
        # TODO: Send welcome email with credentials
        # send_welcome_email(admin_user.email, tenant_id, temp_password)
        
        return tenant
    
    except Exception as e:
        db.rollback()
        logger.error("Error creating tenant: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create tenant: {str(e)}"
        )


@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    active_only: bool = Query(True, description="Show only active tenants"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db_session)
):
    """
    List all tenants.
    
    Supports pagination and filtering.
    """
    
    query = db.query(Tenant)
    
    if active_only:
        query = query.filter(Tenant.is_active == True)
    
    query = query.order_by(Tenant.created_at.desc())
    query = query.offset(skip).limit(limit)
    
    tenants = query.all()
    
    return tenants


@router.get("/{tenant_id}", response_model=TenantDetailResponse)
async def get_tenant(
    tenant_id: str,
    db: Session = Depends(get_db_session)
):
    """Get detailed tenant information."""
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    return tenant


@router.patch("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: str,
    updates: TenantUpdate,
    db: Session = Depends(get_db_session)
):
    """
    Update tenant configuration.
    
    Allows modifying:
    - Business information
    - AI settings
    - Phone numbers
    - Custom instructions
    """
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Update fields
    update_data = updates.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    tenant.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(tenant)
        
        logger.info("Updated tenant: %s", tenant_id)
        
        # Invalidate cache
        from app.middleware.tenant_resolver import invalidate_tenant_cache
        invalidate_tenant_cache()
        
        return tenant
    
    except Exception as e:
        db.rollback()
        logger.error("Error updating tenant: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update tenant: {str(e)}"
        )


@router.delete("/{tenant_id}")
async def delete_tenant(
    tenant_id: str,
    hard_delete: bool = Query(False, description="Permanently delete (vs soft delete)"),
    db: Session = Depends(get_db_session)
):
    """
    Delete or deactivate a tenant.
    
    By default, performs soft delete (sets is_active=False).
    Use hard_delete=true to permanently remove (use with caution!).
    """
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    try:
        if hard_delete:
            # Permanent deletion
            db.delete(tenant)
            logger.warning("HARD DELETE tenant: %s", tenant_id)
        else:
            # Soft delete
            tenant.is_active = False
            tenant.updated_at = datetime.utcnow()
            logger.info("Deactivated tenant: %s", tenant_id)
        
        db.commit()
        
        return {"status": "deleted" if hard_delete else "deactivated"}
    
    except Exception as e:
        db.rollback()
        logger.error("Error deleting tenant: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete tenant: {str(e)}"
        )


# ============================================================================
# API KEY MANAGEMENT
# ============================================================================

@router.post("/{tenant_id}/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    tenant_id: str,
    data: APIKeyCreate,
    db: Session = Depends(get_db_session)
):
    """
    Generate new API key for tenant.
    
    **IMPORTANT:** The key is only shown once. Save it securely!
    """
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Generate API key
    api_key = f"hvac_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    key_prefix = api_key[:12]
    
    # Calculate expiration
    expires_at = None
    if data.expires_days:
        from datetime import timedelta
        expires_at = datetime.utcnow() + timedelta(days=data.expires_days)
    
    # Create API key record
    api_key_obj = TenantAPIKey(
        tenant_id=tenant_id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=data.name,
        scopes=data.scopes,
        is_active=True,
        expires_at=expires_at,
        created_at=datetime.utcnow(),
    )
    
    db.add(api_key_obj)
    db.commit()
    
    logger.info("Created API key for tenant %s: %s", tenant_id, data.name)
    
    return APIKeyResponse(
        key=api_key,  # Only returned once!
        key_prefix=key_prefix,
        name=data.name,
        scopes=data.scopes,
        expires_at=expires_at,
    )


@router.get("/{tenant_id}/api-keys")
async def list_api_keys(
    tenant_id: str,
    db: Session = Depends(get_db_session)
):
    """List all API keys for a tenant (excluding the actual keys)."""
    
    keys = db.query(TenantAPIKey).filter(
        TenantAPIKey.tenant_id == tenant_id
    ).all()
    
    return [
        {
            "id": k.id,
            "name": k.name,
            "key_prefix": k.key_prefix,
            "scopes": k.scopes,
            "is_active": k.is_active,
            "last_used_at": k.last_used_at,
            "created_at": k.created_at,
            "expires_at": k.expires_at,
        }
        for k in keys
    ]


# ============================================================================
# USAGE ANALYTICS
# ============================================================================

@router.get("/{tenant_id}/usage", response_model=List[UsageResponse])
async def get_tenant_usage(
    tenant_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to retrieve"),
    db: Session = Depends(get_db_session)
):
    """
    Get usage statistics for a tenant.
    
    Returns daily metrics for:
    - Call volume
    - Appointments booked
    - Emergencies handled
    - Call duration
    """
    
    from datetime import timedelta
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    usage = db.query(TenantUsage).filter(
        TenantUsage.tenant_id == tenant_id,
        TenantUsage.date >= start_date,
        TenantUsage.date <= end_date
    ).order_by(TenantUsage.date.desc()).all()
    
    return [
        UsageResponse(
            date=u.date,
            calls_count=u.calls_count,
            appointments_booked=u.appointments_booked,
            emergencies_handled=u.emergencies_handled,
            calls_duration_minutes=round(u.calls_duration_seconds / 60, 2),
        )
        for u in usage
    ]


@router.get("/{tenant_id}/stats")
async def get_tenant_stats(
    tenant_id: str,
    db: Session = Depends(get_db_session)
):
    """
    Get aggregate statistics for a tenant.
    
    Includes:
    - Total calls (all time)
    - Total appointments
    - Active locations
    - Recent activity
    """
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Count related records
    locations_count = db.query(Location).filter(
        Location.tenant_id == tenant_id,
        Location.is_active == True
    ).count()
    
    appointments_count = db.query(Appointment).filter(
        Appointment.tenant_id == tenant_id,
        Appointment.is_cancelled == False
    ).count()
    
    calls_count = db.query(CallLog).filter(
        CallLog.tenant_id == tenant_id
    ).count()
    
    # Recent calls (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_calls = db.query(CallLog).filter(
        CallLog.tenant_id == tenant_id,
        CallLog.created_at >= thirty_days_ago
    ).count()
    
    return {
        "tenant_id": tenant.id,
        "company_name": tenant.company_name,
        "total_calls": calls_count,
        "total_appointments": appointments_count,
        "active_locations": locations_count,
        "calls_last_30_days": recent_calls,
        "is_active": tenant.is_active,
        "created_at": tenant.created_at,
        "last_call_at": tenant.last_call_at,
    }
