"""
Audio Serving Endpoint.

Serves generated TTS audio files for Twilio <Play>.
Audio is cached in memory and served via public URLs.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.services.tts.elevenlabs_tts import get_audio_by_hash, get_cache_stats
from app.utils.logging import get_logger

logger = get_logger("audio")

router = APIRouter(tags=["audio"])


@router.get("/audio/{hash_key}.mp3")
async def serve_audio(hash_key: str):
    """
    Serve cached audio file by hash key.
    
    Twilio <Play> will fetch audio from this endpoint.
    """
    audio = get_audio_by_hash(hash_key)
    
    if not audio:
        logger.warning("Audio not found: %s", hash_key)
        raise HTTPException(status_code=404, detail="Audio not found")
    
    logger.debug("Serving audio: %s (%d bytes)", hash_key, len(audio))
    
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Content-Length": str(len(audio)),
        }
    )


@router.get("/audio/health")
async def audio_health():
    """Health check for audio service."""
    stats = get_cache_stats()
    return {
        "status": "healthy",
        "cache": stats,
    }
