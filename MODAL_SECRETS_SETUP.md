# Modal Secrets Setup Guide

## Problem
You're getting: `Secret 'demand-engine-secrets' not found in environment 'main'`

This means you need to create the secrets in Modal's dashboard before deploying.

---

## Solution: Create Modal Secrets

### Step 1: Access Modal Dashboard

Go to: https://modal.com/secrets/haiec/main/create

Or navigate:
1. Go to https://modal.com
2. Click on your workspace (haiec)
3. Click "Secrets" in sidebar
4. Click "Create Secret"

---

## Step 2: Create Required Secrets

You need to create **3 separate secrets** for the different services:

### Secret 1: `demand-engine-secrets`

**Click "Create Secret" and name it:** `demand-engine-secrets`

**Add these key-value pairs:**

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here

# Twilio (SHARED with voice agent)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890

# Daily.co (for video meetings)
DAILY_API_KEY=your-daily-api-key

# Resend (for emails)
RESEND_API_KEY=re_your-key-here

# JWT & Stripe
JWT_SECRET=your-random-secret-string-here
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

**Click "Create"**

---

### Secret 2: `hvac-agent-secrets`

**Click "Create Secret" and name it:** `hvac-agent-secrets`

**Add these key-value pairs:**

```env
# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here

# Twilio (SAME credentials as demand-engine)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here

# Voice Agent Config
HVAC_COMPANY_NAME=KC Comfort Air
TRANSFER_PHONE=+16822249904
EMERGENCY_PHONE=+16822249904
DEMO_MODE=true

# Database (optional - defaults to SQLite)
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Resend (for lead notifications)
RESEND_API_KEY=re_your-key-here
LEAD_NOTIFICATION_EMAIL=subodh.kc@haiec.com
```

**Click "Create"**

---

### Secret 3: `elevenlabs` (Optional)

**Only if you want natural voice TTS**

**Click "Create Secret" and name it:** `elevenlabs`

**Add these key-value pairs:**

```env
ELEVENLABS_API_KEY=sk_your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id
USE_ELEVENLABS=true
```

**Click "Create"**

---

### Secret 4: `resend` (Optional)

**Already covered in hvac-agent-secrets, but if you want separate:**

**Click "Create Secret" and name it:** `resend`

```env
RESEND_API_KEY=re_your-key-here
```

**Click "Create"**

---

## Step 3: Scraper Secrets (for modal_scrapers.py)

If you're deploying the scraping pipeline, create these:

### Secret: `kestrel-reddit-api`

```env
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=YourApp/1.0
```

### Secret: `kestrel-openai`

```env
OPENAI_API_KEY=sk-proj-your-key-here
```

### Secret: `kestrel-supabase`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### Secret: `kestrel-resend`

```env
RESEND_API_KEY=re_your-key-here
```

---

## Step 4: Verify Secrets Created

In Modal dashboard, you should see:
- ✅ `demand-engine-secrets`
- ✅ `hvac-agent-secrets`
- ✅ `elevenlabs` (optional)
- ✅ `resend` (optional)
- ✅ `kestrel-reddit-api` (for scrapers)
- ✅ `kestrel-openai` (for scrapers)
- ✅ `kestrel-supabase` (for scrapers)
- ✅ `kestrel-resend` (for scrapers)

---

## Step 5: Deploy Services

Now you can deploy without errors:

### Deploy Demand Engine

```bash
cd demand-engine
modal deploy modal_app.py
```

### Deploy Voice Agent

```bash
cd hvac_agent
modal deploy modal_app.py
```

### Deploy Scrapers

```bash
cd demand-engine
modal deploy modal_scrapers.py
```

---

## Sharing Secrets Between Services

### Current Setup ✅

Both `demand-engine-secrets` and `hvac-agent-secrets` include:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`

This means **both services can access Twilio** with the same credentials.

### Why Separate Secrets?

1. **Security**: Each service only gets the secrets it needs
2. **Flexibility**: Can update one without affecting the other
3. **Clarity**: Easy to see what each service requires

### Alternative: Single Shared Secret

If you prefer one secret for everything, you can:

1. Create a single secret called `shared-secrets` with ALL keys
2. Update both `modal_app.py` files to use:
   ```python
   secrets=[
       modal.Secret.from_name("shared-secrets"),
   ]
   ```

But the current approach (separate secrets with shared Twilio creds) is **recommended**.

---

## Quick Reference: Where to Get API Keys

### Twilio
1. Go to https://console.twilio.com
2. Copy Account SID and Auth Token from dashboard
3. Get phone number from Phone Numbers section

### Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy URL and anon/service keys

### OpenAI
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy immediately (won't show again)

### ElevenLabs (Optional)
1. Go to https://elevenlabs.io
2. Profile → API Keys
3. Copy API key and Voice ID

### Resend
1. Go to https://resend.com/api-keys
2. Create API key
3. Copy key

### Reddit (for scrapers)
1. Go to https://www.reddit.com/prefs/apps
2. Create app (script type)
3. Copy client ID and secret

### Daily.co (for video)
1. Go to https://dashboard.daily.co
2. Developers → API Keys
3. Create and copy key

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Copy secret key (test or live)
3. For webhook secret: Developers → Webhooks → Add endpoint

---

## Troubleshooting

### Error: "Secret not found"
- **Solution**: Create the secret in Modal dashboard first
- **Link**: https://modal.com/secrets/haiec/main/create

### Error: "Invalid Twilio credentials"
- **Solution**: Verify Account SID starts with "AC" and is 34 characters
- **Solution**: Check Auth Token is correct (no spaces)

### Error: "OpenAI API key invalid"
- **Solution**: Ensure key starts with "sk-proj-" or "sk-"
- **Solution**: Create new key if old one expired

### Error: "Supabase connection failed"
- **Solution**: Verify URL format: `https://xxx.supabase.co`
- **Solution**: Check you're using the correct key (anon vs service)

### Deployment succeeds but app doesn't work
- **Solution**: Check Modal logs: `modal app logs hvac-voice-agent`
- **Solution**: Verify all required secrets are set
- **Solution**: Test locally first with `.env` file

---

## Testing After Deployment

### Test Demand Engine
```bash
curl https://your-app.modal.run/
```

Should return:
```json
{
  "service": "Kestrel Demand Engine",
  "version": "2.0.0",
  "status": "operational"
}
```

### Test Voice Agent
```bash
curl https://your-app.modal.run/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "HVAC Voice Agent"
}
```

### Test Twilio Integration
1. Call your Twilio number
2. Should hear disclaimer
3. AI agent should pick up
4. Check Modal logs for any errors

---

## Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env.example` files only
   - Add `.env` to `.gitignore`

2. **Rotate keys regularly**
   - Update in Modal dashboard
   - Redeploy services

3. **Use different keys for dev/prod**
   - Test keys for development
   - Live keys for production

4. **Monitor usage**
   - Check Twilio usage dashboard
   - Monitor OpenAI API usage
   - Set up billing alerts

---

## Next Steps

1. ✅ Create all required secrets in Modal
2. ✅ Deploy demand-engine
3. ✅ Deploy hvac-agent
4. ✅ Deploy scrapers (optional)
5. ✅ Test each service
6. ✅ Update Twilio webhook URLs to Modal endpoints
7. ✅ Monitor logs for any issues

---

## Support

If you encounter issues:
1. Check Modal logs: `modal app logs <app-name>`
2. Verify secrets in Modal dashboard
3. Test locally with `.env` file first
4. Check this guide's troubleshooting section

**Modal Documentation**: https://modal.com/docs
**Twilio Console**: https://console.twilio.com
**Supabase Dashboard**: https://app.supabase.com

---

**You're all set! 🚀**

Once secrets are created, your deployments will work smoothly.
