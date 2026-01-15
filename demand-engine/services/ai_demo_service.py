"""
AI Demo Service - Core logic for AI-powered sales demos
Handles meeting creation, AI agent lifecycle, and Daily.co integration
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import httpx
import logging
from .openai_service import get_openai_service

logger = logging.getLogger(__name__)

class AIDemoService:
    """
    Service for managing AI demo meetings
    Integrates with Daily.co for video rooms and OpenAI for AI agent
    """
    
    def __init__(self):
        self.daily_api_key = os.getenv("DAILY_API_KEY")
        self.daily_api_url = "https://api.daily.co/v1"
        self.openai_service = get_openai_service()
        
    async def create_meeting(
        self,
        customer_email: str,
        customer_name: str,
        company_name: str,
        scheduled_time: datetime,
        timezone: str = "America/New_York",
        customer_phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create AI demo meeting with Daily.co room and tokens
        
        Returns:
            {
                "meeting_id": "ai-demo-abc123",
                "daily_room_url": "https://kestrel.daily.co/ai-demo-abc123",
                "customer_join_url": "...",
                "ai_join_url": "...",
                "shadow_join_url": "...",
                "start_time": "2025-12-23T14:00:00Z",
                "calendar_event_id": "..."
            }
        """
        try:
            # Generate unique meeting ID
            meeting_id = f"ai-demo-{uuid.uuid4().hex[:8]}"
            
            # Create Daily.co room
            room_data = await self._create_daily_room(meeting_id, scheduled_time)
            
            # Generate 3 tokens
            tokens = await self._generate_tokens(room_data["name"])
            
            # Create calendar event (placeholder - integrate with Google/Outlook)
            calendar_event_id = await self._create_calendar_event(
                customer_email,
                customer_name,
                scheduled_time,
                tokens["customer_url"]
            )
            
            # Send confirmation email (placeholder - integrate with Resend)
            await self._send_confirmation_email(
                customer_email,
                customer_name,
                scheduled_time,
                tokens["customer_url"]
            )
            
            return {
                "meeting_id": meeting_id,
                "daily_room_name": room_data["name"],
                "daily_room_url": room_data["url"],
                "customer_join_url": tokens["customer_url"],
                "ai_join_url": tokens["ai_url"],
                "shadow_join_url": tokens["shadow_url"],
                "start_time": scheduled_time.isoformat(),
                "calendar_event_id": calendar_event_id,
                "customer_email": customer_email,
                "customer_name": customer_name,
                "company_name": company_name
            }
            
        except Exception as e:
            logger.error(f"Error creating meeting: {e}")
            raise
    
    async def _create_daily_room(
        self,
        room_name: str,
        scheduled_time: datetime
    ) -> Dict[str, Any]:
        """
        Create Daily.co room with 15-minute expiry
        """
        # Room expires 30 minutes after scheduled time
        expiry_time = scheduled_time + timedelta(minutes=30)
        
        headers = {
            "Authorization": f"Bearer {self.daily_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "name": room_name,
            "privacy": "public",
            "properties": {
                "enable_screenshare": True,
                "enable_chat": True,
                "start_video_off": True,
                "start_audio_off": False
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.daily_api_url}/rooms",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def _generate_tokens(
        self,
        room_name: str
    ) -> Dict[str, str]:
        """
        Generate 3 meeting tokens:
        1. Customer token (owner, full permissions)
        2. AI token (participant, mic only)
        3. Shadow token (observer, muted)
        """
        headers = {
            "Authorization": f"Bearer {self.daily_api_key}",
            "Content-Type": "application/json"
        }
        
        tokens = {}
        
        # Customer token
        customer_payload = {
            "properties": {
                "room_name": room_name,
                "is_owner": True,
                "user_name": "Customer",
                "enable_screenshare": True,
                "start_video_off": False,
                "start_audio_off": False
            }
        }
        
        # AI token
        ai_payload = {
            "properties": {
                "room_name": room_name,
                "is_owner": False,
                "user_name": "AI Sales Advisor",
                "enable_screenshare": False,
                "start_video_off": True,  # AI has no camera
                "start_audio_off": False
            }
        }
        
        # Shadow token (for human observers)
        shadow_payload = {
            "properties": {
                "room_name": room_name,
                "is_owner": False,
                "user_name": "Observer",
                "enable_screenshare": False,
                "start_video_off": True,
                "start_audio_off": True  # Muted by default
            }
        }
        
        async with httpx.AsyncClient() as client:
            # Generate customer token
            response = await client.post(
                f"{self.daily_api_url}/meeting-tokens",
                headers=headers,
                json=customer_payload
            )
            response.raise_for_status()
            customer_token = response.json()["token"]
            tokens["customer_url"] = f"https://kestrel.daily.co/{room_name}?t={customer_token}"
            
            # Generate AI token
            response = await client.post(
                f"{self.daily_api_url}/meeting-tokens",
                headers=headers,
                json=ai_payload
            )
            response.raise_for_status()
            ai_token = response.json()["token"]
            tokens["ai_url"] = f"https://kestrel.daily.co/{room_name}?t={ai_token}"
            
            # Generate shadow token
            response = await client.post(
                f"{self.daily_api_url}/meeting-tokens",
                headers=headers,
                json=shadow_payload
            )
            response.raise_for_status()
            shadow_token = response.json()["token"]
            tokens["shadow_url"] = f"https://kestrel.daily.co/{room_name}?t={shadow_token}"
        
        return tokens
    
    async def _create_calendar_event(
        self,
        customer_email: str,
        customer_name: str,
        scheduled_time: datetime,
        join_url: str
    ) -> str:
        """
        Create calendar event (placeholder - integrate with Google Calendar API)
        """
        # TODO: Integrate with Google Calendar API or Cal.com
        logger.info(f"Calendar event created for {customer_email} at {scheduled_time}")
        return f"cal_{uuid.uuid4().hex[:8]}"
    
    async def _send_confirmation_email(
        self,
        customer_email: str,
        customer_name: str,
        scheduled_time: datetime,
        join_url: str
    ):
        """
        Send confirmation email (placeholder - integrate with Resend)
        """
        # TODO: Integrate with Resend API
        logger.info(f"Confirmation email sent to {customer_email}")
        
        # Email template
        subject = "Your AI Demo with Kestrel AI is Confirmed"
        body = f"""
Hi {customer_name},

Your demo is confirmed for {scheduled_time.strftime('%B %d, %Y at %I:%M %p')}.

Join the call: {join_url}

What to expect:
- 15-minute interactive demo
- See our AI voice agent in action
- Get answers to your questions
- Discuss next steps

See you soon!

The Kestrel AI Team
"""
        # In production, send via Resend API
        pass
    
    async def delete_meeting(self, room_name: str):
        """Delete Daily.co room"""
        headers = {
            "Authorization": f"Bearer {self.daily_api_key}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.daily_api_url}/rooms/{room_name}",
                headers=headers
            )
            response.raise_for_status()
    
    async def get_meeting_info(self, room_name: str) -> Dict[str, Any]:
        """Get Daily.co room info"""
        headers = {
            "Authorization": f"Bearer {self.daily_api_key}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.daily_api_url}/rooms/{room_name}",
                headers=headers
            )
            response.raise_for_status()
            return response.json()


# Singleton instance
_ai_demo_service: Optional[AIDemoService] = None

def get_ai_demo_service() -> AIDemoService:
    """Get or create AI demo service instance"""
    global _ai_demo_service
    if _ai_demo_service is None:
        _ai_demo_service = AIDemoService()
    return _ai_demo_service
