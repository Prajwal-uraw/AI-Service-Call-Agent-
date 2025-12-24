-- =====================================================
-- CLEANUP DUMMY DATA FROM DATABASE
-- Removes all test/sample data while preserving schema
-- Run this to start fresh with production data
-- =====================================================

-- Remove sample AI demo shadow users
DELETE FROM ai_demo_shadow_users 
WHERE user_email LIKE '%@kestrel.ai' 
   OR user_email LIKE '%test%'
   OR user_email LIKE '%demo%'
   OR user_email LIKE '%sample%';

-- Remove sample pipeline stages (keep if you want default stages)
-- DELETE FROM pipeline_stages WHERE name IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost');

-- Remove test calculator submissions
DELETE FROM calculator_submissions 
WHERE company_name LIKE '%Test%' 
   OR company_name LIKE '%Demo%'
   OR company_name LIKE '%Sample%'
   OR email LIKE '%test%'
   OR email LIKE '%demo%';

-- Remove test leads
DELETE FROM leads 
WHERE company_name LIKE '%Test%'
   OR company_name LIKE '%Demo%'
   OR company_name LIKE '%Sample%'
   OR email LIKE '%test%'
   OR email LIKE '%demo%';

-- Remove test contacts
DELETE FROM contacts 
WHERE email LIKE '%test%'
   OR email LIKE '%demo%'
   OR email LIKE '%sample%'
   OR company_name LIKE '%Test%'
   OR company_name LIKE '%Demo%';

-- Remove test call records
DELETE FROM call_records 
WHERE caller_phone LIKE '%555%'
   OR notes LIKE '%test%'
   OR notes LIKE '%demo%';

-- Remove test email campaigns
DELETE FROM email_campaigns 
WHERE name LIKE '%Test%'
   OR name LIKE '%Demo%'
   OR name LIKE '%Sample%';

-- Remove test activities
DELETE FROM activities 
WHERE notes LIKE '%test%'
   OR notes LIKE '%demo%';

-- Remove test tasks
DELETE FROM tasks 
WHERE title LIKE '%Test%'
   OR title LIKE '%Demo%';

-- Remove test signals (Reddit/pain signals)
DELETE FROM signals 
WHERE source LIKE '%test%'
   OR title LIKE '%test%'
   OR title LIKE '%demo%';

-- Remove test engagement tracking
DELETE FROM engagement_tracking 
WHERE user_email LIKE '%test%'
   OR user_email LIKE '%demo%';

-- Remove test follow-up emails
DELETE FROM follow_up_emails 
WHERE recipient_email LIKE '%test%'
   OR recipient_email LIKE '%demo%';

-- Reset sequences if needed (PostgreSQL)
-- This ensures IDs start from 1 for new data
-- Uncomment if you want to reset auto-increment counters

-- SELECT setval('calculator_submissions_id_seq', 1, false);
-- SELECT setval('leads_id_seq', 1, false);
-- SELECT setval('contacts_id_seq', 1, false);
-- SELECT setval('call_records_id_seq', 1, false);
-- SELECT setval('signals_id_seq', 1, false);

-- Vacuum tables to reclaim space (PostgreSQL)
VACUUM ANALYZE calculator_submissions;
VACUUM ANALYZE leads;
VACUUM ANALYZE contacts;
VACUUM ANALYZE call_records;
VACUUM ANALYZE signals;
VACUUM ANALYZE activities;
VACUUM ANALYZE tasks;

-- Verify cleanup
SELECT 'calculator_submissions' as table_name, COUNT(*) as remaining_rows FROM calculator_submissions
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'call_records', COUNT(*) FROM call_records
UNION ALL
SELECT 'signals', COUNT(*) FROM signals
UNION ALL
SELECT 'activities', COUNT(*) FROM activities
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
ORDER BY table_name;
