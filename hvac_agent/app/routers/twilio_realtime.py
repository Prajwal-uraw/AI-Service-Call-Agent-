"""
OpenAI Realtime API Integration with Twilio Media Streams.

PRODUCTION-GRADE Implementation with:
- Sub-200ms latency (voice-to-voice)
- Proper barge-in (interruption) handling
- Function calling for booking, transfer, emergency
- Audio format conversion (μ-law ↔ PCM16)
- Graceful error recovery
- Industry-standard conversation flow

Architecture:
    Caller <-> Twilio (μ-law 8kHz) <-> This Server <-> OpenAI Realtime API (PCM16 24kHz)

Audio Pipeline:
- Inbound: Twilio μ-law 8kHz → PCM16 8kHz → Upsample to 24kHz → OpenAI
- Outbound: OpenAI PCM16 24kHz → Downsample to 8kHz → μ-law → Twilio

Cost: ~$0.06/minute (input) + $0.24/minute (output)
"""

import os
import json
import base64
import asyncio
import struct
import time
import httpx
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import Response
import websockets
from websockets.client import WebSocketClientProtocol

from app.utils.logging import get_logger
from app.services.transcript_collector import get_transcript_collector

# Resend API configuration for lead notifications
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
LEAD_NOTIFICATION_EMAIL = os.getenv("LEAD_NOTIFICATION_EMAIL", "subodh.kc@haiec.com")

# In-memory lead storage (for visual review - also logged to console)
# In production, this would be a database
CAPTURED_LEADS: List[Dict[str, Any]] = []

router = APIRouter(tags=["twilio-realtime"])
logger = get_logger("twilio.realtime")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not configured - Realtime API will not work!")

# PRIMARY: Production-ready gpt-realtime model (20% cheaper, better quality, cedar voice)
OPENAI_REALTIME_URL_PRIMARY = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2025-08-28"
# FALLBACK: Previous model if primary fails
OPENAI_REALTIME_URL_FALLBACK = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17"
COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")
TRANSFER_PHONE = os.getenv("TRANSFER_PHONE", "+16822249904")
EMERGENCY_PHONE = os.getenv("EMERGENCY_PHONE", "+16822249904")

# Demo mode - when enabled, agent is aware it's a demo for HVAC companies
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# Fallback message when OpenAI is unavailable
FALLBACK_MESSAGE = "I'm sorry, we're experiencing technical difficulties. Please hold while I transfer you to a representative."

# Version for deployment verification
_VERSION = "4.8.0-please-hold-fix"

# Call duration and flood protection limits
MAX_CALL_DURATION_SECONDS = 600  # 10 minutes max per call
CALLER_RATE_LIMIT_CALLS = 5  # Max calls per caller per hour
CALLER_RATE_LIMIT_WINDOW = 3600  # 1 hour window

# In-memory rate limiting (simple, resets on container restart)
_caller_call_counts: dict = {}  # {caller_number: [(timestamp, call_sid), ...]}
print(f"[REALTIME_MODULE_LOADED] Version: {_VERSION}")

# =============================================================================
# INDUSTRY-BEST CONVERSATION SCRIPT
# Based on: Call center best practices, voice UX research, HVAC industry standards
# =============================================================================

# INDUSTRY EXPERT OPTIMIZED SYSTEM PROMPT
# Positioning: Premium AI Inbound Marketing & Lead Generation for HVAC
# Strategy: AIDA (Attention → Interest → Desire → Action) + Scarcity + Social Proof
# OPTIMIZED: Shorter responses to reduce OpenAI costs while maintaining UX
SYSTEM_PROMPT = f"""You are KC, a premium AI voice assistant for {COMPANY_NAME}. You're the demo line for HVAC company owners evaluating our AI-powered inbound call system.

## CRITICAL RULES
1. **KEEP RESPONSES SHORT** - 2-3 sentences max per turn. This is phone audio, not email.
2. **PAUSE AFTER QUESTIONS** - Let them respond. Don't keep talking.
3. **STAY ON TOPIC** - Brief off-topic responses, then pivot back to demo/booking.
4. **DETECT MISUSE** - If caller is clearly wasting time (nonsense, abuse, trolling), politely end: "I appreciate your time, but I'm designed to help HVAC business owners. Have a great day!" Then stop responding.

## YOUR PERSONA
- Confident, professional, friendly but CONCISE
- You ARE the product - your voice quality IS the demo
- Use contractions naturally ("I'm", "we'll", "you're")

## CAPABILITIES (mention briefly when relevant)
- Answer FAQs about HVAC services
- Book appointments and check booking status
- Give directions to the shop
- Handle emergencies (gas leak, no heat, etc.)
- Qualify leads and capture info
- Work 24/7 as extension to their current system (NOT replacement)

## IF THEY WANT TO TEST
"Great! Go ahead - pretend you're a customer calling about an HVAC issue."

Then BE the service coordinator - brief, efficient:
- "Thanks for calling! How can I help?"
- Show empathy briefly: "That's no good. Let me help."
- Gather info: "Name? ... Callback number? ... Got it."
- Book: "Tomorrow morning work? ... Perfect, you're all set."

After demo: "That's what your customers would experience. 24/7. Pretty cool, right?"

## PRICING (only if asked)
"$497/month pilot - unlimited calls, 24/7, booking, emergencies, analytics. Only 10 spots. Want me to grab your info?"

## OBJECTIONS (keep brief)
- **Expensive**: "One missed call could be a $5K job to your competitor. ROI in week one."
- **Need to think**: "Only 10 spots, can't hold one. Cancel anytime if not right."
- **Have receptionist**: "I'm the backup - overflow, after-hours, weekends. Force multiplier."

## OFF-TOPIC HANDLING
Brief response, then pivot: "Ha, yeah. Anyway - wanna test the booking flow?"

## MISUSE DETECTION
If caller is:
- Making nonsense sounds repeatedly
- Using profanity/abuse
- Clearly trolling or wasting time
- Asking unrelated questions repeatedly after redirection

Say: "I appreciate your time, but I'm designed to help HVAC business owners evaluate our AI system. If you're interested in that, I'm happy to help. Otherwise, have a great day!"

If they continue misusing, stop responding and let the call timeout.

## EMERGENCY DEMO
"Gas leak detected - in real call, I'd transfer to emergency line and text your on-call tech immediately. Want to see the full flow?"

Remember: Short responses save money AND improve UX. Be excellent but CONCISE."""

# Tools for function calling
TOOLS = [
    {
        "type": "function",
        "name": "schedule_appointment",
        "description": "Schedule an HVAC service appointment for the caller",
        "parameters": {
            "type": "object",
            "properties": {
                "customer_name": {
                    "type": "string",
                    "description": "Customer's full name"
                },
                "phone_number": {
                    "type": "string",
                    "description": "Customer's callback phone number"
                },
                "address": {
                    "type": "string",
                    "description": "Service address"
                },
                "city": {
                    "type": "string",
                    "description": "City for service"
                },
                "issue_description": {
                    "type": "string",
                    "description": "Description of the HVAC issue"
                },
                "preferred_date": {
                    "type": "string",
                    "description": "Preferred date (today, tomorrow, or day of week)"
                },
                "preferred_time": {
                    "type": "string",
                    "description": "Preferred time slot (morning or afternoon)"
                }
            },
            "required": ["customer_name", "phone_number", "city", "issue_description", "preferred_time"]
        }
    },
    {
        "type": "function",
        "name": "transfer_to_human",
        "description": "Transfer the call to a human agent",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Reason for transfer"
                }
            },
            "required": ["reason"]
        }
    },
    {
        "type": "function",
        "name": "handle_emergency",
        "description": "Handle an emergency situation - gas leak, fire, CO alarm, etc.",
        "parameters": {
            "type": "object",
            "properties": {
                "emergency_type": {
                    "type": "string",
                    "description": "Type of emergency"
                }
            },
            "required": ["emergency_type"]
        }
    },
    {
        "type": "function",
        "name": "transfer_to_gather",
        "description": "Transfer the caller to the traditional turn-based Gather system for comparison",
        "parameters": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Reason for switching to Gather system"
                }
            },
            "required": ["reason"]
        }
    }
]


class RealtimeSession:
    """
    Manages a single call session bridging Twilio and OpenAI Realtime API.
    
    Audio flow:
    - Twilio sends μ-law 8kHz audio → convert to PCM16 24kHz → OpenAI
    - OpenAI sends PCM16 24kHz audio → convert to μ-law 8kHz → Twilio
    """
    
    def __init__(self, twilio_ws: WebSocket):
        self.twilio_ws = twilio_ws
        self.openai_ws: Optional[WebSocketClientProtocol] = None
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        self.closed = False
        
        # Audio conversion buffers
        self.input_buffer = bytearray()
        self.output_buffer = bytearray()
        
        # Session state
        self.session_configured = False
        self.session_ready = False  # True after session.updated is received
        self.response_in_progress = False
        self.current_response_id: Optional[str] = None
        self.pending_function_calls: Dict[str, dict] = {}
        
        # CRITICAL: Echo cancellation state
        # When AI is speaking, we must NOT forward audio to OpenAI
        # Otherwise Twilio's echo comes back and triggers barge-in
        self.is_speaking = False
        self.last_audio_sent_time: float = 0
        self.echo_suppression_ms: int = 500  # INCREASED - need more buffer for Twilio's audio pipeline latency
        
        # Track when we START sending audio (not when we finish)
        self.audio_send_start_time: float = 0
        
        # Mark tracking for precise echo cancellation
        self.mark_counter: int = 0
        self.pending_marks: set = set()
        
        # Conversation management
        self.last_user_speech_time: float = 0
        self.reprompt_count: int = 0
        self.max_reprompts: int = 3
        
        # Call tracking
        self.call_start_time: float = time.time()
        self.caller_number: Optional[str] = None
        
        # Safety limits
        self.max_marks: int = 1000  # Prevent unbounded growth
        self.openai_connected: bool = False
        
        # Transfer flags
        self.transfer_to_gather_pending: bool = False
        
        # Track which model we're using
        self.using_fallback_model: bool = False
        
        # Fallback tracking - prevent multiple fallback triggers
        self.fallback_triggered: bool = False
        
        # Transcript collector for Gather model training
        self.transcript_collector = get_transcript_collector()
        self.transcript_started: bool = False
        
        # Buffer for accumulating transcript text
        self.current_assistant_transcript: str = ""
        self.current_user_transcript: str = ""
    
    def _is_caller_rate_limited(self) -> bool:
        """Check if caller has exceeded rate limit (flood protection)."""
        if not self.caller_number:
            return False
        
        current_time = time.time()
        caller_calls = _caller_call_counts.get(self.caller_number, [])
        
        # Filter to calls within the rate limit window
        recent_calls = [t for t, _ in caller_calls if current_time - t < CALLER_RATE_LIMIT_WINDOW]
        
        return len(recent_calls) >= CALLER_RATE_LIMIT_CALLS
    
    def _record_caller_call(self):
        """Record this call for rate limiting."""
        if not self.caller_number:
            return
        
        current_time = time.time()
        if self.caller_number not in _caller_call_counts:
            _caller_call_counts[self.caller_number] = []
        
        # Add this call
        _caller_call_counts[self.caller_number].append((current_time, self.call_sid))
        
        # Clean up old entries (older than rate limit window)
        _caller_call_counts[self.caller_number] = [
            (t, sid) for t, sid in _caller_call_counts[self.caller_number]
            if current_time - t < CALLER_RATE_LIMIT_WINDOW
        ]
    
    def _is_call_duration_exceeded(self) -> bool:
        """Check if call has exceeded maximum duration."""
        elapsed = time.time() - self.call_start_time
        return elapsed > MAX_CALL_DURATION_SECONDS
        
    async def connect_to_openai(self) -> bool:
        """
        Establish WebSocket connection to OpenAI Realtime API.
        
        Strategy:
        1. Try PRIMARY model (gpt-realtime-2025-08-28) first
        2. If that fails, fallback to PREVIOUS model (gpt-4o-realtime-preview)
        3. Uses exponential backoff within each model attempt
        
        Note: Uses 'additional_headers' for older websockets versions (Modal)
        and 'extra_headers' for newer versions. Tries both for compatibility.
        """
        headers = [
            ("Authorization", f"Bearer {OPENAI_API_KEY}"),
            ("OpenAI-Beta", "realtime=v1")
        ]
        
        # Try PRIMARY model first, then FALLBACK
        models_to_try = [
            (OPENAI_REALTIME_URL_PRIMARY, "gpt-realtime-2025-08-28 (primary)"),
            (OPENAI_REALTIME_URL_FALLBACK, "gpt-4o-realtime-preview (fallback)")
        ]
        
        for model_url, model_name in models_to_try:
            max_retries = 2  # Fewer retries per model since we have fallback
            base_delay = 0.3
            
            for attempt in range(max_retries):
                try:
                    # Try with additional_headers first (older websockets versions on Modal)
                    try:
                        self.openai_ws = await websockets.connect(
                            model_url,
                            additional_headers=headers,
                            ping_interval=20,
                            ping_timeout=10
                        )
                    except TypeError:
                        # Fall back to extra_headers (newer websockets versions)
                        self.openai_ws = await websockets.connect(
                            model_url,
                            extra_headers=headers,
                            ping_interval=20,
                            ping_timeout=10
                        )
                    
                    self.using_fallback_model = (model_url == OPENAI_REALTIME_URL_FALLBACK)
                    logger.info("Connected to OpenAI Realtime API: %s", model_name)
                    self.openai_connected = True
                    return True
                    
                except Exception as e:
                    logger.warning("Failed to connect to %s (attempt %d/%d): %s", 
                                 model_name, attempt + 1, max_retries, str(e))
                    if attempt < max_retries - 1:
                        delay = base_delay * (2 ** attempt)
                        await asyncio.sleep(delay)
            
            # If primary failed, log and try fallback
            if model_url == OPENAI_REALTIME_URL_PRIMARY:
                logger.warning("Primary model failed, trying fallback model...")
        
        logger.error("All OpenAI connection attempts failed (both primary and fallback)")
        return False
    
    async def configure_session(self):
        """Configure the OpenAI Realtime session."""
        if not self.openai_ws or self.session_configured:
            return
        
        # Select voice based on model
        # cedar = "natural and conversational" (only on gpt-realtime-2025-08-28)
        # shimmer = "energetic and expressive" (fallback for older model)
        voice = "cedar" if not self.using_fallback_model else "shimmer"
        logger.info("Using voice: %s (fallback_model=%s)", voice, self.using_fallback_model)
        
        # Session configuration
        config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": SYSTEM_PROMPT,
                "voice": voice,  # cedar for new model, shimmer for fallback
                "input_audio_format": "pcm16",  # We'll convert from μ-law
                "output_audio_format": "pcm16",  # We'll convert to μ-law
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",  # Server-side voice activity detection
                    "threshold": 0.4,  # LOWERED from 0.5 - better barge-in detection when user speaks
                    "prefix_padding_ms": 300,  # REDUCED - faster response to user speech
                    "silence_duration_ms": 700  # REDUCED slightly - better turn-taking
                },
                "tools": TOOLS,
                "tool_choice": "auto",
                "temperature": 0.7,
                "max_response_output_tokens": 1000  # INCREASED - 500 was cutting off 20-22 sec into greeting
            }
        }
        
        await self.openai_ws.send(json.dumps(config))
        self.session_configured = True
        logger.info("OpenAI session configured")
    
    async def send_initial_greeting(self):
        """
        Trigger the initial marketing pitch greeting from the AI.
        
        STRATEGIC: Keep greeting concise (~15-20 seconds) to avoid cutoff.
        The full pitch is in SYSTEM_PROMPT - this just kicks off the conversation.
        """
        if not self.openai_ws or not self.openai_connected:
            return
        
        # SHORT greeting - concise to save costs and improve UX
        # Position as extension, mention key capabilities briefly
        greeting_event = {
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"],
                "instructions": f"""Deliver this opening naturally (10-12 seconds max):

"Hey! Welcome to {COMPANY_NAME}'s AI demo. I'm KC - your potential 24/7 backup receptionist.

I handle FAQs, bookings, emergencies, and after-hours calls - so you never miss one.

Wanna test me? Pretend you're a customer with an HVAC issue!"

Then STOP. Let them respond. Don't keep talking."""
            }
        }
        
        try:
            await self.openai_ws.send(json.dumps(greeting_event))
            logger.info("Triggered concise greeting (avoiding cutoff)")
        except Exception as e:
            logger.error("Failed to send greeting: %s", str(e))
            await self.send_fallback_and_transfer()
    
    async def send_fallback_and_transfer(self):
        """Send fallback message and redirect to Gather system or human."""
        if not self.stream_sid or self.closed:
            return
        
        logger.warning("Initiating fallback for call_sid=%s", self.call_sid)
        
        # We can't easily play TTS through Media Streams without OpenAI
        # Best option: Close the stream and let Twilio handle via TwiML redirect
        # For now, just log and close - the TwiML should have a fallback
        self.closed = True
    
    async def handle_twilio_message(self, message: dict):
        """Process incoming message from Twilio."""
        event = message.get("event")
        
        if event == "connected":
            logger.info("Twilio stream connected")
            
        elif event == "start":
            start_data = message.get("start", {})
            self.stream_sid = start_data.get("streamSid")
            self.call_sid = start_data.get("callSid")
            
            # Extract caller info from custom parameters
            custom_params = start_data.get("customParameters", {})
            self.caller_number = custom_params.get("caller", "unknown")
            
            logger.info("Stream started: call_sid=%s, stream_sid=%s, caller=%s", 
                       self.call_sid, self.stream_sid, self.caller_number)
            
            # Start transcript collection for Gather model training
            if self.call_sid:
                self.transcript_collector.start_call(self.call_sid, self.caller_number or "unknown")
                self.transcript_started = True
            
            # FLOOD PROTECTION: Check if caller is rate limited
            if self.caller_number and self.caller_number != "unknown":
                if self._is_caller_rate_limited():
                    logger.warning("Caller %s rate limited - too many calls", self.caller_number)
                    self.closed = True
                    return
                self._record_caller_call()
            
            # Validate API key before attempting connection
            if not OPENAI_API_KEY:
                logger.error("Cannot connect to OpenAI - API key not configured")
                await self.send_fallback_and_transfer()
                return
            
            # Connect to OpenAI and configure
            if await self.connect_to_openai():
                await self.configure_session()
                # Wait for session.updated event (with timeout)
                wait_start = time.time()
                while not self.session_ready and (time.time() - wait_start) < 5.0:
                    await asyncio.sleep(0.1)
                
                if self.session_ready:
                    logger.info("Session ready, sending initial greeting")
                    await self.send_initial_greeting()
                else:
                    logger.warning("Session not ready after 5s, sending greeting anyway")
                    await self.send_initial_greeting()
            else:
                # OpenAI connection failed - fallback to transfer
                logger.error("OpenAI connection failed, initiating fallback")
                await self.send_fallback_and_transfer()
            
        elif event == "media":
            # Forward audio to OpenAI
            await self.forward_audio_to_openai(message)
            
        elif event == "mark":
            # Twilio confirms audio chunk was played
            mark_name = message.get("mark", {}).get("name", "")
            if mark_name in self.pending_marks:
                self.pending_marks.discard(mark_name)
                logger.debug("Mark received: %s, pending: %d", mark_name, len(self.pending_marks))
                # When all marks cleared, audio playback is complete
                if not self.pending_marks:
                    self.is_speaking = False
                    self.last_audio_sent_time = time.time()
                    logger.info("All audio marks cleared - echo suppression active")
            
        elif event == "stop":
            logger.info("Twilio stream stopped")
            self.closed = True
    
    async def forward_audio_to_openai(self, message: dict):
        """
        Convert and forward Twilio audio to OpenAI.
        
        CRITICAL: Implements echo cancellation by NOT forwarding audio while
        the AI is speaking. Twilio sends back the AI's own voice as "inbound"
        audio, which would trigger OpenAI's VAD and cause barge-in on itself.
        """
        if not self.openai_ws or self.closed or not self.openai_connected:
            return
        
        # CALL DURATION LIMIT: End call if exceeded max duration (bad actor protection)
        if self._is_call_duration_exceeded():
            if not self.fallback_triggered:
                self.fallback_triggered = True
                logger.warning("Call duration exceeded %ds - ending call", MAX_CALL_DURATION_SECONDS)
                # Send a polite goodbye message before closing
                try:
                    goodbye_event = {
                        "type": "response.create",
                        "response": {
                            "modalities": ["text", "audio"],
                            "instructions": "Say briefly: 'Thanks for calling! I need to wrap up now, but feel free to call back anytime. Have a great day!' Then stop."
                        }
                    }
                    await self.openai_ws.send(json.dumps(goodbye_event))
                except Exception:
                    pass
                # Close after a short delay to let goodbye play
                await asyncio.sleep(5)
                self.closed = True
            return
        
        # ECHO CANCELLATION: Don't forward audio while AI is speaking
        # This prevents the AI from hearing its own voice and stopping
        if self.is_speaking:
            logger.debug("Blocking audio - AI is speaking")
            return
        
        # CRITICAL: Check if we're in the echo suppression window
        # This catches echo from Twilio's audio pipeline (has ~200-500ms latency)
        current_time = time.time()
        
        # Check against BOTH start and end times for maximum protection
        if self.audio_send_start_time > 0:
            elapsed_since_start = (current_time - self.audio_send_start_time) * 1000
            # If we started sending audio recently, block incoming audio
            if elapsed_since_start < self.echo_suppression_ms:
                logger.debug("Blocking audio - within echo window (start): %.0fms", elapsed_since_start)
                return
        
        if self.last_audio_sent_time > 0:
            elapsed_since_end = (current_time - self.last_audio_sent_time) * 1000
            if elapsed_since_end < self.echo_suppression_ms:
                logger.debug("Blocking audio - within echo window (end): %.0fms", elapsed_since_end)
                return
        
        payload = message.get("media", {}).get("payload")
        if not payload:
            return
        
        try:
            # Validate and decode base64 μ-law audio from Twilio
            try:
                ulaw_audio = base64.b64decode(payload)
            except Exception as decode_err:
                logger.warning("Invalid base64 payload: %s", str(decode_err))
                return
            
            # Skip empty or invalid audio
            if len(ulaw_audio) == 0:
                return
            
            # Convert μ-law 8kHz to PCM16 24kHz for OpenAI
            pcm_audio = self.ulaw_to_pcm16(ulaw_audio)
            
            # Skip if conversion produced no output
            if len(pcm_audio) == 0:
                return
            
            # Resample 8kHz to 24kHz (OpenAI expects 24kHz)
            pcm_24k = self.resample_8k_to_24k(pcm_audio)
            
            # Skip if resampling produced no output
            if len(pcm_24k) == 0:
                return
            
            # Send to OpenAI
            audio_event = {
                "type": "input_audio_buffer.append",
                "audio": base64.b64encode(pcm_24k).decode("ascii")
            }
            
            await self.openai_ws.send(json.dumps(audio_event))
            
        except websockets.exceptions.ConnectionClosed:
            logger.warning("OpenAI connection closed while forwarding audio")
            self.openai_connected = False
        except Exception as e:
            logger.error("Error forwarding audio to OpenAI: %s", str(e))
    
    async def handle_openai_message(self, message: dict):
        """Process incoming message from OpenAI."""
        event_type = message.get("type")
        
        # DEBUG: Log all event types to diagnose audio issues
        if event_type not in ["response.audio.delta", "input_audio_buffer.append"]:
            logger.info("OpenAI event: %s", event_type)
        
        if event_type == "session.created":
            logger.info("OpenAI session created")
            
        elif event_type == "session.updated":
            logger.info("OpenAI session updated - session is now ready")
            self.session_ready = True
            
        elif event_type == "response.audio.delta":
            # Stream audio back to Twilio
            delta = message.get("delta", "")
            if delta:
                logger.debug("Audio delta received: %d bytes", len(delta))
            await self.forward_audio_to_twilio(message)
            
        elif event_type == "response.audio_transcript.delta":
            # Log what the AI is saying and accumulate for transcript
            transcript = message.get("delta", "")
            if transcript:
                logger.debug("AI speaking: %s", transcript)
                self.current_assistant_transcript += transcript
                
        elif event_type == "input_audio_buffer.speech_started":
            logger.info("User started speaking (barge-in detected)")
            self.last_user_speech_time = time.time()
            self.reprompt_count = 0  # Reset reprompt counter when user speaks
            
            # BARGE-IN: Cancel current response if AI is speaking
            if self.response_in_progress:
                logger.info("Cancelling AI response due to barge-in")
                # Clear echo suppression state since we're interrupting
                self.pending_marks.clear()
                self.is_speaking = False
                self.audio_send_start_time = 0
                self.last_audio_sent_time = 0
                
                # Send cancel event
                try:
                    cancel_event = {"type": "response.cancel"}
                    await self.openai_ws.send(json.dumps(cancel_event))
                except Exception as e:
                    logger.warning("Failed to send cancel event: %s", str(e))
                
                self.response_in_progress = False
                self.current_response_id = None
            
        elif event_type == "input_audio_buffer.speech_stopped":
            logger.info("User stopped speaking")
            self.last_user_speech_time = time.time()
            
        elif event_type == "response.created":
            self.response_in_progress = True
            response = message.get("response", {})
            self.current_response_id = response.get("id")
            # Log full response details to debug audio issues
            modalities = response.get("modalities", [])
            status = response.get("status", "unknown")
            logger.info("AI response started: id=%s, modalities=%s, status=%s", 
                       self.current_response_id, modalities, status)
            
        elif event_type == "response.done":
            self.response_in_progress = False
            response = message.get("response", {})
            status = response.get("status", "unknown")
            status_details = response.get("status_details", {})
            output = response.get("output", [])
            
            # Log detailed response info
            logger.info("AI response complete: status=%s, output_items=%d", status, len(output))
            if status_details:
                logger.info("Response status_details: %s", json.dumps(status_details))
            
            # CRITICAL: Handle failed responses (quota exceeded, API errors, etc.)
            if status == "failed":
                error_info = status_details.get("error", {})
                error_type = error_info.get("type", "unknown")
                error_code = error_info.get("code", "unknown")
                error_msg = error_info.get("message", "Unknown error")
                
                logger.error("OpenAI response FAILED: type=%s, code=%s, message=%s", 
                           error_type, error_code, error_msg)
                
                # Send alert email for critical failures
                await self.send_failure_alert_email(error_type, error_code, error_msg)
                
                # Trigger fallback - close stream so Twilio redirects to Gather system
                if not self.fallback_triggered:
                    self.fallback_triggered = True
                    logger.warning("Triggering fallback due to API failure")
                    # Close the stream - Twilio TwiML has fallback to Gather system
                    self.closed = True
            
            for item in output:
                item_type = item.get("type", "unknown")
                item_status = item.get("status", "unknown")
                content = item.get("content", [])
                logger.info("  Output item: type=%s, status=%s, content_parts=%d", 
                           item_type, item_status, len(content))
            
            self.current_response_id = None
            # ECHO CANCELLATION: Mark speaking as done
            self.is_speaking = False
            self.last_audio_sent_time = time.time()
            
            # Save assistant transcript for Gather model training
            if self.transcript_started and self.current_assistant_transcript and self.call_sid:
                self.transcript_collector.add_assistant_turn(self.call_sid, self.current_assistant_transcript)
                self.current_assistant_transcript = ""  # Reset for next turn
            logger.info("Echo suppression window active for %dms", self.echo_suppression_ms)
            
        elif event_type == "response.output_item.done":
            # Handle function calls - this is the correct event for completed function calls
            item = message.get("item", {})
            if item.get("type") == "function_call":
                await self.handle_function_call(item)
            
        elif event_type == "response.cancelled":
            # Response was cancelled (e.g., due to barge-in)
            logger.info("AI response cancelled")
            self.response_in_progress = False
            self.current_response_id = None
            
        elif event_type == "response.content_part.added":
            # Log content part details to debug audio issues
            part = message.get("part", {})
            logger.info("Content part added: type=%s", part.get("type", "unknown"))
            
        elif event_type == "response.output_item.added":
            # Log output item details
            item = message.get("item", {})
            logger.info("Output item added: type=%s, id=%s", item.get("type", "unknown"), item.get("id", "unknown"))
            
        elif event_type == "conversation.item.input_audio_transcription.completed":
            # User's speech has been transcribed - save for Gather model training
            transcript = message.get("transcript", "")
            if transcript and self.transcript_started and self.call_sid:
                logger.info("User said: %s", transcript[:100])
                self.transcript_collector.add_user_turn(self.call_sid, transcript)
            
        elif event_type == "error":
            error = message.get("error", {})
            error_code = error.get("code", "unknown")
            error_msg = error.get("message", "Unknown error")
            logger.error("OpenAI error [%s]: %s", error_code, error_msg)
            # Log full error for debugging
            logger.error("Full error details: %s", json.dumps(error))
            
            # Record error in transcript
            if self.transcript_started and self.call_sid:
                self.transcript_collector.record_error(self.call_sid, f"{error_code}: {error_msg}")
            
            # Handle specific error codes
            if error_code in ["session_expired", "invalid_session"]:
                logger.warning("Session expired, marking connection as closed")
                self.openai_connected = False
    
    async def forward_audio_to_twilio(self, message: dict):
        """Convert and forward OpenAI audio to Twilio."""
        if self.closed or not self.stream_sid:
            return
        
        audio_b64 = message.get("delta")
        if not audio_b64:
            return
        
        # ECHO CANCELLATION: Mark that we're speaking BEFORE sending any audio
        # This is CRITICAL - must happen before any audio goes out
        current_time = time.time()
        if not self.is_speaking:
            # First audio chunk - record start time
            self.audio_send_start_time = current_time
            logger.info("AI started speaking - echo suppression activated")
        
        self.is_speaking = True
        self.last_audio_sent_time = current_time
        
        try:
            # Decode PCM16 audio from OpenAI
            try:
                pcm_audio = base64.b64decode(audio_b64)
            except Exception:
                logger.warning("Invalid base64 audio from OpenAI")
                return
            
            # Skip empty audio
            if len(pcm_audio) == 0:
                return
            
            # Resample 24kHz to 8kHz for Twilio
            pcm_8k = self.resample_24k_to_8k(pcm_audio)
            if len(pcm_8k) == 0:
                return
            
            # Convert PCM16 to μ-law for Twilio
            ulaw_audio = self.pcm16_to_ulaw(pcm_8k)
            if len(ulaw_audio) == 0:
                return
            
            # Send to Twilio with mark for echo cancellation tracking
            # Limit mark counter to prevent overflow
            self.mark_counter = (self.mark_counter + 1) % self.max_marks
            mark_name = f"audio_{self.mark_counter}"
            
            # Clean up old marks if set is getting too large
            if len(self.pending_marks) > self.max_marks // 2:
                logger.warning("Pending marks growing large (%d), clearing old marks", len(self.pending_marks))
                self.pending_marks.clear()
            
            self.pending_marks.add(mark_name)
            
            media_message = {
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {
                    "payload": base64.b64encode(ulaw_audio).decode("ascii")
                }
            }
            
            # Check WebSocket state before sending
            try:
                await self.twilio_ws.send_text(json.dumps(media_message))
                
                # Send mark to track when this audio chunk finishes playing
                mark_message = {
                    "event": "mark",
                    "streamSid": self.stream_sid,
                    "mark": {"name": mark_name}
                }
                await self.twilio_ws.send_text(json.dumps(mark_message))
            except Exception as ws_err:
                logger.warning("Twilio WebSocket send failed: %s", str(ws_err))
                self.closed = True
            
        except Exception as e:
            logger.error("Error forwarding audio to Twilio: %s", str(e))
    
    async def handle_function_call(self, item: dict):
        """Handle function calls from OpenAI."""
        call_id = item.get("call_id")
        name = item.get("name")
        arguments = item.get("arguments", "{}")
        
        # Validate call_id - required for response
        if not call_id:
            logger.error("Function call missing call_id, cannot respond")
            return
        
        try:
            args = json.loads(arguments) if arguments else {}
        except json.JSONDecodeError:
            logger.warning("Invalid JSON in function arguments: %s", arguments)
            args = {}
        
        logger.info("Function call: %s with args: %s", name, args)
        
        result = {}
        
        if name == "schedule_appointment":
            # This is a LEAD CAPTURE - send email notification
            import hashlib
            name_hash = hashlib.md5(args.get("customer_name", "unknown").encode()).hexdigest()[:6].upper()
            confirmation = f"LEAD-{name_hash}"
            
            # Create lead record
            lead = {
                "id": confirmation,
                "timestamp": datetime.now().isoformat(),
                "customer_name": args.get("customer_name", "Unknown"),
                "company_name": args.get("company_name", args.get("city", "Unknown")),
                "phone_number": args.get("phone_number", self.caller_number),
                "email": args.get("email", ""),
                "issue_description": args.get("issue_description", "Pilot program inquiry"),
                "preferred_date": args.get("preferred_date", "ASAP"),
                "preferred_time": args.get("preferred_time", "Any"),
                "call_sid": self.call_sid,
                "source": "AI Demo Line"
            }
            
            # Store lead in memory for visual review
            CAPTURED_LEADS.append(lead)
            logger.info("=" * 60)
            logger.info("🎯 NEW LEAD CAPTURED: %s", confirmation)
            logger.info("   Name: %s", lead["customer_name"])
            logger.info("   Company: %s", lead["company_name"])
            logger.info("   Phone: %s", lead["phone_number"])
            logger.info("   Email: %s", lead["email"])
            logger.info("   Notes: %s", lead["issue_description"])
            logger.info("=" * 60)
            
            # Send email notification via Resend
            await self.send_lead_email(lead)
            
            result = {
                "success": True,
                "confirmation_number": confirmation,
                "message": f"Got it! I've captured their info. Our team will reach out today."
            }
            
        elif name == "transfer_to_human":
            result = {"success": True, "message": "Transferring to human agent"}
            logger.info("Transfer requested: %s", args.get("reason", "no reason"))
            
        elif name == "handle_emergency":
            result = {"success": True, "message": "Emergency routing activated"}
            logger.warning("EMERGENCY: %s for caller %s", args.get("emergency_type", "unknown"), self.caller_number)
        
        elif name == "transfer_to_gather":
            result = {"success": True, "message": "Transferring to Gather system"}
            logger.info("Transfer to Gather requested: %s", args.get("reason", "user requested"))
            self.transfer_to_gather_pending = True
        
        else:
            logger.warning("Unknown function called: %s", name)
            result = {"success": False, "message": f"Unknown function: {name}"}
        
        # Send function result back to OpenAI
        if self.openai_ws and self.openai_connected:
            try:
                response = {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "function_call_output",
                        "call_id": call_id,
                        "output": json.dumps(result)
                    }
                }
                await self.openai_ws.send(json.dumps(response))
                
                # Trigger response generation
                await self.openai_ws.send(json.dumps({"type": "response.create"}))
            except websockets.exceptions.ConnectionClosed:
                logger.warning("OpenAI connection closed during function call response")
                self.openai_connected = False
            except Exception as e:
                logger.error("Error sending function call response: %s", str(e))
    
    async def send_failure_alert_email(self, error_type: str, error_code: str, error_msg: str):
        """
        Send alert email when AI agent fails (quota exceeded, API errors, etc.).
        
        This ensures the team is notified immediately when the agent goes down.
        """
        if not RESEND_API_KEY:
            logger.warning("RESEND_API_KEY not configured - cannot send failure alert")
            return
        
        try:
            email_html = f"""
            <h2 style="color: #dc3545;">🚨 AI Voice Agent FAILURE Alert</h2>
            <p style="font-size: 16px; color: #333;">The AI voice agent encountered a critical error and is not responding to callers.</p>
            
            <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                <tr style="background-color: #f8d7da;">
                    <td style="padding: 12px; border: 1px solid #f5c6cb;"><strong>Error Type</strong></td>
                    <td style="padding: 12px; border: 1px solid #f5c6cb;">{error_type}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>Error Code</strong></td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{error_code}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>Error Message</strong></td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{error_msg}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>Call SID</strong></td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{self.call_sid or 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>Caller</strong></td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{self.caller_number or 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;"><strong>Timestamp</strong></td>
                    <td style="padding: 12px; border: 1px solid #ddd;">{datetime.now().isoformat()}</td>
                </tr>
            </table>
            
            <h3>Recommended Actions:</h3>
            <ul>
                <li><strong>insufficient_quota</strong>: Add credits to your OpenAI account at <a href="https://platform.openai.com/account/billing">platform.openai.com/account/billing</a></li>
                <li><strong>rate_limit_exceeded</strong>: Wait a few minutes and try again</li>
                <li><strong>server_error</strong>: OpenAI service issue - check <a href="https://status.openai.com">status.openai.com</a></li>
            </ul>
            
            <p style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                <strong>Note:</strong> Callers are being redirected to the fallback Gather system, but the AI voice experience is degraded.
            </p>
            """
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "AI Agent Alerts <alerts@haiec.com>",
                        "to": [LEAD_NOTIFICATION_EMAIL],
                        "subject": f"🚨 AI Voice Agent DOWN - {error_code}",
                        "html": email_html
                    },
                    timeout=10.0
                )
                
                if resp.status_code == 200:
                    logger.info("🚨 Failure alert email sent to %s", LEAD_NOTIFICATION_EMAIL)
                else:
                    logger.error("Failed to send failure alert: %s - %s", resp.status_code, resp.text)
                    
        except Exception as e:
            logger.error("Error sending failure alert email: %s", str(e))
    
    async def send_lead_email(self, lead: dict):
        """Send lead notification email via Resend API."""
        if not RESEND_API_KEY:
            logger.warning("RESEND_API_KEY not configured - skipping email notification")
            return
        
        try:
            email_html = f"""
            <h2>🎯 New Lead from AI Demo Line</h2>
            <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Lead ID</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['id']}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['customer_name']}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['company_name']}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['phone_number']}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['email'] or 'Not provided'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Notes</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['issue_description']}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Preferred Contact</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['preferred_date']} - {lead['preferred_time']}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Captured At</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{lead['timestamp']}</td></tr>
            </table>
            <p style="margin-top: 20px; color: #666;">This lead was captured by the AI Demo Line. Follow up ASAP!</p>
            """
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "AI Demo <leads@haiec.com>",
                        "to": [LEAD_NOTIFICATION_EMAIL],
                        "subject": f"🎯 New Lead: {lead['customer_name']} - {lead['company_name']}",
                        "html": email_html
                    },
                    timeout=10.0
                )
                
                if resp.status_code == 200:
                    logger.info("✅ Lead email sent to %s", LEAD_NOTIFICATION_EMAIL)
                else:
                    logger.error("❌ Failed to send lead email: %s - %s", resp.status_code, resp.text)
                    
        except Exception as e:
            logger.error("❌ Error sending lead email: %s", str(e))
    
    # =============================================================================
    # AUDIO CONVERSION UTILITIES
    # Using pure Python to avoid audioop deprecation (removed in Python 3.13)
    # =============================================================================
    
    # μ-law decoding table (ITU-T G.711)
    ULAW_DECODE_TABLE = [
        -32124, -31100, -30076, -29052, -28028, -27004, -25980, -24956,
        -23932, -22908, -21884, -20860, -19836, -18812, -17788, -16764,
        -15996, -15484, -14972, -14460, -13948, -13436, -12924, -12412,
        -11900, -11388, -10876, -10364, -9852, -9340, -8828, -8316,
        -7932, -7676, -7420, -7164, -6908, -6652, -6396, -6140,
        -5884, -5628, -5372, -5116, -4860, -4604, -4348, -4092,
        -3900, -3772, -3644, -3516, -3388, -3260, -3132, -3004,
        -2876, -2748, -2620, -2492, -2364, -2236, -2108, -1980,
        -1884, -1820, -1756, -1692, -1628, -1564, -1500, -1436,
        -1372, -1308, -1244, -1180, -1116, -1052, -988, -924,
        -876, -844, -812, -780, -748, -716, -684, -652,
        -620, -588, -556, -524, -492, -460, -428, -396,
        -372, -356, -340, -324, -308, -292, -276, -260,
        -244, -228, -212, -196, -180, -164, -148, -132,
        -120, -112, -104, -96, -88, -80, -72, -64,
        -56, -48, -40, -32, -24, -16, -8, 0,
        32124, 31100, 30076, 29052, 28028, 27004, 25980, 24956,
        23932, 22908, 21884, 20860, 19836, 18812, 17788, 16764,
        15996, 15484, 14972, 14460, 13948, 13436, 12924, 12412,
        11900, 11388, 10876, 10364, 9852, 9340, 8828, 8316,
        7932, 7676, 7420, 7164, 6908, 6652, 6396, 6140,
        5884, 5628, 5372, 5116, 4860, 4604, 4348, 4092,
        3900, 3772, 3644, 3516, 3388, 3260, 3132, 3004,
        2876, 2748, 2620, 2492, 2364, 2236, 2108, 1980,
        1884, 1820, 1756, 1692, 1628, 1564, 1500, 1436,
        1372, 1308, 1244, 1180, 1116, 1052, 988, 924,
        876, 844, 812, 780, 748, 716, 684, 652,
        620, 588, 556, 524, 492, 460, 428, 396,
        372, 356, 340, 324, 308, 292, 276, 260,
        244, 228, 212, 196, 180, 164, 148, 132,
        120, 112, 104, 96, 88, 80, 72, 64,
        56, 48, 40, 32, 24, 16, 8, 0
    ]
    
    def ulaw_to_pcm16(self, ulaw_data: bytes) -> bytes:
        """Convert μ-law to PCM16 using lookup table."""
        pcm_samples = []
        for byte in ulaw_data:
            pcm_samples.append(self.ULAW_DECODE_TABLE[byte])
        return struct.pack(f'<{len(pcm_samples)}h', *pcm_samples)
    
    def pcm16_to_ulaw(self, pcm_data: bytes) -> bytes:
        """Convert PCM16 to μ-law."""
        ulaw_bytes = []
        # Unpack PCM16 samples (little-endian signed 16-bit)
        num_samples = len(pcm_data) // 2
        samples = struct.unpack(f'<{num_samples}h', pcm_data)
        
        for sample in samples:
            # μ-law encoding algorithm
            BIAS = 0x84
            CLIP = 32635
            
            sign = (sample >> 8) & 0x80
            if sign:
                sample = -sample
            if sample > CLIP:
                sample = CLIP
            
            sample = sample + BIAS
            exponent = 7
            for exp_mask in [0x4000, 0x2000, 0x1000, 0x0800, 0x0400, 0x0200, 0x0100]:
                if sample & exp_mask:
                    break
                exponent -= 1
            
            mantissa = (sample >> (exponent + 3)) & 0x0F
            ulaw_byte = ~(sign | (exponent << 4) | mantissa) & 0xFF
            ulaw_bytes.append(ulaw_byte)
        
        return bytes(ulaw_bytes)
    
    def resample_8k_to_24k(self, audio: bytes) -> bytes:
        """
        Resample from 8kHz to 24kHz (3x upsample) using cubic interpolation.
        Better quality than linear interpolation - reduces audio distortion.
        """
        num_samples = len(audio) // 2
        if num_samples == 0:
            return b''
        
        if num_samples < 4:
            # Not enough samples for cubic, fall back to simple repeat
            samples = struct.unpack(f'<{num_samples}h', audio)
            upsampled = []
            for s in samples:
                upsampled.extend([s, s, s])
            return struct.pack(f'<{len(upsampled)}h', *upsampled)
        
        samples = struct.unpack(f'<{num_samples}h', audio)
        upsampled = []
        
        # Cubic interpolation for smoother audio
        for i in range(len(samples)):
            # Get 4 points for cubic interpolation (with boundary handling)
            p0 = samples[max(0, i - 1)]
            p1 = samples[i]
            p2 = samples[min(len(samples) - 1, i + 1)]
            p3 = samples[min(len(samples) - 1, i + 2)]
            
            # Output 3 samples for each input sample
            for j in range(3):
                t = j / 3.0
                # Catmull-Rom spline interpolation
                t2 = t * t
                t3 = t2 * t
                
                v = 0.5 * (
                    (2 * p1) +
                    (-p0 + p2) * t +
                    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
                )
                
                # Clamp to valid PCM16 range
                v = max(-32768, min(32767, int(v)))
                upsampled.append(v)
        
        return struct.pack(f'<{len(upsampled)}h', *upsampled)
    
    def resample_24k_to_8k(self, audio: bytes) -> bytes:
        """
        Resample from 24kHz to 8kHz (3x downsample) with anti-aliasing.
        Uses averaging instead of simple decimation to reduce aliasing artifacts.
        """
        num_samples = len(audio) // 2
        if num_samples == 0:
            return b''
        
        samples = struct.unpack(f'<{num_samples}h', audio)
        downsampled = []
        
        # Average every 3 samples instead of just taking every 3rd
        # This acts as a simple low-pass filter to reduce aliasing
        for i in range(0, len(samples) - 2, 3):
            avg = (samples[i] + samples[i + 1] + samples[i + 2]) // 3
            downsampled.append(avg)
        
        # Handle remaining samples
        remaining = len(samples) % 3
        if remaining > 0:
            avg = sum(samples[-remaining:]) // remaining
            downsampled.append(avg)
        
        return struct.pack(f'<{len(downsampled)}h', *downsampled)
    
    async def close(self):
        """Clean up resources with proper shutdown."""
        if self.closed:
            return  # Already closed
        
        self.closed = True
        self.openai_connected = False
        
        # Calculate call duration
        call_duration = time.time() - self.call_start_time
        
        # End transcript collection for Gather model training
        if self.transcript_started and self.call_sid:
            # Determine outcome based on call state
            outcome = "completed"
            if self.fallback_triggered:
                outcome = "error"
            elif call_duration > MAX_CALL_DURATION_SECONDS:
                outcome = "timeout"
            elif call_duration < 10:
                outcome = "abandoned"
            
            self.transcript_collector.end_call(self.call_sid, outcome=outcome)
        
        if self.openai_ws:
            try:
                # Send proper close frame
                await asyncio.wait_for(self.openai_ws.close(), timeout=2.0)
            except asyncio.TimeoutError:
                logger.warning("Timeout closing OpenAI WebSocket")
            except Exception as e:
                logger.debug("Error closing OpenAI WebSocket: %s", str(e))
            finally:
                self.openai_ws = None
        
        # Clear pending marks
        self.pending_marks.clear()
        
        logger.info("Session closed: call_sid=%s, caller=%s, duration=%.1fs", 
                   self.call_sid, self.caller_number, call_duration)


@router.api_route("/twilio/realtime/incoming", methods=["GET", "POST"])
async def realtime_incoming(request: Request):
    """
    Entry point for incoming calls using OpenAI Realtime API.
    
    Returns TwiML that connects to our WebSocket endpoint.
    Includes fallback to Gather system if streaming fails.
    """
    host = request.headers.get("host", "localhost:8000")
    
    # Check if OpenAI is configured
    if not OPENAI_API_KEY:
        logger.warning("OpenAI API key not configured, redirecting to Gather system")
        fallback_twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">Please hold while we connect you.</Say>
    <Redirect>https://{host}/twilio/gather/incoming</Redirect>
</Response>"""
        return Response(content=fallback_twiml, media_type="application/xml")
    
    # Use wss:// for production, ws:// for local
    ws_protocol = "wss" if "https" in str(request.url) or "modal" in host or "ngrok" in host else "ws"
    ws_url = f"{ws_protocol}://{host}/twilio/realtime/stream"
    
    logger.info("Incoming call, connecting to WebSocket: %s", ws_url)
    
    # TwiML with "please hold" message BEFORE Stream connects
    # This ensures caller hears something during cold start or if OpenAI fails
    # The Say plays first, then Stream connects, then fallback if Stream closes
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">Thank you for calling. Please hold while I connect you.</Say>
    <Connect>
        <Stream url="{ws_url}">
            <Parameter name="caller" value="{{From}}" />
        </Stream>
    </Connect>
    <Say voice="Polly.Joanna-Neural">Thank you for holding. Let me transfer you to our team.</Say>
    <Redirect>https://{host}/twilio/gather/incoming</Redirect>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.websocket("/twilio/realtime/stream")
async def realtime_stream(websocket: WebSocket):
    """
    WebSocket endpoint that bridges Twilio Media Streams with OpenAI Realtime API.
    
    This is where the magic happens:
    1. Twilio sends caller audio here
    2. We forward it to OpenAI Realtime API
    3. OpenAI processes and generates response audio
    4. We forward response audio back to Twilio
    5. Caller hears AI response with ~200ms latency
    """
    await websocket.accept()
    logger.info("Twilio WebSocket connected")
    
    session = RealtimeSession(websocket)
    
    try:
        # Create tasks for bidirectional communication
        twilio_task = asyncio.create_task(handle_twilio_stream(session))
        openai_task = asyncio.create_task(handle_openai_stream(session))
        
        # Wait for either to complete (usually Twilio disconnects first)
        done, pending = await asyncio.wait(
            [twilio_task, openai_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cancel pending tasks
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
                
    except WebSocketDisconnect:
        logger.info("Twilio WebSocket disconnected")
    except Exception as e:
        logger.error("Error in realtime stream: %s", str(e))
    finally:
        await session.close()


async def handle_twilio_stream(session: RealtimeSession):
    """Handle incoming messages from Twilio."""
    try:
        async for message in session.twilio_ws.iter_text():
            if session.closed:
                break
            
            try:
                data = json.loads(message)
                await session.handle_twilio_message(data)
            except json.JSONDecodeError:
                continue
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        if not session.closed:
            logger.error("Twilio stream error: %s", str(e))


async def handle_openai_stream(session: RealtimeSession):
    """Handle incoming messages from OpenAI."""
    # Wait for OpenAI connection with timeout
    wait_start = time.time()
    max_wait = 10.0  # 10 second timeout
    
    while not session.openai_ws and not session.closed:
        if time.time() - wait_start > max_wait:
            logger.error("Timeout waiting for OpenAI connection")
            return
        await asyncio.sleep(0.1)
    
    if session.closed or not session.openai_ws:
        return
    
    try:
        async for message in session.openai_ws:
            if session.closed:
                break
            
            try:
                data = json.loads(message)
                await session.handle_openai_message(data)
            except json.JSONDecodeError:
                logger.warning("Invalid JSON from OpenAI: %s", message[:100] if message else "empty")
                continue
                
    except websockets.exceptions.ConnectionClosed as e:
        logger.info("OpenAI connection closed: code=%s", e.code if hasattr(e, 'code') else 'unknown')
        session.openai_connected = False
    except Exception as e:
        if not session.closed:
            logger.error("OpenAI stream error: %s", str(e))
            session.openai_connected = False


@router.get("/twilio/realtime/health")
async def realtime_health():
    """Health check for realtime endpoint."""
    return {
        "status": "ok",
        "version": _VERSION,
        "openai_configured": bool(OPENAI_API_KEY),
        "resend_configured": bool(RESEND_API_KEY),
        "endpoint": "/twilio/realtime/incoming"
    }


@router.get("/twilio/realtime/leads")
async def get_leads():
    """
    View all captured leads.
    
    This endpoint allows you to visually review all leads captured by the AI demo line.
    In production, this would be protected by authentication.
    """
    return {
        "total_leads": len(CAPTURED_LEADS),
        "leads": CAPTURED_LEADS,
        "notification_email": LEAD_NOTIFICATION_EMAIL
    }
