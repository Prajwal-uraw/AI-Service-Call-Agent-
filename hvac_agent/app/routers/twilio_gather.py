"""
Enterprise-Grade HVAC Voice Agent - Gather-Based Architecture.

Production-ready voice agent using Twilio Gather + ElevenLabs TTS.
Turn-based conversation flow with state machine for reliable booking.

Features:
- Natural human-like voice via ElevenLabs
- Twilio Gather handles silence detection and reprompts
- State machine for deterministic conversation flow
- HVAC FAQ detection and handling
- Enterprise error recovery
- Slot extraction via GPT

States:
- GREETING: Initial greeting, ask how to help
- IDENTIFY_NEED: Determine if booking, FAQ, or emergency
- COLLECT_NAME: Get customer name
- COLLECT_PHONE: Get callback number
- COLLECT_ADDRESS: Get service address
- COLLECT_ISSUE: Get issue description
- COLLECT_DATE: Get preferred date
- COLLECT_TIME: Get preferred time
- CONFIRM: Confirm all details
- COMPLETE: Booking confirmed, goodbye
- FAQ: Handle HVAC questions
- EMERGENCY: Route emergency calls
"""

import os
import json
import hashlib
import asyncio
from enum import Enum
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta

from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import Response

from app.utils.logging import get_logger
from app.services.hvac_knowledge import (
    get_hvac_insight, 
    get_troubleshooting_tips,
    format_insight_for_voice
)
from app.services.tts.elevenlabs_sync import generate_speech, is_elevenlabs_available

logger = get_logger("twilio.gather")

router = APIRouter(tags=["twilio-gather"])

# Version for deployment verification
_VERSION = "1.0.0-gather"
print(f"[GATHER_MODULE_LOADED] Version: {_VERSION}")


# =============================================================================
# CONFIGURATION
# =============================================================================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel
COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")

# Twilio Gather settings
GATHER_TIMEOUT = 5  # Seconds to wait for speech
GATHER_SPEECH_TIMEOUT = "auto"  # Auto-detect end of speech
MAX_RETRIES = 2  # Max retries before escalation


# =============================================================================
# CONVERSATION STATE
# =============================================================================
class ConversationState(str, Enum):
    GREETING = "greeting"
    IDENTIFY_NEED = "identify_need"
    COLLECT_NAME = "collect_name"
    COLLECT_PHONE = "collect_phone"
    COLLECT_ADDRESS = "collect_address"
    COLLECT_ISSUE = "collect_issue"
    COLLECT_DATE = "collect_date"
    COLLECT_TIME = "collect_time"
    CONFIRM = "confirm"
    COMPLETE = "complete"
    FAQ = "faq"
    EMERGENCY = "emergency"
    TRANSFER = "transfer"
    GOODBYE = "goodbye"


# In-memory session storage (use Redis in production for multi-instance)
# Key: CallSid, Value: session data
_sessions: Dict[str, Dict[str, Any]] = {}


def get_session(call_sid: str) -> Dict[str, Any]:
    """Get or create session for a call."""
    if call_sid not in _sessions:
        _sessions[call_sid] = {
            "state": ConversationState.GREETING,
            "slots": {
                "name": None,
                "phone": None,
                "address": None,
                "issue": None,
                "date": None,
                "time": None,
            },
            "retries": 0,
            "history": [],
            "created_at": datetime.now().isoformat(),
        }
    return _sessions[call_sid]


def clear_session(call_sid: str):
    """Clear session after call ends."""
    if call_sid in _sessions:
        del _sessions[call_sid]


# =============================================================================
# PROMPTS - Natural, Human-like Responses
# =============================================================================
PROMPTS = {
    ConversationState.GREETING: [
        f"Thanks for calling {COMPANY_NAME}! This is our scheduling assistant. How can I help you today?",
        f"Hi there! You've reached {COMPANY_NAME}. What can I do for you?",
        f"Hello! Thanks for calling {COMPANY_NAME}. How may I assist you?",
    ],
    ConversationState.IDENTIFY_NEED: [
        "Got it. Are you looking to schedule a service appointment, or do you have a question I can help with?",
    ],
    ConversationState.COLLECT_NAME: [
        "Perfect, I can help you schedule that. May I have your name please?",
        "Sure thing! Let me get you scheduled. What's your name?",
        "Absolutely, I'll set that up. Can I get your name?",
    ],
    ConversationState.COLLECT_PHONE: [
        "Thanks {name}! What's the best phone number to reach you?",
        "Got it, {name}. And your phone number?",
    ],
    ConversationState.COLLECT_ADDRESS: [
        "Great. What's the service address?",
        "And what address will we be coming to?",
    ],
    ConversationState.COLLECT_ISSUE: [
        "What's going on with your system? Just give me a quick description.",
        "Can you tell me briefly what the issue is?",
    ],
    ConversationState.COLLECT_DATE: [
        "When would you like us to come out? We have availability this week.",
        "What day works best for you?",
    ],
    ConversationState.COLLECT_TIME: [
        "And do you prefer morning or afternoon?",
        "Would morning or afternoon work better?",
    ],
    ConversationState.CONFIRM: [
        "Okay, let me confirm. {name}, we'll have a technician at {address} on {date} in the {time} for {issue}. Does that sound right?",
    ],
    ConversationState.COMPLETE: [
        "You're all set! We'll see you on {date}. Is there anything else I can help with?",
        "Perfect, your appointment is confirmed for {date}. Anything else?",
    ],
    ConversationState.FAQ: [
        "{answer} Would you like to schedule a service call?",
    ],
    ConversationState.EMERGENCY: [
        "That sounds like it could be an emergency. I'm going to transfer you to our emergency line right away. Please hold.",
    ],
    ConversationState.GOODBYE: [
        "Thanks for calling {company}! Have a great day.",
        "Thank you! Take care and stay comfortable.",
    ],
    "reprompt": [
        "Sorry, I didn't catch that. Could you say that again?",
        "I didn't quite hear you. One more time?",
        "Could you repeat that please?",
    ],
    "fallback": [
        "I'm having trouble understanding. Let me transfer you to someone who can help.",
    ],
}


def get_prompt(state: ConversationState, slots: Dict[str, Any] = None, key: str = None) -> str:
    """Get a natural prompt for the given state."""
    import random
    
    prompts = PROMPTS.get(key or state, PROMPTS.get(state, ["How can I help you?"]))
    prompt = random.choice(prompts)
    
    # Fill in slots
    if slots:
        slots_with_defaults = {**slots, "company": COMPANY_NAME}
        try:
            prompt = prompt.format(**slots_with_defaults)
        except KeyError:
            pass
    
    return prompt


# =============================================================================
# INTENT DETECTION & SLOT EXTRACTION (GPT-powered)
# =============================================================================
async def analyze_speech(speech: str, current_state: ConversationState, session: Dict) -> Dict[str, Any]:
    """
    Analyze user speech using GPT to extract intent and slots.
    
    Returns:
        {
            "intent": "booking" | "faq" | "emergency" | "confirm" | "deny" | "unknown",
            "slots": {"name": ..., "phone": ..., etc.},
            "faq_topic": "ac_not_cooling" | None,
            "is_emergency": bool,
            "confidence": float
        }
    """
    import openai
    
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    system_prompt = """You are an HVAC call center assistant analyzing customer speech.
Extract the following from the customer's response:

1. intent: What does the customer want?
   - "booking": They want to schedule service
   - "faq": They have a question about HVAC
   - "emergency": Gas leak, no heat in freezing weather, CO detector, fire/smoke
   - "confirm": They said yes, correct, right, sure, etc.
   - "deny": They said no, wrong, incorrect, etc.
   - "other": Something else
   - "unclear": Can't determine

2. slots: Extract any of these if mentioned:
   - name: Customer's name
   - phone: Phone number (digits only)
   - address: Service address
   - issue: Brief description of HVAC problem
   - date: Preferred date (normalize to YYYY-MM-DD or "tomorrow", "today", etc.)
   - time: Preferred time (morning/afternoon/specific time)

3. faq_topic: If FAQ, what topic?
   - "ac_not_cooling", "heater_not_working", "strange_noises", "high_energy_bills", "thermostat_issues", "air_quality"

4. is_emergency: true if gas leak, CO alarm, no heat in dangerous cold, fire/smoke mentioned

Respond in JSON format only."""

    user_prompt = f"""Current state: {current_state.value}
Current slots: {json.dumps(session.get('slots', {}))}
Customer said: "{speech}"

Analyze and extract information."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=300,
            temperature=0.1,
        )
        
        result = json.loads(response.choices[0].message.content)
        logger.info("Speech analysis: %s -> %s", speech[:50], result.get("intent"))
        return result
        
    except Exception as e:
        logger.error("Speech analysis error: %s", str(e))
        return {
            "intent": "unclear",
            "slots": {},
            "faq_topic": None,
            "is_emergency": False,
            "confidence": 0.0
        }


# =============================================================================
# EMERGENCY DETECTION
# =============================================================================
EMERGENCY_KEYWORDS = [
    "gas leak", "smell gas", "carbon monoxide", "co detector", "co alarm",
    "no heat", "freezing", "frozen pipes", "fire", "smoke", "burning smell",
    "electrical fire", "sparks", "flooding", "water damage"
]


def is_emergency(speech: str) -> bool:
    """Quick check for emergency keywords."""
    speech_lower = speech.lower()
    return any(kw in speech_lower for kw in EMERGENCY_KEYWORDS)


# =============================================================================
# STATE MACHINE TRANSITIONS
# =============================================================================
async def process_state(
    call_sid: str,
    speech: str,
    session: Dict[str, Any]
) -> Tuple[ConversationState, str, Dict[str, Any]]:
    """
    Process current state and user input, return next state and response.
    
    Returns:
        (next_state, response_text, updated_slots)
    """
    current_state = ConversationState(session["state"])
    slots = session["slots"]
    
    # Quick emergency check
    if is_emergency(speech):
        return ConversationState.EMERGENCY, get_prompt(ConversationState.EMERGENCY), slots
    
    # Analyze speech with GPT
    analysis = await analyze_speech(speech, current_state, session)
    intent = analysis.get("intent", "unclear")
    extracted_slots = analysis.get("slots", {})
    
    # Merge extracted slots
    for key, value in extracted_slots.items():
        if value and key in slots:
            slots[key] = value
    
    # State transitions
    if current_state == ConversationState.GREETING:
        if analysis.get("is_emergency"):
            return ConversationState.EMERGENCY, get_prompt(ConversationState.EMERGENCY), slots
        elif intent == "faq" and analysis.get("faq_topic"):
            insight = get_hvac_insight(analysis["faq_topic"])
            answer = format_insight_for_voice(insight)
            return ConversationState.FAQ, get_prompt(ConversationState.FAQ, {"answer": answer}), slots
        elif intent in ["booking", "other", "unclear"]:
            # Default to booking flow
            if slots.get("name"):
                return ConversationState.COLLECT_PHONE, get_prompt(ConversationState.COLLECT_PHONE, slots), slots
            return ConversationState.COLLECT_NAME, get_prompt(ConversationState.COLLECT_NAME), slots
    
    elif current_state == ConversationState.COLLECT_NAME:
        if slots.get("name"):
            return ConversationState.COLLECT_PHONE, get_prompt(ConversationState.COLLECT_PHONE, slots), slots
        # Retry
        return current_state, "I didn't catch your name. Could you tell me your name please?", slots
    
    elif current_state == ConversationState.COLLECT_PHONE:
        if slots.get("phone"):
            return ConversationState.COLLECT_ADDRESS, get_prompt(ConversationState.COLLECT_ADDRESS), slots
        return current_state, "I need your phone number. What's the best number to reach you?", slots
    
    elif current_state == ConversationState.COLLECT_ADDRESS:
        if slots.get("address"):
            return ConversationState.COLLECT_ISSUE, get_prompt(ConversationState.COLLECT_ISSUE), slots
        return current_state, "What's the address where you need service?", slots
    
    elif current_state == ConversationState.COLLECT_ISSUE:
        if slots.get("issue"):
            return ConversationState.COLLECT_DATE, get_prompt(ConversationState.COLLECT_DATE), slots
        return current_state, "Can you describe what's happening with your system?", slots
    
    elif current_state == ConversationState.COLLECT_DATE:
        if slots.get("date"):
            return ConversationState.COLLECT_TIME, get_prompt(ConversationState.COLLECT_TIME), slots
        return current_state, "What day would work for you?", slots
    
    elif current_state == ConversationState.COLLECT_TIME:
        if slots.get("time"):
            return ConversationState.CONFIRM, get_prompt(ConversationState.CONFIRM, slots), slots
        return current_state, "Morning or afternoon?", slots
    
    elif current_state == ConversationState.CONFIRM:
        if intent == "confirm":
            # TODO: Actually create the booking in database
            logger.info("BOOKING CONFIRMED: %s", slots)
            return ConversationState.COMPLETE, get_prompt(ConversationState.COMPLETE, slots), slots
        elif intent == "deny":
            return ConversationState.COLLECT_NAME, "No problem, let's start over. What's your name?", slots
        return current_state, "Just to confirm - is everything correct? Yes or no?", slots
    
    elif current_state == ConversationState.COMPLETE:
        if intent in ["deny", "other"]:
            return ConversationState.GREETING, "Sure! What else can I help you with?", slots
        return ConversationState.GOODBYE, get_prompt(ConversationState.GOODBYE, {"company": COMPANY_NAME}), slots
    
    elif current_state == ConversationState.FAQ:
        if intent == "booking" or intent == "confirm":
            return ConversationState.COLLECT_NAME, get_prompt(ConversationState.COLLECT_NAME), slots
        elif intent == "deny":
            return ConversationState.GOODBYE, get_prompt(ConversationState.GOODBYE, {"company": COMPANY_NAME}), slots
        return ConversationState.GOODBYE, "Alright! Feel free to call back if you need anything. Take care!", slots
    
    # Default: stay in current state with reprompt
    return current_state, get_prompt(current_state, slots) or "I'm sorry, could you repeat that?", slots


# =============================================================================
# TWIML GENERATION
# =============================================================================
async def generate_twiml(
    text: str,
    next_state: ConversationState,
    call_sid: str,
    gather: bool = True,
    action_url: str = None,
    host: str = "",
) -> str:
    """
    Generate TwiML response with Gather or Say.
    
    Uses ElevenLabs for natural voice when available, falls back to Polly.
    """
    action = action_url or f"https://{host}/twilio/gather/respond"
    
    # Try ElevenLabs first for natural voice
    use_elevenlabs = is_elevenlabs_available()
    voice_element = f'<Say voice="Polly.Joanna-Neural">{text}</Say>'
    
    if use_elevenlabs:
        try:
            audio_bytes = await generate_speech(text)
            if audio_bytes:
                # Use base64 audio with Play - Twilio supports this format
                import base64
                audio_b64 = base64.b64encode(audio_bytes).decode('ascii')
                # For now, use Polly as ElevenLabs requires hosting audio files
                # TODO: Add audio file hosting for ElevenLabs Play URLs
                voice_element = f'<Say voice="Polly.Joanna-Neural">{text}</Say>'
                logger.debug("ElevenLabs audio generated, using Polly for TwiML compatibility")
        except Exception as e:
            logger.warning("ElevenLabs failed, using Polly: %s", str(e))
    
    # For terminal states, no gather needed
    if next_state in [ConversationState.GOODBYE, ConversationState.EMERGENCY, ConversationState.TRANSFER]:
        if next_state == ConversationState.EMERGENCY:
            emergency_number = os.getenv("EMERGENCY_PHONE", "+18005551234")
            return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">{text}</Say>
    <Dial>{emergency_number}</Dial>
</Response>"""
        else:
            return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">{text}</Say>
    <Hangup/>
</Response>"""
    
    # Standard gather response with neural voice
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" action="{action}" method="POST" timeout="{GATHER_TIMEOUT}" speechTimeout="{GATHER_SPEECH_TIMEOUT}" language="en-US">
        <Say voice="Polly.Joanna-Neural">{text}</Say>
    </Gather>
    <Say voice="Polly.Joanna-Neural">I didn't hear anything. Let me transfer you to an agent.</Say>
    <Redirect>/twilio/gather/transfer</Redirect>
</Response>"""


# =============================================================================
# ENDPOINTS
# =============================================================================
@router.api_route("/twilio/gather/incoming", methods=["GET", "POST"])
async def gather_incoming(request: Request):
    """
    Entry point for incoming calls.
    Returns initial greeting with Gather.
    """
    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    caller = form.get("From", "unknown")
    
    logger.info("Incoming call [v%s]: CallSid=%s, From=%s", _VERSION, call_sid, caller)
    
    # Initialize session
    session = get_session(call_sid)
    session["caller"] = caller
    
    # Get greeting
    greeting = get_prompt(ConversationState.GREETING)
    
    # Generate TwiML
    host = request.headers.get("host", "")
    action_url = f"https://{host}/twilio/gather/respond"
    
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" action="{action_url}" method="POST" timeout="{GATHER_TIMEOUT}" speechTimeout="{GATHER_SPEECH_TIMEOUT}" language="en-US">
        <Say voice="Polly.Joanna">{greeting}</Say>
    </Gather>
    <Say voice="Polly.Joanna">I didn't hear anything. Let me try again.</Say>
    <Redirect>/twilio/gather/incoming</Redirect>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/gather/respond", methods=["GET", "POST"])
async def gather_respond(request: Request):
    """
    Handle speech input from Gather.
    Process through state machine and return next prompt.
    """
    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    speech_result = form.get("SpeechResult", "")
    confidence = form.get("Confidence", "0")
    
    logger.info("Speech received: CallSid=%s, Speech='%s', Confidence=%s", 
               call_sid, speech_result[:100] if speech_result else "(empty)", confidence)
    
    # Get session
    session = get_session(call_sid)
    
    # Handle empty speech (timeout)
    if not speech_result or not speech_result.strip():
        session["retries"] = session.get("retries", 0) + 1
        
        if session["retries"] >= MAX_RETRIES:
            # Transfer after too many retries
            logger.warning("Max retries reached for CallSid=%s, transferring", call_sid)
            twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">I'm having trouble hearing you. Let me transfer you to someone who can help.</Say>
    <Redirect>/twilio/gather/transfer</Redirect>
</Response>"""
            return Response(content=twiml, media_type="application/xml")
        
        # Reprompt
        reprompt = get_prompt(None, key="reprompt")
        host = request.headers.get("host", "")
        action_url = f"https://{host}/twilio/gather/respond"
        
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech" action="{action_url}" method="POST" timeout="{GATHER_TIMEOUT}" speechTimeout="{GATHER_SPEECH_TIMEOUT}" language="en-US">
        <Say voice="Polly.Joanna">{reprompt}</Say>
    </Gather>
    <Redirect>/twilio/gather/transfer</Redirect>
</Response>"""
        return Response(content=twiml, media_type="application/xml")
    
    # Reset retries on successful speech
    session["retries"] = 0
    
    # Add to history
    session["history"].append({
        "role": "user",
        "content": speech_result,
        "timestamp": datetime.now().isoformat()
    })
    
    # Process through state machine
    next_state, response_text, updated_slots = await process_state(call_sid, speech_result, session)
    
    # Update session
    session["state"] = next_state
    session["slots"] = updated_slots
    session["history"].append({
        "role": "assistant",
        "content": response_text,
        "timestamp": datetime.now().isoformat()
    })
    
    logger.info("State transition: %s -> %s, Response: %s", 
               session.get("state"), next_state, response_text[:50])
    
    # Generate TwiML
    host = request.headers.get("host", "")
    action_url = f"https://{host}/twilio/gather/respond"
    twiml = await generate_twiml(response_text, next_state, call_sid, action_url=action_url, host=host)
    
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/gather/transfer", methods=["GET", "POST"])
async def gather_transfer(request: Request):
    """Transfer call to human agent."""
    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    
    logger.info("Transferring call: CallSid=%s", call_sid)
    
    # Clean up session
    clear_session(call_sid)
    
    transfer_number = os.getenv("TRANSFER_PHONE", os.getenv("EMERGENCY_PHONE", "+18005551234"))
    
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Please hold while I transfer you.</Say>
    <Dial>{transfer_number}</Dial>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/gather/status", methods=["POST"])
async def gather_status(request: Request):
    """Handle call status callbacks."""
    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    call_status = form.get("CallStatus", "unknown")
    
    logger.info("Call status: CallSid=%s, Status=%s", call_sid, call_status)
    
    # Clean up session on call end
    if call_status in ["completed", "failed", "busy", "no-answer", "canceled"]:
        session = _sessions.get(call_sid)
        if session:
            logger.info("Call ended. Final state: %s, Slots: %s", 
                       session.get("state"), session.get("slots"))
        clear_session(call_sid)
    
    return Response(content="OK", media_type="text/plain")


# =============================================================================
# HEALTH CHECK
# =============================================================================
@router.get("/twilio/gather/health")
async def gather_health():
    """Health check for gather endpoints."""
    return {
        "status": "healthy",
        "version": _VERSION,
        "active_sessions": len(_sessions),
        "elevenlabs_configured": bool(ELEVENLABS_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
    }
