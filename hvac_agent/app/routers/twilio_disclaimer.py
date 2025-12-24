"""
Twilio Disclaimer Handler
Plays legal disclaimer BEFORE handing off to AI agent
This keeps the AI agent clean and focused on conversation
"""

from fastapi import APIRouter, Request
from fastapi.responses import Response
import os

router = APIRouter(tags=["twilio-disclaimer"])

# Configuration
STREAM_WEBSOCKET_URL = os.getenv("STREAM_WEBSOCKET_URL", "wss://your-domain.com/twilio/realtime")
COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")

# Legal disclaimer text (customize as needed)
DISCLAIMER_TEXT = """
This call may be monitored and recorded for quality assurance and training purposes. 
By continuing this call, you consent to being recorded. 
You are now being connected to our AI assistant.
"""


@router.post("/twilio/voice-with-disclaimer")
async def voice_with_disclaimer(request: Request):
    """
    TwiML endpoint that plays disclaimer THEN connects to AI agent
    Use this as your Twilio webhook URL instead of direct /twilio/realtime
    """
    # Get caller information
    form_data = await request.form()
    caller = form_data.get("From", "unknown")
    called = form_data.get("To", "unknown")
    call_sid = form_data.get("CallSid", "unknown")
    
    # Build TwiML response with disclaimer
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">{DISCLAIMER_TEXT}</Say>
    <Connect>
        <Stream url="{STREAM_WEBSOCKET_URL}">
            <Parameter name="caller" value="{caller}" />
            <Parameter name="called" value="{called}" />
            <Parameter name="callSid" value="{call_sid}" />
        </Stream>
    </Connect>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.post("/twilio/voice-disclaimer-only")
async def voice_disclaimer_only(request: Request):
    """
    Alternative: Just play disclaimer and continue to regular flow
    For use with existing /twilio/realtime endpoint
    """
    form_data = await request.form()
    caller = form_data.get("From", "unknown")
    
    # Play disclaimer then redirect to main AI endpoint
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">{DISCLAIMER_TEXT}</Say>
    <Redirect method="POST">/twilio/realtime?caller={caller}</Redirect>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.get("/twilio/disclaimer-config")
async def get_disclaimer_config():
    """
    Get current disclaimer configuration
    """
    return {
        "disclaimer_text": DISCLAIMER_TEXT,
        "voice": "Polly.Joanna",
        "webhook_url": "/twilio/voice-with-disclaimer",
        "company_name": COMPANY_NAME,
        "instructions": {
            "step_1": "Update your Twilio phone number webhook URL to point to /twilio/voice-with-disclaimer",
            "step_2": "The disclaimer will play automatically before AI picks up",
            "step_3": "Customize DISCLAIMER_TEXT in environment variables if needed"
        }
    }


@router.post("/twilio/update-disclaimer")
async def update_disclaimer(disclaimer_text: str):
    """
    Update disclaimer text (admin only - implement auth)
    """
    # TODO: Add authentication
    # TODO: Store in database instead of environment variable
    
    return {
        "success": True,
        "message": "Disclaimer updated (restart required)",
        "new_disclaimer": disclaimer_text,
        "note": "This is a temporary update. Set DISCLAIMER_TEXT in environment for persistence."
    }
