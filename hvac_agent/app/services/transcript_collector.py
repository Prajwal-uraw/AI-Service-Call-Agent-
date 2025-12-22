"""
Transcript Collector Service for Gather Model Training.

This service collects and stores transcripts from AI calls to:
1. Train and improve the Gather-based fallback system
2. Identify common intents and patterns
3. Build a knowledge base for FAQ responses
4. Analyze conversation quality and outcomes

The data is stored locally and can be exported for model training.
"""

import json
import os
import time
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from pathlib import Path

from app.utils.logging import get_logger

logger = get_logger("transcript_collector")

# Storage directory for transcripts
TRANSCRIPT_DIR = os.getenv("TRANSCRIPT_DIR", "/tmp/transcripts")
Path(TRANSCRIPT_DIR).mkdir(parents=True, exist_ok=True)


@dataclass
class ConversationTurn:
    """A single turn in the conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: float
    audio_duration_ms: Optional[int] = None
    intent: Optional[str] = None  # Detected intent (booking, faq, emergency, etc.)


@dataclass
class CallTranscript:
    """Complete transcript of a call."""
    call_sid: str
    caller_number: str
    start_time: float
    end_time: Optional[float] = None
    duration_seconds: Optional[float] = None
    turns: List[ConversationTurn] = None
    outcome: Optional[str] = None  # "booking", "lead_captured", "transferred", "abandoned", "misuse"
    detected_intents: List[str] = None
    function_calls: List[Dict[str, Any]] = None
    error_occurred: bool = False
    error_details: Optional[str] = None
    
    def __post_init__(self):
        if self.turns is None:
            self.turns = []
        if self.detected_intents is None:
            self.detected_intents = []
        if self.function_calls is None:
            self.function_calls = []


class TranscriptCollector:
    """
    Collects and stores call transcripts for Gather model training.
    
    Usage:
        collector = TranscriptCollector()
        collector.start_call(call_sid, caller_number)
        collector.add_user_turn("My AC is broken")
        collector.add_assistant_turn("I'm sorry to hear that. Let me help you schedule a repair.")
        collector.add_intent("booking")
        collector.end_call(outcome="lead_captured")
    """
    
    def __init__(self):
        self.active_calls: Dict[str, CallTranscript] = {}
        self._ensure_storage_dir()
    
    def _ensure_storage_dir(self):
        """Ensure transcript storage directory exists."""
        Path(TRANSCRIPT_DIR).mkdir(parents=True, exist_ok=True)
    
    def start_call(self, call_sid: str, caller_number: str) -> CallTranscript:
        """Start tracking a new call."""
        transcript = CallTranscript(
            call_sid=call_sid,
            caller_number=caller_number,
            start_time=time.time()
        )
        self.active_calls[call_sid] = transcript
        logger.info("Started transcript collection for call_sid=%s", call_sid)
        return transcript
    
    def add_user_turn(self, call_sid: str, content: str, audio_duration_ms: Optional[int] = None):
        """Add a user turn to the transcript."""
        if call_sid not in self.active_calls:
            logger.warning("No active call for call_sid=%s", call_sid)
            return
        
        turn = ConversationTurn(
            role="user",
            content=content,
            timestamp=time.time(),
            audio_duration_ms=audio_duration_ms
        )
        self.active_calls[call_sid].turns.append(turn)
        logger.debug("Added user turn: %s", content[:50] if content else "")
    
    def add_assistant_turn(self, call_sid: str, content: str, audio_duration_ms: Optional[int] = None):
        """Add an assistant turn to the transcript."""
        if call_sid not in self.active_calls:
            logger.warning("No active call for call_sid=%s", call_sid)
            return
        
        turn = ConversationTurn(
            role="assistant",
            content=content,
            timestamp=time.time(),
            audio_duration_ms=audio_duration_ms
        )
        self.active_calls[call_sid].turns.append(turn)
        logger.debug("Added assistant turn: %s", content[:50] if content else "")
    
    def add_intent(self, call_sid: str, intent: str):
        """Add a detected intent to the call."""
        if call_sid not in self.active_calls:
            return
        
        if intent not in self.active_calls[call_sid].detected_intents:
            self.active_calls[call_sid].detected_intents.append(intent)
            logger.debug("Added intent: %s", intent)
    
    def add_function_call(self, call_sid: str, function_name: str, arguments: dict, result: Any):
        """Record a function call made during the conversation."""
        if call_sid not in self.active_calls:
            return
        
        self.active_calls[call_sid].function_calls.append({
            "function": function_name,
            "arguments": arguments,
            "result": result,
            "timestamp": time.time()
        })
        logger.debug("Added function call: %s", function_name)
    
    def record_error(self, call_sid: str, error_details: str):
        """Record an error that occurred during the call."""
        if call_sid not in self.active_calls:
            return
        
        self.active_calls[call_sid].error_occurred = True
        self.active_calls[call_sid].error_details = error_details
        logger.warning("Recorded error for call_sid=%s: %s", call_sid, error_details)
    
    def end_call(self, call_sid: str, outcome: Optional[str] = None) -> Optional[CallTranscript]:
        """
        End call tracking and save transcript.
        
        Args:
            call_sid: The call identifier
            outcome: One of "booking", "lead_captured", "transferred", "abandoned", "misuse", "timeout"
        
        Returns:
            The completed CallTranscript or None if call not found
        """
        if call_sid not in self.active_calls:
            logger.warning("No active call to end for call_sid=%s", call_sid)
            return None
        
        transcript = self.active_calls.pop(call_sid)
        transcript.end_time = time.time()
        transcript.duration_seconds = transcript.end_time - transcript.start_time
        transcript.outcome = outcome
        
        # Save to file
        self._save_transcript(transcript)
        
        logger.info("Ended transcript collection for call_sid=%s, duration=%.1fs, outcome=%s, turns=%d",
                   call_sid, transcript.duration_seconds, outcome, len(transcript.turns))
        
        return transcript
    
    def _save_transcript(self, transcript: CallTranscript):
        """Save transcript to JSON file."""
        try:
            # Create filename with date for easy organization
            date_str = datetime.fromtimestamp(transcript.start_time).strftime("%Y-%m-%d")
            filename = f"{date_str}_{transcript.call_sid}.json"
            filepath = Path(TRANSCRIPT_DIR) / filename
            
            # Convert to dict for JSON serialization
            data = {
                "call_sid": transcript.call_sid,
                "caller_number": transcript.caller_number,
                "start_time": transcript.start_time,
                "start_time_iso": datetime.fromtimestamp(transcript.start_time).isoformat(),
                "end_time": transcript.end_time,
                "duration_seconds": transcript.duration_seconds,
                "outcome": transcript.outcome,
                "detected_intents": transcript.detected_intents,
                "function_calls": transcript.function_calls,
                "error_occurred": transcript.error_occurred,
                "error_details": transcript.error_details,
                "turns": [
                    {
                        "role": turn.role,
                        "content": turn.content,
                        "timestamp": turn.timestamp,
                        "audio_duration_ms": turn.audio_duration_ms,
                        "intent": turn.intent
                    }
                    for turn in transcript.turns
                ]
            }
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.info("Saved transcript to %s", filepath)
            
        except Exception as e:
            logger.error("Failed to save transcript: %s", str(e))
    
    def get_training_data(self, min_turns: int = 2, exclude_errors: bool = True) -> List[Dict]:
        """
        Export transcripts as training data for Gather model.
        
        Returns list of conversation examples with:
        - Input: User utterance
        - Output: Expected response or action
        - Intent: Detected intent
        """
        training_data = []
        
        try:
            for filepath in Path(TRANSCRIPT_DIR).glob("*.json"):
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                # Skip error calls if requested
                if exclude_errors and data.get("error_occurred"):
                    continue
                
                # Skip calls with too few turns
                turns = data.get("turns", [])
                if len(turns) < min_turns:
                    continue
                
                # Extract user-assistant pairs
                for i in range(len(turns) - 1):
                    if turns[i]["role"] == "user" and turns[i + 1]["role"] == "assistant":
                        training_data.append({
                            "user_input": turns[i]["content"],
                            "assistant_response": turns[i + 1]["content"],
                            "intent": turns[i].get("intent") or self._infer_intent(turns[i]["content"]),
                            "call_outcome": data.get("outcome"),
                            "source_call": data.get("call_sid")
                        })
            
            logger.info("Exported %d training examples from transcripts", len(training_data))
            return training_data
            
        except Exception as e:
            logger.error("Failed to export training data: %s", str(e))
            return []
    
    def _infer_intent(self, user_input: str) -> str:
        """Simple rule-based intent inference for training data labeling."""
        user_input_lower = user_input.lower()
        
        # Emergency keywords
        if any(word in user_input_lower for word in ["gas leak", "fire", "smoke", "carbon monoxide", "co alarm", "emergency"]):
            return "emergency"
        
        # Booking keywords
        if any(word in user_input_lower for word in ["appointment", "schedule", "book", "come out", "send someone", "available"]):
            return "booking"
        
        # Status check keywords
        if any(word in user_input_lower for word in ["status", "when", "appointment time", "technician", "on the way"]):
            return "status_check"
        
        # Pricing keywords
        if any(word in user_input_lower for word in ["price", "cost", "how much", "estimate", "quote"]):
            return "pricing"
        
        # FAQ keywords
        if any(word in user_input_lower for word in ["how do", "what is", "why", "explain", "tell me about"]):
            return "faq"
        
        # Complaint keywords
        if any(word in user_input_lower for word in ["complaint", "unhappy", "not working", "broken", "problem"]):
            return "complaint"
        
        # Transfer keywords
        if any(word in user_input_lower for word in ["speak to", "talk to", "human", "person", "manager", "supervisor"]):
            return "transfer_request"
        
        return "general"
    
    def get_intent_distribution(self) -> Dict[str, int]:
        """Get distribution of intents across all transcripts."""
        intent_counts = {}
        
        try:
            for filepath in Path(TRANSCRIPT_DIR).glob("*.json"):
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                for intent in data.get("detected_intents", []):
                    intent_counts[intent] = intent_counts.get(intent, 0) + 1
            
            return intent_counts
            
        except Exception as e:
            logger.error("Failed to get intent distribution: %s", str(e))
            return {}
    
    def get_outcome_distribution(self) -> Dict[str, int]:
        """Get distribution of call outcomes."""
        outcome_counts = {}
        
        try:
            for filepath in Path(TRANSCRIPT_DIR).glob("*.json"):
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                outcome = data.get("outcome", "unknown")
                outcome_counts[outcome] = outcome_counts.get(outcome, 0) + 1
            
            return outcome_counts
            
        except Exception as e:
            logger.error("Failed to get outcome distribution: %s", str(e))
            return {}


# Global singleton instance
_collector: Optional[TranscriptCollector] = None


def get_transcript_collector() -> TranscriptCollector:
    """Get the global transcript collector instance."""
    global _collector
    if _collector is None:
        _collector = TranscriptCollector()
    return _collector
