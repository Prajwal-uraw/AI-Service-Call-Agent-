-- Migration 004: AI Demo Sales Agent Tables
-- Creates tables for AI-powered demo calls with Daily.co integration

-- AI Demo Meetings Table
CREATE TABLE IF NOT EXISTS ai_demo_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Customer Info
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Scheduling
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    duration_minutes INTEGER DEFAULT 15,
    
    -- Daily.co Integration
    daily_room_name VARCHAR(255) UNIQUE NOT NULL,
    daily_room_url TEXT NOT NULL,
    customer_token TEXT,
    ai_token TEXT,
    shadow_token TEXT,
    
    -- Calendar Integration
    calendar_event_id VARCHAR(255),
    calendar_provider VARCHAR(50), -- 'google', 'outlook', 'cal.com'
    
    -- Meeting Status
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'ai_joined', 'in_progress', 'completed', 'cancelled', 'no_show'
    ai_joined_at TIMESTAMP WITH TIME ZONE,
    customer_joined_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    actual_duration_seconds INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    notes TEXT
);

-- AI Demo Call Logs Table (detailed interaction tracking)
CREATE TABLE IF NOT EXISTS ai_demo_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES ai_demo_meetings(id) ON DELETE CASCADE,
    
    -- Call Flow Tracking
    current_phase VARCHAR(50), -- 'framing', 'discovery', 'pitch', 'close', 'exit'
    phases_completed TEXT[], -- Array of completed phases
    phase_timestamps JSONB, -- {"framing": "2025-12-22T14:01:00Z", ...}
    
    -- Transcript
    full_transcript JSONB, -- Array of {speaker, text, timestamp, duration}
    transcript_url TEXT,
    
    -- AI Performance
    ai_speaking_time_seconds INTEGER,
    ai_turn_count INTEGER,
    ai_avg_response_time_ms INTEGER,
    ai_interruptions INTEGER,
    
    -- Customer Engagement
    customer_speaking_time_seconds INTEGER,
    customer_turn_count INTEGER,
    customer_questions_count INTEGER,
    customer_objections TEXT[],
    
    -- Qualification Results
    icp_fit BOOLEAN,
    icp_fit_score DECIMAL(3,2), -- 0.00 to 1.00
    urgency_level VARCHAR(20), -- 'low', 'medium', 'high'
    authority_level VARCHAR(50), -- 'owner', 'manager', 'staff', 'unknown'
    budget_indicator VARCHAR(50),
    
    -- Discovery Answers
    daily_call_volume INTEGER,
    biggest_challenge TEXT,
    current_automation TEXT,
    pain_points TEXT[],
    
    -- Outcome
    cta_taken VARCHAR(100), -- 'book_human_call', 'start_trial', 'get_deck', 'none'
    cta_details JSONB,
    next_step TEXT,
    follow_up_scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Human Intervention
    human_takeover BOOLEAN DEFAULT FALSE,
    takeover_timestamp TIMESTAMP WITH TIME ZONE,
    takeover_reason VARCHAR(255),
    takeover_user VARCHAR(255),
    
    -- Cost Tracking
    ai_cost_usd DECIMAL(10,4),
    stt_cost_usd DECIMAL(10,4),
    llm_cost_usd DECIMAL(10,4),
    tts_cost_usd DECIMAL(10,4),
    total_tokens_used INTEGER,
    
    -- Recording
    recording_url TEXT,
    recording_duration_seconds INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Demo Phase Events (granular tracking)
CREATE TABLE IF NOT EXISTS ai_demo_phase_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES ai_demo_meetings(id) ON DELETE CASCADE,
    
    -- Event Details
    phase VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'phase_start', 'phase_end', 'question_asked', 'objection_detected', 'cta_presented', etc.
    event_data JSONB,
    
    -- Timing
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,
    
    -- Context
    speaker VARCHAR(50), -- 'ai', 'customer', 'human'
    content TEXT,
    
    -- AI Metrics
    model_used VARCHAR(100),
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    latency_ms INTEGER
);

-- AI Demo Analytics (aggregated metrics)
CREATE TABLE IF NOT EXISTS ai_demo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    
    -- Volume Metrics
    total_demos_scheduled INTEGER DEFAULT 0,
    total_demos_completed INTEGER DEFAULT 0,
    total_demos_no_show INTEGER DEFAULT 0,
    total_demos_cancelled INTEGER DEFAULT 0,
    
    -- Success Metrics
    icp_fit_count INTEGER DEFAULT 0,
    icp_fit_rate DECIMAL(5,2),
    cta_conversion_count INTEGER DEFAULT 0,
    cta_conversion_rate DECIMAL(5,2),
    
    -- CTA Breakdown
    cta_book_call_count INTEGER DEFAULT 0,
    cta_start_trial_count INTEGER DEFAULT 0,
    cta_get_deck_count INTEGER DEFAULT 0,
    
    -- Quality Metrics
    avg_demo_duration_seconds INTEGER,
    avg_ai_speaking_time_seconds INTEGER,
    avg_customer_engagement_score DECIMAL(3,2),
    
    -- Human Intervention
    human_takeover_count INTEGER DEFAULT 0,
    human_takeover_rate DECIMAL(5,2),
    
    -- Cost Metrics
    total_ai_cost_usd DECIMAL(10,2),
    avg_cost_per_demo_usd DECIMAL(10,4),
    
    -- Performance Metrics
    avg_latency_ms INTEGER,
    avg_ai_response_time_ms INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date)
);

-- Shadow Users (humans who can observe/takeover)
CREATE TABLE IF NOT EXISTS ai_demo_shadow_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100), -- 'sales', 'support', 'admin'
    
    -- Permissions
    can_shadow BOOLEAN DEFAULT TRUE,
    can_takeover BOOLEAN DEFAULT TRUE,
    can_view_analytics BOOLEAN DEFAULT TRUE,
    
    -- Activity Tracking
    total_shadows INTEGER DEFAULT 0,
    total_takeovers INTEGER DEFAULT 0,
    last_shadow_at TIMESTAMP WITH TIME ZONE,
    last_takeover_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for Performance
CREATE INDEX idx_ai_demo_meetings_status ON ai_demo_meetings(status);
CREATE INDEX idx_ai_demo_meetings_scheduled_time ON ai_demo_meetings(scheduled_time);
CREATE INDEX idx_ai_demo_meetings_customer_email ON ai_demo_meetings(customer_email);
CREATE INDEX idx_ai_demo_meetings_created_at ON ai_demo_meetings(created_at);

CREATE INDEX idx_ai_demo_call_logs_meeting_id ON ai_demo_call_logs(meeting_id);
CREATE INDEX idx_ai_demo_call_logs_icp_fit ON ai_demo_call_logs(icp_fit);
CREATE INDEX idx_ai_demo_call_logs_cta_taken ON ai_demo_call_logs(cta_taken);

CREATE INDEX idx_ai_demo_phase_events_meeting_id ON ai_demo_phase_events(meeting_id);
CREATE INDEX idx_ai_demo_phase_events_phase ON ai_demo_phase_events(phase);
CREATE INDEX idx_ai_demo_phase_events_timestamp ON ai_demo_phase_events(timestamp);

CREATE INDEX idx_ai_demo_analytics_date ON ai_demo_analytics(date);

CREATE INDEX idx_ai_demo_shadow_users_email ON ai_demo_shadow_users(user_email);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_demo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_demo_meetings_updated_at
    BEFORE UPDATE ON ai_demo_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_demo_updated_at();

CREATE TRIGGER ai_demo_call_logs_updated_at
    BEFORE UPDATE ON ai_demo_call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_demo_updated_at();

CREATE TRIGGER ai_demo_analytics_updated_at
    BEFORE UPDATE ON ai_demo_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_demo_updated_at();

CREATE TRIGGER ai_demo_shadow_users_updated_at
    BEFORE UPDATE ON ai_demo_shadow_users
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_demo_updated_at();

-- Sample Shadow User (for testing)
INSERT INTO ai_demo_shadow_users (user_email, user_name, user_role, can_shadow, can_takeover, can_view_analytics)
VALUES ('admin@kestrel.ai', 'Admin User', 'admin', TRUE, TRUE, TRUE)
ON CONFLICT (user_email) DO NOTHING;

COMMENT ON TABLE ai_demo_meetings IS 'Stores scheduled AI demo meetings with Daily.co room details';
COMMENT ON TABLE ai_demo_call_logs IS 'Detailed logs of AI demo calls including transcript, qualification, and outcomes';
COMMENT ON TABLE ai_demo_phase_events IS 'Granular event tracking for each phase of the AI demo';
COMMENT ON TABLE ai_demo_analytics IS 'Daily aggregated analytics for AI demo performance';
COMMENT ON TABLE ai_demo_shadow_users IS 'Users who can shadow and take over AI demo calls';
