# Call Workflow Audit - Twilio Inbound + Forwarding

## Status: PARTIALLY BUILT - Needs Enhancement

---

## ✅ WHAT EXISTS

### 1. **Twilio Inbound Call Handling** ✅
**File**: `hvac_agent/app/routers/twilio_voice.py` (449 lines)

**Features**:
- Incoming call webhooks
- Speech recognition
- TwiML response generation
- Call state management
- Emergency routing
- Transfer to human (`_twiml_transfer`)

**Endpoints**:
- `POST /twilio/voice` - Main voice webhook
- `POST /twilio/status` - Call status callback

### 2. **Call Transfer/Forwarding** ✅
**Function**: `_twiml_transfer()` (lines 165-188)

```python
def _twiml_transfer(message: str, transfer_number: str, voice: str):
    """Generate TwiML for transferring to another number"""
    return f"""
    <Response>
        <Say voice="{voice}">{message}</Say>
        <Pause length="1"/>
        <Dial>{transfer_number}</Dial>
    </Response>
    """
```

**Usage**: When user requests human or emergency detected

### 3. **Call Telemetry Storage** ✅
**File**: `hvac_agent/app/models/db_models.py`

**Models**:
- `CallLog` - Stores call history, duration, transcript, sentiment
- `EmergencyLog` - Tracks emergency calls
- `Appointment` - Stores booking data

**CallLog Fields**:
- call_sid, caller_phone, called_number
- status, duration_seconds
- transcript, sentiment_score
- intent_detected, was_successful
- created_at, ended_at

### 4. **SMS Responder** ✅
**File**: `hvac_agent/app/services/notification_service.py`

**Features**:
- Send SMS via Twilio
- Emergency notifications
- Appointment confirmations
- Custom messages

### 5. **Business Hours Detection** ✅
**File**: `hvac_agent/app/models/db_models.py`

**Location Model**:
```python
opening_hour: int = Column(Integer, default=8)
closing_hour: int = Column(Integer, default=18)

def is_open(self, check_hour: int) -> bool:
    return self.opening_hour <= check_hour < self.closing_hour
```

---

## ❌ WHAT'S MISSING

### 1. **Number Capture + Forwarding Onboarding** ❌
- No UI for users to input their forwarding number
- No tenant-specific forwarding configuration
- No onboarding flow

### 2. **Missed/Dropped/After-Hours Call Detection** ❌
- No automatic detection of missed calls
- No tracking of dropped calls
- No after-hours call flagging
- No webhook for call completion status

### 3. **Optional Recording** ❌
- Recording is not configurable per tenant
- No UI toggle for enabling/disabling recording
- No recording storage/playback

### 4. **Cap AI Analysis to First 20 Calls** ❌
- No call count tracking per tenant
- No AI analysis gating logic
- No fallback for calls beyond 20

### 5. **Missed-Call SMS Responder** ❌
- No automatic SMS on missed calls
- No template for missed call messages
- No trigger on call status = "no-answer"

### 6. **Weekly Report Screen** ❌
- No weekly report UI
- No analytics aggregation
- No email report generation

---

## 🔧 WHAT NEEDS TO BE BUILT

### Priority 1: Number Capture + Forwarding Onboarding
**Files to Create**:
- `frontend/app/onboarding/forwarding/page.tsx` - UI for forwarding setup
- `demand-engine/routers/forwarding_config.py` - API for forwarding config
- `database/migrations/005_forwarding_config.sql` - Schema for forwarding

**Features**:
- Input forwarding phone number
- Test call functionality
- Save to tenant config
- Display current forwarding number

### Priority 2: Missed/Dropped/After-Hours Detection
**Files to Enhance**:
- `hvac_agent/app/routers/twilio_voice.py` - Add status tracking
- `hvac_agent/app/models/db_models.py` - Add missed_call flag

**Features**:
- Detect `CallStatus = "no-answer"`
- Detect `CallStatus = "busy"`
- Check business hours on incoming call
- Flag after-hours calls in database

### Priority 3: Missed-Call SMS Responder
**Files to Create**:
- `hvac_agent/app/services/missed_call_sms.py` - Auto-SMS service

**Features**:
- Trigger on missed call
- Send SMS: "Sorry we missed your call! We'll call you back during business hours."
- Log SMS sent
- Configurable template

### Priority 4: AI Analysis Cap (First 20 Calls)
**Files to Enhance**:
- `hvac_agent/app/routers/twilio_voice.py` - Add call count check
- Add tenant call counter

**Logic**:
```python
if tenant.call_count < 20:
    # Run full AI analysis
    run_agent(...)
else:
    # Fallback to simple forwarding
    return _twiml_transfer("Connecting you now", tenant.forward_number)
```

### Priority 5: Weekly Report Screen
**Files to Create**:
- `frontend/app/reports/weekly/page.tsx` - Weekly report UI
- `demand-engine/routers/reports.py` - Report API

**Metrics**:
- Total calls this week
- Missed calls
- Average call duration
- Top issues
- Busiest hours
- AI vs Human handled

---

## 📊 IMPLEMENTATION PLAN

### Phase 1: Forwarding Setup (2 hours)
1. Create forwarding config schema
2. Build onboarding UI
3. Add API endpoints
4. Test forwarding

### Phase 2: Call Detection (1 hour)
1. Add missed call detection
2. Add after-hours detection
3. Update CallLog model
4. Test with Twilio webhooks

### Phase 3: Missed-Call SMS (1 hour)
1. Create SMS service
2. Add trigger on missed call
3. Test SMS delivery

### Phase 4: AI Cap (30 min)
1. Add call counter to tenant
2. Add gating logic
3. Test with >20 calls

### Phase 5: Weekly Report (2 hours)
1. Build analytics aggregation
2. Create report UI
3. Add export functionality

**Total Estimated Time**: 6.5 hours

---

## 🎯 CURRENT STATUS SUMMARY

| Feature | Status | Completion |
|---------|--------|------------|
| Twilio Inbound | ✅ Built | 100% |
| Call Transfer | ✅ Built | 100% |
| Call Telemetry | ✅ Built | 100% |
| SMS Service | ✅ Built | 100% |
| Business Hours | ✅ Built | 100% |
| Forwarding Onboarding | ❌ Missing | 0% |
| Missed Call Detection | ❌ Missing | 0% |
| After-Hours Detection | ⚠️ Partial | 50% |
| Optional Recording | ❌ Missing | 0% |
| AI Cap (20 calls) | ❌ Missing | 0% |
| Missed-Call SMS | ❌ Missing | 0% |
| Weekly Report | ❌ Missing | 0% |

**Overall Completion**: 40%

---

## 🚀 NEXT STEPS

1. Build forwarding onboarding UI
2. Add missed/dropped call detection
3. Implement missed-call SMS responder
4. Add AI analysis cap
5. Build weekly report screen
