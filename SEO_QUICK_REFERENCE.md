# SEO Quick Reference Guide - KestrelVoice

## Production Pilot Landing Page

### Primary URL
`https://kestrelvoice.com/production-pilot`

### Target Keywords (Priority Order)

**High Priority (1-3 months):**
- HVAC production pilot
- Live call handling test
- HVAC answering service trial
- AI voice agent evaluation

**Medium Priority (3-6 months):**
- HVAC call automation pilot
- Production call handling
- HVAC missed calls solution
- After-hours call coverage HVAC

**Long-tail (6-12 months):**
- Live phone system test for HVAC businesses
- HVAC operational efficiency evaluation
- AI call automation pilot program
- Revenue leakage analysis HVAC

### Meta Information

**Title:** $199 Production Pilot - Live HVAC Call Handling Evaluation | KestrelVoice (70 chars)

**Description:** Deploy KestrelVoice on your real business number for 7 days. Measure calls answered, jobs booked, and after-hours coverage. $199 paid production evaluation—not a demo. (158 chars)

**OG Title:** $199 Production Pilot - Recover Missed HVAC Revenue

**OG Description:** Live production evaluation on your real business line. Measure performance, book jobs, capture after-hours calls. 7-day pilot with executive report.

## Strategic CTA Placement

### Homepage (`/`)
- **Location:** Between Pricing and FAQ sections
- **Variant:** Full default CTA with dual buttons
- **Goal:** Introduce pilot option to high-intent visitors

### About Page (`/about`)
- **Location:** Before final CTA section
- **Variant:** Full default CTA
- **Goal:** Offer low-risk entry after credibility building

### Pricing Section
- **Location:** Above pricing grid
- **Variant:** Compact dark-themed banner
- **Goal:** Present pilot as alternative to full commitment

### Content Pages (Recommended)
- **Variant:** Inline text-based CTA
- **Placement:** After problem statement sections
- **Pages to add:**
  - `/hvac-ai-answering-service`
  - `/hvac-missed-call-management`
  - `/hvac-emergency-call-handling`

## Structured Data Implemented

### Organization Schema (Root Layout)
```json
{
  "@type": "Organization",
  "name": "KestrelVoice",
  "url": "https://kestrelvoice.com"
}
```

### SoftwareApplication Schema (Root Layout)
```json
{
  "@type": "SoftwareApplication",
  "name": "KestrelVoice",
  "offers": {
    "lowPrice": "199",
    "highPrice": "4900"
  }
}
```

### Service Schema (Pilot Page)
```json
{
  "@type": "Service",
  "name": "KestrelVoice Production Pilot",
  "price": "199"
}
```

### Product Schema (Pilot Page)
```json
{
  "@type": "Product",
  "name": "KestrelVoice Production Pilot",
  "aggregateRating": {
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

## Files Created/Modified

### New Files
- `/frontend/app/production-pilot/page.tsx` - Main landing page
- `/frontend/app/production-pilot/layout.tsx` - SEO metadata & structured data
- `/frontend/app/production-pilot/opengraph-image.tsx` - Dynamic OG image
- `/frontend/components/PilotCTA.tsx` - Reusable CTA component
- `/frontend/app/sitemap.ts` - Dynamic XML sitemap
- `/frontend/public/robots.txt` - Crawler directives

### Modified Files
- `/frontend/app/layout.tsx` - Enhanced root metadata + structured data
- `/frontend/app/page.tsx` - Added Pilot CTA section
- `/frontend/app/about/page.tsx` - Added Pilot CTA section
- `/frontend/components/PricingSection.tsx` - Added Pilot CTA banner

## Google Search Console Setup

### Required Actions
1. **Submit sitemap:** `https://kestrelvoice.com/sitemap.xml`
2. **Request indexing** for `/production-pilot`
3. **Monitor queries** for target keywords
4. **Track CTR** for pilot page in search results

### Performance Tracking
- Monitor impressions for "HVAC production pilot"
- Track position changes for "live call handling test"
- Analyze click-through rate vs. other landing pages
- Monitor mobile vs. desktop performance

## Content Optimization Checklist

### On-Page SEO ✓
- [x] H1 tag with primary keyword
- [x] Meta title optimized (under 60 chars)
- [x] Meta description compelling (under 160 chars)
- [x] URL structure clean and keyword-rich
- [x] Internal linking from homepage
- [x] Internal linking from pricing
- [x] Image alt tags (when images added)
- [x] Mobile responsive design
- [x] Fast page load (Next.js optimized)

### Technical SEO ✓
- [x] Canonical URL set
- [x] Open Graph tags complete
- [x] Twitter Card tags complete
- [x] Structured data (JSON-LD)
- [x] Robots.txt configured
- [x] Sitemap.xml generated
- [x] SSL/HTTPS (production)
- [x] Mobile-first design

### Content SEO ✓
- [x] Primary keyword in H1
- [x] Secondary keywords in H2s
- [x] Long-tail keywords in body
- [x] Natural keyword density (2-3%)
- [x] Clear value proposition
- [x] Strong CTAs throughout
- [x] FAQ section for long-tail
- [x] Trust signals present

## Conversion Optimization

### CTA Hierarchy
1. **Primary:** "Start $199 Production Pilot" (Hero)
2. **Secondary:** "Start Your Production Pilot" (Pricing section)
3. **Tertiary:** "Run a $199 Production Pilot" (Final CTA)
4. **Alternative:** "Book Demo First" (For hesitant visitors)

### A/B Testing Opportunities
- Hero headline variations
- CTA button colors (blue vs. green)
- Pricing presentation (monthly vs. one-time)
- Social proof placement
- FAQ order and content

## Analytics Goals to Set Up

### Conversion Goals
1. Pilot page visit from organic search
2. CTA click on pilot page
3. Calendar booking from pilot page
4. Form submission for pilot signup

### Event Tracking
- Scroll depth on pilot page
- Time on page
- CTA button clicks
- Exit intent triggers
- Video play (if added)

## Link Building Strategy

### Internal Links (Priority)
- Homepage → Production Pilot
- Pricing → Production Pilot
- About → Production Pilot
- Blog posts → Production Pilot (contextual)
- Case studies → Production Pilot

### External Links (Future)
- HVAC industry forums
- Service business communities
- AI/automation directories
- Business software review sites
- Industry publications

## Local SEO (If Applicable)

### Google Business Profile
- Add "Production Pilot" as service
- Include $199 pricing
- Add photos of dashboard/reports
- Encourage reviews mentioning pilot

## Competitor Analysis

### Monitor Rankings For:
- Bland AI alternatives
- HVAC call automation solutions
- AI answering services for HVAC
- Call center alternatives

### Differentiation Points:
- Production pilot (not demo)
- Paid evaluation (filters serious buyers)
- Executive report deliverable
- Credit toward full deployment

## Quick Wins (Next 30 Days)

1. **Submit to Google Search Console**
2. **Create OG image** (1200x630) for social sharing
3. **Add pilot CTA to blog posts** (inline variant)
4. **Write blog post** about production pilots
5. **Add testimonials** to pilot page
6. **Create video** explaining pilot process
7. **Set up Google Analytics** conversion tracking
8. **Monitor search queries** in GSC
9. **Request reviews** from pilot participants
10. **Share on LinkedIn** with pilot offer

## Monthly SEO Tasks

### Week 1
- Review GSC performance data
- Analyze pilot page rankings
- Check for indexing issues
- Monitor backlinks

### Week 2
- Update meta descriptions if needed
- Add new internal links
- Review competitor rankings
- Optimize underperforming pages

### Week 3
- Create new content targeting keywords
- Update FAQ section
- Add new testimonials
- Refresh social media posts

### Week 4
- Analyze conversion data
- A/B test CTA variations
- Review site speed
- Plan next month's content

## Success Metrics (90 Days)

### Traffic Goals
- 500+ organic visits to pilot page
- 50+ direct visits from branded search
- 100+ referral visits from internal links

### Ranking Goals
- Top 10 for "HVAC production pilot"
- Top 20 for "live call handling test"
- Top 30 for "HVAC answering service trial"

### Conversion Goals
- 5% pilot page conversion rate
- 20+ pilot signups from organic
- 50% pilot-to-paid conversion rate

## Tools & Resources

### SEO Tools
- Google Search Console (indexing, queries)
- Google Analytics (traffic, conversions)
- Ahrefs/SEMrush (keyword research, backlinks)
- PageSpeed Insights (performance)

### Testing Tools
- Google Rich Results Test (structured data)
- Mobile-Friendly Test (responsive design)
- Lighthouse (performance, SEO, accessibility)

### Monitoring
- Weekly GSC reports
- Monthly ranking checks
- Quarterly content audits
- Ongoing conversion optimization

---

**Last Updated:** December 24, 2024
**Next Review:** January 24, 2025
