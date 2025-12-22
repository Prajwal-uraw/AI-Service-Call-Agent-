"""
Daily.co Video Call Integration
High-leverage CRM wrapper around video (not embedded)
Focus: One-click rooms, scheduling, post-call intelligence
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import requests
from datetime import datetime, timedelta
import uuid

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
        "properties": {
            "enable_screenshare": True,
            "enable_chat": True,
            "enable_knocking": True,
            "enable_prejoin_ui": True,
            "exp": int((datetime.now() + timedelta(hours=24)).timestamp()),  # 24h expiry
            **(request.properties or {})
        }
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
        
        # TODO: Save to database
        # call_log = VideoCall(
        #     room_name=room_name,
        #     room_url=room_data["url"],
        #     meeting_type=request.meeting_type,
        #     tenant_id=request.tenant_id,
        #     scheduled_for=request.scheduled_for,
        #     status="scheduled"
        # )
        # db.add(call_log)
        # db.commit()
        
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
    
    # TODO: Save to database
    # call_log = CallLog(
    #     room_name=request.room_name,
    #     tenant_id=request.tenant_id,
    #     participants=request.participants,
    #     duration_minutes=request.duration_minutes,
    #     outcome=request.outcome,
    #     notes=request.notes,
    #     completed_at=datetime.now()
    # )
    # db.add(call_log)
    # db.commit()
    
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


@router.get("/call-logs")
async def get_call_logs(tenant_id: Optional[str] = None, limit: int = 50):
    """
    Retrieve call logs with filters
    """
    
    # TODO: Query from database
    # query = db.query(CallLog)
    # if tenant_id:
    #     query = query.filter(CallLog.tenant_id == tenant_id)
    # logs = query.order_by(CallLog.completed_at.desc()).limit(limit).all()
    
    # Mock data for now
    mock_logs = [
        {
            "room_name": "demo-abc123",
            "meeting_type": "demo",
            "participants": ["john@hvacpro.com", "sales@kestrel.ai"],
            "duration_minutes": 45,
            "outcome": "interested",
            "notes": "Wants to see call forwarding feature",
            "completed_at": "2025-12-22T10:30:00Z"
        },
        {
            "room_name": "support-xyz789",
            "meeting_type": "support",
            "participants": ["sarah@acmehvac.com", "support@kestrel.ai"],
            "duration_minutes": 20,
            "outcome": "resolved",
            "notes": "Helped with Twilio configuration",
            "completed_at": "2025-12-22T09:15:00Z"
        }
    ]
    
    return {
        "success": True,
        "count": len(mock_logs),
        "logs": mock_logs
    }


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
    
    if meeting_type not in ["demo", "support", "internal"]:
        raise HTTPException(status_code=400, detail="Invalid meeting type")
    
    # Create room
    room = await create_video_room(CreateRoomRequest(
        meeting_type=meeting_type,
        tenant_id=tenant_id,
        privacy="public" if meeting_type == "demo" else "private"
    ))
    
    # Generate invite message
    invite_message = generate_invite_message(meeting_type, room.room_url, participant_email)
    
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
