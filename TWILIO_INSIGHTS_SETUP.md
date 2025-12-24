# Twilio Insights & Scraping Pipeline Setup Guide

## Overview
This guide covers the complete setup for:
1. **Twilio Call Insights** - Real analytics from your Twilio number
2. **Disclaimer System** - Legal compliance before AI handoff
3. **Scraping Pipeline** - Pain signal detection with Supabase integration
4. **Dummy Data Cleanup** - Fresh start for production

---

## 1. Twilio Insights Dashboard

### What You Get
- **Real-time call history** with recordings and transcripts
- **Cost tracking** per call and monthly summaries
- **Uptime monitoring** with offline incident tracking
- **Number status** including last call time and capabilities

### Setup Steps

#### Backend (demand-engine)
The Twilio insights API is already integrated at:
- `demand-engine/routers/twilio_insights.py`

Endpoints available:
- `GET /api/twilio/insights/call-history` - Recent calls
- `GET /api/twilio/insights/number-status/{phone_number}` - Number status
- `GET /api/twilio/insights/cost-summary` - Cost analysis
- `GET /api/twilio/insights/uptime-metrics` - Reliability metrics
- `GET /api/twilio/insights/call-transcript/{call_sid}` - Get transcript
- `GET /api/twilio/insights/offline-history` - Downtime analysis

#### Frontend Dashboard
Access at: `http://localhost:3000/admin/twilio-insights`

**First Time Setup:**
1. Navigate to the Twilio Insights page
2. Enter your Twilio phone number (e.g., +1234567890)
3. Click "Load Insights"

**Environment Variable (Optional):**
Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+1234567890
```

This will auto-load insights on page load.

---

## 2. Disclaimer System

### Why This Matters
Legal compliance requires informing callers about:
- Call recording
- AI interaction
- Consent to continue

### Implementation

The disclaimer plays **BEFORE** the AI agent picks up, keeping the AI conversation clean and natural.

#### Option A: Use Disclaimer Webhook (Recommended)

**Update your Twilio phone number webhook to:**
```
https://your-domain.com/twilio/voice-with-disclaimer
```

This will:
1. Play disclaimer using Twilio's Polly voice
2. Wait for completion
3. Connect to AI agent seamlessly

#### Option B: Redirect Method

Keep your existing webhook and add redirect:
```
https://your-domain.com/twilio/voice-disclaimer-only
```

This plays disclaimer then redirects to your main AI endpoint.

#### Customize Disclaimer Text

Edit `hvac_agent/app/routers/twilio_disclaimer.py`:
```python
DISCLAIMER_TEXT = """
Your custom disclaimer here.
This call may be recorded for quality assurance.
"""
```

Or set environment variable:
```env
DISCLAIMER_TEXT="Your custom disclaimer"
```

#### Test Disclaimer

Call your Twilio number - you should hear:
1. Disclaimer message (Polly.Joanna voice)
2. Brief pause
3. AI agent greeting

---

## 3. Scraping Pipeline with Supabase

### What It Does
Automatically scrapes pain signals from:
- Reddit (HVAC-related subreddits)
- Job boards (Indeed, ZipRecruiter)
- BBB complaints
- State licensing boards

All data flows to Supabase and displays in the frontend dashboard.

### Setup Steps

#### 1. Supabase Configuration

**Create Tables:**
Run this in Supabase SQL Editor:
```sql
-- Signals table
CREATE TABLE IF NOT EXISTS signals (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT,
    content TEXT,
    pain_score FLOAT DEFAULT 0,
    urgency_score FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id SERIAL PRIMARY KEY,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    results_count INTEGER DEFAULT 0,
    error TEXT,
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_signals_pain_score ON signals(pain_score DESC);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX idx_signals_source ON signals(source);
```

#### 2. Environment Variables

**demand-engine/.env:**
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Reddit API (for scraping)
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_USER_AGENT=YourApp/1.0

# OpenAI (for AI scoring)
OPENAI_API_KEY=sk-...
```

#### 3. Frontend Dashboard

Access at: `http://localhost:3000/admin/scraping`

**Features:**
- View all scraped signals
- Filter by pain score
- Run lite scraping (test mode)
- Analytics dashboard
- Delete unwanted signals

#### 4. Run First Scraping Test

**Option A: Via Dashboard**
1. Go to `/admin/scraping`
2. Click "Run Lite Scraping"
3. Wait 30-60 seconds
4. Refresh to see results

**Option B: Via API**
```bash
curl -X POST http://localhost:8000/api/scraping/run-lite-scraping
```

**Option C: Via Modal (Production)**
```bash
cd demand-engine
modal deploy modal_scrapers.py
```

This sets up automated scraping every 6 hours.

---

## 4. Remove Dummy Data

### Database Cleanup

**Run the cleanup script:**
```bash
# Connect to your database
psql -h your-host -U your-user -d your-database -f database/migrations/CLEANUP_DUMMY_DATA.sql
```

Or via Supabase SQL Editor - paste contents of:
`database/migrations/CLEANUP_DUMMY_DATA.sql`

This removes:
- Test calculator submissions
- Sample leads and contacts
- Demo call records
- Test email campaigns
- Sample activities and tasks

### Frontend Mock Data

Already cleaned! The mock API now returns empty/zero data:
- `frontend/lib/mock-api.ts` - Returns empty arrays and zero stats

**Next Step:** Connect to real backend APIs instead of mock data.

---

## 5. API Endpoints Summary

### Twilio Insights
```
GET  /api/twilio/insights/call-history?phone_number={number}&days=7
GET  /api/twilio/insights/number-status/{phone_number}
GET  /api/twilio/insights/cost-summary?days=30
GET  /api/twilio/insights/uptime-metrics?days=7
GET  /api/twilio/insights/call-transcript/{call_sid}
GET  /api/twilio/insights/offline-history?phone_number={number}
```

### Scraping Pipeline
```
GET  /api/scraping/status
GET  /api/scraping/signals?limit=50&min_pain_score=70
GET  /api/scraping/analytics
POST /api/scraping/run-lite-scraping
POST /api/scraping/run-reddit-scraper
POST /api/scraping/run-job-board-scraper
DELETE /api/scraping/signals/{id}
```

### Disclaimer
```
POST /twilio/voice-with-disclaimer
POST /twilio/voice-disclaimer-only
GET  /twilio/disclaimer-config
```

---

## 6. Testing Checklist

### Twilio Insights
- [ ] Can view call history for your number
- [ ] Cost summary shows accurate data
- [ ] Uptime percentage displays correctly
- [ ] Number status shows "Active"
- [ ] Recordings are accessible

### Disclaimer
- [ ] Call your Twilio number
- [ ] Hear disclaimer message first
- [ ] AI agent picks up after disclaimer
- [ ] No interruption or awkward pauses

### Scraping Pipeline
- [ ] Run lite scraping successfully
- [ ] Signals appear in Supabase
- [ ] Dashboard shows signal count
- [ ] Can filter by pain score
- [ ] Analytics display correctly

### Dummy Data Cleanup
- [ ] Database cleanup script runs without errors
- [ ] All test data removed
- [ ] Frontend shows zero/empty data
- [ ] Ready for production data

---

## 7. Production Deployment

### Environment Variables Checklist

**hvac_agent/.env:**
```env
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TRANSFER_PHONE=+1...
EMERGENCY_PHONE=+1...
DISCLAIMER_TEXT="Your disclaimer"
```

**demand-engine/.env:**
```env
SUPABASE_URL=https://...
SUPABASE_KEY=...
OPENAI_API_KEY=sk-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_TWILIO_PHONE_NUMBER=+1...
```

### Deployment Steps

1. **Backend (demand-engine):**
   ```bash
   modal deploy modal_app.py
   ```

2. **Voice Agent (hvac_agent):**
   ```bash
   modal deploy hvac_agent/modal_deploy.py
   ```

3. **Scrapers:**
   ```bash
   modal deploy demand-engine/modal_scrapers.py
   ```

4. **Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

---

## 8. Monitoring & Maintenance

### Daily Checks
- Review Twilio insights for call quality
- Check scraping job status
- Monitor Supabase storage usage

### Weekly Tasks
- Review high-value signals (pain score > 70)
- Analyze cost trends
- Update disclaimer if needed

### Monthly Tasks
- Clean up old signals (keep last 90 days)
- Review and optimize scraping sources
- Audit call recordings for quality

---

## Support & Troubleshooting

### Common Issues

**"Twilio not configured" error:**
- Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set
- Verify credentials are correct in Twilio console

**No signals appearing:**
- Check Supabase connection
- Verify Reddit API credentials
- Run lite scraping to test

**Disclaimer not playing:**
- Verify webhook URL is correct in Twilio
- Check logs for TwiML errors
- Test with `/twilio/disclaimer-config` endpoint

**Frontend shows "Loading..." forever:**
- Check API URL is correct
- Verify CORS settings
- Check browser console for errors

---

## Next Steps

1. **Configure Twilio webhook** to use disclaimer endpoint
2. **Run first scraping round** to populate data
3. **Set up Supabase tables** for signal storage
4. **Test end-to-end flow** with a real call
5. **Deploy to production** when ready

---

## Files Created/Modified

### New Files
- `demand-engine/routers/twilio_insights.py` - Twilio analytics API
- `hvac_agent/app/routers/twilio_disclaimer.py` - Disclaimer handler
- `demand-engine/routers/scraping_api.py` - Scraping pipeline API
- `frontend/app/admin/twilio-insights/page.tsx` - Insights dashboard
- `frontend/app/admin/scraping/page.tsx` - Scraping dashboard
- `database/migrations/CLEANUP_DUMMY_DATA.sql` - Database cleanup

### Modified Files
- `frontend/lib/mock-api.ts` - Removed dummy data
- `hvac_agent/app/main.py` - Added disclaimer router
- `demand-engine/app.py` - Added insights & scraping routers
- `hvac_agent/app/routers/__init__.py` - Export disclaimer router

---

**You're all set! 🚀**

For questions or issues, check the logs or create a GitHub issue.
