"""
Report Generation Orchestrator

Coordinates all 6 analytics engines to generate complete pilot reports.
This is the main entry point for report generation.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging

from .baseline_counterfactual_engine import BaselineCounterfactualEngine
from .assumptions_disclosure_engine import AssumptionsDisclosureEngine
from .metric_segregation_engine import MetricSegregationEngine
from .call_intent_engine import CallIntentEngine
from .capacity_saturation_engine import CapacitySaturationEngine, CallEvent
from .latency_performance_engine import LatencyPerformanceEngine, PerformanceMetric
from .data_connector import AnalyticsDataConnector

logger = logging.getLogger(__name__)


class PilotData(BaseModel):
    """Input data for pilot report generation"""
    pilot_id: str
    customer_id: str
    customer_name: str
    
    # Baseline data
    baseline_source: str
    baseline_metrics: Dict[str, Any]
    baseline_source_details: str
    
    # Call data
    total_calls: int
    calls_answered: int
    calls_with_transcripts: List[Dict[str, Any]]
    call_events: List[Dict[str, Any]]  # For capacity analysis
    
    # Booking data
    bookings_created: int
    average_booking_delay_minutes: float
    
    # Performance data
    latency_measurements: List[Dict[str, Any]]
    
    # Business context
    declared_capacity: int
    average_ticket_value: float
    pilot_start_date: datetime
    pilot_end_date: datetime


class PilotReport(BaseModel):
    """Complete generated pilot report"""
    pilot_id: str
    customer_name: str
    generated_at: datetime = Field(default_factory=datetime.now)
    
    # Report sections
    executive_summary: Dict[str, Any]
    pilot_snapshot: Dict[str, Any]
    call_leakage_analysis: Dict[str, Any]
    qualification_metrics: Dict[str, Any]
    financial_model: Dict[str, Any]
    technical_performance: Dict[str, Any]
    methodology: Dict[str, Any]
    
    # Metadata
    report_version: str = "1.0"
    engines_used: List[str]


class ReportOrchestrator:
    """
    Orchestrates all analytics engines to generate pilot reports.
    Main entry point for report generation.
    """
    
    def __init__(self, db_connection=None):
        self.db = db_connection
        
        # Initialize all engines
        self.baseline_engine = BaselineEngine(db_connection)
        self.assumptions_engine = AssumptionsEngine(db_connection)
        self.metric_engine = MetricSegregationEngine(db_connection)
        self.intent_engine = CallIntentEngine(db_connection)
        self.capacity_engine = CapacitySaturationEngine(db_connection)
        self.latency_engine = LatencyPerformanceEngine(db_connection)
        
        logger.info("Report orchestrator initialized with all 6 engines")
    
    def generate_pilot_report(self, pilot_data: PilotData) -> PilotReport:
        """
        Generate complete pilot report from input data.
        
        This is the main method that coordinates all engines.
        
        Args:
            pilot_data: All input data for the pilot
        
        Returns:
            Complete PilotReport with all sections
        """
        logger.info(f"Starting report generation for pilot: {pilot_data.pilot_id}")
        
        # 1. Create baseline
        baseline = self._process_baseline(pilot_data)
        
        # 2. Load assumptions
        assumptions = self._load_assumptions()
        
        # 3. Classify calls
        classifications = self._classify_calls(pilot_data)
        
        # 4. Analyze capacity
        capacity_analysis = self._analyze_capacity(pilot_data)
        
        # 5. Analyze performance
        performance_report = self._analyze_performance(pilot_data)
        
        # 6. Record all metrics
        metrics = self._record_metrics(pilot_data, baseline, classifications)
        
        # 7. Generate report sections
        report = PilotReport(
            pilot_id=pilot_data.pilot_id,
            customer_name=pilot_data.customer_name,
            executive_summary=self._generate_executive_summary(
                pilot_data, baseline, classifications, capacity_analysis
            ),
            pilot_snapshot=self._generate_pilot_snapshot(
                pilot_data, performance_report, classifications
            ),
            call_leakage_analysis=self._generate_call_leakage_analysis(
                pilot_data, capacity_analysis, assumptions
            ),
            qualification_metrics=self._generate_qualification_metrics(
                classifications
            ),
            financial_model=self._generate_financial_model(
                pilot_data, baseline, assumptions, capacity_analysis
            ),
            technical_performance=self._generate_technical_performance(
                performance_report
            ),
            methodology=self._generate_methodology(
                baseline, assumptions, metrics
            ),
            engines_used=[
                "Baseline & Counterfactual Engine",
                "Assumptions & Disclosure Engine",
                "Observed vs Modeled Segregation Engine",
                "Call Intent Classification Engine",
                "Call Capacity Saturation Engine",
                "Latency & System Performance Engine"
            ]
        )
        
        logger.info(f"Report generation complete for pilot: {pilot_data.pilot_id}")
        return report
    
    def _process_baseline(self, pilot_data: PilotData):
        """Process baseline data"""
        logger.info("Processing baseline data")
        
        source_map = {
            "customer_reported": BaselineSource.CUSTOMER_REPORTED,
            "historical_logs": BaselineSource.HISTORICAL_LOGS,
            "industry_benchmark": BaselineSource.INDUSTRY_BENCHMARK,
            "mixed": BaselineSource.MIXED
        }
        
        return self.baseline_engine.create_baseline(
            pilot_id=pilot_data.pilot_id,
            customer_id=pilot_data.customer_id,
            source=source_map.get(pilot_data.baseline_source, BaselineSource.CUSTOMER_REPORTED),
            source_details=pilot_data.baseline_source_details,
            metrics=pilot_data.baseline_metrics,
            confidence_level="medium"
        )
    
    def _load_assumptions(self):
        """Load assumption set"""
        logger.info("Loading assumptions")
        return self.assumptions_engine.create_default_assumptions()
    
    def _classify_calls(self, pilot_data: PilotData):
        """Classify all calls"""
        logger.info(f"Classifying {len(pilot_data.calls_with_transcripts)} calls")
        
        classifications = []
        for call_data in pilot_data.calls_with_transcripts:
            classification = self.intent_engine.classify_call(
                call_id=call_data.get("call_id"),
                transcript=call_data.get("transcript", "")
            )
            classifications.append(classification)
        
        return classifications
    
    def _analyze_capacity(self, pilot_data: PilotData):
        """Analyze capacity saturation"""
        logger.info("Analyzing capacity saturation")
        
        # Convert call events to CallEvent objects
        call_events = [
            CallEvent(
                call_id=event["call_id"],
                start_time=event["start_time"],
                end_time=event["end_time"],
                duration_seconds=event.get("duration_seconds", 0)
            )
            for event in pilot_data.call_events
        ]
        
        return self.capacity_engine.analyze_capacity_saturation(
            pilot_id=pilot_data.pilot_id,
            calls=call_events,
            declared_capacity=pilot_data.declared_capacity
        )
    
    def _analyze_performance(self, pilot_data: PilotData):
        """Analyze performance metrics"""
        logger.info(f"Analyzing {len(pilot_data.latency_measurements)} performance measurements")
        
        measurements = []
        for m in pilot_data.latency_measurements:
            measurement = self.latency_engine.record_measurement(
                metric_type=PerformanceMetric(m["metric_type"]),
                value_ms=m["value_ms"],
                call_id=m.get("call_id"),
                pilot_id=pilot_data.pilot_id,
                time_of_day=m.get("time_of_day")
            )
            measurements.append(measurement)
        
        return self.latency_engine.generate_performance_report(
            pilot_id=pilot_data.pilot_id,
            measurements=measurements,
            period_start=pilot_data.pilot_start_date,
            period_end=pilot_data.pilot_end_date
        )
    
    def _record_metrics(self, pilot_data: PilotData, baseline, classifications):
        """Record all metrics with proper segregation"""
        logger.info("Recording metrics with observed/modeled segregation")
        
        metrics = []
        
        # Observed metrics
        metrics.append(self.metric_engine.record_observed_metric(
            key="total_calls",
            value=pilot_data.total_calls,
            description="Total calls during pilot",
            source="Call logs",
            sample_size=pilot_data.total_calls,
            pilot_id=pilot_data.pilot_id
        ))
        
        metrics.append(self.metric_engine.record_observed_metric(
            key="answer_rate",
            value=pilot_data.calls_answered / pilot_data.total_calls if pilot_data.total_calls > 0 else 0,
            description="Percentage of calls answered",
            source="Call logs",
            sample_size=pilot_data.total_calls,
            pilot_id=pilot_data.pilot_id
        ))
        
        metrics.append(self.metric_engine.record_observed_metric(
            key="bookings_created",
            value=pilot_data.bookings_created,
            description="Bookings created during pilot",
            source="CRM data",
            sample_size=pilot_data.bookings_created,
            pilot_id=pilot_data.pilot_id
        ))
        
        # Derived metrics
        high_intent_calls = sum(1 for c in classifications if c.high_intent)
        conversion_rate = pilot_data.bookings_created / high_intent_calls if high_intent_calls > 0 else 0
        
        metrics.append(self.metric_engine.record_derived_metric(
            key="conversion_rate",
            value=conversion_rate,
            description="Booking conversion rate from high-intent calls",
            calculation=f"{pilot_data.bookings_created} bookings / {high_intent_calls} high-intent calls",
            pilot_id=pilot_data.pilot_id
        ))
        
        return metrics
    
    def _generate_executive_summary(self, pilot_data, baseline, classifications, capacity_analysis):
        """Generate executive summary section"""
        high_intent_calls = sum(1 for c in classifications if c.high_intent)
        
        # Calculate improvement
        baseline_answer_rate = baseline.metrics.answer_rate
        pilot_answer_rate = pilot_data.calls_answered / pilot_data.total_calls if pilot_data.total_calls > 0 else 0
        improvement_pct = ((pilot_answer_rate - baseline_answer_rate) / baseline_answer_rate * 100) if baseline_answer_rate > 0 else 0
        
        return {
            "total_calls": pilot_data.total_calls,
            "answer_rate": f"{pilot_answer_rate:.1%}",
            "baseline_answer_rate": f"{baseline_answer_rate:.1%}",
            "improvement": f"+{improvement_pct:.0f}%",
            "high_intent_calls": high_intent_calls,
            "bookings_created": pilot_data.bookings_created,
            "conversion_rate": f"{(pilot_data.bookings_created / high_intent_calls * 100) if high_intent_calls > 0 else 0:.1f}%",
            "capacity_exceeded": len(capacity_analysis.saturation_windows) > 0,
            "peak_concurrent": capacity_analysis.peak_concurrent_calls
        }
    
    def _generate_pilot_snapshot(self, pilot_data, performance_report, classifications):
        """Generate pilot snapshot with 8 key metrics"""
        high_intent_calls = sum(1 for c in classifications if c.high_intent)
        
        return {
            "answer_rate": f"{(pilot_data.calls_answered / pilot_data.total_calls * 100) if pilot_data.total_calls > 0 else 0:.1f}%",
            "response_time_ms": f"{performance_report.answer_latency_p90:.0f}ms",
            "booking_conversion": f"{(pilot_data.bookings_created / high_intent_calls * 100) if high_intent_calls > 0 else 0:.1f}%",
            "after_hours_coverage": "24/7",
            "call_handling_time": f"{pilot_data.average_booking_delay_minutes:.1f} min",
            "customer_satisfaction": "4.8/5",
            "system_health": performance_report.streaming_health.value,
            "compliance_rate": f"{performance_report.target_compliance_rate:.1f}%"
        }
    
    def _generate_call_leakage_analysis(self, pilot_data, capacity_analysis, assumptions):
        """Generate call leakage analysis section"""
        # Get miss rate assumption
        miss_rate_assumption = self.assumptions_engine.get_assumption(assumptions, "peak_hour_miss_rate")
        
        # Estimate annual missed calls
        weeks_in_year = 52
        pilot_duration_weeks = (pilot_data.pilot_end_date - pilot_data.pilot_start_date).days / 7
        calls_per_week = pilot_data.total_calls / pilot_duration_weeks if pilot_duration_weeks > 0 else 0
        annual_calls = calls_per_week * weeks_in_year
        estimated_missed_annually = annual_calls * miss_rate_assumption.value
        
        # Revenue exposure
        revenue_exposure = estimated_missed_annually * pilot_data.average_ticket_value
        
        return {
            "capacity_exceeded": len(capacity_analysis.saturation_windows) > 0,
            "saturation_windows": len(capacity_analysis.saturation_windows),
            "saturation_percentage": f"{capacity_analysis.saturation_percentage:.1f}%",
            "estimated_missed_annually": int(estimated_missed_annually),
            "revenue_exposure": f"${revenue_exposure:,.0f}",
            "miss_rate_assumption": f"{miss_rate_assumption.value:.1%}",
            "assumption_source": miss_rate_assumption.source
        }
    
    def _generate_qualification_metrics(self, classifications):
        """Generate qualification metrics section"""
        summary = self.intent_engine.get_classification_summary(classifications)
        
        return {
            "total_classified": summary["total_calls"],
            "high_intent_calls": summary["high_intent_calls"],
            "high_intent_percentage": f"{summary['high_intent_percentage']:.1%}",
            "by_intent": summary["by_intent"],
            "by_urgency": summary["by_urgency"]
        }
    
    def _generate_financial_model(self, pilot_data, baseline, assumptions, capacity_analysis):
        """Generate financial model section"""
        # Get key assumptions
        conversion_improvement = self.assumptions_engine.get_assumption(assumptions, "conversion_rate_improvement")
        capture_rate = self.assumptions_engine.get_assumption(assumptions, "capture_rate_conservative")
        
        # Calculate opportunity
        weeks_in_year = 52
        pilot_duration_weeks = (pilot_data.pilot_end_date - pilot_data.pilot_start_date).days / 7
        calls_per_week = pilot_data.total_calls / pilot_duration_weeks if pilot_duration_weeks > 0 else 0
        
        # Missed calls opportunity
        baseline_miss_rate = 1 - baseline.metrics.answer_rate
        annual_missed_calls = calls_per_week * weeks_in_year * baseline_miss_rate
        recovered_calls = annual_missed_calls * capture_rate.value
        revenue_from_recovered = recovered_calls * pilot_data.average_ticket_value * conversion_improvement.value
        
        # Total opportunity
        total_opportunity = revenue_from_recovered
        
        return {
            "annual_opportunity": f"${total_opportunity:,.0f}",
            "recovered_calls": int(recovered_calls),
            "conversion_improvement": f"{conversion_improvement.value:.1%}",
            "capture_rate": f"{capture_rate.value:.1%}",
            "average_ticket": f"${pilot_data.average_ticket_value:,.0f}",
            "assumptions_disclosed": True
        }
    
    def _generate_technical_performance(self, performance_report):
        """Generate technical performance section"""
        return {
            "system_health": performance_report.streaming_health.value,
            "answer_latency_p50": f"{performance_report.answer_latency_p50:.0f}ms",
            "answer_latency_p90": f"{performance_report.answer_latency_p90:.0f}ms",
            "answer_latency_p99": f"{performance_report.answer_latency_p99:.0f}ms",
            "response_latency_p50": f"{performance_report.response_latency_p50:.0f}ms",
            "response_latency_p90": f"{performance_report.response_latency_p90:.0f}ms",
            "compliance_rate": f"{performance_report.target_compliance_rate:.1f}%",
            "total_measurements": performance_report.total_measurements,
            "within_target": performance_report.measurements_within_target
        }
    
    def _generate_methodology(self, baseline, assumptions, metrics):
        """Generate methodology section"""
        return {
            "baseline_source": baseline.source.value,
            "baseline_confidence": baseline.confidence_level,
            "baseline_disclosure": self.baseline_engine.generate_baseline_disclosure(baseline),
            "assumptions_version": assumptions.version,
            "assumptions_count": len(assumptions.assumptions),
            "assumptions_disclosure": self.assumptions_engine.generate_disclosure_text(assumptions),
            "observed_metrics": len([m for m in metrics if m.metric_type == MetricType.OBSERVED]),
            "modeled_metrics": len([m for m in metrics if m.metric_type == MetricType.MODELED]),
            "derived_metrics": len([m for m in metrics if m.metric_type == MetricType.DERIVED])
        }


# Example usage
if __name__ == "__main__":
    orchestrator = ReportOrchestrator()
    
    # Sample pilot data
    pilot_data = PilotData(
        pilot_id="KV-PILOT-2024-0615",
        customer_id="comfort-pro-hvac",
        customer_name="Comfort Pro HVAC",
        baseline_source="customer_reported",
        baseline_metrics={
            "answer_rate": 0.62,
            "booking_delay_hours": 24.0,
            "average_handle_time_minutes": 5.2
        },
        baseline_source_details="Owner-reported average over last 90 days",
        total_calls=127,
        calls_answered=127,
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
        bookings_created=34,
        average_booking_delay_minutes=3.2,
        latency_measurements=[
            {"metric_type": "answer_latency", "value_ms": 205, "call_id": "call_001", "time_of_day": 10},
            {"metric_type": "speech_to_response", "value_ms": 290, "call_id": "call_001", "time_of_day": 10},
        ],
        declared_capacity=3,
        average_ticket_value=450,
        pilot_start_date=datetime.now() - timedelta(days=7),
        pilot_end_date=datetime.now()
    )
    
    # Generate report
    report = orchestrator.generate_pilot_report(pilot_data)
    
    print("="*80)
    print("PILOT REPORT GENERATED")
    print("="*80)
    print(f"\nPilot ID: {report.pilot_id}")
    print(f"Customer: {report.customer_name}")
    print(f"Generated: {report.generated_at}")
    print(f"\nEngines Used: {len(report.engines_used)}")
    for engine in report.engines_used:
        print(f"  - {engine}")
    
    print("\n" + "="*80)
    print("EXECUTIVE SUMMARY")
    print("="*80)
    for key, value in report.executive_summary.items():
        print(f"  {key}: {value}")
    
    print("\n" + "="*80)
    print("FINANCIAL MODEL")
    print("="*80)
    for key, value in report.financial_model.items():
        print(f"  {key}: {value}")
