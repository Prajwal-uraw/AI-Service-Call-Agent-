"""
Tenant Resolution Middleware for Multi-Tenant HVAC Voice Agent.

Resolves which tenant (HVAC company) owns each incoming request based on:
1. Twilio phone number (primary method)
2. API key authentication (for programmatic access)
3. Session/subdomain (for dashboard access)

Usage:
    app.middleware("http")(resolve_tenant_middleware)
"""

import os
import hashlib
from typing import Optional
from functools import lru_cache

from fastapi import Request, HTTPException
from sqlalchemy.orm import Session

from app.services.db import get_db_session
from app.models.db_models import Tenant, TenantAPIKey
from app.utils.logging import get_logger

logger = get_logger("tenant_resolver")


# ============================================================================
# TENANT CONTEXT (Thread-Safe)
# ============================================================================

class TenantContext:
    """
    Thread-safe context to store current tenant.
    
    This is set by middleware and accessed by route handlers.
    """
    _tenant_id: Optional[str] = None
    _tenant_obj: Optional[Tenant] = None
    
    @classmethod
    def set(cls, tenant_id: str, tenant_obj: Tenant):
        """Set current tenant."""
        cls._tenant_id = tenant_id
        cls._tenant_obj = tenant_obj
    
    @classmethod
    def get_id(cls) -> Optional[str]:
        """Get current tenant ID."""
        return cls._tenant_id
    
    @classmethod
    def get(cls) -> Optional[Tenant]:
        """Get current tenant object."""
        return cls._tenant_obj
    
    @classmethod
    def clear(cls):
        """Clear tenant context (called after request)."""
        cls._tenant_id = None
        cls._tenant_obj = None
    
    @classmethod
    def require(cls) -> Tenant:
        """Get tenant or raise error if not set."""
        if not cls._tenant_obj:
            raise HTTPException(
                status_code=500,
                detail="Tenant context not initialized. This is a server error."
            )
        return cls._tenant_obj


# ============================================================================
# TENANT RESOLUTION FUNCTIONS
# ============================================================================

@lru_cache(maxsize=100)
def get_tenant_by_phone_cached(phone: str, db_session) -> Optional[Tenant]:
    """
    Get tenant by Twilio phone number (cached for performance).
    
    Args:
        phone: Twilio phone number (e.g., +16822249904)
        db_session: Database session
    
    Returns:
        Tenant object or None if not found
    """
    try:
        tenant = db_session.query(Tenant).filter(
            Tenant.twilio_phone_number == phone,
            Tenant.is_active == True
        ).first()
        
        return tenant
    except Exception as e:
        logger.error("Error fetching tenant by phone %s: %s", phone, str(e))
        return None


def get_tenant_by_phone(phone: str, db: Session) -> Optional[Tenant]:
    """
    Get tenant by Twilio phone number.
    
    This is the PRIMARY method for resolving tenants from incoming calls.
    """
    logger.debug("Resolving tenant by phone: %s", phone)
    
    try:
        tenant = db.query(Tenant).filter(
            Tenant.twilio_phone_number == phone,
            Tenant.is_active == True
        ).first()
        
        if tenant:
            logger.info("Resolved tenant: %s (%s)", tenant.id, tenant.company_name)
        else:
            logger.warning("No active tenant found for phone: %s", phone)
        
        return tenant
    
    except Exception as e:
        logger.error("Error resolving tenant by phone: %s", str(e), exc_info=True)
        return None


def get_tenant_by_api_key(api_key: str, db: Session) -> Optional[Tenant]:
    """
    Get tenant by API key.
    
    Used for programmatic access to tenant-specific endpoints.
    """
    logger.debug("Resolving tenant by API key")
    
    try:
        # Hash the API key
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Look up API key
        api_key_obj = db.query(TenantAPIKey).filter(
            TenantAPIKey.key_hash == key_hash,
            TenantAPIKey.is_active == True
        ).first()
        
        if not api_key_obj:
            logger.warning("Invalid or inactive API key")
            return None
        
        # Check expiration
        from datetime import datetime
        if api_key_obj.expires_at and api_key_obj.expires_at < datetime.utcnow():
            logger.warning("Expired API key for tenant: %s", api_key_obj.tenant_id)
            return None
        
        # Update last used timestamp
        api_key_obj.last_used_at = datetime.utcnow()
        db.commit()
        
        # Get tenant
        tenant = db.query(Tenant).filter(
            Tenant.id == api_key_obj.tenant_id,
            Tenant.is_active == True
        ).first()
        
        if tenant:
            logger.info("Resolved tenant via API key: %s (%s)", tenant.id, tenant.company_name)
        
        return tenant
    
    except Exception as e:
        logger.error("Error resolving tenant by API key: %s", str(e), exc_info=True)
        return None


def get_tenant_by_id(tenant_id: str, db: Session) -> Optional[Tenant]:
    """
    Get tenant by ID (direct lookup).
    
    Used when tenant is explicitly specified.
    """
    try:
        tenant = db.query(Tenant).filter(
            Tenant.id == tenant_id,
            Tenant.is_active == True
        ).first()
        
        return tenant
    
    except Exception as e:
        logger.error("Error fetching tenant by ID: %s", str(e), exc_info=True)
        return None


# ============================================================================
# MIDDLEWARE
# ============================================================================

async def resolve_tenant_middleware(request: Request, call_next):
    """
    Middleware to resolve and inject tenant context into requests.
    
    Resolution priority:
    1. Twilio webhook (resolve by phone number)
    2. API key header
    3. Admin routes (skip tenant resolution)
    
    Sets:
    - TenantContext for global access
    - request.state.tenant for route handler access
    """
    
    # Skip tenant resolution for certain paths
    skip_paths = [
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/admin",  # Admin routes don't need tenant context
    ]
    
    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)
    
    # Get database session
    db: Session = next(get_db_session())
    tenant: Optional[Tenant] = None
    
    try:
        # METHOD 1: Resolve by Twilio phone number (primary)
        if request.url.path.startswith("/twilio"):
            # Get the "To" parameter from Twilio webhook
            # This is cached on request.state by twilio_auth_middleware
            if hasattr(request.state, 'twilio_form_data'):
                to_number = request.state.twilio_form_data.get('To')
                
                if to_number:
                    tenant = get_tenant_by_phone(to_number, db)
                    
                    if not tenant:
                        logger.error("No tenant found for Twilio number: %s", to_number)
                        return HTTPException(
                            status_code=404,
                            detail=f"No active tenant configured for phone number: {to_number}"
                        )
        
        # METHOD 2: Resolve by API key
        elif api_key := request.headers.get("X-API-Key"):
            tenant = get_tenant_by_api_key(api_key, db)
            
            if not tenant:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired API key"
                )
        
        # METHOD 3: Resolve by subdomain (future: for client dashboards)
        # elif host := request.headers.get("Host"):
        #     subdomain = host.split('.')[0]
        #     tenant = get_tenant_by_subdomain(subdomain, db)
        
        # Set tenant context if resolved
        if tenant:
            TenantContext.set(tenant.id, tenant)
            request.state.tenant = tenant
            request.state.tenant_id = tenant.id
            
            logger.debug(
                "Request %s %s resolved to tenant: %s",
                request.method,
                request.url.path,
                tenant.id
            )
        
        # Execute request
        response = await call_next(request)
        
        return response
    
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    
    except Exception as e:
        logger.error("Error in tenant resolution: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to resolve tenant context"
        )
    
    finally:
        # Clean up
        TenantContext.clear()
        db.close()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def invalidate_tenant_cache():
    """
    Invalidate tenant cache.
    
    Call this when tenant configuration changes.
    """
    get_tenant_by_phone_cached.cache_clear()
    logger.info("Tenant cache invalidated")


def require_tenant() -> Tenant:
    """
    Dependency function to require tenant in route handlers.
    
    Usage:
        @app.get("/some-endpoint")
        async def my_endpoint(tenant: Tenant = Depends(require_tenant)):
            # tenant is guaranteed to be set
    """
    return TenantContext.require()
