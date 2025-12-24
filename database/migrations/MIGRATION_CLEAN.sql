-- =====================================================
-- CLEAN MIGRATION: Multi-Tenant Support
-- =====================================================
-- This is a CLEAN migration that works with your existing setup
-- Run this INSTEAD of migrations 3, 4, 5 if they haven't run yet
-- OR run this to fix if migrations 3-5 failed
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Create Tenants Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    industry VARCHAR(100) DEFAULT 'hvac',
    website_url TEXT,
    logo_url TEXT,
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    owner_phone VARCHAR(50),
    billing_email VARCHAR(255),
    twilio_phone_number VARCHAR(20) UNIQUE,
    twilio_account_sid VARCHAR(100),
    twilio_auth_token VARCHAR(100),
    forward_to_number VARCHAR(20),
    emergency_phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    business_hours JSONB DEFAULT '{"mon":{"open":"08:00","close":"17:00"},"tue":{"open":"08:00","close":"17:00"},"wed":{"open":"08:00","close":"17:00"},"thu":{"open":"08:00","close":"17:00"},"fri":{"open":"08:00","close":"17:00"},"sat":{"open":"09:00","close":"14:00"},"sun":{"open":"closed","close":"closed"}}',
    service_areas JSONB DEFAULT '[]',
    ai_model VARCHAR(50) DEFAULT 'gpt-4o-mini',
    ai_voice VARCHAR(50) DEFAULT 'alloy',
    ai_temperature DECIMAL(3,2) DEFAULT 0.7,
    use_elevenlabs BOOLEAN DEFAULT FALSE,
    elevenlabs_voice_id VARCHAR(100),
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_plan VARCHAR(50) DEFAULT 'professional',
    trial_ends_at TIMESTAMP,
    monthly_price DECIMAL(10,2) DEFAULT 1997.00,
    monthly_call_limit INTEGER DEFAULT 2000,
    monthly_minutes_limit INTEGER DEFAULT 4000,
    forward_number VARCHAR(20),
    enable_recording BOOLEAN DEFAULT true,
    missed_call_sms_enabled BOOLEAN DEFAULT true,
    missed_call_sms_template TEXT DEFAULT 'Sorry we missed your call! We''ll call you back during business hours.',
    is_active BOOLEAN DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_email ON tenants(owner_email);
CREATE INDEX IF NOT EXISTS idx_tenants_twilio_phone ON tenants(twilio_phone_number);

-- =====================================================
-- STEP 2: Insert Default Tenant
-- =====================================================

INSERT INTO tenants (
    slug,
    company_name,
    owner_name,
    owner_email,
    twilio_phone_number,
    subscription_status,
    is_active,
    onboarding_completed
) VALUES (
    'default',
    'KC Comfort Air',
    'System Admin',
    'admin@kccomfortair.com',
    '+1234567890',
    'active',
    TRUE,
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 3: Add tenant_id to Existing Tables (SEPARATE TRANSACTIONS)
-- =====================================================

-- Add to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_leads_tenant'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT fk_leads_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Backfill leads
UPDATE leads 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);

-- Add to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS tenant_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_signals_tenant'
    ) THEN
        ALTER TABLE signals ADD CONSTRAINT fk_signals_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

UPDATE signals 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_signals_tenant_id ON signals(tenant_id);

-- Add to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_contacts_tenant'
    ) THEN
        ALTER TABLE contacts ADD CONSTRAINT fk_contacts_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
    END IF;
END $$;

UPDATE contacts 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);

-- =====================================================
-- STEP 4: Create New Multi-Tenant Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_sid VARCHAR(100) UNIQUE NOT NULL,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    direction VARCHAR(20) DEFAULT 'inbound',
    status VARCHAR(50),
    duration INTEGER DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    summary TEXT,
    appointment_booked BOOLEAN DEFAULT FALSE,
    is_missed BOOLEAN DEFAULT false,
    is_after_hours BOOLEAN DEFAULT false,
    cost DECIMAL(10,4),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_logs_tenant_id ON call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_sid ON call_logs(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    call_log_id UUID REFERENCES call_logs(id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    service_type VARCHAR(100),
    problem_description TEXT,
    scheduled_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE TABLE IF NOT EXISTS weekly_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    answered_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    appointments_booked INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_analytics_tenant_id ON weekly_analytics(tenant_id);

-- =====================================================
-- STEP 5: Create Helper Function
-- =====================================================

CREATE OR REPLACE FUNCTION get_tenant_by_phone(phone_number VARCHAR)
RETURNS UUID AS $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid
    FROM tenants
    WHERE twilio_phone_number = phone_number
    LIMIT 1;
    
    IF tenant_uuid IS NULL THEN
        SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'default';
    END IF;
    
    RETURN tenant_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: Create Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check default tenant exists
SELECT 
    'Default Tenant:' as info,
    id,
    slug,
    company_name,
    twilio_phone_number
FROM tenants 
WHERE slug = 'default';

-- Check tenant_id columns exist
SELECT 
    'Tables with tenant_id:' as info,
    table_name
FROM information_schema.columns
WHERE column_name = 'tenant_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- Check data backfill
SELECT 
    'Leads with tenant:' as info,
    COUNT(*) as total,
    COUNT(tenant_id) as with_tenant
FROM leads;

SELECT 
    'Contacts with tenant:' as info,
    COUNT(*) as total,
    COUNT(tenant_id) as with_tenant
FROM contacts;

-- =====================================================
-- DONE!
-- =====================================================
