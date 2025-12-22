"""
Centralized Error Logging Utility
Provides consistent error logging across all services
"""

import logging
import traceback
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class ErrorLogger:
    """Centralized error logging with context"""
    
    @staticmethod
    def log_error(
        error: Exception,
        context: str,
        user_id: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ):
        """
        Log error with full context and stack trace
        
        Args:
            error: The exception that occurred
            context: Description of where/when error occurred
            user_id: Optional user identifier
            additional_data: Optional dict of additional context
        """
        error_data = {
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "user_id": user_id,
            "stack_trace": traceback.format_exc()
        }
        
        if additional_data:
            error_data.update(additional_data)
        
        logger.error(
            f"ERROR in {context}: {type(error).__name__}: {str(error)}",
            extra=error_data,
            exc_info=True
        )
    
    @staticmethod
    def log_api_error(
        error: Exception,
        endpoint: str,
        method: str,
        status_code: Optional[int] = None,
        request_data: Optional[Dict] = None
    ):
        """
        Log API-specific errors
        
        Args:
            error: The exception
            endpoint: API endpoint path
            method: HTTP method
            status_code: HTTP status code
            request_data: Request payload (sanitized)
        """
        ErrorLogger.log_error(
            error,
            context=f"API {method} {endpoint}",
            additional_data={
                "endpoint": endpoint,
                "method": method,
                "status_code": status_code,
                "request_data": request_data
            }
        )
    
    @staticmethod
    def log_service_error(
        error: Exception,
        service_name: str,
        operation: str,
        input_data: Optional[Dict] = None
    ):
        """
        Log service-layer errors
        
        Args:
            error: The exception
            service_name: Name of the service
            operation: Operation being performed
            input_data: Input parameters (sanitized)
        """
        ErrorLogger.log_error(
            error,
            context=f"{service_name}.{operation}",
            additional_data={
                "service": service_name,
                "operation": operation,
                "input_data": input_data
            }
        )
    
    @staticmethod
    def log_external_api_error(
        error: Exception,
        api_name: str,
        endpoint: str,
        response_data: Optional[Dict] = None
    ):
        """
        Log errors from external API calls
        
        Args:
            error: The exception
            api_name: Name of external API (e.g., "Twilio", "OpenAI")
            endpoint: External endpoint called
            response_data: Response from external API
        """
        ErrorLogger.log_error(
            error,
            context=f"External API: {api_name}",
            additional_data={
                "external_api": api_name,
                "endpoint": endpoint,
                "response": response_data
            }
        )
    
    @staticmethod
    def log_database_error(
        error: Exception,
        operation: str,
        table: Optional[str] = None,
        query_params: Optional[Dict] = None
    ):
        """
        Log database errors
        
        Args:
            error: The exception
            operation: Database operation (SELECT, INSERT, etc.)
            table: Table name
            query_params: Query parameters (sanitized)
        """
        ErrorLogger.log_error(
            error,
            context=f"Database {operation}",
            additional_data={
                "operation": operation,
                "table": table,
                "params": query_params
            }
        )


# Convenience function
def log_error(error: Exception, context: str, **kwargs):
    """Shorthand for ErrorLogger.log_error"""
    ErrorLogger.log_error(error, context, **kwargs)
