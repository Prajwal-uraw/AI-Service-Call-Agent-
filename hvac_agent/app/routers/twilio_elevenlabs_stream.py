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
"""

import json
import os
import asyncio
import base64
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import Response

from app.utils.logging import get_logger
from app.utils.audio import validate_base64_audio, encode_audio
from app.services.tts.elevenlabs import ElevenLabsTTS
from app.services.tts.factory import get_tts_provider, TTSProvider, is_elevenlabs_available

router = APIRouter(tags=["twilio-elevenlabs"])
logger = get_logger("twilio.elevenlabs")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HVAC_COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")
USE_ELEVENLABS = os.getenv("USE_ELEVENLABS", "false").lower() == "true"

# Import enterprise prompts
from app.utils.prompts import STREAMING_SYSTEM_PROMPT

# Use the enterprise streaming prompt
SYSTEM_PROMPT = STREAMING_SYSTEM_PROMPT


class ElevenLabsStreamBridge:
    """
    Bridge between Twilio Media Streams and ElevenLabs TTS.
    
    Handles:
    - Audio input from Twilio (μ-law 8kHz)
    - Speech-to-text via OpenAI Whisper
    - Conversation via OpenAI GPT
    - Text-to-speech via ElevenLabs (streamed back to Twilio)
    - Barge-in detection and handling
    """
    
    def __init__(self, twilio_ws: WebSocket):
        self.twilio_ws = twilio_ws
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        self.is_running = True
        
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
        
        # Thresholds
        self._silence_threshold = 50  # frames of silence to trigger processing
        self._min_speech_frames = 10  # minimum frames to consider as speech
        
    async def start(self):
        """Start the stream bridge."""
        try:
            # Initialize ElevenLabs TTS if available
            if is_elevenlabs_available():
                self._tts = ElevenLabsTTS()
                logger.info("ElevenLabs TTS initialized")
            else:
                logger.warning("ElevenLabs not available, will use TwiML fallback")
            
            # Process incoming Twilio messages
            await self._process_twilio_messages()
            
        except Exception as e:
            logger.error("Stream bridge error: %s", str(e))
        finally:
            self.is_running = False
            if self._tts:
                await self._tts.close()
    
    async def stop(self):
        """Stop the stream bridge."""
        self.is_running = False
        if self._tts:
            self._tts.cancel_speech()
    
    async def _process_twilio_messages(self):
        """Process incoming messages from Twilio."""
        try:
            async for raw_msg in self.twilio_ws.iter_text():
                if not self.is_running:
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
                    await self._handle_media(msg)
                
                elif event == "stop":
                    logger.info("Twilio stream stopped")
                    break
                    
        except WebSocketDisconnect:
            logger.info("Twilio WebSocket disconnected")
        except Exception as e:
            logger.error("Error processing Twilio messages: %s", str(e))
    
    async def _handle_start(self, msg: dict):
        """Handle stream start event."""
        start_data = msg.get("start", {})
        self.stream_sid = start_data.get("streamSid")
        self.call_sid = start_data.get("callSid")
        
        logger.info(
            "Stream started: stream_sid=%s, call_sid=%s",
            self.stream_sid, self.call_sid
        )
        
        # Send initial greeting
        await self._speak("Thank you for calling KC Comfort Air. How may I help you today?")
    
    async def _handle_media(self, msg: dict):
        """Handle incoming audio from Twilio."""
        payload = msg.get("media", {}).get("payload")
        if not payload or not validate_base64_audio(payload):
            return
        
        # Decode audio
        audio_bytes = base64.b64decode(payload)
        
        # Check for barge-in (user speaking while agent is speaking)
        if self._is_speaking and self._detect_speech(audio_bytes):
            logger.debug("Barge-in detected, cancelling speech")
            if self._tts:
                self._tts.cancel_speech()
            self._is_speaking = False
        
        # Buffer audio for STT
        async with self._input_lock:
            self._input_buffer.extend(audio_bytes)
            
            # Detect speech/silence
            if self._detect_speech(audio_bytes):
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
                    
                    # Process in background to not block
                    asyncio.create_task(self._process_utterance(audio_data))
    
    def _detect_speech(self, audio_bytes: bytes, threshold: int = 20) -> bool:
        """
        Detect if audio contains speech (not silence).
        
        For μ-law, silence is around 0xFF (255) or 0x7F (127).
        """
        if len(audio_bytes) == 0:
            return False
        
        silence_value = 0xFF
        variance = sum(abs(b - silence_value) for b in audio_bytes) / len(audio_bytes)
        return variance > threshold
    
    async def _process_utterance(self, audio_data: bytes):
        """Process a complete user utterance."""
        try:
            # Convert to text using OpenAI Whisper
            text = await self._transcribe(audio_data)
            if not text or not text.strip():
                return
            
            logger.info("User said: %s", text[:100])
            
            # Get response from GPT
            response = await self._get_response(text)
            if response:
                logger.info("Agent response: %s", response[:100])
                await self._speak(response)
                
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
        if not text or not text.strip():
            return
        
        self._is_speaking = True
        
        try:
            if self._tts:
                # Stream ElevenLabs audio to Twilio
                await self._tts.stream_to_twilio(
                    text,
                    self._send_audio_chunk
                )
            else:
                # Fallback: Can't stream without ElevenLabs in this mode
                logger.warning("No TTS available for streaming")
                
        except Exception as e:
            logger.error("TTS error: %s", str(e))
        finally:
            self._is_speaking = False
    
    async def _send_audio_chunk(self, audio_bytes: bytes):
        """Send audio chunk to Twilio."""
        if not self.stream_sid:
            return
        
        try:
            payload = base64.b64encode(audio_bytes).decode("utf-8")
            await self.twilio_ws.send_text(json.dumps({
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {
                    "payload": payload,
                },
            }))
        except Exception as e:
            logger.error("Failed to send audio to Twilio: %s", str(e))


@router.websocket("/twilio/elevenlabs/stream")
async def twilio_elevenlabs_stream(ws: WebSocket):
    """
    Twilio Media Streams WebSocket endpoint with ElevenLabs TTS.
    
    This endpoint provides human-like voice using ElevenLabs for TTS
    while using OpenAI for STT and conversation.
    """
    await ws.accept()
    logger.info("ElevenLabs stream WebSocket connected")
    
    try:
        bridge = ElevenLabsStreamBridge(ws)
        await bridge.start()
        
    except WebSocketDisconnect:
        logger.info("ElevenLabs stream WebSocket disconnected")
    except Exception as e:
        logger.error("Error in elevenlabs_stream: %s", str(e))
        try:
            await ws.close(code=1011, reason="Internal server error")
        except Exception:
            pass


@router.get("/twilio/elevenlabs/twiml")
async def elevenlabs_twiml():
    """
    Return TwiML for connecting to the ElevenLabs streaming endpoint.
    """
    stream_url = os.getenv("STREAM_WEBSOCKET_URL", "wss://YOUR_DOMAIN/twilio/elevenlabs/stream")
    
    # Use ElevenLabs stream if available, otherwise fall back to regular stream
    if is_elevenlabs_available():
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="{stream_url.replace('/twilio/stream', '/twilio/elevenlabs/stream')}" />
    </Connect>
</Response>
""".strip()
    else:
        # Fallback to Polly voice
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Connecting you to our assistant. Please hold.</Say>
    <Connect>
        <Stream url="{stream_url}" />
    </Connect>
</Response>
""".strip()
    
    return Response(content=twiml, media_type="application/xml")
