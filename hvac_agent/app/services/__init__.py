# Convenience exports
from .db import get_db, SessionLocal, init_db  # noqa: F401
from .calendar_service import (  # noqa: F401
    list_locations,
    check_availability,
    create_booking,
    reschedule_booking,
    cancel_booking,
    get_next_available_slots,
)
from .emergency_service import (  # noqa: F401
    detect_emergency,
    log_emergency,
    get_emergency_contact,
    EMERGENCY_KEYWORDS,
)
from .hvac_knowledge import (  # noqa: F401
    get_hvac_insight,
    get_troubleshooting_tips,
    get_maintenance_schedule,
)
