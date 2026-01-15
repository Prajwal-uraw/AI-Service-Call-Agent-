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
        response = supabase.table("leads").select("*").execute()
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
        
        # Build query with only existing columns
        query = supabase.table("leads").select("""
            id, email, phone, business_name, business_type,
            lead_score, tier, status, source_type,
            created_at, updated_at, pdf_url, custom_fields
        """)
        
        # Apply filters
        if tier:
            query = query.eq("tier", tier)
        
        if min_loss is not None:
            # Filtering on custom_fields requires a different approach
            # We'll filter in Python after fetching
            pass
        
        if has_email is not None:
            if has_email:
                query = query.not_.is_("email", "null")
            else:
                query = query.is_("email", "null")
        
        if days:
            cutoff = datetime.now(timezone.utc) - timedelta(days=days)
            query = query.gte("created_at", cutoff.isoformat())
        
        # Order and paginate
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        response = query.execute()
        leads = response.data
        
        # Convert to response model with proper error handling
        result = []
        for lead in leads:
            custom_fields = lead.get("custom_fields", {})
            lead_data = {
                "id": lead.get("id"),
                "session_id": custom_fields.get("session_id"),
                "email": lead.get("email"),
                "phone": lead.get("phone"),
                "company_name": lead.get("business_name"),
                "business_type": lead.get("business_type"),
                "monthly_loss": custom_fields.get("monthly_loss"),
                "annual_loss": custom_fields.get("annual_loss"),
                "lead_score": lead.get("lead_score"),
                "lead_tier": lead.get("tier"),
                "submitted_at": lead.get("created_at"),
                "pdf_url": lead.get("pdf_url"),
                "viewed_full_report": custom_fields.get("viewed_full_report", False),
                "downloaded_pdf": custom_fields.get("downloaded_pdf", False),
                "clicked_cta": custom_fields.get("clicked_cta", False),
                "email_opened": custom_fields.get("email_opened", False)
            }
            
            # Apply min_loss filter in Python since it's in custom_fields
            if min_loss is not None and lead_data["monthly_loss"] is not None and lead_data["monthly_loss"] < min_loss:
                continue
            
            try:
                result.append(LeadSummary(**lead_data))
            except Exception as e:
                print(f"Error processing lead {lead.get('id')}: {str(e)}")
                continue
                
        return result
        
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
        
        # Get all fields including custom_fields
        response = supabase.table("leads").select("*").execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="No leads found")
        
        # Find lead by session_id in custom_fields
        lead = None
        for item in response.data:
            custom_fields = item.get('custom_fields', {})
            if custom_fields.get('session_id') == session_id:
                lead = item
                lead['custom_fields'] = custom_fields
                break
                
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
            
        custom_fields = lead.get('custom_fields', {})
        
        return LeadDetail(
            id=lead['id'],
            session_id=custom_fields.get('session_id'),
            email=lead.get('email'),
            phone=lead.get('phone'),
            company_name=lead.get('business_name'),
            location=custom_fields.get('location'),
            business_type=lead.get('business_type', ''),
            monthly_loss=custom_fields.get('monthly_loss', 0),
            annual_loss=custom_fields.get('annual_loss', 0),
            lead_score=lead.get('lead_score', 0),
            lead_tier=lead.get('tier', 'Qualified'),
            submitted_at=datetime.fromisoformat(lead['created_at'].replace('Z', '+00:00')),
            last_activity_at=datetime.fromisoformat(lead['updated_at'].replace('Z', '+00:00')) if lead.get('updated_at') else None,
            referral_source=lead.get('referral_source'),
            pdf_url=lead.get('pdf_url'),
            pdf_path=custom_fields.get('pdf_path'),
            viewed_full_report=custom_fields.get('viewed_full_report', False),
            downloaded_pdf=custom_fields.get('downloaded_pdf', False),
            clicked_cta=custom_fields.get('clicked_cta', False),
            email_opened=custom_fields.get('email_opened', False),
            raw_input=custom_fields.get('raw_input', {}),
            raw_output=custom_fields.get('raw_output', {})
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
        
        # Get all leads with necessary fields
        response = supabase.table("leads").select("created_at, tier, custom_fields").execute()
        leads = response.data
        
        # Filter by date and process
        filtered_leads = []
        for lead in leads:
            created_at = lead.get('created_at')
            if not created_at:
                continue
                
            # Parse date and check if it's within the cutoff
            try:
                lead_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                if lead_date >= cutoff:
                    filtered_leads.append(lead)
            except (ValueError, TypeError):
                continue
        
        # Group by date
        daily_data = {}
        for lead in filtered_leads:
            try:
                lead_date = datetime.fromisoformat(lead['created_at'].replace('Z', '+00:00'))
                date_str = lead_date.strftime('%Y-%m-%d')
                
                if date_str not in daily_data:
                    daily_data[date_str] = {
                        'date': date_str,
                        'total': 0,
                        'hot': 0,
                        'warm': 0,
                        'qualified': 0,
                        'total_loss': 0
                    }
                
                daily_data[date_str]['total'] += 1
                
                # Get monthly_loss from custom_fields
                custom_fields = lead.get('custom_fields', {})
                monthly_loss = float(custom_fields.get('monthly_loss', 0))
                daily_data[date_str]['total_loss'] += monthly_loss
                
                # Get tier, default to 'qualified' if not set
                tier = (lead.get('tier') or 'qualified').lower()
                if tier in daily_data[date_str]:
                    daily_data[date_str][tier] += 1
            except (KeyError, ValueError, TypeError) as e:
                print(f"Error processing lead: {e}")
                continue
        
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
        
        # Get all leads with necessary fields
        response = supabase.table("leads").select("tier, custom_fields").execute()
        leads = response.data
        
        if not leads:
            return {"sources": [], "total_sources": 0}
        
        # Group by source
        sources = {}
        for lead in leads:
            try:
                custom_fields = lead.get('custom_fields', {})
                source = custom_fields.get('referral_source', 'Direct')
                
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
                
                # Get monthly_loss from custom_fields
                monthly_loss = float(custom_fields.get('monthly_loss', 0))
                sources[source]['total_loss'] += monthly_loss
                
                # Get tier, default to 'qualified' if not set
                tier = (lead.get('tier') or 'qualified').lower()
                if tier in sources[source]:
                    sources[source][tier] += 1
                    
            except (KeyError, ValueError, TypeError) as e:
                print(f"Error processing lead: {e}")
                continue
        
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
        
        # Get all leads with necessary fields
        query = supabase.table("leads").select("*")
        
        if tier:
            query = query.eq("tier", tier)
        
        response = query.execute()
        all_leads = response.data
        
        # Filter by days if needed
        if days is not None:
            cutoff = datetime.now(timezone.utc) - timedelta(days=days)
            filtered_leads = []
            for lead in all_leads:
                try:
                    created_at = lead.get('created_at')
                    if created_at:
                        lead_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        if lead_date >= cutoff:
                            filtered_leads.append(lead)
                except (ValueError, TypeError):
                    continue
            leads = filtered_leads
        else:
            leads = all_leads
        
        # Generate CSV
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'ID', 'Email', 'Phone', 'Business Name', 'Business Type',
            'Lead Score', 'Tier', 'Status', 'Source Type',
            'Created At', 'Updated At', 'PDF URL'
        ])
        
        # Rows
        for lead in leads:
            custom_fields = lead.get('custom_fields', {})
            writer.writerow([
                lead.get('id', ''),
                lead.get('email', ''),
                lead.get('phone', ''),
                lead.get('business_name', ''),
                lead.get('business_type', ''),
                lead.get('lead_score', ''),
                lead.get('tier', ''),
                lead.get('status', ''),
                lead.get('source_type', ''),
                lead.get('created_at', ''),
                lead.get('updated_at', ''),
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
