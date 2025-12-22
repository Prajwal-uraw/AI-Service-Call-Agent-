"""
CRM Scrapers Control API
Trigger and monitor scraper jobs from the CRM
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/crm/scrapers", tags=["CRM - Scrapers"])

# Models
class ScraperJobCreate(BaseModel):
    scraper_type: str  # reddit, job_board, licensing
    job_name: Optional[str] = None
    config: Dict = {}
    triggered_by_user: Optional[str] = "admin"


@router.get("/jobs")
async def get_scraper_jobs(
    limit: int = 50,
    offset: int = 0,
    scraper_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all scraper jobs"""
    try:
        supabase = get_supabase()
        
        query = supabase.table("scraper_jobs").select("*")
        
        if scraper_type:
            query = query.eq("scraper_type", scraper_type)
        
        if status:
            query = query.eq("status", status)
        
        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "jobs": response.data,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}")
async def get_scraper_job(job_id: str):
    """Get single scraper job"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("scraper_jobs").select("*").eq("id", job_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs")
async def create_scraper_job(
    job: ScraperJobCreate,
    background_tasks: BackgroundTasks
):
    """Create and optionally run a scraper job"""
    try:
        supabase = get_supabase()
        
        job_data = job.dict()
        job_data["triggered_by"] = "manual"
        job_data["status"] = "pending"
        
        if not job_data.get("job_name"):
            job_data["job_name"] = f"{job.scraper_type.title()} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        response = supabase.table("scraper_jobs").insert(job_data).execute()
        
        job_record = response.data[0] if response.data else None
        
        if not job_record:
            raise HTTPException(status_code=500, detail="Failed to create job")
        
        # Queue the scraper to run in background
        background_tasks.add_task(
            run_scraper_job,
            job_record["id"],
            job.scraper_type,
            job.config
        )
        
        return {
            "success": True,
            "message": f"Scraper job created and queued",
            "job": job_record
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def run_scraper_job(job_id: str, scraper_type: str, config: Dict):
    """Background task to run scraper"""
    try:
        supabase = get_supabase()
        
        # Update job status to running
        supabase.table("scraper_jobs").update({
            "status": "running",
            "started_at": datetime.now().isoformat()
        }).eq("id", job_id).execute()
        
        start_time = datetime.now()
        signals_found = 0
        signals_new = 0
        signals_updated = 0
        
        # Import and run the appropriate scraper
        if scraper_type == "reddit":
            from scrapers.reddit_monitor_ai import RedditMonitor
            
            monitor = RedditMonitor()
            results = monitor.run_monitoring()
            
            signals_found = results.get("total_signals", 0)
            signals_new = results.get("new_signals", 0)
            
        elif scraper_type == "job_board":
            from scrapers.job_board_monitor import JobBoardMonitor
            
            monitor = JobBoardMonitor()
            results = monitor.monitor_job_boards()
            
            signals_found = results.get("total_signals", 0)
            signals_new = results.get("new_signals", 0)
            
        elif scraper_type == "licensing":
            from scrapers.licensing_monitor import LicensingMonitor
            
            monitor = LicensingMonitor()
            results = monitor.monitor_licensing_boards()
            
            signals_found = results.get("total_signals", 0)
            signals_new = results.get("new_signals", 0)
        
        else:
            raise ValueError(f"Unknown scraper type: {scraper_type}")
        
        # Calculate duration
        end_time = datetime.now()
        duration = int((end_time - start_time).total_seconds())
        
        # Update job with results
        supabase.table("scraper_jobs").update({
            "status": "completed",
            "completed_at": end_time.isoformat(),
            "duration_seconds": duration,
            "signals_found": signals_found,
            "signals_new": signals_new,
            "signals_updated": signals_updated
        }).eq("id", job_id).execute()
        
        print(f"Scraper job {job_id} completed: {signals_found} signals found, {signals_new} new")
        
    except Exception as e:
        print(f"Scraper job {job_id} failed: {str(e)}")
        
        # Update job with error
        supabase.table("scraper_jobs").update({
            "status": "failed",
            "completed_at": datetime.now().isoformat(),
            "error_message": str(e),
            "error_details": {"error": str(e)}
        }).eq("id", job_id).execute()


@router.get("/stats")
async def get_scraper_stats():
    """Get scraper statistics"""
    try:
        supabase = get_supabase()
        
        # Get job counts by type and status
        jobs_response = supabase.table("scraper_jobs").select("scraper_type, status").execute()
        
        stats = {
            "by_type": {},
            "by_status": {},
            "total_jobs": len(jobs_response.data or [])
        }
        
        for job in jobs_response.data or []:
            scraper_type = job.get("scraper_type", "unknown")
            status = job.get("status", "unknown")
            
            if scraper_type not in stats["by_type"]:
                stats["by_type"][scraper_type] = 0
            stats["by_type"][scraper_type] += 1
            
            if status not in stats["by_status"]:
                stats["by_status"][status] = 0
            stats["by_status"][status] += 1
        
        # Get signal counts by source
        signals_response = supabase.table("unified_signals_with_ai").select("source").execute()
        
        stats["signals_by_source"] = {}
        for signal in signals_response.data or []:
            source = signal.get("source", "unknown")
            if source not in stats["signals_by_source"]:
                stats["signals_by_source"][source] = 0
            stats["signals_by_source"][source] += 1
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available")
async def get_available_scrapers():
    """Get list of available scrapers"""
    return {
        "scrapers": [
            {
                "type": "reddit",
                "name": "Reddit Monitor",
                "description": "Monitor Reddit for HVAC pain signals",
                "status": "active",
                "config_options": {
                    "subreddits": ["HVAC", "Plumbing", "HomeImprovement", "hvacadvice", "HVAC_Tech"],
                    "limit": 100
                }
            },
            {
                "type": "job_board",
                "name": "Job Board Monitor",
                "description": "Monitor job boards for HVAC hiring signals",
                "status": "available",
                "config_options": {
                    "boards": ["indeed", "ziprecruiter"],
                    "keywords": ["HVAC technician", "HVAC installer"]
                }
            },
            {
                "type": "licensing",
                "name": "Licensing Board Monitor",
                "description": "Monitor state licensing boards for new HVAC licenses",
                "status": "available",
                "config_options": {
                    "states": ["TX", "FL", "CA", "AZ", "GA"],
                    "license_types": ["HVAC", "Mechanical"]
                }
            }
        ]
    }
