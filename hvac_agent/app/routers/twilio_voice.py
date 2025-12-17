"""
Twilio Voice webhook handler for turn-based voice conversations.

Handles:
- Incoming call webhooks
- Speech recognition results
- TwiML response generation
- Call state management
- Emergency routing
"""

import asyncio
import random
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, Form, Depends, Request, BackgroundTasks
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.agents import CallState, call_state_store, run_agent
from app.services.db import get_db
from app.services.emergency_service import detect_emergency, get_emergency_contact
from app.utils.logging import get_logger, log_call_event
from app.utils.voice_config import get_voice_config, VoiceTone
from app.utils.error_handler import handle_error, get_user_friendly_error
# detect_booking_intent removed - not used
from app.utils.texas_persona import (
    get_greeting,
    get_goodbye,
    get_quick_response_texas,
    get_clarification,
    get_empathy_response,
    personalize_response,
)
from app.utils.human_tricks import (
    get_micro_ack,
    get_thinking_filler,
    get_silence_response,
    get_human_exit,
    humanize_response,
    should_confirm_intent,
    get_personality,
    cleanup_personality,
)
from app.utils.call_control import (
    is_speech_too_long,
    is_multi_topic,
    get_interruption_response,
    shorten_response,
    remove_follow_up_questions,
    BookingStage,
)

router = APIRouter(tags=["twilio-voice"])
logger = get_logger("twilio.voice")

# Thread pool for running agent in background
_executor = ThreadPoolExecutor(max_workers=10)

# Dispatcher-style filler phrases - calm, professional
FILLER_PHRASES = [
    "One moment.",
    "Let me check.",
    "Checking now.",
    "One second.",
]

# Booking-oriented fillers - dispatcher style
BOOKING_FILLERS = [
    "Checking the schedule.",
    "Let me see what's available.",
    "One moment.",
]

# Voice configuration - using neural voices for better quality
DEFAULT_VOICE = get_voice_config(VoiceTone.FRIENDLY)  # Polly.Joanna (Neural)
EMERGENCY_VOICE = get_voice_config(VoiceTone.URGENT)  # Polly.Matthew (Neural)
EMPATHETIC_VOICE = get_voice_config(VoiceTone.EMPATHETIC)  # Polly.Ruth (Neural)


def _escape_xml(text: str) -> str:
    """Escape special XML characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def _twiml_say_and_gather(
    message: str,
    voice: str = "Polly.Kendra",
    hints: Optional[str] = None,
    timeout: int = 5,
    speech_timeout: str = "auto",
    barge_in: bool = True,
) -> str:
    """
    Generate TwiML for saying a message and gathering speech input.
    
    Args:
        message: Message to speak
        voice: Twilio voice to use
        hints: Speech recognition hints
        timeout: Silence timeout in seconds before giving up
        speech_timeout: Speech timeout ("auto" recommended)
        barge_in: Allow caller to interrupt agent speech
        
    Returns:
        TwiML XML string
    """
    message = _escape_xml(message)
    hints_attr = f'hints="{hints}"' if hints else ""
    barge_in_attr = "true" if barge_in else "false"
    
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech"
            speechTimeout="{speech_timeout}"
            timeout="{timeout}"
            action="/twilio/voice"
            method="POST"
            bargeIn="{barge_in_attr}"
            {hints_attr}>
        <Say voice="{voice}">{message}</Say>
    </Gather>
    <Say voice="{voice}">Still here, hon! Take your time.</Say>
    <Gather input="speech"
            speechTimeout="auto"
            timeout="8"
            action="/twilio/voice"
            method="POST"
            bargeIn="true">
    </Gather>
    <Say voice="{voice}">Alrighty, I'll let you go! Call back anytime, hon!</Say>
    <Hangup/>
</Response>
""".strip()


def _twiml_goodbye(message: str, voice: str = "Polly.Kendra") -> str:
    """
    Generate TwiML for goodbye message and hangup.
    
    Args:
        message: Goodbye message
        voice: Twilio voice to use
        
    Returns:
        TwiML XML string
    """
    message = _escape_xml(message)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{message}</Say>
    <Pause length="1"/>
    <Hangup/>
</Response>
""".strip()


def _twiml_transfer(
    message: str,
    transfer_number: str,
    voice: str = "Polly.Kendra",
) -> str:
    """
    Generate TwiML for transferring to another number.
    
    Args:
        message: Message before transfer
        transfer_number: Number to transfer to
        voice: Twilio voice to use
        
    Returns:
        TwiML XML string
    """
    message = _escape_xml(message)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{message}</Say>
    <Pause length="1"/>
    <Dial>{transfer_number}</Dial>
</Response>
""".strip()


def _twiml_error(voice: str = "Polly.Kendra") -> str:
    """Generate TwiML for error scenario - warm and apologetic."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">Oh I'm so sorry hon, we're having a little technical hiccup! Could you try that again? Or press zero and I'll get you to a real person right away!</Say>
    <Gather input="dtmf" numDigits="1" action="/twilio/voice" method="POST">
        <Say voice="{voice}">Press zero for a person, or just say that again!</Say>
    </Gather>
    <Hangup/>
</Response>
""".strip()


@router.post("/twilio/voice")
async def twilio_voice(
    request: Request,
    CallSid: str = Form(...),
    From: str = Form(...),
    To: str = Form(...),
    SpeechResult: Optional[str] = Form(None),
    Digits: Optional[str] = Form(None),
    CallStatus: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Handle Twilio voice webhook.
    
    This endpoint receives:
    - Initial call (no SpeechResult)
    - Speech recognition results (SpeechResult)
    - DTMF input (Digits)
    
    Returns TwiML response for Twilio to execute.
    """
    state: CallState = call_state_store.get(CallSid)
    voice = DEFAULT_VOICE.voice
    
    try:
        # Handle DTMF input (e.g., press 0 for representative)
        if Digits == "0":
            log_call_event(logger, "TRANSFER_REQUESTED", CallSid, method="dtmf")
            state.requested_human = True
            emergency_contact = get_emergency_contact(db, state.location_code)
            xml = _twiml_transfer(
                "Transferring you now.",
                emergency_contact["phone"],
                voice=voice,
            )
            return Response(content=xml, media_type="application/xml")
        
        # Initial call - no speech yet
        if SpeechResult is None:
            log_call_event(logger, "CALL_STARTED", CallSid, caller=From, called=To)
            
            # Warm Texas greeting
            welcome = get_greeting(state.name)
            
            xml = _twiml_say_and_gather(
                welcome,
                voice=voice,
                hints="schedule, appointment, AC, air conditioning, heating, heater, furnace, repair, maintenance, reschedule, cancel, yes, no, yeah, morning, afternoon, Dallas, Fort Worth, Arlington, cooling, not working, broken, noise, leak",
                timeout=6,
            )
            return Response(content=xml, media_type="application/xml")
        
        # Process speech input
        user_text = (SpeechResult or "").strip()
        log_call_event(logger, "SPEECH_RECEIVED", CallSid, text=user_text[:100])
        
        if not user_text:
            xml = _twiml_say_and_gather(
                get_clarification(),
                voice=voice,
            )
            return Response(content=xml, media_type="application/xml")
        
        # Check for goodbye phrases
        goodbye_phrases = [
            "goodbye", "bye", "that's all", "nothing", "no thanks",
            "no thank you", "i'm done", "that's it", "hang up", "end call"
        ]
        if user_text.lower().strip() in goodbye_phrases:
            log_call_event(logger, "CALL_ENDED", CallSid, reason="user_goodbye")
            # Human-like exit - never abrupt
            farewell = get_human_exit(state.name)
            xml = _twiml_goodbye(farewell, voice=voice)
            call_state_store.delete(CallSid)
            cleanup_personality(CallSid)  # Clean up human tricks state
            return Response(content=xml, media_type="application/xml")
        
        # Check for emergency before running agent
        is_emergency, emergency_type, confidence = detect_emergency(user_text)
        if is_emergency and confidence >= 0.8:
            log_call_event(
                logger, "EMERGENCY_DETECTED", CallSid,
                type=emergency_type, confidence=confidence
            )
            state.set_emergency(emergency_type)
            emergency_contact = get_emergency_contact(db, state.location_code)
            
            # Use urgent voice for emergencies - dispatcher style
            xml = _twiml_transfer(
                "Understood. This is an emergency. Transferring you now.",
                emergency_contact["phone"],
                voice=EMERGENCY_VOICE.voice,
            )
            return Response(content=xml, media_type="application/xml")
        
        # CALL CONTROL: Detect long speech or multi-topic rambling
        if is_speech_too_long(user_text, max_words=30) or is_multi_topic(user_text):
            log_call_event(logger, "LONG_SPEECH_INTERRUPT", CallSid, words=len(user_text.split()))
            
            # Still extract what we can from the rambling
            from app.utils.call_control import extract_issue_type, extract_city, extract_time_preference
            
            # Try to extract issue
            if not state.issue:
                issue = extract_issue_type(user_text)
                if issue:
                    state.issue = issue
                    state.issue_category = issue
            
            # Try to extract city
            if not state.location_code:
                city = extract_city(user_text)
                if city:
                    state.location_code = city
            
            # Try to extract time
            if not state.appointment_time:
                time_pref = extract_time_preference(user_text)
                if time_pref:
                    state.appointment_time = time_pref
            
            # Determine current booking stage from state
            if not state.issue:
                stage = BookingStage.ISSUE
            elif not state.location_code:
                stage = BookingStage.CITY
            elif not state.appointment_time:
                stage = BookingStage.TIME
            elif not state.name:
                stage = BookingStage.NAME
            else:
                stage = BookingStage.CONFIRM
            
            # Pass extracted values for smarter acknowledgment
            interrupt_response = get_interruption_response(
                stage,
                extracted_issue=state.issue,
                extracted_city=state.location_code,
            )
            xml = _twiml_say_and_gather(interrupt_response, voice=voice)
            return Response(content=xml, media_type="application/xml")
        
        # Try Texas-style quick response first (no AI needed) - instant reply
        quick_reply = get_quick_response_texas(user_text, state.name)
        if quick_reply:
            log_call_event(logger, "QUICK_RESPONSE", CallSid)
            xml = _twiml_say_and_gather(quick_reply, voice=voice)
            return Response(content=xml, media_type="application/xml")
        
        # Run agent with timeout protection
        try:
            loop = asyncio.get_event_loop()
            reply = await asyncio.wait_for(
                loop.run_in_executor(
                    _executor,
                    lambda: run_agent(
                        user_text=user_text,
                        state=state,
                        db=db,
                        call_sid=CallSid,
                        caller_phone=From,
                    )
                ),
                timeout=4.0  # Hard 4s timeout
            )
        except asyncio.TimeoutError:
            logger.warning("Agent timeout for call %s", CallSid)
            reply = "One moment. Say that again."
        
        log_call_event(logger, "AGENT_REPLY", CallSid, reply=reply[:100])
        
        # CALL CONTROL: Shorten response to one sentence, remove follow-up questions
        reply = shorten_response(reply, max_sentences=2)
        reply = remove_follow_up_questions(reply)
        
        # Apply all humanization tricks
        is_booking = state.has_appointment and state.last_intent == "booking"
        reply = humanize_response(
            response=reply,
            call_sid=CallSid,
            caller_name=state.name,
            last_topic=state.issue,
            is_booking_confirmation=is_booking,
        )
        
        # Personalize the response with dispatcher style
        reply = personalize_response(reply, state.name)
        
        # Check if booking was completed
        if is_booking:
            log_call_event(logger, "BOOKING_COMPLETED", CallSid)
            closing = f"{reply} Anything else?"
            xml = _twiml_say_and_gather(closing, voice=voice)
            return Response(content=xml, media_type="application/xml")
        
        # Check if user requested human
        if state.requested_human:
            log_call_event(logger, "TRANSFER_REQUESTED", CallSid, method="voice")
            emergency_contact = get_emergency_contact(db, state.location_code)
            xml = _twiml_transfer(
                reply,
                emergency_contact["phone"],
                voice=voice,
            )
            state.was_transferred = True
            return Response(content=xml, media_type="application/xml")
        
        # Use empathetic voice if caller is frustrated
        if state.frustration_level >= 2:
            voice = EMPATHETIC_VOICE.voice
        
        # Continue conversation
        xml = _twiml_say_and_gather(reply, voice=voice)
        return Response(content=xml, media_type="application/xml")
        
    except Exception as e:
        logger.error("Error in twilio_voice: %s", str(e), exc_info=True)
        error = handle_error(e, CallSid, "twilio_voice")
        
        # Return error TwiML
        xml = _twiml_error(voice=voice)
        return Response(content=xml, media_type="application/xml")


@router.post("/twilio/status")
async def twilio_status(
    CallSid: str = Form(...),
    CallStatus: str = Form(...),
    CallDuration: Optional[str] = Form(None),
):
    """
    Handle Twilio call status webhook.
    
    Receives status updates like completed, busy, failed, etc.
    """
    log_call_event(
        logger, "CALL_STATUS", CallSid,
        status=CallStatus, duration=CallDuration
    )
    
    # Clean up call state when call ends
    if CallStatus in ["completed", "busy", "failed", "no-answer", "canceled"]:
        call_state_store.delete(CallSid)
    
    return {"status": "received"}
