from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_, extract, distinct
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.services.db import get_db
from app.models.db_models import CallLog, Appointment, Location, EmergencyLog
from app.utils.logging import get_logger

router = APIRouter(prefix="/api/call-intelligence", tags=["Call Intelligence"])
logger = get_logger("call_intelligence")

# Response Models (keep your existing ones)
# ...

@router.get("/summary")
async def get_call_intelligence_summary(db: Session = Depends(get_db)):
    """
    Get call intelligence summary from database
    """
    try:
        # Get call statistics
        total_calls = db.query(func.count(CallLog.id)).scalar() or 0
        avg_duration = db.query(func.avg(CallLog.duration_seconds)).scalar() or 0
        total_duration = db.query(func.sum(CallLog.duration_seconds)).scalar() or 0
        
        # Get sentiment distribution
        sentiment_buckets = db.query(
            case(
                (CallLog.sentiment_score > 0.2, 'positive'),
                (CallLog.sentiment_score < -0.2, 'negative'),
                else_='neutral'
            ).label('sentiment'),
            func.count(CallLog.id)
        ).filter(
            CallLog.sentiment_score.isnot(None)
        ).group_by('sentiment').all()
        
        sentiment_map = {s: c for s, c in sentiment_buckets}
        
        # Calculate call volume trend (last 7 days vs previous 7 days)
        end_date = datetime.utcnow().date()
        start_date_prev = end_date - timedelta(days=14)
        start_date_recent = end_date - timedelta(days=7)
        
        recent_calls = db.query(func.count(CallLog.id)).filter(
            CallLog.created_at >= start_date_recent,
            CallLog.created_at < end_date + timedelta(days=1)
        ).scalar() or 0
        
        prev_calls = db.query(func.count(CallLog.id)).filter(
            CallLog.created_at >= start_date_prev,
            CallLog.created_at < start_date_recent
        ).scalar() or 1  # Avoid division by zero
        
        call_volume_trend = "stable"
        if recent_calls > prev_calls * 1.2:
            call_volume_trend = "up"
        elif recent_calls < prev_calls * 0.8:
            call_volume_trend = "down"
        
        # Get conversion rate (calls that resulted in appointments)
        call_with_appointments = db.query(func.count(distinct(Appointment.call_sid))).filter(
            Appointment.call_sid.isnot(None),
            Appointment.created_at >= (datetime.utcnow() - timedelta(days=30))
        ).scalar() or 0
        
        total_recent_calls = db.query(func.count(CallLog.id)).filter(
            CallLog.created_at >= (datetime.utcnow() - timedelta(days=30))
        ).scalar() or 1  # Avoid division by zero
        
        conversion_rate = round((call_with_appointments / total_recent_calls) * 100)
        
        # Get top call intents
        top_intents = db.query(
            CallLog.intent_detected.label('intent'),
            func.count(CallLog.id).label('count')
        ).filter(
            CallLog.intent_detected.isnot(None)
        ).group_by('intent').order_by(
            func.count(CallLog.id).desc()
        ).limit(3).all()
        
        # Get call quality metrics (using was_successful as a proxy for quality)
        success_rate = db.query(
            func.avg(case((CallLog.was_successful == True, 1), else_=0)) * 100
        ).scalar() or 0
        
        # Get peak hours (last 30 days)
        peak_hours = db.query(
            extract('hour', CallLog.created_at).label('hour'),
            func.count(CallLog.id).label('calls')
        ).filter(
            CallLog.created_at >= (datetime.utcnow() - timedelta(days=30))
        ).group_by('hour').order_by(
            func.count(CallLog.id).desc()
        ).limit(3).all()
        
        return {
            "total_calls": total_calls,
            "average_duration": int(avg_duration),
            "total_duration": int(total_duration),
            "positive_sentiment": int(sentiment_map.get('positive', 0)),
            "negative_sentiment": int(sentiment_map.get('negative', 0)),
            "neutral_sentiment": int(sentiment_map.get('neutral', 0)),
            "call_volume_trend": call_volume_trend,
            "conversion_rate": min(conversion_rate, 100),  # Cap at 100%
            "top_intents": [{"intent": i[0], "count": i[1]} for i in top_intents if i[0]],
            "call_quality_avg": round(float(success_rate) / 20, 1),  # Convert 0-100% to 0-5 scale
            "escalation_rate": 0,  # Not directly available in the model
            "peak_hours": [{"hour": int(h[0]), "calls": h[1]} for h in peak_hours]
        }
        
    except Exception as e:
        logger.error(f"Error in get_call_intelligence_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sentiment-trends")
async def get_sentiment_trends(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Get sentiment trends over time
    """
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days-1)
        
        # Query sentiment data grouped by date
        sentiment_data = db.query(
            func.date(CallLog.created_at).label('date'),
            case(
                (CallLog.sentiment_score > 0.2, 'positive'),
                (CallLog.sentiment_score < -0.2, 'negative'),
                else_='neutral'
            ).label('sentiment'),
            func.count(CallLog.id).label('count')
        ).filter(
            CallLog.created_at >= start_date,
            CallLog.created_at <= end_date + timedelta(days=1),
            CallLog.sentiment_score.isnot(None)
        ).group_by(
            func.date(CallLog.created_at),
            'sentiment'
        ).order_by('date').all()
        
        # Initialize date range
        date_range = [
            (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
            for i in range(days)
        ]
        
        # Initialize result with all dates
        result = {
            date: {"date": date, "positive": 0, "negative": 0, "neutral": 0}
            for date in date_range
        }
        
        # Fill in the counts
        for date, sentiment, count in sentiment_data:
            date_str = date.strftime('%Y-%m-%d')
            if date_str in result and sentiment in ['positive', 'negative', 'neutral']:
                result[date_str][sentiment] = count
        
        return {"trends": list(result.values())}
        
    except Exception as e:
        logger.error(f"Error in get_sentiment_trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quality-metrics")
async def get_quality_metrics(db: Session = Depends(get_db)):
    """
    Get call quality metrics
    """
    try:
        # Calculate success rate (proxy for quality)
        success_rate = db.query(
            func.avg(case((CallLog.was_successful == True, 1), else_=0)) * 100
        ).scalar() or 0
        
        # Calculate average call duration
        avg_duration = db.query(
            func.avg(CallLog.duration_seconds)
        ).scalar() or 0
        
        # Get agent metrics (group by call_sid to get unique calls per agent)
        agent_metrics = db.query(
            CallLog.caller_phone.label('agent_id'),
            func.avg(case((CallLog.was_successful == True, 1), else_=0) * 100).label('success_rate'),
            func.count(distinct(CallLog.call_sid)).label('calls_handled')
        ).filter(
            CallLog.caller_phone.isnot(None)
        ).group_by('agent_id').all()
        
        return {
            "avg_call_quality": round(float(success_rate) / 20, 1),  # Convert to 0-5 scale
            "escalation_rate": 0,  # Not directly available
            "first_call_resolution": 0,  # Not directly available
            "customer_satisfaction": round(float(success_rate), 1),  # Using success rate as proxy
            "metrics_by_agent": [
                {
                    "agent_id": agent[0],
                    "name": f"Agent {agent[0][-4:]}",  # Use last 4 digits as identifier
                    "avg_quality": round(float(agent[1]) / 20, 1),  # Convert to 0-5 scale
                    "calls_handled": agent[2]
                }
                for agent in agent_metrics
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in get_quality_metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/live-calls")
async def get_live_calls(db: Session = Depends(get_db)):
    """
    Get currently active calls
    """
    try:
        # Get calls that started recently and don't have an end time
        active_calls = db.query(CallLog).filter(
            CallLog.created_at >= (datetime.utcnow() - timedelta(hours=2)),
            CallLog.ended_at.is_(None)
        ).all()
        
        return {
            "active_calls": [
                {
                    "call_id": call.call_sid,
                    "caller_number": call.caller_phone,
                    "state": call.status or "in_progress",
                    "type": "inbound",  # Not directly available in the model
                    "duration": (datetime.utcnow() - call.created_at).seconds // 60,
                    "sentiment": "positive" if call.sentiment_score and call.sentiment_score > 0.2 
                               else "negative" if call.sentiment_score and call.sentiment_score < -0.2 
                               else "neutral",
                    "agent_id": call.caller_phone or "unknown",
                    "queue_time": 0  # Not directly available in the model
                }
                for call in active_calls
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in get_live_calls: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        