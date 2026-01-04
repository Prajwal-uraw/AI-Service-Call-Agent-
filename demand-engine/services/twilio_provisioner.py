"""
Twilio Phone Number Provisioning Service
Automates phone number purchase and webhook configuration
"""

import os
from typing import List, Dict, Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from sqlalchemy.orm import Session
from app.models.db_models import Tenant

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
BASE_WEBHOOK_URL = os.getenv("BASE_WEBHOOK_URL", "https://api.kestrel.ai")


class TwilioProvisioningService:
    """Service for provisioning and managing Twilio phone numbers"""
    
    def __init__(self):
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            raise ValueError("Twilio credentials not configured")
        
        self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    def search_available_numbers(
        self,
        area_code: Optional[str] = None,
        country: str = "US",
        limit: int = 20
    ) -> List[Dict]:
        """
        Search for available phone numbers
        
        Args:
            area_code: Optional area code to filter by (e.g., "857")
            country: Country code (default: "US")
            limit: Maximum number of results
            
        Returns:
            List of available phone numbers with details
        """
        try:
            search_params = {
                "limit": limit,
                "voice_enabled": True,
                "sms_enabled": True
            }
            
            if area_code:
                search_params["area_code"] = area_code
            
            available_numbers = self.client.available_phone_numbers(country).local.list(**search_params)
            
            return [
                {
                    "phone_number": number.phone_number,
                    "friendly_name": number.friendly_name,
                    "locality": number.locality,
                    "region": number.region,
                    "postal_code": number.postal_code,
                    "capabilities": {
                        "voice": number.capabilities.get("voice", False),
                        "sms": number.capabilities.get("SMS", False),
                        "mms": number.capabilities.get("MMS", False)
                    }
                }
                for number in available_numbers
            ]
        
        except TwilioRestException as e:
            raise Exception(f"Twilio API error: {e.msg}")
    
    def purchase_phone_number(
        self,
        phone_number: str,
        tenant_slug: str,
        friendly_name: Optional[str] = None
    ) -> Dict:
        """
        Purchase a phone number and configure webhooks
        
        Args:
            phone_number: Phone number to purchase (E.164 format)
            tenant_slug: Tenant slug for webhook routing
            friendly_name: Optional friendly name for the number
            
        Returns:
            Purchased phone number details
        """
        try:
            # Configure webhook URLs
            voice_url = f"{BASE_WEBHOOK_URL}/api/voice/incoming?tenant={tenant_slug}"
            status_callback = f"{BASE_WEBHOOK_URL}/api/voice/status?tenant={tenant_slug}"
            sms_url = f"{BASE_WEBHOOK_URL}/api/sms/incoming?tenant={tenant_slug}"
            
            # Purchase the number
            incoming_phone_number = self.client.incoming_phone_numbers.create(
                phone_number=phone_number,
                friendly_name=friendly_name or f"Voice Agent - {tenant_slug}",
                voice_url=voice_url,
                voice_method="POST",
                status_callback=status_callback,
                status_callback_method="POST",
                sms_url=sms_url,
                sms_method="POST"
            )
            
            return {
                "sid": incoming_phone_number.sid,
                "phone_number": incoming_phone_number.phone_number,
                "friendly_name": incoming_phone_number.friendly_name,
                "voice_url": incoming_phone_number.voice_url,
                "status_callback": incoming_phone_number.status_callback,
                "sms_url": incoming_phone_number.sms_url,
                "date_created": incoming_phone_number.date_created.isoformat()
            }
        
        except TwilioRestException as e:
            raise Exception(f"Failed to purchase number: {e.msg}")
    
    def update_phone_webhooks(
        self,
        phone_number_sid: str,
        tenant_slug: str
    ) -> Dict:
        """
        Update webhook URLs for an existing phone number
        
        Args:
            phone_number_sid: Twilio phone number SID
            tenant_slug: Tenant slug for webhook routing
            
        Returns:
            Updated phone number details
        """
        try:
            voice_url = f"{BASE_WEBHOOK_URL}/api/voice/incoming?tenant={tenant_slug}"
            status_callback = f"{BASE_WEBHOOK_URL}/api/voice/status?tenant={tenant_slug}"
            sms_url = f"{BASE_WEBHOOK_URL}/api/sms/incoming?tenant={tenant_slug}"
            
            incoming_phone_number = self.client.incoming_phone_numbers(phone_number_sid).update(
                voice_url=voice_url,
                voice_method="POST",
                status_callback=status_callback,
                status_callback_method="POST",
                sms_url=sms_url,
                sms_method="POST"
            )
            
            return {
                "sid": incoming_phone_number.sid,
                "phone_number": incoming_phone_number.phone_number,
                "voice_url": incoming_phone_number.voice_url,
                "status_callback": incoming_phone_number.status_callback,
                "sms_url": incoming_phone_number.sms_url
            }
        
        except TwilioRestException as e:
            raise Exception(f"Failed to update webhooks: {e.msg}")
    
    def release_phone_number(self, phone_number_sid: str) -> bool:
        """
        Release (delete) a phone number
        
        Args:
            phone_number_sid: Twilio phone number SID
            
        Returns:
            True if successful
        """
        try:
            self.client.incoming_phone_numbers(phone_number_sid).delete()
            return True
        except TwilioRestException as e:
            raise Exception(f"Failed to release number: {e.msg}")
    
    def get_phone_number_details(self, phone_number_sid: str) -> Dict:
        """
        Get details for a phone number
        
        Args:
            phone_number_sid: Twilio phone number SID
            
        Returns:
            Phone number details
        """
        try:
            number = self.client.incoming_phone_numbers(phone_number_sid).fetch()
            
            return {
                "sid": number.sid,
                "phone_number": number.phone_number,
                "friendly_name": number.friendly_name,
                "voice_url": number.voice_url,
                "status_callback": number.status_callback,
                "sms_url": number.sms_url,
                "date_created": number.date_created.isoformat(),
                "date_updated": number.date_updated.isoformat()
            }
        except TwilioRestException as e:
            raise Exception(f"Failed to fetch number details: {e.msg}")
    
    def provision_for_tenant(
        self,
        db: Session,
        tenant_id: str,
        phone_number: Optional[str] = None,
        area_code: Optional[str] = None
    ) -> Dict:
        """
        Complete provisioning workflow for a tenant
        
        Args:
            db: Database session
            tenant_id: Tenant ID
            phone_number: Specific phone number to purchase (optional)
            area_code: Area code to search (optional, used if phone_number not provided)
            
        Returns:
            Provisioning result with phone number details
        """
        from app.models.db_models import Tenant
        
        # Get tenant
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise Exception("Tenant not found")
        
        # If phone number not provided, search for one
        if not phone_number:
            available = self.search_available_numbers(area_code=area_code, limit=1)
            if not available:
                raise Exception(f"No available numbers found for area code {area_code}")
            phone_number = available[0]["phone_number"]
        
        # Purchase and configure
        result = self.purchase_phone_number(
            phone_number=phone_number,
            tenant_slug=tenant.slug,
            friendly_name=f"{tenant.company_name} Voice Agent"
        )
        
        # Update tenant record
        tenant.twilio_phone_number = result["phone_number"]
        db.commit()
        
        return {
            "success": True,
            "tenant_id": tenant_id,
            "tenant_slug": tenant.slug,
            "phone_number": result["phone_number"],
            "phone_number_sid": result["sid"],
            "webhooks_configured": True,
            "voice_url": result["voice_url"],
            "status_callback": result["status_callback"]
        }
    
    def send_test_sms(self, from_number: str, to_number: str, message: str = None) -> Dict:
        """
        Send a test SMS to verify number is working
        
        Args:
            from_number: Twilio phone number
            to_number: Destination phone number
            message: Optional custom message
            
        Returns:
            Message details
        """
        try:
            if not message:
                message = "Test message from Kestrel AI Voice Agent. Your phone number is configured correctly!"
            
            message_obj = self.client.messages.create(
                body=message,
                from_=from_number,
                to=to_number
            )
            
            return {
                "sid": message_obj.sid,
                "status": message_obj.status,
                "to": message_obj.to,
                "from": message_obj.from_,
                "date_sent": message_obj.date_sent.isoformat() if message_obj.date_sent else None
            }
        except TwilioRestException as e:
            raise Exception(f"Failed to send test SMS: {e.msg}")


def get_provisioning_service() -> TwilioProvisioningService:
    """Get Twilio provisioning service instance"""
    return TwilioProvisioningService()
