# Environment Variables Setup Guide

## Overview
This guide explains where to add environment variables for local development and production deployment.

---

## 🔧 Local Development

### Backend (demand-engine & hvac_agent)

**File**: `.env.local` (in project root or service directory)

```bash
# Resend API (Email Service)
RESEND_API_KEY=re_4YDsWNEA_MgzhuQzWofP99VxeP3AVAhz8

# Twilio (Voice & SMS) - Already configured
TWILIO_ACCOUNT_SID=your_existing_sid
TWILIO_AUTH_TOKEN=your_existing_token
TWILIO_PHONE_NUMBER=your_existing_number

# OpenAI
OPENAI_API_KEY=your_existing_key

# Daily.co (Video)
DAILY_API_KEY=your_existing_key

# Database
DATABASE_URL=your_existing_url
```

### Frontend (Next.js)

**File**: `frontend/.env.local`

```bash
# API URL - Points to your backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production, this will be your deployed backend URL
# NEXT_PUBLIC_API_URL=https://your-backend.modal.run
```

---

## ☁️ Production (Vercel)

### Add Environment Variables in Vercel Dashboard

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `RESEND_API_KEY` | `re_4YDsWNEA_MgzhuQzWofP99VxeP3AVAhz8` | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL` | Your backend URL (e.g., `https://haiec--hvac-voice-agent-fastapi-app.modal.run`) | Production, Preview, Development |

#### Existing Variables (verify these are set):

| Variable Name | Description |
|--------------|-------------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `OPENAI_API_KEY` | OpenAI API key |
| `DAILY_API_KEY` | Daily.co API key |
| `DATABASE_URL` | PostgreSQL connection string |

---

## 📧 Resend Email Configuration

### Current Setup:
- **API Key**: `re_4YDsWNEA_MgzhuQzWofP99VxeP3AVAhz8`
- **From Email**: `Kestrel AI <onboarding@resend.dev>`
- **Endpoint**: `https://api.resend.com/emails`

### To Use Custom Domain:
1. Verify your domain in Resend dashboard
2. Update `from` field in `demand-engine/routers/lead_capture.py`:
   ```python
   "from": "Kestrel AI <hello@yourdomain.com>",
   ```

---

## 🔐 Security Notes

1. **Never commit `.env` or `.env.local` files** - Already gitignored ✅
2. **Use `.env.local` for local development** - Not tracked by git
3. **Add sensitive keys only in Vercel dashboard** - Never in code
4. **Rotate API keys regularly** - Especially if exposed

---

## 📍 API Endpoints

### Lead Capture Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lead-capture/phone` | POST | Capture phone number |
| `/api/lead-capture/email` | POST | Send case study email |
| `/api/lead-capture/voice-agent-number` | GET | Get voice agent number |
| `/api/lead-capture/stats` | GET | Get lead statistics |

### Example Request (Phone Capture):
```bash
curl -X POST http://localhost:8000/api/lead-capture/phone \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "555-123-4567", "source": "website"}'
```

### Example Request (Email):
```bash
curl -X POST http://localhost:8000/api/lead-capture/email \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "source": "website"}'
```

---

## ✅ Verification Checklist

- [ ] `.env.local` created in project root
- [ ] `RESEND_API_KEY` added to `.env.local`
- [ ] `NEXT_PUBLIC_API_URL` set in `frontend/.env.local`
- [ ] Environment variables added to Vercel dashboard
- [ ] Backend server restarted after adding env vars
- [ ] Frontend rebuilt after adding env vars
- [ ] Test email sending works
- [ ] Test phone capture works

---

## 🚀 Quick Start

### Start Backend:
```bash
cd demand-engine
# Make sure .env.local exists with RESEND_API_KEY
python -m uvicorn app:app --reload --port 8000
```

### Start Frontend:
```bash
cd frontend
# Make sure .env.local exists with NEXT_PUBLIC_API_URL
npm run dev
```

### Test Lead Capture:
1. Visit `http://localhost:3000`
2. Scroll to lead capture widget
3. Try phone capture - should show voice agent number
4. Try email - should send email via Resend

---

## 🐛 Troubleshooting

### Email not sending?
- Check `RESEND_API_KEY` is set correctly
- Check backend logs for Resend API errors
- Verify API key is valid in Resend dashboard

### Frontend can't reach backend?
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running on correct port
- Check CORS settings in `demand-engine/app.py`

### Phone capture not working?
- Check browser console for errors
- Verify API endpoint is accessible
- Check backend logs for errors
