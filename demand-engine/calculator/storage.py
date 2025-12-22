"""
Database storage for calculator submissions and leads
"""
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

from config.supabase_config import get_supabase
from .models import LeadSubmission


def save_lead_submission(lead: LeadSubmission) -> str:
    """
    Save lead submission to database
    
    Returns: lead_id
    """
    client = get_supabase()
    
    # Generate ID if not provided
    lead_id = lead.id or str(uuid.uuid4())
    
    # Prepare data for insertion
    data = {
        "id": lead_id,
        "session_id": lead.session_id,
        "email": lead.email,
        "phone": lead.phone,
        "company_name": lead.company_name,
        "location": lead.location,
        "business_type": lead.business_type,
        "monthly_loss": lead.monthly_loss,
        "annual_loss": lead.annual_loss,
        "lead_score": lead.lead_score,
        "lead_tier": lead.lead_tier,
        "viewed_full_report": lead.viewed_full_report,
        "downloaded_pdf": lead.downloaded_pdf,
        "clicked_cta": lead.clicked_cta,
        "email_opened": lead.email_opened,
        "submitted_at": lead.submitted_at.isoformat(),
        "last_activity_at": lead.last_activity_at.isoformat() if lead.last_activity_at else None,
        "referral_source": lead.referral_source,
        "utm_campaign": lead.utm_campaign,
        "utm_source": lead.utm_source,
        "utm_medium": lead.utm_medium,
        "raw_input": lead.raw_input,
        "raw_output": lead.raw_output,
    }
    
    # Insert into leads table
    result = client.table("leads").insert(data).execute()
    
    if not result.data:
        raise Exception("Failed to save lead submission")
    
    print(f"✅ Lead saved: {lead_id} (tier: {lead.lead_tier}, score: {lead.lead_score})")
    
    return lead_id


def get_lead_by_session(session_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve lead by session ID
    
    Returns: Lead data or None
    """
    client = get_supabase()
    
    result = client.table("leads").select("*").eq("session_id", session_id).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]
    
    return None


def get_lead_by_id(lead_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve lead by ID
    
    Returns: Lead data or None
    """
    client = get_supabase()
    
    result = client.table("leads").select("*").eq("id", lead_id).execute()
    
    if result.data and len(result.data) > 0:
        return result.data[0]
    
    return None


def update_lead_engagement(session_id: str, updates: Dict[str, Any]) -> bool:
    """
    Update lead engagement flags and score
    
    Args:
        session_id: Session ID
        updates: Dict of fields to update
    
    Returns: Success boolean
    """
    client = get_supabase()
    
    # Add timestamp
    updates["last_activity_at"] = datetime.now(timezone.utc).isoformat()
    
    result = client.table("leads").update(updates).eq("session_id", session_id).execute()
    
    if result.data:
        print(f"✅ Lead engagement updated: {session_id}")
        return True
    
    return False


def get_leads_by_tier(tier: str, limit: int = 50) -> list:
    """
    Get leads by tier for prioritization
    
    Args:
        tier: "Hot", "Warm", "Qualified", or "Cold"
        limit: Max results
    
    Returns: List of leads
    """
    client = get_supabase()
    
    result = client.table("leads").select("*").eq(
        "lead_tier", tier
    ).order(
        "lead_score", desc=True
    ).limit(limit).execute()
    
    return result.data or []


def get_recent_leads(days: int = 7, limit: int = 100) -> list:
    """
    Get recent leads for reporting
    
    Args:
        days: Number of days to look back
        limit: Max results
    
    Returns: List of leads
    """
    client = get_supabase()
    
    # Calculate cutoff date
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    result = client.table("leads").select("*").gte(
        "submitted_at", cutoff
    ).order(
        "submitted_at", desc=True
    ).limit(limit).execute()
    
    return result.data or []


def get_lead_stats() -> Dict[str, Any]:
    """
    Get aggregate lead statistics
    
    Returns: Dict with stats
    """
    client = get_supabase()
    
    # Get all leads
    all_leads = client.table("leads").select("lead_tier, lead_score, monthly_loss").execute()
    
    if not all_leads.data:
        return {
            "total_leads": 0,
            "by_tier": {},
            "avg_score": 0,
            "total_potential_revenue": 0
        }
    
    leads = all_leads.data
    
    # Calculate stats
    tier_counts = {}
    total_score = 0
    total_revenue = 0
    
    for lead in leads:
        tier = lead.get("lead_tier", "Unknown")
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        total_score += lead.get("lead_score", 0)
        total_revenue += lead.get("monthly_loss", 0) * 12  # Annual
    
    avg_score = total_score / len(leads) if leads else 0
    
    return {
        "total_leads": len(leads),
        "by_tier": tier_counts,
        "avg_score": round(avg_score, 1),
        "total_potential_revenue": round(total_revenue, 2)
    }


def search_leads(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    company_name: Optional[str] = None,
    min_score: Optional[float] = None
) -> list:
    """
    Search leads by various criteria
    
    Returns: List of matching leads
    """
    client = get_supabase()
    
    query = client.table("leads").select("*")
    
    if email:
        query = query.eq("email", email)
    
    if phone:
        query = query.eq("phone", phone)
    
    if company_name:
        query = query.ilike("company_name", f"%{company_name}%")
    
    if min_score is not None:
        query = query.gte("lead_score", min_score)
    
    result = query.order("lead_score", desc=True).execute()
    
    return result.data or []
