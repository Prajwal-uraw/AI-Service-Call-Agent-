"""
Notification Service for HVAC Voice Agent.

Handles:
- Email confirmations (via SendGrid or SMTP)
- SMS/Text confirmations (via Twilio)
- Appointment reminders
- Cancellation notifications
- Reschedule notifications

Setup Instructions:
-------------------
1. EMAIL (SendGrid - Recommended):
   - Sign up at https://sendgrid.com
   - Create an API key with "Mail Send" permission
   - Verify your sender email/domain
   - Add to .env:
     SENDGRID_API_KEY=SG.xxxxxxxxxxxx
     EMAIL_FROM=noreply@yourcompany.com
     EMAIL_FROM_NAME=KC Comfort Air

2. EMAIL (SMTP - Alternative):
   - Add to .env:
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASSWORD=your-app-password
     EMAIL_FROM=your-email@gmail.com

3. SMS (Twilio):
   - Sign up at https://twilio.com
   - Get a phone number with SMS capability
   - Add to .env:
     TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
     TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
     TWILIO_PHONE_NUMBER=+1234567890
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from datetime import datetime, date, time
from dataclasses import dataclass
from enum import Enum

from app.utils.logging import get_logger

logger = get_logger("notifications")


class NotificationType(Enum):
    """Types of notifications."""
    BOOKING_CONFIRMATION = "booking_confirmation"
    BOOKING_REMINDER = "booking_reminder"
    BOOKING_CANCELLED = "booking_cancelled"
    BOOKING_RESCHEDULED = "booking_rescheduled"
    TECH_ON_WAY = "tech_on_way"


@dataclass
class AppointmentDetails:
    """Appointment details for notifications."""
    customer_name: str
    customer_phone: Optional[str]
    customer_email: Optional[str]
    appointment_date: date
    appointment_time: time
    location_name: str
    location_address: str
    issue: str
    confirmation_id: int
    tech_name: Optional[str] = None
    service_fee: float = 89.00


# =============================================================================
# EMAIL TEMPLATES
# =============================================================================

def _get_email_template_booking_confirmation(details: AppointmentDetails) -> Dict[str, str]:
    """Generate booking confirmation email content."""
    
    # Format date and time nicely
    date_str = details.appointment_date.strftime("%A, %B %d, %Y")
    time_str = details.appointment_time.strftime("%I:%M %p")
    
    subject = f"Your KC Comfort Air Appointment - {date_str}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }}
            .details-box {{ background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }}
            .detail-row {{ margin: 10px 0; }}
            .label {{ font-weight: bold; color: #64748b; }}
            .value {{ color: #1e293b; }}
            .confirmation-number {{ font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; padding: 15px; background: #eff6ff; border-radius: 8px; }}
            .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 14px; }}
            .cta-button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
            .important {{ background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏠 Appointment Confirmed!</h1>
            </div>
            <div class="content">
                <p>Hey {details.customer_name}!</p>
                
                <p>Great news - your appointment is all set! Here are the details:</p>
                
                <div class="confirmation-number">
                    Confirmation #: {details.confirmation_id:05d}
                </div>
                
                <div class="details-box">
                    <div class="detail-row">
                        <span class="label">📅 Date:</span>
                        <span class="value">{date_str}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">🕐 Time:</span>
                        <span class="value">{time_str}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">📍 Location:</span>
                        <span class="value">{details.location_name}<br>{details.location_address}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">🔧 Service:</span>
                        <span class="value">{details.issue}</span>
                    </div>
                </div>
                
                <div class="important">
                    <strong>💰 What to Expect:</strong>
                    <ul>
                        <li>Service call fee: ${details.service_fee:.2f}</li>
                        <li>Our tech will call you when they're on the way</li>
                        <li>Full quote provided before any work begins</li>
                        <li>No surprises - you approve all costs upfront</li>
                    </ul>
                </div>
                
                <p><strong>Need to reschedule or cancel?</strong><br>
                Just give us a call at (555) 123-4567 or reply to this email. We're happy to help!</p>
                
                <p>Thanks for choosing KC Comfort Air! We're looking forward to getting you comfortable again. 😊</p>
                
                <p>Stay cool,<br>
                <strong>The KC Comfort Air Team</strong></p>
            </div>
            <div class="footer">
                <p>KC Comfort Air | (555) 123-4567 | info@kccomfortair.com</p>
                <p>Serving Dallas, Fort Worth, and Arlington</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_body = f"""
Hey {details.customer_name}!

Great news - your appointment is all set!

CONFIRMATION #: {details.confirmation_id:05d}

APPOINTMENT DETAILS:
--------------------
Date: {date_str}
Time: {time_str}
Location: {details.location_name}
         {details.location_address}
Service: {details.issue}

WHAT TO EXPECT:
- Service call fee: ${details.service_fee:.2f}
- Our tech will call you when they're on the way
- Full quote provided before any work begins
- No surprises - you approve all costs upfront

Need to reschedule or cancel?
Just give us a call at (555) 123-4567

Thanks for choosing KC Comfort Air!

Stay cool,
The KC Comfort Air Team
    """
    
    return {
        "subject": subject,
        "html": html_body,
        "text": text_body
    }


def _get_email_template_cancellation(details: AppointmentDetails) -> Dict[str, str]:
    """Generate cancellation confirmation email."""
    
    date_str = details.appointment_date.strftime("%A, %B %d, %Y")
    time_str = details.appointment_time.strftime("%I:%M %p")
    
    subject = "Your KC Comfort Air Appointment Has Been Cancelled"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #64748b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }}
            .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
                <p>Hey {details.customer_name},</p>
                
                <p>This confirms that your appointment has been cancelled:</p>
                
                <p><strong>Cancelled Appointment:</strong><br>
                {date_str} at {time_str}<br>
                Confirmation #: {details.confirmation_id:05d}</p>
                
                <p>We're sorry to see you go! If you need to reschedule or if there's anything we can help with, don't hesitate to give us a call.</p>
                
                <p>Take care,<br>
                <strong>The KC Comfort Air Team</strong></p>
            </div>
            <div class="footer">
                <p>KC Comfort Air | (555) 123-4567</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
Hey {details.customer_name},

This confirms that your appointment has been cancelled:

Cancelled Appointment:
{date_str} at {time_str}
Confirmation #: {details.confirmation_id:05d}

We're sorry to see you go! If you need to reschedule, give us a call at (555) 123-4567.

Take care,
The KC Comfort Air Team
    """
    
    return {
        "subject": subject,
        "html": html_body,
        "text": text_body
    }


def _get_email_template_reschedule(
    details: AppointmentDetails,
    old_date: date,
    old_time: time
) -> Dict[str, str]:
    """Generate reschedule confirmation email."""
    
    old_date_str = old_date.strftime("%A, %B %d")
    old_time_str = old_time.strftime("%I:%M %p")
    new_date_str = details.appointment_date.strftime("%A, %B %d, %Y")
    new_time_str = details.appointment_time.strftime("%I:%M %p")
    
    subject = f"Your KC Comfort Air Appointment Has Been Rescheduled - {new_date_str}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }}
            .old-time {{ text-decoration: line-through; color: #94a3b8; }}
            .new-time {{ color: #16a34a; font-weight: bold; }}
            .details-box {{ background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }}
            .footer {{ text-align: center; padding: 20px; color: #64748b; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Appointment Rescheduled!</h1>
            </div>
            <div class="content">
                <p>Hey {details.customer_name}!</p>
                
                <p>Your appointment has been successfully rescheduled:</p>
                
                <div class="details-box">
                    <p><span class="old-time">Old: {old_date_str} at {old_time_str}</span></p>
                    <p><span class="new-time">✓ New: {new_date_str} at {new_time_str}</span></p>
                </div>
                
                <p><strong>Confirmation #:</strong> {details.confirmation_id:05d}</p>
                
                <p>Our tech will call you when they're on the way. See you soon!</p>
                
                <p>Thanks,<br>
                <strong>The KC Comfort Air Team</strong></p>
            </div>
            <div class="footer">
                <p>KC Comfort Air | (555) 123-4567</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
Hey {details.customer_name}!

Your appointment has been successfully rescheduled:

Old: {old_date_str} at {old_time_str}
New: {new_date_str} at {new_time_str}

Confirmation #: {details.confirmation_id:05d}

Our tech will call you when they're on the way. See you soon!

Thanks,
The KC Comfort Air Team
(555) 123-4567
    """
    
    return {
        "subject": subject,
        "html": html_body,
        "text": text_body
    }


# =============================================================================
# SMS TEMPLATES
# =============================================================================

def _get_sms_booking_confirmation(details: AppointmentDetails) -> str:
    """Generate booking confirmation SMS."""
    
    date_str = details.appointment_date.strftime("%a %b %d")
    time_str = details.appointment_time.strftime("%I:%M %p")
    
    return f"""KC Comfort Air ✓
Appt confirmed!

📅 {date_str} at {time_str}
📍 {details.location_name}
🔧 {details.issue}
#️⃣ Conf: {details.confirmation_id:05d}

Tech will call when on the way.
Service fee: ${details.service_fee:.2f}

Questions? Call (555) 123-4567"""


def _get_sms_cancellation(details: AppointmentDetails) -> str:
    """Generate cancellation SMS."""
    
    date_str = details.appointment_date.strftime("%a %b %d")
    
    return f"""KC Comfort Air
Your {date_str} appointment has been cancelled.

Need to reschedule? Call (555) 123-4567"""


def _get_sms_reschedule(
    details: AppointmentDetails,
    old_date: date,
    old_time: time
) -> str:
    """Generate reschedule SMS."""
    
    new_date_str = details.appointment_date.strftime("%a %b %d")
    new_time_str = details.appointment_time.strftime("%I:%M %p")
    
    return f"""KC Comfort Air ✓
Appt rescheduled!

NEW: {new_date_str} at {new_time_str}
Conf: {details.confirmation_id:05d}

Tech will call when on the way."""


def _get_sms_reminder(details: AppointmentDetails) -> str:
    """Generate appointment reminder SMS."""
    
    date_str = details.appointment_date.strftime("%a %b %d")
    time_str = details.appointment_time.strftime("%I:%M %p")
    
    return f"""KC Comfort Air Reminder 🔔
Your appointment is tomorrow!

📅 {date_str} at {time_str}
📍 {details.location_name}

Tech will call when on the way.
Need to reschedule? Call (555) 123-4567"""


def _get_sms_tech_on_way(details: AppointmentDetails) -> str:
    """Generate tech on the way SMS."""
    
    tech_name = details.tech_name or "Our technician"
    
    return f"""KC Comfort Air 🚗
{tech_name} is on the way!

ETA: ~30 minutes
Questions? Call (555) 123-4567"""


# =============================================================================
# EMAIL SENDING (SendGrid)
# =============================================================================

def send_email_sendgrid(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> Dict[str, Any]:
    """
    Send email via SendGrid API.
    
    Requires: SENDGRID_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME in .env
    """
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
    except ImportError:
        logger.error("SendGrid not installed. Run: pip install sendgrid")
        return {"success": False, "error": "SendGrid not installed"}
    
    api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("EMAIL_FROM")
    from_name = os.getenv("EMAIL_FROM_NAME", "KC Comfort Air")
    
    if not api_key or not from_email:
        logger.warning("SendGrid not configured. Set SENDGRID_API_KEY and EMAIL_FROM")
        return {"success": False, "error": "SendGrid not configured"}
    
    try:
        sg = sendgrid.SendGridAPIClient(api_key=api_key)
        
        message = Mail(
            from_email=Email(from_email, from_name),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content),
            plain_text_content=Content("text/plain", text_content),
        )
        
        response = sg.send(message)
        
        logger.info("Email sent to %s, status: %s", to_email, response.status_code)
        return {
            "success": response.status_code in [200, 201, 202],
            "status_code": response.status_code
        }
        
    except Exception as e:
        logger.error("Failed to send email: %s", str(e))
        return {"success": False, "error": str(e)}


def send_email_smtp(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> Dict[str, Any]:
    """
    Send email via SMTP (Gmail, etc.).
    
    Requires: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM in .env
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("EMAIL_FROM")
    from_name = os.getenv("EMAIL_FROM_NAME", "KC Comfort Air")
    
    if not smtp_user or not smtp_password or not from_email:
        logger.warning("SMTP not configured. Set SMTP_USER, SMTP_PASSWORD, EMAIL_FROM")
        return {"success": False, "error": "SMTP not configured"}
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email
        
        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())
        
        logger.info("Email sent to %s via SMTP", to_email)
        return {"success": True}
        
    except Exception as e:
        logger.error("Failed to send email via SMTP: %s", str(e))
        return {"success": False, "error": str(e)}


# =============================================================================
# SMS SENDING (Twilio)
# =============================================================================

def send_sms_twilio(to_phone: str, message: str) -> Dict[str, Any]:
    """
    Send SMS via Twilio.
    
    Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env
    """
    try:
        from twilio.rest import Client
    except ImportError:
        logger.error("Twilio not installed. Run: pip install twilio")
        return {"success": False, "error": "Twilio not installed"}
    
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_phone = os.getenv("TWILIO_PHONE_NUMBER")
    
    if not account_sid or not auth_token or not from_phone:
        logger.warning("Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER")
        return {"success": False, "error": "Twilio not configured"}
    
    # Normalize phone number
    to_phone = _normalize_phone(to_phone)
    if not to_phone:
        return {"success": False, "error": "Invalid phone number"}
    
    try:
        client = Client(account_sid, auth_token)
        
        sms = client.messages.create(
            body=message,
            from_=from_phone,
            to=to_phone
        )
        
        logger.info("SMS sent to %s, SID: %s", to_phone, sms.sid)
        return {
            "success": True,
            "message_sid": sms.sid,
            "status": sms.status
        }
        
    except Exception as e:
        logger.error("Failed to send SMS: %s", str(e))
        return {"success": False, "error": str(e)}


def _normalize_phone(phone: str) -> Optional[str]:
    """Normalize phone number to E.164 format."""
    if not phone:
        return None
    
    # Remove all non-digits
    digits = "".join(c for c in phone if c.isdigit())
    
    # Handle US numbers
    if len(digits) == 10:
        return f"+1{digits}"
    elif len(digits) == 11 and digits.startswith("1"):
        return f"+{digits}"
    elif len(digits) > 10 and digits.startswith("+"):
        return phone  # Already formatted
    
    return None


# =============================================================================
# HIGH-LEVEL NOTIFICATION FUNCTIONS
# =============================================================================

def send_booking_confirmation(
    details: AppointmentDetails,
    send_email: bool = True,
    send_sms: bool = True,
) -> Dict[str, Any]:
    """
    Send booking confirmation via email and/or SMS.
    
    Args:
        details: Appointment details
        send_email: Whether to send email
        send_sms: Whether to send SMS
        
    Returns:
        Result dictionary with email and sms status
    """
    results = {"email": None, "sms": None}
    
    # Send email
    if send_email and details.customer_email:
        template = _get_email_template_booking_confirmation(details)
        
        # Try SendGrid first, fall back to SMTP
        if os.getenv("SENDGRID_API_KEY"):
            results["email"] = send_email_sendgrid(
                details.customer_email,
                template["subject"],
                template["html"],
                template["text"]
            )
        else:
            results["email"] = send_email_smtp(
                details.customer_email,
                template["subject"],
                template["html"],
                template["text"]
            )
    
    # Send SMS
    if send_sms and details.customer_phone:
        sms_content = _get_sms_booking_confirmation(details)
        results["sms"] = send_sms_twilio(details.customer_phone, sms_content)
    
    logger.info(
        "Booking confirmation sent for %s: email=%s, sms=%s",
        details.customer_name,
        results["email"].get("success") if results["email"] else "skipped",
        results["sms"].get("success") if results["sms"] else "skipped"
    )
    
    return results


def send_cancellation_notification(
    details: AppointmentDetails,
    send_email: bool = True,
    send_sms: bool = True,
) -> Dict[str, Any]:
    """Send cancellation notification via email and/or SMS."""
    results = {"email": None, "sms": None}
    
    if send_email and details.customer_email:
        template = _get_email_template_cancellation(details)
        if os.getenv("SENDGRID_API_KEY"):
            results["email"] = send_email_sendgrid(
                details.customer_email,
                template["subject"],
                template["html"],
                template["text"]
            )
        else:
            results["email"] = send_email_smtp(
                details.customer_email,
                template["subject"],
                template["html"],
                template["text"]
            )
    
    if send_sms and details.customer_phone:
        sms_content = _get_sms_cancellation(details)
        results["sms"] = send_sms_twilio(details.customer_phone, sms_content)
    
    return results


def send_reschedule_notification(
    details: AppointmentDetails,
    old_date: date,
    old_time: time,
    send_email: bool = True,
    send_sms: bool = True,
) -> Dict[str, Any]:
    """Send reschedule notification via email and/or SMS."""
    results = {"email": None, "sms": None}
    
    if send_email and details.customer_email:
        template = _get_email_template_reschedule(details, old_date, old_time)
        if os.getenv("SENDGRID_API_KEY"):
            results["email"] = send_email_sendgrid(
                details.customer_email,
                template["subject"],
                template["html"],
                template["text"]
            )
        else:
            results["email"] = send_email_smtp(
                details.customer_email,
                template["subject"],
                template["html"],
                template["text"]
            )
    
    if send_sms and details.customer_phone:
        sms_content = _get_sms_reschedule(details, old_date, old_time)
        results["sms"] = send_sms_twilio(details.customer_phone, sms_content)
    
    return results


def send_reminder(
    details: AppointmentDetails,
    send_email: bool = False,
    send_sms: bool = True,
) -> Dict[str, Any]:
    """Send appointment reminder (typically SMS only)."""
    results = {"email": None, "sms": None}
    
    if send_sms and details.customer_phone:
        sms_content = _get_sms_reminder(details)
        results["sms"] = send_sms_twilio(details.customer_phone, sms_content)
    
    return results


def send_tech_on_way(
    details: AppointmentDetails,
    tech_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Send tech on the way notification (SMS only)."""
    if tech_name:
        details.tech_name = tech_name
    
    if details.customer_phone:
        sms_content = _get_sms_tech_on_way(details)
        return {"sms": send_sms_twilio(details.customer_phone, sms_content)}
    
    return {"sms": None}
