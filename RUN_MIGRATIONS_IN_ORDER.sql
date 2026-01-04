-- =====================================================
 -- COMPLETE MIGRATION SCRIPT - RUN IN SUPABASE SQL EDITOR
-- =====================================================
-- This script runs all necessary migrations in the correct order
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE TENANTS TABLE (Base Multi-Tenant Schema)
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100) DEFAULT 'hvac',
    
    -- Owner Information
    owner_name VARCHAR(200),
    owner_email VARCHAR(255) UNIQUE NOT NULL,
    owner_phone VARCHAR(50),
    
    -- Twilio Configuration
    twilio_phone_number VARCHAR(50),
    twilio_account_sid VARCHAR(100),
    twilio_auth_token_encrypted TEXT,
    forward_to_number VARCHAR(50),
    emergency_phone VARCHAR(50),
    
    -- Subscription & Billing
    plan_tier VARCHAR(50) DEFAULT 'professional',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    billing_email VARCHAR(255),
    stripe_customer_id VARCHAR(100),
    
    -- Usage Limits
    monthly_call_limit INTEGER DEFAULT 1500,
    calls_this_month INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (owner_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Create indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- =====================================================
-- STEP 2: CREATE TENANT USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(200),
    role VARCHAR(50) DEFAULT 'user',
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);

-- =====================================================
-- STEP 3: CREATE TENANT API KEYS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    api_secret_hash TEXT NOT NULL,
    permissions JSONB DEFAULT '["read"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES tenant_users(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON tenant_api_keys(api_key);

-- =====================================================
-- STEP 4: CREATE CALL LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Call Details
    call_sid VARCHAR(100) UNIQUE,
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    direction VARCHAR(20),
    status VARCHAR(50),
    
    -- Timing
    duration INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    
    -- AI Analysis
    transcript TEXT,
    summary TEXT,
    intent VARCHAR(100),
    sentiment VARCHAR(50),
    sentiment_score DECIMAL(3,2),
    
    -- Outcomes
    appointment_scheduled BOOLEAN DEFAULT FALSE,
    appointment_time TIMESTAMP,
    lead_captured BOOLEAN DEFAULT FALSE,
    transferred BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    recording_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_tenant ON call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON call_logs(status);

-- =====================================================
-- STEP 5: CREATE APPOINTMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id),
    
    -- Appointment Details
    customer_name VARCHAR(200),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    appointment_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    service_type VARCHAR(200),
    notes TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',
    confirmed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =====================================================
-- STEP 6: CREATE USAGE TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Usage Metrics
    date DATE NOT NULL,
    calls_count INTEGER DEFAULT 0,
    minutes_used INTEGER DEFAULT 0,
    appointments_scheduled INTEGER DEFAULT 0,
    leads_captured INTEGER DEFAULT 0,
    
    -- Costs
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_date ON usage_tracking(tenant_id, date DESC);

-- =====================================================
-- STEP 7: CREATE AI AGENT CONFIGURATION TABLES
-- =====================================================

-- AI Agent Configs Table
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    
    -- Basic AI Settings
    agent_name VARCHAR(100) DEFAULT 'AI Assistant',
    agent_personality VARCHAR(50) DEFAULT 'professional',
    language VARCHAR(10) DEFAULT 'en-US',
    voice_type VARCHAR(50) DEFAULT 'alloy',
    
    -- Business Information
    business_name VARCHAR(200),
    business_type VARCHAR(100),
    business_description TEXT,
    business_hours JSONB,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    service_areas TEXT[],
    
    -- Services Offered
    services JSONB DEFAULT '[]'::jsonb,
    
    -- AI Instructions
    system_prompt TEXT,
    greeting_message TEXT,
    fallback_message TEXT,
    closing_message TEXT,
    
    -- Conversation Settings
    max_conversation_duration INTEGER DEFAULT 600,
    transfer_keywords TEXT[] DEFAULT ARRAY['emergency', 'urgent', 'manager'],
    prohibited_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Appointment Settings
    appointment_enabled BOOLEAN DEFAULT TRUE,
    appointment_duration INTEGER DEFAULT 60,
    appointment_buffer INTEGER DEFAULT 15,
    appointment_types JSONB DEFAULT '[]'::jsonb,
    
    -- Integrations
    calendar_provider VARCHAR(50),
    calendar_config JSONB,
    crm_provider VARCHAR(50),
    crm_config JSONB,
    
    -- Call Routing
    transfer_phone_number VARCHAR(50),
    business_phone_number VARCHAR(50),
    after_hours_behavior VARCHAR(50) DEFAULT 'voicemail',
    
    -- Knowledge Base
    faqs JSONB DEFAULT '[]'::jsonb,
    knowledge_base_urls TEXT[],
    
    -- Advanced Features
    sentiment_analysis_enabled BOOLEAN DEFAULT TRUE,
    lead_qualification_enabled BOOLEAN DEFAULT TRUE,
    lead_qualification_questions TEXT[],
    
    -- Compliance
    record_calls BOOLEAN DEFAULT TRUE,
    gdpr_compliant BOOLEAN DEFAULT FALSE,
    hipaa_compliant BOOLEAN DEFAULT FALSE,
    call_recording_disclaimer TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_configs_tenant ON ai_agent_configs(tenant_id);

-- AI Config Templates Table
CREATE TABLE IF NOT EXISTS ai_config_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100) NOT NULL,
    description TEXT,
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Config Audit Log
CREATE TABLE IF NOT EXISTS ai_config_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES tenant_users(id),
    changes JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON ai_config_audit_log(tenant_id, created_at DESC);

-- =====================================================
-- STEP 8: CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_users_updated_at ON tenant_users;
CREATE TRIGGER update_tenant_users_updated_at
    BEFORE UPDATE ON tenant_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_configs_updated_at ON ai_agent_configs;
CREATE TRIGGER update_ai_configs_updated_at
    BEFORE UPDATE ON ai_agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create default AI config when tenant is created
CREATE OR REPLACE FUNCTION create_default_ai_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_agent_configs (
        tenant_id,
        business_name,
        business_type,
        agent_name,
        system_prompt,
        greeting_message,
        fallback_message,
        closing_message
    ) VALUES (
        NEW.id,
        NEW.company_name,
        NEW.industry,
        NEW.company_name || ' Assistant',
        'You are a professional AI assistant for ' || NEW.company_name || '. Your role is to answer questions, schedule appointments, and provide excellent customer service.',
        'Thank you for calling ' || NEW.company_name || '! How can I help you today?',
        'I apologize, I didn''t quite understand that. Could you please rephrase?',
        'Thank you for calling ' || NEW.company_name || '. Have a great day!'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_default_ai_config ON tenants;
CREATE TRIGGER trg_create_default_ai_config
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION create_default_ai_config();

-- Function to log AI config changes
CREATE OR REPLACE FUNCTION log_ai_config_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_config_audit_log (tenant_id, changes)
    VALUES (NEW.tenant_id, jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
    ));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_ai_config_changes ON ai_agent_configs;
CREATE TRIGGER trg_log_ai_config_changes
    AFTER UPDATE ON ai_agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION log_ai_config_changes();

-- =====================================================
-- STEP 9: INSERT DEFAULT AI CONFIG TEMPLATES
-- =====================================================

INSERT INTO ai_config_templates (name, industry, description, config_data) VALUES
('HVAC Standard', 'hvac', 'Standard configuration for HVAC companies', '{
    "agent_personality": "professional",
    "services": [
        {"name": "AC Repair", "description": "Air conditioning repair and maintenance"},
        {"name": "Heating Repair", "description": "Furnace and heating system repair"},
        {"name": "Installation", "description": "New HVAC system installation"}
    ],
    "transfer_keywords": ["emergency", "no heat", "no cooling", "urgent"],
    "appointment_duration": 120
}'::jsonb),

('Plumbing Standard', 'plumbing', 'Standard configuration for plumbing companies', '{
    "agent_personality": "professional",
    "services": [
        {"name": "Emergency Plumbing", "description": "24/7 emergency plumbing services"},
        {"name": "Leak Repair", "description": "Fix leaks and water damage"},
        {"name": "Drain Cleaning", "description": "Professional drain cleaning"}
    ],
    "transfer_keywords": ["emergency", "flooding", "leak", "burst pipe"],
    "appointment_duration": 90
}'::jsonb),

('Legal Standard', 'legal', 'Standard configuration for law firms', '{
    "agent_personality": "formal",
    "services": [
        {"name": "Consultation", "description": "Initial legal consultation"},
        {"name": "Case Review", "description": "Review of legal case details"}
    ],
    "transfer_keywords": ["urgent", "court date", "emergency"],
    "appointment_duration": 30,
    "gdpr_compliant": true
}'::jsonb),

('Medical Standard', 'medical', 'Standard configuration for medical practices', '{
    "agent_personality": "professional",
    "services": [
        {"name": "Appointment", "description": "Schedule medical appointment"},
        {"name": "Follow-up", "description": "Follow-up appointment"}
    ],
    "transfer_keywords": ["emergency", "urgent", "pain"],
    "appointment_duration": 30,
    "hipaa_compliant": true,
    "call_recording_disclaimer": "This call may be recorded for quality and training purposes."
}'::jsonb),

('General Business', 'general', 'Generic configuration for any business', '{
    "agent_personality": "friendly",
    "services": [],
    "transfer_keywords": ["urgent", "manager"],
    "appointment_duration": 60
}'::jsonb)

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 10: GRANT PERMISSIONS (if needed)
-- =====================================================

-- Grant permissions to authenticated users
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'tenants',
    'tenant_users',
    'tenant_api_keys',
    'call_logs',
    'appointments',
    'usage_tracking',
    'ai_agent_configs',
    'ai_config_templates',
    'ai_config_audit_log'
)
ORDER BY tablename;

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('tenants', 'tenant_users', 'ai_agent_configs')
ORDER BY event_object_table, trigger_name;

-- Check templates were inserted
SELECT name, industry, description FROM ai_config_templates ORDER BY name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '📊 Tables created: tenants, tenant_users, tenant_api_keys, call_logs, appointments, usage_tracking, ai_agent_configs, ai_config_templates, ai_config_audit_log';
    RAISE NOTICE '🔧 Triggers created: Auto-create AI config, Update timestamps, Audit logging';
    RAISE NOTICE '📝 Templates inserted: 5 industry templates';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your database is ready! You can now:';
    RAISE NOTICE '   1. Create tenants via /admin/tenants';
    RAISE NOTICE '   2. Configure AI agents via /admin/tenants/[id]/ai-config';
    RAISE NOTICE '   3. Provision phone numbers via /admin/tenants/[id]/provision-phone';
END $$;
