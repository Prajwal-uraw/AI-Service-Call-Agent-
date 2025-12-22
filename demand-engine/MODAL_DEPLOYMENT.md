# Modal Deployment Guide - Pain Signal Scrapers

## Overview

The pain signal scrapers are deployed on Modal for serverless execution with scheduled runs.

---

## Architecture

### Scheduled Functions

1. **Reddit Monitor** (`run_reddit_monitor`)
   - Schedule: Every 6 hours
   - Timeout: 15 minutes
   - Function: Fetch and score Reddit posts with AI

2. **Daily Digest** (`run_daily_digest`)
   - Schedule: Daily at 9 AM UTC
   - Timeout: 10 minutes
   - Function: Send email digest of high-value signals

---

## Setup

### 1. Install Modal CLI

```bash
pip install modal
modal token new
```

### 2. Create Modal Secrets

You need to create 4 secrets in Modal dashboard (https://modal.com/secrets):

#### `kestrel-reddit-api`
```
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_USER_AGENT=PainSignalBot/1.0
```

#### `kestrel-openai`
```
OPENAI_API_KEY=sk-your-key-here
USE_AI_SCORING=true
```

#### `kestrel-supabase`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

#### `kestrel-resend`
```
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=hello@kestrel.ai
ALERT_EMAIL_TO=alerts@kestrel.ai
```

### 3. Deploy to Modal

```bash
cd demand-engine

# Deploy the app
modal deploy modal_scrapers.py

# Verify deployment
modal app list
```

---

## Usage

### View Scheduled Runs

```bash
# Check app status
modal app show kestrel-pain-signal-scrapers

# View logs
modal app logs kestrel-pain-signal-scrapers
```

### Manual Triggers

```bash
# Trigger Reddit monitor manually
modal run modal_scrapers.py::trigger_reddit_monitor

# Trigger daily digest manually
modal run modal_scrapers.py::trigger_daily_digest

# Test locally
modal run modal_scrapers.py
```

### Monitor Execution

```bash
# Watch logs in real-time
modal app logs kestrel-pain-signal-scrapers --follow

# View recent runs
modal app logs kestrel-pain-signal-scrapers --lines 100
```

---

## Schedules

### Reddit Monitor
- **Frequency**: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **Duration**: ~2-5 minutes per run
- **API Calls**: 20-40 OpenAI calls per run
- **Cost**: ~$0.004 per run (~$0.024/day)

### Daily Digest
- **Frequency**: Daily at 9:00 AM UTC
- **Duration**: ~1-2 minutes per run
- **Emails**: 1 digest email per day
- **Cost**: ~$0.001 per run (~$0.03/month)

---

## Cost Breakdown

### Modal Costs
- **Compute**: $0.000025/second
- **Reddit Monitor**: ~5 min = $0.0075/run
- **Daily Digest**: ~2 min = $0.003/run
- **Total Modal**: ~$0.12/day = $3.60/month

### API Costs
- **OpenAI**: ~$0.004/run × 4 runs/day = $0.016/day = $0.48/month
- **Reddit API**: Free
- **Resend Email**: Free tier (100 emails/day)

### Total Monthly Cost
- **Modal**: $3.60
- **OpenAI**: $0.48
- **Total**: ~$4.08/month

---

## Monitoring

### Success Metrics

Check logs for:
```
✅ Reddit Monitor Complete
Posts fetched: 100-200
Duplicates skipped: 50-100
AI scored: 20-40
High-value saved: 5-15
```

### Error Handling

All functions return structured results:
```json
{
  "success": true/false,
  "timestamp": "2025-12-21T10:00:00Z",
  "stats": {...},
  "error": "error message if failed"
}
```

### Alerts

Set up Modal alerts for:
- Function failures
- Timeout errors
- API rate limits

---

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure all dependencies in `image.pip_install()`
   - Check Python version compatibility

2. **Secret Not Found**
   - Verify secret names match exactly
   - Check secrets are created in Modal dashboard

3. **Timeout Errors**
   - Increase timeout value
   - Optimize query limits

4. **API Rate Limits**
   - Reddit: 60 requests/minute
   - OpenAI: 3,500 requests/minute (tier 1)
   - Adjust LOOKBACK_HOURS if needed

### Debug Mode

```bash
# Run with verbose logging
modal run modal_scrapers.py --debug

# Check function status
modal function status kestrel-pain-signal-scrapers.run_reddit_monitor
```

---

## Updating Deployment

### Code Changes

```bash
# Make changes to modal_scrapers.py or scrapers/
git add .
git commit -m "Update scraper logic"
git push

# Redeploy to Modal
modal deploy modal_scrapers.py
```

### Schedule Changes

Edit the `@app.function` decorator:
```python
schedule=modal.Cron("0 */6 * * *")  # Cron expression
```

Common schedules:
- Every hour: `"0 * * * *"`
- Every 6 hours: `"0 */6 * * *"`
- Daily at 9 AM: `"0 9 * * *"`
- Twice daily: `"0 9,21 * * *"`

---

## Best Practices

1. **Testing**
   - Always test locally first: `modal run modal_scrapers.py`
   - Use manual triggers before deploying schedules

2. **Monitoring**
   - Check logs daily for first week
   - Set up alerts for failures
   - Monitor API costs

3. **Optimization**
   - Adjust LOOKBACK_HOURS based on volume
   - Tune MIN_SCORE_THRESHOLD to reduce noise
   - Monitor AI scoring usage

4. **Security**
   - Never commit secrets to git
   - Use Modal secrets for all credentials
   - Rotate API keys regularly

---

## Scaling

### Increase Frequency
```python
# Every 3 hours instead of 6
schedule=modal.Cron("0 */3 * * *")
```

### Add More Subreddits
Edit `scrapers/reddit_monitor_ai.py`:
```python
SUBREDDITS = ['HVAC', 'homeowners', 'Plumbing', 
              'HomeImprovement', 'hvacadvice', 'AskContractors']
```

### Parallel Processing
```python
@app.function(concurrency_limit=5)
def run_reddit_monitor():
    # Process multiple subreddits in parallel
```

---

## Maintenance

### Weekly Tasks
- [ ] Review logs for errors
- [ ] Check signal quality
- [ ] Monitor API costs

### Monthly Tasks
- [ ] Analyze conversion rates
- [ ] Optimize scoring thresholds
- [ ] Review and update keywords

### Quarterly Tasks
- [ ] Audit API usage and costs
- [ ] Update dependencies
- [ ] Review and improve prompts

---

## Support

- **Modal Docs**: https://modal.com/docs
- **Modal Discord**: https://discord.gg/modal
- **GitHub Issues**: Create issue in repo

---

**Last Updated**: December 21, 2025
