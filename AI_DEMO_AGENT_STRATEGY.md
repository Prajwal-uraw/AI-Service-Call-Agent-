# 🤖 AI DEMO SALES AGENT - Implementation Strategy

**Date**: December 22, 2025  
**Objective**: Build AI-powered sales agent for 15-min video demos with <200ms latency, $1-2 cost per call

---

## 🎯 CORE REQUIREMENTS

### **What We're Building**
- AI agent that **joins Daily.co video calls** as a participant
- Leads 15-minute sales demos autonomously
- Real-time streaming with voice activity detection
- Human shadow/takeover capability
- Cost-controlled ($1-2 per call)
- CRM integration for post-call intelligence

### **What We're NOT Building**
- ❌ Custom video UI
- ❌ Calendar UI from scratch
- ❌ Video embedding in Teams
- ❌ AI avatars
- ❌ Price negotiation logic
- ❌ Multi-AI conversations

---

## 🏗️ ARCHITECTURE

```
Customer Books Demo (Cal.com)
        ↓
Create Daily Room + AI Token
        ↓
AI Agent Joins 30s Before Start
        ↓
┌─────────────────────────────────┐
│  STREAMING PIPELINE             │
│                                 │
│  Audio In → VAD → STT           │
│           ↓                     │
│     LLM (phase-locked)          │
│           ↓                     │
│         TTS → Audio Out         │
└─────────────────────────────────┘
        ↓
Human Can Shadow/Takeover
        ↓
Post-Call CRM Update
```

---

## 📋 IMPLEMENTATION PHASES

### **Phase 1: Meeting Creation API** ⭐ START HERE

**Endpoint**: `POST /api/ai-demo/create-meeting`

**Request**:
```json
{
  "customer_email": "john@acmehvac.com",
  "customer_name": "John Smith",
  "company_name": "Acme HVAC",
  "scheduled_time": "2025-12-23T14:00:00Z",
  "timezone": "America/New_York"
}
```

**Response**:
```json
{
  "meeting_id": "ai-demo-abc123",
  "daily_room_url": "https://kestrel.daily.co/ai-demo-abc123",
  "customer_join_url": "https://kestrel.daily.co/ai-demo-abc123?t=customer_token",
  "ai_join_url": "https://kestrel.daily.co/ai-demo-abc123?t=ai_token",
  "human_shadow_url": "https://kestrel.daily.co/ai-demo-abc123?t=shadow_token",
  "start_time": "2025-12-23T14:00:00Z",
  "calendar_event_id": "cal_xyz789"
}
```

**Backend Logic**:
1. Create Daily room with 15-min expiry
2. Generate 3 tokens:
   - Customer token (owner, mic+cam)
   - AI token (participant, mic only)
   - Shadow token (observer, muted)
3. Create calendar event (Google/Outlook API)
4. Send confirmation email with join link
5. Store meeting in database

**Files to Create**:
- `demand-engine/routers/ai_demo_agent.py`
- `demand-engine/services/ai_agent_service.py`
- `frontend/app/api/ai-demo/create-meeting/route.ts`

---

### **Phase 2: AI Agent Join Logic**

**Service**: `AIAgentService.join_meeting()`

**Responsibilities**:
1. Monitor scheduled meetings
2. Join Daily room 30 seconds before start
3. Set participant properties:
   - Display name: "AI Sales Advisor"
   - Mic: ON
   - Camera: OFF
   - Avatar: Static image (optional)

**Implementation**:
- Use Daily.co REST API to join as bot participant
- Use Daily.co's bot framework (if available) or custom WebRTC client
- Alternative: Use Daily Prebuilt with bot token

**Files to Create**:
- `demand-engine/services/daily_bot_client.py`
- `demand-engine/workers/meeting_scheduler.py` (cron job)

---

### **Phase 3: AI Sales Flow Engine** 🎯 CRITICAL

**Hard-Coded 5-Phase Flow**:

#### **Phase 0: Guardrails** (Pre-Call Setup)
```python
GUARDRAILS = {
    "max_duration_seconds": 900,  # 15 min
    "max_ai_turns": 20,
    "max_words_per_response": 60,
    "max_tts_seconds": 8,
    "cost_limit_per_call": 2.00
}
```

#### **Phase 1: Framing** (0-2 min)
**AI Script**:
```
"Hi [Name], I'm your AI Sales Advisor from Kestrel AI. 
I'm here to show you how our voice agent can transform your HVAC business.
This will take about 15 minutes. 
We'll cover your current challenges, see a quick demo, and discuss next steps.
Sound good?"
```

**Mode**: Streaming ON, LLM ON, TTS ON

#### **Phase 2: Discovery** (2-6 min)
**Max 3 Questions**:
1. "How many calls does your team handle per day?"
2. "What's your biggest challenge with after-hours calls?"
3. "Are you currently using any automation?"

**Detection Logic**:
- ICP fit: HVAC/Plumbing business
- Urgency: Hiring, scaling, missing calls
- Authority: Owner, GM, Ops Manager

**Mode**: Streaming ON, LLM ON, TTS ON

#### **Phase 3: Pitch** (6-11 min)
**Pre-Written Blocks** (No LLM):
```
Block 1: Problem
"Most HVAC businesses lose 30-40% of after-hours calls.
That's $50K-100K in revenue walking away."

Block 2: Solution
"Our AI voice agent answers every call, 24/7.
It books appointments, handles emergencies, and updates your CRM."

Block 3: Proof
"Our customers see 85% booking rate and save 20 hours/week."

Block 4: Demo
[Play pre-recorded demo call - 90 seconds]
```

**Mode**: Streaming OFF, TTS ON (scripted), LLM OFF

#### **Phase 4: Close** (11-14 min)
**Allowed CTAs** (Choose ONE):
1. "Book a call with our team" → Calendar link
2. "Start 14-day trial" → Onboarding link
3. "Get the deck" → Email PDF

**AI Must NOT**:
- Discount pricing
- Negotiate terms
- Promise custom features

**Mode**: Streaming ON, LLM ON (limited), TTS ON

#### **Phase 5: Exit** (14-15 min)
**AI Script**:
```
"Great! I've [booked your call / started your trial / sent the deck].
You'll get a confirmation email in 2 minutes.
Any final questions before we wrap up?"
```

**Mode**: Streaming ON, LLM ON, TTS ON

**Files to Create**:
- `demand-engine/ai_agent/sales_flow.py`
- `demand-engine/ai_agent/phase_manager.py`
- `demand-engine/ai_agent/scripts.py` (hard-coded scripts)

---

### **Phase 4: Streaming + Cost Controls** 💰 CRITICAL

#### **A. Voice Activity Detection (VAD)**

**Implementation**:
```python
# Only stream audio when human speaks
if vad.is_speech_detected():
    stream_to_stt(audio_chunk)
else:
    # Silence - don't process
    pass
```

**Cost Savings**: ~40% reduction

**Library**: Use `webrtcvad` or Daily.co's built-in VAD

#### **B. Phase-Locked AI**

**State Machine**:
```python
class AIState(Enum):
    LISTENING = "listening"  # STT only
    THINKING = "thinking"    # LLM only
    SPEAKING = "speaking"    # TTS only
    IDLE = "idle"

# NEVER run STT + LLM + TTS simultaneously
```

**Cost Savings**: ~50% reduction

#### **C. Context Freezing**

**After Discovery Phase**:
```python
# Summarize conversation to ≤500 tokens
summary = summarize_conversation(transcript)

# Freeze history
frozen_context = {
    "customer_name": "John Smith",
    "company": "Acme HVAC",
    "pain_points": ["after-hours calls", "scaling team"],
    "icp_fit": True,
    "urgency": "high"
}

# Only append deltas going forward
context = frozen_context + new_messages
```

**Cost Savings**: ~60% reduction in token usage

#### **D. Dual-Model Strategy**

**Fast Model** (Intent Detection):
- Model: `gpt-4o-mini` or `claude-3-haiku`
- Use: Classify user intent
- Cost: $0.01 per call

**Premium Model** (AI Speech):
- Model: `gpt-4o` or `claude-3.5-sonnet`
- Use: Generate AI responses
- Active: <25% of call time
- Cost: $1.50 per call

**Total Cost**: $1.51 per call ✅

**Files to Create**:
- `demand-engine/ai_agent/vad_processor.py`
- `demand-engine/ai_agent/state_machine.py`
- `demand-engine/ai_agent/context_manager.py`
- `demand-engine/ai_agent/model_router.py`

---

### **Phase 5: Human Shadow/Takeover** 👤

**Shadow Mode**:
- Human joins with `shadow_token`
- Muted by default
- Can see transcript in real-time
- Can trigger takeover

**Takeover Triggers**:
1. Pricing objection
2. Legal/procurement question
3. Customer says "I want a human"
4. Manual button click

**Takeover Flow**:
```python
if takeover_triggered:
    ai_agent.stop_speaking()
    ai_agent.mute_mic()
    ai_agent.set_mode("observer")
    human_shadow.unmute_mic()
    transcript.continue_logging()
```

**UI for Shadow**:
- Real-time transcript
- Customer info sidebar
- "Take Over" button
- AI phase indicator
- Cost tracker

**Files to Create**:
- `frontend/app/ai-demo/shadow/[meetingId]/page.tsx`
- `demand-engine/ai_agent/takeover_manager.py`

---

### **Phase 6: CRM + Logging**

**Post-Call Summary**:
```json
{
  "meeting_id": "ai-demo-abc123",
  "customer": {
    "name": "John Smith",
    "email": "john@acmehvac.com",
    "company": "Acme HVAC"
  },
  "duration_seconds": 847,
  "ai_speaking_time_seconds": 296,
  "phases_completed": ["framing", "discovery", "pitch", "close", "exit"],
  "icp_fit": true,
  "urgency": "high",
  "authority": "owner",
  "objections": ["pricing", "implementation time"],
  "cta_taken": "book_human_call",
  "next_step": "Follow-up call scheduled for 2025-12-24",
  "ai_cost": 1.87,
  "transcript_url": "https://...",
  "recording_url": "https://..."
}
```

**CRM Integration**:
- Create lead in CRM
- Tag with "AI Demo Completed"
- Add notes from summary
- Set follow-up task
- Update deal stage

**Files to Create**:
- `demand-engine/ai_agent/post_call_processor.py`
- `demand-engine/integrations/crm_sync.py`

---

## 🎨 UI COMPONENTS TO BUILD

### **1. AI Demo Booking Widget** (Cal.com Integration)

**Location**: `frontend/app/book-ai-demo/page.tsx`

**Features**:
- Calendar picker (Cal.com embed)
- Customer info form
- Timezone selector
- Confirmation page with join link

**Integration**:
- Triggers `POST /api/ai-demo/create-meeting`
- Sends confirmation email
- Creates calendar event

---

### **2. Shadow Dashboard**

**Location**: `frontend/app/ai-demo/shadow/[meetingId]/page.tsx`

**Features**:
- Real-time transcript
- Customer info sidebar
- AI phase indicator
- Cost tracker (live)
- "Take Over" button
- Mute/unmute controls

**Layout**:
```
┌─────────────────────────────────────┐
│  Customer: John Smith (Acme HVAC)  │
│  Phase: Discovery (2/5)             │
│  Cost: $0.42 / $2.00                │
│  [TAKE OVER]                        │
├─────────────────────────────────────┤
│  TRANSCRIPT                         │
│  ─────────────────────────────────  │
│  AI: How many calls per day?        │
│  Customer: About 50-60 calls        │
│  AI: What's your biggest...         │
│                                     │
└─────────────────────────────────────┘
```

---

### **3. AI Demo Admin Panel**

**Location**: `frontend/app/admin/ai-demos/page.tsx`

**Features**:
- Upcoming demos list
- Past demos with outcomes
- Success rate metrics
- Cost analytics
- Transcript search

**Metrics**:
- Total demos run
- ICP fit rate
- CTA conversion rate
- Avg cost per demo
- Human takeover rate

---

## 🔧 TECHNICAL STACK

### **Backend**
- **Framework**: FastAPI (existing)
- **Daily.co**: Video rooms + bot API
- **STT**: Deepgram or AssemblyAI
- **LLM**: OpenAI GPT-4o + GPT-4o-mini
- **TTS**: ElevenLabs or OpenAI TTS
- **VAD**: webrtcvad or Daily.co built-in
- **Database**: PostgreSQL (existing)

### **Frontend**
- **Framework**: Next.js (existing)
- **Video**: Daily.co Prebuilt UI
- **Calendar**: Cal.com (existing)
- **Real-time**: WebSocket for transcript

### **Infrastructure**
- **Scheduler**: Celery or APScheduler
- **Queue**: Redis
- **Storage**: S3 for recordings
- **Monitoring**: Sentry + custom metrics

---

## 📊 TARGET METRICS

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Latency | ≤200ms | STT → LLM → TTS pipeline |
| AI Cost | $1-2 per call | Track API usage |
| AI Talk Time | ≤35% | Duration tracking |
| ICP Fit Rate | ≥70% | Post-call classification |
| CTA Conversion | ≥40% | Track actions taken |
| Human Takeover | ≤20% | Takeover events |

---

## 🚀 IMPLEMENTATION ROADMAP

### **Week 1: Foundation**
- [ ] Create meeting API endpoint
- [ ] Daily.co room creation
- [ ] Token generation (3 types)
- [ ] Calendar integration
- [ ] Database schema for AI demos

### **Week 2: AI Agent Core**
- [ ] AI join logic
- [ ] 5-phase flow engine
- [ ] Hard-coded scripts
- [ ] Phase state machine
- [ ] Basic STT → LLM → TTS pipeline

### **Week 3: Cost Controls**
- [ ] VAD implementation
- [ ] Phase-locked AI states
- [ ] Context freezing
- [ ] Dual-model routing
- [ ] Cost tracking

### **Week 4: Human Features**
- [ ] Shadow dashboard UI
- [ ] Takeover logic
- [ ] Real-time transcript
- [ ] Post-call CRM sync
- [ ] Admin analytics

### **Week 5: Testing & Optimization**
- [ ] Latency optimization
- [ ] Cost optimization
- [ ] Edge case handling
- [ ] Load testing
- [ ] Production deployment

---

## ⚠️ CRITICAL SUCCESS FACTORS

### **1. Latency < 200ms**
- Use streaming STT (not batch)
- Pre-load TTS voices
- Minimize LLM context
- Use fast models for intent detection

### **2. Cost < $2**
- VAD to reduce STT usage
- Context freezing to reduce tokens
- Dual-model strategy
- Phase-lock to prevent parallel processing

### **3. Natural Conversation**
- Hard-coded scripts for pitch
- Max 60 words per response
- Max 8 seconds TTS
- Human-like pauses

### **4. Reliable Takeover**
- Instant mute on takeover
- Clear handoff message
- Transcript continuity
- No audio overlap

---

## 🔐 SECURITY & COMPLIANCE

### **Data Handling**
- Encrypt all recordings
- GDPR-compliant storage
- Customer consent for recording
- Auto-delete after 90 days

### **AI Safety**
- No pricing negotiation
- No custom promises
- No sensitive data collection
- Human escalation for legal questions

### **Access Control**
- Shadow tokens expire after call
- Admin-only access to recordings
- Audit log for takeovers
- Rate limiting on API

---

## 📝 DEFINITION OF DONE

### **Minimum Viable Product (MVP)**
- ✅ AI can run full 15-min demo
- ✅ Latency ≤200ms
- ✅ Cost ≤$2 per call
- ✅ Human can shadow and take over
- ✅ Post-call summary to CRM
- ✅ No custom video UI built

### **Production Ready**
- ✅ All 5 phases working
- ✅ Cost controls active
- ✅ Error handling robust
- ✅ Monitoring in place
- ✅ Documentation complete
- ✅ Load tested (10 concurrent calls)

---

## 🎯 INTEGRATION WITH EXISTING SYSTEM

### **Leverage What We Have**
- ✅ Daily.co integration (already built)
- ✅ Cal.com calendar (already integrated)
- ✅ CRM database schema (already exists)
- ✅ Admin portal (already built)
- ✅ Navigation (already has Video Calls link)

### **New Components**
- AI agent service (new)
- Streaming pipeline (new)
- Shadow dashboard (new)
- AI demo admin panel (new)

### **Modified Components**
- Video calls page → Add "AI Demo" tab
- Calendar page → Add "Book AI Demo" option
- Admin portal → Add "AI Demos" section

---

## 💡 QUICK WINS

### **Phase 1 (This Week)**
1. Add "Book AI Demo" button to calendar page
2. Create meeting API endpoint
3. Test Daily.co room creation with 3 tokens
4. Build basic shadow dashboard

### **Phase 2 (Next Week)**
1. Implement AI join logic
2. Build Phase 1 (Framing) only
3. Test STT → LLM → TTS pipeline
4. Measure latency

### **Phase 3 (Week After)**
1. Add all 5 phases
2. Implement VAD
3. Add cost tracking
4. Test full demo end-to-end

---

## 🚨 RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| Latency >200ms | High | Use streaming STT, fast models |
| Cost >$2 | High | Implement all cost controls |
| AI sounds robotic | Medium | Use ElevenLabs TTS, natural scripts |
| Takeover fails | High | Extensive testing, fallback to AI |
| Daily.co limits | Medium | Monitor usage, upgrade plan |

---

## 📚 NEXT STEPS

### **Immediate (Today)**
1. Review this strategy with team
2. Set up Daily.co bot API access
3. Choose STT provider (Deepgram recommended)
4. Choose TTS provider (ElevenLabs recommended)

### **This Week**
1. Create database schema for AI demos
2. Build meeting creation API
3. Test Daily.co 3-token flow
4. Build basic shadow dashboard

### **Next Week**
1. Implement AI join logic
2. Build Phase 1 flow
3. Test STT → LLM → TTS pipeline
4. Measure and optimize latency

---

**Last Updated**: December 22, 2025  
**Status**: Strategy Complete, Ready for Implementation  
**Estimated Timeline**: 4-5 weeks to MVP
