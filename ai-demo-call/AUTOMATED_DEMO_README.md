# Automated AI Demo Video Generator

## 🎬 What This Does

Creates a **professional demo video** automatically with:
- ✅ **AI Customer** (Sarah Chen) - Human-like, low-latency responses
- ✅ **AI Presenter** (JARVIS) - Powerful, confident, data-driven
- ✅ **Smooth conversation flow** - Exciting, natural pacing
- ✅ **Professional avatars** - Generic Teams/Zoom style for customer, Jarvis-style for presenter
- ✅ **Automatic recording** - Downloads video when complete

**One command. 3 minutes. Professional demo video.**

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-demo-call
npm install
```

This installs:
- `puppeteer` - Browser automation for customer bot
- `openai` - AI voice generation
- `dotenv` - Environment variables

### 2. Verify API Keys

Your API keys should already be in `frontend/.env.local`:
```bash
DAILY_API_KEY=your_daily_key
OPENAI_API_KEY=your_openai_key
```

### 3. Generate Demo Video

```bash
npm run generate-demo
```

**That's it!** The script will:
1. Create Daily.co room
2. Start JARVIS (AI Presenter)
3. Start Sarah Chen (AI Customer)
4. Run 3-minute conversation
5. Record everything
6. Download video
7. Clean up

---

## 🎭 What Happens During Demo

### Conversation Flow (3 minutes)

**0:03** - Customer joins and greets
```
Sarah: "Hi there! Thanks for having me today."
```

**0:15** - First question (curious)
```
Sarah: "So I'm curious - how exactly does your AI handle 
those emergency calls that come in at 2 AM?"
JARVIS: [Explains with data and confidence]
```

**0:35** - Impressed reaction
```
Sarah: "Wow, 200 milliseconds? That's incredible! Most 
systems I've seen are like 2-3 seconds."
JARVIS: [Responds with power phrases]
```

**0:55** - Thoughtful question
```
Sarah: "You mentioned 30% of calls are missed during 
business hours. That seems huge - what's causing that?"
JARVIS: [Data-driven answer]
```

**1:15** - Excited about booking feature
```
Sarah: "Hold on - it checks the calendar in real-time 
and books the slot? That's exactly what we need!"
JARVIS: [Confirms with specifics]
```

**1:35** - Implementation question
```
Sarah: "How long does implementation typically take? 
We're pretty busy and can't have downtime."
JARVIS: [48 hours, no downtime]
```

**1:55** - Revenue reaction
```
Sarah: "48 hours? That's way faster than I expected. 
And you mentioned something about $2 million in recovered revenue?"
JARVIS: [Closes with results]
```

**2:55** - Ready to move forward
```
Sarah: "This is really impressive. I think this could 
be a game-changer for us. What are the next steps?"
JARVIS: [Powerful close]
```

---

## 🎨 Visual Design

### Customer Avatar (Sarah Chen)
- **Style**: Generic Teams/Zoom "no picture" look
- **Design**: Initials "SC" in purple gradient circle
- **Feel**: Professional, approachable

### AI Presenter (JARVIS)
- **Style**: Powerful, innovative Jarvis-style
- **Design**: Animated rings, glowing effects
- **Feel**: Advanced, confident, impressive

---

## 💡 Key Features

### Low-Latency AI Customer
- Uses `tts-1` model (faster than `tts-1-hd`)
- Natural pauses and reactions
- Human-like conversation flow
- Different voice from presenter (Nova vs Alloy)

### Powerful AI Presenter (JARVIS)
- Confident, data-driven responses
- Power phrases: "Here's what's fascinating..."
- Specific metrics: "200 milliseconds", "$2M recovered"
- Impressive but not arrogant

### Smooth Flow
- Timed questions at natural intervals
- Emotional variety (curious, impressed, excited, thoughtful)
- Natural pauses between exchanges
- Building excitement throughout

---

## 📊 Output

### What You Get

**Video File**:
- **Duration**: ~3 minutes
- **Format**: MP4
- **Quality**: 1080p
- **Audio**: Crystal clear AI voices
- **Size**: ~50-100 MB

**Download Link**:
```
https://www.daily.co/recordings/[recording-id]/download
```

The script will print the download link when complete.

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

### Change Presenter Style

Edit `ai-demo-call/lib/dailyDialBot.ts`:

```typescript
const systemPrompt = `You are JARVIS...
[Customize personality here]
`;
```

### Adjust Timing

Change `timing` values in demo script (in seconds from start).

---

## 💰 Cost Per Video

- **Daily.co**: $0.20 (2 participants, 3 minutes)
- **OpenAI TTS (Customer)**: $0.50
- **OpenAI GPT-4 (Presenter)**: $0.50
- **Total**: ~$1.20 per video

**Unlimited regeneration** - Run as many times as you want!

---

## 🐛 Troubleshooting

### "Missing API keys"
- Check `frontend/.env.local` has both keys
- Keys should not have quotes

### "Puppeteer failed to launch"
- Install Chrome/Chromium
- Or run: `npm install puppeteer --force`

### "Recording not ready"
- Wait longer (processing takes ~60 seconds)
- Check Daily.co dashboard for status

### "Customer bot didn't join"
- Check Daily.co room URL is valid
- Verify browser launched (you should see it)
- Check console for errors

---

## 📝 Script Output Example

```
🎬 Starting Automated Demo Video Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📹 Step 1: Creating Daily.co room...
✅ Room created: https://kestrel.daily.co/demo-123456

🤖 Step 2: Starting AI Presenter (JARVIS)...
✅ JARVIS is ready (Bot ID: abc123)

🎥 Step 3: Starting recording...
✅ Recording started (ID: rec_123)

⏳ Step 4: Waiting for presenter to join room...
✅ Presenter joined

👤 Step 5: Starting AI Customer (Sarah Chen)...
✅ Customer joined

🎭 Step 6: Running demo conversation...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 DEMO IN PROGRESS - This will take ~3 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Customer: "Hi there! Thanks for having me today."
💬 Customer: "So I'm curious - how exactly does your AI..."
💬 Customer: "Wow, 200 milliseconds? That's incredible!"
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Demo conversation completed!

⏳ Step 7: Wrapping up...
👋 Step 8: Customer leaving room...
✅ Customer left

⏳ Step 9: Finalizing recording...
🛑 Step 10: Stopping recording...
✅ Recording stopped

⏳ Step 11: Processing video (this takes ~60 seconds)...
📥 Step 12: Retrieving recording...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SUCCESS! Demo video generated!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📹 Recording Details:
   Status: finished
   Duration: 3 minutes
   Download: https://www.daily.co/recordings/rec_123/download

🧹 Step 13: Cleaning up...
✅ Room deleted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All done! Your demo video is ready.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 Download your video:
   https://www.daily.co/recordings/rec_123/download
```

---

## 🎯 Next Steps

1. **Run the script**: `npm run generate-demo`
2. **Download video**: Use the link provided
3. **Review**: Watch the demo
4. **Tweak**: Adjust questions/timing if needed
5. **Regenerate**: Run again for perfect version
6. **Use**: Add to website, send to prospects

---

## ✅ Success Criteria

You'll know it worked when:
- ✅ Browser window opens (customer bot)
- ✅ You see Daily.co room interface
- ✅ Console shows conversation happening
- ✅ Script completes without errors
- ✅ Download link is provided
- ✅ Video plays with both AI voices

---

**Ready to generate your demo video? Run `npm run generate-demo`!** 🚀
