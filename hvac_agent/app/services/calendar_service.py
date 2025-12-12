"""
Calendar and appointment management service.

Handles:
- Location listing
- Availability checking
- Appointment booking
- Rescheduling
- Cancellation
- Smart slot suggestions
"""

from datetime import datetime, timedelta, date, time
from typing import Dict, List, Optional, Any

from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session

from app.models.db_models import Location, Appointment
from app.utils.logging import get_logger
from app.services.notification_service import (
    AppointmentDetails,
    send_booking_confirmation,
    send_cancellation_notification,
    send_reschedule_notification,
)

logger = get_logger("calendar")


def get_location_by_code(db: Session, code: str) -> Optional[Location]:
    """Get location by its code (case-insensitive)."""
    stmt = select(Location).where(Location.code.ilike(code))
    return db.scalar(stmt)


def list_locations(db: Session, active_only: bool = True) -> List[Dict[str, Any]]:
    """
    List all available service locations.
    
    Args:
        db: Database session
        active_only: Only return active locations
        
    Returns:
        List of location dictionaries
    """
    stmt = select(Location)
    if active_only:
        stmt = stmt.where(Location.is_active == True)
    
    rows = db.scalars(stmt).all()
    return [
        {
            "name": loc.name,
            "code": loc.code,
            "address": loc.address,
            "phone": loc.phone,
            "hours": f"{loc.opening_hour}:00 - {loc.closing_hour}:00"
        }
        for loc in rows
    ]


def check_availability(
    db: Session,
    date_str: str,
    time_str: str,
    location_code: str,
    duration_minutes: int = 60
) -> Dict[str, Any]:
    """
    Check if a specific date/time slot is available.
    
    Args:
        db: Database session
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format (24-hour)
        location_code: Location code (e.g., "DAL")
        duration_minutes: Appointment duration
        
    Returns:
        Availability status with details
    """
    loc = get_location_by_code(db, location_code)
    if not loc:
        return {"available": False, "reason": "Unknown location code."}

    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
        t = datetime.strptime(time_str, "%H:%M").time()
    except ValueError:
        return {"available": False, "reason": "Invalid date or time format."}

    # Check if date is in the past
    today = datetime.now().date()
    if d < today:
        return {"available": False, "reason": "Cannot book appointments in the past."}

    # Check if within business hours
    if not loc.is_open(t.hour):
        return {
            "available": False,
            "reason": f"Outside business hours. We're open {loc.opening_hour}:00 - {loc.closing_hour}:00."
        }

    # Check for existing appointments at this slot
    stmt = (
        select(Appointment)
        .where(Appointment.location_id == loc.id)
        .where(Appointment.date == d)
        .where(Appointment.time == t)
        .where(Appointment.is_cancelled == False)
    )
    existing = db.scalar(stmt)
    
    if existing:
        return {"available": False, "reason": "This time slot is already booked."}

    return {
        "available": True,
        "location": loc.name,
        "date": date_str,
        "time": time_str
    }


def get_next_available_slots(
    db: Session,
    location_code: str,
    start_date: Optional[str] = None,
    num_slots: int = 5
) -> List[Dict[str, str]]:
    """
    Get the next available appointment slots.
    
    Args:
        db: Database session
        location_code: Location code
        start_date: Starting date (defaults to today)
        num_slots: Number of slots to return
        
    Returns:
        List of available slot dictionaries
    """
    loc = get_location_by_code(db, location_code)
    if not loc:
        return []

    if start_date:
        try:
            current_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            current_date = datetime.now().date()
    else:
        current_date = datetime.now().date()

    available_slots = []
    days_checked = 0
    max_days = 14  # Look up to 2 weeks ahead

    while len(available_slots) < num_slots and days_checked < max_days:
        # Skip weekends (optional - remove if you work weekends)
        if current_date.weekday() < 5:  # Monday = 0, Friday = 4
            # Check each hour during business hours
            for hour in range(loc.opening_hour, loc.closing_hour):
                time_str = f"{hour:02d}:00"
                date_str = current_date.strftime("%Y-%m-%d")
                
                result = check_availability(db, date_str, time_str, location_code)
                if result.get("available"):
                    available_slots.append({
                        "date": date_str,
                        "time": time_str,
                        "display": f"{current_date.strftime('%A, %B %d')} at {hour}:00"
                    })
                    
                    if len(available_slots) >= num_slots:
                        break

        current_date += timedelta(days=1)
        days_checked += 1

    return available_slots


def create_booking(
    db: Session,
    name: str,
    date_str: str,
    time_str: str,
    issue: str,
    location_code: str,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    call_sid: Optional[str] = None,
    priority: int = 3,
    send_confirmation: bool = True,
) -> Dict[str, Any]:
    """
    Create a new appointment booking.
    
    Args:
        db: Database session
        name: Customer name
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format
        issue: Description of the HVAC issue
        location_code: Location code
        phone: Customer phone (optional)
        call_sid: Twilio call SID (optional)
        priority: Priority level (1=High, 2=Medium, 3=Normal)
        
    Returns:
        Booking result with status and details
    """
    loc = get_location_by_code(db, location_code)
    if not loc:
        logger.warning("Booking attempt for unknown location: %s", location_code)
        return {"status": "error", "message": "Unknown location."}

    # Check availability first
    avail = check_availability(db, date_str, time_str, location_code)
    if not avail.get("available"):
        return {"status": "taken", "message": avail.get("reason", "Time slot not available.")}

    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
        t = datetime.strptime(time_str, "%H:%M").time()
    except ValueError:
        return {"status": "error", "message": "Invalid date or time format."}

    # Categorize the issue
    issue_category = _categorize_issue(issue)

    appt = Appointment(
        customer_name=name.strip(),
        customer_phone=phone,
        customer_email=email,
        date=d,
        time=t,
        issue=issue.strip(),
        issue_category=issue_category,
        priority=priority,
        location_id=loc.id,
        call_sid=call_sid,
    )
    
    try:
        db.add(appt)
        db.commit()
        db.refresh(appt)
        
        logger.info(
            "Booking created: %s at %s %s for %s",
            name, date_str, time_str, loc.name
        )
        
        # Send confirmation notifications
        if send_confirmation and (phone or email):
            try:
                details = AppointmentDetails(
                    customer_name=name.strip(),
                    customer_phone=phone,
                    customer_email=email,
                    appointment_date=d,
                    appointment_time=t,
                    location_name=loc.name,
                    location_address=loc.address or "",
                    issue=issue.strip(),
                    confirmation_id=appt.id,
                )
                notification_result = send_booking_confirmation(details)
                logger.info("Confirmation sent: %s", notification_result)
            except Exception as e:
                logger.warning("Failed to send confirmation: %s", str(e))
        
        return {
            "status": "success",
            "message": f"Booking confirmed for {date_str} at {time_str} at {loc.name}.",
            "appointment_id": appt.id,
            "confirmation": f"Your confirmation number is {appt.id:05d}.",
            "confirmation_sent": bool(phone or email),
        }
    except Exception as e:
        db.rollback()
        logger.error("Failed to create booking: %s", str(e))
        return {"status": "error", "message": "Failed to create booking. Please try again."}


def reschedule_booking(
    db: Session,
    name: str,
    new_date: str,
    new_time: str,
    location_code: str,
) -> Dict[str, Any]:
    """
    Reschedule the most recent appointment for a customer.
    
    Args:
        db: Database session
        name: Customer name
        new_date: New date in YYYY-MM-DD format
        new_time: New time in HH:MM format
        location_code: Location code
        
    Returns:
        Reschedule result with status
    """
    loc = get_location_by_code(db, location_code)
    if not loc:
        return {"status": "error", "message": "Unknown location."}

    try:
        new_d = datetime.strptime(new_date, "%Y-%m-%d").date()
        new_t = datetime.strptime(new_time, "%H:%M").time()
    except ValueError:
        return {"status": "error", "message": "Invalid date or time format."}

    # Find the most recent non-cancelled appointment
    stmt = (
        select(Appointment)
        .where(Appointment.customer_name.ilike(f"%{name}%"))
        .where(Appointment.location_id == loc.id)
        .where(Appointment.is_cancelled == False)
        .where(Appointment.date >= datetime.now().date())
        .order_by(Appointment.date.desc(), Appointment.time.desc())
    )
    appt = db.scalars(stmt).first()
    
    if not appt:
        return {"status": "not_found", "message": "No upcoming appointment found to reschedule."}

    # Check new slot availability
    avail = check_availability(db, new_date, new_time, location_code)
    if not avail.get("available"):
        return {"status": "taken", "message": avail.get("reason", "New time slot is not available.")}

    old_date = appt.date.isoformat()
    old_time = appt.time.strftime("%H:%M")
    
    appt.date = new_d
    appt.time = new_t
    
    try:
        db.commit()
        db.refresh(appt)
        
        logger.info(
            "Appointment rescheduled: %s from %s %s to %s %s",
            name, old_date, old_time, new_date, new_time
        )
        
        return {
            "status": "success",
            "message": f"Appointment rescheduled from {old_date} at {old_time} to {new_date} at {new_time}.",
        }
    except Exception as e:
        db.rollback()
        logger.error("Failed to reschedule: %s", str(e))
        return {"status": "error", "message": "Failed to reschedule. Please try again."}


def cancel_booking(
    db: Session,
    name: str,
    location_code: str,
    confirmation_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Cancel an appointment.
    
    Args:
        db: Database session
        name: Customer name
        location_code: Location code
        confirmation_id: Optional confirmation number
        
    Returns:
        Cancellation result
    """
    loc = get_location_by_code(db, location_code)
    if not loc:
        return {"status": "error", "message": "Unknown location."}

    if confirmation_id:
        stmt = (
            select(Appointment)
            .where(Appointment.id == confirmation_id)
            .where(Appointment.is_cancelled == False)
        )
    else:
        stmt = (
            select(Appointment)
            .where(Appointment.customer_name.ilike(f"%{name}%"))
            .where(Appointment.location_id == loc.id)
            .where(Appointment.is_cancelled == False)
            .where(Appointment.date >= datetime.now().date())
            .order_by(Appointment.date.asc())
        )
    
    appt = db.scalars(stmt).first()
    
    if not appt:
        return {"status": "not_found", "message": "No appointment found to cancel."}

    appt.is_cancelled = True
    
    try:
        db.commit()
        logger.info("Appointment cancelled: %s on %s", name, appt.date.isoformat())
        return {
            "status": "success",
            "message": f"Your appointment on {appt.date.strftime('%B %d')} at {appt.time.strftime('%I:%M %p')} has been cancelled.",
        }
    except Exception as e:
        db.rollback()
        logger.error("Failed to cancel: %s", str(e))
        return {"status": "error", "message": "Failed to cancel. Please try again."}


def _categorize_issue(issue: str) -> str:
    """Categorize HVAC issue based on keywords."""
    issue_lower = issue.lower()
    
    if any(kw in issue_lower for kw in ["ac", "air condition", "cooling", "cold air", "not cooling"]):
        return "AC"
    elif any(kw in issue_lower for kw in ["heat", "furnace", "warm", "not heating"]):
        return "Heating"
    elif any(kw in issue_lower for kw in ["maintenance", "tune-up", "check", "inspection", "annual"]):
        return "Maintenance"
    elif any(kw in issue_lower for kw in ["install", "new unit", "replacement", "upgrade"]):
        return "Installation"
    elif any(kw in issue_lower for kw in ["duct", "vent", "airflow"]):
        return "Ductwork"
    elif any(kw in issue_lower for kw in ["thermostat", "temperature control"]):
        return "Thermostat"
    else:
        return "General"
