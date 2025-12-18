"""
Twilio Media Streams with ElevenLabs TTS integration.

This module provides a streaming voice handler that uses:
- Twilio Media Streams for audio I/O
- OpenAI Whisper for STT (speech-to-text)
- OpenAI GPT for conversation
- ElevenLabs for TTS (text-to-speech) - natural, human-like voice

Key features:
- Low-latency streaming TTS
- Barge-in support (interrupt agent speech)
- Natural conversation pacing
- Fallback to Twilio Polly if ElevenLabs unavailable
- Proper async lifecycle management (no app restarts on stream end)
- Task isolation per call
"""

import json
import os
import asyncio
import base64
import time
from typing import Optional, Set
from contextlib import asynccontextmanager
from enum import Enum

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import Response
from starlette.websockets import WebSocketState

from app.utils.logging import get_logger
from app.utils.audio import validate_base64_audio, encode_audio
from app.services.tts.elevenlabs import ElevenLabsTTS
from app.services.tts.factory import get_tts_provider, TTSProvider, is_elevenlabs_available

router = APIRouter(tags=["twilio-elevenlabs"])
logger = get_logger("twilio.elevenlabs")

# Diagnostic mode - enables verbose logging
DIAGNOSTIC_MODE = os.getenv("VOICE_DIAGNOSTIC_MODE", "true").lower() == "true"

# Version marker for deployment verification
_STREAM_VERSION = "2.0.1-queue-based"

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HVAC_COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")
USE_ELEVENLABS = os.getenv("USE_ELEVENLABS", "false").lower() == "true"

# Import enterprise prompts
from app.utils.prompts import STREAMING_SYSTEM_PROMPT

# Use the enterprise streaming prompt
SYSTEM_PROMPT = STREAMING_SYSTEM_PROMPT


class StreamState(Enum):
    """Stream lifecycle states."""
    INITIALIZING = "initializing"
    ACTIVE = "active"
    CLOSING = "closing"
    CLOSED = "closed"


class ElevenLabsStreamBridge:
    """
    Bridge between Twilio Media Streams and ElevenLabs TTS.
    
    Handles:
    - Audio input from Twilio (μ-law 8kHz)
    - Speech-to-text via OpenAI Whisper
    - Conversation via OpenAI GPT
    - Text-to-speech via ElevenLabs (streamed back to Twilio)
    - Barge-in detection and handling
    
    Lifecycle guarantees:
    - Stream close does NOT trigger app shutdown
    - All tasks are cancelled on stream end
    - No pending coroutines after cleanup
    - aiohttp sessions are properly closed
    """
    
    def __init__(self, twilio_ws: WebSocket):
        self.twilio_ws = twilio_ws
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        
        # Lifecycle state - use enum for clarity
        self._state = StreamState.INITIALIZING
        
        # Audio buffers
        self._input_buffer = bytearray()
        self._input_lock = asyncio.Lock()
        
        # TTS state
        self._tts: Optional[ElevenLabsTTS] = None
        self._is_speaking = False
        
        # Conversation state
        self._conversation_history = []
        self._user_speaking = False
        self._silence_frames = 0
        self._speech_frames = 0
        
        # Thresholds - tuned to avoid false positives
        self._silence_threshold = 80  # frames of silence to trigger processing
        self._min_speech_frames = 25  # minimum frames to consider as speech
        self._speech_threshold = 40  # variance threshold for speech detection
        
        # Task management - track all spawned tasks for cleanup
        self._active_tasks: Set[asyncio.Task] = set()
        
        # Utterance processing lock - prevents concurrent _process_utterance calls
        self._utterance_lock = asyncio.Lock()
        
        # Conversational turn management
        self._last_speech_time: float = 0  # Time of last user speech
        self._last_agent_speech_time: float = 0  # Time agent finished speaking
        self._reprompt_count: int = 0  # Number of reprompts sent
        self._max_reprompts: int = 3  # Max reprompts before giving up
        self._reprompt_timeout: float = 5.0  # Seconds to wait before reprompt
        self._keepalive_task: Optional[asyncio.Task] = None  # Keepalive task
        
        # Audio queue for single-writer pattern
        self._audio_queue: asyncio.Queue = asyncio.Queue()
        self._audio_sender_task: Optional[asyncio.Task] = None
        
        # Frame counter for diagnostics
        self._frames_sent: int = 0
    
    @property
    def is_running(self) -> bool:
        """Check if stream is active."""
        return self._state == StreamState.ACTIVE
    
    @property
    def is_closing(self) -> bool:
        """Check if stream is in teardown."""
        return self._state in (StreamState.CLOSING, StreamState.CLOSED)
        
    async def start(self):
        """Start the stream bridge."""
        try:
            self._state = StreamState.ACTIVE
            
            # Initialize ElevenLabs TTS if available
            if is_elevenlabs_available():
                self._tts = ElevenLabsTTS()
                logger.info("ElevenLabs TTS initialized")
            else:
                logger.warning("ElevenLabs not available, will use TwiML fallback")
            
            # Process incoming Twilio messages
            await self._process_twilio_messages()
            
        except asyncio.CancelledError:
            logger.info("Stream bridge cancelled")
        except Exception as e:
            logger.error("Stream bridge error: %s", str(e))
        finally:
            # Cleanup is handled in _cleanup() which is called explicitly
            pass
    
    async def stop(self):
        """Stop the stream bridge gracefully."""
        if self._state == StreamState.CLOSED:
            return
        
        self._state = StreamState.CLOSING
        
        # Cancel TTS if speaking
        if self._tts:
            self._tts.cancel_speech()
        
        # Cancel and await all active tasks
        await self._cancel_all_tasks()
        
        self._state = StreamState.CLOSED
    
    async def _cancel_all_tasks(self):
        """Cancel all active tasks and wait for them to complete."""
        if not self._active_tasks:
            return
        
        logger.debug("Cancelling %d active tasks", len(self._active_tasks))
        
        for task in self._active_tasks:
            if not task.done():
                task.cancel()
        
        # Wait for all tasks to complete with timeout
        if self._active_tasks:
            try:
                await asyncio.wait_for(
                    asyncio.gather(*self._active_tasks, return_exceptions=True),
                    timeout=2.0
                )
            except asyncio.TimeoutError:
                logger.warning("Some tasks did not complete within timeout")
        
        self._active_tasks.clear()
    
    async def _cleanup(self):
        """Clean up all resources. Called on stream end."""
        logger.debug("Cleaning up stream bridge for call_sid=%s", self.call_sid)
        
        # Mark as closing to stop processing
        self._state = StreamState.CLOSING
        
        # Cancel all pending tasks
        await self._cancel_all_tasks()
        
        # Close TTS session
        if self._tts:
            try:
                await self._tts.close()
            except Exception as e:
                logger.warning("Error closing TTS: %s", str(e))
            self._tts = None
        
        # Clear buffers
        self._input_buffer.clear()
        self._conversation_history.clear()
        
        self._state = StreamState.CLOSED
        logger.debug("Stream bridge cleanup complete for call_sid=%s", self.call_sid)
    
    def _create_task(self, coro) -> asyncio.Task:
        """Create a tracked task that will be cleaned up on stream end."""
        task = asyncio.create_task(coro)
        self._active_tasks.add(task)
        task.add_done_callback(self._active_tasks.discard)
        return task
    
    def _start_audio_sender(self):
        """Start the single audio sender task.
        
        INVARIANT: Only this task writes to the Twilio WebSocket.
        All audio (TTS + keepalive) flows through _audio_queue.
        """
        if self._audio_sender_task and not self._audio_sender_task.done():
            return
        self._audio_sender_task = self._create_task(self._audio_sender_loop())
    
    async def _audio_sender_loop(self):
        """Single writer loop for Twilio WebSocket.
        
        This is the ONLY coroutine that sends audio to Twilio.
        """
        logger.info("Audio sender loop started")
        
        try:
            while not self.is_closing:
                try:
                    # Wait for audio with timeout to allow checking is_closing
                    frame = await asyncio.wait_for(self._audio_queue.get(), timeout=0.1)
                    await self._send_frame_to_twilio(frame)
                except asyncio.TimeoutError:
                    continue
                except asyncio.CancelledError:
                    break
        except Exception as e:
            logger.error("Audio sender loop error: %s", str(e))
        finally:
            logger.info("Audio sender loop ended")
    
    def _start_keepalive(self):
        """Start the keepalive task to prevent Twilio timeout."""
        if self._keepalive_task and not self._keepalive_task.done():
            return  # Already running
        self._keepalive_task = self._create_task(self._keepalive_loop())
    
    async def _keepalive_loop(self):
        """Send silence frames periodically to keep Twilio stream alive.
        
        Sends silence through the audio queue (single writer pattern).
        """
        KEEPALIVE_INTERVAL = 1.0  # Send keepalive every 1 second (more frequent)
        SILENCE_FRAME = b"\x7f" * 160  # 20ms of μ-law silence
        
        logger.info("Keepalive loop started")
        
        try:
            while not self.is_closing:
                await asyncio.sleep(KEEPALIVE_INTERVAL)
                
                if self.is_closing:
                    break
                
                # Always send keepalive, even while speaking (Twilio needs continuous audio)
                await self._queue_audio(SILENCE_FRAME)
                
                if DIAGNOSTIC_MODE:
                    logger.debug("Queued keepalive frame, queue size: %d", self._audio_queue.qsize())
                    
        except asyncio.CancelledError:
            logger.debug("Keepalive loop cancelled")
        except Exception as e:
            logger.error("Keepalive loop error: %s", str(e))
        finally:
            logger.info("Keepalive loop ended")
    
    async def _reprompt_monitor(self):
        """Monitor for user silence and send reprompts."""
        REPROMPT_MESSAGES = [
            "Are you still there? How can I help you today?",
            "I'm here to help with your HVAC needs. What can I do for you?",
            "If you need assistance, just let me know. Otherwise, have a great day!",
        ]
        
        logger.info("Reprompt monitor started")
        
        try:
            while not self.is_closing:
                await asyncio.sleep(1.0)  # Check every second
                
                if self.is_closing:
                    break
                
                # Skip if agent is speaking or user is speaking
                if self._is_speaking or self._user_speaking:
                    if DIAGNOSTIC_MODE:
                        logger.debug("Reprompt check: skipping (speaking=%s, user_speaking=%s)", 
                                   self._is_speaking, self._user_speaking)
                    continue
                
                # Check if we need to reprompt
                current_time = time.time()
                time_since_agent_spoke = current_time - self._last_agent_speech_time
                
                if DIAGNOSTIC_MODE:
                    logger.debug("Reprompt check: time_since_agent=%.1fs, last_agent_time=%.1f, reprompt_count=%d",
                               time_since_agent_spoke, self._last_agent_speech_time, self._reprompt_count)
                
                # Only reprompt if:
                # 1. Agent has spoken at least once
                # 2. Enough time has passed since agent finished
                # 3. User hasn't spoken since agent finished
                # 4. Haven't exceeded max reprompts
                if (self._last_agent_speech_time > 0 and
                    time_since_agent_spoke >= self._reprompt_timeout and
                    (self._last_speech_time == 0 or self._last_speech_time < self._last_agent_speech_time) and
                    self._reprompt_count < self._max_reprompts):
                    
                    self._reprompt_count += 1
                    reprompt_msg = REPROMPT_MESSAGES[min(self._reprompt_count - 1, len(REPROMPT_MESSAGES) - 1)]
                    
                    logger.info(">>> SENDING REPROMPT #%d: %s", self._reprompt_count, reprompt_msg[:50])
                    await self._speak(reprompt_msg)
                    # Note: _last_agent_speech_time is set in _speak's finally block
                    
        except asyncio.CancelledError:
            logger.debug("Reprompt monitor cancelled")
        except Exception as e:
            logger.error("Reprompt monitor error: %s", str(e))
        finally:
            logger.info("Reprompt monitor ended")
    
    async def _process_twilio_messages(self):
        """Process incoming messages from Twilio."""
        try:
            async for raw_msg in self.twilio_ws.iter_text():
                # Check if we should stop processing
                if self.is_closing:
                    break
                
                try:
                    msg = json.loads(raw_msg)
                except json.JSONDecodeError:
                    continue
                
                event = msg.get("event")
                
                if event == "connected":
                    logger.info("Twilio stream connected")
                
                elif event == "start":
                    await self._handle_start(msg)
                
                elif event == "media":
                    # Don't process media if closing
                    if not self.is_closing:
                        await self._handle_media(msg)
                
                elif event == "stop":
                    logger.info("Twilio stream stopped")
                    # Mark as closing BEFORE breaking to prevent further processing
                    self._state = StreamState.CLOSING
                    break
                    
        except WebSocketDisconnect:
            logger.info("Twilio WebSocket disconnected")
        except asyncio.CancelledError:
            logger.debug("Message processing cancelled")
        except Exception as e:
            logger.error("Error processing Twilio messages: %s", str(e))
        finally:
            # Always cleanup on exit - this is call-scoped, NOT app-scoped
            await self._cleanup()
    
    async def _handle_start(self, msg: dict):
        """Handle stream start event."""
        start_data = msg.get("start", {})
        self.stream_sid = start_data.get("streamSid")
        self.call_sid = start_data.get("callSid")
        
        logger.info(
            "Stream started [v%s]: stream_sid=%s, call_sid=%s",
            _STREAM_VERSION, self.stream_sid, self.call_sid
        )
        
        # Start audio sender (single writer pattern)
        logger.info(">>> Starting audio sender task")
        self._start_audio_sender()
        
        # Start keepalive task to prevent Twilio timeout
        self._start_keepalive()
        
        # Start reprompt monitoring BEFORE greeting so it's ready
        self._create_task(self._reprompt_monitor())
        
        # Send initial greeting
        logger.info(">>> SENDING INITIAL GREETING")
        await self._speak("Thank you for calling KC Comfort Air. How may I help you today?")
        # Note: _last_agent_speech_time is set in _speak's finally block
        
        logger.info(">>> GREETING COMPLETE, reprompt will fire in %.1f seconds if no user speech", 
                   self._reprompt_timeout)
    
    async def _handle_media(self, msg: dict):
        """Handle incoming audio from Twilio."""
        # Guard: Don't process if closing
        if self.is_closing:
            return
        
        payload = msg.get("media", {}).get("payload")
        if not payload or not validate_base64_audio(payload):
            return
        
        # Decode audio
        audio_bytes = base64.b64decode(payload)
        
        # CRITICAL: Don't process audio while agent is speaking
        # This prevents the agent's own speech from being transcribed
        if self._is_speaking:
            # Only check for strong barge-in (user interrupting)
            if self._detect_speech(audio_bytes, threshold=60):  # Higher threshold for barge-in
                logger.debug("Barge-in detected, cancelling speech")
                if self._tts:
                    self._tts.cancel_speech()
                self._is_speaking = False
                # Clear buffer to avoid processing agent's speech
                async with self._input_lock:
                    self._input_buffer.clear()
                    self._speech_frames = 0
                    self._silence_frames = 0
            return  # Don't buffer audio while speaking
        
        # Buffer audio for STT (only when agent is NOT speaking)
        async with self._input_lock:
            self._input_buffer.extend(audio_bytes)
            
            # Detect speech/silence with higher threshold
            if self._detect_speech(audio_bytes, threshold=self._speech_threshold):
                self._speech_frames += 1
                self._silence_frames = 0
                self._user_speaking = True
            else:
                self._silence_frames += 1
                
                # If we had speech and now silence, process the utterance
                if (self._user_speaking and 
                    self._silence_frames >= self._silence_threshold and
                    self._speech_frames >= self._min_speech_frames):
                    
                    # Process accumulated audio
                    audio_data = bytes(self._input_buffer)
                    self._input_buffer.clear()
                    self._user_speaking = False
                    self._speech_frames = 0
                    
                    # Process in background using tracked task
                    self._create_task(self._process_utterance(audio_data))
    
    def _detect_speech(self, audio_bytes: bytes, threshold: int = 40) -> bool:
        """
        Detect if audio contains speech (not silence).
        
        For μ-law, silence is around 0xFF (255) or 0x7F (127).
        Uses a higher default threshold to avoid false positives from noise.
        """
        if len(audio_bytes) < 160:  # Need at least 20ms of audio at 8kHz
            return False
        
        # μ-law silence values
        silence_high = 0xFF
        silence_low = 0x7F
        
        # Calculate variance from both silence points and take the minimum
        variance_high = sum(abs(b - silence_high) for b in audio_bytes) / len(audio_bytes)
        variance_low = sum(abs(b - silence_low) for b in audio_bytes) / len(audio_bytes)
        variance = min(variance_high, variance_low)
        
        return variance > threshold
    
    async def _process_utterance(self, audio_data: bytes):
        """Process a complete user utterance.
        
        Uses a lock to prevent concurrent execution which causes
        'coroutine already executing' errors.
        """
        import time
        
        # Guard: Don't process during teardown
        if self.is_closing:
            logger.debug("Ignoring utterance during teardown")
            return
        
        # Guard: Prevent concurrent utterance processing
        if self._utterance_lock.locked():
            logger.debug("Utterance processing already in progress, skipping")
            return
        
        async with self._utterance_lock:
            try:
                # Double-check we're still active after acquiring lock
                if self.is_closing:
                    return
                
                # Convert to text using OpenAI Whisper
                text = await self._transcribe(audio_data)
                if not text or not text.strip():
                    return
                
                # Guard: Ignore STT results during teardown
                if self.is_closing:
                    logger.debug("Ignoring STT result during teardown: %s", text[:50])
                    return
                
                # Track user speech time and reset reprompt counter
                self._last_speech_time = time.time()
                self._reprompt_count = 0  # Reset reprompts when user speaks
                
                logger.info("User said: %s", text[:100])
                
                # Get response from GPT
                response = await self._get_response(text)
                if response and not self.is_closing:
                    logger.info("Agent response: %s", response[:100])
                    await self._speak(response)
                    
            except asyncio.CancelledError:
                logger.debug("Utterance processing cancelled")
            except Exception as e:
                logger.error("Error processing utterance: %s", str(e))
    
    async def _transcribe(self, audio_data: bytes) -> Optional[str]:
        """Transcribe audio using OpenAI Whisper."""
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
            
            # OpenAI Whisper expects specific formats
            # We need to convert μ-law to a supported format
            wav_data = await self._ulaw_to_wav(audio_data)
            if not wav_data:
                return None
            
            # Create a file-like object
            import io
            audio_file = io.BytesIO(wav_data)
            audio_file.name = "audio.wav"
            
            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en",
            )
            
            return response.text
            
        except Exception as e:
            logger.error("Transcription error: %s", str(e))
            return None
    
    async def _ulaw_to_wav(self, ulaw_data: bytes) -> Optional[bytes]:
        """Convert μ-law audio to WAV format for Whisper."""
        try:
            import audioop
            import struct
            
            # Convert μ-law to linear PCM
            pcm_data = audioop.ulaw2lin(ulaw_data, 2)
            
            # Create WAV header
            sample_rate = 8000
            num_channels = 1
            bits_per_sample = 16
            byte_rate = sample_rate * num_channels * bits_per_sample // 8
            block_align = num_channels * bits_per_sample // 8
            data_size = len(pcm_data)
            
            wav_header = struct.pack(
                '<4sI4s4sIHHIIHH4sI',
                b'RIFF',
                36 + data_size,
                b'WAVE',
                b'fmt ',
                16,  # Subchunk1Size
                1,   # AudioFormat (PCM)
                num_channels,
                sample_rate,
                byte_rate,
                block_align,
                bits_per_sample,
                b'data',
                data_size,
            )
            
            return wav_header + pcm_data
            
        except Exception as e:
            logger.error("Audio conversion error: %s", str(e))
            return None
    
    async def _get_response(self, user_text: str) -> Optional[str]:
        """Get response from OpenAI GPT."""
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
            
            # Add to conversation history
            self._conversation_history.append({
                "role": "user",
                "content": user_text
            })
            
            # Keep history manageable
            if len(self._conversation_history) > 20:
                self._conversation_history = self._conversation_history[-20:]
            
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                *self._conversation_history
            ]
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=100,
                temperature=0.7,
            )
            
            assistant_message = response.choices[0].message.content
            
            # Add to history
            self._conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            return assistant_message
            
        except Exception as e:
            logger.error("GPT error: %s", str(e))
            return "I'm sorry, I didn't catch that. Could you repeat?"
    
    async def _speak(self, text: str):
        """Speak text using ElevenLabs TTS."""
        import time
        
        if not text or not text.strip():
            return
        
        # Guard: Don't speak if closing
        if self.is_closing:
            return
        
        self._is_speaking = True
        logger.info("Starting speech for: %s", text[:50])
        
        try:
            if self._tts:
                # Stream ElevenLabs audio to Twilio
                result = await self._tts.stream_to_twilio(
                    text,
                    self._send_audio_chunk
                )
                logger.info("TTS stream_to_twilio completed with result: %s", result)
            else:
                # Fallback: Can't stream without ElevenLabs in this mode
                logger.warning("No TTS available for streaming")
                
        except asyncio.CancelledError:
            logger.debug("TTS cancelled")
        except Exception as e:
            logger.error("TTS error: %s", str(e))
        finally:
            self._is_speaking = False
            # Track when agent finished speaking for reprompt logic
            self._last_agent_speech_time = time.time()
    
    async def _queue_audio(self, audio_bytes: bytes):
        """Queue audio for sending through the single writer.
        
        Breaks audio into 160-byte frames before queueing.
        """
        if self.is_closing or not self.stream_sid:
            return
        
        FRAME_SIZE = 160
        ULAW_SILENCE = b"\x7f"
        
        # Break into 160-byte frames and queue each
        for i in range(0, len(audio_bytes), FRAME_SIZE):
            if self.is_closing:
                break
            
            chunk = audio_bytes[i:i + FRAME_SIZE]
            
            # Pad undersized frames
            if len(chunk) < FRAME_SIZE:
                chunk = chunk + (ULAW_SILENCE * (FRAME_SIZE - len(chunk)))
            
            await self._audio_queue.put(chunk)
    
    async def _send_frame_to_twilio(self, frame: bytes):
        """Send a single 160-byte frame to Twilio.
        
        INVARIANT: Only called from _audio_sender_loop.
        """
        if self.is_closing or not self.stream_sid:
            return
        
        if self.twilio_ws.client_state != WebSocketState.CONNECTED:
            if DIAGNOSTIC_MODE:
                logger.warning("WebSocket not connected, dropping frame")
            return
        
        try:
            payload = base64.b64encode(frame).decode("ascii")
            await self.twilio_ws.send_text(json.dumps({
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {
                    "payload": payload,
                },
            }))
            self._frames_sent += 1
            
            if DIAGNOSTIC_MODE and self._frames_sent % 50 == 0:
                logger.info("Total frames sent: %d (streamSid=%s)", self._frames_sent, self.stream_sid[:20])
                
        except Exception as e:
            if not self.is_closing:
                logger.error("Failed to send frame to Twilio: %s", str(e))
    
    async def _send_audio_chunk(self, audio_bytes: bytes):
        """Send audio chunk to Twilio via the audio queue.
        
        This is the callback used by ElevenLabs TTS.
        Audio is queued and sent by the single writer task.
        """
        if self.is_closing or not self.stream_sid:
            return
        
        await self._queue_audio(audio_bytes)
        
        if DIAGNOSTIC_MODE:
            frames_queued = (len(audio_bytes) + 159) // 160
            logger.info("Queued %d frames (%d bytes) for Twilio", frames_queued, len(audio_bytes))


@router.websocket("/twilio/elevenlabs/stream")
async def twilio_elevenlabs_stream(ws: WebSocket):
    """
    Twilio Media Streams WebSocket endpoint with ElevenLabs TTS.
    
    This endpoint provides human-like voice using ElevenLabs for TTS
    while using OpenAI for STT and conversation.
    
    Lifecycle guarantees:
    - Each call runs in isolation
    - Stream close does NOT trigger app shutdown
    - All resources are cleaned up per-call
    - Multiple calls can be handled sequentially
    """
    await ws.accept()
    logger.info("ElevenLabs stream WebSocket connected")
    
    bridge: Optional[ElevenLabsStreamBridge] = None
    
    try:
        bridge = ElevenLabsStreamBridge(ws)
        await bridge.start()
        
    except WebSocketDisconnect:
        logger.info("ElevenLabs stream WebSocket disconnected")
    except asyncio.CancelledError:
        logger.info("ElevenLabs stream cancelled")
    except Exception as e:
        # Log error but do NOT propagate to app scope
        logger.error("Error in elevenlabs_stream: %s", str(e))
    finally:
        # Ensure cleanup happens regardless of how we exit
        if bridge:
            try:
                await bridge._cleanup()
            except Exception as cleanup_error:
                logger.warning("Error during bridge cleanup: %s", str(cleanup_error))
        
        # Close WebSocket if still open
        if ws.client_state == WebSocketState.CONNECTED:
            try:
                await ws.close(code=1000, reason="Stream ended")
            except Exception:
                pass
        
        logger.info("ElevenLabs stream handler complete")


@router.api_route("/twilio/elevenlabs/twiml", methods=["GET", "POST"])
async def elevenlabs_twiml(request: Request):
    """
    Return TwiML for connecting to the ElevenLabs streaming endpoint.
    
    Accepts both GET and POST - Twilio sends POST requests.
    """
    host = request.headers.get("host", "")
    
    # Build WebSocket URL dynamically from request host
    if host:
        stream_url = f"wss://{host}/twilio/elevenlabs/stream"
    else:
        stream_url = os.getenv("STREAM_WEBSOCKET_URL", "wss://YOUR_DOMAIN/twilio/elevenlabs/stream")
    
    # Use ElevenLabs stream if available, otherwise fall back to regular stream
    if is_elevenlabs_available():
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="{stream_url}" />
    </Connect>
</Response>"""
    else:
        # Fallback to Polly voice
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Connecting you to our assistant. Please hold.</Say>
    <Connect>
        <Stream url="{stream_url}" />
    </Connect>
</Response>"""
    
    return Response(content=twiml.strip(), media_type="application/xml")
