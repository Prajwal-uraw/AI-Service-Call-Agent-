-- Fix Migration 015: DROP then CREATE approach for leads table
-- This script uses DROP IF EXISTS to handle existing columns/indexes

-- Drop existing indexes first
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_company;
DROP INDEX IF EXISTS idx_leads_status;
DROP INDEX IF EXISTS idx_leads_source;
DROP INDEX IF EXISTS idx_leads_created_at;
DROP INDEX IF EXISTS idx_leads_assigned_to;

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS trigger_log_lead_status_change ON leads;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_leads_updated_at();
DROP FUNCTION IF EXISTS log_lead_status_change();

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all leads" ON leads;
DROP POLICY IF EXISTS "Users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can update assigned leads" ON leads;
DROP POLICY IF EXISTS "Users can update leads" ON leads;

-- Drop related tables (will be recreated)
DROP TABLE IF EXISTS sample_report_downloads CASCADE;
DROP TABLE IF EXISTS lead_activities CASCADE;

-- Now add missing columns to leads table if they don't exist
DO $$ 
BEGIN
    -- Add source column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'source'
    ) THEN
        ALTER TABLE leads ADD COLUMN source VARCHAR(100) NOT NULL DEFAULT 'unknown';
    END IF;

    -- Add company column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'company'
    ) THEN
        ALTER TABLE leads ADD COLUMN company VARCHAR(255);
    END IF;

    -- Add job_title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'job_title'
    ) THEN
        ALTER TABLE leads ADD COLUMN job_title VARCHAR(100);
    END IF;

    -- Add number_of_technicians column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'number_of_technicians'
    ) THEN
        ALTER TABLE leads ADD COLUMN number_of_technicians VARCHAR(50);
    END IF;

    -- Add current_call_volume column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'current_call_volume'
    ) THEN
        ALTER TABLE leads ADD COLUMN current_call_volume VARCHAR(50);
    END IF;

    -- Add primary_challenge column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'primary_challenge'
    ) THEN
        ALTER TABLE leads ADD COLUMN primary_challenge VARCHAR(100);
    END IF;

    -- Add report_title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'report_title'
    ) THEN
        ALTER TABLE leads ADD COLUMN report_title VARCHAR(255);
    END IF;

    -- Add lead_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'lead_type'
    ) THEN
        ALTER TABLE leads ADD COLUMN lead_type VARCHAR(50) NOT NULL DEFAULT 'general';
    END IF;

    -- Add tags column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'tags'
    ) THEN
        ALTER TABLE leads ADD COLUMN tags TEXT[];
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'notes'
    ) THEN
        ALTER TABLE leads ADD COLUMN notes TEXT;
    END IF;

    -- Add assigned_to column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE leads ADD COLUMN assigned_to UUID;
    END IF;

    -- Add last_contacted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'last_contacted_at'
    ) THEN
        ALTER TABLE leads ADD COLUMN last_contacted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add converted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'converted_at'
    ) THEN
        ALTER TABLE leads ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add conversion_value column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'conversion_value'
    ) THEN
        ALTER TABLE leads ADD COLUMN conversion_value DECIMAL(10, 2);
    END IF;
END $$;

-- Recreate indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company ON leads(company);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- Recreate lead_activities table
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- Recreate sample_report_downloads table
CREATE TABLE sample_report_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    report_title VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 1
);

CREATE INDEX idx_sample_downloads_lead_id ON sample_report_downloads(lead_id);
CREATE INDEX idx_sample_downloads_email ON sample_report_downloads(email);
CREATE INDEX idx_sample_downloads_date ON sample_report_downloads(downloaded_at DESC);

-- Recreate trigger functions
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON leads;
CREATE TRIGGER trigger_update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, metadata)
        VALUES (
            NEW.id,
            'status_change',
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_lead_status_change ON leads;
CREATE TRIGGER trigger_log_lead_status_change
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_status_change();

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_report_downloads ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view all leads" ON leads
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert leads" ON leads
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update leads" ON leads
    FOR UPDATE
    USING (true);

CREATE POLICY "Users can view lead activities" ON lead_activities
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert lead activities" ON lead_activities
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view sample downloads" ON sample_report_downloads
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert sample downloads" ON sample_report_downloads
    FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE leads IS 'Stores all lead information from various sources including sample report downloads';
COMMENT ON TABLE lead_activities IS 'Tracks all activities and interactions with leads';
COMMENT ON TABLE sample_report_downloads IS 'Tracks sample report download events for analytics';
