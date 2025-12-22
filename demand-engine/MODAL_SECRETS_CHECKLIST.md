# Modal Secrets Setup Checklist

## Missing Secret: `kestrel-supabase`

Go to: https://modal.com/secrets/haiec/main/create?secret_name=kestrel-supabase

Add these environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

---

## All Required Secrets (4 total)

### ✅ 1. kestrel-reddit-api
```
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_USER_AGENT=PainSignalBot/1.0
```

### ✅ 2. kestrel-openai
```
OPENAI_API_KEY=sk-your-key
USE_AI_SCORING=true
```

### ❌ 3. kestrel-supabase (MISSING)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### ✅ 4. kestrel-resend
```
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=hello@kestrel.ai
ALERT_EMAIL_TO=alerts@kestrel.ai
```

---

## Quick Links

- Create kestrel-supabase: https://modal.com/secrets/haiec/main/create?secret_name=kestrel-supabase
- View all secrets: https://modal.com/secrets

---

## After Adding Secret

Run deployment again:
```bash
cd demand-engine
modal deploy modal_scrapers.py
```
