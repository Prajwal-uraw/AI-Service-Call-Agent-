"""
Acknowledgment Sound System for HVAC Voice Agent.

Provides context-aware acknowledgment sounds to mask processing latency.
Humans expect 200-400ms of "processing" sounds - faster feels robotic,
slower feels laggy.

Features:
- Context-aware sound selection based on conversation state
- Pre-generated audio cache for instant playback
- Variety to avoid repetition
- Timing control for natural rhythm
"""

import os
import random
import asyncio
import hashlib
from typing import Optional, Dict, List, Any
from datetime import datetime
from cachetools import TTLCache

from app.utils.logging import get_logger

logger = get_logger("acknowledgments")

# Acknowledgment phrases organized by context
ACKNOWLEDGMENTS: Dict[str, List[str]] = {
    # Initial greeting responses
    "greeting": [
        "I can help with that.",
        "Absolutely.",
        "Sure thing.",
        "Of course.",
    ],
    
    # Booking-related
    "booking": [
        "Let me check that for you.",
        "Checking availability.",
        "One moment.",
        "Let me look that up.",
    ],
    
    # Information collection
    "collecting": [
        "Got it.",
        "Okay.",
        "Alright.",
        "Perfect.",
    ],
    
    # Confirmation
    "confirm": [
        "Great.",
        "Wonderful.",
        "Excellent.",
        "Perfect.",
    ],
    
    # Question handling
    "question": [
        "Good question.",
        "Let me explain.",
        "Sure.",
        "Hmm, let me think.",
    ],
    
    # Default/generic
    "default": [
        "Mm-hmm.",
        "Okay.",
        "Got it.",
        "Sure.",
        "Alright.",
    ],
    
    # Empathetic (for frustrated callers)
    "empathetic": [
        "I understand.",
        "I hear you.",
        "I'm sorry about that.",
        "Let me help with that.",
    ],
}

# Minimum duration for acknowledgment (masks processing time)
MIN_ACKNOWLEDGMENT_DURATION_MS = 200
MAX_ACKNOWLEDGMENT_DURATION_MS = 400


class AcknowledgmentManager:
    """
    Manages acknowledgment sounds for natural conversation flow.
    
    Usage:
        manager = AcknowledgmentManager()
        
        # Get acknowledgment text
        ack_text = manager.get_acknowledgment("booking", turn_count=3)
        
        # Play with timing
        await manager.play_acknowledgment(ack_text, send_audio, min_duration_ms=200)
    """
    
    def __init__(self):
        # Track recently used acknowledgments to avoid repetition
        self._recent_acks: List[str] = []
        self._max_recent = 5
        
        # Cache for pre-generated audio (if using TTS)
        self._audio_cache: TTLCache = TTLCache(maxsize=100, ttl=3600)
        
        # Usage stats
        self._usage_count: Dict[str, int] = {}
    
    def get_acknowledgment(
        self,
        context: str = "default",
        turn_count: int = 0,
        frustration_level: int = 0,
    ) -> str:
        """
        Get a context-appropriate acknowledgment phrase.
        
        Args:
            context: Conversation context (booking, question, etc.)
            turn_count: Number of turns in conversation
            frustration_level: 0-5 frustration score
            
        Returns:
            Acknowledgment phrase
        """
        # Use empathetic acknowledgments for frustrated callers
        if frustration_level >= 3:
            context = "empathetic"
        
        # Early conversation - more formal
        if turn_count <= 2:
            context = "greeting"
        
        # Get phrases for context
        phrases = ACKNOWLEDGMENTS.get(context, ACKNOWLEDGMENTS["default"])
        
        # Filter out recently used phrases
        available = [p for p in phrases if p not in self._recent_acks]
        if not available:
            available = phrases
            self._recent_acks.clear()
        
        # Select random phrase
        phrase = random.choice(available)
        
        # Track usage
        self._recent_acks.append(phrase)
        if len(self._recent_acks) > self._max_recent:
            self._recent_acks.pop(0)
        
        self._usage_count[phrase] = self._usage_count.get(phrase, 0) + 1
        
        return phrase
    
    def get_thinking_phrase(self, intent: str = "default") -> str:
        """
        Get a "thinking" phrase for longer processing.
        
        Args:
            intent: The detected intent
            
        Returns:
            Thinking phrase
        """
        thinking_phrases = {
            "booking": [
                "Let me check our schedule.",
                "Checking availability now.",
                "One moment while I look that up.",
            ],
            "faq": [
                "Let me find that information.",
                "Good question, let me check.",
            ],
            "reschedule": [
                "Let me look up your appointment.",
                "Checking your booking now.",
            ],
            "default": [
                "One moment.",
                "Let me check on that.",
                "Just a moment.",
            ],
        }
        
        phrases = thinking_phrases.get(intent, thinking_phrases["default"])
        return random.choice(phrases)
    
    async def play_with_timing(
        self,
        text: str,
        tts_func,
        send_audio,
        min_duration_ms: int = MIN_ACKNOWLEDGMENT_DURATION_MS,
    ) -> None:
        """
        Play acknowledgment with minimum duration timing.
        
        Ensures the acknowledgment takes at least min_duration_ms to
        mask processing latency naturally.
        
        Args:
            text: Acknowledgment text
            tts_func: TTS function to generate audio
            send_audio: Callback to send audio
            min_duration_ms: Minimum duration in milliseconds
        """
        import time
        start = time.time()
        
        # Generate and play audio
        try:
            await tts_func(text, send_audio)
        except Exception as e:
            logger.warning("Failed to play acknowledgment: %s", str(e))
            return
        
        # Ensure minimum duration
        elapsed_ms = (time.time() - start) * 1000
        if elapsed_ms < min_duration_ms:
            remaining_ms = min_duration_ms - elapsed_ms
            await asyncio.sleep(remaining_ms / 1000)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get usage statistics."""
        return {
            "total_acknowledgments": sum(self._usage_count.values()),
            "unique_phrases_used": len(self._usage_count),
            "most_used": sorted(
                self._usage_count.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5],
        }


# Global instance
_acknowledgment_manager: Optional[AcknowledgmentManager] = None


def get_acknowledgment_manager() -> AcknowledgmentManager:
    """Get the global acknowledgment manager instance."""
    global _acknowledgment_manager
    if _acknowledgment_manager is None:
        _acknowledgment_manager = AcknowledgmentManager()
    return _acknowledgment_manager


def get_acknowledgment(
    context: str = "default",
    turn_count: int = 0,
    frustration_level: int = 0,
) -> str:
    """
    Convenience function to get an acknowledgment phrase.
    
    Args:
        context: Conversation context
        turn_count: Number of turns
        frustration_level: Frustration score
        
    Returns:
        Acknowledgment phrase
    """
    manager = get_acknowledgment_manager()
    return manager.get_acknowledgment(context, turn_count, frustration_level)


def get_thinking_phrase(intent: str = "default") -> str:
    """
    Convenience function to get a thinking phrase.
    
    Args:
        intent: The detected intent
        
    Returns:
        Thinking phrase
    """
    manager = get_acknowledgment_manager()
    return manager.get_thinking_phrase(intent)
