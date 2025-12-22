"""
Test script for calculator engine - Local execution
Run this to test calculator logic without API
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from calculator.engine import calculate_missed_call_tax, calculate_roi, calculate_lead_score
from calculator.models import CalculatorInput, BusinessType


def test_basic_calculation():
    """Test basic calculator functionality"""
    print("\n" + "="*60)
    print("TEST 1: Basic HVAC Calculation")
    print("="*60)
    
    # Sample input
    input_data = CalculatorInput(
        business_type=BusinessType.HVAC,
        avg_ticket_value=2500,
        calls_per_day=30,
        current_answer_rate=65,
        hours_open_per_day=8,
        days_open_per_week=5,
        conversion_rate=30,
        email="test@example.com",
        company_name="Test HVAC Co"
    )
    
    # Calculate
    result = calculate_missed_call_tax(input_data)
    
    # Display results
    print(f"\n📊 RESULTS:")
    print(f"   Total calls/month: {result.total_calls_per_month}")
    print(f"   Calls answered: {result.calls_answered}")
    print(f"   Calls missed: {result.calls_missed} ({result.missed_call_percentage}%)")
    print(f"\n💰 REVENUE:")
    print(f"   Revenue captured: ${result.revenue_captured:,.2f}")
    print(f"   Revenue lost: ${result.revenue_lost:,.2f}")
    print(f"   Monthly loss: ${result.monthly_loss:,.2f}")
    print(f"   Annual loss: ${result.annual_loss:,.2f}")
    print(f"\n📈 WITH AI AGENT:")
    print(f"   Improved answer rate: {result.improved_answer_rate}%")
    print(f"   Additional calls answered: {result.additional_calls_answered}")
    print(f"   Additional revenue: ${result.additional_revenue:,.2f}")
    print(f"   ROI: {result.roi_percentage}%")
    print(f"\n🎯 LEAD SCORING:")
    print(f"   Lead score: {result.lead_score}")
    print(f"   Lead tier: {result.lead_tier}")
    print(f"   Performance: {result.your_performance_vs_industry}")
    
    assert result.total_calls_per_month > 0, "Should have calls"
    assert result.monthly_loss > 0, "Should have revenue loss"
    assert result.lead_tier in ["Hot", "Warm", "Qualified", "Cold"], "Should have valid tier"
    
    print("\n✅ Test 1 passed!")
    return result


def test_high_value_lead():
    """Test high-value lead calculation"""
    print("\n" + "="*60)
    print("TEST 2: High-Value Lead (Low Answer Rate)")
    print("="*60)
    
    input_data = CalculatorInput(
        business_type=BusinessType.PLUMBING,
        avg_ticket_value=5000,
        calls_per_day=50,
        current_answer_rate=40,  # Very low
        email="highvalue@example.com",
        phone="555-1234"
    )
    
    result = calculate_missed_call_tax(input_data)
    
    print(f"\n💰 HIGH-VALUE METRICS:")
    print(f"   Monthly loss: ${result.monthly_loss:,.2f}")
    print(f"   Annual loss: ${result.annual_loss:,.2f}")
    print(f"   Lead score: {result.lead_score}")
    print(f"   Lead tier: {result.lead_tier}")
    
    # High value + email + phone should be Hot or Warm
    assert result.lead_score >= 30, "High-value lead should have good score"
    assert result.monthly_loss > 50000, "Should have significant loss"
    
    print("\n✅ Test 2 passed!")
    return result


def test_low_value_lead():
    """Test low-value lead calculation"""
    print("\n" + "="*60)
    print("TEST 3: Low-Value Lead (High Answer Rate)")
    print("="*60)
    
    input_data = CalculatorInput(
        business_type=BusinessType.ELECTRICAL,
        avg_ticket_value=500,
        calls_per_day=10,
        current_answer_rate=85,  # Already good
    )
    
    result = calculate_missed_call_tax(input_data)
    
    print(f"\n💰 LOW-VALUE METRICS:")
    print(f"   Monthly loss: ${result.monthly_loss:,.2f}")
    print(f"   Lead score: {result.lead_score}")
    print(f"   Lead tier: {result.lead_tier}")
    print(f"   Performance: {result.your_performance_vs_industry}")
    
    # Low loss, no contact info = Cold
    assert result.lead_tier in ["Cold", "Qualified"], "Low-value should be cold/qualified"
    assert result.monthly_loss < 10000, "Should have low loss"
    
    print("\n✅ Test 3 passed!")
    return result


def test_roi_calculation():
    """Test ROI calculation separately"""
    print("\n" + "="*60)
    print("TEST 4: ROI Calculation")
    print("="*60)
    
    monthly_loss = 15000
    monthly_cost = 500
    
    roi_data = calculate_roi(monthly_loss, monthly_cost, improvement_rate=0.65)
    
    print(f"\n📊 ROI METRICS:")
    print(f"   Monthly loss: ${monthly_loss:,.2f}")
    print(f"   Monthly cost: ${monthly_cost:,.2f}")
    print(f"   Monthly recovery: ${roi_data['monthly_recovery']:,.2f}")
    print(f"   Monthly net gain: ${roi_data['monthly_net_gain']:,.2f}")
    print(f"   ROI percentage: {roi_data['roi_percentage']}%")
    print(f"   Payback period: {roi_data['payback_months']} months")
    print(f"   Annual net gain: ${roi_data['annual_net_gain']:,.2f}")
    
    assert roi_data['monthly_recovery'] > 0, "Should have recovery"
    assert roi_data['roi_percentage'] > 0, "Should have positive ROI"
    
    print("\n✅ Test 4 passed!")
    return roi_data


def test_lead_scoring():
    """Test lead scoring with different engagement levels"""
    print("\n" + "="*60)
    print("TEST 5: Lead Scoring with Engagement")
    print("="*60)
    
    monthly_loss = 10000
    
    # Base score (no engagement)
    score1, tier1 = calculate_lead_score(monthly_loss)
    print(f"\n   No engagement: Score={score1}, Tier={tier1}")
    
    # With email
    score2, tier2 = calculate_lead_score(monthly_loss, has_email=True)
    print(f"   + Email: Score={score2}, Tier={tier2}")
    
    # With email + phone
    score3, tier3 = calculate_lead_score(monthly_loss, has_email=True, has_phone=True)
    print(f"   + Email + Phone: Score={score3}, Tier={tier3}")
    
    # Full engagement
    score4, tier4 = calculate_lead_score(
        monthly_loss,
        has_email=True,
        has_phone=True,
        viewed_full_report=True,
        downloaded_pdf=True,
        clicked_cta=True
    )
    print(f"   + Full engagement: Score={score4}, Tier={tier4}")
    
    # Scores should increase with engagement
    assert score2 > score1, "Email should increase score"
    assert score3 > score2, "Phone should increase score"
    assert score4 > score3, "Engagement should increase score"
    
    print("\n✅ Test 5 passed!")


def test_all_business_types():
    """Test all business types"""
    print("\n" + "="*60)
    print("TEST 6: All Business Types")
    print("="*60)
    
    for business_type in BusinessType:
        input_data = CalculatorInput(
            business_type=business_type,
            avg_ticket_value=2000,
            calls_per_day=25,
            current_answer_rate=60
        )
        
        result = calculate_missed_call_tax(input_data)
        
        print(f"\n   {business_type.value}:")
        print(f"      Industry avg: {result.industry_average_answer_rate}%")
        print(f"      Monthly loss: ${result.monthly_loss:,.2f}")
        print(f"      Performance: {result.your_performance_vs_industry}")
        
        assert result.monthly_loss > 0, f"{business_type} should have loss"
    
    print("\n✅ Test 6 passed!")


def run_all_tests():
    """Run all calculator tests"""
    print("\n" + "="*60)
    print("CALCULATOR ENGINE TEST SUITE")
    print("="*60)
    
    try:
        test_basic_calculation()
        test_high_value_lead()
        test_low_value_lead()
        test_roi_calculation()
        test_lead_scoring()
        test_all_business_types()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\nCalculator engine is working correctly.")
        print("Ready for API integration and frontend development.")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
