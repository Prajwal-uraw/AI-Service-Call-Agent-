/**
 * Live AI Demo Generator
 * Real-time conversation between two AI agents using OpenAI API
 * 30-40 second burst conversation with proper turn-taking
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import puppeteer, { Browser, Page } from 'puppeteer';

dotenv.config();

interface Message {
  speaker: 'Kylie' | 'Kingston';
  text: string;
  timestamp: number;
}

class LiveConversationEngine {
  private openai: OpenAI;
  private messages: Message[] = [];
  private conversationHistory: any[] = [];

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateTurn(speaker: 'Kylie' | 'Kingston', context: string): Promise<string> {
    const systemPrompt = speaker === 'Kylie'
      ? `You are Kylie, a trendy AI influencer. You're excited, use casual language, and speak like you're making a TikTok. Keep responses VERY SHORT (5-10 words max). Be energetic and fun. Use phrases like "Wait what?", "No way!", "That's insane!"`
      : `You are Kingston, a smooth AI presenter with marketing flair. You drop facts like a TikTok creator. Keep responses VERY SHORT (5-10 words max). Be punchy and memorable. Use phrases like "Here's the thing", "Get this", "Real talk"`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: context },
        ...this.conversationHistory,
      ],
      max_tokens: 30,
      temperature: 0.9,
    });

    const text = response.choices[0].message.content || '';
    
    this.conversationHistory.push({
      role: speaker === 'Kylie' ? 'user' : 'assistant',
      content: text,
    });

    return text;
  }

  async generateShortConversation(): Promise<Message[]> {
    const topic = `Style: TikTok marketing video - energetic, casual, punchy.
Topic: AI that answers phones instantly.
Key hooks:
- "30% of calls just... disappear"
- "AI responds in 200 milliseconds"
- "$18K extra revenue, first month"

Keep it VERY SHORT - 5-10 words per turn. TikTok energy!`;

    // Opening - Hook
    const opening = await this.generateTurn('Kylie', `${topic}\n\nStart with an attention-grabbing hook about missed calls. Be shocked/surprised.`);
    this.messages.push({ speaker: 'Kylie', text: opening, timestamp: Date.now() });

    // Turn 2 - Drop the stat
    const response1 = await this.generateTurn('Kingston', `${topic}\n\nDrop the "30% missed calls" stat like a bomb. Be dramatic.`);
    this.messages.push({ speaker: 'Kingston', text: response1, timestamp: Date.now() });

    // Turn 3 - React
    const question1 = await this.generateTurn('Kylie', `${topic}\n\nReact with disbelief. Use "Wait what?" or "No way!" energy.`);
    this.messages.push({ speaker: 'Kylie', text: question1, timestamp: Date.now() });

    // Turn 4 - Solution reveal
    const response2 = await this.generateTurn('Kingston', `${topic}\n\nReveal the AI solution. "200ms response" - make it sound fast and impressive.`);
    this.messages.push({ speaker: 'Kingston', text: response2, timestamp: Date.now() });

    // Turn 5 - Hype reaction
    const question2 = await this.generateTurn('Kylie', `${topic}\n\nGet hyped. Ask about results with excitement.`);
    this.messages.push({ speaker: 'Kylie', text: question2, timestamp: Date.now() });

    // Turn 6 - Money shot
    const closing = await this.generateTurn('Kingston', `${topic}\n\nDrop the "$18K revenue" number. Make it punchy and memorable.`);
    this.messages.push({ speaker: 'Kingston', text: closing, timestamp: Date.now() });

    return this.messages;
  }

  async generateAudio(text: string, speaker: 'Kylie' | 'Kingston', index: number): Promise<string> {
    const voice = speaker === 'Kylie' ? 'nova' : 'echo';
    
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice,
      input: text,
      speed: 1.1,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const filename = `${String(index).padStart(2, '0')}_${speaker.toLowerCase()}.mp3`;
    const filepath = path.join(__dirname, '../temp', filename);
    
    fs.writeFileSync(filepath, buffer);
    return filepath;
  }
}

async function generateLiveDemo() {
  console.log('🎬 Live AI Demo Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  // Create temp directory
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log('🤖 Step 1: Generating live conversation...');
  const engine = new LiveConversationEngine(apiKey);
  const conversation = await engine.generateShortConversation();
  
  console.log('\n✅ Conversation generated:');
  conversation.forEach((msg, i) => {
    console.log(`  ${i + 1}. ${msg.speaker}: ${msg.text}`);
  });

  console.log('\n🔊 Step 2: Generating audio for each turn...');
  const audioFiles: string[] = [];
  for (let i = 0; i < conversation.length; i++) {
    const msg = conversation[i];
    const audioPath = await engine.generateAudio(msg.text, msg.speaker, i + 1);
    audioFiles.push(audioPath);
    console.log(`  ✓ ${path.basename(audioPath)}`);
  }

  console.log('\n🎥 Step 3: Creating video with live playback...');
  
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--start-fullscreen',
        '--autoplay-policy=no-user-gesture-required',
      ],
      defaultViewport: { width: 1920, height: 1080 },
      ignoreDefaultArgs: ['--mute-audio'],
    });

    const page = await browser.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .app-container {
            width: 1400px;
            height: 900px;
            background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
            border-radius: 24px;
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .welcome-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 1;
            transition: opacity 0.5s ease;
          }

          .welcome-screen.hidden {
            opacity: 0;
            pointer-events: none;
          }

          .welcome-title {
            font-size: 64px;
            font-weight: 700;
            color: white;
            margin-bottom: 20px;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }

          .welcome-subtitle {
            font-size: 28px;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 40px;
          }

          .countdown {
            font-size: 120px;
            font-weight: 700;
            color: white;
            text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
            animation: countdownPulse 1s ease-in-out;
          }

          @keyframes countdownPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }

          .header {
            background: rgba(255, 255, 255, 0.02);
            padding: 24px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(10px);
          }

          .title {
            color: white;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          .live-badge {
            background: linear-gradient(135deg, #ff0844 0%, #ff6b6b 100%);
            color: white;
            padding: 6px 16px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(255, 8, 68, 0.3);
            animation: livePulse 2s ease-in-out infinite;
          }

          @keyframes livePulse {
            0%, 100% { opacity: 1; box-shadow: 0 4px 12px rgba(255, 8, 68, 0.3); }
            50% { opacity: 0.8; box-shadow: 0 4px 20px rgba(255, 8, 68, 0.5); }
          }

          .content {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            padding: 32px;
            max-height: calc(900px - 140px);
          }

          .speaker-box {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
          }

          .speaker-box.active {
            border-color: rgba(102, 126, 234, 0.4);
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2), 0 0 0 1px rgba(102, 126, 234, 0.2);
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.04);
          }

          .speaker-header {
            background: rgba(255, 255, 255, 0.03);
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .speaker-name {
            color: white;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          .speaker-role {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
            margin-top: 6px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .speaker-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 32px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
            position: relative;
          }

          .speaker-content.kylie {
            background: linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
          }

          .speaker-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
            pointer-events: none;
          }

          .avatar {
            width: 160px;
            height: 160px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            border: 2px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 72px;
            color: white;
            font-weight: 600;
            margin-bottom: 24px;
            position: relative;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }

          .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            animation: pulse-ring 2.5s ease-out infinite;
            opacity: 0;
          }

          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.6); opacity: 0; }
          }

          .message {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px 24px;
            color: white;
            font-size: 20px;
            line-height: 1.5;
            text-align: center;
            min-height: 80px;
            max-height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            font-weight: 500;
            overflow: hidden;
          }

          .footer {
            background: rgba(255, 255, 255, 0.02);
            padding: 16px 40px;
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 13px;
            font-weight: 500;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            letter-spacing: 0.5px;
          }

          audio { display: none; }
        </style>
      </head>
      <body>
        <div class="welcome-screen" id="welcome-screen">
          <div class="welcome-title">🎭 Live AI Demo</div>
          <div class="welcome-subtitle">Get ready...</div>
          <div class="countdown" id="countdown">3</div>
        </div>

        <div class="app-container">
        <div class="header">
          <div class="title">🎭 Live AI Demo</div>
          <div class="live-badge">● LIVE</div>
        </div>

        <div class="content">
          <div class="speaker-box" id="kylie-box">
            <div class="speaker-header">
              <div class="speaker-name">Kylie</div>
              <div class="speaker-role">AI Customer</div>
            </div>
            <div class="speaker-content kylie">
              <div class="avatar">
                <div class="pulse-ring"></div>
                <div class="pulse-ring" style="animation-delay: 0.5s;"></div>
                K
              </div>
              <div class="message" id="kylie-message"></div>
            </div>
          </div>

          <div class="speaker-box" id="kingston-box">
            <div class="speaker-header">
              <div class="speaker-name">Kingston</div>
              <div class="speaker-role">AI Presenter</div>
            </div>
            <div class="speaker-content">
              <div class="avatar">
                <div class="pulse-ring"></div>
                <div class="pulse-ring" style="animation-delay: 0.5s;"></div>
                K
              </div>
              <div class="message" id="kingston-message"></div>
            </div>
          </div>
        </div>

        <div class="footer">
          Powered by Kestrel VoiceOps | AI-Powered Customer Engagement
        </div>
        </div>

        <audio id="audio-player"></audio>

        <script>
          // Countdown timer
          let count = 3;
          const countdownEl = document.getElementById('countdown');
          const welcomeScreen = document.getElementById('welcome-screen');
          
          const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
              countdownEl.textContent = count;
              countdownEl.style.animation = 'none';
              setTimeout(() => {
                countdownEl.style.animation = 'countdownPulse 1s ease-in-out';
              }, 10);
            } else {
              clearInterval(countdownInterval);
              welcomeScreen.classList.add('hidden');
            }
          }, 1000);
        </script>
      </body>
      </html>
    `);

    console.log('✅ Video interface ready\n');
    console.log('⏳ Countdown starting (3 seconds)...\n');
    
    // Wait for countdown to finish
    await page.waitForTimeout(3500);
    
    console.log('🎭 Playing live conversation...\n');

    // Play conversation with proper turn-taking
    for (let i = 0; i < conversation.length; i++) {
      const msg = conversation[i];
      const speakerLower = msg.speaker.toLowerCase();
      
      console.log(`${msg.speaker}: ${msg.text}`);

      // Activate speaker
      await page.evaluate((speaker) => {
        const kylieBox = document.getElementById('kylie-box');
        const kingstonBox = document.getElementById('kingston-box');

        if (speaker === 'kylie') {
          kylieBox?.classList.add('active');
          kingstonBox?.classList.remove('active');
        } else {
          kingstonBox?.classList.add('active');
          kylieBox?.classList.remove('active');
        }
      }, speakerLower);

      // Update message
      await page.evaluate((speaker, text) => {
        const messageId = speaker === 'kylie' ? 'kylie-message' : 'kingston-message';
        const messageEl = document.getElementById(messageId);
        if (messageEl) {
          messageEl.textContent = text;
        }
      }, speakerLower, msg.text);

      // Play audio
      const audioPath = audioFiles[i];
      if (fs.existsSync(audioPath)) {
        const audioBuffer = fs.readFileSync(audioPath);
        const base64Audio = audioBuffer.toString('base64');
        
        // Wait for audio to complete
        await page.evaluate((base64) => {
          return new Promise<void>((resolve) => {
            const audio = document.getElementById('audio-player') as HTMLAudioElement;
            audio.src = `data:audio/mp3;base64,${base64}`;
            audio.volume = 1.0;
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
        }, base64Audio);

        // Small pause between turns
        await page.waitForTimeout(800);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Live demo complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Keep window open for a moment
    await page.waitForTimeout(3000);

    if (browser) await browser.close();

    console.log('🎉 Demo finished!');
    console.log('📹 Use OBS or Game Bar to record next time\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    throw error;
  }
}

if (require.main === module) {
  generateLiveDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateLiveDemo };
