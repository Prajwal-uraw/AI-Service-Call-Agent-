"""
Scraping Pipeline API
Connects scrapers with Supabase and provides frontend endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from config.supabase_config import get_supabase, Tables

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scraping", tags=["Scraping Pipeline"])


class ScrapingJob(BaseModel):
    job_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    results_count: int
    error: Optional[str]


class SignalResult(BaseModel):
    id: int
    title: str
    source: str
    url: str
    pain_score: float
    urgency_score: float
    created_at: datetime
    content_preview: str


@router.get("/status")
async def get_scraping_status() -> Dict[str, Any]:
    """
    Get current status of scraping pipeline
    """
    try:
        supabase = get_supabase()
        
        # Get recent signals count
        signals_response = supabase.table(Tables.SIGNALS).select("*", count="exact").execute()
        total_signals = signals_response.count if hasattr(signals_response, 'count') else len(signals_response.data)
        
        # Get signals from last 24 hours
        from datetime import timedelta
        yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
        recent_signals = supabase.table(Tables.SIGNALS).select("*", count="exact").gte("created_at", yesterday).execute()
        recent_count = recent_signals.count if hasattr(recent_signals, 'count') else len(recent_signals.data)
        
        # Get high-value signals (pain_score > 70)
        high_value = supabase.table(Tables.SIGNALS).select("*", count="exact").gte("pain_score", 70).execute()
        high_value_count = high_value.count if hasattr(high_value, 'count') else len(high_value.data)
        
        return {
            "status": "operational",
            "total_signals": total_signals,
            "signals_last_24h": recent_count,
            "high_value_signals": high_value_count,
            "scrapers": {
                "reddit": "enabled",
                "job_boards": "enabled",
                "licensing": "enabled",
                "bbb": "enabled"
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting scraping status: {e}")
        return {
            "status": "error",
            "error": str(e),
            "total_signals": 0,
            "signals_last_24h": 0,
            "high_value_signals": 0
        }


@router.get("/signals")
async def get_signals(
    limit: int = 50,
    min_pain_score: Optional[float] = None,
    source: Optional[str] = None
) -> List[SignalResult]:
    """
    Get scraped signals from Supabase
    """
    try:
        supabase = get_supabase()
        
        # Build query
        query = supabase.table(Tables.SIGNALS).select("*")
        
        if min_pain_score:
            query = query.gte("pain_score", min_pain_score)
        
        if source:
            query = query.eq("source", source)
        
        # Order by created_at desc and limit
        query = query.order("created_at", desc=True).limit(limit)
        
        response = query.execute()
        
        # Format results
        signals = []
        for signal in response.data:
            signals.append(SignalResult(
                id=signal.get("id"),
                title=signal.get("title", ""),
                source=signal.get("source", ""),
                url=signal.get("url", ""),
                pain_score=signal.get("pain_score", 0),
                urgency_score=signal.get("urgency_score", 0),
                created_at=signal.get("created_at", datetime.utcnow()),
                content_preview=signal.get("content", "")[:200] if signal.get("content") else ""
            ))
        
        return signals
        
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-reddit-scraper")
async def run_reddit_scraper(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Trigger Reddit scraper manually
    """
    try:
        # Import scraper
        from scrapers.reddit_monitor_ai import RedditMonitorAI
        
        # Run in background
        def run_scraper():
            try:
                monitor = RedditMonitorAI()
                stats = monitor.run()
                logger.info(f"Reddit scraper completed: {stats}")
            except Exception as e:
                logger.error(f"Reddit scraper failed: {e}")
        
        background_tasks.add_task(run_scraper)
        
        return {
            "success": True,
            "message": "Reddit scraper started in background",
            "job_id": f"reddit_{datetime.utcnow().timestamp()}"
        }
        
    except Exception as e:
        logger.error(f"Error starting Reddit scraper: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-job-board-scraper")
async def run_job_board_scraper(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Trigger job board scraper manually
    """
    try:
        from scrapers.job_board_monitor import JobBoardMonitor
        
        def run_scraper():
            try:
                monitor = JobBoardMonitor()
                stats = monitor.run()
                logger.info(f"Job board scraper completed: {stats}")
            except Exception as e:
                logger.error(f"Job board scraper failed: {e}")
        
        background_tasks.add_task(run_scraper)
        
        return {
            "success": True,
            "message": "Job board scraper started in background",
            "job_id": f"jobboard_{datetime.utcnow().timestamp()}"
        }
        
    except Exception as e:
        logger.error(f"Error starting job board scraper: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-lite-scraping")
async def run_lite_scraping(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Run a lite scraping round (Reddit only, limited results)
    Perfect for testing and initial data collection
    """
    try:
        from scrapers.reddit_monitor_ai import RedditMonitorAI
        
        def run_lite_scraper():
            try:
                logger.info("Starting lite scraping round...")
                monitor = RedditMonitorAI()
                
                # Override to fetch fewer posts for lite mode
                monitor.max_posts_per_subreddit = 10
                
                stats = monitor.run()
                logger.info(f"Lite scraping completed: {stats}")
                
                # Store job result
                supabase = get_supabase()
                supabase.table("scraping_jobs").insert({
                    "job_type": "lite_reddit",
                    "status": "completed",
                    "started_at": datetime.utcnow().isoformat(),
                    "completed_at": datetime.utcnow().isoformat(),
                    "results_count": stats.get("total_saved", 0),
                    "metadata": stats
                }).execute()
                
            except Exception as e:
                logger.error(f"Lite scraping failed: {e}")
                # Store error
                try:
                    supabase = get_supabase()
                    supabase.table("scraping_jobs").insert({
                        "job_type": "lite_reddit",
                        "status": "failed",
                        "started_at": datetime.utcnow().isoformat(),
                        "completed_at": datetime.utcnow().isoformat(),
                        "error": str(e)
                    }).execute()
                except:
                    pass
        
        background_tasks.add_task(run_lite_scraper)
        
        return {
            "success": True,
            "message": "Lite scraping started (Reddit only, 10 posts per subreddit)",
            "job_id": f"lite_{datetime.utcnow().timestamp()}",
            "estimated_duration": "30-60 seconds"
        }
        
    except Exception as e:
        logger.error(f"Error starting lite scraping: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def get_scraping_jobs(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Get recent scraping job history
    """
    try:
        supabase = get_supabase()
        
        response = supabase.table("scraping_jobs").select("*").order("started_at", desc=True).limit(limit).execute()
        
        return response.data
        
    except Exception as e:
        logger.error(f"Error fetching scraping jobs: {e}")
        # Return empty list if table doesn't exist yet
        return []


@router.delete("/signals/{signal_id}")
async def delete_signal(signal_id: int) -> Dict[str, Any]:
    """
    Delete a signal by ID
    """
    try:
        supabase = get_supabase()
        
        supabase.table(Tables.SIGNALS).delete().eq("id", signal_id).execute()
        
        return {
            "success": True,
            "message": f"Signal {signal_id} deleted"
        }
        
    except Exception as e:
        logger.error(f"Error deleting signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_scraping_analytics() -> Dict[str, Any]:
    """
    Get analytics on scraped data
    """
    try:
        supabase = get_supabase()
        
        # Get all signals
        all_signals = supabase.table(Tables.SIGNALS).select("*").execute()
        
        # Calculate analytics
        total = len(all_signals.data)
        
        if total == 0:
            return {
                "total_signals": 0,
                "average_pain_score": 0,
                "average_urgency_score": 0,
                "by_source": {},
                "high_value_count": 0,
                "medium_value_count": 0,
                "low_value_count": 0
            }
        
        pain_scores = [s.get("pain_score", 0) for s in all_signals.data]
        urgency_scores = [s.get("urgency_score", 0) for s in all_signals.data]
        
        # Count by source
        by_source = {}
        for signal in all_signals.data:
            source = signal.get("source", "unknown")
            by_source[source] = by_source.get(source, 0) + 1
        
        # Count by value tier
        high_value = sum(1 for s in all_signals.data if s.get("pain_score", 0) >= 70)
        medium_value = sum(1 for s in all_signals.data if 40 <= s.get("pain_score", 0) < 70)
        low_value = sum(1 for s in all_signals.data if s.get("pain_score", 0) < 40)
        
        return {
            "total_signals": total,
            "average_pain_score": sum(pain_scores) / total,
            "average_urgency_score": sum(urgency_scores) / total,
            "by_source": by_source,
            "high_value_count": high_value,
            "medium_value_count": medium_value,
            "low_value_count": low_value
        }
        
    except Exception as e:
        logger.error(f"Error calculating analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
