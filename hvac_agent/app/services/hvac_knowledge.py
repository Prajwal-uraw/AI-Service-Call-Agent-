"""
HVAC Knowledge Base Service.

Provides:
- General HVAC insights and tips
- Troubleshooting guidance
- Maintenance schedules
- Energy efficiency tips
- Common issue explanations

NOTE: This provides general information only, not professional advice.
Always recommend professional service for actual repairs.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime

from app.utils.logging import get_logger

logger = get_logger("hvac_knowledge")


# Common HVAC issues and general information
HVAC_INSIGHTS: Dict[str, Dict[str, Any]] = {
    "ac_not_cooling": {
        "title": "AC Not Cooling Properly",
        "possible_causes": [
            "Dirty air filter restricting airflow",
            "Thermostat settings or batteries",
            "Frozen evaporator coils",
            "Low refrigerant levels",
            "Dirty condenser coils outside",
            "Blocked vents or registers"
        ],
        "diy_checks": [
            "Check and replace air filter if dirty",
            "Verify thermostat is set to 'cool' and temperature is below room temp",
            "Make sure all vents are open and unobstructed",
            "Check if outdoor unit is running and clear of debris"
        ],
        "when_to_call": "If the issue persists after basic checks, or if you notice ice on the unit, strange noises, or no airflow at all."
    },
    "heater_not_working": {
        "title": "Heater Not Working",
        "possible_causes": [
            "Thermostat issues or dead batteries",
            "Tripped circuit breaker",
            "Dirty air filter",
            "Pilot light out (gas furnaces)",
            "Ignition problems",
            "Blower motor issues"
        ],
        "diy_checks": [
            "Check thermostat settings and batteries",
            "Check circuit breaker - reset if tripped",
            "Replace air filter if dirty",
            "For gas furnaces, check if pilot light is lit (if visible)"
        ],
        "when_to_call": "If you smell gas, hear unusual noises, or the system won't start after basic checks."
    },
    "strange_noises": {
        "title": "Strange HVAC Noises",
        "noise_types": {
            "banging": "Could indicate loose or broken parts, or compressor issues",
            "squealing": "Often belt or motor bearing problems",
            "rattling": "Loose panels, screws, or debris in the system",
            "clicking": "Normal at startup, but constant clicking may indicate relay issues",
            "humming": "Could be electrical issues or a failing motor",
            "buzzing": "Often electrical problems or refrigerant leaks"
        },
        "when_to_call": "Most unusual noises warrant professional inspection to prevent further damage."
    },
    "high_energy_bills": {
        "title": "High Energy Bills",
        "possible_causes": [
            "Inefficient or aging HVAC system",
            "Poor insulation or air leaks",
            "Dirty filters reducing efficiency",
            "Thermostat issues",
            "Ductwork leaks",
            "System running constantly"
        ],
        "efficiency_tips": [
            "Replace filters monthly during heavy use",
            "Seal air leaks around windows and doors",
            "Use a programmable thermostat",
            "Schedule annual maintenance",
            "Consider upgrading to a high-efficiency system"
        ]
    },
    "thermostat_issues": {
        "title": "Thermostat Problems",
        "common_issues": [
            "Dead batteries",
            "Incorrect settings",
            "Dirty sensors",
            "Poor location (near heat sources)",
            "Wiring problems",
            "Calibration issues"
        ],
        "diy_checks": [
            "Replace batteries",
            "Clean the thermostat gently",
            "Verify settings are correct",
            "Check that it's level on the wall"
        ]
    },
    "air_quality": {
        "title": "Indoor Air Quality",
        "improvement_tips": [
            "Change filters regularly (every 1-3 months)",
            "Consider upgrading to HEPA filters",
            "Have ducts cleaned every 3-5 years",
            "Use a whole-home humidifier or dehumidifier",
            "Consider UV air purifiers",
            "Ensure proper ventilation"
        ],
        "signs_of_poor_quality": [
            "Excessive dust",
            "Musty or stale odors",
            "Allergy symptoms indoors",
            "Humidity issues",
            "Visible mold"
        ]
    }
}


# Maintenance schedule recommendations
MAINTENANCE_SCHEDULE: Dict[str, Dict[str, Any]] = {
    "monthly": {
        "tasks": [
            "Check and replace air filter if needed",
            "Clear area around outdoor unit",
            "Check thermostat operation"
        ],
        "importance": "Prevents efficiency loss and extends system life"
    },
    "seasonal_spring": {
        "tasks": [
            "Schedule professional AC tune-up",
            "Clean outdoor condenser coils",
            "Check refrigerant levels",
            "Test AC operation before hot weather",
            "Clear drain lines"
        ],
        "importance": "Prepares cooling system for summer demand"
    },
    "seasonal_fall": {
        "tasks": [
            "Schedule professional heating tune-up",
            "Check furnace/heat pump operation",
            "Inspect heat exchanger",
            "Test carbon monoxide detectors",
            "Check gas connections (if applicable)"
        ],
        "importance": "Ensures safe and efficient heating for winter"
    },
    "annual": {
        "tasks": [
            "Professional system inspection",
            "Duct inspection and cleaning (every 3-5 years)",
            "Check electrical connections",
            "Lubricate moving parts",
            "Calibrate thermostat",
            "Check system efficiency"
        ],
        "importance": "Maintains warranty, prevents breakdowns, ensures safety"
    }
}


def get_hvac_insight(topic: str) -> Dict[str, Any]:
    """
    Get HVAC insight for a specific topic.
    
    Args:
        topic: Topic to get insight about
        
    Returns:
        Insight dictionary with relevant information
    """
    # Normalize topic
    topic_lower = topic.lower().replace(" ", "_").replace("-", "_")
    
    # Direct match
    if topic_lower in HVAC_INSIGHTS:
        return HVAC_INSIGHTS[topic_lower]
    
    # Keyword matching
    keyword_map = {
        "ac": "ac_not_cooling",
        "cooling": "ac_not_cooling",
        "air conditioning": "ac_not_cooling",
        "heat": "heater_not_working",
        "furnace": "heater_not_working",
        "heating": "heater_not_working",
        "noise": "strange_noises",
        "sound": "strange_noises",
        "bill": "high_energy_bills",
        "energy": "high_energy_bills",
        "thermostat": "thermostat_issues",
        "temperature": "thermostat_issues",
        "air quality": "air_quality",
        "dust": "air_quality",
        "smell": "air_quality",
    }
    
    for keyword, insight_key in keyword_map.items():
        if keyword in topic_lower:
            return HVAC_INSIGHTS[insight_key]
    
    # Default response
    return {
        "title": "General HVAC Information",
        "message": "I can provide general information about AC issues, heating problems, strange noises, energy efficiency, thermostat issues, and air quality. What would you like to know more about?",
        "available_topics": list(HVAC_INSIGHTS.keys())
    }


def get_troubleshooting_tips(issue: str) -> List[str]:
    """
    Get troubleshooting tips for a specific issue.
    
    Args:
        issue: Description of the issue
        
    Returns:
        List of troubleshooting tips
    """
    issue_lower = issue.lower()
    
    tips = []
    
    # AC issues
    if any(kw in issue_lower for kw in ["ac", "cooling", "cold", "air condition"]):
        tips = [
            "First, check your air filter - a dirty filter is the most common cause of AC problems",
            "Make sure your thermostat is set to 'cool' and the temperature is set lower than the room temperature",
            "Check that all vents are open and not blocked by furniture",
            "Look at your outdoor unit - make sure it's running and clear of debris",
            "If you see ice on the unit, turn it off and let it thaw before calling for service"
        ]
    
    # Heating issues
    elif any(kw in issue_lower for kw in ["heat", "furnace", "warm", "cold house"]):
        tips = [
            "Check your thermostat - make sure it's set to 'heat' and the temperature is above room temp",
            "Replace the batteries in your thermostat if it's battery-powered",
            "Check your circuit breaker - reset it if it's tripped",
            "Replace your air filter if it's dirty",
            "For gas furnaces, make sure the gas valve is in the 'on' position"
        ]
    
    # Noise issues
    elif any(kw in issue_lower for kw in ["noise", "sound", "loud", "bang", "squeal"]):
        tips = [
            "Turn off your system to prevent potential damage",
            "Check for loose panels or screws on the unit",
            "Look for debris around the outdoor unit",
            "Note when the noise occurs - at startup, during operation, or at shutdown",
            "Most unusual noises should be inspected by a professional"
        ]
    
    # Default tips
    else:
        tips = [
            "Check and replace your air filter if needed",
            "Verify your thermostat settings are correct",
            "Make sure all vents are open and unobstructed",
            "Check your circuit breaker",
            "If the problem persists, schedule a professional inspection"
        ]
    
    return tips


def get_maintenance_schedule(season: Optional[str] = None) -> Dict[str, Any]:
    """
    Get maintenance schedule recommendations.
    
    Args:
        season: Optional specific season to get schedule for
        
    Returns:
        Maintenance schedule information
    """
    if season:
        season_lower = season.lower()
        if "spring" in season_lower or "summer" in season_lower:
            return {
                "current_season": "Spring/Summer",
                "focus": "Air Conditioning",
                **MAINTENANCE_SCHEDULE["seasonal_spring"],
                "monthly": MAINTENANCE_SCHEDULE["monthly"]
            }
        elif "fall" in season_lower or "winter" in season_lower:
            return {
                "current_season": "Fall/Winter",
                "focus": "Heating",
                **MAINTENANCE_SCHEDULE["seasonal_fall"],
                "monthly": MAINTENANCE_SCHEDULE["monthly"]
            }
    
    # Determine current season based on month
    month = datetime.now().month
    if month in [3, 4, 5, 6, 7, 8]:  # March - August
        current = "seasonal_spring"
        focus = "Air Conditioning"
    else:
        current = "seasonal_fall"
        focus = "Heating"
    
    return {
        "current_focus": focus,
        "seasonal_tasks": MAINTENANCE_SCHEDULE[current],
        "monthly_tasks": MAINTENANCE_SCHEDULE["monthly"],
        "annual_tasks": MAINTENANCE_SCHEDULE["annual"]
    }


def get_energy_saving_tips() -> List[str]:
    """Get energy saving tips for HVAC systems."""
    return [
        "Set your thermostat to 78°F in summer and 68°F in winter when home",
        "Use a programmable or smart thermostat to adjust temperatures when away",
        "Change air filters monthly during heavy use seasons",
        "Seal air leaks around windows, doors, and ductwork",
        "Keep vents clear and unobstructed",
        "Schedule annual professional maintenance",
        "Use ceiling fans to help circulate air",
        "Close blinds during hot summer days",
        "Consider upgrading to a high-efficiency system if yours is over 10-15 years old",
        "Ensure your home is properly insulated"
    ]


def format_insight_for_voice(insight: Dict[str, Any]) -> str:
    """
    Format an insight dictionary for voice response.
    
    Args:
        insight: Insight dictionary
        
    Returns:
        Voice-friendly string
    """
    parts = []
    
    if "title" in insight:
        parts.append(f"Here's some information about {insight['title']}.")
    
    if "possible_causes" in insight:
        causes = insight["possible_causes"][:3]  # Limit for voice
        parts.append(f"Common causes include: {', '.join(causes)}.")
    
    if "diy_checks" in insight:
        checks = insight["diy_checks"][:2]  # Limit for voice
        parts.append(f"You can try: {'. '.join(checks)}.")
    
    if "when_to_call" in insight:
        parts.append(insight["when_to_call"])
    
    if not parts:
        parts.append("I can provide general HVAC information. Would you like tips on a specific issue?")
    
    return " ".join(parts)
