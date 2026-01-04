-- =====================================================
-- Migration 023: Complete Schema for All Services
-- =====================================================
-- Run this in Supabase SQL Editor
-- Covers: Scrapers, Daily Video, AI Demo, AI Guru, Call Intelligence
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: SCRAPERS TABLES
-- =====================================================

-- Job Board Signals
CREATE TABLE IF NOT EXISTS job_board_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    job_title TEXT NOT NULL,
    job_description TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(100),
    posted_date TIMESTAMP WITH TIME ZONE,
    url TEXT,
    
    -- Scoring
    relevance_score INTEGER DEFAULT 0,
    urgency_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    alerted BOOLEAN DEFAULT FALSE,
    content_hash VARCHAR(64) UNIQUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_board_signals_score ON job_board_signals(total_score DESC);
CREATE INDEX idx_job_board_signals_source ON job_board_signals(source);

-- Licensing Signals
CREATE TABLE IF NOT EXISTS licensing_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_number VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    license_type VARCHAR(100),
    status VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    state VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    
    -- Contact Info
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    
    -- Scoring
    lead_score INTEGER DEFAULT 0,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    alerted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_licensing_signals_state ON licensing_signals(state);
CREATE INDEX idx_licensing_signals_expiry ON licensing_signals(expiry_date);

-- BBB Signals
CREATE TABLE IF NOT EXISTS bbb_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bbb_id VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    rating VARCHAR(10),
    accredited BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    website TEXT,
    
    -- Complaints
    complaint_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    avg_review_score DECIMAL(3,2),
    
    -- Scoring
    lead_score INTEGER DEFAULT 0,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    alerted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bbb_signals_state ON bbb_signals(state);
CREATE INDEX idx_bbb_signals_rating ON bbb_signals(rating);

-- Local Business Signals
CREATE TABLE IF NOT EXISTS local_business_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id VARCHAR(255) UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    
    -- Contact
    phone VARCHAR(50),
    website TEXT,
    email VARCHAR(255),
    
    -- Reviews
    google_rating DECIMAL(3,2),
    google_review_count INTEGER DEFAULT 0,
    yelp_rating DECIMAL(3,2),
    yelp_review_count INTEGER DEFAULT 0,
    
    -- Business Info
    hours_of_operation JSONB,
    services_offered JSONB,
    
    -- Scoring
    lead_score INTEGER DEFAULT 0,
    
    -- Processing
    source VARCHAR(100),
    processed BOOLEAN DEFAULT FALSE,
    alerted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_local_business_signals_city ON local_business_signals(city);
CREATE INDEX idx_local_business_signals_state ON local_business_signals(state);
CREATE INDEX idx_local_business_signals_score ON local_business_signals(lead_score DESC);

-- =====================================================
-- PART 2: DAILY VIDEO TABLES
-- =====================================================

-- Video Rooms
CREATE TABLE IF NOT EXISTS video_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    
    -- Room Info
    room_name VARCHAR(255) UNIQUE NOT NULL,
    room_url TEXT,
    daily_room_id VARCHAR(255),
    
    -- Config
    privacy VARCHAR(50) DEFAULT 'private',
    max_participants INTEGER DEFAULT 10,
    enable_recording BOOLEAN DEFAULT FALSE,
    enable_chat BOOLEAN DEFAULT TRUE,
    enable_screenshare BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    total_participants INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_rooms_tenant ON video_rooms(tenant_id);
CREATE INDEX idx_video_rooms_name ON video_rooms(room_name);
CREATE INDEX idx_video_rooms_active ON video_rooms(is_active) WHERE is_active = TRUE;

-- Video Call Logs
CREATE TABLE IF NOT EXISTS video_call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES video_rooms(id) ON DELETE SET NULL,
    tenant_id UUID,
    
    -- Call Info
    call_type VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Participants
    participant_count INTEGER DEFAULT 0,
    participants JSONB DEFAULT '[]',
    
    -- Outcome
    outcome VARCHAR(100),
    notes TEXT,
    
    -- Recording
    recording_url TEXT,
    recording_duration_seconds INTEGER,
    
    -- Quality
    avg_video_quality VARCHAR(50),
    avg_audio_quality VARCHAR(50),
    connection_issues INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_call_logs_room ON video_call_logs(room_id);
CREATE INDEX idx_video_call_logs_tenant ON video_call_logs(tenant_id);
CREATE INDEX idx_video_call_logs_started ON video_call_logs(started_at DESC);

-- Video Participants
CREATE TABLE IF NOT EXISTS video_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_log_id UUID REFERENCES video_call_logs(id) ON DELETE CASCADE,
    
    -- Participant Info
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    
    -- Session
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Device Info
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    
    -- Quality
    video_enabled BOOLEAN DEFAULT TRUE,
    audio_enabled BOOLEAN DEFAULT TRUE,
    screen_shared BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_participants_call ON video_participants(call_log_id);

-- =====================================================
-- PART 3: AI DEMO MEETINGS TABLES
-- =====================================================

-- AI Demo Meetings
CREATE TABLE IF NOT EXISTS ai_demo_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    
    -- Meeting Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_type VARCHAR(50) DEFAULT 'ai_demo',
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Room
    room_name VARCHAR(255),
    room_url TEXT,
    
    -- Attendees
    host_name VARCHAR(255),
    host_email VARCHAR(255),
    attendee_name VARCHAR(255),
    attendee_email VARCHAR(255),
    attendee_phone VARCHAR(50),
    attendee_company VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- AI Shadow
    ai_shadow_enabled BOOLEAN DEFAULT TRUE,
    ai_shadow_mode VARCHAR(50) DEFAULT 'listening',
    
    -- Outcome
    outcome VARCHAR(100),
    outcome_notes TEXT,
    follow_up_scheduled BOOLEAN DEFAULT FALSE,
    converted_to_customer BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    source VARCHAR(100),
    utm_params JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_demo_meetings_tenant ON ai_demo_meetings(tenant_id);
CREATE INDEX idx_ai_demo_meetings_scheduled ON ai_demo_meetings(scheduled_at);
CREATE INDEX idx_ai_demo_meetings_status ON ai_demo_meetings(status);

-- AI Demo Analytics
CREATE TABLE IF NOT EXISTS ai_demo_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES ai_demo_meetings(id) ON DELETE CASCADE,
    
    -- Engagement Metrics
    total_duration_seconds INTEGER,
    ai_speaking_seconds INTEGER,
    human_speaking_seconds INTEGER,
    silence_seconds INTEGER,
    
    -- AI Performance
    questions_asked INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    objections_handled INTEGER DEFAULT 0,
    features_demonstrated INTEGER DEFAULT 0,
    
    -- Sentiment
    overall_sentiment VARCHAR(50),
    sentiment_timeline JSONB,
    
    -- Key Moments
    key_moments JSONB,
    pain_points_identified JSONB,
    
    -- Recommendations
    ai_recommendations JSONB,
    suggested_follow_up TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_demo_analytics_meeting ON ai_demo_analytics(meeting_id);

-- AI Shadow Sessions
CREATE TABLE IF NOT EXISTS ai_shadow_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES ai_demo_meetings(id) ON DELETE CASCADE,
    
    -- Session Info
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    mode VARCHAR(50) DEFAULT 'listening',
    
    -- Transcript
    transcript JSONB DEFAULT '[]',
    
    -- AI Insights
    real_time_suggestions JSONB DEFAULT '[]',
    competitor_mentions JSONB DEFAULT '[]',
    buying_signals JSONB DEFAULT '[]',
    objections_detected JSONB DEFAULT '[]',
    
    -- Takeover
    human_takeover_at TIMESTAMP WITH TIME ZONE,
    takeover_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_shadow_sessions_meeting ON ai_shadow_sessions(meeting_id);

-- =====================================================
-- PART 4: AI GURU TABLES
-- =====================================================

-- AI Guru Conversations
CREATE TABLE IF NOT EXISTS ai_guru_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    tenant_id UUID,
    
    -- Conversation
    title VARCHAR(255),
    messages JSONB DEFAULT '[]',
    message_count INTEGER DEFAULT 0,
    
    -- Context
    context_type VARCHAR(50),
    context_data JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_guru_conversations_user ON ai_guru_conversations(user_email);
CREATE INDEX idx_ai_guru_conversations_tenant ON ai_guru_conversations(tenant_id);

-- AI Guru Usage
CREATE TABLE IF NOT EXISTS ai_guru_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    tenant_id UUID,
    
    -- Usage
    date DATE NOT NULL,
    queries_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    
    -- Limits
    daily_limit INTEGER DEFAULT 50,
    
    UNIQUE(user_email, date)
);

CREATE INDEX idx_ai_guru_usage_user_date ON ai_guru_usage(user_email, date);

-- =====================================================
-- PART 5: CALL INTELLIGENCE TABLES
-- =====================================================

-- Call Intelligence Records
CREATE TABLE IF NOT EXISTS call_intelligence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sid VARCHAR(255) UNIQUE,
    tenant_id UUID,
    
    -- Call Info
    direction VARCHAR(20),
    from_number VARCHAR(50),
    to_number VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Status
    status VARCHAR(50),
    answered BOOLEAN DEFAULT FALSE,
    
    -- AI Analysis
    sentiment VARCHAR(50),
    sentiment_score DECIMAL(3,2),
    intent VARCHAR(100),
    urgency_level VARCHAR(50),
    
    -- Key Info Extracted
    caller_name VARCHAR(255),
    caller_company VARCHAR(255),
    issue_type VARCHAR(100),
    issue_summary TEXT,
    
    -- Quality
    audio_quality VARCHAR(50),
    silence_percentage DECIMAL(5,2),
    talk_time_percentage DECIMAL(5,2),
    
    -- Outcome
    outcome VARCHAR(100),
    follow_up_required BOOLEAN DEFAULT FALSE,
    appointment_scheduled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_call_intelligence_tenant ON call_intelligence(tenant_id);
CREATE INDEX idx_call_intelligence_started ON call_intelligence(started_at DESC);
CREATE INDEX idx_call_intelligence_sentiment ON call_intelligence(sentiment);

-- Call Transcripts
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES call_intelligence(id) ON DELETE CASCADE,
    
    -- Transcript
    full_transcript TEXT,
    segments JSONB DEFAULT '[]',
    
    -- Analysis
    keywords JSONB DEFAULT '[]',
    entities JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    
    -- Summary
    summary TEXT,
    key_points JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_call_transcripts_call ON call_transcripts(call_id);

-- Call Sentiment Timeline
CREATE TABLE IF NOT EXISTS call_sentiment_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES call_intelligence(id) ON DELETE CASCADE,
    
    -- Timeline Entry
    timestamp_seconds INTEGER NOT NULL,
    speaker VARCHAR(50),
    text TEXT,
    sentiment VARCHAR(50),
    sentiment_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_call_sentiment_call ON call_sentiment_timeline(call_id);

-- =====================================================
-- PART 6: UPDATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- =====================================================
-- SUCCESS
-- =====================================================
SELECT 'Migration 023 completed! All tables created.' as status;
