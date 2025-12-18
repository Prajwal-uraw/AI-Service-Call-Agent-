"""
Enterprise-Grade HVAC Voice Agent - Gather-Based Architecture.

Production-ready voice agent using Twilio Gather + ElevenLabs TTS.
Turn-based conversation flow with state machine for reliable booking.

Features:
- Natural human-like voice via ElevenLabs
- Twilio Gather handles silence detection and reprompts
- State machine for deterministic conversation flow
- HVAC FAQ detection and handling
- Enterprise error recovery
- Slot extraction via GPT

States:
- GREETING: Initial greeting, ask how to help
- IDENTIFY_NEED: Determine if booking, FAQ, or emergency
- COLLECT_NAME: Get customer name
- COLLECT_PHONE: Get callback number
- COLLECT_ADDRESS: Get service address
- COLLECT_ISSUE: Get issue description
- COLLECT_DATE: Get preferred date
- COLLECT_TIME: Get preferred time
- CONFIRM: Confirm all details
- COMPLETE: Booking confirmed, goodbye
- FAQ: Handle HVAC questions
- EMERGENCY: Route emergency calls
"""

import os
import json
import hashlib
import asyncio
from enum import Enum
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta

from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import Response

from app.utils.logging import get_logger
from app.services.hvac_knowledge import (
    get_hvac_insight, 
    get_troubleshooting_tips,
    format_insight_for_voice
)
from app.services.tts.elevenlabs_tts import generate_audio_url, is_available as is_elevenlabs_available

logger = get_logger("twilio.gather")

router = APIRouter(tags=["twilio-gather"])

# Version for deployment verification
_VERSION = "2.2.0-enterprise"
print(f"[GATHER_MODULE_LOADED] Version: {_VERSION}")


# =============================================================================
# CONFIGURATION
# =============================================================================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "DLsHlh26Ugcm6ELvS0qi")  # MS WALKER
COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")

# Phone numbers for transfers
# IMPORTANT: Set these in Modal secrets or .env
EMERGENCY_PHONE = os.getenv("EMERGENCY_PHONE", "+18005551234")  # 24/7 emergency line
TRANSFER_PHONE = os.getenv("TRANSFER_PHONE", "+18005551234")    # Office/dispatch line

# Twilio Gather settings
GATHER_TIMEOUT = 8  # Seconds to wait for speech to start
GATHER_SPEECH_TIMEOUT = 3  # Seconds of silence to end speech (integer, not "auto")
MAX_RETRIES = 3  # Max retries before escalation


# =============================================================================
# VALIDATION HELPERS
# =============================================================================
import re

# Word-to-digit mapping for spoken numbers
WORD_TO_DIGIT = {
    "zero": "0", "oh": "0", "o": "0",
    "one": "1", "won": "1",
    "two": "2", "to": "2", "too": "2",
    "three": "3", "tree": "3",
    "four": "4", "for": "4", "fore": "4",
    "five": "5", "fife": "5",
    "six": "6", "sicks": "6",
    "seven": "7",
    "eight": "8", "ate": "8",
    "nine": "9", "niner": "9",
}


def convert_spoken_to_digits(text: str) -> str:
    """
    Convert spoken number words to digits.
    Handles: "five five five one two three four five six seven" -> "5551234567"
    """
    result = []
    words = text.lower().split()
    
    for word in words:
        # Clean punctuation
        clean_word = re.sub(r'[^a-z0-9]', '', word)
        
        # Check if it's already a digit
        if clean_word.isdigit():
            result.append(clean_word)
        # Check word mapping
        elif clean_word in WORD_TO_DIGIT:
            result.append(WORD_TO_DIGIT[clean_word])
        # Check for compound numbers like "fifty" -> skip, we want individual digits
    
    return ''.join(result)


def validate_phone(phone_input: str) -> Tuple[bool, str, str]:
    """
    Validate and format phone number from speech.
    
    Handles:
    - "5551234567" (digits)
    - "555-123-4567" (formatted)
    - "five five five one two three four five six seven" (spoken words)
    - "555 123 4567" (spaced)
    
    Returns: (is_valid, formatted_number, spoken_format)
    """
    # First try to extract digits directly
    digits = re.sub(r'\D', '', phone_input)
    
    # If not enough digits, try converting spoken words
    if len(digits) < 10:
        digits = convert_spoken_to_digits(phone_input)
    
    # Validate
    if len(digits) == 10:
        formatted = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        # Natural spoken format with pauses
        spoken = f"{digits[0]} {digits[1]} {digits[2]}, {digits[3]} {digits[4]} {digits[5]}, {digits[6]} {digits[7]} {digits[8]} {digits[9]}"
        return True, formatted, spoken
    elif len(digits) == 11 and digits[0] == '1':
        # US number with country code
        digits = digits[1:]
        formatted = f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        spoken = f"{digits[0]} {digits[1]} {digits[2]}, {digits[3]} {digits[4]} {digits[5]}, {digits[6]} {digits[7]} {digits[8]} {digits[9]}"
        return True, formatted, spoken
    elif len(digits) >= 7:
        return False, digits, "incomplete"
    else:
        return False, digits, "invalid"


def validate_address(address_input: str) -> Tuple[bool, str]:
    """
    Basic address validation.
    
    Returns: (is_valid, cleaned_address)
    """
    address = address_input.strip()
    
    # Must have at least a number and some text
    has_number = bool(re.search(r'\d+', address))
    has_street = len(address.split()) >= 2
    
    if has_number and has_street:
        # Capitalize properly
        return True, address.title()
    
    return False, address


def format_phone_for_speech(phone: str) -> str:
    """Format phone number for natural speech."""
    digits = re.sub(r'\D', '', phone)
    if len(digits) >= 10:
        digits = digits[-10:]  # Take last 10 digits
        return f"{digits[0]} {digits[1]} {digits[2]}, {digits[3]} {digits[4]} {digits[5]}, {digits[6]} {digits[7]} {digits[8]} {digits[9]}"
    return phone


# =============================================================================
# CONVERSATION STATE
# =============================================================================
class ConversationState(str, Enum):
    GREETING = "greeting"
    IDENTIFY_NEED = "identify_need"
    COLLECT_NAME = "collect_name"
    COLLECT_PHONE = "collect_phone"
    VERIFY_PHONE = "verify_phone"      # New: verify phone number
    COLLECT_ADDRESS = "collect_address"
    VERIFY_ADDRESS = "verify_address"  # New: verify address
    COLLECT_ISSUE = "collect_issue"
    COLLECT_DATE = "collect_date"
    COLLECT_TIME = "collect_time"
    CONFIRM = "confirm"
    COMPLETE = "complete"
    FAQ = "faq"
    EMERGENCY = "emergency"
    TRANSFER = "transfer"
    GOODBYE = "goodbye"


# In-memory session storage (use Redis in production for multi-instance)
# Key: CallSid, Value: session data
_sessions: Dict[str, Dict[str, Any]] = {}


def get_session(call_sid: str) -> Dict[str, Any]:
    """Get or create session for a call."""
    if call_sid not in _sessions:
        _sessions[call_sid] = {
            "state": ConversationState.GREETING,
            "slots": {
                "name": None,
                "phone": None,
                "address": None,
                "issue": None,
                "date": None,
                "time": None,
            },
            "retries": 0,
            "history": [],
            "created_at": datetime.now().isoformat(),
        }
    return _sessions[call_sid]


def clear_session(call_sid: str):
    """Clear session after call ends."""
    if call_sid in _sessions:
        del _sessions[call_sid]


# =============================================================================
# PROMPTS - Natural, Human-like Responses
# =============================================================================
PROMPTS = {
    ConversationState.GREETING: [
        f"Thanks for calling {COMPANY_NAME}! This is our scheduling assistant. How can I help you today?",
        f"Hi there! You've reached {COMPANY_NAME}. What can I do for you?",
        f"Hello! Thanks for calling {COMPANY_NAME}. How may I assist you?",
    ],
    ConversationState.IDENTIFY_NEED: [
        "Got it. Are you looking to schedule a service appointment, or do you have a question I can help with?",
    ],
    ConversationState.COLLECT_NAME: [
        "Perfect, I can help you schedule that. May I have your name please?",
        "Sure thing! Let me get you scheduled. What's your name?",
        "Absolutely, I'll set that up. Can I get your name?",
    ],
    ConversationState.COLLECT_PHONE: [
        "Thanks {name}! What's the best phone number to reach you?",
        "Got it, {name}. And your phone number?",
    ],
    ConversationState.COLLECT_ADDRESS: [
        "Great. What's the service address?",
        "And what address will we be coming to?",
    ],
    ConversationState.COLLECT_ISSUE: [
        "What's going on with your system? Just give me a quick description.",
        "Can you tell me briefly what the issue is?",
    ],
    ConversationState.COLLECT_DATE: [
        "When would you like us to come out? We have availability this week.",
        "What day works best for you?",
    ],
    ConversationState.COLLECT_TIME: [
        "And do you prefer morning or afternoon?",
        "Would morning or afternoon work better?",
    ],
    ConversationState.CONFIRM: [
        "Okay, let me confirm. {name}, we'll have a technician at {address} on {date} in the {time} for {issue}. Does that sound right?",
    ],
    ConversationState.COMPLETE: [
        "You're all set! We'll see you on {date}. Is there anything else I can help with?",
        "Perfect, your appointment is confirmed for {date}. Anything else?",
    ],
    ConversationState.FAQ: [
        "{answer} Would you like to schedule a service call?",
    ],
    ConversationState.EMERGENCY: [
        "That sounds like it could be an emergency. I'm going to transfer you to our emergency line right away. Please hold.",
    ],
    ConversationState.GOODBYE: [
        "Thanks for calling {company}! Have a great day.",
        "Thank you! Take care and stay comfortable.",
    ],
    "reprompt": [
        "Sorry, I didn't catch that. Could you say that again?",
        "I didn't quite hear you. One more time?",
        "Could you repeat that please?",
    ],
    "fallback": [
        "I'm having trouble understanding. Let me transfer you to someone who can help.",
    ],
}


def get_prompt(state: ConversationState, slots: Dict[str, Any] = None, key: str = None) -> str:
    """Get a natural prompt for the given state."""
    import random
    
    prompts = PROMPTS.get(key or state, PROMPTS.get(state, ["How can I help you?"]))
    prompt = random.choice(prompts)
    
    # Fill in slots
    if slots:
        slots_with_defaults = {**slots, "company": COMPANY_NAME}
        try:
            prompt = prompt.format(**slots_with_defaults)
        except KeyError:
            pass
    
    return prompt


# =============================================================================
# INTENT DETECTION & SLOT EXTRACTION (GPT-powered)
# =============================================================================
async def analyze_speech(speech: str, current_state: ConversationState, session: Dict) -> Dict[str, Any]:
    """
    Analyze user speech using GPT to extract intent and slots.
    
    Returns:
        {
            "intent": "booking" | "faq" | "emergency" | "confirm" | "deny" | "unknown",
            "slots": {"name": ..., "phone": ..., etc.},
            "faq_topic": "ac_not_cooling" | None,
            "is_emergency": bool,
            "confidence": float
        }
    """
    import openai
    
    client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
    
    system_prompt = """You are an HVAC call center assistant analyzing customer speech.
Extract the following from the customer's response:

1. intent: What does the customer want?
   - "booking": They want to schedule service
   - "faq": They have a question about HVAC
   - "emergency": Gas leak, no heat in freezing weather, CO detector, fire/smoke
   - "confirm": They said yes, correct, right, sure, etc.
   - "deny": They said no, wrong, incorrect, etc.
   - "other": Something else
   - "unclear": Can't determine

2. slots: Extract any of these if mentioned:
   - name: Customer's name
   - phone: Phone number (digits only)
   - address: Service address
   - issue: Brief description of HVAC problem
   - date: Preferred date (normalize to YYYY-MM-DD or "tomorrow", "today", etc.)
   - time: Preferred time (morning/afternoon/specific time)

3. faq_topic: If FAQ, what topic?
   - "ac_not_cooling", "heater_not_working", "strange_noises", "high_energy_bills", "thermostat_issues", "air_quality"

4. is_emergency: true if gas leak, CO alarm, no heat in dangerous cold, fire/smoke mentioned

Respond in JSON format only."""

    user_prompt = f"""Current state: {current_state.value}
Current slots: {json.dumps(session.get('slots', {}))}
Customer said: "{speech}"

Analyze and extract information."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=300,
            temperature=0.1,
        )
        
        result = json.loads(response.choices[0].message.content)
        logger.info("Speech analysis: %s -> %s", speech[:50], result.get("intent"))
        return result
        
    except Exception as e:
        logger.error("Speech analysis error: %s", str(e))
        return {
            "intent": "unclear",
            "slots": {},
            "faq_topic": None,
            "is_emergency": False,
            "confidence": 0.0
        }


# =============================================================================
# EMERGENCY DETECTION (TRUE emergencies only)
# =============================================================================
# TRUE emergencies - immediate danger to life or property
TRUE_EMERGENCY_KEYWORDS = [
    "gas leak", "smell gas", "smelling gas",
    "carbon monoxide", "co detector", "co alarm", "co going off",
    "fire", "smoke", "burning smell", "electrical fire", "sparks",
    "flooding", "water everywhere",
]

# Conditional emergencies - only emergency if combined with danger words
# "no heat" alone is NOT an emergency - it's a normal service call
DANGER_CONDITIONS = ["freezing", "frozen", "elderly", "baby", "infant", "sick", "medical"]


def is_emergency(speech: str) -> bool:
    """
    Check for TRUE emergencies only.
    
    'No heat' alone is NOT an emergency - it's a normal service request.
    Only flag as emergency if there's immediate danger.
    """
    speech_lower = speech.lower()
    
    # Check for true emergencies (always emergency)
    if any(kw in speech_lower for kw in TRUE_EMERGENCY_KEYWORDS):
        return True
    
    # "No heat" is only emergency if combined with danger conditions
    if "no heat" in speech_lower or "heat not working" in speech_lower:
        if any(danger in speech_lower for danger in DANGER_CONDITIONS):
            return True
        # Otherwise it's just a normal service call
        return False
    
    return False


# =============================================================================
# FAST FAQ DETECTION (skip GPT for common questions)
# =============================================================================
FAQ_PATTERNS = {
    "service_call_cost": ["how much", "cost", "price", "charge", "fee", "service call", "service fee"],
    "hours": ["hours", "open", "available", "when are you"],
    "emergency": ["emergency", "after hours", "24/7", "urgent"],
    "warranty": ["warranty", "guarantee"],
    "payment": ["payment", "pay", "credit card", "financing"],
}

FAQ_ANSWERS = {
    "service_call_cost": "Our service call fee is $89, which includes the diagnostic. If you proceed with repairs, that fee is applied to the total cost. Would you like to schedule a service appointment?",
    "hours": "We're available Monday through Friday, 8 AM to 6 PM, with emergency service available 24/7. Would you like to schedule an appointment?",
    "emergency": "For emergencies like gas leaks or no heat in freezing weather, we offer 24/7 emergency service. Is this an emergency situation?",
    "warranty": "We offer a 1-year warranty on all repairs and installations. Would you like to schedule a service?",
    "payment": "We accept all major credit cards, checks, and offer financing options for larger repairs. Would you like to schedule an appointment?",
}


def quick_faq_check(speech: str) -> Optional[str]:
    """Check for common FAQ patterns without GPT. Returns answer or None."""
    speech_lower = speech.lower()
    for topic, patterns in FAQ_PATTERNS.items():
        if any(pattern in speech_lower for pattern in patterns):
            return FAQ_ANSWERS.get(topic)
    return None


# =============================================================================
# STATE MACHINE TRANSITIONS
# =============================================================================
async def process_state(
    call_sid: str,
    speech: str,
    session: Dict[str, Any]
) -> Tuple[ConversationState, str, Dict[str, Any]]:
    """
    Process current state and user input, return next state and response.
    
    Uses fast pattern matching for common cases, GPT only when needed.
    
    Returns:
        (next_state, response_text, updated_slots)
    """
    current_state = ConversationState(session["state"])
    slots = session["slots"]
    speech_lower = speech.lower().strip()
    
    # Quick emergency check
    if is_emergency(speech):
        return ConversationState.EMERGENCY, get_prompt(ConversationState.EMERGENCY), slots
    
    # FAST PATH: Check for common FAQ questions (skip GPT)
    if current_state == ConversationState.GREETING:
        faq_answer = quick_faq_check(speech)
        if faq_answer:
            logger.info("Fast FAQ match for: %s", speech[:30])
            return ConversationState.FAQ, faq_answer, slots
    
    # FAST PATH: Simple slot extraction for collection states (skip GPT)
    if current_state == ConversationState.COLLECT_NAME:
        # Clean up the name - remove filler words
        name = speech.strip()
        # Remove common filler phrases
        filler_phrases = ["my name is", "this is", "i'm", "im", "i am", "it's", "its", "call me"]
        name_lower = name.lower()
        for filler in filler_phrases:
            if name_lower.startswith(filler):
                name = name[len(filler):].strip()
                break
        
        # Capitalize properly
        name = name.title()
        
        # Validate - name should have at least 2 characters
        if len(name) >= 2:
            slots["name"] = name
            return ConversationState.COLLECT_PHONE, f"Thanks {name}! What's the best phone number to reach you?", slots
        else:
            return current_state, "I didn't catch your name. Could you please tell me your name?", slots
    
    if current_state == ConversationState.COLLECT_PHONE:
        # Validate phone number
        is_valid, formatted, spoken = validate_phone(speech)
        if is_valid:
            slots["phone"] = formatted
            slots["phone_spoken"] = spoken
            # Ask for verification
            return ConversationState.VERIFY_PHONE, f"I have {spoken}. Is that correct?", slots
        elif spoken == "incomplete":
            return current_state, "I need your full 10-digit phone number including area code. What's the number?", slots
        else:
            return current_state, "I didn't catch that. Please say your phone number with area code.", slots
    
    if current_state == ConversationState.VERIFY_PHONE:
        # Check yes/no for phone verification
        if any(word in speech_lower for word in ["yes", "yeah", "yep", "correct", "right", "that's right"]):
            return ConversationState.COLLECT_ADDRESS, "Great! What's the service address?", slots
        elif any(word in speech_lower for word in ["no", "nope", "wrong", "incorrect"]):
            slots["phone"] = None
            return ConversationState.COLLECT_PHONE, "No problem. Please say your phone number again.", slots
        return current_state, f"I have {slots.get('phone_spoken', 'your number')}. Is that correct? Yes or no?", slots
    
    if current_state == ConversationState.COLLECT_ADDRESS:
        # Validate address
        is_valid, cleaned = validate_address(speech)
        if is_valid:
            slots["address"] = cleaned
            return ConversationState.VERIFY_ADDRESS, f"I have {cleaned}. Is that the correct address?", slots
        else:
            return current_state, "I need a street address with a number. For example, 123 Main Street. What's the address?", slots
    
    if current_state == ConversationState.VERIFY_ADDRESS:
        # Check yes/no for address verification
        if any(word in speech_lower for word in ["yes", "yeah", "yep", "correct", "right", "that's right"]):
            return ConversationState.COLLECT_ISSUE, "Perfect! What's going on with your system? Just a quick description.", slots
        elif any(word in speech_lower for word in ["no", "nope", "wrong", "incorrect"]):
            slots["address"] = None
            return ConversationState.COLLECT_ADDRESS, "Let me get that again. What's the service address?", slots
        return current_state, f"Is {slots.get('address', 'that address')} correct? Yes or no?", slots
    
    if current_state == ConversationState.COLLECT_ISSUE:
        slots["issue"] = speech.strip()
        return ConversationState.COLLECT_DATE, "When would you like us to come out?", slots
    
    if current_state == ConversationState.COLLECT_DATE:
        slots["date"] = speech.strip()
        return ConversationState.COLLECT_TIME, "Do you prefer morning or afternoon?", slots
    
    if current_state == ConversationState.COLLECT_TIME:
        slots["time"] = speech.strip()
        # Build confirmation summary
        summary = f"Let me confirm: {slots.get('name')}, phone {slots.get('phone_spoken', slots.get('phone'))}, " \
                  f"at {slots.get('address')}, for {slots.get('issue')}, " \
                  f"{slots.get('date')} in the {slots.get('time')}. Is all that correct?"
        return ConversationState.CONFIRM, summary, slots
    
    # For greeting state with non-FAQ, use GPT to understand intent
    if current_state == ConversationState.GREETING:
        # Check for simple booking intent
        if any(word in speech_lower for word in ["schedule", "book", "appointment", "service", "repair", "fix", "broken", "not working"]):
            return ConversationState.COLLECT_NAME, get_prompt(ConversationState.COLLECT_NAME), slots
    
    # SLOW PATH: Use GPT only for complex cases
    analysis = await analyze_speech(speech, current_state, session)
    intent = analysis.get("intent", "unclear")
    extracted_slots = analysis.get("slots", {})
    
    # Merge extracted slots
    for key, value in extracted_slots.items():
        if value and key in slots:
            slots[key] = value
    
    # State transitions
    if current_state == ConversationState.GREETING:
        if analysis.get("is_emergency"):
            return ConversationState.EMERGENCY, get_prompt(ConversationState.EMERGENCY), slots
        elif intent == "faq" and analysis.get("faq_topic"):
            insight = get_hvac_insight(analysis["faq_topic"])
            answer = format_insight_for_voice(insight)
            return ConversationState.FAQ, get_prompt(ConversationState.FAQ, {"answer": answer}), slots
        elif intent in ["booking", "other", "unclear"]:
            # Default to booking flow
            if slots.get("name"):
                return ConversationState.COLLECT_PHONE, get_prompt(ConversationState.COLLECT_PHONE, slots), slots
            return ConversationState.COLLECT_NAME, get_prompt(ConversationState.COLLECT_NAME), slots
    
    elif current_state == ConversationState.COLLECT_NAME:
        if slots.get("name"):
            return ConversationState.COLLECT_PHONE, get_prompt(ConversationState.COLLECT_PHONE, slots), slots
        # Retry
        return current_state, "I didn't catch your name. Could you tell me your name please?", slots
    
    elif current_state == ConversationState.COLLECT_PHONE:
        if slots.get("phone"):
            return ConversationState.COLLECT_ADDRESS, get_prompt(ConversationState.COLLECT_ADDRESS), slots
        return current_state, "I need your phone number. What's the best number to reach you?", slots
    
    elif current_state == ConversationState.COLLECT_ADDRESS:
        if slots.get("address"):
            return ConversationState.COLLECT_ISSUE, get_prompt(ConversationState.COLLECT_ISSUE), slots
        return current_state, "What's the address where you need service?", slots
    
    elif current_state == ConversationState.COLLECT_ISSUE:
        if slots.get("issue"):
            return ConversationState.COLLECT_DATE, get_prompt(ConversationState.COLLECT_DATE), slots
        return current_state, "Can you describe what's happening with your system?", slots
    
    elif current_state == ConversationState.COLLECT_DATE:
        if slots.get("date"):
            return ConversationState.COLLECT_TIME, get_prompt(ConversationState.COLLECT_TIME), slots
        return current_state, "What day would work for you?", slots
    
    elif current_state == ConversationState.COLLECT_TIME:
        if slots.get("time"):
            return ConversationState.CONFIRM, get_prompt(ConversationState.CONFIRM, slots), slots
        return current_state, "Morning or afternoon?", slots
    
    elif current_state == ConversationState.CONFIRM:
        # Check for yes/no in speech directly (more reliable than GPT for simple responses)
        if any(word in speech_lower for word in ["yes", "yeah", "yep", "correct", "right", "sure", "okay", "ok", "confirm", "that's right", "sounds good"]):
            logger.info("BOOKING CONFIRMED: %s", slots)
            complete_msg = f"Perfect! You're all set, {slots.get('name')}. " \
                          f"A technician will be at {slots.get('address')} on {slots.get('date')} in the {slots.get('time')}. " \
                          f"We'll call {slots.get('phone_spoken', slots.get('phone'))} if anything changes. " \
                          f"Thanks for choosing {COMPANY_NAME}!"
            return ConversationState.COMPLETE, complete_msg, slots
        elif any(word in speech_lower for word in ["no", "nope", "wrong", "incorrect", "not right", "change", "start over"]):
            # Ask what they want to change instead of starting over
            return current_state, "What would you like to change? Your name, phone, address, or the appointment time?", slots
        # If unclear, ask again more explicitly
        return current_state, "I need a yes or no. Is the booking information correct?", slots
    
    elif current_state == ConversationState.COMPLETE:
        if intent in ["deny", "other"]:
            return ConversationState.GREETING, "Sure! What else can I help you with?", slots
        return ConversationState.GOODBYE, get_prompt(ConversationState.GOODBYE, {"company": COMPANY_NAME}), slots
    
    elif current_state == ConversationState.FAQ:
        # After answering FAQ, ask if they want to book
        speech_lower = speech.lower().strip()
        if any(word in speech_lower for word in ["yes", "yeah", "sure", "okay", "book", "schedule", "appointment"]):
            return ConversationState.COLLECT_NAME, get_prompt(ConversationState.COLLECT_NAME), slots
        elif any(word in speech_lower for word in ["no", "nope", "that's all", "goodbye", "bye", "thanks"]):
            return ConversationState.GOODBYE, get_prompt(ConversationState.GOODBYE, {"company": COMPANY_NAME}), slots
        # Default: ask if they want to schedule
        return current_state, "Would you like to schedule a service appointment?", slots
    
    # Default: stay in current state with reprompt
    return current_state, get_prompt(current_state, slots) or "I'm sorry, could you repeat that?", slots


# =============================================================================
# TWIML GENERATION WITH ELEVENLABS <Play>
# =============================================================================
async def generate_twiml(
    text: str,
    next_state: ConversationState,
    call_sid: str,
    host: str,
    action_url: str = None,
) -> str:
    """
    Generate TwiML response with ElevenLabs <Play> or Polly <Say> fallback.
    
    Architecture:
    - Generate audio via ElevenLabs TTS API
    - Serve audio at /audio/{hash}.mp3
    - Use <Play> to play the audio
    - Use <Gather> to capture speech input
    - Fallback to Polly <Say> if ElevenLabs fails
    
    Features:
    - bargeIn="true" allows user to interrupt
    - Enhanced speech recognition for phone calls
    """
    action = action_url or f"https://{host}/twilio/gather/respond"
    
    # Try ElevenLabs first
    audio_url = None
    if is_elevenlabs_available():
        try:
            audio_url = await generate_audio_url(text, host)
            if audio_url:
                logger.info("ElevenLabs audio URL: %s", audio_url)
        except Exception as e:
            logger.warning("ElevenLabs failed, using Polly: %s", str(e))
    
    # Fallback voice element
    import html
    safe_text = html.escape(text)
    polly_voice = "Polly.Joanna-Neural"
    
    # Build the voice element (Play or Say)
    if audio_url:
        voice_element = f'<Play>{audio_url}</Play>'
    else:
        voice_element = f'<Say voice="{polly_voice}">{safe_text}</Say>'
    
    # For terminal states, no gather needed
    if next_state in [ConversationState.GOODBYE, ConversationState.EMERGENCY, ConversationState.TRANSFER]:
        if next_state == ConversationState.EMERGENCY:
            return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    {voice_element}
    <Dial>{EMERGENCY_PHONE}</Dial>
</Response>"""
        else:
            return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    {voice_element}
    <Hangup/>
</Response>"""
    
    # Standard gather response with barge-in enabled
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather input="speech dtmf" action="{action}" method="POST" timeout="{GATHER_TIMEOUT}" speechTimeout="{GATHER_SPEECH_TIMEOUT}" speechModel="phone_call" enhanced="true" language="en-US" bargeIn="true">
        {voice_element}
    </Gather>
    <Say voice="{polly_voice}">I didn't catch that. Could you please repeat?</Say>
    <Gather input="speech dtmf" action="{action}" method="POST" timeout="{GATHER_TIMEOUT}" speechTimeout="{GATHER_SPEECH_TIMEOUT}" speechModel="phone_call" enhanced="true" language="en-US" bargeIn="true">
        <Say voice="{polly_voice}">I'm still here. How can I help you?</Say>
    </Gather>
    <Say voice="{polly_voice}">I'm having trouble hearing you. Let me connect you with someone who can help.</Say>
    <Redirect>/twilio/gather/transfer</Redirect>
</Response>"""


# =============================================================================
# ENDPOINTS
# =============================================================================
@router.api_route("/twilio/gather/incoming", methods=["GET", "POST"])
async def gather_incoming(request: Request):
    """
    Entry point for incoming calls.
    Returns initial greeting with ElevenLabs <Play> or Polly fallback.
    """
    # Get form data - try cached first (from middleware), then parse fresh
    if hasattr(request.state, 'twilio_form_data'):
        form_dict = request.state.twilio_form_data
    else:
        form = await request.form()
        form_dict = dict(form)
    
    logger.info("INCOMING FORM DATA: %s", form_dict)
    
    call_sid = form_dict.get("CallSid", "unknown")
    caller = form_dict.get("From", "unknown")
    
    logger.info("Incoming call [v%s]: CallSid=%s, From=%s", _VERSION, call_sid, caller)
    
    # Initialize session
    session = get_session(call_sid)
    session["caller"] = caller
    
    # Get greeting
    greeting = get_prompt(ConversationState.GREETING)
    
    # Generate TwiML with ElevenLabs
    host = request.headers.get("host", "")
    twiml = await generate_twiml(greeting, ConversationState.GREETING, call_sid, host)
    
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/gather/respond", methods=["GET", "POST"])
async def gather_respond(request: Request):
    """
    Handle speech input from Gather.
    Process through state machine and return next prompt.
    
    Error handling:
    - Empty speech: Reprompt with friendly message
    - Low confidence: Ask for clarification
    - Processing errors: Graceful fallback to transfer
    """
    host = request.headers.get("host", "")
    action_url = f"https://{host}/twilio/gather/respond"
    
    try:
        # Get form data - try cached first (from middleware), then parse fresh
        if hasattr(request.state, 'twilio_form_data'):
            form_dict = request.state.twilio_form_data
        else:
            form = await request.form()
            form_dict = dict(form)
        
        logger.info("RESPOND FORM DATA: %s", form_dict)
        
        call_sid = form_dict.get("CallSid", "unknown")
        speech_result = form_dict.get("SpeechResult", "")
        confidence_str = form_dict.get("Confidence", "0")
        
        # Parse confidence as float
        try:
            confidence = float(confidence_str)
        except (ValueError, TypeError):
            confidence = 0.0
        
        logger.info("Speech received: CallSid=%s, Speech='%s', Confidence=%.2f", 
                   call_sid, speech_result[:100] if speech_result else "(empty)", confidence)
        
        # Get session
        session = get_session(call_sid)
        
        # Handle empty speech (timeout or no input detected)
        if not speech_result or not speech_result.strip():
            session["retries"] = session.get("retries", 0) + 1
            
            if session["retries"] >= MAX_RETRIES:
                logger.warning("Max retries reached for CallSid=%s, transferring", call_sid)
                transfer_msg = "I'm having trouble hearing you. Let me transfer you to someone who can help."
                twiml = await generate_twiml(transfer_msg, ConversationState.TRANSFER, call_sid, host)
                return Response(content=twiml, media_type="application/xml")
            
            # Context-aware reprompt based on current state
            current_state = ConversationState(session.get("state", "greeting"))
            if current_state == ConversationState.COLLECT_NAME:
                reprompt = "I didn't catch your name. Could you tell me your name please?"
            elif current_state == ConversationState.COLLECT_PHONE:
                reprompt = "I need your phone number. Please say it slowly, like: 5 5 5, 1 2 3, 4 5 6 7."
            elif current_state == ConversationState.COLLECT_ADDRESS:
                reprompt = "What's the street address where you need service?"
            elif current_state in [ConversationState.VERIFY_PHONE, ConversationState.VERIFY_ADDRESS, ConversationState.CONFIRM]:
                reprompt = "I just need a yes or no. Is that correct?"
            else:
                reprompt = "I'm still here. What can I help you with today?"
            
            twiml = await generate_twiml(reprompt, current_state, call_sid, host, action_url=action_url)
            return Response(content=twiml, media_type="application/xml")
        
        # Handle very low confidence - but still try to process it
        # Names especially can have low confidence but still be correct
        if confidence < 0.2 and len(speech_result) < 5:
            logger.info("Very low confidence speech (%.2f): '%s'", confidence, speech_result)
            session["retries"] = session.get("retries", 0) + 1
            current_state = ConversationState(session.get("state", "greeting"))
            reprompt = "I didn't quite catch that. Could you please repeat?"
            twiml = await generate_twiml(reprompt, current_state, call_sid, host, action_url=action_url)
            return Response(content=twiml, media_type="application/xml")
        
        # Reset retries on successful speech
        session["retries"] = 0
        
        # Add to history
        session["history"].append({
            "role": "user",
            "content": speech_result,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        })
        
        # Process through state machine
        next_state, response_text, updated_slots = await process_state(call_sid, speech_result, session)
        
        # Update session
        session["state"] = next_state
        session["slots"] = updated_slots
        session["history"].append({
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info("State transition: %s -> %s, Response: %s", 
                   session.get("state"), next_state, response_text[:50])
        
        # Generate TwiML with ElevenLabs
        twiml = await generate_twiml(response_text, next_state, call_sid, host, action_url=action_url)
        
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        # Catch-all error handler - never let the call fail silently
        logger.error("Error processing speech: %s", str(e), exc_info=True)
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">I apologize, I'm having a technical issue. Let me connect you with someone who can help.</Say>
    <Redirect>/twilio/gather/transfer</Redirect>
</Response>"""
        return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/gather/transfer", methods=["GET", "POST"])
async def gather_transfer(request: Request):
    """Transfer call to human agent."""
    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    
    logger.info("Transferring call: CallSid=%s to %s", call_sid, TRANSFER_PHONE)
    
    # Clean up session
    clear_session(call_sid)
    
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna-Neural">Please hold while I transfer you to our office.</Say>
    <Dial>{TRANSFER_PHONE}</Dial>
</Response>"""
    
    return Response(content=twiml, media_type="application/xml")


@router.api_route("/twilio/gather/status", methods=["POST"])
async def gather_status(request: Request):
    """Handle call status callbacks."""
    form = await request.form()
    call_sid = form.get("CallSid", "unknown")
    call_status = form.get("CallStatus", "unknown")
    
    logger.info("Call status: CallSid=%s, Status=%s", call_sid, call_status)
    
    # Clean up session on call end
    if call_status in ["completed", "failed", "busy", "no-answer", "canceled"]:
        session = _sessions.get(call_sid)
        if session:
            logger.info("Call ended. Final state: %s, Slots: %s", 
                       session.get("state"), session.get("slots"))
        clear_session(call_sid)
    
    return Response(content="OK", media_type="text/plain")


# =============================================================================
# HEALTH CHECK
# =============================================================================
@router.get("/twilio/gather/health")
async def gather_health():
    """Health check for gather endpoints."""
    return {
        "status": "healthy",
        "version": _VERSION,
        "active_sessions": len(_sessions),
        "elevenlabs_configured": bool(ELEVENLABS_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
    }
