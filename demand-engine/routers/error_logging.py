"""
Error Logging API
Endpoint for frontend to log client-side errors
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
import logging
from datetime import datetime
from middleware.request_id import get_request_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/log-error", tags=["Error Logging"])

class ClientError(BaseModel):
    message: str
    stack: Optional[str] = None
    componentStack: Optional[str] = None
    timestamp: str
    userAgent: str
    url: str
    userId: Optional[str] = None

@router.post("")
async def log_client_error(error: ClientError, request: Request):
    """
    Log client-side errors from frontend
    """
    request_id = get_request_id(request)
    
    logger.error(
        f"Client-side error: {error.message}",
        extra={
            "request_id": request_id,
            "error_type": "client_error",
            "message": error.message,
            "stack": error.stack,
            "component_stack": error.componentStack,
            "timestamp": error.timestamp,
            "user_agent": error.userAgent,
            "url": error.url,
            "user_id": error.userId
        }
    )
    
    # TODO: Send to external error tracking service (Sentry, LogRocket, etc.)
    
    return {
        "status": "logged",
        "request_id": request_id,
        "timestamp": datetime.now().isoformat()
    }
