# Modal Services - Fixes Applied & Next Steps

**Date:** January 4, 2026  
**Status:** ✅ Voice agent working, ✅ Scrapers deployed, ⚠️ Database migration needed

---

## ✅ Completed Fixes

### 1. Fixed Voice Agent Email Validator Error
**Problem:** `ImportError: email-validator is not installed`

**Solution Applied:**
- Added `email-validator>=2.0.0` to `hvac_agent/modal_app.py`
- Added `email-validator>=2.0.0` to `hvac_agent/requirements.txt`
- Added `email-validator>=2.0.0` to `demand-engine/modal_app.py`
- Successfully redeployed hvac-voice-agent

**Result:** ✅ Voice agent now starts without errors

---

### 2. Fixed Scraper Deployment
**Problem:** Scrapers failing with 4 errors - missing source files and dependencies

**Solution Applied:**
```python
# In demand-engine/modal_scrapers.py
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "praw>=7.7.0",
        "openai>=1.12.0",
        "supabase>=2.3.4",
        "python-dotenv>=1.0.0",
        "resend>=0.7.0",  # Added for email alerts
    )
    .add_local_python_source("config")        # Added
    .add_local_python_source("classifiers")   # Added
    .add_local_python_source("email_service") # Added
    .add_local_python_source("alerts")        # Added
    .add_local_python_source("scrapers")      # Added
)
```

**Result:** ✅ Scrapers deployed successfully with all dependencies

---

### 3. Created Database Migration for Scrapers
**File:** `database/migrations/021_reddit_signals_tables.sql`

**Tables Created:**
1. **reddit_signals** - Stores Reddit posts with keyword + AI scoring
2. **processing_stats** - Daily statistics for scraping runs
3. **alert_history** - Tracks all alerts sent
4. **unified_signals** (view) - Combines all signal sources
5. **get_unalerted_signals()** (function) - Returns high-score unalerted signals

**Status:** ⚠️ SQL file created but NOT YET RUN on database

---

## 🔴 Critical Next Steps

### Step 1: Run Database Migration (REQUIRED)
The scrapers will fail until these tables exist in Supabase.

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/migrations/021_reddit_signals_tables.sql`
3. Paste and execute
4. Verify tables created: `reddit_signals`, `processing_stats`, `alert_history`

**Option B: Via psql CLI**
```bash
psql $DATABASE_URL -f database/migrations/021_reddit_signals_tables.sql
```

---

### Step 2: Verify Environment Variables
Ensure Modal secrets `hvac-agent-secrets` contains:

```env
# Database (Required for all services)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...

# OpenAI (Required for AI scoring)
OPENAI_API_KEY=sk-...

# Reddit API (Required for scrapers)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=PainSignalBot/1.0

# Email Alerts (Required for daily digest)
RESEND_API_KEY=re_...
ALERT_EMAIL_TO=alerts@kestrel.ai
```

Check in Modal Dashboard: https://modal.com/secrets

---

### Step 3: Test Scrapers Manually
Once database tables are created, test the scrapers:

```bash
# Test Reddit monitor
modal run demand-engine/modal_scrapers.py::trigger_reddit_monitor

# Test daily digest
modal run demand-engine/modal_scrapers.py::trigger_daily_digest
```

Expected output:
- Reddit monitor: Fetches posts, scores them, saves to `reddit_signals`
- Daily digest: Queries high-score signals, sends email

---

## 📊 Current Modal Deployment Status

### ✅ hvac-voice-agent
- **Status:** Operational
- **Endpoint:** https://haiec--hvac-voice-agent-fastapi-app.modal.run
- **Functions:** 
  - Voice call handling (Realtime, Gather, IVR)
  - Appointment booking
  - Emergency detection
  - AlertStream (may be unused)

### ✅ kestrel-demand-engine
- **Status:** Operational
- **Endpoint:** https://[modal-url]/api
- **Functions:**
  - ROI Calculator
  - PDF Generation
  - CRM (contacts, activities, tasks, pipeline)
  - Admin APIs
  - Twilio provisioning & insights
  - Lead capture

### ✅ kestrel-pain-signal-scrapers
- **Status:** Deployed (needs database tables)
- **Scheduled Functions:**
  - `run_reddit_monitor` - Every 6 hours
  - `run_daily_digest` - Daily at 9 AM UTC
- **Manual Triggers:**
  - `trigger_reddit_monitor`
  - `trigger_daily_digest`

---

## 🗑️ Recommended Cleanup (Optional)

### Unused Components Identified

**In hvac-voice-agent:**
1. **AlertStream router** (13 endpoints) - Separate alert system, may not be core functionality
2. **Multiple voice implementations** - Has 4 systems (Stream, ElevenLabs, Gather, Realtime)
   - Recommendation: Standardize on Realtime API (lowest latency)

**In kestrel-demand-engine:**
1. **Daily Video API** (7 endpoints) - Unclear if actively used
2. **AI Demo Meetings** (9 endpoints) - May be redundant
3. **AI Guru API** (2 endpoints) - Minimal functionality

**Unused Scrapers (code exists but not deployed):**
1. Job Board Monitor
2. Licensing Monitor
3. BBB Scraper
4. Local Business Scraper

---

## ⚠️ Database Schema Issues

### Problem: Duplicate Table Definitions
Some tables are defined in multiple schema files with different structures:

1. **signals table**
   - `demand-engine/database/schema.sql`
   - `database/migrations/006_STANDALONE.sql`
   - Different column structures

2. **engagement_tracking table**
   - Defined in both schemas
   - Different column structures

### Recommendation
Create a single consolidated schema migration that:
1. Drops conflicting tables
2. Recreates with unified structure
3. Adds proper foreign key constraints
4. Migrates any existing data

---

## 📋 Architecture Recommendations

### Short-term (Next 2 weeks)
1. ✅ Run database migration 021
2. ✅ Test scrapers manually
3. Monitor scheduled scraper runs for errors
4. Remove unused API endpoints to reduce complexity

### Medium-term (Next month)
1. Consolidate database schemas into single source of truth
2. Add health check endpoints for all scheduled functions
3. Implement monitoring/alerting for scraper failures
4. Document which voice system to use (deprecate others)

### Long-term (Next quarter)
1. Separate AlertStream into its own service if needed
2. Create shared library for common database models
3. Implement CI/CD pipeline for automated testing
4. Add comprehensive error tracking and logging

---

## 🎯 Summary

**What's Working:**
- ✅ Voice agent accepting calls
- ✅ Demand engine APIs operational
- ✅ Scrapers deployed with all dependencies

**What Needs Action:**
- 🔴 Run database migration 021 (CRITICAL)
- 🟡 Verify environment variables in Modal secrets
- 🟡 Test scrapers manually after migration
- 🟢 Consider cleanup of unused components

**Priority Order:**
1. **CRITICAL:** Run migration 021 to create scraper tables
2. **HIGH:** Test scrapers to verify they work
3. **MEDIUM:** Clean up unused API endpoints
4. **LOW:** Consolidate database schemas

---

## 📞 Support

If scrapers still show errors after migration:
1. Check Modal logs: https://modal.com/apps/haiec/main/deployed/kestrel-pain-signal-scrapers
2. Verify all environment variables are set
3. Check Supabase logs for database errors
4. Review `reddit_signals` table for new entries

**Audit Report:** See `MODAL_SERVICES_AUDIT.md` for complete analysis
