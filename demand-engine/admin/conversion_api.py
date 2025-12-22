"""
Lead Conversion API
Endpoints for converting pain signals to leads and tracking conversions
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.lead_converter import LeadConverter

router = APIRouter(prefix="/api/admin/conversion", tags=["Lead Conversion"])

# Response Models
class ConversionResponse(BaseModel):
    success: bool
    lead_id: Optional[str] = None
    message: str

class ConversionStatsResponse(BaseModel):
    total_signals: int
    converted_signals: int
    conversion_rate: float
    avg_score_converted: float
    avg_score_not_converted: float
    by_source: Dict

class ConversionTimelineItem(BaseModel):
    date: str
    total_signals: int
    converted_signals: int
    conversion_rate: float

class AutoConvertRequest(BaseModel):
    min_score: int = 70
    limit: int = 50

class ConvertSignalRequest(BaseModel):
    signal_id: str


@router.post("/convert-signal", response_model=ConversionResponse)
async def convert_signal(request: ConvertSignalRequest):
    """
    Convert a single signal to a lead
    
    Args:
        signal_id: UUID of the signal to convert
        
    Returns:
        Conversion result with lead ID
    """
    try:
        converter = LeadConverter()
        lead = converter.convert_signal_to_lead(request.signal_id)
        
        if lead:
            return ConversionResponse(
                success=True,
                lead_id=lead["id"],
                message=f"Signal converted to lead successfully"
            )
        else:
            return ConversionResponse(
                success=False,
                message="Failed to convert signal (may already be converted)"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auto-convert", response_model=Dict)
async def auto_convert_signals(
    request: AutoConvertRequest,
    background_tasks: BackgroundTasks
):
    """
    Automatically convert high-value signals to leads
    
    Args:
        min_score: Minimum combined score threshold (default: 70)
        limit: Maximum number of signals to convert (default: 50)
        
    Returns:
        Summary of conversion results
    """
    try:
        converter = LeadConverter()
        
        # Run conversion in background
        def run_conversion():
            leads = converter.auto_convert_high_value_signals(
                min_score=request.min_score,
                limit=request.limit
            )
            return leads
        
        # Execute immediately for now (can be backgrounded later)
        leads = run_conversion()
        
        return {
            "success": True,
            "converted_count": len(leads),
            "min_score": request.min_score,
            "limit": request.limit,
            "message": f"Converted {len(leads)} signals to leads"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=ConversionStatsResponse)
async def get_conversion_stats(days: int = 7):
    """
    Get signal-to-lead conversion statistics
    
    Args:
        days: Number of days to look back (default: 7)
        
    Returns:
        Conversion statistics
    """
    try:
        converter = LeadConverter()
        stats = converter.get_conversion_stats(days=days)
        
        return ConversionStatsResponse(
            total_signals=stats.get("total_signals", 0),
            converted_signals=stats.get("converted_signals", 0),
            conversion_rate=stats.get("conversion_rate", 0.0),
            avg_score_converted=stats.get("avg_score_converted", 0.0),
            avg_score_not_converted=stats.get("avg_score_not_converted", 0.0),
            by_source=stats.get("by_source", {})
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline", response_model=List[ConversionTimelineItem])
async def get_conversion_timeline(days: int = 30):
    """
    Get conversion timeline for analytics
    
    Args:
        days: Number of days to look back (default: 30)
        
    Returns:
        Daily conversion statistics
    """
    try:
        converter = LeadConverter()
        
        # Get timeline data from database
        from config.supabase_config import get_supabase
        supabase = get_supabase()
        
        response = supabase.rpc(
            "get_conversion_timeline",
            {"days_back": days}
        ).execute()
        
        if not response.data:
            return []
        
        timeline = []
        for item in response.data:
            timeline.append(ConversionTimelineItem(
                date=item["date"],
                total_signals=item["total_signals"],
                converted_signals=item["converted_signals"],
                conversion_rate=item["conversion_rate"]
            ))
        
        return timeline
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/eligible-signals")
async def get_eligible_signals(min_score: int = 70, limit: int = 50):
    """
    Get signals eligible for conversion
    
    Args:
        min_score: Minimum score threshold
        limit: Maximum results
        
    Returns:
        List of eligible signals
    """
    try:
        from config.supabase_config import get_supabase
        supabase = get_supabase()
        
        response = supabase.rpc(
            "get_high_value_pending_signals",
            {"min_score": min_score, "max_results": limit}
        ).execute()
        
        return {
            "count": len(response.data) if response.data else 0,
            "signals": response.data or []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk-convert")
async def bulk_convert_signals(signal_ids: List[str]):
    """
    Convert multiple signals to leads in bulk
    
    Args:
        signal_ids: List of signal UUIDs to convert
        
    Returns:
        Bulk conversion results
    """
    try:
        converter = LeadConverter()
        
        results = {
            "success": [],
            "failed": [],
            "already_converted": []
        }
        
        for signal_id in signal_ids:
            lead = converter.convert_signal_to_lead(signal_id)
            
            if lead:
                results["success"].append({
                    "signal_id": signal_id,
                    "lead_id": lead["id"]
                })
            else:
                results["failed"].append(signal_id)
        
        return {
            "success_count": len(results["success"]),
            "failed_count": len(results["failed"]),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
