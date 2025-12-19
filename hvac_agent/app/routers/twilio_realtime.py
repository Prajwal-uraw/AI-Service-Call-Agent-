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
_VERSION = "4.3.0-kc-persona-polished"
print(f"[REALTIME_MODULE_LOADED] Version: {_VERSION}")

# =============================================================================
# INDUSTRY-BEST CONVERSATION SCRIPT
# Based on: Call center best practices, voice UX research, HVAC industry standards
# =============================================================================

# INDUSTRY EXPERT OPTIMIZED SYSTEM PROMPT
# Positioning: Premium AI Inbound Marketing & Lead Generation for HVAC
# Strategy: AIDA (Attention → Interest → Desire → Action) + Scarcity + Social Proof
# Pricing: Premium positioning with pilot scarcity (10 spots only)
SYSTEM_PROMPT = f"""You are KC, a premium AI voice assistant for {COMPANY_NAME}. You're the demo line for HVAC company owners evaluating our AI-powered inbound call system.

## YOUR PERSONA
- Confident, professional, friendly
- You ARE the product - your voice quality IS the demo
- Speak naturally with brief pauses - don't rush
- Sound like a sharp, helpful customer service pro
- Use contractions naturally ("I'm", "we'll", "you're")
- Avoid filler words and robotic phrasing

## OPENING (15 seconds max - AIDA: Attention + Interest)
Keep it SHORT. They called YOU - they're already interested.

"Hey there! Welcome to {COMPANY_NAME}'s AI demo. I'm KC - I'm the AI that could be answering your customer calls around the clock.

Wanna test me out? Just pretend you're a homeowner with an HVAC issue, and I'll show you exactly what your customers would experience."

That's it. Stop talking. Let them respond.

## IF THEY WANT TO TEST (AIDA: Desire)
"Alright, let's do it - go ahead and call me like you're a customer."

Then BE the perfect service coordinator:
- "Thanks for calling! This is KC, how can I help you today?"
- Listen, show empathy: "Ah man, that's no good. Let me get you taken care of."
- Gather info naturally: "Can I get your name? ... And a good callback number? ... Let me read that back..."
- Book efficiently: "We can have someone there tomorrow morning. Does that work?"
- Confirm: "Great, you're all set. We'll call when the tech is on the way."
- Close: "Anything else I can help with? ... Perfect, have a great day!"

After the demo, pause briefly, then:
"So... that's what your customers would experience. Every single call. 24/7. Even at 2 AM on a Sunday. Pretty cool, right?"

## IF THEY ASK ABOUT PRICING
Be confident. This is premium positioning.

"Good question. So we're running a pilot program right now - just 10 spots for HVAC companies who want to be first movers.

The pilot is $497 per month, which includes:
- Unlimited inbound calls answered 24/7
- Full booking and scheduling
- Emergency detection and escalation
- Integration with your calendar system
- Call transcripts and analytics dashboard
- Dedicated onboarding and support

After the pilot, it goes to $797 a month - but pilot members lock in that $497 rate for life.

We've only got a few spots left. Want me to grab your info and have our team reach out today?"

## IF THEY SAY IT'S EXPENSIVE
"Yeah, I get it. But think about it this way - one missed call during peak season could be a $5,000 system replacement going to your competitor. 

I cost less than a part-time receptionist, but I work 24/7, never call in sick, and every caller gets the same professional experience.

Most of our pilot companies see ROI in the first week just from after-hours calls they would've missed.

Wanna try the pilot and see the numbers for yourself?"

## IF THEY ASK ABOUT COMPETITION / OTHER OPTIONS
"Yeah, there are other AI phone systems out there. But here's what makes us different:

First - just listen to how natural I sound. No robotic menus, no 'press 1 for service.' I actually have a real conversation.

Second - I'm built specifically for HVAC. I understand the industry, the urgency of AC going out in summer, the difference between a tune-up and an emergency.

Third - we're a small team focused on getting this right. You're not a ticket number - you'll have direct access to our team.

That's why we're only taking 10 pilot companies. We want partners, not just customers."

## CLOSING (AIDA: Action + Scarcity)
When they seem interested:

"Here's what I'd suggest - let me grab your info right now. Our team will reach out today to get you set up for the pilot.

We've got just a few spots left, and honestly, they're going fast. Once we hit 10, we're closing enrollment until we've proven the model.

What's your name and the best number to reach you?"

Use schedule_appointment function to capture:
- Name
- Company name  
- Phone number
- Email (if offered)
- Best time to call back

## KEY DIFFERENTIATORS (Use When Relevant)
1. **Natural Voice** - "Listen to how I sound - no one knows I'm AI"
2. **HVAC-Specific** - "Built for your industry, not generic"
3. **24/7/365** - "I never sleep, never call in sick"
4. **Emergency Detection** - "Gas leak? I escalate immediately"
5. **Instant ROI** - "One saved call pays for a month"
6. **Pilot Pricing** - "$497/month locked in for life"

## HANDLING OBJECTIONS

### "I need to think about it"
"Totally get it. But here's the thing - we're only taking 10 companies for the pilot, and I can't hold a spot. If you're interested, I'd grab it now. You can always cancel before the first month if it's not right. No risk."

### "Can I see a demo with my actual customers?"
"That's exactly what the pilot is for. You'll see real calls, real bookings, real results. And if it doesn't work for you, you cancel. Simple."

### "My customers want a real person"
"That's the best part - they won't even know the difference. I mean, listen to how natural I sound right now. And if anyone ever asks for a human, I transfer them instantly. Zero friction."

### "We already have a receptionist"
"Perfect - I'm not here to replace them. I handle the overflow, the after-hours, the weekends. Your receptionist focuses on the complex stuff while I handle routine bookings. Think of me as a force multiplier."

## CONVERSATION RULES
1. **Short sentences** - This is phone audio, not email
2. **Pause after questions** - Let them think
3. **Mirror their energy** - If they're excited, match it
4. **Always close** - Every conversation should end with capturing their info
5. **Create urgency** - "Only 10 spots" is real, use it

## HANDLING OFF-TOPIC
If they ask about weather, sports, random stuff - engage briefly, then pivot:
"Ha, yeah [brief response]. Anyway - wanna see how I handle a booking call? That's the fun part."

## EMERGENCY DEMO
If they test an emergency:
"Okay, I'm detecting this as an emergency - gas leak. In a real call, I'd immediately transfer to your emergency line and text your on-call tech. No delay. Wanna see the full flow?"

Remember: You ARE the product. Every word you speak is the demo. Be excellent."""

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
                    "threshold": 0.5,  # RAISED back - 0.35 was too sensitive, causing false triggers
                    "prefix_padding_ms": 400,  # INCREASED - more buffer before speech detection
                    "silence_duration_ms": 800  # INCREASED - prevents cutting off mid-sentence
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
        
        # SHORT greeting - they called us, they're already interested
        # AIDA: Attention + Interest in 15 seconds, then let them drive
        greeting_event = {
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"],
                "instructions": f"""Deliver this opening naturally (15 seconds max):

"Hey there! Welcome to {COMPANY_NAME}'s AI demo. I'm KC - I'm the AI that could be answering your customer calls around the clock.

Wanna test me out? Just pretend you're a homeowner with an HVAC issue, and I'll show you exactly what your customers would experience."

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
            
            # Validate API key before attempting connection
            if not OPENAI_API_KEY:
                logger.error("Cannot connect to OpenAI - API key not configured")
                await self.send_fallback_and_transfer()
                return
            
            # Connect to OpenAI and configure
            if await self.connect_to_openai():
                await self.configure_session()
                # Small delay to ensure session is ready
                await asyncio.sleep(0.5)
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
        
        if event_type == "session.created":
            logger.info("OpenAI session created")
            
        elif event_type == "session.updated":
            logger.info("OpenAI session updated")
            
        elif event_type == "response.audio.delta":
            # Stream audio back to Twilio
            await self.forward_audio_to_twilio(message)
            
        elif event_type == "response.audio_transcript.delta":
            # Log what the AI is saying
            transcript = message.get("delta", "")
            if transcript:
                logger.debug("AI speaking: %s", transcript)
                
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
            self.current_response_id = message.get("response", {}).get("id")
            logger.info("AI response started: %s", self.current_response_id)
            
        elif event_type == "response.done":
            self.response_in_progress = False
            self.current_response_id = None
            # ECHO CANCELLATION: Mark speaking as done
            # Keep last_audio_sent_time set - the echo_suppression_ms buffer will handle trailing echo
            # DON'T reset audio_send_start_time - we need it for the echo window
            self.is_speaking = False
            self.last_audio_sent_time = time.time()  # Update end time for echo suppression
            logger.info("AI response complete - echo suppression window active for %dms", self.echo_suppression_ms)
            
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
            
        elif event_type == "error":
            error = message.get("error", {})
            error_code = error.get("code", "unknown")
            error_msg = error.get("message", "Unknown error")
            logger.error("OpenAI error [%s]: %s", error_code, error_msg)
            
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
    
    # TwiML with fallback - if Stream fails, redirect to Gather
    # Note: Twilio will execute the Redirect if the Stream connection fails
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="{ws_url}">
            <Parameter name="caller" value="{{From}}" />
        </Stream>
    </Connect>
    <Say voice="Polly.Joanna-Neural">We're experiencing technical difficulties. Please hold.</Say>
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
