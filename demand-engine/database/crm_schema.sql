-- =====================================================
-- CUSTOM CRM DATABASE SCHEMA
-- =====================================================
-- Extends existing leads table with CRM functionality

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Company Association
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    department VARCHAR(100),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'USA',
    
    -- Social & Web
    linkedin_url TEXT,
    website TEXT,
    
    -- Contact Preferences
    preferred_contact_method VARCHAR(50) DEFAULT 'email', -- email, phone, sms
    timezone VARCHAR(50),
    
    -- Relationship
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    email_subscribed BOOLEAN DEFAULT TRUE,
    sms_subscribed BOOLEAN DEFAULT FALSE,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX idx_contacts_company ON contacts(company_name);
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);

-- =====================================================
-- ACTIVITIES TABLE (Timeline/History)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Association
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(50) NOT NULL, -- email, call, note, meeting, task, status_change, etc.
    subject VARCHAR(255),
    description TEXT,
    
    -- Activity Metadata
    direction VARCHAR(20), -- inbound, outbound
    outcome VARCHAR(50), -- completed, scheduled, cancelled, no_answer, etc.
    
    -- Email Specific
    email_id VARCHAR(255), -- Resend email ID
    email_status VARCHAR(50), -- sent, delivered, opened, clicked, bounced
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,
    
    -- Call Specific
    call_duration INTEGER, -- seconds
    call_recording_url TEXT,
    
    -- User Attribution
    created_by VARCHAR(100), -- user who created this activity
    
    -- Timestamps
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_date ON activities(activity_date DESC);

-- =====================================================
-- TASKS TABLE (Follow-ups & To-dos)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Association
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Task Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50), -- call, email, meeting, follow_up, demo, proposal
    
    -- Status & Priority
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Scheduling
    due_date TIMESTAMP WITH TIME ZONE,
    reminder_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_to VARCHAR(100),
    created_by VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- =====================================================
-- EMAIL CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Campaign Details
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255),
    
    -- Content
    html_content TEXT,
    text_content TEXT,
    template_id VARCHAR(100),
    
    -- Targeting
    target_segment JSONB, -- Filter criteria for recipients
    recipient_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance Metrics
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(100),
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_created ON email_campaigns(created_at DESC);

-- =====================================================
-- EMAIL CAMPAIGN RECIPIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Association
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Email Details
    email VARCHAR(255) NOT NULL,
    resend_email_id VARCHAR(255), -- ID from Resend API
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
    
    -- Engagement
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    
    opens_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Error Tracking
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, contact_id)
);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_contact ON campaign_recipients(contact_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);

-- =====================================================
-- EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- welcome, follow_up, nurture, promotional, etc.
    
    -- Content
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255),
    html_content TEXT NOT NULL,
    text_content TEXT,
    
    -- Variables
    variables JSONB DEFAULT '[]'::jsonb, -- List of available variables
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage Stats
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by VARCHAR(100),
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON email_templates(category);
CREATE INDEX idx_templates_active ON email_templates(is_active);

-- =====================================================
-- SCRAPER JOBS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS scraper_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Job Details
    scraper_type VARCHAR(50) NOT NULL, -- reddit, job_board, licensing
    job_name VARCHAR(255),
    
    -- Configuration
    config JSONB DEFAULT '{}'::jsonb, -- Scraper-specific config
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    
    -- Results
    signals_found INTEGER DEFAULT 0,
    signals_new INTEGER DEFAULT 0,
    signals_updated INTEGER DEFAULT 0,
    
    -- Execution
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Error Tracking
    error_message TEXT,
    error_details JSONB,
    
    -- Metadata
    triggered_by VARCHAR(100), -- manual, scheduled, api
    triggered_by_user VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scraper_jobs_type ON scraper_jobs(scraper_type);
CREATE INDEX idx_scraper_jobs_status ON scraper_jobs(status);
CREATE INDEX idx_scraper_jobs_created ON scraper_jobs(created_at DESC);

-- =====================================================
-- PIPELINE STAGES TABLE (Customizable)
-- =====================================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Stage Details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20), -- hex color for UI
    
    -- Ordering
    position INTEGER NOT NULL,
    
    -- Stage Type
    is_closed BOOLEAN DEFAULT FALSE, -- true for won/lost stages
    is_won BOOLEAN DEFAULT FALSE, -- true for won stage
    
    -- Automation
    auto_create_task BOOLEAN DEFAULT FALSE,
    task_template JSONB,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipeline_stages_position ON pipeline_stages(position);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, description, color, position, is_closed, is_won) VALUES
    ('New', 'Newly captured leads', '#3b82f6', 1, false, false),
    ('Contacted', 'Initial contact made', '#8b5cf6', 2, false, false),
    ('Qualified', 'Lead has been qualified', '#f59e0b', 3, false, false),
    ('Demo Scheduled', 'Demo or meeting scheduled', '#10b981', 4, false, false),
    ('Proposal Sent', 'Proposal or quote sent', '#06b6d4', 5, false, false),
    ('Negotiation', 'In negotiation phase', '#f97316', 6, false, false),
    ('Won', 'Deal closed - won', '#22c55e', 7, true, true),
    ('Lost', 'Deal closed - lost', '#ef4444', 8, true, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- NOTES TABLE (Separate from activities for better organization)
-- =====================================================
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Association
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Note Content
    content TEXT NOT NULL,
    
    -- Metadata
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_lead_id ON notes(lead_id);
CREATE INDEX idx_notes_contact_id ON notes(contact_id);
CREATE INDEX idx_notes_created ON notes(created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
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
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Lead Pipeline View with Contact Info
CREATE OR REPLACE VIEW lead_pipeline_view AS
SELECT 
    l.id,
    l.business_name,
    l.contact_name,
    l.email,
    l.phone,
    l.city,
    l.state,
    l.business_type,
    l.lead_score,
    l.tier,
    l.status,
    l.source_type,
    l.created_at,
    l.updated_at,
    l.last_contact_at,
    l.next_follow_up_at,
    ps.name as stage_name,
    ps.color as stage_color,
    ps.position as stage_position,
    COUNT(DISTINCT c.id) as contact_count,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
    COUNT(DISTINCT a.id) as activity_count,
    MAX(a.activity_date) as last_activity_date
FROM leads l
LEFT JOIN pipeline_stages ps ON l.status = LOWER(REPLACE(ps.name, ' ', '_'))
LEFT JOIN contacts c ON c.lead_id = l.id AND c.deleted_at IS NULL
LEFT JOIN tasks t ON t.lead_id = l.id
LEFT JOIN activities a ON a.lead_id = l.id
GROUP BY l.id, ps.name, ps.color, ps.position;

-- Campaign Performance View
CREATE OR REPLACE VIEW campaign_performance_view AS
SELECT 
    ec.id,
    ec.name,
    ec.subject,
    ec.status,
    ec.scheduled_at,
    ec.sent_at,
    ec.total_sent,
    ec.total_delivered,
    ec.total_opened,
    ec.total_clicked,
    ec.total_bounced,
    CASE 
        WHEN ec.total_delivered > 0 
        THEN ROUND((ec.total_opened::NUMERIC / ec.total_delivered::NUMERIC * 100), 2)
        ELSE 0 
    END as open_rate,
    CASE 
        WHEN ec.total_delivered > 0 
        THEN ROUND((ec.total_clicked::NUMERIC / ec.total_delivered::NUMERIC * 100), 2)
        ELSE 0 
    END as click_rate,
    ec.created_at
FROM email_campaigns ec
ORDER BY ec.created_at DESC;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Add sample email template
INSERT INTO email_templates (name, description, category, subject, preview_text, html_content, text_content, variables)
VALUES (
    'Welcome Email',
    'Welcome new leads who submitted the calculator',
    'welcome',
    'Welcome to {{company_name}} - Your ROI Report is Ready!',
    'Thanks for using our calculator. Here''s your personalized report.',
    '<html><body><h1>Welcome {{contact_name}}!</h1><p>Thank you for using our ROI calculator. Your personalized report is attached.</p><p>Best regards,<br>{{company_name}}</p></body></html>',
    'Welcome {{contact_name}}! Thank you for using our ROI calculator. Your personalized report is attached. Best regards, {{company_name}}',
    '["contact_name", "company_name", "business_type"]'::jsonb
)
ON CONFLICT DO NOTHING;
