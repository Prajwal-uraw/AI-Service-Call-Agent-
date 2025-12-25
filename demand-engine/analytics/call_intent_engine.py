"""
Call Intent Classification Engine

Purpose: Automatically classify calls by intent and urgency using LLM
Priority: CRITICAL
Why: Needed for revenue modeling, conversion tracking, and report generation
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import json


class CallIntent(str, Enum):
    """Primary intent of the call"""
    EMERGENCY_REPAIR = "emergency_repair"
    ROUTINE_REPAIR = "routine_repair"
    MAINTENANCE = "maintenance"
    INSTALLATION_QUOTE = "installation_quote"
    GENERAL_INQUIRY = "general_inquiry"
    BILLING = "billing"
    FOLLOW_UP = "follow_up"
    UNKNOWN = "unknown"


class UrgencyLevel(str, Enum):
    """Urgency classification"""
    EMERGENCY = "emergency"  # Immediate attention needed
    PRIORITY = "priority"    # Same-day or next-day
    ROUTINE = "routine"      # Can be scheduled normally


class CallClassification(BaseModel):
    """Complete call classification result"""
    call_id: str
    transcript: str
    
    # Classification results
    intent: CallIntent
    urgency_level: UrgencyLevel
    high_intent: bool = Field(..., description="Likely to convert to booking")
    
    # Extracted signals
    intent_keywords: List[str] = Field(default_factory=list)
    urgency_keywords: List[str] = Field(default_factory=list)
    
    # Confidence and metadata
    confidence_score: float = Field(..., ge=0, le=1)
    classification_method: str = Field(default="llm")
    classified_at: datetime = Field(default_factory=datetime.now)
    
    # Additional context
    equipment_mentioned: Optional[str] = None
    problem_description: Optional[str] = None
    customer_sentiment: Optional[str] = None  # positive, neutral, negative


class CallIntentEngine:
    """
    Classifies call intent and urgency using LLM-based analysis.
    Provides structured output for revenue modeling and reporting.
    """
    
    # Urgency keywords for rule-based fallback
    EMERGENCY_KEYWORDS = [
        "emergency", "urgent", "immediately", "asap", "right now",
        "no cooling", "no heating", "no hot water", "no ac",
        "leak", "leaking", "flooding", "water damage",
        "smell", "burning smell", "gas smell", "smoke",
        "not working", "broken", "stopped working"
    ]
    
    PRIORITY_KEYWORDS = [
        "today", "tonight", "this evening", "as soon as possible",
        "before weekend", "intermittent", "sometimes works"
    ]
    
    def __init__(self, llm_client=None):
        """
        Initialize with optional LLM client.
        Falls back to rule-based classification if no LLM available.
        """
        self.llm_client = llm_client
    
    def classify_call(
        self,
        call_id: str,
        transcript: str,
        use_llm: bool = True
    ) -> CallClassification:
        """
        Classify a call based on its transcript.
        
        Args:
            call_id: Unique call identifier
            transcript: Full call transcript
            use_llm: Whether to use LLM (falls back to rules if False)
        
        Returns:
            CallClassification with intent, urgency, and metadata
        """
        if use_llm and self.llm_client:
            return self._classify_with_llm(call_id, transcript)
        else:
            return self._classify_with_rules(call_id, transcript)
    
    def _classify_with_llm(self, call_id: str, transcript: str) -> CallClassification:
        """
        Use LLM for classification (OpenAI/Anthropic with structured output).
        This is the preferred method for accuracy.
        """
        prompt = f"""
        Analyze this HVAC service call transcript and classify it.
        
        Transcript:
        {transcript}
        
        Provide classification in JSON format:
        {{
            "intent": "emergency_repair|routine_repair|maintenance|installation_quote|general_inquiry|billing|follow_up",
            "urgency_level": "emergency|priority|routine",
            "high_intent": true|false,
            "intent_keywords": ["keyword1", "keyword2"],
            "urgency_keywords": ["keyword1", "keyword2"],
            "equipment_mentioned": "brand/model if mentioned",
            "problem_description": "brief description",
            "customer_sentiment": "positive|neutral|negative",
            "confidence_score": 0.0-1.0
        }}
        
        Guidelines:
        - emergency: immediate danger, no cooling/heating, leaks, smells
        - priority: same-day need, intermittent issues
        - routine: can schedule normally
        - high_intent: likely to book (specific problem, ready to schedule)
        """
        
        # Call LLM (placeholder - implement with your LLM client)
        # response = self.llm_client.complete(prompt, response_format="json")
        # result = json.loads(response)
        
        # For now, fall back to rules
        return self._classify_with_rules(call_id, transcript)
    
    def _classify_with_rules(self, call_id: str, transcript: str) -> CallClassification:
        """
        Rule-based classification as fallback.
        Less accurate than LLM but deterministic.
        """
        transcript_lower = transcript.lower()
        
        # Detect urgency keywords
        urgency_keywords = []
        urgency_level = UrgencyLevel.ROUTINE
        
        for keyword in self.EMERGENCY_KEYWORDS:
            if keyword in transcript_lower:
                urgency_keywords.append(keyword)
                urgency_level = UrgencyLevel.EMERGENCY
        
        if urgency_level != UrgencyLevel.EMERGENCY:
            for keyword in self.PRIORITY_KEYWORDS:
                if keyword in transcript_lower:
                    urgency_keywords.append(keyword)
                    urgency_level = UrgencyLevel.PRIORITY
        
        # Detect intent
        intent = CallIntent.UNKNOWN
        intent_keywords = []
        
        # Emergency repair
        if urgency_level == UrgencyLevel.EMERGENCY:
            intent = CallIntent.EMERGENCY_REPAIR
            intent_keywords.extend(urgency_keywords)
        
        # Installation/quote
        elif any(word in transcript_lower for word in ['install', 'new unit', 'replace', 'quote', 'estimate']):
            intent = CallIntent.INSTALLATION_QUOTE
            intent_keywords = ['installation', 'quote']
        
        # Maintenance
        elif any(word in transcript_lower for word in ['maintenance', 'tune-up', 'service', 'check-up', 'inspection']):
            intent = CallIntent.MAINTENANCE
            intent_keywords = ['maintenance']
        
        # Billing
        elif any(word in transcript_lower for word in ['bill', 'invoice', 'payment', 'charge']):
            intent = CallIntent.BILLING
            intent_keywords = ['billing']
        
        # Repair (default for service calls)
        elif any(word in transcript_lower for word in ['repair', 'fix', 'broken', 'not working', 'problem']):
            intent = CallIntent.ROUTINE_REPAIR
            intent_keywords = ['repair']
        
        # General inquiry
        else:
            intent = CallIntent.GENERAL_INQUIRY
            intent_keywords = ['inquiry']
        
        # Determine high-intent
        high_intent = intent in [
            CallIntent.EMERGENCY_REPAIR,
            CallIntent.ROUTINE_REPAIR,
            CallIntent.INSTALLATION_QUOTE
        ]
        
        # Confidence (rule-based is lower confidence)
        confidence_score = 0.7 if intent_keywords else 0.5
        
        return CallClassification(
            call_id=call_id,
            transcript=transcript,
            intent=intent,
            urgency_level=urgency_level,
            high_intent=high_intent,
            intent_keywords=intent_keywords,
            urgency_keywords=urgency_keywords,
            confidence_score=confidence_score,
            classification_method="rule_based"
        )
    
    def batch_classify(
        self,
        calls: List[Dict[str, str]]
    ) -> List[CallClassification]:
        """
        Classify multiple calls in batch.
        More efficient for large datasets.
        """
        results = []
        for call in calls:
            classification = self.classify_call(
                call_id=call['call_id'],
                transcript=call['transcript']
            )
            results.append(classification)
        
        return results
    
    def get_classification_summary(
        self,
        classifications: List[CallClassification]
    ) -> Dict[str, Any]:
        """
        Generate summary statistics from classifications.
        Useful for pilot reports.
        """
        total = len(classifications)
        
        # Count by intent
        by_intent = {}
        for intent in CallIntent:
            count = sum(1 for c in classifications if c.intent == intent)
            by_intent[intent.value] = {
                "count": count,
                "percentage": count / total if total > 0 else 0
            }
        
        # Count by urgency
        by_urgency = {}
        for urgency in UrgencyLevel:
            count = sum(1 for c in classifications if c.urgency_level == urgency)
            by_urgency[urgency.value] = {
                "count": count,
                "percentage": count / total if total > 0 else 0
            }
        
        # High-intent calls
        high_intent_count = sum(1 for c in classifications if c.high_intent)
        
        # Average confidence
        avg_confidence = sum(c.confidence_score for c in classifications) / total if total > 0 else 0
        
        return {
            "total_calls": total,
            "by_intent": by_intent,
            "by_urgency": by_urgency,
            "high_intent_calls": high_intent_count,
            "high_intent_percentage": high_intent_count / total if total > 0 else 0,
            "average_confidence": avg_confidence
        }


# Example usage
if __name__ == "__main__":
    engine = CallIntentEngine()
    
    # Example transcripts
    test_calls = [
        {
            "call_id": "call_001",
            "transcript": "Hi, my AC stopped working and it's 95 degrees in here. I need someone out today if possible."
        },
        {
            "call_id": "call_002",
            "transcript": "I'd like to schedule a maintenance check for my furnace before winter."
        },
        {
            "call_id": "call_003",
            "transcript": "Emergency! There's water leaking from my AC unit all over the floor!"
        },
        {
            "call_id": "call_004",
            "transcript": "Can you give me a quote for installing a new HVAC system? My current one is 20 years old."
        },
        {
            "call_id": "call_005",
            "transcript": "I have a question about my last invoice."
        }
    ]
    
    print("🔍 Classifying Calls...\n")
    
    # Classify each call
    classifications = []
    for call in test_calls:
        result = engine.classify_call(call['call_id'], call['transcript'])
        classifications.append(result)
        
        print(f"Call {call['call_id']}:")
        print(f"  Intent: {result.intent.value}")
        print(f"  Urgency: {result.urgency_level.value}")
        print(f"  High Intent: {result.high_intent}")
        print(f"  Keywords: {', '.join(result.intent_keywords + result.urgency_keywords)}")
        print(f"  Confidence: {result.confidence_score:.1%}")
        print()
    
    # Generate summary
    summary = engine.get_classification_summary(classifications)
    
    print("📊 Classification Summary:")
    print(f"  Total Calls: {summary['total_calls']}")
    print(f"  High-Intent Calls: {summary['high_intent_calls']} ({summary['high_intent_percentage']:.1%})")
    print(f"  Average Confidence: {summary['average_confidence']:.1%}")
    print()
    
    print("By Intent:")
    for intent, data in summary['by_intent'].items():
        if data['count'] > 0:
            print(f"  {intent}: {data['count']} ({data['percentage']:.1%})")
    
    print("\nBy Urgency:")
    for urgency, data in summary['by_urgency'].items():
        if data['count'] > 0:
            print(f"  {urgency}: {data['count']} ({data['percentage']:.1%})")
