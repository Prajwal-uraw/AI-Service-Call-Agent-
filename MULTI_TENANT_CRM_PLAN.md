# 🏢 MULTI-TENANT CRM ARCHITECTURE PLAN
## AI Service Call Agent - Demand Engine Edition

**Created**: December 22, 2025  
**Status**: Planning Phase  
**Target**: Transform single-tenant CRM to multi-tenant SaaS platform

---

## 📊 EXECUTIVE SUMMARY

### Current State Analysis

**What You Have Built** ✅:
- Complete CRM system (leads, contacts, tasks, activities, pipeline)
- Pain signal aggregator (Reddit, job boards, licensing, BBB)
- Email marketing system with Resend integration
- Analytics dashboard with charts
- Scraper control panel
- Authentication system (demo mode)
- Export utilities

**Current Limitations** ❌:
- Single organization only
- No tenant isolation
- Hardcoded configurations
- Cannot serve multiple HVAC companies
- Manual setup required per client

### Vision: Multi-Tenant SaaS Platform

**Transform into**:
- SaaS platform serving 50-100+ HVAC/Plumbing companies
- Each company gets isolated CRM instance
- Self-service onboarding (5-10 minutes)
- White-label capability
- Subscription-based revenue model

**Revenue Potential**:
- $99-299/month per company
- 50 clients = $4,950-14,950 MRR
- 100 clients = $9,900-29,900 MRR

---

## 🏗️ ARCHITECTURE DESIGN

### Multi-Tenant Strategy: **Shared Database, Row-Level Isolation**

**Why This Approach**:
- ✅ Cost-effective (one database for all tenants)
- ✅ Easy to maintain and backup
- ✅ Scales to 100+ tenants easily
- ✅ Simpler deployment
- ❌ Requires careful query filtering (solved with middleware)

**Alternative Considered**: Separate database per tenant
- ✅ Complete isolation
- ❌ Expensive ($25/month × 100 = $2,500/month)
- ❌ Complex backups and migrations
- ❌ Harder to maintain

### Tenant Identification Strategy

**Primary Key**: Subdomain-based
```
acme-hvac.yourapp.com → Tenant: "acme-hvac"
elite-plumbing.yourapp.com → Tenant: "elite-plumbing"
```

**Fallback**: API key in header
```
Authorization: Bearer tenant_abc123_key456
```

**For CRM**: Email domain matching
```
user@acmehvac.com → Auto-assign to "acme-hvac" tenant
```

---

## 🗄️ DATABASE SCHEMA CHANGES

### New Core Table: `tenants`

```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identification
    slug VARCHAR(100) UNIQUE NOT NULL,  -- URL-safe: "acme-hvac"
    name VARCHAR(255) NOT NULL,         -- Display: "Acme HVAC Services"
    subdomain VARCHAR(100) UNIQUE,      -- "acme-hvac" for acme-hvac.yourapp.com
    
    -- Business Info
    company_name VARCHAR(255),
    industry VARCHAR(100) DEFAULT 'hvac',  -- hvac, plumbing, both
    website_url TEXT,
    logo_url TEXT,
    
    -- Contact
    owner_name VARCHAR(255),
    owner_email VARCHAR(255) NOT NULL,
    owner_phone VARCHAR(50),
    
    -- Subscription
    plan_tier VARCHAR(50) DEFAULT 'starter',  -- starter, professional, enterprise
    status VARCHAR(50) DEFAULT 'trial',       -- trial, active, suspended, cancelled
    trial_ends_at TIMESTAMP,
    subscription_started_at TIMESTAMP,
    
    -- Configuration
    settings JSONB DEFAULT '{}',  -- Custom settings per tenant
    features JSONB DEFAULT '{}',  -- Feature flags
    
    -- Limits & Usage
    max_leads INTEGER DEFAULT 1000,
    max_users INTEGER DEFAULT 5,
    max_scrapers INTEGER DEFAULT 3,
    current_lead_count INTEGER DEFAULT 0,
    current_user_count INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP  -- Soft delete
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_owner_email ON tenants(owner_email);
```

### Add `tenant_id` to ALL Existing Tables

**Tables to Modify**:
1. `leads` - Add tenant_id
2. `signals` - Add tenant_id
3. `contacts` - Add tenant_id
4. `activities` - Add tenant_id
5. `tasks` - Add tenant_id
6. `email_campaigns` - Add tenant_id
7. `campaign_recipients` - Add tenant_id
8. `email_templates` - Add tenant_id
9. `scraper_jobs` - Add tenant_id
10. `notes` - Add tenant_id

**Migration Pattern** (apply to each table):
```sql
-- Example for leads table
ALTER TABLE leads ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);

-- Migrate existing data to default tenant
UPDATE leads SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1);

-- Make it required after migration
ALTER TABLE leads ALTER COLUMN tenant_id SET NOT NULL;
```

### New Supporting Tables

**1. Tenant Users** (Multi-user per tenant)
```sql
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),  -- If using password auth
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',  -- owner, admin, member, viewer
    
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, email)
);
```

**2. Tenant API Keys** (For integrations)
```sql
CREATE TABLE tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20),  -- First 8 chars for display: "tk_abc123..."
    name VARCHAR(255),       -- "Production API", "Zapier Integration"
    
    permissions JSONB DEFAULT '{}',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

**3. Tenant Usage Tracking**
```sql
CREATE TABLE tenant_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    
    metric_name VARCHAR(100) NOT NULL,  -- 'leads_created', 'emails_sent', 'api_calls'
    metric_value INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(tenant_id, metric_name, period_start)
);
```

---

## 🔧 BACKEND IMPLEMENTATION

### 1. Tenant Context Middleware

**File**: `demand-engine/middleware/tenant_resolver.py`

```python
"""
Tenant Resolution Middleware
Identifies which tenant owns the current request
"""

from fastapi import Request, HTTPException
from contextvars import ContextVar
from typing import Optional
from app.models.db_models import Tenant
from app.database import get_db

# Thread-safe tenant context
_tenant_context: ContextVar[Optional[Tenant]] = ContextVar('tenant_context', default=None)

class TenantContext:
    """Access current tenant from anywhere in the app"""
    
    @staticmethod
    def set(tenant: Tenant):
        _tenant_context.set(tenant)
    
    @staticmethod
    def get() -> Optional[Tenant]:
        return _tenant_context.get()
    
    @staticmethod
    def get_id() -> Optional[str]:
        tenant = _tenant_context.get()
        return tenant.id if tenant else None
    
    @staticmethod
    def clear():
        _tenant_context.set(None)


async def tenant_resolver_middleware(request: Request, call_next):
    """
    Resolve tenant from:
    1. Subdomain (primary)
    2. API key header (fallback)
    3. User session (for dashboard)
    """
    
    tenant = None
    db = next(get_db())
    
    try:
        # Method 1: Subdomain
        host = request.headers.get("host", "")
        if "." in host:
            subdomain = host.split(".")[0]
            if subdomain not in ["www", "api", "app"]:
                tenant = db.query(Tenant).filter(
                    Tenant.subdomain == subdomain,
                    Tenant.status == "active"
                ).first()
        
        # Method 2: API Key
        if not tenant:
            api_key = request.headers.get("X-API-Key") or request.headers.get("Authorization", "").replace("Bearer ", "")
            if api_key:
                # Hash and lookup
                from hashlib import sha256
                key_hash = sha256(api_key.encode()).hexdigest()
                api_key_record = db.query(TenantAPIKey).filter(
                    TenantAPIKey.key_hash == key_hash,
                    TenantAPIKey.is_active == True
                ).first()
                
                if api_key_record:
                    tenant = api_key_record.tenant
                    # Update last used
                    api_key_record.last_used_at = datetime.now()
                    db.commit()
        
        # Method 3: Session (for logged-in users)
        if not tenant:
            # Get from JWT token or session
            # Implementation depends on your auth system
            pass
        
        # Public endpoints don't require tenant
        public_paths = ["/health", "/docs", "/openapi.json", "/api/auth/login"]
        if request.url.path in public_paths:
            tenant = None  # Allow without tenant
        elif not tenant:
            raise HTTPException(status_code=401, detail="Tenant not identified")
        
        # Set tenant context
        if tenant:
            TenantContext.set(tenant)
        
        response = await call_next(request)
        return response
    
    finally:
        TenantContext.clear()
        db.close()
```

### 2. Tenant-Aware Database Queries

**File**: `demand-engine/services/tenant_service.py`

```python
"""
Tenant-aware database service
Automatically filters all queries by tenant_id
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.middleware.tenant_resolver import TenantContext
from app.models.db_models import Lead, Contact, Task, Activity

class TenantService:
    """Base service with automatic tenant filtering"""
    
    def __init__(self, db: Session):
        self.db = db
        self.tenant_id = TenantContext.get_id()
        
        if not self.tenant_id:
            raise ValueError("No tenant context set!")
    
    def get_leads(self, filters: dict = None) -> List[Lead]:
        """Get leads for current tenant"""
        query = self.db.query(Lead).filter(Lead.tenant_id == self.tenant_id)
        
        if filters:
            if filters.get('tier'):
                query = query.filter(Lead.tier == filters['tier'])
            if filters.get('status'):
                query = query.filter(Lead.status == filters['status'])
        
        return query.all()
    
    def create_lead(self, lead_data: dict) -> Lead:
        """Create lead for current tenant"""
        lead = Lead(**lead_data, tenant_id=self.tenant_id)
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead
    
    # Similar methods for contacts, tasks, activities, etc.
```

### 3. Admin API for Tenant Management

**File**: `demand-engine/routers/admin_tenants.py`

```python
"""
Admin API for managing tenants
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.db_models import Tenant, TenantUser
import secrets
import string

router = APIRouter(prefix="/api/admin/tenants", tags=["Admin - Tenants"])

class TenantCreate(BaseModel):
    name: str
    slug: str
    owner_email: EmailStr
    owner_name: str
    company_name: str
    plan_tier: str = "starter"

class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    subdomain: str
    status: str
    plan_tier: str
    owner_email: str
    created_at: str

@router.post("/", response_model=TenantResponse)
async def create_tenant(tenant_data: TenantCreate, db: Session = Depends(get_db)):
    """
    Create a new tenant (HVAC company)
    """
    
    # Check if slug already exists
    existing = db.query(Tenant).filter(Tenant.slug == tenant_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    # Create tenant
    tenant = Tenant(
        name=tenant_data.name,
        slug=tenant_data.slug,
        subdomain=tenant_data.slug,  # Same as slug by default
        company_name=tenant_data.company_name,
        owner_email=tenant_data.owner_email,
        owner_name=tenant_data.owner_name,
        plan_tier=tenant_data.plan_tier,
        status="trial",
        trial_ends_at=datetime.now() + timedelta(days=14)
    )
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Create owner user
    owner = TenantUser(
        tenant_id=tenant.id,
        email=tenant_data.owner_email,
        name=tenant_data.owner_name,
        role="owner"
    )
    
    db.add(owner)
    db.commit()
    
    return tenant

@router.get("/", response_model=List[TenantResponse])
async def list_tenants(db: Session = Depends(get_db)):
    """List all tenants"""
    tenants = db.query(Tenant).filter(Tenant.deleted_at == None).all()
    return tenants

@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(tenant_id: str, db: Session = Depends(get_db)):
    """Get tenant details"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
```

---

## 🎨 FRONTEND IMPLEMENTATION

### Self-Service Onboarding UI

**New Pages Required**:

1. **`/onboarding`** - 5-step wizard
2. **`/dashboard`** - Tenant admin dashboard
3. **`/settings`** - Tenant settings
4. **`/billing`** - Subscription management

### Onboarding Wizard Flow

**Step 1: Company Information** (2 min)
```tsx
- Company Name
- Industry (HVAC / Plumbing / Both)
- Website URL
- Logo Upload
```

**Step 2: Owner Details** (1 min)
```tsx
- Your Name
- Email
- Phone
- Password
```

**Step 3: Choose Subdomain** (1 min)
```tsx
- yourcompany.yourapp.com
- Check availability
- Suggest alternatives
```

**Step 4: Select Plan** (2 min)
```tsx
- Starter ($99/mo) - 1000 leads, 3 users
- Professional ($199/mo) - 5000 leads, 10 users
- Enterprise ($299/mo) - Unlimited
- Start with 14-day free trial
```

**Step 5: Setup Complete** (1 min)
```tsx
- Generate API keys
- Show quick start guide
- Redirect to dashboard
```

**Total Time**: 7-10 minutes

---

## 📋 IMPLEMENTATION ROADMAP

### **Phase 1: Database Foundation** (Week 1 - 40 hours)

**Day 1-2: Schema Design & Migration**
- [ ] Create `tenants` table
- [ ] Create `tenant_users` table
- [ ] Create `tenant_api_keys` table
- [ ] Create `tenant_usage` table
- [ ] Write migration script
- [ ] Test on development database

**Day 3-4: Add tenant_id to Existing Tables**
- [ ] Alter all 10+ CRM tables
- [ ] Create indexes
- [ ] Migrate existing data to "default" tenant
- [ ] Verify data integrity

**Day 5: ORM Models**
- [ ] Update SQLAlchemy models
- [ ] Add relationships
- [ ] Test model creation
- [ ] Update Pydantic schemas

---

### **Phase 2: Backend Multi-Tenancy** (Week 2 - 40 hours)

**Day 1-2: Middleware & Context**
- [ ] Create `tenant_resolver.py`
- [ ] Implement TenantContext
- [ ] Add middleware to FastAPI app
- [ ] Test tenant resolution

**Day 3-4: Update All APIs**
- [ ] Update leads API
- [ ] Update contacts API
- [ ] Update tasks API
- [ ] Update activities API
- [ ] Update email campaigns API
- [ ] Update scrapers API
- [ ] Add tenant filtering to all queries

**Day 5: Admin API**
- [ ] Create tenant management endpoints
- [ ] Test tenant CRUD operations
- [ ] Add API key generation
- [ ] Test with multiple tenants

---

### **Phase 3: Frontend Onboarding** (Week 3 - 40 hours)

**Day 1-2: Onboarding Wizard**
- [ ] Create `/onboarding` page
- [ ] Build 5-step form
- [ ] Add subdomain availability check
- [ ] Integrate with backend API

**Day 3-4: Tenant Dashboard**
- [ ] Create tenant-specific dashboard
- [ ] Show usage metrics
- [ ] Display current plan
- [ ] Add quick actions

**Day 5: Settings & Billing**
- [ ] Build settings page
- [ ] Add plan upgrade/downgrade
- [ ] Integrate Stripe (optional)
- [ ] Test complete flow

---

### **Phase 4: Testing & Polish** (Week 4 - 40 hours)

**Day 1-2: Multi-Tenant Testing**
- [ ] Create 5 test tenants
- [ ] Verify complete data isolation
- [ ] Test subdomain routing
- [ ] Test API key authentication

**Day 3-4: Performance & Security**
- [ ] Add query optimization
- [ ] Implement rate limiting per tenant
- [ ] Add tenant usage tracking
- [ ] Security audit

**Day 5: Documentation & Launch**
- [ ] Write admin documentation
- [ ] Create user guide
- [ ] Deploy to production
- [ ] Onboard first real client

---

## 💰 PRICING STRATEGY

### Recommended Tiers

**Starter** - $99/month
- 1,000 leads
- 3 users
- 3 active scrapers
- Email support
- 14-day free trial

**Professional** - $199/month
- 5,000 leads
- 10 users
- Unlimited scrapers
- Priority support
- Custom branding

**Enterprise** - $299/month
- Unlimited leads
- Unlimited users
- Dedicated account manager
- White-label option
- SLA guarantee

### Revenue Projections

**Year 1 Target**: 50 clients
- 30 Starter ($99) = $2,970/mo
- 15 Professional ($199) = $2,985/mo
- 5 Enterprise ($299) = $1,495/mo
- **Total MRR**: $7,450
- **Annual**: $89,400

**Year 2 Target**: 100 clients
- 50 Starter = $4,950/mo
- 35 Professional = $6,965/mo
- 15 Enterprise = $4,485/mo
- **Total MRR**: $16,400
- **Annual**: $196,800

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- [ ] 100% data isolation (no cross-tenant data leaks)
- [ ] <100ms tenant resolution overhead
- [ ] Support 100+ concurrent tenants
- [ ] 99.9% uptime SLA

### Business Metrics
- [ ] <10 minutes onboarding time
- [ ] >80% trial-to-paid conversion
- [ ] <5% monthly churn
- [ ] >90% customer satisfaction

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Data Isolation Bugs
**Impact**: Critical - could leak data between tenants
**Mitigation**:
- Comprehensive testing with multiple tenants
- Automated tests for every API endpoint
- Code review for all tenant-related code
- Regular security audits

### Risk 2: Performance Degradation
**Impact**: Medium - slow queries with many tenants
**Mitigation**:
- Proper indexing on tenant_id
- Query optimization
- Database connection pooling
- Caching layer (Redis)

### Risk 3: Complex Migration
**Impact**: Medium - existing data migration could fail
**Mitigation**:
- Test migration on copy of production data
- Rollback plan
- Gradual migration (one table at a time)
- Backup before migration

---

## 🚀 NEXT STEPS

### This Week (Planning)
1. [ ] Review this document with team
2. [ ] Decide: Build in-house or outsource?
3. [ ] Set timeline and budget
4. [ ] Create development branch
5. [ ] Set up staging environment

### Week 1 (Start Implementation)
1. [ ] Backup production database
2. [ ] Create tenants table
3. [ ] Add tenant_id to one table (test)
4. [ ] Verify migration works
5. [ ] Proceed with full migration

---

## 📚 RESOURCES

### Documentation to Create
- [ ] Multi-tenant architecture guide
- [ ] API documentation for tenant endpoints
- [ ] Onboarding user guide
- [ ] Admin operations manual

### Tools Needed
- [ ] Stripe account (for billing)
- [ ] Subdomain DNS setup
- [ ] SSL certificates for subdomains
- [ ] Monitoring (Sentry for errors)

---

## 💡 EXPERT RECOMMENDATIONS

### DO Build Self-Service UI
**Why**: 
- Competitive advantage over technical competitors
- 10x faster onboarding
- Professional first impression
- Learn what customers need

### DO Start with Database
**Why**:
- Foundation for everything
- Hardest to change later
- Get it right once

### DO Test with Fake Tenants
**Why**:
- Catch isolation bugs early
- Verify performance
- Build confidence

### DON'T Skip Security Audit
**Why**:
- Data leaks are catastrophic
- Reputation damage
- Legal liability

### DON'T Over-Engineer v1
**Why**:
- Ship faster
- Learn from real usage
- Iterate based on feedback

---

**Total Effort**: 160 hours (4 weeks)  
**Total Cost**: $16,000 if outsourced, $0 if DIY  
**Break-Even**: 11 clients at $99/month  
**ROI**: Infinite if you build it yourself

**Ready to start? Begin with Phase 1 (Database Foundation)**

---

*Last Updated: December 22, 2025*  
*Status: Planning Complete - Ready for Implementation*
