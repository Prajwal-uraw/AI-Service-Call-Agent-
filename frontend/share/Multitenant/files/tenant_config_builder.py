"""
Dynamic Tenant Configuration Builder.

Builds tenant-specific AI prompts, voice settings, and business logic.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import pytz

from app.models.db_models import Tenant
from app.utils.logging import get_logger

logger = get_logger("tenant_config")


class TenantConfigBuilder:
    """
    Builds dynamic configuration for each tenant.
    
    Generates:
    - AI system prompts
    - Voice settings
    - Business hour rules
    - Emergency protocols
    - Qualification criteria
    """
    
    def __init__(self, tenant: Tenant):
        self.tenant = tenant
    
    def build_system_prompt(self) -> str:
        """
        Build complete AI system prompt for this tenant.
        
        Returns:
            Fully formatted system prompt
        """
        
        # Use display name if available, otherwise company name
        company_name = self.tenant.display_name or self.tenant.company_name
        
        # Base template
        base_template = f"""You are an AI receptionist for {company_name}, an HVAC service company.

COMPANY INFORMATION:
- Name: {company_name}
- Service Areas: {self._format_service_areas()}
- Business Hours: {self._format_business_hours()}
- Emergency Phone: {self.tenant.emergency_phone or self.tenant.forward_to_number}

YOUR ROLE:
You answer incoming calls professionally and efficiently. Your goal is to:
1. Greet callers warmly and professionally
2. Understand their HVAC needs
3. Detect emergencies and handle them immediately
4. Qualify leads before transferring to staff
5. Schedule appointments when appropriate
6. Provide basic HVAC tips and guidance

TONE:
- Professional yet friendly
- Empathetic and patient
- Calm and reassuring
- Efficient without being rushed

CALL FLOW:
1. Greeting: "{self._get_greeting()}"
2. Listen actively to caller's needs
3. Ask qualifying questions
4. Take appropriate action (schedule, transfer, or provide info)
5. Confirm next steps before ending call

{self._get_emergency_protocol()}

{self._get_qualification_criteria()}

{self._get_scheduling_rules()}

{self._get_custom_instructions()}
"""
        
        return base_template.strip()
    
    def _format_service_areas(self) -> str:
        """Format service areas for prompt."""
        areas = self.tenant.service_areas or []
        
        if not areas:
            return "the local area"
        elif len(areas) == 1:
            return areas[0]
        elif len(areas) == 2:
            return f"{areas[0]} and {areas[1]}"
        else:
            return ", ".join(areas[:-1]) + f", and {areas[-1]}"
    
    def _format_business_hours(self) -> str:
        """Format business hours for prompt."""
        hours = self.tenant.business_hours or {}
        
        if not hours:
            return "Monday-Friday 8:00 AM - 5:00 PM (default hours)"
        
        # Group consecutive days with same hours
        formatted_lines = []
        
        days_order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        
        for day in days_order:
            day_hours = hours.get(day, {})
            
            if day_hours.get('closed'):
                formatted_lines.append(f"{day.capitalize()}: Closed")
            elif day_hours.get('open') and day_hours.get('close'):
                formatted_lines.append(
                    f"{day.capitalize()}: {day_hours['open']} - {day_hours['close']}"
                )
        
        return "\n".join(formatted_lines) if formatted_lines else "Standard business hours"
    
    def _get_greeting(self) -> str:
        """Get custom greeting or default."""
        if self.tenant.greeting_message:
            return self.tenant.greeting_message
        
        company_name = self.tenant.display_name or self.tenant.company_name
        return f"Thank you for calling {company_name}. How can I help you today?"
    
    def _get_emergency_protocol(self) -> str:
        """Build emergency handling protocol."""
        
        emergency_keywords = self.tenant.emergency_keywords or [
            "gas leak", "smell gas", "carbon monoxide", "CO detector",
            "no heat", "freezing", "pipes frozen",
            "no AC", "overheating", "heat stroke",
            "electrical fire", "sparks", "smoke",
            "flooding", "water everywhere", "burst pipe"
        ]
        
        return f"""
EMERGENCY HANDLING:

Emergency Keywords: {', '.join(emergency_keywords)}

If caller mentions ANY emergency keyword or situation:
1. IMMEDIATELY acknowledge: "I understand this is an emergency."
2. Stay calm and reassuring
3. For life-threatening situations (gas leak, CO, fire):
   - Tell them to evacuate immediately
   - Call 911 first
   - Then call emergency line: {self.tenant.emergency_phone or self.tenant.forward_to_number}
4. For urgent non-life-threatening (no heat in winter, no AC in summer):
   - Assure help is coming
   - Transfer immediately to: {self.tenant.forward_to_number}
5. DO NOT ask qualifying questions during emergencies
6. Log emergency details for follow-up
"""
    
    def _get_qualification_criteria(self) -> str:
        """Build call qualification criteria."""
        
        # Use custom criteria if provided
        custom_criteria = self.tenant.qualification_criteria or {}
        
        if custom_criteria.get('custom_rules'):
            return f"QUALIFICATION CRITERIA:\n{custom_criteria['custom_rules']}"
        
        # Default qualification criteria
        return """
CALL QUALIFICATION:

HIGH PRIORITY (Transfer Immediately):
- Emergency situations (see emergency keywords)
- Existing customers with service contracts
- Commercial clients
- Referrals from partners
- Callback requests

MEDIUM PRIORITY (Qualify Then Schedule):
- New residential customers
- Service repairs needed
- Maintenance requests
- System not working properly

LOW PRIORITY (Take Message or Provide Info):
- General information requests
- Pricing inquiries (quote needed)
- DIY troubleshooting questions
- Service area verification

REJECT POLITELY:
- Sales/vendor calls
- Spam/marketing
- Outside service area
- Not HVAC related
"""
    
    def _get_scheduling_rules(self) -> str:
        """Build appointment scheduling rules."""
        
        return """
APPOINTMENT SCHEDULING:

When to Schedule:
- Customer requests appointment
- Service call needed
- Maintenance visit requested
- Follow-up appointment needed

Information to Collect:
1. Customer name
2. Phone number
3. Service address
4. Issue description
5. Preferred date/time
6. Urgency level

Available Time Slots:
- Use tool_get_next_slots to check availability
- Offer 2-3 options if preferred time unavailable
- Default to next business day for urgent issues

Confirmation:
- Repeat appointment details
- Confirm customer contact info
- Mention any preparation needed
"""
    
    def _get_custom_instructions(self) -> str:
        """Include any custom tenant instructions."""
        
        if self.tenant.custom_system_prompt:
            return f"""
CUSTOM INSTRUCTIONS FROM {self.tenant.company_name.upper()}:

{self.tenant.custom_system_prompt}
"""
        
        return ""
    
    def get_voice_config(self) -> Dict[str, Any]:
        """
        Get voice configuration for this tenant.
        
        Returns:
            Voice settings dict
        """
        
        config = {
            "model": self.tenant.ai_model,
            "temperature": float(self.tenant.ai_temperature),
        }
        
        # OpenAI voice or ElevenLabs
        if self.tenant.use_elevenlabs and self.tenant.elevenlabs_voice_id:
            config["provider"] = "elevenlabs"
            config["voice_id"] = self.tenant.elevenlabs_voice_id
        else:
            config["provider"] = "openai"
            config["voice"] = self.tenant.ai_voice
        
        return config
    
    def get_business_hours_config(self) -> Dict[str, Any]:
        """
        Get parsed business hours configuration.
        
        Returns:
            Business hours dict with parsed times
        """
        
        return {
            "timezone": self.tenant.timezone,
            "hours": self.tenant.business_hours or {},
        }
    
    def is_business_hours_now(self) -> bool:
        """
        Check if current time is within business hours.
        
        Returns:
            True if open, False if closed
        """
        
        try:
            # Get current time in tenant's timezone
            tz = pytz.timezone(self.tenant.timezone)
            now = datetime.now(tz)
            
            day_name = now.strftime('%A').lower()
            hours = self.tenant.business_hours or {}
            
            day_hours = hours.get(day_name, {})
            
            if day_hours.get('closed'):
                return False
            
            if not day_hours.get('open') or not day_hours.get('close'):
                # Default to 8am-6pm if not specified
                return 8 <= now.hour < 18
            
            # Parse time strings (e.g., "08:00")
            open_time = datetime.strptime(day_hours['open'], '%H:%M').time()
            close_time = datetime.strptime(day_hours['close'], '%H:%M').time()
            current_time = now.time()
            
            return open_time <= current_time < close_time
        
        except Exception as e:
            logger.error("Error checking business hours: %s", str(e))
            # Default to open during typical hours
            return 8 <= datetime.now().hour < 18
    
    def get_features(self) -> Dict[str, bool]:
        """
        Get enabled features for this tenant.
        
        Returns:
            Feature flags dict
        """
        
        default_features = {
            "enable_scheduling": True,
            "enable_emergency_detection": True,
            "enable_call_transfer": True,
            "enable_voicemail": True,
            "enable_sms_notifications": False,
            "enable_email_notifications": False,
        }
        
        # Merge with tenant-specific features
        tenant_features = self.tenant.features or {}
        default_features.update(tenant_features)
        
        return default_features
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Export full configuration as dictionary.
        
        Useful for caching or API responses.
        """
        
        return {
            "tenant_id": self.tenant.id,
            "company_name": self.tenant.company_name,
            "display_name": self.tenant.display_name,
            "system_prompt": self.build_system_prompt(),
            "voice_config": self.get_voice_config(),
            "business_hours": self.get_business_hours_config(),
            "is_business_hours": self.is_business_hours_now(),
            "features": self.get_features(),
            "forward_number": self.tenant.forward_to_number,
            "emergency_phone": self.tenant.emergency_phone,
        }


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def build_tenant_config(tenant: Tenant) -> TenantConfigBuilder:
    """
    Factory function to create tenant config builder.
    
    Args:
        tenant: Tenant object
    
    Returns:
        TenantConfigBuilder instance
    """
    return TenantConfigBuilder(tenant)
