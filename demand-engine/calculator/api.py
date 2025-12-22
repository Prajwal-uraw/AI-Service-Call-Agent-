"""
FastAPI endpoints for calculator
"""
from typing import Optional
from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from .engine import calculate_missed_call_tax, calculate_roi, update_lead_score
from .models import CalculatorInput, CalculatorResult, LeadSubmission
from .storage import save_lead_submission, get_lead_by_session, update_lead_engagement
from config.supabase_config import get_supabase


router = APIRouter(prefix="/calculator", tags=["calculator"])


@router.post("/calculate", response_model=CalculatorResult)
async def calculate_endpoint(input_data: CalculatorInput):
    """
    Calculate missed call tax and ROI
    
    POST /calculator/calculate
    
    Body:
    {
        "business_type": "HVAC",
        "avg_ticket_value": 2500,
        "calls_per_day": 30,
        "current_answer_rate": 65,
        "email": "optional@example.com"
    }
    
    Returns: CalculatorResult with all metrics
    """
    try:
        # Generate session ID if not provided
        if not input_data.session_id:
            input_data.session_id = str(uuid.uuid4())
        
        # Calculate results
        result = calculate_missed_call_tax(input_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")


@router.post("/submit")
async def submit_calculator(
    input_data: CalculatorInput,
    background_tasks: BackgroundTasks
):
    """
    Submit calculator and create lead record
    
    POST /calculator/submit
    
    This endpoint:
    1. Calculates results
    2. Saves lead to database
    3. Triggers background tasks (email, PDF generation)
    
    Returns: Result + session_id for tracking
    """
    try:
        # Generate session ID
        if not input_data.session_id:
            input_data.session_id = str(uuid.uuid4())
        
        # Calculate
        result = calculate_missed_call_tax(input_data)
        
        # Create lead submission
        lead = LeadSubmission(
            session_id=result.session_id,
            email=input_data.email,
            phone=input_data.phone,
            company_name=input_data.company_name,
            location=input_data.location,
            business_type=input_data.business_type.value,
            monthly_loss=result.monthly_loss,
            annual_loss=result.annual_loss,
            lead_score=result.lead_score,
            lead_tier=result.lead_tier,
            submitted_at=datetime.now(timezone.utc),
            referral_source=input_data.referral_source,
            raw_input=input_data.dict(),
            raw_output=result.dict()
        )
        
        # Save to database
        lead_id = save_lead_submission(lead)
        
        # Background tasks
        if input_data.email:
            background_tasks.add_task(send_results_email, lead_id, input_data.email)
            background_tasks.add_task(generate_pdf_async, lead_id, result)
        
        return {
            "success": True,
            "session_id": result.session_id,
            "lead_id": lead_id,
            "result": result,
            "message": "Results calculated and saved"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission error: {str(e)}")


@router.get("/results/{session_id}")
async def get_results(session_id: str):
    """
    Retrieve calculator results by session ID
    
    GET /calculator/results/{session_id}
    
    Returns: Stored lead data and results
    """
    try:
        lead = get_lead_by_session(session_id)
        
        if not lead:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session_id,
            "lead": lead,
            "calculated_at": lead.get("submitted_at"),
            "results": lead.get("raw_output")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval error: {str(e)}")


@router.post("/track-engagement/{session_id}")
async def track_engagement(
    session_id: str,
    event_type: str,
    metadata: Optional[dict] = None
):
    """
    Track user engagement with calculator results
    
    POST /calculator/track-engagement/{session_id}
    
    Body:
    {
        "event_type": "viewed_full_report" | "downloaded_pdf" | "clicked_cta" | "email_opened",
        "metadata": {...}
    }
    
    Updates lead score based on engagement
    """
    try:
        # Get current lead
        lead = get_lead_by_session(session_id)
        
        if not lead:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update engagement flags
        engagement_updates = {}
        
        if event_type == "viewed_full_report":
            engagement_updates["viewed_full_report"] = True
        elif event_type == "downloaded_pdf":
            engagement_updates["downloaded_pdf"] = True
        elif event_type == "clicked_cta":
            engagement_updates["clicked_cta"] = True
        elif event_type == "email_opened":
            engagement_updates["email_opened"] = True
        else:
            raise HTTPException(status_code=400, detail=f"Unknown event type: {event_type}")
        
        # Recalculate lead score
        monthly_loss = lead.get("monthly_loss", 0)
        
        # Get all engagement flags
        all_flags = {
            "has_email": bool(lead.get("email")),
            "has_phone": bool(lead.get("phone")),
            "viewed_full_report": lead.get("viewed_full_report", False) or engagement_updates.get("viewed_full_report", False),
            "downloaded_pdf": lead.get("downloaded_pdf", False) or engagement_updates.get("downloaded_pdf", False),
            "clicked_cta": lead.get("clicked_cta", False) or engagement_updates.get("clicked_cta", False),
            "email_opened": lead.get("email_opened", False) or engagement_updates.get("email_opened", False),
        }
        
        new_score, new_tier = update_lead_score(
            current_score=lead.get("lead_score", 0),
            monthly_loss=monthly_loss,
            **all_flags
        )
        
        # Update database
        engagement_updates["lead_score"] = new_score
        engagement_updates["lead_tier"] = new_tier
        engagement_updates["last_activity_at"] = datetime.now(timezone.utc).isoformat()
        
        update_lead_engagement(session_id, engagement_updates)
        
        return {
            "success": True,
            "event_type": event_type,
            "new_lead_score": new_score,
            "new_lead_tier": new_tier
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tracking error: {str(e)}")


@router.get("/roi-projection")
async def roi_projection(
    monthly_loss: float,
    monthly_cost: float = 500,
    improvement_rate: float = 0.65
):
    """
    Calculate ROI projection
    
    GET /calculator/roi-projection?monthly_loss=10000&monthly_cost=500
    
    Returns: ROI metrics
    """
    try:
        roi_data = calculate_roi(monthly_loss, monthly_cost, improvement_rate)
        
        return {
            "success": True,
            "roi": roi_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ROI calculation error: {str(e)}")


# Background task functions

async def send_results_email(lead_id: str, email: str):
    """
    Send calculator results via email with Resend
    """
    from email_service.resend_client import ResendEmailClient
    from storage_service.supabase_storage import SupabaseStorageClient
    
    try:
        print(f"📧 Sending results email to {email} for lead {lead_id}")
        
        # Get lead data
        lead = get_lead_by_session(lead_id)
        if not lead:
            print(f"❌ Lead not found: {lead_id}")
            return
        
        results = lead.get("raw_output", {})
        company_name = lead.get("company_name")
        
        # Get PDF URL if it exists
        pdf_url = lead.get("pdf_url")
        
        # Send email
        email_client = ResendEmailClient()
        await email_client.send_roi_report_email(
            to_email=email,
            company_name=company_name,
            results=results,
            pdf_url=pdf_url
        )
        
        print(f"✅ Email sent successfully to {email}")
        
    except Exception as e:
        print(f"❌ Error sending email: {str(e)}")


async def generate_pdf_async(lead_id: str, result: CalculatorResult):
    """
    Generate PDF report and store in Supabase
    """
    from pdf_generator.report_generator import ROIReportGenerator
    from storage_service.supabase_storage import SupabaseStorageClient
    
    try:
        print(f"📄 Generating PDF for lead {lead_id}")
        
        generator = ROIReportGenerator()
        
        # Get lead data for company info
        lead = get_lead_by_session(result.session_id)
        
        calculator_data = lead.get("raw_input", {})
        results_data = result.dict()
        company_info = {
            "company_name": lead.get("company_name"),
            "email": lead.get("email"),
            "phone": lead.get("phone")
        }
        
        # Generate PDF
        pdf_bytes = generator.generate_roi_report(
            calculator_data=calculator_data,
            results=results_data,
            company_info=company_info
        )
        
        # Upload to Supabase Storage
        storage_client = SupabaseStorageClient()
        company_name = company_info.get("company_name", "Company").replace(" ", "_")
        filename = f"Kestrel_ROI_Report_{company_name}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.pdf"
        
        upload_result = storage_client.upload_pdf(
            pdf_bytes=pdf_bytes,
            filename=filename,
            lead_id=lead_id
        )
        
        # Update lead record with PDF URL
        supabase = get_supabase()
        supabase.table("calculator_submissions").update({
            "pdf_url": upload_result["signed_url"],
            "pdf_path": upload_result["file_path"]
        }).eq("session_id", result.session_id).execute()
        
        print(f"✅ PDF generated and stored successfully for lead {lead_id}")
        print(f"   URL: {upload_result['signed_url']}")
        
    except Exception as e:
        print(f"❌ Error generating/storing PDF: {str(e)}")
