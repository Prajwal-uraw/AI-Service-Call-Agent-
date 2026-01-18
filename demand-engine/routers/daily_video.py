"""
Daily.co Video Call Integration
High-leverage CRM wrapper around video (not embedded)
Focus: One-click rooms, scheduling, post-call intelligence
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import requests
from datetime import datetime, timedelta
import uuid
import logging
from database.session import get_db
from models.tenant_models import CallLog, Tenant
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/video", tags=["Video Calls"])

DAILY_API_KEY = os.getenv("DAILY_API_KEY", "9c5f74ef6f5577ed5109485abdf000fcf1e702d9d334fe0839b96aff30279e5c")
DAILY_API_BASE = "https://api.daily.co/v1"

headers = {
    "Authorization": f"Bearer {DAILY_API_KEY}",
    "Content-Type": "application/json"
}


class CreateRoomRequest(BaseModel):
    name: Optional[str] = None
    privacy: str = "public"  # public or private
    properties: Optional[Dict[str, Any]] = None
    meeting_type: str = "demo"  # demo, support, internal
    tenant_id: Optional[str] = None
    scheduled_for: Optional[str] = None
    
    def validate_properties(self):
        """Validate that only valid Daily.co properties are included"""
        if not self.properties:
            return {}
        
        # List of valid Daily.co properties (from documentation)
        valid_properties = {
            "enable_screenshare", "enable_chat", "enable_knocking", "enable_prejoin_ui",
            "exp", "start_audio_off", "start_video_off", "enable_recording",
            "owner_only_broadcast", "enable_lobby_messaging", "enable_people_ui",
            "enable_people_count", "max_participants", "eject_at_room_exp",
            "enable_dialout", "enable_sip", "enable_pstn_dialout",
            "enable_ringing", "enable_simulcast", "enable_background_noise",
            "enable_background_blur", "avatar_type", "enable_screenshare_sources",
            "enable_camera Facing", "enable_orientation", "enable_hand_raise",
            "enable_hand_raise_action", "enable_bookmarks_bar", "enable_bookmarks",
            "enable_faces", "enable_physics", "enable_remote_control",
            "enable_workspace_layout", "enable_workspace_tabs"
        }
        
        # Filter out invalid properties
        filtered_properties = {}
        for key, value in self.properties.items():
            if key in valid_properties:
                filtered_properties[key] = value
            else:
                logger.warning(f"Invalid Daily.co property ignored: {key}")
        
        return filtered_properties


class RoomResponse(BaseModel):
    room_name: str
    room_url: str
    meeting_token: Optional[str] = None
    meeting_type: str
    created_at: str


class CallLogRequest(BaseModel):
    room_name: str
    tenant_id: Optional[str] = None
    participants: List[str]
    duration_minutes: int
    outcome: str
    notes: Optional[str] = None


@router.post("/create-room", response_model=RoomResponse)
async def create_video_room(request: CreateRoomRequest):
    """
    Create Daily.co room for video calls
    High-leverage: One-click room creation with auto-invite link
    """
    
    # Generate unique room name if not provided
    room_name = request.name or f"{request.meeting_type}-{uuid.uuid4().hex[:8]}"
    
    # Room configuration
    room_config = {
        "name": room_name,
        "privacy": request.privacy,
        "properties": request.validate_properties()  # Use only valid Daily.co properties
    }
    
    try:
        # Create room via Daily API
        response = requests.post(
            f"{DAILY_API_BASE}/rooms",
            headers=headers,
            json=room_config
        )
        
        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Daily API error: {response.text}"
            )
        
        room_data = response.json()
        
        # Save to database
        db = next(get_db())
        
        try:
            # Insert into call_records table instead of call_logs
            insert_query = """
            INSERT INTO call_records (
                call_sid,
                phone_number,
                direction,
                duration_seconds,
                status,
                disposition,
                transcript,
                summary,
                call_started_at,
                call_ended_at,
                created_at,
                recording_url
            ) VALUES (
                :call_sid,
                :phone_number,
                :direction,
                :duration_seconds,
                :status,
                :disposition,
                :transcript,
                :summary,
                :call_started_at,
                :call_ended_at,
                :created_at,
                :recording_url
            )
            """
            
            db.execute(text(insert_query), {
                "call_sid": f"room_{room_name}",
                "phone_number": "system",
                "direction": "outbound",
                "duration_seconds": 0,
                "status": "created",
                "disposition": "room_created",
                "transcript": f"Created room: {room_name} for {request.meeting_type}",
                "summary": f"Room creation: {room_name}",
                "call_started_at": datetime.now(),
                "call_ended_at": datetime.now(),
                "created_at": datetime.now(),
                "recording_url": room_data["url"]
            })
            
            db.commit()
            
            logger.info(f"Saved room creation to call_records table: {room_name}")
            
        except Exception as db_error:
            logger.error(f"Failed to save room to database: {db_error}")
            db.rollback()
            # Continue with response even if DB save fails
        
        return RoomResponse(
            room_name=room_data["name"],
            room_url=room_data["url"],
            meeting_type=request.meeting_type,
            created_at=datetime.now().isoformat()
        )
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to create room: {str(e)}")


@router.get("/rooms")
async def list_rooms(limit: int = 20):
    """
    List all active Daily.co rooms
    """
    try:
        response = requests.get(
            f"{DAILY_API_BASE}/rooms",
            headers=headers,
            params={"limit": limit}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Daily API error: {response.text}"
            )
        
        return response.json()
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to list rooms: {str(e)}")


@router.delete("/rooms/{room_name}")
async def delete_room(room_name: str):
    """
    Delete a Daily.co room
    """
    try:
        response = requests.delete(
            f"{DAILY_API_BASE}/rooms/{room_name}",
            headers=headers
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Daily API error: {response.text}"
            )
        
        return {"success": True, "message": f"Room {room_name} deleted"}
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete room: {str(e)}")


@router.post("/meeting-token")
async def create_meeting_token(room_name: str, user_name: str, is_owner: bool = False):
    """
    Create meeting token for authenticated access
    """
    try:
        token_config = {
            "properties": {
                "room_name": room_name,
                "user_name": user_name,
                "is_owner": is_owner,
                "enable_screenshare": True,
                "enable_recording": is_owner
            }
        }
        
        response = requests.post(
            f"{DAILY_API_BASE}/meeting-tokens",
            headers=headers,
            json=token_config
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Daily API error: {response.text}"
            )
        
        return response.json()
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to create token: {str(e)}")


@router.post("/log-call")
async def log_call(request: CallLogRequest):
    """
    Post-call intelligence: Log call details, participants, outcome
    """
    db = next(get_db())
    
    try:
        # First, ensure call_records table exists
        create_table_query = """
        CREATE TABLE IF NOT EXISTS call_records (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
            
            -- Call Details
            call_sid VARCHAR(255), -- VAPI call ID
            phone_number VARCHAR(50),
            direction VARCHAR(20), -- inbound, outbound
            duration_seconds INTEGER,
            
            -- Call Status
            status VARCHAR(50), -- completed, no-answer, busy, failed, voicemail
            disposition VARCHAR(50), -- interested, not_interested, callback, qualified, not_qualified
            
            -- Qualification Results
            qualification_score INTEGER,
            is_qualified BOOLEAN DEFAULT FALSE,
            tier_assigned VARCHAR(20), -- hot, warm, cold
            
            -- Call Content
            transcript TEXT,
            summary TEXT,
            key_points TEXT[],
            objections TEXT[],
            next_steps TEXT,
            
            -- Timestamps
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            call_started_at TIMESTAMP WITH TIME ZONE,
            call_ended_at TIMESTAMP WITH TIME ZONE,
            
            -- Metadata
            recording_url TEXT,
            raw_data JSONB DEFAULT '{}'::jsonb
        );
        """
        
        db.execute(text(create_table_query))
        
        # Insert into call_records table
        insert_query = """
        INSERT INTO call_records (
            call_sid,
            phone_number,
            direction,
            duration_seconds,
            status,
            disposition,
            transcript,
            summary,
            call_started_at,
            call_ended_at,
            created_at
        ) VALUES (
            :call_sid,
            :phone_number,
            :direction,
            :duration_seconds,
            :status,
            :disposition,
            :transcript,
            :summary,
            :call_started_at,
            :call_ended_at,
            :created_at
        )
        """
        
        db.execute(text(insert_query), {
            "call_sid": f"room_{request.room_name}",
            "phone_number": "system",
            "direction": "outbound",
            "duration_seconds": request.duration_minutes * 60,  # Convert minutes to seconds
            "status": "completed",
            "disposition": request.outcome,
            "transcript": f"Call duration: {request.duration_minutes} minutes, Outcome: {request.outcome}",
            "summary": request.notes or f"Call logged: {request.room_name}",
            "call_started_at": datetime.now(),
            "call_ended_at": datetime.now(),
            "created_at": datetime.now()
        })
        
        db.commit()
        
        logger.info(f"Call logged successfully: {request.room_name}")
        
        return {
            "success": True,
            "message": "Call logged successfully",
            "call_log": {
                "room_name": request.room_name,
                "participants": request.participants,
                "duration": f"{request.duration_minutes} minutes",
                "outcome": request.outcome,
                "logged_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to log call: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log call: {str(e)}")


@router.get("/call-logs")
async def get_call_logs(tenant_id: Optional[str] = None, limit: int = 50):
    """
    Retrieve call logs with filters
    """
    db = next(get_db())
    
    try:
        # Use raw SQL to query call_records table since call_logs doesn't exist
        query = """
        SELECT 
            id,
            call_sid,
            status,
            duration_seconds as duration,
            disposition as outcome,
            transcript,
            summary as notes,
            call_started_at as started_at,
            call_ended_at as ended_at,
            created_at
        FROM call_records 
        ORDER BY call_started_at DESC 
        LIMIT :limit
        """
        
        result = db.execute(text(query), {"limit": limit})
        rows = result.fetchall()
        
        # Convert to response format
        log_list = []
        for row in rows:
            log_dict = {
                "room_name": row.call_sid.replace("room_", "") if row.call_sid and row.call_sid.startswith("room_") else row.call_sid or "",
                "meeting_type": "video_call",
                "participants": [],  # Participants stored separately if needed
                "duration_minutes": row.duration or 0,
                "outcome": row.outcome or "unknown",
                "notes": row.notes or "",
                "completed_at": row.started_at.isoformat() if row.started_at else None
            }
            log_list.append(log_dict)
        
        logger.info(f"Retrieved {len(log_list)} call logs from call_records table")
        
        return {
            "success": True,
            "count": len(log_list),
            "logs": log_list
        }
        
    except Exception as e:
        logger.error(f"Failed to retrieve call logs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve call logs: {str(e)}")


# Role-based launch flows
@router.post("/quick-start/{meeting_type}")
async def quick_start_meeting(
    meeting_type: str,
    tenant_id: Optional[str] = None,
    participant_email: Optional[str] = None
):
    """
    High-leverage: One-click meeting start for different types
    - demo: Customer demo
    - support: Support escalation
    - internal: Team meeting
    """
    db = next(get_db())
    
    if meeting_type not in ["demo", "support", "internal"]:
        raise HTTPException(status_code=400, detail="Invalid meeting type")
    
    try:
        # Create room
        room = await create_video_room(CreateRoomRequest(
            meeting_type=meeting_type,
            tenant_id=tenant_id,
            privacy="public" if meeting_type == "demo" else "private"
        ))
        
        # Log room creation to database
        insert_query = """
        INSERT INTO call_records (
            call_sid,
            phone_number,
            direction,
            duration_seconds,
            status,
            disposition,
            transcript,
            summary,
            call_started_at,
            call_ended_at,
            created_at,
            recording_url
        ) VALUES (
            :call_sid,
            :phone_number,
            :direction,
            :duration_seconds,
            :status,
            :disposition,
            :transcript,
            :summary,
            :call_started_at,
            :call_ended_at,
            :created_at,
            :recording_url
        )
        """
        
        db.execute(text(insert_query), {
            "call_sid": f"room_{room.room_name}",
            "phone_number": "system",
            "direction": "outbound",
            "duration_seconds": 0,
            "status": "created",
            "disposition": "room_created",
            "transcript": f"Quick started {meeting_type}: {room.room_name}",
            "summary": f"Quick start: {meeting_type}",
            "call_started_at": datetime.now(),
            "call_ended_at": datetime.now(),
            "created_at": datetime.now(),
            "recording_url": room.room_url
        })
        
        db.commit()
        
        # Generate invite message
        invite_message = generate_invite_message(meeting_type, room.room_url, participant_email)
        
        logger.info(f"Quick meeting created: {room.room_name}")
        
        return {
            "success": True,
            "room_url": room.room_url,
            "room_name": room.room_name,
            "meeting_type": meeting_type,
            "invite_message": invite_message,
            "quick_actions": {
                "copy_link": room.room_url,
                "send_email": f"mailto:{participant_email}?subject=Video Call Invitation&body={invite_message}" if participant_email else None
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to quick start meeting: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to quick start meeting: {str(e)}")


def generate_invite_message(meeting_type: str, room_url: str, participant_email: Optional[str] = None) -> str:
    """
    Generate invite message based on meeting type
    """
    
    templates = {
        "demo": f"""
Hi{f' {participant_email.split("@")[0]}' if participant_email else ''},

Thanks for your interest in Kestrel AI! I've set up a quick demo for you.

Join here: {room_url}

Looking forward to showing you how our AI voice agent can transform your business.

Best,
Kestrel AI Team
        """.strip(),
        
        "support": f"""
Hi{f' {participant_email.split("@")[0]}' if participant_email else ''},

I've created a video call to help resolve your issue quickly.

Join here: {room_url}

We'll get you sorted out right away.

Best,
Kestrel AI Support
        """.strip(),
        
        "internal": f"""
Team,

Quick meeting starting now.

Join here: {room_url}

See you there!
        """.strip()
    }
    
    return templates.get(meeting_type, f"Join video call: {room_url}")
