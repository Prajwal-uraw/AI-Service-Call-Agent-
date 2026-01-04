# AlertStream Backend Engine

**Real-time SMS Alert System for Website Events**

AlertStream is a production-ready backend service that monitors website events and sends instant SMS notifications based on custom triggers. Built for reliability, scalability, and compliance.

---

## 🚀 Features

- **Real-time Event Ingestion** - Process website events instantly
- **Custom Trigger Rules** - Flexible condition matching with templates
- **SMS Delivery** - Twilio integration with delivery tracking
- **TCPA Compliance** - Built-in consent management
- **Multi-tenant** - Support multiple websites per user
- **API-First** - RESTful API with authentication
- **Monitoring** - Prometheus metrics + Sentry error tracking
- **Queue Management** - Bull queue with Redis for reliability
- **Database** - PostgreSQL with Neon (production-ready)

---

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** (Neon recommended)
- **Redis** (optional, for queue management)
- **Twilio Account** (for SMS)
- **Stripe Account** (for billing)

---

## 🔧 Installation

### 1. Clone & Install
```bash
cd frontend/Private/alertstream-engine
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Twilio SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
HMAC_SECRET=your-hmac-secret-for-webhooks
ENCRYPTION_KEY=32-character-encryption-key-here

# Stripe Billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=4000
NODE_ENV=production

# Optional: Monitoring
SENTRY_DSN=https://...@sentry.io/...
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Database Migration
```bash
# Run migrations
npm run migrate:sql

# Or manually with psql
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_add_indexes.sql

# Verify connection
node test-db-connection.js
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:4000`

---

## 📊 Database Schema

### Tables Created
- `users` - User accounts with SMS quotas
- `websites` - Registered websites with API keys
- `triggers` - Alert rules with conditions
- `events` - Incoming event log
- `sms_messages` - SMS delivery tracking
- `tcpa_compliance` - Phone consent records
- `compliance_logs` - Audit trail
- `billing_history` - Payment records
- `support_tickets` - Customer support

### Indexes
47 performance indexes for optimal query speed

---

## 🔌 API Endpoints

### Authentication
```bash
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Websites
```bash
GET    /api/v1/websites
POST   /api/v1/websites
GET    /api/v1/websites/:id
DELETE /api/v1/websites/:id
```

### Triggers
```bash
GET    /api/v1/triggers
POST   /api/v1/triggers
GET    /api/v1/triggers/:id
PUT    /api/v1/triggers/:id
DELETE /api/v1/triggers/:id
```

### Event Ingestion
```bash
POST /api/v1/ingest
```

Example:
```bash
curl -X POST http://localhost:4000/api/v1/ingest \
  -H "X-API-Key: your-api-key" \
  -H "X-Signature: hmac-signature" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "form_submit",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "value": 1500
    }
  }'
```

### Health Checks
```bash
GET /health          # Full health check
GET /health/live     # Liveness probe
GET /health/ready    # Readiness probe
```

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

### Test Suite
- **63+ Unit Tests** - Models, services, utilities
- **6 Integration Tests** - API endpoints
- **Coverage Target** - 80%+

---

## 📈 Monitoring

### Prometheus Metrics
Available at `GET /metrics`

Metrics tracked:
- HTTP request duration
- SMS sent/delivered
- Queue depth
- API errors
- Trigger matches

### Sentry Error Tracking
Automatic error capture with:
- Stack traces
- User context
- Performance monitoring
- Breadcrumb logging

---

## 🔒 Security

- **HMAC Signatures** - Verify webhook authenticity
- **API Key Authentication** - Per-website keys
- **JWT Tokens** - User session management
- **Rate Limiting** - Prevent abuse
- **SSL/TLS** - Encrypted connections
- **TCPA Compliance** - Consent management

---

## 🚀 Deployment

### Recommended Platforms
- **Railway** - Easy deployment with PostgreSQL
- **Render** - Free tier available
- **Vercel** - Serverless functions
- **AWS ECS** - Full control

### Environment Variables Checklist
- [ ] DATABASE_URL (Neon PostgreSQL)
- [ ] TWILIO credentials
- [ ] STRIPE keys
- [ ] JWT_SECRET (32+ chars)
- [ ] HMAC_SECRET
- [ ] ENCRYPTION_KEY (exactly 32 chars)
- [ ] SENTRY_DSN (optional)
- [ ] REDIS_HOST (optional)

### Deployment Steps
1. Set environment variables
2. Run database migrations
3. Deploy application
4. Verify health endpoint
5. Test SMS delivery
6. Monitor logs

---

## 📚 Documentation

- **API Docs** - Available at `/api-docs` (Swagger)
- **Testing Guide** - See `TESTING_GUIDE.md`
- **Migration Guide** - See `MIGRATION_INSTRUCTIONS.md`
- **Production Guide** - See `PRODUCTION_READINESS_GUIDE.md`

---

## 🛠️ Architecture

```
┌─────────────────────────────────────┐
│  Client Websites                    │
│  (JavaScript SDK)                   │
└─────────────┬───────────────────────┘
              │ HTTPS + HMAC
              ↓
┌─────────────────────────────────────┐
│  AlertStream API (Express)          │
│  - Authentication                   │
│  - Event Ingestion                  │
│  - Trigger Matching                 │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴─────────┐
    ↓                   ↓
┌──────────┐      ┌──────────┐
│ Database │      │  Queue   │
│ (Neon)   │      │ (Redis)  │
└──────────┘      └─────┬────┘
                        │
                        ↓
                  ┌──────────┐
                  │  Twilio  │
                  │   SMS    │
                  └──────────┘
```

---

## 🤝 Support

- **Issues** - GitHub Issues
- **Email** - support@alertstream.io
- **Docs** - https://docs.alertstream.io

---

## 📄 License

MIT License - See LICENSE file

---

## 🔗 Related Packages

- **JavaScript SDK** - `frontend/Private/alertstream-sdk/`
- **WordPress Plugin** - `frontend/Private/alertstream-wordpress/`
- **Browser Extension** - `frontend/Private/alertstream-browser-extension/`
- **Zapier Integration** - `frontend/Private/alertstream-zapier/`

---

**Built with ❤️ for reliable real-time notifications**
