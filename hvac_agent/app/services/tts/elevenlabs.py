"""
ElevenLabs TTS streaming service for HVAC Voice Agent.

Enterprise-grade text-to-speech with:
- Ultra-low latency streaming (~200ms first byte)
- Chunk-by-chunk audio delivery for smooth playback
- PCM μ-law 8kHz conversion for Twilio Media Streams
- Barge-in support with immediate cancellation
- Automatic retry with exponential backoff
- Connection pooling for reduced latency
"""

import os
import asyncio
from typing import AsyncGenerator, Optional, Callable, Any
import aiohttp

from app.utils.logging import get_logger
from app.services.audio.converter import convert_mp3_to_ulaw
from app.services.audio.buffer import MP3FrameBuffer

logger = get_logger("tts.elevenlabs")

# Configuration from environment
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "DLsHlh26Ugcm6ELvS0qi")
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# Voice settings optimized for natural phone conversation
# These settings produce warm, professional, human-like speech
VOICE_SETTINGS = {
    "stability": 0.38,          # Lower = more expressive, higher = more consistent
    "similarity_boost": 0.72,   # Voice clarity and similarity to original
    "style": 0.42,              # Speaking style expressiveness
    "use_speaker_boost": True,  # Enhanced clarity for phone audio
}

# Model selection - eleven_turbo_v2_5 for lowest latency
MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_turbo_v2_5")

# Streaming optimization settings
STREAM_CHUNK_SIZE = 1024        # Optimal chunk size for Twilio
LATENCY_OPTIMIZATION = 4        # 0-4, higher = lower latency, less quality
CONNECTION_TIMEOUT = 5.0        # Connection timeout in seconds
READ_TIMEOUT = 30.0             # Read timeout for streaming
MAX_RETRIES = 2                 # Max retry attempts on failure


class ElevenLabsTTS:
    """
    Enterprise-grade ElevenLabs TTS client with streaming support.
    
    Features:
    - Ultra-low latency streaming with turbo model
    - Connection pooling for reduced overhead
    - Automatic retry with exponential backoff
    - Barge-in support with immediate cancellation
    - PCM μ-law 8kHz output for Twilio Media Streams
    """
    
    # Shared connection pool for all instances
    _shared_session: Optional[aiohttp.ClientSession] = None
    _session_lock = asyncio.Lock()
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        voice_id: Optional[str] = None,
        model_id: Optional[str] = None,
    ):
        self.api_key = api_key or ELEVENLABS_API_KEY
        self.voice_id = voice_id or ELEVENLABS_VOICE_ID
        self.model_id = model_id or MODEL_ID
        self._session: Optional[aiohttp.ClientSession] = None
        self._is_speaking = False
        self._cancel_event = asyncio.Event()
        self._bytes_sent = 0
        self._stream_start_time: Optional[float] = None
        
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY not configured")
    
    @classmethod
    async def _get_shared_session(cls) -> aiohttp.ClientSession:
        """Get or create shared aiohttp session with connection pooling."""
        async with cls._session_lock:
            if cls._shared_session is None or cls._shared_session.closed:
                connector = aiohttp.TCPConnector(
                    limit=100,              # Max connections
                    limit_per_host=10,      # Max per host
                    keepalive_timeout=30,   # Keep connections alive
                    enable_cleanup_closed=True,
                )
                timeout = aiohttp.ClientTimeout(
                    total=READ_TIMEOUT,
                    connect=CONNECTION_TIMEOUT,
                )
                cls._shared_session = aiohttp.ClientSession(
                    connector=connector,
                    timeout=timeout,
                )
            return cls._shared_session
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get aiohttp session (uses shared pool)."""
        return await self._get_shared_session()
    
    async def close(self):
        """Close the HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()
            self._session = None
    
    def cancel_speech(self):
        """Cancel ongoing speech (for barge-in support)."""
        self._cancel_event.set()
        self._is_speaking = False
    
    def reset_cancel(self):
        """Reset cancel event for new speech."""
        self._cancel_event.clear()
    
    @property
    def is_speaking(self) -> bool:
        """Check if TTS is currently generating speech."""
        return self._is_speaking
    
    async def stream_to_twilio(
        self,
        text: str,
        send_audio: Callable[[bytes], Any],
        chunk_size: int = 1024,
    ) -> bool:
        """
        Stream TTS audio directly to Twilio via callback.
        
        Args:
            text: Text to convert to speech
            send_audio: Async callback to send audio chunks (receives μ-law bytes)
            chunk_size: Size of audio chunks to send
            
        Returns:
            True if completed, False if cancelled (barge-in)
        """
        self.reset_cancel()
        self._is_speaking = True
        total_chunks_sent = 0
        total_bytes_sent = 0
        
        logger.info("Starting TTS stream for text: %s", text[:50])
        
        try:
            chunk_count = 0
            async for audio_chunk in self.stream_audio(text):
                chunk_count += 1
                logger.info("Received ElevenLabs audio chunk #%d: %d bytes", chunk_count, len(audio_chunk))
                
                if self._cancel_event.is_set():
                    logger.debug("Speech cancelled (barge-in)")
                    return False
                
                # Convert MP3 chunk to μ-law for Twilio
                ulaw_audio = await self._convert_to_ulaw(audio_chunk)
                
                if not ulaw_audio or len(ulaw_audio) == 0:
                    logger.error("μ-law conversion produced empty audio for chunk #%d", chunk_count)
                    continue
                
                logger.info("Converted to μ-law: %d bytes", len(ulaw_audio))
                
                # Send in smaller chunks for smoother streaming
                for i in range(0, len(ulaw_audio), chunk_size):
                    if self._cancel_event.is_set():
                        return False
                    chunk = ulaw_audio[i:i + chunk_size]
                    await send_audio(chunk)
                    total_chunks_sent += 1
                    total_bytes_sent += len(chunk)
            
            logger.info("TTS stream complete: sent %d chunks, %d total bytes", total_chunks_sent, total_bytes_sent)
            return True
            
        except Exception as e:
            logger.error("Error streaming to Twilio: %s", str(e))
            return False
        finally:
            self._is_speaking = False
    
    async def stream_audio(
        self,
        text: str,
        optimize_latency: int = LATENCY_OPTIMIZATION,
    ) -> AsyncGenerator[bytes, None]:
        """
        Stream audio from ElevenLabs API with retry support.
        
        Args:
            text: Text to convert to speech
            optimize_latency: 0-4, higher = lower latency
            
        Yields:
            Raw MP3 audio chunks
        """
        if not text or not text.strip():
            return
        
        import time
        self._stream_start_time = time.time()
        self._bytes_sent = 0
        
        session = await self._get_session()
        url = f"{ELEVENLABS_API_URL}/{self.voice_id}/stream"
        
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": VOICE_SETTINGS,
            "optimize_streaming_latency": optimize_latency,
        }
        
        last_error = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                async with session.post(
                    url,
                    headers=headers,
                    json=payload,
                ) as response:
                    if response.status == 429:
                        # Rate limited - wait and retry
                        wait_time = 2 ** attempt
                        logger.warning("Rate limited, waiting %ds", wait_time)
                        await asyncio.sleep(wait_time)
                        continue
                    
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(
                            "ElevenLabs API error: status=%d, body=%s",
                            response.status, error_text[:200]
                        )
                        return
                    
                    # Stream the response with optimal chunk size
                    first_chunk = True
                    async for chunk in response.content.iter_chunked(STREAM_CHUNK_SIZE * 4):
                        if self._cancel_event.is_set():
                            logger.debug("Stream cancelled (barge-in)")
                            return
                        if chunk:
                            if first_chunk:
                                latency = (time.time() - self._stream_start_time) * 1000
                                logger.debug("First byte latency: %.0fms", latency)
                                first_chunk = False
                            self._bytes_sent += len(chunk)
                            yield chunk
                    
                    # Success - exit retry loop
                    return
                            
            except asyncio.TimeoutError:
                last_error = "timeout"
                logger.warning("ElevenLabs timeout, attempt %d/%d", attempt + 1, MAX_RETRIES + 1)
            except aiohttp.ClientError as e:
                last_error = str(e)
                logger.warning("ElevenLabs client error: %s, attempt %d/%d", str(e), attempt + 1, MAX_RETRIES + 1)
            
            # Exponential backoff before retry
            if attempt < MAX_RETRIES:
                await asyncio.sleep(0.5 * (2 ** attempt))
        
        logger.error("ElevenLabs streaming failed after %d attempts: %s", MAX_RETRIES + 1, last_error)
    
    async def _convert_to_ulaw(self, mp3_data: bytes) -> Optional[bytes]:
        """
        Convert MP3 audio to PCM μ-law 8kHz mono for Twilio.
        
        Uses the centralized audio converter module for consistent
        conversion across the application.
        
        Args:
            mp3_data: Raw MP3 audio bytes
            
        Returns:
            μ-law encoded audio bytes, or None on error
        """
        return await convert_mp3_to_ulaw(mp3_data)


# Module-level convenience function
async def stream_tts(
    text: str,
    send_audio: Callable[[bytes], Any],
    voice_id: Optional[str] = None,
) -> bool:
    """
    Stream TTS audio to Twilio (convenience function).
    
    Args:
        text: Text to convert to speech
        send_audio: Async callback to send audio chunks
        voice_id: Optional voice ID override
        
    Returns:
        True if completed, False if cancelled
    """
    tts = ElevenLabsTTS(voice_id=voice_id)
    try:
        return await tts.stream_to_twilio(text, send_audio)
    finally:
        await tts.close()


class ElevenLabsStreamBuffer:
    """
    Buffer for accumulating and processing ElevenLabs audio stream.
    
    Handles the complexity of MP3 streaming where chunks may not
    align with frame boundaries.
    """
    
    def __init__(self):
        self._buffer = bytearray()
        self._min_chunk_size = 4096  # Minimum bytes before processing
    
    def add_chunk(self, data: bytes) -> Optional[bytes]:
        """
        Add a chunk and return processable data if available.
        
        Args:
            data: Raw MP3 chunk
            
        Returns:
            Processable chunk or None if more data needed
        """
        self._buffer.extend(data)
        
        if len(self._buffer) >= self._min_chunk_size:
            result = bytes(self._buffer)
            self._buffer.clear()
            return result
        
        return None
    
    def flush(self) -> Optional[bytes]:
        """
        Flush remaining buffer data.
        
        Returns:
            Remaining data or None if empty
        """
        if self._buffer:
            result = bytes(self._buffer)
            self._buffer.clear()
            return result
        return None
    
    def clear(self):
        """Clear the buffer."""
        self._buffer.clear()
