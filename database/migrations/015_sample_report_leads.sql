-- Migration: Sample Report Leads Tracking
-- Description: Add tables and fields for tracking sample report downloads and lead capture

-- Add leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    company VARCHAR(255) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    number_of_technicians VARCHAR(50),
    current_call_volume VARCHAR(50),
    primary_challenge VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT 'unknown',
    lead_type VARCHAR(50) NOT NULL DEFAULT 'general',
    report_title VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_to UUID REFERENCES users(id),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    conversion_value DECIMAL(10, 2)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Add lead activities tracking
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- Add sample report downloads tracking
CREATE TABLE IF NOT EXISTS sample_report_downloads (
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

CREATE INDEX IF NOT EXISTS idx_sample_downloads_lead_id ON sample_report_downloads(lead_id);
CREATE INDEX IF NOT EXISTS idx_sample_downloads_email ON sample_report_downloads(email);
CREATE INDEX IF NOT EXISTS idx_sample_downloads_date ON sample_report_downloads(downloaded_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- Add function to automatically create lead activity on status change
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

CREATE TRIGGER trigger_log_lead_status_change
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_status_change();

-- Add RLS policies for leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all leads" ON leads
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert leads" ON leads
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update assigned leads" ON leads
    FOR UPDATE
    USING (assigned_to = auth.uid() OR auth.uid() IN (
        SELECT id FROM users WHERE role IN ('admin', 'manager')
    ));

-- Add RLS policies for lead_activities
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lead activities" ON lead_activities
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert lead activities" ON lead_activities
    FOR INSERT
    WITH CHECK (true);

-- Add RLS policies for sample_report_downloads
ALTER TABLE sample_report_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sample downloads" ON sample_report_downloads
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert sample downloads" ON sample_report_downloads
    FOR INSERT
    WITH CHECK (true);

-- Insert sample data for testing (optional)
-- INSERT INTO leads (first_name, last_name, email, phone, company, job_title, source, lead_type, status)
-- VALUES 
--     ('John', 'Smith', 'john@comfortprohvac.com', '(555) 123-4567', 'Comfort Pro HVAC', 'Owner', 'sample_report', 'sample_report', 'new'),
--     ('Sarah', 'Johnson', 'sarah@coolairservices.com', '(555) 234-5678', 'Cool Air Services', 'Operations Manager', 'sample_report', 'sample_report', 'contacted');

COMMENT ON TABLE leads IS 'Stores all lead information from various sources including sample report downloads';
COMMENT ON TABLE lead_activities IS 'Tracks all activities and interactions with leads';
COMMENT ON TABLE sample_report_downloads IS 'Tracks sample report download events for analytics';
