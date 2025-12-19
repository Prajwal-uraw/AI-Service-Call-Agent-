"""
Health check endpoints for HVAC Voice Agent.

Provides:
- Basic health check
- Detailed system status
- Database connectivity check
- Circuit breaker status
- Degradation level
- Session store stats
- TTS provider health
"""

import os
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.db import get_db, check_db_health
from app.agents.state import call_state_store
from app.utils.logging import get_logger
from app.utils.circuit_breaker import CircuitBreakerManager
from app.services.degradation import get_degradation
from app.services.session_store import session_store
from app.services.response_cache import get_response_cache

router = APIRouter(tags=["health"])
logger = get_logger("health")

# Version info
APP_VERSION = os.getenv("APP_VERSION", "2.0.0-production-hardening")


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
    Detailed health check with comprehensive system status.
    
    Returns:
        Detailed system status including:
        - Database connectivity
        - Session store (Redis) status
        - Circuit breaker states
        - Degradation level
        - Response cache stats
    """
    db_health = check_db_health()
    session_stats = session_store.get_stats()
    circuit_stats = CircuitBreakerManager.get_all_stats()
    degradation_stats = get_degradation().get_stats()
    cache_stats = get_response_cache().get_stats()
    
    # Determine overall status
    overall_status = "ok"
    if db_health["status"] != "healthy":
        overall_status = "degraded"
    if degradation_stats["current_level"] >= 2:  # Rule-based or worse
        overall_status = "degraded"
    
    # Check for any open circuits
    open_circuits = [
        name for name, stats in circuit_stats.items()
        if stats.get("state") == "open"
    ]
    if open_circuits:
        overall_status = "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": APP_VERSION,
        "components": {
            "database": db_health,
            "session_store": {
                "status": "healthy" if session_stats.get("redis_healthy", True) else "degraded",
                **session_stats,
            },
            "call_state_store": {
                "status": "healthy",
                "active_calls": call_state_store.active_calls,
            },
        },
        "circuits": circuit_stats,
        "degradation": degradation_stats,
        "cache": cache_stats,
        "alerts": {
            "open_circuits": open_circuits,
            "degradation_active": degradation_stats["current_level"] > 0,
        },
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
