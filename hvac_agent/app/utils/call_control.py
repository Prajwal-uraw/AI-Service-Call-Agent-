"""
Call Control Module for HVAC Voice Agent.

Implements stronger input shaping for production call-center operation:
- Guided/binary prompts instead of open-ended questions
- Polite interruption logic for long speech
- One-variable-per-turn enforcement
- Call flow state machine

This should feel like a real dispatcher, not an IVR.
"""

import re
from typing import Optional, Tuple, List
from enum import Enum
from dataclasses import dataclass


class BookingStage(Enum):
    """Stages of the booking flow - one variable per stage."""
    GREETING = "greeting"
    ISSUE = "issue"           # What's wrong with the system
    CITY = "city"             # Which location
    TIME = "time"             # Morning or afternoon
    NAME = "name"             # Name for appointment
    CONFIRM = "confirm"       # Confirm booking
    COMPLETE = "complete"


@dataclass
class CallFlowState:
    """
    Tracks where we are in the booking flow.
    Enforces one-variable-per-turn collection.
    """
    stage: BookingStage = BookingStage.GREETING
    issue: Optional[str] = None
    city: Optional[str] = None
    time_preference: Optional[str] = None
    name: Optional[str] = None
    
    def advance(self) -> None:
        """Move to next stage."""
        stages = list(BookingStage)
        current_idx = stages.index(self.stage)
        if current_idx < len(stages) - 1:
            self.stage = stages[current_idx + 1]
    
    def get_current_prompt(self) -> str:
        """Get the guided prompt for current stage."""
        prompts = {
            BookingStage.GREETING: "KC Comfort Air. Cooling issue or heating.",
            BookingStage.ISSUE: "Is it not cooling, not heating, or something else.",
            BookingStage.CITY: "Dallas, Fort Worth, or Arlington.",
            BookingStage.TIME: "Morning or afternoon.",
            BookingStage.NAME: "Name for the appointment.",
            BookingStage.CONFIRM: "You're set. Anything else.",
            BookingStage.COMPLETE: "We'll see you then.",
        }
        return prompts.get(self.stage, "What do you need.")


# =============================================================================
# SPEECH LENGTH DETECTION
# =============================================================================

def is_speech_too_long(text: str, max_words: int = 30) -> bool:
    """
    Detect if caller speech is too long and needs interruption.
    
    ~30 words ≈ 8-10 seconds of speech at normal pace.
    """
    words = text.split()
    return len(words) > max_words


def is_multi_topic(text: str) -> bool:
    """
    Detect if caller is providing multiple unrelated details.
    
    Indicators:
    - Multiple sentences
    - "and also", "plus", "another thing"
    - Multiple question types
    """
    # Multiple sentences
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) > 2:
        return True
    
    # Multi-topic indicators
    multi_indicators = [
        "and also", "plus", "another thing", "by the way",
        "oh and", "also i", "i also", "one more thing",
        "additionally", "as well as"
    ]
    text_lower = text.lower()
    if any(ind in text_lower for ind in multi_indicators):
        return True
    
    return False


# =============================================================================
# POLITE INTERRUPTION
# =============================================================================

INTERRUPTION_PHRASES = [
    "I understand.",
    "Understood.",
    "I see.",
    "Got it.",
]

REDIRECT_PROMPTS = {
    BookingStage.ISSUE: "What service do you need - heating, cooling, or maintenance?",
    BookingStage.CITY: "What city are you in?",
    BookingStage.TIME: "Would you prefer morning or afternoon?",
    BookingStage.NAME: "May I have your name?",
}


def get_interruption_response(
    stage: BookingStage,
    extracted_issue: str = None,
    extracted_city: str = None,
) -> str:
    """
    Get professional interruption + redirect for current stage.

    Pattern:
    - Brief acknowledgment
    - Direct redirect to next question
    - Professional and efficient
    """
    import random
    from app.utils.location_mapping import get_service_area_name

    # Build brief acknowledgment based on what we extracted
    if extracted_issue and extracted_city:
        city_name = get_service_area_name(extracted_city) if extracted_city else extracted_city
        ack = f"Understood. {extracted_issue.capitalize()} service in {city_name}."
    elif extracted_issue:
        ack = f"Understood. {extracted_issue.capitalize()} service."
    elif extracted_city:
        city_name = get_service_area_name(extracted_city) if extracted_city else extracted_city
        ack = f"Understood. {city_name}."
    else:
        ack = random.choice(INTERRUPTION_PHRASES)

    redirect = REDIRECT_PROMPTS.get(stage, "How may I help you?")

    return f"{ack} {redirect}"


# =============================================================================
# VARIABLE EXTRACTION (One per turn)
# =============================================================================

def extract_issue_type(text: str) -> Optional[str]:
    """Extract service issue type from caller speech."""
    text_lower = text.lower()
    
    # Cooling issues
    cooling_keywords = [
        "cool", "cold", "ac", "a/c", "air condition", "not cooling",
        "hot inside", "warm", "no cold air", "freezing up"
    ]
    if any(kw in text_lower for kw in cooling_keywords):
        return "cooling"
    
    # Heating issues
    heating_keywords = [
        "heat", "warm", "furnace", "not heating", "cold inside",
        "no heat", "heater", "frozen"
    ]
    if any(kw in text_lower for kw in heating_keywords):
        return "heating"
    
    # Other issues
    other_keywords = [
        "noise", "smell", "leak", "water", "maintenance",
        "tune up", "check", "inspect", "service"
    ]
    if any(kw in text_lower for kw in other_keywords):
        return "other"
    
    return None


def extract_city(text: str) -> Optional[str]:
    """
    Extract city from caller speech using comprehensive location mapping.

    Now supports all DFW area cities including Euless, Bedford, Irving, etc.
    """
    from app.utils.location_mapping import map_city_to_service_area

    text_lower = text.lower()

    # Try direct city name extraction
    # Check for multi-word cities first (e.g., "Fort Worth", "Grand Prairie")
    multi_word_cities = [
        "fort worth", "grand prairie", "north richland hills",
        "haltom city", "farmers branch", "university park",
        "highland park", "white settlement", "dalworthington gardens",
        "forest hill", "cedar hill", "richland hills", "river oaks"
    ]

    for city in multi_word_cities:
        if city in text_lower:
            return map_city_to_service_area(city)

    # Then check single-word cities
    words = text_lower.split()
    for word in words:
        # Clean up punctuation
        word = word.strip(",.!?;:")
        area_code = map_city_to_service_area(word)
        if area_code:
            return area_code

    return None


def extract_time_preference(text: str) -> Optional[str]:
    """Extract time preference from caller speech."""
    text_lower = text.lower()
    
    if any(w in text_lower for w in ["morning", "am", "early"]):
        return "morning"
    if any(w in text_lower for w in ["afternoon", "pm", "later", "after lunch"]):
        return "afternoon"
    
    return None


def extract_name(text: str) -> Optional[str]:
    """
    Extract name from caller speech.
    Simple extraction - takes first capitalized word sequence.
    """
    # Look for "my name is X" or "this is X" or "it's X"
    patterns = [
        r"(?:my name is|this is|it's|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)",
        r"^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$",  # Just a name
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).title()
    
    # If short response, might just be the name
    words = text.strip().split()
    if len(words) <= 3:
        # Capitalize and return
        return " ".join(w.title() for w in words if w.isalpha())
    
    return None


def extract_variable_for_stage(text: str, stage: BookingStage) -> Optional[str]:
    """
    Extract only the variable needed for current stage.
    Ignores everything else - one variable per turn.
    """
    extractors = {
        BookingStage.ISSUE: extract_issue_type,
        BookingStage.CITY: extract_city,
        BookingStage.TIME: extract_time_preference,
        BookingStage.NAME: extract_name,
    }
    
    extractor = extractors.get(stage)
    if extractor:
        return extractor(text)
    
    return None


# =============================================================================
# GUIDED PROMPTS (Binary/Narrow choices)
# =============================================================================

GUIDED_PROMPTS = {
    # Issue detection - binary choice
    "issue_initial": "Cooling issue or heating.",
    "issue_clarify": "Not cooling, not heating, or something else.",
    
    # City - three choices
    "city_initial": "Dallas, Fort Worth, or Arlington.",
    "city_clarify": "Which city. Dallas, Fort Worth, or Arlington.",
    
    # Time - binary choice
    "time_initial": "Morning or afternoon.",
    "time_clarify": "Morning or afternoon.",
    
    # Name - direct ask
    "name_initial": "Name for the appointment.",
    "name_clarify": "What name.",
    
    # Confirmation - binary
    "confirm": "You're set. Anything else.",
}


def get_guided_prompt(stage: BookingStage, is_retry: bool = False) -> str:
    """
    Get a guided prompt that narrows caller response window.
    
    These are binary or limited-choice prompts.
    Never open-ended.
    """
    stage_key = stage.value
    key = f"{stage_key}_clarify" if is_retry else f"{stage_key}_initial"
    
    return GUIDED_PROMPTS.get(key, GUIDED_PROMPTS.get(f"{stage_key}_initial", "What do you need."))


# =============================================================================
# CALL CONTROL DECISION
# =============================================================================

@dataclass
class CallControlDecision:
    """Decision about how to handle caller input."""
    should_interrupt: bool = False
    extracted_value: Optional[str] = None
    next_prompt: str = ""
    advance_stage: bool = False


def process_caller_input(
    text: str,
    flow_state: CallFlowState,
) -> CallControlDecision:
    """
    Main call control logic.
    
    1. Check if speech is too long → interrupt
    2. Check if multi-topic → interrupt
    3. Extract only the current required variable
    4. Return appropriate next prompt
    """
    decision = CallControlDecision()
    
    # Check for interruption conditions
    if is_speech_too_long(text) or is_multi_topic(text):
        decision.should_interrupt = True
        decision.next_prompt = get_interruption_response(flow_state.stage)
        # Still try to extract the variable we need
        decision.extracted_value = extract_variable_for_stage(text, flow_state.stage)
        if decision.extracted_value:
            decision.advance_stage = True
        return decision
    
    # Normal extraction
    decision.extracted_value = extract_variable_for_stage(text, flow_state.stage)
    
    if decision.extracted_value:
        decision.advance_stage = True
        # Get prompt for next stage
        flow_state.advance()
        decision.next_prompt = get_guided_prompt(flow_state.stage)
    else:
        # Didn't get what we need - clarify
        decision.next_prompt = get_guided_prompt(flow_state.stage, is_retry=True)
    
    return decision


# =============================================================================
# RESPONSE SHORTENER
# =============================================================================

def shorten_response(response: str, max_sentences: int = 1) -> str:
    """
    Ensure response is short - one sentence per turn.
    Dispatcher doesn't ramble.
    """
    # Split on sentence endings
    sentences = re.split(r'(?<=[.!?])\s+', response.strip())
    
    if len(sentences) <= max_sentences:
        return response
    
    # Take only first sentence(s)
    return " ".join(sentences[:max_sentences])


def remove_follow_up_questions(response: str) -> str:
    """
    Remove any follow-up questions from the same turn.
    Agent asks ONE thing at a time.
    """
    # If response has multiple questions, keep only the last one
    # (which is usually the actual question we want answered)
    
    questions = re.split(r'\?\s*', response)
    questions = [q.strip() for q in questions if q.strip()]
    
    if len(questions) <= 1:
        return response
    
    # Keep only the last question
    return questions[-1] + "?"
