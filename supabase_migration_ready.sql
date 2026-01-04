
-- =====================================================
-- DROP EXISTING TABLES (if any) TO AVOID CONFLICTS
-- =====================================================
DROP TABLE IF EXISTS call_sentiment_timeline CASCADE;
DROP TABLE IF EXISTS call_transcripts CASCADE;
DROP TABLE IF EXISTS call_intelligence CASCADE;
DROP TABLE IF EXISTS ai_guru_usage CASCADE;
DROP TABLE IF EXISTS ai_guru_conversations CASCADE;
DROP TABLE IF EXISTS ai_shadow_sessions CASCADE;
DROP TABLE IF EXISTS ai_demo_analytics CASCADE;
DROP TABLE IF EXISTS ai_demo_meetings CASCADE;
DROP TABLE IF EXISTS video_participants CASCADE;
DROP TABLE IF EXISTS video_call_logs CASCADE;
DROP TABLE IF EXISTS video_rooms CASCADE;
DROP TABLE IF EXISTS local_business_signals CASCADE;
DROP TABLE IF EXISTS bbb_signals CASCADE;
DROP TABLE IF EXISTS licensing_signals CASCADE;
DROP TABLE IF EXISTS job_board_signals CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- =====================================================
-- JOB BOARD SIGNALS TABLE
-- =====================================================
CREATE TABLE job_board_signals (
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

-- =====================================================
-- LICENSING SIGNALS TABLE
-- =====================================================
CREATE TABLE licensing_signals (
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

-- =====================================================
-- BBB SIGNALS TABLE
-- =====================================================
CREATE TABLE bbb_signals (
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

-- =====================================================
-- LOCAL BUSINESS SIGNALS TABLE
-- =====================================================
CREATE TABLE local_business_signals (
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

-- =====================================================
-- VIDEO ROOMS TABLE
-- =====================================================
CREATE TABLE video_rooms (
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

-- =====================================================
-- VIDEO CALL LOGS TABLE
-- =====================================================
CREATE TABLE video_call_logs (
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

-- =====================================================
-- VIDEO PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE video_participants (
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

-- =====================================================
-- AI DEMO MEETINGS TABLE
-- =====================================================
CREATE TABLE ai_demo_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id VARCHAR(100) NOT NULL UNIQUE,
    room_name VARCHAR(255),
    room_url TEXT,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    customer_phone VARCHAR(50),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    status VARCHAR(50) DEFAULT 'scheduled',
    ai_shadow_enabled BOOLEAN DEFAULT TRUE,
    human_takeover BOOLEAN DEFAULT FALSE,
    takeover_time TIMESTAMP WITH TIME ZONE,
    takeover_reason TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI DEMO ANALYTICS TABLE
-- =====================================================
CREATE TABLE ai_demo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES ai_demo_meetings(id) ON DELETE CASCADE,
    total_speaking_time INTEGER DEFAULT 0,
    customer_speaking_time INTEGER DEFAULT 0,
    ai_speaking_time INTEGER DEFAULT 0,
    human_speaking_time INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    objections_raised INTEGER DEFAULT 0,
    objections_handled INTEGER DEFAULT 0,
    pain_points_identified JSONB DEFAULT '[]',
    features_discussed JSONB DEFAULT '[]',
    sentiment_timeline JSONB DEFAULT '[]',
    engagement_score DECIMAL(3,2),
    conversion_likelihood DECIMAL(3,2),
    ai_suggestions JSONB DEFAULT '[]',
    key_moments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI SHADOW SESSIONS TABLE
-- =====================================================
CREATE TABLE ai_shadow_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES ai_demo_meetings(id) ON DELETE CASCADE,
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

-- =====================================================
-- AI GURU CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE ai_guru_conversations (
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

-- =====================================================
-- AI GURU USAGE TABLE
-- =====================================================
CREATE TABLE ai_guru_usage (
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

-- =====================================================
-- CALL INTELLIGENCE TABLE
-- =====================================================
CREATE TABLE call_intelligence (
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

-- =====================================================
-- CALL TRANSCRIPTS TABLE
-- =====================================================
CREATE TABLE call_transcripts (
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

-- =====================================================
-- CALL SENTIMENT TIMELINE TABLE
-- =====================================================
CREATE TABLE call_sentiment_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID REFERENCES call_intelligence(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    sentiment VARCHAR(20) NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    trigger_phrase TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ROLES TABLE
-- =====================================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADMIN USERS TABLE
-- =====================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '[]',
    is_god_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================
CREATE INDEX idx_job_board_signals_source ON job_board_signals(source);
CREATE INDEX idx_job_board_signals_score ON job_board_signals(score DESC);
CREATE INDEX idx_licensing_signals_state ON licensing_signals(state);
CREATE INDEX idx_bbb_signals_rating ON bbb_signals(rating);
CREATE INDEX idx_local_business_signals_city ON local_business_signals(city, state);
CREATE INDEX idx_video_rooms_room_name ON video_rooms(room_name);
CREATE INDEX idx_video_call_logs_room_id ON video_call_logs(room_id);
CREATE INDEX idx_ai_demo_meetings_status ON ai_demo_meetings(status);
CREATE INDEX idx_ai_demo_meetings_scheduled ON ai_demo_meetings(scheduled_time);
CREATE INDEX idx_call_intelligence_call_sid ON call_intelligence(call_sid);
CREATE INDEX idx_call_transcripts_call_id ON call_transcripts(call_id);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- =====================================================
-- INSERT GOD ADMIN USER
-- =====================================================
INSERT INTO admin_users (
    user_id,
    email,
    role,
    permissions,
    is_god_admin,
    is_active
) VALUES (
    'ebd0b097-4a66-4597-804f-ff3a5bbdadd6',
    'Suvodkc@gmail.com',
    'god_admin',
    '["*", "admin:*", "tenant:*", "user:*", "billing:*", "system:*", "api:*", "database:*"]',
    TRUE,
    TRUE
);

INSERT INTO user_roles (
    user_id,
    role,
    permissions,
    is_active
) VALUES (
    'ebd0b097-4a66-4597-804f-ff3a5bbdadd6',
    'god_admin',
    '["*"]',
    TRUE
);
