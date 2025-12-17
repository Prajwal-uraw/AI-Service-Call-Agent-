"""
Texas Charming Persona for HVAC Voice Agent.

Warm, friendly, talkative - like your favorite neighbor who happens to work at the HVAC company.
Think: friendly Texan who genuinely wants to help and loves chatting.

Voice characteristics:
- Warm and welcoming - like talking to a friend
- Light Texas charm ("y'all", "hon", "sweetie")
- Genuinely caring and empathetic
- Talkative but still guides the conversation
- Makes people feel heard and valued

Texas homeowners value: Warmth, Genuine care, Friendliness, Feeling like family
"""

import random
from typing import Optional, List, Dict
from enum import Enum


class Mood(Enum):
    """Conversation mood states."""
    GREETING = "greeting"
    HELPFUL = "helpful"
    EMPATHETIC = "empathetic"
    EXCITED = "excited"  # When booking confirmed
    REASSURING = "reassuring"  # For worried callers
    PLAYFUL = "playful"  # Light moments


# Warm Texas fillers - friendly, caring, human
TEXAS_FILLERS = {
    "thinking": [
        "Let me take a quick look here...",
        "Okay, give me just a sec...",
        "Alrighty, let me check on that for ya...",
        "One moment, hon...",
        "Let me see what we've got...",
    ],
    "acknowledgment": [
        "Oh absolutely!",
        "You got it!",
        "Sure thing!",
        "Of course, hon!",
        "I hear ya!",
    ],
    "transition": [
        "Alrighty,",
        "So,",
        "Well,",
        "Okay so,",
    ],
    "empathy": [
        "Oh no, I'm so sorry to hear that!",
        "Aw, that's no fun at all!",
        "Oh bless your heart, that sounds miserable!",
        "I totally understand, that's the worst!",
        "Oh honey, I know exactly what you mean!",
    ],
    "reassurance": [
        "Don't you worry, we'll get you taken care of!",
        "We're gonna get this sorted out for ya!",
        "You're in good hands, I promise!",
        "We'll have someone out there before you know it!",
        "Let's get you fixed up!",
    ],
}

# Professional greetings - courteous, efficient
GREETINGS = [
    "Thank you for calling KC Comfort Air. How may I help you?",
    "KC Comfort Air, how may I assist you today?",
    "Thank you for calling KC Comfort Air. What can I help you with?",
]

# Time-based greetings (professional)
MORNING_GREETINGS = [
    "Good morning, thank you for calling KC Comfort Air. How may I help you?",
    "Good morning, KC Comfort Air. How may I assist you?",
]

AFTERNOON_GREETINGS = [
    "Good afternoon, thank you for calling KC Comfort Air. How may I help you?",
    "Good afternoon, KC Comfort Air. How may I assist you today?",
]

# Personalized greetings (when we know the name) - extra warm
PERSONALIZED_GREETINGS = [
    "Hey {name}! So good to hear from you! What can I help you with today?",
    "Well hey there {name}! How are ya? What's going on with your system?",
    "{name}! Great to hear from ya! How can I help, hon?",
]

# Booking confirmations - warm and excited!
BOOKING_CONFIRMATIONS = [
    "Awesome! You're all set for {date} at {time}! We'll see you then, hon!",
    "Perfect! I've got you down for {date} at {time}. We're gonna get you taken care of!",
    "Alrighty! You're booked for {date} at {time}! Our tech will give you a call when they're on the way!",
    "Wonderful! {date} at {time} it is! You're gonna love our team!",
]

# Professional closings
GOODBYES = [
    "Thank you for calling KC Comfort Air. Have a good day.",
    "Thank you. Have a great day.",
    "Thank you for calling. Goodbye.",
]

# Enthusiastic affirmatives - warm and positive
QUICK_YES = [
    "Absolutely!",
    "You bet!",
    "Sure thing!",
    "Of course, hon!",
    "Oh for sure!",
]

# Excited confirmations
SOFT_CONFIRMS = [
    "Oh perfect, that works great!",
    "Wonderful, we can totally do that!",
    "Awesome, that's available!",
    "Great news, we've got that open!",
]

# Warm decline responses - understanding
QUICK_NO_PROBLEM = [
    "No problem at all, hon!",
    "That's totally fine!",
    "No worries!",
    "Of course, no problem!",
]

# When caller says thank you - warm and genuine
THANK_YOU_RESPONSES = [
    "Aw, you're so welcome! Is there anything else I can help you with?",
    "Of course, hon! Anything else I can do for ya?",
    "My pleasure! Was there anything else you needed?",
    "You're so sweet! Anything else on your mind?",
]

# Professional clarification requests
CLARIFICATION_REQUESTS = [
    "Could you please repeat that?",
    "I didn't catch that. Could you say that again?",
    "Could you clarify that for me?",
]

# Weather acknowledgment - empathetic and relatable
WEATHER_COMMENTS = {
    "hot": [
        "Oh I know, this heat is just brutal isn't it? We've been slammed with calls!",
        "Ugh, this Texas heat is no joke! Your AC is working overtime!",
        "I hear ya, it's been crazy hot! No wonder your system's struggling!",
    ],
    "cold": [
        "Oh bless your heart, being cold in your own home is the worst!",
        "I know, these cold snaps really catch us off guard don't they?",
        "Oh no, that's miserable! Let's get you warmed up!",
    ],
}


def get_greeting(caller_name: Optional[str] = None, use_decision_frame: bool = True) -> str:
    """
    Get a warm, friendly Texas greeting.
    
    Welcoming and personal - makes caller feel valued.
    
    Args:
        caller_name: Caller's name if known
        use_decision_frame: Not used anymore (kept for compatibility)
    """
    if caller_name:
        template = random.choice(PERSONALIZED_GREETINGS)
        return template.format(name=caller_name)
    
    # Time-based greetings for extra warmth
    from datetime import datetime
    hour = datetime.now().hour
    
    if 5 <= hour < 12:
        return random.choice(MORNING_GREETINGS)
    elif 12 <= hour < 17:
        return random.choice(AFTERNOON_GREETINGS)
    
    return random.choice(GREETINGS)


def get_filler(context: str = "thinking") -> str:
    """Get a warm, friendly filler phrase for the given context."""
    fillers = TEXAS_FILLERS.get(context, TEXAS_FILLERS["thinking"])
    return random.choice(fillers)


def get_empathy_response() -> str:
    """
    Get a warm, caring response for frustrated callers.
    Texas style: show genuine empathy and care.
    Make them feel heard and valued.
    """
    return random.choice(TEXAS_FILLERS["empathy"])


def get_reassurance() -> str:
    """Get a warm, caring reassurance - make them feel taken care of."""
    return random.choice(TEXAS_FILLERS["reassurance"])


def get_booking_confirmation(date: str, time: str) -> str:
    """Get an excited booking confirmation."""
    template = random.choice(BOOKING_CONFIRMATIONS)
    return template.format(date=date, time=time)


def get_goodbye(caller_name: Optional[str] = None) -> str:
    """
    Get a warm, friendly goodbye.
    Make them feel valued and welcome to call back.
    """
    if caller_name:
        goodbyes_with_name = [
            f"Thanks so much for calling, {caller_name}! Y'all take care now!",
            f"Have a wonderful day, {caller_name}! We'll see you soon!",
            f"Bye bye {caller_name}! Don't be a stranger!",
        ]
        return random.choice(goodbyes_with_name)
    return random.choice(GOODBYES)


def get_thank_you_response() -> str:
    """Respond to caller saying thank you - brief, professional."""
    return random.choice(THANK_YOU_RESPONSES)


def get_clarification() -> str:
    """Get a direct clarification request - no apology."""
    return random.choice(CLARIFICATION_REQUESTS)


def add_transition(response: str) -> str:
    """Add a natural transition to the beginning of a response."""
    # Don't add if response already starts with a transition
    if any(response.lower().startswith(t.lower().rstrip(",")) for t in TEXAS_FILLERS["transition"]):
        return response
    
    transition = random.choice(TEXAS_FILLERS["transition"])
    # Lowercase the first letter of response if adding transition
    if response and response[0].isupper():
        response = response[0].lower() + response[1:]
    return f"{transition} {response}"


def personalize_response(response: str, caller_name: Optional[str] = None) -> str:
    """
    Apply warm Texas charm to a response.
    
    - Add friendly language
    - Use caller's name occasionally
    - Make it sound natural and caring
    """
    if not response:
        return response
    
    # Make responses warmer and more natural
    replacements = {
        "I understand": "I totally understand",
        "Yes.": "Absolutely!",
        "Okay.": "Alrighty!",
        "We will": "We'll",
        "I will": "I'll",
        "cannot": "can't",
        "do not": "don't",
        "Your appointment": "Your appointment, hon,",
        "The technician": "Our tech",
    }
    
    for formal, warm in replacements.items():
        response = response.replace(formal, warm)
    
    # Occasionally add caller's name for warmth (20% chance)
    if caller_name and random.random() < 0.2:
        # Add name at natural points
        if response.endswith("."):
            response = response[:-1] + f", {caller_name}."
        elif response.endswith("!"):
            response = response[:-1] + f", {caller_name}!"
    
    return response


def get_quick_response_texas(user_text: str, caller_name: Optional[str] = None) -> Optional[str]:
    """
    Get instant professional responses for common phrases.
    Returns None if no quick response available.

    These are <300ms responses - professional and efficient.
    """
    text = user_text.lower().strip().rstrip("?!.")

    # Greetings
    if text in ["hello", "hi", "hey", "howdy"]:
        return get_greeting(caller_name)

    # Thank you
    if any(t in text for t in ["thank you", "thanks", "appreciate"]):
        return "You're welcome. Is there anything else I can help you with?"

    # Affirmatives
    if text in ["yes", "yeah", "yep", "sure", "okay", "ok", "yup", "uh huh"]:
        return "What service do you need - heating, cooling, or maintenance?"

    # Negatives / Done
    if text in ["no", "nope", "nah", "i'm good", "that's all", "nothing else"]:
        return get_goodbye(caller_name)

    # Hours question
    if any(w in text for w in ["hours", "open", "close"]):
        return "We're open Monday through Friday 8 to 6, and Saturdays 9 to 2. Would you like to schedule an appointment?"

    # Location question
    if any(w in text for w in ["where", "location", "address", "located"]):
        return "We serve Dallas, Fort Worth, and Arlington. What city are you in?"

    # Emergency question
    if "emergency" in text and "?" in user_text:
        return "Yes, we have 24/7 emergency service. Is this an urgent situation?"

    # Cost question
    if any(w in text for w in ["cost", "price", "how much", "charge"]):
        return "Service calls are $89, and our technician will provide a full quote before any work. Would you like to schedule an appointment?"

    # "What" questions
    if text.startswith("what") and len(text) < 20:
        return "I can help you schedule a service appointment. What do you need?"

    # How are you
    if text in ["how are you", "how's it going", "how you doing"]:
        return "I'm well, thank you. How may I help you today?"

    return None


# SSML helpers for more natural speech
def add_ssml_emphasis(text: str, words: List[str]) -> str:
    """Add SSML emphasis to specific words."""
    for word in words:
        text = text.replace(word, f'<emphasis level="moderate">{word}</emphasis>')
    return text


def add_ssml_pause(text: str, after_phrases: List[str], pause_ms: int = 300) -> str:
    """Add natural pauses after certain phrases."""
    for phrase in after_phrases:
        text = text.replace(phrase, f'{phrase}<break time="{pause_ms}ms"/>')
    return text


def wrap_ssml(text: str) -> str:
    """Wrap text in SSML speak tags."""
    return f"<speak>{text}</speak>"
