"""
API Rate Limiting Middleware
Prevents abuse by limiting requests per IP/user
"""

import time
import logging
from typing import Dict, Optional, Callable
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    In-memory rate limiter with sliding window algorithm
    
    For production, use Redis-based rate limiting for distributed systems
    """
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        burst_size: int = 10
    ):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_size = burst_size
        
        # Storage: {identifier: [(timestamp, request_count)]}
        self.minute_buckets: Dict[str, list] = defaultdict(list)
        self.hour_buckets: Dict[str, list] = defaultdict(list)
        
        # Cleanup task
        self._cleanup_task = None
    
    def _get_identifier(self, request: Request) -> str:
        """
        Get unique identifier for rate limiting
        Priority: API Key > User ID > IP Address
        """
        # Check for API key in header
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"api_key:{api_key}"
        
        # Check for authenticated user
        if hasattr(request.state, 'user_id'):
            user_id = request.state.user_id
            if user_id:
                return f"user:{user_id}"
        
        # Fall back to IP address
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        
        return f"ip:{client_ip}"
    
    def _cleanup_old_entries(self):
        """Remove entries older than 1 hour"""
        now = time.time()
        hour_ago = now - 3600
        minute_ago = now - 60
        
        # Cleanup minute buckets
        for identifier in list(self.minute_buckets.keys()):
            self.minute_buckets[identifier] = [
                (ts, count) for ts, count in self.minute_buckets[identifier]
                if ts > minute_ago
            ]
            if not self.minute_buckets[identifier]:
                del self.minute_buckets[identifier]
        
        # Cleanup hour buckets
        for identifier in list(self.hour_buckets.keys()):
            self.hour_buckets[identifier] = [
                (ts, count) for ts, count in self.hour_buckets[identifier]
                if ts > hour_ago
            ]
            if not self.hour_buckets[identifier]:
                del self.hour_buckets[identifier]
    
    def _count_requests(self, buckets: list, window_seconds: int) -> int:
        """Count requests in the time window"""
        now = time.time()
        cutoff = now - window_seconds
        return sum(count for ts, count in buckets if ts > cutoff)
    
    async def check_rate_limit(self, request: Request) -> bool:
        """
        Check if request should be allowed
        
        Returns:
            True if allowed, raises HTTPException if rate limited
        """
        identifier = self._get_identifier(request)
        now = time.time()
        
        # Check minute limit
        minute_requests = self._count_requests(
            self.minute_buckets[identifier], 60
        )
        
        if minute_requests >= self.requests_per_minute:
            logger.warning(
                f"Rate limit exceeded (minute): {identifier} - "
                f"{minute_requests}/{self.requests_per_minute}"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": self.requests_per_minute,
                    "window": "1 minute",
                    "retry_after": 60
                }
            )
        
        # Check hour limit
        hour_requests = self._count_requests(
            self.hour_buckets[identifier], 3600
        )
        
        if hour_requests >= self.requests_per_hour:
            logger.warning(
                f"Rate limit exceeded (hour): {identifier} - "
                f"{hour_requests}/{self.requests_per_hour}"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": self.requests_per_hour,
                    "window": "1 hour",
                    "retry_after": 3600
                }
            )
        
        # Record this request
        self.minute_buckets[identifier].append((now, 1))
        self.hour_buckets[identifier].append((now, 1))
        
        # Periodic cleanup
        if len(self.minute_buckets) % 100 == 0:
            self._cleanup_old_entries()
        
        return True
    
    def get_rate_limit_headers(self, request: Request) -> Dict[str, str]:
        """
        Get rate limit headers for response
        """
        identifier = self._get_identifier(request)
        
        minute_requests = self._count_requests(
            self.minute_buckets[identifier], 60
        )
        hour_requests = self._count_requests(
            self.hour_buckets[identifier], 3600
        )
        
        return {
            "X-RateLimit-Limit-Minute": str(self.requests_per_minute),
            "X-RateLimit-Remaining-Minute": str(
                max(0, self.requests_per_minute - minute_requests)
            ),
            "X-RateLimit-Limit-Hour": str(self.requests_per_hour),
            "X-RateLimit-Remaining-Hour": str(
                max(0, self.requests_per_hour - hour_requests)
            ),
        }


# Global rate limiter instance
_rate_limiter = RateLimiter(
    requests_per_minute=60,
    requests_per_hour=1000,
    burst_size=10
)


async def rate_limit_middleware(request: Request, call_next: Callable):
    """
    FastAPI middleware for rate limiting
    """
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
        return await call_next(request)
    
    try:
        # Check rate limit
        await _rate_limiter.check_rate_limit(request)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        headers = _rate_limiter.get_rate_limit_headers(request)
        for key, value in headers.items():
            response.headers[key] = value
        
        return response
        
    except HTTPException as e:
        # Return rate limit error
        return JSONResponse(
            status_code=e.status_code,
            content=e.detail,
            headers={
                "Retry-After": str(e.detail.get("retry_after", 60))
            }
        )


def get_rate_limiter() -> RateLimiter:
    """Get the global rate limiter instance"""
    return _rate_limiter
