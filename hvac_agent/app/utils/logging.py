"""
Logging configuration for HVAC Voice Agent.

Provides structured logging with configurable levels and formats.
"""

import logging
import os
import sys
from typing import Optional
from datetime import datetime

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = os.getenv("LOG_FORMAT", "standard")  # standard, json


class CallContextFilter(logging.Filter):
    """Filter that adds call context to log records."""
    
    def __init__(self, call_sid: Optional[str] = None):
        super().__init__()
        self.call_sid = call_sid
    
    def filter(self, record):
        record.call_sid = getattr(record, 'call_sid', self.call_sid or 'N/A')
        return True


def get_logger(name: str, call_sid: Optional[str] = None) -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name (typically module name)
        call_sid: Optional Twilio CallSid for context
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        logger.setLevel(LOG_LEVEL)
        
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(LOG_LEVEL)
        
        if LOG_FORMAT == "json":
            formatter = JsonFormatter()
        else:
            formatter = logging.Formatter(
                fmt="%(asctime)s [%(levelname)s] %(name)s [%(call_sid)s] – %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        
        handler.setFormatter(formatter)
        handler.addFilter(CallContextFilter(call_sid))
        logger.addHandler(handler)
        
        # Prevent propagation to root logger
        logger.propagate = False
    
    return logger


class JsonFormatter(logging.Formatter):
    """JSON log formatter for structured logging."""
    
    def format(self, record):
        import json
        
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "call_sid": getattr(record, 'call_sid', 'N/A'),
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def log_call_event(
    logger: logging.Logger,
    event: str,
    call_sid: str,
    **kwargs
) -> None:
    """
    Log a call-related event with structured data.
    
    Args:
        logger: Logger instance
        event: Event name
        call_sid: Twilio CallSid
        **kwargs: Additional event data
    """
    extra = {"call_sid": call_sid}
    message = f"CALL_EVENT: {event}"
    
    if kwargs:
        details = ", ".join(f"{k}={v}" for k, v in kwargs.items())
        message = f"{message} | {details}"
    
    logger.info(message, extra=extra)


def log_error(
    logger: logging.Logger,
    error: Exception,
    call_sid: Optional[str] = None,
    context: Optional[str] = None
) -> None:
    """
    Log an error with context.
    
    Args:
        logger: Logger instance
        error: Exception that occurred
        call_sid: Optional Twilio CallSid
        context: Optional context description
    """
    extra = {"call_sid": call_sid or "N/A"}
    message = f"ERROR: {type(error).__name__}: {str(error)}"
    
    if context:
        message = f"{context} | {message}"
    
    logger.error(message, extra=extra, exc_info=True)
