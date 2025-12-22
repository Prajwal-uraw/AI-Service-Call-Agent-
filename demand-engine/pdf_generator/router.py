"""
FastAPI Router for PDF Generation Service
"""

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from .report_generator import ROIReportGenerator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pdf", tags=["PDF Generation"])

# Request models
class CompanyInfo(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class CalculatorInput(BaseModel):
    business_type: str = Field(..., description="Type of business (HVAC, PLUMBING, etc.)")
    avg_ticket_value: float = Field(..., gt=0, description="Average ticket value in dollars")
    calls_per_day: int = Field(..., gt=0, description="Number of calls per day")
    current_answer_rate: float = Field(..., ge=0, le=100, description="Current answer rate percentage")

class CalculatorResults(BaseModel):
    total_calls_per_month: int
    calls_missed: int
    monthly_loss: float
    annual_loss: float
    recoverable_revenue: float
    roi_percentage: int
    lead_tier: str

class PDFGenerationRequest(BaseModel):
    calculator_data: CalculatorInput
    results: CalculatorResults
    company_info: Optional[CompanyInfo] = None

@router.post("/generate-roi-report")
async def generate_roi_report(request: PDFGenerationRequest):
    """
    Generate a PDF ROI report from calculator results
    
    Returns PDF file as binary response
    """
    try:
        generator = ROIReportGenerator()
        
        # Convert Pydantic models to dicts
        calculator_dict = request.calculator_data.dict()
        results_dict = request.results.dict()
        company_dict = request.company_info.dict() if request.company_info else {}
        
        # Generate PDF
        pdf_bytes = generator.generate_roi_report(
            calculator_data=calculator_dict,
            results=results_dict,
            company_info=company_dict
        )
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        company_name = company_dict.get('company_name', 'Company').replace(' ', '_')
        filename = f"Kestrel_ROI_Report_{company_name}_{timestamp}.pdf"
        
        logger.info(f"Generated PDF report: {filename}")
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Type": "application/pdf"
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF report: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for PDF service"""
    return {
        "status": "healthy",
        "service": "pdf-generation",
        "timestamp": datetime.now().isoformat()
    }
