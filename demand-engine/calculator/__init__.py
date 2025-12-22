"""
Calculator module for ROI calculations and lead generation
"""

from .engine import calculate_missed_call_tax, calculate_roi
from .models import CalculatorInput, CalculatorResult

__all__ = [
    "calculate_missed_call_tax",
    "calculate_roi",
    "CalculatorInput",
    "CalculatorResult",
]
