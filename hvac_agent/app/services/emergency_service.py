"""
Emergency detection and routing service.

Handles:
- Emergency keyword detection
- Emergency classification
- Emergency logging
- Transfer routing to human operators
"""

from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

from sqlalchemy.orm import Session

from app.models.db_models import EmergencyLog, Location
from app.utils.logging import get_logger

logger = get_logger("emergency")


# Emergency keywords organized by severity and type
EMERGENCY_KEYWORDS: Dict[str, List[str]] = {
    "gas_leak": [
        "gas leak", "smell gas", "smelling gas", "gas smell", "natural gas",
        "rotten egg", "sulfur smell", "hissing sound", "gas line"
    ],
    "carbon_monoxide": [
        "carbon monoxide", "co detector", "co alarm", "monoxide alarm",
        "headache dizzy", "feeling dizzy", "nauseous", "co poisoning"
    ],
    "no_heat_extreme": [
        "no heat", "freezing", "pipes freezing", "frozen pipes", "hypothermia",
        "elderly no heat", "baby no heat", "infant cold", "emergency heat"
    ],
    "no_ac_extreme": [
        "heat stroke", "overheating", "extremely hot", "dangerous heat",
        "elderly no ac", "medical condition heat", "no cooling emergency"
    ],
    "electrical": [
        "sparking", "electrical fire", "burning smell", "smoke from unit",
        "unit on fire", "electrical shock", "short circuit"
    ],
    "flooding": [
        "flooding", "water everywhere", "pipe burst", "water damage",
        "leaking badly", "water pouring"
    ],
}

# Phrases that indicate urgency
URGENCY_PHRASES: List[str] = [
    "emergency", "urgent", "immediately", "right now", "asap",
    "help", "dangerous", "life threatening", "911", "fire department",
    "ambulance", "hospital", "dying", "can't breathe", "suffocating"
]

# Default emergency contact (should be configured per location)
DEFAULT_EMERGENCY_NUMBER = "(800) 555-0911"


def detect_emergency(text: str) -> Tuple[bool, Optional[str], float]:
    """
    Detect if the caller's message indicates an emergency.
    
    Args:
        text: The caller's speech/text input
        
    Returns:
        Tuple of (is_emergency, emergency_type, confidence_score)
    """
    text_lower = text.lower()
    
    # Check for emergency keywords by type
    for emergency_type, keywords in EMERGENCY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                # High confidence if explicit emergency keyword found
                confidence = 0.9
                
                # Boost confidence if urgency phrases also present
                if any(phrase in text_lower for phrase in URGENCY_PHRASES):
                    confidence = 0.98
                
                logger.warning(
                    "Emergency detected: type=%s, keyword=%s, confidence=%.2f",
                    emergency_type, keyword, confidence
                )
                return True, emergency_type, confidence
    
    # Check for general urgency without specific emergency type
    if any(phrase in text_lower for phrase in URGENCY_PHRASES):
        logger.info("Urgency detected without specific emergency type")
        return True, "general_urgent", 0.7
    
    return False, None, 0.0


def classify_emergency_severity(emergency_type: str) -> str:
    """
    Classify emergency severity level.
    
    Args:
        emergency_type: Type of emergency detected
        
    Returns:
        Severity level: "critical", "high", "medium"
    """
    critical_types = ["gas_leak", "carbon_monoxide", "electrical"]
    high_types = ["no_heat_extreme", "no_ac_extreme", "flooding"]
    
    if emergency_type in critical_types:
        return "critical"
    elif emergency_type in high_types:
        return "high"
    else:
        return "medium"


def get_emergency_response(emergency_type: str) -> str:
    """
    Get appropriate emergency response message.
    
    Args:
        emergency_type: Type of emergency
        
    Returns:
        Emergency response script
    """
    responses = {
        "gas_leak": (
            "I understand you may have a gas leak. This is very serious. "
            "Please leave your home immediately and call 911 or your gas company. "
            "Do not use any electrical switches or open flames. "
            "I'm transferring you to our emergency line now."
        ),
        "carbon_monoxide": (
            "Carbon monoxide is extremely dangerous. Please leave your home immediately "
            "and get to fresh air. Call 911 if anyone is feeling ill. "
            "I'm connecting you to our emergency team right away."
        ),
        "no_heat_extreme": (
            "I understand you have no heat and this is an emergency situation. "
            "Please bundle up and use safe heating alternatives if available. "
            "I'm marking this as a priority emergency and connecting you to our "
            "on-call technician immediately."
        ),
        "no_ac_extreme": (
            "I understand the heat situation is dangerous. Please stay hydrated "
            "and try to stay in the coolest area of your home. "
            "I'm escalating this as an emergency and connecting you to our team now."
        ),
        "electrical": (
            "If you see sparks, smoke, or fire, please leave the area immediately "
            "and call 911. Do not touch the HVAC unit. "
            "I'm transferring you to our emergency line."
        ),
        "flooding": (
            "If there's significant water, please turn off your main water supply if safe. "
            "Avoid electrical outlets near water. "
            "I'm connecting you to our emergency response team."
        ),
        "general_urgent": (
            "I can hear this is urgent. Let me connect you with a live representative "
            "who can help you immediately."
        ),
    }
    
    return responses.get(
        emergency_type,
        "I understand this is an emergency. I'm connecting you to our emergency team right away."
    )


def log_emergency(
    db: Session,
    call_sid: str,
    caller_phone: str,
    emergency_type: str,
    description: str,
    location_code: Optional[str] = None,
) -> EmergencyLog:
    """
    Log an emergency call to the database.
    
    Args:
        db: Database session
        call_sid: Twilio call SID
        caller_phone: Caller's phone number
        emergency_type: Type of emergency
        description: Description of the emergency
        location_code: Optional location code
        
    Returns:
        Created EmergencyLog record
    """
    location_id = None
    if location_code:
        from app.services.calendar_service import get_location_by_code
        loc = get_location_by_code(db, location_code)
        if loc:
            location_id = loc.id

    emergency_log = EmergencyLog(
        call_sid=call_sid,
        caller_phone=caller_phone,
        emergency_type=emergency_type,
        description=description,
        location_id=location_id,
    )
    
    try:
        db.add(emergency_log)
        db.commit()
        db.refresh(emergency_log)
        
        logger.critical(
            "EMERGENCY LOGGED: id=%d, type=%s, caller=%s",
            emergency_log.id, emergency_type, caller_phone
        )
        
        return emergency_log
    except Exception as e:
        db.rollback()
        logger.error("Failed to log emergency: %s", str(e))
        raise


def get_emergency_contact(
    db: Session,
    location_code: Optional[str] = None
) -> Dict[str, str]:
    """
    Get emergency contact information for a location.
    
    Args:
        db: Database session
        location_code: Optional location code
        
    Returns:
        Emergency contact details
    """
    if location_code:
        from app.services.calendar_service import get_location_by_code
        loc = get_location_by_code(db, location_code)
        if loc and loc.emergency_phone:
            return {
                "phone": loc.emergency_phone,
                "location": loc.name,
                "available": "24/7"
            }
    
    return {
        "phone": DEFAULT_EMERGENCY_NUMBER,
        "location": "Central Dispatch",
        "available": "24/7"
    }


def should_transfer_to_human(
    emergency_type: Optional[str],
    confidence: float,
    caller_requests_human: bool = False
) -> bool:
    """
    Determine if call should be transferred to human operator.
    
    Args:
        emergency_type: Type of emergency (if any)
        confidence: Confidence score of emergency detection
        caller_requests_human: Whether caller explicitly requested human
        
    Returns:
        True if should transfer to human
    """
    # Always transfer for critical emergencies
    if emergency_type and classify_emergency_severity(emergency_type) == "critical":
        return True
    
    # Transfer if high confidence emergency
    if confidence >= 0.8:
        return True
    
    # Transfer if caller explicitly requests
    if caller_requests_human:
        return True
    
    return False


def get_safety_instructions(emergency_type: str) -> List[str]:
    """
    Get safety instructions for specific emergency type.
    
    Args:
        emergency_type: Type of emergency
        
    Returns:
        List of safety instructions
    """
    instructions = {
        "gas_leak": [
            "Leave the building immediately",
            "Do not turn on/off any electrical switches",
            "Do not use phones inside the building",
            "Do not light matches or lighters",
            "Call 911 from outside",
            "Do not re-enter until cleared by authorities"
        ],
        "carbon_monoxide": [
            "Get everyone outside to fresh air immediately",
            "Call 911 if anyone has symptoms",
            "Do not re-enter the building",
            "Open windows if safe to do so",
            "Symptoms include headache, dizziness, nausea"
        ],
        "electrical": [
            "Do not touch the HVAC unit",
            "Turn off power at the breaker if safe",
            "Call 911 if there is fire or smoke",
            "Keep away from the area",
            "Do not use water on electrical fires"
        ],
        "flooding": [
            "Turn off main water supply if safe",
            "Avoid electrical outlets near water",
            "Do not walk through standing water",
            "Document damage for insurance",
            "Turn off HVAC system"
        ],
    }
    
    return instructions.get(emergency_type, [
        "Stay calm",
        "Move to a safe location",
        "Call 911 if in immediate danger"
    ])
