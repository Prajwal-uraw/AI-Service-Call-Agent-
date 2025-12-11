"""
Agent tools for HVAC Voice Agent.

Provides function tools that the AI agent can call to:
- List locations
- Check availability
- Create bookings
- Reschedule appointments
- Cancel appointments
- Get HVAC insights
- Get next available slots
"""

import json
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.services.calendar_service import (
    list_locations,
    check_availability,
    create_booking,
    reschedule_booking,
    cancel_booking,
    get_next_available_slots,
)
from app.services.hvac_knowledge import (
    get_hvac_insight,
    get_troubleshooting_tips,
    format_insight_for_voice,
)
from app.utils.logging import get_logger

logger = get_logger("tools")


def tool_list_locations(db: Session) -> Dict[str, Any]:
    """
    List all available service locations.
    
    Args:
        db: Database session
        
    Returns:
        Dictionary with locations list
    """
    logger.info("Tool called: list_locations")
    locations = list_locations(db)
    return {"locations": locations, "count": len(locations)}


def tool_check_availability(
    db: Session,
    date: str,
    time: str,
    location_code: str,
) -> Dict[str, Any]:
    """
    Check if a specific time slot is available.
    
    Args:
        db: Database session
        date: Date in YYYY-MM-DD format
        time: Time in HH:MM format
        location_code: Location code (e.g., "DAL")
        
    Returns:
        Availability result
    """
    logger.info(
        "Tool called: check_availability date=%s time=%s location=%s",
        date, time, location_code
    )
    return check_availability(db, date, time, location_code)


def tool_create_booking(
    db: Session,
    name: str,
    date: str,
    time: str,
    issue: str,
    location_code: str,
    phone: Optional[str] = None,
    call_sid: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a new appointment booking.
    
    Args:
        db: Database session
        name: Customer name
        date: Date in YYYY-MM-DD format
        time: Time in HH:MM format
        issue: Description of HVAC issue
        location_code: Location code
        phone: Customer phone (optional)
        call_sid: Twilio CallSid (optional)
        
    Returns:
        Booking result
    """
    logger.info(
        "Tool called: create_booking name=%s date=%s time=%s location=%s",
        name, date, time, location_code
    )
    return create_booking(
        db=db,
        name=name,
        date_str=date,
        time_str=time,
        issue=issue,
        location_code=location_code,
        phone=phone,
        call_sid=call_sid,
    )


def tool_reschedule_booking(
    db: Session,
    name: str,
    new_date: str,
    new_time: str,
    location_code: str,
) -> Dict[str, Any]:
    """
    Reschedule an existing appointment.
    
    Args:
        db: Database session
        name: Customer name
        new_date: New date in YYYY-MM-DD format
        new_time: New time in HH:MM format
        location_code: Location code
        
    Returns:
        Reschedule result
    """
    logger.info(
        "Tool called: reschedule_booking name=%s new_date=%s new_time=%s location=%s",
        name, new_date, new_time, location_code
    )
    return reschedule_booking(
        db=db,
        name=name,
        new_date=new_date,
        new_time=new_time,
        location_code=location_code,
    )


def tool_cancel_booking(
    db: Session,
    name: str,
    location_code: str,
    confirmation_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Cancel an existing appointment.
    
    Args:
        db: Database session
        name: Customer name
        location_code: Location code
        confirmation_id: Optional confirmation number
        
    Returns:
        Cancellation result
    """
    logger.info(
        "Tool called: cancel_booking name=%s location=%s confirmation=%s",
        name, location_code, confirmation_id
    )
    return cancel_booking(
        db=db,
        name=name,
        location_code=location_code,
        confirmation_id=confirmation_id,
    )


def tool_get_next_slots(
    db: Session,
    location_code: str,
    num_slots: int = 5,
) -> Dict[str, Any]:
    """
    Get next available appointment slots.
    
    Args:
        db: Database session
        location_code: Location code
        num_slots: Number of slots to return
        
    Returns:
        Available slots
    """
    logger.info(
        "Tool called: get_next_slots location=%s num_slots=%d",
        location_code, num_slots
    )
    slots = get_next_available_slots(db, location_code, num_slots=num_slots)
    return {"available_slots": slots, "count": len(slots)}


def tool_get_hvac_insight(topic: str) -> Dict[str, Any]:
    """
    Get HVAC insight for a topic.
    
    Args:
        topic: Topic to get insight about
        
    Returns:
        Insight information
    """
    logger.info("Tool called: get_hvac_insight topic=%s", topic)
    insight = get_hvac_insight(topic)
    voice_response = format_insight_for_voice(insight)
    return {
        "insight": insight,
        "voice_response": voice_response,
    }


def tool_get_troubleshooting(issue: str) -> Dict[str, Any]:
    """
    Get troubleshooting tips for an issue.
    
    Args:
        issue: Issue description
        
    Returns:
        Troubleshooting tips
    """
    logger.info("Tool called: get_troubleshooting issue=%s", issue)
    tips = get_troubleshooting_tips(issue)
    return {"tips": tips, "count": len(tips)}


def serialize_tool_result(result: Dict[str, Any]) -> str:
    """
    Serialize tool result to JSON string.
    
    Args:
        result: Tool result dictionary
        
    Returns:
        JSON string
    """
    return json.dumps(result, ensure_ascii=False, default=str)


def get_tools_schema() -> List[Dict[str, Any]]:
    """
    Get OpenAI function calling schema for all tools.
    
    Returns:
        List of tool schemas
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "list_locations",
                "description": "List all available HVAC service locations with their codes, addresses, and hours.",
                "parameters": {"type": "object", "properties": {}},
            },
        },
        {
            "type": "function",
            "function": {
                "name": "check_availability",
                "description": "Check if a specific date and time slot is available at a location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string",
                            "description": "Date in YYYY-MM-DD format"
                        },
                        "time": {
                            "type": "string",
                            "description": "Time in HH:MM format (24-hour)"
                        },
                        "location_code": {
                            "type": "string",
                            "description": "Location code (e.g., DAL, FTW, ARL)"
                        },
                    },
                    "required": ["date", "time", "location_code"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "create_booking",
                "description": "Create a new appointment booking for the customer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Customer's full name"
                        },
                        "date": {
                            "type": "string",
                            "description": "Appointment date in YYYY-MM-DD format"
                        },
                        "time": {
                            "type": "string",
                            "description": "Appointment time in HH:MM format (24-hour)"
                        },
                        "issue": {
                            "type": "string",
                            "description": "Description of the HVAC issue"
                        },
                        "location_code": {
                            "type": "string",
                            "description": "Location code"
                        },
                    },
                    "required": ["name", "date", "time", "issue", "location_code"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "reschedule_booking",
                "description": "Reschedule an existing appointment to a new date and time.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Customer's name"
                        },
                        "new_date": {
                            "type": "string",
                            "description": "New date in YYYY-MM-DD format"
                        },
                        "new_time": {
                            "type": "string",
                            "description": "New time in HH:MM format (24-hour)"
                        },
                        "location_code": {
                            "type": "string",
                            "description": "Location code"
                        },
                    },
                    "required": ["name", "new_date", "new_time", "location_code"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "cancel_booking",
                "description": "Cancel an existing appointment.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Customer's name"
                        },
                        "location_code": {
                            "type": "string",
                            "description": "Location code"
                        },
                        "confirmation_id": {
                            "type": "integer",
                            "description": "Optional confirmation number"
                        },
                    },
                    "required": ["name", "location_code"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_next_available_slots",
                "description": "Get the next available appointment slots at a location.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location_code": {
                            "type": "string",
                            "description": "Location code"
                        },
                        "num_slots": {
                            "type": "integer",
                            "description": "Number of slots to return (default 5)"
                        },
                    },
                    "required": ["location_code"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_hvac_insight",
                "description": "Get general HVAC information and tips about a topic (AC issues, heating, maintenance, etc.).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "topic": {
                            "type": "string",
                            "description": "Topic to get insight about (e.g., 'ac not cooling', 'heater not working', 'strange noises')"
                        },
                    },
                    "required": ["topic"],
                },
            },
        },
    ]
