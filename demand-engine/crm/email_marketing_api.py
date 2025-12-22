"""
CRM Email Marketing API
Manage campaigns, templates, and send marketing emails via Resend
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import sys
import os
import httpx

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase
from email_service.resend_client import ResendEmailClient

router = APIRouter(prefix="/api/crm/email-marketing", tags=["CRM - Email Marketing"])

# Models
class EmailTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    subject: str
    preview_text: Optional[str] = None
    html_content: str
    text_content: Optional[str] = None
    variables: List[str] = []
    tags: List[str] = []

class CampaignCreate(BaseModel):
    name: str
    subject: str
    preview_text: Optional[str] = None
    html_content: Optional[str] = None
    text_content: Optional[str] = None
    template_id: Optional[str] = None
    target_segment: dict = {}  # Filter criteria
    scheduled_at: Optional[datetime] = None
    tags: List[str] = []

class CampaignSend(BaseModel):
    test_email: Optional[EmailStr] = None  # If provided, send test only


@router.get("/templates")
async def get_templates(
    category: Optional[str] = None,
    active_only: bool = True
):
    """Get all email templates"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("email_templates").select("*")
        
        if active_only:
            query = query.eq("is_active", True)
        
        if category:
            query = query.eq("category", category)
        
        response = query.order("created_at", desc=True).execute()
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates/{template_id}")
async def get_template(template_id: str):
    """Get single template"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("email_templates").select("*").eq("id", template_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/templates")
async def create_template(template: EmailTemplateCreate):
    """Create new email template"""
    try:
        supabase = get_supabase()
        
        template_data = template.dict()
        template_data["created_by"] = "admin"
        
        response = supabase.table("email_templates").insert(template_data).execute()
        
        return {
            "success": True,
            "template": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/campaigns")
async def get_campaigns(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Get all campaigns"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("email_campaigns").select("*")
        
        if status:
            query = query.eq("status", status)
        
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "campaigns": response.data,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    """Get single campaign with stats"""
    try:
        supabase = get_supabase()
        
        # Get campaign
        campaign_response = supabase.table("email_campaigns").select("*").eq("id", campaign_id).single().execute()
        
        if not campaign_response.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = campaign_response.data
        
        # Get recipients stats
        recipients_response = supabase.table("campaign_recipients").select("status", count="exact").eq("campaign_id", campaign_id).execute()
        
        # Group by status
        status_counts = {}
        for recipient in recipients_response.data or []:
            status = recipient.get("status", "pending")
            status_counts[status] = status_counts.get(status, 0) + 1
        
        campaign["recipient_stats"] = status_counts
        campaign["total_recipients"] = recipients_response.count or 0
        
        return campaign
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns")
async def create_campaign(campaign: CampaignCreate):
    """Create new campaign"""
    try:
        supabase = get_supabase()
        
        campaign_data = campaign.dict()
        campaign_data["created_by"] = "admin"
        campaign_data["status"] = "draft"
        
        # If using template, load template content
        if campaign_data.get("template_id"):
            template_response = supabase.table("email_templates").select("*").eq("id", campaign_data["template_id"]).single().execute()
            
            if template_response.data:
                template = template_response.data
                if not campaign_data.get("html_content"):
                    campaign_data["html_content"] = template.get("html_content")
                if not campaign_data.get("text_content"):
                    campaign_data["text_content"] = template.get("text_content")
                if not campaign_data.get("subject"):
                    campaign_data["subject"] = template.get("subject")
        
        response = supabase.table("email_campaigns").insert(campaign_data).execute()
        
        return {
            "success": True,
            "campaign": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/campaigns/{campaign_id}/send")
async def send_campaign(
    campaign_id: str,
    send_params: CampaignSend,
    background_tasks: BackgroundTasks
):
    """Send campaign to recipients"""
    try:
        supabase = get_supabase()
        
        # Get campaign
        campaign_response = supabase.table("email_campaigns").select("*").eq("id", campaign_id).single().execute()
        
        if not campaign_response.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = campaign_response.data
        
        # If test email provided, send test only
        if send_params.test_email:
            email_client = ResendEmailClient()
            
            result = await email_client.send_email(
                to_email=send_params.test_email,
                subject=f"[TEST] {campaign['subject']}",
                html_content=campaign.get("html_content", ""),
                text_content=campaign.get("text_content")
            )
            
            return {
                "success": True,
                "message": "Test email sent",
                "email_id": result.get("email_id")
            }
        
        # Get recipients based on target segment
        target_segment = campaign.get("target_segment", {})
        
        query = supabase.table("contacts").select("id, email, first_name, last_name, lead_id").eq("email_subscribed", True).is_("deleted_at", None)
        
        # Apply segment filters
        if target_segment.get("tags"):
            query = query.contains("tags", target_segment["tags"])
        
        recipients_response = query.execute()
        recipients = recipients_response.data or []
        
        if not recipients:
            raise HTTPException(status_code=400, detail="No recipients found for this segment")
        
        # Update campaign status
        supabase.table("email_campaigns").update({
            "status": "sending",
            "recipient_count": len(recipients)
        }).eq("id", campaign_id).execute()
        
        # Create recipient records
        recipient_records = []
        for recipient in recipients:
            recipient_records.append({
                "campaign_id": campaign_id,
                "contact_id": recipient["id"],
                "lead_id": recipient.get("lead_id"),
                "email": recipient["email"],
                "status": "pending"
            })
        
        if recipient_records:
            supabase.table("campaign_recipients").insert(recipient_records).execute()
        
        # Send emails in background
        background_tasks.add_task(
            send_campaign_emails,
            campaign_id,
            campaign,
            recipients
        )
        
        return {
            "success": True,
            "message": f"Campaign queued for {len(recipients)} recipients",
            "recipient_count": len(recipients)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def send_campaign_emails(campaign_id: str, campaign: dict, recipients: List[dict]):
    """Background task to send campaign emails"""
    try:
        supabase = get_supabase()
        email_client = ResendEmailClient()
        
        sent_count = 0
        failed_count = 0
        
        for recipient in recipients:
            try:
                # Personalize content
                html_content = campaign.get("html_content", "")
                text_content = campaign.get("text_content", "")
                subject = campaign.get("subject", "")
                
                # Replace variables
                replacements = {
                    "{{first_name}}": recipient.get("first_name", ""),
                    "{{last_name}}": recipient.get("last_name", ""),
                    "{{email}}": recipient.get("email", "")
                }
                
                for key, value in replacements.items():
                    html_content = html_content.replace(key, value)
                    text_content = text_content.replace(key, value) if text_content else None
                    subject = subject.replace(key, value)
                
                # Send email
                result = await email_client.send_email(
                    to_email=recipient["email"],
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content
                )
                
                # Update recipient status
                supabase.table("campaign_recipients").update({
                    "status": "sent",
                    "resend_email_id": result.get("email_id"),
                    "sent_at": datetime.now().isoformat()
                }).eq("campaign_id", campaign_id).eq("contact_id", recipient["id"]).execute()
                
                # Create activity
                supabase.table("activities").insert({
                    "lead_id": recipient.get("lead_id"),
                    "contact_id": recipient["id"],
                    "activity_type": "email",
                    "subject": subject,
                    "description": f"Campaign email sent: {campaign['name']}",
                    "direction": "outbound",
                    "email_id": result.get("email_id"),
                    "email_status": "sent"
                }).execute()
                
                sent_count += 1
                
            except Exception as e:
                print(f"Failed to send to {recipient['email']}: {str(e)}")
                
                # Update recipient with error
                supabase.table("campaign_recipients").update({
                    "status": "failed",
                    "error_message": str(e)
                }).eq("campaign_id", campaign_id).eq("contact_id", recipient["id"]).execute()
                
                failed_count += 1
        
        # Update campaign final stats
        supabase.table("email_campaigns").update({
            "status": "sent",
            "total_sent": sent_count,
            "sent_at": datetime.now().isoformat()
        }).eq("id", campaign_id).execute()
        
        print(f"Campaign {campaign_id} complete: {sent_count} sent, {failed_count} failed")
        
    except Exception as e:
        print(f"Campaign sending error: {str(e)}")
        
        # Mark campaign as failed
        supabase.table("email_campaigns").update({
            "status": "failed"
        }).eq("id", campaign_id).execute()


@router.get("/campaigns/{campaign_id}/recipients")
async def get_campaign_recipients(campaign_id: str, status: Optional[str] = None):
    """Get campaign recipients with status"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("campaign_recipients").select("*, contacts(first_name, last_name, company_name)").eq("campaign_id", campaign_id)
        
        if status:
            query = query.eq("status", status)
        
        response = query.order("sent_at", desc=True).execute()
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhooks/resend")
async def resend_webhook(event_data: dict):
    """Handle Resend webhooks for email events"""
    try:
        supabase = get_supabase()
        
        event_type = event_data.get("type")
        email_id = event_data.get("data", {}).get("email_id")
        
        if not email_id:
            return {"success": True, "message": "No email_id in event"}
        
        # Update campaign recipient
        update_data = {}
        
        if event_type == "email.delivered":
            update_data = {"status": "delivered", "delivered_at": datetime.now().isoformat()}
        elif event_type == "email.opened":
            update_data = {"status": "opened", "opened_at": datetime.now().isoformat()}
            # Increment opens count
            supabase.rpc("increment_campaign_recipient_opens", {"email_id_param": email_id}).execute()
        elif event_type == "email.clicked":
            update_data = {"status": "clicked", "clicked_at": datetime.now().isoformat()}
            # Increment clicks count
            supabase.rpc("increment_campaign_recipient_clicks", {"email_id_param": email_id}).execute()
        elif event_type == "email.bounced":
            update_data = {"status": "bounced", "bounced_at": datetime.now().isoformat()}
        
        if update_data:
            supabase.table("campaign_recipients").update(update_data).eq("resend_email_id", email_id).execute()
        
        # Also update activity if exists
        supabase.table("activities").update({
            "email_status": event_type.replace("email.", "")
        }).eq("email_id", email_id).execute()
        
        return {"success": True, "event": event_type}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"success": False, "error": str(e)}
