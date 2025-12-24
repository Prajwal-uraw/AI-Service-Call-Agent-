# How to Join Demo as Observer

## 🎬 Overview
You can join the AI demo as a **muted observer** to watch the two AI agents (Sarah and JARVIS) demonstrate the product in real-time.

---

## 📍 Where Videos Are Saved

### Local Storage:
```
ai-demo-call/recordings/videos/
├── ai-demo-[timestamp].mp4          # Video file
└── ai-demo-[timestamp].mp4.json     # Metadata
```

### Access Videos:
1. **Locally**: Check `ai-demo-call/recordings/videos/` folder
2. **Web Interface**: Visit `http://localhost:3000/demo-videos` (after running `npm run dev` in frontend)
3. **Daily.co Dashboard**: https://dashboard.daily.co/recordings

---

## 👤 How to Join as Observer

### Step 1: Run the Demo Generator
```bash
cd ai-demo-call
npm run generate-demo
```

### Step 2: Watch for the Room URL
The script will display:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 JOIN AS OBSERVER (KC - Founder)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Room URL: https://kestrel.daily.co/demo-123456

📋 Instructions:
   1. Open the URL above in your browser
   2. Enter name: "KC - Founder"
   3. Join with camera/mic OFF (you'll be muted)
   4. Watch the AI agents demonstrate the product
   5. Demo will start in 15 seconds...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Join the Room
1. **Copy the room URL** from the console
2. **Open in browser** (Chrome recommended)
3. **Enter your name**: "KC - Founder"
4. **Turn OFF camera and microphone** before joining
5. **Click "Join meeting"**

### Step 4: Watch the Demo
- You'll see the two AI agents (Sarah with blue pulse avatar, JARVIS)
- They'll have a natural conversation demonstrating the product
- Duration: ~3:45 minutes
- You're muted - just observe

---

## 🎭 What You'll See

### Participants:
1. **Sarah (AI Customer)** - Blue pulse avatar, asks questions
2. **JARVIS (AI Presenter)** - Confident presenter, answers with data
3. **You (KC - Founder)** - Muted observer

### Demo Flow:
- **0:00-0:40**: Meta reveal - Both AI reveal they're AI
- **0:40-1:30**: The problem - 30% missed calls, 90% after-hours
- **1:30-2:30**: Competitive edge - 200ms response time
- **2:30-3:00**: Booking capability - Real-time calendar
- **3:00-3:30**: Real results - $18K in month one
- **3:30-3:45**: Meta close - "We are the demo"

---

## 📹 Recording Details

### Automatic Recording:
- ✅ Starts automatically when demo begins
- ✅ Captures all participants (including you as observer)
- ✅ Records full audio and video
- ✅ Processes after demo ends (~60 seconds)
- ✅ Downloads to local storage
- ✅ Saves metadata (duration, timestamps, etc.)

### File Location:
```
ai-demo-call/recordings/videos/ai-demo-[timestamp].mp4
```

### Metadata Saved:
```json
{
  "recordingId": "rec_abc123",
  "filename": "ai-demo-1234567890.mp4",
  "duration": 225,
  "startTime": 1703361234,
  "endTime": 1703361459,
  "downloadedAt": "2025-12-24T00:45:00.000Z",
  "downloadLink": "https://daily.co/recordings/...",
  "roomName": "demo-1234567890"
}
```

---

## 🌐 View Recordings Later

### Option 1: Local Folder
```bash
# Navigate to recordings folder
cd ai-demo-call/recordings/videos

# List all recordings
ls
```

### Option 2: Web Interface
```bash
# Start frontend
cd frontend
npm run dev

# Visit in browser
http://localhost:3000/demo-videos
```

**Features:**
- Play videos in browser
- Download local copies
- See all recordings with metadata
- Duration and date display

### Option 3: Daily.co Dashboard
1. Visit: https://dashboard.daily.co
2. Go to "Recordings" section
3. Find your demo recording
4. Download or share

---

## ⚡ Quick Tips

### Before Joining:
- ✅ Have browser ready (Chrome recommended)
- ✅ Be ready to copy/paste URL quickly
- ✅ You have 15 seconds to join before demo starts

### During Demo:
- ✅ Keep camera/mic OFF (you're muted)
- ✅ Just observe - don't interact
- ✅ Watch the AI agents demonstrate naturally
- ✅ Notice the response speed and conversation flow

### After Demo:
- ✅ Wait for recording to process (~60 seconds)
- ✅ Video downloads automatically
- ✅ Check `recordings/videos/` folder
- ✅ Or view at `http://localhost:3000/demo-videos`

---

## 🔧 Troubleshooting

### Can't join room?
- Check URL is copied correctly
- Try incognito/private browsing mode
- Clear browser cache
- Use Chrome browser

### Audio not working?
- You're muted by design (observer mode)
- AI agents will have audio
- Check browser audio permissions

### Video not saving?
- Check `recordings/videos/` folder exists
- Verify disk space available
- Wait full 60 seconds for processing
- Check Daily.co dashboard as backup

### Demo not starting?
- Wait for "Demo will start in 15 seconds" message
- Make sure you joined within 15 seconds
- AI bots need time to initialize (~8 seconds)

---

## 📊 Summary

**To join and watch:**
1. Run: `npm run generate-demo`
2. Copy room URL from console
3. Open in browser
4. Join as "KC - Founder" (muted)
5. Watch 3:45 min demo
6. Recording saves automatically

**To view later:**
- Local: `ai-demo-call/recordings/videos/`
- Web: `http://localhost:3000/demo-videos`
- Cloud: Daily.co dashboard

**You're all set to watch the AI agents demonstrate the product live!** 🚀
