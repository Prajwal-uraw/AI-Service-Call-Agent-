"""
Twilio Demo Call Handler with Operator Greeting and Time Limits

Features:
- Operator greeting before connecting to Kestrel AI
- 2-minute demo call limit
- 20-second warning at 1:40
- Automatic call termination at 2:00
- Professional demo experience
"""

import asyncio
import time
from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Form, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.agents import CallState, call_state_store, run_agent
from app.services.db import get_db
from app.utils.logging import get_logger, log_call_event

router = APIRouter(tags=["twilio-demo"])
logger = get_logger("twilio.demo")

# Demo call configuration
DEMO_DURATION_SECONDS = 120  # 2 minutes
WARNING_AT_SECONDS = 100  # 1 minute 40 seconds (20 seconds before end)

# Track demo call start times
demo_call_times = {}


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
    timeout: int = 5,
    speech_timeout: str = "auto",
) -> str:
    """Generate TwiML for saying a message and gathering speech input."""
    message = _escape_xml(message)
    
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech"
            speechTimeout="{speech_timeout}"
            timeout="{timeout}"
            action="/twilio/demo"
            method="POST"
            bargeIn="true">
        <Say voice="{voice}">{message}</Say>
    </Gather>
    <Say voice="{voice}">I didn't catch that. Let me know if you'd like to continue the demo.</Say>
    <Gather input="speech"
            speechTimeout="auto"
            timeout="5"
            action="/twilio/demo"
            method="POST">
    </Gather>
    <Say voice="{voice}">Thank you for trying our demo! Visit our website to learn more. Goodbye!</Say>
    <Hangup/>
</Response>
""".strip()


def _twiml_goodbye(message: str, voice: str = "Polly.Joanna") -> str:
    """Generate TwiML for goodbye message and hangup."""
    message = _escape_xml(message)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{message}</Say>
    <Pause length="1"/>
    <Hangup/>
</Response>
""".strip()


def get_call_elapsed_time(call_sid: str) -> int:
    """Get elapsed time in seconds for a demo call."""
    if call_sid not in demo_call_times:
        return 0
    start_time = demo_call_times[call_sid]
    return int((datetime.now() - start_time).total_seconds())


def should_show_warning(call_sid: str) -> bool:
    """Check if we should show the 20-second warning."""
    elapsed = get_call_elapsed_time(call_sid)
    return elapsed >= WARNING_AT_SECONDS and elapsed < DEMO_DURATION_SECONDS


def should_end_call(call_sid: str) -> bool:
    """Check if demo time limit has been reached."""
    elapsed = get_call_elapsed_time(call_sid)
    return elapsed >= DEMO_DURATION_SECONDS


@router.post("/twilio/demo")
async def twilio_demo_call(
    request: Request,
    CallSid: str = Form(...),
    From: str = Form(...),
    To: str = Form(...),
    SpeechResult: Optional[str] = Form(None),
    CallStatus: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Handle Twilio demo call webhook with operator greeting and time limits.
    
    Flow:
    1. Operator greeting: "Welcome! Connecting you to Kestrel AI Agent for demo..."
    2. Demo call (max 2 minutes)
    3. Warning at 1:40: "You have 20 seconds remaining in this demo"
    4. Auto-end at 2:00: "Demo time complete. Thank you!"
    """
    state: CallState = call_state_store.get(CallSid)
    voice = "Polly.Joanna"  # Professional female voice
    
    try:
        # Initial call - Operator greeting
        if SpeechResult is None and CallSid not in demo_call_times:
            log_call_event(logger, "DEMO_CALL_STARTED", CallSid, caller=From)
            
            # Start demo timer
            demo_call_times[CallSid] = datetime.now()
            
            # Operator greeting
            operator_message = (
                "Welcome to Kestrel AI! "
                "I will be connecting you with the Kestrel Voice Agent for a demo. "
                "Please note, all demo calls are limited to 2 minutes. "
                "Let me transfer you now."
            )
            
            # Use a brief pause then start the conversation
            xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="{voice}">{_escape_xml(operator_message)}</Say>
    <Pause length="1"/>
    <Gather input="speech"
            speechTimeout="auto"
            timeout="6"
            action="/twilio/demo"
            method="POST"
            bargeIn="true">
        <Say voice="{voice}">Hello! I'm the Kestrel Voice Agent. How can I help you today?</Say>
    </Gather>
    <Say voice="{voice}">Are you still there? Let me know how I can assist you.</Say>
    <Gather input="speech"
            speechTimeout="auto"
            timeout="5"
            action="/twilio/demo"
            method="POST">
    </Gather>
    <Say voice="{voice}">Thank you for trying our demo! Goodbye!</Say>
    <Hangup/>
</Response>
""".strip()
            return Response(content=xml, media_type="application/xml")
        
        # Check if demo time limit reached
        if should_end_call(CallSid):
            log_call_event(logger, "DEMO_TIME_LIMIT_REACHED", CallSid)
            
            end_message = (
                "Your demo time is complete. "
                "Thank you for experiencing the Kestrel Voice Agent! "
                "Visit our website to schedule a full demo or start your trial. "
                "Goodbye!"
            )
            
            xml = _twiml_goodbye(end_message, voice=voice)
            
            # Clean up
            if CallSid in demo_call_times:
                del demo_call_times[CallSid]
            call_state_store.delete(CallSid)
            
            return Response(content=xml, media_type="application/xml")
        
        # Process speech input
        user_text = (SpeechResult or "").strip()
        log_call_event(logger, "DEMO_SPEECH_RECEIVED", CallSid, text=user_text[:100])
        
        if not user_text:
            xml = _twiml_say_and_gather(
                "I didn't catch that. Could you please repeat?",
                voice=voice,
            )
            return Response(content=xml, media_type="application/xml")
        
        # Check for goodbye phrases
        goodbye_phrases = [
            "goodbye", "bye", "that's all", "nothing", "no thanks",
            "no thank you", "i'm done", "that's it", "hang up", "end call"
        ]
        if user_text.lower().strip() in goodbye_phrases:
            log_call_event(logger, "DEMO_ENDED_BY_USER", CallSid)
            
            farewell = (
                "Thank you for trying the Kestrel Voice Agent demo! "
                "Visit our website to learn more. Goodbye!"
            )
            
            xml = _twiml_goodbye(farewell, voice=voice)
            
            # Clean up
            if CallSid in demo_call_times:
                del demo_call_times[CallSid]
            call_state_store.delete(CallSid)
            
            return Response(content=xml, media_type="application/xml")
        
        # Run Kestrel AI agent
        try:
            loop = asyncio.get_event_loop()
            reply = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: run_agent(
                        user_text=user_text,
                        state=state,
                        db=db,
                        call_sid=CallSid,
                        caller_phone=From,
                    )
                ),
                timeout=4.0
            )
        except asyncio.TimeoutError:
            logger.warning("Agent timeout for demo call %s", CallSid)
            reply = "One moment, let me process that."
        
        # Inject agent identity as "Kestrel Voice Agent"
        if "I'm Sarah" in reply or "I am Sarah" in reply:
            reply = reply.replace("I'm Sarah", "I'm the Kestrel Voice Agent")
            reply = reply.replace("I am Sarah", "I am the Kestrel Voice Agent")
        
        log_call_event(logger, "DEMO_AGENT_REPLY", CallSid, reply=reply[:100])
        
        # Check if we need to show time warning
        if should_show_warning(CallSid):
            elapsed = get_call_elapsed_time(CallSid)
            remaining = DEMO_DURATION_SECONDS - elapsed
            
            if remaining <= 20 and remaining > 15:
                # Show warning once when around 20 seconds left
                reply = f"{reply} By the way, you have about 20 seconds remaining in this demo."
                log_call_event(logger, "DEMO_TIME_WARNING", CallSid, remaining=remaining)
        
        # Continue conversation
        xml = _twiml_say_and_gather(reply, voice=voice)
        return Response(content=xml, media_type="application/xml")
        
    except Exception as e:
        logger.error("Error in demo call: %s", str(e), exc_info=True)
        
        # Return error TwiML
        error_message = (
            "I apologize, we're experiencing a technical issue. "
            "Please visit our website to schedule a full demo. Thank you!"
        )
        xml = _twiml_goodbye(error_message, voice=voice)
        return Response(content=xml, media_type="application/xml")


@router.post("/twilio/demo/status")
async def twilio_demo_status(
    CallSid: str = Form(...),
    CallStatus: str = Form(...),
    CallDuration: Optional[str] = Form(None),
):
    """Handle Twilio demo call status webhook."""
    log_call_event(
        logger, "DEMO_CALL_STATUS", CallSid,
        status=CallStatus, duration=CallDuration
    )
    
    # Clean up when call ends
    if CallStatus in ["completed", "busy", "failed", "no-answer", "canceled"]:
        if CallSid in demo_call_times:
            del demo_call_times[CallSid]
        call_state_store.delete(CallSid)
    
    return {"status": "received"}
