# 🌡️ HVAC Voice Agent

A **production-ready AI-powered voice agent** for HVAC service companies. Handles inbound calls via Twilio, schedules appointments, provides HVAC tips, and intelligently routes emergencies.

## ✨ Features

### Core Capabilities
- **📞 Voice Conversations**: Natural turn-based voice calls via Twilio
- **🎙️ Real-time Streaming**: Low-latency streaming via Twilio Media Streams + OpenAI Realtime
- **📅 Appointment Management**: Book, reschedule, and cancel appointments
- **🏢 Multi-Location Support**: Manage multiple service locations
- **🚨 Emergency Detection**: Automatic detection and routing of emergencies
- **💡 HVAC Knowledge Base**: General tips and troubleshooting guidance

### Superior AI Experience
- **🎯 Soft Tone Responses**: Empathetic, calm voice interactions
- **😊 Emotion Detection**: Recognizes frustrated callers and adapts tone
- **🔄 Context Awareness**: Maintains conversation state throughout the call
- **⚡ Smart Date/Time Parsing**: Understands "tomorrow", "next Monday", etc.
- **🛡️ Robust Error Handling**: Graceful recovery from failures

---

## 🏗️ Architecture

```
hvac_agent/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── agents/
│   │   ├── hvac_agent.py    # Main AI agent logic
│   │   ├── state.py         # Call state management
│   │   └── tools.py         # Agent tools (booking, etc.)
│   ├── models/
│   │   └── db_models.py     # SQLAlchemy models
│   ├── routers/
│   │   ├── health.py        # Health check endpoints
│   │   ├── booking.py       # Debug/admin endpoints
│   │   ├── twilio_voice.py  # Turn-based voice handler
│   │   └── twilio_stream.py # Streaming voice handler
│   ├── services/
│   │   ├── db.py            # Database connection
│   │   ├── calendar_service.py  # Appointment logic
│   │   ├── emergency_service.py # Emergency detection
│   │   └── hvac_knowledge.py    # HVAC tips/info
│   └── utils/
│       ├── logging.py       # Structured logging
│       ├── audio.py         # Audio utilities
│       ├── voice_config.py  # Voice/tone settings
│       └── error_handler.py # Error handling
├── .env.example
├── Dockerfile
├── requirements.txt
├── vercel.json
└── modal_app.py
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Twilio account with a phone number
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hvac-voice-agent.git
cd hvac-voice-agent/hvac_agent

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Running Locally

```bash
# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Verify Installation

```bash
# Health check
curl http://localhost:8000/health

# List locations
curl http://localhost:8000/debug/locations

# List appointments
curl http://localhost:8000/debug/appointments
```

---

## 📞 Twilio Setup

### Turn-Based Voice (Recommended for Testing)

1. Start the server and expose it via ngrok:
   ```bash
   ngrok http 8000
   ```

2. In Twilio Console:
   - Go to **Phone Numbers → Manage → Active Numbers**
   - Select your number
   - Under **Voice Configuration → A CALL COMES IN**:
     - Webhook URL: `https://YOUR_NGROK_ID.ngrok.io/twilio/voice`
     - Method: `HTTP POST`

3. Call your Twilio number to test!

### Streaming Voice (Lower Latency)

1. Create a TwiML Bin in Twilio with:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <Response>
       <Say>Connecting you to our assistant.</Say>
       <Connect>
           <Stream url="wss://YOUR_DOMAIN/twilio/stream" />
       </Connect>
   </Response>
   ```

2. Point your Twilio number to the TwiML Bin

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key |
| `HVAC_COMPANY_NAME` | ❌ | KC Comfort Air | Company name in prompts |
| `DATABASE_URL` | ❌ | sqlite:///./hvac_agent.db | Database connection |
| `LOG_LEVEL` | ❌ | INFO | Logging level |
| `OPENAI_MODEL` | ❌ | gpt-4o-mini | OpenAI model |
| `DEBUG` | ❌ | false | Enable debug mode |

---

## 🐳 Deployment

### Docker

```bash
# Build
docker build -t hvac-voice-agent .

# Run
docker run -p 8000:8000 --env-file .env hvac-voice-agent
```

### Vercel

1. Push to GitHub
2. Connect repository in Vercel
3. Add environment variables in Vercel settings
4. Deploy

### Modal

```bash
# Install Modal CLI
pip install modal

# Configure secrets in Modal dashboard
# Deploy
modal deploy modal_app.py
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Basic health check |
| `/health/detailed` | GET | Detailed system status |
| `/twilio/voice` | POST | Twilio voice webhook |
| `/twilio/stream` | WS | Twilio streaming WebSocket |
| `/debug/locations` | GET | List service locations |
| `/debug/appointments` | GET | List appointments |
| `/debug/emergencies` | GET | List emergency logs |
| `/debug/slots/{code}` | GET | Get available slots |

---

## 🚨 Emergency Handling

The agent automatically detects emergencies including:
- **Gas leaks** - Immediate transfer + safety instructions
- **Carbon monoxide** - Immediate transfer + evacuation guidance
- **No heat in extreme cold** - Priority escalation
- **No AC in extreme heat** - Priority escalation
- **Electrical issues** - Safety warnings + transfer

---

## 📋 Pending Configuration & Tech Stack

### Required for Production

- [ ] **Twilio Account**: Sign up at [twilio.com](https://twilio.com)
- [ ] **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)
- [ ] **Production Database**: PostgreSQL recommended (Neon, Supabase, RDS)
- [ ] **Domain & SSL**: Required for Twilio webhooks

### Recommended Enhancements

- [ ] **Redis**: For shared call state across replicas
- [ ] **Sentry**: Error monitoring and alerting
- [ ] **DataDog/NewRelic**: APM and metrics
- [ ] **Twilio Signature Validation**: Verify webhook authenticity
- [ ] **Rate Limiting**: Protect against abuse
- [ ] **Authentication**: Secure debug endpoints

### Optional Integrations

- [ ] **CRM Integration**: Sync customer data (Salesforce, HubSpot)
- [ ] **Calendar Integration**: Google Calendar, Outlook
- [ ] **SMS Notifications**: Appointment confirmations
- [ ] **Analytics Dashboard**: Call metrics and insights
- [ ] **A/B Testing**: Voice prompt optimization

---

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v
```

---

## 📝 License

MIT License - See LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ for HVAC professionals**
