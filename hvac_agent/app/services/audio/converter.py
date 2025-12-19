"""
Streaming Audio Converter for HVAC Voice Agent.

Provides a persistent FFmpeg pipeline for converting MP3 audio to μ-law 8kHz
format required by Twilio Media Streams. Unlike per-chunk subprocess spawning,
this maintains a single FFmpeg process for the entire call duration.

Benefits:
- Eliminates 50-100ms per-chunk process spawn overhead
- Proper handling of MP3 frame boundaries
- Reduced memory pressure
- No race conditions from concurrent processes
"""

import asyncio
from typing import Optional, AsyncGenerator
from asyncio import Queue
import time

from app.utils.logging import get_logger

logger = get_logger("audio.converter")

# Twilio requires exactly 160 bytes per frame (20ms @ 8kHz μ-law)
TWILIO_FRAME_SIZE = 160


class StreamingAudioConverter:
    """
    Persistent FFmpeg pipeline for MP3 to μ-law conversion.
    
    Maintains a single FFmpeg process for the entire call, eliminating
    the overhead of spawning a new process for each audio chunk.
    
    Usage:
        converter = StreamingAudioConverter()
        await converter.start()
        
        try:
            async for mp3_chunk in elevenlabs_stream:
                await converter.feed(mp3_chunk)
                
                while True:
                    ulaw_chunk = await converter.get_output(timeout=0.01)
                    if ulaw_chunk is None:
                        break
                    await send_to_twilio(ulaw_chunk)
        finally:
            await converter.close()
    """
    
    def __init__(self, output_chunk_size: int = TWILIO_FRAME_SIZE):
        """
        Initialize the converter.
        
        Args:
            output_chunk_size: Size of output chunks (default: Twilio frame size)
        """
        self.output_chunk_size = output_chunk_size
        self._process: Optional[asyncio.subprocess.Process] = None
        self._output_queue: Queue[bytes] = Queue()
        self._reader_task: Optional[asyncio.Task] = None
        self._running = False
        self._bytes_in = 0
        self._bytes_out = 0
        self._start_time: Optional[float] = None
    
    async def start(self) -> bool:
        """
        Start the FFmpeg process.
        
        Returns:
            True if started successfully, False otherwise
        """
        if self._running:
            return True
        
        try:
            self._process = await asyncio.create_subprocess_exec(
                "ffmpeg",
                "-hide_banner",
                "-loglevel", "error",
                "-f", "mp3",              # Input format
                "-i", "pipe:0",           # Read from stdin
                "-f", "mulaw",            # Output format: μ-law
                "-ar", "8000",            # Sample rate: 8kHz
                "-ac", "1",               # Channels: mono
                "-acodec", "pcm_mulaw",   # Codec: μ-law
                "pipe:1",                 # Write to stdout
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            
            self._running = True
            self._start_time = time.time()
            
            # Start background reader task
            self._reader_task = asyncio.create_task(self._read_output())
            
            logger.debug("FFmpeg converter started")
            return True
            
        except FileNotFoundError:
            logger.error("FFmpeg not found - required for audio conversion")
            return False
        except Exception as e:
            logger.error("Failed to start FFmpeg: %s", str(e))
            return False
    
    async def feed(self, mp3_data: bytes) -> None:
        """
        Feed MP3 data to the converter.
        
        Args:
            mp3_data: Raw MP3 audio bytes
        """
        if not self._running or not self._process or not self._process.stdin:
            logger.warning("Cannot feed data - converter not running")
            return
        
        if not mp3_data:
            return
        
        try:
            self._process.stdin.write(mp3_data)
            await self._process.stdin.drain()
            self._bytes_in += len(mp3_data)
        except Exception as e:
            logger.error("Error feeding data to FFmpeg: %s", str(e))
    
    async def get_output(self, timeout: float = 0.1) -> Optional[bytes]:
        """
        Get converted μ-law audio from the output queue.
        
        Args:
            timeout: Maximum time to wait for output
            
        Returns:
            μ-law audio chunk or None if no data available
        """
        try:
            return await asyncio.wait_for(
                self._output_queue.get(),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            return None
    
    async def get_all_output(self) -> AsyncGenerator[bytes, None]:
        """
        Get all available output without blocking.
        
        Yields:
            μ-law audio chunks
        """
        while not self._output_queue.empty():
            try:
                chunk = self._output_queue.get_nowait()
                yield chunk
            except asyncio.QueueEmpty:
                break
    
    async def flush(self) -> AsyncGenerator[bytes, None]:
        """
        Close input and get remaining output.
        
        Call this when done feeding data to get any remaining audio.
        
        Yields:
            Remaining μ-law audio chunks
        """
        if not self._running or not self._process:
            return
        
        # Close stdin to signal end of input
        if self._process.stdin:
            self._process.stdin.close()
            try:
                await self._process.stdin.wait_closed()
            except Exception:
                pass
        
        # Wait for reader to finish (with timeout)
        if self._reader_task:
            try:
                await asyncio.wait_for(self._reader_task, timeout=2.0)
            except asyncio.TimeoutError:
                logger.warning("Reader task timed out during flush")
        
        # Yield all remaining output
        while not self._output_queue.empty():
            try:
                chunk = self._output_queue.get_nowait()
                yield chunk
            except asyncio.QueueEmpty:
                break
    
    async def close(self) -> None:
        """Close the converter and clean up resources."""
        self._running = False
        
        if self._reader_task and not self._reader_task.done():
            self._reader_task.cancel()
            try:
                await self._reader_task
            except asyncio.CancelledError:
                pass
        
        if self._process:
            # Close stdin
            if self._process.stdin:
                self._process.stdin.close()
            
            # Terminate process
            try:
                self._process.terminate()
                await asyncio.wait_for(self._process.wait(), timeout=1.0)
            except asyncio.TimeoutError:
                self._process.kill()
                await self._process.wait()
            except Exception:
                pass
            
            self._process = None
        
        # Log stats
        if self._start_time:
            duration = time.time() - self._start_time
            logger.debug(
                "FFmpeg converter closed: %d bytes in, %d bytes out, %.1fs duration",
                self._bytes_in, self._bytes_out, duration
            )
    
    async def _read_output(self) -> None:
        """Background task to read FFmpeg output."""
        if not self._process or not self._process.stdout:
            return
        
        buffer = bytearray()
        
        try:
            while self._running:
                # Read available data
                try:
                    chunk = await asyncio.wait_for(
                        self._process.stdout.read(4096),
                        timeout=0.1
                    )
                except asyncio.TimeoutError:
                    continue
                
                if not chunk:
                    # EOF - process ended
                    break
                
                buffer.extend(chunk)
                
                # Yield complete frames
                while len(buffer) >= self.output_chunk_size:
                    frame = bytes(buffer[:self.output_chunk_size])
                    del buffer[:self.output_chunk_size]
                    await self._output_queue.put(frame)
                    self._bytes_out += len(frame)
            
            # Flush remaining buffer
            if buffer:
                # Pad to frame size if needed
                if len(buffer) < self.output_chunk_size:
                    buffer.extend(b'\x7f' * (self.output_chunk_size - len(buffer)))
                await self._output_queue.put(bytes(buffer))
                self._bytes_out += len(buffer)
                
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error("Error reading FFmpeg output: %s", str(e))
    
    @property
    def is_running(self) -> bool:
        """Check if converter is running."""
        return self._running and self._process is not None
    
    def get_stats(self) -> dict:
        """Get converter statistics."""
        return {
            "running": self._running,
            "bytes_in": self._bytes_in,
            "bytes_out": self._bytes_out,
            "queue_size": self._output_queue.qsize(),
            "duration": time.time() - self._start_time if self._start_time else 0,
        }


async def convert_mp3_to_ulaw(mp3_data: bytes) -> Optional[bytes]:
    """
    Convert MP3 audio to μ-law 8kHz mono (one-shot conversion).
    
    For streaming use cases, prefer StreamingAudioConverter.
    This function is for converting complete audio files.
    
    Args:
        mp3_data: Complete MP3 audio bytes
        
    Returns:
        μ-law encoded audio at 8kHz mono, or None on error
    """
    if not mp3_data:
        return None
    
    try:
        process = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-hide_banner",
            "-loglevel", "error",
            "-i", "pipe:0",
            "-f", "mulaw",
            "-ar", "8000",
            "-ac", "1",
            "-acodec", "pcm_mulaw",
            "pipe:1",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        
        stdout, stderr = await asyncio.wait_for(
            process.communicate(input=mp3_data),
            timeout=10.0
        )
        
        if process.returncode != 0:
            logger.error(
                "FFmpeg conversion failed: %s",
                stderr.decode('utf-8', errors='ignore')[-200:]
            )
            return None
        
        if not stdout:
            logger.error("FFmpeg produced no output")
            return None
        
        return stdout
        
    except FileNotFoundError:
        logger.error("FFmpeg not found - required for audio conversion")
        return None
    except asyncio.TimeoutError:
        logger.error("FFmpeg conversion timed out")
        return None
    except Exception as e:
        logger.error("FFmpeg conversion error: %s", str(e))
        return None
