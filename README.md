# KestrelVoice AI Service Platform

**Enterprise-grade voice and messaging operations platform for service businesses**

---

## 🚀 Platform Overview

KestrelVoice is a comprehensive AI-powered communication platform that includes:

### **Core Products**
1. **AI Voice Agent** - 24/7 autonomous voice receptionist
2. **AlertStream** - Real-time SMS alert system (NEW)
3. **Click-to-Call** - One-click dialing system
4. **Follow-Up Autopilot** - Automated customer follow-ups
5. **Video Conferencing** - HD video calls with recording

### **Tech Stack**
- **Frontend**: Next.js 15, React 18, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL (Neon + Supabase)
- **Voice**: Twilio, ElevenLabs, OpenAI
- **SMS**: Twilio (AlertStream)
- **Payments**: Stripe
- **Hosting**: Vercel (Frontend), Railway/Render (Backend)

---

## 📦 Repository Structure

```
AI-Service-Call-Agent/
├── frontend/                      # Next.js frontend application
│   ├── app/                       # Next.js 15 app directory
│   │   ├── alertstream/          # AlertStream pages
│   │   ├── admin/                # Admin dashboard
│   │   ├── crm/                  # CRM pages
│   │   └── api/                  # API routes
│   ├── components/               # React components
│   ├── lib/                      # Utilities and API clients
│   └── Private/                  # Private development files
│       ├── alertstream-engine/   # AlertStream backend
│       ├── alertstream-sdk/      # JavaScript SDK
│       ├── alertstream-wordpress/ # WordPress plugin
│       ├── alertstream-browser-extension/ # Browser extension
│       └── alertstream-zapier/   # Zapier integration
├── database/                     # Database migrations
└── docs/                         # Documentation
```

---

## 🔧 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+ (for backend)
- PostgreSQL (Neon or Supabase)
- Twilio account (see [Twilio Setup Guide](./TWILIO_SETUP_GUIDE.md))
- Stripe account
- OpenAI API key
- Resend API key (for emails)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/AI-Service-Call-Agent.git
cd AI-Service-Call-Agent
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Setup

**Frontend** - Copy `.env.local.example` to `.env.local`:

```env
# API URLs
NEXT_PUBLIC_API_URL=https://api.kestrel.ai

# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Stripe
STRIPE_PUBLISHABLE_KEY=...
```

**Backend** - Copy `demand-engine/.env.example` to `demand-engine/.env`:

```env
# Database
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...

# Twilio (Voice + SMS)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
BASE_WEBHOOK_URL=https://api.kestrel.ai

# OpenAI
OPENAI_API_KEY=...

# Resend (Email)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=hello@kestrel.ai
ADMIN_EMAIL=admin@kestrel.ai

# Stripe
STRIPE_SECRET_KEY=...
```

See [`.env.production`](./.env.production) for complete list.

### 4. Run Development Servers

**Frontend** (Port 3000):
```bash
cd frontend
npm run dev
```

**Backend API** (Port 8000):
```bash
cd demand-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn modal_app:app --reload --port 8000
```

**AlertStream Backend** (Port 4000) - Optional:
```bash
cd frontend/Private/alertstream-engine
npm install
node server.js
```

### 5. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Admin Dashboard**: http://localhost:3000/admin
- **Tenant Management**: http://localhost:3000/admin/tenants
- **AI Configuration**: http://localhost:3000/admin/tenants/[id]/ai-config
- **AlertStream Dashboard**: http://localhost:3000/alertstream

---

## 📚 Documentation

### Main Documentation
- **[Admin Guide](./ADMIN_GUIDE.md)** - Complete admin instructions including how to make users admin
- **[Multi-Tenant Setup](./MULTI_TENANT_SETUP_COMPLETE.md)** - Complete tenant management system
- **[Twilio Setup Guide](./TWILIO_SETUP_GUIDE.md)** - Phone number provisioning and configuration
- **[Dependencies](./DEPENDENCIES.md)** - All required dependencies and installation
- **[AlertStream Complete Setup Guide](./ALERTSTREAM_COMPLETE_SETUP_GUIDE.md)** - Comprehensive setup for all components
- **[AlertStream Backend README](./frontend/Private/alertstream-engine/README.md)** - Backend API documentation
- **[Frontend Setup](./frontend/FRONTEND_SETUP.md)** - Frontend configuration guide

### Component Documentation
- **JavaScript SDK**: `frontend/Private/alertstream-sdk/README.md`
- **WordPress Plugin**: `frontend/Private/alertstream-wordpress/readme.txt`
- **Browser Extension**: `frontend/Private/alertstream-browser-extension/README.md`
- **Zapier Integration**: `frontend/Private/alertstream-zapier/README.md`

---

## 🎯 Features

### Voice Operations
- ✅ 24/7 AI voice receptionist
- ✅ Appointment booking
- ✅ Call routing and forwarding
- ✅ Real-time transcription
- ✅ Sentiment analysis
- ✅ Call recording and playback
- ✅ **NEW: AI Agent Configuration UI** - Customize AI behavior per business
- ✅ **NEW: Industry Templates** - Pre-configured for HVAC, Legal, Medical, etc.
- ✅ **NEW: Multi-tenant Support** - Manage multiple customers

### AlertStream (SMS Alerts)
- ✅ Real-time event ingestion
- ✅ Custom trigger rules
- ✅ SMS delivery with Twilio
- ✅ TCPA compliance management
- ✅ Multi-website support
- ✅ Analytics and reporting

### CRM & Pipeline
- ✅ Lead management
- ✅ Contact database
- ✅ Pipeline visualization
- ✅ Activity tracking
- ✅ Follow-up automation

### Admin & Analytics
- ✅ Real-time dashboard
- ✅ Call analytics
- ✅ Performance metrics
- ✅ User management
- ✅ Billing integration
- ✅ **NEW: Tenant Management UI** - Add/edit/activate tenants
- ✅ **NEW: Phone Provisioning UI** - Purchase Twilio numbers with 3 clicks
- ✅ **NEW: Email Notifications** - Automated customer communications
- ✅ **NEW: AI Configuration** - Per-tenant AI customization

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo for automatic deployments
```

### AlertStream Backend
**Option 1: Railway**
```bash
railway login
railway init
railway up
```

**Option 2: Render**
- Connect GitHub repository
- Select `frontend/Private/alertstream-engine`
- Add environment variables
- Deploy

**Option 3: Vercel Serverless**
```bash
cd frontend/Private/alertstream-engine
vercel
```

---

## 🔐 Security

- **Authentication**: JWT tokens + Supabase Auth
- **API Security**: HMAC signatures, rate limiting
- **Data Encryption**: AES-256 for sensitive data
- **SSL/TLS**: All connections encrypted
- **TCPA Compliance**: Built-in consent management
- **SOC 2**: Compliance ready

---

## 📊 Database Schema

### Main Application (Supabase)
- `leads` - Customer leads
- `signals` - Lead signals and scoring
- `meetings` - Scheduled appointments
- `call_logs` - Voice call records
- `appointments` - Appointment details

### AlertStream (Neon)
- `users` - AlertStream users
- `websites` - Registered websites
- `triggers` - Alert rules
- `events` - Event log
- `sms_messages` - SMS delivery tracking
- `tcpa_compliance` - Phone consent records
- `billing_history` - Payment records

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### AlertStream Backend Tests
```bash
cd frontend/Private/alertstream-engine
npm test
npm run test:coverage
```

### Test Coverage
- Unit Tests: 63+ tests
- Integration Tests: 6+ tests
- Target Coverage: 80%+

---

## 📈 Monitoring

### Prometheus Metrics
- HTTP request duration
- SMS delivery rates
- Queue depth
- Error rates
- API performance

### Sentry Error Tracking
- Automatic error capture
- Performance monitoring
- User context tracking
- Breadcrumb logging

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

Proprietary - All rights reserved

---

## 🔗 Links

- **Website**: https://kestrelvoice.com
- **Documentation**: https://docs.kestrelvoice.com
- **Support**: support@kestrelvoice.com
- **Status**: https://status.kestrelvoice.com

---

## 🎯 Roadmap

### Q1 2026
- [x] AlertStream SMS platform
- [x] Multi-tenant support
- [x] TCPA compliance
- [x] **AI Agent Configuration UI**
- [x] **Phone Number Provisioning**
- [x] **Email Notifications**
- [x] **Industry Templates**
- [ ] Mobile app (iOS/Android)
- [ ] WhatsApp integration

### Q2 2026
- [ ] Advanced analytics
- [ ] AI-powered insights
- [ ] Custom integrations marketplace
- [ ] Enterprise SSO

---

## 📞 Support

- **Email**: support@kestrelvoice.com
- **Documentation**: See `/docs` directory
- **Issues**: GitHub Issues
- **Slack**: [Join our community](https://slack.kestrelvoice.com)

---

**Built with ❤️ for service businesses**

*Last Updated: January 1, 2026*
