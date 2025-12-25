"""
Modal Deployment for Analytics Engines & Report Generation API
Deploys all 6 analytics engines and report generation endpoints to Modal
"""

import modal
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import logging

# Create Modal app
app = modal.App("kestrel-analytics-api")

# Create image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "fastapi>=0.104.0",
        "pydantic>=2.0.0",
        "openai>=1.12.0",
        "supabase>=2.3.4",
        "python-dotenv>=1.0.0",
    )
    .copy_local_dir(
        "analytics",
        "/root/analytics"
    )
    .copy_local_dir(
        "admin",
        "/root/admin"
    )
)

# Request/Response models
class ReportGenerationRequest(BaseModel):
    pilot_id: str
    customer_name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    use_real_data: bool = True

class ReportGenerationResponse(BaseModel):
    report_id: str
    pilot_id: str
    status: str
    generated_at: str
    report_data: Optional[Dict[str, Any]] = None

# Create FastAPI app
web_app = FastAPI(
    title="Kestrel Analytics API",
    description="Analytics engines and report generation for pilot analysis",
    version="1.0.0"
)

# Add CORS middleware
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@web_app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Kestrel Analytics API",
        "status": "healthy",
        "version": "1.0.0",
        "engines": [
            "Baseline & Counterfactual",
            "Assumptions & Disclosure",
            "Metric Segregation",
            "Call Intent Classification",
            "Capacity Saturation",
            "Latency & Performance"
        ]
    }

@web_app.post("/api/reports/generate", response_model=ReportGenerationResponse)
async def generate_report(request: ReportGenerationRequest):
    """
    Generate comprehensive pilot report using all 6 analytics engines
    
    - **pilot_id**: Unique identifier for the pilot
    - **customer_name**: Name of the customer
    - **use_real_data**: Whether to fetch real data from Supabase (default: True)
    """
    try:
        import sys
        sys.path.insert(0, '/root')
        
        from analytics.report_orchestrator import ReportOrchestrator, PilotData
        from datetime import datetime, timedelta
        
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        logger.info(f"Generating report for pilot: {request.pilot_id}")
        
        # Initialize orchestrator
        orchestrator = ReportOrchestrator()
        
        # Generate report using real data if requested
        if request.use_real_data:
            logger.info("Using real data from Supabase")
            report = orchestrator.generate_report(pilot_id=request.pilot_id)
        else:
            # Use mock data
            logger.info("Using mock data")
            start_date = datetime.fromisoformat(request.start_date) if request.start_date else datetime.now() - timedelta(days=30)
            end_date = datetime.fromisoformat(request.end_date) if request.end_date else datetime.now()
            
            pilot_data = PilotData(
                pilot_id=request.pilot_id,
                customer_name=request.customer_name,
                start_date=start_date,
                end_date=end_date,
                total_calls=127,
                calls_answered=127,
                calls_with_transcripts=[
                    {"call_id": "call_001", "transcript": "My AC stopped working, it's an emergency!"},
                ],
                call_events=[
                    {
                        "call_id": "call_001",
                        "start_time": datetime.now(),
                        "end_time": datetime.now() + timedelta(minutes=5),
                        "duration_seconds": 300
                    }
                ],
                bookings_created=34,
                average_booking_delay_minutes=3.2,
                latency_measurements=[
                    {"metric_type": "answer_latency", "value_ms": 205, "call_id": "call_001", "time_of_day": 10},
                ],
                declared_capacity=3,
                average_ticket_value=450,
            )
            
            report = orchestrator.generate_report(pilot_data=pilot_data)
        
        logger.info(f"Report generated successfully: {report.report_id}")
        
        return ReportGenerationResponse(
            report_id=report.report_id,
            pilot_id=report.pilot_id,
            status="completed",
            generated_at=report.generated_at.isoformat(),
            report_data=report.model_dump()
        )
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )

@web_app.get("/api/reports/{report_id}")
async def get_report(report_id: str):
    """Get report by ID (placeholder - implement database storage)"""
    return {
        "report_id": report_id,
        "status": "not_implemented",
        "message": "Report retrieval from database not yet implemented"
    }

@web_app.get("/api/reports/{report_id}/status")
async def get_report_status(report_id: str):
    """Get report generation status (placeholder)"""
    return {
        "report_id": report_id,
        "status": "completed",
        "message": "Status tracking not yet implemented"
    }

# Deploy as ASGI app
@app.function(
    image=image,
    secrets=[
        modal.Secret.from_name("hvac-agent-secrets"),
    ],
    cpu=2.0,
    memory=2048,
    timeout=900,  # 15 minutes for long reports
)
@modal.asgi_app()
def fastapi_app():
    """Deploy FastAPI app to Modal"""
    return web_app


# Local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(web_app, host="0.0.0.0", port=8001)
