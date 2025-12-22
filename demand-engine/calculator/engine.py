"""
Calculator engine - Core business logic for ROI calculations

Based on formulas from Admintoolplan.md
"""
from typing import Dict, Tuple
from datetime import datetime, timezone
import uuid

from .models import CalculatorInput, CalculatorResult, BusinessType


# Industry benchmarks
INDUSTRY_BENCHMARKS = {
    BusinessType.HVAC: {
        "avg_answer_rate": 68,
        "avg_conversion_rate": 30,
        "peak_hours": [(8, 10), (16, 18)],
        "peak_days": ["Monday", "Friday"],
    },
    BusinessType.PLUMBING: {
        "avg_answer_rate": 65,
        "avg_conversion_rate": 35,
        "peak_hours": [(7, 9), (18, 20)],
        "peak_days": ["Sunday", "Monday"],
    },
    BusinessType.ELECTRICAL: {
        "avg_answer_rate": 70,
        "avg_conversion_rate": 28,
        "peak_hours": [(8, 10), (17, 19)],
        "peak_days": ["Monday", "Tuesday"],
    },
    BusinessType.ROOFING: {
        "avg_answer_rate": 62,
        "avg_conversion_rate": 25,
        "peak_hours": [(9, 11), (15, 17)],
        "peak_days": ["Monday", "Wednesday"],
    },
    BusinessType.GENERAL_CONTRACTOR: {
        "avg_answer_rate": 66,
        "avg_conversion_rate": 27,
        "peak_hours": [(8, 10), (16, 18)],
        "peak_days": ["Monday", "Thursday"],
    },
}


def calculate_missed_call_tax(input_data: CalculatorInput) -> CalculatorResult:
    """
    Calculate the "Missed Call Tax" - revenue lost from unanswered calls
    
    Formula from Admintoolplan.md:
    1. Total monthly calls = calls_per_day × days_per_week × 4.33
    2. Calls missed = total × (1 - answer_rate/100)
    3. Potential jobs from missed = missed × (conversion_rate/100)
    4. Revenue lost = potential_jobs × avg_ticket_value
    """
    
    # Get industry benchmark
    benchmark = INDUSTRY_BENCHMARKS.get(
        input_data.business_type,
        INDUSTRY_BENCHMARKS[BusinessType.HVAC]  # Default to HVAC
    )
    
    # Use provided conversion rate or industry default
    conversion_rate = input_data.conversion_rate or benchmark["avg_conversion_rate"]
    
    # Calculate monthly call volume
    days_per_month = (input_data.days_open_per_week or 5) * 4.33
    total_calls_per_month = int(input_data.calls_per_day * days_per_month)
    
    # Current performance
    answer_rate_decimal = input_data.current_answer_rate / 100
    calls_answered = int(total_calls_per_month * answer_rate_decimal)
    calls_missed = total_calls_per_month - calls_answered
    missed_percentage = (calls_missed / total_calls_per_month * 100) if total_calls_per_month > 0 else 0
    
    # Revenue calculations
    conversion_decimal = conversion_rate / 100
    potential_jobs_from_answered = int(calls_answered * conversion_decimal)
    potential_jobs_from_missed = int(calls_missed * conversion_decimal)
    
    revenue_captured = potential_jobs_from_answered * input_data.avg_ticket_value
    revenue_lost = potential_jobs_from_missed * input_data.avg_ticket_value
    monthly_loss = revenue_lost
    annual_loss = monthly_loss * 12
    
    # Improvement projections (assume 80% answer rate with AI agent)
    improved_answer_rate = 80.0
    improved_calls_answered = int(total_calls_per_month * (improved_answer_rate / 100))
    additional_calls_answered = improved_calls_answered - calls_answered
    additional_jobs = int(additional_calls_answered * conversion_decimal)
    additional_revenue = additional_jobs * input_data.avg_ticket_value
    
    # ROI calculation (assume $500/month for AI agent)
    monthly_cost = 500
    roi_percentage = ((additional_revenue - monthly_cost) / monthly_cost * 100) if monthly_cost > 0 else 0
    
    # Performance vs industry
    industry_avg = benchmark["avg_answer_rate"]
    if input_data.current_answer_rate >= industry_avg:
        performance = "Above average"
    elif input_data.current_answer_rate >= industry_avg - 10:
        performance = "Average"
    else:
        performance = "Below average"
    
    # Lead scoring
    lead_score, lead_tier = calculate_lead_score(
        monthly_loss=monthly_loss,
        has_email=bool(input_data.email),
        has_phone=bool(input_data.phone)
    )
    
    # Generate session ID if not provided
    session_id = input_data.session_id or str(uuid.uuid4())
    
    return CalculatorResult(
        # Core metrics
        total_calls_per_month=total_calls_per_month,
        calls_answered=calls_answered,
        calls_missed=calls_missed,
        missed_call_percentage=round(missed_percentage, 1),
        
        # Revenue calculations
        potential_jobs_from_answered=potential_jobs_from_answered,
        potential_jobs_from_missed=potential_jobs_from_missed,
        revenue_captured=round(revenue_captured, 2),
        revenue_lost=round(revenue_lost, 2),
        monthly_loss=round(monthly_loss, 2),
        annual_loss=round(annual_loss, 2),
        
        # Improvement projections
        improved_answer_rate=improved_answer_rate,
        additional_calls_answered=additional_calls_answered,
        additional_revenue=round(additional_revenue, 2),
        roi_percentage=round(roi_percentage, 1),
        
        # Benchmarks
        industry_average_answer_rate=industry_avg,
        your_performance_vs_industry=performance,
        
        # Lead scoring
        lead_score=lead_score,
        lead_tier=lead_tier,
        
        # Metadata
        calculated_at=datetime.now(timezone.utc),
        session_id=session_id,
        input_data=input_data.dict()
    )


def calculate_roi(
    monthly_loss: float,
    monthly_cost: float = 500,
    improvement_rate: float = 0.65
) -> Dict[str, float]:
    """
    Calculate ROI for implementing AI agent
    
    Args:
        monthly_loss: Current monthly revenue lost
        monthly_cost: Cost of AI agent solution
        improvement_rate: Expected improvement (default 65% of missed calls recovered)
    
    Returns:
        Dict with ROI metrics
    """
    
    monthly_recovery = monthly_loss * improvement_rate
    monthly_net_gain = monthly_recovery - monthly_cost
    roi_percentage = (monthly_net_gain / monthly_cost * 100) if monthly_cost > 0 else 0
    payback_months = (monthly_cost / monthly_net_gain) if monthly_net_gain > 0 else 999
    
    return {
        "monthly_recovery": round(monthly_recovery, 2),
        "monthly_net_gain": round(monthly_net_gain, 2),
        "roi_percentage": round(roi_percentage, 1),
        "payback_months": round(payback_months, 1),
        "annual_net_gain": round(monthly_net_gain * 12, 2),
    }


def calculate_lead_score(
    monthly_loss: float,
    has_email: bool = False,
    has_phone: bool = False,
    viewed_full_report: bool = False,
    downloaded_pdf: bool = False,
    clicked_cta: bool = False,
    returned_to_site: bool = False,
    email_opened: bool = False
) -> Tuple[float, str]:
    """
    Calculate lead score based on engagement and value
    
    Formula from Admintoolplan.md:
    Base Score = monthly_loss / 1000
    
    Multipliers:
      + Provided email: ×1.5
      + Provided phone: ×1.5
      + Viewed full report: ×1.2
      + Downloaded PDF: ×1.3
      + Clicked CTA: ×2.0
      + Returned to site: ×1.5
      + Opened email: ×1.2
    
    Tiers:
      90+: Hot (call within 24 hours)
      60-89: Warm (email sequence + call within week)
      30-59: Qualified (nurture sequence)
      <30: Cold (passive content only)
    """
    
    # Base score
    base_score = monthly_loss / 1000
    
    # Apply multipliers
    multiplier = 1.0
    if has_email:
        multiplier *= 1.5
    if has_phone:
        multiplier *= 1.5
    if viewed_full_report:
        multiplier *= 1.2
    if downloaded_pdf:
        multiplier *= 1.3
    if clicked_cta:
        multiplier *= 2.0
    if returned_to_site:
        multiplier *= 1.5
    if email_opened:
        multiplier *= 1.2
    
    final_score = base_score * multiplier
    
    # Determine tier
    if final_score >= 90:
        tier = "Hot"
    elif final_score >= 60:
        tier = "Warm"
    elif final_score >= 30:
        tier = "Qualified"
    else:
        tier = "Cold"
    
    return round(final_score, 1), tier


def update_lead_score(
    current_score: float,
    monthly_loss: float,
    **engagement_flags
) -> Tuple[float, str]:
    """
    Recalculate lead score when engagement changes
    
    Args:
        current_score: Current lead score
        monthly_loss: Monthly loss value
        **engagement_flags: Boolean flags for engagement (viewed_full_report, etc.)
    
    Returns:
        Updated score and tier
    """
    return calculate_lead_score(monthly_loss=monthly_loss, **engagement_flags)
