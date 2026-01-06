"""
AI Agent Configuration API
Manage per-tenant AI behavior, instructions, and integrations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from database.session import get_db
from models.tenant_models import Tenant

router = APIRouter(prefix="/api/admin/ai-config", tags=["AI Agent Configuration"])


# =====================================================
# Pydantic Models
# =====================================================

class ServiceModel(BaseModel):
    name: str
    description: str
    price_range: Optional[str] = None
    duration: Optional[int] = None

class AppointmentTypeModel(BaseModel):
    name: str
    duration: int  # minutes
    description: Optional[str] = None

class BusinessHours(BaseModel):
    open: str  # "09:00"
    close: str  # "17:00"
    closed: bool = False

class CalendarIntegration(BaseModel):
    provider: str  # google, outlook, calendly
    api_key: Optional[str] = None
    calendar_id: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class CRMIntegration(BaseModel):
    provider: str  # salesforce, hubspot, pipedrive
    api_key: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class AIAgentConfigCreate(BaseModel):
    tenant_id: str
    
    # Basic Settings
    agent_name: str = "AI Assistant"
    agent_personality: str = "professional"
    language: str = "en-US"
    voice_type: str = "alloy"
    
    # Business Info
    business_name: Optional[str] = None
    business_type: str = "general"
    business_description: Optional[str] = None
    business_hours: Optional[Dict[str, BusinessHours]] = None
    timezone: str = "America/Chicago"
    
    # Services
    services: List[ServiceModel] = []
    service_areas: List[str] = []
    
    # AI Instructions
    system_prompt: Optional[str] = None
    greeting_message: str = "Hello! How can I help you today?"
    fallback_message: str = "I'm not sure about that. Let me connect you with someone who can help."
    closing_message: str = "Thank you for calling! Have a great day."
    
    # Conversation Rules
    max_conversation_duration: int = 300
    transfer_keywords: List[str] = []
    prohibited_topics: List[str] = []
    
    # Appointments
    appointment_enabled: bool = True
    appointment_duration: int = 60
    appointment_buffer: int = 15
    appointment_types: List[AppointmentTypeModel] = []
    
    # Integrations
    calendar_provider: Optional[str] = None
    calendar_config: Optional[Dict[str, Any]] = None
    crm_provider: Optional[str] = None
    crm_config: Optional[Dict[str, Any]] = None
    
    # Call Routing
    transfer_phone_number: Optional[str] = None
    business_phone_number: Optional[str] = None
    after_hours_behavior: str = "voicemail"
    
    # FAQ
    faqs: List[Dict[str, str]] = []
    
    # Compliance
    record_calls: bool = False
    gdpr_compliant: bool = True
    hipaa_compliant: bool = False
    call_recording_disclaimer: Optional[str] = None
    
    # Advanced
    sentiment_analysis_enabled: bool = True
    lead_qualification_enabled: bool = True
    lead_qualification_questions: List[str] = []
    custom_fields: Optional[Dict[str, Any]] = None

class AIAgentConfigUpdate(BaseModel):
    agent_name: Optional[str] = None
    agent_personality: Optional[str] = None
    language: Optional[str] = None
    voice_type: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_description: Optional[str] = None
    business_hours: Optional[Dict[str, BusinessHours]] = None
    timezone: Optional[str] = None
    services: Optional[List[ServiceModel]] = None
    service_areas: Optional[List[str]] = None
    system_prompt: Optional[str] = None
    greeting_message: Optional[str] = None
    fallback_message: Optional[str] = None
    closing_message: Optional[str] = None
    max_conversation_duration: Optional[int] = None
    transfer_keywords: Optional[List[str]] = None
    prohibited_topics: Optional[List[str]] = None
    appointment_enabled: Optional[bool] = None
    appointment_duration: Optional[int] = None
    appointment_buffer: Optional[int] = None
    appointment_types: Optional[List[AppointmentTypeModel]] = None
    calendar_provider: Optional[str] = None
    calendar_config: Optional[Dict[str, Any]] = None
    crm_provider: Optional[str] = None
    crm_config: Optional[Dict[str, Any]] = None
    transfer_phone_number: Optional[str] = None
    business_phone_number: Optional[str] = None
    after_hours_behavior: Optional[str] = None
    faqs: Optional[List[Dict[str, str]]] = None
    record_calls: Optional[bool] = None
    gdpr_compliant: Optional[bool] = None
    hipaa_compliant: Optional[bool] = None
    call_recording_disclaimer: Optional[str] = None
    sentiment_analysis_enabled: Optional[bool] = None
    lead_qualification_enabled: Optional[bool] = None
    lead_qualification_questions: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class AIAgentConfigResponse(BaseModel):
    id: str
    tenant_id: str
    agent_name: str
    agent_personality: str
    language: str
    voice_type: str
    business_name: Optional[str]
    business_type: str
    business_description: Optional[str]
    business_hours: Optional[Dict[str, Any]]
    timezone: str
    services: List[Dict[str, Any]]
    service_areas: List[str]
    system_prompt: Optional[str]
    greeting_message: str
    fallback_message: str
    closing_message: str
    max_conversation_duration: int
    transfer_keywords: List[str]
    prohibited_topics: List[str]
    appointment_enabled: bool
    appointment_duration: int
    appointment_buffer: int
    appointment_types: List[Dict[str, Any]]
    calendar_provider: Optional[str]
    calendar_config: Optional[Dict[str, Any]]
    crm_provider: Optional[str]
    crm_config: Optional[Dict[str, Any]]
    transfer_phone_number: Optional[str]
    business_phone_number: Optional[str]
    after_hours_behavior: str
    faqs: List[Dict[str, str]]
    record_calls: bool
    gdpr_compliant: bool
    hipaa_compliant: bool
    call_recording_disclaimer: Optional[str]
    sentiment_analysis_enabled: bool
    lead_qualification_enabled: bool
    lead_qualification_questions: List[str]
    custom_fields: Optional[Dict[str, Any]]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# API Endpoints
# =====================================================

@router.get("/tenant/{tenant_id}", response_model=AIAgentConfigResponse)
async def get_ai_config(tenant_id: str, db: Session = Depends(get_db)):
    """Get AI agent configuration for a tenant"""
    
    config = db.execute(
        "SELECT * FROM ai_agent_configs WHERE tenant_id = :tenant_id",
        {"tenant_id": tenant_id}
    ).fetchone()
    
    if not config:
        raise HTTPException(status_code=404, detail="AI configuration not found")
    
    return dict(config)


@router.post("/", response_model=AIAgentConfigResponse)
async def create_ai_config(config_data: AIAgentConfigCreate, db: Session = Depends(get_db)):
    """Create AI agent configuration for a tenant"""
    
    # Check if config already exists
    existing = db.execute(
        "SELECT id FROM ai_agent_configs WHERE tenant_id = :tenant_id",
        {"tenant_id": config_data.tenant_id}
    ).fetchone()
    
    if existing:
        raise HTTPException(status_code=400, detail="AI configuration already exists for this tenant")
    
    # Verify tenant exists
    tenant = db.execute(
        "SELECT id FROM tenants WHERE id = :tenant_id",
        {"tenant_id": config_data.tenant_id}
    ).fetchone()
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Insert configuration
    result = db.execute("""
        INSERT INTO ai_agent_configs (
            tenant_id, agent_name, agent_personality, language, voice_type,
            business_name, business_type, business_description, business_hours, timezone,
            services, service_areas, system_prompt, greeting_message, fallback_message, closing_message,
            max_conversation_duration, transfer_keywords, prohibited_topics,
            appointment_enabled, appointment_duration, appointment_buffer, appointment_types,
            calendar_provider, calendar_config, crm_provider, crm_config,
            transfer_phone_number, business_phone_number, after_hours_behavior,
            faqs, record_calls, gdpr_compliant, hipaa_compliant, call_recording_disclaimer,
            sentiment_analysis_enabled, lead_qualification_enabled, lead_qualification_questions,
            custom_fields
        ) VALUES (
            :tenant_id, :agent_name, :agent_personality, :language, :voice_type,
            :business_name, :business_type, :business_description, :business_hours, :timezone,
            :services, :service_areas, :system_prompt, :greeting_message, :fallback_message, :closing_message,
            :max_conversation_duration, :transfer_keywords, :prohibited_topics,
            :appointment_enabled, :appointment_duration, :appointment_buffer, :appointment_types,
            :calendar_provider, :calendar_config, :crm_provider, :crm_config,
            :transfer_phone_number, :business_phone_number, :after_hours_behavior,
            :faqs, :record_calls, :gdpr_compliant, :hipaa_compliant, :call_recording_disclaimer,
            :sentiment_analysis_enabled, :lead_qualification_enabled, :lead_qualification_questions,
            :custom_fields
        ) RETURNING *
    """, {
        "tenant_id": config_data.tenant_id,
        "agent_name": config_data.agent_name,
        "agent_personality": config_data.agent_personality,
        "language": config_data.language,
        "voice_type": config_data.voice_type,
        "business_name": config_data.business_name,
        "business_type": config_data.business_type,
        "business_description": config_data.business_description,
        "business_hours": json.dumps(config_data.business_hours) if config_data.business_hours else None,
        "timezone": config_data.timezone,
        "services": json.dumps([s.dict() for s in config_data.services]),
        "service_areas": json.dumps(config_data.service_areas),
        "system_prompt": config_data.system_prompt,
        "greeting_message": config_data.greeting_message,
        "fallback_message": config_data.fallback_message,
        "closing_message": config_data.closing_message,
        "max_conversation_duration": config_data.max_conversation_duration,
        "transfer_keywords": json.dumps(config_data.transfer_keywords),
        "prohibited_topics": json.dumps(config_data.prohibited_topics),
        "appointment_enabled": config_data.appointment_enabled,
        "appointment_duration": config_data.appointment_duration,
        "appointment_buffer": config_data.appointment_buffer,
        "appointment_types": json.dumps([a.dict() for a in config_data.appointment_types]),
        "calendar_provider": config_data.calendar_provider,
        "calendar_config": json.dumps(config_data.calendar_config) if config_data.calendar_config else None,
        "crm_provider": config_data.crm_provider,
        "crm_config": json.dumps(config_data.crm_config) if config_data.crm_config else None,
        "transfer_phone_number": config_data.transfer_phone_number,
        "business_phone_number": config_data.business_phone_number,
        "after_hours_behavior": config_data.after_hours_behavior,
        "faqs": json.dumps(config_data.faqs),
        "record_calls": config_data.record_calls,
        "gdpr_compliant": config_data.gdpr_compliant,
        "hipaa_compliant": config_data.hipaa_compliant,
        "call_recording_disclaimer": config_data.call_recording_disclaimer,
        "sentiment_analysis_enabled": config_data.sentiment_analysis_enabled,
        "lead_qualification_enabled": config_data.lead_qualification_enabled,
        "lead_qualification_questions": json.dumps(config_data.lead_qualification_questions),
        "custom_fields": json.dumps(config_data.custom_fields) if config_data.custom_fields else None
    })
    
    db.commit()
    config = result.fetchone()
    
    return dict(config)


@router.patch("/tenant/{tenant_id}", response_model=AIAgentConfigResponse)
async def update_ai_config(
    tenant_id: str,
    config_data: AIAgentConfigUpdate,
    db: Session = Depends(get_db)
):
    """Update AI agent configuration"""
    
    # Build update query dynamically
    update_fields = []
    params = {"tenant_id": tenant_id}
    
    for field, value in config_data.dict(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = :{field}")
            
            # Handle JSON fields
            if field in ['business_hours', 'services', 'service_areas', 'transfer_keywords', 
                        'prohibited_topics', 'appointment_types', 'calendar_config', 'crm_config',
                        'faqs', 'lead_qualification_questions', 'custom_fields']:
                params[field] = json.dumps(value)
            else:
                params[field] = value
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    query = f"""
        UPDATE ai_agent_configs 
        SET {', '.join(update_fields)}, updated_at = NOW()
        WHERE tenant_id = :tenant_id
        RETURNING *
    """
    
    result = db.execute(query, params)
    db.commit()
    
    config = result.fetchone()
    if not config:
        raise HTTPException(status_code=404, detail="AI configuration not found")
    
    return dict(config)


@router.get("/templates", response_model=List[Dict[str, Any]])
async def list_templates(db: Session = Depends(get_db)):
    """List available AI configuration templates"""
    
    templates = db.execute("""
        SELECT template_name, industry, description, default_config
        FROM ai_config_templates
        WHERE is_active = TRUE
        ORDER BY industry, template_name
    """).fetchall()
    
    return [dict(t) for t in templates]


@router.get("/template/{template_name}", response_model=Dict[str, Any])
async def get_template(template_name: str, db: Session = Depends(get_db)):
    """Get specific AI configuration template"""
    
    template = db.execute("""
        SELECT * FROM ai_config_templates
        WHERE template_name = :template_name AND is_active = TRUE
    """, {"template_name": template_name}).fetchone()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return dict(template)


@router.post("/tenant/{tenant_id}/apply-template/{template_name}")
async def apply_template(
    tenant_id: str,
    template_name: str,
    db: Session = Depends(get_db)
):
    """Apply a template to tenant's AI configuration"""
    
    # Get template
    template = db.execute("""
        SELECT default_config FROM ai_config_templates
        WHERE template_name = :template_name AND is_active = TRUE
    """, {"template_name": template_name}).fetchone()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    config = template['default_config']
    
    # Update or create config
    result = db.execute("""
        INSERT INTO ai_agent_configs (
            tenant_id, agent_name, agent_personality, business_type,
            greeting_message, services, appointment_types, transfer_keywords
        ) VALUES (
            :tenant_id, :agent_name, :agent_personality, :business_type,
            :greeting_message, :services, :appointment_types, :transfer_keywords
        )
        ON CONFLICT (tenant_id) DO UPDATE SET
            agent_name = EXCLUDED.agent_name,
            agent_personality = EXCLUDED.agent_personality,
            business_type = EXCLUDED.business_type,
            greeting_message = EXCLUDED.greeting_message,
            services = EXCLUDED.services,
            appointment_types = EXCLUDED.appointment_types,
            transfer_keywords = EXCLUDED.transfer_keywords,
            updated_at = NOW()
        RETURNING *
    """, {
        "tenant_id": tenant_id,
        "agent_name": config.get('agent_name', 'AI Assistant'),
        "agent_personality": config.get('agent_personality', 'professional'),
        "business_type": config.get('business_type', 'general'),
        "greeting_message": config.get('greeting_message', 'Hello!'),
        "services": json.dumps(config.get('services', [])),
        "appointment_types": json.dumps(config.get('appointment_types', [])),
        "transfer_keywords": json.dumps(config.get('transfer_keywords', []))
    })
    
    db.commit()
    
    return {"success": True, "message": f"Template '{template_name}' applied successfully"}


@router.delete("/tenant/{tenant_id}")
async def delete_ai_config(tenant_id: str, db: Session = Depends(get_db)):
    """Delete AI agent configuration"""
    
    result = db.execute("""
        DELETE FROM ai_agent_configs
        WHERE tenant_id = :tenant_id
        RETURNING id
    """, {"tenant_id": tenant_id})
    
    db.commit()
    
    if not result.fetchone():
        raise HTTPException(status_code=404, detail="AI configuration not found")
    
    return {"success": True, "message": "AI configuration deleted"}
