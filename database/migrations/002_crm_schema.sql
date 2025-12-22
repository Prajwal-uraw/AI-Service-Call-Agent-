-- =====================================================
-- Migration 002: CRM Schema
-- =====================================================
-- Description: Complete CRM tables for contacts, activities, tasks, email marketing, and scrapers
-- Created: Phase 4
-- Run Order: 2

-- =====================================================
-- 1. CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Professional Information
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    department VARCHAR(100),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    
    -- Communication Preferences
    email_subscribed BOOLEAN DEFAULT TRUE,
    sms_subscribed BOOLEAN DEFAULT FALSE,
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    
    -- Social & Web
    linkedin_url TEXT,
    website_url TEXT,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- =====================================================
-- 2. ACTIVITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL, -- email, call, meeting, note, etc.
    subject VARCHAR(255),
    description TEXT,
    
    -- Email Specific
    email_message_id VARCHAR(255),
    email_opened BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    email_opened_at TIMESTAMP,
    email_clicked_at TIMESTAMP,
    
    -- Call Specific
    call_duration INTEGER, -- seconds
    call_recording_url TEXT,
    
    -- Meeting Specific
    meeting_date TIMESTAMP,
    meeting_duration INTEGER, -- minutes
    meeting_location TEXT,
    
    -- Metadata
    outcome VARCHAR(50),
    notes TEXT,
    attachments JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- =====================================================
-- 3. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Task Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL, -- call, email, follow_up, demo, proposal, etc.
    
    -- Status & Priority
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Scheduling
    due_date TIMESTAMP,
    reminder_date TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Assignment
    assigned_to VARCHAR(255),
    
    -- Metadata
    notes TEXT,
    custom_fields JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- =====================================================
-- 4. EMAIL CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Campaign Details
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255),
    
    -- Content
    template_id UUID,
    html_content TEXT,
    text_content TEXT,
    
    -- Sending
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Targeting
    target_tier VARCHAR(20), -- hot, warm, cold, nurture
    target_tags TEXT[],
    
    -- Tracking
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- =====================================================
-- 5. CAMPAIGN RECIPIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Recipient Info
    email VARCHAR(255) NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
    
    -- Tracking
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    
    -- Engagement
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Error Handling
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Content
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    
    -- Variables
    variables JSONB, -- {name, description, default_value}
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- =====================================================
-- 7. SCRAPER JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS scraper_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Job Details
    scraper_type VARCHAR(50) NOT NULL, -- reddit, job_board, licensing, etc.
    job_name VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    
    -- Results
    signals_found INTEGER DEFAULT 0,
    signals_new INTEGER DEFAULT 0,
    signals_duplicate INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Configuration
    config JSONB,
    
    -- Error Handling
    error_message TEXT,
    
    -- Metadata
    triggered_by VARCHAR(50) DEFAULT 'manual', -- manual, scheduled, api
    triggered_by_user VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 8. PIPELINE STAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Stage Details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    
    -- Configuration
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, description, stage_order, color) VALUES
    ('New', 'Newly identified leads', 1, 'gray'),
    ('Contacted', 'Initial contact made', 2, 'blue'),
    ('Qualified', 'Lead has been qualified', 3, 'cyan'),
    ('Proposal', 'Proposal sent', 4, 'yellow'),
    ('Negotiation', 'In negotiation phase', 5, 'orange'),
    ('Closed Won', 'Deal closed successfully', 6, 'green'),
    ('Closed Lost', 'Deal lost', 7, 'red'),
    ('Nurture', 'Long-term nurturing', 8, 'purple')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Note Content
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general', -- general, call_note, meeting_note, etc.
    
    -- Metadata
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Contacts
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at ON contacts(deleted_at);

-- Activities
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

-- Email Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON email_campaigns(scheduled_at);

-- Campaign Recipients
CREATE INDEX IF NOT EXISTS idx_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recipients_lead_id ON campaign_recipients(lead_id);
CREATE INDEX IF NOT EXISTS idx_recipients_status ON campaign_recipients(status);

-- Scraper Jobs
CREATE INDEX IF NOT EXISTS idx_scraper_jobs_type ON scraper_jobs(scraper_type);
CREATE INDEX IF NOT EXISTS idx_scraper_jobs_status ON scraper_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraper_jobs_created_at ON scraper_jobs(created_at);

-- Notes
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_notes_contact_id ON notes(contact_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- Lead Pipeline View
CREATE OR REPLACE VIEW lead_pipeline_view AS
SELECT 
    l.id,
    l.business_name,
    l.contact_name,
    l.email,
    l.phone,
    l.lead_score,
    l.tier,
    l.status,
    l.source_type,
    l.created_at,
    l.last_contact_at,
    l.next_follow_up_at,
    ps.name as stage_name,
    ps.stage_order,
    COUNT(DISTINCT c.id) as contact_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
    COUNT(DISTINCT a.id) as activity_count
FROM leads l
LEFT JOIN pipeline_stages ps ON l.status = ps.name
LEFT JOIN contacts c ON c.lead_id = l.id AND c.deleted_at IS NULL
LEFT JOIN tasks t ON t.lead_id = l.id
LEFT JOIN activities a ON a.lead_id = l.id
GROUP BY l.id, ps.name, ps.stage_order;

-- Campaign Performance View
CREATE OR REPLACE VIEW campaign_performance_view AS
SELECT 
    ec.id,
    ec.name,
    ec.subject,
    ec.status,
    ec.sent_at,
    ec.total_recipients,
    ec.total_sent,
    ec.total_delivered,
    ec.total_opened,
    ec.total_clicked,
    ec.total_bounced,
    CASE 
        WHEN ec.total_delivered > 0 
        THEN ROUND((ec.total_opened::DECIMAL / ec.total_delivered) * 100, 2)
        ELSE 0 
    END as open_rate,
    CASE 
        WHEN ec.total_delivered > 0 
        THEN ROUND((ec.total_clicked::DECIMAL / ec.total_delivered) * 100, 2)
        ELSE 0 
    END as click_rate
FROM email_campaigns ec;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE contacts IS 'Contact information for leads';
COMMENT ON TABLE activities IS 'Activity tracking for leads and contacts';
COMMENT ON TABLE tasks IS 'Task management for follow-ups and reminders';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns';
COMMENT ON TABLE campaign_recipients IS 'Campaign recipient tracking';
COMMENT ON TABLE email_templates IS 'Reusable email templates';
COMMENT ON TABLE scraper_jobs IS 'Scraper job tracking and results';
COMMENT ON TABLE pipeline_stages IS 'CRM pipeline stages configuration';
COMMENT ON TABLE notes IS 'Notes attached to leads and contacts';
