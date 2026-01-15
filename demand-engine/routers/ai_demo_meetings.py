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
     
        # Store in database
        from database.session import get_db
        from models.ai_demo_models import AIDemoMeeting
        
        db = next(get_db())
        
        # Create meeting record
        meeting_record = AIDemoMeeting(
            meeting_id=meeting_data["meeting_id"],
            customer_email=meeting_data["customer_email"],
            customer_name=meeting_data["customer_name"],
            company_name=meeting_data["company_name"],
            customer_phone=request.customer_phone,
            scheduled_time=request.scheduled_time,
            timezone=request.timezone,
            duration_minutes=15,
            daily_room_name=meeting_data["daily_room_name"],
            daily_room_url=meeting_data["daily_room_url"],
            customer_token=meeting_data.get("customer_token"),
            ai_token=meeting_data.get("ai_token"),
            shadow_token=meeting_data.get("shadow_token"),
            calendar_event_id=meeting_data.get("calendar_event_id"),
            status="scheduled",
            created_by="system"
        )
        
        db.add(meeting_record)
        db.commit()
        
        logger.info(f"Stored AI demo meeting {meeting_data['meeting_id']} in database")
        
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
        from database.session import get_db
        from models.ai_demo_models import AIDemoMeeting
        
        db = next(get_db())
        
        # Query database for meeting
        meeting = db.query(AIDemoMeeting).filter(
            AIDemoMeeting.meeting_id == meeting_id
        ).first()
        
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Use existing AIDemoService to get Daily.co room info
        participants_count = 0
        try:
            from services.ai_demo_service import get_ai_demo_service
            ai_demo_service = get_ai_demo_service()
            
            # Get room info from Daily.co API
            room_info = await ai_demo_service.get_meeting_info(meeting.daily_room_name)
            participants_count = room_info.get("num_participants", 0)
            
            # Update meeting status if participants have joined
            if participants_count > 0:
                if not meeting.ai_joined_at:
                    meeting.ai_joined_at = datetime.utcnow()
                if not meeting.customer_joined_at:
                    meeting.customer_joined_at = datetime.utcnow()
                if not meeting.started_at:
                    meeting.started_at = datetime.utcnow()
                    meeting.status = "in_progress"
                
                db.commit()
                
        except Exception as daily_error:
            logger.warning(f"Could not fetch Daily.co room info: {daily_error}")
            # Continue with database status if Daily.co API fails
        
        return MeetingStatusResponse(
            meeting_id=meeting.meeting_id,
            status=meeting.status,
            participants_count=participants_count,
            ai_joined=meeting.ai_joined_at is not None,
            customer_joined=meeting.customer_joined_at is not None,
            started_at=meeting.started_at.isoformat() if meeting.started_at else None
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
        from database.session import get_db
        from models.ai_demo_models import AIDemoMeeting
        
        db = next(get_db())
        
        # Query upcoming meetings
        meetings = db.query(AIDemoMeeting).filter(
            AIDemoMeeting.scheduled_time > datetime.utcnow(),
            AIDemoMeeting.status.in_(['scheduled', 'ai_joined'])
        ).order_by(AIDemoMeeting.scheduled_time.asc()).limit(limit).all()
        
        # Convert to dict format
        meeting_list = []
        for meeting in meetings:
            meeting_dict = {
                "meeting_id": meeting.meeting_id,
                "customer_email": meeting.customer_email,
                "customer_name": meeting.customer_name,
                "company_name": meeting.company_name,
                "scheduled_time": meeting.scheduled_time.isoformat() if meeting.scheduled_time else None,
                "timezone": meeting.timezone,
                "daily_room_url": meeting.daily_room_url,
                "status": meeting.status,
                "created_at": meeting.created_at.isoformat() if meeting.created_at else None
            }
            meeting_list.append(meeting_dict)
        
        return {
            "meetings": meeting_list,
            "total": len(meeting_list)
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
        from database.session import get_db
        from models.ai_demo_models import AIDemoMeeting
        
        db = next(get_db())
        
        # Query past meetings
        meetings = db.query(AIDemoMeeting).filter(
            AIDemoMeeting.scheduled_time < datetime.utcnow(),
            AIDemoMeeting.status.in_(['completed', 'cancelled', 'no_show'])
        ).order_by(AIDemoMeeting.scheduled_time.desc()).limit(limit).all()
        
        # Convert to dict format
        meeting_list = []
        for meeting in meetings:
            meeting_dict = {
                "meeting_id": meeting.meeting_id,
                "customer_email": meeting.customer_email,
                "customer_name": meeting.customer_name,
                "company_name": meeting.company_name,
                "scheduled_time": meeting.scheduled_time.isoformat() if meeting.scheduled_time else None,
                "timezone": meeting.timezone,
                "customer_join_url": meeting.customer_join_url,
                "status": meeting.status,
                "created_at": meeting.created_at.isoformat() if meeting.created_at else None,
                "ended_at": meeting.ended_at.isoformat() if meeting.ended_at else None,
                "duration_seconds": meeting.actual_duration_seconds,
                "icp_fit": meeting.icp_fit,
                "cta_taken": meeting.cta_taken
            }
            meeting_list.append(meeting_dict)
        
        return {
            "meetings": meeting_list,
            "total": len(meeting_list)
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
        from database.session import get_db
        from models.ai_demo_models import AIDemoAnalytics
        
        db = next(get_db())
        
        # Get today's analytics
        analytics = db.query(AIDemoAnalytics).filter(
            AIDemoAnalytics.date == datetime.utcnow().date()
        ).first()
        
        if analytics:
            response = {
                "total_demos": analytics.total_demos_scheduled or 0,
                "icp_fit_rate": float(analytics.icp_fit_rate or 0.0),
                "cta_conversion_rate": float(analytics.cta_conversion_rate or 0.0),
                "avg_cost_per_demo": float(analytics.avg_cost_per_demo_usd or 0.0),
                "human_takeover_rate": float(analytics.human_takeover_rate or 0.0)
            }
        else:
            # If no analytics for today, return zeros
            response = {
                "total_demos": 0,
                "icp_fit_rate": 0.0,
                "cta_conversion_rate": 0.0,
                "avg_cost_per_demo": 0.0,
                "human_takeover_rate": 0.0
            }
        
        return response
        
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
