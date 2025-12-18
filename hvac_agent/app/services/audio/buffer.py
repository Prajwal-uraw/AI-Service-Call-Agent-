"""
MP3 Frame Buffer for handling streaming audio.

MP3 is a streaming format with frame boundaries that don't align with
arbitrary chunk sizes from network streams. This buffer accumulates
data until complete frames are available for processing.
"""

from typing import Optional
from app.utils.logging import get_logger

logger = get_logger("audio.buffer")


class MP3FrameBuffer:
    """
    Buffer for accumulating and processing MP3 audio stream.
    
    Handles the complexity of MP3 streaming where chunks may not
    align with frame boundaries. Accumulates data until a minimum
    size is reached before yielding for processing.
    
    Usage:
        buffer = MP3FrameBuffer()
        
        async for chunk in elevenlabs_stream:
            processable = buffer.add_chunk(chunk)
            if processable:
                ulaw_audio = await convert_to_ulaw(processable)
                await send_to_twilio(ulaw_audio)
        
        # Don't forget to flush at the end
        remaining = buffer.flush()
        if remaining:
            ulaw_audio = await convert_to_ulaw(remaining)
            await send_to_twilio(ulaw_audio)
    """
    
    # MP3 frame sizes vary, but 4KB is a safe minimum for processing
    DEFAULT_MIN_CHUNK_SIZE = 4096
    
    def __init__(self, min_chunk_size: int = DEFAULT_MIN_CHUNK_SIZE):
        """
        Initialize the buffer.
        
        Args:
            min_chunk_size: Minimum bytes to accumulate before processing.
                           Larger values = more latency but better quality.
                           Smaller values = less latency but may cause glitches.
        """
        self._buffer = bytearray()
        self._min_chunk_size = min_chunk_size
        self._total_bytes_received = 0
        self._total_chunks_yielded = 0
    
    def add_chunk(self, data: bytes) -> Optional[bytes]:
        """
        Add a chunk and return processable data if available.
        
        Args:
            data: Raw MP3 chunk from stream
            
        Returns:
            Processable chunk if buffer has enough data, None otherwise
        """
        if not data:
            return None
        
        self._buffer.extend(data)
        self._total_bytes_received += len(data)
        
        if len(self._buffer) >= self._min_chunk_size:
            result = bytes(self._buffer)
            self._buffer.clear()
            self._total_chunks_yielded += 1
            return result
        
        return None
    
    def flush(self) -> Optional[bytes]:
        """
        Flush remaining buffer data.
        
        Call this when the stream ends to get any remaining audio.
        
        Returns:
            Remaining data or None if empty
        """
        if self._buffer:
            result = bytes(self._buffer)
            self._buffer.clear()
            self._total_chunks_yielded += 1
            logger.debug(
                "Buffer flushed: %d bytes remaining",
                len(result)
            )
            return result
        return None
    
    def clear(self):
        """Clear the buffer without returning data."""
        self._buffer.clear()
    
    @property
    def buffered_size(self) -> int:
        """Get current buffer size in bytes."""
        return len(self._buffer)
    
    @property
    def is_empty(self) -> bool:
        """Check if buffer is empty."""
        return len(self._buffer) == 0
    
    def get_stats(self) -> dict:
        """Get buffer statistics."""
        return {
            "buffered_bytes": len(self._buffer),
            "total_bytes_received": self._total_bytes_received,
            "total_chunks_yielded": self._total_chunks_yielded,
            "min_chunk_size": self._min_chunk_size,
        }


class AdaptiveMP3Buffer(MP3FrameBuffer):
    """
    Adaptive buffer that adjusts chunk size based on stream characteristics.
    
    Starts with smaller chunks for lower latency, then increases if
    audio quality issues are detected.
    """
    
    MIN_CHUNK_SIZE = 2048
    MAX_CHUNK_SIZE = 8192
    
    def __init__(self):
        super().__init__(min_chunk_size=self.MIN_CHUNK_SIZE)
        self._error_count = 0
        self._success_count = 0
    
    def record_conversion_success(self):
        """Record successful audio conversion."""
        self._success_count += 1
        
        # After many successes, try reducing chunk size for lower latency
        if self._success_count > 20 and self._min_chunk_size > self.MIN_CHUNK_SIZE:
            self._min_chunk_size = max(
                self.MIN_CHUNK_SIZE,
                self._min_chunk_size - 512
            )
            self._success_count = 0
            logger.debug("Reduced buffer size to %d", self._min_chunk_size)
    
    def record_conversion_error(self):
        """Record failed audio conversion."""
        self._error_count += 1
        self._success_count = 0
        
        # Increase chunk size on errors
        if self._error_count >= 2:
            self._min_chunk_size = min(
                self.MAX_CHUNK_SIZE,
                self._min_chunk_size + 1024
            )
            self._error_count = 0
            logger.warning(
                "Increased buffer size to %d due to conversion errors",
                self._min_chunk_size
            )
