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
_VERSION = "3.3.0-intelligent-agent"
print(f"[GATHER_MODULE_LOADED] Version: {_VERSION}")


# =============================================================================
# CONFIGURATION
# =============================================================================
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "DLsHlh26Ugcm6ELvS0qi")  # MS WALKER
COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")

# Company information
COMPANY_ADDRESS = "1111 Test Drive, Dallas, Texas"
COMPANY_PHONE = "682-224-9904"

# Phone numbers for transfers
EMERGENCY_PHONE = os.getenv("EMERGENCY_PHONE", "+16822249904")  # 24/7 emergency line
TRANSFER_PHONE = os.getenv("TRANSFER_PHONE", "+16822249904")    # Office/dispatch line

# Twilio Gather settings
GATHER_TIMEOUT = 8  # Seconds to wait for speech to start
GATHER_SPEECH_TIMEOUT = 3  # Seconds of silence to end speech (integer, not "auto")
MAX_RETRIES = 3  # Max retries before escalation

# Twilio SMS (stub - configure when ready)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")

# =============================================================================
# UNIVERSAL COMMANDS (work in any state)
# =============================================================================
HUMAN_REQUEST_PHRASES = [
    "talk to a human", "talk to human", "speak to someone", "speak to a person",
    "real person", "representative", "agent", "operator", "customer service",
    "talk to someone", "speak to human", "human please", "get me a person"
]

REPEAT_PHRASES = ["repeat", "say that again", "what did you say", "come again", "pardon", "sorry what"]
HELP_PHRASES = ["help", "help me", "i need help", "what can you do", "options"]
START_OVER_PHRASES = ["start over", "begin again", "restart", "from the beginning", "start again"]
GO_BACK_PHRASES = ["go back", "previous", "back", "undo", "wait"]

# Comprehensive YES synonyms (used throughout for confirmations)
YES_WORDS = [
    "yes", "yeah", "yep", "yup", "sure", "okay", "ok", "correct", "right", 
    "that's right", "that's correct", "affirmative", "absolutely", "definitely",
    "of course", "please", "go ahead", "sounds good", "perfect", "exactly",
    "uh huh", "mm hmm", "indeed", "certainly", "you got it", "that works",
    "i do", "i am", "i would", "i'd like", "let's do it"
]

# Comprehensive NO synonyms
NO_WORDS = [
    "no", "nope", "nah", "not really", "negative", "wrong", "incorrect",
    "that's wrong", "that's not right", "i don't think so", "not quite",
    "actually no", "no thanks", "not today", "never mind", "cancel"
]

# Off-topic detection
OFF_TOPIC_PHRASES = [
    "weather", "sports", "news", "joke", "sing", "play music",
    "what time is it", "who are you", "are you a robot", "are you real",
    "tell me a story", "what's your name"
]

# Greeting/small talk phrases (should respond naturally, not start booking)
SMALL_TALK_PHRASES = [
    "how are you", "how you doing", "how's it going", "what's up",
    "good morning", "good afternoon", "good evening", "hello", "hi there",
    "hey", "howdy", "how do you do", "nice to meet you"
]

# =============================================================================
# HVAC-SPECIFIC ISSUE DETECTION AND SMART RESPONSES
# =============================================================================
HVAC_ISSUES = {
    # Heating issues
    "no heat": "No heat can be frustrating, especially in cold weather. Our technicians are experts at diagnosing heating issues.",
    "not heating": "I understand your system isn't heating properly. Our technicians can diagnose and fix that.",
    "furnace": "Furnace issues are one of our specialties. We'll get your home warm again.",
    "heater": "We can definitely help with your heater. Our technicians handle all types of heating systems.",
    "heat pump": "Heat pumps can be tricky, but our certified technicians know them inside and out.",
    "cold air": "Getting cold air when you expect heat? That's a common issue we fix regularly.",
    
    # Cooling issues
    "no cooling": "No cooling in this weather is no fun. We'll get your AC back up and running.",
    "not cooling": "If your system isn't cooling, our technicians can find and fix the problem.",
    "ac not working": "AC troubles? We service all makes and models and can usually fix it same-day.",
    "air conditioner": "Air conditioner issues are our bread and butter. We'll take care of it.",
    "ac unit": "We work on all types of AC units. Let's get you scheduled.",
    "warm air": "Getting warm air from your AC? That's definitely something we can fix.",
    "not cold": "If your AC isn't blowing cold, there are several things it could be. We'll diagnose it.",
    
    # Thermostat issues
    "thermostat": "Thermostat issues can affect your whole system. We can repair or replace it.",
    "temperature": "Temperature control problems? We'll check your thermostat and system.",
    "won't turn on": "If your system won't turn on, it could be electrical or mechanical. We'll find out.",
    "won't turn off": "A system that won't turn off can run up your bills. Let's get that fixed.",
    
    # Airflow issues
    "no air": "No airflow could be a blower issue or ductwork problem. We'll check it out.",
    "weak airflow": "Weak airflow often means a filter or blower issue. Easy fixes for us.",
    "air flow": "Airflow problems can have several causes. Our technicians will diagnose it.",
    
    # Noise issues
    "loud noise": "Strange noises from your HVAC? That's definitely worth checking out before it gets worse.",
    "making noise": "Unusual noises often indicate a part that needs attention. Good call getting it checked.",
    "strange sound": "Strange sounds can mean different things. We'll identify and fix the source.",
    "banging": "Banging noises can indicate a serious issue. Let's get a technician out there.",
    "squealing": "Squealing usually means a belt or motor issue. We can fix that.",
    
    # Smell issues
    "bad smell": "Bad smells from your HVAC should definitely be checked. Could be mold or electrical.",
    "burning smell": "A burning smell needs immediate attention. Let's get someone out right away.",
    "musty": "Musty smells often indicate mold in the system. We can clean and treat that.",
    
    # General issues
    "broken": "We'll get your system back up and running. Our technicians are highly trained.",
    "not working": "Whatever the issue, our technicians can diagnose and repair it.",
    "needs repair": "We handle all types of HVAC repairs. Let's get you scheduled.",
    "maintenance": "Regular maintenance is smart! It prevents bigger problems down the road.",
    "tune up": "A tune-up is a great idea. It keeps your system running efficiently.",
    "inspection": "We offer thorough inspections. Great for peace of mind.",
}

def get_smart_issue_response(speech: str) -> str:
    """
    Generate a smart, contextual response based on the HVAC issue mentioned.
    Returns an empathetic, knowledgeable response.
    """
    speech_lower = speech.lower()
    
    for issue_keyword, response in HVAC_ISSUES.items():
        if issue_keyword in speech_lower:
            return f"{response} Would you like to schedule a service appointment?"
    
    # Default response for unrecognized issues
    return "I understand you're having an issue with your system. Our technicians are trained to handle all types of HVAC problems. Would you like to schedule a service appointment?"

# Filler phrases for natural conversation flow
FILLER_PHRASES = [
    "Let me check that for you.",
    "One moment please.",
    "Got it.",
    "Okay.",
    "Sure thing.",
    "Alright.",
]

# Processing sound URL (soft typing/thinking sound)
PROCESSING_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"  # Soft keyboard typing

# Words that should NEVER be treated as names
NOT_A_NAME_WORDS = [
    "yes", "yeah", "yep", "yup", "no", "nope", "okay", "ok", "sure",
    "correct", "right", "wrong", "help", "repeat", "what", "huh",
    "hello", "hi", "hey", "um", "uh", "hmm", "well", "so",
    "please", "thanks", "thank you", "sorry", "excuse me"
]

# Availability slots (stub - will connect to calendar later)
AVAILABLE_SLOTS = {
    "monday": ["morning", "afternoon"],
    "tuesday": ["morning", "afternoon"],
    "wednesday": ["morning", "afternoon"],
    "thursday": ["morning", "afternoon"],
    "friday": ["morning", "afternoon"],
    "saturday": ["morning"],
    "sunday": [],  # Closed
    "tomorrow": ["morning", "afternoon"],
    "today": ["afternoon"],  # Only afternoon available same-day
}

# Progress messages
PROGRESS_MESSAGES = {
    "name_done": "Great! Just a few more details.",
    "phone_done": "Perfect! Almost there.",
    "address_done": "Got it! Just 2 more questions.",
    "issue_done": "Thanks! Now let's schedule.",
    "date_done": "Last question!",
}


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


# NATO phonetic alphabet for spelling names
NATO_ALPHABET = {
    'a': 'A as in Alpha', 'b': 'B as in Bravo', 'c': 'C as in Charlie',
    'd': 'D as in Delta', 'e': 'E as in Echo', 'f': 'F as in Foxtrot',
    'g': 'G as in Golf', 'h': 'H as in Hotel', 'i': 'I as in India',
    'j': 'J as in Juliet', 'k': 'K as in Kilo', 'l': 'L as in Lima',
    'm': 'M as in Mike', 'n': 'N as in November', 'o': 'O as in Oscar',
    'p': 'P as in Papa', 'q': 'Q as in Quebec', 'r': 'R as in Romeo',
    's': 'S as in Sierra', 't': 'T as in Tango', 'u': 'U as in Uniform',
    'v': 'V as in Victor', 'w': 'W as in Whiskey', 'x': 'X as in X-ray',
    'y': 'Y as in Yankee', 'z': 'Z as in Zulu'
}

# Letter word mappings (what Twilio might transcribe)
LETTER_WORDS = {
    'alpha': 'a', 'bravo': 'b', 'charlie': 'c', 'delta': 'd', 'echo': 'e',
    'foxtrot': 'f', 'golf': 'g', 'hotel': 'h', 'india': 'i', 'juliet': 'j',
    'kilo': 'k', 'lima': 'l', 'mike': 'm', 'november': 'n', 'oscar': 'o',
    'papa': 'p', 'quebec': 'q', 'romeo': 'r', 'sierra': 's', 'tango': 't',
    'uniform': 'u', 'victor': 'v', 'whiskey': 'w', 'xray': 'x', 'x-ray': 'x',
    'yankee': 'y', 'zulu': 'z',
    # Common alternatives
    'apple': 'a', 'boy': 'b', 'cat': 'c', 'dog': 'd', 'edward': 'e',
    'frank': 'f', 'george': 'g', 'henry': 'h', 'john': 'j', 'king': 'k',
    'larry': 'l', 'mary': 'm', 'nancy': 'n', 'peter': 'p', 'queen': 'q',
    'robert': 'r', 'sam': 's', 'tom': 't', 'william': 'w', 'young': 'y',
    # Single letters (Twilio sometimes transcribes these)
    'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e', 'f': 'f', 'g': 'g',
    'h': 'h', 'i': 'i', 'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n',
    'o': 'o', 'p': 'p', 'q': 'q', 'r': 'r', 's': 's', 't': 't', 'u': 'u',
    'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
    # Common mishearings
    'bee': 'b', 'see': 'c', 'sea': 'c', 'dee': 'd', 'gee': 'g', 'jay': 'j',
    'kay': 'k', 'el': 'l', 'em': 'm', 'en': 'n', 'oh': 'o', 'pee': 'p',
    'cue': 'q', 'queue': 'q', 'are': 'r', 'es': 's', 'tee': 't', 'tea': 't',
    'you': 'u', 'vee': 'v', 'double': 'w', 'ex': 'x', 'why': 'y', 'zee': 'z',
}


def convert_spelled_to_name(speech: str) -> str:
    """
    Convert spelled letters to a name.
    Handles: "J O H N" or "J as in Juliet, O as in Oscar..." 
    """
    result = []
    words = speech.lower().replace(',', ' ').replace('.', ' ').split()
    
    skip_next = 0
    for i, word in enumerate(words):
        if skip_next > 0:
            skip_next -= 1
            continue
            
        # Skip filler words
        if word in ['as', 'in', 'like', 'for', 'is']:
            continue
        
        # Check letter mappings
        clean_word = re.sub(r'[^a-z]', '', word)
        if clean_word in LETTER_WORDS:
            result.append(LETTER_WORDS[clean_word])
    
    return ''.join(result).title()


def format_name_for_spelling(name: str) -> str:
    """Format name with NATO phonetic for confirmation."""
    letters = []
    for char in name.upper():
        if char.isalpha():
            letters.append(NATO_ALPHABET.get(char.lower(), char))
    return ', '.join(letters)


def extract_digits_chunk(speech: str, expected_length: int) -> Tuple[bool, str]:
    """
    Extract a specific number of digits from speech.
    More lenient - accepts if we get the expected count.
    
    Returns: (is_valid, digits)
    """
    # First try direct digit extraction
    digits = re.sub(r'\D', '', speech)
    
    # If not enough, try word conversion
    if len(digits) < expected_length:
        digits = convert_spoken_to_digits(speech)
    
    # Check if we got the expected length
    if len(digits) == expected_length:
        return True, digits
    elif len(digits) > expected_length:
        # Take the first N digits
        return True, digits[:expected_length]
    else:
        return False, digits


# =============================================================================
# CONVERSATION STATE
# =============================================================================
class ConversationState(str, Enum):
    GREETING = "greeting"
    IDENTIFY_NEED = "identify_need"
    # Name collection (2-step: say name, then spell to confirm)
    COLLECT_NAME = "collect_name"
    SPELL_NAME = "spell_name"          # Ask to spell for confirmation
    VERIFY_NAME = "verify_name"        # Confirm spelled name
    # Phone collection (chunked: area code → first 3 → last 4)
    COLLECT_AREA_CODE = "collect_area_code"
    COLLECT_PHONE_PREFIX = "collect_phone_prefix"
    COLLECT_PHONE_LINE = "collect_phone_line"
    VERIFY_PHONE = "verify_phone"
    # Address collection
    COLLECT_ADDRESS = "collect_address"
    VERIFY_ADDRESS = "verify_address"
    # Issue and scheduling
    COLLECT_ISSUE = "collect_issue"
    COLLECT_DATE = "collect_date"
    COLLECT_TIME = "collect_time"
    CONFIRM = "confirm"
    PARTIAL_CORRECTION = "partial_correction"  # What to change?
    COMPLETE = "complete"
    FAQ = "faq"
    EMERGENCY = "emergency"
    TRANSFER = "transfer"
    GOODBYE = "goodbye"
    # Human request handling (callback flow)
    HUMAN_REQUEST = "human_request"           # Offer to help or callback
    COLLECT_CALLBACK_NUMBER = "collect_callback_number"
    COLLECT_MESSAGE = "collect_message"
    CALLBACK_CONFIRM = "callback_confirm"


# =============================================================================
# UNIVERSAL COMMAND DETECTION
# =============================================================================
def check_universal_commands(speech: str, session: Dict) -> Optional[Tuple[str, str]]:
    """
    Check for universal commands that work in any state.
    Returns (command_type, response) or None.
    """
    speech_lower = speech.lower().strip()
    
    # Human request - offer callback instead of immediate transfer
    if any(phrase in speech_lower for phrase in HUMAN_REQUEST_PHRASES):
        return ("human_request", None)
    
    # Repeat last response
    if any(phrase in speech_lower for phrase in REPEAT_PHRASES):
        last_response = session.get("last_response", "I'm here to help you schedule an HVAC service appointment.")
        return ("repeat", f"Sure, I said: {last_response}")
    
    # Help - explain what we can do
    if any(phrase in speech_lower for phrase in HELP_PHRASES):
        return ("help", f"I can help you schedule an HVAC service appointment, answer questions about our services, or connect you with our team. Our service call fee is $89 which includes the diagnostic. We're located at {COMPANY_ADDRESS}. What would you like to do?")
    
    # Start over
    if any(phrase in speech_lower for phrase in START_OVER_PHRASES):
        return ("start_over", "No problem, let's start fresh. How can I help you today?")
    
    # Off-topic redirect
    if any(phrase in speech_lower for phrase in OFF_TOPIC_PHRASES):
        return ("off_topic", f"I'm {COMPANY_NAME}'s scheduling assistant. I can help you book an HVAC service appointment or answer questions about our services. What can I help you with?")
    
    # Company location question
    if "where" in speech_lower and ("located" in speech_lower or "address" in speech_lower or "location" in speech_lower):
        return ("location", f"We're located at {COMPANY_ADDRESS}. Would you like to schedule a service appointment?")
    
    return None


async def smart_gpt_response(speech: str, current_state: str, session: Dict) -> str:
    """
    Use GPT to generate a smart, contextual response for complex or off-topic queries.
    Always steers conversation back to HVAC services naturally.
    """
    if not OPENAI_API_KEY:
        return f"I'm here to help with HVAC services. Would you like to schedule an appointment?"
    
    try:
        import openai
        client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
        
        system_prompt = f"""You are a friendly, intelligent AI assistant for {COMPANY_NAME}, an HVAC company.
Your primary job is to help customers schedule service appointments, but you can engage in brief friendly conversation.

Key information:
- Company: {COMPANY_NAME}
- Address: {COMPANY_ADDRESS}
- Phone: {COMPANY_PHONE}
- Service call fee: $89 (includes diagnostic)
- Hours: Monday-Friday 8am-6pm, Saturday 8am-12pm, Closed Sunday
- Services: AC repair, heating repair, maintenance, installation, thermostat issues, duct cleaning

Personality:
- Warm, professional, and helpful
- Can engage in brief small talk but always steers back to helping with HVAC
- If asked about non-HVAC topics (politics, weather, sports), give a brief friendly response then redirect
- Never argue or get into debates
- Keep responses SHORT (1-2 sentences max) - this is a phone call

Current conversation state: {current_state}
Customer has said: "{speech}"

Respond naturally and helpfully. If they're not talking about HVAC, acknowledge briefly then ask how you can help with their heating or cooling needs."""

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": speech}
            ],
            max_tokens=100,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error("GPT response failed: %s", str(e))
        return "I'm here to help with your HVAC needs. Would you like to schedule a service appointment?"


def check_sentiment(speech: str) -> str:
    """
    Basic sentiment detection.
    Returns: 'frustrated', 'confused', 'neutral', 'positive'
    """
    speech_lower = speech.lower()
    
    frustrated_words = ["frustrated", "annoying", "annoyed", "ridiculous", "terrible", 
                       "worst", "hate", "stupid", "useless", "waste of time", "this is taking forever"]
    confused_words = ["confused", "don't understand", "what do you mean", "huh", "i don't get it"]
    positive_words = ["thank you", "thanks", "great", "perfect", "awesome", "wonderful"]
    
    if any(word in speech_lower for word in frustrated_words):
        return "frustrated"
    if any(word in speech_lower for word in confused_words):
        return "confused"
    if any(word in speech_lower for word in positive_words):
        return "positive"
    return "neutral"


def parse_date(speech: str) -> Tuple[bool, str, str]:
    """
    Parse and validate date from speech.
    Returns: (is_valid, parsed_date, spoken_date)
    """
    speech_lower = speech.lower().strip()
    
    # Common date phrases
    today_words = ["today", "this afternoon", "right now", "as soon as possible", "asap"]
    tomorrow_words = ["tomorrow", "next day"]
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    
    for word in today_words:
        if word in speech_lower:
            return True, "today", "today"
    
    for word in tomorrow_words:
        if word in speech_lower:
            return True, "tomorrow", "tomorrow"
    
    for day in day_names:
        if day in speech_lower:
            return True, day, day.capitalize()
    
    # Check for "next week", "this week"
    if "next week" in speech_lower:
        return True, "next week", "next week"
    if "this week" in speech_lower:
        return True, "this week", "this week"
    
    # If we can't parse, still accept but flag
    if len(speech_lower) > 2:
        return True, speech_lower, speech.strip()
    
    return False, "", ""


def check_availability(date: str, time: str) -> Tuple[bool, str]:
    """
    Check if requested slot is available.
    Returns: (is_available, message)
    """
    date_lower = date.lower()
    time_lower = time.lower() if time else ""
    
    # Check if day is in our availability
    available_times = None
    for day, times in AVAILABLE_SLOTS.items():
        if day in date_lower:
            available_times = times
            break
    
    if available_times is None:
        # Unknown day, assume available
        return True, ""
    
    if not available_times:
        return False, f"I'm sorry, we're closed on {date}. Would Monday work instead?"
    
    if time_lower:
        if "morning" in time_lower and "morning" not in available_times:
            return False, f"Morning isn't available on {date}. We have afternoon available. Would that work?"
        if "afternoon" in time_lower and "afternoon" not in available_times:
            return False, f"Afternoon isn't available on {date}. We have morning available. Would that work?"
    
    return True, ""


async def send_sms_confirmation(phone: str, name: str, date: str, time: str, address: str) -> bool:
    """
    Send SMS confirmation (stub - configure Twilio SMS when ready).
    Returns True if sent successfully.
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN or not TWILIO_PHONE_NUMBER:
        logger.info("SMS not configured - skipping confirmation SMS")
        return False
    
    try:
        # Stub - will implement when Twilio SMS is configured
        message = f"Hi {name}! Your {COMPANY_NAME} appointment is confirmed for {date} ({time}) at {address}. Call {COMPANY_PHONE} to reschedule. Thank you!"
        logger.info("SMS would be sent to %s: %s", phone, message)
        # TODO: Implement actual Twilio SMS sending
        # from twilio.rest import Client
        # client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        # client.messages.create(body=message, from_=TWILIO_PHONE_NUMBER, to=phone)
        return True
    except Exception as e:
        logger.error("Failed to send SMS: %s", str(e))
        return False


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
        f"Thanks for calling {COMPANY_NAME}! This call may be recorded for quality purposes. Are you calling to schedule a service appointment today?",
    ],
    ConversationState.IDENTIFY_NEED: [
        "Got it. Are you looking to schedule a service appointment, or do you have a question I can help with?",
    ],
    ConversationState.COLLECT_NAME: [
        "Perfect, I can help you schedule that. May I have your name please?",
        "Sure thing! Let me get you scheduled. What's your name?",
        "Absolutely, I'll set that up. Can I get your name?",
    ],
    ConversationState.COLLECT_AREA_CODE: [
        "Thanks {name}! Now for your phone number. What's your area code? Just the 3 digits.",
    ],
    ConversationState.COLLECT_PHONE_PREFIX: [
        "Got it. And the next 3 digits?",
    ],
    ConversationState.COLLECT_PHONE_LINE: [
        "And the last 4 digits?",
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
    
    Enterprise features:
    - Universal commands (help, repeat, start over, human request)
    - Sentiment detection with proactive escalation
    - Off-topic redirect
    - Date/time validation with availability checking
    - Partial correction flow
    - Progress indicators
    
    Returns:
        (next_state, response_text, updated_slots)
    """
    current_state = ConversationState(session["state"])
    slots = session["slots"]
    speech_lower = speech.lower().strip()
    
    # =========================================================================
    # UNIVERSAL COMMANDS (work in any state)
    # =========================================================================
    command = check_universal_commands(speech, session)
    if command:
        cmd_type, cmd_response = command
        
        if cmd_type == "human_request":
            # Don't transfer immediately - offer to help or callback
            return ConversationState.HUMAN_REQUEST, "I understand you'd like to speak with someone. I can definitely help with most things, but if you prefer, I can have someone call you back. Would you like me to help you now, or would you prefer a callback?", slots
        
        if cmd_type == "start_over":
            # Reset slots and go to greeting
            slots = {k: None for k in slots}
            session["slots"] = slots
            return ConversationState.GREETING, cmd_response, slots
        
        if cmd_type in ["repeat", "help", "off_topic", "location"]:
            # Stay in current state, just respond
            return current_state, cmd_response, slots
    
    # Sentiment detection - escalate frustrated callers
    sentiment = check_sentiment(speech)
    if sentiment == "frustrated":
        logger.info("Frustrated caller detected: %s", speech[:50])
        return ConversationState.HUMAN_REQUEST, "I can hear this has been frustrating. I want to make sure you get the help you need. Would you like me to continue helping you, or would you prefer I have someone call you back right away?", slots
    
    # Quick emergency check
    if is_emergency(speech):
        return ConversationState.EMERGENCY, get_prompt(ConversationState.EMERGENCY), slots
    
    # =========================================================================
    # HUMAN REQUEST FLOW (callback instead of immediate transfer)
    # =========================================================================
    if current_state == ConversationState.HUMAN_REQUEST:
        if any(word in speech_lower for word in ["help", "continue", "you", "yes help", "go ahead"]):
            # User wants to continue with bot
            return ConversationState.GREETING, "Great! I'm happy to help. What can I do for you today?", slots
        elif any(word in speech_lower for word in ["callback", "call back", "call me", "someone call", "prefer"]):
            # User wants callback
            return ConversationState.COLLECT_CALLBACK_NUMBER, "No problem! What's the best number for us to call you back?", slots
        else:
            return current_state, "Would you like me to help you now, or would you prefer a callback from our team?", slots
    
    if current_state == ConversationState.COLLECT_CALLBACK_NUMBER:
        is_valid, formatted, spoken = validate_phone(speech)
        if is_valid:
            slots["callback_phone"] = formatted
            slots["callback_phone_spoken"] = spoken
            return ConversationState.COLLECT_MESSAGE, f"Got it, {spoken}. Is there a message you'd like me to pass along?", slots
        return current_state, "I need a phone number to call you back. What's the best number?", slots
    
    if current_state == ConversationState.COLLECT_MESSAGE:
        slots["callback_message"] = speech.strip() if speech.strip() and speech_lower not in ["no", "nope", "nothing"] else "Customer requested callback"
        return ConversationState.CALLBACK_CONFIRM, f"Perfect! I'll have someone call you at {slots.get('callback_phone_spoken', slots.get('callback_phone'))} as soon as possible. Is there anything else I can help with?", slots
    
    if current_state == ConversationState.CALLBACK_CONFIRM:
        if any(word in speech_lower for word in ["yes", "yeah", "actually", "one more"]):
            return ConversationState.GREETING, "Sure! What else can I help you with?", slots
        return ConversationState.GOODBYE, f"Great! Someone will call you back shortly. Thank you for calling {COMPANY_NAME}. Have a great day!", slots
    
    # FAST PATH: Check for common FAQ questions (skip GPT)
    if current_state == ConversationState.GREETING:
        # Handle small talk naturally - don't jump to booking
        if any(phrase in speech_lower for phrase in SMALL_TALK_PHRASES):
            return current_state, "I'm doing great, thank you for asking! Are you calling to schedule a service appointment, or do you have a question about your HVAC system?", slots
        
        # Handle yes/no responses to "Are you calling to schedule?"
        if any(word in speech_lower for word in YES_WORDS):
            return ConversationState.COLLECT_NAME, "Great! Let me get you scheduled. May I have your name please?", slots
        
        if any(word in speech_lower for word in NO_WORDS):
            return current_state, "No problem! Do you have a question about your HVAC system, or is there something else I can help with?", slots
        
        faq_answer = quick_faq_check(speech)
        if faq_answer:
            logger.info("Fast FAQ match for: %s", speech[:30])
            return ConversationState.FAQ, faq_answer, slots
        
        # Check if they're describing an HVAC issue - give smart response
        for issue_keyword in HVAC_ISSUES.keys():
            if issue_keyword in speech_lower:
                smart_response = get_smart_issue_response(speech)
                return ConversationState.COLLECT_NAME, f"{smart_response.replace('Would you like to schedule a service appointment?', '')} Let me get you scheduled. May I have your name please?", slots
        
        # For anything else unrecognized, use smart GPT to respond naturally
        # This handles general conversation, off-topic, and complex queries
        smart_response = await smart_gpt_response(speech, "greeting", session)
        return current_state, smart_response, slots
    
    # =========================================================================
    # NAME COLLECTION (simplified - no spelling required for common names)
    # =========================================================================
    if current_state == ConversationState.COLLECT_NAME:
        # First check if they said yes/no/help instead of a name
        if any(word == speech_lower.strip() for word in NOT_A_NAME_WORDS):
            if any(word in speech_lower for word in YES_WORDS):
                return current_state, "Great! And what's your name?", slots
            elif any(word in speech_lower for word in NO_WORDS):
                return ConversationState.GREETING, "No problem! Is there something else I can help you with?", slots
            else:
                return current_state, "I need your name to schedule the appointment. What's your first name?", slots
        
        # Clean up the name - remove filler words
        name = speech.strip()
        filler_phrases = ["my name is", "this is", "i'm", "im", "i am", "it's", "its", "call me", "you can call me", "they call me"]
        name_lower = name.lower()
        for filler in filler_phrases:
            if name_lower.startswith(filler):
                name = name[len(filler):].strip()
                break
        
        # Remove trailing filler
        trailing_fillers = ["here", "speaking", "calling"]
        for filler in trailing_fillers:
            if name_lower.endswith(filler):
                name = name[:-len(filler)].strip()
        
        name = name.title()
        
        # Validate it looks like a name (not too short, not a command)
        if len(name) >= 2 and name.lower() not in NOT_A_NAME_WORDS:
            slots["name"] = name
            # Skip spelling - just confirm and move on (faster flow)
            return ConversationState.COLLECT_AREA_CODE, f"Hi {name}! Now I need your phone number. What's your area code? Just the 3 digits.", slots
        else:
            return current_state, "I didn't catch your name. What's your first name?", slots
    
    if current_state == ConversationState.SPELL_NAME:
        # Check if they said "yes" or "correct" (accepting what we heard)
        if any(word in speech_lower for word in YES_WORDS):
            slots["name"] = slots.get("name_heard", "")
            return ConversationState.COLLECT_AREA_CODE, f"Great, {slots['name']}! Now for your phone number. What's your area code? Just the 3 digits.", slots
        
        # Try to convert spelled letters to name
        spelled_name = convert_spelled_to_name(speech)
        
        if len(spelled_name) >= 2:
            slots["name_spelled"] = spelled_name
            return ConversationState.VERIFY_NAME, f"So that's {spelled_name}, spelled {format_name_for_spelling(spelled_name)}. Is that correct?", slots
        else:
            # Maybe they just said the name again
            name = speech.strip().title()
            if len(name) >= 2:
                slots["name_heard"] = name
                return current_state, f"I heard {name}. Could you spell that out for me letter by letter?", slots
            return current_state, "I didn't catch that. Please spell your name letter by letter.", slots
    
    if current_state == ConversationState.VERIFY_NAME:
        if any(word in speech_lower for word in YES_WORDS):
            slots["name"] = slots.get("name_spelled", slots.get("name_heard", ""))
            return ConversationState.COLLECT_AREA_CODE, f"Perfect, {slots['name']}! Now for your phone number. What's your area code? Just the 3 digits.", slots
        elif any(word in speech_lower for word in NO_WORDS):
            return ConversationState.SPELL_NAME, "No problem. Please spell your name again, letter by letter.", slots
        return current_state, f"Is {slots.get('name_spelled', 'that')} correct? Yes or no?", slots
    
    # =========================================================================
    # PHONE COLLECTION (chunked: area code → prefix → line number)
    # =========================================================================
    if current_state == ConversationState.COLLECT_AREA_CODE:
        is_valid, digits = extract_digits_chunk(speech, 3)
        if is_valid:
            slots["area_code"] = digits
            spoken = f"{digits[0]} {digits[1]} {digits[2]}"
            return ConversationState.COLLECT_PHONE_PREFIX, f"Area code {spoken}. Now the next 3 digits?", slots
        else:
            return current_state, "I need your 3-digit area code. For example, 5 5 5. What's your area code?", slots
    
    if current_state == ConversationState.COLLECT_PHONE_PREFIX:
        is_valid, digits = extract_digits_chunk(speech, 3)
        if is_valid:
            slots["phone_prefix"] = digits
            area = slots.get("area_code", "")
            spoken = f"{area[0]} {area[1]} {area[2]}, {digits[0]} {digits[1]} {digits[2]}"
            return ConversationState.COLLECT_PHONE_LINE, f"Got it, {spoken}. And the last 4 digits?", slots
        else:
            return current_state, "I need the next 3 digits of your phone number.", slots
    
    if current_state == ConversationState.COLLECT_PHONE_LINE:
        is_valid, digits = extract_digits_chunk(speech, 4)
        if is_valid:
            slots["phone_line"] = digits
            # Combine all parts
            area = slots.get("area_code", "")
            prefix = slots.get("phone_prefix", "")
            full_phone = f"({area}) {prefix}-{digits}"
            slots["phone"] = full_phone
            spoken = f"{area[0]} {area[1]} {area[2]}, {prefix[0]} {prefix[1]} {prefix[2]}, {digits[0]} {digits[1]} {digits[2]} {digits[3]}"
            slots["phone_spoken"] = spoken
            return ConversationState.VERIFY_PHONE, f"I have {spoken}. Is that correct?", slots
        else:
            return current_state, "I need the last 4 digits of your phone number.", slots
    
    if current_state == ConversationState.VERIFY_PHONE:
        if any(word in speech_lower for word in YES_WORDS):
            return ConversationState.COLLECT_ADDRESS, "Great! What's the service address?", slots
        elif any(word in speech_lower for word in NO_WORDS):
            slots["area_code"] = None
            slots["phone_prefix"] = None
            slots["phone_line"] = None
            slots["phone"] = None
            return ConversationState.COLLECT_AREA_CODE, "No problem. Let's start over. What's your area code?", slots
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
        if any(word in speech_lower for word in YES_WORDS):
            return ConversationState.COLLECT_ISSUE, "Perfect! What's going on with your system? Just a quick description.", slots
        elif any(word in speech_lower for word in NO_WORDS):
            slots["address"] = None
            return ConversationState.COLLECT_ADDRESS, "Let me get that again. What's the service address?", slots
        return current_state, f"Is {slots.get('address', 'that address')} correct? Yes or no?", slots
    
    if current_state == ConversationState.COLLECT_ISSUE:
        # Store the issue and give a smart, contextual response
        slots["issue"] = speech.strip()
        smart_response = get_smart_issue_response(speech)
        # If they already said yes to scheduling, go to date
        if "would you like to schedule" in smart_response.lower():
            # They described an issue, acknowledge it smartly and ask about scheduling
            return ConversationState.COLLECT_DATE, f"{smart_response.replace('Would you like to schedule a service appointment?', '')} {PROGRESS_MESSAGES['issue_done']} When would you like us to come out? We're available Monday through Saturday.", slots
        return ConversationState.COLLECT_DATE, f"{PROGRESS_MESSAGES['issue_done']} When would you like us to come out? We're available Monday through Saturday.", slots
    
    if current_state == ConversationState.COLLECT_DATE:
        # Parse and validate date
        is_valid, parsed_date, spoken_date = parse_date(speech)
        if is_valid:
            # Check availability
            is_available, availability_msg = check_availability(parsed_date, None)
            if not is_available:
                return current_state, availability_msg, slots
            slots["date"] = spoken_date
            return ConversationState.COLLECT_TIME, f"{PROGRESS_MESSAGES['date_done']} Do you prefer morning or afternoon?", slots
        return current_state, "What day works for you? You can say tomorrow, Monday, Tuesday, or any day this week.", slots
    
    if current_state == ConversationState.COLLECT_TIME:
        time_lower = speech.lower().strip()
        # Validate time preference
        if "morning" in time_lower:
            slots["time"] = "morning"
        elif "afternoon" in time_lower:
            slots["time"] = "afternoon"
        elif any(word in time_lower for word in ["either", "any", "doesn't matter", "don't care"]):
            slots["time"] = "morning"  # Default to morning
        else:
            return current_state, "Would you prefer morning or afternoon?", slots
        
        # Check availability for the time slot
        is_available, availability_msg = check_availability(slots.get("date", ""), slots["time"])
        if not is_available:
            slots["time"] = None
            return current_state, availability_msg, slots
        
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
        # Check for yes/no in speech directly using comprehensive word lists
        if any(word in speech_lower for word in YES_WORDS):
            logger.info("BOOKING CONFIRMED: %s", slots)
            
            # Try to send SMS confirmation (stub)
            await send_sms_confirmation(
                slots.get("phone", ""),
                slots.get("name", ""),
                slots.get("date", ""),
                slots.get("time", ""),
                slots.get("address", "")
            )
            
            complete_msg = f"Perfect! You're all set, {slots.get('name')}. " \
                          f"A technician will be at {slots.get('address')} on {slots.get('date')} in the {slots.get('time')}. " \
                          f"We'll call {slots.get('phone_spoken', slots.get('phone'))} if anything changes. " \
                          f"Thanks for choosing {COMPANY_NAME}!"
            return ConversationState.COMPLETE, complete_msg, slots
        elif any(word in speech_lower for word in NO_WORDS):
            # Partial correction flow - ask what to change
            return ConversationState.PARTIAL_CORRECTION, "No problem! What would you like to change? You can say name, phone, address, issue, or appointment time.", slots
        elif "start over" in speech_lower:
            slots = {k: None for k in slots}
            return ConversationState.COLLECT_NAME, "Let's start fresh. What's your name?", slots
        # If unclear, ask again more explicitly
        return current_state, "I need a yes or no. Is the booking information correct?"
    
    elif current_state == ConversationState.PARTIAL_CORRECTION:
        # Handle partial corrections
        if "name" in speech_lower:
            slots["name"] = None
            return ConversationState.COLLECT_NAME, "What's your name?", slots
        elif "phone" in speech_lower or "number" in speech_lower:
            slots["phone"] = None
            slots["area_code"] = None
            slots["phone_prefix"] = None
            slots["phone_line"] = None
            return ConversationState.COLLECT_AREA_CODE, "What's your area code?", slots
        elif "address" in speech_lower:
            slots["address"] = None
            return ConversationState.COLLECT_ADDRESS, "What's the service address?", slots
        elif "issue" in speech_lower or "problem" in speech_lower:
            slots["issue"] = None
            return ConversationState.COLLECT_ISSUE, "What's going on with your system?", slots
        elif "time" in speech_lower or "date" in speech_lower or "appointment" in speech_lower or "schedule" in speech_lower:
            slots["date"] = None
            slots["time"] = None
            return ConversationState.COLLECT_DATE, "When would you like us to come out?", slots
        elif any(word in speech_lower for word in ["nothing", "never mind", "it's fine", "actually correct"]):
            # They changed their mind
            summary = f"Okay, let me confirm again: {slots.get('name')}, phone {slots.get('phone_spoken', slots.get('phone'))}, " \
                      f"at {slots.get('address')}, for {slots.get('issue')}, " \
                      f"{slots.get('date')} in the {slots.get('time')}. Is that correct?"
            return ConversationState.CONFIRM, summary, slots
        return current_state, "What would you like to change? Name, phone, address, issue, or appointment time?", slots
    
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
    
    # Try ElevenLabs first - ALWAYS try to use ElevenLabs
    import html
    safe_text = html.escape(text)
    
    audio_url = None
    if is_elevenlabs_available():
        try:
            audio_url = await generate_audio_url(text, host)
            if audio_url:
                logger.info("ElevenLabs audio URL: %s", audio_url)
        except Exception as e:
            logger.error("ElevenLabs failed: %s - retrying once", str(e))
            # Retry once
            try:
                audio_url = await generate_audio_url(text, host)
            except Exception as e2:
                logger.error("ElevenLabs retry failed: %s", str(e2))
    
    # Build voice element - ElevenLabs Play is strongly preferred
    if audio_url:
        voice_element = f'<Play>{audio_url}</Play>'
    else:
        # Last resort fallback - should rarely happen
        logger.warning("FALLBACK TO POLLY - ElevenLabs unavailable for: %s", text[:50])
        voice_element = f'<Say voice="Polly.Joanna-Neural">{safe_text}</Say>'
    
    # Generate fallback audio URLs for timeout messages (use ElevenLabs)
    fallback_msg1 = "I didn't catch that. Could you please repeat?"
    fallback_msg2 = "I'm still here. Are you calling to schedule a service?"
    fallback_msg3 = "I'm having trouble hearing you. Let me connect you with someone who can help."
    
    fallback_audio1 = None
    fallback_audio2 = None
    fallback_audio3 = None
    
    if is_elevenlabs_available():
        try:
            fallback_audio1 = await generate_audio_url(fallback_msg1, host)
            fallback_audio2 = await generate_audio_url(fallback_msg2, host)
            fallback_audio3 = await generate_audio_url(fallback_msg3, host)
        except Exception as e:
            logger.warning("Failed to generate fallback audio: %s", str(e))
    
    # Build fallback voice elements
    if fallback_audio1:
        fallback_element1 = f'<Play>{fallback_audio1}</Play>'
    else:
        fallback_element1 = f'<Say voice="Polly.Joanna-Neural">{html.escape(fallback_msg1)}</Say>'
    
    if fallback_audio2:
        fallback_element2 = f'<Play>{fallback_audio2}</Play>'
    else:
        fallback_element2 = f'<Say voice="Polly.Joanna-Neural">{html.escape(fallback_msg2)}</Say>'
    
    if fallback_audio3:
        fallback_element3 = f'<Play>{fallback_audio3}</Play>'
    else:
        fallback_element3 = f'<Say voice="Polly.Joanna-Neural">{html.escape(fallback_msg3)}</Say>'
    
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
    {fallback_element1}
    <Gather input="speech dtmf" action="{action}" method="POST" timeout="{GATHER_TIMEOUT}" speechTimeout="{GATHER_SPEECH_TIMEOUT}" speechModel="phone_call" enhanced="true" language="en-US" bargeIn="true">
        {fallback_element2}
    </Gather>
    {fallback_element3}
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
            elif current_state == ConversationState.SPELL_NAME:
                reprompt = "Could you spell your name for me? Say each letter, like A as in Apple."
            elif current_state == ConversationState.COLLECT_AREA_CODE:
                reprompt = "What's your 3-digit area code?"
            elif current_state == ConversationState.COLLECT_PHONE_PREFIX:
                reprompt = "What are the next 3 digits of your phone number?"
            elif current_state == ConversationState.COLLECT_PHONE_LINE:
                reprompt = "And the last 4 digits?"
            elif current_state == ConversationState.COLLECT_ADDRESS:
                reprompt = "What's the street address where you need service?"
            elif current_state in [ConversationState.VERIFY_NAME, ConversationState.VERIFY_PHONE, ConversationState.VERIFY_ADDRESS, ConversationState.CONFIRM]:
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
        
        # Play a brief acknowledgment sound while processing (reduces perceived latency)
        # This is a soft "thinking" indicator
        processing_ack = random.choice(["Okay.", "Got it.", "Alright.", "Sure."])
        
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
