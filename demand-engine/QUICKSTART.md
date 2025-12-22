# Quick Start Guide - Local Execution

**Run your first batch locally (no Modal deployment needed)**

---

## Prerequisites

✅ Python 3.11+  
✅ Supabase account (free tier)  
✅ OpenAI API key (shared with HVAC agent)  
✅ Reddit API credentials (you'll provide later)

---

## Step 1: Install Dependencies (5 min)

```bash
cd demand-engine
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

---

## Step 2: Set Up Supabase (10 min)

1. Go to https://supabase.com
2. Create new project: `demand-engine-db`
3. Wait for provisioning (~2 minutes)
4. Go to SQL Editor
5. Copy entire contents of `database/schema.sql`
6. Paste and execute
7. Verify tables created (should see 8 tables)

**Get credentials**:
- Settings → API → Project URL
- Settings → API → anon/public key

---

## Step 3: Configure Environment (2 min)

```bash
# Copy example
cp .env.example .env

# Edit .env with your credentials
```

**Required variables**:
```bash
# Supabase (from Step 2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# OpenAI (same as HVAC agent)
OPENAI_API_KEY=sk-your-key-here

# Reddit (you'll provide later - leave blank for now)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

---

## Step 4: Validate Setup (1 min)

```bash
python scripts/run_local_batch.py
```

Should show:
```
❌ Missing required environment variables:
   - REDDIT_CLIENT_ID
   - REDDIT_CLIENT_SECRET
```

This is expected! You'll provide Reddit credentials later.

---

## Step 5: Test Database Connection

```python
# Quick test
python -c "
from config.supabase_config import get_supabase
client = get_supabase()
result = client.table('signals').select('count').execute()
print('✅ Database connected! Signal count:', len(result.data))
"
```

---

## When You're Ready with Reddit Credentials

### Get Reddit API Credentials
1. Go to https://reddit.com/prefs/apps
2. Click "Create App"
3. Fill in:
   - Name: `Demand Engine`
   - Type: `script`
   - Redirect URI: `http://localhost:8080`
4. Copy Client ID and Secret
5. Update `.env` file

### Run Your First Scrape

```bash
# Test with 10 posts from r/HVAC
python scripts/run_local_batch.py scrape --subreddit HVAC --limit 10
```

Expected output:
```
🔍 Scraping r/HVAC (limit=10, sort=hot)
✅ Signal saved: abc123 (score: 45)
⏭️  Duplicate signal skipped: def456
✅ Completed r/HVAC: {'total_fetched': 10, 'signals_saved': 3, ...}
```

### Classify Signals

```bash
# Score the scraped signals
python scripts/run_local_batch.py classify --batch-size 10
```

Expected output:
```
🔄 Processing batch of 3 signals
📊 Signal abc12... keyword score: 45
⚡ Keyword score sufficient, skipping AI
✅ Signal abc12... scored: 45 (qualified: false)
```

### Send Test Digest

```bash
# Preview digest (no email sent if SendGrid not configured)
python scripts/run_local_batch.py alerts --threshold 50 --limit 5
```

---

## Full Pipeline Test

Once Reddit credentials are set:

```bash
# Run complete pipeline: scrape → classify → alert
python scripts/run_local_batch.py pipeline --subreddit HVAC --limit 20
```

This will:
1. Scrape 20 posts from r/HVAC
2. Classify all pending signals
3. Send digest of high-score signals

---

## Troubleshooting

### "Module not found" errors
```bash
# Make sure you're in demand-engine directory
cd demand-engine

# Activate virtual environment
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
```

### "SUPABASE_URL not set"
```bash
# Check .env file exists
ls .env

# Verify contents
cat .env  # Mac/Linux
type .env  # Windows
```

### "Reddit API 401 Unauthorized"
- Verify Client ID and Secret are correct
- Check app type is "script" not "web app"
- Ensure no extra spaces in .env file

### "OpenAI API error"
- Verify API key starts with `sk-`
- Check key is active at platform.openai.com
- Ensure you have credits available

---

## Cost Tracking

### First Test Run (10 posts)
- Reddit API: Free
- Supabase: Free (minimal data)
- OpenAI: ~$0.01 (keyword filtering reduces AI calls)
- **Total**: ~$0.01

### Daily Production (100 posts/day)
- Reddit API: Free
- Supabase: Free (under limits)
- OpenAI: ~$0.30/day
- **Total**: ~$9/month

---

## Next Steps

After successful local testing:

1. **Increase volume**: Scrape more subreddits
   ```bash
   python scripts/run_local_batch.py scrape --batch --limit 50
   ```

2. **Set up email alerts**: Configure SendGrid
   ```bash
   # Add to .env
   SENDGRID_API_KEY=SG.your-key
   ALERT_EMAIL_TO=your-email@example.com
   ```

3. **Deploy to Modal**: For scheduled automation
   ```bash
   modal deploy scrapers/reddit.py
   ```

4. **Add more sources**: Permits, licensing boards (Phase 1 Session 2)

---

## Support

- **Setup issues**: Check `SETUP.md`
- **Architecture questions**: Read `SME_REVIEW.md`
- **Shared resources**: See `SHARED_RESOURCES.md`
- **Database schema**: Review `database/schema.sql`

---

## Summary

✅ **P0 Fixes Completed**:
- Package structure (`__init__.py` files)
- Local execution capability
- Shared resource configuration
- Environment validation

⚠️ **Waiting for**:
- Reddit API credentials (you'll provide)

🎯 **Ready to**:
- Run first local batch
- Test classification
- Preview alerts

**Estimated time to first signal**: 15 minutes after Reddit credentials provided
