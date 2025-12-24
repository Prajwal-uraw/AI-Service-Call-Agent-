"""
Admin API for Pain Signal Management
Endpoints for viewing, filtering, and managing pain signals from multiple sources
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/admin/signals", tags=["Pain Signals"])


# Pydantic Models
class SignalSummary(BaseModel):
    """Summary of a pain signal"""
    id: str
    source: str
    signal_id: str
    title: Optional[str]
    content_preview: str
    keyword_score: int
    ai_score: Optional[float]
    combined_score: Optional[float]
    tier: Optional[str]
    sentiment: Optional[str]
    intent: Optional[str]
    recommended_action: Optional[str]
    location: Optional[str]
    created_at: datetime
    alerted: bool
    url: Optional[str]


class SignalDetail(BaseModel):
    """Detailed view of a pain signal"""
    id: str
    source: str
    signal_id: str
    title: Optional[str]
    content: str
    url: Optional[str]
    
    # Keyword scores
    keyword_urgency: int
    keyword_budget: int
    keyword_authority: int
    keyword_pain: int
    keyword_total: int
    
    # AI scores
    ai_urgency: Optional[int]
    ai_budget: Optional[int]
    ai_authority: Optional[int]
    ai_pain: Optional[int]
    ai_total: Optional[float]
    ai_tier: Optional[str]
    
    # AI analysis
    sentiment: Optional[str]
    intent: Optional[str]
    lead_quality: Optional[str]
    key_indicators: Optional[List[str]]
    recommended_action: Optional[str]
    ai_reasoning: Optional[str]
    
    # Metadata
    location: Optional[str]
    company_mentioned: Optional[str]
    problem_type: Optional[str]
    processed: bool
    alerted: bool
    created_at: datetime


class SignalStats(BaseModel):
    """Statistics for pain signals"""
    total_signals: int
    by_source: dict
    by_tier: dict
    by_intent: dict
    by_sentiment: dict
    avg_keyword_score: float
    avg_ai_score: float
    high_value_count: int
    alerted_count: int
    pending_count: int


@router.get("/stats", response_model=SignalStats)
async def get_signal_stats(
    days: int = Query(7, description="Number of days to analyze")
):
    """Get pain signal statistics from both reddit_signals and signals tables"""
    try:
        supabase = get_supabase()
        cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        # Try to get from unified view first
        try:
            result = supabase.rpc(
                'get_signal_stats',
                {'days_back': days}
            ).execute()
            
            if result.data:
                return result.data[0]
        except:
            pass  # RPC might not exist, fall back to manual
        
        # Get signals from both tables
        reddit_signals = []
        scraped_signals = []
        
        try:
            reddit_result = supabase.table("reddit_signals")\
                .select("*")\
                .gte("created_at", cutoff_date)\
                .execute()
            reddit_signals = reddit_result.data or []
        except:
            pass
        
        try:
            scraped_result = supabase.table("signals")\
                .select("*")\
                .gte("created_at", cutoff_date)\
                .execute()
            scraped_signals = scraped_result.data or []
        except:
            pass
        
        # Combine and calculate stats
        total_reddit = len(reddit_signals)
        total_scraped = len(scraped_signals)
        
        by_source = {}
        if total_reddit > 0:
            by_source["reddit"] = total_reddit
        
        # Count scraped signals by source
        for s in scraped_signals:
            src = s.get('source', 'unknown')
            by_source[src] = by_source.get(src, 0) + 1
        
        # Calculate averages
        all_keyword_scores = [s.get('total_score', 0) for s in reddit_signals] + [s.get('pain_score', 0) for s in scraped_signals]
        all_ai_scores = [s.get('ai_total_score', 0) for s in reddit_signals if s.get('ai_total_score')] + [s.get('pain_score', 0) for s in scraped_signals]
        
        avg_keyword = sum(all_keyword_scores) / len(all_keyword_scores) if all_keyword_scores else 0
        avg_ai = sum(all_ai_scores) / len(all_ai_scores) if all_ai_scores else 0
        
        # Count high value (score >= 50)
        high_value = len([s for s in reddit_signals if s.get('total_score', 0) >= 50]) + \
                     len([s for s in scraped_signals if s.get('pain_score', 0) >= 50])
        
        # Count alerted
        alerted = len([s for s in reddit_signals if s.get('alerted')]) + \
                  len([s for s in scraped_signals if s.get('status') == 'contacted'])
        
        # Aggregate by tier
        by_tier = {}
        for signal in reddit_signals:
            tier = signal.get('ai_tier', 'unknown')
            by_tier[tier] = by_tier.get(tier, 0) + 1
        for signal in scraped_signals:
            score = signal.get('pain_score', 0)
            tier = 'hot' if score >= 70 else 'warm' if score >= 50 else 'cold'
            by_tier[tier] = by_tier.get(tier, 0) + 1
        
        # Aggregate by intent
        by_intent = {}
        for signal in reddit_signals:
            intent = signal.get('intent', 'unknown')
            if intent:
                by_intent[intent] = by_intent.get(intent, 0) + 1
        for signal in scraped_signals:
            intent = signal.get('signal_type', 'business_signal')
            by_intent[intent] = by_intent.get(intent, 0) + 1
        
        # Aggregate by sentiment
        by_sentiment = {}
        for signal in reddit_signals:
            sentiment = signal.get('sentiment', 'unknown')
            if sentiment:
                by_sentiment[sentiment] = by_sentiment.get(sentiment, 0) + 1
        
        stats = {
            "total_signals": total_reddit + total_scraped,
            "by_source": by_source,
            "by_tier": by_tier,
            "by_intent": by_intent,
            "by_sentiment": by_sentiment,
            "avg_keyword_score": avg_keyword,
            "avg_ai_score": avg_ai,
            "high_value_count": high_value,
            "alerted_count": alerted,
            "pending_count": (total_reddit + total_scraped) - alerted
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=List[SignalSummary])
async def list_signals(
    source: Optional[str] = Query(None, description="Filter by source"),
    tier: Optional[str] = Query(None, description="Filter by AI tier"),
    intent: Optional[str] = Query(None, description="Filter by intent"),
    min_score: int = Query(0, description="Minimum score"),
    alerted: Optional[bool] = Query(None, description="Filter by alerted status"),
    limit: int = Query(50, description="Number of results"),
    offset: int = Query(0, description="Offset for pagination")
):
    """List pain signals with filters from both reddit_signals and signals tables"""
    try:
        supabase = get_supabase()
        signals = []
        
        # Get reddit signals if not filtering by non-reddit source
        if source is None or source == 'reddit':
            try:
                query = supabase.table("reddit_signals").select("*")
                
                if min_score > 0:
                    query = query.gte("total_score", min_score)
                
                if tier:
                    query = query.eq("ai_tier", tier)
                
                if intent:
                    query = query.eq("intent", intent)
                
                if alerted is not None:
                    query = query.eq("alerted", alerted)
                
                result = query.order("created_at", desc=True)\
                    .range(offset, offset + limit - 1)\
                    .execute()
                
                for signal in result.data:
                    signals.append(SignalSummary(
                        id=signal['id'],
                        source='reddit',
                        signal_id=signal['post_id'],
                        title=signal.get('title'),
                        content_preview=signal.get('body', '')[:200] + '...' if signal.get('body') else '',
                        keyword_score=signal.get('total_score', 0),
                        ai_score=signal.get('ai_total_score'),
                        combined_score=(signal.get('total_score', 0) + signal.get('ai_total_score', 0)) / 2 if signal.get('ai_total_score') else signal.get('total_score', 0),
                        tier=signal.get('ai_tier'),
                        sentiment=signal.get('sentiment'),
                        intent=signal.get('intent'),
                        recommended_action=signal.get('recommended_action'),
                        location=signal.get('location'),
                        created_at=signal['created_at'],
                        alerted=signal.get('alerted', False),
                        url=signal.get('url')
                    ))
            except Exception as e:
                print(f"Error fetching reddit signals: {e}")
        
        # Get scraped business signals
        if source is None or source != 'reddit':
            try:
                query = supabase.table("signals").select("*")
                
                if source and source != 'reddit':
                    query = query.eq("source", source)
                
                if min_score > 0:
                    query = query.gte("pain_score", min_score)
                
                if alerted is not None:
                    if alerted:
                        query = query.eq("status", "contacted")
                    else:
                        query = query.neq("status", "contacted")
                
                result = query.order("created_at", desc=True)\
                    .range(offset, offset + limit - 1)\
                    .execute()
                
                for signal in result.data:
                    pain_score = signal.get('pain_score', 0)
                    tier_val = 'hot' if pain_score >= 70 else 'warm' if pain_score >= 50 else 'cold'
                    
                    # Skip if tier filter doesn't match
                    if tier and tier != tier_val:
                        continue
                    
                    signals.append(SignalSummary(
                        id=str(signal['id']),
                        source=signal.get('source', 'scraped'),
                        signal_id=str(signal['id']),
                        title=signal.get('business_name'),
                        content_preview=f"{signal.get('business_name', '')} - {signal.get('city', '')}, {signal.get('state', '')}. {signal.get('signal_type', '')}",
                        keyword_score=pain_score,
                        ai_score=float(pain_score),
                        combined_score=float(pain_score),
                        tier=tier_val,
                        sentiment=None,
                        intent=signal.get('signal_type', 'business_signal'),
                        recommended_action='Contact for services',
                        location=f"{signal.get('city', '')}, {signal.get('state', '')}",
                        created_at=signal['created_at'],
                        alerted=signal.get('status') == 'contacted',
                        url=signal.get('source_url')
                    ))
            except Exception as e:
                print(f"Error fetching scraped signals: {e}")
        
        # Sort combined results by created_at
        signals.sort(key=lambda x: x.created_at, reverse=True)
        
        return signals[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{signal_id}", response_model=SignalDetail)
async def get_signal_detail(signal_id: str):
    """Get detailed view of a specific signal"""
    try:
        supabase = get_supabase()
        
        # Try to find in reddit_signals
        result = supabase.table("reddit_signals")\
            .select("*")\
            .eq("id", signal_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Signal not found")
        
        signal = result.data[0]
        
        # Parse key_indicators if it's a JSON string
        key_indicators = signal.get('key_indicators')
        if isinstance(key_indicators, str):
            import json
            try:
                key_indicators = json.loads(key_indicators)
            except:
                key_indicators = []
        
        return SignalDetail(
            id=signal['id'],
            source='reddit',
            signal_id=signal['post_id'],
            title=signal.get('title'),
            content=signal.get('body', ''),
            url=signal.get('url'),
            
            # Keyword scores
            keyword_urgency=signal.get('urgency_score', 0),
            keyword_budget=signal.get('budget_score', 0),
            keyword_authority=signal.get('authority_score', 0),
            keyword_pain=signal.get('pain_score', 0),
            keyword_total=signal.get('total_score', 0),
            
            # AI scores
            ai_urgency=signal.get('ai_urgency_score'),
            ai_budget=signal.get('ai_budget_score'),
            ai_authority=signal.get('ai_authority_score'),
            ai_pain=signal.get('ai_pain_score'),
            ai_total=signal.get('ai_total_score'),
            ai_tier=signal.get('ai_tier'),
            
            # AI analysis
            sentiment=signal.get('sentiment'),
            intent=signal.get('intent'),
            lead_quality=signal.get('lead_quality'),
            key_indicators=key_indicators,
            recommended_action=signal.get('recommended_action'),
            ai_reasoning=signal.get('ai_reasoning'),
            
            # Metadata
            location=signal.get('location'),
            company_mentioned=signal.get('company_mentioned'),
            problem_type=signal.get('problem_type'),
            processed=signal.get('processed', False),
            alerted=signal.get('alerted', False),
            created_at=signal['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{signal_id}/mark-alerted")
async def mark_signal_alerted(signal_id: str):
    """Mark a signal as alerted"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("reddit_signals")\
            .update({"alerted": True})\
            .eq("id", signal_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Signal not found")
        
        return {"success": True, "message": "Signal marked as alerted"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/high-value/pending", response_model=List[SignalSummary])
async def get_pending_high_value_signals(
    min_score: int = Query(70, description="Minimum score threshold"),
    limit: int = Query(20, description="Number of results")
):
    """Get pending high-value signals that haven't been alerted"""
    try:
        supabase = get_supabase()
        
        result = supabase.table("reddit_signals")\
            .select("*")\
            .eq("alerted", False)\
            .gte("total_score", min_score)\
            .order("total_score", desc=True)\
            .limit(limit)\
            .execute()
        
        signals = []
        for signal in result.data:
            signals.append(SignalSummary(
                id=signal['id'],
                source='reddit',
                signal_id=signal['post_id'],
                title=signal.get('title'),
                content_preview=signal.get('body', '')[:200] + '...' if signal.get('body') else '',
                keyword_score=signal.get('total_score', 0),
                ai_score=signal.get('ai_total_score'),
                combined_score=(signal.get('total_score', 0) + signal.get('ai_total_score', 0)) / 2 if signal.get('ai_total_score') else signal.get('total_score', 0),
                tier=signal.get('ai_tier'),
                sentiment=signal.get('sentiment'),
                intent=signal.get('intent'),
                recommended_action=signal.get('recommended_action'),
                location=signal.get('location'),
                created_at=signal['created_at'],
                alerted=False,
                url=signal.get('url')
            ))
        
        return signals
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
