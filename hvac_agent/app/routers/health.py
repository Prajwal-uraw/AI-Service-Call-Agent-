"""
Health check endpoints for HVAC Voice Agent.

Provides:
- Basic health check
- Detailed system status
- Database connectivity check
"""

from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.db import get_db, check_db_health
from app.agents.state import call_state_store
from app.utils.logging import get_logger

router = APIRouter(tags=["health"])
logger = get_logger("health")


@router.get("/health")
def health() -> Dict[str, str]:
    """
    Basic health check endpoint.
    
    Returns:
        Simple status response
    """
    return {"status": "ok"}


@router.get("/health/detailed")
def health_detailed(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed health check with system status.
    
    Returns:
        Detailed system status including database and active calls
    """
    db_health = check_db_health()
    
    return {
        "status": "ok" if db_health["status"] == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "database": db_health,
            "call_state_store": {
                "status": "healthy",
                "active_calls": call_state_store.active_calls,
            },
        },
        "version": "1.0.0",
    }


@router.get("/ready")
def readiness() -> Dict[str, str]:
    """
    Kubernetes readiness probe endpoint.
    
    Returns:
        Ready status
    """
    return {"status": "ready"}


@router.get("/live")
def liveness() -> Dict[str, str]:
    """
    Kubernetes liveness probe endpoint.
    
    Returns:
        Live status
    """
    return {"status": "live"}
