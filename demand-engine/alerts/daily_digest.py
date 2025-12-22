"""
Daily digest alert system for high-score signals
Runs on Modal as scheduled job
"""
import os
from typing import List, Dict
from datetime import datetime, timedelta, timezone
import modal
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config.modal_config import app, scraper_image, secrets


def generate_html_email(signals: List[Dict]) -> str:
    """Generate HTML email for daily digest"""
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; }
            .signal { background: #f9fafb; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .score { display: inline-block; background: #10b981; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
            .score.high { background: #ef4444; }
            .meta { color: #6b7280; font-size: 14px; margin-top: 10px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            a { color: #2563eb; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Daily Lead Signals Digest</h1>
                <p>High-quality signals from the last 24 hours</p>
            </div>
            
            <p><strong>Found {count} qualified signals</strong> ready for review.</p>
    """.format(count=len(signals))
    
    for signal in signals:
        score = signal.get("classified_score", 0)
        score_class = "high" if score >= 85 else ""
        
        html += f"""
            <div class="signal">
                <div>
                    <span class="score {score_class}">Score: {score}</span>
                    <strong>{signal.get('source_platform', 'Unknown')}</strong>
                </div>
                <h3>{signal.get('title', 'No title')}</h3>
                <p>{signal.get('content', '')[:300]}...</p>
                <div class="meta">
                    <strong>Author:</strong> {signal.get('author', 'Unknown')} | 
                    <strong>Signals:</strong> 
                    Pain: {len(signal.get('pain_signals', []))}, 
                    Urgency: {len(signal.get('urgency_signals', []))}, 
                    Authority: {len(signal.get('authority_signals', []))}<br>
                    <a href="{signal.get('source_url', '#')}" target="_blank">View Original →</a>
                </div>
            </div>
        """
    
    html += """
            <div class="footer">
                <p>This is an automated digest from your Demand Capture Engine.</p>
                <p>To adjust alert settings or view all signals, visit your dashboard.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


def generate_text_email(signals: List[Dict]) -> str:
    """Generate plain text email for daily digest"""
    
    text = f"""
DAILY LEAD SIGNALS DIGEST
========================

Found {len(signals)} qualified signals from the last 24 hours.

"""
    
    for i, signal in enumerate(signals, 1):
        score = signal.get("classified_score", 0)
        text += f"""
{i}. [{score} points] {signal.get('title', 'No title')}
   Source: {signal.get('source_platform', 'Unknown')}
   Author: {signal.get('author', 'Unknown')}
   
   {signal.get('content', '')[:200]}...
   
   Signals: Pain={len(signal.get('pain_signals', []))}, Urgency={len(signal.get('urgency_signals', []))}, Authority={len(signal.get('authority_signals', []))}
   Link: {signal.get('source_url', 'N/A')}
   
---
"""
    
    text += """
This is an automated digest from your Demand Capture Engine.
"""
    
    return text


@app.function(
    image=scraper_image,
    secrets=secrets,
    timeout=300,
)
def send_daily_digest(
    score_threshold: int = 70,
    limit: int = 20
) -> Dict:
    """
    Send daily digest of high-score signals
    
    Args:
        score_threshold: Minimum score to include
        limit: Maximum number of signals to include
    
    Returns:
        Stats dict
    """
    from supabase import create_client
    
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
        return {"status": "not_configured", "count": len(signals)}
    
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


@app.function(
    image=scraper_image,
    secrets=secrets,
    timeout=300,
)
def send_slack_alert(signal: Dict) -> bool:
    """
    Send Slack alert for hot signals (score >= 85)
    
    Args:
        signal: Signal dict
    
    Returns:
        Success bool
    """
    import httpx
    
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    
    if not webhook_url:
        print("⚠️  Slack webhook not configured")
        return False
    
    score = signal.get("classified_score", 0)
    
    if score < 85:
        return False
    
    # Format Slack message
    message = {
        "text": f"🔥 HOT LEAD ALERT (Score: {score})",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🔥 Hot Lead: {score} points"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{signal.get('title', 'No title')}*\n\n{signal.get('content', '')[:300]}..."
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Source:*\n{signal.get('source_platform', 'Unknown')}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Author:*\n{signal.get('author', 'Unknown')}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Pain Signals:*\n{len(signal.get('pain_signals', []))}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Urgency:*\n{len(signal.get('urgency_signals', []))}"
                    }
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "View Original"
                        },
                        "url": signal.get('source_url', '#')
                    }
                ]
            }
        ]
    }
    
    try:
        response = httpx.post(webhook_url, json=message, timeout=10)
        response.raise_for_status()
        print(f"✅ Slack alert sent for signal {signal.get('id', 'unknown')[:8]}...")
        return True
    except Exception as e:
        print(f"❌ Error sending Slack alert: {e}")
        return False


@app.local_entrypoint()
def main(test: bool = False):
    """
    Local entrypoint for testing
    
    Usage:
        modal run alerts.daily_digest
        modal run alerts.daily_digest --test
    """
    if test:
        print("Running test digest...")
        result = send_daily_digest.remote(score_threshold=50, limit=5)
    else:
        print("Running production digest...")
        result = send_daily_digest.remote(score_threshold=70, limit=20)
    
    print(f"Result: {result}")
