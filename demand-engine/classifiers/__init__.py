"""Classification module for scoring and qualifying signals."""

from .keywords import calculate_keyword_score, should_use_ai_classification

__all__ = [
    "calculate_keyword_score",
    "should_use_ai_classification",
]
