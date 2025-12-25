"""
Call Capacity Saturation Engine

Purpose: Prove capacity breach, not just call leakage
Priority: HIGH VALUE
Why: Turns "calls were missed" into "calls exceeded human capacity at X times"
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from collections import defaultdict


class CallEvent(BaseModel):
    """Single call event"""
    call_id: str
    start_time: datetime
    end_time: datetime
    answered: bool = True
    duration_seconds: int


class CapacityWindow(BaseModel):
    """Capacity analysis for a time window"""
    window_start: datetime
    window_end: datetime
    concurrent_calls: int
    declared_capacity: int
    capacity_exceeded: bool
    overflow_calls: int = 0
    
    # Calls in this window
    call_ids: List[str] = Field(default_factory=list)


class CapacitySaturationAnalysis(BaseModel):
    """Complete capacity saturation analysis"""
    pilot_id: str
    analysis_period: str
    declared_capacity: int
    
    # Overall metrics
    total_calls: int
    peak_concurrent_calls: int
    saturation_windows: List[CapacityWindow]
    saturation_percentage: float  # % of time at/over capacity
    
    # Timing analysis
    saturation_hours: List[int] = Field(default_factory=list)  # Hours of day with saturation
    saturation_days: List[str] = Field(default_factory=list)   # Days with saturation
    
    # Impact
    calls_during_saturation: int
    estimated_missed_due_to_saturation: int
    
    analyzed_at: datetime = Field(default_factory=datetime.now)


class CapacitySaturationEngine:
    """
    Tracks concurrent calls and proves capacity breaches.
    Provides stronger ops argument than simple miss rates.
    """
    
    def __init__(self, db_connection=None):
        self.db = db_connection
    
    def analyze_capacity_saturation(
        self,
        pilot_id: str,
        calls: List[CallEvent],
        declared_capacity: int,
        window_minutes: int = 5
    ) -> CapacitySaturationAnalysis:
        """
        Analyze capacity saturation across all calls.
        
        Args:
            pilot_id: Pilot identifier
            calls: List of call events with timing
            declared_capacity: Max concurrent calls operator can handle
            window_minutes: Time window for analysis (default 5 min)
        
        Returns:
            Complete capacity saturation analysis
        """
        if not calls:
            return CapacitySaturationAnalysis(
                pilot_id=pilot_id,
                analysis_period="No calls",
                declared_capacity=declared_capacity,
                total_calls=0,
                peak_concurrent_calls=0,
                saturation_windows=[],
                saturation_percentage=0.0,
                calls_during_saturation=0,
                estimated_missed_due_to_saturation=0
            )
        
        # Sort calls by start time
        sorted_calls = sorted(calls, key=lambda c: c.start_time)
        
        # Find time range
        start_time = sorted_calls[0].start_time
        end_time = max(c.end_time for c in sorted_calls)
        period = f"{start_time.strftime('%Y-%m-%d')} to {end_time.strftime('%Y-%m-%d')}"
        
        # Calculate concurrent calls for each time window
        saturation_windows = []
        peak_concurrent = 0
        
        current_time = start_time
        window_delta = timedelta(minutes=window_minutes)
        
        while current_time < end_time:
            window_end = current_time + window_delta
            
            # Count concurrent calls in this window
            concurrent = 0
            window_call_ids = []
            
            for call in sorted_calls:
                # Call overlaps with window if it starts before window ends
                # and ends after window starts
                if call.start_time < window_end and call.end_time > current_time:
                    concurrent += 1
                    window_call_ids.append(call.call_id)
            
            # Check if capacity exceeded
            if concurrent >= declared_capacity:
                overflow = concurrent - declared_capacity
                saturation_windows.append(CapacityWindow(
                    window_start=current_time,
                    window_end=window_end,
                    concurrent_calls=concurrent,
                    declared_capacity=declared_capacity,
                    capacity_exceeded=True,
                    overflow_calls=overflow,
                    call_ids=window_call_ids
                ))
            
            peak_concurrent = max(peak_concurrent, concurrent)
            current_time = window_end
        
        # Calculate saturation metrics
        total_windows = int((end_time - start_time).total_seconds() / (window_minutes * 60))
        saturation_percentage = (len(saturation_windows) / total_windows * 100) if total_windows > 0 else 0
        
        # Identify saturation hours and days
        saturation_hours = sorted(set(w.window_start.hour for w in saturation_windows))
        saturation_days = sorted(set(w.window_start.strftime('%A') for w in saturation_windows))
        
        # Count calls during saturation
        calls_during_saturation = len(set(
            call_id 
            for window in saturation_windows 
            for call_id in window.call_ids
        ))
        
        # Estimate missed calls due to saturation
        # Conservative: assume overflow calls would have been missed
        estimated_missed = sum(w.overflow_calls for w in saturation_windows)
        
        return CapacitySaturationAnalysis(
            pilot_id=pilot_id,
            analysis_period=period,
            declared_capacity=declared_capacity,
            total_calls=len(calls),
            peak_concurrent_calls=peak_concurrent,
            saturation_windows=saturation_windows,
            saturation_percentage=saturation_percentage,
            saturation_hours=saturation_hours,
            saturation_days=saturation_days,
            calls_during_saturation=calls_during_saturation,
            estimated_missed_due_to_saturation=estimated_missed
        )
    
    def generate_saturation_report(
        self,
        analysis: CapacitySaturationAnalysis
    ) -> str:
        """
        Generate human-readable saturation report.
        This is what goes in the pilot report.
        """
        report = "## Call Capacity Saturation Analysis\n\n"
        
        report += f"**Declared Capacity:** {analysis.declared_capacity} concurrent calls\n"
        report += f"**Peak Concurrent Calls:** {analysis.peak_concurrent_calls}\n"
        report += f"**Capacity Exceeded:** {'Yes' if analysis.saturation_windows else 'No'}\n\n"
        
        if analysis.saturation_windows:
            report += f"### Saturation Events\n\n"
            report += f"Capacity was exceeded during **{len(analysis.saturation_windows)} time windows** "
            report += f"({analysis.saturation_percentage:.1f}% of pilot period).\n\n"
            
            report += f"**Peak Saturation Times:**\n"
            if analysis.saturation_hours:
                hours_str = ", ".join(f"{h}:00" for h in analysis.saturation_hours[:5])
                report += f"- Hours: {hours_str}\n"
            if analysis.saturation_days:
                days_str = ", ".join(analysis.saturation_days)
                report += f"- Days: {days_str}\n"
            report += "\n"
            
            report += f"**Impact:**\n"
            report += f"- {analysis.calls_during_saturation} calls occurred during saturation windows\n"
            report += f"- Estimated {analysis.estimated_missed_due_to_saturation} calls "
            report += f"would have been missed due to capacity limits\n\n"
            
            report += "**Key Finding:** Call volume exceeded human capacity at specific times, "
            report += "proving the need for automated call handling to prevent revenue leakage.\n"
        else:
            report += "No capacity saturation detected during pilot period. "
            report += f"Peak concurrent calls ({analysis.peak_concurrent_calls}) remained below "
            report += f"declared capacity ({analysis.declared_capacity}).\n"
        
        return report
    
    def get_saturation_windows_detail(
        self,
        analysis: CapacitySaturationAnalysis,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get detailed breakdown of saturation windows.
        Useful for appendix or detailed analysis.
        """
        windows = []
        
        for window in analysis.saturation_windows[:limit]:
            windows.append({
                "time": window.window_start.strftime("%Y-%m-%d %H:%M"),
                "concurrent_calls": window.concurrent_calls,
                "capacity": window.declared_capacity,
                "overflow": window.overflow_calls,
                "call_count": len(window.call_ids)
            })
        
        return windows


# Example usage
if __name__ == "__main__":
    engine = CapacitySaturationEngine()
    
    # Simulate call events
    base_time = datetime(2024, 6, 15, 9, 0, 0)
    
    test_calls = [
        # Morning rush - 4 calls overlapping (exceeds capacity of 3)
        CallEvent(
            call_id="call_001",
            start_time=base_time,
            end_time=base_time + timedelta(minutes=5),
            duration_seconds=300
        ),
        CallEvent(
            call_id="call_002",
            start_time=base_time + timedelta(minutes=2),
            end_time=base_time + timedelta(minutes=7),
            duration_seconds=300
        ),
        CallEvent(
            call_id="call_003",
            start_time=base_time + timedelta(minutes=3),
            end_time=base_time + timedelta(minutes=8),
            duration_seconds=300
        ),
        CallEvent(
            call_id="call_004",
            start_time=base_time + timedelta(minutes=4),
            end_time=base_time + timedelta(minutes=9),
            duration_seconds=300
        ),
        
        # Afternoon - normal load
        CallEvent(
            call_id="call_005",
            start_time=base_time + timedelta(hours=4),
            end_time=base_time + timedelta(hours=4, minutes=3),
            duration_seconds=180
        ),
        CallEvent(
            call_id="call_006",
            start_time=base_time + timedelta(hours=4, minutes=10),
            end_time=base_time + timedelta(hours=4, minutes=13),
            duration_seconds=180
        ),
    ]
    
    # Analyze with capacity of 3
    analysis = engine.analyze_capacity_saturation(
        pilot_id="KV-PILOT-2024-0615",
        calls=test_calls,
        declared_capacity=3,
        window_minutes=5
    )
    
    print("📊 Capacity Saturation Analysis\n")
    print(f"Total Calls: {analysis.total_calls}")
    print(f"Declared Capacity: {analysis.declared_capacity} concurrent")
    print(f"Peak Concurrent: {analysis.peak_concurrent_calls}")
    print(f"Capacity Exceeded: {len(analysis.saturation_windows)} windows")
    print(f"Saturation %: {analysis.saturation_percentage:.1f}%")
    print()
    
    if analysis.saturation_windows:
        print("🚨 Saturation Events:")
        for i, window in enumerate(analysis.saturation_windows[:3], 1):
            print(f"\n  Event {i}:")
            print(f"    Time: {window.window_start.strftime('%H:%M')}")
            print(f"    Concurrent: {window.concurrent_calls}")
            print(f"    Overflow: {window.overflow_calls}")
            print(f"    Calls: {len(window.call_ids)}")
    
    print("\n" + "="*60)
    print("\n📋 Report Section:\n")
    report = engine.generate_saturation_report(analysis)
    print(report)
