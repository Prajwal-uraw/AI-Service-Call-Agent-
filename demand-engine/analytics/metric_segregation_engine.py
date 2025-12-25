"""
Observed vs Modeled Segregation Engine

Purpose: Enforce separation between observed, modeled, and derived metrics
Priority: CRITICAL
Why: This is where lawsuits and trust erosion start. Never mix guarantees with projections.
"""

from enum import Enum
from typing import Any, Optional, Dict, List
from datetime import datetime
from pydantic import BaseModel, Field, validator


class MetricType(str, Enum):
    """Type of metric"""
    OBSERVED = "observed"  # Directly measured during pilot
    MODELED = "modeled"    # Projected/extrapolated
    DERIVED = "derived"    # Calculated from other metrics


class ConfidenceBand(str, Enum):
    """Confidence level for metric"""
    HIGH = "high"      # Directly observed, high sample size
    MEDIUM = "medium"  # Observed with caveats or modeled conservatively
    LOW = "low"        # Highly speculative or small sample


class Metric(BaseModel):
    """Single metric with full provenance"""
    key: str = Field(..., description="Unique metric identifier")
    value: Any = Field(..., description="The metric value")
    metric_type: MetricType = Field(..., description="Observed, modeled, or derived")
    confidence_band: ConfidenceBand = Field(..., description="Confidence level")
    
    # Provenance
    description: str = Field(..., description="What this metric represents")
    source: str = Field(..., description="Where this came from")
    calculation: Optional[str] = None  # For derived metrics
    
    # Context
    sample_size: Optional[int] = None
    time_period: Optional[str] = None
    conditions: Optional[str] = None
    
    # Metadata
    recorded_at: datetime = Field(default_factory=datetime.now)
    pilot_id: Optional[str] = None
    
    @validator('calculation')
    def calculation_required_for_derived(cls, v, values):
        """Derived metrics must have calculation"""
        if values.get('metric_type') == MetricType.DERIVED and not v:
            raise ValueError("Derived metrics must include calculation method")
        return v


class MetricSet(BaseModel):
    """Collection of metrics with segregation enforcement"""
    pilot_id: str
    generated_at: datetime = Field(default_factory=datetime.now)
    metrics: Dict[str, Metric] = Field(default_factory=dict)


class MetricSegregationEngine:
    """
    Enforces strict separation between observed and modeled metrics.
    Prevents accidental mixing of guarantees with projections.
    """
    
    def __init__(self, db_connection=None):
        self.db = db_connection
    
    def record_observed_metric(
        self,
        key: str,
        value: Any,
        description: str,
        source: str,
        sample_size: Optional[int] = None,
        time_period: Optional[str] = None,
        pilot_id: Optional[str] = None,
        **kwargs
    ) -> Metric:
        """
        Record a directly observed metric from pilot.
        These are facts, not projections.
        """
        return Metric(
            key=key,
            value=value,
            metric_type=MetricType.OBSERVED,
            confidence_band=ConfidenceBand.HIGH,
            description=description,
            source=source,
            sample_size=sample_size,
            time_period=time_period,
            pilot_id=pilot_id,
            **kwargs
        )
    
    def record_modeled_metric(
        self,
        key: str,
        value: Any,
        description: str,
        source: str,
        calculation: str,
        confidence_band: ConfidenceBand = ConfidenceBand.MEDIUM,
        pilot_id: Optional[str] = None,
        **kwargs
    ) -> Metric:
        """
        Record a modeled/projected metric.
        These are estimates, not guarantees.
        """
        return Metric(
            key=key,
            value=value,
            metric_type=MetricType.MODELED,
            confidence_band=confidence_band,
            description=description,
            source=source,
            calculation=calculation,
            pilot_id=pilot_id,
            **kwargs
        )
    
    def record_derived_metric(
        self,
        key: str,
        value: Any,
        description: str,
        calculation: str,
        source_metrics: List[str],
        pilot_id: Optional[str] = None,
        **kwargs
    ) -> Metric:
        """
        Record a derived metric (calculated from other metrics).
        Confidence depends on source metrics.
        """
        source = f"Calculated from: {', '.join(source_metrics)}"
        
        return Metric(
            key=key,
            value=value,
            metric_type=MetricType.DERIVED,
            confidence_band=ConfidenceBand.MEDIUM,
            description=description,
            source=source,
            calculation=calculation,
            pilot_id=pilot_id,
            **kwargs
        )
    
    def validate_metric_usage(
        self,
        metric: Metric,
        context: str
    ) -> Dict[str, Any]:
        """
        Validate that a metric is being used appropriately.
        Returns warnings if misused.
        """
        warnings = []
        
        # Modeled metrics should never be presented as guarantees
        if metric.metric_type == MetricType.MODELED:
            if any(word in context.lower() for word in ['guarantee', 'will', 'ensures', 'promises']):
                warnings.append(
                    f"⚠️  CRITICAL: Modeled metric '{metric.key}' used with guarantee language. "
                    f"This is legally dangerous. Use 'projected', 'modeled', or 'estimated' instead."
                )
        
        # Low confidence metrics should have disclaimers
        if metric.confidence_band == ConfidenceBand.LOW:
            if 'preliminary' not in context.lower() and 'estimated' not in context.lower():
                warnings.append(
                    f"⚠️  Warning: Low-confidence metric '{metric.key}' should include disclaimer language"
                )
        
        # Observed metrics should cite sample size
        if metric.metric_type == MetricType.OBSERVED and not metric.sample_size:
            warnings.append(
                f"ℹ️  Info: Observed metric '{metric.key}' missing sample size for full transparency"
            )
        
        return {
            "valid": len(warnings) == 0,
            "warnings": warnings,
            "metric_type": metric.metric_type.value,
            "confidence": metric.confidence_band.value
        }
    
    def generate_report_language(self, metric: Metric) -> str:
        """
        Generate appropriate language for reports based on metric type.
        This prevents accidental guarantee language.
        """
        if metric.metric_type == MetricType.OBSERVED:
            return f"**Observed:** {metric.description} was {metric.value}"
        
        elif metric.metric_type == MetricType.MODELED:
            confidence_qualifiers = {
                ConfidenceBand.HIGH: "conservatively modeled",
                ConfidenceBand.MEDIUM: "modeled",
                ConfidenceBand.LOW: "preliminarily estimated"
            }
            qualifier = confidence_qualifiers[metric.confidence_band]
            return f"**Modeled:** {metric.description} is {qualifier} at {metric.value}"
        
        else:  # DERIVED
            return f"**Calculated:** {metric.description} is {metric.value}"
    
    def create_metric_summary(self, metrics: List[Metric]) -> Dict[str, Any]:
        """
        Create a summary showing metric breakdown by type.
        Useful for report appendix.
        """
        by_type = {
            MetricType.OBSERVED: [],
            MetricType.MODELED: [],
            MetricType.DERIVED: []
        }
        
        for metric in metrics:
            by_type[metric.metric_type].append(metric)
        
        return {
            "total_metrics": len(metrics),
            "observed_count": len(by_type[MetricType.OBSERVED]),
            "modeled_count": len(by_type[MetricType.MODELED]),
            "derived_count": len(by_type[MetricType.DERIVED]),
            "breakdown": {
                "observed": [m.key for m in by_type[MetricType.OBSERVED]],
                "modeled": [m.key for m in by_type[MetricType.MODELED]],
                "derived": [m.key for m in by_type[MetricType.DERIVED]]
            }
        }
    
    def generate_methodology_disclosure(self, metrics: List[Metric]) -> str:
        """
        Generate methodology section for reports.
        Explains which metrics are observed vs modeled.
        """
        summary = self.create_metric_summary(metrics)
        
        disclosure = "## Metric Methodology\n\n"
        disclosure += f"This report contains {summary['total_metrics']} metrics:\n\n"
        disclosure += f"- **{summary['observed_count']} Observed Metrics:** Directly measured during the 7-day pilot\n"
        disclosure += f"- **{summary['modeled_count']} Modeled Metrics:** Projected using conservative assumptions\n"
        disclosure += f"- **{summary['derived_count']} Derived Metrics:** Calculated from observed data\n\n"
        
        disclosure += "### Observed Metrics (Facts)\n\n"
        disclosure += "The following metrics were directly observed during your pilot:\n\n"
        for key in summary['breakdown']['observed']:
            metric = next(m for m in metrics if m.key == key)
            disclosure += f"- **{metric.description}:** {metric.value}"
            if metric.sample_size:
                disclosure += f" (n={metric.sample_size})"
            disclosure += "\n"
        
        disclosure += "\n### Modeled Metrics (Projections)\n\n"
        disclosure += "The following metrics are modeled projections based on observed data and industry benchmarks:\n\n"
        for key in summary['breakdown']['modeled']:
            metric = next(m for m in metrics if m.key == key)
            disclosure += f"- **{metric.description}:** {metric.value}\n"
            disclosure += f"  - Method: {metric.calculation}\n"
            disclosure += f"  - Confidence: {metric.confidence_band.value}\n"
        
        disclosure += "\n**Important:** Modeled metrics are directional estimates, not guarantees. "
        disclosure += "Actual results depend on seasonality, staffing, pricing, and operational execution.\n"
        
        return disclosure


# Example usage
if __name__ == "__main__":
    engine = MetricSegregationEngine()
    
    # Record observed metrics from pilot
    observed_metrics = [
        engine.record_observed_metric(
            key="total_calls",
            value=127,
            description="Total incoming calls during pilot",
            source="Daily.co call logs",
            sample_size=127,
            time_period="June 15-21, 2024",
            pilot_id="KV-PILOT-2024-0615"
        ),
        engine.record_observed_metric(
            key="answer_rate",
            value=1.0,
            description="Percentage of calls answered by KestrelVoice",
            source="Daily.co call logs",
            sample_size=127,
            time_period="June 15-21, 2024",
            pilot_id="KV-PILOT-2024-0615"
        ),
        engine.record_observed_metric(
            key="bookings_created",
            value=34,
            description="Appointments booked during pilot",
            source="ServiceTitan API sync logs",
            sample_size=34,
            time_period="June 15-21, 2024",
            pilot_id="KV-PILOT-2024-0615"
        )
    ]
    
    # Record modeled metrics (projections)
    modeled_metrics = [
        engine.record_modeled_metric(
            key="annual_missed_calls",
            value=1976,
            description="Projected annual missed calls without AI",
            source="Pilot call volume extrapolated to 52 weeks",
            calculation="(127 calls / 7 days) * 365 days * 0.30 miss rate",
            confidence_band=ConfidenceBand.MEDIUM,
            pilot_id="KV-PILOT-2024-0615"
        ),
        engine.record_modeled_metric(
            key="annual_revenue_opportunity",
            value=1086800,
            description="Modeled annual revenue exposure from missed calls",
            source="Missed calls * average ticket size",
            calculation="1976 calls * $550 avg ticket",
            confidence_band=ConfidenceBand.MEDIUM,
            pilot_id="KV-PILOT-2024-0615"
        )
    ]
    
    # Record derived metrics
    derived_metrics = [
        engine.record_derived_metric(
            key="conversion_rate",
            value=0.38,
            description="Booking conversion rate",
            calculation="bookings_created / high_intent_calls",
            source_metrics=["bookings_created", "high_intent_calls"],
            pilot_id="KV-PILOT-2024-0615"
        )
    ]
    
    all_metrics = observed_metrics + modeled_metrics + derived_metrics
    
    print("✅ Metrics Recorded:")
    print(f"   Observed: {len(observed_metrics)}")
    print(f"   Modeled: {len(modeled_metrics)}")
    print(f"   Derived: {len(derived_metrics)}")
    print()
    
    # Validate usage
    print("🔍 Validating Metric Usage:\n")
    
    # Good usage
    good_context = "Based on observed pilot data, the answer rate was 100%"
    validation = engine.validate_metric_usage(observed_metrics[1], good_context)
    print(f"✓ Good usage: {validation['valid']}")
    
    # Bad usage (guarantee language with modeled metric)
    bad_context = "KestrelVoice guarantees you will capture $1,086,800 in revenue"
    validation = engine.validate_metric_usage(modeled_metrics[1], bad_context)
    print(f"✗ Bad usage: {validation['valid']}")
    if validation['warnings']:
        for warning in validation['warnings']:
            print(f"  {warning}")
    print()
    
    # Generate report language
    print("📝 Report Language Examples:\n")
    for metric in [observed_metrics[0], modeled_metrics[0], derived_metrics[0]]:
        language = engine.generate_report_language(metric)
        print(f"{language}\n")
    
    # Generate methodology disclosure
    disclosure = engine.generate_methodology_disclosure(all_metrics)
    print("📋 Methodology Disclosure (excerpt):")
    print(disclosure[:600] + "...")
