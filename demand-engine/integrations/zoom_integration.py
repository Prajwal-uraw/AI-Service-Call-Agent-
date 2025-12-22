"""
Zoom Integration for AI Call Intelligence
Enables AI listening on Zoom meetings via webhooks
"""

import os
import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

class ZoomIntegration:
    """
    Integrates AI Call Intelligence with Zoom meetings
    
    Features:
    - Webhook for meeting events
    - Recording download
    - Transcript generation
    - AI analysis of recordings
    """
    
    def __init__(self):
        self.client_id = os.getenv("ZOOM_CLIENT_ID")
        self.client_secret = os.getenv("ZOOM_CLIENT_SECRET")
        self.webhook_secret = os.getenv("ZOOM_WEBHOOK_SECRET")
        self.api_url = "https://api.zoom.us/v2"
        
        if not all([self.client_id, self.client_secret]):
            logger.warning("Zoom credentials not configured")
    
    async def verify_webhook(self, headers: Dict[str, str], body: str) -> bool:
        """
        Verify Zoom webhook signature
        
        Args:
            headers: Request headers
            body: Request body
            
        Returns:
            True if signature is valid
        """
        # TODO: Implement signature verification
        # https://marketplace.zoom.us/docs/api-reference/webhook-reference/
        return True
    
    async def handle_meeting_started(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle meeting.started webhook event
        
        Args:
            event_data: Zoom webhook payload
            
        Returns:
            {
                "meeting_id": "123456789",
                "ai_enabled": True,
                "status": "listening"
            }
        """
        try:
            meeting_id = event_data.get("object", {}).get("id")
            meeting_uuid = event_data.get("object", {}).get("uuid")
            
            logger.info(f"Zoom meeting started: {meeting_id}")
            
            # TODO: Enable AI listening for this meeting
            # This would typically involve:
            # 1. Creating a meeting record in database
            # 2. Starting AI Sales Shadow
            # 3. Waiting for recording to be available
            
            return {
                "meeting_id": meeting_id,
                "meeting_uuid": meeting_uuid,
                "ai_enabled": True,
                "status": "listening"
            }
            
        except Exception as e:
            logger.error(f"Error handling meeting started: {e}")
            raise
    
    async def handle_recording_completed(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle recording.completed webhook event
        
        Downloads recording and runs AI analysis
        
        Args:
            event_data: Zoom webhook payload
            
        Returns:
            {
                "meeting_id": "123456789",
                "recording_url": "https://...",
                "analysis_status": "processing"
            }
        """
        try:
            meeting_id = event_data.get("object", {}).get("id")
            recording_files = event_data.get("object", {}).get("recording_files", [])
            
            # Find audio recording
            audio_recording = None
            for file in recording_files:
                if file.get("file_type") == "MP4" or file.get("file_type") == "M4A":
                    audio_recording = file
                    break
            
            if not audio_recording:
                logger.warning(f"No audio recording found for meeting {meeting_id}")
                return {
                    "meeting_id": meeting_id,
                    "error": "No audio recording found"
                }
            
            download_url = audio_recording.get("download_url")
            
            logger.info(f"Zoom recording completed: {meeting_id}")
            
            # TODO: Download recording and run AI analysis
            # This would involve:
            # 1. Download audio file
            # 2. Transcribe with OpenAI Whisper
            # 3. Run Deal Control Plane analysis
            # 4. Generate follow-up email
            
            return {
                "meeting_id": meeting_id,
                "recording_url": download_url,
                "analysis_status": "processing"
            }
            
        except Exception as e:
            logger.error(f"Error handling recording completed: {e}")
            raise
    
    async def download_recording(
        self,
        download_url: str,
        access_token: str
    ) -> bytes:
        """
        Download Zoom recording
        
        Args:
            download_url: Recording download URL
            access_token: Zoom access token
            
        Returns:
            Audio file bytes
        """
        try:
            headers = {
                "Authorization": f"Bearer {access_token}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(download_url, headers=headers)
                response.raise_for_status()
                return response.content
                
        except Exception as e:
            logger.error(f"Error downloading recording: {e}")
            raise


# Singleton instance
_zoom_integration: Optional[ZoomIntegration] = None

def get_zoom_integration() -> ZoomIntegration:
    """Get or create Zoom integration instance"""
    global _zoom_integration
    if _zoom_integration is None:
        _zoom_integration = ZoomIntegration()
    return _zoom_integration
