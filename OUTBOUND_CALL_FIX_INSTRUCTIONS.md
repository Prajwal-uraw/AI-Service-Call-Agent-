# Outbound Call Fix Instructions

## Issue: "Failed to initiate call: fetch failed"

This error occurs because the frontend cannot reach the backend API.

## Root Causes

1. **Backend URL not configured** - The API route doesn't know where your backend is deployed
2. **Backend not running** - The demand-engine backend needs to be deployed and accessible
3. **Missing Twilio credentials** - Backend needs Twilio credentials to make calls

## Solutions

### Option 1: Use Modal Deployed Backend (Recommended)

Your backend is deployed on Modal. Update your environment variables:

**File: `frontend/.env.local`**
```env
# Add this line
NEXT_PUBLIC_API_URL=https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run
```

**Or set in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run`
3. Redeploy

### Option 2: Run Backend Locally

If testing locally:

```bash
cd demand-engine
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Then set:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Option 3: Check Modal Deployment

Verify your backend is deployed:

```bash
cd demand-engine
modal deploy modal_app.py
```

This should output a URL like:
```
✓ Created web function kestrel-demand-engine-fastapi-app => https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run
```

## Required Backend Configuration

The backend needs these environment variables in Modal:

### Modal Secrets Setup

1. Go to Modal Dashboard: https://modal.com/secrets
2. Create or update secret named `hvac-agent-secrets`
3. Add these keys:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
BACKEND_URL=https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run
```

### Get Twilio Credentials

1. Go to https://console.twilio.com
2. Copy Account SID and Auth Token
3. Get a phone number from Phone Numbers → Manage → Active Numbers

## Testing the Fix

### 1. Test Backend Directly

```bash
curl https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run/health
```

Should return: `{"status":"healthy"}`

### 2. Test Outbound Call Endpoint

```bash
curl -X POST https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run/api/outbound-calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "to_number": "+1234567890",
    "call_purpose": "test",
    "use_ai_agent": false,
    "record_call": false
  }'
```

### 3. Check Frontend Logs

Open browser console and look for:
```
[Outbound Call] Backend URL: https://...
[Outbound Call] Initiating call to: +1234567890
```

## Verification Checklist

- [ ] Backend is deployed on Modal
- [ ] Modal secrets are configured with Twilio credentials
- [ ] `NEXT_PUBLIC_API_URL` is set in frontend environment
- [ ] Frontend is redeployed after env var change
- [ ] Backend health check returns 200
- [ ] Twilio account has available phone number
- [ ] Test call succeeds

## Common Errors

### "Twilio credentials not configured"
- Add Twilio credentials to Modal secrets

### "No Twilio phone number configured"
- Add `TWILIO_PHONE_NUMBER` to Modal secrets

### "Network error: fetch failed"
- Backend is not running or URL is wrong
- Check `NEXT_PUBLIC_API_URL` environment variable

### "CORS error"
- Backend CORS is already configured for all origins
- Should not be an issue

## Quick Fix Command

Run this to update and redeploy everything:

```bash
# 1. Deploy backend to Modal
cd demand-engine
modal deploy modal_app.py

# 2. Set frontend env var (if using Vercel)
# Go to Vercel Dashboard and add NEXT_PUBLIC_API_URL

# 3. Or for local testing
cd ../frontend
echo "NEXT_PUBLIC_API_URL=https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run" > .env.local
npm run dev
```

## Support

If still having issues:
1. Check Modal logs: `modal app logs kestrel-demand-engine`
2. Check Vercel logs in dashboard
3. Verify Twilio account is active and has credits
