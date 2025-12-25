"""
Latency & System Performance Engine

Purpose: Track and measure system performance claims (200ms latency)
Priority: HIGH VALUE (Moat Building)
Why: Executives trust systems that measure their own claims
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from statistics import mean, median
import math


class PerformanceMetric(str, Enum):
    """Types of performance metrics"""
    ANSWER_LATENCY = "answer_latency"  # Time to answer call
    SPEECH_TO_RESPONSE = "speech_to_response"  # Time to respond to speech
    BOOKING_EXECUTION = "booking_execution"  # Time to complete booking
    TRANSCRIPTION_LATENCY = "transcription_latency"  # Speech-to-text delay
    LLM_RESPONSE_TIME = "llm_response_time"  # AI processing time
    CRM_SYNC_TIME = "crm_sync_time"  # CRM integration latency


class PerformanceStatus(str, Enum):
    """Overall system health status"""
    EXCELLENT = "excellent"  # All metrics within target
    GOOD = "good"  # Most metrics within target
    DEGRADED = "degraded"  # Some metrics outside target
    CRITICAL = "critical"  # Major metrics failing


class LatencyMeasurement(BaseModel):
    """Single latency measurement"""
    metric_type: PerformanceMetric
    value_ms: float = Field(..., description="Latency in milliseconds")
    timestamp: datetime = Field(default_factory=datetime.now)
    call_id: Optional[str] = None
    pilot_id: Optional[str] = None
    
    # Context
    call_type: Optional[str] = None  # emergency, routine, etc.
    time_of_day: Optional[int] = None  # Hour 0-23
    
    # Metadata
    target_ms: Optional[float] = None  # Target latency for this metric
    within_target: bool = Field(default=True)


class PerformanceReport(BaseModel):
    """Aggregated performance report"""
    pilot_id: str
    period_start: datetime
    period_end: datetime
    
    # Answer latency stats
    answer_latency_p50: float = Field(..., description="Median answer latency (ms)")
    answer_latency_p90: float = Field(..., description="90th percentile answer latency (ms)")
    answer_latency_p99: float = Field(..., description="99th percentile answer latency (ms)")
    answer_latency_max: float = Field(..., description="Maximum answer latency (ms)")
    
    # Response latency stats
    response_latency_p50: float
    response_latency_p90: float
    response_latency_p99: float
    
    # Booking execution stats
    booking_latency_p50: Optional[float] = None
    booking_latency_p90: Optional[float] = None
    
    # Overall health
    streaming_health: PerformanceStatus
    total_measurements: int
    measurements_within_target: int
    target_compliance_rate: float
    
    # Detailed breakdown
    by_metric: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    by_hour: Dict[int, Dict[str, float]] = Field(default_factory=dict)
    
    generated_at: datetime = Field(default_factory=datetime.now)


class LatencyPerformanceEngine:
    """
    Tracks and analyzes system performance metrics.
    Proves marketing claims (200ms latency) with real data.
    """
    
    # Target latencies (in milliseconds)
    TARGETS = {
        PerformanceMetric.ANSWER_LATENCY: 200,
        PerformanceMetric.SPEECH_TO_RESPONSE: 300,
        PerformanceMetric.BOOKING_EXECUTION: 2000,
        PerformanceMetric.TRANSCRIPTION_LATENCY: 150,
        PerformanceMetric.LLM_RESPONSE_TIME: 500,
        PerformanceMetric.CRM_SYNC_TIME: 1000,
    }
    
    def __init__(self, db_connection=None):
        self.db = db_connection
    
    def record_measurement(
        self,
        metric_type: PerformanceMetric,
        value_ms: float,
        call_id: Optional[str] = None,
        pilot_id: Optional[str] = None,
        **kwargs
    ) -> LatencyMeasurement:
        """
        Record a single latency measurement.
        
        Args:
            metric_type: Type of performance metric
            value_ms: Measured latency in milliseconds
            call_id: Associated call ID
            pilot_id: Associated pilot ID
            **kwargs: Additional context (call_type, time_of_day, etc.)
        
        Returns:
            LatencyMeasurement object
        """
        target = self.TARGETS.get(metric_type)
        within_target = value_ms <= target if target else True
        
        measurement = LatencyMeasurement(
            metric_type=metric_type,
            value_ms=value_ms,
            call_id=call_id,
            pilot_id=pilot_id,
            target_ms=target,
            within_target=within_target,
            **kwargs
        )
        
        # Store in database
        if self.db:
            self._store_measurement(measurement)
        
        return measurement
    
    def _store_measurement(self, measurement: LatencyMeasurement) -> None:
        """Store measurement in database"""
        # Placeholder for actual DB logic
        pass
    
    def calculate_percentile(self, values: List[float], percentile: int) -> float:
        """
        Calculate percentile of a list of values.
        
        Args:
            values: List of numeric values
            percentile: Percentile to calculate (0-100)
        
        Returns:
            Percentile value
        """
        if not values:
            return 0.0
        
        sorted_values = sorted(values)
        index = (percentile / 100) * (len(sorted_values) - 1)
        
        if index.is_integer():
            return sorted_values[int(index)]
        else:
            lower = sorted_values[int(math.floor(index))]
            upper = sorted_values[int(math.ceil(index))]
            return lower + (upper - lower) * (index - math.floor(index))
    
    def generate_performance_report(
        self,
        pilot_id: str,
        measurements: List[LatencyMeasurement],
        period_start: datetime,
        period_end: datetime
    ) -> PerformanceReport:
        """
        Generate comprehensive performance report from measurements.
        
        Args:
            pilot_id: Pilot identifier
            measurements: List of latency measurements
            period_start: Start of measurement period
            period_end: End of measurement period
        
        Returns:
            PerformanceReport with aggregated statistics
        """
        if not measurements:
            # Return empty report
            return PerformanceReport(
                pilot_id=pilot_id,
                period_start=period_start,
                period_end=period_end,
                answer_latency_p50=0,
                answer_latency_p90=0,
                answer_latency_p99=0,
                answer_latency_max=0,
                response_latency_p50=0,
                response_latency_p90=0,
                response_latency_p99=0,
                streaming_health=PerformanceStatus.CRITICAL,
                total_measurements=0,
                measurements_within_target=0,
                target_compliance_rate=0.0
            )
        
        # Group measurements by type
        by_type: Dict[PerformanceMetric, List[float]] = {}
        for measurement in measurements:
            if measurement.metric_type not in by_type:
                by_type[measurement.metric_type] = []
            by_type[measurement.metric_type].append(measurement.value_ms)
        
        # Calculate answer latency percentiles
        answer_latencies = by_type.get(PerformanceMetric.ANSWER_LATENCY, [0])
        answer_p50 = self.calculate_percentile(answer_latencies, 50)
        answer_p90 = self.calculate_percentile(answer_latencies, 90)
        answer_p99 = self.calculate_percentile(answer_latencies, 99)
        answer_max = max(answer_latencies) if answer_latencies else 0
        
        # Calculate response latency percentiles
        response_latencies = by_type.get(PerformanceMetric.SPEECH_TO_RESPONSE, [0])
        response_p50 = self.calculate_percentile(response_latencies, 50)
        response_p90 = self.calculate_percentile(response_latencies, 90)
        response_p99 = self.calculate_percentile(response_latencies, 99)
        
        # Calculate booking latency percentiles (if available)
        booking_latencies = by_type.get(PerformanceMetric.BOOKING_EXECUTION, [])
        booking_p50 = self.calculate_percentile(booking_latencies, 50) if booking_latencies else None
        booking_p90 = self.calculate_percentile(booking_latencies, 90) if booking_latencies else None
        
        # Calculate compliance rate
        within_target = sum(1 for m in measurements if m.within_target)
        compliance_rate = (within_target / len(measurements)) * 100
        
        # Determine overall health
        if compliance_rate >= 95 and answer_p90 <= self.TARGETS[PerformanceMetric.ANSWER_LATENCY]:
            health = PerformanceStatus.EXCELLENT
        elif compliance_rate >= 85 and answer_p90 <= self.TARGETS[PerformanceMetric.ANSWER_LATENCY] * 1.2:
            health = PerformanceStatus.GOOD
        elif compliance_rate >= 70:
            health = PerformanceStatus.DEGRADED
        else:
            health = PerformanceStatus.CRITICAL
        
        # Build detailed breakdown by metric
        by_metric = {}
        for metric_type, values in by_type.items():
            by_metric[metric_type.value] = {
                "p50": self.calculate_percentile(values, 50),
                "p90": self.calculate_percentile(values, 90),
                "p99": self.calculate_percentile(values, 99),
                "max": max(values),
                "min": min(values),
                "mean": mean(values),
                "count": len(values)
            }
        
        # Build breakdown by hour
        by_hour: Dict[int, List[float]] = {}
        for measurement in measurements:
            if measurement.time_of_day is not None:
                hour = measurement.time_of_day
                if hour not in by_hour:
                    by_hour[hour] = []
                by_hour[hour].append(measurement.value_ms)
        
        by_hour_stats = {}
        for hour, values in by_hour.items():
            by_hour_stats[hour] = {
                "p50": self.calculate_percentile(values, 50),
                "p90": self.calculate_percentile(values, 90),
                "count": len(values)
            }
        
        return PerformanceReport(
            pilot_id=pilot_id,
            period_start=period_start,
            period_end=period_end,
            answer_latency_p50=answer_p50,
            answer_latency_p90=answer_p90,
            answer_latency_p99=answer_p99,
            answer_latency_max=answer_max,
            response_latency_p50=response_p50,
            response_latency_p90=response_p90,
            response_latency_p99=response_p99,
            booking_latency_p50=booking_p50,
            booking_latency_p90=booking_p90,
            streaming_health=health,
            total_measurements=len(measurements),
            measurements_within_target=within_target,
            target_compliance_rate=compliance_rate,
            by_metric=by_metric,
            by_hour=by_hour_stats
        )
    
    def generate_report_section(self, report: PerformanceReport) -> str:
        """
        Generate human-readable report section for pilot reports.
        
        Args:
            report: PerformanceReport object
        
        Returns:
            Formatted markdown report section
        """
        section = "## Technical Performance Metrics\n\n"
        
        section += f"**System Health:** {report.streaming_health.value.title()}\n"
        section += f"**Measurement Period:** {report.period_start.strftime('%Y-%m-%d')} to {report.period_end.strftime('%Y-%m-%d')}\n"
        section += f"**Total Measurements:** {report.total_measurements:,}\n\n"
        
        section += "### Answer Latency (Time to Pick Up Call)\n\n"
        section += f"- **Median (P50):** {report.answer_latency_p50:.0f}ms\n"
        section += f"- **90th Percentile (P90):** {report.answer_latency_p90:.0f}ms\n"
        section += f"- **99th Percentile (P99):** {report.answer_latency_p99:.0f}ms\n"
        section += f"- **Maximum:** {report.answer_latency_max:.0f}ms\n"
        section += f"- **Target:** {self.TARGETS[PerformanceMetric.ANSWER_LATENCY]:.0f}ms\n\n"
        
        if report.answer_latency_p90 <= self.TARGETS[PerformanceMetric.ANSWER_LATENCY]:
            section += "✅ **Performance:** Exceeds target. 90% of calls answered within 200ms.\n\n"
        else:
            section += f"⚠️ **Performance:** {report.answer_latency_p90:.0f}ms P90 (target: 200ms)\n\n"
        
        section += "### Response Latency (Time to Respond to Speech)\n\n"
        section += f"- **Median (P50):** {report.response_latency_p50:.0f}ms\n"
        section += f"- **90th Percentile (P90):** {report.response_latency_p90:.0f}ms\n"
        section += f"- **99th Percentile (P99):** {report.response_latency_p99:.0f}ms\n\n"
        
        if report.booking_latency_p50:
            section += "### Booking Execution Time\n\n"
            section += f"- **Median:** {report.booking_latency_p50:.0f}ms ({report.booking_latency_p50/1000:.1f}s)\n"
            section += f"- **90th Percentile:** {report.booking_latency_p90:.0f}ms ({report.booking_latency_p90/1000:.1f}s)\n\n"
        
        section += "### Overall Compliance\n\n"
        section += f"**{report.target_compliance_rate:.1f}%** of measurements within target thresholds\n"
        section += f"({report.measurements_within_target:,} of {report.total_measurements:,} measurements)\n\n"
        
        section += "**Key Insight:** "
        if report.streaming_health == PerformanceStatus.EXCELLENT:
            section += "System performance consistently exceeds targets, providing near-instantaneous response to customers.\n"
        elif report.streaming_health == PerformanceStatus.GOOD:
            section += "System performance meets targets with occasional variations during peak load.\n"
        else:
            section += "System performance requires optimization to meet target thresholds.\n"
        
        return section
    
    def compare_to_baseline(
        self,
        pilot_report: PerformanceReport,
        baseline_answer_time_seconds: float = 15.0
    ) -> Dict[str, Any]:
        """
        Compare AI performance to human baseline.
        
        Args:
            pilot_report: Performance report from pilot
            baseline_answer_time_seconds: Human answer time baseline
        
        Returns:
            Comparison metrics
        """
        ai_answer_seconds = pilot_report.answer_latency_p90 / 1000
        improvement_factor = baseline_answer_time_seconds / ai_answer_seconds
        time_saved_seconds = baseline_answer_time_seconds - ai_answer_seconds
        
        return {
            "baseline_answer_time_seconds": baseline_answer_time_seconds,
            "ai_answer_time_seconds": ai_answer_seconds,
            "improvement_factor": improvement_factor,
            "time_saved_per_call_seconds": time_saved_seconds,
            "percentage_faster": ((time_saved_seconds / baseline_answer_time_seconds) * 100),
            "comparison_text": f"AI answers {improvement_factor:.0f}x faster than human baseline ({ai_answer_seconds:.2f}s vs {baseline_answer_time_seconds:.1f}s)"
        }


# Example usage
if __name__ == "__main__":
    engine = LatencyPerformanceEngine()
    
    # Simulate measurements from a pilot
    measurements = []
    
    # Answer latency measurements (target: 200ms)
    for i in range(100):
        measurements.append(engine.record_measurement(
            metric_type=PerformanceMetric.ANSWER_LATENCY,
            value_ms=180 + (i % 50),  # 180-230ms range
            call_id=f"call_{i:03d}",
            pilot_id="KV-PILOT-2024-0615",
            time_of_day=(9 + (i % 12))  # 9am-9pm
        ))
    
    # Response latency measurements (target: 300ms)
    for i in range(100):
        measurements.append(engine.record_measurement(
            metric_type=PerformanceMetric.SPEECH_TO_RESPONSE,
            value_ms=250 + (i % 80),  # 250-330ms range
            call_id=f"call_{i:03d}",
            pilot_id="KV-PILOT-2024-0615",
            time_of_day=(9 + (i % 12))
        ))
    
    # Booking execution measurements (target: 2000ms)
    for i in range(30):
        measurements.append(engine.record_measurement(
            metric_type=PerformanceMetric.BOOKING_EXECUTION,
            value_ms=1500 + (i % 600),  # 1500-2100ms range
            call_id=f"call_{i:03d}",
            pilot_id="KV-PILOT-2024-0615",
            time_of_day=(9 + (i % 12))
        ))
    
    # Generate report
    period_start = datetime.now() - timedelta(days=7)
    period_end = datetime.now()
    
    report = engine.generate_performance_report(
        pilot_id="KV-PILOT-2024-0615",
        measurements=measurements,
        period_start=period_start,
        period_end=period_end
    )
    
    print("📊 Performance Report\n")
    print(f"Pilot ID: {report.pilot_id}")
    print(f"Health Status: {report.streaming_health.value.upper()}")
    print(f"Total Measurements: {report.total_measurements:,}")
    print(f"Compliance Rate: {report.target_compliance_rate:.1f}%\n")
    
    print("Answer Latency:")
    print(f"  P50: {report.answer_latency_p50:.0f}ms")
    print(f"  P90: {report.answer_latency_p90:.0f}ms")
    print(f"  P99: {report.answer_latency_p99:.0f}ms")
    print(f"  Max: {report.answer_latency_max:.0f}ms\n")
    
    print("Response Latency:")
    print(f"  P50: {report.response_latency_p50:.0f}ms")
    print(f"  P90: {report.response_latency_p90:.0f}ms")
    print(f"  P99: {report.response_latency_p99:.0f}ms\n")
    
    if report.booking_latency_p50:
        print("Booking Execution:")
        print(f"  P50: {report.booking_latency_p50:.0f}ms ({report.booking_latency_p50/1000:.1f}s)")
        print(f"  P90: {report.booking_latency_p90:.0f}ms ({report.booking_latency_p90/1000:.1f}s)\n")
    
    # Compare to baseline
    comparison = engine.compare_to_baseline(report, baseline_answer_time_seconds=15.0)
    print("📈 Comparison to Human Baseline:")
    print(f"  {comparison['comparison_text']}")
    print(f"  Time saved per call: {comparison['time_saved_per_call_seconds']:.1f}s")
    print(f"  {comparison['percentage_faster']:.1f}% faster\n")
    
    # Generate report section
    print("="*60)
    print("\n📋 Report Section:\n")
    section = engine.generate_report_section(report)
    print(section)
