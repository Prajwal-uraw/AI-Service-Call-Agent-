"""
ElevenLabs TTS Service - Non-Streaming (Gather-based architecture).

Generates complete audio files for Twilio <Play> integration.
Uses eleven_turbo_v2_5 for fast, natural-sounding speech.

Features:
- Non-streaming audio generation
- Audio caching to reduce API calls
- Base64 audio for inline TwiML
- Fallback to Polly if ElevenLabs fails
"""

import os
import base64
import hashlib
import asyncio
from typing import Optional, Dict
from datetime import datetime, timedelta

import aiohttp

from app.utils.logging import get_logger

logger = get_logger("tts.elevenlabs_sync")


# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel - warm, friendly
ELEVENLABS_MODEL = "eleven_turbo_v2_5"  # Fast, high-quality
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"

# Voice settings for natural HVAC dispatcher
VOICE_SETTINGS = {
    "stability": 0.4,        # Lower = more expressive
    "similarity_boost": 0.7,  # Higher = more consistent
    "style": 0.3,            # Slight style for warmth
    "use_speaker_boost": True
}

# Simple in-memory cache (use Redis in production)
_audio_cache: Dict[str, Dict] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour


def _get_cache_key(text: str) -> str:
    """Generate cache key from text."""
    return hashlib.md5(text.encode()).hexdigest()


def _get_cached_audio(text: str) -> Optional[bytes]:
    """Get cached audio if available and not expired."""
    key = _get_cache_key(text)
    if key in _audio_cache:
        entry = _audio_cache[key]
        if datetime.now() < entry["expires"]:
            logger.debug("Cache hit for: %s", text[:30])
            return entry["audio"]
        else:
            del _audio_cache[key]
    return None


def _cache_audio(text: str, audio: bytes):
    """Cache audio with TTL."""
    key = _get_cache_key(text)
    _audio_cache[key] = {
        "audio": audio,
        "expires": datetime.now() + timedelta(seconds=CACHE_TTL_SECONDS)
    }
    logger.debug("Cached audio for: %s", text[:30])


async def generate_speech(text: str) -> Optional[bytes]:
    """
    Generate speech audio from text using ElevenLabs.
    
    Args:
        text: Text to convert to speech
        
    Returns:
        MP3 audio bytes, or None on error
    """
    if not ELEVENLABS_API_KEY:
        logger.warning("ElevenLabs API key not configured")
        return None
    
    if not text or not text.strip():
        return None
    
    # Check cache first
    cached = _get_cached_audio(text)
    if cached:
        return cached
    
    logger.info("Generating speech: %s", text[:50])
    
    try:
        url = f"{ELEVENLABS_API_URL}/text-to-speech/{ELEVENLABS_VOICE_ID}"
        
        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        
        payload = {
            "text": text,
            "model_id": ELEVENLABS_MODEL,
            "voice_settings": VOICE_SETTINGS
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, timeout=30) as response:
                if response.status == 200:
                    audio = await response.read()
                    logger.info("Generated %d bytes of audio", len(audio))
                    _cache_audio(text, audio)
                    return audio
                else:
                    error_body = await response.text()
                    logger.error("ElevenLabs API error: status=%d, body=%s", 
                               response.status, error_body[:200])
                    return None
                    
    except asyncio.TimeoutError:
        logger.error("ElevenLabs API timeout")
        return None
    except Exception as e:
        logger.error("ElevenLabs API error: %s", str(e))
        return None


async def generate_speech_base64(text: str) -> Optional[str]:
    """
    Generate speech and return as base64-encoded string.
    Useful for inline audio in responses.
    
    Args:
        text: Text to convert to speech
        
    Returns:
        Base64-encoded MP3 audio, or None on error
    """
    audio = await generate_speech(text)
    if audio:
        return base64.b64encode(audio).decode("ascii")
    return None


def is_elevenlabs_available() -> bool:
    """Check if ElevenLabs is configured."""
    return bool(ELEVENLABS_API_KEY)


# Pre-generate common phrases for faster response
COMMON_PHRASES = [
    "Thanks for calling KC Comfort Air! This is our scheduling assistant. How can I help you today?",
    "Perfect, I can help you schedule that. May I have your name please?",
    "Great. What's the service address?",
    "What's going on with your system? Just give me a quick description.",
    "When would you like us to come out?",
    "And do you prefer morning or afternoon?",
    "Sorry, I didn't catch that. Could you say that again?",
    "Thanks for calling! Have a great day.",
]


async def warm_cache():
    """Pre-generate common phrases to warm the cache."""
    if not is_elevenlabs_available():
        logger.info("ElevenLabs not available, skipping cache warm-up")
        return
    
    logger.info("Warming TTS cache with %d common phrases", len(COMMON_PHRASES))
    
    for phrase in COMMON_PHRASES:
        try:
            await generate_speech(phrase)
            await asyncio.sleep(0.5)  # Rate limiting
        except Exception as e:
            logger.warning("Failed to cache phrase: %s", str(e))
    
    logger.info("TTS cache warm-up complete")
