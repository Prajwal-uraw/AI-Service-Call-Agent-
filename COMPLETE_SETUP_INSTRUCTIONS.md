# Complete Setup Instructions

**Date:** January 4, 2026  
**Status:** Ready for Execution

---

## Quick Summary

This document contains all SQL migrations and setup instructions to complete the integration. Execute in order.

---

## Step 1: Run Supabase Migrations (5 minutes)

### 1.1 Login to Supabase

1. Go to: https://soudakcdmpcfavticrxd.supabase.co
2. Login: `prajwal.uraw@haiec.com` / `Gingka@120`
3. Click **SQL Editor** → **New Query**

### 1.2 Run Migration 023 (Complete Schema)

Copy and paste the contents of `database/migrations/023_complete_schema.sql` and run it.

This creates:
- `job_board_signals` - Job board scraper data
- `licensing_signals` - Licensing scraper data
- `bbb_signals` - BBB scraper data
- `local_business_signals` - Local business scraper data
- `video_rooms` - Daily.co video rooms
- `video_call_logs` - Video call history
- `video_participants` - Call participants
- `ai_demo_meetings` - AI demo meeting records
- `ai_demo_analytics` - Demo analytics data
- `ai_shadow_sessions` - AI shadow session data
- `ai_guru_conversations` - AI Guru chat history
- `ai_guru_usage` - AI Guru usage tracking
- `call_intelligence` - Call analysis records
- `call_transcripts` - Call transcripts
- `call_sentiment_timeline` - Sentiment tracking

### 1.3 Run Migration 024 (God Admin User)

Copy and paste the contents of `database/migrations/024_god_admin_user.sql` and run it.

This creates:
- `user_roles` table
- `admin_users` table
- God admin user: `Suvodkc@gmail.com` (ID: `ebd0b097-4a66-4597-804f-ff3a5bbdadd6`)
- Helper functions: `is_god_admin()`, `has_permission()`

---

## Step 2: Run Neon DB Migration (AlertStream)

### 2.1 Login to Neon Console

1. Go to: https://console.neon.tech
2. Login with your Neon account
3. Select your project
4. Click **SQL Editor**

### 2.2 Run AlertStream Migration

Copy and paste the contents of `database/migrations/022_alertstream_neon.sql` and run it.

This creates:
- `users` - AlertStream user accounts
- `websites` - Monitored websites
- `triggers` - SMS alert triggers
- `events` - Incoming events
- `sms_messages` - SMS history
- `api_keys` - API key management
- `subscriptions` - Stripe subscriptions
- `webhook_logs` - Webhook debugging

### 2.3 Update Neon Connection String

If the current connection string doesn't work, get the new one from Neon Console:
1. Go to your project dashboard
2. Click **Connection Details**
3. Copy the connection string
4. Update in `frontend/.env.local`:

```
ALERTSTREAM_DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Also update in Modal secrets (`hvac-agent-secrets`).

---

## Step 3: Verify God Admin User

Run this query in Supabase to verify:

```sql
SELECT 
    user_id,
    email,
    role,
    is_god_admin,
    permissions
FROM admin_users
WHERE email = 'Suvodkc@gmail.com';
```

Expected result:
- `user_id`: `ebd0b097-4a66-4597-804f-ff3a5bbdadd6`
- `role`: `god_admin`
- `is_god_admin`: `true`
- `permissions`: `["*", "admin:*", "tenant:*", ...]`

---

## Step 4: Deploy Modal Services

### 4.1 Deploy Scrapers

```bash
cd demand-engine
modal deploy modal_scrapers.py
```

### 4.2 Deploy Demand Engine API

```bash
cd demand-engine
modal deploy modal_app.py
```

### 4.3 Deploy HVAC Voice Agent

```bash
cd hvac_agent
modal deploy modal_app.py
```

---

## Step 5: Verify Frontend Pages

The following admin pages have been created:

| Page | URL | Description |
|------|-----|-------------|
| Video Rooms | `/admin/video-rooms` | Manage Daily.co rooms, view call logs |
| AI Demos | `/admin/ai-demos` | Manage AI demo meetings |
| AI Demo Analytics | `/admin/ai-demos/analytics` | Demo performance metrics |
| AI Demo Control | `/admin/ai-demos/[id]/control` | Live demo control panel |
| AI Shadow Config | `/admin/ai-demos/[id]/ai-shadow` | Configure AI assistant |
| Meeting Details | `/admin/ai-demos/[id]` | View past meeting details |

---

## Step 6: Test the Setup

### 6.1 Test Video Rooms

1. Go to `/admin/video-rooms`
2. Click "Create Room"
3. Enter a room name
4. Verify room appears in list
5. Click room URL to open

### 6.2 Test AI Demos

1. Go to `/admin/ai-demos`
2. View upcoming/past demos
3. Check analytics page

### 6.3 Test AlertStream (Neon)

```bash
curl -X GET "https://haiec--hvac-voice-agent-fastapi-app.modal.run/api/v1/alertstream/health"
```

Expected: `{"status": "healthy", "database": "connected"}`

---

## Database Architecture Summary

### Supabase (Main Database)
- Voice agent data
- CRM data (leads, contacts, pipeline)
- Scraper signals (Reddit, job boards, licensing, BBB, local business)
- Video calls and rooms
- AI demo meetings and analytics
- Call intelligence and transcripts
- User roles and admin users

### Neon (AlertStream Database)
- AlertStream user accounts
- Website monitoring
- SMS triggers and history
- Stripe subscriptions
- Webhook logs

---

## API Endpoints Summary

### Daily Video API (`/api/video/`)
- `POST /create-room` - Create video room
- `GET /rooms` - List all rooms
- `DELETE /rooms/{name}` - Delete room
- `POST /meeting-token` - Generate meeting token
- `POST /log-call` - Log call details
- `GET /call-logs` - Get call history
- `POST /quick-start/{type}` - Quick start meeting

### AI Demo API (`/api/ai-demo/`)
- `POST /create-meeting` - Create AI demo
- `GET /meeting/{id}/status` - Get meeting status
- `DELETE /meeting/{id}` - Cancel meeting
- `GET /meetings/upcoming` - List upcoming
- `GET /meetings/past` - List past meetings
- `GET /analytics/summary` - Get analytics
- `POST /meeting/{id}/takeover` - Human takeover
- `POST /meeting/{id}/ai-shadow/toggle` - Toggle AI shadow
- `GET /meeting/{id}/ai-shadow/stats` - Get AI stats

### AlertStream API (`/api/v1/alertstream/`)
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /websites` - Add website
- `GET /websites` - List websites
- `POST /triggers` - Create trigger
- `GET /triggers` - List triggers
- `POST /events` - Ingest event (webhook)
- `GET /sms` - SMS history
- `GET /sms/stats` - SMS statistics
- `GET /billing` - Billing info
- `GET /health` - Health check

---

## Files Created/Modified

### New Files
- `database/migrations/022_alertstream_neon.sql`
- `database/migrations/023_complete_schema.sql`
- `database/migrations/024_god_admin_user.sql`
- `frontend/components/ui/table.tsx`
- `frontend/components/ui/alert-dialog.tsx`
- `frontend/app/admin/video-rooms/page.tsx`
- `frontend/app/admin/ai-demos/page.tsx`
- `frontend/app/admin/ai-demos/analytics/page.tsx`
- `frontend/app/admin/ai-demos/[meetingId]/page.tsx`
- `frontend/app/admin/ai-demos/[meetingId]/control/page.tsx`
- `frontend/app/admin/ai-demos/[meetingId]/ai-shadow/page.tsx`
- `WBS_COMPLETE_INTEGRATION.md`
- `COMPLETE_SETUP_INSTRUCTIONS.md`

### Modified Files
- `frontend/components/ui/dialog.tsx` - Added DialogDescription, DialogFooter
- `frontend/components/Navigation.tsx` - Added new admin links

---

## Checklist

- [ ] Run Supabase migration 023 (complete schema)
- [ ] Run Supabase migration 024 (god admin user)
- [ ] Run Neon migration 022 (AlertStream)
- [ ] Verify god admin user created
- [ ] Deploy Modal scrapers
- [ ] Deploy Modal demand engine
- [ ] Deploy Modal voice agent
- [ ] Test video rooms page
- [ ] Test AI demos page
- [ ] Test AlertStream health endpoint
- [ ] Verify navigation links work

---

## Troubleshooting

### Neon Connection Failed
- Check if password has expired in Neon console
- Generate new connection string from Neon dashboard
- Update `ALERTSTREAM_DATABASE_URL` in env files and Modal secrets

### Supabase Migration Failed
- Check for existing tables with same names
- Use `DROP TABLE IF EXISTS` before CREATE if needed
- Check for foreign key constraint violations

### Modal Deploy Failed
- Ensure you're logged in: `modal token new`
- Check secrets exist: `modal secret list`
- Verify all dependencies in pip_install

### Frontend Build Errors
- Run `npm install` to ensure all dependencies
- Check for TypeScript errors: `npm run build`
- Verify all imports exist

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify database connections
3. Check Modal deployment logs
4. Review API endpoint responses

All migrations are idempotent (safe to run multiple times).
