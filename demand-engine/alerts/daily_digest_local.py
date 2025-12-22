"""
Local execution wrapper for daily digest (no Modal required)
"""
import os
from typing import List, Dict
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

# Import shared logic
from alerts.daily_digest import generate_html_email, generate_text_email


def send_daily_digest_local(
    score_threshold: int = 70,
    limit: int = 20
) -> Dict:
    """
    Send daily digest locally (no Modal)
    """
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    client = create_client(supabase_url, supabase_key)
    
    # Get high-score signals from last 24 hours
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    
    result = client.table("signals").select("*").gte(
        "classified_score", score_threshold
    ).gte(
        "created_at", yesterday
    ).order(
        "classified_score", desc=True
    ).limit(limit).execute()
    
    signals = result.data
    
    if not signals:
        print("📭 No qualified signals in last 24 hours")
        return {"status": "no_signals", "count": 0}
    
    print(f"📧 Preparing digest with {len(signals)} signals")
    
    # Generate email content
    html_content = generate_html_email(signals)
    text_content = generate_text_email(signals)
    
    # Send via SendGrid
    sendgrid_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("ALERT_EMAIL_FROM", "alerts@yourdomain.com")
    to_email = os.getenv("ALERT_EMAIL_TO")
    
    if not sendgrid_key or not to_email:
        print("⚠️  SendGrid not configured, skipping email")
        print(f"\n--- EMAIL PREVIEW ---")
        print(text_content)
        print(f"--- END PREVIEW ---\n")
        return {"status": "not_configured", "count": len(signals), "preview": True}
    
    try:
        sg = SendGridAPIClient(sendgrid_key)
        
        message = Mail(
            from_email=Email(from_email),
            to_emails=To(to_email),
            subject=f"🎯 Daily Digest: {len(signals)} Qualified Leads",
            plain_text_content=Content("text/plain", text_content),
            html_content=Content("text/html", html_content)
        )
        
        response = sg.send(message)
        
        print(f"✅ Email sent successfully (status: {response.status_code})")
        
        return {
            "status": "sent",
            "count": len(signals),
            "to": to_email,
            "status_code": response.status_code
        }
        
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return {
            "status": "error",
            "count": len(signals),
            "error": str(e)
        }
