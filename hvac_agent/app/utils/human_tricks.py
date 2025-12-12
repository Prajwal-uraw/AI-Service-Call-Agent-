"""
Human Perception Engineering for HVAC Voice Agent.

Advanced call center tricks that make AI sound human.
These are operator-level techniques not found in documentation.

Core principle: You don't need smarter AI, you need better illusion management.
"""

import random
import time
from typing import Optional, List, Dict, Set
from dataclasses import dataclass, field
from enum import Enum


class FillerCategory(Enum):
    """Categories of filler phrases."""
    MICRO_ACK = "micro_ack"           # <300ms acknowledgments
    THINKING = "thinking"              # While processing
    TRANSITION = "transition"          # Moving between topics
    EMPATHY = "empathy"               # Emotional calibration
    CONFIRMATION = "confirmation"      # Before committing


@dataclass
class CallPersonality:
    """
    Per-call personality state to avoid repetition and track pacing.
    
    Key insight: Never reuse the same filler twice in a call.
    """
    call_sid: str
    used_fillers: Set[str] = field(default_factory=set)
    used_acks: Set[str] = field(default_factory=set)
    thinking_moment_used: bool = False  # Only one 2-3s pause per call
    imperfection_used: bool = False     # Only one "restart" per call
    caller_pace: str = "medium"         # fast, medium, slow
    turn_count: int = 0
    last_topic: Optional[str] = None
    
    def mark_filler_used(self, filler: str) -> None:
        """Mark a filler as used so we don't repeat it."""
        self.used_fillers.add(filler.lower())
    
    def mark_ack_used(self, ack: str) -> None:
        """Mark an acknowledgment as used."""
        self.used_acks.add(ack.lower())
    
    def can_use_thinking_moment(self) -> bool:
        """Check if we can use the one allowed long pause."""
        if not self.thinking_moment_used:
            self.thinking_moment_used = True
            return True
        return False
    
    def can_use_imperfection(self) -> bool:
        """Check if we can use the one allowed mid-sentence restart."""
        if not self.imperfection_used:
            self.imperfection_used = True
            return True
        return False


# Store per-call personality state
_call_personalities: Dict[str, CallPersonality] = {}


def get_personality(call_sid: str) -> CallPersonality:
    """Get or create personality state for a call."""
    if call_sid not in _call_personalities:
        _call_personalities[call_sid] = CallPersonality(call_sid=call_sid)
    return _call_personalities[call_sid]


def cleanup_personality(call_sid: str) -> None:
    """Clean up personality state when call ends."""
    if call_sid in _call_personalities:
        del _call_personalities[call_sid]


# =============================================================================
# MICRO-ACKNOWLEDGMENTS (<300ms responses)
# =============================================================================

# Warm, friendly micro-acks
MICRO_ACKS = [
    "Oh absolutely!",
    "You got it!",
    "Sure thing!",
    "Of course!",
    "I hear ya!",
]

# Extra warm Texas variants
TEXAS_MICRO_ACKS = [
    "Oh for sure, hon!",
    "Absolutely!",
    "You bet!",
    "Of course, sweetie!",
]


def get_micro_ack(call_sid: str) -> str:
    """
    Get a micro-acknowledgment that hasn't been used this call.
    These should be spoken in <300ms to confirm presence before thinking.
    """
    personality = get_personality(call_sid)
    
    # Combine pools
    all_acks = MICRO_ACKS + TEXAS_MICRO_ACKS
    
    # Filter out used ones
    available = [a for a in all_acks if a.lower() not in personality.used_acks]
    
    # If all used, reset (shouldn't happen in normal call)
    if not available:
        personality.used_acks.clear()
        available = all_acks
    
    ack = random.choice(available)
    personality.mark_ack_used(ack)
    return ack


# =============================================================================
# THINKING FILLERS (Conversational back-pressure)
# =============================================================================

# Warm, friendly thinking fillers
THINKING_FILLERS = [
    "Let me take a quick look here...",
    "Okay, give me just a sec...",
    "Alrighty, let me check on that for ya...",
    "One moment, hon...",
    "Let me see what we've got...",
]

# Extra warm Texas variants
TEXAS_THINKING_FILLERS = [
    "Okie dokie, let me check...",
    "Hang on just a sec, sweetie...",
    "Let me pull that up for ya...",
]


def get_thinking_filler(call_sid: str) -> str:
    """
    Get a thinking filler that hasn't been used this call.
    Creates illusion of parallel processing.
    """
    personality = get_personality(call_sid)
    
    all_fillers = THINKING_FILLERS + TEXAS_THINKING_FILLERS
    available = [f for f in all_fillers if f.lower() not in personality.used_fillers]
    
    if not available:
        personality.used_fillers.clear()
        available = all_fillers
    
    filler = random.choice(available)
    personality.mark_filler_used(filler)
    return filler


# =============================================================================
# INTENTIONAL IMPERFECTION
# =============================================================================

def add_imperfection(response: str, call_sid: str) -> str:
    """
    Add one controlled imperfection per call.
    
    Pattern: "Okay— one second… checking that."
    The dash and restart make it sound human.
    """
    personality = get_personality(call_sid)
    
    if not personality.can_use_imperfection():
        return response
    
    # Only add to certain types of responses
    if len(response) < 20:
        return response
    
    # Add a mid-sentence restart at a natural point
    imperfections = [
        ("Let me", "Let me— actually, let me"),
        ("I'll", "I'll— one sec, I'll"),
        ("We can", "We can— yeah, we can"),
        ("So ", "So— "),
    ]
    
    for original, replacement in imperfections:
        if original in response:
            # Only replace first occurrence, and only 30% of the time
            if random.random() < 0.3:
                return response.replace(original, replacement, 1)
            break
    
    return response


# =============================================================================
# SOFT UNCERTAINTY (Never be perfectly certain)
# =============================================================================

# Dispatcher doesn't hedge - but avoids robotic over-certainty
CERTAINTY_SOFTENERS = {
    "Your appointment has been confirmed": "You're set",
    "Your appointment is confirmed": "You're booked",
    "I have confirmed": "You're set",
    "That has been scheduled": "You're on the schedule",
}


def soften_certainty(response: str) -> str:
    """
    Replace over-confident phrases with softer alternatives.
    Over-confidence sounds fake.
    """
    for certain, soft in CERTAINTY_SOFTENERS.items():
        if certain in response:
            response = response.replace(certain, soft, 1)
            break  # Only one softening per response
    return response


# =============================================================================
# CONTEXT ANCHORING
# =============================================================================

def add_context_anchor(response: str, last_topic: Optional[str], caller_name: Optional[str]) -> str:
    """
    Reference prior context casually to make memory feel real.
    
    Example: "About the service in Dallas— morning works best."
    """
    if not last_topic:
        return response
    
    # Only anchor sometimes (30%)
    if random.random() > 0.3:
        return response
    
    anchors = {
        "booking": "About that appointment— ",
        "schedule": "For the scheduling— ",
        "dallas": "For the Dallas location— ",
        "fort worth": "For Fort Worth— ",
        "arlington": "For Arlington— ",
        "ac": "About your AC— ",
        "heating": "About the heating— ",
        "repair": "For that repair— ",
    }
    
    for keyword, anchor in anchors.items():
        if keyword in last_topic.lower():
            # Don't add if response already starts with similar
            if not response.lower().startswith(("about", "for the", "regarding")):
                return anchor + response[0].lower() + response[1:]
            break
    
    return response


# =============================================================================
# INTENT CONFIRMATION
# =============================================================================

# Dispatcher-style intent confirms - direct, no hedging
INTENT_CONFIRMS = {
    "price": "Asking about pricing.",
    "cost": "Asking about costs.",
    "cancel": "You want to cancel.",
    "reschedule": "You want to reschedule.",
    "emergency": "Is this an emergency.",
}


def should_confirm_intent(user_text: str) -> Optional[str]:
    """
    Check if we should confirm intent before answering.
    Reduces wrong answers and buys thinking time.
    """
    text_lower = user_text.lower()
    
    for keyword, confirmation in INTENT_CONFIRMS.items():
        if keyword in text_lower:
            # Only confirm 40% of the time to not be annoying
            if random.random() < 0.4:
                return confirmation
    
    return None


# =============================================================================
# DECISION FRAMING
# =============================================================================

def frame_decision(options: List[str]) -> str:
    """
    Frame choices to feel helpful, not robotic.
    
    Instead of: "What do you want to do?"
    Say: "We can book now, or I can answer a question."
    """
    if len(options) == 2:
        return f"We can {options[0]}, or {options[1]}. What sounds good?"
    elif len(options) > 2:
        opts = ", ".join(options[:-1]) + f", or {options[-1]}"
        return f"I can help with {opts}. What do you need?"
    return ""


# =============================================================================
# END-OF-TURN INVITATIONS
# =============================================================================

def add_turn_invitation(response: str) -> str:
    """
    Add dispatcher-style turn invitation.
    Direct, not soft.
    """
    # If response already ends with a question, leave it
    if response.rstrip().endswith("?"):
        return response
    
    # Dispatcher-style follow-ups - direct, decision-framed
    invitations = [
        " Morning or afternoon.",
        " What city.",
        " Anything else.",
    ]
    
    # Only add 15% of the time - dispatcher doesn't over-ask
    if random.random() < 0.15:
        return response.rstrip(".") + random.choice(invitations)
    
    return response


# =============================================================================
# SILENCE REFRAMING (Texas dispatcher style)
# =============================================================================

# First silence: "I'm here."
# Second silence: "I'll disconnect now."
# No "please". No softness.
SILENCE_RESPONSES = [
    "I'm here.",
]

SILENCE_SECOND = [
    "I'll disconnect now.",
]


def get_silence_response(is_second: bool = False) -> str:
    """
    Get silence response - dispatcher style.
    
    First silence: "I'm here."
    Second silence: "I'll disconnect now."
    No "please". No softness.
    """
    if is_second:
        return random.choice(SILENCE_SECOND)
    return random.choice(SILENCE_RESPONSES)


# =============================================================================
# EMOTIONAL CALIBRATION (Texas dispatcher style)
# =============================================================================

# Brief acknowledgment, then move forward
# Do NOT empathize excessively - Texans read that as weakness
CALIBRATION_PHRASES = [
    "I understand.",
    "Okay. I understand.",
    "That's common.",
    "We see that a lot.",
]


def get_calibration_phrase() -> str:
    """
    Get a tiny empathy phrase without elaboration.
    One phrase max, no over-explaining.
    """
    return random.choice(CALIBRATION_PHRASES)


# =============================================================================
# DISPATCHER-STYLE EXIT
# =============================================================================

# Human-like exit phrases - warm and caring
EXIT_PHRASES = [
    "Thanks so much for calling! Y'all take care now!",
    "Have a wonderful day, hon! We'll see you soon!",
    "Alrighty, you take care! Don't be a stranger!",
    "Thanks for choosing us! Stay cool out there!",
]


def get_human_exit(caller_name: Optional[str] = None) -> str:
    """
    Get a dispatcher-style exit phrase.
    Never say goodbye cheerfully. Signal follow-through.
    """
    return random.choice(EXIT_PHRASES)


# =============================================================================
# ADAPTIVE PACING
# =============================================================================

def detect_caller_pace(speech_duration_ms: int, word_count: int) -> str:
    """
    Detect caller's speaking pace.
    
    Args:
        speech_duration_ms: How long they spoke
        word_count: Approximate word count
        
    Returns:
        "fast", "medium", or "slow"
    """
    if word_count == 0:
        return "medium"
    
    # Words per minute calculation
    wpm = (word_count / speech_duration_ms) * 60000
    
    if wpm > 160:
        return "fast"
    elif wpm < 120:
        return "slow"
    return "medium"


def get_response_delay_ms(caller_pace: str) -> int:
    """
    Get appropriate response delay based on caller pace.
    Match their rhythm ±15%.
    """
    delays = {
        "fast": random.randint(200, 400),
        "medium": random.randint(400, 700),
        "slow": random.randint(600, 900),
    }
    return delays.get(caller_pace, 500)


# =============================================================================
# STRATEGIC HESITATION
# =============================================================================

def add_commitment_hesitation(response: str) -> str:
    """
    Add brief pause before confirming booking.
    Warm and patient style.
    """
    commitment_phrases = [
        "you're booked",
        "you're all set",
        "you're set",
        "on the schedule",
    ]
    
    for phrase in commitment_phrases:
        if phrase in response.lower():
            # Brief pause - warm and patient
            hesitations = [
                "Alright, sweetie... ",
                "Okay, hon... ",
            ]
            # Only 40% of the time
            if random.random() < 0.4:
                return random.choice(hesitations) + response
    
    return response


# =============================================================================
# MASTER HUMANIZER
# =============================================================================

def humanize_response(
    response: str,
    call_sid: str,
    caller_name: Optional[str] = None,
    last_topic: Optional[str] = None,
    is_booking_confirmation: bool = False,
) -> str:
    """
    Apply all humanization tricks to a response.
    
    This is the main entry point for making responses feel human.
    """
    personality = get_personality(call_sid)
    personality.turn_count += 1
    
    # 1. Soften over-certainty
    response = soften_certainty(response)
    
    # 2. Add context anchoring (occasionally)
    if personality.turn_count > 1:
        response = add_context_anchor(response, last_topic, caller_name)
    
    # 3. Add imperfection (once per call)
    response = add_imperfection(response, call_sid)
    
    # 4. Add commitment hesitation for bookings
    if is_booking_confirmation:
        response = add_commitment_hesitation(response)
    
    # 5. Add turn invitation (occasionally)
    response = add_turn_invitation(response)
    
    # Store topic for next turn
    personality.last_topic = response[:50] if response else None
    
    return response
