/**
 * Simple Demo Generator - No DIAL API needed
 * Uses two Puppeteer bots with pre-generated audio
 */

import { CustomerBot } from '../lib/customerBot';
import { PresenterBot } from '../lib/presenterBot';
import { RecordingManager } from '../lib/recordingManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../frontend/.env.local') });

async function generateSimpleDemo() {
  console.log('🎬 Starting Simple Demo Video Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const dailyApiKey = process.env.DAILY_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!dailyApiKey || !openaiApiKey) {
    console.error('❌ Error: Missing API keys');
    process.exit(1);
  }

  let customerBot: CustomerBot | null = null;
  let presenterBot: PresenterBot | null = null;
  let roomName = '';

  try {
    // Step 1: Create Daily.co room manually
    console.log('📹 Step 1: Creating Daily.co room...');
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: `simple-demo-${Date.now()}`,
        privacy: 'public',
        properties: {
          enable_recording: 'cloud',
          enable_chat: false,
          start_video_off: false,
          start_audio_off: false,
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

    // Show room URL for observer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 JOIN AS OBSERVER (KC - Founder)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n🔗 Room URL: ${room.url}`);
    console.log('\n📋 Instructions:');
    console.log('   1. Open the URL above in your browser');
    console.log('   2. Enter name: "KC - Founder"');
    console.log('   3. Join with camera/mic OFF');
    console.log('   4. Watch the two AI agents demonstrate');
    console.log('   5. Demo will start in 20 seconds...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Wait for user to join
    console.log('⏳ Waiting 20 seconds for you to join...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Step 2: Start recording
    console.log('🎥 Step 2: Starting recording...');
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

    const recording = await recordingResponse.json() as { id: string };
    const recordingId = recording.id;
    console.log(`✅ Recording started (ID: ${recordingId})\n`);

    // Step 3: Launch presenter bot (JARVIS)
    console.log('🤖 Step 3: Launching JARVIS (Presenter Bot)...');
    presenterBot = new PresenterBot(openaiApiKey);
    await presenterBot.joinRoom(room.url);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4: Launch customer bot (Sarah)
    console.log('👤 Step 4: Launching Sarah (Customer Bot)...');
    customerBot = new CustomerBot(openaiApiKey);
    await customerBot.joinRoom(room.url);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Run demo conversation
    console.log('\n🎭 Step 5: Running demo conversation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 DEMO IN PROGRESS - ~3:45 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Run both scripts in parallel
    await Promise.all([
      customerBot.runDemoScript(),
      presenterBot.runPresenterScript(),
    ]);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo conversation completed!\n');

    // Step 6: Wait before cleanup
    console.log('⏳ Step 6: Wrapping up...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 7: Bots leave
    console.log('👋 Step 7: Bots leaving room...');
    await customerBot.leaveRoom();
    await presenterBot.leaveRoom();
    console.log('✅ Bots left\n');

    // Step 8: Stop recording
    console.log('🛑 Step 8: Stopping recording...');
    await fetch(`https://api.daily.co/v1/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${dailyApiKey}` },
    });
    console.log('✅ Recording stopped\n');

    // Step 9: Wait for processing and download
    console.log('⏳ Step 9: Waiting for recording to process...');
    const recordingManager = new RecordingManager(dailyApiKey);
    const finalRecording = await recordingManager.waitForRecording(recordingId, 120);
    console.log('✅ Recording ready!\n');

    // Step 10: Download
    console.log('💾 Step 10: Downloading video...');
    const videoPath = await recordingManager.downloadRecording(
      recordingId,
      `simple-demo-${Date.now()}.mp4`
    );
    console.log(`✅ Video saved: ${videoPath}\n`);

    // Step 11: Cleanup
    console.log('🧹 Step 11: Cleaning up...');
    await fetch(`https://api.daily.co/v1/rooms/${room.name}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${dailyApiKey}` },
    });
    console.log('✅ Room deleted\n');

    // Success
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Demo video generated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📹 Recording Details:');
    console.log(`   Duration: ${Math.round(finalRecording.duration / 60)} minutes`);
    console.log(`   Local File: ${videoPath}`);
    console.log(`   Download Link: ${finalRecording.download_link}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { videoPath, downloadLink: finalRecording.download_link };

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);

    // Cleanup on error
    if (customerBot) {
      try { await customerBot.leaveRoom(); } catch (e) {}
    }
    if (presenterBot) {
      try { await presenterBot.leaveRoom(); } catch (e) {}
    }
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
  generateSimpleDemo()
    .then(() => {
      console.log('✅ Demo generation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateSimpleDemo };
