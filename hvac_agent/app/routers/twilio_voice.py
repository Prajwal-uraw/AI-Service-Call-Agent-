"""
Twilio Voice webhook handler for turn-based voice conversations.

Handles:
- Incoming call webhooks
- Speech recognition results
- TwiML response generation
- Call state management
- Emergency routing
"""

from typing import Optional

from fastapi import APIRouter, Form, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.agents import CallState, call_state_store, run_agent
from app.services.db import get_db
from app.services.emergency_service import detect_emergency, get_emergency_contact
from app.utils.logging import get_logger, log_call_event
from app.utils.voice_config import get_voice_config, VoiceTone
from app.utils.error_handler import handle_error, get_user_friendly_error

router = APIRouter(tags=["twilio-voice"])
logger = get_logger("twilio.voice")

# Voice configuration
DEFAULT_VOICE = get_voice_config(VoiceTone.FRIENDLY)
EMERGENCY_VOICE = get_voice_config(VoiceTone.URGENT)
EMPATHETIC_VOICE = get_voice_config(VoiceTone.EMPATHETIC)


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
    voice: str = "Polly.Joanna",
    hints: Optional[str] = None,
    timeout: int = 3,
) -> str:
    """
    Generate TwiML for saying a message and gathering speech input.
    
    Args:
        message: Message to speak
        voice: Twilio voice to use
        hints: Speech recognition hints
        timeout: Speech timeout in seconds
        
    Returns:
        TwiML XML string
    """
    message = _escape_xml(message)
    hints_attr = f'hints="{hints}"' if hints else ""
    
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{message}</Say>
    <Gather input="speech"
            speechTimeout="auto"
            timeout="{timeout}"
            action="/twilio/voice"
            method="POST"
            {hints_attr}>
        <Say voice="{voice}">
            I'm listening.
        </Say>
    </Gather>
    <Say voice="{voice}">I didn't hear anything. Let me know if you need help.</Say>
    <Gather input="speech"
            speechTimeout="auto"
            timeout="{timeout}"
            action="/twilio/voice"
            method="POST">
    </Gather>
</Response>
""".strip()


def _twiml_goodbye(message: str, voice: str = "Polly.Joanna") -> str:
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
    voice: str = "Polly.Joanna",
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


def _twiml_error(voice: str = "Polly.Joanna") -> str:
    """Generate TwiML for error scenario."""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">I'm sorry, I'm having technical difficulties. Please try calling back in a few minutes, or press zero to speak with a representative.</Say>
    <Gather input="dtmf" numDigits="1" action="/twilio/voice" method="POST">
        <Say voice="{voice}">Press zero for a representative.</Say>
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
                "Connecting you to a representative now. Please hold.",
                emergency_contact["phone"],
                voice=voice,
            )
            return Response(content=xml, media_type="application/xml")
        
        # Initial call - no speech yet
        if SpeechResult is None:
            log_call_event(logger, "CALL_STARTED", CallSid, caller=From, called=To)
            
            welcome = (
                "Thank you for calling KC Comfort Air. "
                "I'm your virtual assistant and I'm here to help you with scheduling, "
                "rescheduling, or any HVAC questions you might have. "
                "How can I assist you today?"
            )
            
            xml = _twiml_say_and_gather(
                welcome,
                voice=voice,
                hints="schedule, appointment, AC, heating, repair, maintenance, reschedule, cancel",
            )
            return Response(content=xml, media_type="application/xml")
        
        # Process speech input
        user_text = (SpeechResult or "").strip()
        log_call_event(logger, "SPEECH_RECEIVED", CallSid, text=user_text[:100])
        
        if not user_text:
            xml = _twiml_say_and_gather(
                "I didn't catch that. Could you please repeat what you said?",
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
            farewell = (
                "Thank you for calling KC Comfort Air. "
                "Have a great day, and stay comfortable!"
            )
            xml = _twiml_goodbye(farewell, voice=voice)
            call_state_store.delete(CallSid)
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
            
            # Use urgent voice for emergencies
            xml = _twiml_transfer(
                f"I understand this is an emergency. I'm connecting you to our emergency line immediately. Please stay on the line.",
                emergency_contact["phone"],
                voice=EMERGENCY_VOICE.voice,
            )
            return Response(content=xml, media_type="application/xml")
        
        # Run the agent
        reply = run_agent(
            user_text=user_text,
            state=state,
            db=db,
            call_sid=CallSid,
            caller_phone=From,
        )
        
        log_call_event(logger, "AGENT_REPLY", CallSid, reply=reply[:100])
        
        # Check if booking was completed
        if state.has_appointment and state.last_intent == "booking":
            log_call_event(logger, "BOOKING_COMPLETED", CallSid)
            closing = (
                f"{reply} "
                "Is there anything else I can help you with today?"
            )
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
