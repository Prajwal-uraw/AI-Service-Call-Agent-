# Work Breakdown Structure (WBS) - Complete API Integration

**Date:** January 4, 2026  
**Estimated Total Time:** 8-12 hours  
**Priority:** Critical

---

## Phase 1: AlertStream (Neon DB) - 1.5 hours
**Status:** 🔄 In Progress

### 1.1 Database Setup (Neon)
- [ ] Create AlertStream tables in Neon DB
- [ ] Add proper indexes and constraints
- [ ] Create migration file for version control

### 1.2 Backend API Verification
- [ ] Verify all 13 AlertStream endpoints work with Neon
- [ ] Test authentication flow (register/login)
- [ ] Test alert CRUD operations
- [ ] Test webhook management
- [ ] Test subscription endpoints

### 1.3 Frontend Integration
- [ ] Verify AlertStream pages exist in frontend
- [ ] Connect frontend to AlertStream API endpoints
- [ ] Test end-to-end flow

---

## Phase 2: All Scrapers Deployment - 2 hours
**Status:** ⏳ Pending

### 2.1 Deploy Missing Scrapers to Modal
- [ ] Job Board Monitor - Add to modal_scrapers.py
- [ ] Licensing Monitor - Add to modal_scrapers.py
- [ ] BBB Scraper - Add to modal_scrapers.py
- [ ] Local Business Scraper - Add to modal_scrapers.py

### 2.2 Database Tables (Supabase)
- [ ] Create job_board_signals table
- [ ] Create licensing_signals table
- [ ] Create bbb_signals table
- [ ] Create local_business_signals table
- [ ] Add indexes and constraints

### 2.3 API Connections
- [ ] Verify scraper API endpoints in demand-engine
- [ ] Connect frontend scraping admin page
- [ ] Add scraper status monitoring

---

## Phase 3: Daily Video API - 1.5 hours
**Status:** ⏳ Pending

### 3.1 Database Tables (Supabase)
- [ ] Create video_rooms table
- [ ] Create video_call_logs table
- [ ] Create video_participants table
- [ ] Add indexes and foreign keys

### 3.2 API Verification
- [ ] Test POST /api/daily-video/create-room
- [ ] Test GET /api/daily-video/rooms
- [ ] Test DELETE /api/daily-video/rooms/{room_name}
- [ ] Test POST /api/daily-video/meeting-token
- [ ] Test POST /api/daily-video/log-call
- [ ] Test GET /api/daily-video/call-logs
- [ ] Test POST /api/daily-video/quick-start/{meeting_type}

### 3.3 Frontend Admin Pages
- [ ] Create /admin/video-rooms page
- [ ] Add room listing with delete functionality
- [ ] Add call logs viewer
- [ ] Add room creation interface

---

## Phase 4: AI Demo Meetings - 2 hours
**Status:** ⏳ Pending

### 4.1 Database Tables (Supabase)
- [ ] Create ai_demo_meetings table
- [ ] Create ai_demo_participants table
- [ ] Create ai_demo_analytics table
- [ ] Create ai_shadow_sessions table
- [ ] Add indexes and foreign keys

### 4.2 API Verification
- [ ] Test all 9 AI Demo endpoints
- [ ] Verify meeting creation flow
- [ ] Test AI shadow toggle functionality
- [ ] Test human takeover endpoint

### 4.3 Frontend Dashboard Pages
- [ ] Create /admin/ai-demos/page.tsx (main dashboard)
- [ ] Create /admin/ai-demos/upcoming/page.tsx
- [ ] Create /admin/ai-demos/past/page.tsx
- [ ] Create /admin/ai-demos/analytics/page.tsx
- [ ] Create /admin/ai-demos/[meetingId]/control/page.tsx (human takeover)
- [ ] Create /admin/ai-demos/[meetingId]/ai-shadow/page.tsx

### 4.4 Navigation Integration
- [ ] Add AI Demos to admin sidebar
- [ ] Add proper routing and breadcrumbs

---

## Phase 5: AI Guru - 0.5 hours
**Status:** ⏳ Pending

### 5.1 Database Verification
- [ ] Check if ai_guru_conversations table exists
- [ ] Check if ai_guru_usage table exists
- [ ] Create tables if missing

### 5.2 API Verification
- [ ] Test POST /api/ai-guru (ask question)
- [ ] Test GET /api/ai-guru/usage (usage stats)

### 5.3 Frontend Verification
- [ ] Verify AI Guru component exists
- [ ] Test end-to-end conversation flow

---

## Phase 6: Call Intelligence - 1 hour
**Status:** ⏳ Pending

### 6.1 Database Verification
- [ ] Verify call_intelligence table exists
- [ ] Verify call_transcripts table exists
- [ ] Verify call_sentiment table exists
- [ ] Create missing tables

### 6.2 API Verification
- [ ] Test GET /api/admin/call-intelligence/summary
- [ ] Test GET /api/admin/call-intelligence/live-calls
- [ ] Test GET /api/admin/call-intelligence/quality-metrics
- [ ] Test GET /api/admin/call-intelligence/sentiment-trends
- [ ] Test GET /api/admin/call-intelligence/call-details/{call_id}
- [ ] Test GET /api/admin/call-intelligence/transcripts/{call_id}
- [ ] Test POST /api/admin/call-intelligence/analyze

### 6.3 Frontend UI Verification
- [ ] Verify /admin/call-intelligence page works
- [ ] Test all dashboard components
- [ ] Verify data displays correctly

---

## Phase 7: Full API Audit - 1.5 hours
**Status:** ⏳ Pending

### 7.1 CRM APIs
- [ ] Contacts API - verify DB, API, UI
- [ ] Activities API - verify DB, API, UI
- [ ] Tasks API - verify DB, API, UI
- [ ] Pipeline API - verify DB, API, UI
- [ ] Email Marketing API - verify DB, API, UI

### 7.2 Admin APIs
- [ ] Tenants API - verify DB, API, UI
- [ ] Analytics API - verify DB, API, UI
- [ ] Signals API - verify DB, API, UI
- [ ] Conversion API - verify DB, API, UI

### 7.3 Twilio APIs
- [ ] Provisioning API - verify all endpoints
- [ ] Insights API - verify all endpoints

### 7.4 Other APIs
- [ ] Click-to-Call API - verify DB, API, UI
- [ ] Lead Capture API - verify DB, API, UI
- [ ] Report Generation API - verify DB, API, UI
- [ ] Outbound Calls API - verify DB, API, UI
- [ ] Scraped Leads API - verify DB, API, UI

---

## Deliverables Checklist

### Database Migrations Created
- [ ] 022_alertstream_neon.sql (Neon)
- [ ] 023_all_scrapers_tables.sql (Supabase)
- [ ] 024_daily_video_tables.sql (Supabase)
- [ ] 025_ai_demo_meetings_tables.sql (Supabase)
- [ ] 026_ai_guru_tables.sql (Supabase)
- [ ] 027_call_intelligence_tables.sql (Supabase)

### Frontend Pages Created
- [ ] /admin/video-rooms/page.tsx
- [ ] /admin/ai-demos/page.tsx
- [ ] /admin/ai-demos/upcoming/page.tsx
- [ ] /admin/ai-demos/past/page.tsx
- [ ] /admin/ai-demos/analytics/page.tsx
- [ ] /admin/ai-demos/[meetingId]/control/page.tsx
- [ ] /admin/ai-demos/[meetingId]/ai-shadow/page.tsx

### Modal Deployments Updated
- [ ] kestrel-pain-signal-scrapers (add all scrapers)

---

## Execution Order

1. **Phase 1** - AlertStream (Neon) - Foundation for alert product
2. **Phase 4** - AI Demo Meetings - High business value
3. **Phase 3** - Daily Video API - Supports AI demos
4. **Phase 2** - All Scrapers - Lead generation
5. **Phase 5** - AI Guru - Quick verification
6. **Phase 6** - Call Intelligence - Verification
7. **Phase 7** - Full Audit - Ensure nothing missed

---

## Notes

- Keep all voice implementations (Stream, ElevenLabs, Gather, Realtime) for future products
- AlertStream uses Neon DB for security isolation
- All other services use Supabase
- Frontend uses Next.js 15 with App Router
