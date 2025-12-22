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
    Get performance metrics by signal source
    
    Args:
        days: Number of days to analyze
        
    Returns:
        Performance metrics for each source
    """
    try:
        supabase = get_supabase()
        
        # Custom query for source performance
        query = f"""
        SELECT 
            source,
            COUNT(*) as total_signals,
            ROUND(AVG(combined_score), 2) as avg_score,
            COUNT(*) FILTER (WHERE converted_to_lead = TRUE) as converted_count,
            CASE 
                WHEN COUNT(*) > 0 
                THEN ROUND((COUNT(*) FILTER (WHERE converted_to_lead = TRUE)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
                ELSE 0 
            END as conversion_rate,
            COUNT(*) FILTER (WHERE tier = 'hot') as top_tier_count
        FROM unified_signals_with_ai
        WHERE created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY source
        ORDER BY avg_score DESC
        """
        
        response = supabase.rpc("execute_sql", {"query": query}).execute()
        
        if not response.data:
            # Fallback to manual aggregation
            signals_response = supabase.table("unified_signals_with_ai").select("*").gte(
                "created_at", 
                (datetime.now() - timedelta(days=days)).isoformat()
            ).execute()
            
            if not signals_response.data:
                return []
            
            # Aggregate by source
            source_stats = {}
            for signal in signals_response.data:
                source = signal["source"]
                if source not in source_stats:
                    source_stats[source] = {
                        "total": 0,
                        "scores": [],
                        "converted": 0,
                        "hot": 0
                    }
                
                source_stats[source]["total"] += 1
                source_stats[source]["scores"].append(signal["combined_score"])
                if signal.get("converted_to_lead"):
                    source_stats[source]["converted"] += 1
                if signal.get("tier") == "hot":
                    source_stats[source]["hot"] += 1
            
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
            
            return result
        
        return [SourcePerformance(**item) for item in response.data]
        
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
        
        # Get signals with both keyword and AI scores
        response = supabase.table("unified_signals_with_ai").select(
            "keyword_total, ai_total, combined_score, converted_to_lead"
        ).gte(
            "created_at",
            (datetime.now() - timedelta(days=days)).isoformat()
        ).not_.is_("ai_total", "null").execute()
        
        if not response.data:
            return []
        
        # Group by score ranges
        ranges = {
            "0-49": {"scores": [], "keyword": [], "ai": [], "converted": 0, "total": 0},
            "50-69": {"scores": [], "keyword": [], "ai": [], "converted": 0, "total": 0},
            "70-84": {"scores": [], "keyword": [], "ai": [], "converted": 0, "total": 0},
            "85-100": {"scores": [], "keyword": [], "ai": [], "converted": 0, "total": 0}
        }
        
        for signal in response.data:
            score = signal["combined_score"]
            
            if score < 50:
                range_key = "0-49"
            elif score < 70:
                range_key = "50-69"
            elif score < 85:
                range_key = "70-84"
            else:
                range_key = "85-100"
            
            ranges[range_key]["total"] += 1
            ranges[range_key]["keyword"].append(signal["keyword_total"])
            ranges[range_key]["ai"].append(signal["ai_total"])
            if signal.get("converted_to_lead"):
                ranges[range_key]["converted"] += 1
        
        result = []
        for range_key, data in ranges.items():
            if data["total"] > 0:
                result.append(ScoreCorrelation(
                    score_range=range_key,
                    count=data["total"],
                    avg_keyword_score=round(sum(data["keyword"]) / len(data["keyword"]), 2) if data["keyword"] else 0,
                    avg_ai_score=round(sum(data["ai"]) / len(data["ai"]), 2) if data["ai"] else 0,
                    conversion_rate=round((data["converted"] / data["total"] * 100), 2)
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
        
        response = supabase.table("unified_signals_with_ai").select(
            "intent, combined_score, sentiment, converted_to_lead"
        ).gte(
            "created_at",
            (datetime.now() - timedelta(days=days)).isoformat()
        ).not_.is_("intent", "null").execute()
        
        if not response.data:
            return []
        
        # Aggregate by intent
        intent_stats = {}
        for signal in response.data:
            intent = signal["intent"]
            if intent not in intent_stats:
                intent_stats[intent] = {
                    "count": 0,
                    "scores": [],
                    "converted": 0,
                    "sentiments": {}
                }
            
            intent_stats[intent]["count"] += 1
            intent_stats[intent]["scores"].append(signal["combined_score"])
            if signal.get("converted_to_lead"):
                intent_stats[intent]["converted"] += 1
            
            sentiment = signal.get("sentiment", "unknown")
            intent_stats[intent]["sentiments"][sentiment] = intent_stats[intent]["sentiments"].get(sentiment, 0) + 1
        
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
    Get daily trends for signals and conversions
    
    Args:
        days: Number of days to analyze
        
    Returns:
        Daily trend data
    """
    try:
        supabase = get_supabase()
        
        response = supabase.table("unified_signals_with_ai").select(
            "created_at, combined_score, tier, converted_to_lead"
        ).gte(
            "created_at",
            (datetime.now() - timedelta(days=days)).isoformat()
        ).execute()
        
        if not response.data:
            return []
        
        # Aggregate by date
        daily_stats = {}
        for signal in response.data:
            date = signal["created_at"][:10]  # Extract date part
            
            if date not in daily_stats:
                daily_stats[date] = {
                    "total": 0,
                    "scores": [],
                    "hot": 0,
                    "converted": 0
                }
            
            daily_stats[date]["total"] += 1
            daily_stats[date]["scores"].append(signal["combined_score"])
            if signal.get("tier") == "hot":
                daily_stats[date]["hot"] += 1
            if signal.get("converted_to_lead"):
                daily_stats[date]["converted"] += 1
        
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
    Get comprehensive analytics summary
    
    Args:
        days: Number of days to analyze
        
    Returns:
        Summary of all key metrics
    """
    try:
        supabase = get_supabase()
        
        # Get all signals in date range
        response = supabase.table("unified_signals_with_ai").select("*").gte(
            "created_at",
            (datetime.now() - timedelta(days=days)).isoformat()
        ).execute()
        
        if not response.data:
            return {
                "total_signals": 0,
                "avg_score": 0,
                "conversion_rate": 0,
                "top_source": None,
                "top_intent": None
            }
        
        signals = response.data
        
        # Calculate summary stats
        total = len(signals)
        avg_score = sum(s["combined_score"] for s in signals) / total if total > 0 else 0
        converted = sum(1 for s in signals if s.get("converted_to_lead"))
        conversion_rate = (converted / total * 100) if total > 0 else 0
        
        # Top source
        sources = {}
        for s in signals:
            sources[s["source"]] = sources.get(s["source"], 0) + 1
        top_source = max(sources.items(), key=lambda x: x[1])[0] if sources else None
        
        # Top intent
        intents = {}
        for s in signals:
            if s.get("intent"):
                intents[s["intent"]] = intents.get(s["intent"], 0) + 1
        top_intent = max(intents.items(), key=lambda x: x[1])[0] if intents else None
        
        return {
            "total_signals": total,
            "avg_score": round(avg_score, 2),
            "conversion_rate": round(conversion_rate, 2),
            "converted_count": converted,
            "hot_leads": sum(1 for s in signals if s.get("tier") == "hot"),
            "top_source": top_source,
            "top_intent": top_intent,
            "sources_breakdown": sources,
            "intents_breakdown": intents
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
