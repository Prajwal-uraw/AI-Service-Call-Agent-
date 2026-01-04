# Database Migration Instructions

## AI Agent Configuration Migration

**File**: `database/migrations/020_ai_agent_configuration.sql`

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy the entire contents of `database/migrations/020_ai_agent_configuration.sql`
5. Paste into the SQL editor
6. Click **"Run"**
7. Verify tables created:
   ```sql
   SELECT * FROM ai_agent_configs LIMIT 1;
   SELECT * FROM ai_config_templates LIMIT 1;
   ```

### Option 2: Using psql Command Line

```bash
# Set your database URL
$env:DATABASE_URL = "postgresql://user:password@host:5432/database"

# Run migration
psql $env:DATABASE_URL -f "database/migrations/020_ai_agent_configuration.sql"
```

### Option 3: Using pgAdmin

1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → **Query Tool**
4. Open file: `database/migrations/020_ai_agent_configuration.sql`
5. Execute (F5)

### Verification

After running the migration, verify:

```sql
-- Check tables exist
\dt ai_*

-- Check triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE 'trg_%ai%';

-- Test default config creation
INSERT INTO tenants (company_name, slug, owner_email, industry) 
VALUES ('Test Company', 'test-co', 'test@example.com', 'hvac')
RETURNING id;

-- Check if AI config was auto-created
SELECT * FROM ai_agent_configs WHERE tenant_id = '[insert-id-from-above]';
```

### Rollback (if needed)

```sql
DROP TABLE IF EXISTS ai_config_audit_log CASCADE;
DROP TABLE IF EXISTS ai_agent_configs CASCADE;
DROP TABLE IF EXISTS ai_config_templates CASCADE;
DROP FUNCTION IF EXISTS create_default_ai_config CASCADE;
DROP FUNCTION IF EXISTS log_ai_config_changes CASCADE;
```

## Status

✅ Migration file created and ready
⏳ Awaiting execution on your database

**Note**: This migration is safe to run multiple times (uses `IF NOT EXISTS`)
