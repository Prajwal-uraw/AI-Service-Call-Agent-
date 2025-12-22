"""
Integrations API
Endpoints for Twilio, Zoom, and Email integrations
"""

from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
from integrations.twilio_phone_integration import get_twilio_phone_integration
from integrations.zoom_integration import get_zoom_integration
from integrations.email_sender import get_email_sender

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/integrations", tags=["Integrations"])

# ==================== REQUEST/RESPONSE MODELS ====================

class TwilioCallRequest(BaseModel):
    to_number: str
    meeting_id: str
    enable_ai: bool = True

class ZoomWebhookEvent(BaseModel):
    event: str
    payload: dict

class SendEmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str
    from_name: Optional[str] = "Kestrel AI"
    schedule_at: Optional[str] = None

# ==================== TWILIO ENDPOINTS ====================

@router.post("/twilio/call-with-ai")
async def create_call_with_ai(request: TwilioCallRequest):
    """
    Create Twilio call with AI listening enabled
    """
    try:
        integration = get_twilio_phone_integration()
        
        result = await integration.create_call_with_ai(
            from_number="+1234567890",  # TODO: Get from config
            to_number=request.to_number,
            meeting_id=request.meeting_id,
            enable_ai=request.enable_ai
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating call with AI: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/twilio/twiml/{meeting_id}")
async def get_twiml_with_ai(meeting_id: str, to_number: str, enable_ai: bool = True):
    """
    Generate TwiML with AI streaming
    """
    try:
        integration = get_twilio_phone_integration()
        
        twiml = integration.generate_twiml_with_ai_stream(
            to_number=to_number,
            meeting_id=meeting_id,
            enable_ai=enable_ai
        )
        
        from fastapi.responses import Response
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        logger.error(f"Error generating TwiML: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ZOOM ENDPOINTS ====================

@router.post("/zoom/webhook")
async def zoom_webhook(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """
    Zoom webhook endpoint
    Handles meeting.started, recording.completed, etc.
    """
    try:
        body = await request.body()
        headers = dict(request.headers)
        
        integration = get_zoom_integration()
        
        # Verify webhook signature
        is_valid = await integration.verify_webhook(headers, body.decode())
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse event
        event_data = await request.json()
        event_type = event_data.get("event")
        
        logger.info(f"Zoom webhook received: {event_type}")
        
        # Handle different event types
        if event_type == "meeting.started":
            result = await integration.handle_meeting_started(event_data)
        elif event_type == "recording.completed":
            result = await integration.handle_recording_completed(event_data)
        else:
            result = {"message": f"Event {event_type} received but not handled"}
        
        return result
        
    except Exception as e:
        logger.error(f"Error handling Zoom webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== EMAIL ENDPOINTS ====================

@router.post("/email/send")
async def send_email(request: SendEmailRequest):
    """
    Send email via Resend
    """
    try:
        sender = get_email_sender()
        
        if request.schedule_at:
            # Schedule for later
            result = await sender.schedule_email(
                to_email=request.to_email,
                subject=request.subject,
                body=request.body,
                send_at=request.schedule_at,
                from_name=request.from_name
            )
        else:
            # Send immediately
            result = await sender.send_email(
                to_email=request.to_email,
                subject=request.subject,
                body=request.body,
                from_name=request.from_name
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/status/{email_id}")
async def get_email_status(email_id: str):
    """
    Get email delivery status
    """
    try:
        sender = get_email_sender()
        status = await sender.get_email_status(email_id)
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting email status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
