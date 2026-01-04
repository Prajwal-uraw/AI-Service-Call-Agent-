# AlertStream Database Migration Instructions

## ⚠️ IMPORTANT: Separate Database Required

AlertStream requires its **OWN separate database**. Do NOT run these migrations on your main application database.

---

## Current Database Setup

### Main App Database (DO NOT USE FOR ALERTSTREAM)
- **Type**: Neon PostgreSQL
- **Tables**: `leads`, `signals`, `meetings`, etc.
- **Connection**: Already in `.env.local` line 84
- **Status**: ✅ Active and working

### AlertStream Database (NEEDS SETUP)
- **Type**: PostgreSQL (Neon or Supabase)
- **Tables**: `users`, `websites`, `triggers`, `events`, `sms_messages`, etc.
- **Connection**: Needs to be created
- **Status**: ⏳ Pending setup

---

## Setup Options

### Option 1: Create New Neon Database (Recommended)

1. **Go to Neon Console**: https://console.neon.tech
2. **Create new database**:
   - Name: `alertstream`
   - Region: Same as your main database
3. **Get connection string**:
   ```
   postgresql://user:password@host/alertstream?sslmode=require
   ```
4. **Add to `.env.local`**:
   ```env
   # AlertStream Database (separate from main app)
   ALERTSTREAM_DATABASE_URL=postgresql://user:password@host/alertstream?sslmode=require
   ```

### Option 2: Use Supabase Database

1. **Go to Supabase Console**: https://supabase.com/dashboard
2. **Navigate to**: Database → SQL Editor
3. **Copy and paste** the contents of:
   - `frontend/Private/alertstream-engine/migrations/001_initial_schema.sql`
   - `frontend/Private/alertstream-engine/migrations/002_add_indexes.sql`
4. **Run each migration**
5. **Add to `.env.local`**:
   ```env
   # AlertStream Database (using Supabase)
   ALERTSTREAM_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

---

## Running Migrations (After Database Setup)

### Windows PowerShell:

```powershell
# Set environment variable
$env:DATABASE_URL="your-alertstream-database-url-here"

# Navigate to alertstream-engine
cd frontend\Private\alertstream-engine

# Run migrations
npm run migrate:sql
```

### Alternative: Manual Migration via Supabase UI

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `migrations/001_initial_schema.sql`
3. Paste and run
4. Copy contents of `migrations/002_add_indexes.sql`
5. Paste and run

---

## Update AlertStream Backend Config

After creating the database, update:

**File**: `frontend/Private/alertstream-engine/.env`

```env
# Database
DATABASE_URL=your-alertstream-database-url-here

# Redis (if using)
REDIS_HOST=localhost
REDIS_PORT=6379

# Twilio (from main .env.local)
TWILIO_ACCOUNT_SID=AC386a37cf5e4218aa3475e0c0556140c1
TWILIO_AUTH_TOKEN=06426dcc039213172a57546f17136e52
TWILIO_PHONE_NUMBER=+19388396504

# JWT Secret (generate new one)
JWT_SECRET=your-secure-random-string-here

# Stripe (from main .env.local)
STRIPE_SECRET_KEY=YOUR_STRIPE_KEY_HERE

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn-here
APP_VERSION=1.0.0

# Server
PORT=4000
NODE_ENV=development
```

---

## Verification

After running migrations, verify tables were created:

### Using Supabase:
1. Go to Database → Tables
2. Should see: `users`, `websites`, `triggers`, `events`, `sms_messages`, etc.

### Using psql:
```powershell
psql $env:DATABASE_URL -c "\dt"
```

Should output:
```
 users
 websites
 triggers
 events
 sms_messages
 tcpa_compliance
 compliance_logs
 billing_history
 support_tickets
```

---

## Why Separate Databases?

1. **Isolation**: Main app and AlertStream are independent
2. **Security**: Different access controls
3. **Scaling**: Can scale databases independently
4. **Backup**: Separate backup strategies
5. **Development**: Can test AlertStream without affecting main app

---

## Quick Start (Easiest Path)

**Use Supabase SQL Editor**:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy/paste `001_initial_schema.sql` → Run
4. Copy/paste `002_add_indexes.sql` → Run
5. Done! ✅

No command line needed, no connection string issues.

---

## Need Help?

- **Neon Docs**: https://neon.tech/docs/introduction
- **Supabase Docs**: https://supabase.com/docs/guides/database
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Status**: ⏳ Awaiting database setup before running migrations
