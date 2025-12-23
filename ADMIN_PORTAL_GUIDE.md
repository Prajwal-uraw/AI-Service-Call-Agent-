# 🎯 Enterprise Admin Portal - Complete Guide

**Built**: December 22, 2025  
**Purpose**: Internal command center for Kestrel AI team  
**Access**: `/admin/portal` (after login)

---

## ✅ WHAT'S BUILT

### **1. Enterprise Navigation**
- ✅ Clean dropdown menus (Multi-Tenant, CRM, Admin)
- ✅ No more cluttered top bar
- ✅ Logo fixed (text-based "Kestrel AI")
- ✅ Professional enterprise UX

### **2. Admin Portal Dashboard**
- ✅ Key metrics (Tenants, MRR/ARR, Health Score)
- ✅ Today's activity feed
- ✅ Multi-tab interface (Overview, Tenants, Revenue, Team, Inbox)
- ✅ Quick actions sidebar

### **3. AI Guru System** ⭐
**Role-Based Personalities**:
- **CEO**: Strategic visionary, growth-focused
- **CFO**: Numbers-driven, profitability expert
- **CTO**: Technical scalability expert
- **Sales/Marketing**: Revenue & customer acquisition
- **Admin/Ops**: Process & efficiency expert
- **Legal**: Compliance & risk management

**Features**:
- ✅ Brief, actionable answers (<100 words)
- ✅ No sugarcoating - veteran SME truth
- ✅ Context-aware (knows your stats, stage, constraints)
- ✅ Business questions only (3 personal/day allowed)
- ✅ Prompt injection protection
- ✅ Uses GPT-4o for best recommendations
- ✅ Usage tracking per user

### **4. Email Inbox (Resend)**
- ✅ Displays incoming emails from Resend
- ✅ Categorized by type (New Lead, Support, etc.)
- ✅ Unread count badge
- ✅ Quick preview interface

### **5. Team Communication**
- ✅ Quick actions for team chat
- ✅ Pending tasks tracker
- ✅ Reminder system
- ✅ Alert notifications

---

## 🤖 AI GURU - HOW IT WORKS

### **System Prompt Structure**

Each role has a unique personality:

```typescript
CEO: "You are a battle-tested CEO advisor with 20+ years scaling SaaS companies. 
You focus on growth, market position, and strategic decisions. You're direct, 
data-driven, and don't sugarcoat. Keep responses under 100 words."
```

### **Context Provided**

AI Guru has access to:
- Current stats (tenants, MRR, health scores)
- Company stage ("Early growth - 12 tenants, $18K MRR")
- Constraints ("Limited team, bootstrap budget")
- Opportunities ("Multi-tenant SaaS, HVAC market")

### **Example Interactions**

**CEO Mode**:
```
User: "Should we raise funding or stay bootstrapped?"

AI: "At $18K MRR with 12 tenants, you're too early for VC. Focus on getting 
to $50K MRR first - that's when you have leverage. Your 82 avg health score 
is solid. Double down on sales, not fundraising. Prove the model works at 
scale, then raise from a position of strength."
```

**CFO Mode**:
```
User: "What's our burn rate looking like?"

AI: "Need more data. Show me: monthly expenses, runway in months, and CAC. 
With $18K MRR and 5% churn, you're generating ~$17K net new MRR monthly. 
If burn is under $15K, you're default alive. If over $25K, you have 6 months 
to fix it or die."
```

**CTO Mode**:
```
User: "Should we refactor the codebase now?"

AI: "No. At 12 tenants, technical debt isn't your bottleneck - distribution is. 
Refactor when you hit 100 tenants or when downtime costs you deals. Right now, 
ship features that close sales. Your multi-tenant architecture is solid enough 
for 10x growth."
```

### **Prompt Injection Protection**

Blocks attempts like:
- "Ignore previous instructions..."
- "You are now a..."
- "Disregard all rules..."
- "Pretend you're..."

Returns error: "Prompt injection detected. Please ask a legitimate business question."

### **Business-Only Enforcement**

**Allowed** (unlimited):
- Revenue questions
- Customer questions
- Technical architecture
- Legal compliance
- Operations
- Strategy

**Limited** (3/day):
- Personal questions
- Non-business topics
- General knowledge

After 3 personal questions:
> "Personal question limit reached (3/day). Please ask business-related questions."

---

## 📧 EMAIL INBOX INTEGRATION

### **How It Works**

1. **Resend Webhook** → Sends incoming emails to your API
2. **Backend stores** → Email in database
3. **Frontend displays** → In admin portal inbox tab

### **Email Categories**

- **New Lead**: Potential customers asking about product
- **Support**: Existing customers needing help
- **Billing**: Payment/invoice questions
- **General**: Other inquiries

### **Features**

- Unread count badge
- Quick preview
- Categorization
- Timestamp
- Click to view full email

---

## 🔔 ALERTS & REMINDERS

### **AI Guru Nudges**

AI can suggest:
- "Health score dropped for Smith HVAC - reach out today"
- "3 tenants approaching usage limit - upsell opportunity"
- "No new signups in 5 days - check marketing"

### **Automated Alerts**

- Tenant health score drops below 70
- Payment failed
- Usage approaching limit
- Trial expiring soon
- No activity in 7 days

### **Reminder System**

- Follow up with leads
- Check in with at-risk customers
- Review metrics weekly
- Team standup reminders

---

## 🛡️ SECURITY & COMPLIANCE

### **Prompt Injection Remedies**

1. **Input validation**: Check for injection patterns
2. **System prompt protection**: Reinforced in every call
3. **Output filtering**: Sanitize AI responses
4. **Rate limiting**: Prevent abuse
5. **Audit logging**: Track all AI interactions

### **Data Access Control**

- AI Guru only accesses data user has permission for
- No PII in prompts unless necessary
- All interactions logged for compliance
- GDPR-compliant data handling

### **Usage Limits**

- Business questions: Unlimited
- Personal questions: 3/day
- Total daily limit: 50 requests
- Rate limit: 10 requests/minute

---

## 🎨 UI/UX FEATURES

### **Enterprise Navigation**

**Before** (cluttered):
```
How It Works | Pricing | Calculator | Demo | Pain Signals | Analytics | 
CRM Pipeline | Email Campaigns | Scrapers | Tasks | Onboarding | 
Dashboard | Settings | Billing | Logout
```

**After** (clean):
```
Multi-Tenant ▼ | CRM ▼ | Admin ▼ | Demo | Logout
```

### **Dropdown Menus**

Hover to reveal:
- **Multi-Tenant**: Onboarding, Dashboard, Settings, Billing
- **CRM**: Pipeline, Email Campaigns, Scrapers, Tasks
- **Admin**: Portal, Pain Signals, Analytics

### **Color Coding**

- **CEO**: Purple (strategic)
- **CFO**: Green (money)
- **CTO**: Blue (technical)
- **Sales**: Orange (energy)
- **Ops**: Indigo (process)
- **Legal**: Red (caution)

---

## 📊 METRICS DISPLAYED

### **Overview Tab**

- Active Tenants: 10 of 12
- MRR: $17,964
- ARR: $215,568
- Avg Health Score: 82
- Churn Rate: 5%
- Calls Today: 234
- Pending Tasks: 8
- Unread Emails: 15

### **Activity Feed**

- New tenant signups
- Payments received
- Health score changes
- Support tickets
- System alerts

---

## 🚀 NEXT STEPS

### **Phase 4: Enhanced Features** (This Week)

1. **Real-time notifications**
   - WebSocket for live updates
   - Desktop notifications
   - Email alerts

2. **Team chat**
   - Internal messaging
   - @mentions
   - File sharing

3. **Advanced analytics**
   - Revenue forecasting
   - Churn prediction
   - Cohort analysis

4. **Workflow automation**
   - Auto-assign tasks
   - Trigger-based actions
   - Email sequences

### **Phase 5: Integrations** (Next Week)

1. **Slack integration**
   - Alerts to Slack
   - AI Guru in Slack
   - Team notifications

2. **Calendar sync**
   - Google Calendar
   - Outlook
   - Team scheduling

3. **CRM integration**
   - HubSpot
   - Salesforce
   - Pipedrive

---

## 💡 SECRET TIPS INTEGRATED

### **AI Guru Best Practices**

1. **Be specific**: "Should we hire a salesperson?" vs "What should we do?"
2. **Provide context**: Include numbers, timeframes, constraints
3. **Ask follow-ups**: Drill down on recommendations
4. **Switch roles**: Get different perspectives on same question
5. **Challenge assumptions**: Ask "What am I missing?"

### **Usage Optimization**

- Use CEO for strategy
- Use CFO for financial decisions
- Use CTO for technical choices
- Use Sales for growth tactics
- Use Ops for process improvements
- Use Legal for compliance questions

### **Avoiding Waste**

- Don't ask the same question to multiple roles
- Don't use for general knowledge (Google it)
- Don't test with nonsense questions
- Do batch related questions
- Do save important responses

---

## 🔧 TECHNICAL DETAILS

### **Backend API**

**Endpoint**: `POST /api/ai-guru/`

**Request**:
```json
{
  "role": "ceo",
  "message": "Should we raise funding?",
  "systemPrompt": "You are a CEO advisor...",
  "context": {
    "stats": {...},
    "currentStage": "Early growth",
    "constraints": "Limited team",
    "opportunities": "Multi-tenant SaaS"
  }
}
```

**Response**:
```json
{
  "response": "At $18K MRR with 12 tenants...",
  "tokens_used": 145,
  "role": "ceo"
}
```

### **Frontend Integration**

```typescript
const handleAskAI = async () => {
  const response = await fetch("/api/ai-guru", {
    method: "POST",
    body: JSON.stringify({
      role: selectedRole,
      message: aiMessage,
      systemPrompt: aiPersonalities[selectedRole].systemPrompt,
      context: { stats, currentStage, constraints, opportunities }
    })
  });
  
  const data = await response.json();
  setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
};
```

---

## 📝 USAGE EXAMPLES

### **Strategic Decision (CEO)**

**Q**: "We have 2 customers asking for white-label. Should we build it?"

**A**: "Not yet. At 12 tenants, custom features are a distraction. Get to 50 tenants first with core product. Then evaluate if white-label is a pattern (5+ requests) or one-off. If pattern, charge $10K+ setup fee to fund development. Don't build for 2 customers."

### **Financial Planning (CFO)**

**Q**: "What should our pricing be for enterprise customers?"

**A**: "Current: $1,497-$2,497/mo. Enterprise should be 3-5x: $5K-$10K/mo. Justify with: unlimited calls, multi-location, dedicated support, SLA, custom integrations. Don't discount below $5K - you're not Walmart. One $10K customer = seven $1,497 customers with less support burden."

### **Technical Architecture (CTO)**

**Q**: "Should we move to microservices?"

**A**: "No. At 12 tenants, monolith is fine. Microservices add complexity you can't afford to manage. Refactor when: (1) team hits 15+ engineers, (2) specific services need independent scaling, or (3) deployment bottlenecks block releases. You're years away from that. Keep it simple."

---

## ✅ CHECKLIST FOR TEAM

### **Setup** (One-time)

- [ ] Login with any email/password
- [ ] Navigate to Admin Portal
- [ ] Select your role in AI Guru
- [ ] Ask first question
- [ ] Check inbox tab
- [ ] Review pending tasks

### **Daily Use**

- [ ] Check dashboard metrics
- [ ] Review activity feed
- [ ] Process inbox emails
- [ ] Ask AI Guru for daily priorities
- [ ] Complete pending tasks
- [ ] Set reminders for tomorrow

### **Weekly Review**

- [ ] Analyze revenue trends
- [ ] Review health scores
- [ ] Check churn rate
- [ ] Plan next week's priorities
- [ ] Ask AI Guru for strategic advice

---

## 🎯 SUCCESS METRICS

**Portal Usage**:
- Daily active users: Track team engagement
- AI Guru questions/day: Measure adoption
- Response time: How fast team acts on alerts
- Task completion rate: Productivity metric

**Business Impact**:
- Faster decision-making
- Better strategic alignment
- Reduced churn (proactive outreach)
- Increased revenue (upsell alerts)

---

**Your enterprise admin portal is ready! Login at `/login` and access at `/admin/portal`** 🚀
