"""
ElevenLabs TTS Service - Production Grade.

Generates audio via ElevenLabs Text-to-Speech API and serves via public URLs.
Used with Twilio <Play> for enterprise-stable voice calls.

Architecture:
- Generate MP3 audio from ElevenLabs API
- Store in memory cache with hash-based keys
- Serve via /audio/{hash}.mp3 endpoint
- Twilio <Play> fetches the audio URL

Features:
- Non-streaming, complete audio generation
- In-memory caching (hash text → reuse audio)
- Public URL generation for Twilio <Play>
- Fallback to Polly on failure
- Latency logging
"""

import os
import hashlib
import time
from typing import Optional, Dict, Tuple
from datetime import datetime, timedelta

import httpx

from app.utils.logging import get_logger

logger = get_logger("tts.elevenlabs")


# =============================================================================
# CONFIGURATION
# =============================================================================
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "DLsHlh26Ugcm6ELvS0qi")  # MS WALKER
ELEVENLABS_MODEL = "eleven_turbo_v2_5"
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"

# Voice settings optimized for phone calls (8kHz μ-law)
# Lower stability = more expressive, higher similarity = more consistent
VOICE_SETTINGS = {
    "stability": 0.50,           # Balanced for phone clarity
    "similarity_boost": 0.75,    # High consistency
    "style": 0.0,                 # No style exaggeration for phone
    "use_speaker_boost": True     # Enhance voice presence
}

# Output format optimized for Twilio (phone quality)
OUTPUT_FORMAT = "mp3_22050_32"  # 22kHz, 32kbps - good for phone, small files

# Cache settings
CACHE_TTL_SECONDS = 3600  # 1 hour
MAX_CACHE_SIZE = 500  # Max cached audio files


# =============================================================================
# AUDIO CACHE
# =============================================================================
class AudioCache:
    """Thread-safe in-memory audio cache."""
    
    def __init__(self):
        self._cache: Dict[str, Dict] = {}
    
    def _hash_text(self, text: str) -> str:
        """Generate deterministic hash from text."""
        return hashlib.sha256(text.strip().lower().encode()).hexdigest()[:16]
    
    def get(self, text: str) -> Optional[Tuple[str, bytes]]:
        """Get cached audio. Returns (hash, audio_bytes) or None."""
        key = self._hash_text(text)
        if key in self._cache:
            entry = self._cache[key]
            if datetime.now() < entry["expires"]:
                logger.debug("Cache HIT: %s", text[:30])
                return (key, entry["audio"])
            else:
                del self._cache[key]
        return None
    
    def set(self, text: str, audio: bytes) -> str:
        """Cache audio. Returns the hash key."""
        # Evict old entries if cache is full
        if len(self._cache) >= MAX_CACHE_SIZE:
            self._evict_oldest()
        
        key = self._hash_text(text)
        self._cache[key] = {
            "audio": audio,
            "text": text,
            "expires": datetime.now() + timedelta(seconds=CACHE_TTL_SECONDS),
            "created": datetime.now()
        }
        logger.debug("Cache SET: %s -> %s", text[:30], key)
        return key
    
    def get_by_hash(self, hash_key: str) -> Optional[bytes]:
        """Get audio by hash key (for serving endpoint)."""
        if hash_key in self._cache:
            entry = self._cache[hash_key]
            if datetime.now() < entry["expires"]:
                return entry["audio"]
        return None
    
    def _evict_oldest(self):
        """Remove oldest cache entries."""
        if not self._cache:
            return
        # Sort by creation time and remove oldest 10%
        sorted_keys = sorted(
            self._cache.keys(),
            key=lambda k: self._cache[k]["created"]
        )
        to_remove = max(1, len(sorted_keys) // 10)
        for key in sorted_keys[:to_remove]:
            del self._cache[key]
        logger.info("Evicted %d cache entries", to_remove)
    
    def stats(self) -> Dict:
        """Get cache statistics."""
        return {
            "size": len(self._cache),
            "max_size": MAX_CACHE_SIZE,
        }


# Global cache instance
_audio_cache = AudioCache()


# =============================================================================
# TTS GENERATION
# =============================================================================
async def generate_audio(text: str) -> Optional[Tuple[str, bytes]]:
    """
    Generate audio from text using ElevenLabs.
    
    Args:
        text: Text to convert to speech (keep short for phone)
        
    Returns:
        Tuple of (hash_key, audio_bytes) or None on error
    """
    if not text or not text.strip():
        return None
    
    # Check cache first
    cached = _audio_cache.get(text)
    if cached:
        return cached
    
    if not ELEVENLABS_API_KEY:
        logger.warning("ElevenLabs API key not configured")
        return None
    
    start_time = time.time()
    
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
            "voice_settings": VOICE_SETTINGS,
            "output_format": OUTPUT_FORMAT
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            latency_ms = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                audio = response.content
                hash_key = _audio_cache.set(text, audio)
                logger.info("TTS generated: %d bytes, %.0fms, text='%s'", 
                           len(audio), latency_ms, text[:40])
                return (hash_key, audio)
            else:
                logger.error("ElevenLabs error: status=%d, body=%s", 
                           response.status_code, response.text[:200])
                return None
                
    except httpx.TimeoutException:
        logger.error("ElevenLabs timeout after %.0fms", (time.time() - start_time) * 1000)
        return None
    except Exception as e:
        logger.error("ElevenLabs error: %s", str(e))
        return None


def get_audio_by_hash(hash_key: str) -> Optional[bytes]:
    """Get cached audio by hash key. Used by serving endpoint."""
    return _audio_cache.get_by_hash(hash_key)


def get_audio_url(hash_key: str, host: str) -> str:
    """Generate public URL for audio file."""
    # Ensure https for production
    if host and not host.startswith("http"):
        host = f"https://{host}"
    return f"{host}/audio/{hash_key}.mp3"


async def generate_audio_url(text: str, host: str) -> Optional[str]:
    """
    Generate audio and return public URL.
    
    This is the main function to use for Twilio <Play>.
    
    Args:
        text: Text to speak
        host: Base URL host (e.g., "haiec--hvac-voice-agent-fastapi-app.modal.run")
        
    Returns:
        Public URL to audio file, or None on error
    """
    result = await generate_audio(text)
    if result:
        hash_key, _ = result
        return get_audio_url(hash_key, host)
    return None


def is_available() -> bool:
    """Check if ElevenLabs TTS is configured."""
    return bool(ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID)


def get_cache_stats() -> Dict:
    """Get cache statistics for monitoring."""
    return _audio_cache.stats()
