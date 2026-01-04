# 📦 Complete Dependencies Guide

**All dependencies for Kestrel AI Voice Agent Platform**

---

## 🎯 Overview

This document lists all dependencies required for:
- Frontend (Next.js)
- Backend (Python/FastAPI)
- Database (PostgreSQL)
- External Services (Twilio, OpenAI, etc.)

---

## 🌐 Frontend Dependencies

### **Core Framework**

```json
{
  "next": "^15.1.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.3.3"
}
```

### **UI & Styling**

```json
{
  "tailwindcss": "^3.4.1",
  "@tailwindcss/forms": "^0.5.7",
  "lucide-react": "^0.263.1",
  "framer-motion": "^10.16.16",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

### **State Management & Data Fetching**

```json
{
  "axios": "^1.7.9",
  "swr": "^2.2.4",
  "@tanstack/react-query": "^5.17.19"
}
```

### **Forms & Validation**

```json
{
  "react-hook-form": "^7.49.3",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.4"
}
```

### **Authentication**

```json
{
  "next-auth": "^4.24.5",
  "@supabase/supabase-js": "^2.39.3",
  "@supabase/auth-helpers-nextjs": "^0.8.7"
}
```

### **Charts & Visualization**

```json
{
  "recharts": "^2.10.3",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

### **Utilities**

```json
{
  "date-fns": "^3.0.6",
  "lodash": "^4.17.21",
  "uuid": "^9.0.1",
  "nanoid": "^5.0.4"
}
```

### **Development Tools**

```json
{
  "eslint": "^9.0.0",
  "eslint-config-next": "^15.1.0",
  "prettier": "^3.1.1",
  "@types/node": "^20.10.6",
  "@types/react": "^18.2.46",
  "@types/react-dom": "^18.2.18"
}
```

### **Installation Command**

```bash
cd frontend
npm install next@15.1.0 react@18.3.1 react-dom@18.3.1 typescript@5.3.3
npm install tailwindcss@3.4.1 lucide-react@0.263.1 framer-motion@10.16.16
npm install axios@1.7.9 swr@2.2.4
npm install react-hook-form@7.49.3 zod@3.22.4
npm install next-auth@4.24.5 @supabase/supabase-js@2.39.3
npm install recharts@2.10.3 date-fns@3.0.6
npm install -D eslint@9.0.0 prettier@3.1.1 @types/node@20.10.6
```

---

## 🐍 Backend Dependencies (Python)

### **Core Framework**

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0
```

### **Database**

```txt
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1
asyncpg==0.29.0
```

### **Twilio & Communications**

```txt
twilio==8.12.0
```

### **OpenAI & AI**

```txt
openai==1.10.0
anthropic==0.8.1
```

### **Email**

```txt
resend==0.7.0
sendgrid==6.11.0
```

### **Authentication & Security**

```txt
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
bcrypt==4.1.2
```

### **HTTP & API**

```txt
httpx==0.26.0
requests==2.31.0
aiohttp==3.9.1
```

### **Utilities**

```txt
python-dateutil==2.8.2
pytz==2023.3
phonenumbers==8.13.27
```

### **Testing**

```txt
pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
httpx==0.26.0
```

### **Monitoring**

```txt
sentry-sdk[fastapi]==1.40.0
prometheus-client==0.19.0
```

### **Installation Command**

```bash
cd demand-engine
pip install -r requirements.txt
```

### **requirements.txt**

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1
asyncpg==0.29.0
twilio==8.12.0
openai==1.10.0
resend==0.7.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
bcrypt==4.1.2
httpx==0.26.0
requests==2.31.0
aiohttp==3.9.1
python-dateutil==2.8.2
pytz==2023.3
phonenumbers==8.13.27
pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
sentry-sdk[fastapi]==1.40.0
prometheus-client==0.19.0
```

---

## 🗄️ Database Requirements

### **PostgreSQL**

- **Version**: 14.0 or higher
- **Extensions Required**:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  CREATE EXTENSION IF NOT EXISTS "pg_trgm";
  ```

### **Supabase** (Recommended)

- Includes PostgreSQL 15
- Built-in auth and storage
- Real-time subscriptions
- Row-level security

### **Connection String Format**

```
postgresql://user:password@host:5432/database?sslmode=require
```

---

## 🔌 External Services & API Keys

### **Required Services**

1. **Twilio** (Voice & SMS)
   - Account SID
   - Auth Token
   - Phone numbers

2. **OpenAI** (AI Voice Agent)
   - API Key
   - Organization ID (optional)

3. **Resend** (Email Notifications)
   - API Key
   - Verified domain

4. **Supabase** (Database & Auth)
   - Project URL
   - Anon Key
   - Service Role Key

### **Optional Services**

5. **Stripe** (Billing)
   - Secret Key
   - Publishable Key
   - Webhook Secret

6. **Sentry** (Error Tracking)
   - DSN

7. **Google Calendar** (Appointments)
   - Client ID
   - Client Secret

8. **HubSpot/Salesforce** (CRM)
   - API Key

---

## 🛠️ Development Tools

### **Required**

- **Node.js**: 18.x or higher
- **Python**: 3.10 or higher
- **npm**: 9.x or higher
- **pip**: 23.x or higher
- **Git**: 2.x or higher

### **Recommended**

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Python
  - Tailwind CSS IntelliSense
  
- **Database Tools**:
  - pgAdmin 4
  - DBeaver
  - Supabase Studio

- **API Testing**:
  - Postman
  - Insomnia
  - Thunder Client (VS Code)

---

## 📋 Installation Checklist

### **Frontend Setup**

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Clone repository
- [ ] `cd frontend`
- [ ] `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in environment variables
- [ ] `npm run dev`
- [ ] Verify at http://localhost:3000

### **Backend Setup**

- [ ] Python 3.10+ installed
- [ ] pip 23+ installed
- [ ] Clone repository
- [ ] `cd demand-engine`
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate: `source venv/bin/activate` (Unix) or `venv\Scripts\activate` (Windows)
- [ ] `pip install -r requirements.txt`
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in environment variables
- [ ] Run migrations: `alembic upgrade head`
- [ ] `uvicorn modal_app:app --reload --port 8000`
- [ ] Verify at http://localhost:8000/docs

### **Database Setup**

- [ ] PostgreSQL 14+ or Supabase account
- [ ] Create database
- [ ] Run migrations from `database/migrations/`
- [ ] Verify tables created
- [ ] Create first admin user
- [ ] Test connection

### **External Services**

- [ ] Twilio account created
- [ ] Twilio credentials in `.env`
- [ ] OpenAI API key obtained
- [ ] OpenAI key in `.env`
- [ ] Resend account created
- [ ] Resend key in `.env`
- [ ] Supabase project created
- [ ] Supabase credentials in `.env`

---

## 🔄 Dependency Updates

### **Check for Updates**

```bash
# Frontend
cd frontend
npm outdated

# Backend
cd demand-engine
pip list --outdated
```

### **Update Dependencies**

```bash
# Frontend - Update all
cd frontend
npm update

# Frontend - Update specific package
npm install next@latest

# Backend - Update all
cd demand-engine
pip install --upgrade -r requirements.txt

# Backend - Update specific package
pip install --upgrade openai
```

### **Security Audits**

```bash
# Frontend
npm audit
npm audit fix

# Backend
pip-audit
safety check
```

---

## 🐛 Common Dependency Issues

### **Issue: Module not found**

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
pip install --force-reinstall -r requirements.txt
```

### **Issue: Version conflicts**

```bash
# Frontend - Use exact versions
npm install package@1.2.3 --save-exact

# Backend - Use constraints
pip install 'package>=1.2,<2.0'
```

### **Issue: Build errors**

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
```

---

## 📊 Dependency Size Analysis

### **Frontend Bundle Size**

```bash
cd frontend
npm run build
npm run analyze  # If configured
```

**Target Sizes**:
- First Load JS: < 200 KB
- Total Bundle: < 1 MB

### **Backend Package Size**

```bash
cd demand-engine
pip list --format=columns
```

**Total Size**: ~500 MB (with all dependencies)

---

## 🔒 Security Considerations

### **Keep Updated**

- Check for security updates weekly
- Subscribe to security advisories
- Use Dependabot or Renovate

### **Audit Regularly**

```bash
# Frontend
npm audit

# Backend
pip-audit
safety check --json
```

### **Pin Versions in Production**

```json
{
  "dependencies": {
    "next": "15.1.0",  // Exact version
    "react": "^18.3.1"  // Allow patches
  }
}
```

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Twilio Docs**: https://www.twilio.com/docs
- **OpenAI Docs**: https://platform.openai.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## ✅ Verification Commands

### **Frontend Health Check**

```bash
cd frontend
npm run build
npm run lint
npm test
```

### **Backend Health Check**

```bash
cd demand-engine
pytest
python -c "import fastapi, twilio, openai; print('All imports OK')"
```

### **Full System Check**

```bash
# Check Node.js
node --version  # Should be 18+

# Check Python
python --version  # Should be 3.10+

# Check npm
npm --version  # Should be 9+

# Check pip
pip --version  # Should be 23+

# Check PostgreSQL
psql --version  # Should be 14+

# Check Git
git --version  # Should be 2+
```

---

**Last Updated**: January 1, 2026  
**Maintained by**: Kestrel AI Engineering Team
