/**
 * Play Demo - Display conversation locally (no Daily.co recording)
 * Reuses existing conversation and audio files
 */

import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser } from 'puppeteer';

async function playDemo() {
  console.log('🎬 Playing Demo Locally');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let browser: Browser | null = null;

  try {
    // Check for existing transcript
    const transcriptPath = path.join(__dirname, '../temp/transcript.txt');
    
    if (!fs.existsSync(transcriptPath)) {
      console.error('❌ No transcript found. Run generate-demo first to create conversation.');
      process.exit(1);
    }

    // Read transcript
    const transcript = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = transcript.split('\n\n').filter(line => line.trim());
    
    console.log(`✅ Found transcript with ${lines.length} turns\n`);

    // Parse conversation
    const conversation: { speaker: string; text: string }[] = [];
    lines.forEach(line => {
      const match = line.match(/^(SARAH|JARVIS): (.+)$/s);
      if (match) {
        conversation.push({
          speaker: match[1],
          text: match[2],
        });
      }
    });

    console.log('🖥️  Launching display...');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080'],
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    // Create display
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            min-height: 100vh;
            overflow-y: auto;
          }
          .container {
            max-width: 1200px;
            width: 100%;
            padding-bottom: 100px;
          }
          .title {
            text-align: center;
            color: white;
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 60px;
            text-shadow: 0 2px 20px rgba(0,0,0,0.3);
          }
          .message {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin: 20px 0;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateY(20px);
            animation: fadeIn 0.5s forwards;
          }
          @keyframes fadeIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .speaker {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #667eea;
          }
          .speaker.jarvis {
            color: #764ba2;
          }
          .text {
            font-size: 28px;
            line-height: 1.6;
            color: #333;
          }
          .footer {
            text-align: center;
            color: white;
            font-size: 20px;
            margin-top: 40px;
            opacity: 0.9;
          }
          .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.9);
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 16px;
            color: #333;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          }
        </style>
      </head>
      <body>
        <div class="controls">
          🎬 Recording Ready - Use OBS/Screen Recorder
        </div>
        <div class="container">
          <div class="title">🎭 AI Demo: Meta Reveal</div>
          <div id="messages"></div>
          <div class="footer">Powered by Kestrel VoiceOps</div>
        </div>
      </body>
      </html>
    `);

    console.log('✅ Display ready\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📹 READY TO RECORD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Instructions:');
    console.log('   1. Start your screen recorder (OBS, Windows Game Bar, etc.)');
    console.log('   2. Focus on the Puppeteer browser window');
    console.log('   3. Press ENTER when ready to start...\n');

    // Wait for user
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => resolve());
    });

    console.log('🎭 Playing conversation...\n');

    // Play conversation
    for (const turn of conversation) {
      const speakerClass = turn.speaker.toLowerCase();
      
      console.log(`${turn.speaker}: ${turn.text.substring(0, 80)}...`);

      // Add message to display
      await page.evaluate((speaker, text, speakerClass) => {
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
          <div class="speaker ${speakerClass}">${speaker}</div>
          <div class="text">${text}</div>
        `;
        messagesDiv?.appendChild(messageDiv);
        
        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      }, turn.speaker, turn.text, speakerClass);

      // Wait for speaking duration
      const duration = Math.max(3000, turn.text.length * 60);
      await page.waitForTimeout(duration);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Conversation complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📹 Stop your screen recording now.');
    console.log('   Press ENTER to close...\n');

    // Wait before closing
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => resolve());
    });

    if (browser) await browser.close();
    console.log('✅ Demo complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    throw error;
  }
}

if (require.main === module) {
  playDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { playDemo };
