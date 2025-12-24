/**
 * AI Customer Bot - Human-like interaction for demo videos
 * Uses low-latency responses and natural conversation flow
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

interface ConversationStep {
  timing: number; // seconds from start
  type: 'question' | 'reaction' | 'comment';
  text: string;
  emotion?: 'excited' | 'curious' | 'impressed' | 'thoughtful';
}

// Meta reveal conversation - 2-3 minute version inspired by Warlord script
const demoScript: ConversationStep[] = [
  {
    timing: 3,
    type: 'comment',
    text: "Hi! I'm Sarah. Before we start, I should probably be upfront about something—I'm not actually human. I'm one of Kestrel's AI voice agents.",
    emotion: 'curious'
  },
  {
    timing: 20,
    type: 'reaction',
    text: "Pretty wild, right? So for the next few minutes, you're experiencing exactly what your customers experience when they call your HVAC company. The speed you're hearing? This is real-time.",
    emotion: 'impressed'
  },
  {
    timing: 40,
    type: 'question',
    text: "JARVIS, since you're the other AI here—want to tell them why HVAC companies are calling us?",
    emotion: 'curious'
  },
  {
    timing: 60,
    type: 'reaction',
    text: "Thirty percent of calls missed during business hours? That's... that's a lot of money walking away.",
    emotion: 'thoughtful'
  },
  {
    timing: 75,
    type: 'question',
    text: "Wait—so after hours it's even worse? What's the percentage then?",
    emotion: 'curious'
  },
  {
    timing: 90,
    type: 'reaction',
    text: "Ninety percent?! But those are the emergency calls—burst pipes, furnace failures. Those are the high-value jobs!",
    emotion: 'impressed'
  },
  {
    timing: 105,
    type: 'question',
    text: "Okay, real talk though—how does this compare to those DIY platforms? I've heard business owners try those and give up.",
    emotion: 'thoughtful'
  },
  {
    timing: 125,
    type: 'reaction',
    text: "Two hundred milliseconds versus 2-3 seconds? That's ten times faster. No wonder it feels so natural.",
    emotion: 'excited'
  },
  {
    timing: 140,
    type: 'question',
    text: "But here's what I really want to know—can you interrupt me mid-sentence like real customers do?",
    emotion: 'curious'
  },
  {
    timing: 155,
    type: 'reaction',
    text: "See? Natural conversation. That's exactly what customers need. So what happens when someone actually wants to book?",
    emotion: 'impressed'
  },
  {
    timing: 170,
    type: 'comment',
    text: "Wait—it checks the calendar in real-time and books the slot while they're on the phone? That's the difference right there.",
    emotion: 'excited'
  },
  {
    timing: 185,
    type: 'question',
    text: "Last question—does this actually work in the real world, or is this just theory?",
    emotion: 'thoughtful'
  },
  {
    timing: 200,
    type: 'reaction',
    text: "Eighteen thousand in additional revenue in month one? Okay, that's real results. Here's what I want people to remember though...",
    emotion: 'excited'
  },
  {
    timing: 215,
    type: 'comment',
    text: "Everything you just experienced—the natural conversation, the instant responses, even me asking questions and interrupting? That's what your customers get. We are the demo.",
    emotion: 'impressed'
  }
];

export class CustomerBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private openai: OpenAI;
  private audioContext: any;

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  /**
   * Join Daily.co room as customer
   */
  async joinRoom(roomUrl: string): Promise<void> {
    console.log('🎭 Customer bot launching...');

    // Launch browser with media permissions
    this.browser = await puppeteer.launch({
      headless: false, // Show for recording
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=1920,1080',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    this.page = await this.browser.newPage();

    // Set up generic Teams/Zoom style avatar
    await this.setupCustomerAvatar();

    // Navigate to Daily room
    console.log('🔗 Joining room:', roomUrl);
    await this.page.goto(roomUrl, { waitUntil: 'networkidle2' });

    // Wait for Daily to load
    await this.page.waitForTimeout(3000);

    // Set customer name
    await this.setCustomerName('Sarah Chen');

    // Join the call
    await this.joinCall();

    console.log('✅ Customer bot joined successfully');
  }

  /**
   * Set up modern pulse avatar for customer
   */
  private async setupCustomerAvatar(): Promise<void> {
    // Inject CSS for modern pulse avatar
    const avatarCSS = `
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }

        .avatar-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }

        .customer-avatar {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #0066ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: pulse 2s ease-in-out infinite, glow 3s ease-in-out infinite;
          box-shadow: 0 0 60px rgba(0, 153, 255, 0.6),
                      0 0 100px rgba(0, 153, 255, 0.4),
                      inset 0 0 60px rgba(255, 255, 255, 0.1);
        }

        .avatar-core {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0099ff 0%, #0066ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 700;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          z-index: 2;
        }

        .pulse-ring {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 3px solid rgba(0, 153, 255, 0.6);
          animation: ripple 2s ease-out infinite;
        }

        .pulse-ring:nth-child(2) {
          animation-delay: 0.5s;
        }

        .pulse-ring:nth-child(3) {
          animation-delay: 1s;
        }

        .pulse-ring:nth-child(4) {
          animation-delay: 1.5s;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(0, 212, 255, 0.8);
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          50% { opacity: 1; }
        }
      </style>
    `;

    await this.page!.setContent(`
      ${avatarCSS}
      <div class="avatar-container">
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="customer-avatar">
          <div class="avatar-core">AI</div>
        </div>
      </div>
    `);
  }

  /**
   * Set customer name in Daily
   */
  private async setCustomerName(name: string): Promise<void> {
    try {
      // Try to find and fill name input
      const nameInput = await this.page!.$('input[placeholder*="name" i]');
      if (nameInput) {
        await nameInput.type(name);
      }
    } catch (error) {
      console.log('Name input not found, continuing...');
    }
  }

  /**
   * Join the Daily call
   */
  private async joinCall(): Promise<void> {
    try {
      // Look for join button
      const joinButton = await this.page!.$('button[data-testid="join-button"]') ||
                         await this.page!.$('button:has-text("Join")') ||
                         await this.page!.$('button:has-text("Join call")');
      
      if (joinButton) {
        await joinButton.click();
        await this.page!.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('Join button not found, may already be in call');
    }
  }

  /**
   * Generate human-like speech with low latency
   */
  private async speak(text: string, emotion: string = 'curious'): Promise<void> {
    console.log(`💬 Customer: "${text}"`);

    // Add delay to avoid rate limits
    await this.page!.waitForTimeout(2000);

    // Retry logic for OpenAI API
    let retries = 3;
    let mp3: any;
    while (retries > 0) {
      try {
        mp3 = await this.openai.audio.speech.create({
          model: 'tts-1',
          voice: 'nova',
          input: text,
          speed: 1.0,
        });
        break;
      } catch (error: any) {
        retries--;
        if (retries === 0) throw error;
        console.log(`⚠️ Retry OpenAI API (${retries} left)...`);
        await this.page!.waitForTimeout(3000);
      }
    }

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // Save temporarily
    const audioPath = path.join(__dirname, '../temp', `customer-${Date.now()}.mp3`);
    fs.mkdirSync(path.dirname(audioPath), { recursive: true });
    fs.writeFileSync(audioPath, buffer);

    // Play audio in browser (skip for now - audio will be in recording)
    // The Daily.co recording will capture the AI presenter's audio
    console.log(`🔊 Audio generated: ${audioPath}`);

    // Cleanup
    fs.unlinkSync(audioPath);
  }

  /**
   * Run the demo script with natural timing
   */
  async runDemoScript(): Promise<void> {
    console.log('🎬 Starting demo script...');

    const startTime = Date.now();

    for (const step of demoScript) {
      // Wait until the right timing
      const elapsed = (Date.now() - startTime) / 1000;
      const waitTime = step.timing - elapsed;

      if (waitTime > 0) {
        await this.page!.waitForTimeout(waitTime * 1000);
      }

      // Speak with emotion
      await this.speak(step.text, step.emotion);

      // Add natural pause after speaking
      await this.page!.waitForTimeout(1500);
    }

    console.log('✅ Demo script completed');
  }

  /**
   * Leave the room
   */
  async leaveRoom(): Promise<void> {
    console.log('👋 Customer bot leaving...');

    if (this.page) {
      try {
        // Try to find leave button
        const leaveButton = await this.page.$('button[data-testid="leave-button"]') ||
                           await this.page.$('button:has-text("Leave")');
        
        if (leaveButton) {
          await leaveButton.click();
        }
      } catch (error) {
        console.log('Leave button not found');
      }
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Customer bot left');
  }
}
