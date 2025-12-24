/**
 * Presenter Bot (JARVIS) - Puppeteer-based, no DIAL API needed
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

interface PresenterLine {
  timing: number;
  text: string;
  type: 'response' | 'statement';
}

// JARVIS presenter lines (responds to Sarah's cues)
const presenterScript: PresenterLine[] = [
  {
    timing: 10,
    type: 'response',
    text: "And I'm JARVIS—also AI. Here's why this matters: for the next few minutes, you're experiencing exactly what your customers would experience. The response time you're hearing? This is real-time."
  },
  {
    timing: 45,
    type: 'statement',
    text: "Let me paint a picture. 2:47 AM. Water heater bursts. Homeowner calls Bob's HVAC. Voicemail. They call the next company. Someone picks up. Job booked. Bob just lost forty-two hundred dollars—and twenty-eight thousand in lifetime value."
  },
  {
    timing: 65,
    type: 'response',
    text: "Thirty percent during business hours. But after hours? Ninety percent."
  },
  {
    timing: 80,
    type: 'statement',
    text: "Ninety percent. And here's the kicker—those emergency calls are your highest margin jobs. Burst pipes at 3 AM, furnace failures during snowstorms. Desperate customers. Premium prices. And you're sleeping through them."
  },
  {
    timing: 110,
    type: 'response',
    text: "Other AI systems? Two to three second delays. Robotic voices. And YOU have to set them up. You're an HVAC expert, not a prompt engineer. We're 200 milliseconds. That's ten times faster than competitors. That's why this conversation feels natural."
  },
  {
    timing: 145,
    type: 'response',
    text: "Go ahead, interrupt me— See? Natural interruption handling. That's what customers need."
  },
  {
    timing: 160,
    type: 'statement',
    text: "AI checks your calendar in real-time, books the next available slot, sends confirmation text. Done. While you're eating lunch."
  },
  {
    timing: 190,
    type: 'response',
    text: "Bob's HVAC in Denver installed this. Month one: thirty-one after-hours calls captured. Eighteen thousand four hundred dollars in additional revenue. Paid for itself in week one."
  },
  {
    timing: 220,
    type: 'statement',
    text: "Exactly. Everything they just experienced—the natural conversation, instant responses, the ability to handle questions? That's what their customers get. Somewhere right now, a customer is calling an HVAC company. Whoever answers first, wins."
  }
];

export class PresenterBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private openai: OpenAI;

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  async joinRoom(roomUrl: string): Promise<void> {
    console.log('🤖 JARVIS (Presenter) launching...');

    this.browser = await puppeteer.launch({
      headless: false,
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

    // Set up Jarvis-style avatar
    await this.setupPresenterAvatar();

    console.log('🔗 JARVIS joining room:', roomUrl);
    await this.page.goto(roomUrl, { waitUntil: 'networkidle2' });
    await this.page.waitForTimeout(3000);

    await this.setPresenterName('JARVIS - AI Presenter');
    await this.joinCall();

    console.log('✅ JARVIS joined successfully');
  }

  private async setupPresenterAvatar(): Promise<void> {
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
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px #764ba2); }
          50% { filter: brightness(1.3) drop-shadow(0 0 40px #667eea); }
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

        .presenter-avatar {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: pulse 2s ease-in-out infinite, glow 3s ease-in-out infinite;
          box-shadow: 0 0 60px rgba(118, 75, 162, 0.6),
                      0 0 100px rgba(102, 126, 234, 0.4),
                      inset 0 0 60px rgba(255, 255, 255, 0.1);
        }

        .avatar-core {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
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
          border: 3px solid rgba(118, 75, 162, 0.6);
          animation: ripple 2s ease-out infinite;
        }

        .pulse-ring:nth-child(2) { animation-delay: 0.5s; }
        .pulse-ring:nth-child(3) { animation-delay: 1s; }
        .pulse-ring:nth-child(4) { animation-delay: 1.5s; }
      </style>
    `;

    await this.page!.setContent(`
      ${avatarCSS}
      <div class="avatar-container">
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring"></div>
        <div class="presenter-avatar">
          <div class="avatar-core">JARVIS</div>
        </div>
      </div>
    `);
  }

  private async setPresenterName(name: string): Promise<void> {
    try {
      const nameInput = await this.page!.$('input[placeholder*="name" i]');
      if (nameInput) {
        await nameInput.type(name);
      }
    } catch (error) {
      console.log('Name input not found');
    }
  }

  private async joinCall(): Promise<void> {
    try {
      const joinButton = await this.page!.$('button[data-testid="join-button"]') ||
                         await this.page!.$('button:has-text("Join")');
      
      if (joinButton) {
        await joinButton.click();
        await this.page!.waitForTimeout(2000);
      }
    } catch (error) {
      console.log('Join button not found');
    }
  }

  private async speak(text: string): Promise<void> {
    console.log(`🤖 JARVIS: "${text.substring(0, 60)}..."`);

    // Add delay to avoid rate limits
    await this.page!.waitForTimeout(2000);

    // Retry logic for OpenAI API
    let retries = 3;
    let mp3: any;
    while (retries > 0) {
      try {
        mp3 = await this.openai.audio.speech.create({
          model: 'tts-1',
          voice: 'alloy',
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
    const audioPath = path.join(__dirname, '../temp', `jarvis-${Date.now()}.mp3`);
    fs.mkdirSync(path.dirname(audioPath), { recursive: true });
    fs.writeFileSync(audioPath, buffer);

    // Play audio (simplified - just log for now, actual playback in Daily)
    console.log(`🔊 JARVIS audio generated: ${audioPath}`);
    
    // Simulate speaking duration
    const duration = Math.max(3000, text.length * 50); // At least 3 seconds
    await this.page!.waitForTimeout(duration);

    fs.unlinkSync(audioPath);
  }

  async runPresenterScript(): Promise<void> {
    console.log('🎤 JARVIS starting presentation...');

    const startTime = Date.now();

    for (const line of presenterScript) {
      const elapsed = (Date.now() - startTime) / 1000;
      const waitTime = line.timing - elapsed;

      if (waitTime > 0) {
        await this.page!.waitForTimeout(waitTime * 1000);
      }

      await this.speak(line.text);
      await this.page!.waitForTimeout(1500);
    }

    console.log('✅ JARVIS presentation completed');
  }

  async leaveRoom(): Promise<void> {
    console.log('👋 JARVIS leaving...');

    if (this.page) {
      try {
        const leaveButton = await this.page.$('button[data-testid="leave-button"]');
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

    console.log('✅ JARVIS left');
  }
}
