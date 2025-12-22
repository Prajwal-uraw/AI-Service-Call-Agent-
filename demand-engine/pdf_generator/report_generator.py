"""
PDF Report Generator for ROI Calculator Results
Generates professional PDF reports with Kestrel branding
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
from typing import Dict, Any
import io


class ROIReportGenerator:
    """Generate PDF reports for calculator submissions"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for Kestrel branding"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='KestrelTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='KestrelSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        # Section header
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=10,
            spaceBefore=15,
            fontName='Helvetica-Bold'
        ))
        
        # Highlight box
        self.styles.add(ParagraphStyle(
            name='HighlightText',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#0f172a'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
    
    def generate_roi_report(
        self,
        calculator_data: Dict[str, Any],
        results: Dict[str, Any],
        company_info: Dict[str, Any] = None
    ) -> bytes:
        """
        Generate PDF report from calculator results
        
        Args:
            calculator_data: Input data from calculator form
            results: Calculated results
            company_info: Optional company information
            
        Returns:
            PDF file as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        story = []
        
        # Header with branding
        story.append(Paragraph("Kestrel", self.styles['KestrelTitle']))
        story.append(Paragraph(
            "HVAC AI Call Agent - ROI Analysis Report",
            self.styles['KestrelSubtitle']
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Company info if provided
        if company_info and company_info.get('company_name'):
            story.append(Paragraph(
                f"Prepared for: {company_info['company_name']}",
                self.styles['Normal']
            ))
            story.append(Spacer(1, 0.1*inch))
        
        # Report date
        story.append(Paragraph(
            f"Report Date: {datetime.now().strftime('%B %d, %Y')}",
            self.styles['Normal']
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        
        # Current situation box
        current_loss_data = [
            ['Current Annual Loss from Missed Calls', f"${results['annual_loss']:,.0f}"],
            ['Monthly Revenue Loss', f"${results['monthly_loss']:,.0f}"],
            ['Missed Calls per Month', f"{results['calls_missed']:,.0f}"]
        ]
        
        current_table = Table(current_loss_data, colWidths=[4*inch, 2*inch])
        current_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef2f2')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#991b1b')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#fecaca'))
        ]))
        story.append(current_table)
        story.append(Spacer(1, 0.2*inch))
        
        # With Kestrel box
        recovery_data = [
            ['Annual Revenue Recovery with Kestrel', f"${results['recoverable_revenue']:,.0f}"],
            ['Return on Investment (ROI)', f"{results['roi_percentage']}%"],
            ['Lead Quality Tier', results.get('lead_tier', 'Qualified')]
        ]
        
        recovery_table = Table(recovery_data, colWidths=[4*inch, 2*inch])
        recovery_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0fdf4')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#166534')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bbf7d0'))
        ]))
        story.append(recovery_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Business Details
        story.append(Paragraph("Your Business Details", self.styles['SectionHeader']))
        
        business_data = [
            ['Business Type', calculator_data.get('business_type', 'HVAC')],
            ['Average Ticket Value', f"${calculator_data.get('avg_ticket_value', 0):,.0f}"],
            ['Daily Call Volume', f"{calculator_data.get('calls_per_day', 0)}"],
            ['Current Answer Rate', f"{calculator_data.get('current_answer_rate', 0)}%"],
            ['Total Monthly Calls', f"{results['total_calls_per_month']:,.0f}"]
        ]
        
        business_table = Table(business_data, colWidths=[3*inch, 3*inch])
        business_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(business_table)
        story.append(Spacer(1, 0.3*inch))
        
        # What You Get with Kestrel
        story.append(Paragraph("What You Get with Kestrel", self.styles['SectionHeader']))
        
        features = [
            "✓ Custom-built HVAC AI call agent for your business",
            "✓ Live in 48 hours with zero technical work from you",
            "✓ Answers every call in 200ms, 24/7/365",
            "✓ Emergency routing and HVAC-specific protocols",
            "✓ Integration with ServiceTitan or Housecall Pro",
            "✓ Ongoing monitoring and optimization by our team"
        ]
        
        for feature in features:
            story.append(Paragraph(feature, self.styles['Normal']))
            story.append(Spacer(1, 0.08*inch))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Call to Action
        story.append(Paragraph("Next Steps", self.styles['SectionHeader']))
        story.append(Paragraph(
            "Ready to stop losing revenue to missed calls? Our team is ready to build your custom AI call agent.",
            self.styles['Normal']
        ))
        story.append(Spacer(1, 0.15*inch))
        
        cta_data = [
            ['📞 Call Us', '(555) 123-4567'],
            ['🌐 Website', 'hvacaiagent.frontofai.com'],
            ['📧 Email', 'hello@kestral.ai']
        ]
        
        cta_table = Table(cta_data, colWidths=[2*inch, 4*inch])
        cta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#93c5fd'))
        ]))
        story.append(cta_table)
        
        # Footer
        story.append(Spacer(1, 0.4*inch))
        story.append(Paragraph(
            "This report is confidential and prepared exclusively for the recipient.",
            ParagraphStyle(
                name='Footer',
                parent=self.styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=TA_CENTER
            )
        ))
        
        # Build PDF
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
