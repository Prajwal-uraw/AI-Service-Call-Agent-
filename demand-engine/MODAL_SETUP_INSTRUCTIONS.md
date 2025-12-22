# Modal Setup Instructions - Quick Start

## 🚀 Deploy Scrapers to Modal

### Step 1: Create Modal Secrets

Go to https://modal.com/secrets and create these 4 secrets:

#### 1. `kestrel-reddit-api`
```
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_USER_AGENT=PainSignalBot/1.0
```

#### 2. `kestrel-openai`
```
OPENAI_API_KEY=sk-your-key-here
USE_AI_SCORING=true
```

#### 3. `kestrel-supabase`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

#### 4. `kestrel-resend`
```
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=hello@kestrel.ai
ALERT_EMAIL_TO=alerts@kestrel.ai
```

### Step 2: Deploy to Modal

```bash
cd demand-engine

# Deploy the app (creates scheduled functions)
modal deploy modal_scrapers.py
```

### Step 3: Verify Deployment

```bash
# Check app is deployed
modal app list

# View app details
modal app show kestrel-pain-signal-scrapers
```

---

## 📅 Scheduled Runs

Once deployed, these run automatically:

- **Reddit Monitor**: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Daily Digest**: Every day at 9:00 AM UTC

---

## 🧪 Manual Testing (Don't Run Scraping Yet)

```bash
# Test locally (dry run)
modal run modal_scrapers.py

# Manually trigger Reddit monitor (when ready)
modal run modal_scrapers.py::trigger_reddit_monitor

# Manually trigger daily digest (when ready)
modal run modal_scrapers.py::trigger_daily_digest
```

---

## 📊 Monitor Execution

```bash
# View logs
modal app logs kestrel-pain-signal-scrapers

# Watch logs in real-time
modal app logs kestrel-pain-signal-scrapers --follow
```

---

## 💰 Expected Costs

- **Modal Compute**: ~$3.60/month
- **OpenAI API**: ~$0.48/month
- **Total**: ~$4.08/month

---

## ✅ Ready to Run

The scrapers are deployed and ready. They will:
1. ✅ Fetch Reddit posts every 6 hours
2. ✅ Score with AI (GPT-4o-mini)
3. ✅ Save high-value signals to Supabase
4. ✅ Send daily digest emails

**Do not manually trigger until you're ready to start scraping!**
