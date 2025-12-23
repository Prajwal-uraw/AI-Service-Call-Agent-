"""
Admin API for Tenant Management
Create, read, update, delete voice agent customers
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import secrets
import string
import hashlib

# Import the get_db dependency from the application context
get_db = None  # This will be set by the application

router = APIRouter(prefix="/api/admin/tenants", tags=["Admin - Tenants"])


# =====================================================
# Pydantic Models
# =====================================================

class TenantCreate(BaseModel):
    """Create new tenant (voice agent customer)"""
    company_name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100, pattern="^[a-z0-9-]+$")
    owner_name: str
    owner_email: EmailStr
    owner_phone: Optional[str] = None
    industry: str = "hvac"
    plan_tier: str = "starter"
    twilio_phone_number: Optional[str] = None
    forward_to_number: Optional[str] = None


class TenantUpdate(BaseModel):
    """Update tenant information"""
    company_name: Optional[str] = None
    owner_name: Optional[str] = None
    owner_email: Optional[EmailStr] = None
    owner_phone: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    forward_to_number: Optional[str] = None
    emergency_phone: Optional[str] = None
    timezone: Optional[str] = None
    business_hours: Optional[dict] = None
    ai_model: Optional[str] = None
    ai_voice: Optional[str] = None
    custom_system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    plan_tier: Optional[str] = None
    subscription_status: Optional[str] = None
    is_active: Optional[bool] = None


class TenantResponse(BaseModel):
    """Tenant response model"""
    id: str
    slug: str
    company_name: str
    owner_email: str
    plan_tier: str
    subscription_status: str
    is_active: bool
    twilio_phone_number: Optional[str]
    total_calls: int
    total_appointments: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TenantDetailResponse(TenantResponse):
    """Detailed tenant response"""
    owner_name: str
    owner_phone: Optional[str]
    subdomain: Optional[str]
    industry: str
    website_url: Optional[str]
    forward_to_number: Optional[str]
    emergency_phone: Optional[str]
    timezone: str
    business_hours: dict
    ai_model: str
    ai_voice: str
    custom_system_prompt: Optional[str]
    greeting_message: Optional[str]
    features: dict
    max_monthly_calls: int
    current_month_calls: int
    trial_ends_at: Optional[datetime]
    subscription_started_at: Optional[datetime]


class APIKeyCreate(BaseModel):
    """Create API key for tenant"""
    name: str
    permissions: Optional[dict] = {"read": True, "write": False}
    expires_in_days: Optional[int] = 365


class APIKeyResponse(BaseModel):
    """API key response (only shown once)"""
    id: str
    key: str  # Full key - only shown on creation
    key_prefix: str
    name: str
    expires_at: Optional[datetime]
    created_at: datetime


# =====================================================
# Tenant CRUD Operations
# =====================================================

@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new tenant (voice agent customer)
    
    This is the primary onboarding endpoint
    """
    
    # Check if slug already exists
    existing = db.query(Tenant).filter(Tenant.slug == tenant_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Slug '{tenant_data.slug}' already exists"
        )
    
    # Check if email already exists
    existing_email = db.query(Tenant).filter(Tenant.owner_email == tenant_data.owner_email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{tenant_data.owner_email}' already registered"
        )
    
    # Create tenant
    tenant = Tenant(
        slug=tenant_data.slug,
        company_name=tenant_data.company_name,
        subdomain=tenant_data.slug,  # Same as slug by default
        owner_name=tenant_data.owner_name,
        owner_email=tenant_data.owner_email,
        owner_phone=tenant_data.owner_phone,
        industry=tenant_data.industry,
        plan_tier=tenant_data.plan_tier,
        subscription_status="trial",
        trial_starts_at=datetime.utcnow(),
        trial_ends_at=datetime.utcnow() + timedelta(days=14),
        twilio_phone_number=tenant_data.twilio_phone_number,
        forward_to_number=tenant_data.forward_to_number,
        is_active=True
    )
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Create owner user
    owner = TenantUser(
        tenant_id=tenant.id,
        email=tenant_data.owner_email,
        name=tenant_data.owner_name,
        role="owner",
        is_active=True
    )
    
    db.add(owner)
    db.commit()
    
    return tenant


@router.get("/", response_model=List[TenantResponse])
async def list_tenants(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    plan_tier: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all tenants with optional filters
    """
    query = db.query(Tenant).filter(Tenant.deleted_at == None)
    
    if status:
        query = query.filter(Tenant.subscription_status == status)
    
    if plan_tier:
        query = query.filter(Tenant.plan_tier == plan_tier)
    
    tenants = query.offset(skip).limit(limit).all()
    return tenants


@router.get("/{tenant_id}", response_model=TenantDetailResponse)
async def get_tenant(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed tenant information
    """
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.deleted_at == None
    ).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.patch("/{tenant_id}", response_model=TenantDetailResponse)
async def update_tenant(
    tenant_id: str,
    tenant_data: TenantUpdate,
    db: Session = Depends(get_db)
):
    """
    Update tenant information
    """
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.deleted_at == None
    ).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Update fields
    update_data = tenant_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    db.commit()
    db.refresh(tenant)
    
    return tenant


@router.delete("/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tenant(
    tenant_id: str,
    hard_delete: bool = False,
    db: Session = Depends(get_db)
):
    """
    Delete tenant (soft delete by default)
    """
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    if hard_delete:
        # Hard delete - removes all data
        db.delete(tenant)
    else:
        # Soft delete - mark as deleted
        tenant.deleted_at = datetime.utcnow()
        tenant.is_active = False
    
    db.commit()
    return None


# =====================================================
# API Key Management
# =====================================================

@router.post("/{tenant_id}/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    tenant_id: str,
    key_data: APIKeyCreate,
    db: Session = Depends(get_db)
):
    """
    Create API key for tenant
    """
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.deleted_at == None
    ).first()
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Generate API key
    alphabet = string.ascii_letters + string.digits
    api_key = f"tk_{tenant.slug}_{''.join(secrets.choice(alphabet) for _ in range(32))}"
    
    # Hash the key
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    key_prefix = api_key[:12]  # First 12 chars for display
    
    # Calculate expiration
    expires_at = None
    if key_data.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=key_data.expires_in_days)
    
    # Create API key record
    api_key_obj = TenantAPIKey(
        tenant_id=tenant.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=key_data.name,
        permissions=key_data.permissions,
        expires_at=expires_at,
        is_active=True
    )
    
    db.add(api_key_obj)
    db.commit()
    db.refresh(api_key_obj)
    
    # Return full key (only time it's shown)
    return {
        "id": str(api_key_obj.id),
        "key": api_key,  # Full key - save this!
        "key_prefix": key_prefix,
        "name": key_data.name,
        "expires_at": expires_at,
        "created_at": api_key_obj.created_at
    }


@router.get("/{tenant_id}/api-keys")
async def list_api_keys(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    """
    List API keys for tenant (without full key)
    """
    keys = db.query(TenantAPIKey).filter(
        TenantAPIKey.tenant_id == tenant_id
    ).all()
    
    return [{
        "id": str(key.id),
        "key_prefix": key.key_prefix,
        "name": key.name,
        "is_active": key.is_active,
        "last_used_at": key.last_used_at,
        "expires_at": key.expires_at,
        "created_at": key.created_at
    } for key in keys]


@router.delete("/{tenant_id}/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    tenant_id: str,
    key_id: str,
    db: Session = Depends(get_db)
):
    """
    Revoke API key
    """
    api_key = db.query(TenantAPIKey).filter(
        TenantAPIKey.id == key_id,
        TenantAPIKey.tenant_id == tenant_id
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    api_key.is_active = False
    db.commit()
    
    return None


# =====================================================
# Tenant Statistics
# =====================================================

@router.get("/{tenant_id}/stats")
async def get_tenant_stats(
    tenant_id: str,
    db: Session = Depends(get_db)
):
    """
    Get tenant usage statistics
    """
    from app.models.db_models import CallLog, Appointment
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get call statistics
    total_calls = db.query(CallLog).filter(CallLog.tenant_id == tenant_id).count()
    calls_this_month = db.query(CallLog).filter(
        CallLog.tenant_id == tenant_id,
        CallLog.started_at >= datetime.utcnow().replace(day=1)
    ).count()
    
    # Get appointment statistics
    total_appointments = db.query(Appointment).filter(Appointment.tenant_id == tenant_id).count()
    upcoming_appointments = db.query(Appointment).filter(
        Appointment.tenant_id == tenant_id,
        Appointment.scheduled_date >= datetime.utcnow().date(),
        Appointment.status == 'scheduled'
    ).count()
    
    return {
        "tenant_id": tenant_id,
        "company_name": tenant.company_name,
        "plan_tier": tenant.plan_tier,
        "subscription_status": tenant.subscription_status,
        "total_calls": total_calls,
        "calls_this_month": calls_this_month,
        "max_monthly_calls": tenant.max_monthly_calls,
        "usage_percentage": round((calls_this_month / tenant.max_monthly_calls * 100), 2) if tenant.max_monthly_calls > 0 else 0,
        "total_appointments": total_appointments,
        "upcoming_appointments": upcoming_appointments,
        "trial_ends_at": tenant.trial_ends_at,
        "is_active": tenant.is_active
    }
