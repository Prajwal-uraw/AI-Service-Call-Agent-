"""
AI Sales Flow Engine - 5-Phase Hard-Coded Sales Demo
Phases: Framing → Discovery → Pitch → Close → Exit
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

class Phase(Enum):
    """Sales demo phases"""
    FRAMING = "framing"
    DISCOVERY = "discovery"
    PITCH = "pitch"
    CLOSE = "close"
    EXIT = "exit"

@dataclass
class PhaseConfig:
    """Configuration for each phase"""
    name: str
    duration_minutes: tuple  # (min, max)
    use_llm: bool
    use_streaming: bool
    max_ai_turns: int
    scripts: List[str]

# ==================== PHASE CONFIGURATIONS ====================

PHASE_CONFIGS = {
    Phase.FRAMING: PhaseConfig(
        name="Framing",
        duration_minutes=(0, 2),
        use_llm=True,
        use_streaming=True,
        max_ai_turns=3,
        scripts=[
            "Hi {customer_name}, I'm your AI Sales Advisor from Kestrel AI.",
            "I'm here to show you how our voice agent can transform your {industry} business.",
            "This will take about 15 minutes. We'll cover your current challenges, see a quick demo, and discuss next steps.",
            "Sound good?"
        ]
    ),
    
    Phase.DISCOVERY: PhaseConfig(
        name="Discovery",
        duration_minutes=(2, 6),
        use_llm=True,
        use_streaming=True,
        max_ai_turns=6,  # 3 questions + 3 follow-ups
        scripts=[
            "Great! Let me ask you a few quick questions to understand your needs.",
            "First, how many calls does your team handle per day?",
            "What's your biggest challenge with after-hours calls?",
            "Are you currently using any automation for calls or scheduling?"
        ]
    ),
    
    Phase.PITCH: PhaseConfig(
        name="Pitch",
        duration_minutes=(6, 11),
        use_llm=False,  # Pre-written scripts only
        use_streaming=False,
        max_ai_turns=4,
        scripts=[
            # Block 1: Problem
            "Based on what you've shared, let me show you how we can help. "
            "Most {industry} businesses lose 30 to 40 percent of after-hours calls. "
            "That's $50,000 to $100,000 in revenue walking away every year.",
            
            # Block 2: Solution
            "Our AI voice agent answers every call, 24/7. "
            "It books appointments, handles emergencies, and updates your CRM automatically. "
            "No more missed calls, no more lost revenue.",
            
            # Block 3: Proof
            "Our customers see an 85% booking rate and save 20 hours per week. "
            "That's time your team can spend on actual service calls, not phone tag.",
            
            # Block 4: Demo
            "Let me play you a quick 90-second demo call so you can hear it in action."
            # [Play pre-recorded demo audio]
        ]
    ),
    
    Phase.CLOSE: PhaseConfig(
        name="Close",
        duration_minutes=(11, 14),
        use_llm=True,
        use_streaming=True,
        max_ai_turns=5,
        scripts=[
            "So, {customer_name}, what do you think?",
            "I have three options for next steps:",
            "Option 1: Book a call with our team to discuss your specific setup.",
            "Option 2: Start a 14-day trial and see it live with your business.",
            "Option 3: I can send you our detailed deck with pricing and case studies.",
            "Which would be most helpful for you?"
        ]
    ),
    
    Phase.EXIT: PhaseConfig(
        name="Exit",
        duration_minutes=(14, 15),
        use_llm=True,
        use_streaming=True,
        max_ai_turns=2,
        scripts=[
            "Perfect! I've {action_taken}.",
            "You'll get a confirmation email in the next 2 minutes with all the details.",
            "Any final questions before we wrap up?",
            "Great talking with you, {customer_name}. Looking forward to helping {company_name} grow!"
        ]
    )
}

# ==================== DISCOVERY QUESTIONS ====================

DISCOVERY_QUESTIONS = [
    {
        "question": "How many calls does your team handle per day?",
        "intent": "volume",
        "follow_up": "And how many of those are after-hours or weekends?"
    },
    {
        "question": "What's your biggest challenge with after-hours calls?",
        "intent": "pain_point",
        "follow_up": "How much revenue do you estimate you're losing from missed calls?"
    },
    {
        "question": "Are you currently using any automation for calls or scheduling?",
        "intent": "current_solution",
        "follow_up": "What's working well, and what's frustrating about it?"
    }
]

# ==================== ICP QUALIFICATION LOGIC ====================

def qualify_icp(discovery_answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Qualify if customer is ICP fit based on discovery answers
    
    Returns:
        {
            "icp_fit": True/False,
            "icp_score": 0.0-1.0,
            "urgency": "low/medium/high",
            "authority": "owner/manager/staff",
            "budget_indicator": "good/medium/poor"
        }
    """
    score = 0.0
    urgency = "low"
    authority = "unknown"
    budget_indicator = "unknown"
    
    # Volume check
    daily_calls = discovery_answers.get("daily_call_volume", 0)
    if daily_calls >= 50:
        score += 0.4
        urgency = "high"
    elif daily_calls >= 20:
        score += 0.2
        urgency = "medium"
    
    # Pain point check
    pain_points = discovery_answers.get("pain_points", [])
    high_value_pains = ["missed calls", "after hours", "revenue loss", "hiring", "scaling"]
    if any(pain in " ".join(pain_points).lower() for pain in high_value_pains):
        score += 0.3
    
    # Current automation check
    current_automation = discovery_answers.get("current_automation", "").lower()
    if "none" in current_automation or "no" in current_automation:
        score += 0.2  # Greenfield opportunity
    elif "frustrated" in current_automation or "not working" in current_automation:
        score += 0.1  # Replacement opportunity
    
    # Authority check (from job title or language)
    title = discovery_answers.get("job_title", "").lower()
    if "owner" in title or "ceo" in title:
        authority = "owner"
        score += 0.1
    elif "manager" in title or "director" in title:
        authority = "manager"
    
    # Budget indicator
    if daily_calls >= 50:
        budget_indicator = "good"  # High volume = can afford
    elif daily_calls >= 20:
        budget_indicator = "medium"
    else:
        budget_indicator = "poor"
    
    icp_fit = score >= 0.5
    
    return {
        "icp_fit": icp_fit,
        "icp_score": round(score, 2),
        "urgency": urgency,
        "authority": authority,
        "budget_indicator": budget_indicator
    }

# ==================== CTA OPTIONS ====================

CTA_OPTIONS = {
    "book_human_call": {
        "name": "Book a call with our team",
        "action": "schedule_call",
        "calendar_link": "https://cal.com/kestrel-ai/demo",
        "script": "I've sent you a calendar link. Pick a time that works for you."
    },
    "start_trial": {
        "name": "Start 14-day trial",
        "action": "start_trial",
        "signup_link": "https://app.kestrel.ai/trial",
        "script": "I've sent you the trial signup link. You'll be live in 24 hours."
    },
    "get_deck": {
        "name": "Get the deck",
        "action": "send_deck",
        "deck_url": "https://kestrel.ai/deck.pdf",
        "script": "I've sent the deck to your email. It has pricing, case studies, and FAQs."
    }
}

# ==================== GUARDRAILS ====================

GUARDRAILS = {
    "max_duration_seconds": 900,  # 15 minutes
    "max_ai_turns": 20,
    "max_words_per_response": 60,
    "max_tts_seconds": 8,
    "cost_limit_per_call": 2.00,
    
    # Forbidden topics
    "forbidden_topics": [
        "pricing negotiation",
        "custom features",
        "discounts",
        "legal advice",
        "technical implementation details"
    ],
    
    # Human escalation triggers
    "escalation_triggers": [
        "pricing objection",
        "legal question",
        "procurement process",
        "wants to speak to human",
        "technical deep dive"
    ]
}

# ==================== PHASE MANAGER ====================

class PhaseManager:
    """Manages phase transitions and guardrails"""
    
    def __init__(self):
        self.current_phase = Phase.FRAMING
        self.phase_start_time = None
        self.ai_turn_count = 0
        self.total_cost = 0.0
        self.discovery_answers = {}
        
    def get_current_phase_config(self) -> PhaseConfig:
        """Get configuration for current phase"""
        return PHASE_CONFIGS[self.current_phase]
    
    def should_advance_phase(self, elapsed_minutes: float) -> bool:
        """Check if should advance to next phase"""
        config = self.get_current_phase_config()
        return elapsed_minutes >= config.duration_minutes[1]
    
    def advance_phase(self) -> Optional[Phase]:
        """Move to next phase"""
        phases = list(Phase)
        current_index = phases.index(self.current_phase)
        
        if current_index < len(phases) - 1:
            self.current_phase = phases[current_index + 1]
            self.phase_start_time = None
            return self.current_phase
        
        return None  # All phases complete
    
    def check_guardrails(self, elapsed_seconds: int) -> Dict[str, bool]:
        """Check if any guardrails violated"""
        return {
            "duration_exceeded": elapsed_seconds > GUARDRAILS["max_duration_seconds"],
            "turns_exceeded": self.ai_turn_count > GUARDRAILS["max_ai_turns"],
            "cost_exceeded": self.total_cost > GUARDRAILS["cost_limit_per_call"]
        }
    
    def should_escalate_to_human(self, message: str) -> bool:
        """Check if should escalate to human"""
        message_lower = message.lower()
        return any(
            trigger in message_lower 
            for trigger in GUARDRAILS["escalation_triggers"]
        )
