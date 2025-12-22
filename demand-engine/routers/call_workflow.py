"""
Call Workflow API
Handles forwarding config, missed calls, and analytics
"""

from fastapi import APIRouter, HTTPException, Form, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, timedelta
import logging
from sqlalchemy.orm import Session
from services.missed_call_handler import get_missed_call_handler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/call-workflow", tags=["Call Workflow"])

# ==================== REQUEST/RESPONSE MODELS ====================

class ForwardingConfig(BaseModel):
    forward_number: str
    enable_recording: bool = True
    missed_call_sms_enabled: bool = True
    missed_call_sms_template: Optional[str] = None

class WeeklyReportRequest(BaseModel):
    week_start: date
    tenant_id: Optional[int] = 1

# ==================== FORWARDING CONFIG ====================

@router.post("/forwarding/configure")
async def configure_forwarding(config: ForwardingConfig):
    """
    Configure call forwarding for tenant
    """
    try:
        # TODO: Save to database (tenants table)
        # For now, return success
        
        logger.info(f"Forwarding configured: {config.forward_number}")
        
        return {
            "success": True,
            "forward_number": config.forward_number,
            "enable_recording": config.enable_recording,
            "message": "Forwarding configured successfully"
        }
        
    except Exception as e:
        logger.error(f"Error configuring forwarding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forwarding/config")
async def get_forwarding_config(tenant_id: int = 1):
    """
    Get current forwarding configuration
    """
    try:
        # TODO: Fetch from database
        # For now, return mock data
        
        return {
            "forward_number": "+1234567890",
            "enable_recording": True,
            "missed_call_sms_enabled": True,
            "missed_call_sms_template": "Sorry we missed your call! We'll call you back during business hours."
        }
        
    except Exception as e:
        logger.error(f"Error getting forwarding config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/forwarding/test")
async def test_forwarding(phone_number: str):
    """
    Test call forwarding to verify number
    """
    try:
        # TODO: Initiate test call via Twilio
        
        logger.info(f"Test call initiated to {phone_number}")
        
        return {
            "success": True,
            "message": f"Test call initiated to {phone_number}",
            "call_sid": "CA_test_123"
        }
        
    except Exception as e:
        logger.error(f"Error testing forwarding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== MISSED CALL HANDLING ====================

@router.post("/twilio/call-status")
async def handle_call_status(
    CallSid: str = Form(...),
    CallStatus: str = Form(...),
    From: str = Form(...),
    To: str = Form(...),
    CallDuration: Optional[str] = Form(None)
):
    """
    Twilio call status webhook
    Handles missed, dropped, and completed calls
    """
    try:
        handler = get_missed_call_handler()
        
        logger.info(f"Call status: {CallSid} - {CallStatus}")
        
        # Detect missed call
        if CallStatus in ["no-answer", "busy"]:
            # Send missed call SMS
            result = await handler.handle_missed_call(
                call_sid=CallSid,
                caller_phone=From,
                called_number=To
            )
            
            # TODO: Update call_logs with is_missed=True
            
            return {
                "status": "missed_call_handled",
                "sms_sent": result.get("sms_sent"),
                "call_sid": CallSid
            }
        
        # Detect dropped call
        elif CallStatus in ["failed", "canceled"]:
            # TODO: Update call_logs with is_dropped=True
            
            return {
                "status": "dropped_call_logged",
                "call_sid": CallSid
            }
        
        # Completed call
        elif CallStatus == "completed":
            # TODO: Update call_logs with duration
            
            return {
                "status": "call_completed",
                "call_sid": CallSid,
                "duration": CallDuration
            }
        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Error handling call status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== WEEKLY REPORTS ====================

@router.get("/reports/weekly")
async def get_weekly_report(
    week_start: Optional[str] = None,
    tenant_id: int = 1
):
    """
    Get weekly call analytics report
    """
    try:
        # Default to current week if not specified
        if not week_start:
            today = date.today()
            week_start_date = today - timedelta(days=today.weekday())
        else:
            week_start_date = date.fromisoformat(week_start)
        
        week_end_date = week_start_date + timedelta(days=6)
        
        # TODO: Query weekly_analytics table
        # For now, return mock data
        
        report = {
            "week_start": week_start_date.isoformat(),
            "week_end": week_end_date.isoformat(),
            "tenant_id": tenant_id,
            
            # Call metrics
            "total_calls": 47,
            "answered_calls": 38,
            "missed_calls": 6,
            "dropped_calls": 3,
            "after_hours_calls": 12,
            
            # Duration metrics
            "total_duration_seconds": 5420,
            "avg_duration_seconds": 143,
            
            # AI metrics
            "ai_handled_calls": 35,
            "human_transferred_calls": 3,
            "ai_calls_remaining": 20 - 35,  # Assuming 20 call limit
            
            # Issue breakdown
            "issues": {
                "ac": 18,
                "heating": 12,
                "maintenance": 8,
                "emergency": 2
            },
            
            # Busiest hours
            "busiest_hours": [
                {"hour": 10, "calls": 8},
                {"hour": 14, "calls": 7},
                {"hour": 16, "calls": 6}
            ],
            
            # Sentiment
            "avg_sentiment_score": 0.65
        }
        
        return report
        
    except Exception as e:
        logger.error(f"Error getting weekly report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/weekly/export")
async def export_weekly_report(
    week_start: Optional[str] = None,
    tenant_id: int = 1,
    format: str = "pdf"
):
    """
    Export weekly report as PDF or CSV
    """
    try:
        # Get report data
        report = await get_weekly_report(week_start, tenant_id)
        
        if format == "pdf":
            # TODO: Generate PDF
            return {
                "success": True,
                "download_url": "/reports/weekly/download/report.pdf",
                "format": "pdf"
            }
        elif format == "csv":
            # TODO: Generate CSV
            return {
                "success": True,
                "download_url": "/reports/weekly/download/report.csv",
                "format": "csv"
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'csv'")
        
    except Exception as e:
        logger.error(f"Error exporting report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== AI CALL CAP ====================

@router.get("/ai-usage")
async def get_ai_usage(tenant_id: int = 1):
    """
    Get AI call usage for tenant
    """
    try:
        # TODO: Query tenants table
        # For now, return mock data
        
        return {
            "tenant_id": tenant_id,
            "ai_calls_used": 15,
            "ai_calls_limit": 20,
            "ai_calls_remaining": 5,
            "percentage_used": 75.0,
            "status": "active"  # or "limit_reached"
        }
        
    except Exception as e:
        logger.error(f"Error getting AI usage: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai-usage/reset")
async def reset_ai_usage(tenant_id: int = 1):
    """
    Reset AI call counter (admin only)
    """
    try:
        # TODO: Update tenants table, set ai_calls_used = 0
        
        logger.info(f"AI usage reset for tenant {tenant_id}")
        
        return {
            "success": True,
            "tenant_id": tenant_id,
            "ai_calls_used": 0,
            "message": "AI usage counter reset"
        }
        
    except Exception as e:
        logger.error(f"Error resetting AI usage: {e}")
        raise HTTPException(status_code=500, detail=str(e))
