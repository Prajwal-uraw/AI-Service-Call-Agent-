"""
Outbound Calling API
Handles outbound calls to customers using Twilio with optional call intelligence
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from twilio.rest import Client
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/outbound-calls", tags=["outbound-calls"])


class OutboundCallRequest(BaseModel):
    to_number: str = Field(..., description="Customer phone number to call")
    from_number: Optional[str] = Field(None, description="Twilio number to call from")
    contact_name: Optional[str] = Field(None, description="Contact name for reference")
    call_purpose: str = Field(..., description="Purpose of call: follow_up, quote, appointment_reminder, emergency")
    use_ai_agent: bool = Field(True, description="Use AI agent for call intelligence")
    custom_message: Optional[str] = Field(None, description="Custom message for AI to deliver")
    record_call: bool = Field(True, description="Record the call for quality assurance")
    

class OutboundCallResponse(BaseModel):
    call_sid: str
    status: str
    to_number: str
    from_number: str
    created_at: str
    recording_enabled: bool
    ai_enabled: bool


class CallStatusResponse(BaseModel):
    call_sid: str
    status: str
    duration: Optional[int]
    recording_url: Optional[str]
    transcription: Optional[str]
    ai_summary: Optional[str]


def get_twilio_client():
    """Get Twilio client from environment variables"""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    
    if not account_sid or not auth_token:
        raise HTTPException(
            status_code=500,
            detail="Twilio credentials not configured"
        )
    
    return Client(account_sid, auth_token)


@router.post("/initiate", response_model=OutboundCallResponse)
async def initiate_outbound_call(request: OutboundCallRequest):
    """
    Initiate an outbound call to a customer
    
    - **to_number**: Customer phone number (E.164 format recommended)
    - **call_purpose**: Reason for call (follow_up, quote, appointment_reminder, emergency)
    - **use_ai_agent**: Enable AI call intelligence
    - **custom_message**: Optional custom message for AI to deliver
    - **record_call**: Enable call recording
    """
    try:
        client = get_twilio_client()
        
        # Get default Twilio number if not provided
        from_number = request.from_number or os.getenv("TWILIO_PHONE_NUMBER")
        if not from_number:
            raise HTTPException(
                status_code=400,
                detail="No Twilio phone number configured"
            )
        
        # Determine TwiML URL based on AI agent usage
        if request.use_ai_agent:
            # Use AI agent endpoint with call intelligence
            twiml_url = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/voice/outbound"
            twiml_url += f"?purpose={request.call_purpose}"
            if request.custom_message:
                twiml_url += f"&message={request.custom_message}"
        else:
            # Use simple TwiML for basic calls
            twiml_url = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/voice/simple-outbound"
        
        # Initiate the call
        call = client.calls.create(
            to=request.to_number,
            from_=from_number,
            url=twiml_url,
            record=request.record_call,
            status_callback=f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/api/outbound-calls/status-callback",
            status_callback_event=['initiated', 'ringing', 'answered', 'completed']
        )
        
        logger.info(f"Outbound call initiated: {call.sid} to {request.to_number}")
        
        return OutboundCallResponse(
            call_sid=call.sid,
            status=call.status,
            to_number=request.to_number,
            from_number=from_number,
            created_at=datetime.utcnow().isoformat(),
            recording_enabled=request.record_call,
            ai_enabled=request.use_ai_agent
        )
        
    except Exception as e:
        logger.error(f"Error initiating outbound call: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initiate call: {str(e)}"
        )


@router.get("/status/{call_sid}", response_model=CallStatusResponse)
async def get_call_status(call_sid: str):
    """
    Get status and details of an outbound call
    """
    try:
        client = get_twilio_client()
        call = client.calls(call_sid).fetch()
        
        # Get recording if available
        recording_url = None
        transcription = None
        if call.status == "completed":
            recordings = client.recordings.list(call_sid=call_sid, limit=1)
            if recordings:
                recording_url = f"https://api.twilio.com{recordings[0].uri.replace('.json', '.mp3')}"
        
        return CallStatusResponse(
            call_sid=call.sid,
            status=call.status,
            duration=call.duration,
            recording_url=recording_url,
            transcription=transcription,
            ai_summary=None  # Will be populated by AI analysis
        )
        
    except Exception as e:
        logger.error(f"Error fetching call status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch call status: {str(e)}"
        )


@router.post("/status-callback")
async def call_status_callback(
    CallSid: str,
    CallStatus: str,
    CallDuration: Optional[int] = None
):
    """
    Webhook endpoint for Twilio call status updates
    """
    logger.info(f"Call status update: {CallSid} - {CallStatus} - Duration: {CallDuration}")
    
    # Store call status in database
    # TODO: Implement database storage
    
    return {"status": "received"}


@router.get("/history")
async def get_outbound_call_history(
    limit: int = 50,
    status: Optional[str] = None
):
    """
    Get history of outbound calls
    """
    try:
        client = get_twilio_client()
        
        # Fetch calls from Twilio
        calls = client.calls.list(limit=limit)
        
        # Filter by status if provided
        if status:
            calls = [c for c in calls if c.status == status]
        
        return {
            "calls": [
                {
                    "call_sid": call.sid,
                    "to": call.to,
                    "from": call.from_,
                    "status": call.status,
                    "duration": call.duration,
                    "start_time": call.start_time.isoformat() if call.start_time else None,
                    "end_time": call.end_time.isoformat() if call.end_time else None,
                }
                for call in calls
            ],
            "total": len(calls)
        }
        
    except Exception as e:
        logger.error(f"Error fetching call history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch call history: {str(e)}"
        )


@router.post("/bulk-call")
async def initiate_bulk_calls(
    contacts: List[OutboundCallRequest]
):
    """
    Initiate multiple outbound calls in bulk
    """
    results = []
    
    for contact in contacts:
        try:
            result = await initiate_outbound_call(contact)
            results.append({
                "to_number": contact.to_number,
                "status": "initiated",
                "call_sid": result.call_sid
            })
        except Exception as e:
            results.append({
                "to_number": contact.to_number,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "total": len(contacts),
        "successful": len([r for r in results if r["status"] == "initiated"]),
        "failed": len([r for r in results if r["status"] == "failed"]),
        "results": results
    }
