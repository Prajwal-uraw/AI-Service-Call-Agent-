# Outbound Call Error Fix

## Issue
Outbound calls from dashboard failing with "Internal server error"

## Root Cause Analysis

The error occurs because:

1. **Frontend API route** (`/api/outbound-calls/initiate`) tries to proxy to backend
2. **Backend URL** may not be configured correctly
3. **Twilio credentials** may not be set in backend environment
4. **Backend server** may not be running

## Fix Applied

### 1. Enhanced Error Logging
Added detailed console logging to track:
- Request details (phone number)
- Backend URL being used
- Response status codes
- Actual error messages from backend

### 2. Better Error Handling
- Parse error responses properly
- Show helpful error messages
- Include troubleshooting hints

### 3. Environment Variable Check
Check both `BACKEND_URL` and `NEXT_PUBLIC_BACKEND_URL`

## Required Environment Variables

### Frontend (.env.local)
```env
# Backend API URL (server-side)
BACKEND_URL=http://localhost:8000

# Or use public version (client-side, less secure)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Backend (demand-engine/.env)
```env
# Twilio credentials (required for outbound calls)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Backend URL for callbacks
BACKEND_URL=http://localhost:8000
```

## How to Test

### 1. Check Backend is Running
```bash
cd demand-engine
python -m uvicorn admin.api:app --reload --port 8000
```

### 2. Verify Twilio Credentials
```bash
# In demand-engine directory
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('SID:', os.getenv('TWILIO_ACCOUNT_SID')[:10] if os.getenv('TWILIO_ACCOUNT_SID') else 'NOT SET')"
```

### 3. Test API Directly
```bash
curl -X POST http://localhost:8000/api/outbound-calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "to_number": "+1234567890",
    "call_purpose": "outbound_sales",
    "use_ai_agent": true,
    "record_call": true
  }'
```

### 4. Check Frontend Logs
Open browser console when making call from dashboard. Look for:
```
[Outbound Call] Initiating call to: +1234567890
[Outbound Call] Backend URL: http://localhost:8000
[Outbound Call] Backend response status: 200
[Outbound Call] Success: CA1234567890abcdef
```

## Common Errors & Solutions

### Error: "Backend server not running"
**Solution:** Start backend server
```bash
cd demand-engine
python -m uvicorn admin.api:app --reload --port 8000
```

### Error: "Twilio credentials not configured"
**Solution:** Add Twilio credentials to `demand-engine/.env`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Error: "No Twilio phone number configured"
**Solution:** Set `TWILIO_PHONE_NUMBER` in backend .env

### Error: "Failed to initiate call: [Twilio error]"
**Solution:** Check Twilio account status and phone number verification

## Integration with Existing Setup

**Good news:** You mentioned API keys are already in:
- ✅ Vercel secrets (for production)
- ✅ GitHub secrets (for CI/CD)
- ✅ Modal secrets (for Modal deployment)

For **local development**, you need to:
1. Create `demand-engine/.env` with Twilio credentials
2. Create `frontend/.env.local` with `BACKEND_URL=http://localhost:8000`
3. Start backend server before using outbound calls

## Next Steps

1. **Check console logs** - Browser console will now show detailed error
2. **Verify backend running** - Backend must be running on port 8000
3. **Confirm Twilio setup** - Credentials must be in backend environment
4. **Test with real number** - Use a verified Twilio number

## Status

✅ Enhanced error logging and handling
⏳ Waiting for environment setup verification
⏳ Backend server status check needed

**Action Required:** 
1. Start backend server if not running
2. Add Twilio credentials to backend .env
3. Try outbound call again and check console logs
