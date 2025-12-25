"""
Baseline & Counterfactual Engine

Purpose: Formally establish "before KV" behavior with provenance tracking
Priority: CRITICAL
Why: CFOs don't reject models — they reject undefined baselines
"""

from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class BaselineSource(str, Enum):
    """Source of baseline data"""
    CUSTOMER_REPORTED = "customer_reported"
    HISTORICAL_LOGS = "historical_logs"
    INDUSTRY_BENCHMARK = "industry_benchmark"
    MIXED = "mixed"


class BaselineMetrics(BaseModel):
    """Baseline performance metrics"""
    answer_rate: float = Field(..., ge=0, le=1, description="Percentage of calls answered (0-1)")
    booking_delay_hours: float = Field(..., ge=0, description="Average hours from call to booking")
    average_handle_time_minutes: float = Field(..., ge=0, description="Average call duration in minutes")
    after_hours_answer_rate: float = Field(..., ge=0, le=1, description="After-hours answer rate (0-1)")
    peak_hour_capacity: int = Field(..., ge=0, description="Max concurrent calls handled")
    
    # Optional metrics
    callback_rate: Optional[float] = Field(None, ge=0, le=1, description="Percentage requiring callbacks")
    no_show_rate: Optional[float] = Field(None, ge=0, le=1, description="Appointment no-show rate")
    average_ticket_size: Optional[float] = Field(None, ge=0, description="Average revenue per job")


class BaselineData(BaseModel):
    """Complete baseline data with provenance"""
    pilot_id: str
    customer_id: str
    
    # Source tracking
    source: BaselineSource
    source_details: str = Field(..., description="Detailed explanation of data source")
    
    # Metrics
    metrics: BaselineMetrics
    
    # Metadata
    collection_date: datetime = Field(default_factory=datetime.now)
    collected_by: Optional[str] = None
    notes: Optional[str] = None
    confidence_level: str = Field(default="medium", description="high, medium, low")
    
    # Supporting data
    historical_period: Optional[str] = None  # e.g., "Last 90 days"
    sample_size: Optional[int] = None
    industry_benchmark_source: Optional[str] = None


class BaselineEngine:
    """
    Tracks and validates baseline data with full provenance.
    Ensures every comparison has a declared, auditable source.
    """
    
    def __init__(self, db_connection=None):
        self.db = db_connection
    
    def create_baseline(
        self,
        pilot_id: str,
        customer_id: str,
        source: BaselineSource,
        metrics: Dict[str, Any],
        source_details: str,
        **kwargs
    ) -> BaselineData:
        """
        Create a new baseline record with full provenance.
        
        Args:
            pilot_id: Unique pilot identifier
            customer_id: Customer identifier
            source: Where the baseline data came from
            metrics: Dictionary of baseline metrics
            source_details: Detailed explanation of source
            **kwargs: Additional metadata (notes, confidence_level, etc.)
        
        Returns:
            BaselineData object
        """
        baseline = BaselineData(
            pilot_id=pilot_id,
            customer_id=customer_id,
            source=source,
            source_details=source_details,
            metrics=BaselineMetrics(**metrics),
            **kwargs
        )
        
        # Validate baseline makes sense
        self._validate_baseline(baseline)
        
        # Store in database
        if self.db:
            self._store_baseline(baseline)
        
        return baseline
    
    def _validate_baseline(self, baseline: BaselineData) -> None:
        """Validate baseline data for sanity"""
        metrics = baseline.metrics
        
        # Answer rate should be reasonable
        if metrics.answer_rate > 0.95:
            print(f"⚠️  Warning: Answer rate {metrics.answer_rate:.1%} seems very high")
        
        if metrics.answer_rate < 0.30:
            print(f"⚠️  Warning: Answer rate {metrics.answer_rate:.1%} seems very low")
        
        # Booking delay should be reasonable
        if metrics.booking_delay_hours > 72:
            print(f"⚠️  Warning: Booking delay {metrics.booking_delay_hours}h seems very long")
        
        # Handle time should be reasonable
        if metrics.average_handle_time_minutes > 15:
            print(f"⚠️  Warning: Handle time {metrics.average_handle_time_minutes}min seems long")
    
    def _store_baseline(self, baseline: BaselineData) -> None:
        """Store baseline in database"""
        # Implementation depends on your database
        # This is a placeholder for the actual DB logic
        pass
    
    def get_baseline(self, pilot_id: str) -> Optional[BaselineData]:
        """Retrieve baseline for a pilot"""
        if not self.db:
            return None
        
        # Query database
        # This is a placeholder
        return None
    
    def generate_baseline_disclosure(self, baseline: BaselineData) -> str:
        """
        Generate disclosure language for reports.
        This is what appears in the report to explain the baseline.
        """
        source_map = {
            BaselineSource.CUSTOMER_REPORTED: "customer-reported baseline",
            BaselineSource.HISTORICAL_LOGS: "historical call log analysis",
            BaselineSource.INDUSTRY_BENCHMARK: "industry benchmark data",
            BaselineSource.MIXED: "combination of customer data and industry benchmarks"
        }
        
        disclosure = f"**Baseline Source:** {source_map[baseline.source]}\n\n"
        disclosure += f"{baseline.source_details}\n\n"
        
        if baseline.confidence_level:
            disclosure += f"**Confidence Level:** {baseline.confidence_level.title()}\n\n"
        
        if baseline.historical_period:
            disclosure += f"**Historical Period:** {baseline.historical_period}\n\n"
        
        if baseline.sample_size:
            disclosure += f"**Sample Size:** {baseline.sample_size:,} calls\n\n"
        
        return disclosure
    
    def compare_to_baseline(
        self,
        baseline: BaselineData,
        observed_metrics: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Compare observed pilot performance to baseline.
        Returns improvements with proper attribution.
        """
        comparisons = {}
        
        # Answer rate improvement
        if "answer_rate" in observed_metrics:
            baseline_rate = baseline.metrics.answer_rate
            observed_rate = observed_metrics["answer_rate"]
            improvement = observed_rate - baseline_rate
            improvement_pct = (improvement / baseline_rate) * 100 if baseline_rate > 0 else 0
            
            comparisons["answer_rate"] = {
                "baseline": baseline_rate,
                "observed": observed_rate,
                "improvement": improvement,
                "improvement_pct": improvement_pct,
                "baseline_source": baseline.source.value,
                "disclosure": f"Compared to {baseline.source.value} baseline of {baseline_rate:.1%}"
            }
        
        # Booking delay improvement
        if "booking_delay_hours" in observed_metrics:
            baseline_delay = baseline.metrics.booking_delay_hours
            observed_delay = observed_metrics["booking_delay_hours"]
            improvement = baseline_delay - observed_delay  # Lower is better
            improvement_pct = (improvement / baseline_delay) * 100 if baseline_delay > 0 else 0
            
            comparisons["booking_delay"] = {
                "baseline": baseline_delay,
                "observed": observed_delay,
                "improvement_hours": improvement,
                "improvement_pct": improvement_pct,
                "baseline_source": baseline.source.value,
                "disclosure": f"Compared to {baseline.source.value} baseline of {baseline_delay:.1f} hours"
            }
        
        # Handle time improvement
        if "average_handle_time_minutes" in observed_metrics:
            baseline_time = baseline.metrics.average_handle_time_minutes
            observed_time = observed_metrics["average_handle_time_minutes"]
            improvement = baseline_time - observed_time  # Lower is better
            improvement_pct = (improvement / baseline_time) * 100 if baseline_time > 0 else 0
            
            comparisons["handle_time"] = {
                "baseline": baseline_time,
                "observed": observed_time,
                "improvement_minutes": improvement,
                "improvement_pct": improvement_pct,
                "baseline_source": baseline.source.value,
                "disclosure": f"Compared to {baseline.source.value} baseline of {baseline_time:.1f} minutes"
            }
        
        return comparisons


# Example usage
if __name__ == "__main__":
    engine = BaselineEngine()
    
    # Create baseline from customer-reported data
    baseline = engine.create_baseline(
        pilot_id="KV-PILOT-2024-0615",
        customer_id="comfort-pro-hvac",
        source=BaselineSource.CUSTOMER_REPORTED,
        source_details="Owner reported average performance over last 90 days during intake call on June 14, 2024. Data verified against ServiceTitan dashboard screenshots.",
        metrics={
            "answer_rate": 0.62,
            "booking_delay_hours": 24.0,
            "average_handle_time_minutes": 4.7,
            "after_hours_answer_rate": 0.35,
            "peak_hour_capacity": 3,
            "average_ticket_size": 550.0
        },
        confidence_level="medium",
        historical_period="Last 90 days (March-May 2024)",
        notes="Owner mentioned significant seasonal variation; summer typically busier"
    )
    
    print("✅ Baseline created:")
    print(f"   Source: {baseline.source.value}")
    print(f"   Answer rate: {baseline.metrics.answer_rate:.1%}")
    print(f"   Booking delay: {baseline.metrics.booking_delay_hours}h")
    print()
    
    # Generate disclosure
    disclosure = engine.generate_baseline_disclosure(baseline)
    print("📋 Report Disclosure:")
    print(disclosure)
    
    # Compare to observed pilot data
    observed = {
        "answer_rate": 1.0,
        "booking_delay_hours": 0.038,  # 2.3 minutes
        "average_handle_time_minutes": 2.3
    }
    
    comparisons = engine.compare_to_baseline(baseline, observed)
    
    print("📊 Performance Comparison:")
    for metric, data in comparisons.items():
        print(f"\n{metric}:")
        print(f"  Baseline: {data['baseline']}")
        print(f"  Observed: {data['observed']}")
        print(f"  Improvement: {data['improvement_pct']:+.1f}%")
        print(f"  {data['disclosure']}")
