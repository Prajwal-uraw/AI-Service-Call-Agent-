"""
Missed Call Handler
Automatically sends SMS when calls are missed
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from services.twilio_provisioner import TwilioProvisioningService

logger = logging.getLogger(__name__)

class MissedCallHandler:
    """
    Handles missed call detection and auto-response
    
    Features:
    - Detect missed calls from Twilio status
    - Send automatic SMS response
    - Log SMS sent
    - Configurable template per tenant
    """
    
    def __init__(self):
        self.default_template = (
            "Sorry we missed your call! We'll call you back during business hours "
            "(8am-6pm). - KC Comfort Air"
        )
    
    async def handle_missed_call(
        self,
        call_sid: str,
        caller_phone: str,
        called_number: str,
        tenant_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Handle missed call - send SMS and log
        
        Args:
            call_sid: Twilio call SID
            caller_phone: Caller's phone number
            called_number: Number they called
            tenant_config: Tenant configuration (optional)
            
        Returns:
            {
                "sms_sent": True,
                "sms_sid": "SM...",
                "message": "..."
            }
        """
        try:
            # Check if SMS is enabled for this tenant
            if tenant_config and not tenant_config.get("missed_call_sms_enabled", True):
                logger.info(f"Missed call SMS disabled for tenant, skipping: {call_sid}")
                return {"sms_sent": False, "reason": "disabled"}
            
            # Get template
            template = (
                tenant_config.get("missed_call_sms_template") 
                if tenant_config 
                else self.default_template
            )
            
            # Send SMS
            result = send_sms_twilio(caller_phone, template)
            
            if result.get("success"):
                logger.info(f"Missed call SMS sent for {call_sid} to {caller_phone}")
                
                # TODO: Update call_logs with sms_sent=True and sms_sid
                
                return {
                    "sms_sent": True,
                    "sms_sid": result.get("message_sid"),
                    "message": template,
                    "to": caller_phone
                }
            else:
                logger.error(f"Failed to send missed call SMS: {result.get('error')}")
                return {
                    "sms_sent": False,
                    "error": result.get("error")
                }
                
        except Exception as e:
            logger.error(f"Error handling missed call: {e}")
            return {
                "sms_sent": False,
                "error": str(e)
            }
    
    async def handle_after_hours_call(
        self,
        call_sid: str,
        caller_phone: str,
        tenant_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Handle after-hours call - send different message
        
        Args:
            call_sid: Twilio call SID
            caller_phone: Caller's phone number
            tenant_config: Tenant configuration
            
        Returns:
            SMS send result
        """
        try:
            # After-hours specific message
            message = (
                "Thanks for calling! We're currently closed. "
                "Our business hours are 8am-6pm Mon-Fri. "
                "We'll call you back when we open. - KC Comfort Air"
            )
            
            # Override with tenant template if exists
            if tenant_config and tenant_config.get("after_hours_sms_template"):
                message = tenant_config["after_hours_sms_template"]
            
            result = send_sms_twilio(caller_phone, message)
            
            if result.get("success"):
                logger.info(f"After-hours SMS sent for {call_sid} to {caller_phone}")
                return {
                    "sms_sent": True,
                    "sms_sid": result.get("message_sid"),
                    "message": message
                }
            else:
                return {
                    "sms_sent": False,
                    "error": result.get("error")
                }
                
        except Exception as e:
            logger.error(f"Error handling after-hours call: {e}")
            return {
                "sms_sent": False,
                "error": str(e)
            }
    
    def is_business_hours(self, hour: int, opening_hour: int = 8, closing_hour: int = 18) -> bool:
        """Check if current hour is within business hours"""
        return opening_hour <= hour < closing_hour


# Singleton instance
_missed_call_handler: Optional[MissedCallHandler] = None

def get_missed_call_handler() -> MissedCallHandler:
    """Get or create missed call handler instance"""
    global _missed_call_handler
    if _missed_call_handler is None:
        _missed_call_handler = MissedCallHandler()
    return _missed_call_handler
