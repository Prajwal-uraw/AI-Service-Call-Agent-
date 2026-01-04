-- =====================================================
-- SAFE MIGRATION - NO TRIGGERS VERSION
-- =====================================================
-- This creates tables WITHOUT triggers that reference tenant_id
-- Run this if you keep getting "tenant_id does not exist" errors
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: CREATE ALL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100) DEFAULT 'hvac',
    owner_name VARCHAR(200),
    owner_email VARCHAR(255) UNIQUE NOT NULL,
    owner_phone VARCHAR(50),
    twilio_phone_number VARCHAR(50),
    twilio_account_sid VARCHAR(100),
    twilio_auth_token_encrypted TEXT,
    forward_to_number VARCHAR(50),
    emergency_phone VARCHAR(50),
    plan_tier VARCHAR(50) DEFAULT 'professional',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    billing_email VARCHAR(255),
    stripe_customer_id VARCHAR(100),
    monthly_call_limit INTEGER DEFAULT 1500,
    calls_this_month INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP,
    CONSTRAINT valid_email CHECK (owner_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$')
);

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

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_sid VARCHAR(100) UNIQUE,
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    direction VARCHAR(20),
    status VARCHAR(50),
    duration INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    transcript TEXT,
    summary TEXT,
    intent VARCHAR(100),
    sentiment VARCHAR(50),
    sentiment_score DECIMAL(3,2),
    appointment_scheduled BOOLEAN DEFAULT FALSE,
    appointment_time TIMESTAMP,
    lead_captured BOOLEAN DEFAULT FALSE,
    transferred BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id),
    customer_name VARCHAR(200),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    appointment_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    service_type VARCHAR(200),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    confirmed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calls_count INTEGER DEFAULT 0,
    minutes_used INTEGER DEFAULT 0,
    appointments_scheduled INTEGER DEFAULT 0,
    leads_captured INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant_id, date)
);

CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    agent_name VARCHAR(100) DEFAULT 'AI Assistant',
    agent_personality VARCHAR(50) DEFAULT 'professional',
    language VARCHAR(10) DEFAULT 'en-US',
    voice_type VARCHAR(50) DEFAULT 'alloy',
    business_name VARCHAR(200),
    business_type VARCHAR(100),
    business_description TEXT,
    business_hours JSONB,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    service_areas TEXT[],
    services JSONB DEFAULT '[]'::jsonb,
    system_prompt TEXT,
    greeting_message TEXT,
    fallback_message TEXT,
    closing_message TEXT,
    max_conversation_duration INTEGER DEFAULT 600,
    transfer_keywords TEXT[] DEFAULT ARRAY['emergency', 'urgent', 'manager'],
    prohibited_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    appointment_enabled BOOLEAN DEFAULT TRUE,
    appointment_duration INTEGER DEFAULT 60,
    appointment_buffer INTEGER DEFAULT 15,
    appointment_types JSONB DEFAULT '[]'::jsonb,
    calendar_provider VARCHAR(50),
    calendar_config JSONB,
    crm_provider VARCHAR(50),
    crm_config JSONB,
    transfer_phone_number VARCHAR(50),
    business_phone_number VARCHAR(50),
    after_hours_behavior VARCHAR(50) DEFAULT 'voicemail',
    faqs JSONB DEFAULT '[]'::jsonb,
    knowledge_base_urls TEXT[],
    sentiment_analysis_enabled BOOLEAN DEFAULT TRUE,
    lead_qualification_enabled BOOLEAN DEFAULT TRUE,
    lead_qualification_questions TEXT[],
    record_calls BOOLEAN DEFAULT TRUE,
    gdpr_compliant BOOLEAN DEFAULT FALSE,
    hipaa_compliant BOOLEAN DEFAULT FALSE,
    call_recording_disclaimer TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_config_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100) NOT NULL,
    description TEXT,
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_config_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES tenant_users(id),
    changes JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- STEP 2: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON tenant_api_keys(api_key);

CREATE INDEX IF NOT EXISTS idx_call_logs_tenant ON call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_sid ON call_logs(call_sid);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_date ON usage_tracking(tenant_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_ai_configs_tenant ON ai_agent_configs(tenant_id);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON ai_config_audit_log(tenant_id, created_at DESC);

-- =====================================================
-- STEP 3: INSERT TEMPLATES
-- =====================================================

INSERT INTO ai_config_templates (name, industry, description, config_data) VALUES
('HVAC Standard', 'hvac', 'Standard configuration for HVAC companies', '{"agent_personality": "professional", "services": [{"name": "AC Repair", "description": "Air conditioning repair and maintenance"}, {"name": "Heating Repair", "description": "Furnace and heating system repair"}, {"name": "Installation", "description": "New HVAC system installation"}], "transfer_keywords": ["emergency", "no heat", "no cooling", "urgent"], "appointment_duration": 120}'::jsonb),
('Plumbing Standard', 'plumbing', 'Standard configuration for plumbing companies', '{"agent_personality": "professional", "services": [{"name": "Emergency Plumbing", "description": "24/7 emergency plumbing services"}, {"name": "Leak Repair", "description": "Fix leaks and water damage"}, {"name": "Drain Cleaning", "description": "Professional drain cleaning"}], "transfer_keywords": ["emergency", "flooding", "leak", "burst pipe"], "appointment_duration": 90}'::jsonb),
('Legal Standard', 'legal', 'Standard configuration for law firms', '{"agent_personality": "formal", "services": [{"name": "Consultation", "description": "Initial legal consultation"}, {"name": "Case Review", "description": "Review of legal case details"}], "transfer_keywords": ["urgent", "court date", "emergency"], "appointment_duration": 30, "gdpr_compliant": true}'::jsonb),
('Medical Standard', 'medical', 'Standard configuration for medical practices', '{"agent_personality": "professional", "services": [{"name": "Appointment", "description": "Schedule medical appointment"}, {"name": "Follow-up", "description": "Follow-up appointment"}], "transfer_keywords": ["emergency", "urgent", "pain"], "appointment_duration": 30, "hipaa_compliant": true, "call_recording_disclaimer": "This call may be recorded for quality and training purposes."}'::jsonb),
('General Business', 'general', 'Generic configuration for any business', '{"agent_personality": "friendly", "services": [], "transfer_keywords": ["urgent", "manager"], "appointment_duration": 60}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ MIGRATION COMPLETED (NO TRIGGERS)!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ Created 9 tables without auto-triggers';
    RAISE NOTICE '✅ No tenant_id column errors';
    RAISE NOTICE '✅ 5 industry templates added';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NOTE: Triggers NOT created to avoid errors';
    RAISE NOTICE '   You can manually create AI configs when needed';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   - tenants';
    RAISE NOTICE '   - tenant_users';
    RAISE NOTICE '   - tenant_api_keys';
    RAISE NOTICE '   - call_logs';
    RAISE NOTICE '   - appointments';
    RAISE NOTICE '   - usage_tracking';
    RAISE NOTICE '   - ai_agent_configs';
    RAISE NOTICE '   - ai_config_templates';
    RAISE NOTICE '   - ai_config_audit_log';
    RAISE NOTICE '==============================================';
END $$;

SELECT tablename FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'tenant_users', 'call_logs', 'appointments', 'ai_agent_configs')
ORDER BY tablename;
