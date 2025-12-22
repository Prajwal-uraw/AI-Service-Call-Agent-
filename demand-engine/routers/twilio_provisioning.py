"""
Twilio Phone Number Provisioning API
Handles: Search, Purchase, Configure webhooks
Strategy: Buy new (default), Forward existing (fallback), Port-in (concierge)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from twilio.rest import Client

router = APIRouter(prefix="/api/twilio", tags=["Twilio Provisioning"])

# Master Twilio account (one account for all tenants)
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
VOICE_WEBHOOK_URL = os.getenv("VOICE_WEBHOOK_URL", "https://your-domain.com/twilio/voice")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID else None


class NumberSearchRequest(BaseModel):
    area_code: Optional[str] = None
    contains: Optional[str] = None
    country: str = "US"
    limit: int = 10


class NumberPurchaseRequest(BaseModel):
    phone_number: str
    tenant_id: str
    friendly_name: Optional[str] = None


class CallForwardingSetup(BaseModel):
    tenant_id: str
    existing_number: str
    forward_to_number: str


class PortInRequest(BaseModel):
    tenant_id: str
    phone_number: str
    carrier: str
    account_number: str
    pin: Optional[str] = None
    notes: Optional[str] = None


@router.post("/search-numbers")
async def search_available_numbers(request: NumberSearchRequest):
    """
    Search available phone numbers from Twilio
    Path A: Buy new number (fastest, default)
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Search for available numbers
        search_params = {
            "country": request.country,
            "limit": request.limit
        }
        
        if request.area_code:
            search_params["area_code"] = request.area_code
        
        if request.contains:
            search_params["contains"] = request.contains
        
        available_numbers = client.available_phone_numbers(request.country).local.list(**search_params)
        
        # Format response
        numbers = [
            {
                "phone_number": num.phone_number,
                "friendly_name": num.friendly_name,
                "locality": num.locality,
                "region": num.region,
                "postal_code": num.postal_code,
                "capabilities": {
                    "voice": num.capabilities.get("voice", False),
                    "sms": num.capabilities.get("SMS", False),
                    "mms": num.capabilities.get("MMS", False)
                }
            }
            for num in available_numbers
        ]
        
        return {
            "success": True,
            "count": len(numbers),
            "numbers": numbers
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/purchase-number")
async def purchase_phone_number(request: NumberPurchaseRequest):
    """
    Purchase phone number and configure webhook
    Auto-attaches to tenant
    Live in <2 minutes
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Purchase the number
        incoming_phone_number = client.incoming_phone_numbers.create(
            phone_number=request.phone_number,
            friendly_name=request.friendly_name or f"Tenant {request.tenant_id}",
            voice_url=f"{VOICE_WEBHOOK_URL}?tenant_id={request.tenant_id}",
            voice_method="POST",
            status_callback=f"{VOICE_WEBHOOK_URL}/status",
            status_callback_method="POST"
        )
        
        # TODO: Save to database
        # tenant = db.query(Tenant).filter(Tenant.id == request.tenant_id).first()
        # tenant.twilio_phone_number = request.phone_number
        # tenant.twilio_sid = incoming_phone_number.sid
        # db.commit()
        
        return {
            "success": True,
            "phone_number": incoming_phone_number.phone_number,
            "sid": incoming_phone_number.sid,
            "friendly_name": incoming_phone_number.friendly_name,
            "webhook_url": incoming_phone_number.voice_url,
            "message": "Number purchased and configured. Live now!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")


@router.post("/setup-forwarding")
async def setup_call_forwarding(request: CallForwardingSetup):
    """
    Path B: Use existing number via call forwarding
    Zero risk, highest conversion for enterprise
    """
    
    # Generate a Twilio number for them to forward to
    try:
        # Search for a number in their area code (extract from existing number)
        area_code = request.existing_number[2:5] if len(request.existing_number) >= 5 else None
        
        search_result = await search_available_numbers(
            NumberSearchRequest(area_code=area_code, limit=1)
        )
        
        if not search_result["numbers"]:
            raise HTTPException(status_code=404, detail="No numbers available in your area")
        
        forward_to = search_result["numbers"][0]["phone_number"]
        
        # Purchase it
        purchase_result = await purchase_phone_number(
            NumberPurchaseRequest(
                phone_number=forward_to,
                tenant_id=request.tenant_id,
                friendly_name=f"Forward from {request.existing_number}"
            )
        )
        
        # Generate forwarding instructions
        instructions = generate_forwarding_instructions(
            request.existing_number,
            forward_to
        )
        
        return {
            "success": True,
            "forward_to_number": forward_to,
            "existing_number": request.existing_number,
            "instructions": instructions,
            "message": "Forward your calls to this number to activate AI"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Setup failed: {str(e)}")


@router.post("/request-port-in")
async def request_port_in(request: PortInRequest):
    """
    Path C: Full number port-in (7-21 days)
    Concierge-only, post-payment
    Creates support ticket for manual processing
    """
    
    # TODO: Create support ticket in database
    # ticket = SupportTicket(
    #     tenant_id=request.tenant_id,
    #     type="port_in_request",
    #     phone_number=request.phone_number,
    #     carrier=request.carrier,
    #     account_number=request.account_number,
    #     pin=request.pin,
    #     notes=request.notes,
    #     status="pending"
    # )
    # db.add(ticket)
    # db.commit()
    
    # TODO: Send notification to ops team
    
    return {
        "success": True,
        "message": "Port-in request submitted. Our team will contact you within 24 hours.",
        "estimated_time": "7-21 business days",
        "next_steps": [
            "Our team will verify your account details",
            "We'll submit the port request to your carrier",
            "You'll receive updates via email",
            "Your number will transfer with zero downtime"
        ]
    }


@router.get("/number-status/{phone_number}")
async def get_number_status(phone_number: str):
    """
    Check status of a phone number
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    try:
        # Find the number in Twilio account
        numbers = client.incoming_phone_numbers.list(phone_number=phone_number)
        
        if not numbers:
            return {
                "exists": False,
                "message": "Number not found in account"
            }
        
        number = numbers[0]
        
        return {
            "exists": True,
            "phone_number": number.phone_number,
            "friendly_name": number.friendly_name,
            "voice_url": number.voice_url,
            "status": "active",
            "capabilities": {
                "voice": number.capabilities.get("voice", False),
                "sms": number.capabilities.get("sms", False)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")


def generate_forwarding_instructions(from_number: str, to_number: str) -> dict:
    """
    Generate carrier-specific forwarding instructions
    """
    return {
        "att": {
            "name": "AT&T",
            "steps": [
                f"Dial *72 from {from_number}",
                f"Enter {to_number} when prompted",
                "Press # to confirm",
                "Wait for confirmation tone"
            ]
        },
        "verizon": {
            "name": "Verizon",
            "steps": [
                f"Dial *72 from {from_number}",
                f"Enter {to_number}",
                "Press Send",
                "Wait for confirmation"
            ]
        },
        "tmobile": {
            "name": "T-Mobile",
            "steps": [
                f"Dial **21*{to_number}# from {from_number}",
                "Press Send",
                "Wait for confirmation message"
            ]
        },
        "generic": {
            "name": "Other Carriers",
            "steps": [
                "Call your carrier's customer service",
                f"Request call forwarding to {to_number}",
                "Provide your account details",
                "Confirm activation"
            ]
        }
    }


# Pre-buy popular numbers (insider tip)
@router.post("/admin/prebuy-numbers")
async def prebuy_popular_numbers(area_codes: List[str], count_per_area: int = 5):
    """
    Admin endpoint: Pre-buy numbers in popular area codes
    Assign instantly on signup = magical UX
    """
    if not client:
        raise HTTPException(status_code=500, detail="Twilio not configured")
    
    purchased = []
    
    for area_code in area_codes:
        try:
            # Search numbers
            available = client.available_phone_numbers("US").local.list(
                area_code=area_code,
                limit=count_per_area
            )
            
            # Purchase each
            for num in available:
                try:
                    purchased_num = client.incoming_phone_numbers.create(
                        phone_number=num.phone_number,
                        friendly_name=f"Pool - {area_code}",
                        voice_url=f"{VOICE_WEBHOOK_URL}/unassigned"
                    )
                    
                    purchased.append({
                        "phone_number": purchased_num.phone_number,
                        "area_code": area_code,
                        "sid": purchased_num.sid
                    })
                    
                except Exception as e:
                    print(f"Failed to purchase {num.phone_number}: {e}")
                    
        except Exception as e:
            print(f"Failed to search area code {area_code}: {e}")
    
    return {
        "success": True,
        "purchased_count": len(purchased),
        "numbers": purchased
    }
