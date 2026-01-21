"""
Click-to-Call API
Endpoints for outbound calling with auto-logging
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import logging
from services.click_to_call import get_click_to_call_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/click-to-call", tags=["Click-to-Call"])

# ==================== REQUEST/RESPONSE MODELS ====================

class InitiateCallRequest(BaseModel):
    to_number: str
    contact_name: Optional[str] = None
    contact_company: Optional[str] = None
    deal_id: Optional[str] = None

class LogCallRequest(BaseModel):
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_step: Optional[str] = None

# ==================== ENDPOINTS ====================

@router.post("/initiate")
async def initiate_call(request: InitiateCallRequest, http_request: Request):
    """
    Initiate outbound call
    
    This endpoint:
    1. Creates Twilio call
    2. Logs to database
    3. Returns call SID
    """
    try:
        user_email = http_request.headers.get("X-User-Email", "demo@company.com")
        
        service = get_click_to_call_service()
        
        call_log = await service.initiate_call(
            to_number=request.to_number,
            user_email=user_email,
            contact_name=request.contact_name,
            contact_company=request.contact_company,
            deal_id=request.deal_id
        )
        
        return call_log
        
    except Exception as e:
        logger.error(f"Error initiating call: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{call_sid}")
async def get_call_status(call_sid: str):
    """Get current call status"""
    try:
        service = get_click_to_call_service()
        status = await service.get_call_status(call_sid)
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting call status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/end/{call_sid}")
async def end_call(call_sid: str):
    """End active call"""
    try:
        service = get_click_to_call_service()
        result = await service.end_call(call_sid)
        
        return result
        
    except Exception as e:
        logger.error(f"Error ending call: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_call_history(http_request: Request, limit: int = 50):
    """Get call history for user"""
    try:
        user_email = http_request.headers.get("X-User-Email", "demo@company.com")
        
        service = get_click_to_call_service()
        history = await service.get_call_history(user_email, limit)
        
        return history
        
    except Exception as e:
        logger.error(f"Error getting call history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/log/{call_sid}")
async def log_call_to_crm(call_sid: str, request: LogCallRequest):
    """
    Log call to CRM with notes and outcome
    """
    try:
        service = get_click_to_call_service()
        
        result = await service.log_call_to_crm(
            call_sid=call_sid,
            notes=request.notes,
            outcome=request.outcome,
            next_step=request.next_step
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error logging call: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/twiml")
async def get_twiml(user: str, to_number: str):
    """
    Generate TwiML for outbound call
    """
    try:
        service = get_click_to_call_service()
        twiml = service.generate_twiml(user, to_number)
        
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        logger.error(f"Error generating TwiML: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/status")
async def call_status_callback(request: Request):
    """
    Twilio status callback
    Updates call status in database
    """
    try:
        form_data = await request.form()
        
        call_sid = form_data.get("CallSid")
        call_status = form_data.get("CallStatus")
        call_duration = form_data.get("CallDuration")
        
        # TODO: Update database with call status
        
        logger.info(f"Call status update: {call_sid} - {call_status}")
        
        return {"message": "Status updated"}
        
    except Exception as e:
        logger.error(f"Error processing status callback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recording")
async def recording_callback(request: Request):
    """
    Twilio recording callback
    Saves recording URL to database
    """
    try:
        form_data = await request.form()
        
        call_sid = form_data.get("CallSid")
        recording_url = form_data.get("RecordingUrl")
        recording_duration = form_data.get("RecordingDuration")
        
        # TODO: Update database with recording URL
        
        logger.info(f"Recording available: {call_sid} - {recording_url}")
        
        return {"message": "Recording saved"}
        
    except Exception as e:
        logger.error(f"Error processing recording callback: {e}")
        raise HTTPException(status_code=500, detail=str(e))
