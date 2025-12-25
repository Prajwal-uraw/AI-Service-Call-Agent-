-- Migration: Analytics Engines for Pilot Report Generation (DROP then CREATE)
-- Description: Database schema for all 6 critical analytics engines
-- Created: 2024-12-24

-- ============================================================================
-- DROP ALL EXISTING OBJECTS FIRST
-- ============================================================================

-- Drop indexes
DROP INDEX IF EXISTS idx_pilot_baselines_pilot_id;
DROP INDEX IF EXISTS idx_pilot_baselines_customer_id;
DROP INDEX IF EXISTS idx_pilot_baselines_tenant_id;
DROP INDEX IF EXISTS idx_assumption_sets_version;
DROP INDEX IF EXISTS idx_assumption_sets_active;
DROP INDEX IF EXISTS idx_pilot_metrics_pilot_id;
DROP INDEX IF EXISTS idx_pilot_metrics_tenant_id;
DROP INDEX IF EXISTS idx_pilot_metrics_type;
DROP INDEX IF EXISTS idx_pilot_metrics_key;
DROP INDEX IF EXISTS idx_call_classifications_pilot_id;
DROP INDEX IF EXISTS idx_call_classifications_tenant_id;
DROP INDEX IF EXISTS idx_call_classifications_intent;
DROP INDEX IF EXISTS idx_call_classifications_urgency;
DROP INDEX IF EXISTS idx_capacity_analyses_pilot_id;
DROP INDEX IF EXISTS idx_capacity_analyses_tenant_id;
DROP INDEX IF EXISTS idx_capacity_analyses_breach;
DROP INDEX IF EXISTS idx_performance_measurements_pilot_id;
DROP INDEX IF EXISTS idx_performance_measurements_tenant_id;
DROP INDEX IF EXISTS idx_performance_measurements_type;
DROP INDEX IF EXISTS idx_performance_reports_pilot_id;
DROP INDEX IF EXISTS idx_performance_reports_tenant_id;
DROP INDEX IF EXISTS idx_pilot_reports_pilot_id;
DROP INDEX IF EXISTS idx_pilot_reports_customer_id;
DROP INDEX IF EXISTS idx_pilot_reports_tenant_id;

-- Drop policies
DROP POLICY IF EXISTS "Users can view pilot baselines" ON pilot_baselines;
DROP POLICY IF EXISTS "Users can insert pilot baselines" ON pilot_baselines;
DROP POLICY IF EXISTS "Users can update pilot baselines" ON pilot_baselines;
DROP POLICY IF EXISTS "Users can view assumption sets" ON assumption_sets;
DROP POLICY IF EXISTS "Users can insert assumption sets" ON assumption_sets;
DROP POLICY IF EXISTS "Users can update assumption sets" ON assumption_sets;
DROP POLICY IF EXISTS "Users can view pilot metrics" ON pilot_metrics;
DROP POLICY IF EXISTS "Users can insert pilot metrics" ON pilot_metrics;
DROP POLICY IF EXISTS "Users can view call classifications" ON call_classifications;
DROP POLICY IF EXISTS "Users can insert call classifications" ON call_classifications;
DROP POLICY IF EXISTS "Users can view capacity analyses" ON capacity_analyses;
DROP POLICY IF EXISTS "Users can insert capacity analyses" ON capacity_analyses;
DROP POLICY IF EXISTS "Users can view performance measurements" ON performance_measurements;
DROP POLICY IF EXISTS "Users can insert performance measurements" ON performance_measurements;
DROP POLICY IF EXISTS "Users can view performance reports" ON performance_reports;
DROP POLICY IF EXISTS "Users can insert performance reports" ON performance_reports;
DROP POLICY IF EXISTS "Users can view pilot reports" ON pilot_reports;
DROP POLICY IF EXISTS "Users can insert pilot reports" ON pilot_reports;

-- Drop tables (CASCADE to handle dependencies)
DROP TABLE IF EXISTS pilot_reports CASCADE;
DROP TABLE IF EXISTS performance_reports CASCADE;
DROP TABLE IF EXISTS performance_measurements CASCADE;
DROP TABLE IF EXISTS capacity_analyses CASCADE;
DROP TABLE IF EXISTS call_classifications CASCADE;
DROP TABLE IF EXISTS pilot_metrics CASCADE;
DROP TABLE IF EXISTS assumption_sets CASCADE;
DROP TABLE IF EXISTS pilot_baselines CASCADE;

-- ============================================================================
-- 1. PILOT BASELINES
-- ============================================================================

CREATE TABLE pilot_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    tenant_id UUID,
    
    -- Source information
    source VARCHAR(50) NOT NULL,
    source_details TEXT,
    confidence_level VARCHAR(20),
    
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

CREATE TABLE assumption_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    confidence_level VARCHAR(20),
    
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

CREATE TABLE pilot_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) NOT NULL,
    tenant_id UUID,
    
    -- Metric details
    metric_key VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    metric_type VARCHAR(20) NOT NULL,
    confidence_band VARCHAR(20),
    
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

CREATE TABLE call_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) NOT NULL,
    tenant_id UUID,
    call_id VARCHAR(100) UNIQUE NOT NULL,
    
    -- Classification
    intent VARCHAR(50) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    confidence DECIMAL(3, 2),
    
    -- Call details
    transcript TEXT,
    duration_seconds INTEGER,
    outcome VARCHAR(50),
    
    -- Metadata
    classified_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_call_classifications_pilot_id ON call_classifications(pilot_id);
CREATE INDEX idx_call_classifications_tenant_id ON call_classifications(tenant_id);
CREATE INDEX idx_call_classifications_intent ON call_classifications(intent);
CREATE INDEX idx_call_classifications_urgency ON call_classifications(urgency);

COMMENT ON TABLE call_classifications IS 'AI-classified call intents and urgency levels';

-- ============================================================================
-- 5. CAPACITY SATURATION ANALYSES
-- ============================================================================

CREATE TABLE capacity_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) NOT NULL,
    tenant_id UUID,
    
    -- Analysis period
    analysis_date DATE NOT NULL,
    analysis_hour INTEGER,
    
    -- Capacity metrics
    concurrent_calls INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    saturation_percentage DECIMAL(5, 2) NOT NULL,
    breach_detected BOOLEAN DEFAULT false,
    
    -- Details
    breach_duration_minutes INTEGER,
    calls_affected INTEGER,
    
    -- Metadata
    analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_capacity_analyses_pilot_id ON capacity_analyses(pilot_id);
CREATE INDEX idx_capacity_analyses_tenant_id ON capacity_analyses(tenant_id);
CREATE INDEX idx_capacity_analyses_breach ON capacity_analyses(breach_detected);

COMMENT ON TABLE capacity_analyses IS 'Call capacity saturation tracking and breach detection';

-- ============================================================================
-- 6. PERFORMANCE MEASUREMENTS
-- ============================================================================

CREATE TABLE performance_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) NOT NULL,
    tenant_id UUID,
    call_id VARCHAR(100) NOT NULL,
    
    -- Performance metrics
    measurement_type VARCHAR(50) NOT NULL,
    latency_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    
    -- Context
    metadata JSONB,
    
    -- Metadata
    measured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_measurements_pilot_id ON performance_measurements(pilot_id);
CREATE INDEX idx_performance_measurements_tenant_id ON performance_measurements(tenant_id);
CREATE INDEX idx_performance_measurements_type ON performance_measurements(measurement_type);

COMMENT ON TABLE performance_measurements IS 'Individual performance measurements for latency tracking';

-- ============================================================================
-- 7. PERFORMANCE REPORTS (Aggregated)
-- ============================================================================

CREATE TABLE performance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) NOT NULL,
    tenant_id UUID,
    
    -- Report period
    report_date DATE NOT NULL,
    
    -- Aggregated metrics
    avg_answer_latency_ms INTEGER,
    avg_response_latency_ms INTEGER,
    avg_booking_execution_ms INTEGER,
    p95_answer_latency_ms INTEGER,
    p95_response_latency_ms INTEGER,
    
    -- Compliance
    answer_latency_compliance_rate DECIMAL(5, 2),
    response_latency_compliance_rate DECIMAL(5, 2),
    
    -- Comparison to baseline
    human_baseline_comparison JSONB,
    
    -- Metadata
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_reports_pilot_id ON performance_reports(pilot_id);
CREATE INDEX idx_performance_reports_tenant_id ON performance_reports(tenant_id);

COMMENT ON TABLE performance_reports IS 'Daily aggregated performance reports';

-- ============================================================================
-- 8. PILOT REPORTS (Final Generated Reports)
-- ============================================================================

CREATE TABLE pilot_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pilot_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID,
    tenant_id UUID,
    
    -- Report metadata
    report_title VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by VARCHAR(100),
    
    -- Report sections (JSONB)
    executive_summary JSONB,
    baseline_comparison JSONB,
    assumptions_disclosure JSONB,
    metric_segregation JSONB,
    call_intelligence JSONB,
    capacity_analysis JSONB,
    performance_analysis JSONB,
    
    -- Report status
    status VARCHAR(50) DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    
    -- File references
    pdf_url TEXT,
    json_url TEXT
);

CREATE INDEX idx_pilot_reports_pilot_id ON pilot_reports(pilot_id);
CREATE INDEX idx_pilot_reports_customer_id ON pilot_reports(customer_id);
CREATE INDEX idx_pilot_reports_tenant_id ON pilot_reports(tenant_id);

COMMENT ON TABLE pilot_reports IS 'Final generated pilot reports with all sections';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE pilot_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE assumption_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_reports ENABLE ROW LEVEL SECURITY;

-- Pilot Baselines
CREATE POLICY "Users can view pilot baselines" ON pilot_baselines FOR SELECT USING (true);
CREATE POLICY "Users can insert pilot baselines" ON pilot_baselines FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update pilot baselines" ON pilot_baselines FOR UPDATE USING (true);

-- Assumption Sets
CREATE POLICY "Users can view assumption sets" ON assumption_sets FOR SELECT USING (true);
CREATE POLICY "Users can insert assumption sets" ON assumption_sets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update assumption sets" ON assumption_sets FOR UPDATE USING (true);

-- Pilot Metrics
CREATE POLICY "Users can view pilot metrics" ON pilot_metrics FOR SELECT USING (true);
CREATE POLICY "Users can insert pilot metrics" ON pilot_metrics FOR INSERT WITH CHECK (true);

-- Call Classifications
CREATE POLICY "Users can view call classifications" ON call_classifications FOR SELECT USING (true);
CREATE POLICY "Users can insert call classifications" ON call_classifications FOR INSERT WITH CHECK (true);

-- Capacity Analyses
CREATE POLICY "Users can view capacity analyses" ON capacity_analyses FOR SELECT USING (true);
CREATE POLICY "Users can insert capacity analyses" ON capacity_analyses FOR INSERT WITH CHECK (true);

-- Performance Measurements
CREATE POLICY "Users can view performance measurements" ON performance_measurements FOR SELECT USING (true);
CREATE POLICY "Users can insert performance measurements" ON performance_measurements FOR INSERT WITH CHECK (true);

-- Performance Reports
CREATE POLICY "Users can view performance reports" ON performance_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert performance reports" ON performance_reports FOR INSERT WITH CHECK (true);

-- Pilot Reports
CREATE POLICY "Users can view pilot reports" ON pilot_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert pilot reports" ON pilot_reports FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default assumption set
INSERT INTO assumption_sets (version, description, confidence_level, assumptions, created_by, is_active)
VALUES (
    'v1.0',
    'Default assumptions for HVAC industry pilots',
    'high',
    '[
        {"key": "avg_call_value", "value": 350, "unit": "USD", "source": "industry_benchmark", "confidence": "high", "range": {"min": 250, "max": 500}},
        {"key": "booking_rate", "value": 0.65, "unit": "percentage", "source": "historical_data", "confidence": "high", "range": {"min": 0.55, "max": 0.75}},
        {"key": "no_show_rate", "value": 0.15, "unit": "percentage", "source": "industry_average", "confidence": "medium", "range": {"min": 0.10, "max": 0.25}},
        {"key": "avg_handle_time", "value": 4.5, "unit": "minutes", "source": "pilot_data", "confidence": "high", "range": {"min": 3.0, "max": 6.0}},
        {"key": "peak_hours", "value": "9am-5pm", "unit": "time_range", "source": "industry_standard", "confidence": "high"}
    ]'::jsonb,
    'system',
    true
)
ON CONFLICT (version) DO NOTHING;
