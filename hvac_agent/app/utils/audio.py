"""
Audio utilities for HVAC Voice Agent.

Handles:
- Audio validation
- Format conversion helpers
- Twilio Media Streams audio processing

Twilio Media Streams:
- Audio is PCMU (G.711 μ-law), 8kHz, mono, base64-encoded in payload.

OpenAI Realtime:
- Supports "g711_ulaw" input/output format compatible with Twilio PCMU.
"""

import base64
from typing import Optional, Tuple

from app.utils.logging import get_logger

logger = get_logger("audio")


def validate_base64_audio(payload: str) -> Optional[str]:
    """
    Validate base64-encoded audio payload.
    
    Args:
        payload: Base64-encoded audio string
        
    Returns:
        Original payload if valid, None otherwise
    """
    if not payload:
        return None
    
    try:
        decoded = base64.b64decode(payload)
        # Basic validation - check if we got some data
        if len(decoded) > 0:
            return payload
        return None
    except Exception as e:
        logger.warning("Invalid base64 audio payload: %s", str(e))
        return None


def decode_audio(payload: str) -> Optional[bytes]:
    """
    Decode base64 audio payload to bytes.
    
    Args:
        payload: Base64-encoded audio string
        
    Returns:
        Decoded audio bytes or None
    """
    try:
        return base64.b64decode(payload)
    except Exception as e:
        logger.warning("Failed to decode audio: %s", str(e))
        return None


def encode_audio(audio_bytes: bytes) -> str:
    """
    Encode audio bytes to base64 string.
    
    Args:
        audio_bytes: Raw audio bytes
        
    Returns:
        Base64-encoded string
    """
    return base64.b64encode(audio_bytes).decode("utf-8")


def get_audio_duration_estimate(payload: str, sample_rate: int = 8000) -> float:
    """
    Estimate audio duration from base64 payload.
    
    For G.711 μ-law: 8kHz sample rate, 8 bits per sample
    
    Args:
        payload: Base64-encoded audio
        sample_rate: Sample rate (default 8000 for G.711)
        
    Returns:
        Estimated duration in seconds
    """
    try:
        decoded = base64.b64decode(payload)
        # G.711 μ-law: 1 byte per sample
        num_samples = len(decoded)
        duration = num_samples / sample_rate
        return duration
    except Exception:
        return 0.0


def is_silence(payload: str, threshold: int = 10) -> bool:
    """
    Check if audio payload is likely silence.
    
    For G.711 μ-law, silence is typically around 0xFF (255) or 0x7F (127).
    
    Args:
        payload: Base64-encoded audio
        threshold: Variance threshold for silence detection
        
    Returns:
        True if likely silence
    """
    try:
        decoded = base64.b64decode(payload)
        if len(decoded) == 0:
            return True
        
        # Calculate variance from silence value
        silence_value = 0xFF  # μ-law silence
        variance = sum(abs(b - silence_value) for b in decoded) / len(decoded)
        
        return variance < threshold
    except Exception:
        return False


def create_silence_payload(duration_ms: int = 100, sample_rate: int = 8000) -> str:
    """
    Create a silence audio payload.
    
    Args:
        duration_ms: Duration in milliseconds
        sample_rate: Sample rate
        
    Returns:
        Base64-encoded silence payload
    """
    num_samples = int(sample_rate * duration_ms / 1000)
    # G.711 μ-law silence byte
    silence_bytes = bytes([0xFF] * num_samples)
    return base64.b64encode(silence_bytes).decode("utf-8")


class AudioBuffer:
    """
    Buffer for accumulating audio chunks.
    
    Useful for processing audio in larger segments.
    """
    
    def __init__(self, max_duration_seconds: float = 30.0):
        self._chunks: list = []
        self._total_bytes: int = 0
        self._max_bytes: int = int(max_duration_seconds * 8000)  # 8kHz
    
    def add_chunk(self, payload: str) -> bool:
        """
        Add an audio chunk to the buffer.
        
        Args:
            payload: Base64-encoded audio chunk
            
        Returns:
            True if added, False if buffer full
        """
        decoded = decode_audio(payload)
        if decoded is None:
            return False
        
        if self._total_bytes + len(decoded) > self._max_bytes:
            return False
        
        self._chunks.append(decoded)
        self._total_bytes += len(decoded)
        return True
    
    def get_combined(self) -> Optional[str]:
        """
        Get combined audio as base64 string.
        
        Returns:
            Combined base64-encoded audio
        """
        if not self._chunks:
            return None
        
        combined = b"".join(self._chunks)
        return encode_audio(combined)
    
    def clear(self) -> None:
        """Clear the buffer."""
        self._chunks = []
        self._total_bytes = 0
    
    @property
    def duration_seconds(self) -> float:
        """Get current buffer duration in seconds."""
        return self._total_bytes / 8000  # 8kHz sample rate
    
    @property
    def is_empty(self) -> bool:
        """Check if buffer is empty."""
        return len(self._chunks) == 0
