# 🔧 Migration Instructions - IMPORTANT

## ⚠️ Your Twilio Number is Safe

The new migration **MIGRATION_FIX_V3.sql** preserves your existing Twilio configuration. Your current phone number will continue to work without interruption.

---

## 📋 What This Migration Does

### **1. Creates Multi-Tenant Support**
- Adds `tenants` table for multiple companies
- Creates a **default tenant** with your existing setup

### **2. Preserves Your Current Setup**
- ✅ Your Twilio phone number: `+1234567890`
- ✅ Your company: KC Comfort Air
- ✅ All existing data remains intact
- ✅ No downtime or configuration changes needed

### **3. Safely Adds tenant_id**
- Adds `tenant_id` column to existing tables (leads, signals, contacts)
- Automatically assigns all existing data to the default tenant
- Creates indexes for performance

---

## 🚀 How to Run

### **Option 1: Supabase SQL Editor (Recommended)**

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `MIGRATION_FIX_V3.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter)

### **Option 2: Command Line**

```bash
# From project root
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f database/migrations/MIGRATION_FIX_V3.sql
```

---

## ✅ Verification Steps

After running the migration, verify everything worked:

### **1. Check Default Tenant**
```sql
SELECT 
    id,
    slug,
    company_name,
    twilio_phone_number,
    subscription_status,
    is_active
FROM tenants 
WHERE slug = 'default';
```

**Expected Result**:
```
id: [UUID]
slug: default
company_name: KC Comfort Air
twilio_phone_number: +1234567890
subscription_status: active
is_active: true
```

### **2. Check Existing Data**
```sql
-- Check leads have tenant_id
SELECT COUNT(*) as total_leads, 
       COUNT(tenant_id) as leads_with_tenant
FROM leads;

-- Check contacts have tenant_id
SELECT COUNT(*) as total_contacts,
       COUNT(tenant_id) as contacts_with_tenant
FROM contacts;
```

**Expected**: Both counts should be equal (all records have tenant_id)

### **3. Check New Tables**
```sql
-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'tenants',
    'tenant_users',
    'call_logs',
    'appointments',
    'weekly_analytics'
  )
ORDER BY table_name;
```

**Expected**: All 5 tables should be listed

---

## 🔍 What Changed

### **Tables Modified** (tenant_id added)
- ✅ `leads` - All existing leads assigned to default tenant
- ✅ `signals` - All existing signals assigned to default tenant
- ✅ `contacts` - All existing contacts assigned to default tenant

### **Tables Created** (new)
- ✅ `tenants` - Company/organization management
- ✅ `tenant_users` - User access control
- ✅ `tenant_api_keys` - API authentication
- ✅ `call_logs` - Call tracking (multi-tenant)
- ✅ `appointments` - Appointment scheduling (multi-tenant)
- ✅ `tenant_usage` - Usage tracking
- ✅ `weekly_analytics` - Analytics aggregation

### **Functions Created**
- ✅ `get_tenant_by_phone(phone_number)` - Routes calls to correct tenant
- ✅ `update_updated_at_column()` - Auto-updates timestamps

### **Views Created**
- ✅ `tenant_dashboard_stats` - Dashboard metrics

---

## 🔐 Your Twilio Configuration

### **Before Migration**
```env
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=xxxx...
```

### **After Migration**
✅ **Same configuration** - No changes needed!

The default tenant is automatically created with your Twilio number. All incoming calls to `+1234567890` will route to the default tenant (KC Comfort Air).

---

## 🎯 How Multi-Tenant Routing Works

### **Incoming Call Flow**:
1. Call comes in to `+1234567890`
2. System looks up tenant by phone number: `get_tenant_by_phone('+1234567890')`
3. Finds default tenant (KC Comfort Air)
4. Routes call to that tenant's configuration
5. Creates `call_log` record with correct `tenant_id`

### **No Code Changes Required**
Your existing backend code will continue to work. The migration handles all the routing automatically.

---

## 🚨 Troubleshooting

### **Error: "column tenant_id does not exist"**
**Cause**: Migration didn't complete successfully  
**Fix**: Run MIGRATION_FIX_V3.sql again (it's safe to re-run)

### **Error: "relation tenants already exists"**
**Cause**: Partial migration from previous attempt  
**Fix**: The migration uses `IF NOT EXISTS` - safe to re-run

### **Existing data not showing up**
**Cause**: `tenant_id` not backfilled  
**Fix**: Run this query:
```sql
UPDATE leads SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

UPDATE signals SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;

UPDATE contacts SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default')
WHERE tenant_id IS NULL;
```

---

## 📞 Testing Your Twilio Setup

After migration, test that calls still work:

### **1. Test Incoming Call**
- Call your Twilio number: `+1234567890`
- Verify the call connects
- Check that a `call_log` record is created:
```sql
SELECT * FROM call_logs 
ORDER BY created_at DESC 
LIMIT 1;
```

### **2. Verify Tenant Assignment**
```sql
SELECT 
    cl.call_sid,
    cl.from_number,
    t.company_name,
    t.twilio_phone_number
FROM call_logs cl
JOIN tenants t ON t.id = cl.tenant_id
ORDER BY cl.created_at DESC
LIMIT 5;
```

---

## 🎉 Benefits of Multi-Tenant Setup

### **Current (Single Tenant)**
- One company: KC Comfort Air
- One Twilio number
- All data in one bucket

### **Future (Multi-Tenant Ready)**
- ✅ Support multiple HVAC companies
- ✅ Each company has own Twilio number
- ✅ Isolated data per company
- ✅ White-label ready
- ✅ SaaS business model enabled

---

## 📝 Next Steps

1. ✅ Run MIGRATION_FIX_V3.sql
2. ✅ Verify default tenant exists
3. ✅ Test Twilio call still works
4. ✅ Check dashboard shows data
5. 🎨 Continue UI/UX improvements

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the Supabase logs for error details
2. Verify your Twilio credentials in `.env.local`
3. Ensure migrations 1 & 2 ran successfully first
4. Re-run MIGRATION_FIX_V3.sql (safe to re-run)

---

**Last Updated**: December 23, 2025  
**Migration Version**: V3  
**Status**: Ready to run - Your Twilio setup is safe! ✅
