"""
Lead Capture API - Phone and Email Integration

Handles:
- Phone number capture (displays voice agent number)
- Email delivery of case studies via Resend
- Lead tracking and analytics
"""

import os
from typing import Optional
from datetime import datetime
import httpx

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lead-capture", tags=["Lead Capture"])

# Resend API configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Voice agent number
VOICE_AGENT_NUMBER = "(938) 839-6504"


class PhoneLeadRequest(BaseModel):
    phone_number: str
    source: Optional[str] = "website"


class EmailLeadRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = "website"


class LeadCaptureResponse(BaseModel):
    success: bool
    message: str
    lead_id: Optional[str] = None


@router.post("/phone", response_model=LeadCaptureResponse)
async def capture_phone_lead(request: PhoneLeadRequest):
    """
    Capture phone number and return voice agent number.
    
    Returns:
    - Voice agent phone number
    - Lead ID for tracking
    """
    try:
        # Format phone number (remove non-digits)
        phone = ''.join(filter(str.isdigit, request.phone_number))
        if not phone.startswith('1') and len(phone) == 10:
            phone = '1' + phone
        
        logger.info(f"Phone lead captured: {phone} from {request.source}")
        
        # TODO: Save lead to database
        lead_id = f"phone_{datetime.now().strftime('%Y%m%d%H%M%S')}_{phone[-4:]}"
        
        return LeadCaptureResponse(
            success=True,
            message=f"Call our AI Voice Agent at {VOICE_AGENT_NUMBER}",
            lead_id=lead_id
        )
        
    except Exception as e:
        logger.error(f"Error capturing phone lead: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to capture phone number: {str(e)}"
        )


@router.post("/email", response_model=LeadCaptureResponse)
async def send_email_lead(request: EmailLeadRequest):
    """
    Send email with case study and voice agent info via Resend.
    
    Email Content:
    - Case study information
    - Voice agent number
    - Demo booking link
    - Product features overview
    """
    if not RESEND_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Email service not configured"
        )
    
    try:
        logger.info(f"Email lead capture: {request.email}")
        
        # Email content
        email_subject = "How HVAC Companies Save $180K+ with Kestrel AI"
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; }}
                .section {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb; }}
                .cta {{ background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }}
                .phone {{ font-size: 24px; font-weight: bold; color: #2563eb; }}
                ul {{ padding-left: 20px; }}
                li {{ margin: 8px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Transform Your Call Operations</h1>
                </div>
                <div class="content">
                    <p>Hi there,</p>
                    <p>Thanks for your interest in Kestrel AI! Here's everything you need to know:</p>
                    
                    <div class="section">
                        <h2>📊 Case Study: KC Comfort Air</h2>
                        <p><strong>How They Recovered $180K in Lost Revenue</strong></p>
                        <ul>
                            <li>40% increase in booked appointments</li>
                            <li>24/7 call coverage with zero missed calls</li>
                            <li>200ms response time (faster than human)</li>
                            <li>Live in 48 hours</li>
                        </ul>
                    </div>
                    
                    <div class="section">
                        <h2>🎯 Try Our AI Agent Now</h2>
                        <p>Experience intelligent call handling in 30 seconds:</p>
                        <p class="phone">{VOICE_AGENT_NUMBER}</p>
                        <p>No signup required. Call now to see it in action!</p>
                    </div>
                    
                    <div class="section">
                        <h2>📅 Schedule a Full Demo</h2>
                        <p>Get a personalized walkthrough of the platform:</p>
                        <a href="https://kestrelai.com/calendar" class="cta">Book Your Demo</a>
                    </div>
                    
                    <div class="section">
                        <h2>💡 What's Included</h2>
                        <ul>
                            <li><strong>AI Voice Agent</strong> - 24/7 call handling</li>
                            <li><strong>Call Monitoring Dashboard</strong> - Real-time analytics</li>
                            <li><strong>Video Calling Integration</strong> - HD video consultations</li>
                            <li><strong>Outbound Calling Automation</strong> - Follow-ups & reminders</li>
                            <li><strong>AI Coach for Staff</strong> - Live call guidance</li>
                            <li><strong>Live Call Assist</strong> - Real-time support</li>
                            <li><strong>Lead Scraping & AI Qualification</strong> - Hot vs cold leads</li>
                            <li><strong>Call Intelligence & Analytics</strong> - Deep insights</li>
                        </ul>
                    </div>
                    
                    <p>Questions? Reply to this email or call our team.</p>
                    <p>Best regards,<br><strong>The Kestrel AI Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email via Resend
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Kestrel AI <onboarding@resend.dev>",
                    "to": [request.email],
                    "subject": email_subject,
                    "html": email_html
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Resend API error: {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to send email"
                )
            
            result = response.json()
            logger.info(f"Email sent successfully to {request.email}: {result.get('id')}")
        
        # TODO: Save lead to database
        lead_id = f"email_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        return LeadCaptureResponse(
            success=True,
            message="Email sent successfully",
            lead_id=lead_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )


@router.get("/stats")
async def get_lead_stats():
    """Get lead capture statistics."""
    # TODO: Query database for actual stats
    return {
        "total_leads": 0,
        "phone_leads": 0,
        "email_leads": 0,
        "conversion_rate": 0.0,
        "last_updated": datetime.now().isoformat()
    }

@router.get("/voice-agent-number")
async def get_voice_agent_number():
    """Get the voice agent phone number."""
    return {
        "phone_number": VOICE_AGENT_NUMBER,
        "formatted": VOICE_AGENT_NUMBER,
        "dialable": "+19388396504"
    }
