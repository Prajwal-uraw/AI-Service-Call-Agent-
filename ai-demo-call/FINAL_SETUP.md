# 🎬 Automated AI Demo Video Generator - Complete Setup

## ✅ What's Been Built

### 1. **Modern Pulse Avatars**
- **Customer Bot**: Blue gradient pulse avatar with animated rings
- **AI Presenter**: Jarvis-style powerful presence (via Daily DIAL)
- Both have smooth animations and glow effects

### 2. **Recording Download & Save**
- Automatic download from Daily.co
- Local storage in `ai-demo-call/recordings/videos/`
- Metadata saved with each recording
- Progress tracking during download

### 3. **Video Playback System**
- Web interface at `/demo-videos`
- Play videos directly in browser
- Download options (local or Daily.co)
- Beautiful UI with recording list

### 4. **Complete Automation**
- One command: `npm run generate-demo`
- Creates room, starts bots, records, downloads
- Saves locally with metadata
- Automatic cleanup

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd ai-demo-call
npm install
```

Installs:
- `puppeteer` - Browser automation
- `openai` - AI voice generation
- `dotenv` - Environment variables

### Step 2: Generate Demo Video

```bash
npm run generate-demo
```

**What happens:**
1. ✅ Creates Daily.co room
2. ✅ Starts JARVIS (AI Presenter)
3. ✅ Starts Customer Bot with blue pulse avatar
4. ✅ 3-minute AI conversation
5. ✅ Records everything
6. ✅ Downloads video automatically
7. ✅ Saves to `recordings/videos/`
8. ✅ Cleans up room

### Step 3: View Videos

```bash
# Start frontend
cd ../frontend
npm run dev
```

Visit: `http://localhost:3000/demo-videos`

---

## 🎨 Avatar Designs

### Customer Bot (Blue Pulse)
- **Color**: Blue gradient (#00d4ff → #0066ff)
- **Animation**: Pulsing core with ripple rings
- **Effect**: Glowing, modern, tech-forward
- **Label**: "AI" in center

### AI Presenter (JARVIS)
- **Persona**: Confident, powerful, data-driven
- **Voice**: Alloy (authoritative)
- **Style**: Sophisticated AI assistant
- **Delivery**: Power phrases with metrics

---

## 📁 File Structure

```
ai-demo-call/
├── lib/
│   ├── customerBot.ts          # Customer AI with pulse avatar
│   ├── dailyDialBot.ts         # JARVIS presenter
│   └── recordingManager.ts     # Download & save recordings
├── scripts/
│   └── generateAutomatedDemo.ts # Main orchestration
├── recordings/
│   └── videos/                 # Downloaded MP4 files
│       ├── ai-demo-123.mp4
│       └── ai-demo-123.mp4.json # Metadata
└── package.json

frontend/
├── app/
│   ├── demo-videos/
│   │   └── page.tsx            # Video playback UI
│   └── api/
│       └── demo-recordings/
│           ├── route.ts        # List recordings
│           └── [filename]/
│               └── route.ts    # Serve video files
```

---

## 🎭 Demo Conversation Flow

**Duration**: ~3 minutes

```
0:03 - Customer: "Hi there! Thanks for having me today."
0:15 - Customer: "How does your AI handle emergency calls at 2 AM?"
       JARVIS: [Explains 24/7 availability with data]

0:35 - Customer: "Wow, 200 milliseconds? That's incredible!"
       JARVIS: [Power phrase response]

0:55 - Customer: "30% of calls missed? What's causing that?"
       JARVIS: [Data-driven answer]

1:15 - Customer: "It checks calendar in real-time? That's what we need!"
       JARVIS: [Confirms with specifics]

1:35 - Customer: "How long is implementation?"
       JARVIS: [48 hours, no downtime]

1:55 - Customer: "$2 million in recovered revenue?"
       JARVIS: [Results with confidence]

2:55 - Customer: "This could be a game-changer. What are next steps?"
       JARVIS: [Powerful close]
```

---

## 💾 Recording Features

### Automatic Download
- Waits for Daily.co processing
- Shows download progress
- Saves to local directory
- Creates metadata file

### Metadata Saved
```json
{
  "recordingId": "rec_abc123",
  "filename": "ai-demo-1234567890.mp4",
  "duration": 180,
  "startTime": 1703361234,
  "endTime": 1703361414,
  "downloadedAt": "2025-12-23T18:00:00.000Z",
  "downloadLink": "https://daily.co/...",
  "roomName": "demo-1234567890"
}
```

### Video Playback
- Web player at `/demo-videos`
- Grid view of all recordings
- Click to play
- Download buttons (local + Daily.co)
- Duration and date display

---

## 🎯 Output

### What You Get

**Video File**:
- Format: MP4
- Quality: 1080p
- Duration: ~3 minutes
- Size: ~50-100 MB
- Location: `ai-demo-call/recordings/videos/`

**Features**:
- Both AI agents visible
- Blue pulse avatar (customer)
- Clear audio (both voices)
- Professional conversation
- Smooth animations

---

## 💰 Cost Per Video

- Daily.co: $0.20 (2 participants, 3 min)
- OpenAI Customer TTS: $0.50
- OpenAI Presenter GPT-4: $0.50
- **Total: ~$1.20 per video**

**Unlimited regeneration** - Run as many times as needed!

---

## 🔧 Customization

### Change Customer Questions

Edit `ai-demo-call/lib/customerBot.ts`:

```typescript
const demoScript: ConversationStep[] = [
  {
    timing: 15,
    type: 'question',
    text: "Your custom question here",
    emotion: 'curious'
  },
  // Add more...
];
```

### Change Avatar Colors

Edit avatar CSS in `customerBot.ts`:

```typescript
background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
```

### Adjust Timing

Change `timing` values in demo script (seconds from start).

---

## 📊 Console Output

```
🎬 Starting Automated Demo Video Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📹 Step 1: Creating Daily.co room...
✅ Room created: https://kestrel.daily.co/demo-123

🤖 Step 2: Starting AI Presenter (JARVIS)...
✅ JARVIS is ready

🎥 Step 3: Starting recording...
✅ Recording started

⏳ Step 4: Waiting for presenter to join room...
✅ Presenter joined

👤 Step 5: Starting AI Customer...
✅ Customer joined

🎭 Step 6: Running demo conversation...
💬 Customer: "Hi there! Thanks for having me today."
💬 Customer: "How does your AI handle emergency calls..."
...

✅ Demo conversation completed!

💾 Step 12: Downloading and saving video...
📥 Downloading: 100%
✅ Video saved locally: /path/to/ai-demo-123.mp4

🎉 SUCCESS! Demo video generated!

📹 Recording Details:
   Duration: 3 minutes
   Local File: /path/to/ai-demo-123.mp4
   Download Link: https://daily.co/recordings/...
```

---

## 🌐 View Videos

### Web Interface

1. Start frontend: `npm run dev` (in frontend folder)
2. Visit: `http://localhost:3000/demo-videos`
3. See all recordings in grid
4. Click to play
5. Download options available

### Features
- Video player with controls
- Recording list with thumbnails
- Duration and date display
- Download from Daily.co or local
- Responsive design

---

## ✅ Success Checklist

- [x] Recording download implemented
- [x] Local storage with metadata
- [x] Modern pulse avatars (both bots)
- [x] Video playback UI
- [x] API routes for serving videos
- [x] One-command generation
- [x] Automatic cleanup

---

## 🚀 Ready to Use!

**Generate your first demo:**

```bash
cd ai-demo-call
npm install
npm run generate-demo
```

**View your videos:**

```bash
cd ../frontend
npm run dev
# Visit http://localhost:3000/demo-videos
```

**That's it!** Professional AI demo videos on demand. 🎥✨
