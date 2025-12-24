/**
 * Smart Demo Generator - ChatGPT conversation displayed in Daily.co
 * Bots use ChatGPT API to converse, Daily.co just displays and records
 */

import { ConversationEngine } from '../lib/conversationEngine';
import { RecordingManager } from '../lib/recordingManager';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';
import { OpenAI } from 'openai';

dotenv.config({ path: path.join(__dirname, '../../frontend/.env.local') });

async function generateSmartDemo() {
  console.log('🎬 Starting Smart Demo Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const dailyApiKey = process.env.DAILY_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!dailyApiKey || !openaiApiKey) {
    console.error('❌ Missing API keys');
    process.exit(1);
  }

  let browser: Browser | null = null;
  let roomName = '';

  try {
    // Step 1: Generate conversation using ChatGPT
    console.log('💬 Step 1: Generating AI conversation with ChatGPT...');
    const conversation = new ConversationEngine(openaiApiKey);
    const turns = await conversation.runConversation();
    
    // Save transcript
    const transcriptPath = path.join(__dirname, '../temp/transcript.txt');
    conversation.saveTranscript(transcriptPath);
    console.log(`✅ Conversation generated (${turns.length} turns)\n`);

    // Step 2: Generate audio for each turn
    console.log('🎵 Step 2: Generating audio files...');
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const audioFiles: { speaker: string; file: string; text: string }[] = [];

    for (const turn of turns) {
      const voice = turn.speaker === 'sarah' ? 'nova' : 'alloy';
      console.log(`   Generating audio for ${turn.speaker}...`);

      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice as any,
        input: turn.text,
        speed: 1.0,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const audioPath = path.join(__dirname, '../temp', `${turn.speaker}-${Date.now()}.mp3`);
      fs.mkdirSync(path.dirname(audioPath), { recursive: true });
      fs.writeFileSync(audioPath, buffer);

      audioFiles.push({
        speaker: turn.speaker,
        file: audioPath,
        text: turn.text,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(`✅ Generated ${audioFiles.length} audio files\n`);

    // Step 3: Create Daily.co room
    console.log('📹 Step 3: Creating Daily.co room...');
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: `smart-demo-${Date.now()}`,
        privacy: 'public',
        properties: {
          enable_recording: 'cloud',
          enable_chat: false,
          enable_knocking: false,
          enable_prejoin_ui: false,
          max_participants: 10,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        },
      }),
    });

    const room = await roomResponse.json() as { url: string; name: string };
    roomName = room.name;
    console.log(`✅ Room created: ${room.url}\n`);

    // Step 4: Launch display bot FIRST (must be in room before recording)
    console.log('🖥️  Step 4: Launching display bot...');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--window-size=1920,1080',
      ],
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();
    
    // Create visual display page
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
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            width: 100%;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">🎭 AI Demo: Meta Reveal</div>
          <div id="messages"></div>
          <div class="footer">Powered by Kestrel VoiceOps</div>
        </div>
      </body>
      </html>
    `);

    console.log('✅ Display bot ready\n');

    // Step 5: Display bot joining room...
    console.log('🔗 Step 5: Display bot joining room...');
    await page.goto(room.url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);

    // Try to join
    try {
      const joinButton = await page.$('button');
      if (joinButton) {
        await joinButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Auto-join attempted');
    }

    console.log('✅ Display bot in room\n');

    // Step 6: NOW start recording (bot is in room)
    console.log('🎥 Step 6: Starting recording...');
    const recordingResponse = await fetch('https://api.daily.co/v1/recordings/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        room_name: room.name,
        layout: { preset: 'default' },
      }),
    });

    if (!recordingResponse.ok) {
      const error = await recordingResponse.text();
      throw new Error(`Failed to start recording: ${error}`);
    }

    const recording = await recordingResponse.json() as { id: string };
    const recordingId = recording.id;
    
    if (!recordingId) {
      throw new Error('Recording ID is undefined - recording may not have started');
    }
    
    console.log(`✅ Recording started (ID: ${recordingId})\n`);

    // Step 7: Play conversation
    console.log('🎭 Step 7: Playing AI conversation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const audio of audioFiles) {
      const speakerName = audio.speaker === 'sarah' ? 'SARAH' : 'JARVIS';
      const speakerClass = audio.speaker === 'sarah' ? 'sarah' : 'jarvis';
      
      console.log(`${speakerName}: ${audio.text.substring(0, 80)}...`);

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
      }, speakerName, audio.text, speakerClass);

      // Wait for speaking duration
      const duration = Math.max(3000, audio.text.length * 60);
      await page.waitForTimeout(duration);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Conversation playback complete!\n');

    // Step 8: Wait before cleanup
    console.log('⏳ Step 8: Finalizing recording...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 9: Stop recording
    console.log('🛑 Step 9: Stopping recording...');
    await fetch(`https://api.daily.co/v1/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${dailyApiKey}` },
    });
    console.log('✅ Recording stopped\n');

    // Step 10: Download
    console.log('💾 Step 10: Waiting for recording and downloading...');
    const recordingManager = new RecordingManager(dailyApiKey);
    const finalRecording = await recordingManager.waitForRecording(recordingId, 120);
    
    const videoPath = await recordingManager.downloadRecording(
      recordingId,
      `smart-demo-${Date.now()}.mp4`
    );
    console.log(`✅ Video saved: ${videoPath}\n`);

    // Cleanup
    console.log('🧹 Cleaning up...');
    if (browser) await browser.close();
    await fetch(`https://api.daily.co/v1/rooms/${room.name}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${dailyApiKey}` },
    });
    console.log('✅ Cleanup complete\n');

    // Success
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Smart demo video generated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📹 Details:');
    console.log(`   Local File: ${videoPath}`);
    console.log(`   Transcript: ${transcriptPath}`);
    console.log(`   Download Link: ${finalRecording.download_link}\n`);

    return { videoPath, transcriptPath };

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    if (roomName) {
      try {
        await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${dailyApiKey}` },
        });
      } catch (e) {}
    }
    throw error;
  }
}

if (require.main === module) {
  generateSmartDemo()
    .then(() => {
      console.log('✅ Demo complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateSmartDemo };
