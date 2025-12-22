"""
Email service using Resend API
Sends ROI calculator results and PDF reports to leads
"""

import os
import logging
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger(__name__)


class ResendEmailClient:
    """Client for sending emails via Resend API"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("RESEND_API_KEY")
        if not self.api_key:
            logger.warning("RESEND_API_KEY not set - email sending will fail")
        
        self.base_url = "https://api.resend.com"
        self.from_email = os.getenv("RESEND_FROM_EMAIL", "hello@kestrel.ai")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        attachments: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Send email via Resend API
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            attachments: Optional list of attachments
            
        Returns:
            Response from Resend API
        """
        if not self.api_key:
            raise ValueError("RESEND_API_KEY not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": self.from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        
        if attachments:
            payload["attachments"] = attachments
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/emails",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                logger.info(f"Email sent successfully to {to_email}: {result.get('id')}")
                return result
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Resend API error: {e.response.status_code} - {e.response.text}")
                raise
            except Exception as e:
                logger.error(f"Failed to send email: {str(e)}")
                raise
    
    async def send_roi_report_email(
        self,
        to_email: str,
        company_name: Optional[str],
        results: Dict[str, Any],
        pdf_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send ROI calculator results email
        
        Args:
            to_email: Recipient email
            company_name: Company name (optional)
            results: Calculator results
            pdf_url: URL to download PDF report (optional)
            
        Returns:
            Resend API response
        """
        subject = f"Your HVAC AI ROI Analysis - ${results['annual_loss']:,}/year in Missed Revenue"
        
        html_content = self._generate_roi_email_html(
            company_name=company_name,
            results=results,
            pdf_url=pdf_url
        )
        
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content
        )
    
    def _generate_roi_email_html(
        self,
        company_name: Optional[str],
        results: Dict[str, Any],
        pdf_url: Optional[str]
    ) -> str:
        """Generate HTML email template for ROI results"""
        
        greeting = f"Hi {company_name}," if company_name else "Hi there,"
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your ROI Analysis from Kestrel</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Kestrel</h1>
            <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">HVAC AI Call Agent</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #111827; margin: 0 0 20px 0;">{greeting}</p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for using our ROI calculator. Based on your inputs, here's what we found:
            </p>
            
            <!-- Loss Box -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fecaca; border-radius: 8px; padding: 24px; margin: 0 0 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #991b1b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">You're Currently Losing</p>
                <p style="margin: 0 0 8px 0; font-size: 36px; color: #dc2626; font-weight: bold;">${results['annual_loss']:,}/year</p>
                <p style="margin: 0; font-size: 16px; color: #b91c1c;">${results['monthly_loss']:,}/month in missed revenue</p>
            </div>
            
            <!-- Recovery Box -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #bbf7d0; border-radius: 8px; padding: 24px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">With Kestrel You Recover</p>
                <p style="margin: 0 0 8px 0; font-size: 36px; color: #16a34a; font-weight: bold;">${results['recoverable_revenue']:,}/year</p>
                <p style="margin: 0; font-size: 16px; color: #15803d;">ROI: {results['roi_percentage']}% in the first year</p>
            </div>
            
            <h2 style="font-size: 20px; color: #111827; margin: 0 0 16px 0; font-weight: 600;">What You Get with Kestrel:</h2>
            
            <ul style="margin: 0 0 30px 0; padding: 0 0 0 20px; color: #374151; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Custom-built HVAC AI call agent for your business</li>
                <li style="margin-bottom: 8px;">Live in 48 hours with zero technical work from you</li>
                <li style="margin-bottom: 8px;">Answers every call in 200ms, 24/7/365</li>
                <li style="margin-bottom: 8px;">Emergency routing and HVAC-specific protocols</li>
                <li style="margin-bottom: 8px;">Integration with ServiceTitan or Housecall Pro</li>
                <li style="margin-bottom: 8px;">Ongoing monitoring and optimization by our team</li>
            </ul>
            
            {f'''
            <div style="text-align: center; margin: 0 0 30px 0;">
                <a href="{pdf_url}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    📄 Download Full PDF Report
                </a>
            </div>
            ''' if pdf_url else ''}
            
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; margin: 0 0 30px 0;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #1e3a8a; font-weight: 600;">Ready to Stop Losing Revenue?</h3>
                <p style="margin: 0 0 20px 0; color: #374151; line-height: 1.6;">
                    Let's schedule a quick 15-minute call to show you exactly how Kestrel can transform your call handling.
                </p>
                <div style="text-align: center;">
                    <a href="tel:+15551234567" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 8px 0;">
                        📞 Call Us: (555) 123-4567
                    </a>
                    <a href="https://hvacaiagent.frontofai.com/demo" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 0 8px 8px;">
                        Try Live Demo
                    </a>
                </div>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong style="color: #111827;">The Kestrel Team</strong><br>
                Custom-Built HVAC AI Call Agent
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
                Kestrel - HVAC AI Call Agent<br>
                <a href="https://hvacaiagent.frontofai.com" style="color: #2563eb; text-decoration: none;">hvacaiagent.frontofai.com</a>
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #9ca3af;">
                This email was sent because you used our ROI calculator. If you have questions, reply to this email.
            </p>
        </div>
        
    </div>
</body>
</html>
"""
        return html
