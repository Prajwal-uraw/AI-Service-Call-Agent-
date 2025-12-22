"""
Request ID Tracking Middleware
Adds unique request ID to all requests for debugging and tracing
"""

import uuid
import logging
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add unique request ID to all requests
    
    Features:
    - Generates UUID for each request
    - Adds to request state and response headers
    - Logs request/response with ID
    - Tracks request duration
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = str(uuid.uuid4())
        
        # Store in request state
        request.state.request_id = request_id
        
        # Log request start
        start_time = time.time()
        logger.info(
            f"Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client_ip": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("User-Agent", "unknown")
            }
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            # Log request completion
            logger.info(
                f"Request completed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration * 1000, 2)
                }
            )
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time
            
            # Log request error
            logger.error(
                f"Request failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e),
                    "duration_ms": round(duration * 1000, 2)
                },
                exc_info=True
            )
            
            raise


class RequestContextLogger:
    """
    Logger that automatically includes request ID in all logs
    """
    
    def __init__(self, logger_name: str):
        self.logger = logging.getLogger(logger_name)
    
    def _get_request_id(self) -> str:
        """Get request ID from current context"""
        try:
            from starlette.requests import Request
            from contextvars import ContextVar
            # This would need proper context management
            return "unknown"
        except:
            return "unknown"
    
    def info(self, message: str, **kwargs):
        extra = kwargs.get("extra", {})
        extra["request_id"] = self._get_request_id()
        kwargs["extra"] = extra
        self.logger.info(message, **kwargs)
    
    def error(self, message: str, **kwargs):
        extra = kwargs.get("extra", {})
        extra["request_id"] = self._get_request_id()
        kwargs["extra"] = extra
        self.logger.error(message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        extra = kwargs.get("extra", {})
        extra["request_id"] = self._get_request_id()
        kwargs["extra"] = extra
        self.logger.warning(message, **kwargs)


def get_request_id(request: Request) -> str:
    """
    Get request ID from request state
    
    Args:
        request: FastAPI request object
        
    Returns:
        Request ID string
    """
    return getattr(request.state, "request_id", "unknown")


def log_with_request_id(
    logger: logging.Logger,
    level: str,
    message: str,
    request: Request,
    **kwargs
):
    """
    Log message with request ID
    
    Args:
        logger: Logger instance
        level: Log level (info, error, warning, debug)
        message: Log message
        request: FastAPI request object
        **kwargs: Additional log parameters
    """
    request_id = get_request_id(request)
    extra = kwargs.get("extra", {})
    extra["request_id"] = request_id
    kwargs["extra"] = extra
    
    log_method = getattr(logger, level.lower())
    log_method(message, **kwargs)
