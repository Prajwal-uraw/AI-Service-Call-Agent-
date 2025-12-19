"""
Sentiment and Frustration Detection for HVAC Voice Agent.

Detects caller frustration and emotional state to enable:
- Proactive escalation to human agents
- Empathetic response selection
- Conversation quality monitoring

Features:
- Keyword-based frustration detection
- Repetition detection (caller repeating themselves)
- Conversation length monitoring
- Escalation threshold configuration
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime

from app.utils.logging import get_logger

logger = get_logger("sentiment")

# Frustration indicators organized by severity
FRUSTRATION_INDICATORS = {
    # Explicit frustration (high weight)
    "explicit": [
        "frustrated", "frustrating", "annoyed", "annoying",
        "angry", "upset", "ridiculous", "unacceptable",
        "terrible", "horrible", "awful", "worst",
        "hate", "stupid", "useless", "incompetent",
    ],
    
    # Implicit frustration (medium weight)
    "implicit": [
        "already told you", "i said", "i already said",
        "for the third time", "again", "once again",
        "how many times", "keep asking", "stop asking",
        "not listening", "you're not", "you are not",
        "this is taking", "too long", "waste of time",
    ],
    
    # Escalation requests (high weight)
    "escalation": [
        "manager", "supervisor", "human", "real person",
        "someone else", "transfer me", "speak to someone",
        "talk to a person", "representative", "agent",
        "let me talk to", "get me someone",
    ],
    
    # Negative sentiment (low weight)
    "negative": [
        "don't understand", "doesn't work", "not working",
        "broken", "failed", "problem", "issue", "wrong",
        "confused", "confusing", "difficult",
    ],
    
    # Urgency indicators (context-dependent)
    "urgency": [
        "emergency", "urgent", "immediately", "right now",
        "asap", "can't wait", "need help now",
    ],
}

# Weights for each category
CATEGORY_WEIGHTS = {
    "explicit": 3,
    "implicit": 2,
    "escalation": 4,  # Highest - direct request for human
    "negative": 1,
    "urgency": 1,
}

# Thresholds
FRUSTRATION_THRESHOLD_LOW = 2
FRUSTRATION_THRESHOLD_MEDIUM = 4
FRUSTRATION_THRESHOLD_HIGH = 6
ESCALATION_THRESHOLD = 5


@dataclass
class SentimentResult:
    """Result of sentiment analysis."""
    frustration_score: int = 0
    sentiment: str = "neutral"  # positive, neutral, negative, frustrated
    should_escalate: bool = False
    escalation_reason: Optional[str] = None
    detected_indicators: List[str] = field(default_factory=list)
    categories_triggered: Dict[str, int] = field(default_factory=dict)


class SentimentAnalyzer:
    """
    Analyzes caller sentiment and frustration level.
    
    Tracks frustration across the conversation and recommends
    escalation when thresholds are exceeded.
    
    Usage:
        analyzer = SentimentAnalyzer()
        
        # Analyze each utterance
        result = analyzer.analyze("I already told you my name!")
        
        if result.should_escalate:
            # Transfer to human agent
            pass
    """
    
    def __init__(self):
        self._history: List[str] = []
        self._cumulative_score: int = 0
        self._turn_count: int = 0
        self._repetition_count: int = 0
        self._last_analysis: Optional[SentimentResult] = None
    
    def analyze(
        self,
        text: str,
        conversation_history: Optional[List[str]] = None,
    ) -> SentimentResult:
        """
        Analyze sentiment of an utterance.
        
        Args:
            text: Current utterance
            conversation_history: Optional list of previous utterances
            
        Returns:
            SentimentResult with frustration score and recommendations
        """
        result = SentimentResult()
        text_lower = text.lower()
        
        # Check each category
        for category, keywords in FRUSTRATION_INDICATORS.items():
            weight = CATEGORY_WEIGHTS.get(category, 1)
            matches = []
            
            for keyword in keywords:
                if keyword in text_lower:
                    matches.append(keyword)
                    result.frustration_score += weight
            
            if matches:
                result.categories_triggered[category] = len(matches)
                result.detected_indicators.extend(matches)
        
        # Check for repetition
        if conversation_history:
            repetition_score = self._check_repetition(text, conversation_history)
            result.frustration_score += repetition_score
            if repetition_score > 0:
                result.detected_indicators.append("repetition_detected")
        
        # Check conversation length
        self._turn_count += 1
        if self._turn_count > 15:
            result.frustration_score += 1
            result.detected_indicators.append("long_conversation")
        if self._turn_count > 25:
            result.frustration_score += 2
            result.detected_indicators.append("very_long_conversation")
        
        # Update cumulative score
        self._cumulative_score += result.frustration_score
        
        # Determine sentiment
        if result.frustration_score >= FRUSTRATION_THRESHOLD_HIGH:
            result.sentiment = "frustrated"
        elif result.frustration_score >= FRUSTRATION_THRESHOLD_MEDIUM:
            result.sentiment = "negative"
        elif any(word in text_lower for word in ["thank", "great", "perfect", "wonderful"]):
            result.sentiment = "positive"
        else:
            result.sentiment = "neutral"
        
        # Check escalation
        if "escalation" in result.categories_triggered:
            result.should_escalate = True
            result.escalation_reason = "Customer requested human agent"
        elif result.frustration_score >= ESCALATION_THRESHOLD:
            result.should_escalate = True
            result.escalation_reason = f"High frustration score: {result.frustration_score}"
        elif self._cumulative_score >= ESCALATION_THRESHOLD * 2:
            result.should_escalate = True
            result.escalation_reason = f"Cumulative frustration: {self._cumulative_score}"
        
        # Store for history
        self._history.append(text)
        self._last_analysis = result
        
        # Log if significant
        if result.frustration_score >= FRUSTRATION_THRESHOLD_LOW:
            logger.info(
                "Frustration detected: score=%d, indicators=%s",
                result.frustration_score,
                result.detected_indicators[:3]
            )
        
        return result
    
    def _check_repetition(
        self,
        text: str,
        history: List[str],
    ) -> int:
        """
        Check if caller is repeating themselves.
        
        Returns additional frustration score for repetition.
        """
        if not history:
            return 0
        
        text_words = set(text.lower().split())
        
        # Check last 3 utterances for similarity
        for prev in history[-3:]:
            prev_words = set(prev.lower().split())
            
            # Calculate Jaccard similarity
            if text_words and prev_words:
                intersection = len(text_words & prev_words)
                union = len(text_words | prev_words)
                similarity = intersection / union if union > 0 else 0
                
                if similarity > 0.7:  # High similarity = repetition
                    self._repetition_count += 1
                    return 2 if self._repetition_count > 1 else 1
        
        return 0
    
    def get_frustration_level(self) -> int:
        """
        Get current frustration level (0-5 scale).
        
        Returns:
            0: No frustration
            1: Slight frustration
            2: Mild frustration
            3: Moderate frustration
            4: High frustration
            5: Severe frustration (escalate immediately)
        """
        if self._last_analysis is None:
            return 0
        
        score = self._last_analysis.frustration_score
        
        if score == 0:
            return 0
        elif score <= 2:
            return 1
        elif score <= 4:
            return 2
        elif score <= 6:
            return 3
        elif score <= 8:
            return 4
        else:
            return 5
    
    def should_use_empathetic_response(self) -> bool:
        """Check if empathetic responses should be used."""
        return self.get_frustration_level() >= 2
    
    def reset(self):
        """Reset the analyzer state."""
        self._history.clear()
        self._cumulative_score = 0
        self._turn_count = 0
        self._repetition_count = 0
        self._last_analysis = None
    
    def get_stats(self) -> Dict[str, Any]:
        """Get analyzer statistics."""
        return {
            "turn_count": self._turn_count,
            "cumulative_score": self._cumulative_score,
            "repetition_count": self._repetition_count,
            "current_frustration_level": self.get_frustration_level(),
            "last_sentiment": self._last_analysis.sentiment if self._last_analysis else None,
        }


# Global instance per call (should be created per call session)
_analyzers: Dict[str, SentimentAnalyzer] = {}


def get_analyzer(call_sid: str) -> SentimentAnalyzer:
    """Get or create analyzer for a call."""
    if call_sid not in _analyzers:
        _analyzers[call_sid] = SentimentAnalyzer()
    return _analyzers[call_sid]


def clear_analyzer(call_sid: str):
    """Clear analyzer for a call."""
    if call_sid in _analyzers:
        del _analyzers[call_sid]


def analyze_sentiment(
    text: str,
    call_sid: Optional[str] = None,
    conversation_history: Optional[List[str]] = None,
) -> SentimentResult:
    """
    Convenience function to analyze sentiment.
    
    Args:
        text: Utterance to analyze
        call_sid: Optional call ID for stateful analysis
        conversation_history: Optional conversation history
        
    Returns:
        SentimentResult
    """
    if call_sid:
        analyzer = get_analyzer(call_sid)
    else:
        analyzer = SentimentAnalyzer()
    
    return analyzer.analyze(text, conversation_history)


def get_frustration_level(call_sid: str) -> int:
    """
    Get frustration level for a call.
    
    Args:
        call_sid: Call ID
        
    Returns:
        Frustration level (0-5)
    """
    if call_sid in _analyzers:
        return _analyzers[call_sid].get_frustration_level()
    return 0
