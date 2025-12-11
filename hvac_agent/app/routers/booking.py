"""
Debug and booking management endpoints.

Provides:
- Location listing (debug)
- Appointment listing (debug)
- Manual booking endpoints

NOTE: These endpoints should be protected or disabled in production.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel

from app.services.db import get_db
from app.services.calendar_service import (
    create_booking,
    reschedule_booking,
    cancel_booking,
    get_next_available_slots,
)
from app.models.db_models import Appointment, Location, EmergencyLog
from app.utils.logging import get_logger

router = APIRouter(prefix="/debug", tags=["debug"])
logger = get_logger("booking")


class BookingRequest(BaseModel):
    """Request model for creating a booking."""
    name: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    issue: str
    location_code: str
    phone: Optional[str] = None


class RescheduleRequest(BaseModel):
    """Request model for rescheduling."""
    name: str
    new_date: str
    new_time: str
    location_code: str


@router.get("/locations")
def debug_locations(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    List all service locations.
    
    Returns:
        List of locations with details
    """
    rows = db.scalars(select(Location)).all()
    return [
        {
            "id": loc.id,
            "name": loc.name,
            "code": loc.code,
            "address": loc.address,
            "phone": loc.phone,
            "emergency_phone": loc.emergency_phone,
            "hours": f"{loc.opening_hour}:00 - {loc.closing_hour}:00",
            "is_active": loc.is_active,
        }
        for loc in rows
    ]


@router.get("/appointments")
def debug_appointments(
    db: Session = Depends(get_db),
    location_code: Optional[str] = Query(None, description="Filter by location code"),
    include_cancelled: bool = Query(False, description="Include cancelled appointments"),
) -> List[Dict[str, Any]]:
    """
    List all appointments.
    
    Args:
        location_code: Optional filter by location
        include_cancelled: Whether to include cancelled appointments
        
    Returns:
        List of appointments with details
    """
    stmt = select(Appointment).join(Location)
    
    if location_code:
        stmt = stmt.where(Location.code.ilike(location_code))
    
    if not include_cancelled:
        stmt = stmt.where(Appointment.is_cancelled == False)
    
    stmt = stmt.order_by(Appointment.date.desc(), Appointment.time.desc())
    
    rows = db.scalars(stmt).all()
    return [
        {
            "id": appt.id,
            "customer_name": appt.customer_name,
            "customer_phone": appt.customer_phone,
            "date": appt.date.isoformat(),
            "time": appt.time.strftime("%H:%M"),
            "issue": appt.issue,
            "issue_category": appt.issue_category,
            "priority": appt.priority,
            "is_confirmed": appt.is_confirmed,
            "is_cancelled": appt.is_cancelled,
            "location": appt.location.name,
            "location_code": appt.location.code,
            "created_at": appt.created_at.isoformat(),
        }
        for appt in rows
    ]


@router.get("/appointments/upcoming")
def debug_upcoming_appointments(
    db: Session = Depends(get_db),
    days: int = Query(7, description="Number of days to look ahead"),
) -> List[Dict[str, Any]]:
    """
    List upcoming appointments.
    
    Args:
        days: Number of days to look ahead
        
    Returns:
        List of upcoming appointments
    """
    from datetime import timedelta
    
    today = datetime.now().date()
    end_date = today + timedelta(days=days)
    
    stmt = (
        select(Appointment)
        .join(Location)
        .where(Appointment.date >= today)
        .where(Appointment.date <= end_date)
        .where(Appointment.is_cancelled == False)
        .order_by(Appointment.date, Appointment.time)
    )
    
    rows = db.scalars(stmt).all()
    return [
        {
            "id": appt.id,
            "customer_name": appt.customer_name,
            "date": appt.date.isoformat(),
            "time": appt.time.strftime("%H:%M"),
            "issue": appt.issue,
            "location": appt.location.name,
        }
        for appt in rows
    ]


@router.get("/emergencies")
def debug_emergencies(
    db: Session = Depends(get_db),
    limit: int = Query(50, description="Maximum number of records"),
) -> List[Dict[str, Any]]:
    """
    List emergency logs.
    
    Args:
        limit: Maximum number of records to return
        
    Returns:
        List of emergency logs
    """
    stmt = (
        select(EmergencyLog)
        .order_by(EmergencyLog.created_at.desc())
        .limit(limit)
    )
    
    rows = db.scalars(stmt).all()
    return [
        {
            "id": log.id,
            "call_sid": log.call_sid,
            "caller_phone": log.caller_phone,
            "emergency_type": log.emergency_type,
            "description": log.description[:100] + "..." if len(log.description) > 100 else log.description,
            "was_transferred": log.was_transferred,
            "created_at": log.created_at.isoformat(),
            "resolved_at": log.resolved_at.isoformat() if log.resolved_at else None,
        }
        for log in rows
    ]


@router.get("/slots/{location_code}")
def debug_available_slots(
    location_code: str,
    db: Session = Depends(get_db),
    num_slots: int = Query(10, description="Number of slots to return"),
) -> Dict[str, Any]:
    """
    Get available appointment slots for a location.
    
    Args:
        location_code: Location code (e.g., DAL, FTW)
        num_slots: Number of slots to return
        
    Returns:
        Available slots
    """
    slots = get_next_available_slots(db, location_code, num_slots=num_slots)
    return {
        "location_code": location_code,
        "available_slots": slots,
        "count": len(slots),
    }


@router.post("/book")
def debug_create_booking(
    request: BookingRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a new booking (debug endpoint).
    
    Args:
        request: Booking details
        
    Returns:
        Booking result
    """
    result = create_booking(
        db=db,
        name=request.name,
        date_str=request.date,
        time_str=request.time,
        issue=request.issue,
        location_code=request.location_code,
        phone=request.phone,
    )
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    
    return result


@router.post("/reschedule")
def debug_reschedule_booking(
    request: RescheduleRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Reschedule a booking (debug endpoint).
    
    Args:
        request: Reschedule details
        
    Returns:
        Reschedule result
    """
    result = reschedule_booking(
        db=db,
        name=request.name,
        new_date=request.new_date,
        new_time=request.new_time,
        location_code=request.location_code,
    )
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    
    return result


@router.delete("/appointments/{appointment_id}")
def debug_cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Cancel an appointment by ID (debug endpoint).
    
    Args:
        appointment_id: Appointment ID to cancel
        
    Returns:
        Cancellation result
    """
    appt = db.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appt.is_cancelled = True
    db.commit()
    
    return {
        "status": "success",
        "message": f"Appointment {appointment_id} cancelled",
    }


@router.get("/stats")
def debug_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get system statistics.
    
    Returns:
        System statistics
    """
    from sqlalchemy import func
    from app.agents.state import call_state_store
    
    total_appointments = db.scalar(select(func.count()).select_from(Appointment)) or 0
    active_appointments = db.scalar(
        select(func.count())
        .select_from(Appointment)
        .where(Appointment.is_cancelled == False)
        .where(Appointment.date >= datetime.now().date())
    ) or 0
    total_emergencies = db.scalar(select(func.count()).select_from(EmergencyLog)) or 0
    total_locations = db.scalar(select(func.count()).select_from(Location)) or 0
    
    return {
        "total_appointments": total_appointments,
        "active_appointments": active_appointments,
        "total_emergencies": total_emergencies,
        "total_locations": total_locations,
        "active_calls": call_state_store.active_calls,
        "timestamp": datetime.utcnow().isoformat(),
    }
