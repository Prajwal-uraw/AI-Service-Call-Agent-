"""
Graceful Degradation System for HVAC Voice Agent.

Provides multi-level fallback when services are unavailable,
ensuring 99.9% availability even during outages.

Degradation Levels:
- Level 0: Full AI (GPT-4o + ElevenLabs) - Best quality
- Level 1: Fast AI (GPT-4o-mini + Polly) - Reduced latency
- Level 2: Rule-based (State machine only) - No LLM
- Level 3: Human transfer - Last resort

Features:
- Automatic level switching based on service health
- Manual override capability
- Metrics tracking per level
- Recovery detection
"""

import os
import time
import asyncio
from enum import IntEnum
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass, field

from app.utils.logging import get_logger
from app.utils.circuit_breaker import CircuitBreakerManager

logger = get_logger("degradation")


class DegradationLevel(IntEnum):
    """Degradation levels from best to worst."""
    FULL_AI = 0       # GPT-4o + ElevenLabs
    FAST_AI = 1       # GPT-4o-mini + Polly
    RULE_BASED = 2    # State machine only
    HUMAN_TRANSFER = 3  # Transfer to human


@dataclass
class LevelConfig:
    """Configuration for a degradation level."""
    name: str
    description: str
    openai_model: str
    tts_provider: str
    use_llm: bool = True
    max_response_time_ms: int = 3000


# Level configurations
LEVEL_CONFIGS: Dict[DegradationLevel, LevelConfig] = {
    DegradationLevel.FULL_AI: LevelConfig(
        name="Full AI",
        description="GPT-4o with ElevenLabs TTS",
        openai_model="gpt-4o",
        tts_provider="elevenlabs",
        use_llm=True,
        max_response_time_ms=5000,
    ),
    DegradationLevel.FAST_AI: LevelConfig(
        name="Fast AI",
        description="GPT-4o-mini with Polly TTS",
        openai_model="gpt-4o-mini",
        tts_provider="polly",
        use_llm=True,
        max_response_time_ms=2000,
    ),
    DegradationLevel.RULE_BASED: LevelConfig(
        name="Rule-based",
        description="State machine without LLM",
        openai_model="",
        tts_provider="polly",
        use_llm=False,
        max_response_time_ms=500,
    ),
    DegradationLevel.HUMAN_TRANSFER: LevelConfig(
        name="Human Transfer",
        description="Transfer to human agent",
        openai_model="",
        tts_provider="polly",
        use_llm=False,
        max_response_time_ms=0,
    ),
}


@dataclass
class DegradationState:
    """Current degradation state."""
    level: DegradationLevel = DegradationLevel.FULL_AI
    reason: Optional[str] = None
    since: float = field(default_factory=time.time)
    manual_override: bool = False
    
    # Metrics
    calls_at_level: Dict[int, int] = field(default_factory=dict)
    level_changes: int = 0


class GracefulDegradation:
    """
    Manages graceful degradation across service levels.
    
    Usage:
        degradation = GracefulDegradation()
        
        # Get current configuration
        config = degradation.get_config()
        
        # Check if we should use LLM
        if config.use_llm:
            response = await call_openai(model=config.openai_model)
        else:
            response = rule_based_response(state)
        
        # Record success/failure
        degradation.record_success()
        # or
        degradation.record_failure("OpenAI timeout")
    """
    
    def __init__(self):
        self._state = DegradationState()
        self._failure_count = 0
        self._success_count = 0
        self._last_check = time.time()
        
        # Thresholds
        self._failure_threshold = 3  # Failures before degrading
        self._success_threshold = 5  # Successes before recovering
        self._check_interval = 30.0  # Seconds between recovery checks
    
    @property
    def current_level(self) -> DegradationLevel:
        """Get current degradation level."""
        return self._state.level
    
    def get_config(self) -> LevelConfig:
        """Get configuration for current level."""
        return LEVEL_CONFIGS[self._state.level]
    
    def record_success(self) -> None:
        """Record successful operation."""
        self._success_count += 1
        self._failure_count = 0
        
        # Track calls at this level
        level_int = int(self._state.level)
        self._state.calls_at_level[level_int] = (
            self._state.calls_at_level.get(level_int, 0) + 1
        )
        
        # Check for recovery
        self._check_recovery()
    
    def record_failure(self, reason: str = "Unknown") -> None:
        """Record failed operation."""
        self._failure_count += 1
        self._success_count = 0
        
        logger.warning(
            "Degradation failure recorded: %s (count=%d)",
            reason, self._failure_count
        )
        
        # Check if we should degrade
        if self._failure_count >= self._failure_threshold:
            self._degrade(reason)
    
    def _degrade(self, reason: str) -> None:
        """Move to next degradation level."""
        if self._state.manual_override:
            logger.info("Degradation blocked by manual override")
            return
        
        current = self._state.level
        
        if current < DegradationLevel.HUMAN_TRANSFER:
            new_level = DegradationLevel(current + 1)
            self._transition_to(new_level, reason)
    
    def _check_recovery(self) -> None:
        """Check if we can recover to a better level."""
        if self._state.manual_override:
            return
        
        # Only check periodically
        now = time.time()
        if now - self._last_check < self._check_interval:
            return
        self._last_check = now
        
        # Need enough successes to recover
        if self._success_count < self._success_threshold:
            return
        
        # Check circuit breakers
        if not self._services_healthy():
            return
        
        # Recover one level
        current = self._state.level
        if current > DegradationLevel.FULL_AI:
            new_level = DegradationLevel(current - 1)
            self._transition_to(new_level, "Services recovered")
            self._success_count = 0
    
    def _services_healthy(self) -> bool:
        """Check if external services are healthy."""
        # Check OpenAI circuit
        openai_cb = CircuitBreakerManager.get("openai")
        if not openai_cb.can_execute():
            return False
        
        # Check ElevenLabs circuit (only for full AI)
        if self._state.level == DegradationLevel.FAST_AI:
            elevenlabs_cb = CircuitBreakerManager.get("elevenlabs")
            if not elevenlabs_cb.can_execute():
                return False
        
        return True
    
    def _transition_to(self, level: DegradationLevel, reason: str) -> None:
        """Transition to a new degradation level."""
        old_level = self._state.level
        self._state.level = level
        self._state.reason = reason
        self._state.since = time.time()
        self._state.level_changes += 1
        self._failure_count = 0
        
        logger.warning(
            "Degradation level changed: %s -> %s (reason: %s)",
            LEVEL_CONFIGS[old_level].name,
            LEVEL_CONFIGS[level].name,
            reason
        )
    
    def set_level(self, level: DegradationLevel, manual: bool = True) -> None:
        """
        Manually set degradation level.
        
        Args:
            level: Target level
            manual: If True, prevents automatic changes
        """
        self._state.manual_override = manual
        self._transition_to(level, "Manual override")
    
    def clear_override(self) -> None:
        """Clear manual override and allow automatic degradation."""
        self._state.manual_override = False
        logger.info("Manual override cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get degradation statistics."""
        config = self.get_config()
        return {
            "current_level": self._state.level.value,
            "level_name": config.name,
            "level_description": config.description,
            "reason": self._state.reason,
            "since": self._state.since,
            "duration_seconds": time.time() - self._state.since,
            "manual_override": self._state.manual_override,
            "failure_count": self._failure_count,
            "success_count": self._success_count,
            "level_changes": self._state.level_changes,
            "calls_per_level": self._state.calls_at_level,
            "openai_model": config.openai_model,
            "tts_provider": config.tts_provider,
            "use_llm": config.use_llm,
        }


# Global instance
_degradation: Optional[GracefulDegradation] = None


def get_degradation() -> GracefulDegradation:
    """Get the global degradation manager."""
    global _degradation
    if _degradation is None:
        _degradation = GracefulDegradation()
    return _degradation


def get_current_config() -> LevelConfig:
    """Get current degradation configuration."""
    return get_degradation().get_config()


def record_success() -> None:
    """Record successful operation."""
    get_degradation().record_success()


def record_failure(reason: str = "Unknown") -> None:
    """Record failed operation."""
    get_degradation().record_failure(reason)


def should_use_llm() -> bool:
    """Check if LLM should be used at current level."""
    return get_degradation().get_config().use_llm


def get_openai_model() -> str:
    """Get OpenAI model for current level."""
    return get_degradation().get_config().openai_model


def get_tts_provider() -> str:
    """Get TTS provider for current level."""
    return get_degradation().get_config().tts_provider
