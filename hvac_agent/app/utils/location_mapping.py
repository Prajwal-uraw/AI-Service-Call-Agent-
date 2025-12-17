"""
Location mapping for DFW area cities to service areas.

Maps nearby cities to their closest service area for efficient routing.
"""

from typing import Optional, Dict

# Map of cities to their service areas
CITY_TO_SERVICE_AREA: Dict[str, str] = {
    # Dallas service area
    "dallas": "DAL",
    "irving": "DAL",
    "garland": "DAL",
    "mesquite": "DAL",
    "richardson": "DAL",
    "carrollton": "DAL",
    "plano": "DAL",  # North Dallas
    "addison": "DAL",
    "farmers branch": "DAL",
    "university park": "DAL",
    "highland park": "DAL",
    "duncanville": "DAL",
    "desoto": "DAL",
    "cedar hill": "DAL",
    "lancaster": "DAL",
    "balch springs": "DAL",
    "sachse": "DAL",
    "rowlett": "DAL",
    "rockwall": "DAL",  # East of Dallas

    # Fort Worth service area
    "fort worth": "FTW",
    "fortworth": "FTW",
    "ft worth": "FTW",
    "euless": "FTW",  # IMPORTANT: User reported this wasn't recognized
    "bedford": "FTW",
    "hurst": "FTW",
    "colleyville": "FTW",
    "grapevine": "FTW",
    "southlake": "FTW",
    "keller": "FTW",
    "north richland hills": "FTW",
    "nrh": "FTW",
    "richland hills": "FTW",
    "haltom city": "FTW",
    "watauga": "FTW",
    "saginaw": "FTW",
    "river oaks": "FTW",
    "white settlement": "FTW",
    "benbrook": "FTW",
    "crowley": "FTW",
    "burleson": "FTW",
    "mansfield": "FTW",  # South Fort Worth
    "kennedale": "FTW",
    "forest hill": "FTW",
    "everman": "FTW",
    "
": "FTW",
    "azle": "FTW",
    "weatherford": "FTW",  # West of Fort Worth

    # Arlington service area
    "arlington": "ARL",
    "grand prairie": "ARL",
    "pantego": "ARL",
    "dalworthington gardens": "ARL",
    "cedar hill": "ARL",  # Between Dallas and Arlington
}


def map_city_to_service_area(city_input: str) -> Optional[str]:
    """
    Map a city name to its service area code.

    Args:
        city_input: City name from user (case-insensitive)

    Returns:
        Service area code (DAL, FTW, ARL) or None if not found

    Examples:
        >>> map_city_to_service_area("Euless")
        'FTW'
        >>> map_city_to_service_area("dallas")
        'DAL'
        >>> map_city_to_service_area("Houston")
        None
    """
    if not city_input:
        return None

    # Normalize input: lowercase, trim whitespace
    city_normalized = city_input.lower().strip()

    # Direct lookup
    return CITY_TO_SERVICE_AREA.get(city_normalized)


def get_service_area_name(area_code: str) -> str:
    """
    Get the full name of a service area from its code.

    Args:
        area_code: Service area code (DAL, FTW, ARL)

    Returns:
        Full service area name
    """
    area_names = {
        "DAL": "Dallas",
        "FTW": "Fort Worth",
        "ARL": "Arlington",
    }
    return area_names.get(area_code, area_code)


def is_serviced_city(city_input: str) -> bool:
    """
    Check if we service a given city.

    Args:
        city_input: City name to check

    Returns:
        True if we service that city, False otherwise
    """
    return map_city_to_service_area(city_input) is not None


def get_all_serviced_cities() -> list[str]:
    """Get list of all cities we service."""
    return sorted(CITY_TO_SERVICE_AREA.keys())


def get_cities_by_area(area_code: str) -> list[str]:
    """
    Get all cities served by a specific service area.

    Args:
        area_code: Service area code (DAL, FTW, ARL)

    Returns:
        List of city names in that service area
    """
    return sorted([
        city for city, code in CITY_TO_SERVICE_AREA.items()
        if code == area_code
    ])
