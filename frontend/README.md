# HVAC AI Agent - Frontend

Modern Next.js 14 frontend for HvacAiAgent.frontofai.com

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── calculator/         # ROI Calculator page
│   ├── demo/               # Live Demo page
│   └── globals.css         # Global styles
├── components/
│   ├── Navigation.tsx      # Header navigation
│   ├── Hero.tsx            # Hero section
│   ├── ProblemSection.tsx  # Problem agitation
│   ├── DifferentiatorSection.tsx
│   ├── CustomBuildSection.tsx
│   ├── HowItWorksSection.tsx
│   ├── PricingSection.tsx
│   ├── ROICalculatorSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── FinalCTA.tsx
│   └── Footer.tsx
├── lib/
│   └── api.ts              # API client
└── public/                 # Static assets
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=https://hvacaiagent.frontofai.com
NEXT_PUBLIC_PHONE_NUMBER=(555) 123-4567
```

## Pages

### Homepage (`/`)
- Hero with CTA
- Problem agitation
- Differentiation vs DIY/Agencies
- Custom build features
- How it works timeline
- Pricing (Professional & Premium)
- ROI calculator preview
- Testimonials
- Final CTA

### Calculator (`/calculator`)
- Full ROI calculator
- API integration with backend
- Lead capture form
- Results display
- Session tracking

### Demo (`/demo`)
- Live demo phone number
- Call-to-action focused
- Minimal distractions

## API Integration

The frontend connects to the demand-engine backend API:

```typescript
// Example API call
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const response = await axios.post(`${API_URL}/calculator/submit`, {
  business_type: 'HVAC',
  avg_ticket_value: 2500,
  calls_per_day: 30,
  current_answer_rate: 65,
  email: 'owner@hvaccompany.com'
});
```

## Deployment

### Cloudflare Pages

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
# Connect GitHub repo and set:
# - Build command: npm run build
# - Build output directory: .next
# - Environment variables from .env.example
```

### Custom Domain

Point `hvacaiagent.frontofai.com` to Cloudflare Pages:
1. Add CNAME record: `hvacaiagent` → `your-project.pages.dev`
2. Enable SSL/TLS

## Development

```bash
# Run dev server
npm run dev

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Features

- ✅ Responsive design (mobile-first)
- ✅ Fast page loads (<2s)
- ✅ SEO optimized
- ✅ Analytics ready
- ✅ Accessibility (WCAG 2.1)
- ✅ Performance optimized

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

Proprietary - All rights reserved
