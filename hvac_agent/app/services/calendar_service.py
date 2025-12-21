"""
Calendar and appointment management service.

Handles:
- Location listing
- Availability checking
- Appointment booking
- Rescheduling
- Cancellation
- Smart slot suggestions
- Google Calendar synchronization
"""

import os
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
from app.services.google_calendar_service import get_google_calendar_service
from app.core.config import settings

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
) -> List[Dict[str, Any]]:
    """
    Get the next available appointment slots.
    
    This function first checks the local database for availability and can optionally
    sync with Google Calendar to check for conflicts.
    
    Args:
        db: Database session
        location_code: Location code
        start_date: Starting date (defaults to today)
        num_slots: Number of slots to return
        
    Returns:
        List of available slot dictionaries with date, time, and slot_id
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

    # Get all booked slots for the next 14 days
    booked_slots = db.scalars(
        select(Appointment)
        .where(
            and_(
                Appointment.location_id == loc.id,  # Use loc.id
                Appointment.date >= current_date,   # Use .date
                Appointment.date <= current_date + timedelta(days=14),
                Appointment.status.in_(["scheduled", "rescheduled"]),
                Appointment.is_cancelled == False,
            )
        )
        .order_by(Appointment.date, Appointment.time)  # Use .date and .time
    ).all()
    
    # Convert to a set of (date, time) tuples for quick lookup
    booked_times = {
        (slot.date, slot.time)
        for slot in booked_slots
    }
    
    # If Google Calendar is configured, check for busy times there too
    if settings.GOOGLE_CREDENTIALS_PATH and os.path.exists(settings.GOOGLE_CREDENTIALS_PATH):
        try:
            calendar_service = get_google_calendar_service()
            
            # Format time range for Google Calendar API
            time_min = datetime.combine(current_date, time.min).isoformat() + 'Z'  # 'Z' indicates UTC
            time_max = (datetime.combine(current_date, time.min) + timedelta(days=14)).isoformat() + 'Z'
            
            # Get busy intervals from Google Calendar
            busy_slots = calendar_service.get_available_slots(
                settings.GOOGLE_CALENDAR_ID,
                time_min=time_min,
                time_max=time_max,
                time_zone='America/Chicago'  # Adjust based on your timezone
            )
            
            # Add Google Calendar busy times to our booked_times set
            from dateutil import parser
            
            for slot in busy_slots:
                try:
                    slot_start = parser.parse(slot['start'])
                    slot_date = slot_start.date()
                    slot_time = slot_start.time()
                    
                    # Round to nearest 30 minutes to match our slot system
                    minutes = (slot_time.minute // 30) * 30
                    slot_time = slot_time.replace(minute=minutes, second=0, microsecond=0)
                    
                    booked_times.add((slot_date, slot_time))
                except Exception as e:
                    logger.warning(f"Error processing Google Calendar slot: {e}")
                    
        except Exception as e:
            logger.error(f"Error checking Google Calendar availability: {e}")
            # Continue with local availability if Google Calendar check fails

    while len(available_slots) < num_slots and days_checked < max_days:
        # Skip weekends (optional - remove if you work weekends)
        if current_date.weekday() < 5:  # Monday = 0, Friday = 4
            # Check each hour during business hours
            for hour in range(loc.opening_hour, loc.closing_hour):
                time_str = f"{hour:02d}:00"
                date_str = current_date.strftime("%Y-%m-%d")
                
                # Check if this slot is booked or busy
                if (current_date, datetime.strptime(time_str, "%H:%M").time()) in booked_times:
                    continue
                
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
    
    This function creates a booking in the local database and synchronizes it with
    Google Calendar if configured.
    
    Args:
        db: Database session
        name: Customer name
        date_str: Date in YYYY-MM-DD format
        time_str: Time in HH:MM format
        issue: Description of the HVAC issue
        location_code: Location code
        phone: Customer phone (optional)
        email: Customer email (optional)
        call_sid: Twilio call SID (optional, used as idempotency key)
        priority: Priority level (1=High, 2=Medium, 3=Normal)
        send_confirmation: Whether to send confirmation notification
        
    Returns:
        Booking result with status and details
        
    Note:
        If call_sid is provided, this function is idempotent - calling it
        multiple times with the same call_sid will return the existing booking
        instead of creating a duplicate.
    """
    loc = get_location_by_code(db, location_code)
    if not loc:
        logger.warning("Booking attempt for unknown location: %s", location_code)
        return {"status": "error", "message": "Unknown location."}

    # IDEMPOTENCY CHECK: If call_sid provided, check for existing booking with this call_sid
    if call_sid:
        existing = db.scalar(
            select(Appointment)
            .where(Appointment.call_sid == call_sid)
            .order_by(Appointment.created_at.desc())
        )
        if existing:
            return {
                "status": "success",
                "message": "Appointment already exists",
                "appointment_id": existing.id,
                "confirmation": f"Your appointment is already confirmed for {existing.appointment_date} at {existing.appointment_time}.",
                "google_event_id": existing.google_event_id,
            }

    # Check availability first
    avail = check_availability(db, date_str, time_str, location_code)
    if not avail.get("available"):
        return {"status": "taken", "message": avail.get("reason", "Time slot not available.")}

    try:
        appointment_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        appointment_time = datetime.strptime(time_str, "%H:%M").time()
    except ValueError:
        return {"status": "error", "message": "Invalid date or time format."}

    # Categorize the issue
    issue_category = _categorize_issue(issue)

    # Create the appointment in Google Calendar if configured
    google_event_id = None
    try:
        if settings.GOOGLE_CREDENTIALS_PATH and os.path.exists(settings.GOOGLE_CREDENTIALS_PATH):
            calendar_service = get_google_calendar_service()
            
            # Format start and end times (assuming 1-hour appointment by default)
            start_datetime = datetime.combine(appointment_date, appointment_time)
            end_datetime = start_datetime + timedelta(hours=1)
            
            # Format for Google Calendar API
            timezone = "America/Chicago"  # Adjust based on your timezone
            event = {
                'summary': f"HVAC Service - {name}",
                'description': f"Service for: {name}\nIssue: {issue}\nPhone: {phone or 'Not provided'}",
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': timezone,
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': timezone,
                },
                'attendees': [{'email': email}] if email else [],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 30},       # 30 min before
                    ],
                },
            }
            
            # Add the event to Google Calendar
            google_event = calendar_service.create_event(settings.GOOGLE_CALENDAR_ID, event)
            if google_event:
                google_event_id = google_event.get('id')
                logger.info(f"Created Google Calendar event: {google_event_id}")
    except Exception as e:
        logger.error(f"Error creating Google Calendar event: {e}")
        # Don't fail the booking if Google Calendar sync fails
    
    # Create the appointment in our database
    appointment = Appointment(
        customer_name=name,
        date=appointment_date,  
        time=appointment_time,
        issue=issue,
        location_id=loc.id,
        customer_phone=phone,
        # email=email,
        call_sid=call_sid,
        status="scheduled",
        priority=priority,
        google_event_id=google_event_id,
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
        
    logger.info(
        "Booking created: %s at %s %s for %s",
        name, date_str, time_str, loc.name
    )
        
    # Send confirmation if requested
    if send_confirmation and (email or phone):
        try:
            details = AppointmentDetails(
                customer_name=name,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                issue=issue,
                # location_code=location_code,
                location_id=loc.id,
                confirmation_number=appointment.id,
                phone=phone,
                email=email,
                google_event_id=google_event_id,
            )
            send_booking_confirmation(details)
        except Exception as e:
            logger.error(f"Error sending confirmation: {e}")
    
    return {
        "status": "success",
        "message": "Appointment created successfully",
        "appointment_id": appointment.id,
        "confirmation": f"Your appointment has been confirmed for {appointment_date} at {appointment_time}.",
        "google_event_id": google_event_id,
    }


def reschedule_booking(
    db: Session,
    name: str,
    new_date: str,
    new_time: str,
    location_code: str,
) -> Dict[str, Any]:
    """
    Reschedule the most recent appointment for a customer.
    
    This updates the appointment in both the local database and Google Calendar.
    
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
        # .where(Appointment.location_code == location_code)
        .where(Appointment.location_id == loc.id)
        .where(Appointment.is_cancelled == False)
        .where(Appointment.date >= datetime.now().date())
        .order_by(Appointment.date.desc(), Appointment.time.desc())
    )
    appointment = db.scalars(stmt).first()
    
    if not appointment:
        return {"status": "not_found", "message": "No upcoming appointment found to reschedule."}

    # Check new slot availability
    avail = check_availability(db, new_date, new_time, location_code)
    if not avail.get("available"):
        return {"status": "taken", "message": avail.get("reason", "New time slot is not available.")}

    # Update the appointment in Google Calendar if it exists there
    if appointment.google_event_id and settings.GOOGLE_CREDENTIALS_PATH and os.path.exists(settings.GOOGLE_CREDENTIALS_PATH):
        try:
            calendar_service = get_google_calendar_service()
            
            # Format start and end times (assuming 1-hour appointment by default)
            start_datetime = datetime.combine(
                datetime.strptime(new_date, '%Y-%m-%d').date(),
                datetime.strptime(new_time, '%H:%M').time()
            )
            end_datetime = start_datetime + timedelta(hours=1)
            
            # Format for Google Calendar API
            timezone = "America/Chicago"  # Adjust based on your timezone
            event = {
                'summary': f"HVAC Service - {appointment.customer_name}",
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': timezone,
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': timezone,
                },
                'description': f"Service for: {appointment.customer_name}\nIssue: {appointment.issue}",
            }
            
            # Update the event in Google Calendar
            updated_event = calendar_service.update_event(
                settings.GOOGLE_CALENDAR_ID,
                appointment.google_event_id,
                event
            )
            
            if updated_event:
                logger.info(f"Updated Google Calendar event: {appointment.google_event_id}")
            
        except Exception as e:
            logger.error(f"Error updating Google Calendar event: {e}")
            # Continue with local update even if Google Calendar update fails
    
    # Update the appointment in our database
    old_date = appointment.date
    old_time = appointment.time
    
    appointment.date = datetime.strptime(new_date, '%Y-%m-%d').date()
    appointment.time = datetime.strptime(new_time, '%H:%M').time()
    appointment.status = "rescheduled"
    appointment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(appointment)
    
    # Send reschedule notification
    try:
        details = AppointmentDetails(
            customer_name=appointment.customer_name,
            customer_phone=appointment.customer_phone,
            customer_email=appointment.customer_email,
            appointment_date=datetime.strptime(new_date, '%Y-%m-%d').date(),
            appointment_time=datetime.strptime(new_time, '%H:%M').time(),
            location_name=loc.name,
            location_address=loc.address or "",
            issue=appointment.issue,
            confirmation_id=appointment.id,
        )
        # send_reschedule_notification(details)
        send_reschedule_notification(
            details=details,
            old_date=old_date,
            old_time=old_time
        )
    except Exception as e:
        logger.error(f"Error sending reschedule notification: {e}")
    
    return {
        "status": "success",
        "message": "Appointment rescheduled successfully",
        "appointment_id": appointment.id,
        "new_date": new_date,
        "new_time": new_time,
        "google_event_id": appointment.google_event_id,
    }


def cancel_booking(
    db: Session,
    name: str,
    location_code: str,
    confirmation_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Cancel an appointment.
    
    This cancels the appointment in both the local database and Google Calendar.
    
    Args:
        db: Database session
        name: Customer name
        location_code: Location code
        confirmation_id: Optional confirmation number
        
    Returns:
        Cancellation result with status
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

    # Delete from Google Calendar if it exists there
    if appt.google_event_id and settings.GOOGLE_CREDENTIALS_PATH and os.path.exists(settings.GOOGLE_CREDENTIALS_PATH):
        try:
            calendar_service = get_google_calendar_service()
            calendar_service.delete_event(
                settings.GOOGLE_CALENDAR_ID,
                appt.google_event_id
            )
            logger.info(f"Deleted Google Calendar event: {appt.google_event_id}")
        except Exception as e:
            logger.error(f"Error deleting Google Calendar event: {e}")
            # Continue with local cancellation even if Google Calendar deletion fails
    
    # Update the appointment in our database
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
