# AI Co-Presenter Demo Call - Work Breakdown Structure (WBS)

**Project**: AI-Powered Sales Demo System ("Jobs Keynote" Style)  
**Objective**: Build an AI co-presenter that demonstrates product capabilities during live sales calls  
**Timeline**: 8-12 weeks  
**Budget**: $2,000 - $15,000 (depending on phase)

---

## 📊 Executive Summary

**What We're Building**: A revolutionary sales demo where an AI agent co-presents with a human sales rep, demonstrating the product's capabilities in real-time while selling it.

**Key Innovation**: The AI doesn't just talk about voice AI—it IS the voice AI, proving the technology works while explaining it.

**Target Outcome**: 
- 15-minute sales demo
- 4 distinct phases (Warm-up → Problem → Solution → Close)
- Seamless AI-to-human handoff
- Live PPT presentation with AI narration
- 3x higher conversion rate vs traditional demos

---

## 🎯 Project Phases Overview

```
Phase 1: Foundation (Weeks 1-2)
├── Script Development
├── Slide Deck Design
└── Technical Architecture

Phase 2: Core Build (Weeks 3-6)
├── AI Integration
├── Presentation Controller
└── Meeting Platform Setup

Phase 3: Content Production (Weeks 5-7)
├── Audio Recording
├── Visual Assets
└── Demo Materials

Phase 4: Integration & Testing (Weeks 7-10)
├── System Integration
├── Beta Testing
└── Refinement

Phase 5: Launch & Scale (Weeks 11-12)
├── Production Deployment
├── Sales Team Training
└── Performance Monitoring
```

---

## 📋 Detailed Work Breakdown Structure

### **PHASE 1: FOUNDATION** (Weeks 1-2)

#### 1.1 Script Development
**Owner**: Content Team  
**Duration**: 1 week  
**Budget**: $500-1,000

**Deliverables**:
- [ ] **1.1.1** Phase 1 Script (Warm-up - 3 minutes)
  - Opening (30 seconds)
  - Rapport building (1 minute)
  - Qualifying questions (1 minute)
  - Transition to PPT (30 seconds)
  
- [ ] **1.1.2** Phase 2 Script (Transformation - 2 minutes)
  - Slide 1: The Problem (60 seconds)
  - Slide 2: Industry Reality (45 seconds)
  - Slide 3: Old Solutions (45 seconds)
  
- [ ] **1.1.3** Phase 3 Script (Reveal - 7 minutes)
  - Slide 4: THE SOLUTION (90 seconds)
  - Slide 5: How It Works (90 seconds + 30s demo)
  - Slide 6: Why Different (60 seconds)
  - Slide 7: ONE MORE THING (90 seconds)
  - Slide 8: Real Results (60 seconds)
  
- [ ] **1.1.4** Phase 4 Script (Close - 3 minutes)
  - Objection handling scripts (4 scenarios)
  - Closing script
  - Fallback scripts
  
- [ ] **1.1.5** Guardrails Documentation
  - AI behavior rules
  - Interruption handling
  - Error recovery scripts
  - Scope boundaries

**Success Criteria**:
- Scripts read naturally (test with 5+ people)
- Total runtime: 14-16 minutes
- All objections covered
- Guardrails comprehensive

---

#### 1.2 Slide Deck Design
**Owner**: Design Team  
**Duration**: 1.5 weeks  
**Budget**: $1,000-3,000

**Deliverables**:
- [ ] **1.2.1** Design System Selection
  - Choose skin (Tesla Industrial / Apple Minimal / Industrial Power)
  - Define color palette
  - Select typography
  - Create brand guidelines
  
- [ ] **1.2.2** Slide Templates (8 slides)
  - Slide 1: While You Were Sleeping
  - Slide 2: The HVAC Answering Problem
  - Slide 3: What You've Probably Tried
  - Slide 4: THE SOLUTION
  - Slide 5: How It Works
  - Slide 6: Why We're Different
  - Slide 7: ONE MORE THING
  - Slide 8: Real Results
  
- [ ] **1.2.3** Visual Assets
  - Phone icons (glowing, vibrating)
  - Dashboard mockups
  - Customer photos (2)
  - Icons (checkmark, x-mark, emergency, calendar, analytics)
  - Background textures
  
- [ ] **1.2.4** Animation Specifications
  - Slide transition effects
  - Element entrance animations
  - Timing marks for narration sync
  - Pause points documented

**Success Criteria**:
- Slides are visually stunning (9/10 rating from 5 reviewers)
- Animations sync with narration
- Brand consistency across all slides
- Mobile/tablet responsive

---

#### 1.3 Technical Architecture
**Owner**: Engineering Lead  
**Duration**: 1 week  
**Budget**: Internal time

**Deliverables**:
- [ ] **1.3.1** System Architecture Document
  - Daily.co meeting room setup
  - AI agent backend design
  - Presentation controller architecture
  - Data flow diagrams
  
- [ ] **1.3.2** Technology Stack Selection
  - Video platform: Daily.co
  - AI voice: OpenAI Realtime API
  - Avatar system: D-ID / HeyGen / Synthesia
  - Presentation: Custom WebRTC + PPT
  
- [ ] **1.3.3** Integration Plan
  - API endpoints defined
  - Authentication flow
  - Error handling strategy
  - Monitoring & logging plan
  
- [ ] **1.3.4** Infrastructure Requirements
  - Server specs
  - Bandwidth requirements
  - Storage needs
  - CDN setup for assets

**Success Criteria**:
- Architecture supports <200ms AI response time
- System can handle 10 concurrent demos
- 99.9% uptime target
- Graceful degradation on failures

---

### **PHASE 2: CORE BUILD** (Weeks 3-6)

#### 2.1 AI Integration
**Owner**: AI/ML Engineer  
**Duration**: 3 weeks  
**Budget**: $2,000-5,000

**Deliverables**:
- [ ] **2.1.1** OpenAI Realtime API Integration
  - Voice streaming setup
  - Latency optimization (<200ms)
  - Voice selection and tuning
  - Interruption handling
  
- [ ] **2.1.2** Conversational AI Training
  - System prompts for Phase 1
  - Qualifying question logic
  - Dynamic response generation
  - Context retention
  
- [ ] **2.1.3** Mode Switching Logic
  - Streaming voice mode (Phase 1, 4)
  - Pre-scripted narration mode (Phase 2, 3)
  - Smooth transitions between modes
  - Fallback mechanisms
  
- [ ] **2.1.4** Guardrails Implementation
  - Max interruptions before handoff (3)
  - Timing limits (15 min hard stop)
  - Technical failure handling
  - Customer disengagement detection
  - Scope boundary enforcement

**Success Criteria**:
- AI response time: <200ms (95th percentile)
- Natural conversation flow (rated 8/10 by testers)
- Zero crashes during 20 test runs
- Graceful handling of all edge cases

---

#### 2.2 Presentation Controller
**Owner**: Frontend Engineer  
**Duration**: 2 weeks  
**Budget**: Internal time

**Deliverables**:
- [ ] **2.2.1** Slide Management System
  - Load slides from CDN
  - Transition engine
  - Timing synchronization
  - Pause/resume controls
  
- [ ] **2.2.2** Audio-Visual Sync
  - Narration playback
  - Slide transition triggers
  - Animation timing
  - Demo audio insertion
  
- [ ] **2.2.3** Screen Share Integration
  - Daily.co screen share API
  - PPT rendering
  - Quality optimization
  - Fallback to static images
  
- [ ] **2.2.4** Control Interface
  - Admin dashboard for presenter
  - Manual override controls
  - Real-time status monitoring
  - Emergency stop button

**Success Criteria**:
- Slides load in <2 seconds
- Audio-visual sync within 50ms
- No dropped frames during transitions
- Admin can override at any point

---

#### 2.3 Meeting Platform Setup
**Owner**: DevOps Engineer  
**Duration**: 1 week  
**Budget**: $500-1,000

**Deliverables**:
- [ ] **2.3.1** Daily.co Configuration
  - Custom domain setup
  - Room creation automation
  - Participant management
  - Recording setup
  
- [ ] **2.3.2** Virtual Background System
  - Background image hosting (CDN)
  - 6 professional backgrounds
  - Background blur fallback
  - Edge detection optimization
  
- [ ] **2.3.3** Branding Integration
  - Custom logo overlays
  - Lower-third name tags
  - Watermarks
  - Meeting room theme
  
- [ ] **2.3.4** Security & Privacy
  - Meeting room access controls
  - Recording permissions
  - Data retention policies
  - GDPR compliance

**Success Criteria**:
- Branded meeting experience
- <5 second room join time
- Recordings saved automatically
- Zero security incidents

---

### **PHASE 3: CONTENT PRODUCTION** (Weeks 5-7)

#### 3.1 Audio Recording
**Owner**: Audio Producer  
**Duration**: 2 weeks  
**Budget**: $1,000-2,000

**Deliverables**:
- [ ] **3.1.1** Narration Recording
  - 8 slide narrations (total ~9 minutes)
  - Professional voice talent OR ElevenLabs AI
  - Multiple takes for A/B testing
  - Timing marks added
  
- [ ] **3.1.2** Demo Call Recording
  - Real customer call (with permission)
  - 30-second highlight reel
  - Audio cleanup and mastering
  - Subtitles/captions
  
- [ ] **3.1.3** Audio Post-Production
  - Noise reduction
  - Volume normalization
  - Strategic pause insertion
  - Format optimization (MP3, 192kbps)
  
- [ ] **3.1.4** Quality Assurance
  - Listen tests with 10+ people
  - Timing validation
  - Clarity checks
  - Final approval

**Success Criteria**:
- Audio quality: Broadcast-grade
- Pacing feels natural (not rushed)
- Pauses create anticipation
- Demo call is compelling

---

#### 3.2 Visual Assets
**Owner**: Graphic Designer  
**Duration**: 1.5 weeks  
**Budget**: $800-2,000

**Deliverables**:
- [ ] **3.2.1** Icon Set Creation
  - Phone icons (3 variations)
  - UI icons (checkmark, x-mark, etc.)
  - Service icons (emergency, calendar, analytics)
  - All in SVG format
  
- [ ] **3.2.2** Dashboard Mockups
  - Call intelligence dashboard
  - Analytics view
  - Real-time call monitoring
  - 3 skin variations
  
- [ ] **3.2.3** Customer Testimonial Assets
  - Professional headshots (2)
  - Company logos
  - Quote graphics
  - Before/after comparisons
  
- [ ] **3.2.4** Background Images
  - 6 professional backgrounds (1920x1080)
  - Midjourney generation OR stock photos
  - Branded gradient backgrounds
  - Texture overlays

**Success Criteria**:
- All assets in high resolution
- Consistent visual style
- Optimized file sizes
- Accessible color contrast

---

#### 3.3 Avatar Creation
**Owner**: Avatar Specialist  
**Duration**: 1 week  
**Budget**: $0-5,000 (varies by approach)

**Deliverables**:
- [ ] **3.3.1** Avatar Approach Selection
  
  **Option A: Stock Video Loop (FREE - Recommended for MVP)**
  - Source: Pexels, Mixkit, or Pixabay
  - Search: "professional portrait listening" / "customer service portrait"
  - Criteria: Neutral expression, minimal movement, facing camera
  - Implementation: HTML/CSS with speaking indicator ring
  - Budget: $0
  - Setup time: 2 hours
  
  **Option B: AI Avatar Platforms**
  - Quick Launch: HeyGen ($24/mo)
  - Professional: D-ID ($49/mo)
  - Enterprise: Soul Machines ($500+/mo)
  
- [ ] **3.3.2** Stock Video Implementation (if Option A)
  - Download 3-5 candidate videos (5-8 seconds each)
  - Test loop quality
  - Implement speaking indicator (green glow ring)
  - Wire to AI audio state (setSpeaking function)
  - Add to Daily.co video feed
  
- [ ] **3.3.3** AI Avatar Setup (if Option B)
  - Professional appearance
  - Appropriate for B2B sales
  - Branded background
  - Watermark integration
  - Voice matching & lip-sync
  
- [ ] **3.3.4** Testing & Refinement
  - Professional appearance check
  - Speaking indicator responsiveness
  - A/B test different videos/avatars
  - Final selection

**Success Criteria**:
- Appears professional and trustworthy
- Speaking indicator syncs with audio (<120ms)
- No uncanny valley effect
- Rated 7+/10 for professionalism

**Stock Video Sources**:
```
Pexels.com → "professional portrait listening"
Mixkit.co → "customer service portrait" 
Pixabay.com/videos → "person looking at camera neutral"
```

---

### **PHASE 4: INTEGRATION & TESTING** (Weeks 7-10)

#### 4.1 System Integration
**Owner**: Full-Stack Engineer  
**Duration**: 2 weeks  
**Budget**: Internal time

**Deliverables**:
- [ ] **4.1.1** Component Integration
  - AI agent + Daily.co
  - Presentation controller + slides
  - Avatar + audio narration
  - All systems communicating
  
- [ ] **4.1.2** End-to-End Flow
  - AI joins meeting
  - Phase 1: Conversational intro
  - Phase 2-3: PPT presentation
  - Phase 4: Human handoff
  - Meeting conclusion
  
- [ ] **4.1.3** Error Handling
  - Audio glitch recovery
  - Slide loading failures
  - Network interruptions
  - AI timeout handling
  
- [ ] **4.1.4** Performance Optimization
  - Reduce latency
  - Optimize bandwidth
  - Minimize CPU usage
  - Cache frequently used assets

**Success Criteria**:
- Full demo runs without manual intervention
- <1% error rate in 50 test runs
- All transitions smooth
- Performance metrics met

---

#### 4.2 Beta Testing
**Owner**: QA Lead + Sales Team  
**Duration**: 2 weeks  
**Budget**: $500 (incentives for testers)

**Deliverables**:
- [ ] **4.2.1** Internal Testing (Week 1)
  - 20+ dry runs with team
  - Timing refinement
  - Script adjustments
  - Bug identification
  
- [ ] **4.2.2** Friendly Customer Testing (Week 2)
  - 5-10 beta customers
  - Real sales scenarios
  - Feedback collection
  - Conversion tracking
  
- [ ] **4.2.3** Edge Case Testing
  - Customer interruptions
  - Technical failures
  - Objection handling
  - Long silences
  
- [ ] **4.2.4** Feedback Analysis
  - Compile all feedback
  - Prioritize improvements
  - Create fix list
  - Plan iteration

**Success Criteria**:
- 80%+ positive feedback
- <3 critical bugs found
- Conversion rate >30% (beta)
- Timing feels natural

---

#### 4.3 Refinement
**Owner**: Product Manager  
**Duration**: 1 week  
**Budget**: Internal time

**Deliverables**:
- [ ] **4.3.1** Script Polish
  - Incorporate feedback
  - Tighten pacing
  - Improve transitions
  - Add personality
  
- [ ] **4.3.2** Visual Improvements
  - Slide tweaks
  - Animation timing
  - Color adjustments
  - Font optimization
  
- [ ] **4.3.3** Technical Fixes
  - Bug fixes
  - Performance improvements
  - Error handling enhancements
  - Monitoring additions
  
- [ ] **4.3.4** Documentation
  - User guide for sales team
  - Troubleshooting playbook
  - Best practices
  - FAQ

**Success Criteria**:
- All critical bugs fixed
- Documentation complete
- Team trained
- Ready for production

---

### **PHASE 5: LAUNCH & SCALE** (Weeks 11-12)

#### 5.1 Production Deployment
**Owner**: DevOps + Engineering  
**Duration**: 3 days  
**Budget**: $500-1,000

**Deliverables**:
- [ ] **5.1.1** Production Environment Setup
  - Dedicated servers
  - CDN configuration
  - Database setup
  - Monitoring tools
  
- [ ] **5.1.2** Deployment
  - Code deployment
  - Asset upload
  - Configuration
  - Health checks
  
- [ ] **5.1.3** Smoke Testing
  - Full demo run in production
  - Performance validation
  - Security audit
  - Backup verification
  
- [ ] **5.1.4** Rollback Plan
  - Backup system ready
  - Rollback procedure documented
  - Emergency contacts
  - Incident response plan

**Success Criteria**:
- Zero downtime deployment
- All systems green
- Performance matches staging
- Rollback tested

---

#### 5.2 Sales Team Training
**Owner**: Sales Manager  
**Duration**: 1 week  
**Budget**: Internal time

**Deliverables**:
- [ ] **5.2.1** Training Materials
  - Video walkthrough
  - Quick reference guide
  - Objection handling cheat sheet
  - Technical troubleshooting
  
- [ ] **5.2.2** Live Training Sessions
  - 2-hour workshop
  - Role-playing exercises
  - Q&A session
  - Certification quiz
  
- [ ] **5.2.3** Practice Demos
  - Each rep runs 5+ practice demos
  - Feedback and coaching
  - Timing practice
  - Handoff rehearsal
  
- [ ] **5.2.4** Go-Live Checklist
  - Pre-call preparation
  - Technical setup
  - Backup plan
  - Post-call follow-up

**Success Criteria**:
- 100% of sales team trained
- 90%+ pass certification
- Confident in demo delivery
- Know how to handle issues

---

#### 5.3 Performance Monitoring
**Owner**: Analytics Team  
**Duration**: Ongoing  
**Budget**: $200/month (tools)

**Deliverables**:
- [ ] **5.3.1** Metrics Dashboard
  - Demo completion rate
  - Conversion rate
  - Average demo duration
  - Technical error rate
  
- [ ] **5.3.2** Quality Monitoring
  - Recording review
  - Customer feedback collection
  - AI performance analysis
  - Slide engagement tracking
  
- [ ] **5.3.3** Continuous Improvement
  - Weekly performance review
  - A/B testing new scripts
  - Slide optimization
  - AI tuning
  
- [ ] **5.3.4** Reporting
  - Weekly metrics report
  - Monthly business review
  - Quarterly ROI analysis
  - Improvement recommendations

**Success Criteria**:
- Conversion rate >40%
- <5% technical failure rate
- Customer satisfaction >4.5/5
- Positive ROI within 3 months

---

## 📈 Success Metrics

### **Technical KPIs**
- AI response time: <200ms (95th percentile)
- System uptime: >99.5%
- Demo completion rate: >95%
- Technical error rate: <5%

### **Business KPIs**
- Conversion rate: >40% (vs 15% baseline)
- Average deal size: $2,000/month
- Sales cycle reduction: 30%
- Customer satisfaction: >4.5/5

### **Operational KPIs**
- Demos per week: 20+
- Setup time per demo: <5 minutes
- Sales rep training time: <4 hours
- Support tickets: <2 per week

---

## 💰 Budget Summary

### **Phase 1: Foundation** ($1,500-4,000)
- Script development: $500-1,000
- Slide design: $1,000-3,000
- Architecture: Internal

### **Phase 2: Core Build** ($2,500-6,000)
- AI integration: $2,000-5,000
- Presentation controller: Internal
- Meeting platform: $500-1,000

### **Phase 3: Content Production** ($1,800-4,000 or FREE with stock video)
- Audio recording: $1,000-2,000
- Visual assets: $800-2,000
- Avatar creation: $0 (stock video) or $500-5,000 (AI avatar)

### **Phase 4: Integration & Testing** ($500)
- Beta testing: $500
- Refinement: Internal
- Integration: Internal

### **Phase 5: Launch & Scale** ($700-1,200)
- Deployment: $500-1,000
- Training: Internal
- Monitoring: $200/month

### **Total One-Time**: $7,500-20,700
### **Monthly Recurring**: $200-1,000 (depending on avatar platform)

---

## 🎯 Risk Management

### **High Risk**
1. **AI Latency Issues**
   - Mitigation: Pre-test with OpenAI, have fallback scripts
   - Contingency: Use pre-recorded audio if real-time fails

2. **Customer Interruptions Breaking Flow**
   - Mitigation: Robust interruption handling, human takeover
   - Contingency: Sales rep trained to smoothly intervene

3. **Technical Failures During Live Demo**
   - Mitigation: Extensive testing, backup systems
   - Contingency: Pre-recorded backup demo ready

### **Medium Risk**
4. **Avatar Uncanny Valley Effect**
   - Mitigation: A/B test multiple avatars, get feedback
   - Contingency: Use voice-only or simple visual

5. **Script Feels Too Scripted**
   - Mitigation: Natural language, pauses, personality
   - Contingency: Iterate based on feedback

6. **Conversion Rate Doesn't Improve**
   - Mitigation: Track metrics, A/B test variations
   - Contingency: Revert to traditional demo, analyze why

---

## 📅 Timeline Gantt Chart

```
Week 1-2:   [Script Dev] [Slide Design] [Architecture]
Week 3-4:   [AI Integration ────────────────]
Week 5-6:   [AI Integration] [Presentation Controller] [Audio Recording]
Week 7-8:   [Visual Assets] [Avatar] [System Integration]
Week 9-10:  [Beta Testing ────────] [Refinement]
Week 11-12: [Deploy] [Training] [Launch] [Monitor]
```

---

## 🚀 Quick Start (MVP in 2 Weeks)

If you need to launch fast, here's the minimum viable version:

### **Week 1: MVP Build**
- [ ] Write Phase 1-3 scripts (skip Phase 4 for now)
- [ ] Create 5 core slides (Problem, Solution, How It Works, Difference, Results)
- [ ] Use HeyGen for avatar ($24/month)
- [ ] Record narration with ElevenLabs ($11/month)
- [ ] Use Canva for slides (free)

### **Week 2: MVP Test**
- [ ] Integrate with Daily.co
- [ ] Build basic presentation controller
- [ ] Run 10 internal tests
- [ ] Do 3 live customer demos
- [ ] Iterate based on feedback

### **MVP Budget**: $500-1,000
### **MVP Timeline**: 2 weeks
### **MVP Goal**: Prove concept works before full build

---

## 📞 Next Steps

1. **Approve WBS** - Review and sign off on plan
2. **Assign Owners** - Identify team members for each phase
3. **Set Budget** - Confirm budget allocation
4. **Kick Off Phase 1** - Start script development immediately
5. **Weekly Check-ins** - Every Monday, review progress

---

**Document Version**: 1.0  
**Last Updated**: December 23, 2025  
**Created By**: Cascade AI Assistant  
**Status**: Ready for Approval
