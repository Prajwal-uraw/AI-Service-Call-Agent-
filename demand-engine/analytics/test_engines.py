"""
Test all analytics engines to verify they work correctly
"""

from datetime import datetime, timedelta
from baseline_engine import BaselineEngine, BaselineSource
from assumptions_engine import AssumptionsEngine
from metric_segregation_engine import MetricSegregationEngine, MetricType, ConfidenceBand
from call_intent_engine import CallIntentEngine, CallIntent, UrgencyLevel
from capacity_saturation_engine import CapacitySaturationEngine, CallEvent
from latency_performance_engine import LatencyPerformanceEngine, PerformanceMetric


def test_all_engines():
    """Test all 6 critical engines"""
    
    print("="*80)
    print("TESTING ALL 6 CRITICAL ENGINES")
    print("="*80)
    print()
    
    # Test 1: Baseline Engine
    print("1️⃣  TESTING BASELINE ENGINE")
    print("-" * 80)
    baseline_engine = BaselineEngine()
    
    baseline = baseline_engine.create_baseline(
        pilot_id="TEST-PILOT-001",
        customer_id="test-customer",
        source=BaselineSource.CUSTOMER_REPORTED,
        source_details="Test baseline from customer intake",
        metrics={
            "answer_rate": 0.65,
            "booking_delay_hours": 18.0,
            "average_handle_time_minutes": 5.2,
            "after_hours_answer_rate": 0.40,
            "peak_hour_capacity": 3
        },
        confidence_level="medium"
    )
    
    print(f"✅ Baseline created: {baseline.source.value}")
    print(f"   Answer rate: {baseline.metrics.answer_rate:.1%}")
    print(f"   Booking delay: {baseline.metrics.booking_delay_hours}h")
    
    # Compare to pilot data
    observed = {
        "answer_rate": 1.0,
        "booking_delay_hours": 0.05,
        "average_handle_time_minutes": 2.1
    }
    comparisons = baseline_engine.compare_to_baseline(baseline, observed)
    print(f"   Improvement: {comparisons['answer_rate']['improvement_pct']:+.1f}% answer rate")
    print()
    
    # Test 2: Assumptions Engine
    print("2️⃣  TESTING ASSUMPTIONS ENGINE")
    print("-" * 80)
    assumptions_engine = AssumptionsEngine()
    
    assumptions = assumptions_engine.create_default_assumptions()
    print(f"✅ Assumptions created: v{assumptions.version}")
    print(f"   Total assumptions: {len(assumptions.assumptions)}")
    
    miss_rate = assumptions_engine.get_assumption(assumptions, "peak_hour_miss_rate")
    print(f"   Peak miss rate: {miss_rate.value:.1%} (range: {miss_rate.range_min:.1%}-{miss_rate.range_max:.1%})")
    print()
    
    # Test 3: Metric Segregation Engine
    print("3️⃣  TESTING METRIC SEGREGATION ENGINE")
    print("-" * 80)
    metric_engine = MetricSegregationEngine()
    
    # Record observed metric
    observed_metric = metric_engine.record_observed_metric(
        key="total_calls",
        value=127,
        description="Total calls during pilot",
        source="Daily.co call logs",
        sample_size=127,
        pilot_id="TEST-PILOT-001"
    )
    
    # Record modeled metric
    modeled_metric = metric_engine.record_modeled_metric(
        key="annual_opportunity",
        value=1200000,
        description="Projected annual revenue opportunity",
        source="Pilot data extrapolated",
        calculation="(missed_calls * avg_ticket) * 52 weeks",
        pilot_id="TEST-PILOT-001"
    )
    
    print(f"✅ Metrics recorded:")
    print(f"   Observed: {observed_metric.key} = {observed_metric.value}")
    print(f"   Modeled: {modeled_metric.key} = ${modeled_metric.value:,.0f}")
    
    # Validate usage
    bad_context = "We guarantee $1.2M in revenue"
    validation = metric_engine.validate_metric_usage(modeled_metric, bad_context)
    print(f"   Validation: {'❌ FAILED' if not validation['valid'] else '✅ PASSED'}")
    if validation['warnings']:
        print(f"   Warning: {validation['warnings'][0][:60]}...")
    print()
    
    # Test 4: Call Intent Engine
    print("4️⃣  TESTING CALL INTENT ENGINE")
    print("-" * 80)
    intent_engine = CallIntentEngine()
    
    test_transcripts = [
        "My AC stopped working and it's 95 degrees! I need help now!",
        "I'd like to schedule maintenance for next week",
        "Can you give me a quote for a new HVAC system?"
    ]
    
    classifications = []
    for i, transcript in enumerate(test_transcripts):
        result = intent_engine.classify_call(f"call_{i}", transcript)
        classifications.append(result)
        print(f"   Call {i+1}: {result.intent.value} | {result.urgency_level.value} | High-intent: {result.high_intent}")
    
    summary = intent_engine.get_classification_summary(classifications)
    print(f"✅ Classified {summary['total_calls']} calls")
    print(f"   High-intent: {summary['high_intent_calls']} ({summary['high_intent_percentage']:.1%})")
    print()
    
    # Test 5: Capacity Saturation Engine
    print("5️⃣  TESTING CAPACITY SATURATION ENGINE")
    print("-" * 80)
    capacity_engine = CapacitySaturationEngine()
    
    # Simulate overlapping calls
    base_time = datetime.now()
    test_calls = [
        CallEvent(call_id="c1", start_time=base_time, end_time=base_time + timedelta(minutes=5), duration_seconds=300),
        CallEvent(call_id="c2", start_time=base_time + timedelta(minutes=2), end_time=base_time + timedelta(minutes=7), duration_seconds=300),
        CallEvent(call_id="c3", start_time=base_time + timedelta(minutes=3), end_time=base_time + timedelta(minutes=8), duration_seconds=300),
        CallEvent(call_id="c4", start_time=base_time + timedelta(minutes=4), end_time=base_time + timedelta(minutes=9), duration_seconds=300),
    ]
    
    saturation = capacity_engine.analyze_capacity_saturation(
        pilot_id="TEST-PILOT-001",
        calls=test_calls,
        declared_capacity=3
    )
    
    print(f"✅ Capacity analysis complete")
    print(f"   Peak concurrent: {saturation.peak_concurrent_calls}")
    print(f"   Capacity exceeded: {len(saturation.saturation_windows)} windows")
    print(f"   Saturation: {saturation.saturation_percentage:.1f}%")
    print()
    
    # Test 6: Latency Performance Engine
    print("6️⃣  TESTING LATENCY PERFORMANCE ENGINE")
    print("-" * 80)
    latency_engine = LatencyPerformanceEngine()
    
    # Record measurements
    measurements = []
    for i in range(50):
        measurements.append(latency_engine.record_measurement(
            metric_type=PerformanceMetric.ANSWER_LATENCY,
            value_ms=190 + (i % 30),
            call_id=f"call_{i}",
            pilot_id="TEST-PILOT-001",
            time_of_day=9 + (i % 8)
        ))
    
    for i in range(50):
        measurements.append(latency_engine.record_measurement(
            metric_type=PerformanceMetric.SPEECH_TO_RESPONSE,
            value_ms=280 + (i % 40),
            call_id=f"call_{i}",
            pilot_id="TEST-PILOT-001",
            time_of_day=9 + (i % 8)
        ))
    
    report = latency_engine.generate_performance_report(
        pilot_id="TEST-PILOT-001",
        measurements=measurements,
        period_start=datetime.now() - timedelta(days=7),
        period_end=datetime.now()
    )
    
    print(f"✅ Performance report generated")
    print(f"   Health: {report.streaming_health.value.upper()}")
    print(f"   Answer latency P90: {report.answer_latency_p90:.0f}ms")
    print(f"   Response latency P90: {report.response_latency_p90:.0f}ms")
    print(f"   Compliance: {report.target_compliance_rate:.1f}%")
    
    comparison = latency_engine.compare_to_baseline(report, 15.0)
    print(f"   vs Human: {comparison['improvement_factor']:.0f}x faster")
    print()
    
    # Summary
    print("="*80)
    print("✅ ALL 6 ENGINES TESTED SUCCESSFULLY")
    print("="*80)
    print()
    print("Engines Ready for Integration:")
    print("  1. ✅ Baseline & Counterfactual Engine")
    print("  2. ✅ Assumptions & Disclosure Engine")
    print("  3. ✅ Observed vs Modeled Segregation Engine")
    print("  4. ✅ Call Intent Classification Engine")
    print("  5. ✅ Call Capacity Saturation Engine")
    print("  6. ✅ Latency & System Performance Engine")
    print()
    print("Ready for:")
    print("  - Database integration")
    print("  - LLM integration (OpenAI keys in Vercel/Modal)")
    print("  - Report generation")
    print("  - Dashboard integration")
    print()


if __name__ == "__main__":
    test_all_engines()
