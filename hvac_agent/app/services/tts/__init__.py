"""
TTS (Text-to-Speech) services for HVAC Voice Agent.

Provides abstraction over multiple TTS providers with fallback support.
"""

from app.services.tts.elevenlabs import ElevenLabsTTS, stream_tts
from app.services.tts.factory import get_tts_provider, TTSProvider

__all__ = [
    "ElevenLabsTTS",
    "stream_tts",
    "get_tts_provider",
    "TTSProvider",
]
