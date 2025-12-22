# Database Migration Guide

## Overview

This directory contains all database migrations for the AI Service Call Agent project. Migrations must be run in order.

---

## Prerequisites

1. **Supabase Project** - You need a Supabase project
2. **Database Access** - Connection string or SQL Editor access
3. **PostgreSQL Extensions** - `uuid-ossp` extension (usually pre-installed in Supabase)

---

## Migration Files

### **001_initial_schema.sql**
- **Description**: Core tables for leads and pain signals
- **Tables**: `leads`, `signals`
- **Features**: Lead scoring, signal tracking, automated timestamps
- **Run Order**: 1

### **002_crm_schema.sql**
- **Description**: Complete CRM system tables
- **Tables**: `contacts`, `activities`, `tasks`, `email_campaigns`, `campaign_recipients`, `email_templates`, `scraper_jobs`, `pipeline_stages`, `notes`
- **Features**: Full CRM functionality, email marketing, scraper tracking
- **Run Order**: 2

---

## How to Run Migrations

### **Option 1: Supabase SQL Editor (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `001_initial_schema.sql`
5. Click **Run**
6. Wait for completion
7. Repeat for `002_crm_schema.sql`

### **Option 2: Command Line (psql)**

```bash
# Set your Supabase connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations in order
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
psql $DATABASE_URL -f database/migrations/002_crm_schema.sql
```

### **Option 3: Using run_migrations.sh Script**

```bash
# Make script executable
chmod +x database/migrations/run_migrations.sh

# Run migrations
./database/migrations/run_migrations.sh
```

---

## Verification

After running migrations, verify the tables were created:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables:
-- activities
-- campaign_recipients
-- contacts
-- email_campaigns
-- email_templates
-- leads
-- notes
-- pipeline_stages
-- scraper_jobs
-- signals
-- tasks

-- Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Expected views:
-- lead_pipeline_view
-- campaign_performance_view

-- Check pipeline stages were inserted
SELECT * FROM pipeline_stages ORDER BY stage_order;
-- Should return 8 stages: New, Contacted, Qualified, Proposal, Negotiation, Closed Won, Closed Lost, Nurture
```

---

## Rollback (if needed)

If you need to rollback migrations:

```sql
-- Drop CRM tables (002)
DROP VIEW IF EXISTS campaign_performance_view;
DROP VIEW IF EXISTS lead_pipeline_view;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS scraper_jobs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS campaign_recipients CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Drop initial tables (001)
DROP TABLE IF EXISTS signals CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

---

## Post-Migration Steps

### **1. Enable Row Level Security (RLS)**

For production, enable RLS on sensitive tables:

```sql
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies (example for authenticated users)
CREATE POLICY "Enable read access for authenticated users" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON leads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Repeat for other tables as needed
```

### **2. Grant Permissions**

```sql
-- Grant permissions to service role (for API access)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
```

### **3. Create Indexes (if not already created)**

All necessary indexes are included in the migration files, but you can verify:

```sql
-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

---

## Troubleshooting

### **Error: relation already exists**

If you get "relation already exists" errors:
- Tables may already be created
- Check existing tables: `\dt` in psql or use SQL Editor
- Either drop existing tables or skip that migration

### **Error: uuid_generate_v4() does not exist**

Enable the uuid extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Error: permission denied**

Make sure you're using the correct database credentials with sufficient permissions.

---

## Migration Status Tracking

To track which migrations have been run, you can create a migrations table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- After running each migration
INSERT INTO schema_migrations (version) VALUES ('001_initial_schema');
INSERT INTO schema_migrations (version) VALUES ('002_crm_schema');
```

---

## Next Steps

After migrations are complete:

1. ✅ Update environment variables with database connection
2. ✅ Test API endpoints to verify database connectivity
3. ✅ Run backend server and check for errors
4. ✅ Test CRM pages in frontend
5. ✅ Verify data can be created/read/updated/deleted

---

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify connection string is correct
3. Ensure database has sufficient resources
4. Check for conflicting table names

---

**Last Updated**: December 22, 2025  
**Total Migrations**: 2  
**Total Tables**: 11  
**Total Views**: 2
