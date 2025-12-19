"""
Circuit Breaker pattern implementation for external service calls.

Prevents cascading failures by failing fast when a service is unhealthy.

States:
- CLOSED: Normal operation, requests pass through
- OPEN: Service is down, requests fail immediately
- HALF_OPEN: Testing if service recovered

Usage:
    from app.utils.circuit_breaker import circuit_breaker, CircuitBreakerOpen
    
    @circuit_breaker("openai", failure_threshold=5, recovery_timeout=60)
    async def call_openai(messages):
        return await openai.chat.completions.create(...)
    
    # Or use the manager directly:
    cb = CircuitBreakerManager.get("openai")
    if cb.can_execute():
        try:
            result = await call_openai(messages)
            cb.record_success()
        except Exception as e:
            cb.record_failure()
            raise
"""

import asyncio
import time
from enum import Enum
from typing import Dict, Optional, Callable, Any
from functools import wraps
from dataclasses import dataclass, field

from app.utils.logging import get_logger

logger = get_logger("circuit_breaker")


class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing fast
    HALF_OPEN = "half_open"  # Testing recovery


class CircuitBreakerOpen(Exception):
    """Raised when circuit is open and request is rejected."""
    
    def __init__(self, name: str, time_until_retry: float):
        self.name = name
        self.time_until_retry = time_until_retry
        super().__init__(
            f"Circuit breaker '{name}' is open. Retry in {time_until_retry:.1f}s"
        )


@dataclass
class CircuitBreaker:
    """
    Circuit breaker for a single service.
    
    Attributes:
        name: Service identifier
        failure_threshold: Failures before opening circuit
        recovery_timeout: Seconds before trying half-open
        success_threshold: Successes in half-open before closing
    """
    name: str
    failure_threshold: int = 5
    recovery_timeout: float = 60.0
    success_threshold: int = 2
    
    # State tracking
    state: CircuitState = field(default=CircuitState.CLOSED)
    failure_count: int = field(default=0)
    success_count: int = field(default=0)
    last_failure_time: Optional[float] = field(default=None)
    last_state_change: float = field(default_factory=time.time)
    
    # Metrics
    total_calls: int = field(default=0)
    total_failures: int = field(default=0)
    total_rejections: int = field(default=0)
    
    def can_execute(self) -> bool:
        """Check if request can proceed."""
        if self.state == CircuitState.CLOSED:
            return True
        
        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has passed
            if self.last_failure_time:
                elapsed = time.time() - self.last_failure_time
                if elapsed >= self.recovery_timeout:
                    self._transition_to(CircuitState.HALF_OPEN)
                    return True
            return False
        
        # HALF_OPEN: allow limited requests
        return True
    
    def record_success(self) -> None:
        """Record successful call."""
        self.total_calls += 1
        
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self._transition_to(CircuitState.CLOSED)
        elif self.state == CircuitState.CLOSED:
            # Reset failure count on success
            self.failure_count = 0
    
    def record_failure(self) -> None:
        """Record failed call."""
        self.total_calls += 1
        self.total_failures += 1
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.state == CircuitState.HALF_OPEN:
            # Any failure in half-open reopens circuit
            self._transition_to(CircuitState.OPEN)
        elif self.state == CircuitState.CLOSED:
            if self.failure_count >= self.failure_threshold:
                self._transition_to(CircuitState.OPEN)
    
    def record_rejection(self) -> None:
        """Record rejected call (circuit open)."""
        self.total_rejections += 1
    
    def _transition_to(self, new_state: CircuitState) -> None:
        """Transition to new state."""
        old_state = self.state
        self.state = new_state
        self.last_state_change = time.time()
        
        if new_state == CircuitState.CLOSED:
            self.failure_count = 0
            self.success_count = 0
        elif new_state == CircuitState.HALF_OPEN:
            self.success_count = 0
        
        logger.warning(
            "Circuit breaker '%s' transitioned: %s -> %s",
            self.name, old_state.value, new_state.value
        )
    
    def time_until_retry(self) -> float:
        """Get seconds until circuit might close."""
        if self.state != CircuitState.OPEN:
            return 0.0
        
        if self.last_failure_time:
            elapsed = time.time() - self.last_failure_time
            remaining = self.recovery_timeout - elapsed
            return max(0.0, remaining)
        
        return self.recovery_timeout
    
    def get_stats(self) -> Dict[str, Any]:
        """Get circuit breaker statistics."""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "total_calls": self.total_calls,
            "total_failures": self.total_failures,
            "total_rejections": self.total_rejections,
            "failure_rate": (
                self.total_failures / self.total_calls 
                if self.total_calls > 0 else 0.0
            ),
            "time_until_retry": self.time_until_retry(),
        }
    
    def reset(self) -> None:
        """Manually reset circuit to closed state."""
        self._transition_to(CircuitState.CLOSED)
        logger.info("Circuit breaker '%s' manually reset", self.name)


class CircuitBreakerManager:
    """
    Manages circuit breakers for multiple services.
    
    Singleton pattern - use get() to access circuit breakers.
    """
    
    _instances: Dict[str, CircuitBreaker] = {}
    _lock = asyncio.Lock()
    
    @classmethod
    def get(
        cls,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        success_threshold: int = 2,
    ) -> CircuitBreaker:
        """Get or create circuit breaker for service."""
        if name not in cls._instances:
            cls._instances[name] = CircuitBreaker(
                name=name,
                failure_threshold=failure_threshold,
                recovery_timeout=recovery_timeout,
                success_threshold=success_threshold,
            )
            logger.info(
                "Created circuit breaker '%s' (threshold=%d, timeout=%.0fs)",
                name, failure_threshold, recovery_timeout
            )
        return cls._instances[name]
    
    @classmethod
    def get_all_stats(cls) -> Dict[str, Dict[str, Any]]:
        """Get stats for all circuit breakers."""
        return {
            name: cb.get_stats()
            for name, cb in cls._instances.items()
        }
    
    @classmethod
    def reset_all(cls) -> None:
        """Reset all circuit breakers."""
        for cb in cls._instances.values():
            cb.reset()


def circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    recovery_timeout: float = 60.0,
    success_threshold: int = 2,
    fallback: Optional[Callable] = None,
):
    """
    Decorator to wrap function with circuit breaker.
    
    Args:
        name: Service identifier
        failure_threshold: Failures before opening
        recovery_timeout: Seconds before half-open
        success_threshold: Successes to close
        fallback: Optional fallback function when circuit is open
    
    Example:
        @circuit_breaker("openai", failure_threshold=5, recovery_timeout=60)
        async def call_openai(messages):
            return await client.chat.completions.create(...)
    """
    def decorator(func: Callable) -> Callable:
        cb = CircuitBreakerManager.get(
            name, failure_threshold, recovery_timeout, success_threshold
        )
        
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if not cb.can_execute():
                cb.record_rejection()
                if fallback:
                    logger.warning(
                        "Circuit '%s' open, using fallback", name
                    )
                    return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) else fallback(*args, **kwargs)
                raise CircuitBreakerOpen(name, cb.time_until_retry())
            
            try:
                result = await func(*args, **kwargs)
                cb.record_success()
                return result
            except Exception as e:
                cb.record_failure()
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            if not cb.can_execute():
                cb.record_rejection()
                if fallback:
                    logger.warning(
                        "Circuit '%s' open, using fallback", name
                    )
                    return fallback(*args, **kwargs)
                raise CircuitBreakerOpen(name, cb.time_until_retry())
            
            try:
                result = func(*args, **kwargs)
                cb.record_success()
                return result
            except Exception as e:
                cb.record_failure()
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


# Pre-configured circuit breakers for common services
def get_openai_circuit() -> CircuitBreaker:
    """Get circuit breaker for OpenAI API."""
    return CircuitBreakerManager.get(
        "openai",
        failure_threshold=5,
        recovery_timeout=60.0,
        success_threshold=2,
    )


def get_elevenlabs_circuit() -> CircuitBreaker:
    """Get circuit breaker for ElevenLabs API."""
    return CircuitBreakerManager.get(
        "elevenlabs",
        failure_threshold=3,
        recovery_timeout=30.0,
        success_threshold=1,
    )


def get_twilio_circuit() -> CircuitBreaker:
    """Get circuit breaker for Twilio API."""
    return CircuitBreakerManager.get(
        "twilio",
        failure_threshold=5,
        recovery_timeout=60.0,
        success_threshold=2,
    )
