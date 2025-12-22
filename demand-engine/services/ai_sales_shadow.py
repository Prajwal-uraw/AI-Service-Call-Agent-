"""
AI Sales Shadow - Silent listener with real-time insights
Provides nudges to human sellers during calls (cost-efficient, non-streaming)
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from services.openai_service import get_openai_service

logger = logging.getLogger(__name__)

class AISalesShadow:
    """
    Silent AI copilot that analyzes calls and provides real-time nudges
    Cost-efficient: Batches audio, analyzes periodically (not streaming)
    """
    
    def __init__(self, meeting_id: str):
        self.meeting_id = meeting_id
        self.openai_service = get_openai_service()
        
        self.is_listening = False
        self.audio_buffer = []
        self.transcript_buffer = []
        self.last_signal_time = None
        self.total_cost = 0.0
        
        # Context from Deal Control Plane
        self.deal_context = {}
        
    def start_listening(self):
        """Enable AI listening"""
        self.is_listening = True
        logger.info(f"AI Sales Shadow started for meeting {self.meeting_id}")
    
    def stop_listening(self):
        """Disable AI listening"""
        self.is_listening = False
        logger.info(f"AI Sales Shadow stopped for meeting {self.meeting_id}")
    
    async def analyze_audio_chunk(self, audio_data: bytes) -> Optional[Dict[str, Any]]:
        """
        Analyze audio chunk and generate signal if needed
        
        Cost-efficient approach:
        1. Buffer audio for 30-45 seconds
        2. Transcribe batch
        3. Run lightweight intent detection
        4. Generate max 1 signal per 30-45 seconds
        
        Returns:
            Signal dict or None
        """
        if not self.is_listening:
            return None
        
        try:
            # Add to buffer
            self.audio_buffer.append(audio_data)
            
            # Check if buffer is large enough (30 seconds of audio)
            # Assuming 16kHz, 16-bit audio: 30 sec = 960,000 bytes
            buffer_size = sum(len(chunk) for chunk in self.audio_buffer)
            
            if buffer_size < 960_000:
                return None  # Not enough audio yet
            
            # Check rate limit (max 1 signal per 30 seconds)
            if self.last_signal_time:
                elapsed = (datetime.now() - self.last_signal_time).total_seconds()
                if elapsed < 30:
                    return None  # Too soon for next signal
            
            # Transcribe buffered audio
            combined_audio = b''.join(self.audio_buffer)
            stt_result = await self.openai_service.transcribe_audio(combined_audio)
            
            self.total_cost += stt_result["cost"]
            
            # Add to transcript buffer
            self.transcript_buffer.append(stt_result["text"])
            
            # Clear audio buffer
            self.audio_buffer = []
            
            # Analyze transcript and generate signal
            signal = await self.generate_signal(stt_result["text"])
            
            if signal:
                self.last_signal_time = datetime.now()
            
            return signal
            
        except Exception as e:
            logger.error(f"Error analyzing audio: {e}")
            return None
    
    async def generate_signal(self, recent_transcript: str) -> Optional[Dict[str, Any]]:
        """
        Generate AI signal based on transcript
        
        Signal types:
        - nudge: Actionable suggestion
        - warning: Risk detected
        - insight: Positive observation
        
        Returns:
            {
                "type": "nudge",
                "message": "Ask about budget now",
                "confidence": 0.85,
                "trigger": "customer_mentioned_price"
            }
        """
        try:
            # Get full context
            full_transcript = " ".join(self.transcript_buffer[-5:])  # Last 5 chunks
            
            system_prompt = """You are an AI sales coach analyzing a live sales call.
Generate ONE short, actionable signal for the seller.

Signal types:
- nudge: Suggest next action (e.g., "Ask about budget now")
- warning: Alert to risk (e.g., "Stop pitching - clarify objection")
- insight: Positive observation (e.g., "Decision maker confirmed")

Rules:
- Max 10 words
- Imperative tone
- No explanations
- No suggestions to customer directly

Respond in JSON:
{
    "type": "nudge|warning|insight",
    "message": "short message",
    "confidence": 0.0-1.0,
    "trigger": "reason"
}

If no signal needed, respond with: {"type": "none"}"""
            
            messages = [
                {"role": "user", "content": f"Recent transcript:\n{recent_transcript}\n\nGenerate signal:"}
            ]
            
            response = await self.openai_service.generate_response(
                messages=messages,
                system_prompt=system_prompt,
                use_premium=False,  # Use fast model for cost efficiency
                max_tokens=100,
                temperature=0.3
            )
            
            self.total_cost += response["cost"]
            
            # Parse JSON response
            import json
            try:
                signal = json.loads(response["text"])
                
                if signal.get("type") == "none":
                    return None
                
                # Add metadata
                signal["timestamp"] = datetime.now().isoformat()
                signal["cost"] = response["cost"]
                
                logger.info(f"Generated signal: {signal}")
                return signal
                
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse signal JSON: {response['text']}")
                return None
            
        except Exception as e:
            logger.error(f"Error generating signal: {e}")
            return None
    
    async def detect_triggers(self, transcript: str) -> List[str]:
        """
        Detect specific triggers in transcript
        
        Triggers:
        - pricing_objection
        - decision_maker_absent
        - no_next_step
        - customer_talking_too_much
        - budget_question
        """
        triggers = []
        
        transcript_lower = transcript.lower()
        
        # Pricing objection
        if any(word in transcript_lower for word in ["expensive", "too much", "can't afford", "budget"]):
            triggers.append("pricing_objection")
        
        # Decision maker
        if any(word in transcript_lower for word in ["need to check", "talk to my", "not sure"]):
            triggers.append("decision_maker_absent")
        
        # No next step
        if any(word in transcript_lower for word in ["think about it", "get back to you", "let me know"]):
            triggers.append("no_next_step")
        
        # Budget question
        if any(word in transcript_lower for word in ["how much", "what's the price", "cost"]):
            triggers.append("budget_question")
        
        return triggers
    
    def get_stats(self) -> Dict[str, Any]:
        """Get AI Sales Shadow statistics"""
        return {
            "is_listening": self.is_listening,
            "total_cost": round(self.total_cost, 4),
            "transcript_chunks": len(self.transcript_buffer),
            "last_signal_time": self.last_signal_time.isoformat() if self.last_signal_time else None
        }


# Singleton instances per meeting
_shadow_instances: Dict[str, AISalesShadow] = {}

def get_ai_sales_shadow(meeting_id: str) -> AISalesShadow:
    """Get or create AI Sales Shadow instance for meeting"""
    if meeting_id not in _shadow_instances:
        _shadow_instances[meeting_id] = AISalesShadow(meeting_id)
    return _shadow_instances[meeting_id]

def cleanup_shadow(meeting_id: str):
    """Cleanup AI Sales Shadow instance"""
    if meeting_id in _shadow_instances:
        del _shadow_instances[meeting_id]
