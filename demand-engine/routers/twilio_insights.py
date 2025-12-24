"""
Twilio Insights API - Real call analytics from Twilio
Provides: Call history, costs, transcripts, number status, uptime tracking
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/twilio/insights", tags=["Twilio Insights"])

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID else None


class CallInsight(BaseModel):
    call_sid: str
    from_number: str
    to_number: str
    status: str
    duration: int
    start_time: datetime
    end_time: Optional[datetime]
    price: Optional[str]
    price_unit: Optional[str]
    direction: str
    answered_by: Optional[str]
    recording_url: Optional[str]
    transcript_url: Optional[str]


class NumberStatus(BaseModel):
    phone_number: str
    friendly_name: str
    status: str
    is_active: bool
    voice_url: str
    capabilities: Dict[str, bool]
    date_created: datetime
    last_call: Optional[datetime]


class CostSummary(BaseModel):
    total_calls: int
    total_duration_minutes: float
    total_cost: float
    average_cost_per_call: float
    average_duration: float
    period_start: datetime
    period_end: datetime
    currency: str


class UptimeMetrics(BaseModel):
    total_calls: int
    successful_calls: int
    failed_calls: int
    busy_calls: int
    no_answer_calls: int
    uptime_percentage: float
    average_response_time: float
    period_start: datetime
    period_end: datetime


@router.get("/call-history")
async def get_call_history(
    phone_number: Optional[str] = Query(None, description="Filter by phone number"),
    days: int = Query(7, description="Number of days to look back"),
    limit: int = Query(50, description="Maximum number of calls to return")
) -> List[CallInsight]:
    """
    Get real call history from Twilio with full details
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Calculate date range
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Build query parameters
        query_params = {
            "start_time_after": start_date,
            "limit": limit
        }
        
        if phone_number:
            query_params["to"] = phone_number
        
        # Fetch calls from Twilio
        calls = client.calls.list(**query_params)
        
        # Format response
        call_insights = []
        for call in calls:
            insight = CallInsight(
                call_sid=call.sid,
                from_number=call.from_formatted or call.from_,
                to_number=call.to_formatted or call.to,
                status=call.status,
                duration=int(call.duration) if call.duration else 0,
                start_time=call.start_time,
                end_time=call.end_time,
                price=call.price,
                price_unit=call.price_unit,
                direction=call.direction,
                answered_by=call.answered_by,
                recording_url=None,
                transcript_url=None
            )
            
            # Try to get recording if available
            try:
                recordings = client.recordings.list(call_sid=call.sid, limit=1)
                if recordings:
                    insight.recording_url = f"https://api.twilio.com{recordings[0].uri.replace('.json', '.mp3')}"
            except Exception:
                pass
            
            call_insights.append(insight)
        
        return call_insights
        
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching call history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/number-status/{phone_number}")
async def get_number_status(phone_number: str) -> NumberStatus:
    """
    Get detailed status of a Twilio phone number
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Find the number
        numbers = client.incoming_phone_numbers.list(phone_number=phone_number)
        
        if not numbers:
            raise HTTPException(status_code=404, detail="Number not found")
        
        number = numbers[0]
        
        # Get last call time
        last_call_time = None
        try:
            recent_calls = client.calls.list(to=phone_number, limit=1)
            if recent_calls:
                last_call_time = recent_calls[0].start_time
        except Exception:
            pass
        
        return NumberStatus(
            phone_number=number.phone_number,
            friendly_name=number.friendly_name,
            status="active" if number.status == "in-use" else number.status,
            is_active=number.status == "in-use",
            voice_url=number.voice_url,
            capabilities={
                "voice": number.capabilities.get("voice", False),
                "sms": number.capabilities.get("sms", False),
                "mms": number.capabilities.get("mms", False)
            },
            date_created=number.date_created,
            last_call=last_call_time
        )
        
    except HTTPException:
        raise
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching number status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cost-summary")
async def get_cost_summary(
    phone_number: Optional[str] = Query(None, description="Filter by phone number"),
    days: int = Query(30, description="Number of days to analyze")
) -> CostSummary:
    """
    Get cost summary for calls over a period
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Build query parameters
        query_params = {
            "start_time_after": start_date,
            "end_time_before": end_date
        }
        
        if phone_number:
            query_params["to"] = phone_number
        
        # Fetch calls
        calls = client.calls.list(**query_params)
        
        # Calculate metrics
        total_calls = len(calls)
        total_duration = sum(int(call.duration) if call.duration else 0 for call in calls)
        total_cost = sum(abs(float(call.price)) if call.price else 0 for call in calls)
        
        avg_cost = total_cost / total_calls if total_calls > 0 else 0
        avg_duration = total_duration / total_calls if total_calls > 0 else 0
        
        # Get currency from first call
        currency = calls[0].price_unit if calls and calls[0].price_unit else "USD"
        
        return CostSummary(
            total_calls=total_calls,
            total_duration_minutes=total_duration / 60,
            total_cost=total_cost,
            average_cost_per_call=avg_cost,
            average_duration=avg_duration,
            period_start=start_date,
            period_end=end_date,
            currency=currency
        )
        
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error calculating cost summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/uptime-metrics")
async def get_uptime_metrics(
    phone_number: Optional[str] = Query(None, description="Filter by phone number"),
    days: int = Query(7, description="Number of days to analyze")
) -> UptimeMetrics:
    """
    Get uptime and reliability metrics
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Build query parameters
        query_params = {
            "start_time_after": start_date,
            "end_time_before": end_date
        }
        
        if phone_number:
            query_params["to"] = phone_number
        
        # Fetch calls
        calls = client.calls.list(**query_params)
        
        # Categorize calls
        total_calls = len(calls)
        successful = sum(1 for call in calls if call.status == "completed")
        failed = sum(1 for call in calls if call.status in ["failed", "canceled"])
        busy = sum(1 for call in calls if call.status == "busy")
        no_answer = sum(1 for call in calls if call.status == "no-answer")
        
        # Calculate uptime percentage
        uptime = (successful / total_calls * 100) if total_calls > 0 else 100.0
        
        # Calculate average response time (time to answer)
        response_times = []
        for call in calls:
            if call.start_time and call.end_time and call.status == "completed":
                response_times.append((call.end_time - call.start_time).total_seconds())
        
        avg_response = sum(response_times) / len(response_times) if response_times else 0
        
        return UptimeMetrics(
            total_calls=total_calls,
            successful_calls=successful,
            failed_calls=failed,
            busy_calls=busy,
            no_answer_calls=no_answer,
            uptime_percentage=uptime,
            average_response_time=avg_response,
            period_start=start_date,
            period_end=end_date
        )
        
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error calculating uptime metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/call-transcript/{call_sid}")
async def get_call_transcript(call_sid: str) -> Dict[str, Any]:
    """
    Get transcript for a specific call (if available)
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Try to get recording transcription
        transcriptions = client.transcriptions.list(limit=20)
        
        for transcription in transcriptions:
            # Match by recording SID which is linked to call
            recordings = client.recordings.list(call_sid=call_sid, limit=1)
            if recordings and transcription.recording_sid == recordings[0].sid:
                return {
                    "call_sid": call_sid,
                    "transcript": transcription.transcription_text,
                    "status": transcription.status,
                    "duration": transcription.duration,
                    "price": transcription.price,
                    "date_created": transcription.date_created
                }
        
        # If no transcription found, check if recording exists
        recordings = client.recordings.list(call_sid=call_sid, limit=1)
        if recordings:
            return {
                "call_sid": call_sid,
                "transcript": None,
                "status": "no_transcript",
                "message": "Recording exists but no transcript available. Enable transcription in Twilio settings.",
                "recording_url": f"https://api.twilio.com{recordings[0].uri.replace('.json', '.mp3')}"
            }
        
        return {
            "call_sid": call_sid,
            "transcript": None,
            "status": "no_recording",
            "message": "No recording found for this call"
        }
        
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/offline-history")
async def get_offline_history(
    phone_number: str,
    days: int = Query(30, description="Number of days to analyze")
) -> Dict[str, Any]:
    """
    Analyze when the number was offline/unavailable
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Get all calls to this number
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        calls = client.calls.list(
            to=phone_number,
            start_time_after=start_date,
            end_time_before=end_date
        )
        
        # Identify offline periods (failed calls, no-answer, etc.)
        offline_incidents = []
        for call in calls:
            if call.status in ["failed", "canceled", "no-answer"]:
                offline_incidents.append({
                    "timestamp": call.start_time,
                    "status": call.status,
                    "from": call.from_formatted or call.from_,
                    "duration_attempted": call.duration
                })
        
        # Calculate offline percentage
        total_calls = len(calls)
        offline_count = len(offline_incidents)
        offline_percentage = (offline_count / total_calls * 100) if total_calls > 0 else 0
        
        return {
            "phone_number": phone_number,
            "period_start": start_date,
            "period_end": end_date,
            "total_calls": total_calls,
            "offline_incidents": offline_count,
            "offline_percentage": offline_percentage,
            "uptime_percentage": 100 - offline_percentage,
            "incidents": offline_incidents[:10]  # Return last 10 incidents
        }
        
    except TwilioRestException as e:
        logger.error(f"Twilio API error: {e}")
        raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    except Exception as e:
        logger.error(f"Error analyzing offline history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
