"""
Scraped Leads API
Provides access to leads from scraping operations - fetches from Supabase
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timedelta
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scraped-leads", tags=["scraped-leads"])

def get_supabase_client():
    """Get Supabase client"""
    try:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL", "https://soudakcdmpcfavticrxd.supabase.co")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")
        if not key:
            return None
        return create_client(url, key)
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        return None


@router.get("")
async def get_scraped_leads(
    limit: int = Query(50, ge=1, le=200),
    status: str = Query("new", description="Filter by status: new, contacted, converted"),
    priority: Optional[str] = Query(None, description="Filter by priority: high, medium, low"),
    source: Optional[str] = Query(None, description="Filter by source: signals, job_board, bbb, licensing, local_business")
):
    """
    Get scraped leads from Supabase database
    Fetches from signals table and specialized scraper tables
    """
    try:
        supabase = get_supabase_client()
        
        if supabase:
            all_leads = []
            
            # Fetch from signals table
            try:
                signals_query = supabase.table("signals").select("*").order("created_at", desc=True).limit(limit)
                if priority == "high":
                    signals_query = signals_query.gte("pain_score", 70)
                elif priority == "medium":
                    signals_query = signals_query.gte("pain_score", 40).lt("pain_score", 70)
                elif priority == "low":
                    signals_query = signals_query.lt("pain_score", 40)
                
                signals_result = signals_query.execute()
                
                for signal in signals_result.data:
                    pain_score = signal.get("pain_score", 0) or 0
                    all_leads.append({
                        "id": str(signal.get("id")),
                        "name": signal.get("business_name") or signal.get("title", "Unknown"),
                        "phone": signal.get("contact_phone"),
                        "email": signal.get("contact_email"),
                        "location": signal.get("location", ""),
                        "source": f"Signal - {signal.get('source', 'Unknown')}",
                        "priority": "high" if pain_score >= 70 else "medium" if pain_score >= 40 else "low",
                        "created_at": signal.get("created_at"),
                        "notes": signal.get("content", "")[:200] if signal.get("content") else "",
                        "url": signal.get("url"),
                        "pain_score": pain_score
                    })
            except Exception as e:
                logger.warning(f"Error fetching signals: {e}")
            
            # Fetch from job_board_signals if exists
            if not source or source == "job_board":
                try:
                    job_result = supabase.table("job_board_signals").select("*").order("created_at", desc=True).limit(limit).execute()
                    for job in job_result.data:
                        score = job.get("score", 0) or 0
                        all_leads.append({
                            "id": str(job.get("id")),
                            "name": job.get("company_name", "Unknown Company"),
                            "phone": None,
                            "email": None,
                            "location": job.get("location", ""),
                            "source": f"Job Board - {job.get('source', 'Indeed')}",
                            "priority": "high" if score >= 70 else "medium" if score >= 40 else "low",
                            "created_at": job.get("created_at"),
                            "notes": f"{job.get('job_title', '')} - {job.get('description', '')[:150]}",
                            "url": job.get("job_url"),
                            "pain_score": score
                        })
                except Exception as e:
                    logger.debug(f"job_board_signals table may not exist: {e}")
            
            # Fetch from bbb_signals if exists
            if not source or source == "bbb":
                try:
                    bbb_result = supabase.table("bbb_signals").select("*").order("created_at", desc=True).limit(limit).execute()
                    for bbb in bbb_result.data:
                        score = bbb.get("score", 0) or 0
                        all_leads.append({
                            "id": str(bbb.get("id")),
                            "name": bbb.get("business_name", "Unknown Business"),
                            "phone": bbb.get("phone"),
                            "email": None,
                            "location": bbb.get("location", ""),
                            "source": "BBB",
                            "priority": "high" if score >= 70 else "medium" if score >= 40 else "low",
                            "created_at": bbb.get("created_at"),
                            "notes": f"Rating: {bbb.get('rating', 'N/A')} - Complaints: {bbb.get('complaints_count', 0)}",
                            "url": bbb.get("bbb_url"),
                            "pain_score": score
                        })
                except Exception as e:
                    logger.debug(f"bbb_signals table may not exist: {e}")
            
            # Fetch from licensing_signals if exists
            if not source or source == "licensing":
                try:
                    lic_result = supabase.table("licensing_signals").select("*").order("created_at", desc=True).limit(limit).execute()
                    for lic in lic_result.data:
                        score = lic.get("score", 0) or 0
                        all_leads.append({
                            "id": str(lic.get("id")),
                            "name": lic.get("business_name", "Unknown Business"),
                            "phone": lic.get("phone"),
                            "email": lic.get("email"),
                            "location": f"{lic.get('address', '')} - {lic.get('state', '')}",
                            "source": f"Licensing - {lic.get('state', 'Unknown')}",
                            "priority": "high" if score >= 70 else "medium" if score >= 40 else "low",
                            "created_at": lic.get("created_at"),
                            "notes": f"License: {lic.get('license_type', '')} #{lic.get('license_number', '')}",
                            "url": None,
                            "pain_score": score
                        })
                except Exception as e:
                    logger.debug(f"licensing_signals table may not exist: {e}")
            
            # Fetch from local_business_signals if exists
            if not source or source == "local_business":
                try:
                    local_result = supabase.table("local_business_signals").select("*").order("created_at", desc=True).limit(limit).execute()
                    for local in local_result.data:
                        score = local.get("score", 0) or 0
                        all_leads.append({
                            "id": str(local.get("id")),
                            "name": local.get("business_name", "Unknown Business"),
                            "phone": local.get("phone"),
                            "email": None,
                            "location": f"{local.get('city', '')}, {local.get('state', '')}",
                            "source": f"Local Business - {local.get('source', 'Google')}",
                            "priority": "high" if score >= 70 else "medium" if score >= 40 else "low",
                            "created_at": local.get("created_at"),
                            "notes": f"Rating: {local.get('google_rating', 'N/A')} ({local.get('review_count', 0)} reviews)",
                            "url": local.get("website"),
                            "pain_score": score
                        })
                except Exception as e:
                    logger.debug(f"local_business_signals table may not exist: {e}")
            
            # Sort by created_at and limit
            all_leads.sort(key=lambda x: x.get("created_at") or "", reverse=True)
            all_leads = all_leads[:limit]
            
            if all_leads:
                return {
                    "leads": all_leads,
                    "total": len(all_leads),
                    "status": status,
                    "priority_filter": priority,
                    "source": "database"
                }
        
        # Return empty if no data found
        return {
            "leads": [],
            "total": 0,
            "status": status,
            "priority_filter": priority,
            "source": "database",
            "message": "No leads found. Run scrapers to populate data."
        }
        
    except Exception as e:
        logger.error(f"Error fetching scraped leads: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch leads: {str(e)}"
        )


@router.get("/{lead_id}")
async def get_lead_details(lead_id: str):
    """
    Get detailed information about a specific lead
    """
    try:
        # Mock data - will integrate with actual database
        lead_details = {
            "id": lead_id,
            "name": "John's HVAC Service",
            "phone": "+1 (555) 234-5678",
            "email": "john@hvacservice.com",
            "location": "Austin, TX",
            "source": "Reddit - r/HVAC",
            "priority": "high",
            "created_at": datetime.utcnow().isoformat(),
            "notes": "Posted about needing emergency AC repair service",
            "history": [
                {
                    "action": "Lead captured",
                    "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                    "details": "Scraped from Reddit post"
                }
            ],
            "metadata": {
                "post_url": "https://reddit.com/r/HVAC/comments/example",
                "sentiment": "urgent",
                "keywords": ["emergency", "AC repair", "not cooling"]
            }
        }
        
        return lead_details
        
    except Exception as e:
        logger.error(f"Error fetching lead details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lead details: {str(e)}"
        )


@router.post("/{lead_id}/contact")
async def mark_lead_contacted(lead_id: str, notes: Optional[str] = None):
    """
    Mark a lead as contacted
    """
    try:
        # TODO: Update lead status in database
        return {
            "success": True,
            "lead_id": lead_id,
            "status": "contacted",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error marking lead as contacted: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update lead: {str(e)}"
        )
