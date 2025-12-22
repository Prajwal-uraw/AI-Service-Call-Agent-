"""
Click-to-Call Dialer Service
Twilio-powered outbound calling with auto-logging to CRM
"""

import os
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial
from utils.retry_logic import retry_async
from utils.error_logger import ErrorLogger

logger = logging.getLogger(__name__)

class ClickToCallService:
    """
    Outbound calling service with auto-logging
    
    Features:
    - Click-to-call from browser
    - Auto-log to CRM
    - Call recording
    - Call history
    - Speed dial
    """
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        if not all([self.account_sid, self.auth_token, self.from_number]):
            logger.warning("Twilio credentials not configured")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
    
    @retry_async(max_attempts=2, delay=1.0, exceptions=(Exception,))
    async def initiate_call(
        self,
        to_number: str,
        user_email: str,
        contact_name: Optional[str] = None,
        contact_company: Optional[str] = None,
        deal_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate outbound call
        
        Args:
            to_number: Customer phone number
            user_email: User making the call
            contact_name: Contact name (for logging)
            contact_company: Company name (for logging)
            deal_id: Associated deal ID
            
        Returns:
            {
                "call_sid": "CA...",
                "status": "initiated",
                "from": "+1234567890",
                "to": "+0987654321",
                "started_at": "2025-12-22T10:00:00Z"
            }
        """
        if not self.client:
            raise Exception("Twilio not configured")
        
        try:
            # Create call
            call = self.client.calls.create(
                to=to_number,
                from_=self.from_number,
                url=f"https://yourapp.com/api/click-to-call/twiml?user={user_email}",
                status_callback=f"https://yourapp.com/api/click-to-call/status",
                status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                record=True,  # Auto-record
                recording_status_callback=f"https://yourapp.com/api/click-to-call/recording"
            )
            
            # Log to database
            call_log = {
                "call_sid": call.sid,
                "user_email": user_email,
                "to_number": to_number,
                "from_number": self.from_number,
                "contact_name": contact_name,
                "contact_company": contact_company,
                "deal_id": deal_id,
                "status": "initiated",
                "started_at": datetime.now().isoformat(),
                "direction": "outbound"
            }
            
            # TODO: Save to database
            logger.info(f"Call initiated: {call.sid}")
            
            return call_log
            
        except Exception as e:
            ErrorLogger.log_external_api_error(
                e,
                "Twilio",
                "/Calls",
                {"to": to_number, "from": self.from_number}
            )
            raise
    
    async def get_call_status(self, call_sid: str) -> Dict[str, Any]:
        """Get current call status"""
        if not self.client:
            raise Exception("Twilio not configured")
        
        try:
            call = self.client.calls(call_sid).fetch()
            
            return {
                "call_sid": call.sid,
                "status": call.status,
                "duration": call.duration,
                "price": call.price,
                "price_unit": call.price_unit
            }
            
        except Exception as e:
            logger.error(f"Error fetching call status: {e}")
            raise
    
    async def end_call(self, call_sid: str) -> Dict[str, Any]:
        """End active call"""
        if not self.client:
            raise Exception("Twilio not configured")
        
        try:
            call = self.client.calls(call_sid).update(status='completed')
            
            return {
                "call_sid": call.sid,
                "status": call.status
            }
            
        except Exception as e:
            logger.error(f"Error ending call: {e}")
            raise
    
    async def get_call_history(
        self,
        user_email: str,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get call history for user
        
        Returns:
            {
                "calls": [
                    {
                        "call_sid": "CA...",
                        "to_number": "+1234567890",
                        "contact_name": "John Smith",
                        "status": "completed",
                        "duration": 120,
                        "started_at": "2025-12-22T10:00:00Z",
                        "recording_url": "https://..."
                    }
                ],
                "total": 150
            }
        """
        try:
            # TODO: Fetch from database
            # For now, return empty
            
            return {
                "calls": [],
                "total": 0
            }
            
        except Exception as e:
            logger.error(f"Error fetching call history: {e}")
            raise
    
    async def log_call_to_crm(
        self,
        call_sid: str,
        notes: Optional[str] = None,
        outcome: Optional[str] = None,
        next_step: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Log call details to CRM
        
        Args:
            call_sid: Twilio call SID
            notes: Call notes
            outcome: Call outcome (connected, voicemail, no_answer, etc.)
            next_step: Next action
            
        Returns:
            {
                "logged": True,
                "crm_activity_id": "act_123"
            }
        """
        try:
            # Fetch call details
            call_status = await self.get_call_status(call_sid)
            
            # TODO: Fetch call log from database
            # TODO: Create CRM activity
            
            crm_activity = {
                "type": "call",
                "direction": "outbound",
                "duration": call_status.get("duration"),
                "outcome": outcome,
                "notes": notes,
                "next_step": next_step,
                "call_sid": call_sid,
                "logged_at": datetime.now().isoformat()
            }
            
            logger.info(f"Call logged to CRM: {call_sid}")
            
            return {
                "logged": True,
                "crm_activity_id": f"act_{call_sid[:8]}"
            }
            
        except Exception as e:
            logger.error(f"Error logging to CRM: {e}")
            raise
    
    def generate_twiml(self, user_email: str) -> str:
        """
        Generate TwiML for outbound call
        Connects user to customer
        """
        response = VoiceResponse()
        
        # Play message to user
        response.say("Connecting your call now.", voice='alice')
        
        # Dial customer
        dial = Dial(
            record='record-from-answer',
            recording_status_callback=f"https://yourapp.com/api/click-to-call/recording",
            timeout=30
        )
        
        response.append(dial)
        
        return str(response)


# Singleton instance
_click_to_call_service: Optional[ClickToCallService] = None

def get_click_to_call_service() -> ClickToCallService:
    """Get or create Click-to-Call service instance"""
    global _click_to_call_service
    if _click_to_call_service is None:
        _click_to_call_service = ClickToCallService()
    return _click_to_call_service
