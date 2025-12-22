# DEMAND ENGINE - MASTER SCHEDULER
## Multi-Session Build Plan (60 Days)

---

## FEEDBACK SUMMARY

### ✅ Keep As-Is
- Tier 1-3 data sources (licensing boards, permits, job boards)
- 4-factor scoring system (urgency/budget/authority/pain)
- Separate repository architecture
- Calculator-based lead magnet
- Trigger-based follow-up system

### ⚠️ Modifications Required
1. **Remove Facebook scraping** - Use Reddit API only (compliant)
2. **Extend timeline** - 21 days → 60 days for production quality
3. **Simplify Phase 1** - Focus on core functionality first
4. **Manual competitor analysis** - Automate in Phase 2+
5. **Budget AI costs realistically** - $100-300/month at scale

---

## PHASE 1: FOUNDATION (Sessions 1-4, Days 1-15)

### Session 1: Infrastructure & Database (Days 1-3)
**Goal**: Set up core infrastructure

**Tasks**:
- [ ] Create separate `demand-engine` repository
- [ ] Provision Supabase (PostgreSQL)
- [ ] Set up Redis for caching
- [ ] Create database schema (all tables from plan)
- [ ] Set up environment variables
- [ ] Configure n8n instance

**Deliverables**:
- Working database with all tables
- Environment configured
- Basic health check endpoint

**Verification**:
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

---

### Session 2: Reddit Signal Aggregator (Days 4-6)
**Goal**: Build first data source (compliant API)

**Tasks**:
- [ ] Set up Reddit API credentials (PRAW)
- [ ] Implement Reddit scraper (2 subreddits: r/HVAC, r/Plumbing)
- [ ] Build deduplication logic
- [ ] Store raw signals in database
- [ ] Create cron job (every 6 hours)

**Deliverables**:
- Reddit scraper running on schedule
- 50+ signals collected in 24 hours
- Deduplication working

**Test Command**:
```python
python scrapers/reddit_monitor.py --test --subreddit HVAC --limit 10
```

---

### Session 3: Signal Classification Engine (Days 7-10)
**Goal**: Score signals with hybrid AI approach

**Tasks**:
- [ ] Implement keyword-based quick scoring
- [ ] Integrate OpenAI GPT-4-mini for deep scoring
- [ ] Build decision tree (when to use AI)
- [ ] Create batch processing logic
- [ ] Update database with scores

**Deliverables**:
- Classification accuracy >85%
- AI costs <$0.50 per 100 posts
- Batch processing <5 minutes for 100 posts

**Test**:
```python
python classifiers/signal_scorer.py --batch 50 --dry-run
```

---

### Session 4: Alert System (Days 11-15)
**Goal**: Daily digest for high-score signals

**Tasks**:
- [ ] Build alert queue (score ≥70)
- [ ] Create HTML email template
- [ ] Set up SendGrid/Postmark
- [ ] Implement daily digest generator
- [ ] Configure Slack webhook

**Deliverables**:
- Daily email at 8am with top 10 signals
- Slack notifications for score ≥85
- Email tracking working

**Checkpoint**: End of Phase 1
- 200+ signals/week collected
- 20+ high-score signals/week
- Automated daily alerts

---

## PHASE 2: LEAD GENERATION (Sessions 5-8, Days 16-30)

### Session 5: Calculator Backend (Days 16-20)
**Goal**: Build ROI calculator logic

**Tasks**:
- [ ] Create calculation engine (all formulas from plan)
- [ ] Build API endpoint `/calculator/submit`
- [ ] Implement session management
- [ ] Store submissions in database
- [ ] Create lead scoring logic

**Deliverables**:
- Working API endpoint
- Accurate calculations
- Lead records created

**Test**:
```bash
curl -X POST http://localhost:3000/calculator/submit \
  -H "Content-Type: application/json" \
  -d '{"business_type":"HVAC","avg_ticket_value":250,"calls_per_day":30}'
```

---

### Session 6: Calculator Frontend (Days 21-25)
**Goal**: Build user-facing calculator

**Tasks**:
- [ ] Create React/Next.js form
- [ ] Build results display page
- [ ] Implement email capture modal
- [ ] Add analytics tracking
- [ ] Deploy to Cloudflare Pages

**Deliverables**:
- Live calculator at yourdomain.com/calculator
- Mobile-responsive design
- Email capture rate >60%

**Test**: Submit 10 test calculations, verify all data flows

---

### Session 7: PDF Generation (Days 26-28)
**Goal**: Generate downloadable reports

**Tasks**:
- [ ] Set up PDF service (Puppeteer/wkhtmltopdf)
- [ ] Create PDF templates
- [ ] Implement async generation
- [ ] Store PDFs in R2/S3
- [ ] Email delivery with tracking

**Deliverables**:
- PDFs generated <60 seconds
- Email delivery working
- Tracking pixels active

---

### Session 8: Basic Competitor Analysis (Days 29-30)
**Goal**: Manual competitor benchmarking (automated later)

**Tasks**:
- [ ] Create competitor database table
- [ ] Build manual entry form
- [ ] Integrate into calculator results
- [ ] Display comparison data

**Deliverables**:
- 5 cities with competitor data
- Comparison shown in calculator

**Note**: Automation deferred to Phase 4

---

## PHASE 3: QUALIFICATION (Sessions 9-11, Days 31-40)

### Session 9: VAPI Integration (Days 31-35)
**Goal**: AI call agent setup

**Tasks**:
- [ ] Configure VAPI account
- [ ] Upload qualification script
- [ ] Set up webhook endpoint `/calls/webhook`
- [ ] Implement call record storage
- [ ] Build lead tier classification

**Deliverables**:
- Working AI agent
- 10+ test calls completed
- Lead tiers assigned correctly

---

### Session 10: Post-Call Automation (Days 36-38)
**Goal**: Automated follow-up after calls

**Tasks**:
- [ ] Build hot lead Slack alerts
- [ ] Create booking email templates
- [ ] Implement SMS alerts (Twilio)
- [ ] Set up calendar integration
- [ ] Build nurture sequence trigger

**Deliverables**:
- Hot leads alerted <5 minutes
- Booking emails sent automatically
- Nurture queue populated

---

### Session 11: Lead Dashboard (Days 39-40)
**Goal**: Internal lead management

**Tasks**:
- [ ] Build `/leads` API endpoints
- [ ] Create simple admin dashboard
- [ ] Implement lead filtering
- [ ] Add manual status updates

**Deliverables**:
- Dashboard showing all leads
- Filter by tier/status
- Manual override capability

---

## PHASE 4: FOLLOW-UP ENGINE (Sessions 12-14, Days 41-50)

### Session 12: Trigger Detection (Days 41-44)
**Goal**: Detect re-engagement opportunities

**Tasks**:
- [ ] Build news API integration
- [ ] Implement seasonal trigger logic
- [ ] Create trigger database
- [ ] Build matching algorithm

**Deliverables**:
- 3 trigger types working (seasonal, news, regulatory)
- Matching accuracy >70%

---

### Session 13: Email Generation (Days 45-47)
**Goal**: Personalized follow-up emails

**Tasks**:
- [ ] Create email templates (5 types)
- [ ] Implement GPT-4-mini content generation
- [ ] Build send-time optimization
- [ ] Set up email queue

**Deliverables**:
- 5 template types ready
- Personalization working
- Optimal send times calculated

---

### Session 14: Engagement Tracking (Days 48-50)
**Goal**: Track email performance

**Tasks**:
- [ ] Implement tracking pixels
- [ ] Build link click tracking
- [ ] Create engagement webhooks
- [ ] Update lead scores on engagement

**Deliverables**:
- Open/click tracking working
- Lead scores update automatically
- Engagement dashboard

---

## PHASE 5: SCALING & OPTIMIZATION (Sessions 15-16, Days 51-60)

### Session 15: Additional Data Sources (Days 51-55)
**Goal**: Add more signal sources

**Tasks**:
- [ ] Implement state licensing board scrapers (3 states)
- [ ] Add building permit monitors (2 cities)
- [ ] Integrate job board scraper (Indeed)
- [ ] Add BBB complaints monitor

**Deliverables**:
- 4 new data sources active
- 500+ signals/week total

---

### Session 16: Testing & Launch (Days 56-60)
**Goal**: Production readiness

**Tasks**:
- [ ] End-to-end testing
- [ ] Load testing (100 concurrent users)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation
- [ ] Monitoring setup

**Deliverables**:
- All tests passing
- <500ms API response time
- 99%+ uptime
- Complete documentation

---

## SESSION WORKFLOW

### Before Each Session
1. Review previous session deliverables
2. Check database health
3. Review error logs
4. Update plan if needed

### During Session
1. Work on tasks sequentially
2. Test each component individually
3. Commit code frequently
4. Document decisions

### After Session
1. Run verification tests
2. Update progress tracker
3. Note blockers for next session
4. Backup database

---

## DEPENDENCIES MAP

```
Session 1 (Infrastructure) → All other sessions
Session 2 (Reddit) → Session 3 (Classification)
Session 3 (Classification) → Session 4 (Alerts)
Session 5 (Calc Backend) → Session 6 (Calc Frontend)
Session 6 (Calc Frontend) → Session 7 (PDF)
Session 9 (VAPI) → Session 10 (Post-Call)
Session 12 (Triggers) → Session 13 (Email Gen)
Session 13 (Email Gen) → Session 14 (Tracking)
```

---

## CRITICAL PATH

**Must complete in order**:
1. Session 1 (Infrastructure)
2. Session 2 (Reddit)
3. Session 3 (Classification)
4. Session 5 (Calc Backend)
5. Session 9 (VAPI)

**Can parallelize**:
- Sessions 6-8 (Frontend work)
- Sessions 12-14 (Follow-up engine)

---

## SUCCESS METRICS

### After Phase 1 (Day 15)
- 200+ signals/week
- 20+ high-score signals
- Daily alerts working

### After Phase 2 (Day 30)
- 50+ calculator submissions
- 60%+ email capture rate
- PDFs generating

### After Phase 3 (Day 40)
- 25+ calls received
- 5+ hot leads
- Lead dashboard operational

### After Phase 4 (Day 50)
- Follow-up automation working
- 25%+ email open rate
- Engagement tracking active

### After Phase 5 (Day 60)
- 500+ signals/week
- 3+ demos booked
- System 90%+ automated

---

## ESTIMATED COSTS

**Monthly (at full scale)**:
- Infrastructure: $60
- APIs (OpenAI, VAPI, etc.): $150-250
- Monitoring: $30
- **Total**: $240-340/month

**One-time**:
- Domain: $15
- Initial setup: Your time (60-80 hours)

---

## NEXT STEPS

1. **Review this scheduler** - Approve or request changes
2. **Session 1 prep** - Get API keys, provision Supabase
3. **Start Session 1** - Let me know when ready to begin
4. **Iterate** - Adjust plan based on learnings

---

**Ready to start Session 1?**
