-- Migration: Analytics Engines for Pilot Report Generation
-- Description: Database schema for all 6 critical analytics engines
-- Created: 2024-12-24

-- ============================================================================
-- 1. PILOT BASELINES
-- ============================================================================

CREATE TABLE IF NOT EXISTS pilot_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    tenant_id UUID,
    
    -- Source information
    source VARCHAR(50) NOT NULL, -- customer_reported, historical_logs, industry_benchmark, mixed
    source_details TEXT,
    confidence_level VARCHAR(20), -- high, medium, low
    
    -- Baseline metrics (JSONB for flexibility)
    metrics JSONB NOT NULL,
    
    -- Metadata
    collection_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pilot_baselines_pilot_id ON pilot_baselines(pilot_id);
CREATE INDEX idx_pilot_baselines_customer_id ON pilot_baselines(customer_id);
CREATE INDEX idx_pilot_baselines_tenant_id ON pilot_baselines(tenant_id);

COMMENT ON TABLE pilot_baselines IS 'Baseline performance data for pilot comparisons';
COMMENT ON COLUMN pilot_baselines.metrics IS 'JSON: {answer_rate, booking_delay_hours, average_handle_time_minutes, etc}';

-- ============================================================================
-- 2. ASSUMPTION SETS (Versioned)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assumption_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    confidence_level VARCHAR(20), -- high, medium, low
    
    -- Assumptions array (JSONB)
    assumptions JSONB NOT NULL,
    
    -- Changelog
    changelog TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_assumption_sets_version ON assumption_sets(version);
CREATE INDEX idx_assumption_sets_active ON assumption_sets(is_active);

COMMENT ON TABLE assumption_sets IS 'Versioned modeling assumptions for financial projections';
COMMENT ON COLUMN assumption_sets.assumptions IS 'JSON array of assumptions with key, value, source, confidence, range';

-- ============================================================================
-- 3. PILOT METRICS (Observed vs Modeled)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pilot_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) NOT NULL,
    tenant_id UUID,
    
    -- Metric details
    metric_key VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    metric_type VARCHAR(20) NOT NULL, -- observed, modeled, derived
    confidence_band VARCHAR(20), -- high, medium, low
    
    -- Provenance
    source TEXT,
    calculation TEXT,
    sample_size INTEGER,
    
    -- Metadata
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pilot_metrics_pilot_id ON pilot_metrics(pilot_id);
CREATE INDEX idx_pilot_metrics_tenant_id ON pilot_metrics(tenant_id);
CREATE INDEX idx_pilot_metrics_type ON pilot_metrics(metric_type);
CREATE INDEX idx_pilot_metrics_key ON pilot_metrics(metric_key);

COMMENT ON TABLE pilot_metrics IS 'All pilot metrics with observed/modeled/derived segregation';
COMMENT ON COLUMN pilot_metrics.metric_type IS 'CRITICAL: observed (real data), modeled (projections), derived (calculated)';

-- ============================================================================
-- 4. CALL CLASSIFICATIONS (Intent & Urgency)
-- ============================================================================

CREATE TABLE IF NOT EXISTS call_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(50) UNIQUE NOT NULL,
    pilot_id VARCHAR(50),
    tenant_id UUID,
    
    -- Classification
    intent VARCHAR(50) NOT NULL, -- emergency_repair, routine_repair, maintenance, installation_quote, etc
    urgency_level VARCHAR(20) NOT NULL, -- emergency, priority, routine
    high_intent BOOLEAN DEFAULT false,
    
    -- Keywords extracted
    intent_keywords TEXT[],
    urgency_keywords TEXT[],
    
    -- Confidence
    confidence_score DECIMAL(3,2),
    classification_method VARCHAR(50), -- llm, rule_based
    
    -- Metadata
    classified_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_call_classifications_call_id ON call_classifications(call_id);
CREATE INDEX idx_call_classifications_pilot_id ON call_classifications(pilot_id);
CREATE INDEX idx_call_classifications_tenant_id ON call_classifications(tenant_id);
CREATE INDEX idx_call_classifications_intent ON call_classifications(intent);
CREATE INDEX idx_call_classifications_high_intent ON call_classifications(high_intent);

COMMENT ON TABLE call_classifications IS 'Call intent and urgency classification for revenue modeling';

-- ============================================================================
-- 5. CAPACITY SATURATION ANALYSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS capacity_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID,
    
    -- Capacity metrics
    declared_capacity INTEGER NOT NULL,
    peak_concurrent_calls INTEGER NOT NULL,
    saturation_percentage DECIMAL(5,2),
    
    -- Saturation windows (JSONB array)
    saturation_windows JSONB,
    
    -- Impact
    calls_during_saturation INTEGER,
    estimated_missed_due_to_saturation INTEGER,
    
    -- Analysis period
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    
    -- Metadata
    analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_capacity_analyses_pilot_id ON capacity_analyses(pilot_id);
CREATE INDEX idx_capacity_analyses_tenant_id ON capacity_analyses(tenant_id);

COMMENT ON TABLE capacity_analyses IS 'Capacity saturation analysis proving capacity breach';
COMMENT ON COLUMN capacity_analyses.saturation_windows IS 'JSON array of time windows where capacity was exceeded';

-- ============================================================================
-- 6. PERFORMANCE MEASUREMENTS (Latency & System Performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(50),
    pilot_id VARCHAR(50),
    tenant_id UUID,
    
    -- Measurement details
    metric_type VARCHAR(50) NOT NULL, -- answer_latency, speech_to_response, booking_execution, etc
    value_ms DECIMAL(10,2) NOT NULL,
    target_ms DECIMAL(10,2),
    within_target BOOLEAN DEFAULT true,
    
    -- Context
    call_type VARCHAR(50),
    time_of_day INTEGER, -- 0-23
    
    -- Metadata
    measured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_measurements_pilot_id ON performance_measurements(pilot_id);
CREATE INDEX idx_performance_measurements_tenant_id ON performance_measurements(tenant_id);
CREATE INDEX idx_performance_measurements_metric_type ON performance_measurements(metric_type);
CREATE INDEX idx_performance_measurements_measured_at ON performance_measurements(measured_at);

COMMENT ON TABLE performance_measurements IS 'Real-time latency and performance measurements';
COMMENT ON COLUMN performance_measurements.value_ms IS 'Measured latency in milliseconds';

-- ============================================================================
-- 7. PERFORMANCE REPORTS (Aggregated)
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID,
    
    -- Period
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Answer latency stats
    answer_latency_p50 DECIMAL(10,2),
    answer_latency_p90 DECIMAL(10,2),
    answer_latency_p99 DECIMAL(10,2),
    answer_latency_max DECIMAL(10,2),
    
    -- Response latency stats
    response_latency_p50 DECIMAL(10,2),
    response_latency_p90 DECIMAL(10,2),
    response_latency_p99 DECIMAL(10,2),
    
    -- Booking latency stats
    booking_latency_p50 DECIMAL(10,2),
    booking_latency_p90 DECIMAL(10,2),
    
    -- Overall health
    streaming_health VARCHAR(20), -- excellent, good, degraded, critical
    total_measurements INTEGER,
    measurements_within_target INTEGER,
    target_compliance_rate DECIMAL(5,2),
    
    -- Detailed breakdown (JSONB)
    by_metric JSONB,
    by_hour JSONB,
    
    -- Metadata
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_reports_pilot_id ON performance_reports(pilot_id);
CREATE INDEX idx_performance_reports_tenant_id ON performance_reports(tenant_id);

COMMENT ON TABLE performance_reports IS 'Aggregated performance reports for pilot periods';

-- ============================================================================
-- 8. PILOT REPORTS (Generated Reports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pilot_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    tenant_id UUID,
    
    -- Report metadata
    report_type VARCHAR(50) DEFAULT 'production_pilot',
    status VARCHAR(20) DEFAULT 'draft', -- draft, generated, delivered
    
    -- Report data (JSONB for flexibility)
    executive_summary JSONB,
    pilot_snapshot JSONB,
    call_leakage_analysis JSONB,
    qualification_metrics JSONB,
    financial_model JSONB,
    technical_performance JSONB,
    methodology JSONB,
    
    -- File references
    pdf_url TEXT,
    pdf_generated_at TIMESTAMP,
    
    -- Delivery
    delivered_to VARCHAR(255),
    delivered_at TIMESTAMP,
    
    -- Metadata
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by VARCHAR(100)
);

CREATE INDEX idx_pilot_reports_pilot_id ON pilot_reports(pilot_id);
CREATE INDEX idx_pilot_reports_customer_id ON pilot_reports(customer_id);
CREATE INDEX idx_pilot_reports_tenant_id ON pilot_reports(tenant_id);
CREATE INDEX idx_pilot_reports_status ON pilot_reports(status);

COMMENT ON TABLE pilot_reports IS 'Generated pilot reports with all sections';

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pilot_baselines_updated_at
    BEFORE UPDATE ON pilot_baselines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pilot_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE assumption_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_reports ENABLE ROW LEVEL SECURITY;

-- Policies for tenant isolation
CREATE POLICY tenant_isolation_pilot_baselines ON pilot_baselines
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_pilot_metrics ON pilot_metrics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_call_classifications ON call_classifications
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_capacity_analyses ON capacity_analyses
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_performance_measurements ON performance_measurements
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_performance_reports ON performance_reports
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_pilot_reports ON pilot_reports
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Assumption sets are global (no tenant isolation)
CREATE POLICY public_read_assumption_sets ON assumption_sets
    FOR SELECT USING (true);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert default assumption set v1.0
INSERT INTO assumption_sets (version, description, confidence_level, assumptions, created_by)
VALUES (
    '1.0',
    'Default HVAC industry assumptions for pilot reports',
    'medium',
    '[
        {"key": "peak_hour_miss_rate", "value": 0.30, "range_min": 0.25, "range_max": 0.35, "source": "Industry average", "confidence": "medium"},
        {"key": "after_hours_miss_rate", "value": 0.60, "range_min": 0.55, "range_max": 0.70, "source": "Industry average", "confidence": "medium"},
        {"key": "emergency_ticket_multiplier", "value": 1.18, "range_min": 1.15, "range_max": 1.25, "source": "ServiceTitan data", "confidence": "high"},
        {"key": "conversion_rate_improvement", "value": 0.73, "range_min": 0.50, "range_max": 1.00, "source": "KestrelVoice pilot data", "confidence": "high"},
        {"key": "capture_rate_conservative", "value": 0.70, "range_min": 0.65, "range_max": 0.85, "source": "Conservative estimate", "confidence": "medium"}
    ]'::jsonb,
    'system'
) ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON pilot_baselines TO authenticated;
GRANT SELECT ON assumption_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pilot_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON call_classifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON capacity_analyses TO authenticated;
GRANT SELECT, INSERT ON performance_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON performance_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pilot_reports TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
DO $$
BEGIN
    RAISE NOTICE 'Analytics engines schema created successfully';
    RAISE NOTICE 'Tables: pilot_baselines, assumption_sets, pilot_metrics, call_classifications, capacity_analyses, performance_measurements, performance_reports, pilot_reports';
END $$;
