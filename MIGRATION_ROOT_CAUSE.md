# 🔍 Migration Root Cause Analysis

## ❌ Why Migrations Keep Failing

### **Error:**
```
ERROR: 42703: column "tenant_id" does not exist
```

---

## 🎯 Root Cause Identified

### **Problem 1: Transaction Timing**
Migration 003 tries to create indexes **inside the same DO block** where columns are added:

```sql
DO $$
BEGIN
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id UUID;
    CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);  -- ❌ FAILS
END $$;
```

**Why it fails:**
- `ADD COLUMN IF NOT EXISTS` doesn't guarantee the column exists immediately
- If the column already exists (from a failed previous run), the ALTER does nothing
- But if the column doesn't exist, the CREATE INDEX runs before the column is committed
- PostgreSQL can't create an index on a column that doesn't exist yet in the transaction

### **Problem 2: Migration Order**
You ran migrations in this order:
1. ✅ Migration 001 - Created `leads`, `signals` (no tenant_id)
2. ✅ Migration 002 - Created `contacts` (no tenant_id)
3. ❌ Migration 003 - Tried to add tenant_id, but failed on index creation
4. ❌ MIGRATION_FIX - Tried to create indexes on non-existent tenant_id
5. ❌ MIGRATION_FIX_V2 - Same issue
6. ❌ MIGRATION_FIX_V3 - Same issue

### **Problem 3: Partial State**
After failed migrations, your database is in a partial state:
- `tenants` table might exist
- `leads`, `signals`, `contacts` tables exist WITHOUT `tenant_id`
- Indexes are trying to be created on columns that don't exist

---

## ✅ The Solution: MIGRATION_CLEAN.sql

### **Key Differences:**

#### **1. Separate Steps (Not in DO Blocks)**
```sql
-- Step 1: Add column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Step 2: Add constraint (in DO block for safety)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_leads_tenant') THEN
        ALTER TABLE leads ADD CONSTRAINT fk_leads_tenant 
        FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
END $$;

-- Step 3: Backfill data
UPDATE leads SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

-- Step 4: Create index (AFTER column definitely exists)
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
```

#### **2. Idempotent (Safe to Re-run)**
- Uses `IF NOT EXISTS` for tables
- Uses `ADD COLUMN IF NOT EXISTS` for columns
- Checks constraints before adding
- Uses `CREATE INDEX IF NOT EXISTS`

#### **3. Verification Built-in**
At the end, it shows you:
- Default tenant info
- Which tables have tenant_id
- Data backfill status

---

## 🔧 How to Fix Your Database

### **Option A: Clean Slate (Recommended if no production data)**

1. **Drop all multi-tenant tables:**
```sql
DROP TABLE IF EXISTS weekly_analytics CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Remove tenant_id from existing tables
ALTER TABLE leads DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE signals DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE contacts DROP COLUMN IF EXISTS tenant_id;
```

2. **Run MIGRATION_CLEAN.sql**
- This creates everything fresh with proper order

### **Option B: Fix Partial State (If you have data)**

1. **Check current state:**
```sql
-- Check if tenants table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tenants'
);

-- Check which tables have tenant_id
SELECT table_name 
FROM information_schema.columns
WHERE column_name = 'tenant_id' AND table_schema = 'public';
```

2. **Run MIGRATION_CLEAN.sql**
- It's designed to work with partial states
- Will skip what already exists
- Will add what's missing

---

## 📊 What MIGRATION_CLEAN Does

### **Step-by-Step:**

1. ✅ Creates `tenants` table (if not exists)
2. ✅ Inserts default tenant (if not exists)
3. ✅ Adds `tenant_id` to `leads` (if not exists)
4. ✅ Adds foreign key constraint (if not exists)
5. ✅ Backfills existing leads with default tenant
6. ✅ Creates index on `leads.tenant_id`
7. ✅ Repeats for `signals` and `contacts`
8. ✅ Creates new multi-tenant tables (`call_logs`, `appointments`, etc.)
9. ✅ Creates helper function `get_tenant_by_phone()`
10. ✅ Creates triggers for `updated_at`
11. ✅ Shows verification queries

---

## 🎯 Why Your Twilio Setup is Safe

### **Before Migration:**
```
Twilio → Your webhook → Backend processes call
```

### **After Migration:**
```
Twilio → Your webhook → get_tenant_by_phone('+1234567890') 
→ Returns default tenant → Backend processes call with tenant_id
```

**No configuration changes needed!**

The migration:
- Creates a default tenant with your phone number
- All existing data gets assigned to this tenant
- New calls automatically route to the correct tenant
- Your backend code doesn't need to change (yet)

---

## 🔍 Understanding the Error

### **When you see:**
```
ERROR: 42703: column "tenant_id" does not exist
```

**It means:**
- PostgreSQL is trying to create an index
- On a column called `tenant_id`
- But that column doesn't exist in the table
- Because the `ALTER TABLE ADD COLUMN` either:
  - Hasn't run yet
  - Failed silently
  - Ran but wasn't committed

### **PostgreSQL Error Codes:**
- `42703` = "undefined column"
- `42P07` = "relation already exists"
- `42804` = "datatype mismatch"

---

## 📝 Migration Best Practices (Learned)

### **DO:**
✅ Separate DDL statements (ALTER, CREATE INDEX) into different steps
✅ Use `IF NOT EXISTS` for idempotency
✅ Check constraints before adding them
✅ Backfill data immediately after adding columns
✅ Add verification queries at the end
✅ Test migrations on a copy of production data

### **DON'T:**
❌ Create indexes inside DO blocks where columns are added
❌ Assume `ADD COLUMN IF NOT EXISTS` means the column exists
❌ Create indexes before backfilling data
❌ Mix DDL and DML in complex DO blocks
❌ Skip verification steps

---

## 🚀 Next Steps

1. **Run MIGRATION_CLEAN.sql** in Supabase SQL Editor
2. **Check verification output** at the end
3. **Test a call** to your Twilio number
4. **Verify call_log created** with correct tenant_id
5. **Continue with UI/UX improvements**

---

## 🆘 If It Still Fails

### **Get Current State:**
```sql
-- Show all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show columns for each table
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('leads', 'signals', 'contacts', 'tenants')
ORDER BY table_name, ordinal_position;

-- Show all indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Send me this output and I'll create a custom migration for your exact state.

---

**Created:** December 23, 2025  
**Status:** Root cause identified and fixed  
**Solution:** MIGRATION_CLEAN.sql
