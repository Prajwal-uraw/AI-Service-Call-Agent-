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
import json
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
        
        # Google Calendar API settings
        self.google_calendar_enabled = os.getenv("GOOGLE_CALENDAR_ENABLED", "false").lower() == "true"
        self.google_credentials_path = os.getenv("GOOGLE_CREDENTIALS_PATH")
        
        # Resend API settings
        self.resend_api_key = os.getenv("RESEND_API_KEY")
        self.resend_from_email = os.getenv("RESEND_FROM_EMAIL", "noreply@kestrel.ai")
        
        # Debug: Check if Resend API key is loaded
        print(f" DEBUG - Resend API Key exists: {bool(self.resend_api_key)}")
        print(f" DEBUG - Resend API Key starts with 're_': {self.resend_api_key.startswith('re_') if self.resend_api_key else 'No key found'}")
        print(f" DEBUG - Resend From Email: {self.resend_from_email}")
        print(f" DEBUG - Resend API Key length: {len(self.resend_api_key) if self.resend_api_key else 0}")
        
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
        Create calendar event using Google Calendar API
        """
        if not self.google_calendar_enabled:
            logger.info("Google Calendar integration disabled, using placeholder")
            return f"cal_{uuid.uuid4().hex[:8]}"
        
        try:
            # Import Google Calendar libraries
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            from googleapiclient.errors import HttpError
            
            # Load credentials
            credentials = service_account.Credentials.from_service_account_file(
                self.google_credentials_path,
                scopes=['https://www.googleapis.com/auth/calendar']
            )
            
            # Build Calendar service
            service = build('calendar', 'v3', credentials=credentials)
            
            # Calculate end time (15 minutes)
            end_time = scheduled_time + timedelta(minutes=15)
            
            # Create event
            event = {
                'summary': f'AI Demo with {customer_name}',
                'description': f'Interactive AI demo for {customer_name} from {customer_email}\n\nJoin call: {join_url}',
                'start': {
                    'dateTime': scheduled_time.isoformat(),
                    'timeZone': 'America/New_York',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'America/New_York',
                },
                'attendees': [
                    {'email': customer_email},
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 15},
                        {'method': 'popup', 'minutes': 10},
                    ],
                },
            }
            
            # Insert event
            event = service.events().insert(
                calendarId='primary',
                body=event,
                sendUpdates='all'
            ).execute()
            
            calendar_event_id = event['id']
            logger.info(f"Created Google Calendar event: {calendar_event_id}")
            return calendar_event_id
            
        except ImportError:
            logger.warning("Google Calendar libraries not installed, using placeholder")
            return f"cal_{uuid.uuid4().hex[:8]}"
        except Exception as e:
            logger.error(f"Failed to create Google Calendar event: {e}")
            # Fallback to placeholder
            return f"cal_{uuid.uuid4().hex[:8]}"
    
    async def _send_confirmation_email(
        self,
        customer_email: str,
        customer_name: str,
        scheduled_time: datetime,
        join_url: str
    ):
        """
        Send confirmation email using Resend API
        """
        if not self.resend_api_key:
            logger.warning("Resend API key not configured, skipping email")
            return
        
        try:
            headers = {
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json"
            }
            
            email_data = {
                "from": self.resend_from_email,
                "to": [customer_email],
                "subject": "Your AI Demo with Kestrel AI is Confirmed",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">AI Demo Confirmed!</h2>
                    
                    <p>Hi {customer_name},</p>
                    
                    <p>Your AI demo is confirmed for <strong>{scheduled_time.strftime('%B %d, %Y at %I:%M %p')}</strong>.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Join Your Demo:</h3>
                        <a href="{join_url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Join AI Demo Call
                        </a>
                    </div>
                    
                    <h3>What to expect:</h3>
                    <ul>
                        <li>15-minute interactive demo</li>
                        <li>See our AI voice agent in action</li>
                        <li>Get answers to your questions</li>
                        <li>Discuss next steps</li>
                    </ul>
                    
                    <p>See you soon!</p>
                    
                    <p>Best regards,<br>The Kestrel AI Team</p>
                </div>
                """
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers=headers,
                    json=email_data
                )
                response.raise_for_status()
                
            logger.info(f"Confirmation email sent to {customer_email}")
            
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {e}")
            # Don't raise - email failure shouldn't break meeting creation
    
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
    
    async def cancel_calendar_event(self, event_id: str, provider: str):
        """
        Cancel calendar event
        """
        if provider == "google" and self.google_calendar_enabled:
            try:
                from google.oauth2 import service_account
                from googleapiclient.discovery import build
                
                credentials = service_account.Credentials.from_service_account_file(
                    self.google_credentials_path,
                    scopes=['https://www.googleapis.com/auth/calendar']
                )
                
                service = build('calendar', 'v3', credentials=credentials)
                
                service.events().delete(
                    calendarId='primary',
                    eventId=event_id
                ).execute()
                
                logger.info(f"Cancelled Google Calendar event: {event_id}")
                
            except ImportError:
                logger.warning("Google Calendar libraries not installed")
            except Exception as e:
                logger.error(f"Failed to cancel Google Calendar event: {e}")
                raise
        else:
            logger.info(f"Calendar cancellation not implemented for provider: {provider}")
    
    async def send_cancellation_email(
        self,
        customer_email: str,
        customer_name: str,
        scheduled_time: datetime
    ):
        """
        Send cancellation email using Resend API
        """
        if not self.resend_api_key:
            logger.warning("Resend API key not configured, skipping cancellation email")
            return
        
        try:
            headers = {
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json"
            }
            
            email_data = {
                "from": self.resend_from_email,
                "to": [customer_email],
                "subject": "Your AI Demo with Kestrel AI Has Been Cancelled",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Demo Cancelled</h2>
                    
                    <p>Hi {customer_name},</p>
                    
                    <p>Your AI demo scheduled for <strong>{scheduled_time.strftime('%B %d, %Y at %I:%M %p')}</strong> has been cancelled.</p>
                    
                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                        <p>If you didn't request this cancellation, please contact us immediately.</p>
                    </div>
                    
                    <p>You can reschedule your demo at any time by visiting our website or contacting our team.</p>
                    
                    <p>We apologize for any inconvenience.</p>
                    
                    <p>Best regards,<br>The Kestrel AI Team</p>
                </div>
                """
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers=headers,
                    json=email_data
                )
                response.raise_for_status()
                
            logger.info(f"Cancellation email sent to {customer_email}")
            
        except Exception as e:
            logger.error(f"Failed to send cancellation email: {e}")
            # Don't raise - email failure shouldn't break cancellation
    
    async def mute_ai_bot(self, room_name: str):
        """
        Mute AI bot in Daily.co room
        This is a placeholder implementation - actual muting would depend on your AI bot architecture
        """
        try:
            # This would typically involve:
            # 1. Finding the AI participant in the room
            # 2. Sending a mute command via Daily.co API or your AI controller
            # 3. Stopping the AI from speaking/transcribing
            
            # For now, we'll log the action
            logger.info(f"AI bot muted in room: {room_name}")
            
            # In a real implementation, you might:
            # - Call your AI service to stop processing
            # - Use Daily.co API to mute specific participant
            # - Send a control message to your AI agent
            
        except Exception as e:
            logger.error(f"Failed to mute AI bot: {e}")
            raise


# Singleton instance
_ai_demo_service: Optional[AIDemoService] = None

def get_ai_demo_service() -> AIDemoService:
    """Get or create AI demo service instance"""
    global _ai_demo_service
    if _ai_demo_service is None:
        _ai_demo_service = AIDemoService()
    return _ai_demo_service
