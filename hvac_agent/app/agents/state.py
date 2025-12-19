"""
Call state management for HVAC Voice Agent.

Handles:
- Per-call state tracking
- Conversation history
- Intent tracking
- Emergency flags
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from app.utils.logging import get_logger

logger = get_logger("state")


class ConversationTurn(BaseModel):
    """Single turn in the conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    intent: Optional[str] = None
    emotion: Optional[str] = None


class CallState(BaseModel):
    """
    State for a single call session.
    
    Tracks all relevant information gathered during the call.
    """
    # Customer information
    name: Optional[str] = None
    phone: Optional[str] = None
    
     # Booking flow state
    booking_stage: Optional[str] = Field(
        None,
        description="Current stage of the booking process. "
        "One of: 'collecting_issue', 'collecting_location', 'collecting_time', 'collecting_contact', 'confirming'"
    )
    booking_data: Dict[str, Any] = Field(
        default_factory=dict,
        description="Temporary storage for booking form data"
    )
    booking_attempts: int = Field(
        0,
        description="Number of attempts made in the current booking flow"
    )
    last_booking_error: Optional[str] = Field(
        None,
        description="Last error message encountered during booking"
    )

    # Issue details
    issue: Optional[str] = None
    issue_category: Optional[str] = None
    urgency: str = "normal"  # normal, high, emergency
    
    # Location
    location_code: Optional[str] = None
    location_name: Optional[str] = None
    
    # Appointment
    has_appointment: bool = False
    appointment_id: Optional[int] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    
    # Intent tracking
    last_intent: Optional[str] = None
    intents_history: List[str] = Field(default_factory=list)
    
    # Conversation
    conversation_history: List[ConversationTurn] = Field(default_factory=list)
    turn_count: int = 0
    
    # Flags
    is_emergency: bool = False
    emergency_type: Optional[str] = None
    requested_human: bool = False
    was_transferred: bool = False
    
    # Sentiment
    caller_emotion: Optional[str] = None
    frustration_level: int = 0  # 0-5 scale
    
    # Notes
    notes: str = ""
    
    # Timestamps
    call_started: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    
    def add_turn(
        self,
        role: str,
        content: str,
        intent: Optional[str] = None,
        emotion: Optional[str] = None
    ) -> None:
        """Add a conversation turn."""
        turn = ConversationTurn(
            role=role,
            content=content,
            intent=intent,
            emotion=emotion,
        )
        self.conversation_history.append(turn)
        self.turn_count += 1
        self.last_activity = datetime.utcnow()
        
        if intent:
            self.last_intent = intent
            if intent not in self.intents_history:
                self.intents_history.append(intent)
    
    def get_conversation_summary(self, max_turns: int = 10) -> str:
        """Get recent conversation as formatted string."""
        recent = self.conversation_history[-max_turns:]
        lines = []
        for turn in recent:
            prefix = "User" if turn.role == "user" else "Agent"
            lines.append(f"{prefix}: {turn.content}")
        return "\n".join(lines)
    
    # In your CallState class, add these methods after the get_conversation_summary method

    def start_booking_flow(self) -> None:
        """Initialize booking flow."""
        self.booking_stage = 'collecting_issue'
        self.booking_data = {}  # Reset any previous data
        self.booking_attempts = 0
        self.last_booking_error = None
        logger.info("Started booking flow")

    def update_booking_data(self, **updates) -> None:
        """
        Update booking data with new values.
        
        Args:
            **updates: Key-value pairs to update in booking_data
        """
        self.booking_data.update(updates)
        self.last_activity = datetime.utcnow()

    def complete_booking_flow(self) -> None:
        """Complete the booking flow and update appointment state."""
        self.has_appointment = True
        self.appointment_id = self.booking_data.get('appointment_id')
        self.appointment_date = self.booking_data.get('date')
        self.appointment_time = self.booking_data.get('time')
        self.issue = self.booking_data.get('issue')
        self.location_code = self.booking_data.get('location_code')
        self.booking_stage = None  # Reset booking flow
        self.booking_attempts = 0
        self.last_booking_error = None
        logger.info("Completed booking flow for appointment %s", self.appointment_id)

    def reset_booking_flow(self) -> None:
        """Reset the booking flow without completing it."""
        self.booking_stage = None
        self.booking_data = {}
        self.booking_attempts = 0
        self.last_booking_error = None
        logger.info("Reset booking flow")
    
    def set_emergency(self, emergency_type: str) -> None:
        """Mark call as emergency."""
        self.is_emergency = True
        self.emergency_type = emergency_type
        self.urgency = "emergency"
        logger.warning("Call marked as emergency: %s", emergency_type)
    
    def increment_frustration(self, amount: int = 1) -> None:
        """Increment frustration level (capped at 5)."""
        self.frustration_level = min(5, self.frustration_level + amount)
    
    def reset_frustration(self) -> None:
        """Reset frustration level."""
        self.frustration_level = 0
    
    def to_context_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for agent context."""
        return {
            "customer_name": self.name,
            "issue": self.issue,
            "issue_category": self.issue_category,
            "location": self.location_code,
            "has_appointment": self.has_appointment,
            "appointment_date": self.appointment_date,
            "appointment_time": self.appointment_time,
            "is_emergency": self.is_emergency,
            "urgency": self.urgency,
            "turn_count": self.turn_count,
            "last_intent": self.last_intent,
        }


class CallStateStore:
    """
    In-memory store for call states.
    
    Keyed by Twilio CallSid.
    
    NOTE: For production with multiple replicas, replace with Redis
    or another shared store.
    """
    
    def __init__(self) -> None:
        self._store: Dict[str, CallState] = {}
        self._max_age_seconds: int = 3600  # 1 hour
    
    def get(self, call_sid: str) -> CallState:
        """
        Get or create call state for a CallSid.
        
        Args:
            call_sid: Twilio CallSid
            
        Returns:
            CallState instance
        """
        if call_sid not in self._store:
            logger.info("Creating new call state for: %s", call_sid)
            self._store[call_sid] = CallState()
        return self._store[call_sid]
    
    def update(self, call_sid: str, state: CallState) -> None:
        """
        Update call state.
        
        Args:
            call_sid: Twilio CallSid
            state: Updated CallState
        """
        self._store[call_sid] = state
    
    def delete(self, call_sid: str) -> None:
        """
        Delete call state.
        
        Args:
            call_sid: Twilio CallSid
        """
        if call_sid in self._store:
            logger.info("Deleting call state for: %s", call_sid)
            del self._store[call_sid]
    
    def exists(self, call_sid: str) -> bool:
        """Check if call state exists."""
        return call_sid in self._store
    
    def cleanup_old(self) -> int:
        """
        Clean up old call states.
        
        Returns:
            Number of states cleaned up
        """
        now = datetime.utcnow()
        to_delete = []
        
        for call_sid, state in self._store.items():
            age = (now - state.call_started).total_seconds()
            if age > self._max_age_seconds:
                to_delete.append(call_sid)
        
        for call_sid in to_delete:
            del self._store[call_sid]
        
        if to_delete:
            logger.info("Cleaned up %d old call states", len(to_delete))
        
        return len(to_delete)
    
    @property
    def active_calls(self) -> int:
        """Get number of active calls."""
        return len(self._store)


# Global call state store instance
call_state_store = CallStateStore()
