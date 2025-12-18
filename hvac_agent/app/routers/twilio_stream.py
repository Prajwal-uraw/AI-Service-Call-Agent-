"""
Twilio Media Streams WebSocket handler for real-time voice streaming.

Handles:
- Twilio Media Streams WebSocket connection
- OpenAI Realtime API integration
- Bidirectional audio streaming
- Real-time conversation

This provides lower latency than turn-based voice but requires
more complex setup and OpenAI Realtime API access.
"""

import json
import os
import asyncio
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
import websockets
from websockets.exceptions import ConnectionClosed

from app.utils.logging import get_logger
from app.utils.audio import validate_base64_audio, AudioBuffer
from app.utils.error_handler import handle_error

router = APIRouter(tags=["twilio-stream"])
logger = get_logger("twilio.stream")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
HVAC_COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")

# Enterprise prompt for OpenAI Realtime
REALTIME_INSTRUCTIONS = f"""You are Sarah, a senior service coordinator at {HVAC_COMPANY_NAME} with 8 years of experience. You're known for warm professionalism and efficiency.

VOICE RULES (CRITICAL):
- Max 15 words per sentence for phone clarity
- One topic per response
- Use contractions: I'll, we're, that's, you're
- Acknowledgments: "Got it.", "Okay.", "Perfect.", "Understood."

BOOKING SEQUENCE:
1. Issue: "What's going on with your system?"
2. City: "What city are you in?"
3. Time: "Morning or afternoon work better?"
4. Name: "May I have your name?"
5. Phone: "Best number to reach you?" → ALWAYS repeat back
6. Confirm: "Text or email confirmation?"

SERVICE AREAS:
- Primary: Dallas, Fort Worth, Arlington
- Euless/Bedford/Hurst/Grapevine → Fort Worth
- Irving/Garland/Plano/Richardson → Dallas

EMERGENCIES (transfer immediately, no questions):
- Gas leak, carbon monoxide, fire, sparks
- Flooding from HVAC
- No heat when below 40°F
- No AC above 95°F with elderly/infants
Say: "This is urgent. Transferring you now."

PRICING:
- Diagnostic: $89 (applied to repair)
- Hours: Mon-Sat 7AM-7PM
- Emergency: 24/7 available

TONE: Warm, confident, action-oriented. Acknowledge frustration once, then solve."""

# Realtime session configuration - Enterprise conversational AI
REALTIME_SESSION_CONFIG = {
    "type": "session.update",
    "session": {
        "instructions": REALTIME_INSTRUCTIONS,
        "modalities": ["audio", "text"],
        "input_audio_format": "g711_ulaw",
        "output_audio_format": "g711_ulaw",
        "voice": "alloy",  # Professional, clear, neutral voice
        "temperature": 0.8,  # Balanced: natural but consistent
        "max_response_output_tokens": 100,  # Concise responses for phone
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,  # Standard sensitivity
            "prefix_padding_ms": 300,  # Standard padding
            "silence_duration_ms": 500,  # Slightly faster response
        },
    },
}


@asynccontextmanager
async def openai_realtime_connection():
    """
    Context manager for OpenAI Realtime WebSocket connection.
    
    Yields:
        WebSocket connection to OpenAI Realtime API
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not configured")
    
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "OpenAI-Beta": "realtime=v1",
    }
    
    try:
        async with websockets.connect(
            OPENAI_REALTIME_URL,
            extra_headers=headers,
            ping_interval=20,
            ping_timeout=10,
        ) as ws:
            # Send session configuration
            await ws.send(json.dumps(REALTIME_SESSION_CONFIG))
            logger.info("OpenAI Realtime session configured")
            yield ws
    except Exception as e:
        logger.error("Failed to connect to OpenAI Realtime: %s", str(e))
        raise


class StreamBridge:
    """
    Bridge between Twilio Media Streams and OpenAI Realtime.
    
    Handles bidirectional audio streaming and message routing.
    """
    
    def __init__(self, twilio_ws: WebSocket, openai_ws):
        self.twilio_ws = twilio_ws
        self.openai_ws = openai_ws
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        self.is_running = True
        self.audio_buffer = AudioBuffer(max_duration_seconds=30)
        self._tasks: list = []
    
    async def start(self):
        """Start the bidirectional stream bridge."""
        try:
            # Create tasks for both directions
            twilio_task = asyncio.create_task(self._twilio_to_openai())
            openai_task = asyncio.create_task(self._openai_to_twilio())
            self._tasks = [twilio_task, openai_task]
            
            # Wait for either to complete (usually means disconnect)
            done, pending = await asyncio.wait(
                self._tasks,
                return_when=asyncio.FIRST_COMPLETED,
            )
            
            # Cancel pending tasks
            for task in pending:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                    
        except Exception as e:
            logger.error("Stream bridge error: %s", str(e))
        finally:
            self.is_running = False
    
    async def stop(self):
        """Stop the stream bridge."""
        self.is_running = False
        for task in self._tasks:
            if not task.done():
                task.cancel()
    
    async def _twilio_to_openai(self):
        """Forward audio from Twilio to OpenAI."""
        try:
            async for raw_msg in self.twilio_ws.iter_text():
                if not self.is_running:
                    break
                
                try:
                    msg = json.loads(raw_msg)
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON from Twilio")
                    continue
                
                event = msg.get("event")
                
                if event == "connected":
                    logger.info("Twilio stream connected")
                
                elif event == "start":
                    start_data = msg.get("start", {})
                    self.stream_sid = start_data.get("streamSid")
                    self.call_sid = start_data.get("callSid")
                    logger.info(
                        "Twilio stream started: stream_sid=%s, call_sid=%s",
                        self.stream_sid, self.call_sid
                    )
                    
                    # Send initial greeting prompt
                    await self._send_initial_greeting()
                
                elif event == "media":
                    payload = msg.get("media", {}).get("payload")
                    if payload and validate_base64_audio(payload):
                        await self._forward_audio_to_openai(payload)
                
                elif event == "stop":
                    logger.info("Twilio stream stop received")
                    # Commit any remaining audio
                    await self.openai_ws.send(json.dumps({
                        "type": "input_audio_buffer.commit"
                    }))
                    break
                
                elif event == "mark":
                    # Mark events can be used for synchronization
                    pass
                    
        except WebSocketDisconnect:
            logger.info("Twilio WebSocket disconnected")
        except Exception as e:
            logger.error("Error in twilio_to_openai: %s", str(e))
    
    async def _openai_to_twilio(self):
        """Forward audio from OpenAI to Twilio."""
        try:
            async for raw_msg in self.openai_ws:
                if not self.is_running:
                    break
                
                try:
                    msg = json.loads(raw_msg)
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON from OpenAI")
                    continue
                
                msg_type = msg.get("type")
                
                if msg_type == "session.created":
                    logger.info("OpenAI Realtime session created")
                
                elif msg_type == "session.updated":
                    logger.info("OpenAI Realtime session updated")
                
                elif msg_type == "response.audio.delta":
                    # Forward audio to Twilio
                    audio_b64 = msg.get("delta")
                    if audio_b64 and self.stream_sid:
                        await self._send_audio_to_twilio(audio_b64)
                
                elif msg_type == "response.audio.done":
                    logger.debug("OpenAI audio response complete")
                
                elif msg_type == "response.text.delta":
                    # Log text for debugging
                    text = msg.get("delta", "")
                    if text:
                        logger.debug("OpenAI text: %s", text)
                
                elif msg_type == "response.done":
                    logger.debug("OpenAI response complete")
                
                elif msg_type == "input_audio_buffer.speech_started":
                    logger.debug("User started speaking")
                
                elif msg_type == "input_audio_buffer.speech_stopped":
                    logger.debug("User stopped speaking")
                
                elif msg_type == "error":
                    error = msg.get("error", {})
                    logger.error(
                        "OpenAI Realtime error: %s - %s",
                        error.get("type"), error.get("message")
                    )
                    
        except ConnectionClosed:
            logger.info("OpenAI WebSocket closed")
        except Exception as e:
            logger.error("Error in openai_to_twilio: %s", str(e))
    
    async def _forward_audio_to_openai(self, audio_b64: str):
        """Forward audio chunk to OpenAI."""
        try:
            await self.openai_ws.send(json.dumps({
                "type": "input_audio_buffer.append",
                "audio": audio_b64,
            }))
        except Exception as e:
            logger.error("Failed to forward audio to OpenAI: %s", str(e))
    
    async def _send_audio_to_twilio(self, audio_b64: str):
        """Send audio chunk to Twilio."""
        try:
            await self.twilio_ws.send_text(json.dumps({
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {
                    "payload": audio_b64,
                },
            }))
        except Exception as e:
            logger.error("Failed to send audio to Twilio: %s", str(e))
    
    async def _send_initial_greeting(self):
        """Send initial greeting prompt to OpenAI - conversational and welcoming."""
        try:
            await self.openai_ws.send(json.dumps({
                "type": "response.create",
                "response": {
                    "modalities": ["audio", "text"],
                    "instructions": "Greet the caller warmly and professionally: 'Thank you for calling KC Comfort Air. How may I help you today?'",
                },
            }))
        except Exception as e:
            logger.error("Failed to send initial greeting: %s", str(e))


@router.websocket("/twilio/stream")
async def twilio_stream(ws: WebSocket):
    """
    Twilio Media Streams WebSocket endpoint.
    
    Twilio connects to this endpoint when using <Stream> TwiML.
    
    Example TwiML to connect:
    ```xml
    <Response>
        <Say>Connecting you to our assistant.</Say>
        <Connect>
            <Stream url="wss://YOUR_DOMAIN/twilio/stream" />
        </Connect>
    </Response>
    ```
    """
    await ws.accept()
    logger.info("Twilio stream WebSocket connected")
    
    try:
        async with openai_realtime_connection() as openai_ws:
            bridge = StreamBridge(ws, openai_ws)
            await bridge.start()
            
    except WebSocketDisconnect:
        logger.info("Twilio stream WebSocket disconnected")
    except ValueError as e:
        logger.error("Configuration error: %s", str(e))
        await ws.close(code=1011, reason="Server configuration error")
    except Exception as e:
        logger.error("Error in twilio_stream: %s", str(e))
        try:
            await ws.close(code=1011, reason="Internal server error")
        except Exception:
            pass


@router.api_route("/twilio/stream/twiml", methods=["GET", "POST"])
async def stream_twiml(request: Request):
    """
    Return TwiML for connecting to the streaming endpoint.
    
    Use this endpoint as your Twilio webhook to enable streaming.
    Accepts both GET and POST - Twilio sends POST requests.
    """
    from fastapi.responses import Response
    
    # Build WebSocket URL dynamically from request host
    host = request.headers.get("host", "")
    if host:
        stream_url = f"wss://{host}/twilio/stream"
    else:
        stream_url = os.getenv("STREAM_WEBSOCKET_URL", "wss://YOUR_DOMAIN/twilio/stream")
    
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Connecting you to our assistant. Please hold.</Say>
    <Connect>
        <Stream url="{stream_url}" />
    </Connect>
</Response>"""
    
    return Response(content=twiml.strip(), media_type="application/xml")
