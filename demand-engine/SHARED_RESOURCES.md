# Shared Resources Configuration
**HVAC Agent ↔ Demand Engine Resource Sharing**

---

## Overview

Both systems share OpenAI and Modal accounts but maintain complete data segregation.

---

## 1. OpenAI API (SHARED ✅)

### Configuration
- **API Key**: Same key used by both systems
- **Tracking**: Use `user` parameter to track usage separately

### HVAC Agent Usage
```python
# In hvac_agent
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    user="hvac-agent"  # Track separately
)
```

### Demand Engine Usage
```python
# In demand-engine
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[...],
    user="demand-engine"  # Track separately
)
```

### Cost Monitoring
- OpenAI dashboard shows usage by `user` tag
- Track costs separately per system
- Set budget alerts at $50/month per system

---

## 2. Modal (SHARED ✅)

### Configuration
- **Account**: Same Modal account
- **Apps**: Different app names for segregation

### HVAC Agent
```python
# hvac_agent/modal_app.py
app = modal.App("hvac-voice-agent")
```

### Demand Engine
```python
# demand-engine/config/modal_config.py
app = modal.App("demand-engine-scrapers")
```

### Secrets Management
```bash
# HVAC Agent secrets
modal secret create hvac-agent-secrets \
  OPENAI_API_KEY=sk-... \
  DATABASE_URL=... \
  ELEVENLABS_API_KEY=...

# Demand Engine secrets (separate)
modal secret create demand-engine-secrets \
  OPENAI_API_KEY=sk-...  # Same key, different secret
  SUPABASE_URL=... \
  SUPABASE_KEY=... \
  REDDIT_CLIENT_ID=... \
  REDDIT_CLIENT_SECRET=...
```

### Cost Tracking
- Modal dashboard shows usage per app
- HVAC Agent: Continuous (voice calls)
- Demand Engine: Batch jobs (scheduled)

---

## 3. Supabase (SHARED WITH SEGREGATION ⚠️)

### Option A: Separate Projects (RECOMMENDED)
```
Project 1: hvac-agent-db
  - Tables: calls, bookings, locations, etc.
  
Project 2: demand-engine-db
  - Tables: signals, leads, triggers, etc.
```

**Pros**: Complete isolation, separate billing  
**Cons**: Two projects to manage

### Option B: Same Project, Different Schemas
```sql
-- Create schemas
CREATE SCHEMA hvac_agent;
CREATE SCHEMA demand_engine;

-- HVAC Agent tables
CREATE TABLE hvac_agent.calls (...);
CREATE TABLE hvac_agent.bookings (...);

-- Demand Engine tables
CREATE TABLE demand_engine.signals (...);
CREATE TABLE demand_engine.leads (...);
```

**Pros**: Single project, shared billing  
**Cons**: Need schema-aware queries

### Option C: Same Project, Table Prefixes
```
hvac_calls
hvac_bookings
hvac_locations

demand_signals
demand_leads
demand_triggers
```

**Pros**: Simple, no schema changes  
**Cons**: Cluttered table list

### **RECOMMENDATION**: Use **Option A** (Separate Projects)

---

## 4. Environment Variables

### Shared .env Structure

```bash
# ===========================================
# SHARED RESOURCES
# ===========================================

# OpenAI (shared key, tracked separately)
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini

# ===========================================
# HVAC AGENT SPECIFIC
# ===========================================

# Database (SQLite local, PostgreSQL production)
DATABASE_URL=sqlite:///./hvac_agent.db

# Twilio
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx

# ElevenLabs
ELEVENLABS_API_KEY=sk_xxxx
ELEVENLABS_VOICE_ID=xxxx

# ===========================================
# DEMAND ENGINE SPECIFIC
# ===========================================

# Supabase (separate project recommended)
SUPABASE_URL=https://demand-engine.supabase.co
SUPABASE_KEY=your-anon-key

# Reddit API
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-client-secret

# SendGrid (for alerts)
SENDGRID_API_KEY=SG.xxxx
ALERT_EMAIL_TO=your-email@example.com
```

---

## 5. Modal Secret Configuration

### Create Shared OpenAI Secret (Optional)
```bash
# Create a shared secret for OpenAI only
modal secret create shared-openai \
  OPENAI_API_KEY=sk-your-key-here \
  OPENAI_MODEL=gpt-4o-mini
```

### Use in Both Apps
```python
# HVAC Agent
@app.function(
    secrets=[
        modal.Secret.from_name("shared-openai"),
        modal.Secret.from_name("hvac-agent-secrets"),
    ]
)

# Demand Engine
@app.function(
    secrets=[
        modal.Secret.from_name("shared-openai"),
        modal.Secret.from_name("demand-engine-secrets"),
    ]
)
```

---

## 6. Cost Allocation

### Monthly Budget Estimates

**HVAC Agent**:
- OpenAI (voice calls): $50-150/month
- Modal (continuous): $20-50/month
- Supabase: $0-25/month
- **Total**: $70-225/month

**Demand Engine**:
- OpenAI (classification): $5-30/month
- Modal (batch jobs): $0-10/month
- Supabase: $0-25/month
- **Total**: $5-65/month

**Combined**: $75-290/month

### Cost Tracking Script

```python
# scripts/track_costs.py
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Get usage by user tag
usage = client.usage.list(
    start_date="2025-12-01",
    end_date="2025-12-31"
)

hvac_cost = sum(u.cost for u in usage if u.user == "hvac-agent")
demand_cost = sum(u.cost for u in usage if u.user == "demand-engine")

print(f"HVAC Agent: ${hvac_cost:.2f}")
print(f"Demand Engine: ${demand_cost:.2f}")
print(f"Total: ${hvac_cost + demand_cost:.2f}")
```

---

## 7. Local Development Setup

### Directory Structure
```
AI-Service-Call-Agent-/
├── hvac_agent/          # HVAC voice agent
│   ├── .env             # HVAC-specific config
│   ├── modal_app.py
│   └── app/
├── demand-engine/       # Demand capture engine
│   ├── .env             # Demand-specific config
│   ├── config/
│   ├── scrapers/
│   └── classifiers/
└── .env.shared          # Shared credentials (optional)
```

### Shared .env Pattern (Optional)
```bash
# .env.shared (at root)
OPENAI_API_KEY=sk-your-key-here

# hvac_agent/.env
source ../.env.shared
DATABASE_URL=sqlite:///./hvac_agent.db
# ... HVAC-specific vars

# demand-engine/.env
source ../.env.shared
SUPABASE_URL=https://...
# ... Demand-specific vars
```

---

## 8. Deployment Checklist

### HVAC Agent Deployment
```bash
cd hvac_agent
modal deploy modal_app.py
# Deployed as: hvac-voice-agent
```

### Demand Engine Deployment
```bash
cd demand-engine
modal deploy scrapers/reddit.py
modal deploy classifiers/scorer.py
modal deploy alerts/daily_digest.py
# Deployed as: demand-engine-scrapers
```

### Verify Separation
```bash
modal app list
# Should show:
# - hvac-voice-agent
# - demand-engine-scrapers
```

---

## 9. Security Best Practices

### API Key Rotation
1. Generate new OpenAI key
2. Update both Modal secrets:
   ```bash
   modal secret update hvac-agent-secrets OPENAI_API_KEY=sk-new-key
   modal secret update demand-engine-secrets OPENAI_API_KEY=sk-new-key
   ```
3. Update local .env files
4. Test both systems
5. Revoke old key

### Access Control
- **Modal**: Both apps under same account (you)
- **Supabase**: Separate projects = separate access control
- **OpenAI**: Single key, tracked by `user` parameter

---

## 10. Monitoring & Alerts

### OpenAI Usage Alerts
```python
# Set budget alerts in OpenAI dashboard
# Alert at: $50, $100, $150 per month
```

### Modal Usage Alerts
```bash
# Check usage
modal app stats hvac-voice-agent
modal app stats demand-engine-scrapers
```

### Supabase Monitoring
- Dashboard → Usage
- Set alerts at 80% of free tier limits

---

## 11. Troubleshooting

### Issue: OpenAI costs too high
**Solution**: Check usage by user tag, identify which system is over-budget

### Issue: Modal apps conflicting
**Solution**: Ensure different app names, check `modal app list`

### Issue: Supabase connection errors
**Solution**: Verify correct SUPABASE_URL for each system

### Issue: Secrets not found
**Solution**: 
```bash
modal secret list
# Verify both secrets exist:
# - hvac-agent-secrets
# - demand-engine-secrets
```

---

## 12. Future Considerations

### When to Separate OpenAI Keys
- If one system consistently over-budget
- If need separate billing/invoicing
- If different rate limits needed

### When to Separate Modal Accounts
- If deploying for different clients
- If need separate billing
- If team grows and need access control

### When to Merge Supabase Projects
- If need cross-system queries (leads → calls)
- If want unified analytics
- If cost optimization needed

---

## Summary

✅ **Shared**: OpenAI API key, Modal account  
⚠️ **Segregated**: Supabase projects, Modal apps, secrets  
🔍 **Tracked**: OpenAI usage by `user` tag, Modal by app name  
💰 **Cost**: ~$75-290/month combined
