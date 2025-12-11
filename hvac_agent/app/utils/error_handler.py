"""
Error handling utilities for HVAC Voice Agent.

Provides:
- Custom exception classes
- Error handling decorators
- Safe execution wrappers
- User-friendly error messages
"""

import functools
import traceback
from typing import Any, Callable, Dict, Optional, TypeVar, Union
from enum import Enum

from app.utils.logging import get_logger

logger = get_logger("error_handler")

T = TypeVar("T")


class ErrorCode(Enum):
    """Error codes for categorization."""
    UNKNOWN = "UNKNOWN"
    DATABASE = "DATABASE"
    OPENAI = "OPENAI"
    TWILIO = "TWILIO"
    VALIDATION = "VALIDATION"
    TIMEOUT = "TIMEOUT"
    RATE_LIMIT = "RATE_LIMIT"
    AUTHENTICATION = "AUTHENTICATION"
    NOT_FOUND = "NOT_FOUND"
    WEBSOCKET = "WEBSOCKET"


class HVACAgentError(Exception):
    """
    Base exception for HVAC Agent errors.
    
    Attributes:
        message: Human-readable error message
        code: Error code for categorization
        details: Additional error details
        user_message: Message safe to speak to caller
    """
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.UNKNOWN,
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}
        self.user_message = user_message or self._get_default_user_message()
    
    def _get_default_user_message(self) -> str:
        """Get default user-friendly message based on error code."""
        messages = {
            ErrorCode.UNKNOWN: "I'm having a technical issue. Let me try that again.",
            ErrorCode.DATABASE: "I'm having trouble accessing our system. Please hold on.",
            ErrorCode.OPENAI: "I'm having trouble processing that. Could you repeat that?",
            ErrorCode.TWILIO: "I'm having trouble with the call. Please hold on.",
            ErrorCode.VALIDATION: "I didn't quite catch that. Could you please repeat?",
            ErrorCode.TIMEOUT: "That's taking longer than expected. Let me try again.",
            ErrorCode.RATE_LIMIT: "We're experiencing high volume. Please hold on.",
            ErrorCode.AUTHENTICATION: "I'm having a system issue. Please hold on.",
            ErrorCode.NOT_FOUND: "I couldn't find that information. Let me check again.",
            ErrorCode.WEBSOCKET: "I'm having connection issues. Please hold on.",
        }
        return messages.get(self.code, messages[ErrorCode.UNKNOWN])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary."""
        return {
            "error": self.message,
            "code": self.code.value,
            "details": self.details,
            "user_message": self.user_message,
        }


class DatabaseError(HVACAgentError):
    """Database-related errors."""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code=ErrorCode.DATABASE,
            details=details,
        )


class OpenAIError(HVACAgentError):
    """OpenAI API errors."""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code=ErrorCode.OPENAI,
            details=details,
        )


class TwilioError(HVACAgentError):
    """Twilio-related errors."""
    
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(
            message=message,
            code=ErrorCode.TWILIO,
            details=details,
        )


class ValidationError(HVACAgentError):
    """Input validation errors."""
    
    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(
            message=message,
            code=ErrorCode.VALIDATION,
            details={"field": field} if field else {},
            user_message="I didn't quite understand that. Could you please rephrase?",
        )


def handle_error(
    error: Exception,
    call_sid: Optional[str] = None,
    context: Optional[str] = None,
) -> HVACAgentError:
    """
    Handle an exception and convert to HVACAgentError.
    
    Args:
        error: The exception that occurred
        call_sid: Optional Twilio CallSid for logging
        context: Optional context description
        
    Returns:
        HVACAgentError instance
    """
    # Log the error
    log_message = f"Error in {context or 'unknown context'}"
    if call_sid:
        log_message = f"[{call_sid}] {log_message}"
    
    logger.error(f"{log_message}: {type(error).__name__}: {str(error)}")
    logger.debug(traceback.format_exc())
    
    # Convert known exceptions
    error_type = type(error).__name__
    
    if isinstance(error, HVACAgentError):
        return error
    
    # Map common exceptions to our error types
    if "sqlalchemy" in error_type.lower() or "database" in str(error).lower():
        return DatabaseError(str(error))
    
    if "openai" in error_type.lower() or "api" in str(error).lower():
        return OpenAIError(str(error))
    
    if "twilio" in error_type.lower():
        return TwilioError(str(error))
    
    if "timeout" in error_type.lower() or "timeout" in str(error).lower():
        return HVACAgentError(str(error), code=ErrorCode.TIMEOUT)
    
    if "rate" in str(error).lower() and "limit" in str(error).lower():
        return HVACAgentError(str(error), code=ErrorCode.RATE_LIMIT)
    
    # Default unknown error
    return HVACAgentError(str(error), code=ErrorCode.UNKNOWN)


def safe_execute(
    default: T = None,
    error_message: Optional[str] = None,
    reraise: bool = False,
) -> Callable:
    """
    Decorator for safe function execution with error handling.
    
    Args:
        default: Default value to return on error
        error_message: Custom error message for logging
        reraise: Whether to reraise the exception
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> T:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                context = error_message or f"executing {func.__name__}"
                handled = handle_error(e, context=context)
                
                if reraise:
                    raise handled from e
                
                return default
        
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs) -> T:
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                context = error_message or f"executing {func.__name__}"
                handled = handle_error(e, context=context)
                
                if reraise:
                    raise handled from e
                
                return default
        
        # Return appropriate wrapper based on function type
        if asyncio_iscoroutinefunction(func):
            return async_wrapper
        return wrapper
    
    return decorator


def asyncio_iscoroutinefunction(func: Callable) -> bool:
    """Check if function is a coroutine function."""
    import asyncio
    return asyncio.iscoroutinefunction(func)


def get_user_friendly_error(error: Union[Exception, HVACAgentError]) -> str:
    """
    Get a user-friendly error message suitable for voice response.
    
    Args:
        error: The error to convert
        
    Returns:
        User-friendly error message
    """
    if isinstance(error, HVACAgentError):
        return error.user_message
    
    # Generic fallback
    return "I'm sorry, I'm having a technical issue. Let me try that again."


def create_error_response(
    error: Union[Exception, HVACAgentError],
    include_retry: bool = True,
) -> Dict[str, Any]:
    """
    Create a structured error response.
    
    Args:
        error: The error
        include_retry: Whether to include retry suggestion
        
    Returns:
        Error response dictionary
    """
    if isinstance(error, HVACAgentError):
        response = error.to_dict()
    else:
        response = {
            "error": str(error),
            "code": ErrorCode.UNKNOWN.value,
            "user_message": get_user_friendly_error(error),
        }
    
    if include_retry:
        response["retry_suggested"] = True
        response["retry_message"] = "Would you like me to try that again?"
    
    return response
