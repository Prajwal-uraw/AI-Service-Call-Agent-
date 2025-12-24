# AI Customer Agent - Automated Demo Video Creation

## 🎯 Goal
Create an AI agent that acts as a customer to:
1. Book a demo call
2. Join the Daily.co room
3. Interact with our AI presenter
4. Ask relevant questions
5. Generate a complete demo recording

## ✅ Feasibility Analysis

### Is This Possible?
**YES! 100% Feasible**

### Why It Works:
1. ✅ **Daily.co supports multiple bots** in same room
2. ✅ **OpenAI Realtime API** can power customer bot
3. ✅ **Daily.co DIAL** already powers presenter bot
4. ✅ **Recording captures both** AI agents
5. ✅ **Fully automated** - no human needed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         Automated Demo Generator            │
└─────────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
┌───────────────┐       ┌───────────────┐
│  AI Customer  │       │ AI Presenter  │
│     Bot       │  ←→   │     Bot       │
│  (Puppeteer)  │       │ (Daily DIAL)  │
└───────────────┘       └───────────────┘
        ↓                       ↓
        └───────────┬───────────┘
                    ↓
        ┌───────────────────────┐
        │   Daily.co Room       │
        │   (Recording)         │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   Demo Video File     │
        └───────────────────────┘
```

---

## 🤖 Two Approaches

### Approach 1: Puppeteer Customer Bot ⭐ RECOMMENDED
**What**: Browser automation that joins as customer

**Pros**:
- ✅ Full control over customer behavior
- ✅ Can script exact questions
- ✅ Looks like real customer
- ✅ Can share video/audio
- ✅ Easier to debug

**Cons**:
- Requires browser automation
- Slightly more complex setup

---

### Approach 2: Second Daily DIAL Bot
**What**: Another DIAL bot configured as customer

**Pros**:
- ✅ Simpler API calls
- ✅ No browser needed
- ✅ Uses same infrastructure

**Cons**:
- Less control over exact flow
- Both bots need coordination
- May sound too robotic

---

## 🎬 Recommended Implementation

### Use Puppeteer Customer Bot + Daily DIAL Presenter

**Why?**
1. **More realistic** - Customer bot can have pauses, reactions
2. **Better control** - Script exact questions and timing
3. **Visual presence** - Can show customer "video" (avatar)
4. **Proven tech** - Puppeteer + Daily.co works well

---

## 📝 Implementation Steps

### Phase 1: Create Customer Bot Script

```typescript
// Customer bot behavior script
const customerScript = [
  {
    timing: 'on_join',
    action: 'greet',
    text: 'Hi! Thanks for having me.'
  },
  {
    timing: 'after_intro',
    action: 'ask_question',
    text: 'How does your AI handle emergency calls?'
  },
  {
    timing: 'after_problem_slide',
    action: 'react',
    text: 'Wow, 30% of calls missed? That\'s huge!'
  },
  {
    timing: 'after_solution_slide',
    action: 'ask_question',
    text: 'What\'s the response time compared to competitors?'
  },
  {
    timing: 'after_pricing',
    action: 'ask_question',
    text: 'How long does implementation take?'
  },
  {
    timing: 'end',
    action: 'close',
    text: 'This looks great! I\'d like to move forward.'
  }
];
```

### Phase 2: Build Customer Bot

```typescript
// ai-demo-call/lib/customerBot.ts
import puppeteer from 'puppeteer';
import { OpenAI } from 'openai';

export class CustomerBot {
  private browser: any;
  private page: any;
  private openai: OpenAI;
  
  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  async joinRoom(roomUrl: string) {
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ]
    });

    this.page = await this.browser.newPage();
    
    // Join Daily room
    await this.page.goto(roomUrl);
    
    // Wait for room to load
    await this.page.waitForSelector('[data-testid="join-button"]');
    await this.page.click('[data-testid="join-button"]');
  }

  async speak(text: string) {
    // Generate audio using OpenAI TTS
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'nova', // Different voice from presenter
      input: text,
      speed: 1.0,
    });

    // Play audio in browser
    const buffer = Buffer.from(await mp3.arrayBuffer());
    // Inject audio into page
  }

  async followScript(script: any[]) {
    for (const step of script) {
      // Wait for appropriate timing
      await this.waitForTiming(step.timing);
      
      // Execute action
      if (step.action === 'ask_question') {
        await this.speak(step.text);
      } else if (step.action === 'react') {
        await this.speak(step.text);
      }
      
      // Wait for presenter response
      await this.waitForPresenterResponse();
    }
  }

  async leaveRoom() {
    await this.browser.close();
  }
}
```

### Phase 3: Orchestration Script

```typescript
// ai-demo-call/scripts/generateAutomatedDemo.ts
import { DailyDialBot } from '../lib/dailyDialBot';
import { CustomerBot } from '../lib/customerBot';

async function generateAutomatedDemo() {
  console.log('🎬 Starting automated demo generation...');

  // 1. Create Daily room
  const dialBot = new DailyDialBot({
    dailyApiKey: process.env.DAILY_API_KEY!,
    openaiApiKey: process.env.OPENAI_API_KEY!,
  });

  const room = await dialBot.createDemoRoom('automated-demo');
  console.log('✅ Room created:', room.roomUrl);

  // 2. Start AI presenter bot
  const dialBotId = await dialBot.startDialBot({
    roomUrl: room.roomUrl,
    customerName: 'Demo Customer',
  });
  console.log('✅ Presenter bot started');

  // 3. Start recording
  const recordingId = await dialBot.startRecording(room.roomName);
  console.log('✅ Recording started');

  // 4. Wait for presenter to join
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 5. Start customer bot
  const customerBot = new CustomerBot(process.env.OPENAI_API_KEY!);
  await customerBot.joinRoom(room.roomUrl);
  console.log('✅ Customer bot joined');

  // 6. Run demo script
  await customerBot.followScript(customerScript);
  console.log('✅ Demo completed');

  // 7. Leave and cleanup
  await customerBot.leaveRoom();
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // 8. Stop recording
  await dialBot.stopRecording(recordingId);
  console.log('✅ Recording stopped');

  // 9. Wait for processing
  console.log('⏳ Waiting for recording to process...');
  await new Promise(resolve => setTimeout(resolve, 60000));

  // 10. Download recording
  const recording = await dialBot.getRecording(recordingId);
  console.log('✅ Recording ready:', recording.download_link);

  // 11. Cleanup
  await dialBot.deleteRoom(room.roomName);
  console.log('✅ Room deleted');

  return recording.download_link;
}
```

---

## 🎯 Simpler Alternative: Pre-Scripted Demo

### If Puppeteer is too complex:

**Option**: Use Daily DIAL for both bots with pre-scripted conversation

```typescript
// Create two DIAL bots with coordinated scripts
const presenterBot = await dialBot.startDialBot({
  roomUrl: room.roomUrl,
  systemPrompt: `You are presenting a demo. 
    Wait for customer questions and respond naturally.
    Present slides in order: Problem → Solution → Results`
});

const customerBot = await dialBot.startDialBot({
  roomUrl: room.roomUrl,
  systemPrompt: `You are a potential customer interested in AI phone systems.
    Ask these questions in order:
    1. "How does this handle emergency calls?"
    2. "What's the response time?"
    3. "How long is implementation?"
    Be enthusiastic and engaged.`
});
```

---

## 💰 Cost Estimate

### Per Demo Video (5 minutes):
- **Daily.co**: $0.20 (2 participants)
- **OpenAI Presenter**: $0.50
- **OpenAI Customer**: $0.50
- **Total**: ~$1.20 per video

### One-time:
- **Development**: 3-4 hours
- **Testing**: 1 hour
- **Result**: Reusable system

---

## 🚀 Quick Start Path

### Fastest Way to Get Demo Video:

1. **Use existing presenter bot** ✅ (already built)
2. **Add simple customer bot** (2 hours)
3. **Script 5-6 questions** (30 minutes)
4. **Run automated demo** (5 minutes)
5. **Download video** (automatic)

**Total time**: ~3 hours to build, then unlimited demo videos!

---

## ✅ Recommendation

**Build the Puppeteer Customer Bot**

**Why?**
1. Most realistic demo
2. Full control over conversation
3. Can regenerate anytime
4. Can tweak script easily
5. Professional quality output

**Should I build this now?**
- Customer bot implementation
- Pre-scripted questions
- Orchestration script
- One-command demo generation

Say "yes" and I'll build the complete automated demo generator! 🚀
