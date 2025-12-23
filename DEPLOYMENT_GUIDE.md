# Kestrel Deployment Guide

## Repository
**GitHub**: https://github.com/subodhkc/AI-Service-Call-Agent-

---

## Vercel Deployment Setup

### Frontend Deployment

The frontend is configured to deploy from the `frontend/` directory.

**Vercel Configuration Files**:
- `vercel.json` (root) - Points to frontend directory
- `frontend/vercel.json` - Frontend-specific config

**Deployment Steps**:

1. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import project from GitHub: `subodhkc/AI-Service-Call-Agent-`
   - Framework: Next.js
   - Root Directory: `frontend`

2. **Environment Variables** (in Vercel Dashboard):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

3. **Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `frontend`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy on every push to `main`

**Expected Vercel URL**: 
- Production: `https://kestrel-hvac-ai.vercel.app` (or similar)
- Preview: `https://kestrel-hvac-ai-[hash].vercel.app`

---

## Backend Deployment (Demand Engine)

The backend FastAPI application needs to be deployed separately.

**Options**:

### Option 1: Railway
```bash
cd demand-engine
railway init
railway up
```

### Option 2: Render
1. Create new Web Service
2. Connect GitHub repo
3. Root Directory: `demand-engine`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Option 3: Fly.io
```bash
cd demand-engine
fly launch
fly deploy
```

**Environment Variables Required**:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# Resend Email
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=hello@kestrel.ai

# Reddit API
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret
REDDIT_USER_AGENT=PainSignalBot/1.0

# Alerts
ALERT_EMAIL_TO=alerts@kestrel.ai
```

---

## HVAC Agent Deployment (Already on Vercel)

The HVAC voice agent is already configured for Vercel deployment:
- Configuration: `hvac_agent/vercel.json`
- Deploys Python FastAPI app
- Handles voice calls via Twilio

---

## DNS Configuration

Once deployed, you'll need to configure DNS:

1. **Get Vercel URL** from deployment
2. **Add Custom Domain** in Vercel dashboard
3. **Configure DNS** at your domain registrar:
   - Type: CNAME
   - Name: @ (or subdomain)
   - Value: cname.vercel-dns.com

---

## Post-Deployment Checklist

### Frontend
- [ ] Verify homepage loads
- [ ] Test calculator functionality
- [ ] Check admin dashboard access
- [ ] Verify logo and favicon display
- [ ] Test PDF download
- [ ] Check mobile responsiveness

### Backend
- [ ] Test health endpoint: `/health`
- [ ] Verify calculator API: `/api/calculator/calculate`
- [ ] Test PDF generation: `/api/pdf/generate-roi-report`
- [ ] Check admin endpoints: `/api/admin/dashboard/stats`
- [ ] Verify email sending works
- [ ] Test Supabase connection

### Database
- [ ] Run schema migrations
- [ ] Verify calculator_submissions table
- [ ] Check reddit_signals table
- [ ] Test unified_signals view

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up log aggregation

---

## Continuous Deployment

**Automatic Deployment**:
- Push to `main` branch → Auto-deploy to production
- Pull requests → Preview deployments

**Manual Deployment**:
```bash
# Frontend
cd frontend
vercel --prod

# Backend (if using Vercel)
cd demand-engine
vercel --prod
```

---

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure environment variables are set

### API Connection Issues
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Database Issues
- Verify Supabase credentials
- Check table permissions
- Run migrations if needed

---

## Support

For deployment issues:
1. Check Vercel build logs
2. Review backend logs
3. Verify environment variables
4. Test API endpoints directly
5. Check Supabase dashboard

---

**Last Updated**: December 21, 2025
