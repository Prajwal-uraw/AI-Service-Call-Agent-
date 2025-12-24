-- =====================================================
-- DIAGNOSTIC MIGRATION: Find the exact failure point
-- =====================================================
-- Run this to see EXACTLY where the tenant_id error occurs
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN RAISE NOTICE '✓ Step 1: UUID extension enabled'; END $$;

-- =====================================================
-- STEP 1: Create Tenants Table
-- =====================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL UNIQUE,
    twilio_phone_number VARCHAR(20) UNIQUE,
    subscription_status VARCHAR(50) DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN RAISE NOTICE '✓ Step 2: Tenants table created'; END $$;

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
    is_active
) VALUES (
    'default',
    'KC Comfort Air',
    'System Admin',
    'admin@kccomfortair.com',
    '+1234567890',
    'active',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✓ Step 3: Default tenant inserted'; END $$;

-- =====================================================
-- STEP 3: Add tenant_id to leads
-- =====================================================

DO $$ BEGIN RAISE NOTICE 'Adding tenant_id to leads table...'; END $$;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id UUID;

DO $$ BEGIN RAISE NOTICE '✓ Step 4: tenant_id column added to leads'; END $$;

-- Add foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_leads_tenant'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT fk_leads_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Step 5: Foreign key added to leads';
    ELSE
        RAISE NOTICE '✓ Step 5: Foreign key already exists on leads';
    END IF;
END $$;

-- Backfill
DO $$ BEGIN RAISE NOTICE 'Backfilling leads with default tenant...'; END $$;

UPDATE leads 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

DO $$ BEGIN RAISE NOTICE '✓ Step 6: Leads backfilled'; END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);

DO $$ BEGIN RAISE NOTICE '✓ Step 7: Index created on leads.tenant_id'; END $$;

-- =====================================================
-- STEP 4: Add tenant_id to signals
-- =====================================================

DO $$ BEGIN RAISE NOTICE 'Adding tenant_id to signals table...'; END $$;

ALTER TABLE signals ADD COLUMN IF NOT EXISTS tenant_id UUID;

DO $$ BEGIN RAISE NOTICE '✓ Step 8: tenant_id column added to signals'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_signals_tenant'
    ) THEN
        ALTER TABLE signals ADD CONSTRAINT fk_signals_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Step 9: Foreign key added to signals';
    ELSE
        RAISE NOTICE '✓ Step 9: Foreign key already exists on signals';
    END IF;
END $$;

UPDATE signals 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

DO $$ BEGIN RAISE NOTICE '✓ Step 10: Signals backfilled'; END $$;

CREATE INDEX IF NOT EXISTS idx_signals_tenant_id ON signals(tenant_id);

DO $$ BEGIN RAISE NOTICE '✓ Step 11: Index created on signals.tenant_id'; END $$;

-- =====================================================
-- STEP 5: Add tenant_id to contacts
-- =====================================================

DO $$ BEGIN RAISE NOTICE 'Adding tenant_id to contacts table...'; END $$;

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id UUID;

DO $$ BEGIN RAISE NOTICE '✓ Step 12: tenant_id column added to contacts'; END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_contacts_tenant'
    ) THEN
        ALTER TABLE contacts ADD CONSTRAINT fk_contacts_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
        RAISE NOTICE '✓ Step 13: Foreign key added to contacts';
    ELSE
        RAISE NOTICE '✓ Step 13: Foreign key already exists on contacts';
    END IF;
END $$;

UPDATE contacts 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

DO $$ BEGIN RAISE NOTICE '✓ Step 14: Contacts backfilled'; END $$;

CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);

DO $$ BEGIN RAISE NOTICE '✓ Step 15: Index created on contacts.tenant_id'; END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$ BEGIN RAISE NOTICE '=== VERIFICATION ==='; END $$;

-- Check default tenant
DO $$
DECLARE
    tenant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants WHERE slug = 'default';
    RAISE NOTICE 'Default tenants found: %', tenant_count;
END $$;

-- Check columns exist
DO $$
DECLARE
    leads_has_tenant BOOLEAN;
    signals_has_tenant BOOLEAN;
    contacts_has_tenant BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'tenant_id'
    ) INTO leads_has_tenant;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'signals' AND column_name = 'tenant_id'
    ) INTO signals_has_tenant;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'tenant_id'
    ) INTO contacts_has_tenant;
    
    RAISE NOTICE 'leads has tenant_id: %', leads_has_tenant;
    RAISE NOTICE 'signals has tenant_id: %', signals_has_tenant;
    RAISE NOTICE 'contacts has tenant_id: %', contacts_has_tenant;
END $$;

DO $$ BEGIN RAISE NOTICE '=== MIGRATION COMPLETE ==='; END $$;
