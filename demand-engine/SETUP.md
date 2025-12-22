# Demand Engine Setup Guide

## Phase 1 Session 1: Infrastructure Setup

### Prerequisites

1. **Python 3.11+** installed
2. **Modal account** (sign up at modal.com)
3. **Supabase account** (sign up at supabase.com)
4. **Reddit API credentials** (create app at reddit.com/prefs/apps)
5. **OpenAI API key** (get from platform.openai.com)
6. **SendGrid account** (optional, for email alerts)

---

## Step 1: Install Dependencies

```bash
cd demand-engine
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

## Step 2: Configure Modal

```bash
# Install Modal CLI
pip install modal

# Authenticate
modal token new

# Create Modal secret with all environment variables
modal secret create demand-engine-secrets \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_KEY=your-anon-key \
  OPENAI_API_KEY=sk-your-key \
  REDDIT_CLIENT_ID=your-client-id \
  REDDIT_CLIENT_SECRET=your-client-secret \
  REDDIT_USER_AGENT=DemandEngine/1.0 \
  SENDGRID_API_KEY=your-sendgrid-key \
  ALERT_EMAIL_TO=your-email@example.com \
  ALERT_EMAIL_FROM=alerts@yourdomain.com \
  SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## Step 3: Set Up Supabase Database

1. **Create new Supabase project** at supabase.com

2. **Run database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `database/schema.sql`
   - Execute the SQL

3. **Verify tables created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema='public';
   ```

4. **Get credentials**:
   - Project URL: Settings → API → Project URL
   - Anon key: Settings → API → Project API keys → anon/public

---

## Step 4: Get Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: Demand Engine
   - **Type**: Script
   - **Description**: Lead generation for HVAC businesses
   - **Redirect URI**: http://localhost:8080
4. Save and note your:
   - **Client ID** (under app name)
   - **Client Secret** (shown after creation)

---

## Step 5: Create Local .env File

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

---

## Step 6: Test Scrapers

### Test Reddit Scraper

```bash
# Test single subreddit (dry run)
modal run scrapers.reddit --subreddit HVAC --limit 10

# Run batch scrape
modal run scrapers.reddit --batch
```

Expected output:
```
🔍 Scraping r/HVAC (limit=10, sort=hot)
✅ Signal saved: abc123 (score: 45)
⏭️  Duplicate signal skipped: def456
✅ Completed r/HVAC: {'total_fetched': 10, 'signals_saved': 3, ...}
```

---

## Step 7: Test Classification

### Test Keyword Scoring

```python
# In Python REPL
from classifiers.keywords import calculate_keyword_score

text = "I own an HVAC business and we're overwhelmed with calls. Need help ASAP."
result = calculate_keyword_score(text)
print(result)
# Should show high scores for pain, urgency, authority
```

### Test AI Scoring (requires signal in DB)

```bash
# Get a signal ID from Supabase
# Then run:
modal run classifiers.scorer --signal-id <uuid>
```

### Test Batch Scoring

```bash
modal run classifiers.scorer --batch --batch-size 10
```

---

## Step 8: Test Alerts

### Test Daily Digest

```bash
# Test mode (lower threshold)
modal run alerts.daily_digest --test

# Check your email for digest
```

---

## Step 9: Verify Database

Check Supabase dashboard:

1. **Signals table**: Should have scraped posts
2. **Scores**: `classified_score` should be populated
3. **Status**: Should show "classified" for processed signals

Query to check:
```sql
SELECT 
  source_type,
  COUNT(*) as total,
  AVG(classified_score) as avg_score,
  COUNT(*) FILTER (WHERE is_qualified = true) as qualified
FROM signals
GROUP BY source_type;
```

---

## Step 10: Schedule Automated Runs (Optional)

### Option A: Modal Scheduled Functions

Add to `scrapers/reddit.py`:

```python
@app.function(schedule=modal.Cron("0 8,20 * * *"))  # 8am and 8pm daily
def scheduled_scrape():
    return scrape_all_subreddits.remote(limit_per_subreddit=50)
```

Deploy:
```bash
modal deploy scrapers.reddit
```

### Option B: Manual Runs

Create a script to run manually:

```bash
# run_daily.sh
modal run scrapers.reddit --batch
sleep 60
modal run classifiers.scorer --batch --batch-size 100
sleep 30
modal run alerts.daily_digest
```

---

## Troubleshooting

### Reddit API Errors

**Error**: `401 Unauthorized`
- Check `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`
- Verify app type is "script" not "web app"

**Error**: `429 Too Many Requests`
- Reddit API limit is 60 requests/minute
- Add delays between requests

### Supabase Errors

**Error**: `relation "signals" does not exist`
- Run `database/schema.sql` in SQL Editor
- Check you're connected to correct project

**Error**: `JWT expired`
- Regenerate anon key in Supabase dashboard
- Update Modal secret

### Modal Errors

**Error**: `Secret not found`
- Create secret: `modal secret create demand-engine-secrets ...`
- List secrets: `modal secret list`

**Error**: `Function timeout`
- Increase timeout in `@app.function(timeout=600)`
- Reduce batch size

### OpenAI Errors

**Error**: `Invalid API key`
- Check `OPENAI_API_KEY` starts with `sk-`
- Verify key is active at platform.openai.com

**Error**: `Rate limit exceeded`
- Reduce batch size
- Add delays between API calls
- Upgrade OpenAI plan

---

## Cost Monitoring

### Phase 1 Expected Costs

**Free Tier (First Month)**:
- Modal: $0 (30 free compute hours)
- Supabase: $0 (500MB database, 2GB bandwidth)
- OpenAI: ~$5-10 (keyword pre-filtering reduces calls)
- SendGrid: $0 (100 emails/day free)

**Total**: ~$5-10/month

### Monitor Usage

**Modal**:
```bash
modal app logs demand-engine-scrapers
modal app stats demand-engine-scrapers
```

**Supabase**: Dashboard → Settings → Usage

**OpenAI**: platform.openai.com/usage

---

## Next Steps

After Phase 1 Session 1 is complete:

1. ✅ Infrastructure working
2. ✅ Reddit scraper collecting signals
3. ✅ Classification scoring signals
4. ✅ Alerts sending digests

**Move to Session 2**: Add more data sources (permits, licensing boards)

---

## Support

- Modal docs: modal.com/docs
- Supabase docs: supabase.com/docs
- Reddit API: reddit.com/dev/api
- OpenAI API: platform.openai.com/docs

## IP Rotation Decision

**Status**: NOT IMPLEMENTED for Phase 1

**Reasoning**:
- Reddit uses official API (no rotation needed)
- State licensing boards: Public data, respectful rate limiting sufficient
- Building permits: Municipal APIs where available
- Cost: Rotating proxies add $50-100/month
- Complexity: Additional failure points

**Facebook scraping**: REMOVED entirely (ToS violation risk)

**Future**: Add IP rotation only if specific scrapers get blocked
