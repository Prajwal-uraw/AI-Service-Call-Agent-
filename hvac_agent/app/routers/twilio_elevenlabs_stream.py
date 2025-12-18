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

# Version marker for deployment verification - MUST appear in logs
_STREAM_VERSION = "3.0.3-verbose"
print(f"[STREAM_MODULE_LOADED] Version: {_STREAM_VERSION}")  # Force print on module load

# =============================================================================
# FRAME BUILDER - THE ONLY WAY TO CREATE TWILIO FRAMES
# =============================================================================
FRAME_SIZE = 160  # Twilio requires exactly 160 bytes per frame (20ms @ 8kHz)
ULAW_SILENCE = b"\x7f"  # μ-law silence byte for padding


def ulaw_to_frames(ulaw_bytes: bytes) -> list:
    """
    Convert raw μ-law bytes to a list of exactly 160-byte frames.
    
    THIS IS THE ONLY FUNCTION ALLOWED TO CREATE TWILIO FRAMES.
    
    Rules:
    - Output frames are ALWAYS exactly 160 bytes
    - Final frame is padded with 0x7f (μ-law silence)
    - Assertion enforced before returning
    
    Args:
        ulaw_bytes: Raw μ-law audio bytes of any length
        
    Returns:
        List of 160-byte frames ready for Twilio
    """
    if not ulaw_bytes:
        return []
    
    frames = []
    
    for i in range(0, len(ulaw_bytes), FRAME_SIZE):
        chunk = ulaw_bytes[i:i + FRAME_SIZE]
        
        # Pad undersized final frame
        if len(chunk) < FRAME_SIZE:
            chunk = chunk + (ULAW_SILENCE * (FRAME_SIZE - len(chunk)))
        
        # HARD ASSERTION - crash if violated
        assert len(chunk) == FRAME_SIZE, f"FATAL: Frame size {len(chunk)} != {FRAME_SIZE}"
        
        frames.append(chunk)
    
    return frames

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


# =============================================================================
# CALL CONTEXT - PER-CALL STATE CONTAINER
# =============================================================================
class CallContext:
    """
    Per-call state container. Nothing outside this object may touch call state.
    
    All call-scoped resources are owned here:
    - WebSocket connection
    - Audio queue (160-byte frames ONLY)
    - Background tasks
    - Speaking/conversation state
    """
    
    def __init__(self, ws: WebSocket):
        # Connection
        self.ws = ws
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        self.closed = False
        
        # Audio queue - ONLY accepts 160-byte frames
        self.audio_queue: asyncio.Queue = asyncio.Queue()
        
        # Tasks
        self.audio_sender_task: Optional[asyncio.Task] = None
        self.keepalive_task: Optional[asyncio.Task] = None
        self.reprompt_task: Optional[asyncio.Task] = None
        
        # TTS
        self.tts: Optional[ElevenLabsTTS] = None
        self.is_speaking = False
        
        # Conversation
        self.conversation_history = []
        self.last_speech_time: float = 0
        self.last_agent_speech_time: float = 0
        self.reprompt_count: int = 0
        
        # STT buffers
        self.input_buffer = bytearray()
        self.user_speaking = False
        self.silence_frames = 0
        self.speech_frames = 0
        
        # Diagnostics
        self.frames_sent: int = 0


# =============================================================================
# AUDIO SENDER - SOLE WRITER TO TWILIO WEBSOCKET
# =============================================================================
async def audio_sender(ctx: CallContext):
    """
    Dedicated Twilio audio sender. This is the ONLY coroutine that sends audio.
    
    Pulls 160-byte frames from ctx.audio_queue and sends to Twilio.
    Paces frames at ~20ms each (160 bytes @ 8kHz = 20ms).
    Stops when ctx.closed == True.
    """
    logger.info("Audio sender started")
    
    # Pacing: 160 bytes @ 8kHz = 20ms per frame
    # Send slightly faster than real-time to keep buffer filled
    FRAME_INTERVAL = 0.018  # 18ms between frames (slightly faster than 20ms)
    last_send_time = 0
    
    try:
        while not ctx.closed:
            try:
                # Wait for frame with timeout to check closed flag
                frame = await asyncio.wait_for(ctx.audio_queue.get(), timeout=0.1)
                
                # HARD ASSERTION - only 160-byte frames allowed
                assert len(frame) == FRAME_SIZE, f"FATAL: Dequeued frame size {len(frame)} != {FRAME_SIZE}"
                
                if ctx.closed or not ctx.stream_sid:
                    continue
                
                if ctx.ws.client_state != WebSocketState.CONNECTED:
                    logger.warning("WebSocket disconnected, dropping frame")
                    continue
                
                # Pace frames to avoid overwhelming Twilio
                now = time.time()
                elapsed = now - last_send_time
                if elapsed < FRAME_INTERVAL:
                    await asyncio.sleep(FRAME_INTERVAL - elapsed)
                
                # Send to Twilio
                payload = base64.b64encode(frame).decode("ascii")
                await ctx.ws.send_text(json.dumps({
                    "event": "media",
                    "streamSid": ctx.stream_sid,
                    "media": {"payload": payload},
                }))
                ctx.frames_sent += 1
                last_send_time = time.time()
                
                # Log first 5 frames and then every 25 frames
                if ctx.frames_sent <= 5 or ctx.frames_sent % 25 == 0:
                    logger.info(">>> SENT frame #%d to Twilio (160 bytes, streamSid=%s)", 
                               ctx.frames_sent, ctx.stream_sid[:20] if ctx.stream_sid else "None")
                    
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                break
            except Exception as e:
                if not ctx.closed:
                    logger.error("Audio sender error: %s", str(e))
                    
    finally:
        logger.info("Audio sender stopped, total frames: %d", ctx.frames_sent)


# =============================================================================
# ENQUEUE FRAMES - THE ONLY WAY TO SEND AUDIO
# =============================================================================
async def enqueue_audio(ctx: CallContext, ulaw_bytes: bytes):
    """
    Convert μ-law bytes to 160-byte frames and enqueue for sending.
    
    THIS IS THE ONLY FUNCTION ALLOWED TO PUT AUDIO IN THE QUEUE.
    
    Args:
        ctx: Call context
        ulaw_bytes: Raw μ-law audio bytes
    """
    if ctx.closed or not ctx.stream_sid:
        return
    
    # Convert to exactly 160-byte frames
    frames = ulaw_to_frames(ulaw_bytes)
    
    # Enqueue each frame
    for frame in frames:
        # HARD ASSERTION before enqueue
        assert len(frame) == FRAME_SIZE, f"FATAL: Enqueue frame size {len(frame)} != {FRAME_SIZE}"
        await ctx.audio_queue.put(frame)
    
    if frames:
        logger.info("Enqueued %d frames (%d bytes total, each 160 bytes)", 
                   len(frames), len(frames) * FRAME_SIZE)


# =============================================================================
# KEEPALIVE LOOP
# =============================================================================
async def keepalive_loop(ctx: CallContext):
    """
    Send silence frames every 2 seconds to keep Twilio stream alive.
    Pauses while agent is speaking.
    """
    KEEPALIVE_INTERVAL = 2.0
    SILENCE_FRAME = ULAW_SILENCE * FRAME_SIZE  # Exactly 160 bytes
    
    logger.info("Keepalive loop started")
    
    try:
        while not ctx.closed:
            await asyncio.sleep(KEEPALIVE_INTERVAL)
            
            if ctx.closed:
                break
            
            # Only send keepalive if not speaking
            if not ctx.is_speaking:
                await enqueue_audio(ctx, SILENCE_FRAME)
                logger.info("Sent keepalive frame")
                
    except asyncio.CancelledError:
        pass
    finally:
        logger.info("Keepalive loop stopped")


# =============================================================================
# REPROMPT LOOP
# =============================================================================
async def reprompt_loop(ctx: CallContext, speak_func):
    """
    Monitor for user silence and send reprompts.
    
    Args:
        ctx: Call context
        speak_func: Async function to speak text
    """
    REPROMPT_MESSAGES = [
        "Are you still there? How can I help you today?",
        "I'm here to help with your HVAC needs. What can I do for you?",
    ]
    MAX_REPROMPTS = 2
    REPROMPT_TIMEOUT = 5.0
    
    logger.info("Reprompt loop started")
    
    try:
        while not ctx.closed:
            await asyncio.sleep(1.0)
            
            if ctx.closed:
                break
            
            # Skip if speaking
            if ctx.is_speaking or ctx.user_speaking:
                logger.info("Reprompt: skipping (is_speaking=%s, user_speaking=%s)", 
                           ctx.is_speaking, ctx.user_speaking)
                continue
            
            # Check if reprompt needed
            if ctx.last_agent_speech_time > 0:
                time_since_agent = time.time() - ctx.last_agent_speech_time
                user_spoke_after = ctx.last_speech_time > ctx.last_agent_speech_time
                
                logger.info("Reprompt check: time_since=%.1fs, user_spoke_after=%s, count=%d/%d",
                           time_since_agent, user_spoke_after, ctx.reprompt_count, MAX_REPROMPTS)
                
                if (time_since_agent >= REPROMPT_TIMEOUT and 
                    not user_spoke_after and 
                    ctx.reprompt_count < MAX_REPROMPTS):
                    
                    ctx.reprompt_count += 1
                    msg = REPROMPT_MESSAGES[min(ctx.reprompt_count - 1, len(REPROMPT_MESSAGES) - 1)]
                    logger.info(">>> REPROMPT #%d: %s", ctx.reprompt_count, msg[:40])
                    await speak_func(msg)
            else:
                logger.info("Reprompt: waiting for agent to speak first (last_agent_speech_time=%.1f)", 
                           ctx.last_agent_speech_time)
                    
    except asyncio.CancelledError:
        pass
    finally:
        logger.info("Reprompt loop stopped")


# =============================================================================
# STREAM BRIDGE - MAIN HANDLER
# =============================================================================
class ElevenLabsStreamBridge:
    """
    Bridge between Twilio Media Streams and ElevenLabs TTS.
    Uses CallContext for all per-call state.
    """
    
    def __init__(self, twilio_ws: WebSocket):
        self.ctx = CallContext(twilio_ws)
        
        # Thresholds for speech detection
        self._silence_threshold = 80
        self._min_speech_frames = 25
        self._speech_threshold = 40
        
        # Utterance lock
        self._utterance_lock = asyncio.Lock()
    
    async def start(self):
        """Start the stream bridge."""
        try:
            # Initialize ElevenLabs TTS if available
            if is_elevenlabs_available():
                self.ctx.tts = ElevenLabsTTS()
                logger.info("ElevenLabs TTS initialized")
            else:
                logger.warning("ElevenLabs not available, will use TwiML fallback")
            
            # Process incoming Twilio messages
            await self._process_twilio_messages()
            
        except asyncio.CancelledError:
            logger.info("Stream bridge cancelled")
        except Exception as e:
            logger.error("Stream bridge error: %s", str(e))
    
    async def _cleanup(self):
        """Clean up all resources. Called on stream end."""
        logger.info("Cleaning up call_sid=%s", self.ctx.call_sid)
        
        # Mark as closed to stop all loops
        self.ctx.closed = True
        
        # Cancel tasks
        tasks_to_cancel = [
            self.ctx.audio_sender_task,
            self.ctx.keepalive_task,
            self.ctx.reprompt_task,
        ]
        for task in tasks_to_cancel:
            if task and not task.done():
                task.cancel()
        
        # Wait for tasks to finish
        for task in tasks_to_cancel:
            if task:
                try:
                    await asyncio.wait_for(asyncio.shield(task), timeout=1.0)
                except (asyncio.CancelledError, asyncio.TimeoutError):
                    pass
        
        # Close TTS session
        if self.ctx.tts:
            try:
                await self.ctx.tts.close()
            except Exception as e:
                logger.warning("Error closing TTS: %s", str(e))
            self.ctx.tts = None
        
        # Clear buffers
        self.ctx.input_buffer.clear()
        self.ctx.conversation_history.clear()
        
        logger.info("Cleanup complete for call_sid=%s", self.ctx.call_sid)
    
    async def _process_twilio_messages(self):
        """Process incoming messages from Twilio."""
        try:
            async for raw_msg in self.ctx.ws.iter_text():
                if self.ctx.closed:
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
                    if not self.ctx.closed:
                        await self._handle_media(msg)
                
                elif event == "stop":
                    logger.info("Twilio stream stopped")
                    self.ctx.closed = True
                    break
                    
        except WebSocketDisconnect:
            logger.info("Twilio WebSocket disconnected")
        except asyncio.CancelledError:
            logger.debug("Message processing cancelled")
        except Exception as e:
            logger.error("Error processing Twilio messages: %s", str(e))
        finally:
            await self._cleanup()
    
    async def _handle_start(self, msg: dict):
        """Handle stream start event."""
        start_data = msg.get("start", {})
        self.ctx.stream_sid = start_data.get("streamSid")
        self.ctx.call_sid = start_data.get("callSid")
        
        logger.info(
            "Stream started [v%s]: stream_sid=%s, call_sid=%s",
            _STREAM_VERSION, self.ctx.stream_sid, self.ctx.call_sid
        )
        
        # Start audio sender task (SOLE writer to Twilio)
        self.ctx.audio_sender_task = asyncio.create_task(audio_sender(self.ctx))
        
        # Start keepalive task
        self.ctx.keepalive_task = asyncio.create_task(keepalive_loop(self.ctx))
        
        # Start reprompt task
        self.ctx.reprompt_task = asyncio.create_task(reprompt_loop(self.ctx, self._speak))
        
        # Send initial greeting
        logger.info(">>> SENDING INITIAL GREETING")
        await self._speak("Thank you for calling KC Comfort Air. How may I help you today?")
        
        logger.info(">>> GREETING COMPLETE, reprompt will fire in 5.0 seconds if no user speech")
    
    async def _handle_media(self, msg: dict):
        """Handle incoming audio from Twilio."""
        if self.ctx.closed:
            return
        
        payload = msg.get("media", {}).get("payload")
        if not payload or not validate_base64_audio(payload):
            return
        
        audio_bytes = base64.b64decode(payload)
        
        # Don't process audio while agent is speaking (prevents echo)
        if self.ctx.is_speaking:
            # Check for barge-in
            if self._detect_speech(audio_bytes, threshold=60):
                logger.debug("Barge-in detected, cancelling speech")
                if self.ctx.tts:
                    self.ctx.tts.cancel_speech()
                self.ctx.is_speaking = False
                self.ctx.input_buffer.clear()
                self.ctx.speech_frames = 0
                self.ctx.silence_frames = 0
            return
        
        # Buffer audio for STT
        self.ctx.input_buffer.extend(audio_bytes)
        
        if self._detect_speech(audio_bytes, threshold=self._speech_threshold):
            self.ctx.speech_frames += 1
            self.ctx.silence_frames = 0
            self.ctx.user_speaking = True
        else:
            self.ctx.silence_frames += 1
            
            # If we had speech and now silence, process the utterance
            if (self.ctx.user_speaking and 
                self.ctx.silence_frames >= self._silence_threshold and
                self.ctx.speech_frames >= self._min_speech_frames):
                
                audio_data = bytes(self.ctx.input_buffer)
                self.ctx.input_buffer.clear()
                self.ctx.user_speaking = False
                self.ctx.speech_frames = 0
                
                asyncio.create_task(self._process_utterance(audio_data))
    
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
        """Process a complete user utterance."""
        if self.ctx.closed:
            return
        
        if self._utterance_lock.locked():
            logger.debug("Utterance processing already in progress, skipping")
            return
        
        async with self._utterance_lock:
            try:
                if self.ctx.closed:
                    return
                
                text = await self._transcribe(audio_data)
                if not text or not text.strip():
                    return
                
                if self.ctx.closed:
                    return
                
                # Track user speech time and reset reprompt counter
                self.ctx.last_speech_time = time.time()
                self.ctx.reprompt_count = 0
                
                logger.info("User said: %s", text[:100])
                
                response = await self._get_response(text)
                if response and not self.ctx.closed:
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
            self.ctx.conversation_history.append({
                "role": "user",
                "content": user_text
            })
            
            # Keep history manageable
            if len(self.ctx.conversation_history) > 20:
                self.ctx.conversation_history = self.ctx.conversation_history[-20:]
            
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                *self.ctx.conversation_history
            ]
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=100,
                temperature=0.7,
            )
            
            assistant_message = response.choices[0].message.content
            
            # Add to history
            self.ctx.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            return assistant_message
            
        except Exception as e:
            logger.error("GPT error: %s", str(e))
            return "I'm sorry, I didn't catch that. Could you repeat?"
    
    async def _speak(self, text: str):
        """Speak text using ElevenLabs TTS."""
        if not text or not text.strip():
            return
        
        if self.ctx.closed:
            return
        
        self.ctx.is_speaking = True
        logger.info("Starting speech for: %s", text[:50])
        
        try:
            if self.ctx.tts:
                # Stream ElevenLabs audio to Twilio via enqueue_audio
                result = await self.ctx.tts.stream_to_twilio(
                    text,
                    self._send_audio_chunk
                )
                logger.info("TTS stream_to_twilio completed with result: %s", result)
            else:
                logger.warning("No TTS available for streaming")
                
        except asyncio.CancelledError:
            logger.debug("TTS cancelled")
        except Exception as e:
            logger.error("TTS error: %s", str(e))
        finally:
            self.ctx.is_speaking = False
            self.ctx.last_agent_speech_time = time.time()
    
    async def _send_audio_chunk(self, audio_bytes: bytes):
        """Send audio chunk to Twilio via the audio queue.
        
        Uses enqueue_audio which enforces 160-byte frames.
        This is the callback used by ElevenLabs TTS.
        """
        if self.ctx.closed or not self.ctx.stream_sid:
            return
        
        # Use the centralized enqueue function (enforces 160-byte frames)
        await enqueue_audio(self.ctx, audio_bytes)


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
