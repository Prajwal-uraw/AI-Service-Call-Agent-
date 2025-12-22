"""
Tenant Resolution Middleware for Multi-Tenant Voice Agent
Identifies which HVAC/Plumbing company owns each incoming call
WITHOUT breaking existing voice agent functionality
"""

import os
from typing import Optional
from contextvars import ContextVar
from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
import hashlib

# Thread-safe tenant context
_tenant_context: ContextVar[Optional[dict]] = ContextVar('tenant_context', default=None)

class TenantContext:
    """
    Thread-safe context to store current tenant
    Accessible from anywhere in the application
    """
    
    @staticmethod
    def set(tenant: dict):
        """Set current tenant"""
        _tenant_context.set(tenant)
    
    @staticmethod
    def get() -> Optional[dict]:
        """Get current tenant"""
        return _tenant_context.get()
    
    @staticmethod
    def get_id() -> Optional[str]:
        """Get current tenant ID"""
        tenant = _tenant_context.get()
        return tenant.get('id') if tenant else None
    
    @staticmethod
    def clear():
        """Clear tenant context"""
        _tenant_context.set(None)
    
    @staticmethod
    def require() -> dict:
        """Get tenant or raise error"""
        tenant = _tenant_context.get()
        if not tenant:
            raise HTTPException(
                status_code=500,
                detail="Tenant context not initialized"
            )
        return tenant


def get_tenant_by_phone(phone: str, db: Session) -> Optional[dict]:
    """
    Resolve tenant by Twilio phone number
    PRIMARY method for voice agent calls
    """
    try:
        from app.models.db_models import Tenant
        
        tenant = db.query(Tenant).filter(
            Tenant.twilio_phone_number == phone,
            Tenant.is_active == True,
            Tenant.deleted_at == None
        ).first()
        
        if tenant:
            return {
                'id': str(tenant.id),
                'slug': tenant.slug,
                'company_name': tenant.company_name,
                'twilio_phone_number': tenant.twilio_phone_number,
                'forward_to_number': tenant.forward_to_number,
                'emergency_phone': tenant.emergency_phone,
                'timezone': tenant.timezone,
                'business_hours': tenant.business_hours,
                'ai_model': tenant.ai_model,
                'ai_voice': tenant.ai_voice,
                'custom_system_prompt': tenant.custom_system_prompt,
                'greeting_message': tenant.greeting_message,
                'emergency_keywords': tenant.emergency_keywords,
                'plan_tier': tenant.plan_tier,
                'features': tenant.features
            }
        
        return None
    
    except Exception as e:
        print(f"Error resolving tenant by phone: {e}")
        return None


def get_tenant_by_subdomain(subdomain: str, db: Session) -> Optional[dict]:
    """
    Resolve tenant by subdomain
    For dashboard access
    """
    try:
        from app.models.db_models import Tenant
        
        tenant = db.query(Tenant).filter(
            Tenant.subdomain == subdomain,
            Tenant.is_active == True,
            Tenant.deleted_at == None
        ).first()
        
        if tenant:
            return {
                'id': str(tenant.id),
                'slug': tenant.slug,
                'company_name': tenant.company_name,
                'plan_tier': tenant.plan_tier
            }
        
        return None
    
    except Exception as e:
        print(f"Error resolving tenant by subdomain: {e}")
        return None


def get_tenant_by_api_key(api_key: str, db: Session) -> Optional[dict]:
    """
    Resolve tenant by API key
    For programmatic access
    """
    try:
        from app.models.db_models import TenantAPIKey, Tenant
        from datetime import datetime
        
        # Hash the API key
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Look up API key
        api_key_obj = db.query(TenantAPIKey).filter(
            TenantAPIKey.key_hash == key_hash,
            TenantAPIKey.is_active == True
        ).first()
        
        if not api_key_obj:
            return None
        
        # Check expiration
        if api_key_obj.expires_at and api_key_obj.expires_at < datetime.utcnow():
            return None
        
        # Update last used
        api_key_obj.last_used_at = datetime.utcnow()
        api_key_obj.total_requests += 1
        db.commit()
        
        # Get tenant
        tenant = db.query(Tenant).filter(
            Tenant.id == api_key_obj.tenant_id,
            Tenant.is_active == True,
            Tenant.deleted_at == None
        ).first()
        
        if tenant:
            return {
                'id': str(tenant.id),
                'slug': tenant.slug,
                'company_name': tenant.company_name
            }
        
        return None
    
    except Exception as e:
        print(f"Error resolving tenant by API key: {e}")
        return None


async def tenant_resolver_middleware(request: Request, call_next):
    """
    Middleware to resolve tenant for each request
    
    Resolution priority:
    1. Twilio webhook (by phone number) - PRIMARY for voice agent
    2. Subdomain (for dashboard)
    3. API key header (for integrations)
    4. Default tenant (fallback to preserve existing functionality)
    """
    
    # Skip tenant resolution for public paths
    skip_paths = [
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/static",
        "/_next"
    ]
    
    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)
    
    # Get database session
    from app.database import get_db
    db = next(get_db())
    tenant = None
    
    try:
        # METHOD 1: Resolve by Twilio phone number (PRIMARY for voice agent)
        if request.url.path.startswith("/twilio") or request.url.path.startswith("/api/voice"):
            # Get "To" parameter from Twilio webhook
            if request.method == "POST":
                form_data = await request.form()
                to_number = form_data.get('To')
                
                if to_number:
                    tenant = get_tenant_by_phone(to_number, db)
                    
                    if not tenant:
                        # FALLBACK: Use default tenant to preserve existing functionality
                        print(f"⚠️  No tenant found for {to_number}, using default tenant")
                        tenant = get_default_tenant(db)
        
        # METHOD 2: Resolve by subdomain (for dashboard)
        elif host := request.headers.get("host"):
            if "." in host:
                subdomain = host.split(".")[0]
                if subdomain not in ["www", "api", "app", "localhost"]:
                    tenant = get_tenant_by_subdomain(subdomain, db)
        
        # METHOD 3: Resolve by API key
        if not tenant:
            api_key = request.headers.get("X-API-Key") or request.headers.get("Authorization", "").replace("Bearer ", "")
            if api_key:
                tenant = get_tenant_by_api_key(api_key, db)
        
        # FALLBACK: Use default tenant (preserves existing functionality)
        if not tenant:
            tenant = get_default_tenant(db)
        
        # Set tenant context
        if tenant:
            TenantContext.set(tenant)
            request.state.tenant = tenant
            request.state.tenant_id = tenant['id']
        
        # Execute request
        response = await call_next(request)
        return response
    
    except Exception as e:
        print(f"Error in tenant resolution: {e}")
        # Don't break the app - use default tenant
        tenant = get_default_tenant(db)
        if tenant:
            TenantContext.set(tenant)
            request.state.tenant = tenant
        
        response = await call_next(request)
        return response
    
    finally:
        TenantContext.clear()
        db.close()


def get_default_tenant(db: Session) -> Optional[dict]:
    """
    Get default tenant (preserves existing functionality)
    This ensures voice agent keeps working even without multi-tenant setup
    """
    try:
        from app.models.db_models import Tenant
        
        tenant = db.query(Tenant).filter(
            Tenant.slug == 'default'
        ).first()
        
        if tenant:
            return {
                'id': str(tenant.id),
                'slug': tenant.slug,
                'company_name': tenant.company_name,
                'twilio_phone_number': tenant.twilio_phone_number,
                'forward_to_number': tenant.forward_to_number,
                'emergency_phone': tenant.emergency_phone,
                'timezone': tenant.timezone,
                'business_hours': tenant.business_hours,
                'ai_model': tenant.ai_model,
                'ai_voice': tenant.ai_voice,
                'custom_system_prompt': tenant.custom_system_prompt,
                'greeting_message': tenant.greeting_message,
                'emergency_keywords': tenant.emergency_keywords,
                'plan_tier': tenant.plan_tier,
                'features': tenant.features
            }
        
        return None
    
    except Exception as e:
        print(f"Error getting default tenant: {e}")
        return None
