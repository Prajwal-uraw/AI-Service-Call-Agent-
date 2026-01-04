-- AlertStream Performance Indexes
-- Migration: 002_add_indexes
-- Date: 2025-12-30

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Websites indexes
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_api_key ON websites(api_key);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_websites_is_active ON websites(is_active);

-- Triggers indexes
CREATE INDEX IF NOT EXISTS idx_triggers_website_id ON triggers(website_id);
CREATE INDEX IF NOT EXISTS idx_triggers_event_type ON triggers(event_type);
CREATE INDEX IF NOT EXISTS idx_triggers_is_active ON triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_triggers_website_event ON triggers(website_id, event_type) WHERE is_active = true;

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_website_id ON events(website_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_website_created ON events(website_id, created_at DESC);

-- SMS Messages indexes
CREATE INDEX IF NOT EXISTS idx_sms_messages_user_id ON sms_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_trigger_id ON sms_messages(trigger_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_event_id ON sms_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_twilio_sid ON sms_messages(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_sms_messages_user_created ON sms_messages(user_id, created_at DESC);

-- TCPA Compliance indexes
CREATE INDEX IF NOT EXISTS idx_tcpa_user_id ON tcpa_compliance(user_id);
CREATE INDEX IF NOT EXISTS idx_tcpa_phone_hash ON tcpa_compliance(phone_number_hash);
CREATE INDEX IF NOT EXISTS idx_tcpa_consent_status ON tcpa_compliance(consent_status);
CREATE INDEX IF NOT EXISTS idx_tcpa_phone_status ON tcpa_compliance(phone_number_hash, consent_status);

-- Compliance Logs indexes
CREATE INDEX IF NOT EXISTS idx_compliance_logs_user_id ON compliance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_phone_hash ON compliance_logs(phone_number_hash);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_created_at ON compliance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_consent_id ON compliance_logs(consent_id);

-- Billing History indexes
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_created_at ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing_history(status);
CREATE INDEX IF NOT EXISTS idx_billing_stripe_invoice ON billing_history(stripe_invoice_id);

-- Support Tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_status_priority ON support_tickets(status, priority);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_website_type_created ON events(website_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_user_status_created ON sms_messages(user_id, status, created_at DESC);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_active_websites ON websites(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_active_triggers ON triggers(website_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pending_sms ON sms_messages(created_at) WHERE status = 'pending';

-- GIN index for JSONB columns
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin ON events USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_triggers_conditions_gin ON triggers USING GIN (conditions);
