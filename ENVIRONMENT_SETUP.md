# Environment Setup Guide

Complete guide for configuring environment variables for the AI Service Call Agent project.

---

## Quick Start

1. Copy example files:
```bash
# Root directory
cp .env.example .env

# Frontend directory
cd frontend
cp .env.local.example .env.local
```

2. Fill in your credentials (see sections below)
3. Never commit `.env` or `.env.local` files to git

---

## Required Services

### **1. Supabase (Database & Storage)**

**What you need**:
- Supabase project URL
- Anon key (public)
- Service role key (secret)

**Where to find**:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_KEY`
   - `service_role` → `SUPABASE_SERVICE_KEY`

**Add to `.env`**:
```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Database URL**:
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```
Replace `[YOUR-PASSWORD]` with your database password (from Supabase project settings).

---

### **2. OpenAI (AI Scoring)**

**What you need**:
- OpenAI API key

**Where to find**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

**Add to `.env`**:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Cost**: ~$0.50-2.00/month for typical usage (GPT-4o-mini)

---

### **3. Reddit API (Pain Signal Scraping)**

**What you need**:
- Reddit client ID
- Reddit client secret

**Where to find**:
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click **Create App** or **Create Another App**
3. Fill in:
   - Name: `AI Service Call Agent`
   - Type: **script**
   - Redirect URI: `http://localhost:8000`
4. Click **Create app**
5. Copy:
   - Client ID (under app name)
   - Secret

**Add to `.env`**:
```bash
REDDIT_CLIENT_ID=xxxxxxxxxxxxx
REDDIT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
REDDIT_USER_AGENT=AI-Service-Call-Agent/1.0
```

**Cost**: Free

---

### **4. Resend (Email Service)**

**What you need**:
- Resend API key
- Verified domain (or use test mode)

**Where to find**:
1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Go to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `re_`)

**Add to `.env`**:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**For testing**: Use `onboarding@resend.dev` as FROM email (100 emails/day limit)

**Cost**: Free tier (3,000 emails/month)

---

### **5. Slack (Notifications) - Optional**

**What you need**:
- Slack webhook URL

**Where to find**:
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it and select workspace
4. Go to **Incoming Webhooks**
5. Toggle **Activate Incoming Webhooks** to ON
6. Click **Add New Webhook to Workspace**
7. Select channel and authorize
8. Copy the webhook URL

**Add to `.env`**:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

**Cost**: Free

---

### **6. Modal (Serverless Deployment) - Optional**

**What you need**:
- Modal token ID
- Modal token secret

**Where to find**:
1. Go to [modal.com](https://modal.com)
2. Sign up or log in
3. Go to **Settings** → **Tokens**
4. Click **Create token**
5. Copy token ID and secret

**Add to `.env`**:
```bash
MODAL_TOKEN_ID=ak-xxxxxxxxxxxxx
MODAL_TOKEN_SECRET=as-xxxxxxxxxxxxxxxxxxxxx
```

**Cost**: Free tier (30 hours/month)

---

## Backend Configuration

### **File**: `demand-engine/.env`

```bash
# Copy from root .env.example
cp .env.example demand-engine/.env

# Or create manually with required variables
```

**Minimum required**:
```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

---

## Frontend Configuration

### **File**: `frontend/.env.local`

```bash
# In frontend directory
cp .env.local.example .env.local
```

**Minimum required**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Modal Secrets (for Deployment)

If deploying to Modal, set secrets:

```bash
# Set Modal secrets
modal secret create kestrel-supabase \
  SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co \
  SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

modal secret create kestrel-openai \
  OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

modal secret create kestrel-reddit-api \
  REDDIT_CLIENT_ID=xxxxxxxxxxxxx \
  REDDIT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx

modal secret create kestrel-resend \
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

---

## Verification

### **Test Backend**:
```bash
cd demand-engine
python -c "from config.supabase_config import get_supabase_client; print('✅ Supabase connected')"
```

### **Test Frontend**:
```bash
cd frontend
npm run dev
# Visit http://localhost:3000
```

### **Test API**:
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

---

## Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Use different keys** for development/staging/production
3. **Rotate keys** regularly (every 90 days)
4. **Limit permissions** - use least privilege principle
5. **Monitor usage** - set up alerts for unusual activity

---

## Troubleshooting

### **"Module not found" errors**
- Check `.env` file exists in correct directory
- Verify file is named exactly `.env` (not `.env.txt`)
- Restart development server after changing `.env`

### **"Invalid API key" errors**
- Double-check key is copied correctly (no extra spaces)
- Verify key hasn't expired
- Check you're using the right key type (anon vs service_role)

### **Database connection errors**
- Verify Supabase project is active
- Check database password is correct
- Ensure IP is whitelisted (if using direct connection)

---

## Environment-Specific Configs

### **Development**:
```bash
ENVIRONMENT=development
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Production**:
```bash
ENVIRONMENT=production
API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Cost Summary

**Free Tier Limits**:
- Supabase: 500MB database, 1GB storage
- OpenAI: Pay-as-you-go (~$1-2/month typical)
- Resend: 3,000 emails/month
- Reddit API: Free unlimited
- Slack: Free unlimited
- Modal: 30 hours/month

**Total estimated cost**: $5-10/month for typical usage

---

## Next Steps

After setting up environment variables:

1. ✅ Run database migrations
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Test authentication
5. ✅ Test API endpoints
6. ✅ Verify CRM functionality

---

**Last Updated**: December 22, 2025  
**Required Services**: 4 (Supabase, OpenAI, Reddit, Resend)  
**Optional Services**: 2 (Slack, Modal)
