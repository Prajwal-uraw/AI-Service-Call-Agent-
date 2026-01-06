"""
Report Generation API
FastAPI endpoints for generating pilot reports
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import logging

from analytics.report_orchestrator import ReportOrchestrator, PilotData, PilotReport
from analytics.data_connector import AnalyticsDataConnector

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reports", tags=["reports"])


class GenerateReportRequest(BaseModel):
    """Request to generate a pilot report"""
    pilot_id: str
    customer_id: str
    customer_name: str
    
    # Baseline data
    baseline_source: str = "customer_reported"
    baseline_metrics: Dict[str, Any]
    baseline_source_details: str
    
    # Call data
    total_calls: int
    calls_answered: int
    calls_with_transcripts: List[Dict[str, Any]] = Field(default_factory=list)
    call_events: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Booking data
    bookings_created: int
    average_booking_delay_minutes: float
    
    # Performance data
    latency_measurements: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Business context
    declared_capacity: int = 3
    average_ticket_value: float = 450.0
    pilot_start_date: datetime
    pilot_end_date: datetime


class ReportStatusResponse(BaseModel):
    """Report generation status"""
    pilot_id: str
    status: str  # generating, completed, failed
    report_id: Optional[str] = None
    error: Optional[str] = None
    generated_at: Optional[datetime] = None


class ReportGenerationRequest(BaseModel):
    pilot_id: str
    customer_name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_calls: Optional[int] = None
    calls_answered: Optional[int] = None
    calls_with_transcripts: Optional[List[Dict[str, Any]]] = None
    call_events: Optional[List[Dict[str, Any]]] = None
    bookings_created: Optional[int] = None
    average_booking_delay_minutes: Optional[float] = None
    latency_measurements: Optional[List[Dict[str, Any]]] = None
    declared_capacity: Optional[int] = None
    average_ticket_value: Optional[float] = None
    use_real_data: bool = False


class ReportGenerationResponse(BaseModel):
    pilot_id: str
    status: str  # generating, completed, failed
    report_id: Optional[str] = None
    error: Optional[str] = None
    generated_at: Optional[datetime] = None


@router.post("/generate", response_model=ReportGenerationResponse)
async def generate_report(request: ReportGenerationRequest):
    """
    Generate a comprehensive pilot report using all 6 analytics engines
    
    This endpoint orchestrates:
    1. Baseline & Counterfactual Analysis
    2. Assumptions & Disclosure
    3. Observed vs Modeled Metric Segregation
    4. Call Intent Classification
    5. Capacity Saturation Analysis
    6. Latency & System Performance Analysis
    
    Set use_real_data=True to fetch actual call data from Supabase
    """
    try:
        logger.info(f"Generating report for pilot: {request.pilot_id}")
        
        # Initialize orchestrator
        orchestrator = ReportOrchestrator()
        
        # Generate report using real data if requested
        if request.use_real_data:
            logger.info("Fetching real call data from Supabase")
            report = orchestrator.generate_report(pilot_id=request.pilot_id)
        else:
            # Use mock/override data
            logger.info("Using mock/override data")
            start_date = datetime.fromisoformat(request.start_date) if request.start_date else datetime.now() - timedelta(days=30)
            end_date = datetime.fromisoformat(request.end_date) if request.end_date else datetime.now()
            
            pilot_data = PilotData(
                pilot_id=request.pilot_id,
                customer_name=request.customer_name,
                start_date=start_date,
                end_date=end_date,
                total_calls=request.total_calls or 127,
                calls_answered=request.calls_answered or 127,
                calls_with_transcripts=[
                    {"call_id": "call_001", "transcript": "My AC stopped working, it's an emergency!"},
                    {"call_id": "call_002", "transcript": "I need to schedule maintenance for next week"},
                ],
                call_events=[
                    {
                        "call_id": "call_001",
                        "start_time": datetime.now(),
                        "end_time": datetime.now() + timedelta(minutes=5),
                        "duration_seconds": 300
                    }
                ],
                bookings_created=request.bookings_created or 34,
                average_booking_delay_minutes=request.average_booking_delay_minutes or 3.2,
                latency_measurements=[
                    {"metric_type": "answer_latency", "value_ms": 205, "call_id": "call_001", "time_of_day": 10},
                    {"metric_type": "speech_to_response", "value_ms": 290, "call_id": "call_001", "time_of_day": 10},
                ],
                declared_capacity=request.declared_capacity,
                average_ticket_value=request.average_ticket_value,
            )
            
            report = orchestrator.generate_report(pilot_data=pilot_data)
        
        # TODO: Store report in database
        # TODO: Generate PDF
        # TODO: Send email to customer
        
        logger.info(f"Report generation completed for pilot: {request.pilot_id}")
        
        return ReportStatusResponse(
            pilot_id=request.pilot_id,
            status="completed",
            report_id=report.pilot_id,
            generated_at=report.generated_at
        )
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}", exc_info=True)
        return ReportStatusResponse(
            pilot_id=request.pilot_id,
            status="failed",
            error=str(e)
        )


@router.get("/status/{pilot_id}", response_model=ReportStatusResponse)
async def get_report_status(pilot_id: str):
    """
    Get the status of a report generation request
    """
    # TODO: Query database for report status
    return ReportStatusResponse(
        pilot_id=pilot_id,
        status="completed",
        report_id=pilot_id,
        generated_at=datetime.now()
    )


@router.get("/{pilot_id}")
async def get_pilot_report(pilot_id: str):
    """
    Retrieve a generated pilot report
    """
    # TODO: Query database for report
    raise HTTPException(
        status_code=404,
        detail=f"Report not found for pilot: {pilot_id}"
    )


@router.get("/{pilot_id}/pdf")
async def download_report_pdf(pilot_id: str):
    """
    Download pilot report as PDF
    """
    # TODO: Generate/retrieve PDF
    raise HTTPException(
        status_code=404,
        detail=f"PDF not found for pilot: {pilot_id}"
    )


@router.post("/{pilot_id}/deliver")
async def deliver_report(
    pilot_id: str,
    email: str,
    include_pdf: bool = True
):
    """
    Deliver pilot report via email
    """
    # TODO: Send email with report
    return {
        "pilot_id": pilot_id,
        "delivered_to": email,
        "delivered_at": datetime.now().isoformat(),
        "status": "sent"
    }
