"""
Redis-backed state management for HVAC Voice Agent.

Provides:
- Persistent call state storage (survives restarts)
- Multi-instance support (shared state across servers)
- Automatic expiration for cleanup
- Fallback to in-memory if Redis unavailable

Usage:
    Set REDIS_URL environment variable to enable Redis:
    REDIS_URL=redis://localhost:6379/0

    If not set, falls back to in-memory storage.
"""

import os
import json
from typing import Optional
from datetime import datetime, timedelta

from app.agents.state import CallState, ConversationTurn
from app.utils.logging import get_logger

logger = get_logger("redis_state")

# Try to import Redis, but make it optional
try:
    import redis
    from redis.exceptions import RedisError
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not installed. Install with: pip install redis")

# Configuration
REDIS_URL = os.getenv("REDIS_URL")
REDIS_TTL = int(os.getenv("REDIS_TTL", "3600"))  # 1 hour default


class RedisStateManager:
    """
    Redis-backed state manager with in-memory fallback.

    Automatically uses Redis if available and configured,
    otherwise falls back to in-memory dictionary.
    """

    def __init__(self):
        self.redis_client = None
        self.in_memory_store = {}  # Fallback storage

        if REDIS_AVAILABLE and REDIS_URL:
            try:
                self.redis_client = redis.from_url(
                    REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Redis state manager initialized: %s", REDIS_URL)
            except Exception as e:
                logger.warning(
                    "Failed to connect to Redis (%s), using in-memory fallback",
                    str(e)
                )
                self.redis_client = None
        else:
            if not REDIS_AVAILABLE:
                logger.info("Redis not available, using in-memory state")
            else:
                logger.info("REDIS_URL not configured, using in-memory state")

    def _serialize_state(self, state: CallState) -> str:
        """Serialize CallState to JSON."""
        return json.dumps({
            "call_sid": state.call_sid,
            "name": state.name,
            "phone": state.phone,
            "issue": state.issue,
            "issue_category": state.issue_category,
            "urgency": state.urgency,
            "location_code": state.location_code,
            "location_name": state.location_name,
            "has_appointment": state.has_appointment,
            "appointment_id": state.appointment_id,
            "appointment_date": state.appointment_date,
            "appointment_time": state.appointment_time,
            "last_intent": state.last_intent,
            "intents_history": state.intents_history,
            "caller_emotion": state.caller_emotion,
            "frustration_level": state.frustration_level,
            "is_emergency": state.is_emergency,
            "emergency_type": state.emergency_type,
            "requested_human": state.requested_human,
            "was_transferred": state.was_transferred,
            "call_started": state.call_started.isoformat() if state.call_started else None,
            "last_activity": state.last_activity.isoformat() if state.last_activity else None,
            "turn_count": state.turn_count,
            "conversation_history": [
                {
                    "role": turn.role,
                    "content": turn.content,
                    "timestamp": turn.timestamp.isoformat(),
                    "intent": turn.intent,
                    "emotion": turn.emotion,
                }
                for turn in state.conversation_history
            ],
        })

    def _deserialize_state(self, data: str, call_sid: str) -> CallState:
        """Deserialize JSON to CallState."""
        obj = json.loads(data)

        state = CallState(call_sid=call_sid)
        state.name = obj.get("name")
        state.phone = obj.get("phone")
        state.issue = obj.get("issue")
        state.issue_category = obj.get("issue_category")
        state.urgency = obj.get("urgency", "normal")
        state.location_code = obj.get("location_code")
        state.location_name = obj.get("location_name")
        state.has_appointment = obj.get("has_appointment", False)
        state.appointment_id = obj.get("appointment_id")
        state.appointment_date = obj.get("appointment_date")
        state.appointment_time = obj.get("appointment_time")
        state.last_intent = obj.get("last_intent")
        state.intents_history = obj.get("intents_history", [])
        state.caller_emotion = obj.get("caller_emotion")
        state.frustration_level = obj.get("frustration_level", 0)
        state.is_emergency = obj.get("is_emergency", False)
        state.emergency_type = obj.get("emergency_type")
        state.requested_human = obj.get("requested_human", False)
        state.was_transferred = obj.get("was_transferred", False)
        state.turn_count = obj.get("turn_count", 0)

        # Parse timestamps
        if obj.get("call_started"):
            state.call_started = datetime.fromisoformat(obj["call_started"])
        if obj.get("last_activity"):
            state.last_activity = datetime.fromisoformat(obj["last_activity"])

        # Parse conversation history
        state.conversation_history = [
            ConversationTurn(
                role=turn["role"],
                content=turn["content"],
                timestamp=datetime.fromisoformat(turn["timestamp"]),
                intent=turn.get("intent"),
                emotion=turn.get("emotion"),
            )
            for turn in obj.get("conversation_history", [])
        ]

        return state

    def get(self, call_sid: str) -> CallState:
        """
        Get call state by CallSid.

        Returns new CallState if not found.
        """
        if self.redis_client:
            try:
                key = f"call_state:{call_sid}"
                data = self.redis_client.get(key)
                if data:
                    return self._deserialize_state(data, call_sid)
            except RedisError as e:
                logger.error("Redis get failed: %s", str(e))

        # Fallback to in-memory
        if call_sid in self.in_memory_store:
            return self.in_memory_store[call_sid]

        # Create new state
        return CallState(call_sid=call_sid)

    def set(self, call_sid: str, state: CallState) -> None:
        """Save call state."""
        if self.redis_client:
            try:
                key = f"call_state:{call_sid}"
                data = self._serialize_state(state)
                self.redis_client.setex(key, REDIS_TTL, data)
                return
            except RedisError as e:
                logger.error("Redis set failed: %s", str(e))

        # Fallback to in-memory
        self.in_memory_store[call_sid] = state

    def delete(self, call_sid: str) -> None:
        """Delete call state."""
        if self.redis_client:
            try:
                key = f"call_state:{call_sid}"
                self.redis_client.delete(key)
                return
            except RedisError as e:
                logger.error("Redis delete failed: %s", str(e))

        # Fallback to in-memory
        if call_sid in self.in_memory_store:
            del self.in_memory_store[call_sid]

    def cleanup_old_states(self) -> int:
        """
        Clean up old in-memory states (Redis auto-expires).

        Returns:
            Number of states cleaned up
        """
        if not self.in_memory_store:
            return 0

        now = datetime.now()
        cutoff = now - timedelta(seconds=REDIS_TTL)

        to_delete = [
            sid for sid, state in self.in_memory_store.items()
            if state.last_activity and state.last_activity < cutoff
        ]

        for sid in to_delete:
            del self.in_memory_store[sid]

        if to_delete:
            logger.info("Cleaned up %d old in-memory states", len(to_delete))

        return len(to_delete)


# Global instance
redis_state_manager = RedisStateManager()
