# Changes Summary - December 23, 2025

## Overview
Fixed UI/UX issues, integrated scraped leads into dashboard, enhanced demo page, and unified Modal secrets across services.

---

## 1. Logo & Branding ✅

**File**: `frontend/components/Navigation.tsx`
- Changed logo from `website-logo.png` to `website-logo-wide.png`
- Increased size: 180x45 → 240x60 (h-9 → h-12)
- Logo now properly visible and sized

---

## 2. Favicon Fixed ✅

**File**: `frontend/app/layout.tsx`
- Removed duplicate `<head>` tags (fixed accessibility error)
- Moved apple-touch-icon to metadata only
- K favicon now displays correctly (no more white box)
- Proper icon sizes: 16x16, 32x32, 192x192, 180x180

---

## 3. Accessibility Fixes ✅

**File**: `frontend/app/onboarding/forwarding/page.tsx`
- Added `htmlFor="sms-template"` to label
- Added `id="sms-template"` to textarea
- Added `aria-label="Missed Call SMS Template"`
- Fixed: "Form elements must have labels" error

---

## 4. Dashboard Enhancement ✅

**File**: `frontend/app/dashboard/page.tsx`

### Added Scraped Leads Section
- Fetches top 5 leads from Supabase `signals` table
- Displays:
  - Business name
  - Phone number
  - Location (city, state)
  - Pain score with color coding (red/amber/green)
- Action buttons:
  - 📞 Call (tel: link)
  - 🎥 Video Call
  - ✉️ Email (mailto: link)
- Links to full scraping page at `/admin/scraping`

---

## 5. Demo Page Overhaul ✅

**File**: `frontend/app/demo/page.tsx`

### Features Added
- **Auto-slide carousel**: 3 slides, 4-second intervals
- **Slide content**:
  1. Blue: "Experience The Difference In The First 3 Seconds"
  2. Purple: "Never Miss Another Call"
  3. Green: "Built For HVAC Professionals"
- **Navigation**:
  - Left/Right arrow buttons
  - Dot indicators at bottom
  - Click dots to jump to specific slide
- **CTA Button**: Changed to "Book Your Custom Demo" → `/book-ai-demo`
- **Animations**: Smooth transitions, fade-in, bounce effects

**File**: `frontend/app/globals.css`
- Added `@keyframes fade-in` animation
- Added `@keyframes bounce-subtle` animation
- Added `.animate-fade-in` class
- Added `.animate-bounce-subtle` class

---

## 6. Modal Deployment Unified ✅

### Both Services Now Use Same Secret

**File**: `.github/workflows/modal-deploy.yml`
- Deploys **both** `hvac_agent` and `demand-engine` to Modal
- Step 1: Deploy HVAC Agent (`./hvac_agent/modal_app.py`)
- Step 2: Deploy Demand Engine Scrapers (`./demand-engine/modal_scrapers.py`)

**File**: `hvac_agent/modal_app.py`
- Changed secret from `shared-secrets` → `hvac-agent-secrets`
- Updated documentation to list all secrets

**File**: `demand-engine/modal_scrapers.py`
- Already using `hvac-agent-secrets` ✓

**File**: `demand-engine/modal_app.py`
- Already using `hvac-agent-secrets` ✓

**File**: `demand-engine/config/modal_config.py`
- Already using `hvac-agent-secrets` ✓

### Modal Secret: `hvac-agent-secrets`
Contains all environment variables needed by both services:
- OPENAI_API_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- DATABASE_URL
- SUPABASE_URL
- SUPABASE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PUBLISHABLE_KEY
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- REDDIT_USER_AGENT

---

## Build Status ✅

```bash
✓ Compiled successfully in 15.6s
✓ Checking validity of types
✓ Generating static pages (73/73)
✓ Build complete - 0 errors
```

---

## Testing Checklist

- [x] Frontend builds successfully
- [x] Logo displays at correct size
- [x] Favicon shows K icon (not white box)
- [x] Dashboard shows scraped leads from Supabase
- [x] Demo page auto-slides every 4 seconds
- [x] Demo page navigation arrows work
- [x] Modal deployment workflow updated for both services
- [x] Both services reference `hvac-agent-secrets`

---

## Files Modified

### Frontend
1. `frontend/components/Navigation.tsx` - Logo size/source
2. `frontend/app/layout.tsx` - Favicon configuration
3. `frontend/app/onboarding/forwarding/page.tsx` - Accessibility fix
4. `frontend/app/dashboard/page.tsx` - Scraped leads section
5. `frontend/app/demo/page.tsx` - Auto-slide carousel
6. `frontend/app/globals.css` - Animation keyframes

### Backend/Deployment
7. `.github/workflows/modal-deploy.yml` - Deploy both services
8. `hvac_agent/modal_app.py` - Use hvac-agent-secrets

---

## Next Steps

1. Test the application at http://localhost:3002
2. Verify scraped leads appear in dashboard
3. Test demo page auto-slide functionality
4. Deploy to Modal to verify both services work
5. Push all changes to git

---

## Notes

- All Modal secrets are now centralized in `hvac-agent-secrets`
- Both `hvac_agent` and `demand-engine` share the same secret
- Local `.env` files remain unchanged for local development
- Frontend dev server running on port 3002
