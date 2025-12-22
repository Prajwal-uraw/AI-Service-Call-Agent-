"""
Deal Control Plane (DCP) - Single source of truth for deal health
Answers: Will this close? Why / why not? What do we do next?
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from services.openai_service import get_openai_service

logger = logging.getLogger(__name__)

class DealControlPlane:
    """
    Analyzes deal health and provides actionable next steps
    Inputs: Call transcripts, CRM data, email/calendar activity
    Output: Deal score, risks, one recommended action
    """
    
    def __init__(self):
        self.openai_service = get_openai_service()
    
    async def analyze_deal(
        self,
        deal_id: str,
        transcripts: List[str],
        crm_data: Dict[str, Any],
        email_activity: Optional[List[Dict]] = None,
        calendar_activity: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Analyze deal and return health score + next action
        
        Returns:
            {
                "deal_score": 72,
                "missing_signals": ["budget", "decision_maker"],
                "risks": ["single-threaded", "no timeline"],
                "next_action": "Ask budget and confirm decision authority on next call",
                "confidence": 0.85
            }
        """
        try:
            # Extract signals from all inputs
            signals = await self.extract_signals(transcripts, crm_data, email_activity, calendar_activity)
            
            # Calculate deal score
            deal_score = self.calculate_deal_score(signals)
            
            # Identify missing signals
            missing_signals = self.identify_missing_signals(signals)
            
            # Identify risks
            risks = self.identify_risks(signals)
            
            # Generate next action
            next_action = await self.generate_next_action(signals, missing_signals, risks)
            
            return {
                "deal_score": deal_score,
                "missing_signals": missing_signals,
                "risks": risks,
                "next_action": next_action,
                "confidence": signals.get("confidence", 0.0),
                "analyzed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing deal: {e}")
            raise
    
    async def extract_signals(
        self,
        transcripts: List[str],
        crm_data: Dict[str, Any],
        email_activity: Optional[List[Dict]],
        calendar_activity: Optional[List[Dict]]
    ) -> Dict[str, Any]:
        """
        Extract key signals from all data sources
        
        Signals to extract:
        - budget_mentioned (Y/N)
        - decision_maker_present (Y/N)
        - timeline_stated (Y/N)
        - objections (type + count)
        - engagement_level (low/medium/high)
        """
        try:
            # Combine all transcripts
            full_transcript = "\n\n".join(transcripts)
            
            system_prompt = """You are a sales intelligence analyst.
Extract key signals from the call transcript and CRM data.

Signals to extract:
1. budget_mentioned: Has budget been discussed? (true/false)
2. decision_maker_present: Is the decision maker involved? (true/false)
3. timeline_stated: Has a timeline been mentioned? (true/false)
4. objections: List of objections raised (array)
5. engagement_level: Customer engagement (low/medium/high)
6. pain_points: Key pain points mentioned (array)
7. next_step_agreed: Was a next step agreed? (true/false)

Respond in JSON format only."""
            
            messages = [
                {
                    "role": "user",
                    "content": f"Transcript:\n{full_transcript}\n\nCRM Data:\n{crm_data}\n\nExtract signals:"
                }
            ]
            
            response = await self.openai_service.generate_response(
                messages=messages,
                system_prompt=system_prompt,
                use_premium=True,  # Use premium model for accuracy
                max_tokens=300,
                temperature=0.3
            )
            
            # Parse JSON response
            import json
            try:
                signals = json.loads(response["text"])
                signals["confidence"] = 0.85  # High confidence with GPT-4o
                return signals
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse signals JSON: {response['text']}")
                return {}
            
        except Exception as e:
            logger.error(f"Error extracting signals: {e}")
            return {}
    
    def calculate_deal_score(self, signals: Dict[str, Any]) -> int:
        """
        Calculate deal score (0-100) based on signals
        
        Scoring:
        - Budget mentioned: +30
        - Decision maker present: +25
        - Timeline stated: +20
        - Next step agreed: +15
        - High engagement: +10
        - No objections: +10 (or -5 per objection)
        """
        score = 0
        
        # Budget
        if signals.get("budget_mentioned"):
            score += 30
        
        # Decision maker
        if signals.get("decision_maker_present"):
            score += 25
        
        # Timeline
        if signals.get("timeline_stated"):
            score += 20
        
        # Next step
        if signals.get("next_step_agreed"):
            score += 15
        
        # Engagement
        engagement = signals.get("engagement_level", "low")
        if engagement == "high":
            score += 10
        elif engagement == "medium":
            score += 5
        
        # Objections (penalty)
        objections = signals.get("objections", [])
        score -= len(objections) * 5
        
        # Clamp to 0-100
        return max(0, min(100, score))
    
    def identify_missing_signals(self, signals: Dict[str, Any]) -> List[str]:
        """Identify which critical signals are missing"""
        missing = []
        
        if not signals.get("budget_mentioned"):
            missing.append("budget")
        
        if not signals.get("decision_maker_present"):
            missing.append("decision_maker")
        
        if not signals.get("timeline_stated"):
            missing.append("timeline")
        
        if not signals.get("next_step_agreed"):
            missing.append("next_step")
        
        return missing
    
    def identify_risks(self, signals: Dict[str, Any]) -> List[str]:
        """Identify deal risks"""
        risks = []
        
        # Single-threaded (only one contact)
        if not signals.get("decision_maker_present"):
            risks.append("single-threaded")
        
        # No timeline
        if not signals.get("timeline_stated"):
            risks.append("no timeline")
        
        # Low engagement
        if signals.get("engagement_level") == "low":
            risks.append("low engagement")
        
        # Multiple objections
        objections = signals.get("objections", [])
        if len(objections) >= 2:
            risks.append("multiple objections")
        
        # No next step
        if not signals.get("next_step_agreed"):
            risks.append("no next step")
        
        return risks[:3]  # Max 3 risks
    
    async def generate_next_action(
        self,
        signals: Dict[str, Any],
        missing_signals: List[str],
        risks: List[str]
    ) -> str:
        """
        Generate ONE recommended next action
        
        Priority:
        1. Address top risk
        2. Capture missing critical signal
        3. Advance deal stage
        """
        try:
            system_prompt = """You are a sales strategist.
Based on the deal signals, missing signals, and risks, recommend ONE specific next action.

Rules:
- Max 15 words
- Actionable and specific
- Focus on highest priority item
- No generic advice

Example: "Ask budget and confirm decision authority on next call"
"""
            
            messages = [
                {
                    "role": "user",
                    "content": f"Signals: {signals}\nMissing: {missing_signals}\nRisks: {risks}\n\nRecommend next action:"
                }
            ]
            
            response = await self.openai_service.generate_response(
                messages=messages,
                system_prompt=system_prompt,
                use_premium=False,  # Use fast model
                max_tokens=50,
                temperature=0.5
            )
            
            return response["text"].strip()
            
        except Exception as e:
            logger.error(f"Error generating next action: {e}")
            return "Schedule follow-up call to address open questions"


# Singleton instance
_dcp_instance: Optional[DealControlPlane] = None

def get_deal_control_plane() -> DealControlPlane:
    """Get or create Deal Control Plane instance"""
    global _dcp_instance
    if _dcp_instance is None:
        _dcp_instance = DealControlPlane()
    return _dcp_instance
