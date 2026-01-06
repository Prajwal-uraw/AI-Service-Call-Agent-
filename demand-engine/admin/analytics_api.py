"""
Analytics API
Advanced analytics for pain signals and lead conversion
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/admin/analytics", tags=["Analytics"])

# Response Models
class SourcePerformance(BaseModel):
    source: str
    total_signals: int
    avg_score: float
    converted_count: int
    conversion_rate: float
    top_tier_count: int

class ScoreCorrelation(BaseModel):
    score_range: str
    count: int
    avg_keyword_score: float
    avg_ai_score: float
    conversion_rate: float

class IntentAnalysis(BaseModel):
    intent: str
    count: int
    avg_score: float
    conversion_rate: float
    top_sentiment: str

class TrendData(BaseModel):
    date: str
    total_signals: int
    avg_score: float
    hot_leads: int
    converted: int


@router.get("/source-performance")
async def get_source_performance(days: int = 30):
    """
    Get performance metrics by signal source from both signals and reddit_signals tables
    """
    try:
        supabase = get_supabase()
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        source_stats = {}
        
        # Try to get from signals table (scraped business data)
        try:
            signals_response = supabase.table("signals").select("*").gte(
                "created_at", cutoff_date
            ).execute()
            
            for signal in signals_response.data or []:
                source = signal.get("source", "scraped")
                if source not in source_stats:
                    source_stats[source] = {"total": 0, "scores": [], "converted": 0, "hot": 0}
                
                source_stats[source]["total"] += 1
                pain_score = signal.get("pain_score", 0)
                source_stats[source]["scores"].append(pain_score)
                if signal.get("status") == "contacted":
                    source_stats[source]["converted"] += 1
                if pain_score >= 70:
                    source_stats[source]["hot"] += 1
        except Exception as e:
            print(f"Error fetching signals: {e}")
        
        # Try to get from reddit_signals table
        try:
            reddit_response = supabase.table("reddit_signals").select("*").gte(
                "created_at", cutoff_date
            ).execute()
            
            for signal in reddit_response.data or []:
                source = "reddit"
                if source not in source_stats:
                    source_stats[source] = {"total": 0, "scores": [], "converted": 0, "hot": 0}
                
                source_stats[source]["total"] += 1
                score = signal.get("total_score", 0)
                source_stats[source]["scores"].append(score)
                if signal.get("alerted"):
                    source_stats[source]["converted"] += 1
                if signal.get("ai_tier") == "hot" or score >= 70:
                    source_stats[source]["hot"] += 1
        except Exception as e:
            print(f"Error fetching reddit signals: {e}")
        
        # Build result
        result = []
        for source, stats in source_stats.items():
            avg_score = sum(stats["scores"]) / len(stats["scores"]) if stats["scores"] else 0
            conversion_rate = (stats["converted"] / stats["total"] * 100) if stats["total"] > 0 else 0
            
            result.append(SourcePerformance(
                source=source,
                total_signals=stats["total"],
                avg_score=round(avg_score, 2),
                converted_count=stats["converted"],
                conversion_rate=round(conversion_rate, 2),
                top_tier_count=stats["hot"]
            ))
        
        return sorted(result, key=lambda x: x.avg_score, reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/score-correlation")
async def get_score_correlation(days: int = 30):
    """
    Analyze correlation between keyword and AI scores
    
    Args:
        days: Number of days to analyze
        
    Returns:
        Score correlation data by ranges
    """
    try:
        supabase = get_supabase()
        
        # Get signals with pain scores (using pain_score as the combined score)
        response = supabase.table("signals").select(
            "id, pain_score, status, created_at, source_type"
        ).gte(
            "created_at",
            (datetime.now() - timedelta(days=days)).isoformat()
        ).not_.is_("pain_score", "null").execute()
        
        if not response.data:
            return []
        
        # Group by score ranges
        ranges = {
            "0-49": {"scores": [], "converted": 0, "total": 0},
            "50-69": {"scores": [], "converted": 0, "total": 0},
            "70-84": {"scores": [], "converted": 0, "total": 0},
            "85-100": {"scores": [], "converted": 0, "total": 0}
        }
        
        for signal in response.data:
            score = signal.get("pain_score", 0)
            
            if score < 50:
                range_key = "0-49"
            elif score < 70:
                range_key = "50-69"
            elif score < 85:
                range_key = "70-84"
            else:
                range_key = "85-100"
            
            ranges[range_key]["total"] += 1
            ranges[range_key]["scores"].append(score)
            
            # Check if signal was converted (status is 'contacted')
            if signal.get("status") == "contacted":
                ranges[range_key]["converted"] += 1
        
        result = []
        for range_key, data in ranges.items():
            if data["total"] > 0:
                result.append(ScoreCorrelation(
                    score_range=range_key,
                    count=data["total"],
                    avg_keyword_score=0,  # Not available in signals table
                    avg_ai_score=round(sum(data["scores"]) / len(data["scores"]), 2) if data["scores"] else 0,
                    conversion_rate=round((data["converted"] / data["total"] * 100), 2) if data["total"] > 0 else 0
                ))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intent-analysis")
async def get_intent_analysis(days: int = 30):
    """
    Analyze signals by intent type
    
    Args:
        days: Number of days to analyze
        
    Returns:
        Intent analysis with conversion rates
    """
    try:
        supabase = get_supabase()
        
        # Get signals with pain scores and status
        response = supabase.table("signals").select(
            "id, pain_score, status, created_at, source_type, signal_type"
        ).gte(
            "created_at",
            (datetime.now() - timedelta(days=days)).isoformat()
        ).not_.is_("signal_type", "null").execute()
        
        if not response.data:
            return []
        
        # Aggregate by signal_type (as intent)
        intent_stats = {}
        for signal in response.data:
            intent = signal.get("signal_type", "unknown")
            if intent not in intent_stats:
                intent_stats[intent] = {
                    "count": 0,
                    "scores": [],
                    "converted": 0,
                    "sentiments": {"neutral": 1}  # Default sentiment since we don't have it in signals
                }
            
            intent_stats[intent]["count"] += 1
            score = signal.get("pain_score", 0)
            intent_stats[intent]["scores"].append(score)
            
            # Check if signal was converted (status is 'contacted')
            if signal.get("status") == "contacted":
                intent_stats[intent]["converted"] += 1
        
        result = []
        for intent, stats in intent_stats.items():
            avg_score = sum(stats["scores"]) / len(stats["scores"]) if stats["scores"] else 0
            conversion_rate = (stats["converted"] / stats["count"] * 100) if stats["count"] > 0 else 0
            top_sentiment = max(stats["sentiments"].items(), key=lambda x: x[1])[0] if stats["sentiments"] else "unknown"
            
            result.append(IntentAnalysis(
                intent=intent,
                count=stats["count"],
                avg_score=round(avg_score, 2),
                conversion_rate=round(conversion_rate, 2),
                top_sentiment=top_sentiment
            ))
        
        return sorted(result, key=lambda x: x.count, reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends")
async def get_trends(days: int = 30):
    """
    Get daily trends for signals and conversions from both signals and reddit_signals tables
    """
    try:
        supabase = get_supabase()
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        daily_stats = {}
        
        # Get from signals table (scraped business data)
        try:
            signals_response = supabase.table("signals").select(
                "created_at, pain_score, status"
            ).gte("created_at", cutoff_date).execute()
            
            for signal in signals_response.data or []:
                date = signal["created_at"][:10]
                if date not in daily_stats:
                    daily_stats[date] = {"total": 0, "scores": [], "hot": 0, "converted": 0}
                
                daily_stats[date]["total"] += 1
                pain_score = signal.get("pain_score", 0)
                daily_stats[date]["scores"].append(pain_score)
                if pain_score >= 70:
                    daily_stats[date]["hot"] += 1
                if signal.get("status") == "contacted":
                    daily_stats[date]["converted"] += 1
        except Exception as e:
            print(f"Error fetching signals trends: {e}")
        
        # Get from reddit_signals table
        try:
            reddit_response = supabase.table("reddit_signals").select(
                "created_at, total_score, ai_tier, alerted"
            ).gte("created_at", cutoff_date).execute()
            
            for signal in reddit_response.data or []:
                date = signal["created_at"][:10]
                if date not in daily_stats:
                    daily_stats[date] = {"total": 0, "scores": [], "hot": 0, "converted": 0}
                
                daily_stats[date]["total"] += 1
                score = signal.get("total_score", 0)
                daily_stats[date]["scores"].append(score)
                if signal.get("ai_tier") == "hot" or score >= 70:
                    daily_stats[date]["hot"] += 1
                if signal.get("alerted"):
                    daily_stats[date]["converted"] += 1
        except Exception as e:
            print(f"Error fetching reddit trends: {e}")
        
        result = []
        for date, stats in sorted(daily_stats.items(), reverse=True):
            avg_score = sum(stats["scores"]) / len(stats["scores"]) if stats["scores"] else 0
            
            result.append(TrendData(
                date=date,
                total_signals=stats["total"],
                avg_score=round(avg_score, 2),
                hot_leads=stats["hot"],
                converted=stats["converted"]
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_analytics_summary(days: int = 7):
    """
    Get comprehensive analytics summary from both signals and reddit_signals tables
    """
    try:
        supabase = get_supabase()
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        all_scores = []
        sources = {}
        intents = {}
        converted = 0
        hot_leads = 0
        
        # Get from signals table (scraped business data)
        try:
            signals_response = supabase.table("signals").select("*").gte(
                "created_at", cutoff_date
            ).execute()
            
            for signal in signals_response.data or []:
                pain_score = signal.get("pain_score", 0)
                all_scores.append(pain_score)
                
                source = signal.get("source", "scraped")
                sources[source] = sources.get(source, 0) + 1
                
                intent = signal.get("signal_type", "business_signal")
                intents[intent] = intents.get(intent, 0) + 1
                
                if signal.get("status") == "contacted":
                    converted += 1
                if pain_score >= 70:
                    hot_leads += 1
        except Exception as e:
            print(f"Error fetching signals summary: {e}")
        
        # Get from reddit_signals table
        try:
            reddit_response = supabase.table("reddit_signals").select("*").gte(
                "created_at", cutoff_date
            ).execute()
            
            for signal in reddit_response.data or []:
                score = signal.get("total_score", 0)
                all_scores.append(score)
                
                sources["reddit"] = sources.get("reddit", 0) + 1
                
                intent = signal.get("intent", "unknown")
                if intent:
                    intents[intent] = intents.get(intent, 0) + 1
                
                if signal.get("alerted"):
                    converted += 1
                if signal.get("ai_tier") == "hot" or score >= 70:
                    hot_leads += 1
        except Exception as e:
            print(f"Error fetching reddit summary: {e}")
        
        total = len(all_scores)
        avg_score = sum(all_scores) / total if total > 0 else 0
        conversion_rate = (converted / total * 100) if total > 0 else 0
        
        top_source = max(sources.items(), key=lambda x: x[1])[0] if sources else None
        top_intent = max(intents.items(), key=lambda x: x[1])[0] if intents else None
        
        return {
            "total_signals": total,
            "avg_score": round(avg_score, 2),
            "conversion_rate": round(conversion_rate, 2),
            "converted_count": converted,
            "hot_leads": hot_leads,
            "top_source": top_source,
            "top_intent": top_intent,
            "sources_breakdown": sources,
            "intents_breakdown": intents
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
