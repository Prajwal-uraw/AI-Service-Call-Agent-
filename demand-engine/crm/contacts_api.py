"""
CRM Contacts API
Manage contacts and company information
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.supabase_config import get_supabase

router = APIRouter(prefix="/api/crm/contacts", tags=["CRM - Contacts"])

# Models
class ContactCreate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    mobile: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    linkedin_url: Optional[str] = None
    website: Optional[str] = None
    preferred_contact_method: str = "email"
    timezone: Optional[str] = None
    lead_id: Optional[str] = None
    is_primary: bool = False
    email_subscribed: bool = True
    sms_subscribed: bool = False
    tags: List[str] = []
    notes: Optional[str] = None

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    linkedin_url: Optional[str] = None
    website: Optional[str] = None
    preferred_contact_method: Optional[str] = None
    timezone: Optional[str] = None
    is_primary: Optional[bool] = None
    email_subscribed: Optional[bool] = None
    sms_subscribed: Optional[bool] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


@router.get("/")
async def get_contacts(
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None,
    company: Optional[str] = None,
    email_subscribed: Optional[bool] = None
):
    """Get all contacts with filtering from both contacts and business_contacts tables"""
    try:
        supabase = get_supabase()
        all_contacts = []
        total_count = 0
        
        # Try to get from contacts table first
        try:
            query = supabase.table("contacts").select("*")
            
            if search:
                query = query.or_(f"first_name.ilike.%{search}%,last_name.ilike.%{search}%,email.ilike.%{search}%,company_name.ilike.%{search}%")
            
            if company:
                query = query.ilike("company_name", f"%{company}%")
            
            if email_subscribed is not None:
                query = query.eq("email_subscribed", email_subscribed)
            
            response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            all_contacts.extend(response.data or [])
            
            count_response = supabase.table("contacts").select("id", count="exact").execute()
            total_count += count_response.count or 0
        except Exception as e:
            print(f"Error fetching from contacts table: {e}")
        
        # Also get from business_contacts table
        try:
            query = supabase.table("business_contacts").select("*")
            
            if search:
                query = query.or_(f"business_name.ilike.%{search}%,email.ilike.%{search}%,phone.ilike.%{search}%")
            
            if company:
                query = query.ilike("business_name", f"%{company}%")
            
            response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            # Transform business_contacts to match contacts format
            for bc in response.data or []:
                all_contacts.append({
                    "id": bc.get("id"),
                    "first_name": bc.get("business_name", "").split()[0] if bc.get("business_name") else None,
                    "last_name": " ".join(bc.get("business_name", "").split()[1:]) if bc.get("business_name") else None,
                    "email": bc.get("email"),
                    "phone": bc.get("phone"),
                    "company_name": bc.get("business_name"),
                    "address": bc.get("address"),
                    "city": bc.get("city"),
                    "state": bc.get("state"),
                    "zip_code": bc.get("zip_code"),
                    "website": bc.get("website"),
                    "created_at": bc.get("created_at"),
                    "source": "business_contacts",
                    "signal_id": bc.get("signal_id"),
                    "notes": bc.get("notes")
                })
            
            count_response = supabase.table("business_contacts").select("id", count="exact").execute()
            total_count += count_response.count or 0
        except Exception as e:
            print(f"Error fetching from business_contacts table: {e}")
        
        # Sort by created_at and apply pagination
        all_contacts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {
            "contacts": all_contacts[:limit],
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{contact_id}")
async def get_contact(contact_id: str):
    """Get single contact by ID"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("contacts").select("*").eq("id", contact_id).is_("deleted_at", None).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Contact not found")
        
        return response.data
        
    except Exception as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Contact not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_contact(contact: ContactCreate):
    """Create new contact"""
    try:
        supabase = get_supabase()
        
        contact_data = contact.dict()
        
        response = supabase.table("contacts").insert(contact_data).execute()
        
        return {
            "success": True,
            "contact": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{contact_id}")
async def update_contact(contact_id: str, contact: ContactUpdate):
    """Update contact"""
    try:
        supabase = get_supabase()
        
        update_data = {k: v for k, v in contact.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table("contacts").update(update_data).eq("id", contact_id).execute()
        
        return {
            "success": True,
            "contact": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{contact_id}")
async def delete_contact(contact_id: str, hard_delete: bool = False):
    """Delete contact (soft delete by default)"""
    try:
        supabase = get_supabase()
        
        if hard_delete:
            response = supabase.table("contacts").delete().eq("id", contact_id).execute()
        else:
            response = supabase.table("contacts").update({
                "deleted_at": datetime.now().isoformat()
            }).eq("id", contact_id).execute()
        
        return {"success": True, "message": "Contact deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{contact_id}/unsubscribe")
async def unsubscribe_contact(contact_id: str, unsubscribe_type: str = "email"):
    """Unsubscribe contact from emails or SMS"""
    try:
        supabase = get_supabase()
        
        update_data = {}
        if unsubscribe_type == "email":
            update_data["email_subscribed"] = False
        elif unsubscribe_type == "sms":
            update_data["sms_subscribed"] = False
        else:
            raise HTTPException(status_code=400, detail="Invalid unsubscribe type")
        
        response = supabase.table("contacts").update(update_data).eq("id", contact_id).execute()
        
        return {"success": True, "message": f"Contact unsubscribed from {unsubscribe_type}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead/{lead_id}")
async def get_contacts_by_lead(lead_id: str):
    """Get all contacts for a specific lead"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("contacts").select("*").eq("lead_id", lead_id).is_("deleted_at", None).execute()
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/company/{company_name}")
async def get_contacts_by_company(company_name: str):
    """Get all contacts for a specific company"""
    try:
        supabase = get_supabase()
        
        response = supabase.table("contacts").select("*").ilike("company_name", f"%{company_name}%").is_("deleted_at", None).execute()
        
        return response.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
