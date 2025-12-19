"""
Robust Phone Number Validation for HVAC Voice Agent.

Handles the complexity of phone numbers from speech recognition,
which may include:
- Spoken digits ("five five five")
- Mixed formats ("555-1234", "555 1234", "5551234")
- Partial numbers with area codes spoken separately
- International formats

Features:
- Multi-strategy digit extraction
- Word-to-digit conversion
- phonenumbers library integration (optional)
- Spoken number formatting for confirmation
"""

import re
from typing import Tuple, Optional, Dict, List

from app.utils.logging import get_logger

logger = get_logger("phone_validator")

# Try to import phonenumbers, but make it optional
try:
    import phonenumbers
    from phonenumbers import NumberParseException
    PHONENUMBERS_AVAILABLE = True
except ImportError:
    PHONENUMBERS_AVAILABLE = False
    logger.info("phonenumbers library not installed - using basic validation")

# Word to digit mapping
WORD_TO_DIGIT: Dict[str, str] = {
    "zero": "0", "oh": "0", "o": "0",
    "one": "1", "won": "1",
    "two": "2", "to": "2", "too": "2",
    "three": "3", "tree": "3",
    "four": "4", "for": "4", "fore": "4",
    "five": "5",
    "six": "6", "sicks": "6",
    "seven": "7",
    "eight": "8", "ate": "8",
    "nine": "9", "niner": "9",
}

# Common spoken patterns
DOUBLE_PATTERNS: Dict[str, str] = {
    "double zero": "00", "double oh": "00",
    "double one": "11",
    "double two": "22",
    "double three": "33",
    "double four": "44",
    "double five": "55",
    "double six": "66",
    "double seven": "77",
    "double eight": "88",
    "double nine": "99",
}

TRIPLE_PATTERNS: Dict[str, str] = {
    "triple zero": "000",
    "triple one": "111",
    "triple two": "222",
    "triple three": "333",
    "triple four": "444",
    "triple five": "555",
    "triple six": "666",
    "triple seven": "777",
    "triple eight": "888",
    "triple nine": "999",
}


def _convert_words_to_digits(text: str) -> str:
    """
    Convert spoken number words to digits.
    
    Args:
        text: Input text with potential number words
        
    Returns:
        Text with number words converted to digits
    """
    result = text.lower()
    
    # Handle triple patterns first
    for pattern, digits in TRIPLE_PATTERNS.items():
        result = result.replace(pattern, digits)
    
    # Handle double patterns
    for pattern, digits in DOUBLE_PATTERNS.items():
        result = result.replace(pattern, digits)
    
    # Handle individual words
    words = result.split()
    converted = []
    for word in words:
        # Clean word of punctuation
        clean_word = ''.join(c for c in word if c.isalnum())
        if clean_word in WORD_TO_DIGIT:
            converted.append(WORD_TO_DIGIT[clean_word])
        else:
            converted.append(word)
    
    return ' '.join(converted)


def _extract_digits(text: str) -> str:
    """Extract all digits from text."""
    return ''.join(c for c in text if c.isdigit())


def _format_for_speaking(phone: str) -> str:
    """
    Format phone number for spoken confirmation.
    
    Args:
        phone: Phone number (digits only or formatted)
        
    Returns:
        Spoken format like "5 5 5, 1 2 3, 4 5 6 7"
    """
    digits = _extract_digits(phone)
    
    if len(digits) == 10:
        # Format as: area code, prefix, line number
        area = ' '.join(digits[0:3])
        prefix = ' '.join(digits[3:6])
        line = ' '.join(digits[6:10])
        return f"{area}, {prefix}, {line}"
    elif len(digits) == 7:
        # Format as: prefix, line number
        prefix = ' '.join(digits[0:3])
        line = ' '.join(digits[3:7])
        return f"{prefix}, {line}"
    else:
        # Just space out all digits
        return ' '.join(digits)


def _format_for_storage(phone: str) -> str:
    """
    Format phone number for storage (E.164 format).
    
    Args:
        phone: Phone number (digits only)
        
    Returns:
        E.164 format like "+15551234567"
    """
    digits = _extract_digits(phone)
    
    if len(digits) == 10:
        return f"+1{digits}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+{digits}"
    else:
        return digits


def validate_phone(phone_input: str) -> Tuple[bool, str, str]:
    """
    Validate and parse a phone number from speech input.
    
    Uses multiple strategies to extract a valid phone number:
    1. Direct digit extraction
    2. Word-to-digit conversion
    3. phonenumbers library validation (if available)
    
    Args:
        phone_input: Raw string from speech recognition
        
    Returns:
        Tuple of (is_valid, formatted_number, spoken_number)
        - is_valid: True if a valid phone number was extracted
        - formatted_number: E.164 format for storage (e.g., "+15551234567")
        - spoken_number: Format for voice confirmation (e.g., "5 5 5, 1 2 3, 4 5 6 7")
    """
    if not phone_input:
        return False, "", ""
    
    # Strategy 1: Convert words to digits
    converted = _convert_words_to_digits(phone_input)
    
    # Strategy 2: Extract all digits
    digits = _extract_digits(converted)
    
    # Also try extracting from original (in case conversion broke something)
    original_digits = _extract_digits(phone_input)
    
    # Use whichever has more digits
    if len(original_digits) > len(digits):
        digits = original_digits
    
    logger.debug("Phone extraction: input='%s' -> digits='%s'", phone_input[:50], digits)
    
    # Validate length
    if len(digits) < 7:
        return False, digits, ""
    
    # Take last 10 digits if we have more (handles "1" prefix or extra digits)
    if len(digits) > 10:
        digits = digits[-10:]
    
    # Use phonenumbers library if available
    if PHONENUMBERS_AVAILABLE and len(digits) >= 10:
        try:
            # Try parsing as US number
            parsed = phonenumbers.parse(digits, "US")
            
            if phonenumbers.is_valid_number(parsed):
                formatted = phonenumbers.format_number(
                    parsed, 
                    phonenumbers.PhoneNumberFormat.E164
                )
                national = phonenumbers.format_number(
                    parsed,
                    phonenumbers.PhoneNumberFormat.NATIONAL
                )
                spoken = _format_for_speaking(formatted)
                
                logger.debug("Phone validated: %s -> %s", digits, formatted)
                return True, formatted, spoken
        except NumberParseException as e:
            logger.debug("phonenumbers parse failed: %s", str(e))
    
    # Fallback: Basic validation for US numbers
    if len(digits) == 10:
        formatted = _format_for_storage(digits)
        spoken = _format_for_speaking(digits)
        return True, formatted, spoken
    elif len(digits) == 7:
        # 7 digits might be valid if area code is collected separately
        spoken = _format_for_speaking(digits)
        return False, digits, spoken  # Return False but include partial
    
    return False, digits, ""


def validate_phone_with_area_code(
    phone_input: str,
    area_code: Optional[str] = None,
) -> Tuple[bool, str, str]:
    """
    Validate phone with optional separate area code.
    
    Args:
        phone_input: Phone number input
        area_code: Optional area code if collected separately
        
    Returns:
        Tuple of (is_valid, formatted_number, spoken_number)
    """
    # If area code provided, prepend it
    if area_code:
        area_digits = _extract_digits(area_code)
        phone_digits = _extract_digits(_convert_words_to_digits(phone_input))
        combined = area_digits + phone_digits
        return validate_phone(combined)
    
    return validate_phone(phone_input)


def extract_partial_phone(phone_input: str) -> Dict[str, str]:
    """
    Extract partial phone number components.
    
    Useful for collecting phone in parts (area code, then rest).
    
    Args:
        phone_input: Partial phone input
        
    Returns:
        Dict with extracted components
    """
    converted = _convert_words_to_digits(phone_input)
    digits = _extract_digits(converted)
    
    result = {
        "raw": phone_input,
        "digits": digits,
        "digit_count": len(digits),
    }
    
    if len(digits) >= 3:
        result["area_code"] = digits[:3]
    if len(digits) >= 6:
        result["prefix"] = digits[3:6]
    if len(digits) >= 10:
        result["line"] = digits[6:10]
    
    return result


class PhoneValidator:
    """
    Stateful phone validator for multi-turn collection.
    
    Handles cases where phone is collected in parts across
    multiple conversation turns.
    """
    
    def __init__(self):
        self._area_code: Optional[str] = None
        self._prefix: Optional[str] = None
        self._line: Optional[str] = None
        self._full_number: Optional[str] = None
    
    def add_input(self, phone_input: str) -> Tuple[bool, str, str]:
        """
        Add phone input and attempt validation.
        
        Args:
            phone_input: New phone input
            
        Returns:
            Tuple of (is_complete, formatted_number, spoken_number)
        """
        # Try to validate as complete number first
        is_valid, formatted, spoken = validate_phone(phone_input)
        
        if is_valid:
            self._full_number = formatted
            return True, formatted, spoken
        
        # Extract what we can
        parts = extract_partial_phone(phone_input)
        digits = parts["digits"]
        
        # If we have 3 digits and no area code, treat as area code
        if len(digits) == 3 and not self._area_code:
            self._area_code = digits
            return False, digits, f"area code {' '.join(digits)}"
        
        # If we have area code and get 7 more digits, combine
        if self._area_code and len(digits) >= 7:
            combined = self._area_code + digits[:7]
            return validate_phone(combined)
        
        # Accumulate digits
        if self._area_code:
            if not self._prefix and len(digits) >= 3:
                self._prefix = digits[:3]
                remaining = digits[3:]
                if len(remaining) >= 4:
                    self._line = remaining[:4]
        
        # Check if we have complete number
        if self._area_code and self._prefix and self._line:
            combined = self._area_code + self._prefix + self._line
            return validate_phone(combined)
        
        return False, digits, ""
    
    def reset(self):
        """Reset the validator state."""
        self._area_code = None
        self._prefix = None
        self._line = None
        self._full_number = None
    
    @property
    def has_area_code(self) -> bool:
        return self._area_code is not None
    
    @property
    def collected_digits(self) -> str:
        parts = [self._area_code, self._prefix, self._line]
        return ''.join(p for p in parts if p)
