"""
Admin API for Kestrel Calculator Lead Management
Provides endpoints for viewing, filtering, and managing calculator submissions
"""

from typing import Optional, List
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# Response Models
class LeadSummary(BaseModel):
    id: str
    session_id: str
    email: Optional[str]
    phone: Optional[str]
    company_name: Optional[str]
    business_type: str
    monthly_loss: float
    annual_loss: float
    lead_score: int
    lead_tier: str
    submitted_at: datetime
    pdf_url: Optional[str]
    viewed_full_report: bool
    downloaded_pdf: bool
    clicked_cta: bool
    email_opened: bool


class DashboardStats(BaseModel):
    total_leads: int
    hot_leads: int
    warm_leads: int
    qualified_leads: int
    total_potential_revenue: float
    avg_monthly_loss: float
    conversion_rate: float
    email_open_rate: float
    pdf_download_rate: float
    leads_last_7_days: int
    leads_last_30_days: int


class LeadDetail(BaseModel):
    # All fields from LeadSummary plus raw data
    id: str
    session_id: str
    email: Optional[str]
    phone: Optional[str]
    company_name: Optional[str]
    location: Optional[str]
    business_type: str
    monthly_loss: float
    annual_loss: float
    lead_score: int
    lead_tier: str
    submitted_at: datetime
    last_activity_at: Optional[datetime]
    referral_source: Optional[str]
    pdf_url: Optional[str]
    pdf_path: Optional[str]
    viewed_full_report: bool
    downloaded_pdf: bool
    clicked_cta: bool
    email_opened: bool
    raw_input: dict
    raw_output: dict


# API Endpoints

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """
    Get high-level dashboard statistics
    
    Returns:
        - Total leads and breakdown by tier
        - Revenue potential
        - Engagement metrics
        - Recent activity
    """
    try:
        supabase = get_supabase()
        
        # Get all leads
        response = supabase.table("calculator_submissions").select("*").execute()
        leads = response.data
        
        if not leads:
            return DashboardStats(
                total_leads=0,
                hot_leads=0,
                warm_leads=0,
                qualified_leads=0,
                total_potential_revenue=0,
                avg_monthly_loss=0,
                conversion_rate=0,
                email_open_rate=0,
                pdf_download_rate=0,
                leads_last_7_days=0,
                leads_last_30_days=0
            )
        
        # Calculate stats
        total_leads = len(leads)
        hot_leads = sum(1 for l in leads if l.get('lead_tier') == 'Hot')
        warm_leads = sum(1 for l in leads if l.get('lead_tier') == 'Warm')
        qualified_leads = sum(1 for l in leads if l.get('lead_tier') == 'Qualified')
        
        total_potential_revenue = sum(l.get('annual_loss', 0) for l in leads)
        avg_monthly_loss = sum(l.get('monthly_loss', 0) for l in leads) / total_leads if total_leads > 0 else 0
        
        # Engagement metrics
        leads_with_email = [l for l in leads if l.get('email')]
        email_open_rate = (sum(1 for l in leads_with_email if l.get('email_opened', False)) / len(leads_with_email) * 100) if leads_with_email else 0
        pdf_download_rate = (sum(1 for l in leads if l.get('downloaded_pdf', False)) / total_leads * 100) if total_leads > 0 else 0
        conversion_rate = (sum(1 for l in leads if l.get('clicked_cta', False)) / total_leads * 100) if total_leads > 0 else 0
        
        # Recent activity
        now = datetime.now(timezone.utc)
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)
        
        leads_last_7_days = sum(1 for l in leads if datetime.fromisoformat(l['submitted_at'].replace('Z', '+00:00')) > seven_days_ago)
        leads_last_30_days = sum(1 for l in leads if datetime.fromisoformat(l['submitted_at'].replace('Z', '+00:00')) > thirty_days_ago)
        
        return DashboardStats(
            total_leads=total_leads,
            hot_leads=hot_leads,
            warm_leads=warm_leads,
            qualified_leads=qualified_leads,
            total_potential_revenue=total_potential_revenue,
            avg_monthly_loss=avg_monthly_loss,
            conversion_rate=round(conversion_rate, 2),
            email_open_rate=round(email_open_rate, 2),
            pdf_download_rate=round(pdf_download_rate, 2),
            leads_last_7_days=leads_last_7_days,
            leads_last_30_days=leads_last_30_days
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/leads", response_model=List[LeadSummary])
async def get_leads(
    tier: Optional[str] = Query(None, description="Filter by lead tier: Hot, Warm, Qualified"),
    min_loss: Optional[float] = Query(None, description="Minimum monthly loss"),
    has_email: Optional[bool] = Query(None, description="Filter leads with email"),
    days: Optional[int] = Query(None, description="Leads from last N days"),
    limit: int = Query(100, le=500, description="Max results to return"),
    offset: int = Query(0, description="Pagination offset")
):
    """
    Get filtered list of calculator leads
    
    Supports filtering by:
    - Lead tier (Hot/Warm/Qualified)
    - Minimum monthly loss
    - Email presence
    - Time range
    """
    try:
        supabase = get_supabase()
        
        # Build query
        query = supabase.table("calculator_submissions").select("*")
        
        # Apply filters
        if tier:
            query = query.eq("lead_tier", tier)
        
        if min_loss is not None:
            query = query.gte("monthly_loss", min_loss)
        
        if has_email is not None:
            if has_email:
                query = query.not_.is_("email", "null")
            else:
                query = query.is_("email", "null")
        
        if days:
            cutoff = datetime.now(timezone.utc) - timedelta(days=days)
            query = query.gte("submitted_at", cutoff.isoformat())
        
        # Order and paginate
        query = query.order("submitted_at", desc=True).range(offset, offset + limit - 1)
        
        response = query.execute()
        leads = response.data
        
        # Convert to response model
        return [
            LeadSummary(
                id=lead['id'],
                session_id=lead['session_id'],
                email=lead.get('email'),
                phone=lead.get('phone'),
                company_name=lead.get('company_name'),
                business_type=lead['business_type'],
                monthly_loss=lead['monthly_loss'],
                annual_loss=lead['annual_loss'],
                lead_score=lead['lead_score'],
                lead_tier=lead['lead_tier'],
                submitted_at=datetime.fromisoformat(lead['submitted_at'].replace('Z', '+00:00')),
                pdf_url=lead.get('pdf_url'),
                viewed_full_report=lead.get('viewed_full_report', False),
                downloaded_pdf=lead.get('downloaded_pdf', False),
                clicked_cta=lead.get('clicked_cta', False),
                email_opened=lead.get('email_opened', False)
            )
            for lead in leads
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")


@router.get("/leads/{session_id}", response_model=LeadDetail)
async def get_lead_detail(session_id: str):
    """
    Get detailed information for a specific lead
    
    Includes:
    - All lead data
    - Raw calculator input/output
    - Engagement history
    - PDF information
    """
    try:
        supabase = get_supabase()
        
        response = supabase.table("calculator_submissions").select("*").eq("session_id", session_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        lead = response.data[0]
        
        return LeadDetail(
            id=lead['id'],
            session_id=lead['session_id'],
            email=lead.get('email'),
            phone=lead.get('phone'),
            company_name=lead.get('company_name'),
            location=lead.get('location'),
            business_type=lead['business_type'],
            monthly_loss=lead['monthly_loss'],
            annual_loss=lead['annual_loss'],
            lead_score=lead['lead_score'],
            lead_tier=lead['lead_tier'],
            submitted_at=datetime.fromisoformat(lead['submitted_at'].replace('Z', '+00:00')),
            last_activity_at=datetime.fromisoformat(lead['last_activity_at'].replace('Z', '+00:00')) if lead.get('last_activity_at') else None,
            referral_source=lead.get('referral_source'),
            pdf_url=lead.get('pdf_url'),
            pdf_path=lead.get('pdf_path'),
            viewed_full_report=lead.get('viewed_full_report', False),
            downloaded_pdf=lead.get('downloaded_pdf', False),
            clicked_cta=lead.get('clicked_cta', False),
            email_opened=lead.get('email_opened', False),
            raw_input=lead.get('raw_input', {}),
            raw_output=lead.get('raw_output', {})
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lead: {str(e)}")


@router.get("/analytics/timeline")
async def get_timeline_analytics(days: int = Query(30, le=365, description="Days to analyze")):
    """
    Get lead submission timeline data
    
    Returns daily counts for charting
    """
    try:
        supabase = get_supabase()
        
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        
        response = supabase.table("calculator_submissions")\
            .select("submitted_at, lead_tier, monthly_loss")\
            .gte("submitted_at", cutoff.isoformat())\
            .execute()
        
        leads = response.data
        
        # Group by date
        daily_data = {}
        for lead in leads:
            date = lead['submitted_at'][:10]  # YYYY-MM-DD
            if date not in daily_data:
                daily_data[date] = {
                    'date': date,
                    'total': 0,
                    'hot': 0,
                    'warm': 0,
                    'qualified': 0,
                    'total_loss': 0
                }
            
            daily_data[date]['total'] += 1
            daily_data[date]['total_loss'] += lead.get('monthly_loss', 0)
            
            tier = lead.get('lead_tier', 'Qualified').lower()
            if tier in daily_data[date]:
                daily_data[date][tier] += 1
        
        # Convert to sorted list
        timeline = sorted(daily_data.values(), key=lambda x: x['date'])
        
        return {
            "timeline": timeline,
            "total_leads": len(leads),
            "date_range": {
                "start": cutoff.isoformat(),
                "end": datetime.now(timezone.utc).isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline: {str(e)}")


@router.get("/analytics/sources")
async def get_source_analytics():
    """
    Analyze lead sources and referrals
    """
    try:
        supabase = get_supabase()
        
        response = supabase.table("calculator_submissions")\
            .select("referral_source, lead_tier, monthly_loss")\
            .execute()
        
        leads = response.data
        
        # Group by source
        sources = {}
        for lead in leads:
            source = lead.get('referral_source') or 'Direct'
            if source not in sources:
                sources[source] = {
                    'source': source,
                    'count': 0,
                    'hot': 0,
                    'warm': 0,
                    'qualified': 0,
                    'avg_loss': 0,
                    'total_loss': 0
                }
            
            sources[source]['count'] += 1
            sources[source]['total_loss'] += lead.get('monthly_loss', 0)
            
            tier = lead.get('lead_tier', 'Qualified').lower()
            if tier in sources[source]:
                sources[source][tier] += 1
        
        # Calculate averages
        for source_data in sources.values():
            if source_data['count'] > 0:
                source_data['avg_loss'] = source_data['total_loss'] / source_data['count']
        
        return {
            "sources": list(sources.values()),
            "total_sources": len(sources)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch source analytics: {str(e)}")


@router.get("/export/csv")
async def export_leads_csv(
    tier: Optional[str] = Query(None),
    days: Optional[int] = Query(None)
):
    """
    Export leads to CSV format
    
    Returns CSV string for download
    """
    try:
        supabase = get_supabase()
        
        # Build query
        query = supabase.table("calculator_submissions").select("*")
        
        if tier:
            query = query.eq("lead_tier", tier)
        
        if days:
            cutoff = datetime.now(timezone.utc) - timedelta(days=days)
            query = query.gte("submitted_at", cutoff.isoformat())
        
        response = query.execute()
        leads = response.data
        
        # Generate CSV
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Session ID', 'Email', 'Phone', 'Company Name', 'Business Type',
            'Monthly Loss', 'Annual Loss', 'Lead Tier', 'Lead Score',
            'Submitted At', 'Email Opened', 'PDF Downloaded', 'CTA Clicked',
            'PDF URL'
        ])
        
        # Data rows
        for lead in leads:
            writer.writerow([
                lead['session_id'],
                lead.get('email', ''),
                lead.get('phone', ''),
                lead.get('company_name', ''),
                lead['business_type'],
                lead['monthly_loss'],
                lead['annual_loss'],
                lead['lead_tier'],
                lead['lead_score'],
                lead['submitted_at'],
                lead.get('email_opened', False),
                lead.get('downloaded_pdf', False),
                lead.get('clicked_cta', False),
                lead.get('pdf_url', '')
            ])
        
        csv_content = output.getvalue()
        output.close()
        
        from fastapi.responses import Response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=kestrel_leads_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export CSV: {str(e)}")
