"""
Call Intelligence API
Provides AI-powered insights from call recordings and transcriptions
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/call-intelligence", tags=["call-intelligence"])


class CallTranscript(BaseModel):
    call_sid: str
    timestamp: datetime
    speaker: str  # "agent" or "customer"
    text: str
    confidence: float = Field(ge=0.0, le=1.0)


class SentimentAnalysis(BaseModel):
    overall: str  # "positive", "neutral", "negative"
    score: float = Field(ge=-1.0, le=1.0)  # -1 (very negative) to 1 (very positive)
    customer_satisfaction: int = Field(ge=1, le=10)
    key_emotions: List[str]


class CallInsights(BaseModel):
    call_sid: str
    duration: int
    transcription: List[CallTranscript]
    sentiment: SentimentAnalysis
    quality_score: int = Field(ge=1, le=10)
    key_topics: List[str]
    action_items: List[str]
    customer_intent: str
    objections_raised: List[str]
    resolution_status: str  # "resolved", "pending", "escalated"


class CallIntelligenceSummary(BaseModel):
    total_calls: int
    avg_quality_score: float
    avg_sentiment_score: float
    avg_duration: int
    top_topics: List[Dict[str, int]]
    sentiment_distribution: Dict[str, int]
    resolution_rate: float


@router.get("/live-calls")
async def get_live_calls():
    """
    Get currently active calls with real-time transcription
    """
    try:
        # Mock data for now - will integrate with actual call system
        live_calls = [
            {
                "call_sid": "CA1234567890",
                "customer_name": "John Smith",
                "phone": "+1234567890",
                "duration": 125,
                "status": "in-progress",
                "current_sentiment": "positive",
                "last_transcript": "I need to schedule an AC maintenance appointment",
                "agent_response": "I can help you with that. What date works best for you?"
            }
        ]
        
        return {
            "active_calls": live_calls,
            "count": len(live_calls)
        }
        
    except Exception as e:
        logger.error(f"Error fetching live calls: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/call/{call_sid}/insights", response_model=CallInsights)
async def get_call_insights(call_sid: str):
    """
    Get detailed AI insights for a specific call
    """
    try:
        # Mock data - will integrate with actual AI analysis
        insights = CallInsights(
            call_sid=call_sid,
            duration=245,
            transcription=[
                CallTranscript(
                    call_sid=call_sid,
                    timestamp=datetime.utcnow() - timedelta(minutes=4),
                    speaker="customer",
                    text="Hi, my AC isn't cooling properly",
                    confidence=0.95
                ),
                CallTranscript(
                    call_sid=call_sid,
                    timestamp=datetime.utcnow() - timedelta(minutes=4),
                    speaker="agent",
                    text="I understand. Let me help you with that. Can you tell me when you first noticed the issue?",
                    confidence=0.98
                ),
                CallTranscript(
                    call_sid=call_sid,
                    timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=45),
                    speaker="customer",
                    text="It started yesterday afternoon. The house is getting really warm.",
                    confidence=0.96
                ),
                CallTranscript(
                    call_sid=call_sid,
                    timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=30),
                    speaker="agent",
                    text="I can schedule a technician to come out today. Would 2 PM work for you?",
                    confidence=0.97
                ),
                CallTranscript(
                    call_sid=call_sid,
                    timestamp=datetime.utcnow() - timedelta(minutes=3, seconds=15),
                    speaker="customer",
                    text="Yes, that would be perfect. Thank you!",
                    confidence=0.99
                )
            ],
            sentiment=SentimentAnalysis(
                overall="positive",
                score=0.75,
                customer_satisfaction=8,
                key_emotions=["satisfied", "relieved", "grateful"]
            ),
            quality_score=9,
            key_topics=["AC repair", "same-day service", "appointment booking"],
            action_items=[
                "Schedule technician for 2 PM today",
                "Send confirmation SMS",
                "Follow up after service"
            ],
            customer_intent="urgent_repair",
            objections_raised=[],
            resolution_status="resolved"
        )
        
        return insights
        
    except Exception as e:
        logger.error(f"Error fetching call insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary", response_model=CallIntelligenceSummary)
async def get_intelligence_summary(
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze")
):
    """
    Get aggregated call intelligence metrics
    """
    try:
        # Mock data - will calculate from actual call data
        summary = CallIntelligenceSummary(
            total_calls=156,
            avg_quality_score=8.4,
            avg_sentiment_score=0.68,
            avg_duration=187,
            top_topics=[
                {"topic": "AC repair", "count": 45},
                {"topic": "Maintenance", "count": 38},
                {"topic": "Installation", "count": 32},
                {"topic": "Emergency service", "count": 24},
                {"topic": "Quote request", "count": 17}
            ],
            sentiment_distribution={
                "positive": 112,
                "neutral": 32,
                "negative": 12
            },
            resolution_rate=0.89
        )
        
        return summary
        
    except Exception as e:
        logger.error(f"Error fetching intelligence summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment-trends")
async def get_sentiment_trends(
    days: int = Query(30, ge=7, le=90)
):
    """
    Get sentiment trends over time
    """
    try:
        # Mock data - will calculate from actual sentiment analysis
        trends = []
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days-i-1)
            trends.append({
                "date": date.strftime("%Y-%m-%d"),
                "positive": 70 + (i % 10),
                "neutral": 20 + (i % 5),
                "negative": 10 - (i % 3),
                "avg_score": 0.65 + (i % 10) * 0.01
            })
        
        return {
            "trends": trends,
            "period_days": days
        }
        
    except Exception as e:
        logger.error(f"Error fetching sentiment trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quality-metrics")
async def get_quality_metrics():
    """
    Get call quality metrics and breakdown
    """
    try:
        metrics = {
            "overall_quality": 8.4,
            "metrics": {
                "response_time": {
                    "score": 9.2,
                    "avg_ms": 185,
                    "target_ms": 200
                },
                "conversation_flow": {
                    "score": 8.5,
                    "interruptions": 0.3,
                    "natural_transitions": 0.92
                },
                "problem_resolution": {
                    "score": 8.8,
                    "first_call_resolution": 0.89,
                    "escalation_rate": 0.06
                },
                "customer_satisfaction": {
                    "score": 8.1,
                    "avg_rating": 8.1,
                    "promoter_score": 72
                },
                "compliance": {
                    "score": 9.5,
                    "script_adherence": 0.94,
                    "required_disclosures": 0.98
                }
            },
            "improvement_areas": [
                {
                    "area": "Handle pricing objections",
                    "current_score": 7.2,
                    "target_score": 8.5,
                    "recommendation": "Provide more value justification and payment options"
                },
                {
                    "area": "Reduce call transfers",
                    "current_score": 7.8,
                    "target_score": 9.0,
                    "recommendation": "Improve AI knowledge base for complex technical questions"
                }
            ]
        }
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error fetching quality metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversation-analytics")
async def get_conversation_analytics(
    call_sid: Optional[str] = None
):
    """
    Get detailed conversation analytics
    """
    try:
        analytics = {
            "talk_time_ratio": {
                "agent": 0.45,
                "customer": 0.55
            },
            "speaking_pace": {
                "agent_wpm": 145,
                "customer_wpm": 132,
                "optimal_range": [120, 160]
            },
            "silence_periods": {
                "count": 3,
                "avg_duration_seconds": 2.1,
                "max_duration_seconds": 4.5
            },
            "interruptions": {
                "agent_interrupted": 1,
                "customer_interrupted": 0
            },
            "question_types": {
                "open_ended": 8,
                "closed_ended": 12,
                "clarifying": 5
            },
            "keywords_detected": [
                {"keyword": "urgent", "count": 2, "sentiment_impact": -0.2},
                {"keyword": "thank you", "count": 3, "sentiment_impact": 0.3},
                {"keyword": "problem", "count": 4, "sentiment_impact": -0.1}
            ]
        }
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error fetching conversation analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/coaching-insights")
async def get_coaching_insights():
    """
    Get AI-powered coaching recommendations
    """
    try:
        insights = {
            "strengths": [
                {
                    "skill": "Empathy & Active Listening",
                    "score": 9.2,
                    "examples": [
                        "Consistently acknowledges customer concerns",
                        "Uses reflective statements effectively"
                    ]
                },
                {
                    "skill": "Problem Resolution",
                    "score": 8.8,
                    "examples": [
                        "Provides clear solutions quickly",
                        "Follows up on action items"
                    ]
                }
            ],
            "improvement_opportunities": [
                {
                    "skill": "Upselling & Cross-selling",
                    "current_score": 6.5,
                    "target_score": 8.0,
                    "recommendations": [
                        "Identify maintenance plan opportunities in repair calls",
                        "Mention seasonal promotions naturally in conversation"
                    ],
                    "training_resources": [
                        "Consultative Selling Techniques",
                        "Value-Based Pricing Communication"
                    ]
                },
                {
                    "skill": "Handling Objections",
                    "current_score": 7.2,
                    "target_score": 8.5,
                    "recommendations": [
                        "Use the 'Feel, Felt, Found' technique",
                        "Provide social proof and testimonials"
                    ],
                    "training_resources": [
                        "Objection Handling Masterclass",
                        "Building Trust in Sales Conversations"
                    ]
                }
            ],
            "trending_topics": [
                {
                    "topic": "Energy efficiency questions",
                    "frequency_increase": "+35%",
                    "suggested_action": "Add energy savings calculator to knowledge base"
                }
            ]
        }
        
        return insights
        
    except Exception as e:
        logger.error(f"Error fetching coaching insights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
