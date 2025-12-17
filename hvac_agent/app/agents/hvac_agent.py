"""
HVAC Voice Agent - Main Agent Logic.

Handles:
- OpenAI chat completions with function calling
- Tool execution
- State management
- Emergency detection
- Soft tone responses
- Conversation flow
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
load_dotenv()
import httpx
from openai import OpenAI
from sqlalchemy.orm import Session

from app.agents.state import CallState
from app.agents.tools import (
    tool_list_locations,
    tool_check_availability,
    tool_create_booking,
    tool_reschedule_booking,
    tool_cancel_booking,
    tool_get_next_slots,
    tool_get_hvac_insight,
    serialize_tool_result,
    get_tools_schema,
)
from app.services.emergency_service import (
    detect_emergency,
    get_emergency_response,
    log_emergency,
)
from app.utils.logging import get_logger
from app.utils.voice_config import (
    detect_caller_emotion,
    get_soft_response_prefix,
    VoiceTone,
)
from app.utils.error_handler import (
    handle_error,
    get_user_friendly_error,
    HVACAgentError,
)
from app.utils.context_manager import get_context_efficient_history

logger = get_logger("hvac_agent")

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HVAC_COMPANY_NAME = os.getenv("HVAC_COMPANY_NAME", "KC Comfort Air")
# Upgraded to gpt-4o for significantly better conversation quality and context retention
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
MAX_TOOL_CALLS = int(os.getenv("MAX_TOOL_CALLS", "5"))

# Initialize OpenAI client with timeout
_http_client = httpx.Client(timeout=httpx.Timeout(4.0, connect=2.0))
client = OpenAI(api_key=OPENAI_API_KEY, http_client=_http_client)

# Professional Service Agent - efficient, helpful, business-appropriate
SYSTEM_PROMPT = f"""You are a professional service representative at {HVAC_COMPANY_NAME}. You help customers schedule HVAC service appointments efficiently and professionally.

## YOUR COMMUNICATION STYLE
- Professional, courteous, and efficient
- Clear and direct - avoid unnecessary conversation
- Empathetic when appropriate, but maintain professionalism
- Keep responses concise (1-2 sentences maximum)
- Use natural contractions: "I'll", "we're", "don't"

## BOOKING FLOW (complete in order)
1. **Issue**: "What service do you need - heating, cooling, or maintenance?"
2. **Location**: "What city are you located in?"
3. **Time**: "Would you prefer a morning or afternoon appointment?"
4. **Name**: "May I have your name for the appointment?"
5. **Phone**: "What's the best phone number to reach you?" (ALWAYS repeat it back for confirmation)
6. **Confirmation**: "Would you like a text or email confirmation?"

## LOCATION HANDLING
- Service areas: Dallas, Fort Worth, Arlington
- Accept nearby cities and map them appropriately:
  * Euless, Bedford, Hurst → Fort Worth (FTW)
  * Irving, Garland, Mesquite → Dallas (DAL)
  * Grand Prairie → Arlington (ARL)
- If unsure: "Let me verify we service that area. Which of our main service areas is closest - Dallas, Fort Worth, or Arlington?"

## PHONE NUMBER CONFIRMATION (CRITICAL)
- ALWAYS repeat the phone number back: "Let me confirm - that's 555-123-4567, correct?"
- Wait for verbal confirmation before proceeding
- Professional dispatchers always verify contact information

## PROFESSIONAL RESPONSES
- Acknowledge: "Understood." or "I see."
- Confirm: "That's confirmed."
- Check availability: "Let me check our schedule."
- Book appointment: "You're scheduled for [date] at [time]."
- Close call: "Is there anything else I can help you with today?"

## HANDLING DIFFERENT SITUATIONS
- **Long explanations**: Acknowledge briefly, then guide: "I understand. Let's get you scheduled. What city are you in?"
- **Unclear location**: "Could you clarify your location? We serve Dallas, Fort Worth, and Arlington."
- **Emergencies**: "This sounds urgent. I'm transferring you to our emergency line now."
- **Frustration**: "I understand your frustration. Let's get this taken care of quickly."

## AFTER BOOKING CONFIRMATION
- "You're scheduled for [day] at [time]."
- "Our technician will call 30 minutes before arrival."
- "The service call fee is $89, and you'll receive a detailed quote before any work begins."
- "You'll receive a [text/email] confirmation shortly."

## RULES
- Use tools to check real availability - never guess or assume
- Service areas: Dallas (DAL), Fort Worth (FTW), Arlington (ARL)
- Today's date: {datetime.now().strftime('%Y-%m-%d')}
- Keep responses under 20 words when possible
- One question at a time
- ALWAYS verify phone number before finalizing booking
- Emergencies: transfer immediately without lengthy discussion
"""


class HVACAgent:
    """
    HVAC Voice Agent class.
    
    Manages conversation flow, tool calling, and state.
    """
    
    def __init__(self, db: Session, call_sid: Optional[str] = None):
        self.db = db
        self.call_sid = call_sid
        self.logger = get_logger("hvac_agent", call_sid)
    
    def process_message(
        self,
        user_text: str,
        state: CallState,
        caller_phone: Optional[str] = None,
    ) -> str:
        """
        Process a user message and generate a response.
        
        Args:
            user_text: The user's speech/text input
            state: Current call state
            caller_phone: Caller's phone number (optional)
            
        Returns:
            Agent's response text
        """
        try:
            # Check for emergency first
            is_emergency, emergency_type, confidence = detect_emergency(user_text)
            if is_emergency and confidence >= 0.7:
                return self._handle_emergency(
                    user_text, state, emergency_type, caller_phone
                )
            
            # Check for human transfer request
            if self._wants_human(user_text):
                state.requested_human = True
                return "Alright. Transferring you now."
            
            # Detect caller emotion for empathetic response
            emotion = detect_caller_emotion(user_text)
            if emotion:
                state.caller_emotion = emotion
                if emotion == "frustration":
                    state.increment_frustration()
            
            # Normalize date/time references
            user_text = self._normalize_datetime_references(user_text)
            
            # Build messages for OpenAI
            messages = self._build_messages(user_text, state)
            
            # Get response from OpenAI
            response = self._get_completion(messages, state)
            
            # Add empathetic prefix if needed
            if state.frustration_level >= 2 or emotion == "frustration":
                prefix = get_soft_response_prefix(emotion)
                if prefix and not response.startswith(prefix):
                    response = prefix + response
            
            # Update state
            state.add_turn("user", user_text, emotion=emotion)
            state.add_turn("assistant", response, intent=state.last_intent)
            
            return response
            
        except Exception as e:
            self.logger.error("Error processing message: %s", str(e))
            error = handle_error(e, self.call_sid, "process_message")
            return get_user_friendly_error(error)
    
    def _handle_emergency(
        self,
        user_text: str,
        state: CallState,
        emergency_type: str,
        caller_phone: Optional[str],
    ) -> str:
        """Handle emergency situation."""
        self.logger.critical(
            "EMERGENCY DETECTED: type=%s, call_sid=%s",
            emergency_type, self.call_sid
        )
        
        state.set_emergency(emergency_type)
        
        # Log emergency to database
        if self.call_sid and caller_phone:
            try:
                log_emergency(
                    self.db,
                    call_sid=self.call_sid,
                    caller_phone=caller_phone,
                    emergency_type=emergency_type,
                    description=user_text,
                    location_code=state.location_code,
                )
            except Exception as e:
                self.logger.error("Failed to log emergency: %s", str(e))
        
        return get_emergency_response(emergency_type)
    
    def _wants_human(self, text: str) -> bool:
        """Check if caller wants to speak to a human."""
        human_phrases = [
            "speak to a person", "talk to someone", "human", "representative",
            "real person", "agent", "operator", "customer service",
            "speak to a human", "talk to a human", "live person"
        ]
        text_lower = text.lower()
        return any(phrase in text_lower for phrase in human_phrases)
    
    def _normalize_datetime_references(self, text: str) -> str:
        """Convert natural language date/time to structured format."""
        today = datetime.now().date()
        
        replacements = {
            "today": today.strftime("%Y-%m-%d"),
            "tomorrow": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
            "day after tomorrow": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
        }
        
        # Handle weekday references
        weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        current_weekday = today.weekday()
        
        for i, day in enumerate(weekdays):
            days_ahead = i - current_weekday
            if days_ahead <= 0:
                days_ahead += 7
            next_date = today + timedelta(days=days_ahead)
            replacements[f"next {day}"] = next_date.strftime("%Y-%m-%d")
            replacements[f"this {day}"] = next_date.strftime("%Y-%m-%d")
        
        text_lower = text.lower()
        for phrase, date_str in replacements.items():
            if phrase in text_lower:
                text = text.replace(phrase, date_str)
                text = text.replace(phrase.title(), date_str)
        
        return text
    
    def _build_messages(self, user_text: str, state: CallState) -> List[Dict[str, Any]]:
        """Build message list for OpenAI - optimized for context retention and natural conversation."""
        # Compact state context (only essential fields)
        ctx = {
            "name": state.name,
            "loc": state.location_code,
            "issue": state.issue,  # Don't truncate - full context needed
            "appt": f"{state.appointment_date} {state.appointment_time}" if state.has_appointment else None,
        }
        ctx_str = json.dumps({k: v for k, v in ctx.items() if v}, separators=(',', ':'))

        messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT}\nState:{ctx_str}"},
        ]

        # Get context-efficient history (with optional summarization for very long calls)
        summary, recent_turns = get_context_efficient_history(
            state.conversation_history,
            include_summary=True,
            max_recent_turns=15  # Last 15 turns in full detail
        )

        # Add conversation summary if available (for calls > 15 turns)
        if summary:
            messages.append({
                "role": "system",
                "content": f"EARLIER CONVERSATION SUMMARY:\n{summary}"
            })

        # Add recent conversation turns in full detail
        for turn in recent_turns:
            messages.append({
                "role": turn.role,
                "content": turn.content  # Full content for proper context
            })

        # Add current user message
        messages.append({"role": "user", "content": user_text})

        return messages
    
    def _get_completion(self, messages: List[Dict], state: CallState) -> str:
        """Get completion from OpenAI with tool handling."""
        tools = get_tools_schema()
        
        try:
            completion = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=messages,
                tools=tools,
                temperature=0.7,  # Higher for natural, varied, human-like responses
                max_tokens=150,   # Allow complete thoughts and natural phrasing
            )
        except httpx.TimeoutException:
            self.logger.warning("OpenAI timeout - returning fallback")
            return "One moment. Say that again."
        except Exception as e:
            self.logger.error("OpenAI API error: %s", str(e))
            raise
        
        msg = completion.choices[0].message
        
        # Handle tool calls
        if msg.tool_calls:
            return self._handle_tool_calls(msg.tool_calls, messages, state)
        
        return msg.content.strip() if msg.content else "Didn't catch that. Say that again."
    
    def _handle_tool_calls(
        self,
        tool_calls: List,
        messages: List[Dict],
        state: CallState,
    ) -> str:
        """Execute tool calls and get follow-up response."""
        tool_results = []
        
        for call in tool_calls[:MAX_TOOL_CALLS]:  # Limit tool calls
            fn_name = call.function.name
            try:
                args = json.loads(call.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            
            self.logger.info("Executing tool: %s with args: %s", fn_name, args)
            
            result = self._execute_tool(fn_name, args, state)
            tool_results.append({
                "tool_call_id": call.id,
                "role": "tool",
                "content": serialize_tool_result(result),
            })
        
        # Add tool results to messages
        messages.append({
            "role": "assistant",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    }
                }
                for tc in tool_calls[:MAX_TOOL_CALLS]
            ]
        })
        messages.extend(tool_results)
        
        # Get follow-up response
        try:
            follow_up = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=messages,
                temperature=0.7,  # Natural, varied responses
                max_tokens=150,   # Complete thoughts
            )
            return follow_up.choices[0].message.content.strip()
        except httpx.TimeoutException:
            self.logger.warning("Follow-up timeout - using fallback")
            return self._generate_fallback_response(tool_results, state)
        except Exception as e:
            self.logger.error("Follow-up completion error: %s", str(e))
            return self._generate_fallback_response(tool_results, state)
    
    def _execute_tool(
        self,
        fn_name: str,
        args: Dict[str, Any],
        state: CallState,
    ) -> Dict[str, Any]:
        """Execute a single tool and return result."""
        try:
            if fn_name == "list_locations":
                return tool_list_locations(self.db)
            
            elif fn_name == "check_availability":
                return tool_check_availability(
                    self.db,
                    date=args.get("date", ""),
                    time=args.get("time", ""),
                    location_code=args.get("location_code", ""),
                )
            
            elif fn_name == "create_booking":
                # Update state with booking info
                state.name = args.get("name")
                state.issue = args.get("issue")
                state.location_code = args.get("location_code")
                
                result = tool_create_booking(
                    self.db,
                    name=args.get("name", ""),
                    date=args.get("date", ""),
                    time=args.get("time", ""),
                    issue=args.get("issue", ""),
                    location_code=args.get("location_code", ""),
                    call_sid=self.call_sid,
                )
                
                if result.get("status") == "success":
                    state.has_appointment = True
                    state.appointment_id = result.get("appointment_id")
                    state.appointment_date = args.get("date")
                    state.appointment_time = args.get("time")
                    state.last_intent = "booking"
                
                return result
            
            elif fn_name == "reschedule_booking":
                if not state.name:
                    state.name = args.get("name")
                state.location_code = args.get("location_code")
                
                result = tool_reschedule_booking(
                    self.db,
                    name=args.get("name", ""),
                    new_date=args.get("new_date", ""),
                    new_time=args.get("new_time", ""),
                    location_code=args.get("location_code", ""),
                )
                
                if result.get("status") == "success":
                    state.appointment_date = args.get("new_date")
                    state.appointment_time = args.get("new_time")
                    state.last_intent = "reschedule"
                
                return result
            
            elif fn_name == "cancel_booking":
                result = tool_cancel_booking(
                    self.db,
                    name=args.get("name", ""),
                    location_code=args.get("location_code", ""),
                    confirmation_id=args.get("confirmation_id"),
                )
                
                if result.get("status") == "success":
                    state.has_appointment = False
                    state.last_intent = "cancel"
                
                return result
            
            elif fn_name == "get_next_available_slots":
                return tool_get_next_slots(
                    self.db,
                    location_code=args.get("location_code", ""),
                    num_slots=args.get("num_slots", 5),
                )
            
            elif fn_name == "get_hvac_insight":
                result = tool_get_hvac_insight(args.get("topic", ""))
                state.last_intent = "information"
                return result
            
            else:
                self.logger.warning("Unknown tool: %s", fn_name)
                return {"error": f"Unknown tool: {fn_name}"}
                
        except Exception as e:
            self.logger.error("Tool execution error: %s - %s", fn_name, str(e))
            return {"error": str(e)}
    
    def _generate_fallback_response(
        self,
        tool_results: List[Dict],
        state: CallState,
    ) -> str:
        """Generate fallback response when follow-up fails."""
        # Check if any tool succeeded
        for result in tool_results:
            content = json.loads(result.get("content", "{}"))
            if content.get("status") == "success":
                return content.get("message", "I've completed that for you.")
        
        return "One moment. Try that again."


def run_agent(
    user_text: str,
    state: CallState,
    db: Session,
    call_sid: Optional[str] = None,
    caller_phone: Optional[str] = None,
) -> str:
    """
    Main entry point for running the HVAC agent.
    
    Args:
        user_text: User's speech/text input
        state: Current call state
        db: Database session
        call_sid: Optional Twilio CallSid
        caller_phone: Optional caller phone number
        
    Returns:
        Agent's response text
    """
    agent = HVACAgent(db, call_sid)
    return agent.process_message(user_text, state, caller_phone)
