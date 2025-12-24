/**
 * Real-Time AI Demo - Live conversation using OpenAI Realtime API
 * Based on production implementation from hvac_agent/twilio_realtime.py
 * Sub-200ms latency, true voice-to-voice conversation
 */

import WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import puppeteer, { Browser } from 'puppeteer';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';

interface RealtimeAgent {
  name: string;
  role: string;
  systemPrompt: string;
  voice: 'alloy' | 'echo' | 'shimmer';
  ws: WebSocket | null;
  isConnected: boolean;
  isSpeaking: boolean;
}

class RealtimeConversationDemo {
  private kylie: RealtimeAgent;
  private kingston: RealtimeAgent;
  private browser: Browser | null = null;
  private conversationLog: Array<{ speaker: string; text: string; timestamp: number }> = [];
  private isRunning: boolean = false;
  private turnCount: number = 0;
  private maxTurns: number = 6;
  private sessionReadyCount: number = 0;
  private audioChunks: Map<string, Buffer[]> = new Map();
  private currentSpeaker: string | null = null;

  constructor() {
    this.kylie = {
      name: 'Kylie',
      role: 'AI Customer',
      systemPrompt: `You are Kylie, a trendy AI influencer checking out Kestrel VoiceOps. 
Be SUPER SHORT (5-10 words max). Use TikTok energy - excited, casual, punchy.
React with "Wait what?", "No way!", "That's insane!" 
You're in a live conversation with Kingston. Keep it snappy and fun.`,
      voice: 'shimmer',
      ws: null,
      isConnected: false,
      isSpeaking: false,
    };

    this.kingston = {
      name: 'Kingston',
      role: 'AI Presenter',
      systemPrompt: `You are Kingston, a smooth AI presenter for Kestrel VoiceOps.
Be SUPER SHORT (5-10 words max). Drop facts like a TikTok creator.
Use phrases like "Here's the thing", "Get this", "Real talk"
You're in a live conversation with Kylie. Be punchy and memorable.

Key points to mention naturally:
- 30% of calls get missed
- AI responds in 200ms
- $18K extra revenue first month`,
      voice: 'echo',
      ws: null,
      isConnected: false,
      isSpeaking: false,
    };
  }

  async connectAgent(agent: RealtimeAgent): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(OPENAI_REALTIME_URL, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      ws.on('open', () => {
        console.log(`✅ ${agent.name} connected to OpenAI Realtime API`);
        
        // Configure session
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: agent.systemPrompt,
            voice: agent.voice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            temperature: 0.9,
            max_response_output_tokens: 150,
          },
        }));

        agent.ws = ws;
        agent.isConnected = true;
        resolve();
      });

      ws.on('message', (data: Buffer) => {
        this.handleAgentMessage(agent, data);
      });

      ws.on('error', (error: Error) => {
        console.error(`❌ ${agent.name} WebSocket error:`, error.message);
        reject(error);
      });

      ws.on('close', () => {
        console.log(`🔌 ${agent.name} disconnected`);
        agent.isConnected = false;
      });
    });
  }

  private handleAgentMessage(agent: RealtimeAgent, data: Buffer): void {
    try {
      const event = JSON.parse(data.toString());

      switch (event.type) {
        case 'session.created':
          console.log(`  ${agent.name}: Session created`);
          break;

        case 'session.updated':
          console.log(`  ${agent.name}: Session ready ✓`);
          this.sessionReadyCount++;
          break;

        case 'response.audio_transcript.delta':
          // Accumulate transcript
          if (event.delta) {
            const existing = this.conversationLog.find(
              log => log.speaker === agent.name && log.timestamp === Date.now()
            );
            if (!existing) {
              this.conversationLog.push({
                speaker: agent.name,
                text: event.delta,
                timestamp: Date.now(),
              });
            }
          }
          break;

        case 'response.audio.delta':
          // Collect audio chunks
          if (event.delta && this.browser) {
            console.log(`  ${agent.name}: Audio chunk received (${event.delta.length} bytes)`);
            const audioData = Buffer.from(event.delta, 'base64');
            const key = `${agent.name}_${this.turnCount}`;
            
            if (!this.audioChunks.has(key)) {
              this.audioChunks.set(key, []);
            }
            this.audioChunks.get(key)!.push(audioData);
            
            // Stream audio to browser
            this.playAudioChunk(event.delta);
          }
          break;

        case 'response.audio_transcript.done':
          if (event.transcript) {
            console.log(`${agent.name}: ${event.transcript}`);
            this.updateVisualDisplay(agent.name, event.transcript);
          }
          break;

        case 'response.done':
          agent.isSpeaking = false;
          this.turnCount++;
          
          // Check if we should continue
          if (this.turnCount >= this.maxTurns) {
            this.isRunning = false;
          } else {
            // Switch to other agent
            this.triggerNextTurn(agent.name === 'Kylie' ? this.kingston : this.kylie);
          }
          break;

        case 'error':
          console.error(`❌ ${agent.name} error:`, event.error);
          break;
      }
    } catch (error: any) {
      console.error(`Error parsing message from ${agent.name}:`, error.message);
    }
  }

  private async triggerNextTurn(agent: RealtimeAgent): Promise<void> {
    if (!agent.ws || !agent.isConnected || !this.isRunning) return;

    // Small delay between turns for natural flow
    await new Promise(resolve => setTimeout(resolve, 800));

    agent.isSpeaking = true;

    // Create a response trigger
    agent.ws.send(JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: this.turnCount === 0 
          ? 'Start the conversation with an attention-grabbing hook about missed calls.'
          : 'Continue the conversation naturally based on what was just said.',
      },
    }));
  }

  private async playAudioChunk(base64Audio: string): Promise<void> {
    if (!this.browser) return;

    const pages = await this.browser.pages();
    if (pages.length === 0) return;

    const page = pages[0];

    // Use HTML5 Audio for simpler playback
    await page.evaluate((audioData) => {
      try {
        const audioPlayer = document.getElementById('audio-player') as HTMLAudioElement;
        if (!audioPlayer) {
          console.error('Audio player element not found');
          return;
        }

        // Create data URL from base64
        const dataUrl = `data:audio/pcm;base64,${audioData}`;
        
        // Set source and play
        audioPlayer.src = dataUrl;
        audioPlayer.volume = 1.0;
        
        audioPlayer.play().then(() => {
          console.log('Audio chunk playing');
        }).catch((error) => {
          console.error('Audio play error:', error);
        });
      } catch (error) {
        console.error('Audio playback error:', error);
      }
    }, base64Audio);
  }

  private async updateVisualDisplay(speaker: string, text: string): Promise<void> {
    if (!this.browser) return;

    const pages = await this.browser.pages();
    if (pages.length === 0) return;

    const page = pages[0];
    const speakerLower = speaker.toLowerCase();
    this.currentSpeaker = speaker;

    await page.evaluate((speaker, text) => {
      const kylieBox = document.getElementById('kylie-box');
      const kingstonBox = document.getElementById('kingston-box');
      const messageId = speaker === 'kylie' ? 'kylie-message' : 'kingston-message';
      const messageEl = document.getElementById(messageId);

      // Activate speaker
      if (speaker === 'kylie') {
        kylieBox?.classList.add('active');
        kingstonBox?.classList.remove('active');
      } else {
        kingstonBox?.classList.add('active');
        kylieBox?.classList.remove('active');
      }

      // Update message
      if (messageEl) {
        messageEl.textContent = text;
      }
    }, speakerLower, text);
  }

  async startDemo(): Promise<void> {
    console.log('🎬 Real-Time AI Demo Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found');
      process.exit(1);
    }

    // Step 1: Connect both agents
    console.log('🤖 Step 1: Connecting AI agents to OpenAI Realtime API...');
    await Promise.all([
      this.connectAgent(this.kylie),
      this.connectAgent(this.kingston),
    ]);
    console.log('✅ Both agents connected\n');

    // Wait for both sessions to be fully configured
    console.log('⏳ Waiting for sessions to be ready...');
    let waitCount = 0;
    while (this.sessionReadyCount < 2 && waitCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 500));
      waitCount++;
    }

    if (this.sessionReadyCount < 2) {
      console.error('❌ Sessions did not become ready in time');
      process.exit(1);
    }

    console.log('✅ Both sessions ready\n');

    // Step 2: Launch visual interface
    console.log('🎥 Step 2: Launching visual interface...');
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--start-fullscreen',
        '--autoplay-policy=no-user-gesture-required',
      ],
      defaultViewport: { width: 1920, height: 1080 },
      ignoreDefaultArgs: ['--mute-audio'],
    });

    const page = await this.browser.newPage();

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            margin: 0;
            padding: 30px;
          }

          .app-container {
            width: 1000px;
            height: 700px;
            background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
            border-radius: 20px;
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
            display: flex;
            gap: 16px;
            padding: 20px;
            align-items: stretch;
            justify-content: space-between;
            min-height: 0;
          }

          .speaker-box {
            flex: 1;
            width: 460px;
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
            padding: 24px;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
            position: relative;
            min-height: 0;
          }

          .speaker-content.kylie {
            background: linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
          }

          .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            border: 2px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 56px;
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
            padding: 16px 20px;
            color: white;
            font-size: 17px;
            line-height: 1.4;
            text-align: center;
            min-height: 70px;
            max-height: 110px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            font-weight: 500;
            overflow-y: auto;
            word-wrap: break-word;
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
        </style>
      </head>
      <body>
        <div class="welcome-screen" id="welcome-screen">
          <div class="welcome-title">🎭 Real-Time AI Demo</div>
          <div class="welcome-subtitle">Live conversation starting...</div>
          <div class="countdown" id="countdown">3</div>
        </div>

        <div class="app-container">
          <div class="header">
            <div class="title">🎭 Real-Time AI Demo</div>
            <div class="live-badge">● LIVE</div>
          </div>

          <div class="content">
            <div class="speaker-box" id="kylie-box">
              <div class="speaker-header">
                <div class="speaker-name">Kylie</div>
                <div class="speaker-role">AI INFLUENCER</div>
              </div>
              <div class="speaker-content kylie">
                <div class="avatar">
                  <div class="pulse-ring"></div>
                  <div class="pulse-ring" style="animation-delay: 0.5s;"></div>
                  K
                </div>
                <div class="message" id="kylie-message">Connecting...</div>
              </div>
            </div>

            <div class="speaker-box" id="kingston-box">
              <div class="speaker-header">
                <div class="speaker-name">Kingston</div>
                <div class="speaker-role">AI PRESENTER</div>
              </div>
              <div class="speaker-content">
                <div class="avatar">
                  <div class="pulse-ring"></div>
                  <div class="pulse-ring" style="animation-delay: 0.5s;"></div>
                  K
                </div>
                <div class="message" id="kingston-message">Connecting...</div>
              </div>
            </div>
          </div>

          <div class="footer">
            Powered by OpenAI Realtime API | Sub-200ms Latency
          </div>
        </div>

        <audio id="audio-player" style="display: none;"></audio>

        <script>
          let count = 3;
          const countdownEl = document.getElementById('countdown');
          const welcomeScreen = document.getElementById('welcome-screen');
          
          const countdownInterval = setInterval(function() {
            count--;
            if (count > 0) {
              countdownEl.textContent = count;
              countdownEl.style.animation = 'none';
              setTimeout(function() {
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

    console.log('✅ Visual interface ready\n');
    console.log('⏳ Countdown starting (3 seconds)...\n');
    
    await page.waitForTimeout(3500);
    
    console.log('🔥 Warming up AI agents (2 seconds)...\n');
    await page.waitForTimeout(2000);
    
    console.log('🎭 Starting live conversation...\n');

    // Step 3: Start the conversation
    this.isRunning = true;
    
    // Update UI to show ready state
    await page.evaluate(() => {
      const kylieMsg = document.getElementById('kylie-message');
      const kingstonMsg = document.getElementById('kingston-message');
      if (kylieMsg) kylieMsg.textContent = 'Ready...';
      if (kingstonMsg) kingstonMsg.textContent = 'Ready...';
    });
    
    await page.waitForTimeout(500);
    await this.triggerNextTurn(this.kylie);

    // Wait for conversation to complete (max 2 minutes)
    let waitTime = 0;
    while (this.isRunning && this.turnCount < this.maxTurns && waitTime < 120) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      waitTime++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Live conversation complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Keep window open
    await page.waitForTimeout(3000);

    // Cleanup
    if (this.kylie.ws) this.kylie.ws.close();
    if (this.kingston.ws) this.kingston.ws.close();
    if (this.browser) await this.browser.close();

    console.log('🎉 Demo finished!\n');
  }
}

async function main() {
  const demo = new RealtimeConversationDemo();
  await demo.startDemo();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { RealtimeConversationDemo };
