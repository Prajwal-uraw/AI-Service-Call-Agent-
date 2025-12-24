/**
 * Meeting-Style Demo - Podcast/Zoom interface with audio
 * Two video boxes side-by-side with heartbeat visual
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

async function generateMeetingDemo() {
  console.log('🎬 Starting Meeting-Style Demo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let browser: Browser | null = null;

  try {
    const transcriptPath = path.join(__dirname, '../temp/transcript.txt');
    
    if (!fs.existsSync(transcriptPath)) {
      console.error('❌ No transcript found. Run generate-demo first.');
      process.exit(1);
    }

    const transcript = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = transcript.split('\n\n').filter(line => line.trim());
    
    const conversation: { speaker: string; text: string; slideIndex?: number; audioFile?: string }[] = [];
    
    const tempDir = path.join(__dirname, '../temp');
    const audioFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.mp3')).sort();
    
    lines.forEach((line) => {
      const match = line.match(/^(SARAH|JARVIS): (.+)$/s);
      if (match) {
        let slideIndex: number | undefined;
        const text = match[2].toLowerCase();
        if (text.includes('30%') || text.includes('missed')) slideIndex = 0;
        else if (text.includes('200') || text.includes('millisecond')) slideIndex = 1;
        else if (text.includes('18') || text.includes('revenue')) slideIndex = 2;

        const speaker = match[1].toLowerCase();
        const audioFile = audioFiles.find(f => f.startsWith(speaker));
        if (audioFile) {
          audioFiles.splice(audioFiles.indexOf(audioFile), 1);
        }

        conversation.push({
          speaker: match[1] === 'SARAH' ? 'KYLIE' : 'KYLE',
          text: match[2],
          slideIndex,
          audioFile: audioFile ? path.join(tempDir, audioFile) : undefined,
        });
      }
    });

    console.log(`✅ Loaded ${conversation.length} conversation turns\n`);

    console.log('🖥️  Launching meeting interface...');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--start-fullscreen',
        '--autoplay-policy=no-user-gesture-required',
        '--use-fake-ui-for-media-stream',
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
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            overflow: hidden;
            height: 100vh;
          }

          /* Meeting Container */
          .meeting-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          }

          /* Header Bar */
          .header-bar {
            background: rgba(0, 0, 0, 0.5);
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid rgba(102, 126, 234, 0.3);
          }

          .meeting-title {
            color: white;
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .live-badge {
            background: #ff0000;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            animation: livePulse 2s ease-in-out infinite;
          }

          @keyframes livePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .recording-time {
            color: #fff;
            font-size: 18px;
            font-weight: 600;
          }

          /* Main Content Area */
          .content-area {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
            overflow: hidden;
          }

          /* Video Box */
          .video-box {
            background: #000;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            border: 3px solid rgba(102, 126, 234, 0.3);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
          }

          .video-box.active {
            border-color: #667eea;
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
          }

          /* Video Header */
          .video-header {
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          }

          .participant-name {
            color: white;
            font-size: 22px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .mic-icon {
            width: 30px;
            height: 30px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
          }

          /* Video Content */
          .video-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
          }

          /* Avatar */
          .avatar {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 80px;
            color: white;
            font-weight: 700;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            position: relative;
            z-index: 2;
          }

          .avatar.kyle {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          /* Heartbeat Effect */
          .heartbeat {
            position: absolute;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.5);
            animation: heartbeat 1.5s ease-in-out infinite;
          }

          @keyframes heartbeat {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.3);
              opacity: 0;
            }
          }

          /* Speaking Indicator */
          .speaking-indicator {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
            background-size: 200% 100%;
            animation: speakingGlow 1s ease-in-out infinite;
            opacity: 0;
          }

          .speaking-indicator.active {
            opacity: 1;
          }

          @keyframes speakingGlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          /* Captions */
          .captions {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            padding: 20px;
            border-radius: 15px;
            color: white;
            font-size: 20px;
            line-height: 1.6;
            max-height: 150px;
            overflow-y: auto;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            z-index: 3;
          }

          .captions::-webkit-scrollbar {
            width: 6px;
          }

          .captions::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }

          /* Slide Overlay */
          .slide-overlay {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.98);
            border-radius: 30px;
            padding: 60px;
            max-width: 800px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
            z-index: 1000;
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            pointer-events: none;
            border: 4px solid rgba(102, 126, 234, 0.5);
          }

          .slide-overlay.active {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }

          .slide-icon {
            font-size: 100px;
            text-align: center;
            margin-bottom: 30px;
            animation: iconFloat 3s ease-in-out infinite;
          }

          @keyframes iconFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }

          .slide-title {
            font-size: 56px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 40px;
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientShift 3s ease infinite;
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
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
            font-weight: 500;
            line-height: 1.6;
          }

          .slide-point:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: 700;
            font-size: 32px;
          }

          /* Footer */
          .footer-bar {
            background: rgba(0, 0, 0, 0.5);
            padding: 15px 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-top: 2px solid rgba(102, 126, 234, 0.3);
          }

          .footer-text {
            color: white;
            font-size: 20px;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          }

          /* Audio Element (hidden) */
          audio {
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="meeting-container">
          <!-- Header -->
          <div class="header-bar">
            <div class="meeting-title">
              <span>🎭 AI Demo: Meta Reveal</span>
              <span class="live-badge">● LIVE</span>
            </div>
            <div class="recording-time" id="timer">00:00</div>
          </div>

          <!-- Main Content -->
          <div class="content-area">
            <!-- Kylie's Video Box -->
            <div class="video-box" id="kylie-box">
              <div class="video-header">
                <div class="participant-name">
                  <span class="mic-icon">🎤</span>
                  Kylie - AI Customer
                </div>
              </div>
              <div class="video-content">
                <div class="heartbeat"></div>
                <div class="heartbeat" style="animation-delay: 0.3s;"></div>
                <div class="avatar">K</div>
                <div class="captions" id="kylie-captions"></div>
                <div class="speaking-indicator" id="kylie-speaking"></div>
              </div>
            </div>

            <!-- Kyle's Video Box -->
            <div class="video-box" id="kyle-box">
              <div class="video-header">
                <div class="participant-name">
                  <span class="mic-icon">🎤</span>
                  Kyle - AI Presenter
                </div>
              </div>
              <div class="video-content">
                <div class="heartbeat"></div>
                <div class="heartbeat" style="animation-delay: 0.3s;"></div>
                <div class="avatar kyle">K</div>
                <div class="captions" id="kyle-captions"></div>
                <div class="speaking-indicator" id="kyle-speaking"></div>
              </div>
            </div>
          </div>

          <!-- Slide Overlay -->
          <div class="slide-overlay" id="slide-overlay"></div>

          <!-- Footer -->
          <div class="footer-bar">
            <div class="footer-text">Powered by Kestrel VoiceOps | AI-Powered Customer Engagement</div>
          </div>
        </div>

        <!-- Audio Player -->
        <audio id="audio-player"></audio>

        <script>
          let startTime = Date.now();
          setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const secs = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = mins + ':' + secs;
          }, 1000);
        </script>
      </body>
      </html>
    `);

    console.log('✅ Meeting interface ready\n');
    console.log('🎭 Playing demo with audio...\n');

    let currentSlideIndex = -1;

    for (let i = 0; i < conversation.length; i++) {
      const turn = conversation[i];
      const speakerLower = turn.speaker.toLowerCase();
      
      console.log(`${turn.speaker}: ${turn.text.substring(0, 80)}...`);

      // Show slide if needed
      if (turn.slideIndex !== undefined && turn.slideIndex !== currentSlideIndex) {
        currentSlideIndex = turn.slideIndex;
        const slide = demoSlides[currentSlideIndex];
        
        await page.evaluate((slide) => {
          const overlay = document.getElementById('slide-overlay');
          if (overlay) {
            overlay.innerHTML = `
              <div class="slide-icon">${slide.icon}</div>
              <div class="slide-title">${slide.title}</div>
              <ul class="slide-points">
                ${slide.points.map(point => `<li class="slide-point">${point}</li>`).join('')}
              </ul>
            `;
            overlay.classList.add('active');
            setTimeout(() => overlay.classList.remove('active'), 5000);
          }
        }, slide);
      }

      // Activate speaker's box
      await page.evaluate((speaker) => {
        const kylieBox = document.getElementById('kylie-box');
        const kyleBox = document.getElementById('kyle-box');
        const kylieSpeaking = document.getElementById('kylie-speaking');
        const kyleSpeaking = document.getElementById('kyle-speaking');

        if (speaker === 'kylie') {
          kylieBox?.classList.add('active');
          kyleBox?.classList.remove('active');
          kylieSpeaking?.classList.add('active');
          kyleSpeaking?.classList.remove('active');
        } else {
          kyleBox?.classList.add('active');
          kylieBox?.classList.remove('active');
          kyleSpeaking?.classList.add('active');
          kylieSpeaking?.classList.remove('active');
        }
      }, speakerLower);

      // Update captions
      await page.evaluate((speaker, text) => {
        const captionsId = speaker === 'kylie' ? 'kylie-captions' : 'kyle-captions';
        const captions = document.getElementById(captionsId);
        if (captions) {
          captions.textContent = text;
        }
      }, speakerLower, turn.text);

      // Play audio
      if (turn.audioFile && fs.existsSync(turn.audioFile)) {
        const audioBuffer = fs.readFileSync(turn.audioFile);
        const base64Audio = audioBuffer.toString('base64');
        
        await page.evaluate((base64) => {
          return new Promise((resolve) => {
            const audio = document.getElementById('audio-player') as HTMLAudioElement;
            audio.src = `data:audio/mp3;base64,${base64}`;
            audio.volume = 1.0;
            audio.onended = () => resolve(true);
            audio.onerror = () => resolve(false);
            audio.play().catch(() => resolve(false));
          });
        }, base64Audio);

        await page.waitForTimeout(500);
      } else {
        const duration = Math.max(3000, turn.text.length * 60);
        await page.waitForTimeout(duration);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await page.waitForTimeout(3000);

    if (browser) await browser.close();

    console.log('🎉 Meeting-style demo finished!');
    console.log('📹 Use OBS or Game Bar to record next time\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    throw error;
  }
}

if (require.main === module) {
  generateMeetingDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateMeetingDemo };
