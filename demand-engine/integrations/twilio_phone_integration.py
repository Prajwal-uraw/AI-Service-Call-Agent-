"""
Twilio Phone Integration for AI Call Intelligence
Enables AI listening on regular phone calls
"""

import os
import logging
from typing import Dict, Any, Optional
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Start, Stream

logger = logging.getLogger(__name__)

class TwilioPhoneIntegration:
    """
    Integrates AI Call Intelligence with Twilio phone calls
    
    Features:
    - Stream audio to AI for analysis
    - Real-time coaching signals
    - Call recording
    - Transcript generation
    """
    
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.app_url = os.getenv("APP_URL", "https://yourapp.com")
        
        if not all([self.account_sid, self.auth_token]):
            logger.warning("Twilio credentials not configured")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
    
    def generate_twiml_with_ai_stream(
        self,
        to_number: str,
        meeting_id: str,
        enable_ai: bool = True
    ) -> str:
        """
        Generate TwiML that streams audio to AI service
        
        Args:
            to_number: Number to dial
            meeting_id: Meeting ID for AI tracking
            enable_ai: Whether to enable AI listening
            
        Returns:
            TwiML XML string
        """
        response = VoiceResponse()
        
        if enable_ai:
            # Start media stream to AI service
            start = Start()
            stream = Stream(
                url=f"wss://{self.app_url}/ai/stream/{meeting_id}",
                track="both_tracks"  # Stream both caller and callee audio
            )
            start.append(stream)
            response.append(start)
        
        # Dial the number
        response.dial(
            to_number,
            record="record-from-answer",
            recording_status_callback=f"{self.app_url}/api/twilio/recording"
        )
        
        return str(response)
    
    async def create_call_with_ai(
        self,
        from_number: str,
        to_number: str,
        meeting_id: str,
        enable_ai: bool = True
    ) -> Dict[str, Any]:
        """
        Create outbound call with AI listening enabled
        
        Returns:
            {
                "call_sid": "CA...",
                "status": "initiated",
                "ai_enabled": True,
                "stream_url": "wss://..."
            }
        """
        if not self.client:
            raise Exception("Twilio not configured")
        
        try:
            twiml = self.generate_twiml_with_ai_stream(to_number, meeting_id, enable_ai)
            
            call = self.client.calls.create(
                to=to_number,
                from_=from_number,
                twiml=twiml,
                status_callback=f"{self.app_url}/api/twilio/status",
                status_callback_event=['initiated', 'ringing', 'answered', 'completed']
            )
            
            return {
                "call_sid": call.sid,
                "status": "initiated",
                "ai_enabled": enable_ai,
                "stream_url": f"wss://{self.app_url}/ai/stream/{meeting_id}" if enable_ai else None,
                "meeting_id": meeting_id
            }
            
        except Exception as e:
            logger.error(f"Error creating call with AI: {e}")
            raise


# Singleton instance
_twilio_phone_integration: Optional[TwilioPhoneIntegration] = None

def get_twilio_phone_integration() -> TwilioPhoneIntegration:
    """Get or create Twilio phone integration instance"""
    global _twilio_phone_integration
    if _twilio_phone_integration is None:
        _twilio_phone_integration = TwilioPhoneIntegration()
    return _twilio_phone_integration
