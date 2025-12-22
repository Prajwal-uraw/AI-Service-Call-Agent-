"""
CRM Activities API
Track all interactions and timeline events
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/crm/activities", tags=["CRM - Activities"])

# Models
class ActivityCreate(BaseModel):
    lead_id: Optional[str] = None
    contact_id: Optional[str] = None
    activity_type: str  # email, call, note, meeting, task, status_change
    subject: Optional[str] = None
    description: Optional[str] = None
    direction: Optional[str] = None  # inbound, outbound
    outcome: Optional[str] = None
    email_id: Optional[str] = None
    call_duration: Optional[int] = None
    call_recording_url: Optional[str] = None
    created_by: Optional[str] = "system"
    activity_date: Optional[datetime] = None
    metadata: dict = {}


@router.get("/")
async def get_activities(
    limit: int = 50,
    offset: int = 0,
    lead_id: Optional[str] = None,
    contact_id: Optional[str] = None,
    activity_type: Optional[str] = None
):
    """Get activities with filtering"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("activities").select("*")
        
        if lead_id:
            query = query.eq("lead_id", lead_id)
        
        if contact_id:
            query = query.eq("contact_id", contact_id)
        
        if activity_type:
            query = query.eq("activity_type", activity_type)
        
        response = query.order("activity_date", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "activities": response.data,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{activity_id}")
async def get_activity(activity_id: str):
    """Get single activity"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("activities").select("*").eq("id", activity_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_activity(activity: ActivityCreate):
    """Create new activity"""
    try:
        supabase = get_supabase()
        
        activity_data = activity.dict()
        
        if not activity_data.get("activity_date"):
            activity_data["activity_date"] = datetime.now().isoformat()
        
        response = supabase.table("activities").insert(activity_data).execute()
        
        # Update last_contact_at on lead if applicable
        if activity_data.get("lead_id"):
            supabase.table("leads").update({
                "last_contact_at": activity_data["activity_date"]
            }).eq("id", activity_data["lead_id"]).execute()
        
        return {
            "success": True,
            "activity": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}/timeline")
async def get_lead_timeline(lead_id: str, limit: int = 100):
    """Get complete timeline for a lead (activities + notes + tasks)"""
    try:
        supabase = get_supabase()
        
        # Get activities
        activities = supabase.table("activities").select("*").eq("lead_id", lead_id).order("activity_date", desc=True).limit(limit).execute()
        
        # Get notes
        notes = supabase.table("notes").select("*").eq("lead_id", lead_id).order("created_at", desc=True).limit(limit).execute()
        
        # Get tasks
        tasks = supabase.table("tasks").select("*").eq("lead_id", lead_id).order("created_at", desc=True).limit(limit).execute()
        
        # Combine and sort by date
        timeline = []
        
        for activity in activities.data or []:
            timeline.append({
                "type": "activity",
                "date": activity.get("activity_date"),
                "data": activity
            })
        
        for note in notes.data or []:
            timeline.append({
                "type": "note",
                "date": note.get("created_at"),
                "data": note
            })
        
        for task in tasks.data or []:
            timeline.append({
                "type": "task",
                "date": task.get("created_at"),
                "data": task
            })
        
        # Sort by date descending
        timeline.sort(key=lambda x: x["date"] if x["date"] else "", reverse=True)
        
        return timeline[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/email/track")
async def track_email_event(
    email_id: str,
    event_type: str,  # opened, clicked, bounced, delivered
    contact_id: Optional[str] = None,
    lead_id: Optional[str] = None
):
    """Track email events from Resend webhooks"""
    try:
        supabase = get_supabase()
        
        # Find activity by email_id
        activity_response = supabase.table("activities").select("*").eq("email_id", email_id).execute()
        
        if activity_response.data:
            activity = activity_response.data[0]
            
            # Update activity
            update_data = {"email_status": event_type}
            
            if event_type == "opened":
                update_data["email_opens"] = (activity.get("email_opens", 0) or 0) + 1
            elif event_type == "clicked":
                update_data["email_clicks"] = (activity.get("email_clicks", 0) or 0) + 1
            
            supabase.table("activities").update(update_data).eq("id", activity["id"]).execute()
            
            # Update lead engagement metrics
            if activity.get("lead_id"):
                lead_update = {}
                if event_type == "opened":
                    lead_update["email_opens"] = supabase.rpc("increment", {"row_id": activity["lead_id"], "table_name": "leads", "column_name": "email_opens"})
                elif event_type == "clicked":
                    lead_update["email_clicks"] = supabase.rpc("increment", {"row_id": activity["lead_id"], "table_name": "leads", "column_name": "email_clicks"})
                
                if lead_update:
                    supabase.table("leads").update(lead_update).eq("id", activity["lead_id"]).execute()
        
        return {"success": True, "event": event_type}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
