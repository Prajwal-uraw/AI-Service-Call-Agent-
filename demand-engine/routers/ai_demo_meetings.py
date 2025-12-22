"""
AI Demo Meetings API
Endpoints for creating and managing AI-powered demo calls
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import logging
from services.ai_demo_service import get_ai_demo_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-demo", tags=["AI Demo Meetings"])

# ==================== REQUEST/RESPONSE MODELS ====================

class CreateMeetingRequest(BaseModel):
    customer_email: EmailStr
    customer_name: str
    company_name: str
    scheduled_time: datetime
    timezone: str = "America/New_York"
    customer_phone: Optional[str] = None

class CreateMeetingResponse(BaseModel):
    meeting_id: str
    daily_room_name: str
    daily_room_url: str
    customer_join_url: str
    ai_join_url: str
    shadow_join_url: str
    start_time: str
    calendar_event_id: str
    customer_email: str
    customer_name: str
    company_name: str

class MeetingStatusResponse(BaseModel):
    meeting_id: str
    status: str
    participants_count: int
    ai_joined: bool
    customer_joined: bool
    started_at: Optional[datetime]

# ==================== ENDPOINTS ====================

@router.post("/create-meeting", response_model=CreateMeetingResponse)
async def create_ai_demo_meeting(request: CreateMeetingRequest):
    """
    Create a new AI demo meeting
    
    This endpoint:
    1. Creates a Daily.co video room
    2. Generates 3 tokens (customer, AI, shadow)
    3. Creates calendar event
    4. Sends confirmation email
    5. Stores meeting in database
    
    Returns all join URLs and meeting details
    """
    try:
        service = get_ai_demo_service()
        
        meeting_data = await service.create_meeting(
            customer_email=request.customer_email,
            customer_name=request.customer_name,
            company_name=request.company_name,
            scheduled_time=request.scheduled_time,
            timezone=request.timezone,
            customer_phone=request.customer_phone
        )
        
        # TODO: Store in database (ai_demo_meetings table)
        
        return CreateMeetingResponse(**meeting_data)
        
    except Exception as e:
        logger.error(f"Error creating AI demo meeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meeting/{meeting_id}/status", response_model=MeetingStatusResponse)
async def get_meeting_status(meeting_id: str):
    """
    Get current status of an AI demo meeting
    """
    try:
        # TODO: Query database for meeting status
        # TODO: Query Daily.co API for participant info
        
        return MeetingStatusResponse(
            meeting_id=meeting_id,
            status="scheduled",
            participants_count=0,
            ai_joined=False,
            customer_joined=False,
            started_at=None
        )
        
    except Exception as e:
        logger.error(f"Error getting meeting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/meeting/{meeting_id}")
async def cancel_meeting(meeting_id: str):
    """
    Cancel an AI demo meeting
    """
    try:
        service = get_ai_demo_service()
        
        # TODO: Get room name from database
        room_name = f"ai-demo-{meeting_id}"
        
        await service.delete_meeting(room_name)
        
        # TODO: Update database status to 'cancelled'
        # TODO: Send cancellation email
        
        return {"message": "Meeting cancelled successfully"}
        
    except Exception as e:
        logger.error(f"Error cancelling meeting: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meetings/upcoming")
async def get_upcoming_meetings(limit: int = 10):
    """
    Get upcoming AI demo meetings
    """
    try:
        # TODO: Query database for upcoming meetings
        
        return {
            "meetings": [],
            "total": 0
        }
        
    except Exception as e:
        logger.error(f"Error getting upcoming meetings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meetings/past")
async def get_past_meetings(limit: int = 10):
    """
    Get past AI demo meetings with outcomes
    """
    try:
        # TODO: Query database for past meetings with call logs
        
        return {
            "meetings": [],
            "total": 0
        }
        
    except Exception as e:
        logger.error(f"Error getting past meetings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/summary")
async def get_analytics_summary():
    """
    Get AI demo analytics summary
    """
    try:
        # TODO: Query ai_demo_analytics table
        
        return {
            "total_demos": 0,
            "icp_fit_rate": 0.0,
            "cta_conversion_rate": 0.0,
            "avg_cost_per_demo": 0.0,
            "human_takeover_rate": 0.0
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meeting/{meeting_id}/takeover")
async def takeover_meeting(meeting_id: str, takeover_data: dict):
    """
    Human takeover of AI demo call
    """
    try:
        # TODO: Mute AI bot
        # TODO: Update database with takeover info
        
        logger.info(f"Human takeover for meeting {meeting_id}")
        
        return {"message": "Takeover successful", "ai_muted": True}
        
    except Exception as e:
        logger.error(f"Error during takeover: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meeting/{meeting_id}/ai-shadow/toggle")
async def toggle_ai_shadow(meeting_id: str, enabled: bool):
    """
    Toggle AI Sales Shadow listening
    """
    try:
        from services.ai_sales_shadow import get_ai_sales_shadow
        
        shadow = get_ai_sales_shadow(meeting_id)
        
        if enabled:
            shadow.start_listening()
        else:
            shadow.stop_listening()
        
        return {
            "meeting_id": meeting_id,
            "ai_listening": enabled,
            "stats": shadow.get_stats()
        }
        
    except Exception as e:
        logger.error(f"Error toggling AI shadow: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meeting/{meeting_id}/ai-shadow/stats")
async def get_ai_shadow_stats(meeting_id: str):
    """
    Get AI Sales Shadow statistics
    """
    try:
        from services.ai_sales_shadow import get_ai_sales_shadow
        
        shadow = get_ai_sales_shadow(meeting_id)
        
        return shadow.get_stats()
        
    except Exception as e:
        logger.error(f"Error getting AI shadow stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
