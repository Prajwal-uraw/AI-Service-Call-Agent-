"""
Audio processing services for HVAC Voice Agent.

Provides:
- StreamingAudioConverter: Persistent FFmpeg pipeline for MP3 to μ-law conversion
- MP3FrameBuffer: Buffer for handling MP3 frame boundaries
"""

from app.services.audio.converter import StreamingAudioConverter, convert_mp3_to_ulaw
from app.services.audio.buffer import MP3FrameBuffer

__all__ = [
    "StreamingAudioConverter",
    "convert_mp3_to_ulaw",
    "MP3FrameBuffer",
]
