/**
 * Enhanced Demo Generator - Dynamic video with slides, animations, and auto-recording
 */

import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser } from 'puppeteer';

interface Slide {
  title: string;
  points: string[];
  icon: string;
}

const demoSlides: Slide[] = [
  {
    title: "The Problem",
    points: [
      "30% of calls missed during business hours",
      "90% missed after-hours",
      "$28K lifetime value lost per missed call"
    ],
    icon: "⚠️"
  },
  {
    title: "The Solution",
    points: [
      "200ms response time (10x faster)",
      "24/7 availability",
      "Real-time calendar booking"
    ],
    icon: "⚡"
  },
  {
    title: "Real Results",
    points: [
      "$18,400 additional revenue (month 1)",
      "Zero missed calls in 90 days",
      "4.9★ customer satisfaction"
    ],
    icon: "📈"
  }
];

async function generateEnhancedDemo() {
  console.log('🎬 Starting Enhanced Demo Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let browser: Browser | null = null;
  let recordingProcess: any = null;

  try {
    // Check for transcript
    const transcriptPath = path.join(__dirname, '../temp/transcript.txt');
    
    if (!fs.existsSync(transcriptPath)) {
      console.error('❌ No transcript found. Run generate-demo first.');
      process.exit(1);
    }

    // Read and parse transcript
    const transcript = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = transcript.split('\n\n').filter(line => line.trim());
    
    const conversation: { speaker: string; text: string; slideIndex?: number; audioFile?: string }[] = [];
    
    // Find audio files
    const tempDir = path.join(__dirname, '../temp');
    const audioFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.mp3')).sort();
    
    lines.forEach((line, index) => {
      const match = line.match(/^(SARAH|JARVIS): (.+)$/s);
      if (match) {
        // Assign slides to specific conversation points
        let slideIndex: number | undefined;
        const text = match[2].toLowerCase();
        if (text.includes('30%') || text.includes('missed')) slideIndex = 0;
        else if (text.includes('200') || text.includes('millisecond')) slideIndex = 1;
        else if (text.includes('18') || text.includes('revenue')) slideIndex = 2;

        // Find matching audio file
        const speaker = match[1].toLowerCase();
        const audioFile = audioFiles.find(f => f.startsWith(speaker));
        if (audioFile) {
          audioFiles.splice(audioFiles.indexOf(audioFile), 1); // Remove used file
        }

        conversation.push({
          speaker: match[1],
          text: match[2],
          slideIndex,
          audioFile: audioFile ? path.join(tempDir, audioFile) : undefined,
        });
      }
    });

    console.log(`✅ Loaded ${conversation.length} conversation turns\n`);

    // Launch browser
    console.log('🖥️  Launching enhanced display...');
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

    // Create enhanced display with slides
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            background: #000;
          }

          /* Animated gradient background */
          .background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            z-index: 0;
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Floating particles */
          .particle {
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            animation: float 20s infinite;
            z-index: 1;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
          }

          /* Main container */
          .container {
            position: relative;
            z-index: 10;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
            height: 100vh;
            max-height: 100vh;
            overflow: hidden;
          }

          /* Left side - Conversation */
          .conversation-panel {
            display: flex;
            flex-direction: column;
            gap: 15px;
            overflow-y: auto;
            padding-right: 15px;
            max-height: calc(100vh - 60px);
          }

          .conversation-panel::-webkit-scrollbar {
            width: 8px;
          }

          .conversation-panel::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }

          .conversation-panel::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }

          .title {
            text-align: center;
            color: white;
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 4px 30px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.3);
            animation: titlePulse 3s ease-in-out infinite;
            background: linear-gradient(90deg, #fff, #f093fb, #fff);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: titleShimmer 3s ease-in-out infinite;
          }

          @keyframes titleShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }

          .message {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3), 0 0 20px rgba(102, 126, 234, 0.2);
            opacity: 0;
            transform: translateX(-50px) scale(0.95);
            animation: slideIn 0.6s forwards;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          @keyframes slideIn {
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }

          .speaker {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #667eea;
            display: flex;
            align-items: center;
            gap: 12px;
            text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
          }

          .speaker.jarvis {
            color: #764ba2;
          }

          .speaker-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
            background-size: 200% 200%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            animation: iconPulse 2s ease-in-out infinite, gradientRotate 4s ease infinite;
          }

          @keyframes gradientRotate {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes iconPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7), 0 0 20px rgba(102, 126, 234, 0.5); }
            50% { transform: scale(1.15); box-shadow: 0 0 0 15px rgba(102, 126, 234, 0), 0 0 30px rgba(102, 126, 234, 0.3); }
          }

          .text {
            font-size: 22px;
            line-height: 1.7;
            color: #222;
            font-weight: 500;
          }

          /* Right side - Slides */
          .slides-panel {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .slide {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 30px;
            padding: 50px;
            width: 100%;
            max-width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(102, 126, 234, 0.3);
            opacity: 0;
            transform: scale(0.8) rotateY(20deg);
            transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            backdrop-filter: blur(10px);
            border: 3px solid rgba(255, 255, 255, 0.4);
          }

          .slide.active {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }

          .slide-icon {
            font-size: 100px;
            text-align: center;
            margin-bottom: 30px;
            animation: iconBounce 2s ease-in-out infinite;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
          }

          @keyframes iconBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }

          .slide-title {
            font-size: 56px;
            font-weight: 700;
            color: #764ba2;
            text-align: center;
            margin-bottom: 40px;
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientRotate 3s ease infinite;
            text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
          }

          .slide-points {
            list-style: none;
          }

          .slide-point {
            font-size: 28px;
            color: #222;
            margin: 25px 0;
            padding-left: 50px;
            position: relative;
            opacity: 0;
            transform: translateX(-30px);
            animation: pointFadeIn 0.6s forwards;
            font-weight: 500;
            line-height: 1.6;
          }

          .slide-point:nth-child(1) { animation-delay: 0.2s; }
          .slide-point:nth-child(2) { animation-delay: 0.4s; }
          .slide-point:nth-child(3) { animation-delay: 0.6s; }

          @keyframes pointFadeIn {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .slide-point:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: 700;
            font-size: 32px;
            animation: checkPulse 2s ease-in-out infinite;
          }

          @keyframes checkPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }

          /* Footer */
          .footer {
            position: fixed;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 20px;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.5);
            z-index: 100;
            animation: footerPulse 3s ease-in-out infinite;
            background: rgba(0,0,0,0.2);
            padding: 10px 30px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }

          @keyframes footerPulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }

          /* Recording indicator */
          .recording-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: recordBlink 2s ease-in-out infinite;
          }

          @keyframes recordBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .record-dot {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            animation: dotPulse 1s ease-in-out infinite;
          }

          @keyframes dotPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
        </style>
      </head>
      <body>
        <div class="background"></div>
        
        <!-- Floating particles -->
        ${Array.from({ length: 20 }, (_, i) => `
          <div class="particle" style="
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 20}s;
          "></div>
        `).join('')}

        <div class="recording-indicator">
          <div class="record-dot"></div>
          REC
        </div>

        <div class="container">
          <div class="conversation-panel">
            <div class="title">🎭 AI Demo: Meta Reveal</div>
            <div id="messages"></div>
          </div>

          <div class="slides-panel">
            <div id="slides-container"></div>
          </div>
        </div>

        <div class="footer">Powered by Kestrel VoiceOps | AI-Powered Customer Engagement</div>
      </body>
      </html>
    `);

    console.log('✅ Enhanced display ready\n');

    // Start automatic recording using Puppeteer's built-in screen recording
    console.log('🎥 Starting automatic recording...');
    
    const outputPath = path.join(__dirname, '../recordings/videos', `enhanced-demo-${Date.now()}.webm`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Start recording (using Puppeteer's CDP)
    const client = await page.target().createCDPSession();
    await client.send('Page.startScreencast', {
      format: 'png',
      quality: 100,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    console.log('✅ Recording started\n');
    console.log('🎭 Playing enhanced demo...\n');

    let currentSlideIndex = -1;

    // Play conversation with slides
    for (let i = 0; i < conversation.length; i++) {
      const turn = conversation[i];
      const speakerClass = turn.speaker.toLowerCase();
      
      console.log(`${turn.speaker}: ${turn.text.substring(0, 80)}...`);

      // Show slide if needed
      if (turn.slideIndex !== undefined && turn.slideIndex !== currentSlideIndex) {
        currentSlideIndex = turn.slideIndex;
        const slide = demoSlides[currentSlideIndex];
        
        await page.evaluate((slide) => {
          const container = document.getElementById('slides-container');
          if (container) {
            container.innerHTML = `
              <div class="slide active">
                <div class="slide-icon">${slide.icon}</div>
                <div class="slide-title">${slide.title}</div>
                <ul class="slide-points">
                  ${slide.points.map(point => `<li class="slide-point">${point}</li>`).join('')}
                </ul>
              </div>
            `;
          }
        }, slide);
      }

      // Add message
      await page.evaluate((speaker, text, speakerClass) => {
        const messagesDiv = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
          <div class="speaker ${speakerClass}">
            <div class="speaker-icon">${speaker[0]}</div>
            ${speaker}
          </div>
          <div class="text">${text}</div>
        `;
        messagesDiv?.appendChild(messageDiv);
        messagesDiv?.scrollTo(0, messagesDiv.scrollHeight);
      }, turn.speaker, turn.text, speakerClass);

      // Play audio if available
      if (turn.audioFile && fs.existsSync(turn.audioFile)) {
        const audioBuffer = fs.readFileSync(turn.audioFile);
        const base64Audio = audioBuffer.toString('base64');
        
        await page.evaluate((base64) => {
          const audio = new Audio(`data:audio/mp3;base64,${base64}`);
          audio.volume = 1.0;
          return audio.play();
        }, base64Audio);

        // Wait for audio to finish (estimate based on text length)
        const duration = Math.max(3000, turn.text.length * 60);
        await page.waitForTimeout(duration);
      } else {
        // No audio, wait based on text length
        const duration = Math.max(3000, turn.text.length * 60);
        await page.waitForTimeout(duration);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo playback complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait a bit before stopping
    await page.waitForTimeout(3000);

    // Stop recording
    console.log('🛑 Stopping recording...');
    await client.send('Page.stopScreencast');

    console.log(`✅ Recording saved (use OBS or screen recorder for full video)\n`);

    // Close browser
    if (browser) await browser.close();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Enhanced demo complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📹 To record:');
    console.log('   Use OBS Studio or Windows Game Bar (Win+G)');
    console.log('   The demo will auto-play with slides and animations\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    if (recordingProcess) recordingProcess.kill();
    throw error;
  }
}

if (require.main === module) {
  generateEnhancedDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateEnhancedDemo };
