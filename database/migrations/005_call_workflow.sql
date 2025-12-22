-- Migration 005: Call Workflow Enhancements
-- Adds forwarding config, call tracking, and analytics

-- Add forwarding configuration to tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS forward_number VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS enable_recording BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_calls_used INTEGER DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_calls_limit INTEGER DEFAULT 20;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS missed_call_sms_enabled BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS missed_call_sms_template TEXT DEFAULT 'Sorry we missed your call! We''ll call you back during business hours (8am-6pm). - KC Comfort Air';

-- Add call status tracking
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS is_missed BOOLEAN DEFAULT false;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS is_after_hours BOOLEAN DEFAULT false;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS is_dropped BOOLEAN DEFAULT false;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT false;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS sms_sid VARCHAR(50);
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS recording_duration INTEGER;

-- Create weekly analytics table
CREATE TABLE IF NOT EXISTS weekly_analytics (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Call metrics
    total_calls INTEGER DEFAULT 0,
    answered_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    dropped_calls INTEGER DEFAULT 0,
    after_hours_calls INTEGER DEFAULT 0,
    
    -- Duration metrics
    total_duration_seconds INTEGER DEFAULT 0,
    avg_duration_seconds INTEGER DEFAULT 0,
    
    -- AI metrics
    ai_handled_calls INTEGER DEFAULT 0,
    human_transferred_calls INTEGER DEFAULT 0,
    
    -- Issue breakdown
    ac_issues INTEGER DEFAULT 0,
    heating_issues INTEGER DEFAULT 0,
    maintenance_issues INTEGER DEFAULT 0,
    emergency_issues INTEGER DEFAULT 0,
    
    -- Sentiment
    avg_sentiment_score FLOAT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_analytics_tenant ON weekly_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_weekly_analytics_week ON weekly_analytics(week_start_date);

-- Create call events table for detailed tracking
CREATE TABLE IF NOT EXISTS call_events (
    id SERIAL PRIMARY KEY,
    call_sid VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'started', 'answered', 'missed', 'dropped', 'transferred', 'completed'
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_events_sid ON call_events(call_sid);
CREATE INDEX IF NOT EXISTS idx_call_events_type ON call_events(event_type);

-- Function to update weekly analytics
CREATE OR REPLACE FUNCTION update_weekly_analytics()
RETURNS TRIGGER AS $$
DECLARE
    week_start DATE;
    week_end DATE;
    tenant_id_val INTEGER;
BEGIN
    -- Get week boundaries (Monday to Sunday)
    week_start := DATE_TRUNC('week', NEW.created_at)::DATE;
    week_end := week_start + INTERVAL '6 days';
    
    -- Get tenant_id (assuming it exists in call_logs or can be derived)
    -- For now, using a default tenant_id of 1
    tenant_id_val := 1;
    
    -- Insert or update weekly analytics
    INSERT INTO weekly_analytics (
        tenant_id,
        week_start_date,
        week_end_date,
        total_calls,
        answered_calls,
        missed_calls,
        dropped_calls,
        after_hours_calls
    ) VALUES (
        tenant_id_val,
        week_start,
        week_end,
        1,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_missed THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_dropped THEN 1 ELSE 0 END,
        CASE WHEN NEW.is_after_hours THEN 1 ELSE 0 END
    )
    ON CONFLICT (tenant_id, week_start_date)
    DO UPDATE SET
        total_calls = weekly_analytics.total_calls + 1,
        answered_calls = weekly_analytics.answered_calls + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        missed_calls = weekly_analytics.missed_calls + CASE WHEN NEW.is_missed THEN 1 ELSE 0 END,
        dropped_calls = weekly_analytics.dropped_calls + CASE WHEN NEW.is_dropped THEN 1 ELSE 0 END,
        after_hours_calls = weekly_analytics.after_hours_calls + CASE WHEN NEW.is_after_hours THEN 1 ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic weekly analytics updates
DROP TRIGGER IF EXISTS trigger_update_weekly_analytics ON call_logs;
CREATE TRIGGER trigger_update_weekly_analytics
    AFTER INSERT OR UPDATE ON call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_analytics();

-- Comments
COMMENT ON COLUMN tenants.forward_number IS 'Phone number to forward calls to';
COMMENT ON COLUMN tenants.enable_recording IS 'Whether to record calls for this tenant';
COMMENT ON COLUMN tenants.ai_calls_used IS 'Number of AI-analyzed calls used';
COMMENT ON COLUMN tenants.ai_calls_limit IS 'Maximum AI-analyzed calls allowed';
COMMENT ON COLUMN call_logs.is_missed IS 'Call was not answered';
COMMENT ON COLUMN call_logs.is_after_hours IS 'Call received outside business hours';
COMMENT ON COLUMN call_logs.is_dropped IS 'Call was dropped/failed';
COMMENT ON TABLE weekly_analytics IS 'Weekly aggregated call analytics per tenant';
