"""
Test script for PDF generation
Run locally to test PDF report generation
"""

from report_generator import ROIReportGenerator
from datetime import datetime

def test_pdf_generation():
    """Test PDF generation with sample data"""
    
    # Sample calculator data
    calculator_data = {
        "business_type": "HVAC",
        "avg_ticket_value": 2500,
        "calls_per_day": 30,
        "current_answer_rate": 65
    }
    
    # Sample results
    results = {
        "total_calls_per_month": 650,
        "calls_missed": 228,
        "monthly_loss": 171000,
        "annual_loss": 2052000,
        "recoverable_revenue": 1846800,
        "roi_percentage": 1134,
        "lead_tier": "Hot"
    }
    
    # Sample company info
    company_info = {
        "company_name": "ABC HVAC Services",
        "email": "owner@abchvac.com",
        "phone": "(555) 123-4567"
    }
    
    # Generate PDF
    print("Generating PDF report...")
    generator = ROIReportGenerator()
    
    pdf_bytes = generator.generate_roi_report(
        calculator_data=calculator_data,
        results=results,
        company_info=company_info
    )
    
    # Save to file
    filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    with open(filename, 'wb') as f:
        f.write(pdf_bytes)
    
    print(f"✅ PDF generated successfully: {filename}")
    print(f"   File size: {len(pdf_bytes)} bytes")
    
    return filename

if __name__ == "__main__":
    test_pdf_generation()
