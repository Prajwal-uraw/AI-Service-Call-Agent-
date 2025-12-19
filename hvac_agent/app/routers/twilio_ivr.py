"""
IVR Menu for HVAC Voice Agent.

Allows callers to choose between:
- Press 1: OpenAI Realtime API (best latency, ~200ms)
- Press 2: Gather-based system (traditional, more stable)

This is useful for:
- A/B testing different systems
- Fallback if one system has issues
- Letting users choose their preference
"""

import os
from fastapi import APIRouter, Request, Form
from fastapi.responses import Response

from app.utils.logging import get_logger

router = APIRouter(tags=["twilio-ivr"])
logger = get_logger("twilio.ivr")

COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")

# Version for deployment verification
_VERSION = "1.0.0-ivr"
print(f"[IVR_MODULE_LOADED] Version: {_VERSION}")


@router.api_route("/twilio/ivr/incoming", methods=["GET", "POST"])
async def ivr_incoming(request: Request):
    """
    Entry point for incoming calls with IVR menu.
    
    Plays a menu and routes based on DTMF input:
    - 1: OpenAI Realtime API (streaming, low latency)
    - 2: Gather-based system (turn-based, stable)
    """
    host = request.headers.get("host", "localhost:8000")
    
    logger.info("IVR incoming call from host: %s", host)
    
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="https://{host}/twilio/ivr/route" method="POST" timeout="10">
        <Say voice="Polly.Joanna-Neural">
            Thank you for calling {COMPANY_NAME}.
            For our new AI assistant with faster responses, press 1.
            For our standard service, press 2.
        </Say>
    </Gather>
    <Say voice="Polly.Joanna-Neural">
        I didn't receive any input. Connecting you to our standard service.
    </Say>
    <Redirect>/twilio/gather/incoming</Redirect>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/ivr/route", methods=["GET", "POST"])
async def ivr_route(request: Request):
    """
    Route the call based on DTMF input.
    """
    host = request.headers.get("host", "localhost:8000")
    
    # Get form data
    form = await request.form()
    digits = form.get("Digits", "")
    call_sid = form.get("CallSid", "unknown")
    
    logger.info("IVR routing: CallSid=%s, Digits=%s", call_sid, digits)
    
    if digits == "1":
        # Route to OpenAI Realtime API
        logger.info("Routing to Realtime API")
        
        # Determine WebSocket protocol
        ws_protocol = "wss" if "https" in str(request.url) or "modal" in host or "ngrok" in host else "ws"
        ws_url = f"{ws_protocol}://{host}/twilio/realtime/stream"
        
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">Connecting you now.</Say>
    <Connect>
        <Stream url="{ws_url}">
            <Parameter name="caller" value="{{{{From}}}}" />
        </Stream>
    </Connect>
</Response>"""
        
    elif digits == "2":
        # Route to Gather-based system
        logger.info("Routing to Gather system")
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect>https://{host}/twilio/gather/incoming</Redirect>
</Response>"""
        
    else:
        # Invalid input, default to Gather
        logger.info("Invalid input '%s', defaulting to Gather", digits)
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">Invalid selection. Connecting you to our standard service.</Say>
    <Redirect>https://{host}/twilio/gather/incoming</Redirect>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.get("/twilio/ivr/health")
async def ivr_health():
    """Health check for IVR endpoint."""
    return {
        "status": "ok",
        "version": _VERSION,
        "endpoints": {
            "incoming": "/twilio/ivr/incoming",
            "route": "/twilio/ivr/route"
        },
        "options": {
            "1": "OpenAI Realtime API (streaming)",
            "2": "Gather-based (turn-based)"
        }
    }
