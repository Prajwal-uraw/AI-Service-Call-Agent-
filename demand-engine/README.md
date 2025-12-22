# Demand Capture Engine

**Separate system for lead generation and qualification - runs independently from HVAC Agent**

## Architecture

- **Scrapers**: Run on Modal.com (serverless, scalable)
- **Database**: Supabase (PostgreSQL)
- **Orchestration**: n8n workflows
- **Classification**: OpenAI GPT-4-mini with keyword pre-filtering
- **Storage**: Cloudflare R2 for PDFs and assets

## Directory Structure

```
demand-engine/
├── scrapers/           # Modal-based scraping functions
│   ├── reddit.py      # Reddit API scraper (compliant)
│   ├── permits.py     # Building permit scrapers
│   ├── licensing.py   # State licensing board scrapers
│   └── jobboards.py   # Job board scrapers
├── classifiers/        # Signal scoring and classification
│   ├── scorer.py      # Hybrid keyword + AI scoring
│   └── keywords.py    # Keyword definitions
├── database/          # Database schemas and migrations
│   ├── schema.sql     # Full database schema
│   └── migrations/    # SQL migration files
├── api/               # FastAPI backend
│   ├── main.py
│   ├── routers/
│   └── models/
├── frontend/          # Calculator and landing pages
│   ├── calculator/
│   └── components/
├── workflows/         # n8n workflow exports
├── config/            # Configuration files
│   ├── modal_config.py
│   └── supabase_config.py
├── tests/
├── requirements.txt
└── .env.example
```

## Phase 1 Goals

1. **Infrastructure**: Supabase + Modal setup
2. **Reddit Scraper**: Compliant API-based scraping
3. **Classification**: Keyword + AI hybrid scoring
4. **Alerts**: Daily digest emails

## IP Rotation Strategy

**Decision**: No IP rotation for Phase 1
- Reddit API: Official API (no rotation needed)
- State licensing boards: Public data, rate-limited requests
- Building permits: Municipal APIs where available

**Facebook scraping**: REMOVED (ToS violation risk)

## Running Scrapers

Scrapers run on-demand via Modal, not on schedule initially:

```bash
# Test Reddit scraper
modal run scrapers.reddit::scrape_subreddit --subreddit HVAC --limit 10

# Run classification
modal run classifiers.scorer::score_batch --batch-size 50
```

## Environment Variables

See `.env.example` for required keys:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `SENDGRID_API_KEY`

## Cost Estimates

**Phase 1 (Manual runs)**:
- Modal: $0 (free tier sufficient)
- Supabase: $0 (free tier)
- OpenAI: ~$5-10/month (keyword pre-filtering reduces calls)
- SendGrid: $0 (free tier)

**Total Phase 1**: ~$5-10/month
