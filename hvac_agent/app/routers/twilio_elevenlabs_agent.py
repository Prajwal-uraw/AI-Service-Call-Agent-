"""
Twilio + ElevenLabs Conversational AI Integration.

This router uses ElevenLabs' Conversational AI platform which handles:
- Natural voice synthesis (your MS WALKER voice)
- Real-time speech recognition
- AI conversation (with your custom prompts)
- Low latency responses

The ElevenLabs agent is configured in the ElevenLabs dashboard with:
- Your HVAC booking prompts
- MS WALKER voice
- Conversation flow

This is the PROPER way to use ElevenLabs with Twilio - not TTS-only.
"""

import os
from fastapi import APIRouter, Request
from fastapi.responses import Response

from app.utils.logging import get_logger

logger = get_logger("twilio.elevenlabs_agent")

router = APIRouter(tags=["twilio-elevenlabs-agent"])

# Version for deployment verification
_VERSION = "2.0.0-elevenlabs-agent"
print(f"[ELEVENLABS_AGENT_MODULE_LOADED] Version: {_VERSION}")

# Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")  # Your ElevenLabs Conversational AI Agent ID


@router.api_route("/twilio/elevenlabs/incoming", methods=["GET", "POST"])
async def elevenlabs_incoming(request: Request):
    """
    Handle incoming Twilio calls using ElevenLabs Conversational AI.
    
    This endpoint:
    1. Receives the incoming call from Twilio
    2. Registers the call with ElevenLabs
    3. Returns TwiML that connects the call to ElevenLabs agent
    
    The ElevenLabs agent handles the entire conversation with:
    - Your MS WALKER voice
    - Low latency responses
    - Natural conversation flow
    """
    # Get form data
    if hasattr(request.state, 'twilio_form_data'):
        form_dict = request.state.twilio_form_data
    else:
        form = await request.form()
        form_dict = dict(form)
    
    call_sid = form_dict.get("CallSid", "unknown")
    from_number = form_dict.get("From", "unknown")
    to_number = form_dict.get("To", "unknown")
    
    logger.info("Incoming call [v%s]: CallSid=%s, From=%s, To=%s", 
               _VERSION, call_sid, from_number, to_number)
    
    # Check if ElevenLabs is configured
    if not ELEVENLABS_API_KEY or not ELEVENLABS_AGENT_ID:
        logger.warning("ElevenLabs not configured, falling back to Gather")
        # Redirect to gather-based flow
        return Response(
            content="""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect>/twilio/gather/incoming</Redirect>
</Response>""",
            media_type="application/xml"
        )
    
    try:
        # Use ElevenLabs SDK to register the call
        from elevenlabs import ElevenLabs
        
        client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        # Register the call with ElevenLabs - this returns TwiML
        twiml = client.conversational_ai.twilio.register_call(
            agent_id=ELEVENLABS_AGENT_ID,
            from_number=from_number,
            to_number=to_number,
            direction="inbound",
            conversation_initiation_client_data={
                "dynamic_variables": {
                    "caller_number": from_number,
                    "call_sid": call_sid,
                }
            }
        )
        
        logger.info("ElevenLabs call registered: CallSid=%s", call_sid)
        
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        logger.error("ElevenLabs registration failed: %s", str(e), exc_info=True)
        # Fallback to gather-based flow
        return Response(
            content="""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">I apologize, we're experiencing technical difficulties. Please hold while I connect you.</Say>
    <Redirect>/twilio/gather/incoming</Redirect>
</Response>""",
            media_type="application/xml"
        )


@router.get("/twilio/elevenlabs/health")
async def elevenlabs_health():
    """Health check for ElevenLabs integration."""
    return {
        "status": "healthy",
        "version": _VERSION,
        "elevenlabs_configured": bool(ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID),
        "agent_id": ELEVENLABS_AGENT_ID[:8] + "..." if ELEVENLABS_AGENT_ID else None,
    }
