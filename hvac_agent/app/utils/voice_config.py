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
    KENDRA = "Polly.Kendra"  # US English, Female - WARMER, more Southern
    KIMBERLY = "Polly.Kimberly"  # US English, Female
    IVY = "Polly.Ivy"  # US English, Female (Child)
    RUTH = "Polly.Ruth"  # US English, Female, Neural
    STEPHEN = "Polly.Stephen"  # US English, Male, Neural
    # Recommended for Texas persona: Kendra or Salli (warmer tones)


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
        """Get SSML prosody attributes with natural variation."""
        # Expanded rate ranges for more natural-sounding speech
        rate_map = {
            "slow": "85%",      # Slower for empathy/clarity
            "medium": "95%",    # Slightly slower than default (more natural)
            "fast": "105%"      # Not too fast (avoid rushing)
        }

        # Add volume for emphasis in certain tones
        volume = ""
        if self.soft_mode:
            volume = ' volume="soft"'

        return f'rate="{rate_map.get(self.speaking_rate, "95%")}" pitch="{self.pitch}"{volume}'
    
    def wrap_ssml(self, text: str, add_pause: bool = True) -> str:
        """
        Wrap text in SSML tags with natural, contextual pauses.

        Args:
            text: Text to wrap
            add_pause: Whether to add pause at end

        Returns:
            SSML-wrapped text with natural prosody and pauses
        """
        import random

        prosody = self.get_ssml_prosody()

        # Add natural pauses based on punctuation (only if not already present)
        if '<break' not in text:
            # Questions need longer pauses for caller to think
            text = text.replace('?', '? <break time="600ms"/>')

            # Exclamations - medium pause, shows enthusiasm
            text = text.replace('!', '! <break time="450ms"/>')

            # Periods - sentence boundaries with natural breath
            text = text.replace('. ', '. <break time="500ms"/>')

            # Commas - short natural pause
            text = text.replace(', ', ', <break time="250ms"/>')

            # Em dashes - thinking pause
            text = text.replace('—', '<break time="300ms"/>')
            text = text.replace(' - ', ' <break time="300ms"/> ')

        # Add occasional breath marks for very natural feel (30% chance)
        # Simulates natural human breathing mid-sentence
        words = text.split()
        if len(words) > 10 and random.random() < 0.3:
            mid_point = len(words) // 2
            # Insert subtle breath before mid-sentence word
            words.insert(mid_point, '<break time="200ms" strength="weak"/>')
            text = ' '.join(words)

        # Build final SSML with prosody wrapper
        ssml = f'<speak><prosody {prosody}>{text}</prosody>'

        # Add final pause if requested
        if add_pause and not text.rstrip().endswith('/>'):
            ssml += f'<break time="{self.pause_between_sentences}ms"/>'

        ssml += '</speak>'

        return ssml


# Tone-specific configurations - Optimized for natural, human-like speech
TONE_CONFIGS = {
    VoiceTone.PROFESSIONAL: VoiceConfig(
        voice="Polly.Joanna",  # Neural voice - more natural
        tone=VoiceTone.PROFESSIONAL,
        speaking_rate="medium",
        pitch="medium",
        pause_between_sentences=300,
    ),
    VoiceTone.FRIENDLY: VoiceConfig(
        voice="Polly.Joanna",  # Neural - warm and professional
        tone=VoiceTone.FRIENDLY,
        speaking_rate="medium",
        pitch="medium",
        pause_between_sentences=350,
    ),
    VoiceTone.EMPATHETIC: VoiceConfig(
        voice="Polly.Ruth",  # Neural voice - very warm and caring
        tone=VoiceTone.EMPATHETIC,
        speaking_rate="slow",
        pitch="low",
        pause_between_sentences=450,
        soft_mode=True,
    ),
    VoiceTone.URGENT: VoiceConfig(
        voice="Polly.Matthew",  # Neural male - clear urgency
        tone=VoiceTone.URGENT,
        speaking_rate="fast",
        pitch="medium",  # Not too high - avoid panic
        pause_between_sentences=250,
    ),
    VoiceTone.CALM: VoiceConfig(
        voice="Polly.Ruth",  # Neural - soothing
        tone=VoiceTone.CALM,
        speaking_rate="slow",
        pitch="low",
        pause_between_sentences=400,
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
    Dispatcher style - calm acknowledgment, then move forward.
    
    Returns:
        Dictionary of situation-specific empathetic phrases
    """
    return {
        "frustration": [
            "I understand.",
            "Okay. I understand.",
            "I hear you. Let's get this handled.",
        ],
        "emergency": [
            "Understood. Transferring you now.",
            "This is priority. Getting you help.",
        ],
        "confusion": [
            "Let me clarify.",
            "Here's how it works.",
        ],
        "gratitude": [
            "Anything else.",
            "Alright. Anything else.",
        ],
        "apology": [
            "I understand. Let me fix that.",
            "Understood. We'll take care of it.",
        ],
        "wait": [
            "One moment.",
            "Checking.",
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
