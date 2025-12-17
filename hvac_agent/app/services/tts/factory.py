"""
TTS provider factory for HVAC Voice Agent.

Provides abstraction to switch between TTS providers based on configuration.
Supports fallback from ElevenLabs to Twilio's built-in Polly voices.
"""

import os
from enum import Enum
from typing import Optional, Callable, Any

from app.utils.logging import get_logger

logger = get_logger("tts.factory")


class TTSProvider(Enum):
    """Available TTS providers."""
    ELEVENLABS = "elevenlabs"
    TWILIO_POLLY = "twilio_polly"  # Fallback - uses Twilio's built-in <Say> with Polly


# Configuration
USE_ELEVENLABS = os.getenv("USE_ELEVENLABS", "false").lower() == "true"
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")


def get_tts_provider() -> TTSProvider:
    """
    Determine which TTS provider to use based on configuration.
    
    Returns:
        TTSProvider enum value
    """
    if USE_ELEVENLABS and ELEVENLABS_API_KEY:
        return TTSProvider.ELEVENLABS
    
    if USE_ELEVENLABS and not ELEVENLABS_API_KEY:
        logger.warning("USE_ELEVENLABS=true but ELEVENLABS_API_KEY not set, falling back to Twilio Polly")
    
    return TTSProvider.TWILIO_POLLY


def is_elevenlabs_available() -> bool:
    """Check if ElevenLabs is configured and available."""
    return USE_ELEVENLABS and bool(ELEVENLABS_API_KEY)


async def speak_with_fallback(
    text: str,
    send_audio: Callable[[bytes], Any],
    voice_id: Optional[str] = None,
) -> tuple[bool, TTSProvider]:
    """
    Speak text using configured TTS provider with automatic fallback.
    
    Args:
        text: Text to speak
        send_audio: Async callback to send audio chunks
        voice_id: Optional voice ID for ElevenLabs
        
    Returns:
        Tuple of (success, provider_used)
    """
    provider = get_tts_provider()
    
    if provider == TTSProvider.ELEVENLABS:
        try:
            from app.services.tts.elevenlabs import stream_tts
            success = await stream_tts(text, send_audio, voice_id)
            return success, TTSProvider.ELEVENLABS
        except Exception as e:
            logger.error("ElevenLabs TTS failed, cannot fallback in streaming mode: %s", str(e))
            return False, TTSProvider.ELEVENLABS
    
    # For Twilio Polly, we don't stream - it's handled via TwiML <Say>
    # Return False to indicate caller should use TwiML instead
    return False, TTSProvider.TWILIO_POLLY
