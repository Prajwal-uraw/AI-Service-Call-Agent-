"""
Email Sender Integration for Follow-Up Autopilot
Uses Resend API for sending emails
"""

import os
import logging
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger(__name__)

class EmailSender:
    """
    Email sending service using Resend API
    
    Features:
    - Send follow-up emails
    - Track open rates
    - Track reply rates
    - Schedule emails
    """
    
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.api_url = "https://api.resend.com"
        self.from_email = os.getenv("FROM_EMAIL", "noreply@kestrel.ai")
        
        if not self.api_key:
            logger.warning("Resend API key not configured")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        from_name: Optional[str] = None,
        reply_to: Optional[str] = None,
        track_opens: bool = True,
        track_clicks: bool = True
    ) -> Dict[str, Any]:
        """
        Send email via Resend
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body: Email body (plain text or HTML)
            from_name: Sender name
            reply_to: Reply-to email
            track_opens: Track email opens
            track_clicks: Track link clicks
            
        Returns:
            {
                "email_id": "re_...",
                "status": "sent",
                "to": "john@example.com"
            }
        """
        if not self.api_key:
            raise Exception("Resend API key not configured")
        
        try:
            from_address = f"{from_name} <{self.from_email}>" if from_name else self.from_email
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "from": from_address,
                "to": [to_email],
                "subject": subject,
                "text": body,
                "reply_to": reply_to or self.from_email
            }
            
            # Add tracking
            if track_opens or track_clicks:
                payload["tags"] = []
                if track_opens:
                    payload["tags"].append({"name": "track_opens", "value": "true"})
                if track_clicks:
                    payload["tags"].append({"name": "track_clicks", "value": "true"})
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/emails",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
            
            logger.info(f"Email sent to {to_email}: {result.get('id')}")
            
            return {
                "email_id": result.get("id"),
                "status": "sent",
                "to": to_email,
                "subject": subject
            }
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            raise
    
    async def send_follow_up(
        self,
        to_email: str,
        customer_name: str,
        subject: str,
        body: str,
        from_name: str = "Kestrel AI"
    ) -> Dict[str, Any]:
        """
        Send follow-up email with tracking
        
        Convenience method for Follow-Up Autopilot
        """
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            body=body,
            from_name=from_name,
            track_opens=True,
            track_clicks=True
        )
    
    async def schedule_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        send_at: str,  # ISO 8601 format
        from_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Schedule email for later delivery
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body: Email body
            send_at: ISO 8601 timestamp (e.g., "2025-12-23T14:00:00Z")
            from_name: Sender name
            
        Returns:
            {
                "email_id": "re_...",
                "status": "scheduled",
                "send_at": "2025-12-23T14:00:00Z"
            }
        """
        if not self.api_key:
            raise Exception("Resend API key not configured")
        
        try:
            from_address = f"{from_name} <{self.from_email}>" if from_name else self.from_email
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "from": from_address,
                "to": [to_email],
                "subject": subject,
                "text": body,
                "scheduled_at": send_at
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/emails",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
            
            logger.info(f"Email scheduled for {to_email} at {send_at}")
            
            return {
                "email_id": result.get("id"),
                "status": "scheduled",
                "send_at": send_at,
                "to": to_email
            }
            
        except Exception as e:
            logger.error(f"Error scheduling email: {e}")
            raise
    
    async def get_email_status(self, email_id: str) -> Dict[str, Any]:
        """
        Get email delivery status
        
        Returns:
            {
                "email_id": "re_...",
                "status": "delivered",
                "opened": True,
                "clicked": False,
                "opened_at": "2025-12-22T10:05:00Z"
            }
        """
        if not self.api_key:
            raise Exception("Resend API key not configured")
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/emails/{email_id}",
                    headers=headers
                )
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            logger.error(f"Error getting email status: {e}")
            raise


# Singleton instance
_email_sender: Optional[EmailSender] = None

def get_email_sender() -> EmailSender:
    """Get or create email sender instance"""
    global _email_sender
    if _email_sender is None:
        _email_sender = EmailSender()
    return _email_sender
