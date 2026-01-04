-- AI Agent Configuration Schema
-- Allows per-tenant customization of AI behavior, instructions, and integrations

-- AI Agent Configuration Table
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Basic AI Settings
    agent_name VARCHAR(100) DEFAULT 'AI Assistant',
    agent_personality VARCHAR(50) DEFAULT 'professional', -- professional, friendly, casual, formal
    language VARCHAR(10) DEFAULT 'en-US',
    voice_type VARCHAR(50) DEFAULT 'alloy', -- OpenAI voice types
    
    -- Business Information
    business_name VARCHAR(200),
    business_type VARCHAR(100), -- hvac, plumbing, electrical, legal, medical, retail, restaurant, etc.
    business_description TEXT,
    business_hours JSONB, -- {"monday": {"open": "09:00", "close": "17:00"}, ...}
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    
    -- Services Offered
    services JSONB, -- [{"name": "Emergency Repair", "description": "...", "price_range": "$100-$500"}, ...]
    service_areas JSONB, -- ["Boston", "Cambridge", "Somerville"]
    
    -- AI Instructions & Prompts
    system_prompt TEXT, -- Custom system instructions
    greeting_message TEXT DEFAULT 'Hello! How can I help you today?',
    fallback_message TEXT DEFAULT 'I''m not sure about that. Let me connect you with someone who can help.',
    closing_message TEXT DEFAULT 'Thank you for calling! Have a great day.',
    
    -- Conversation Rules
    max_conversation_duration INTEGER DEFAULT 300, -- seconds
    transfer_keywords JSONB, -- ["emergency", "urgent", "speak to manager"]
    prohibited_topics JSONB, -- Topics AI should not discuss
    
    -- Appointment Scheduling
    appointment_enabled BOOLEAN DEFAULT TRUE,
    appointment_duration INTEGER DEFAULT 60, -- minutes
    appointment_buffer INTEGER DEFAULT 15, -- minutes between appointments
    appointment_types JSONB, -- [{"name": "Consultation", "duration": 30}, ...]
    
    -- Calendar Integration
    calendar_provider VARCHAR(50), -- google, outlook, calendly, acuity
    calendar_api_key TEXT,
    calendar_config JSONB, -- Provider-specific settings
    
    -- CRM Integration
    crm_provider VARCHAR(50), -- salesforce, hubspot, pipedrive, custom
    crm_api_key TEXT,
    crm_config JSONB,
    
    -- Call Routing
    transfer_phone_number VARCHAR(20), -- Number to transfer urgent calls
    business_phone_number VARCHAR(20), -- Main business number
    after_hours_behavior VARCHAR(50) DEFAULT 'voicemail', -- voicemail, transfer, message
    
    -- FAQ & Knowledge Base
    faqs JSONB, -- [{"question": "...", "answer": "..."}, ...]
    knowledge_base_url TEXT,
    
    -- Compliance & Legal
    record_calls BOOLEAN DEFAULT FALSE,
    gdpr_compliant BOOLEAN DEFAULT TRUE,
    hipaa_compliant BOOLEAN DEFAULT FALSE,
    call_recording_disclaimer TEXT,
    
    -- Advanced Settings
    sentiment_analysis_enabled BOOLEAN DEFAULT TRUE,
    lead_qualification_enabled BOOLEAN DEFAULT TRUE,
    lead_qualification_questions JSONB,
    custom_fields JSONB, -- Flexible field for any additional data
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES tenant_users(id),
    updated_by UUID REFERENCES tenant_users(id),
    
    CONSTRAINT unique_tenant_config UNIQUE(tenant_id)
);

-- Index for fast lookups
CREATE INDEX idx_ai_agent_configs_tenant ON ai_agent_configs(tenant_id);
CREATE INDEX idx_ai_agent_configs_active ON ai_agent_configs(is_active);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_ai_agent_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_agent_config_updated
    BEFORE UPDATE ON ai_agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_agent_config_timestamp();

-- Default configuration template for new tenants
CREATE TABLE IF NOT EXISTS ai_config_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) NOT NULL UNIQUE,
    industry VARCHAR(100) NOT NULL, -- hvac, plumbing, legal, medical, etc.
    description TEXT,
    default_config JSONB NOT NULL, -- Complete default configuration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO ai_config_templates (template_name, industry, description, default_config) VALUES
('hvac_standard', 'hvac', 'Standard HVAC service configuration', '{
    "agent_name": "HVAC Assistant",
    "agent_personality": "professional",
    "business_type": "hvac",
    "greeting_message": "Thank you for calling! I''m your AI assistant. How can I help with your heating or cooling needs today?",
    "services": [
        {"name": "AC Repair", "description": "Air conditioning repair and maintenance"},
        {"name": "Furnace Service", "description": "Heating system repair and maintenance"},
        {"name": "Installation", "description": "New HVAC system installation"},
        {"name": "Emergency Service", "description": "24/7 emergency HVAC service"}
    ],
    "appointment_types": [
        {"name": "Standard Service", "duration": 60},
        {"name": "Emergency Service", "duration": 120},
        {"name": "Consultation", "duration": 30}
    ],
    "transfer_keywords": ["emergency", "urgent", "no heat", "no cooling", "manager"]
}'::jsonb),

('plumbing_standard', 'plumbing', 'Standard plumbing service configuration', '{
    "agent_name": "Plumbing Assistant",
    "agent_personality": "professional",
    "business_type": "plumbing",
    "greeting_message": "Thank you for calling! How can I help with your plumbing needs?",
    "services": [
        {"name": "Leak Repair", "description": "Fix leaks and water damage"},
        {"name": "Drain Cleaning", "description": "Clear clogged drains"},
        {"name": "Water Heater Service", "description": "Water heater repair and installation"},
        {"name": "Emergency Plumbing", "description": "24/7 emergency service"}
    ],
    "transfer_keywords": ["emergency", "flooding", "burst pipe", "no water"]
}'::jsonb),

('legal_standard', 'legal', 'Standard legal practice configuration', '{
    "agent_name": "Legal Assistant",
    "agent_personality": "formal",
    "business_type": "legal",
    "greeting_message": "Thank you for calling. How may I assist you with your legal matter today?",
    "services": [
        {"name": "Consultation", "description": "Initial legal consultation"},
        {"name": "Document Review", "description": "Legal document review"},
        {"name": "Representation", "description": "Legal representation services"}
    ],
    "appointment_types": [
        {"name": "Initial Consultation", "duration": 30},
        {"name": "Follow-up Meeting", "duration": 60}
    ],
    "prohibited_topics": ["specific legal advice without consultation"],
    "call_recording_disclaimer": "This call may be recorded for quality and legal purposes."
}'::jsonb),

('medical_standard', 'medical', 'Standard medical practice configuration', '{
    "agent_name": "Medical Assistant",
    "agent_personality": "professional",
    "business_type": "medical",
    "greeting_message": "Thank you for calling. How can I help you schedule an appointment today?",
    "services": [
        {"name": "General Checkup", "description": "Routine medical examination"},
        {"name": "Specialist Consultation", "description": "Specialist appointment"},
        {"name": "Follow-up Visit", "description": "Follow-up appointment"}
    ],
    "appointment_types": [
        {"name": "New Patient", "duration": 45},
        {"name": "Follow-up", "duration": 30},
        {"name": "Urgent Care", "duration": 60}
    ],
    "hipaa_compliant": true,
    "prohibited_topics": ["medical diagnosis", "prescription advice"],
    "call_recording_disclaimer": "This call may be recorded. Your privacy is protected under HIPAA."
}'::jsonb),

('retail_standard', 'retail', 'Standard retail business configuration', '{
    "agent_name": "Store Assistant",
    "agent_personality": "friendly",
    "business_type": "retail",
    "greeting_message": "Hi! Thanks for calling. How can I help you today?",
    "services": [
        {"name": "Product Inquiry", "description": "Questions about products"},
        {"name": "Order Status", "description": "Check order status"},
        {"name": "Returns", "description": "Return and exchange assistance"}
    ],
    "transfer_keywords": ["manager", "complaint", "refund"]
}'::jsonb),

('restaurant_standard', 'restaurant', 'Standard restaurant configuration', '{
    "agent_name": "Restaurant Assistant",
    "agent_personality": "friendly",
    "business_type": "restaurant",
    "greeting_message": "Thank you for calling! Would you like to make a reservation or place an order?",
    "services": [
        {"name": "Reservations", "description": "Table reservations"},
        {"name": "Takeout Orders", "description": "Order food for pickup"},
        {"name": "Catering", "description": "Catering services"}
    ],
    "appointment_types": [
        {"name": "Dinner Reservation", "duration": 120},
        {"name": "Lunch Reservation", "duration": 90}
    ]
}'::jsonb),

('generic_business', 'general', 'Generic business configuration', '{
    "agent_name": "AI Assistant",
    "agent_personality": "professional",
    "business_type": "general",
    "greeting_message": "Thank you for calling! How can I assist you today?",
    "services": [],
    "appointment_enabled": true
}'::jsonb);

-- Audit log for configuration changes
CREATE TABLE IF NOT EXISTS ai_config_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_id UUID REFERENCES ai_agent_configs(id) ON DELETE SET NULL,
    changed_by UUID REFERENCES tenant_users(id),
    change_type VARCHAR(50) NOT NULL, -- created, updated, deleted, activated, deactivated
    old_values JSONB,
    new_values JSONB,
    change_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_config_audit_tenant ON ai_config_audit_log(tenant_id);
CREATE INDEX idx_ai_config_audit_created ON ai_config_audit_log(created_at DESC);

-- Function to create default config for new tenant
CREATE OR REPLACE FUNCTION create_default_ai_config()
RETURNS TRIGGER AS $$
DECLARE
    template_config JSONB;
    industry_key VARCHAR(100);
BEGIN
    -- Map tenant industry to template
    industry_key := COALESCE(NEW.industry, 'general') || '_standard';
    
    -- Get template config
    SELECT default_config INTO template_config
    FROM ai_config_templates
    WHERE template_name = industry_key AND is_active = TRUE
    LIMIT 1;
    
    -- Fallback to generic if no template found
    IF template_config IS NULL THEN
        SELECT default_config INTO template_config
        FROM ai_config_templates
        WHERE template_name = 'generic_business' AND is_active = TRUE
        LIMIT 1;
    END IF;
    
    -- Create AI config for new tenant
    INSERT INTO ai_agent_configs (
        tenant_id,
        business_name,
        business_type,
        agent_name,
        agent_personality,
        greeting_message,
        services,
        appointment_types,
        transfer_keywords
    ) VALUES (
        NEW.id,
        NEW.company_name,
        COALESCE(NEW.industry, 'general'),
        COALESCE(template_config->>'agent_name', 'AI Assistant'),
        COALESCE(template_config->>'agent_personality', 'professional'),
        COALESCE(template_config->>'greeting_message', 'Thank you for calling! How can I help you today?'),
        COALESCE(template_config->'services', '[]'::jsonb),
        COALESCE(template_config->'appointment_types', '[]'::jsonb),
        COALESCE(template_config->'transfer_keywords', '[]'::jsonb)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create AI config when tenant is created
CREATE TRIGGER tenant_create_ai_config
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION create_default_ai_config();

COMMENT ON TABLE ai_agent_configs IS 'Per-tenant AI agent configuration for customized behavior';
COMMENT ON TABLE ai_config_templates IS 'Industry-specific configuration templates';
COMMENT ON TABLE ai_config_audit_log IS 'Audit trail for AI configuration changes';
