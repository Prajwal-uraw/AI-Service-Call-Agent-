-- =====================================================
-- MISSING TABLES ONLY - Run in Supabase SQL Editor
-- =====================================================

-- Job Board Signals
CREATE TABLE IF NOT EXISTS job_board_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    job_title VARCHAR(255),
    location VARCHAR(255),
    job_url TEXT,
    description TEXT,
    salary_range VARCHAR(100),
    posted_date TIMESTAMP WITH TIME ZONE,
    signal_type VARCHAR(50) DEFAULT 'hiring',
    pain_indicators JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licensing Signals
CREATE TABLE IF NOT EXISTS licensing_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state VARCHAR(50) NOT NULL,
    license_type VARCHAR(100),
    business_name VARCHAR(255),
    license_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    signal_type VARCHAR(50) DEFAULT 'new_license',
    score INTEGER DEFAULT 0,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BBB Signals
CREATE TABLE IF NOT EXISTS bbb_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    bbb_url TEXT,
    rating VARCHAR(10),
    accredited BOOLEAN DEFAULT FALSE,
    complaints_count INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    category VARCHAR(100),
    location VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    signal_type VARCHAR(50) DEFAULT 'competitor',
    pain_indicators JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Local Business Signals
CREATE TABLE IF NOT EXISTS local_business_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(100) NOT NULL,
    business_name VARCHAR(255),
    category VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    website TEXT,
    google_rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    years_in_business INTEGER,
    employee_count VARCHAR(50),
    revenue_estimate VARCHAR(100),
    signal_type VARCHAR(50) DEFAULT 'prospect',
    pain_indicators JSONB DEFAULT '[]',
    score INTEGER DEFAULT 0,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Rooms
CREATE TABLE IF NOT EXISTS video_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(255) NOT NULL UNIQUE,
    room_url TEXT NOT NULL,
    privacy VARCHAR(20) DEFAULT 'public',
    meeting_type VARCHAR(50) DEFAULT 'demo',
    created_by UUID,
    properties JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Call Logs
CREATE TABLE IF NOT EXISTS video_call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES video_rooms(id) ON DELETE CASCADE,
    room_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    participant_count INTEGER DEFAULT 0,
    recording_url TEXT,
    transcript TEXT,
    summary TEXT,
    sentiment_score DECIMAL(3,2),
    key_topics JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Participants
CREATE TABLE IF NOT EXISTS video_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES video_call_logs(id) ON DELETE CASCADE,
    user_id UUID,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    join_time TIMESTAMP WITH TIME ZONE NOT NULL,
    leave_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    is_host BOOLEAN DEFAULT FALSE,
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Shadow Sessions
CREATE TABLE IF NOT EXISTS ai_shadow_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID,
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    suggestions_made INTEGER DEFAULT 0,
    suggestions_used INTEGER DEFAULT 0,
    real_time_coaching JSONB DEFAULT '[]',
    competitor_mentions JSONB DEFAULT '[]',
    pricing_discussions JSONB DEFAULT '[]',
    next_steps_suggested JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Guru Conversations
CREATE TABLE IF NOT EXISTS ai_guru_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    is_business_related BOOLEAN DEFAULT TRUE,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Guru Usage
CREATE TABLE IF NOT EXISTS ai_guru_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(255),
    date DATE NOT NULL,
    business_queries INTEGER DEFAULT 0,
    personal_queries INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, date)
);

-- Call Intelligence
CREATE TABLE IF NOT EXISTS call_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_sid VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    direction VARCHAR(20),
    duration INTEGER,
    status VARCHAR(50),
    recording_url TEXT,
    transcript_status VARCHAR(50) DEFAULT 'pending',
    analysis_status VARCHAR(50) DEFAULT 'pending',
    overall_sentiment VARCHAR(20),
    sentiment_score DECIMAL(3,2),
    customer_satisfaction INTEGER,
    quality_score INTEGER,
    key_topics JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    customer_intent VARCHAR(100),
    objections_raised JSONB DEFAULT '[]',
    resolution_status VARCHAR(50),
    agent_performance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call Transcripts
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES call_intelligence(id) ON DELETE CASCADE,
    call_sid VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    speaker VARCHAR(20) NOT NULL,
    text TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.0,
    sentiment VARCHAR(20),
    keywords JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Call Sentiment Timeline
CREATE TABLE IF NOT EXISTS call_sentiment_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES call_intelligence(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment VARCHAR(20) NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    trigger_phrase TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_board_signals_source ON job_board_signals(source);
CREATE INDEX IF NOT EXISTS idx_licensing_signals_state ON licensing_signals(state);
CREATE INDEX IF NOT EXISTS idx_bbb_signals_rating ON bbb_signals(rating);
CREATE INDEX IF NOT EXISTS idx_local_business_signals_city ON local_business_signals(city, state);
CREATE INDEX IF NOT EXISTS idx_video_rooms_room_name ON video_rooms(room_name);
CREATE INDEX IF NOT EXISTS idx_video_call_logs_room_id ON video_call_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_call_intelligence_call_sid ON call_intelligence(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts(call_id);
