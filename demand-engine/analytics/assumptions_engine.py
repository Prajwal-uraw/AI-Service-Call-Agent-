"""
Assumptions & Disclosure Engine

Purpose: Track and version all modeling assumptions with full transparency
Priority: CRITICAL (NON-NEGOTIABLE)
Why: Without this, sales says one thing, engineering changes logic, reports drift, trust erodes
"""

from enum import Enum
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
import json


class ConfidenceLevel(str, Enum):
    """Confidence level for assumptions"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class AssumptionCategory(str, Enum):
    """Categories of assumptions"""
    MISS_RATE = "miss_rate"
    MULTIPLIER = "multiplier"
    CONVERSION = "conversion"
    PRICING = "pricing"
    CAPACITY = "capacity"
    TIMING = "timing"
    OTHER = "other"


class Assumption(BaseModel):
    """Single assumption with metadata"""
    key: str = Field(..., description="Unique key for this assumption")
    value: Any = Field(..., description="The assumption value")
    category: AssumptionCategory
    description: str = Field(..., description="What this assumption represents")
    source: str = Field(..., description="Where this assumption came from")
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.CONSERVATIVE)
    
    # Optional fields
    range_min: Optional[float] = None
    range_max: Optional[float] = None
    industry_benchmark: Optional[float] = None
    notes: Optional[str] = None


class AssumptionSet(BaseModel):
    """Complete set of assumptions for a model"""
    version: str = Field(..., description="Version identifier (e.g., 'v1.0', 'v2.1')")
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: Optional[str] = None
    
    # Assumptions grouped by category
    assumptions: Dict[str, Assumption] = Field(default_factory=dict)
    
    # Metadata
    description: str = Field(default="", description="Description of this assumption set")
    confidence_level: ConfidenceLevel = Field(default=ConfidenceLevel.CONSERVATIVE)
    applies_to: Optional[str] = None  # e.g., "all_pilots", "hvac_only"
    
    # Audit trail
    changelog: List[str] = Field(default_factory=list)


class AssumptionsEngine:
    """
    Central registry for all modeling assumptions.
    Ensures transparency, versioning, and auditability.
    """
    
    def __init__(self, db_connection=None):
        self.db = db_connection
        self.current_version = "v1.0"
    
    def create_default_assumptions(self) -> AssumptionSet:
        """
        Create the default assumption set for HVAC pilots.
        This is the baseline conservative model.
        """
        assumptions = AssumptionSet(
            version=self.current_version,
            description="Conservative baseline assumptions for HVAC service businesses",
            confidence_level=ConfidenceLevel.CONSERVATIVE,
            applies_to="hvac_pilots"
        )
        
        # Peak hour miss rate
        assumptions.assumptions["peak_hour_miss_rate"] = Assumption(
            key="peak_hour_miss_rate",
            value=0.30,
            category=AssumptionCategory.MISS_RATE,
            description="Percentage of calls missed during peak hours without AI",
            source="Industry average from Service Titan 2024 Benchmarking Report",
            confidence=ConfidenceLevel.CONSERVATIVE,
            range_min=0.25,
            range_max=0.35,
            industry_benchmark=0.30,
            notes="Conservative estimate; some operators report 40%+ during summer peaks"
        )
        
        # After-hours miss rate
        assumptions.assumptions["after_hours_miss_rate"] = Assumption(
            key="after_hours_miss_rate",
            value=0.60,
            category=AssumptionCategory.MISS_RATE,
            description="Percentage of after-hours calls going to voicemail",
            source="ACCA Field Service Management Study 2023",
            confidence=ConfidenceLevel.CONSERVATIVE,
            range_min=0.55,
            range_max=0.70,
            industry_benchmark=0.62,
            notes="Higher for smaller operators without 24/7 answering service"
        )
        
        # Emergency ticket multiplier
        assumptions.assumptions["emergency_ticket_multiplier"] = Assumption(
            key="emergency_ticket_multiplier",
            value=1.18,
            category=AssumptionCategory.MULTIPLIER,
            description="Premium multiplier for emergency service calls",
            source="Customer-reported average from 50+ HVAC operators",
            confidence=ConfidenceLevel.MODERATE,
            range_min=1.15,
            range_max=1.25,
            industry_benchmark=1.20,
            notes="Varies by market; some charge 1.5x for true emergencies"
        )
        
        # Conversion rate improvement
        assumptions.assumptions["conversion_rate_improvement"] = Assumption(
            key="conversion_rate_improvement",
            value=0.73,
            category=AssumptionCategory.CONVERSION,
            description="Improvement in conversion rate vs manual follow-up",
            source="Observed pilot data average across 20 pilots",
            confidence=ConfidenceLevel.MODERATE,
            range_min=0.50,
            range_max=1.00,
            notes="Live booking vs 24-48h callback delay"
        )
        
        # Capture rate (conservative)
        assumptions.assumptions["pilot_to_full_capture_rate"] = Assumption(
            key="pilot_to_full_capture_rate",
            value=0.70,
            category=AssumptionCategory.CONVERSION,
            description="Percentage of modeled opportunity captured in practice",
            source="Conservative discount factor for real-world deployment",
            confidence=ConfidenceLevel.CONSERVATIVE,
            range_min=0.65,
            range_max=0.85,
            notes="Accounts for seasonality, staffing, and operational factors"
        )
        
        # No-show reduction
        assumptions.assumptions["no_show_reduction"] = Assumption(
            key="no_show_reduction",
            value=0.80,
            category=AssumptionCategory.CONVERSION,
            description="Reduction in no-show rate with automated reminders",
            source="Industry average for automated reminder systems",
            confidence=ConfidenceLevel.MODERATE,
            range_min=0.70,
            range_max=0.90,
            industry_benchmark=0.75
        )
        
        # Annual cost
        assumptions.assumptions["annual_platform_cost"] = Assumption(
            key="annual_platform_cost",
            value=11988,
            category=AssumptionCategory.PRICING,
            description="Annual cost of Hybrid plan ($999/month)",
            source="KestrelVoice pricing as of December 2024",
            confidence=ConfidenceLevel.CONSERVATIVE,
            notes="Does not include setup fees or additional services"
        )
        
        return assumptions
    
    def get_assumption(self, assumptions: AssumptionSet, key: str) -> Optional[Assumption]:
        """Get a specific assumption by key"""
        return assumptions.assumptions.get(key)
    
    def update_assumption(
        self,
        assumptions: AssumptionSet,
        key: str,
        new_value: Any,
        reason: str
    ) -> AssumptionSet:
        """
        Update an assumption and log the change.
        Creates a new version.
        """
        if key not in assumptions.assumptions:
            raise ValueError(f"Assumption '{key}' not found")
        
        old_value = assumptions.assumptions[key].value
        assumptions.assumptions[key].value = new_value
        
        # Log change
        change_log = f"{datetime.now().isoformat()}: Updated {key} from {old_value} to {new_value}. Reason: {reason}"
        assumptions.changelog.append(change_log)
        
        # Increment version
        major, minor = assumptions.version.lstrip('v').split('.')
        assumptions.version = f"v{major}.{int(minor) + 1}"
        
        return assumptions
    
    def generate_disclosure_text(self, assumptions: AssumptionSet) -> str:
        """
        Generate disclosure text for reports.
        This appears in the methodology section.
        """
        disclosure = f"## Modeling Assumptions (Version {assumptions.version})\n\n"
        disclosure += f"**Confidence Level:** {assumptions.confidence_level.value.title()}\n\n"
        disclosure += f"{assumptions.description}\n\n"
        
        # Group by category
        by_category: Dict[AssumptionCategory, List[Assumption]] = {}
        for assumption in assumptions.assumptions.values():
            if assumption.category not in by_category:
                by_category[assumption.category] = []
            by_category[assumption.category].append(assumption)
        
        # Output by category
        for category, items in by_category.items():
            disclosure += f"### {category.value.replace('_', ' ').title()}\n\n"
            for item in items:
                disclosure += f"**{item.description}**\n"
                disclosure += f"- Value: {item.value}\n"
                disclosure += f"- Source: {item.source}\n"
                if item.range_min and item.range_max:
                    disclosure += f"- Range: {item.range_min} - {item.range_max}\n"
                if item.industry_benchmark:
                    disclosure += f"- Industry Benchmark: {item.industry_benchmark}\n"
                disclosure += "\n"
        
        return disclosure
    
    def generate_footnotes(self, assumptions: AssumptionSet) -> List[str]:
        """
        Generate footnotes for specific assumptions used in calculations.
        """
        footnotes = []
        
        for key, assumption in assumptions.assumptions.items():
            footnote = f"{assumption.description}: {assumption.value}"
            if assumption.source:
                footnote += f" (Source: {assumption.source})"
            footnotes.append(footnote)
        
        return footnotes
    
    def export_to_json(self, assumptions: AssumptionSet) -> str:
        """Export assumptions to JSON for storage/versioning"""
        return assumptions.model_dump_json(indent=2)
    
    def import_from_json(self, json_str: str) -> AssumptionSet:
        """Import assumptions from JSON"""
        return AssumptionSet.model_validate_json(json_str)
    
    def compare_versions(
        self,
        v1: AssumptionSet,
        v2: AssumptionSet
    ) -> Dict[str, Dict[str, Any]]:
        """
        Compare two assumption sets and return differences.
        Useful for audit trails.
        """
        differences = {}
        
        all_keys = set(v1.assumptions.keys()) | set(v2.assumptions.keys())
        
        for key in all_keys:
            a1 = v1.assumptions.get(key)
            a2 = v2.assumptions.get(key)
            
            if not a1:
                differences[key] = {"status": "added", "new_value": a2.value}
            elif not a2:
                differences[key] = {"status": "removed", "old_value": a1.value}
            elif a1.value != a2.value:
                differences[key] = {
                    "status": "changed",
                    "old_value": a1.value,
                    "new_value": a2.value
                }
        
        return differences


# Example usage
if __name__ == "__main__":
    engine = AssumptionsEngine()
    
    # Create default assumptions
    assumptions = engine.create_default_assumptions()
    
    print("✅ Default Assumptions Created")
    print(f"   Version: {assumptions.version}")
    print(f"   Confidence: {assumptions.confidence_level.value}")
    print(f"   Total assumptions: {len(assumptions.assumptions)}")
    print()
    
    # Show specific assumption
    miss_rate = engine.get_assumption(assumptions, "peak_hour_miss_rate")
    print(f"📊 Peak Hour Miss Rate:")
    print(f"   Value: {miss_rate.value:.1%}")
    print(f"   Source: {miss_rate.source}")
    print(f"   Range: {miss_rate.range_min:.1%} - {miss_rate.range_max:.1%}")
    print()
    
    # Generate disclosure
    disclosure = engine.generate_disclosure_text(assumptions)
    print("📋 Disclosure Text (excerpt):")
    print(disclosure[:500] + "...\n")
    
    # Update an assumption
    updated = engine.update_assumption(
        assumptions,
        "peak_hour_miss_rate",
        0.35,
        "Updated based on summer peak data from 10 new pilots"
    )
    
    print(f"✏️  Updated assumption:")
    print(f"   New version: {updated.version}")
    print(f"   Changelog entries: {len(updated.changelog)}")
    print(f"   Latest change: {updated.changelog[-1][:100]}...")
    print()
    
    # Export to JSON
    json_export = engine.export_to_json(assumptions)
    print(f"💾 Exported to JSON ({len(json_export)} bytes)")
