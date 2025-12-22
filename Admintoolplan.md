# Demand Capture Engine - Complete Build Plan & WBS

## Project Overview

**Duration:** 21 days (3 weeks)
**Methodology:** Agile sprints (7-day cycles)
**Team Size:** 1 (you)
**Budget:** ~$500 in API/hosting costs

---

## WBS Level 1: Project Phases

```
1.0 PAIN SIGNAL AGGREGATOR (Days 1-7)
2.0 MICRO-VALUE GENERATOR (Days 5-10)
3.0 AUTHORITY THEFT ENGINE (Days 8-12)
4.0 AI AGENT QUALIFIER (Days 10-14)
5.0 SILENT FOLLOW-UP ENGINE (Days 13-17)
6.0 ORCHESTRATION & TESTING (Days 18-21)
```

---

## 1.0 PAIN SIGNAL AGGREGATOR   

For this section, i didnt like the sources to be special enough so i updated it.  im adding here, so anything between here and till ### WBS breakdown is new addition and follow that as source while still adding imp section from the wbs we had prior
# LEAD SOURCE STRATEGY: The Real Playbook

Let me assemble insights from SMEs across different domains:

---

## 🎯 SME Roundtable Insights

### **HVAC Industry Insider (20+ years)**
*"Most marketing companies scrape the obvious stuff. The real goldmine? State licensing boards and permit records. Every job over $500 requires a permit in most cities—that's your real-time activity feed. Also, if an HVAC company is hiring on Indeed, they're growing fast and drowning in calls."*

### **Growth Hacker / Data Scraper**
*"Everyone hits Reddit and Facebook. Boring. The play is scraping job boards for HVAC companies hiring CSRs or dispatchers—that tells you they have a customer service problem RIGHT NOW. Also, ServiceTitan user groups are pure gold—owners complaining about missed revenue in real-time."*

### **B2B Sales Expert**
*"Strongest buying signal? When they're already paying for a solution that's not working. Scrape HomeAdvisor/Angi pro forums—full of contractors complaining about lead quality and wasted ad spend. They already have budget allocated."*

### **Local Business Consultant**
*"Municipal data is public and refreshed constantly. Business license renewals, permit applications, health inspection records for commercial HVAC—all public. Plus, BBB complaints aren't just about the company; they show you WHICH companies are struggling with customer communication."*

### **Marketing Agency Owner (HVAC-focused)**
*"My secret? Monitor the 'HVAC Marketing' Facebook groups, not the contractor groups. Owners join these asking for help with SEO, PPC—they're in buying mode. Also, scrape Yelp business owner responses. Slow response time = they can't keep up."*

---

## 🔥 TIER 1: HIGHEST SIGNAL SOURCES (Build These First)

### 1. **State Contractor Licensing Databases** ⭐⭐⭐⭐⭐

**Why This Is Gold:**
- EVERY legitimate HVAC business is here
- Public data: license status, complaints, business info
- Shows who's active, who's in trouble (complaints), who's new

**Specific Sources:**
```yaml
California:
  - URL: https://www2.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx
  - Data: License number, business name, owner, address, complaints, bond status
  - Scraping: POST requests with license number ranges
  
Texas:
  - URL: https://www.tdlr.texas.gov/LicenseSearch/
  - Search by: City, ZIP, license type "Air Conditioning and Refrigeration Contractor"
  
Florida:
  - URL: https://www.myfloridalicense.com/LicenseSearch/
  - License type: "Air Conditioning Contractor" (CA, CB licenses)
  
New York:
  - URL: https://www.dos.ny.gov/licensing/licensesearch.html
  - Filter: "Home Improvement Contractors"

Illinois:
  - URL: https://www.idfpr.com/LicenseLookUp/
  - License type: "Roofing and HVAC"
```

**Scraping Strategy:**
```python
# High-level approach
for state in priority_states:
    for city in target_cities:
        # Search by location + license type
        businesses = scrape_license_board(state, city, "HVAC")
        
        for business in businesses:
            # Extract pain signals
            if business.complaints > 0:
                pain_score += 30  # Customer service issues
            
            if business.license_status == "probation":
                pain_score += 40  # Major problems
            
            if business.years_in_business < 3:
                pain_score += 20  # Startup growing pains
            
            # Store with location for competitor analysis
            store_prospect(business)
```

**Expected Volume:** 500-1,000 prospects per state

---

### 2. **Municipal Building Permit Records** ⭐⭐⭐⭐⭐

**Why This Works:**
- Real-time activity data (who's actually working)
- Shows volume (permits pulled per month)
- Geographic targeting precision
- Public API in many cities

**Specific Sources:**
```yaml
Denver, CO:
  - URL: https://www.denvergov.org/opendata/dataset/city-and-county-of-denver-building-permits
  - API: Yes (Open Data Portal)
  - Search: Contractor name, permit type "HVAC"
  
Austin, TX:
  - URL: https://abc.austintexas.gov/web/permit/public-search-other
  - Data: Contractor info, permit volume, project value
  
Phoenix, AZ:
  - URL: https://aca.phoenix.gov/aca/Default.aspx
  - Track: Mechanical permits = HVAC work
  
Miami, FL:
  - URL: https://www.miamidade.gov/permits/building-permits.asp
  - Search: Mechanical contractor licenses

Atlanta, GA:
  - URL: https://aca-prod.accela.com/ATLANTA/Default.aspx
```

**Pain Signal Logic:**
```python
# Analyze permit patterns
permits_last_month = get_permits(contractor, days=30)
permits_previous_month = get_permits(contractor, days=60, offset=30)

if permits_last_month > permits_previous_month * 1.5:
    # Growing fast = scaling pains
    pain_signals.append("rapid_growth")
    urgency_score += 25

if avg_permit_value > 5000:
    # Commercial work = higher ticket = good target
    budget_score += 20

if permits_per_month > 50:
    # High volume = definitely need call handling
    pain_score += 30
```

**Expected Volume:** 200-500 active contractors per major city

---

### 3. **ServiceTitan/Jobber User Communities** ⭐⭐⭐⭐⭐

**Why This Is Genius:**
- Self-selected: They already use tech
- Active complainers: Posting about problems
- Budget confirmed: Paying $200-500/mo for software
- Decision-makers: Owners/managers in these groups

**Specific Facebook Groups:**
```yaml
ServiceTitan Users:
  - "ServiceTitan User Community" (21K members)
  - URL: https://www.facebook.com/groups/servicetitanusers
  - Pain signals: "missed calls", "CSR overwhelmed", "booking issues"
  
Jobber Users:
  - "Jobber Community Group" (8.5K members)  
  - URL: https://www.facebook.com/groups/jobbercommunity
  - Common complaints: Scheduling conflicts, customer communication
  
Housecall Pro:
  - "Housecall Pro - Professional Community" (12K members)
  - URL: https://www.facebook.com/groups/housecallprocommunity
  
FieldEdge:
  - "FieldEdge Users" (3.2K members)
  - Smaller but highly engaged

All Trade Software:
  - "HVAC Software & Technology" (6K members)
  - People comparing platforms = buying mode
```

**Scraping Logic:**
```python
keywords_high_intent = [
    "missing calls", "can't keep up", "need a CSR",
    "customers not getting through", "voicemail full",
    "losing leads", "need answering service",
    "overwhelmed", "too many calls", "can't handle volume"
]

for group in servicetitan_groups:
    posts = scrape_group_posts(group, days=7)
    
    for post in posts:
        for keyword in keywords_high_intent:
            if keyword in post.text.lower():
                # Extract poster's company info
                company = extract_company_from_profile(post.author)
                
                signal = {
                    'source': 'facebook_group',
                    'group': group.name,
                    'pain_mentioned': keyword,
                    'urgency_score': 40,  # They're actively complaining
                    'budget_score': 30,   # Already paying for software
                    'authority_score': 35, # Group members are usually owners
                    'post_url': post.url,
                    'company': company
                }
```

**Expected Volume:** 50-100 high-quality signals per week

---

### 4. **HVAC Job Boards (Indeed/ZipRecruiter)** ⭐⭐⭐⭐

**Why This Works:**
- Hiring = growth = pain
- Job descriptions reveal problems
- Can identify decision-maker
- Shows budget allocation

**Search Strategy:**
```yaml
Indeed.com:
  Search queries:
    - "HVAC Customer Service Representative" + [city]
    - "HVAC Dispatcher" + [city]
    - "HVAC Office Manager" + [city]
    - "HVAC Call Center" + [city]
  
  Filters:
    - Date posted: Last 14 days (active hiring)
    - Job type: Full-time (serious need)
    - Salary: $35K+ (established company)

ZipRecruiter:
  - Same search terms
  - Track companies posting multiple times (desperate)

LinkedIn Jobs:
  - More professional companies
  - Can identify hiring manager directly
```

**Pain Signal Extraction:**
```python
job_posting_signals = {
    "high_call_volume": [
        "handle high volume of calls",
        "fast-paced call center",
        "50+ calls per day",
        "busy phones"
    ],
    "customer_service_problems": [
        "improve customer satisfaction",
        "reduce wait times",
        "enhance communication",
        "better response times"
    ],
    "scaling_issues": [
        "growing company",
        "expanding team",
        "rapid growth",
        "new territory"
    ],
    "current_pain": [
        "overwhelmed office",
        "need immediate help",
        "urgent hire",
        "ASAP start date"
    ]
}

for job in hvac_job_postings:
    pain_score = analyze_job_description(job.description, job_posting_signals)
    
    company_info = {
        'name': job.company_name,
        'location': job.location,
        'hiring_urgency': 'urgent' if 'asap' in job.description.lower() else 'normal',
        'estimated_call_volume': extract_call_volume(job.description),
        'hiring_manager': job.contact_name if available
    }
    
    # Cross-reference with other sources
    if company_exists_in_license_db(company_info.name):
        # High confidence match
        create_hot_lead(company_info, pain_score)
```

**Expected Volume:** 100-200 companies per month (major metro)

---

### 5. **HomeAdvisor/Angi Pro Forums** ⭐⭐⭐⭐

**Why This Is Underutilized:**
- Contractors already spending on leads
- Actively complaining about ROI
- Have budget, seeking better solution
- Pain is financial (wasted ad spend)

**Specific Sources:**
```yaml
HomeAdvisor Pro Community:
  - Closed Facebook group for pros
  - Need to join as "interested contractor"
  - 15K+ members
  - Hot topics: Lead quality, cost per lead, conversion issues

Angi (formerly Angie's List) Pro Center:
  - Community forum on their website
  - Public posts visible
  - Search: HVAC + complaints

Thumbtack Pro Forum:
  - Reddit-style forum
  - https://community.thumbtack.com/
  - Filter: HVAC category
  
Yelp for Business Owners:
  - https://www.yelp.com/advertise (has community section)
  - Owners discussing customer acquisition costs
```

**Scraping Strategy:**
```python
pain_keywords_lead_platforms = [
    "leads don't convert",
    "too expensive",
    "low quality leads",
    "not worth it",
    "canceling HomeAdvisor",
    "wasted money",
    "need better leads",
    "calls but no bookings"
]

# This is gold because they're literally saying:
# "I'm paying for leads but they don't convert"
# = Perfect target for your AI call agent

for post in homeadvisor_forum_posts:
    if any(keyword in post.text.lower() for keyword in pain_keywords_lead_platforms):
        
        prospect = {
            'pain_point': 'poor_lead_conversion',
            'budget_confirmed': True,  # Already spending on leads
            'urgency_score': 45,
            'budget_score': 40,  # Reallocating existing budget
            'current_spend': extract_spend_mention(post.text),
            'decision_timeline': 'immediate'  # Actively looking for alternative
        }
```

**Expected Volume:** 30-50 high-intent signals per week

---

## 🎯 TIER 2: CREATIVE SOURCES (High Quality, Lower Volume)

### 6. **HVAC Equipment Dealer Locators** ⭐⭐⭐⭐

**Why It Works:**
- Authorized dealers = established businesses
- Equipment brand = can estimate company size
- Geographic precision
- Often includes contact info

**Specific Sources:**
```yaml
Carrier:
  - URL: https://www.carrier.com/residential/en/us/dealer-locator/
  - Search by ZIP
  - Shows: Company name, address, phone, services
  
Trane:
  - URL: https://www.trane.com/residential/en/for-your-home/find-a-dealer/
  - Comfort Specialist™ designation = higher-end company
  
Lennox:
  - URL: https://www.lennox.com/find-a-dealer
  - Premier Dealer status = larger operation
  
Rheem:
  - URL: https://www.rheem.com/find-a-pro/
  
Daikin:
  - URL: https://www.daikincomfort.com/find-a-dealer
```

**Enrichment Logic:**
```python
# Scrape all dealer locators
for manufacturer in ['carrier', 'trane', 'lennox', 'rheem', 'daikin']:
    dealers = scrape_dealer_locator(manufacturer, city='Denver', radius=50)
    
    for dealer in dealers:
        # Cross-reference with other data
        enriched_data = {
            'company': dealer.name,
            'authorized_brands': get_all_brands(dealer.name),
            'estimated_size': len(dealer.authorized_brands) * 10,  # More brands = bigger
            'premium_indicator': 'Trane' in dealer.authorized_brands,  # Trane = higher-end
            'phone': dealer.phone,
            'website': dealer.website
        }
        
        # Now hit their website for more signals
        if website_available:
            check_for_chatbot(dealer.website)  # No chatbot = opportunity
            check_response_time(dealer.phone)  # Call and time answer
```

**Expected Volume:** 50-100 per major city

---

### 7. **Google My Business Advanced Signals** ⭐⭐⭐⭐

**Not Just Reviews—Deep Analysis:**

```python
gmb_advanced_signals = {
    'response_time_to_reviews': {
        # Scrape review timestamps and owner responses
        'signal': 'Slow response time = customer service issues',
        'threshold': 'If avg response time > 7 days',
        'pain_score': 25
    },
    
    'unanswered_questions': {
        # GMB Q&A section
        'signal': 'Unanswered questions in Q&A = missing leads',
        'threshold': 'If >5 unanswered questions',
        'pain_score': 30
    },
    
    'phone_clicks_vs_website_clicks': {
        # Can infer from review patterns mentioning "called but no answer"
        'signal': 'High call attempts but complaints about no answer',
        'extract_from': 'Review text analysis',
        'pain_score': 40
    },
    
    'hours_accuracy': {
        # Compare stated hours vs review mentions of "closed when supposed to be open"
        'signal': 'Operational inconsistency',
        'pain_score': 15
    },
    
    'photo_recency': {
        # Last photo upload date
        'signal': 'No recent photos = not maintaining online presence',
        'threshold': 'Last photo > 6 months ago',
        'pain_score': 10
    }
}

# Implementation
def analyze_gmb_listing(business_name, location):
    listing = get_gmb_data(business_name, location)
    
    # Check review response time
    reviews = listing.reviews[-20:]  # Last 20 reviews
    response_times = []
    
    for review in reviews:
        if review.owner_response:
            time_to_respond = (review.owner_response_date - review.review_date).days
            response_times.append(time_to_respond)
    
    if response_times:
        avg_response = sum(response_times) / len(response_times)
        if avg_response > 7:
            pain_signals.append("slow_review_response")
    
    # Check Q&A
    unanswered_questions = [q for q in listing.questions if not q.answer]
    if len(unanswered_questions) > 5:
        pain_signals.append("neglected_customer_questions")
    
    # Analyze review text for call-related complaints
    call_complaints = [r for r in reviews if any(
        phrase in r.text.lower() for phrase in 
        ['never answered', 'no answer', 'voicemail', 'can\'t reach']
    )]
    
    if len(call_complaints) > 3:
        pain_signals.append("call_handling_issues")
        urgency_score += 35
```

**Expected Volume:** 200-300 enriched profiles per city

---

### 8. **Trade Association Member Directories** ⭐⭐⭐

**Specific Associations:**
```yaml
ACCA (Air Conditioning Contractors of America):
  - URL: https://www.acca.org/find-a-contractor
  - Members: 4,000+ contractors
  - Filter: By state/city
  - Data: Company name, contact, specialties
  
PHCC (Plumbing-Heating-Cooling Contractors):
  - URL: https://www.phccweb.org/find_a_contractor/
  - National association
  
SMACNA (Sheet Metal and Air Conditioning):
  - URL: https://www.smacna.org/contractor-locator
  - Larger commercial contractors
  
Local/Regional:
  - "Colorado HVAC Association"
  - "Texas Air Conditioning Contractors Association"
  - Search: "[State] HVAC Association member directory"
```

**Why This Matters:**
- Association members = professional, established
- Membership fee = have budget
- Often list company size, years in business
- More likely to invest in technology

---

### 9. **Yelp Business Owner Response Analysis** ⭐⭐⭐

**Specific Approach:**
```python
# Not just scraping reviews, but analyzing OWNER BEHAVIOR

def analyze_owner_engagement(business_yelp_url):
    reviews = get_all_reviews(business_yelp_url)
    
    metrics = {
        'total_reviews': len(reviews),
        'owner_response_rate': 0,
        'avg_response_time_days': 0,
        'response_quality': 'defensive' | 'professional' | 'none'
    }
    
    responses = [r for r in reviews if r.owner_response]
    metrics['owner_response_rate'] = len(responses) / len(reviews)
    
    # Pain signals
    if metrics['owner_response_rate'] < 0.30:
        # They're not engaging with customers online
        pain_signals.append('poor_online_engagement')
        pain_score += 20
    
    # Analyze response TONE for defensiveness
    defensive_keywords = ['actually', 'unfortunately', 'however', 'never', 'false']
    professional_keywords = ['thank you', 'appreciate', 'sorry', 'we will']
    
    response_texts = [r.owner_response.text for r in responses]
    
    if avg_word_count(response_texts) < 20:
        # Short responses = not really engaging
        pain_signals.append('minimal_customer_engagement')
```

---

### 10. **City Business License Databases** ⭐⭐⭐

**Why This Works:**
- Catches NEW businesses (license applications)
- Shows renewals (can track growth)
- Often includes gross revenue estimates
- Public data

**Specific Sources:**
```yaml
Denver:
  - URL: https://www.denvergov.org/Government/Agencies-Departments-Offices/Business-Licensing
  - Searchable by business type: "HVAC"
  
Los Angeles:
  - URL: https://www.lacity.org/taxes-business/business-tax-registration
  - Can search "Contractor - HVAC"
  
Phoenix:
  - URL: https://www.phoenix.gov/finance/licensing
  
Seattle:
  - URL: https://www.seattle.gov/licenses/get-a-business-license
```

---

## 🚀 TIER 3: NINJA LEVEL SOURCES (Highest Signal, Hardest to Scale)

### 11. **Contractor Supply House Order Patterns** ⭐⭐⭐⭐⭐

**Why This Is Genius:**
- Order frequency = job volume
- Order size = company size
- Payment terms = financial health
- Real-time activity data

**How to Access (Partnerships Required):**
```yaml
Ferguson Enterprises:
  - Largest HVAC distributor in US
  - Has online ordering portal
  - Partnership opportunity: Share lead data for contractors making large orders
  
Johnstone Supply:
  - 400+ locations
  - Online portal shows contractor accounts
  
United Refrigeration:
  - Commercial HVAC focus
  - Larger accounts = bigger companies

Strategy:
  - Partner with local branch
  - "We help your customers handle more volume"
  - Access to: Customers ordering 20+ units/month (high volume)
```

---

### 12. **HVAC Podcast Guest Lists** ⭐⭐⭐

**Specific Podcasts:**
```yaml
The HVAC Business Growth Show:
  - Host: Bill Gerber
  - Guests: HVAC business owners
  - Episodes: 150+
  - Scrape: Guest names, companies, locations from show notes
  
HVAC Know It All:
  - Technical + business focus
  - Guests often mention their companies
  
HVAC School Podcast:
  - Bryan Orr
  - Very popular in industry
  
The Blue Collar Success Group:
  - Multiple trade contractors
  - HVAC segment
```

**Why This Works:**
- Guests = thought leaders = good prospects
- Often mention challenges in interview
- Usually provide contact info
- Self-selected as tech-forward (doing podcasts)

**Scraping Strategy:**
```python
podcast_guests = scrape_podcast_show_notes([
    'HVAC Business Growth Show',
    'HVAC Know It All',
    'HVAC School'
])

for guest in podcast_guests:
    # Extract company info from show notes
    company_info = {
        'owner': guest.name,
        'company': extract_company_name(guest.bio),
        'location': extract_location(guest.bio),
        'pain_points': extract_challenges_mentioned(episode.transcript)
    }
    
    # High value because:
    authority_score = 45  # They're thought leaders
    budget_score = 35  # Investing in brand (podcast appearances)
    tech_adoption = 40  # Comfortable with media/tech
```

---

### 13. **Trade Show Exhibitor & Attendee Lists** ⭐⭐⭐⭐

**Major Trade Shows:**
```yaml
AHR Expo:
  - Largest HVAC trade show in Americas
  - 60,000+ attendees
  - URL: https://www.ahrexpo.com/
  - Exhibitor list: Public (companies selling = have budget)
  - Attendee list: Sometimes available for purchase
  
Comfortech:
  - Regional shows (multiple cities)
  - Smaller but more targeted
  
HVAC Excellence:
  - Training-focused
  - Attendees = growth-minded
```

**Strategy:**
```python
# Scrape exhibitor lists
exhibitors = get_ahr_expo_exhibitors(year=2024)

for exhibitor in exhibitors:
    if exhibitor.category in ['Software', 'Services', 'Training']:
        # They're investing in solutions
        budget_score = 45
        
        # Visit booth, get badge scans
        # Or scrape their website for customer testimonials
        customers = scrape_customer_list(exhibitor.website)
```

---

### 14. **SBA Loan Recipients (Public Data)** ⭐⭐⭐⭐

**Why This Is Brilliant:**
- Companies that got loans are expanding
- Public data (Freedom of Information Act)
- Shows loan amount (budget indicator)
- Expansion = need for systems

**How to Access:**
```yaml
SBA.gov:
  - PPP loan data: Public
  - Search: "HVAC" in business description
  - Shows: Company name, address, loan amount, date
  
Strategy:
  - Recent loans (last 12 months) = active expansion
  - Loan amount >$100K = serious growth
  - Follow up 3-6 months after loan = perfect timing
```

---

### 15. **Domain Registration Monitoring** ⭐⭐⭐

**Why This Works:**
- New domain = new business or rebrand
- Both = growth phase = need systems
- Can catch them EARLY

**Implementation:**
```python
# Monitor new .com registrations
new_domains = monitor_new_registrations(
    keywords=['hvac', 'heating', 'cooling', 'air-conditioning'],
    lookback_days=7
)

for domain in new_domains:
    whois_data = get_whois_info(domain)
    
    if whois_data.registrant_location in target_cities:
        prospect = {
            'domain': domain,
            'registered_date': whois_data.created_date,
            'location': whois_data.registrant_location,
            'phase': 'startup',  # Perfect timing
            'urgency_score': 40,  # Need to get systems right from start
            'website': f'https://{domain}'
        }
        
        # Monitor website for launch
        # Reach out 30 days after domain registered
```

---

### 16. **YouTube Channel Analytics** ⭐⭐⭐

**Specific Approach:**
```yaml
Target Channels:
  - HVAC companies doing video marketing
  - Indicates: Tech-savvy, growth-focused
  
Search:
  - YouTube search: "[City] HVAC" or "HVAC [Company Name]"
  - Filter: Channels (not videos)
  - Sort: By upload date (recent = active)

Analyze:
  - Subscriber count (growth indicator)
  - Comment section (customer complaints?)
  - Video topics (showing services = marketing)
  
Scrape Comments:
  - "Can never get ahold of them"
  - "Great service but hard to schedule"
  - These are direct customer pain points
```

**Tool:**
```python
from googleapiclient.discovery import build

youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Search for HVAC companies in target city
search_response = youtube.search().list(
    q='Denver HVAC',
    type='channel',
    part='snippet',
    maxResults=50
).execute()

for channel in search_response['items']:
    # Get channel details
    channel_id = channel['id']['channelId']
    
    # Analyze comment sentiment
    comments = get_channel_comments(channel_id)
    
    pain_signals = analyze_comments_for_complaints(comments)
```

---

## 🏗️ ARCHITECTURE DECISION

### **Where to Host: Server (Cloud) vs Local**

```yaml
RECOMMENDATION: Server (Cloud)

Why:
  1. Scraping Requirements:
     - Facebook requires residential proxies (can't do from home IP)
     - Need to rotate IPs to avoid rate limits
     - 24/7 operation for scheduled scraping
     - Horizontal scaling for multiple cities
  
  2. Data Processing:
     - OpenAI API calls for classification
     - Database operations
     - PDF generation
     - Email sending
     - All better on cloud infrastructure
  
  3. Integration:
     - Webhooks from VAPI need public endpoint
     - Email tracking pixels need hosted URLs
     - Calculator needs to be publicly accessible

Recommended Stack:
  - Application: Railway.app or Render.com
    - Easy deployment
    - PostgreSQL included
    - Auto-scaling
    - $20-50/month
  
  - Scraping: Bright Data or ScraperAPI
    - Residential proxies
    - Handles JavaScript rendering
    - $100-200/month for serious volume
  
  - Database: Supabase
    - Postgres + Auth + Storage
    - $25/month
  
  - File Storage: Cloudflare R2
    - S3-compatible
    - Cheaper than S3
    - $5-10/month

Total Monthly: $150-285/month
```

---

### **Repository Structure**

```yaml
RECOMMENDATION: Separate Repo (Option 3)

Create: "demand-engine" or "prospect-pipeline" repo

Why Separate:
  1. Different Purpose:
     - AI Agent repo = Your product/service code
     - FrontOfAI repo = Marketing/sales site
     - Demand Engine = Lead generation infrastructure
  
  2. Different Deployment:
     - Demand Engine: Background workers, schedulers, scrapers
     - AI Agent: VAPI integration, call handling
     - FrontOfAI: Static site, calculator frontend
  
  3. Different Teams (future):
     - Data engineer maintains demand engine
     - Product team maintains AI agent
     - Marketing maintains FrontOfAI
  
  4. Security:
     - Demand engine has scraping code (potential legal gray areas)
     - Keep separate from customer-facing products
     - Different access controls

Repository Structure:

demand-engine/
├── scrapers/
│   ├── licensing_boards/
│   │   ├── california.py
│   │   ├── texas.py
│   │   └── florida.py
│   ├── permits/
│   ├── social/
│   │   ├── facebook_groups.py
│   │   ├── reddit.py
│   │   └── linkedin.py
│   └── job_boards/
├── classifiers/
│   ├── signal_scorer.py
│   └── entity_extractor.py
├── enrichment/
│   ├── competitor_analyzer.py
│   └── gmb_analyzer.py
├── workflows/
│   ├── n8n_exports/
│   └── cron_jobs/
├── database/
│   ├── schema.sql
│   └── migrations/
└── config/
    ├── sources.yaml
    └── target_cities.yaml

How They Connect:

demand-engine (this repo)
    ↓ (writes leads to shared DB)
Leads Database (Supabase)
    ↑ (reads leads from)
ai-agent repo (your VAPI integration)
    ↓ (enriches lead data)
Leads Database
    ↑ (displays leads)
frontofai repo (sales/marketing site)
    + (calculator writes to)
Leads Database
```

---

### **Integration Flow**

```
                    ┌─────────────────────┐
                    │  demand-engine      │
                    │  (This New Repo)    │
                    └──────────┬──────────┘
                               │
                               │ Scrapes & Scores
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Supabase DB       │
                    │   (Shared)          │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌───────────────┐ ┌──────────────┐ ┌──────────────┐
    │  ai-agent     │ │  frontofai   │ │  n8n         │
    │  (VAPI calls) │ │  (Calculator)│ │  (Workflows) │
    └───────────────┘ └──────────────┘ └──────────────┘
           │                   │               │
           └───────────────────┴───────────────┘
                               │
                               │ All enrich same leads
                               ▼
                    ┌─────────────────────┐
                    │   Unified CRM       │
                    │   (You manage)      │
                    └─────────────────────┘
```

---

## 📊 EXPECTED SIGNAL VOLUME (Per Week)

```yaml
Tier 1 Sources:
  State Licensing Boards: 50-100 (high quality, low frequency)
  Building Permits: 100-200 (real-time activity)
  ServiceTitan Groups: 50-100 (highest intent)
  Job Boards: 50-75 (growth signals)
  HomeAdvisor Forums: 30-50 (budget confirmed)

Tier 2 Sources:
  Dealer Locators: 25-50 (established businesses)
  GMB Analysis: 100-150 (enrichment data)
  Trade Associations: 20-30 (professional)
  Yelp Owner Analysis: 50-75 (engagement signals)
  Business Licenses: 30-50 (new businesses)

Tier 3 Sources:
  Podcast Guests: 5-10 (very high quality)
  Trade Shows: 20-30 (quarterly spikes)
  SBA Loans: 10-20 (expansion mode)
  New Domains: 5-15 (early stage)
  YouTube: 10-20 (tech-savvy)

Total Weekly Signals: 555-985
High-Score Signals (≥70): 100-150 per week
```

---

## 🎯 FINAL RECOMMENDATION, build the engines for all of the following but have option to select each before running and suggest to start in following order

**Start with Top 5:**
1. State licensing boards (TX, FL, CA, CO, AZ)
2. Building permits (5 major cities)
3. ServiceTitan/Jobber Facebook groups
4. HVAC job boards (Indeed, ZipRecruiter)
5. HomeAdvisor pro forums

**Add After Week 2:**
6. Equipment dealer locators
7. GMB advanced analysis
8. Yelp owner behavior
9. Business license databases

**Add After Month 1:**
10. Podcast guests
11. Trade show lists
12. SBA loan data
13. Domain monitoring
14. YouTube channels

This gives you **100-150 high-quality signals per week** from sources your competitors don't even know exist.

### WBS Breakdown               ( this was the orginal source doc that i updated above.)

```
1.0 Pain Signal Aggregator
  1.1 Data Source Integration
    1.1.1 Reddit API Setup
    1.1.2 Facebook Groups Scraper
    1.1.3 Google My Business Monitor
    1.1.4 BBB Complaints Scraper
  1.2 Signal Classification Engine
    1.2.1 NLP Model Setup
    1.2.2 Scoring Algorithm
    1.2.3 Deduplication Logic
  1.3 Data Pipeline
    1.3.1 Database Schema
    1.3.2 ETL Process
    1.3.3 Real-time Processing
  1.4 Alert System
    1.4.1 Scoring Threshold Logic
    1.4.2 Daily Digest Generator
    1.4.3 Notification Delivery
```

### 1.1.1 Reddit API Setup

**Objective:** Monitor target subreddits for pain signals

**Tech Stack:**
- PRAW (Python Reddit API Wrapper)
- PostgreSQL (Supabase)
- Cron (scheduling)

**Data Model:**
```sql
CREATE TABLE reddit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id VARCHAR(20) UNIQUE NOT NULL,
  subreddit VARCHAR(50) NOT NULL,
  author VARCHAR(50),
  title TEXT,
  body TEXT,
  created_utc TIMESTAMP,
  url TEXT,
  score INTEGER DEFAULT 0,
  
  -- Classification fields
  urgency_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  pain_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  -- Metadata
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Extracted entities
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50)
);

CREATE INDEX idx_total_score ON reddit_signals(total_score DESC);
CREATE INDEX idx_created_utc ON reddit_signals(created_utc DESC);
CREATE INDEX idx_processed ON reddit_signals(processed) WHERE NOT processed;
```

**Logic Flow:**

```python
# reddit_monitor.py

import praw
import os
from datetime import datetime, timedelta

# Configuration
SUBREDDITS = ['HVAC', 'homeowners', 'Plumbing', 'HomeImprovement']
LOOKBACK_HOURS = 24
MIN_SCORE_THRESHOLD = 70

# Reddit API Setup
reddit = praw.Reddit(
    client_id=os.getenv('REDDIT_CLIENT_ID'),
    client_secret=os.getenv('REDDIT_SECRET'),
    user_agent='PainSignalBot/1.0'
)

def fetch_recent_posts(subreddit_name, hours=24):
    """
    Fetch posts from last N hours
    
    Returns: List of submission objects
    """
    subreddit = reddit.subreddit(subreddit_name)
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    posts = []
    
    # Get from new, hot, and controversial
    for submission in subreddit.new(limit=100):
        post_time = datetime.fromtimestamp(submission.created_utc)
        
        if post_time > cutoff_time:
            posts.append({
                'id': submission.id,
                'subreddit': subreddit_name,
                'author': str(submission.author),
                'title': submission.title,
                'body': submission.selftext,
                'created_utc': post_time,
                'url': f"https://reddit.com{submission.permalink}",
                'score': submission.score,
                'num_comments': submission.num_comments
            })
    
    return posts

def check_duplicate(post_id, db_connection):
    """
    Check if post already processed
    
    Returns: Boolean
    """
    cursor = db_connection.cursor()
    cursor.execute(
        "SELECT 1 FROM reddit_signals WHERE post_id = %s",
        (post_id,)
    )
    return cursor.fetchone() is not None

def store_raw_post(post_data, db_connection):
    """
    Store post in database for processing
    
    Returns: UUID of inserted row
    """
    cursor = db_connection.cursor()
    
    cursor.execute("""
        INSERT INTO reddit_signals 
        (post_id, subreddit, author, title, body, created_utc, url, score)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        post_data['id'],
        post_data['subreddit'],
        post_data['author'],
        post_data['title'],
        post_data['body'],
        post_data['created_utc'],
        post_data['url'],
        post_data['score']
    ))
    
    db_connection.commit()
    return cursor.fetchone()[0]

# Main execution
def main():
    db = connect_to_database()
    
    for subreddit in SUBREDDITS:
        posts = fetch_recent_posts(subreddit, LOOKBACK_HOURS)
        
        for post in posts:
            if not check_duplicate(post['id'], db):
                store_raw_post(post, db)
                print(f"Stored new post: {post['id']}")
    
    db.close()
```

**Acceptance Criteria:**
- [ ] Successfully authenticates with Reddit API
- [ ] Fetches posts from last 24 hours across all target subreddits
- [ ] Stores only new posts (no duplicates)
- [ ] Runs on cron schedule (every 6 hours)
- [ ] Logs errors to monitoring system

---

### 1.1.2 Facebook Groups Scraper

**Objective:** Monitor Facebook groups for pain signals

**Tech Stack:**
- Playwright (headless browser)
- Supabase (storage)
- Rotating proxies (to avoid blocks)

**Data Model:**
```sql
CREATE TABLE facebook_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id VARCHAR(50) UNIQUE NOT NULL,
  group_id VARCHAR(50),
  group_name VARCHAR(200),
  author_name VARCHAR(100),
  post_text TEXT,
  post_time TIMESTAMP,
  post_url TEXT,
  
  -- Engagement metrics
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  -- Classification
  urgency_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  pain_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Logic Flow:**

```python
# facebook_scraper.py

from playwright.sync_api import sync_playwright
import re
from datetime import datetime

# Target groups (you'll need to manually join these)
TARGET_GROUPS = [
    {
        'url': 'https://www.facebook.com/groups/hvacpros',
        'name': 'HVAC Professionals',
        'id': 'hvacpros'
    },
    {
        'url': 'https://www.facebook.com/groups/hvacbusiness',
        'name': 'HVAC Business Owners',
        'id': 'hvacbusiness'
    }
]

def scrape_group_posts(page, group_config, lookback_hours=24):
    """
    Scrape posts from a Facebook group
    
    Args:
        page: Playwright page object (logged in)
        group_config: Dict with group URL, name, ID
        lookback_hours: How far back to scrape
    
    Returns: List of post objects
    """
    
    # Navigate to group
    page.goto(group_config['url'])
    page.wait_for_timeout(3000)  # Wait for load
    
    # Scroll to load more posts
    for _ in range(5):  # Scroll 5 times
        page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        page.wait_for_timeout(2000)
    
    # Extract posts
    posts = []
    
    # Facebook's DOM structure (as of 2024 - may need updates)
    post_elements = page.query_selector_all('[data-pagelet^="FeedUnit"]')
    
    for element in post_elements:
        try:
            # Extract text content
            text_element = element.query_selector('[data-ad-comet-preview="message"]')
            if not text_element:
                continue
            
            post_text = text_element.inner_text()
            
            # Extract author
            author_element = element.query_selector('a[role="link"] strong')
            author_name = author_element.inner_text() if author_element else "Unknown"
            
            # Extract timestamp
            time_element = element.query_selector('a[href*="posts"] span')
            post_time_str = time_element.get_attribute('aria-label') if time_element else None
            
            # Extract post URL
            url_element = element.query_selector('a[href*="/posts/"]')
            post_url = url_element.get_attribute('href') if url_element else None
            
            # Create post ID from URL
            post_id = None
            if post_url:
                match = re.search(r'/posts/(\d+)', post_url)
                if match:
                    post_id = match.group(1)
            
            if not post_id:
                continue  # Skip if we can't get ID
            
            # Parse engagement metrics
            reactions = 0
            comments = 0
            shares = 0
            
            # Try to extract metrics (structure varies)
            metrics_text = element.inner_text()
            
            reaction_match = re.search(r'(\d+K?)\s+(?:reactions?|likes?)', metrics_text, re.I)
            if reaction_match:
                reactions = parse_metric(reaction_match.group(1))
            
            comment_match = re.search(r'(\d+K?)\s+comments?', metrics_text, re.I)
            if comment_match:
                comments = parse_metric(comment_match.group(1))
            
            share_match = re.search(r'(\d+K?)\s+shares?', metrics_text, re.I)
            if share_match:
                shares = parse_metric(share_match.group(1))
            
            posts.append({
                'post_id': post_id,
                'group_id': group_config['id'],
                'group_name': group_config['name'],
                'author_name': author_name,
                'post_text': post_text,
                'post_time': parse_facebook_time(post_time_str),
                'post_url': f"https://facebook.com{post_url}" if post_url else None,
                'reactions': reactions,
                'comments': comments,
                'shares': shares
            })
            
        except Exception as e:
            print(f"Error parsing post: {e}")
            continue
    
    return posts

def parse_metric(value_str):
    """Convert '1.2K' to 1200"""
    if 'K' in value_str.upper():
        return int(float(value_str.replace('K', '').replace('k', '')) * 1000)
    return int(value_str)

def parse_facebook_time(time_str):
    """
    Parse Facebook relative times to datetime
    
    Examples: "2h", "3d", "1w", "Just now"
    """
    if not time_str:
        return datetime.utcnow()
    
    now = datetime.utcnow()
    
    if 'just now' in time_str.lower():
        return now
    
    # Extract number and unit
    match = re.search(r'(\d+)\s*(h|hr|hour|d|day|w|week|m|min|minute)', time_str.lower())
    
    if not match:
        return now
    
    value = int(match.group(1))
    unit = match.group(2)
    
    if unit in ['h', 'hr', 'hour']:
        return now - timedelta(hours=value)
    elif unit in ['d', 'day']:
        return now - timedelta(days=value)
    elif unit in ['w', 'week']:
        return now - timedelta(weeks=value)
    elif unit in ['m', 'min', 'minute']:
        return now - timedelta(minutes=value)
    
    return now

def login_to_facebook(page, email, password):
    """
    Login to Facebook
    
    Returns: Boolean success
    """
    page.goto('https://facebook.com')
    page.wait_for_timeout(2000)
    
    # Fill login form
    page.fill('input[name="email"]', email)
    page.fill('input[name="pass"]', password)
    page.click('button[name="login"]')
    
    page.wait_for_timeout(5000)
    
    # Check if login successful
    if 'checkpoint' in page.url or 'login' in page.url:
        return False
    
    return True

# Main execution
def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set True for production
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        # Login
        if not login_to_facebook(page, os.getenv('FB_EMAIL'), os.getenv('FB_PASSWORD')):
            print("Login failed!")
            return
        
        # Scrape each group
        db = connect_to_database()
        
        for group in TARGET_GROUPS:
            posts = scrape_group_posts(page, group)
            
            for post in posts:
                # Check for duplicates
                if not check_duplicate_fb(post['post_id'], db):
                    store_facebook_post(post, db)
        
        db.close()
        browser.close()
```

**Acceptance Criteria:**
- [ ] Successfully logs into Facebook
- [ ] Scrapes posts from all target groups
- [ ] Extracts post text, author, timestamp, engagement metrics
- [ ] Handles Facebook's dynamic DOM structure
- [ ] Stores only new posts (deduplication)
- [ ] Runs on schedule without getting blocked

---

### 1.2.1 NLP Signal Classification Engine

**Objective:** Score posts based on urgency, budget, authority, and pain signals

**Tech Stack:**
- OpenAI GPT-4-mini (cost-effective)
- Custom scoring algorithm
- Batch processing

**Scoring Algorithm Logic:**

```python
# signal_classifier.py

import openai
import json
from typing import Dict, List

# Scoring weights
WEIGHTS = {
    'urgency': 30,    # 30% of total score
    'budget': 25,     # 25% of total score
    'authority': 20,  # 20% of total score
    'pain': 25        # 25% of total score
}

# Signal keywords (for quick pre-filtering)
SIGNAL_KEYWORDS = {
    'urgency': [
        'urgent', 'emergency', 'asap', 'immediately', 'right now',
        'broke', 'broken', 'not working', 'failed', 'stopped',
        'today', 'tonight', 'this weekend', 'need now'
    ],
    'budget': [
        'quote', 'estimate', 'how much', 'cost', 'price', 'paid',
        'budget', 'afford', 'willing to spend', 'looking to buy',
        'ready to purchase', 'need pricing'
    ],
    'authority': [
        'owner', 'manager', 'director', 'VP', 'president', 'CEO',
        'my company', 'our business', 'we need', 'I need to',
        'my decision', 'I approve', 'my budget'
    ],
    'pain': [
        'frustrated', 'angry', 'disappointed', 'terrible', 'horrible',
        'never', 'always', 'every time', 'constantly', 'can\'t',
        'won\'t', 'doesn\'t', 'missed call', 'no answer', 'voicemail',
        'losing', 'lost', 'waste', 'problem', 'issue'
    ]
}

def quick_keyword_score(text: str, category: str) -> int:
    """
    Fast keyword-based pre-scoring (0-10)
    
    Returns: Score 0-10 for the category
    """
    text_lower = text.lower()
    keywords = SIGNAL_KEYWORDS.get(category, [])
    
    matches = sum(1 for keyword in keywords if keyword in text_lower)
    
    # Normalize to 0-10 scale
    if matches == 0:
        return 0
    elif matches <= 2:
        return 4
    elif matches <= 4:
        return 7
    else:
        return 10

def should_use_ai_scoring(quick_scores: Dict[str, int]) -> bool:
    """
    Determine if post needs AI analysis
    
    Logic:
    - If total quick score < 15, skip (too low quality)
    - If total quick score > 25, definitely analyze
    - If 15-25, analyze if any category > 5
    """
    total = sum(quick_scores.values())
    
    if total < 15:
        return False
    
    if total > 25:
        return True
    
    # Check if any individual category is promising
    return any(score > 5 for score in quick_scores.values())

def ai_deep_score(text: str, context: Dict) -> Dict[str, int]:
    """
    Use GPT-4-mini for detailed scoring
    
    Args:
        text: Post title + body combined
        context: Additional context (subreddit, author, etc.)
    
    Returns: Dict with scores for each category (0-10)
    """
    
    prompt = f"""Analyze this post for sales signals. Score each category 0-10.

POST TEXT:
{text}

CONTEXT:
- Source: {context.get('source', 'Unknown')}
- Author: {context.get('author', 'Unknown')}

SCORING CRITERIA:

URGENCY (0-10):
- 10: Immediate emergency, time-sensitive
- 7-9: Needs solution this week
- 4-6: General need, no rush
- 0-3: Just browsing/researching

BUDGET (0-10):
- 10: Budget explicitly mentioned, ready to pay
- 7-9: Asking for quotes/pricing
- 4-6: Discussing cost considerations
- 0-3: No budget signals

AUTHORITY (0-10):
- 10: Clear decision-maker (owner, manager)
- 7-9: Likely decision-maker
- 4-6: Influencer/recommender
- 0-3: Individual consumer/researcher

PAIN (0-10):
- 10: Severe, quantifiable problem costing money now
- 7-9: Significant frustration with current state
- 4-6: Minor inconvenience
- 0-3: Theoretical/future concern

RETURN ONLY JSON:
{{
  "urgency": <score>,
  "budget": <score>,
  "authority": <score>,
  "pain": <score>,
  "reasoning": "<one sentence explanation>"
}}"""

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a sales signal analyst. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=150
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        return {
            'urgency': min(10, max(0, result.get('urgency', 0))),
            'budget': min(10, max(0, result.get('budget', 0))),
            'authority': min(10, max(0, result.get('authority', 0))),
            'pain': min(10, max(0, result.get('pain', 0))),
            'reasoning': result.get('reasoning', '')
        }
    except json.JSONDecodeError:
        # Fallback to keyword scores if AI fails
        return {
            'urgency': quick_keyword_score(text, 'urgency'),
            'budget': quick_keyword_score(text, 'budget'),
            'authority': quick_keyword_score(text, 'authority'),
            'pain': quick_keyword_score(text, 'pain'),
            'reasoning': 'AI parsing failed, used keyword matching'
        }

def calculate_total_score(category_scores: Dict[str, int]) -> int:
    """
    Calculate weighted total score (0-100)
    
    Formula: Sum(category_score * weight) / 10
    """
    total = 0
    
    for category, score in category_scores.items():
        if category in WEIGHTS:
            total += (score * WEIGHTS[category]) / 10
    
    return int(total)

def classify_post(post_id: str, text: str, context: Dict, db_connection):
    """
    Full classification pipeline
    
    Process:
    1. Quick keyword scan
    2. Decide if AI analysis needed
    3. Get AI scores if warranted
    4. Calculate total score
    5. Update database
    """
    
    # Step 1: Quick keyword scan
    quick_scores = {
        'urgency': quick_keyword_score(text, 'urgency'),
        'budget': quick_keyword_score(text, 'budget'),
        'authority': quick_keyword_score(text, 'authority'),
        'pain': quick_keyword_score(text, 'pain')
    }
    
    # Step 2: Decide if AI analysis needed
    if should_use_ai_scoring(quick_scores):
        # Step 3: Get AI scores
        ai_scores = ai_deep_score(text, context)
        final_scores = ai_scores
    else:
        # Use quick scores
        final_scores = quick_scores
        final_scores['reasoning'] = 'Keyword-based scoring only'
    
    # Step 4: Calculate total
    total_score = calculate_total_score(final_scores)
    
    # Step 5: Update database
    cursor = db_connection.cursor()
    
    cursor.execute("""
        UPDATE reddit_signals
        SET 
            urgency_score = %s,
            budget_score = %s,
            authority_score = %s,
            pain_score = %s,
            total_score = %s,
            processed = TRUE
        WHERE post_id = %s
    """, (
        final_scores['urgency'],
        final_scores['budget'],
        final_scores['authority'],
        final_scores['pain'],
        total_score,
        post_id
    ))
    
    db_connection.commit()
    
    return {
        'post_id': post_id,
        'total_score': total_score,
        'category_scores': final_scores,
        'method': 'AI' if should_use_ai_scoring(quick_scores) else 'Keywords'
    }

# Batch processing
def process_unclassified_posts(db_connection, batch_size=50):
    """
    Process all unclassified posts in batches
    
    Returns: Number of posts processed
    """
    cursor = db_connection.cursor()
    
    # Get unprocessed posts
    cursor.execute("""
        SELECT id, post_id, title, body, subreddit, author
        FROM reddit_signals
        WHERE NOT processed
        ORDER BY created_utc DESC
        LIMIT %s
    """, (batch_size,))
    
    posts = cursor.fetchall()
    processed_count = 0
    
    for post in posts:
        post_id = post[1]
        text = f"{post[2]}\n\n{post[3]}"  # title + body
        context = {
            'source': post[4],  # subreddit
            'author': post[5]
        }
        
        try:
            classify_post(post_id, text, context, db_connection)
            processed_count += 1
        except Exception as e:
            print(f"Error classifying {post_id}: {e}")
    
    return processed_count
```

**Decision Tree for Classification:**

```
START: New post arrives
  │
  ├─> Quick keyword scan (all 4 categories)
  │
  ├─> Calculate quick total
  │   │
  │   ├─> If total < 15: SKIP (mark processed, score = 0)
  │   │
  │   ├─> If total 15-25:
  │   │     │
  │   │     ├─> Check if any category > 5
  │   │     │   ├─> YES: Send to AI
  │   │     │   └─> NO: Use keyword scores only
  │   │
  │   └─> If total > 25: Send to AI
  │
  ├─> AI Scoring (if triggered)
  │     │
  │     ├─> Parse JSON response
  │     ├─> Validate scores (0-10 range)
  │     └─> Use as final scores
  │
  ├─> Calculate weighted total (0-100)
  │
  └─> Store in database
      │
      ├─> If total >= 70: Set alert flag
      └─> Mark as processed
```

**Acceptance Criteria:**
- [ ] Processes 100+ posts per batch run
- [ ] AI costs < $0.50 per 100 posts
- [ ] 90%+ of scores match manual review
- [ ] Completes batch in < 5 minutes
- [ ] Handles API failures gracefully

---

### 1.3 Data Pipeline & ETL

**Objective:** Unified pipeline for all data sources

**Pipeline Architecture:**

```
┌─────────────────┐
│  Data Sources   │
│  (Reddit, FB,   │
│   GMB, BBB)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Raw Ingestion  │
│  (Store as-is)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deduplication   │
│  (Check hash)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Classification  │
│  (Score 0-100)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Entity Extract │
│  (Location, Co) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Alert Logic    │
│  (If score>70)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Notification  │
│  (Email/Slack)  │
└─────────────────┘
```

**ETL Process Logic:**

```python
# etl_pipeline.py

from datetime import datetime, timedelta
import hashlib

def generate_content_hash(text: str) -> str:
    """
    Create hash of post content for deduplication
    
    Handles:
    - Same post across different platforms
    - Reposts/crossposts
    """
    # Normalize text
    normalized = text.lower().strip()
    normalized = re.sub(r'\s+', ' ', normalized)  # Collapse whitespace
    normalized = re.sub(r'[^\w\s]', '', normalized)  # Remove punctuation
    
    return hashlib.md5(normalized.encode()).hexdigest()

def is_duplicate_content(content_hash: str, db_connection, lookback_days=7) -> bool:
    """
    Check if similar content seen recently
    
    Args:
        content_hash: MD5 hash of normalized content
        lookback_days: How far back to check
    
    Returns: True if duplicate found
    """
    cursor = db_connection.cursor()
    cutoff = datetime.utcnow() - timedelta(days=lookback_days)
    
    # Check all signal tables
    tables = ['reddit_signals', 'facebook_signals', 'gmb_signals', 'bbb_signals']
    
    for table in tables:
        cursor.execute(f"""
            SELECT 1 FROM {table}
            WHERE content_hash = %s
            AND created_at > %s
            LIMIT 1
        """, (content_hash, cutoff))
        
        if cursor.fetchone():
            return True
    
    return False

def extract_entities(text: str) -> Dict:
    """
    Extract structured data from unstructured text
    
    Extracts:
    - Location (city, state, zip)
    - Company names mentioned
    - Problem type
    - Contact info (if present)
    """
    
    entities = {
        'location': None,
        'company_mentioned': None,
        'problem_type': None,
        'phone': None,
        'email': None
    }
    
    # Location extraction (US-focused)
    # Pattern: City, ST or City, State or ZIP
    location_pattern = r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z]{2})\b|\b\d{5}\b'
    location_match = re.search(location_pattern, text)
    
    if location_match:
        if location_match.group(1):  # City, ST format
            entities['location'] = f"{location_match.group(1)}, {location_match.group(2)}"
        else:  # ZIP code
            entities['location'] = location_match.group(0)
    
    # Company name extraction
    # Look for patterns like "ABC Plumbing", "XYZ HVAC", etc.
    company_pattern = r'\b([A-Z][a-zA-Z&\s]+(?:HVAC|Plumbing|Heating|Cooling|Services?))\b'
    company_match = re.search(company_pattern, text)
    
    if company_match:
        entities['company_mentioned'] = company_match.group(1).strip()
    
    # Problem type classification
    problem_keywords = {
        'no_answer': ['no answer', 'never picks up', 'voicemail', 'can\'t reach'],
        'slow_response': ['slow', 'takes forever', 'waiting', 'days to respond'],
        'poor_quality': ['terrible', 'bad work', 'incompetent', 'unprofessional'],
        'pricing': ['expensive', 'overcharged', 'price', 'quote'],
        'no_show': ['didn\'t show', 'no show', 'cancelled', 'stood up']
    }
    
    for problem_type, keywords in problem_keywords.items():
        if any(keyword in text.lower() for keyword in keywords):
            entities['problem_type'] = problem_type
            break
    
    # Phone extraction
    phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    phone_match = re.search(phone_pattern, text)
    if phone_match:
        entities['phone'] = phone_match.group(0)
    
    # Email extraction
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text)
    if email_match:
        entities['email'] = email_match.group(0)
    
    return entities

def run_etl_pipeline(db_connection):
    """
    Main ETL process
    
    Steps:
    1. Get all unprocessed raw signals
    2. Deduplicate
    3. Classify
    4. Extract entities
    5. Check alert threshold
    6. Send notifications if needed
    """
    
    cursor = db_connection.cursor()
    
    # Step 1: Get unprocessed signals from all sources
    cursor.execute("""
        SELECT 'reddit' as source, id, post_id as signal_id, 
               title || ' ' || body as content, url
        FROM reddit_signals
        WHERE NOT processed
        
        UNION ALL
        
        SELECT 'facebook' as source, id, post_id as signal_id,
               post_text as content, post_url as url
        FROM facebook_signals
        WHERE NOT processed
        
        ORDER BY id
        LIMIT 100
    """)
    
    signals = cursor.fetchall()
    
    for signal in signals:
        source, db_id, signal_id, content, url = signal
        
        # Step 2: Generate hash and check duplicates
        content_hash = generate_content_hash(content)
        
        if is_duplicate_content(content_hash, db_connection):
            # Mark as processed but don't alert
            mark_as_duplicate(source, signal_id, db_connection)
            continue
        
        # Step 3: Classify (already done by separate process)
        # Just retrieve the scores
        scores = get_classification_scores(source, signal_id, db_connection)
        
        # Step 4: Extract entities
        entities = extract_entities(content)
        
        # Update with entities
        update_entities(source, signal_id, entities, db_connection)
        
        # Step 5: Check alert threshold
        if scores['total_score'] >= 70:
            # Step 6: Queue for notification
            queue_alert(source, signal_id, scores, entities, url, db_connection)
    
    # Process alert queue
    send_queued_alerts(db_connection)

def queue_alert(source, signal_id, scores, entities, url, db_connection):
    """
    Add high-scoring signal to alert queue
    """
    cursor = db_connection.cursor()
    
    cursor.execute("""
        INSERT INTO alert_queue
        (source, signal_id, total_score, urgency_score, budget_score,
         authority_score, pain_score, location, company_mentioned,
         problem_type, url, queued_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """, (
        source, signal_id, scores['total_score'],
        scores['urgency'], scores['budget'], scores['authority'], scores['pain'],
        entities.get('location'), entities.get('company_mentioned'),
        entities.get('problem_type'), url
    ))
    
    db_connection.commit()
```

**Alert Queue Schema:**

```sql
CREATE TABLE alert_queue (
  id SERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  signal_id VARCHAR(50) NOT NULL,
  
  -- Scores
  total_score INTEGER NOT NULL,
  urgency_score INTEGER,
  budget_score INTEGER,
  authority_score INTEGER,
  pain_score INTEGER,
  
  -- Extracted data
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  url TEXT,
  
  -- Status
  queued_at TIMESTAMP DEFAULT NOW(),
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  
  UNIQUE(source, signal_id)
);

CREATE INDEX idx_unsent_alerts ON alert_queue(sent) WHERE NOT sent;
CREATE INDEX idx_high_scores ON alert_queue(total_score DESC) WHERE NOT sent;
```

**Acceptance Criteria:**
- [ ] Processes all sources in single pipeline
- [ ] Deduplication catches 95%+ of reposts
- [ ] Entity extraction accuracy >80%
- [ ] Pipeline runs every 6 hours
- [ ] Alerts sent within 1 hour of detection

---

## 1.4 Alert System

**Daily Digest Generator:**

```python
# alert_system.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def generate_daily_digest(db_connection) -> str:
    """
    Create HTML email with top signals
    
    Returns: HTML string
    """
    cursor = db_connection.cursor()
    
    # Get top 10 unalerted signals
    cursor.execute("""
        SELECT 
            source,
            signal_id,
            total_score,
            urgency_score,
            budget_score,
            authority_score,
            pain_score,
            location,
            company_mentioned,
            problem_type,
            url
        FROM alert_queue
        WHERE NOT sent
        ORDER BY total_score DESC
        LIMIT 10
    """)
    
    signals = cursor.fetchall()
    
    if not signals:
        return None  # No digest needed
    
    # Build HTML
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .signal {{ 
                border: 1px solid #ddd; 
                padding: 15px; 
                margin: 10px 0;
                border-radius: 5px;
            }}
            .score-high {{ background-color: #ffe6e6; }}
            .score-medium {{ background-color: #fff4e6; }}
            .score {{ 
                font-size: 24px; 
                font-weight: bold; 
                color: #d9534f;
            }}
            .category-scores {{
                display: flex;
                gap: 10px;
                margin: 10px 0;
            }}
            .category {{
                padding: 5px 10px;
                background: #f5f5f5;
                border-radius: 3px;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <h1>🎯 Daily Pain Signals - {datetime.now().strftime('%B %d, %Y')}</h1>
        <p>Top {len(signals)} qualified leads detected in the last 24 hours:</p>
    """
    
    for signal in signals:
        source, sid, total, urg, bud, auth, pain, loc, comp, prob, url = signal
        
        # Determine CSS class
        score_class = 'score-high' if total >= 80 else 'score-medium'
        
        html += f"""
        <div class="signal {score_class}">
            <div class="score">{total}/100</div>
            <div class="category-scores">
                <span class="category">🚨 Urgency: {urg}/10</span>
                <span class="category">💰 Budget: {bud}/10</span>
                <span class="category">👔 Authority: {auth}/10</span>
                <span class="category">😫 Pain: {pain}/10</span>
            </div>
            <p><strong>Source:</strong> {source.upper()}</p>
            {f'<p><strong>Location:</strong> {loc}</p>' if loc else ''}
            {f'<p><strong>Company Mentioned:</strong> {comp}</p>' if comp else ''}
            {f'<p><strong>Problem Type:</strong> {prob.replace("_", " ").title()}</p>' if prob else ''}
            <p><a href="{url}" target="_blank">View Original Post →</a></p>
        </div>
        """
    
    html += """
    </body>
    </html>
    """
    
    return html

def send_digest_email(html_content: str, recipient_email: str):
    """
    Send the digest email
    """
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"🎯 {datetime.now().strftime('%b %d')} - Pain Signals Digest"
    msg['From'] = os.getenv('SMTP_FROM_EMAIL')
    msg['To'] = recipient_email
    
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    # Send via SMTP
    with smtplib.SMTP(os.getenv('SMTP_HOST'), int(os.getenv('SMTP_PORT'))) as server:
        server.starttls()
        server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASSWORD'))
        server.send_message(msg)

def mark_alerts_as_sent(db_connection):
    """Mark all current alerts as sent"""
    cursor = db_connection.cursor()
    cursor.execute("""
        UPDATE alert_queue
        SET sent = TRUE, sent_at = NOW()
        WHERE NOT sent
    """)
    db_connection.commit()

# Main execution (run daily at 8am)
def main():
    db = connect_to_database()
    
    html = generate_daily_digest(db)
    
    if html:
        send_digest_email(html, os.getenv('ALERT_EMAIL'))
        mark_alerts_as_sent(db)
        print(f"Digest sent at {datetime.now()}")
    else:
        print("No new signals to report")
    
    db.close()
```








# Module 2.0: MICRO-VALUE GENERATOR

## 2.0 WBS Overview
```
2.0 Micro-Value Generator (Days 5-10)
  2.1 Lead Magnet Templates
    2.1.1 Missed Call Tax Calculator
    2.1.2 7-Day Call Audit Preview
    2.1.3 Industry Benchmark Report
  2.2 Dynamic Content Engine
    2.2.1 Input Collection Forms
    2.2.2 Calculation Logic
    2.2.3 PDF Generation
  2.3 Delivery System
    2.3.1 Landing Pages
    2.3.2 Download Mechanism
    2.3.3 Analytics Tracking
```

---

## 2.1.1 Missed Call Tax Calculator

### Business Logic

**Inputs Required:**
```yaml
business_type: [HVAC, Plumbing, Roofing, Electrical]
avg_ticket_value: number (100-10000)
calls_per_day: number (1-100)
hours_open: number (8-24)
current_answer_rate: percentage (0-100)
```

**Calculation Formula:**

```
Step 1: Calculate Missed Calls/Day
missed_calls_per_day = calls_per_day × (1 - current_answer_rate/100)

Step 2: Calculate Conversion Rate (Industry Standard)
IF business_type == "HVAC":
    conversion_rate = 0.35
ELIF business_type == "Plumbing":
    conversion_rate = 0.40
ELIF business_type == "Roofing":
    conversion_rate = 0.25
ELSE:
    conversion_rate = 0.30

Step 3: Calculate Lost Revenue
daily_loss = missed_calls_per_day × conversion_rate × avg_ticket_value
monthly_loss = daily_loss × 30
annual_loss = daily_loss × 365

Step 4: Calculate Competitor Advantage
avg_answer_rate_in_market = 68%
IF current_answer_rate < avg_answer_rate_in_market:
    competitive_gap = "You're losing to competitors"
ELSE:
    competitive_gap = "You're ahead of the market"

Step 5: ROI Projection
cost_of_solution = 997  # Your AI agent monthly cost
IF monthly_loss > (cost_of_solution × 3):
    roi_rating = "High ROI"
    recommendation = "Immediate implementation recommended"
ELIF monthly_loss > cost_of_solution:
    roi_rating = "Positive ROI"
    recommendation = "Should consider implementation"
ELSE:
    roi_rating = "Low ROI"
    recommendation = "May not be cost-effective"
```

**Output Template Structure:**

```json
{
  "hero_stat": {
    "monthly_loss": "$XX,XXX",
    "annual_loss": "$XXX,XXX",
    "headline": "You're Leaving $XX,XXX on the Table Every Month"
  },
  "breakdown": {
    "missed_calls_daily": XX,
    "missed_calls_monthly": XXX,
    "conversion_rate": "35%",
    "avg_ticket": "$XXX"
  },
  "comparison": {
    "your_answer_rate": "XX%",
    "market_average": "68%",
    "gap": "XX% behind/ahead",
    "competitor_insight": "3 out of 5 competitors answer faster"
  },
  "roi_projection": {
    "solution_cost": "$997/mo",
    "potential_recovery": "$XX,XXX/mo",
    "roi_multiple": "XXx",
    "payback_period": "X days",
    "rating": "High/Medium/Low"
  },
  "next_steps": [
    "Book 15-min diagnostic call",
    "Get custom 7-day audit",
    "See implementation timeline"
  ]
}
```

### Decision Tree for CTA

```
Result Display Complete
  │
  ├─> IF monthly_loss > $10,000:
  │     CTA = "Book Priority Diagnostic (48hr)" 
  │     Urgency = HIGH
  │
  ├─> IF monthly_loss $5,000-$10,000:
  │     CTA = "Schedule Free Audit"
  │     Urgency = MEDIUM
  │
  └─> IF monthly_loss < $5,000:
        CTA = "Download Full Report + Resources"
        Urgency = LOW
        + Offer DIY checklist instead
```

**Data Model:**

```sql
CREATE TABLE calculator_submissions (
  id UUID PRIMARY KEY,
  session_id VARCHAR(100),
  
  -- Inputs
  business_type VARCHAR(50),
  avg_ticket_value INTEGER,
  calls_per_day INTEGER,
  hours_open INTEGER,
  current_answer_rate INTEGER,
  
  -- Calculated outputs
  monthly_loss INTEGER,
  annual_loss INTEGER,
  roi_rating VARCHAR(20),
  
  -- Lead capture (optional)
  email VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(200),
  
  -- Engagement tracking
  viewed_full_report BOOLEAN DEFAULT FALSE,
  clicked_cta BOOLEAN DEFAULT FALSE,
  booked_call BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_high_loss ON calculator_submissions(monthly_loss DESC);
CREATE INDEX idx_email ON calculator_submissions(email) WHERE email IS NOT NULL;
```

---

## 2.1.2 Seven-Day Call Audit Preview

### Concept

**What It Shows:**
A "preview" of what you'd discover if they hired you, without actually doing the work.

**Generated Insights (Simulated but Realistic):**

```yaml
Insight Categories:
  1. Peak Missed Call Times
     - Uses industry data + their inputs
     - Shows "When you're bleeding the most"
  
  2. Competitor Response Time Comparison
     - Scrapes public data (Yelp, Google reviews)
     - Shows "How you stack up"
  
  3. Revenue Recovery Opportunity
     - Based on their calculator inputs
     - Shows "Quick wins in first 30 days"
  
  4. Implementation Roadmap
     - Generic but customized to their business type
     - Shows "How fast you can fix this"
```

### Generation Logic

**Input:** Calculator submission data

**Process:**

```python
def generate_audit_preview(submission_data):
    """
    High-level logic for generating audit preview
    """
    
    # Extract submission data
    business_type = submission_data['business_type']
    calls_per_day = submission_data['calls_per_day']
    hours_open = submission_data['hours_open']
    
    # 1. Generate Peak Times Analysis (Pattern-based)
    peak_times = calculate_industry_peaks(business_type)
    """
    Logic:
    IF business_type == "HVAC":
        peak_hours = [8-10am, 4-6pm]  # After night/before evening
        peak_days = [Monday, Friday]   # Weekend prep
    IF business_type == "Plumbing":
        peak_hours = [7-9am, 6-8pm]   # Morning/evening emergencies
        peak_days = [Sunday, Monday]   # Weekend issues
    """
    
    missed_during_peaks = estimate_missed_calls(calls_per_day, peak_times)
    
    # 2. Competitor Benchmarking (Data source: Public reviews)
    competitors = scrape_local_competitors(submission_data.get('location'))
    """
    For each competitor:
      - Extract mentions of "quick response", "called back", etc.
      - Calculate avg response time from review text
      - Compare to user's current_answer_rate
    
    Output:
      - "3 of 5 competitors answer within 2 minutes"
      - "You're ranked #4 in responsiveness"
    """
    
    # 3. Revenue Recovery Timeline (30/60/90 day projection)
    recovery_timeline = project_revenue_recovery(submission_data)
    """
    Formula:
    Week 1-2 (Setup): 
      - Capture rate improves by 20%
      - Revenue recovery = monthly_loss × 0.20 × (14/30)
    
    Week 3-4 (Optimization):
      - Capture rate improves to 40%
      - Cumulative recovery = previous + (monthly_loss × 0.40 × (14/30))
    
    Month 2+:
      - Capture rate stabilizes at 60-70%
      - Monthly recovery = monthly_loss × 0.65
    """
    
    # 4. Generate PDF Report
    report_data = {
        'peak_analysis': peak_times,
        'missed_opportunities': missed_during_peaks,
        'competitor_comparison': competitors,
        'revenue_timeline': recovery_timeline,
        'next_steps': generate_custom_roadmap(business_type)
    }
    
    return report_data
```

### Competitor Scraping Logic

```javascript
// High-level pseudocode for competitor analysis

function analyzeLocalCompetitors(businessType, location) {
  
  // Step 1: Identify competitors
  competitors = searchGoogleMaps({
    query: `${businessType} near ${location}`,
    limit: 10
  })
  
  // Step 2: Extract review data
  for each competitor in competitors:
    reviews = scrapeGoogleReviews(competitor.place_id, limit=20)
    
    // Step 3: Analyze response time mentions
    response_signals = []
    for each review in reviews:
      if review.text contains ["quick", "fast", "immediately", "right away"]:
        response_signals.push({
          type: "positive",
          score: 10
        })
      else if review.text contains ["slow", "never called", "no response"]:
        response_signals.push({
          type: "negative",
          score: -10
        })
    
    // Step 4: Calculate aggregate score
    competitor.responsiveness_score = average(response_signals.scores)
  
  // Step 5: Rank competitors
  ranked = sortBy(competitors, 'responsiveness_score', DESC)
  
  // Step 6: Determine user's position
  user_estimated_score = calculateUserScore(submission_data)
  user_rank = findRankPosition(user_estimated_score, ranked)
  
  return {
    top_competitors: ranked.slice(0, 5),
    user_rank: user_rank,
    market_average: average(ranked.responsiveness_score),
    insights: generateInsights(ranked, user_rank)
  }
}
```

**Decision Rules for Insights:**

```
IF user_rank <= 3:
  message = "You're in the top tier, but here's how to dominate"
  
ELSE IF user_rank 4-7:
  message = "You're middle of the pack. Here's the gap to close"
  urgency = MEDIUM
  
ELSE:
  message = "You're losing significant market share to competitors"
  urgency = HIGH
  cta = "Priority diagnostic recommended"
```

---

## 2.1.3 Industry Benchmark Report

### Purpose
Create "proprietary research" from publicly available data

### Data Sources
```yaml
Sources:
  - Google My Business reviews (response time mentions)
  - Reddit complaints (pain signals)
  - BBB data (customer service issues)
  - Your own calculator submissions (anonymized aggregate)
  - Bureau of Labor Statistics (industry revenue data)
```

### Generation Logic

```
Report Structure:

1. Market Overview
   Data: BLS industry revenue + growth rate
   Insight: "HVAC industry is $XXB, growing X% YoY"
   
2. Communication Gap Analysis
   Data: Aggregate from calculator submissions
   Formula: 
     avg_answer_rate = AVERAGE(all_submissions.current_answer_rate)
     industry_benchmark = 68%
     gap = industry_benchmark - avg_answer_rate
   
   Insight: "Average HVAC company misses XX% of calls"
   
3. Cost of Inaction
   Data: Average monthly_loss from submissions
   Formula:
     median_loss = MEDIAN(all_submissions.monthly_loss)
     top_quartile_loss = 75TH_PERCENTILE(monthly_loss)
   
   Insight: "Top performers lose $X,XXX/mo, laggards lose $XX,XXX/mo"
   
4. Competitive Intelligence
   Data: Scraped competitor reviews
   Analysis:
     - % mentioning fast response
     - % complaining about missed calls
     - Average response time (extracted from review text)
   
   Insight: "Only 23% of companies answer within industry standard"
   
5. Technology Adoption Curve
   Data: Your own client count + market research
   Projection:
     early_adopters = "First 15% using AI agents"
     mainstream = "Expected adoption by 2026"
   
   Insight: "Early movers capturing XX% more market share"
```

### Auto-Update Logic

```
Report Regeneration Triggers:

IF new_calculator_submissions >= 50:
  → Recalculate all averages
  → Regenerate benchmark stats
  → Update PDF
  
IF days_since_last_update > 30:
  → Rescrape competitor data
  → Update market stats
  → Bump version number

IF significant_deviation (new data vs old averages > 15%):
  → Flag for manual review
  → Auto-regenerate if deviation < 25%
  → Alert admin if deviation > 25%
```

---

## 2.2 Dynamic Content Engine

### Architecture

```
User Input (Form)
    ↓
Input Validation & Sanitization
    ↓
Calculation Engine ←→ Data Store (benchmarks, formulas)
    ↓
Template Engine (Jinja2/Handlebars)
    ↓
PDF Generator (Puppeteer/wkhtmltopdf)
    ↓
File Storage (S3/Cloudflare R2)
    ↓
Download Link + Analytics Pixel
```

### Key Decision Points

**1. When to Collect Email**

```
Decision Tree:

IF monthly_loss > $10,000:
  → Require email BEFORE showing results
  → High-value lead, worth the friction
  
ELSE IF monthly_loss $5,000-$10,000:
  → Show partial results
  → Gate full PDF behind email
  
ELSE:
  → Show all results
  → Email optional for "enhanced version"
```

**2. PDF vs Web Display**

```
Rule:
  Primary display = Web (instant gratification)
  PDF = Secondary (for sharing, saving)
  
Generation:
  Web results = Rendered immediately (Svelte/React)
  PDF = Generated async, emailed within 60 seconds
  
Why:
  - Web: No waiting, better UX
  - PDF: Creates reason to collect email
  - Email delivery: Second touchpoint
```

**3. Personalization Depth**

```yaml
Level 1 (Always):
  - Business type
  - Calculated numbers
  - Industry averages

Level 2 (If location provided):
  - Local competitor data
  - City-specific examples
  - Regional benchmarks

Level 3 (If email provided):
  - Named personalization
  - Follow-up sequence
  - Custom roadmap with their company name
```

---

## 2.3 Delivery System

### Landing Page Logic

**URL Structure:**
```
/calculator → Main calculator tool
/calculator/results/:session_id → Results display
/download/:file_id → PDF download with tracking
/audit-preview/:session_id → Full audit preview
```

**Session Management:**

```javascript
// Session lifecycle

1. User lands on /calculator
   → Generate session_id (UUID)
   → Store in localStorage + cookie
   → Start analytics tracking

2. User submits form
   → Validate inputs
   → Calculate results
   → Store in DB with session_id
   → Redirect to /calculator/results/:session_id

3. User views results
   → Render personalized content
   → Track scroll depth, time on page
   → Show email capture modal after 30 seconds OR 50% scroll

4. Email captured
   → Generate PDF asynchronously
   → Send via email (with tracking pixel)
   → Redirect to /audit-preview/:session_id

5. Follow-up tracking
   → Email opened? (pixel)
   → PDF downloaded? (download endpoint)
   → CTA clicked? (tracked links)
```

### Analytics Events

```yaml
Track These Events:

calculator_started:
  - timestamp
  - referral_source
  - device_type

calculator_completed:
  - all input values
  - calculated monthly_loss
  - time_to_complete

results_viewed:
  - scroll_depth (25%, 50%, 75%, 100%)
  - time_on_page
  - sections_expanded

email_captured:
  - lead_quality (based on monthly_loss)
  - source_of_capture (modal vs inline)

pdf_generated:
  - generation_time
  - file_size

pdf_downloaded:
  - download_method (web vs email link)
  - time_from_submission

cta_clicked:
  - cta_type (book_call, download, learn_more)
  - position_on_page
```

### Lead Scoring Matrix

```
Score calculation for prioritization:

Base Score = monthly_loss / 1000  (e.g., $10K loss = 10 points)

Multipliers:
  + Provided email: ×1.5
  + Provided phone: ×1.5
  + Viewed full report: ×1.2
  + Downloaded PDF: ×1.3
  + Clicked CTA: ×2.0
  + Returned to site: ×1.5
  + Opened email: ×1.2

Final Score = Base Score × All Applicable Multipliers

Tiers:
  90+: Hot (call within 24 hours)
  60-89: Warm (email sequence + call within week)
  30-59: Qualified (nurture sequence)
  <30: Cold (passive content only)
```

---

# Module 3.0: AUTHORITY THEFT ENGINE

## 3.0 WBS Overview

```
3.0 Authority Theft Engine (Days 8-12)
  3.1 Regulatory Fear Database
    3.1.1 Compliance Requirements by Industry
    3.1.2 Fine/Penalty Data Collection
    3.1.3 Auto-Insert Logic
  3.2 Competitor Intelligence
    3.2.1 Weakness Detection System
    3.2.2 Market Gap Analysis
    3.2.3 Positioning Generator
  3.3 Proprietary Research Wrapper
    3.3.1 Data Aggregation Engine
    3.3.2 Insight Extraction
    3.3.3 Report Formatter
```

---

## 3.1 Regulatory Fear Database

### Purpose
Inject credibility through regulatory/compliance framing

### Data Structure

```sql
CREATE TABLE regulatory_requirements (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(50),
  regulation_name VARCHAR(200),
  authority VARCHAR(100),  -- "FTC", "State Board", etc.
  
  requirement_text TEXT,
  penalty_range VARCHAR(100),  -- "$1,000-$10,000 per violation"
  enforcement_likelihood VARCHAR(20),  -- "High", "Medium", "Low"
  
  trigger_keywords TEXT[],  -- When to show this
  applies_to VARCHAR(100),  -- "All businesses", "Businesses >$1M", etc.
  
  source_url TEXT,
  last_verified DATE
);

-- Example data
INSERT INTO regulatory_requirements VALUES
(1, 'HVAC', 'FTC Telemarketing Sales Rule', 'FTC',
 'Businesses must maintain call records and respond within reasonable timeframes',
 '$16,000-$43,792 per violation',
 'Medium',
 ARRAY['telemarketing', 'sales calls', 'customer calls'],
 'All HVAC businesses doing outbound marketing',
 'https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform...',
 '2024-01-15');
```

### Injection Logic

```python
def inject_regulatory_context(content, business_type, context):
    """
    Add regulatory framing to content
    
    Args:
        content: Original content (calculator result, email, etc.)
        business_type: HVAC, Plumbing, etc.
        context: Where this content appears (email, PDF, landing page)
    
    Returns: Enhanced content with regulatory hooks
    """
    
    # Get relevant regulations
    regulations = get_regulations_for_industry(business_type)
    
    # Decision: Which regulations to include?
    selected_regs = []
    
    for reg in regulations:
        # Match keywords
        if any(keyword in content.lower() for keyword in reg.trigger_keywords):
            selected_regs.append(reg)
    
    # Prioritize by enforcement likelihood
    selected_regs = sort_by(selected_regs, 'enforcement_likelihood', DESC)
    
    # Take top 2 (don't overwhelm)
    selected_regs = selected_regs[:2]
    
    # Format insertion
    if context == 'email':
        insertion = format_as_email_section(selected_regs)
        # Insert after main value prop, before CTA
        
    elif context == 'PDF':
        insertion = format_as_sidebar(selected_regs)
        # Add as callout box
        
    elif context == 'landing_page':
        insertion = format_as_trust_badge(selected_regs)
        # Show as compliance indicator
    
    return insert_content(content, insertion, position='before_cta')

def format_as_email_section(regulations):
    """
    Create email-friendly regulatory section
    """
    
    section = "\n\n📋 Compliance Note:\n\n"
    
    for reg in regulations:
        section += f"• {reg.authority} requires: {reg.requirement_text}\n"
        section += f"  Non-compliance risk: {reg.penalty_range}\n\n"
    
    section += "Our system helps ensure you stay compliant automatically.\n"
    
    return section
```

### Decision Rules

```
When to inject regulatory content:

IF lead_score > 60 AND business_size > "small":
  → Include detailed compliance info
  → Emphasize penalties
  
ELSE IF pain_score > 7 (from signal classification):
  → Brief mention only
  → Focus on pain relief, not fear
  
ELSE:
  → No regulatory content
  → Pure value proposition
```

---

## 3.2 Competitor Intelligence System

### Objective
Show prospects how they compare to competitors without doing custom research

### Data Collection

```yaml
Sources:
  Google My Business:
    - Business hours
    - Response time (from reviews)
    - Rating
    - Number of reviews
    
  Yelp:
    - Same as above
    - Price range ($ to $$$$)
    
  Website scraping:
    - Services offered
    - Technology mentioned (chatbot, etc.)
    - Guarantee/warranty info
    
  Social media:
    - Posting frequency
    - Engagement rate
    - Response time to DMs/comments
```

### Analysis Logic

```python
def analyze_competitive_position(prospect_data, location):
    """
    Generate competitive intelligence without custom research
    
    Process:
    1. Identify top 10 competitors in area
    2. Score each on key metrics
    3. Rank prospect vs competitors
    4. Generate insights
    """
    
    # Step 1: Get competitors
    competitors = get_local_businesses(
        business_type=prospect_data.business_type,
        location=location,
        radius_miles=15,
        limit=10
    )
    
    # Step 2: Score each competitor
    scored_competitors = []
    
    for comp in competitors:
        score = {
            'name': comp.name,
            'responsiveness': calculate_responsiveness_score(comp),
            'technology': calculate_tech_score(comp),
            'online_presence': calculate_online_score(comp),
            'total': 0
        }
        
        score['total'] = (
            score['responsiveness'] * 0.4 +
            score['technology'] * 0.3 +
            score['online_presence'] * 0.3
        )
        
        scored_competitors.append(score)
    
    # Step 3: Estimate prospect's score
    prospect_score = estimate_prospect_score(prospect_data)
    
    # Step 4: Rank
    all_businesses = scored_competitors + [prospect_score]
    ranked = sort_by(all_businesses, 'total', DESC)
    
    prospect_rank = find_index(ranked, prospect_score)
    
    # Step 5: Generate insights
    insights = generate_insights(prospect_rank, ranked)
    
    return {
        'rank': prospect_rank,
        'total_competitors': len(ranked),
        'percentile': (1 - prospect_rank/len(ranked)) * 100,
        'top_3_competitors': ranked[:3],
        'insights': insights,
        'gaps': identify_gaps(prospect_score, ranked[0])  # vs #1
    }

def calculate_responsiveness_score(competitor):
    """
    Score 0-10 based on public data
    """
    
    score = 5  # Baseline
    
    # Check reviews for response time mentions
    reviews = get_recent_reviews(competitor, limit=20)
    
    positive_mentions = count_matches(reviews, [
        'quick', 'fast', 'prompt', 'immediately', 'same day'
    ])
    
    negative_mentions = count_matches(reviews, [
        'slow', 'never called back', 'no response', 'days later'
    ])
    
    # Adjust score
    score += (positive_mentions * 0.5)
    score -= (negative_mentions * 0.7)
    
    # Check if they mention chatbot/AI on website
    if website_contains(competitor.website, ['chatbot', 'ai', '24/7']):
        score += 2
    
    return min(10, max(0, score))

def generate_insights(prospect_rank, all_ranked):
    """
    Create actionable insights from ranking
    """
    
    insights = []
    
    if prospect_rank == 1:
        insights.append({
            'type': 'positive',
            'text': "You're leading the market in responsiveness",
            'action': "Maintain advantage while competitors catch up"
        })
    
    elif prospect_rank <= 3:
        insights.append({
            'type': 'neutral',
            'text': f"You're in top {prospect_rank}, but competition is close",
            'action': "Small improvements = big market share gains"
        })
    
    else:
        gap_to_top = all_ranked[0]['total'] - all_ranked[prospect_rank]['total']
        
        insights.append({
            'type': 'negative',
            'text': f"You're ranked #{prospect_rank} in your market",
            'action': f"Closing the gap to #1 could increase revenue by {estimate_revenue_impact(gap_to_top)}"
        })
    
    # Find biggest weakness
    weakness = identify_primary_weakness(all_ranked[prospect_rank])
    
    insights.append({
        'type': 'opportunity',
        'text': f"Biggest improvement opportunity: {weakness['category']}",
        'action': f"Improving this could move you up {estimate_rank_improvement(weakness)} positions"
    })
    
    return insights
```

### Output Format

```json
{
  "competitive_position": {
    "current_rank": 6,
    "out_of": 11,
    "percentile": 45,
    "market_position": "Middle tier"
  },
  "top_competitors": [
    {
      "name": "ABC HVAC (Anonymized as 'Competitor A')",
      "responsiveness_score": 9.2,
      "technology_score": 8.5,
      "online_presence_score": 7.8,
      "total_score": 8.6
    }
  ],
  "your_scores": {
    "responsiveness": 5.5,
    "technology": 4.0,
    "online_presence": 6.2,
    "total": 5.3
  },
  "gaps": {
    "vs_top_performer": {
      "responsiveness": -3.7,
      "technology": -4.5,
      "online_presence": -1.6
    },
    "primary_weakness": "technology",
    "quick_wins": [
      "Implement 24/7 call answering (+2.5 points)",
      "Add chatbot to website (+1.5 points)",
      "Improve GMB response time (+1.2 points)"
    ]
  },
  "insights": [
    {
      "type": "opportunity",
      "headline": "Close the technology gap to jump 3-4 positions",
      "details": "Top performers use AI call handling. Implementation time: 7 days",
      "revenue_impact": "Estimated $12,400/month additional revenue"
    }
  ]
}
```

---

## 3.3 Proprietary Research Wrapper

### Concept
Turn aggregated public data into "exclusive research"

### Process Flow

```
Step 1: Data Collection (Automated, Daily)
  ├─> Scrape Google My Business (200+ businesses)
  ├─> Scrape Yelp reviews
  ├─> Collect calculator submissions
  └─> Monitor industry news/reports

Step 2: Data Aggregation
  ├─> Remove duplicates
  ├─> Normalize data formats
  ├─> Calculate aggregates (averages, medians, percentiles)
  └─> Store in analytics DB

Step 3: Insight Extraction
  ├─> Run statistical analysis
  ├─> Identify trends
  ├─> Find outliers
  └─> Generate findings

Step 4: Report Generation
  ├─> Template selection (based on industry)
  ├─> Data insertion
  ├─> Chart/graph generation
  └─> PDF creation

Step 5: Distribution
  ├─> Publish on website
  ├─> Email to subscribers
  ├─> LinkedIn content
  └─> Gate behind email capture
```

### Key Insights to Generate

```yaml
Insight Type 1: Market Averages
  Formula: AVERAGE(all_data.metric)
  Example: "Average HVAC company answers 58% of calls"
  
Insight Type 2: Performance Gaps
  Formula: TOP_QUARTILE - BOTTOM_QUARTILE
  Example: "Top performers answer 32% more calls than bottom 25%"
  
Insight Type 3: Revenue Correlation
  Formula: CORRELATION(answer_rate, estimated_revenue)
  Example: "Each 10% improvement in answer rate = $4,200/mo revenue"
  
Insight Type 4: Technology Adoption
  Formula: COUNT(businesses_with_tech) / COUNT(all_businesses)
  Example: "Only 12% of local HVAC companies use AI call handling"
  
Insight Type 5: Seasonal Patterns
  Formula: MONTHLY_AVERAGE grouped by month
  Example: "Missed call rate spikes 23% in summer months"
```

### Auto-Generation Logic

```python
def generate_industry_report(industry, date_range):
    """
    Create 'proprietary' research report
    
    Returns: Report object ready for PDF generation
    """
    
    # Collect data
    data = {
        'calculator_submissions': get_submissions(industry, date_range),
        'review_data': get_review_analysis(industry, date_range),
        'competitor_scores': get_competitor_scores(industry),
        'industry_news': get_news_mentions(industry, date_range)
    }
    
    # Calculate key metrics
    metrics = {
        'avg_answer_rate': calculate_average(data.calculator_submissions, 'current_answer_rate'),
        'avg_monthly_loss': calculate_average(data.calculator_submissions, 'monthly_loss'),
        'median_loss': calculate_median(data.calculator_submissions, 'monthly_loss'),
        'top_quartile_performance': calculate_percentile(data.competitor_scores, 75),
        'bottom_quartile_performance': calculate_percentile(data.competitor_scores, 25)
    }
    
    # Generate insights
    insights = []
    
    # Insight 1: Market opportunity
    if metrics.avg_monthly_loss > 5000:
        insights.append({
            'headline': f"${metrics.avg_monthly_loss:,.0f}/Month Left on the Table",
            'detail': f"Average {industry} business loses {metrics.avg_monthly_loss:,.0f} monthly due to missed calls",
            'chart_type': 'bar',
            'chart_data': distribution_of_losses(data.calculator_submissions)
        })
    
    # Insight 2: Performance gap
    gap = metrics.top_quartile_performance - metrics.bottom_quartile_performance
    insights.append({
        'headline': f"{gap:.0%} Performance Gap Between Leaders and Laggards",
        'detail': "Top 25% answer significantly more calls than bottom 25%",
        'chart_type': 'comparison',
        'chart_data': {
            'top_quartile': metrics.top_quartile_performance,
            'bottom_quartile': metrics.bottom_quartile_performance
        }
    })
    
    # Insight 3: Technology adoption
    tech_adoption_rate = calculate_tech_adoption(data.competitor_scores)
    insights.append({
        'headline': f"Only {tech_adoption_rate:.0%} Have Implemented AI Solutions",
        'detail': "Early movers capturing disproportionate market share",
        'chart_type': 'pie',
        'chart_data': {
            'with_tech': tech_adoption_rate,
            'without_tech': 1 - tech_adoption_rate
        }
    })
    
    # Build report structure
    report = {
        'title': f"{industry} Communication Efficiency Report - {format_date_range(date_range)}",
        'subtitle': "Industry Analysis Based on 200+ Businesses",
        'executive_summary': generate_executive_summary(metrics, insights),
        'key_findings': insights,
        'methodology': "Data collected from public reviews, anonymized business submissions, and market analysis",
        'sample_size': len(data.calculator_submissions) + len(data.competitor_scores),
        'date_generated': datetime.now(),
        'version': calculate_version_number(industry)
    }
    
    return report
```

### Distribution Strategy

```
Report Release Cadence:

Monthly: Industry benchmark updates
  → Email to all leads
  → Post on LinkedIn
  → Update website

Quarterly: Deep-dive analysis
  → Gated PDF (email required)
  → Webinar presentation
  → Sales tool for calls

Annual: Year-in-review + predictions
  → Major content piece
  → PR distribution
  → Authority building
```

---

# Module 4.0: AI AGENT QUALIFIER

## 4.0 WBS Overview

```
4.0 AI Agent Qualifier (Days 10-14)
  4.1 Qualification Script Logic
    4.1.1 Question Decision Tree
    4.1.2 Rejection Criteria
    4.1.3 Acceptance Criteria
  4.2 VAPI Integration
    4.2.1 Call Flow Design
    4.2.2 Response Templates
    4.2.3 Handoff Logic
  4.3 Lead Routing
    4.3.1 Scoring Algorithm
    4.3.2 Calendar Integration
    4.3.3 Notification System
```

---

## 4.1 Qualification Logic

### Purpose
**Agent's job: Reject 80% of inbound to maximize your close rate**

### Core Philosophy

```
Bad Approach:
  → Book every demo
  → Result: 10% close rate, wasted time

Good Approach:
  → Qualify hard
  → Book only ready buyers
  → Result: 40-50% close rate
```

### Question Decision Tree

```
CALL START
  │
  ├─> "Thanks for calling. Quick question - what prompted you to reach out today?"
  │     │
  │     ├─> Listen for urgency signals:
  │     │     • "Losing customers"
  │     │     • "Money on the table"
  │     │     • "Competitor beating us"
  │     │     → CONTINUE
  │     │
  │     └─> Generic curiosity:
  │           • "Just looking"
  │           • "Saw your ad"
  │           • No pain mentioned
  │           → SOFT REJECT (offer resources)
  │
  ├─> IF CONTINUE: "Have you tried solving this before? What happened?"
  │     │
  │     ├─> They've tried solutions:
  │     │     • Shows commitment
  │     │     • Understands problem
  │     │     → CONTINUE
  │     │
  │     └─> Never tried anything:
  │           • Low commitment signal
  │           → PROBE: "What's held you back from addressing this?"
  │                │
  │                ├─> Good reason (budget, time, uncertainty)
  │                │     → CONTINUE
  │                │
  │                └─> Weak reason ("haven't gotten around to it")
  │                      → SOFT REJECT
  │
  ├─> IF CONTINUE: "Roughly, what's this costing you per month?"
  │     │
  │     ├─> >$5,000/month:
  │     │     → CONTINUE (high-value)
  │     │
  │     ├─> $2,000-$5,000/month:
  │     │     → CHECK AUTHORITY next
  │     │
  │     └─> <$2,000 OR "don't know":
  │           → SOFT REJECT ("Might not be ROI positive for you yet")
  │
  ├─> IF CONTINUE: "Who else needs to be involved in this decision?"
  │     │
  │     ├─> "Just me" OR "I have authority":
  │     │     → CONTINUE
  │     │
  │     ├─> "Need to check with [partner/boss]":
  │     │     → PROBE: "What's their main concern usually?"
  │     │     → SUGGEST: "Should we include them on the call?"
  │     │          │
  │     │          ├─> Yes → CONTINUE (book 3-way call)
  │     │          └─> No → SOFT REJECT ("Let's reconnect after you discuss")
  │     │
  │     └─> "Need board approval" / "Long procurement process":
  │           → HARD REJECT ("We're not a good fit for enterprise sales cycles")
  │
  └─> IF CONTINUE: "When do you need this solved by?"
        │
        ├─> "This week/month":
          │     → BOOK IMMEDIATELY (priority slot)
          │
          ├─> "Next quarter":
          │     → NURTURE TRACK ("Let's stay in touch, I'll send you...")
          │
          └─> "Just exploring":
                → SOFT REJECT ("Sounds like you're in research mode...")
```

### Rejection Types & Responses

```yaml
SOFT REJECT (70% of calls):
  Reason: Not ready to buy yet
  Response: "Sounds like you're in research mode. I'll send you our calculator and benchmarking report. When you're ready to discuss specific implementation, reach back out."
  Outcome: Add to nurture email sequence
  
MEDIUM REJECT (15% of calls):
  Reason: Could be ready but missing key factor
  Response: "I think we could help, but [missing factor]. Once you have [X] sorted, let's reconnect."
  Outcome: Set reminder to follow up in 2 weeks
  
HARD REJECT (5% of calls):
  Reason: Wrong fit entirely
  Response: "To be honest, I don't think we're the right solution for you. You might be better served by [alternative]."
  Outcome: No follow-up (you've saved both parties time)
  
ACCEPT (10% of calls):
  Reason: All criteria met
  Response: "Based on what you've shared, I think we can help. Let me grab your calendar..."
  Outcome: Book demo/diagnostic immediately
```

### Qualification Scoring (Real-Time)

```python
def calculate_qualification_score(conversation_data):
    """
    Score call in real-time as agent talks
    
    Thresholds:
      80+: Book immediately
      60-79: Attempt to elevate, then book if successful
      40-59: Soft reject to nurture
      <40: Hard reject
    """
    
    score = 0
    
    # Pain score (0-30 points)
    if conversation_data.mentioned_specific_loss:
        score += 20
    if conversation_data.quantified_loss > 5000:
        score += 10
    elif conversation_data.quantified_loss > 2000:
        score += 5
    
    # Urgency score (0-25 points)
    if conversation_data.timeline == "this_week":
        score += 25
    elif conversation_data.timeline == "this_month":
        score += 15
    elif conversation_data.timeline == "this_quarter":
        score += 5
    
    # Authority score (0-25 points)
    if conversation_data.authority_level == "sole_decision_maker":
        score += 25
    elif conversation_data.authority_level == "needs_one_approval":
        score += 15
    elif conversation_data.authority_level == "influencer":
        score += 5
    
    # Prior attempts score (0-20 points)
    if conversation_data.tried_solutions_count >= 2:
        score += 20
    elif conversation_data.tried_solutions_count == 1:
        score += 10
    
    return score
```

---

## 4.2 VAPI Configuration

### Call Flow Architecture

```
INCOMING CALL
  │
  ├─> Greeting (5 sec)
  │     "Thanks for calling about [company]. Quick couple questions..."
  │
  ├─> Qualification Loop (60-120 sec)
  │     │
  │     ├─> Ask question
  │     ├─> Listen for keywords
  │     ├─> Update score in real-time
  │     ├─> Make decision: continue vs redirect
  │     └─> Repeat
  │
  ├─> Decision Point
  │     │
  │     ├─> Score >= 80: "Let me get you on the calendar..."
  │     ├─> Score 60-79: "Quick follow-up: [elevating question]"
  │     └─> Score < 60: "Let me send you some resources..."
  │
  └─> Outcome Execution
        │
        ├─> BOOK: Transfer to calendly OR collect email for booking link
        ├─> NURTURE: Collect email, send resources
        └─> REJECT: Polite close, no follow-up
```

### Agent Response Templates

```yaml
Templates by Stage:

greeting:
  default: "Thanks for calling about [COMPANY_NAME]. Before I connect you, I have a few quick questions to make sure we can actually help. Sound good?"
  
  after_hours: "Thanks for calling. We're currently outside business hours, but I can still help. Just a couple quick questions..."

pain_question:
  discovery: "What specifically brought you to reach out today?"
  
  follow_up: "When you say [THEIR_WORDS], what does that look like day-to-day?"
  
  quantify: "Roughly, what's that costing you? Monthly or annually, either way."

authority_question:
  direct: "Who else needs to be involved in a decision like this?"
  
  follow_up_partner: "Got it. What's [PARTNER_NAME]'s main concern usually?"
  
  follow_up_boss: "Makes sense. If I could show [BOSS_NAME] a clear ROI, would that help move things forward?"

urgency_question:
  timeline: "When do you need this solved by?"
  
  probe_delay: "What happens if you don't solve this in that timeframe?"
  
  create_urgency: "I ask because we're seeing [SEASONAL_FACTOR] drive up demand right now..."

soft_reject:
  research_mode: "Sounds like you're still in research mode, which is totally fine. I'll send you our calculator and benchmark report. When you're ready to discuss specifics, just reach back out."
  
  low_value: "Based on what you've shared, I'm not sure we'd be ROI-positive for you right now. You might try [FREE_ALTERNATIVE] first and see if that gets you where you need to be."
  
  long_timeline: "Makes sense. Let's stay in touch. I'll add you to our monthly insights email, and when you're closer to making a decision, we can reconnect."

hard_reject:
  wrong_fit: "To be totally honest, I don't think we're the right fit for what you need. You might be better served by [COMPETITOR/ALTERNATIVE]."
  
  budget_mismatch: "Our solution starts at $XXX/month, which might not make sense given your situation. Happy to point you to some free tools that might help though."

booking:
  immediate: "Perfect. Let me grab your email and I'll send you a link to grab a time that works. What's the best email?"
  
  with_calendar: "Great. I've got [TIME_SLOT_1] or [TIME_SLOT_2] available. Which works better?"
  
  defer_to_email: "Awesome. I'll send you a booking link to [EMAIL]. Grab any 30-min slot that works for you."
```

### Dynamic Response Selection Logic

```javascript
function selectResponse(stage, context) {
  /**
   * Choose appropriate response based on call context
   * 
   * Inputs:
   * - stage: current point in conversation
   * - context: data collected so far
   */
  
  if (stage === 'pain_discovery') {
    if (context.vague_answer_count >= 2) {
      return templates.pain_question.quantify; // Force specificity
    } else {
      return templates.pain_question.follow_up;
    }
  }
  
  if (stage === 'authority_check') {
    if (context.mentioned_partner) {
      return templates.authority_question.follow_up_partner;
    } else if (context.mentioned_boss) {
      return templates.authority_question.follow_up_boss;
    } else {
      return templates.authority_question.direct;
    }
  }
  
  if (stage === 'qualification_decision') {
    const score = calculateQualificationScore(context);
    
    if (score >= 80) {
      return templates.booking.immediate;
    } else if (score >= 60) {
      // Try to elevate
      return attemptToElevate(context);
    } else if (score >= 40) {
      return templates.soft_reject.research_mode;
    } else {
      return templates.hard_reject.wrong_fit;
    }
  }
}

function attemptToElevate(context) {
  /**
   * Try to improve qualification score with targeted question
   */
  
  // Find weakest area
  if (context.pain_score < 15) {
    return "Before I let you go, help me understand - what happens if you don't solve this? Like worst-case scenario?";
  }
  
  if (context.authority_score < 15) {
    return "Quick question - if I could show clear ROI, are you able to make this decision yourself?";
  }
  
  if (context.urgency_score < 15) {
    return "I'm curious - why now versus three months from now?";
  }
  
  // If no clear weakness, soft reject
  return templates.soft_reject.research_mode;
}
```

---

## 4.3 Lead Routing System

### Post-Call Workflow

```
CALL ENDS
  │
  ├─> Calculate Final Score
  │
  ├─> Determine Lead Tier
  │     │
  │     ├─> HOT (80+): Priority routing
  │     ├─> WARM (60-79): Standard routing
  │     └─> COLD (<60): Auto-nurture only
  │
  ├─> Trigger Actions
  │     │
  │     ├─> HOT:
  │     │     • Immediate Slack notification to you
  │     │     • SMS alert
  │     │     • Auto-block calendar for next 2 hours
  │     │     • Send booking link with "Priority" tag
  │     │
  │     ├─> WARM:
  │     │     • Add to daily digest email
  │     │     • Send booking link (24-hour window)
  │     │     • Queue for follow-up call in 48hrs if no booking
  │     │
  │     └─> COLD:
  │           • Add to nurture email sequence
  │           • Send calculator + resources
  │           • No manual follow-up
  │
  └─> Store Call Data
        • Transcript
        • Qualification scores
        • Key phrases extracted
        • Next action scheduled
```

### Lead Tier Definitions

```yaml
HOT LEAD (Immediate Action):
  Criteria:
    - Score >= 80
    - OR monthly_loss > $10,000
    - OR mentioned_competitor == TRUE
    - OR timeline == "this_week"
  
  SLA:
    - Human contact within 2 hours
    - Demo booked within 24 hours
    - Proposal delivered within 48 hours
  
  Actions:
    - Slack alert with full context
    - SMS to your phone
    - Calendar block (prevent conflicts)
    - Priority email template sent

WARM LEAD (24-48hr Follow-up):
  Criteria:
    - Score 60-79
    - Has budget and authority
    - Timeline within 30 days
  
  SLA:
    - Booking link sent immediately
    - Manual follow-up if no booking within 48hrs
    - Demo scheduled within 1 week
  
  Actions:
    - Add to daily digest
    - Standard booking email
    - Auto-reminder in 48hrs if no action

COLD LEAD (Nurture Only):
  Criteria:
    - Score < 60
    - Missing key qualification criteria
    - Long timeline (>60 days)
  
  SLA:
    - No manual follow-up
    - Auto-nurture sequence only
    - Re-qualify after 30 days
  
  Actions:
    - Add to email sequence
    - Send educational resources
    - Monthly check-in (automated)
```

### Calendar Integration Logic

```python
def route_to_calendar(lead_data):
    """
    Intelligent calendar booking based on lead quality
    """
    
    tier = determine_lead_tier(lead_data.qualification_score)
    
    if tier == "HOT":
        # Offer next available slots (within 48 hours)
        available_slots = get_calendar_availability(
            start=now,
            end=now + timedelta(hours=48),
            slot_duration=30,
            buffer_time=15  # Minutes between meetings
        )
        
        # Send personalized booking link
        send_priority_booking_email(
            to=lead_data.email,
            slots=available_slots[:3],  # Offer top 3 slots
            lead_context=lead_data.call_summary
        )
        
        # Alert human
        send_slack_alert(
            channel="#hot-leads",
            message=f"🔥 HOT LEAD: {lead_data.company_name}\n"
                    f"Score: {lead_data.qualification_score}\n"
                    f"Monthly Loss: ${lead_data.estimated_monthly_loss}\n"
                    f"Call Summary: {lead_data.call_summary[:200]}"
        )
    
    elif tier == "WARM":
        # Offer slots within next week
        available_slots = get_calendar_availability(
            start=now + timedelta(hours=24),
            end=now + timedelta(days=7),
            slot_duration=30
        )
        
        send_standard_booking_email(
            to=lead_data.email,
            slots_link=generate_calendly_link(available_slots)
        )
        
        # Set reminder to follow up if they don't book
        schedule_task(
            task="follow_up_unbooked_lead",
            lead_id=lead_data.id,
            execute_at=now + timedelta(hours=48)
        )
    
    else:  # COLD
        # No calendar action
        # Just send resources
        send_nurture_email(
            to=lead_data.email,
            sequence_name="educational_drip",
            personalization={
                'industry': lead_data.industry,
                'pain_point': lead_data.primary_pain
            }
        )
```

---

# Module 5.0: SILENT FOLLOW-UP ENGINE

## 5.0 WBS Overview

```
5.0 Silent Follow-Up Engine (Days 13-17)
  5.1 Trigger Detection System
    5.1.1 Competitor Monitoring
    5.1.2 Regulatory Change Alerts
    5.1.3 Seasonal/Calendar Triggers
    5.1.4 Review Mention Detection
  5.2 Content Generation
    5.2.1 Follow-up Templates
    5.2.2 Dynamic Personalization
    5.2.3 Value-Add Attachment Logic
  5.3 Delivery Orchestration
    5.3.1 Send-Time Optimization
    5.3.2 Channel Selection (Email/LinkedIn/SMS)
    5.3.3 Response Tracking
```

---

## 5.1 Trigger Detection

### Purpose
**Re-engage cold leads with NEW information, never "just following up"**

### Trigger Categories

```yaml
Trigger Type 1: Competitor Activity
  What to monitor:
    - Competitor mentioned in news/case study
    - Competitor launches new service
    - Competitor receives funding/acquisition
    - Competitor gets bad reviews
  
  Trigger logic:
    IF competitor_name IN (lead.mentioned_competitors):
      AND event_type IN ["case_study", "product_launch", "negative_review"]:
        → Generate comparison follow-up
  
  Example email:
    "Saw that [Competitor] just announced [X]. 
     Quick comparison of their approach vs what we discussed..."

Trigger Type 2: Regulatory/Industry Changes
  What to monitor:
    - New regulations announced
    - Industry fines/penalties reported
    - Compliance deadlines approaching
    - Industry association announcements
  
  Trigger logic:
    IF regulation.industry == lead.industry:
      AND regulation.relevance_score > 7:
      AND days_until_deadline < 90:
        → Generate compliance alert
  
  Example email:
    "[Regulation Body] just announced [New Requirement].
     Affects businesses like yours starting [Date].
     Here's what you need to know..."

Trigger Type 3: Seasonal/Calendar Events
  What to monitor:
    - Industry peak seasons approaching
    - Quarter/year-end deadlines
    - Weather events (for HVAC/roofing)
    - Holiday booking patterns
  
  Trigger logic:
    IF lead.industry == "HVAC":
      AND current_month IN [April, May]:
        → Generate summer prep follow-up
    
    IF lead.industry == "Tax/Accounting":
      AND current_month == January:
        → Generate tax season readiness follow-up
  
  Example email:
    "Summer call volume typically spikes 40% in June.
     If you're still manually handling calls, here's what to expect..."

Trigger Type 4: Review/Social Mentions
  What to monitor:
    - Lead's business mentioned in reviews
    - Reviews mention specific pain points
    - Social media discussions about their company
    - Competitor reviews mentioning similar issues
  
  Trigger logic:
    IF review.business == lead.company:
      AND review.mentions(pain_points):
        → Generate personalized follow-up
  
  Example email:
    "Noticed a recent review mentioning [Pain Point].
     This is exactly what we discussed on our call.
     Here's a 2-min fix you can implement today..."
```

### Detection System Architecture

```
Monitoring Jobs (run frequency):

Daily:
  - News mentions of tracked competitors (RSS, Google News API)
  - New reviews on GMB/Yelp for leads' businesses
  - Social media monitoring (Twitter, LinkedIn)

Weekly:
  - Regulatory database checks (FTC, state boards)
  - Industry publication scraping
  - Competitor website change detection

Monthly:
  - Seasonal trigger setup (prep next month's campaigns)
  - Industry report releases
  - Calendar-based triggers (quarterly deadlines, etc.)

Real-time:
  - Major breaking news (API webhooks)
  - Competitor major announcements
  - Emergency regulatory changes
```

### Trigger Matching Logic

```python
def match_triggers_to_leads(trigger, all_leads):
    """
    Determine which leads should receive follow-up for this trigger
    
    Args:
        trigger: Detected event with metadata
        all_leads: Database of all cold/warm leads
    
    Returns: List of matched leads with personalization context
    """
    
    matched_leads = []
    
    for lead in all_leads:
        relevance_score = 0
        personalization = {}
        
        # Check industry match
        if trigger.industry == lead.industry:
            relevance_score += 30
        
        # Check if trigger relates to lead's pain points
        lead_pain_points = lead.call_transcript_keywords
        trigger_keywords = trigger.related_topics
        
        keyword_overlap = set(lead_pain_points) & set(trigger_keywords)
        if len(keyword_overlap) > 0:
            relevance_score += 20 * len(keyword_overlap)
            personalization['matched_pain_points'] = list(keyword_overlap)
        
        # Check if lead mentioned competitors involved in trigger
        if trigger.type == "competitor_activity":
            if trigger.competitor_name in lead.mentioned_competitors:
                relevance_score += 40
                personalization['competitor_context'] = lead.competitor_mention_context
        
        # Check recency of last contact
        days_since_contact = (now - lead.last_contact_date).days
        
        if days_since_contact < 7:
            relevance_score -= 20  # Too soon
        elif days_since_contact > 30:
            relevance_score += 10  # Good time to re-engage
        
        # Check lead temperature
        if lead.tier == "WARM":
            relevance_score += 15
        elif lead.tier == "COLD":
            relevance_score += 5
        
        # Threshold: Only include if highly relevant
        if relevance_score >= 50:
            matched_leads.append({
                'lead': lead,
                'relevance_score': relevance_score,
                'personalization': personalization,
                'trigger': trigger
            })
    
    # Sort by relevance
    return sorted(matched_leads, key=lambda x: x['relevance_score'], reverse=True)
```

---

## 5.2 Content Generation

### Follow-Up Email Structure

```
NEVER:
  "Just following up on our conversation..."
  "Wanted to circle back..."
  "Checking in to see if..."

ALWAYS:
  [New Information] + [How It Relates to Them] + [Soft CTA]
```

### Template Library

```yaml
Template: Competitor News
  Subject: "Quick heads-up re: [Competitor Name]"
  
  Body:
    "Hi [Name],
    
    Saw that [Competitor] just [Action] (link).
    
    Quick comparison since this relates to what we discussed:
    
    [2-3 bullet comparison points]
    
    [If relevant to their specific situation, one custom insight]
    
    No pressure to respond - just thought you'd want to know.
    
    [Your Name]"
  
  Personalization tokens:
    - competitor_name
    - action (launched, announced, got funding, etc.)
    - comparison_points (auto-generated based on trigger data)
    - custom_insight (references call transcript)

Template: Regulatory Alert
  Subject: "[Regulatory Body]: New [Industry] requirement"
  
  Body:
    "Hi [Name],
    
    [Regulatory Body] just announced [Requirement] affecting [Industry] businesses.
    
    Key dates:
    • [Date]: [What happens]
    • [Date]: [Deadline]
    
    How this affects you:
    [Auto-generated based on their business details]
    
    [If your solution helps with compliance]:
    This is actually one of the things our system handles automatically.
    
    Happy to walk through the specifics if useful.
    
    [Your Name]"
  
  Personalization tokens:
    - regulatory_body
    - requirement_summary
    - key_dates (array)
    - business_impact (custom-generated)
    - compliance_connection (boolean: does solution help?)

Template: Seasonal Prep
  Subject: "[Season] prep: What most [Industry] businesses miss"
  
  Body:
    "Hi [Name],
    
    [Season] is typically when [Industry] sees [Pattern].
    
    Based on last year's data (pulled from our benchmark report):
    • [Stat 1]
    • [Stat 2]
    • [Stat 3]
    
    Quick checklist for the next 30 days:
    [Auto-generated checklist based on industry]
    
    [If they're still not using your solution]:
    Even without us, make sure you at least [One actionable tip].
    
    [Your Name]"
  
  Personalization tokens:
    - season (Summer, Tax Season, Holiday, etc.)
    - industry
    - seasonal_pattern
    - stats (array from benchmark data)
    - checklist_items (array)
    - actionable_tip

Template: Review Mention
  Subject: "Saw your recent review mentioning [Pain Point]"
  
  Body:
    "Hi [Name],
    
    Noticed a review from [Date] mentioning [Pain Point] (link).
    
    This is exactly what we discussed on our call [X] weeks ago.
    
    [If negative review]:
    Quick 2-minute fix you can implement today:
    [Specific actionable advice]
    
    [If positive review but mentions room for improvement]:
    Since this came up, here's how to ensure it's consistent:
    [Specific actionable advice]
    
    No strings attached - just thought this might help.
    
    [Your Name]"
  
  Personalization tokens:
    - pain_point (extracted from review)
    - review_date
    - review_sentiment
    - actionable_advice (AI-generated based on pain point)
    - weeks_since_call
```

### Dynamic Content Generation

```python
def generate_follow_up_email(match_data):
    """
    Create personalized follow-up based on trigger and lead data
    
    Args:
        match_data: {
          'lead': lead object,
          'trigger': trigger event,
          'personalization': custom context,
          'relevance_score': int
        }
    
    Returns: Email object ready to send
    """
    
    lead = match_data['lead']
    trigger = match_data['trigger']
    personalization = match_data['personalization']
    
    # Select appropriate template
    template = select_template(trigger.type)
    
    # Generate custom content sections
    if trigger.type == "competitor_activity":
        comparison_points = generate_competitor_comparison(
            competitor=trigger.competitor_name,
            activity=trigger.activity,
            lead_context=lead.mentioned_concerns
        )
        
        custom_insight = generate_custom_insight(
            call_transcript=lead.call_transcript,
            trigger_data=trigger.details
        )
    
    elif trigger.type == "regulatory_change":
        business_impact = analyze_regulatory_impact(
            regulation=trigger.regulation_details,
            business_type=lead.business_type,
            business_size=lead.estimated_size
        )
        
        compliance_connection = check_if_solution_helps(
            regulation=trigger.regulation_details,
            solution_features=your_solution_capabilities
        )
    
    elif trigger.type == "seasonal":
        checklist = generate_seasonal_checklist(
            industry=lead.industry,
            season=trigger.season,
            business_readiness=estimate_readiness(lead)
        )
        
        actionable_tip = get_best_quick_win(
            industry=lead.industry,
            pain_points=lead.primary_pain_points
        )
    
    # Populate template
    email_content = template.render({
        'name': lead.first_name,
        'company': lead.company_name,
        **personalization,
        # Template-specific fields populated above
    })
    
    # Determine send time
    send_time = optimize_send_time(lead)
    
    # Create email object
    email = {
        'to': lead.email,
        'subject': email_content.subject,
        'body': email_content.body,
        'scheduled_send_time': send_time,
        'tracking_enabled': True,
        'lead_id': lead.id,
        'trigger_id': trigger.id,
        'personalization_score': match_data['relevance_score']
    }
    
    return email

def generate_custom_insight(call_transcript, trigger_data):
    """
    Use AI to create specific insight based on call + trigger
    
    Prompt structure:
      "Based on this call transcript: [transcript]
       And this new information: [trigger_data]
       Generate ONE specific insight (1-2 sentences) that connects the two.
       Make it actionable and non-salesy."
    """
    
    prompt = f"""
    Call context: {call_transcript[:500]}
    New information: {trigger_data.summary}
    
    Generate one specific insight (2 sentences max) that:
    1. Connects the new information to what they mentioned in the call
    2. Provides value without selling
    3. Is specific to their situation
    
    Format: Just the insight, no preamble.
    """
    
    insight = gpt4_mini_call(prompt, max_tokens=100)
    
    return insight
```

---

## 5.3 Delivery Orchestration

### Send-Time Optimization

```python
def optimize_send_time(lead):
    """
    Determine best time to send based on lead behavior
    
    Logic:
    1. Check historical engagement (when did they open past emails?)
    2. Industry patterns (B2B vs B2C, timezone)
    3. Day of week optimization
    4. Avoid spam times
    """
    
    # Default optimal times by industry
    industry_defaults = {
        'HVAC': {'day': 'Tuesday', 'hour': 9},  # Start of workday
        'Plumbing': {'day': 'Wednesday', 'hour': 14},  # Mid-week, afternoon
        'Professional Services': {'day': 'Thursday', 'hour': 10},
        'Retail': {'day': 'Saturday', 'hour': 11}  # Weekend shoppers
    }
    
    # Check if we have engagement data for this lead
    if lead.email_open_times and len(lead.email_open_times) >= 3:
        # Use their actual behavior
        avg_open_hour = calculate_average_hour(lead.email_open_times)
        most_common_day = calculate_most_common_day(lead.email_open_times)
        
        return {
            'day': most_common_day,
            'hour': avg_open_hour,
            'timezone': lead.timezone or 'UTC'
        }
    
    # Fall back to industry defaults
    default_send_time = industry_defaults.get(
        lead.industry,
        {'day': 'Tuesday', 'hour': 10}  # Universal default
    )
    
    # Calculate next occurrence
    next_send_datetime = get_next_occurrence(
        day_of_week=default_send_time['day'],
        hour=default_send_time['hour'],
        timezone=lead.timezone or 'UTC',
        min_hours_from_now=4  # Don't send too soon
    )
    
    return next_send_datetime
```

### Channel Selection Logic

```
Decision tree for channel:

IF trigger.urgency == "HIGH":
  │
  ├─> IF lead.phone AND lead.sms_opt_in:
  │     → Send SMS
  │
  └─> ELSE:
        → Send email with "Urgent" subject flag

ELSE IF lead.preferred_channel == "LinkedIn":
  │
  └─> IF we're connected AND they're active:
        → Send LinkedIn DM
      ELSE:
        → Fall back to email

ELSE IF trigger.type == "competitor_activity":
  │
  └─> IF lead has LinkedIn AND is active:
        → LinkedIn message (more professional)
      ELSE:
        → Email

ELSE:
  → Email (default)
```

### Multi-Touch Sequence

```
For high-value cold leads that didn't book:

Touch 1 (Day 0): Initial call
  → AI agent qualifies
  → Soft reject to nurture

Touch 2 (Day 3): Resources email
  → Calculator + benchmark report
  → No ask, pure value

Touch 3 (Day 10): First trigger-based follow-up
  → IF trigger detected
  → Use Silent Follow-Up template

Touch 4 (Day 25): Seasonal/industry insight
  → Share proprietary research
  → Soft CTA: "Thoughts?"

Touch 5 (Day 45): Case study/social proof
  → "Company like yours implemented, here's what happened"
  → Specific to their industry

Touch 6 (Day 90): Re-qualification attempt
  → "Circling back - has anything changed?"
  → Offer updated calculator (get fresh data)

STOP IF:
  - They explicitly opt out
  - No engagement after Touch 6
  - They book a call (move to different sequence)
```

### Response Tracking

```sql
CREATE TABLE follow_up_engagement (
  id SERIAL PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  trigger_id UUID REFERENCES triggers(id),
  email_sent_at TIMESTAMP,
  
  -- Engagement metrics
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  replied BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP,
  
  -- Which link clicked (if multiple)
  clicked_link_url TEXT,
  
  -- Action taken
  action_taken VARCHAR(50),  -- "booked_call", "downloaded_resource", "visited_calculator", etc.
  
  -- Sequence tracking
  sequence_position INTEGER,  -- Which touch in the sequence
  next_scheduled_touch TIMESTAMP
);

CREATE INDEX idx_lead_engagement ON follow_up_engagement(lead_id, email_sent_at DESC);
```

### Engagement-Based Re-Routing

```python
def handle_email_engagement(engagement_event):
    """
    React to lead engagement with follow-up emails
    
    Events:
      - opened: Note timing, update send-time preferences
      - clicked: Escalate lead priority
      - replied: Alert human immediately
    """
    
    if engagement_event.type == "opened":
        # Update optimal send time
        update_lead_preferences(
            lead_id=engagement_event.lead_id,
            open_time=engagement_event.timestamp
        )
        
        # If opened within 5 minutes, they're actively interested
        if engagement_event.time_to_open < timedelta(minutes=5):
            escalate_lead_priority(engagement_event.lead_id)
    
    elif engagement_event.type == "clicked":
        # Determine what they clicked
        if "booking" in engagement_event.clicked_url:
            # They're hot again
            update_lead_tier(engagement_event.lead_id, "WARM")
            
            # Send immediate booking reminder
            send_booking_reminder(
                lead_id=engagement_event.lead_id,
                context="You just clicked our booking link"
            )
        
        elif "calculator" in engagement_event.clicked_url:
            # Re-engaged with tool
            # Wait for calculator submission, then follow up with results
            setup_calculator_completion_trigger(engagement_event.lead_id)
    
    elif engagement_event.type == "replied":
        # Human replied - alert immediately
        send_slack_alert(
            channel="#lead-replies",
            message=f"🔥 {engagement_event.lead_name} replied to follow-up email",
            lead_link=f"/leads/{engagement_event.lead_id}",
            email_preview=engagement_event.reply_preview[:200]
        )
        
        # Pause automated sequence
        pause_nurture_sequence(engagement_event.lead_id)
        
        # Set reminder to respond within 2 hours
        create_task(
            assignee="you",
            title=f"Respond to {engagement_event.lead_name}",
            due_at=now + timedelta(hours=2),
            priority="HIGH"
        )
```

---

**End of Modules 2-5**

---

# Module 6.0: ORCHESTRATION & TESTING

## 6.0 WBS Overview

```
6.0 Orchestration & Testing (Days 18-21)
  6.1 System Integration
    6.1.1 Module Interconnections
    6.1.2 Data Flow Validation
    6.1.3 Error Handling & Fallbacks
  6.2 Automation Orchestration
    6.2.1 n8n Workflow Design
    6.2.2 Cron Job Configuration
    6.2.3 Event-Driven Triggers
  6.3 Testing & Validation
    6.3.1 Unit Testing Critical Paths
    6.3.2 Integration Testing
    6.3.3 End-to-End User Flows
  6.4 Monitoring & Alerts
    6.4.1 Health Check System
    6.4.2 Error Logging
    6.4.3 Performance Monitoring
```

---

## 6.1 System Integration

### Master Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTAKE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Reddit API → Facebook Scraper → GMB Monitor → BBB Scraper      │
│                              ↓                                   │
│                      Raw Signals DB                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Deduplication → Classification → Entity Extraction              │
│                              ↓                                   │
│                    Processed Signals DB                          │
│                              ↓                                   │
│                    Alert Queue (Score ≥70)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                      ENGAGEMENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Calculator   │  │ Audit Preview│  │ Benchmark    │          │
│  │ Tool         │  │ Generator    │  │ Report       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         └────────────┬─────────────────────┘                    │
│                      ↓                                           │
│                  Leads DB                                        │
│            (with engagement scoring)                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   QUALIFICATION LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  AI Call Agent → Real-time Qualification → Lead Scoring          │
│                              ↓                                   │
│              Hot/Warm/Cold Classification                        │
│                              ↓                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ HOT        │  │ WARM       │  │ COLD       │                │
│  │ (Immediate)│  │ (24-48hr)  │  │ (Nurture)  │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
└────────┼─────────────────┼──────────────┼─────────────────────────┘
         │                 │              │
         ↓                 ↓              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     ACTION LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Slack Alert     Calendar Booking    Email Sequence              │
│  SMS Alert       Manual Follow-up    Silent Follow-Up            │
│                              ↓                                   │
│                    Engagement Tracking                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FEEDBACK LOOP                                  │
├─────────────────────────────────────────────────────────────────┤
│  Email Opens → Link Clicks → Call Bookings → Closed Deals       │
│                              ↓                                   │
│              Update Lead Scores & Model Training                 │
└─────────────────────────────────────────────────────────────────┘
```

### Module Interconnection Map

```yaml
Module 1 (Pain Signal Aggregator) → Module 2 (Micro-Value Generator):
  Connection: High-scoring pain signals auto-generate personalized calculators
  Data passed:
    - Location (for competitor benchmarking)
    - Pain points mentioned (for calculator customization)
    - Business type (for industry-specific formulas)
  
  Trigger:
    IF alert_queue.total_score >= 85:
      → Create pre-filled calculator link
      → Send to prospect via outreach

Module 2 (Micro-Value Generator) → Module 4 (AI Agent):
  Connection: Calculator submissions warm up leads before call
  Data passed:
    - Monthly loss estimate (for qualification scoring)
    - Business details (for personalization)
    - Engagement level (time on page, PDF download, etc.)
  
  Trigger:
    IF calculator_submission.monthly_loss >= $5,000:
      → Increase lead score by +20 when they call
      → Pre-populate AI agent context

Module 3 (Authority Theft) → Module 2 (Micro-Value Generator):
  Connection: Benchmark data enriches calculator outputs
  Data passed:
    - Industry averages
    - Competitive positioning data
    - Regulatory requirements
  
  Trigger:
    CONTINUOUS:
      → Real-time data injection into all calculators
      → Monthly report regeneration

Module 4 (AI Agent) → Module 5 (Silent Follow-Up):
  Connection: Call transcript informs follow-up personalization
  Data passed:
    - Call transcript (for custom insights)
    - Mentioned competitors (for competitor trigger matching)
    - Qualification score (for sequence selection)
    - Rejection reason (for nurture content)
  
  Trigger:
    IF call_outcome == "soft_reject" OR "medium_reject":
      → Add to silent follow-up queue
      → Set up trigger monitoring for this lead

Module 5 (Silent Follow-Up) → Module 2 (Micro-Value Generator):
  Connection: Follow-ups include fresh calculator links
  Data passed:
    - Previous calculator results (for comparison)
    - New trigger data (for updated calculations)
  
  Trigger:
    IF trigger.type == "seasonal" OR "regulatory":
      → Generate updated calculator with new assumptions
      → Email "Here's how this affects your numbers..."

All Modules → Monitoring System:
  Connection: Centralized logging and alerts
  Data passed:
    - Success/failure events
    - Performance metrics
    - Error logs
  
  Trigger:
    CONTINUOUS:
      → Real-time error alerts
      → Daily performance digest
```

---

## 6.2 Automation Orchestration

### n8n Master Workflow Design

**Primary Workflows:**

```yaml
Workflow 1: Pain Signal Pipeline (Runs every 6 hours)
  Nodes:
    1. Schedule Trigger (cron: 0 */6 * * *)
    2. Reddit Fetch (HTTP Request)
    3. Facebook Scrape (Webhook to Playwright service)
    4. GMB Monitor (API call)
    5. BBB Scrape (HTTP Request)
    6. Merge Data Streams
    7. Deduplication Check (Postgres query)
    8. Store Raw Signals (Postgres insert)
    9. Trigger Classification Workflow (Webhook)
  
  Error Handling:
    - IF any source fails → Log error, continue with others
    - IF all sources fail → Send alert, retry in 1 hour
    - IF database connection fails → Queue in Redis, retry

Workflow 2: Signal Classification (Event-triggered)
  Nodes:
    1. Webhook Trigger (from Workflow 1)
    2. Get Unprocessed Signals (Postgres query, batch of 50)
    3. Quick Keyword Scan (Function node)
    4. Decision: Use AI? (IF node)
    5a. OpenAI Classification (HTTP Request)
    5b. Keyword-Only Scoring (Function node)
    6. Calculate Total Score (Function node)
    7. Update Database (Postgres update)
    8. Decision: Score ≥70? (IF node)
    9. Add to Alert Queue (Postgres insert)
    10. Trigger Alert Workflow (Webhook)
  
  Loop Logic:
    - Process in batches of 50
    - Sleep 2 seconds between batches (rate limiting)
    - Continue until no unprocessed signals remain

Workflow 3: Daily Alert Digest (Runs at 8am)
  Nodes:
    1. Schedule Trigger (cron: 0 8 * * *)
    2. Get High-Score Signals (Postgres query: WHERE total_score ≥70 AND NOT sent)
    3. Generate HTML Email (Function node)
    4. Send Email (SMTP)
    5. Mark Alerts Sent (Postgres update)
    6. Post to Slack (HTTP Request to Slack webhook)
  
  Conditional Logic:
    - IF no high-score signals → Skip email, send "All clear" Slack message
    - IF >20 signals → Send top 10, add "View all" link

Workflow 4: Calculator Submission Handler (Webhook-triggered)
  Nodes:
    1. Webhook Trigger (from calculator form)
    2. Validate Input (Function node)
    3. Calculate Results (Function node)
    4. Store Submission (Postgres insert)
    5. Generate PDF (HTTP Request to PDF service)
    6. Decision: Monthly Loss >$10K? (IF node)
    7a. High-Value Path:
        - Send priority email
        - Create Slack alert
        - Add to hot leads
    7b. Standard Path:
        - Send standard email with PDF
        - Add to warm leads
    8. Trigger Competitor Analysis (Webhook to Module 3)
  
  Parallel Branches:
    - Email sending (async)
    - PDF generation (async)
    - Lead scoring (sync, blocks on result)

Workflow 5: AI Call Post-Processing (Webhook-triggered)
  Nodes:
    1. Webhook Trigger (from VAPI call end)
    2. Extract Call Data (Function node)
    3. Calculate Qualification Score (Function node)
    4. Store Call Record (Postgres insert)
    5. Determine Lead Tier (IF node with 3 branches)
    6a. HOT Lead Path:
        - Send Slack alert (high priority)
        - Send SMS to you
        - Send priority booking email
        - Block calendar
    6b. WARM Lead Path:
        - Send booking email
        - Schedule 48hr follow-up check
    6c. COLD Lead Path:
        - Add to nurture sequence
        - Send resource email
    7. Update Lead Status (Postgres update)
    8. Trigger Follow-Up Setup (Webhook to Module 5)

Workflow 6: Trigger Detection & Matching (Runs daily at 6am)
  Nodes:
    1. Schedule Trigger (cron: 0 6 * * *)
    2. Check News APIs (Multiple HTTP Requests)
    3. Scrape Competitor Sites (Webhook to scraper service)
    4. Check Regulatory Databases (HTTP Requests)
    5. Detect Seasonal Triggers (Function node with date logic)
    6. Store New Triggers (Postgres insert)
    7. Get All Nurture Leads (Postgres query)
    8. Match Triggers to Leads (Function node with scoring logic)
    9. Loop Through Matches:
        - Generate personalized email (OpenAI API)
        - Schedule send time (Function node)
        - Queue email (Postgres insert)
    10. Trigger Email Sender Workflow (Webhook)
  
  Matching Logic:
    - Process each trigger
    - Score against all leads
    - Only match if score ≥50
    - Limit to top 20 matches per trigger

Workflow 7: Scheduled Email Sender (Runs every 15 minutes)
  Nodes:
    1. Schedule Trigger (cron: */15 * * * *)
    2. Get Queued Emails (Postgres query: WHERE send_time <= NOW())
    3. Loop Through Emails:
        - Send via SMTP
        - Add tracking pixel
        - Log send event
        - Mark as sent
    4. Update Email Status (Postgres update)
  
  Rate Limiting:
    - Max 50 emails per execution
    - 1 second delay between sends
    - Track daily send count, stop at 500

Workflow 8: Engagement Tracking (Webhook-triggered)
  Nodes:
    1. Webhook Trigger (from email tracking pixel OR link click)
    2. Parse Event Data (Function node)
    3. Store Engagement Event (Postgres insert)
    4. Update Lead Score (Postgres update)
    5. Decision: Event Type? (Switch node)
    6a. Email Opened:
        - Update send-time preferences
        - If opened <5min → Escalate priority
    6b. Link Clicked:
        - Identify clicked link
        - If booking link → Send reminder
        - If calculator → Set completion trigger
    6c. Email Replied:
        - Send Slack alert
        - Pause automation
        - Create manual task
    7. Check for Escalation (Function node)
    8. IF escalated → Trigger Hot Lead Workflow
```

### Cron Schedule Summary

```
0 */6 * * *    → Pain Signal Collection (every 6 hours)
0 6 * * *      → Trigger Detection & Matching (daily at 6am)
0 8 * * *      → Daily Alert Digest (daily at 8am)
*/15 * * * *   → Scheduled Email Sender (every 15 minutes)
0 0 * * 0      → Weekly Benchmark Report Regeneration (Sunday midnight)
0 2 1 * *      → Monthly Data Cleanup (1st of month, 2am)
```

### Event-Driven Triggers

```yaml
Real-time Webhooks:
  /webhook/calculator-submit:
    Source: Calculator form submission
    Action: Trigger Workflow 4
    Timeout: 30 seconds
  
  /webhook/vapi-call-end:
    Source: VAPI call completion
    Action: Trigger Workflow 5
    Timeout: 60 seconds
  
  /webhook/email-opened:
    Source: Tracking pixel load
    Action: Trigger Workflow 8
    Timeout: 10 seconds
  
  /webhook/email-clicked:
    Source: Tracked link click
    Action: Trigger Workflow 8
    Timeout: 10 seconds

Database Triggers:
  After INSERT on calculator_submissions:
    IF monthly_loss > 10000:
      → Queue high-priority alert
  
  After UPDATE on leads WHERE tier changed:
    → Recalculate next action
    → Update sequences
  
  After INSERT on follow_up_engagement WHERE replied = TRUE:
    → Pause automations for this lead
    → Create manual task
```

---

## 6.3 Testing & Validation

### Critical Path Testing

```yaml
Test Suite 1: Pain Signal Pipeline
  Test 1.1: Reddit API Connection
    Input: Valid API credentials
    Expected: Successfully fetch posts from test subreddit
    Validation: Response status 200, posts array not empty
  
  Test 1.2: Deduplication Logic
    Input: Same post submitted twice
    Expected: Second submission rejected
    Validation: Database count == 1, duplicate flag logged
  
  Test 1.3: Classification Accuracy
    Input: 20 manually labeled posts (10 high-score, 10 low-score)
    Expected: AI scoring matches manual labels ≥85%
    Validation: Compare AI scores to manual labels, calculate accuracy
  
  Test 1.4: Alert Threshold
    Input: Posts with scores [95, 75, 72, 69, 50]
    Expected: Only first 3 added to alert queue
    Validation: Alert queue count == 3, all scores ≥70

Test Suite 2: Calculator & Lead Capture
  Test 2.1: Calculation Accuracy
    Input: business_type=HVAC, avg_ticket=250, calls_per_day=30, answer_rate=60
    Expected: monthly_loss = 3,150, annual_loss = 37,800
    Validation: Results match manual calculation
  
  Test 2.2: Email Capture Logic
    Input: monthly_loss = 12,000
    Expected: Email required BEFORE showing results
    Validation: Results page blocked until email submitted
  
  Test 2.3: PDF Generation
    Input: Valid calculator submission
    Expected: PDF generated within 60 seconds, download link emailed
    Validation: PDF file exists, email sent, tracking pixel active
  
  Test 2.4: Lead Scoring
    Input: Submission with monthly_loss=8000, email provided, PDF downloaded
    Expected: Lead score calculated correctly with multipliers
    Validation: Score = (8000/1000) × 1.5 × 1.3 = 15.6

Test Suite 3: AI Agent Qualification
  Test 3.1: High-Quality Lead Path
    Input: Mock call with urgency=high, budget=$8K/mo, authority=yes, timeline=this_week
    Expected: Qualification score ≥80, hot lead tier, immediate booking
    Validation: Score calculated correctly, Slack alert sent, calendar blocked
  
  Test 3.2: Rejection Path
    Input: Mock call with vague pain, no budget mention, long timeline
    Expected: Qualification score <60, soft reject, resources sent
    Validation: Nurture sequence triggered, no booking link sent
  
  Test 3.3: Call Transcript Storage
    Input: Completed call
    Expected: Full transcript stored, keywords extracted
    Validation: Database record complete, keywords array populated

Test Suite 4: Silent Follow-Up System
  Test 4.1: Trigger Matching
    Input: Competitor announcement, lead mentioned this competitor in call
    Expected: High relevance score, follow-up queued
    Validation: Match score ≥50, email generated
  
  Test 4.2: Send-Time Optimization
    Input: Lead with 3 prior opens all at 10am Tuesday
    Expected: Next email scheduled for Tuesday 10am
    Validation: Scheduled time matches pattern
  
  Test 4.3: Engagement Tracking
    Input: Email opened within 5 minutes
    Expected: Lead priority escalated
    Validation: Lead tier updated, alert sent

Test Suite 5: End-to-End Flow
  Test 5.1: Cold Lead to Hot Lead Journey
    Steps:
      1. Pain signal detected (score 75)
      2. Email sent with calculator link
      3. Calculator submitted (monthly_loss $9K)
      4. Call received and qualified (score 82)
      5. Booking completed
    Expected: Full data trail, all triggers fired correctly
    Validation: Check each database table for corresponding records
  
  Test 5.2: Nurture Sequence Completion
    Steps:
      1. Call rejected (score 45)
      2. Resources sent (Day 3)
      3. Trigger-based follow-up (Day 10)
      4. Monthly check-in (Day 30)
    Expected: All scheduled emails sent on time
    Validation: follow_up_engagement table shows all touches
```

### Integration Testing Scenarios

```yaml
Scenario 1: High-Volume Load Test
  Simulate: 500 Reddit posts arriving simultaneously
  Expected Behavior:
    - All posts stored in database
    - Processing queue doesn't crash
    - Classification completes within 30 minutes
    - No duplicate processing
  
  Metrics to Monitor:
    - Database connection pool usage
    - OpenAI API rate limits
    - Memory consumption
    - Error rate

Scenario 2: API Failure Handling
  Simulate: Reddit API returns 503 error
  Expected Behavior:
    - Error logged
    - Other sources (Facebook, GMB) continue processing
    - Retry scheduled for 1 hour later
    - Alert sent if all sources fail
  
  Validation:
    - Check error logs
    - Verify retry job created
    - Confirm other sources unaffected

Scenario 3: Concurrent Calculator Submissions
  Simulate: 50 users submit calculator simultaneously
  Expected Behavior:
    - All submissions processed
    - PDFs generated for all
    - Emails sent to all
    - No race conditions in lead scoring
  
  Metrics to Monitor:
    - PDF generation queue depth
    - Email delivery rate
    - Database lock contention

Scenario 4: Email Bounce Handling
  Simulate: Send email to invalid address
  Expected Behavior:
    - Bounce detected
    - Lead marked as invalid email
    - No further emails sent to this address
    - Bounce logged for analytics
  
  Validation:
    - Check bounce webhook received
    - Verify lead status updated
    - Confirm sequence paused

Scenario 5: Cross-Module Data Consistency
  Simulate: Lead progresses through full funnel
  Expected Behavior:
    - Data consistent across all tables
    - No orphaned records
    - Referential integrity maintained
    - Timeline events in correct order
  
  Validation:
    - Query all tables for this lead
    - Verify foreign keys valid
    - Check timestamp sequence
```

---

## 6.4 Monitoring & Health Checks

### Health Check System

```python
# health_check.py

import requests
from datetime import datetime, timedelta

def check_system_health():
    """
    Comprehensive health check of all system components
    
    Returns: Status report with red/yellow/green indicators
    """
    
    health_report = {
        'timestamp': datetime.now(),
        'overall_status': 'healthy',
        'components': {}
    }
    
    # Check 1: Database connectivity
    try:
        db = connect_to_database()
        db.execute("SELECT 1")
        health_report['components']['database'] = {
            'status': 'healthy',
            'message': 'Connected successfully'
        }
    except Exception as e:
        health_report['components']['database'] = {
            'status': 'critical',
            'message': f'Connection failed: {str(e)}'
        }
        health_report['overall_status'] = 'critical'
    
    # Check 2: Recent data ingestion
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM reddit_signals
            WHERE created_at > NOW() - INTERVAL '6 hours'
        """)
        recent_signals = cursor.fetchone()[0]
        
        if recent_signals > 10:
            status = 'healthy'
            message = f'{recent_signals} signals in last 6 hours'
        elif recent_signals > 0:
            status = 'warning'
            message = f'Only {recent_signals} signals (expected >10)'
        else:
            status = 'critical'
            message = 'No signals in last 6 hours'
        
        health_report['components']['data_ingestion'] = {
            'status': status,
            'message': message,
            'count': recent_signals
        }
        
        if status == 'critical':
            health_report['overall_status'] = 'degraded'
    
    except Exception as e:
        health_report['components']['data_ingestion'] = {
            'status': 'critical',
            'message': f'Check failed: {str(e)}'
        }
    
    # Check 3: Classification backlog
    try:
        cursor.execute("""
            SELECT COUNT(*) FROM reddit_signals
            WHERE NOT processed
        """)
        backlog = cursor.fetchone()[0]
        
        if backlog < 100:
            status = 'healthy'
        elif backlog < 500:
            status = 'warning'
        else:
            status = 'critical'
        
        health_report['components']['classification'] = {
            'status': status,
            'message': f'{backlog} unprocessed signals',
            'backlog': backlog
        }
    
    except Exception as e:
        health_report['components']['classification'] = {
            'status': 'critical',
            'message': f'Check failed: {str(e)}'
        }
    
    # Check 4: OpenAI API
    try:
        test_response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "test"}],
            max_tokens=5
        )
        
        health_report['components']['openai_api'] = {
            'status': 'healthy',
            'message': 'API responding normally'
        }
    
    except Exception as e:
        health_report['components']['openai_api'] = {
            'status': 'critical',
            'message': f'API error: {str(e)}'
        }
        health_report['overall_status'] = 'degraded'
    
    # Check 5: Email delivery
    try:
        cursor.execute("""
            SELECT 
                COUNT(*) as total_sent,
                COUNT(*) FILTER (WHERE sent_at > NOW() - INTERVAL '24 hours') as sent_today,
                AVG(EXTRACT(EPOCH FROM (sent_at - created_at))) as avg_delay_seconds
            FROM email_queue
            WHERE sent = TRUE
        """)
        
        result = cursor.fetchone()
        avg_delay = result[2]
        
        if avg_delay < 300:  # Less than 5 minutes
            status = 'healthy'
        elif avg_delay < 900:  # Less than 15 minutes
            status = 'warning'
        else:
            status = 'critical'
        
        health_report['components']['email_delivery'] = {
            'status': status,
            'message': f'Avg delay: {int(avg_delay)}s',
            'sent_today': result[1]
        }
    
    except Exception as e:
        health_report['components']['email_delivery'] = {
            'status': 'warning',
            'message': f'Check failed: {str(e)}'
        }
    
    # Check 6: VAPI Integration
    try:
        # Ping VAPI status endpoint
        response = requests.get(
            'https://api.vapi.ai/health',
            headers={'Authorization': f'Bearer {os.getenv("VAPI_API_KEY")}'},
            timeout=10
        )
        
        if response.status_code == 200:
            health_report['components']['vapi'] = {
                'status': 'healthy',
                'message': 'VAPI responding normally'
            }
        else:
            health_report['components']['vapi'] = {
                'status': 'warning',
                'message': f'Unexpected status: {response.status_code}'
            }
    
    except Exception as e:
        health_report['components']['vapi'] = {
            'status': 'critical',
            'message': f'Connection failed: {str(e)}'
        }
    
    # Check 7: Disk Space
    try:
        import shutil
        disk_usage = shutil.disk_usage('/')
        percent_used = (disk_usage.used / disk_usage.total) * 100
        
        if percent_used < 80:
            status = 'healthy'
        elif percent_used < 90:
            status = 'warning'
        else:
            status = 'critical'
        
        health_report['components']['disk_space'] = {
            'status': status,
            'message': f'{percent_used:.1f}% used',
            'percent_used': percent_used
        }
    
    except Exception as e:
        health_report['components']['disk_space'] = {
            'status': 'warning',
            'message': f'Check failed: {str(e)}'
        }
    
    return health_report

def send_health_alert_if_needed(health_report):
    """
    Send alert if system is degraded or critical
    """
    
    if health_report['overall_status'] in ['critical', 'degraded']:
        # Send Slack alert
        critical_components = [
            comp for comp, data in health_report['components'].items()
            if data['status'] == 'critical'
        ]
        
        message = f"⚠️ System Health Alert: {health_report['overall_status'].upper()}\n\n"
        message += f"Critical components: {', '.join(critical_components)}\n\n"
        
        for comp, data in health_report['components'].items():
            if data['status'] != 'healthy':
                message += f"• {comp}: {data['message']}\n"
        
        send_slack_message(
            channel='#system-alerts',
            message=message,
            priority='high'
        )
        
        # Send SMS if critical
        if health_report['overall_status'] == 'critical':
            send_sms(
                to=os.getenv('ALERT_PHONE'),
                message=f"CRITICAL: System health check failed. Check Slack #system-alerts"
            )

# Run every 15 minutes via cron
if __name__ == '__main__':
    health = check_system_health()
    send_health_alert_if_needed(health)
    
    # Log to database
    store_health_check_result(health)
```

### Error Logging Strategy

```sql
CREATE TABLE error_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Error classification
  severity VARCHAR(20),  -- 'critical', 'error', 'warning', 'info'
  component VARCHAR(50),  -- 'reddit_scraper', 'classifier', 'email_sender', etc.
  error_type VARCHAR(100),  -- 'APIError', 'DatabaseError', 'ValidationError', etc.
  
  -- Error details
  error_message TEXT,
  stack_trace TEXT,
  
  -- Context
  request_id VARCHAR(100),  -- For tracing related errors
  user_id UUID,  -- If applicable
  lead_id UUID,  -- If applicable
  
  -- Additional data
  metadata JSONB,  -- Any relevant context
  
  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

CREATE INDEX idx_severity_timestamp ON error_logs(severity, timestamp DESC);
CREATE INDEX idx_component ON error_logs(component, timestamp DESC);
CREATE INDEX idx_unresolved ON error_logs(resolved) WHERE NOT resolved;
```

**Error Severity Levels:**

```yaml
CRITICAL (Page immediately):
  - Database connection lost
  - All data sources failing
  - Payment processing errors
  - Security breaches
  
  Response Time: Immediate
  Alert Method: Slack + SMS + Email

ERROR (Alert within 1 hour):
  - Single data source failing
  - API rate limit exceeded
  - Email delivery failures (>10% bounce rate)
  - VAPI call failures
  
  Response Time: Within 1 hour
  Alert Method: Slack + Email

WARNING (Daily digest):
  - Slow query performance
  - High classification backlog
  - Low engagement rates
  - Minor configuration issues
  
  Response Time: Next business day
  Alert Method: Email digest

INFO (Log only):
  - Successful operations
  - Performance metrics
  - User actions
  - System events
  
  Response Time: No action required
  Alert Method: Logs only
```

### Performance Monitoring

```yaml
Key Metrics to Track:

Pipeline Performance:
  - Signals ingested per hour
  - Classification speed (signals per minute)
  - Average score per source
  - Duplicate rate
  
  Thresholds:
    - <50 signals/hour → Warning
    - <10 signals/hour → Critical
    - Classification >5min for 50 signals → Warning

Lead Generation:
  - Calculator submissions per day
  - Conversion rate (visitor → submission)
  - Email capture rate
  - Average monthly_loss value
  
  Thresholds:
    - <5 submissions/day → Review marketing
    - Email capture <60% → Review UX
    - Avg monthly_loss declining → Review targeting

Qualification Performance:
  - Calls received per day
  - Average qualification score
  - Hot/Warm/Cold distribution
  - Booking rate (calls → booked demos)
  
  Targets:
    - 10%+ calls → Hot leads
    - 30%+ booking rate for Hot leads
    - <30% Cold leads (we're being too soft)

Email Performance:
  - Open rate (target: >25%)
  - Click rate (target: >5%)
  - Reply rate (target: >2%)
  - Unsubscribe rate (keep <0.5%)
  
  Alert if:
    - Open rate <15%
    - Unsubscribe rate >1%
    - Bounce rate >5%

System Performance:
  - Database query time (p95 < 100ms)
  - API response time (p95 < 500ms)
  - PDF generation time (p95 < 30s)
  - Email send time (p95 < 2min)
  
  Alert if p95 exceeds thresholds by 2x
```

**Monitoring Dashboard (Grafana/Similar):**

```yaml
Dashboard 1: System Health
  Panels:
    - Overall status indicator (Green/Yellow/Red)
    - Component status grid
    - Error rate over time
    - API latency graph
    - Database connection pool usage
    - Disk space usage

Dashboard 2: Pipeline Metrics
  Panels:
    - Signals ingested (last 24hrs)
    - Classification backlog
    - Average score by source
    - High-score signals (≥70) trend
    - Alert queue depth

Dashboard 3: Lead Funnel
  Panels:
    - Visitors → Calculator submissions
    - Submissions → Calls
    - Calls → Booked demos
    - Demos → Closed deals
    - Conversion rates at each stage

Dashboard 4: Email Performance
  Panels:
    - Emails sent (last 7 days)
    - Open/click/reply rates
    - Best performing email types
    - Send-time optimization results
    - Unsubscribe trend

Dashboard 5: Revenue Impact
  Panels:
    - Total estimated monthly_loss in pipeline
    - Average deal size
    - Closed revenue (manual input)
    - ROI calculation
    - Cost per lead
```

---

# COMPREHENSIVE DATABASE SCHEMA

## Complete Schema with Relationships

```sql
-- ============================================================================
-- MODULE 1: PAIN SIGNAL AGGREGATOR
-- ============================================================================

-- Reddit signals
CREATE TABLE reddit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id VARCHAR(20) UNIQUE NOT NULL,
  subreddit VARCHAR(50) NOT NULL,
  author VARCHAR(50),
  title TEXT,
  body TEXT,
  created_utc TIMESTAMP,
  url TEXT,
  score INTEGER DEFAULT 0,
  
  -- Classification
  urgency_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  pain_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  -- Metadata
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  content_hash VARCHAR(32),
  
  -- Extracted entities
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reddit_total_score ON reddit_signals(total_score DESC);
CREATE INDEX idx_reddit_created ON reddit_signals(created_utc DESC);
CREATE INDEX idx_reddit_unprocessed ON reddit_signals(processed) WHERE NOT processed;
CREATE INDEX idx_reddit_content_hash ON reddit_signals(content_hash);

-- Facebook signals
CREATE TABLE facebook_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id VARCHAR(50) UNIQUE NOT NULL,
  group_id VARCHAR(50),
  group_name VARCHAR(200),
  author_name VARCHAR(100),
  post_text TEXT,
  post_time TIMESTAMP,
  post_url TEXT,
  
  reactions INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  -- Classification (same as Reddit)
  urgency_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  pain_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  content_hash VARCHAR(32),
  
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fb_total_score ON facebook_signals(total_score DESC);
CREATE INDEX idx_fb_unprocessed ON facebook_signals(processed) WHERE NOT processed;

-- GMB (Google My Business) signals
CREATE TABLE gmb_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id VARCHAR(100) UNIQUE NOT NULL,
  business_name VARCHAR(200),
  reviewer_name VARCHAR(100),
  review_text TEXT,
  rating INTEGER,
  review_date TIMESTAMP,
  review_url TEXT,
  
  -- Classification
  urgency_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  pain_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  content_hash VARCHAR(32),
  
  location VARCHAR(100),
  problem_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- BBB (Better Business Bureau) signals
CREATE TABLE bbb_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id VARCHAR(100) UNIQUE NOT NULL,
  business_name VARCHAR(200),
  complaint_text TEXT,
  complaint_date TIMESTAMP,
  complaint_url TEXT,
  status VARCHAR(50),
  
  -- Classification
  urgency_score INTEGER DEFAULT 0,
  budget_score INTEGER DEFAULT 0,
  authority_score INTEGER DEFAULT 0,
  pain_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  processed BOOLEAN DEFAULT FALSE,
  alerted BOOLEAN DEFAULT FALSE,
  content_hash VARCHAR(32),
  
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unified alert queue
CREATE TABLE alert_queue (
  id SERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL,  -- 'reddit', 'facebook', 'gmb', 'bbb'
  signal_id VARCHAR(50) NOT NULL,
  
  total_score INTEGER NOT NULL,
  urgency_score INTEGER,
  budget_score INTEGER,
  authority_score INTEGER,
  pain_score INTEGER,
  
  location VARCHAR(100),
  company_mentioned VARCHAR(200),
  problem_type VARCHAR(50),
  url TEXT,
  
  queued_at TIMESTAMP DEFAULT NOW(),
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  
  UNIQUE(source, signal_id)
);

CREATE INDEX idx_alert_unsent ON alert_queue(sent) WHERE NOT sent;
CREATE INDEX idx_alert_score ON alert_queue(total_score DESC) WHERE NOT sent;

-- ============================================================================
-- MODULE 2: MICRO-VALUE GENERATOR
-- ============================================================================

-- Calculator submissions
CREATE TABLE calculator_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100),
  
  -- Inputs
  business_type VARCHAR(50),
  avg_ticket_value INTEGER,
  calls_per_day INTEGER,
  hours_open INTEGER,
  current_answer_rate INTEGER,
  
  -- Calculated outputs
  daily_loss INTEGER,
  monthly_loss INTEGER,
  annual_loss INTEGER,
  roi_rating VARCHAR(20),
  conversion_rate DECIMAL(4,2),
  
  -- Lead capture
  email VARCHAR(255),
  phone VARCHAR(20),
  company_name VARCHAR(200),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  location VARCHAR(100),
  
  -- Engagement tracking
  viewed_full_report BOOLEAN DEFAULT FALSE,
  downloaded_pdf BOOLEAN DEFAULT FALSE,
  clicked_cta BOOLEAN DEFAULT FALSE,
  booked_call BOOLEAN DEFAULT FALSE,
  
  -- Lead score
  lead_score INTEGER DEFAULT 0,
  lead_tier VARCHAR(20),  -- 'hot', 'warm', 'cold'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key (created later when lead created)
  lead_id UUID REFERENCES leads(id)
);

CREATE INDEX idx_calc_email ON calculator_submissions(email) WHERE email IS NOT NULL;
CREATE INDEX idx_calc_monthly_loss ON calculator_submissions(monthly_loss DESC);
CREATE INDEX idx_calc_lead_tier ON calculator_submissions(lead_tier);
CREATE INDEX idx_calc_created ON calculator_submissions(created_at DESC);

-- Generated PDFs
CREATE TABLE generated_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES calculator_submissions(id),
  pdf_type VARCHAR(50),  -- 'calculator_results', 'audit_preview', 'benchmark_report'
  
  file_path TEXT,
  file_size INTEGER,
  
  generated_at TIMESTAMP DEFAULT NOW(),
  downloaded BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  first_download_at TIMESTAMP,
  last_download_at TIMESTAMP
);

CREATE INDEX idx_pdf_submission ON generated_pdfs(submission_id);

-- Competitor analysis cache
CREATE TABLE competitor_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location VARCHAR(100),
  business_type VARCHAR(50),
  
  -- Analysis results
  competitors JSONB,  -- Array of competitor objects
  market_average_score DECIMAL(4,2),
  analysis_data JSONB,
  
  -- Cache management
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  UNIQUE(location, business_type)
);

CREATE INDEX idx_comp_location ON competitor_analysis(location, business_type);
CREATE INDEX idx_comp_expires ON competitor_analysis(expires_at);

-- ============================================================================
-- MODULE 3: AUTHORITY THEFT ENGINE
-- ============================================================================

-- Regulatory requirements database
CREATE TABLE regulatory_requirements (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(50),
  regulation_name VARCHAR(200),
  authority VARCHAR(100),
  
  requirement_text TEXT,
  penalty_range VARCHAR(100),
  enforcement_likelihood VARCHAR(20),
  
  trigger_keywords TEXT[],
  applies_to VARCHAR(100),
  
  source_url TEXT,
  last_verified DATE,
  
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_reg_industry ON regulatory_requirements(industry) WHERE active;

-- Benchmark data (aggregated from all sources)
CREATE TABLE benchmark_data (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(50),
  metric_name VARCHAR(100),
  
  -- Statistical values
  average_value DECIMAL(10,2),
  median_value DECIMAL(10,2),
  percentile_25 DECIMAL(10,2),
  percentile_75 DECIMAL(10,2),
  percentile_90 DECIMAL(10,2),
  
  -- Sample info
  sample_size INTEGER,
  data_source VARCHAR(50),
  
  -- Time period
  period_start DATE,
  period_end DATE,
  
  calculated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(industry, metric_name, period_start, period_end)
);

CREATE INDEX idx_benchmark_industry ON benchmark_data(industry, metric_name);

-- Industry reports
CREATE TABLE industry_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry VARCHAR(50),
  report_title VARCHAR(200),
  report_version VARCHAR(20),
  
  -- Report data
  executive_summary TEXT,
  key_findings JSONB,
  methodology TEXT,
  sample_size INTEGER,
  
  -- File storage
  pdf_path TEXT,
  
  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  
  -- Metrics
  download_count INTEGER DEFAULT 0,
  email_gate_required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_industry ON industry_reports(industry, published) WHERE published;

-- ============================================================================
-- MODULE 4: AI AGENT QUALIFIER & LEADS
-- ============================================================================

-- Main leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact info
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  
  -- Business details
  industry VARCHAR(50),
  business_type VARCHAR(50),
  location VARCHAR(100),
  estimated_size VARCHAR(50),
  
  -- Lead quality
  lead_tier VARCHAR(20),  -- 'hot', 'warm', 'cold'
  lead_score INTEGER DEFAULT 0,
  
  -- Pain points & context
  primary_pain_points TEXT[],
  estimated_monthly_loss INTEGER,
  mentioned_competitors TEXT[],
  
  -- Qualification data
  has_authority BOOLEAN,
  has_budget BOOLEAN,
  timeline VARCHAR(50),
  tried_solutions TEXT[],
  
  -- Engagement
  last_contact_date TIMESTAMP,
  next_action VARCHAR(100),
  next_action_date TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'new',  -- 'new', 'nurturing', 'qualified', 'demo_booked', 'customer', 'lost'
  
  -- Source tracking
  source VARCHAR(50),  -- 'pain_signal', 'calculator', 'direct', 'referral'
  source_id VARCHAR(100),
  
  -- Communication preferences
  preferred_channel VARCHAR(20),
  timezone VARCHAR(50),
  email_opt_in BOOLEAN DEFAULT TRUE,
  sms_opt_in BOOLEAN DEFAULT FALSE,
  
  -- Engagement history (for send-time optimization)
  email_open_times TIMESTAMP[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_tier ON leads(lead_tier);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_next_action ON leads(next_action_date) WHERE next_action_date IS NOT NULL;

-- Call records (from VAPI)
CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  
  -- Call details
  call_sid VARCHAR(100),
  direction VARCHAR(20),  -- 'inbound', 'outbound'
  duration_seconds INTEGER,
  
  -- Transcript
  transcript TEXT,
  summary TEXT,
  
  -- Qualification scores
  urgency_score INTEGER,
  budget_score INTEGER,
  authority_score INTEGER,
  pain_score INTEGER,
  qualification_score INTEGER,
  
  -- Outcome
  outcome VARCHAR(50),  -- 'booked', 'soft_reject', 'hard_reject', 'follow_up'
  rejection_reason TEXT,
  
  -- Extracted data
  mentioned_competitors TEXT[],
  pain_points TEXT[],
  budget_mentioned INTEGER,
  timeline_mentioned VARCHAR(50),
  
  -- Recording
  recording_url TEXT,
  
  call_started_at TIMESTAMP,
  call_ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calls_lead ON call_records(lead_id, call_started_at DESC);
CREATE INDEX idx_calls_outcome ON call_records(outcome);
CREATE INDEX idx_calls_score ON call_records(qualification_score DESC);

-- ============================================================================
-- MODULE 5: SILENT FOLLOW-UP ENGINE
-- ============================================================================

-- Detected triggers (competitor news, regulations, etc.)
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  trigger_type VARCHAR(50),  -- 'competitor_activity', 'regulatory_change', 'seasonal', 'review_mention'
  
  -- Trigger details
  title VARCHAR(200),
  description TEXT,
  source_url TEXT,
  
  -- Specific to type
  competitor_name VARCHAR(200),
  regulation_name VARCHAR(200),
  season VARCHAR(50),
  
  -- Relevance
  industry VARCHAR(50),
  related_topics TEXT[],
  urgency VARCHAR(20),
  
  -- Matching
  matched_leads INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  
  detected_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_triggers_type ON triggers(trigger_type, detected_at DESC);
CREATE INDEX idx_triggers_industry ON triggers(industry) WHERE active;

-- Follow-up emails (queued and sent)
CREATE TABLE follow_up_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  trigger_id UUID REFERENCES triggers(id),
  
  -- Email content
  subject VARCHAR(200),
  body_text TEXT,
  body_html TEXT,
  
  -- Personalization
  personalization_data JSONB,
  relevance_score INTEGER,
  
  -- Sending
  scheduled_send_time TIMESTAMP,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  
  -- Tracking
  tracking_pixel_url TEXT,
  tracking_enabled BOOLEAN DEFAULT TRUE,
  
  -- Sequence info
  sequence_name VARCHAR(100),
  sequence_position INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_followup_lead ON follow_up_emails(lead_id, created_at DESC);
CREATE INDEX idx_followup_scheduled ON follow_up_emails(scheduled_send_time) WHERE NOT sent;
CREATE INDEX idx_followup_trigger ON follow_up_emails(trigger_id);

-- Email engagement tracking
CREATE TABLE follow_up_engagement (
  id SERIAL PRIMARY KEY,
  email_id UUID REFERENCES follow_up_emails(id),
  lead_id UUID REFERENCES leads(id),
  
  -- Events
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  clicked_link_url TEXT,
  
  replied BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP,
  reply_text TEXT,
  
  -- Conversions
  action_taken VARCHAR(50),
  action_taken_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_engagement_email ON follow_up_engagement(email_id);
CREATE INDEX idx_engagement_lead ON follow_up_engagement(lead_id);

-- ============================================================================
-- MODULE 6: SYSTEM MONITORING
-- ============================================================================

-- Error logs
CREATE TABLE error_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  severity VARCHAR(20),  -- 'critical', 'error', 'warning', 'info'
  component VARCHAR(50),
  error_type VARCHAR(100),
  
  error_message TEXT,
  stack_trace TEXT,
  
  request_id VARCHAR(100),
  user_id UUID,
  lead_id UUID REFERENCES leads(id),
  
  metadata JSONB,
  
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

CREATE INDEX idx_errors_severity ON error_logs(severity, timestamp DESC);
CREATE INDEX idx_errors_component ON error_logs(component, timestamp DESC);
CREATE INDEX idx_errors_unresolved ON error_logs(resolved) WHERE NOT resolved;

-- Health check results
CREATE TABLE health_checks (
  id SERIAL PRIMARY KEY,
  checked_at TIMESTAMP DEFAULT NOW(),
  
  overall_status VARCHAR(20),  -- 'healthy', 'degraded', 'critical'
  
  components JSONB,  -- All component statuses
  
  alerts_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_health_timestamp ON health_checks(checked_at DESC);

-- Performance metrics
CREATE TABLE performance_metrics (
  id SERIAL PRIMARY KEY,
  recorded_at TIMESTAMP DEFAULT NOW(),
  
  metric_name VARCHAR(100),
  metric_value DECIMAL(10,2),
  metric_unit VARCHAR(50),
  
  component VARCHAR(50),
  
  metadata JSONB
);

CREATE INDEX idx_metrics_name ON performance_metrics(metric_name, recorded_at DESC);
CREATE INDEX idx_metrics_component ON performance_metrics(component, recorded_at DESC);

-- ============================================================================
-- ANALYTICS & REPORTING
-- ============================================================================

-- Daily funnel metrics
CREATE TABLE daily_metrics (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE,
  
  -- Top of funnel
  pain_signals_detected INTEGER DEFAULT 0,
  high_score_signals INTEGER DEFAULT 0,
  
  -- Calculator
  calculator_visitors INTEGER DEFAULT 0,
  calculator_submissions INTEGER DEFAULT 0,
  avg_monthly_loss DECIMAL(10,2),
  
  -- Calls
  calls_received INTEGER DEFAULT 0,
  hot_leads INTEGER DEFAULT 0,
  warm_leads INTEGER DEFAULT 0,
  cold_leads INTEGER DEFAULT 0,
  
  -- Bookings
  demos_booked INTEGER DEFAULT 0,
  demos_completed INTEGER DEFAULT 0,
  
  -- Email
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  
  -- Conversion rates (calculated)
  calculator_conversion_rate DECIMAL(5,2),
  call_qualification_rate DECIMAL(5,2),
  booking_rate DECIMAL(5,2),
  email_open_rate DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_metrics_date ON daily_metrics(date DESC);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_reddit_signals_updated_at BEFORE UPDATE ON reddit_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculator_submissions_updated_at BEFORE UPDATE ON calculator_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Lead score calculation function
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  lead_data RECORD;
BEGIN
  SELECT * INTO lead_data FROM leads WHERE id = lead_uuid;
  
  -- Base score from monthly loss
  IF lead_data.estimated_monthly_loss IS NOT NULL THEN
    score := score + (lead_data.estimated_monthly_loss / 1000);
  END IF;
  
  -- Multipliers from engagement
  IF lead_data.email IS NOT NULL THEN
    score := score * 1.5;
  END IF;
  
  IF lead_data.phone IS NOT NULL THEN
    score := score * 1.5;
  END IF;
  
  -- Check calculator engagement
  IF EXISTS (
    SELECT 1 FROM calculator_submissions 
    WHERE lead_id = lead_uuid AND viewed_full_report = TRUE
  ) THEN
    score := score * 1.2;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM calculator_submissions 
    WHERE lead_id = lead_uuid AND downloaded_pdf = TRUE
  ) THEN
    score := score * 1.3;
  END IF;
  
  -- Check call quality
  IF EXISTS (
    SELECT 1 FROM call_records 
    WHERE lead_id = lead_uuid AND qualification_score >= 80
  ) THEN
    score := score * 2.0;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
```

---

# API ENDPOINT SPECIFICATIONS

## REST API Design

```yaml
BASE_URL: https://api.yourdomain.com/v1

Authentication: Bearer token in Authorization header

# ============================================================================
# CALCULATOR ENDPOINTS
# ============================================================================

POST /calculator/submit
  Description: Submit calculator form and get results
  
  Request Body:
    {
      "business_type": "HVAC",
      "avg_ticket_value": 250,
      "calls_per_day": 30,
      "hours_open": 12,
      "current_answer_rate": 65,
      "email": "john@example.com",  // Optional
      "phone": "+1234567890",  // Optional
      "company_name": "ABC HVAC",  // Optional
      "location": "Denver, CO"  // Optional
    }
  
  Response (200):
    {
      "submission_id": "uuid",
      "session_id": "uuid",
      "results": {
        "daily_loss": 1050,
        "monthly_loss": 31500,
        "annual_loss": 378000,
        "conversion_rate": 0.35,
        "roi_rating": "High ROI",
        "breakdown": { ... },
        "comparison": { ... },
        "roi_projection": { ... }
      },
      "pdf_generation_status": "queued",
      "next_steps": [ ... ]
    }
  
  Response (400):
    {
      "error": "Validation failed",
      "details": { ... }
    }

GET /calculator/results/:session_id
  Description: Retrieve results for a session
  
  Response (200):
    {
      "results": { ... },
      "pdf_url": "https://...",  // If generated
      "lead_id": "uuid"  // If lead created
    }

POST /calculator/:submission_id/capture-email
  Description: Capture email for gated content
  
  Request Body:
    {
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  
  Response (200):
    {
      "lead_id": "uuid",
      "pdf_url": "https://...",
      "access_granted": true
    }

# ============================================================================
# LEAD ENDPOINTS
# ============================================================================

GET /leads
  Description: List all leads with filtering
  
  Query Params:
    - tier: hot|warm|cold
    - status: new|nurturing|qualified|demo_booked|customer|lost
    - min_score: integer
    - created_after: ISO timestamp
    - limit: integer (default 50)
    - offset: integer (default 0)
  
  Response (200):
    {
      "leads": [
        {
          "id": "uuid",
          "email": "...",
          "company_name": "...",
          "lead_tier": "hot",
          "lead_score": 85,
          "estimated_monthly_loss": 12000,
          "status": "qualified",
          "next_action": "Send booking link",
          "next_action_date": "2024-12-22T10:00:00Z",
          "created_at": "2024-12-21T08:00:00Z"
        },
        ...
      ],
      "total": 150,
      "limit": 50,
      "offset": 0
    }

GET /leads/:id
  Description: Get full lead details
  
  Response (200):
    {
      "lead": { ... },
      "calculator_submissions": [ ... ],
      "call_records": [ ... ],
      "follow_up_emails": [ ... ],
      "engagement_summary": {
        "total_emails_sent": 5,
        "emails_opened": 4,
        "emails_clicked": 2,
        "calls_received": 1
      }
    }

PATCH /leads/:id
  Description: Update lead details
  
  Request Body:
    {
      "status": "demo_booked",
      "next_action": "Prepare demo",
      "next_action_date": "2024-12-23T14:00:00Z",
      "notes": "Requested custom demo"
    }
  
  Response (200):
    {
      "lead": { ... },
      "updated_fields": ["status", "next_action", "next_action_date"]
    }

POST /leads/:id/recalculate-score
  Description: Manually trigger lead score recalculation
  
  Response (200):
    {
      "old_score": 45,
      "new_score": 62,
      "score_change": 17,
      "tier_changed": true,
      "old_tier": "cold",
      "new_tier": "warm"
    }

# ============================================================================
# CALL ENDPOINTS (VAPI Integration)
# ============================================================================

POST /calls/webhook
  Description: Webhook endpoint for VAPI call events
  
  Request Body (from VAPI):
    {
      "event": "call_ended",
      "call_sid": "...",
      "transcript": "...",
      "duration": 245,
      "caller_phone": "+1234567890",
      "metadata": { ... }
    }
  
  Response (200):
    {
      "processed": true,
      "lead_id": "uuid",
      "qualification_score": 75,
      "tier": "warm",
      "next_action": "booking_link_sent"
    }

GET /calls/:lead_id
  Description: Get all calls for a lead
  
  Response (200):
    {
      "calls": [
        {
          "id": "uuid",
          "call_started_at": "...",
          "duration_seconds": 245,
          "qualification_score": 75,
          "outcome": "soft_reject",
          "summary": "...",
          "recording_url": "https://..."
        },
        ...
      ]
    }

# ============================================================================
# FOLLOW-UP ENDPOINTS
# ============================================================================

GET /triggers
  Description: List detected triggers
  
  Query Params:
    - type: competitor_activity|regulatory_change|seasonal|review_mention
    - active: true|false
    - industry: HVAC|Plumbing|etc.
  
  Response (200):
    {
      "triggers": [
        {
          "id": "uuid",
          "trigger_type": "competitor_activity",
          "title": "Competitor X launched new service",
          "competitor_name": "Competitor X",
          "detected_at": "2024-12-21T06:00:00Z",
          "matched_leads": 15,
          "emails_sent": 12
        },
        ...
      ]
    }

POST /triggers/:id/send-follow-ups
  Description: Manually trigger follow-up emails for a trigger
  
  Request Body:
    {
      "lead_ids": ["uuid1", "uuid2"],  // Optional, sends to all matched if empty
      "send_immediately": false
    }
  
  Response (200):
    {
      "emails_queued": 15,
      "scheduled_send_times": [ ... ]
    }

GET /follow-ups/:lead_id
  Description: Get follow-up history for a lead
  
  Response (200):
    {
      "emails": [
        {
          "id": "uuid",
          "subject": "...",
          "sent_at": "2024-12-20T10:00:00Z",
          "opened": true,
          "clicked": false,
          "trigger_type": "competitor_activity"
        },
        ...
      ],
      "engagement_stats": {
        "total_sent": 5,
        "open_rate": 0.80,
        "click_rate": 0.40,
        "reply_rate": 0.20
      }
    }

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

GET /analytics/funnel
  Description: Get funnel metrics
  
  Query Params:
    - start_date: YYYY-MM-DD
    - end_date: YYYY-MM-DD
  
  Response (200):
    {
      "period": {
        "start": "2024-12-01",
        "end": "2024-12-21"
      },
      "metrics": {
        "pain_signals_detected": 1250,
        "calculator_submissions": 85,
        "calls_received": 32,
        "demos_booked": 15,
        "deals_closed": 5
      },
      "conversion_rates": {
        "signal_to_calculator": 0.068,
        "calculator_to_call": 0.376,
        "call_to_demo": 0.469,
        "demo_to_deal": 0.333
      },
      "revenue": {
        "total_pipeline_value": 125000,
        "closed_revenue": 15000
      }
    }

GET /analytics/performance
  Description: Get system performance metrics
  
  Response (200):
    {
      "pipeline": {
        "signals_per_hour": 45,
        "classification_speed": 120,  // signals per minute
        "backlog": 25
      },
      "email": {
        "open_rate": 0.28,
        "click_rate": 0.06,
        "bounce_rate": 0.02
      },
      "qualification": {
        "avg_score": 55,
        "hot_lead_percentage": 0.12,
        "booking_rate": 0.35
      }
    }

GET /analytics/daily-digest
  Description: Get today's activity summary
  
  Response (200):
    {
      "date": "2024-12-21",
      "summary": {
        "new_signals": 45,
        "high_score_signals": 8,
        "calculator_submissions": 4,
        "calls_received": 2,
        "hot_leads": 1,
        "demos_booked": 1
      },
      "top_signals": [ ... ],
      "priority_leads": [ ... ]
    }

# ============================================================================
# ADMIN/SYSTEM ENDPOINTS
# ============================================================================

GET /health
  Description: System health check
  
  Response (200):
    {
      "overall_status": "healthy",
      "components": {
        "database": {
          "status": "healthy",
          "message": "Connected successfully"
        },
        "data_ingestion": {
          "status": "healthy",
          "message": "45 signals in last 6 hours"
        },
        ...
      },
      "timestamp": "2024-12-21T12:00:00Z"
    }

POST /admin/trigger-job
  Description: Manually trigger a scheduled job
  
  Request Body:
    {
      "job_name": "pain_signal_collection" | "classification" | "trigger_detection"
    }
  
  Response (200):
    {
      "job_started": true,
      "job_id": "uuid",
      "estimated_duration": "5 minutes"
    }

GET /admin/errors
  Description: Get recent errors
  
  Query Params:
    - severity: critical|error|warning
    - component: string
    - resolved: true|false
    - limit: integer
  
  Response (200):
    {
      "errors": [
        {
          "id": 123,
          "timestamp": "...",
          "severity": "error",
          "component": "reddit_scraper",
          "error_message": "...",
          "resolved": false
        },
        ...
      ]
    }
```

---

# DEPLOYMENT CHECKLIST

## Pre-Launch Setup

```yaml
Infrastructure:
  ☐ Provision Supabase instance (Postgres database)
  ☐ Set up Redis for caching/queue
  ☐ Configure Cloudflare Pages for static hosting
  ☐ Set up S3/R2 for PDF storage
  ☐ Provision email service (SendGrid/Postmark)
  ☐ Set up n8n instance (self-hosted or n8n.cloud)

API Keys & Credentials:
  ☐ Reddit API credentials (client_id, client_secret)
  ☐ Facebook login credentials (for scraping)
  ☐ OpenAI API key (GPT-4-mini access)
  ☐ VAPI API key (for call handling)
  ☐ Google Maps API key (for competitor analysis)
  ☐ SendGrid/Postmark API key
  ☐ Twilio credentials (for SMS alerts)
  ☐ Slack webhook URL

Environment Variables (.env file):
  ☐ DATABASE_URL
  ☐ REDIS_URL
  ☐ REDDIT_CLIENT_ID
  ☐ REDDIT_CLIENT_SECRET
  ☐ FB_EMAIL
  ☐ FB_PASSWORD
  ☐ OPENAI_API_KEY
  ☐ VAPI_API_KEY
  ☐ GOOGLE_MAPS_API_KEY
  ☐ SENDGRID_API_KEY
  ☐ TWILIO_ACCOUNT_SID
  ☐ TWILIO_AUTH_TOKEN
  ☐ SLACK_WEBHOOK_URL
  ☐ ALERT_EMAIL
  ☐ ALERT_PHONE
  ☐ JWT_SECRET (for API authentication)

Database Setup:
  ☐ Run schema.sql to create all tables
  ☐ Create indexes
  ☐ Set up triggers (update_updated_at)
  ☐ Load initial regulatory_requirements data
  ☐ Create database backups schedule

n8n Workflows:
  ☐ Import all 8 workflows
  ☐ Configure credentials in n8n
  ☐ Set up webhook URLs
  ☐ Test each workflow individually
  ☐ Set up cron schedules
  ☐ Enable error notifications

Frontend Deployment:
  ☐ Build calculator React/Next.js app
  ☐ Deploy to Cloudflare Pages
  ☐ Set up custom domain
  ☐ Configure SSL certificate
  ☐ Set up analytics (Plausible/Fathom)
  ☐ Add tracking pixels

VAPI Configuration:
  ☐ Upload qualification script
  ☐ Set up webhook URL (POST /calls/webhook)
  ☐ Configure voice settings
  ☐ Test call flow end-to-end
  ☐ Set up call recording storage

Email Templates:
  ☐ Create all email HTML templates
  ☐ Set up tracking pixels
  ☐ Configure unsubscribe links
  ☐ Test rendering in major email clients
  ☐ Set up sender domain (SPF, DKIM, DMARC)

Monitoring Setup:
  ☐ Set up health check cron (every 15 min)
  ☐ Configure Slack alerts channel (#system-alerts)
  ☐ Set up error logging
  ☐ Create Grafana dashboards (or similar)
  ☐ Set up uptime monitoring (UptimeRobot, etc.)

Testing:
  ☐ Run all Test Suite 1-5 (from 6.3)
  ☐ End-to-end test: signal → lead → call → booking
  ☐ Load test: 100 concurrent calculator submissions
  ☐ Email deliverability test
  ☐ VAPI call test (10+ test calls)
  ☐ Trigger matching test with real data

Documentation:
  ☐ API documentation (Postman collection or OpenAPI)
  ☐ Admin runbook (how to handle common issues)
  ☐ Workflow diagrams
  ☐ Database schema diagram
  ☐ Emergency procedures document
```

## Week 1 Launch (Days 1-7)

```yaml
Day 1:
  ☐ Enable Reddit scraper only (limit to 2 subreddits)
  ☐ Monitor for 24 hours
  ☐ Verify classification accuracy
  ☐ Check database performance

Day 2:
  ☐ Add Facebook scraper (1 group only)
  ☐ Enable alert digest (test with your email only)
  ☐ Verify deduplication working

Day 3:
  ☐ Launch calculator (soft launch, share with 10 people)
  ☐ Monitor submissions
  ☐ Check PDF generation
  ☐ Verify email delivery

Day 4:
  ☐ Enable VAPI agent (test number only)
  ☐ Make 5+ test calls
  ☐ Verify qualification logic
  ☐ Check Slack alerts working

Day 5:
  ☐ Enable trigger detection (monitor only, don't send emails)
  ☐ Verify matching logic
  ☐ Review generated email content

Day 6:
  ☐ Send first batch of follow-up emails (max 20)
  ☐ Monitor engagement
  ☐ Check tracking working

Day 7:
  ☐ Review week 1 metrics
  ☐ Fix any bugs found
  ☐ Optimize slow queries
  ☐ Plan week 2 expansion
```

## Week 2: Scale Up (Days 8-14)

```yaml
☐ Add all target subreddits (10+ total)
☐ Add all Facebook groups
☐ Enable GMB and BBB scrapers
☐ Increase calculator traffic (paid ads?)
☐ Open VAPI to public number
☐ Enable full follow-up automation
☐ Set up competitor analysis
☐ Generate first benchmark report
```

## Week 3: Optimize (Days 15-21)

```yaml
☐ Analyze funnel conversion rates
☐ A/B test email subject lines
☐ Optimize calculator UX based on data
☐ Refine VAPI qualification script
☐ Adjust lead scoring weights
☐ Optimize send times based on engagement
☐ Scale to full automation
☐ Document lessons learned
```

---

# COST ESTIMATES

## Monthly Operating Costs

```yaml
Infrastructure:
  Supabase (Pro): $25/month
  Redis (Upstash): $10/month
  Cloudflare Pages: $0 (free tier sufficient)
  Cloudflare R2 (storage): $5/month (estimate)
  n8n Cloud: $20/month (or self-host for free)
  Total Infrastructure: $60/month

APIs & Services:
  OpenAI (GPT-4-mini):
    - ~2,000 classifications/month @ $0.15/1M tokens
    - ~500 email content generations @ $0.15/1M tokens
    - Estimated: $15-30/month
  
  VAPI:
    - Based on call volume
    - ~$0.10/minute
    - 100 calls/month × 3 min avg = $30/month
  
  SendGrid/Postmark:
    - Up to 10,000 emails: Free
    - 10K-50K: $15/month
  
  Twilio (SMS alerts):
    - ~20 SMS/month: $1/month
  
  Google Maps API (competitor analysis):
    - ~500 requests/month: Free tier
  
  Total APIs: $46-76/month

Optional:
  Monitoring (BetterUptime): $20/month
  Analytics (Plausible): $9/month
  
Total Monthly: $135-165/month
```

## One-Time Setup Costs

```yaml
Development Time (if outsourcing):
  Backend development: 40-60 hours @ $50-100/hr = $2,000-6,000
  Frontend development: 20-30 hours @ $50-100/hr = $1,000-3,000
  Integration & testing: 20 hours @ $50-100/hr = $1,000-2,000
  Total if outsourced: $4,000-11,000

DIY Time Investment:
  Following this build plan: 60-80 hours over 3 weeks
  Your hourly rate: $X
  Opportunity cost: Calculate based on your rate

Domain & Branding:
  Domain name: $15/year
  Logo (Fiverr): $50 one-time
```

---

# SUCCESS METRICS & KPIs

## Week 1 Targets

```yaml
Data Collection:
  - Pain signals detected: 200+
  - High-score signals (≥70): 20+
  - Classification accuracy: 85%+

Lead Generation:
  - Calculator visitors: 50+
  - Calculator submissions: 10+
  - Email capture rate: 60%+

Qualification:
  - Calls received: 5+
  - Hot leads generated: 1+
  - Soft rejects: 3-4

System Health:
  - Uptime: 99%+
  - Error rate: <1%
  - Average response time: <500ms
```

## Month 1 Targets

```yaml
Pipeline:
  - Pain signals: 2,000+
  - Calculator submissions: 50+
  - Calls received: 25+
  - Hot leads: 5+
  - Demos booked: 3+

Conversion Rates:
  - Signal → Calculator: 2.5%+
  - Calculator → Call: 30%+
  - Call → Demo: 20%+

Email Performance:
  - Open rate: 25%+
  - Click rate: 5%+
  - Reply rate: 2%+

Revenue:
  - First customer closed: 1
  - Pipeline value: $50K+
```

## Month 3 Targets

```yaml
Volume:
  - Pain signals: 6,000+
  - Calculator submissions: 200+
  - Calls: 100+
  - Demos booked: 15+
  - Customers closed: 5

Efficiency:
  - Cost per lead: <$50
  - Cost per demo: <$200
  - Close rate: 30%+

System Maturity:
  - Automated follow-ups: 90%+
  - Manual intervention: <10% of leads
  - Email deliverability: 98%+
```

---

# FINAL NOTES

## What You've Built

This is a **complete demand generation engine** that:

1. **Finds prospects** where they're already complaining (Pain Signal Aggregator)
2. **Qualifies them** before you talk (Micro-Value Generator + AI Agent)
3. **Builds authority** without partnerships (Authority Theft Engine)
4. **Stays top-of-mind** without spam (Silent Follow-Up Engine)
5. **Operates automatically** 24/7 (Orchestration)

## Key Competitive Advantages

```
Traditional Sales:
  - Cold outreach → 1-2% response
  - Generic pitch → low conversion
  - Manual follow-up → inconsistent
  - No authority → trust issues

Your System:
  - Warm inbound → 20-30% response
  - Personalized value → high conversion
  - Automated triggers → never miss opportunity
  - Data-driven authority → instant credibility
```

## Next Steps After Launch

1. **Week 1**: Fix bugs, optimize slow queries
2. **Week 2**: Scale data sources, increase traffic
3. **Week 3**: A/B test, refine messaging
4. **Month 2**: Add more verticals (beyond HVAC)
5. **Month 3**: Build referral/partnership engine
6. **Month 6**: White-label for other consultants

---

**You now have a complete, detailed build plan for a system that manufactures demand instead of chasing it.**

The code is high-level enough for you to implement flexibly, but detailed enough that every major decision is documented. All logic, criterias, if/else conditions, and integration points are specified.

Ready to build? 🚀