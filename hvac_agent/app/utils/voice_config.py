"""
Voice configuration for HVAC Voice Agent.

Provides:
- Voice persona settings
- Tone configuration
- Speech rate and style settings
- Twilio voice options
"""

import os
from typing import Optional
from dataclasses import dataclass, field
from enum import Enum


class VoiceTone(Enum):
    """Voice tone presets."""
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    EMPATHETIC = "empathetic"
    URGENT = "urgent"
    CALM = "calm"


class TwilioVoice(Enum):
    """Available Twilio Polly voices."""
    JOANNA = "Polly.Joanna"  # US English, Female, Neural
    MATTHEW = "Polly.Matthew"  # US English, Male, Neural
    SALLI = "Polly.Salli"  # US English, Female
    JOEY = "Polly.Joey"  # US English, Male
    KENDRA = "Polly.Kendra"  # US English, Female
    KIMBERLY = "Polly.Kimberly"  # US English, Female
    IVY = "Polly.Ivy"  # US English, Female (Child)
    RUTH = "Polly.Ruth"  # US English, Female, Neural
    STEPHEN = "Polly.Stephen"  # US English, Male, Neural


@dataclass
class VoiceConfig:
    """
    Voice configuration settings.
    
    Attributes:
        voice: Twilio Polly voice to use
        tone: Voice tone preset
        speaking_rate: Speech rate (slow, medium, fast)
        pitch: Voice pitch adjustment
        emphasis_level: Emphasis on key words
        pause_between_sentences: Pause duration in ms
    """
    voice: str = "Polly.Joanna"
    tone: VoiceTone = VoiceTone.FRIENDLY
    speaking_rate: str = "medium"  # slow, medium, fast
    pitch: str = "medium"  # x-low, low, medium, high, x-high
    emphasis_level: str = "moderate"  # reduced, moderate, strong
    pause_between_sentences: int = 300  # milliseconds
    
    # Soft tone settings for empathetic responses
    soft_mode: bool = False
    
    def get_ssml_prosody(self) -> str:
        """Get SSML prosody attributes."""
        rate_map = {"slow": "90%", "medium": "100%", "fast": "110%"}
        return f'rate="{rate_map.get(self.speaking_rate, "100%")}" pitch="{self.pitch}"'
    
    def wrap_ssml(self, text: str, add_pause: bool = True) -> str:
        """
        Wrap text in SSML tags for enhanced speech.
        
        Args:
            text: Text to wrap
            add_pause: Whether to add pause at end
            
        Returns:
            SSML-wrapped text
        """
        prosody = self.get_ssml_prosody()
        
        ssml = f'<speak><prosody {prosody}>{text}</prosody>'
        
        if add_pause:
            ssml += f'<break time="{self.pause_between_sentences}ms"/>'
        
        ssml += '</speak>'
        
        return ssml


# Tone-specific configurations
TONE_CONFIGS = {
    VoiceTone.PROFESSIONAL: VoiceConfig(
        voice="Polly.Joanna",
        tone=VoiceTone.PROFESSIONAL,
        speaking_rate="medium",
        pitch="medium",
        pause_between_sentences=250,
    ),
    VoiceTone.FRIENDLY: VoiceConfig(
        voice="Polly.Joanna",
        tone=VoiceTone.FRIENDLY,
        speaking_rate="medium",
        pitch="medium",
        pause_between_sentences=300,
    ),
    VoiceTone.EMPATHETIC: VoiceConfig(
        voice="Polly.Joanna",
        tone=VoiceTone.EMPATHETIC,
        speaking_rate="slow",
        pitch="low",
        pause_between_sentences=400,
        soft_mode=True,
    ),
    VoiceTone.URGENT: VoiceConfig(
        voice="Polly.Matthew",
        tone=VoiceTone.URGENT,
        speaking_rate="fast",
        pitch="high",
        pause_between_sentences=200,
    ),
    VoiceTone.CALM: VoiceConfig(
        voice="Polly.Joanna",
        tone=VoiceTone.CALM,
        speaking_rate="slow",
        pitch="low",
        pause_between_sentences=350,
        soft_mode=True,
    ),
}


def get_voice_config(tone: Optional[VoiceTone] = None) -> VoiceConfig:
    """
    Get voice configuration for a specific tone.
    
    Args:
        tone: Desired voice tone
        
    Returns:
        VoiceConfig instance
    """
    if tone is None:
        # Default from environment or friendly
        default_tone = os.getenv("DEFAULT_VOICE_TONE", "friendly")
        try:
            tone = VoiceTone(default_tone.lower())
        except ValueError:
            tone = VoiceTone.FRIENDLY
    
    return TONE_CONFIGS.get(tone, TONE_CONFIGS[VoiceTone.FRIENDLY])


def get_empathetic_phrases() -> dict:
    """
    Get empathetic phrases for different situations.
    
    Returns:
        Dictionary of situation-specific empathetic phrases
    """
    return {
        "frustration": [
            "I completely understand how frustrating this must be.",
            "I'm sorry you're dealing with this issue.",
            "I can hear this has been difficult, and I want to help.",
        ],
        "emergency": [
            "I understand this is urgent, and I'm here to help.",
            "Your safety is our top priority.",
            "Let me get you help right away.",
        ],
        "confusion": [
            "No problem at all, let me explain that more clearly.",
            "That's a great question, let me help clarify.",
            "I'm happy to walk you through this step by step.",
        ],
        "gratitude": [
            "You're very welcome!",
            "I'm glad I could help.",
            "It's my pleasure to assist you.",
        ],
        "apology": [
            "I sincerely apologize for any inconvenience.",
            "I'm sorry to hear about this experience.",
            "We appreciate your patience.",
        ],
        "wait": [
            "Thank you for your patience.",
            "I appreciate you holding on.",
            "Just one moment while I check on that for you.",
        ],
    }


def detect_caller_emotion(text: str) -> Optional[str]:
    """
    Simple emotion detection from caller's text.
    
    Args:
        text: Caller's speech text
        
    Returns:
        Detected emotion or None
    """
    text_lower = text.lower()
    
    # Frustration indicators
    frustration_words = [
        "frustrated", "angry", "upset", "annoyed", "ridiculous",
        "unacceptable", "terrible", "worst", "hate", "sick of"
    ]
    if any(word in text_lower for word in frustration_words):
        return "frustration"
    
    # Confusion indicators
    confusion_words = [
        "confused", "don't understand", "what do you mean",
        "not sure", "unclear", "lost"
    ]
    if any(word in text_lower for word in confusion_words):
        return "confusion"
    
    # Gratitude indicators
    gratitude_words = [
        "thank", "thanks", "appreciate", "grateful", "helpful"
    ]
    if any(word in text_lower for word in gratitude_words):
        return "gratitude"
    
    return None


def get_soft_response_prefix(emotion: Optional[str] = None) -> str:
    """
    Get a soft, empathetic response prefix based on detected emotion.
    
    Args:
        emotion: Detected caller emotion
        
    Returns:
        Appropriate empathetic prefix
    """
    phrases = get_empathetic_phrases()
    
    if emotion and emotion in phrases:
        import random
        return random.choice(phrases[emotion]) + " "
    
    return ""
