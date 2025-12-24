/**
 * Automated Demo Video Generator
 * Creates a professional demo video with AI customer and AI presenter
 */

import { DailyDialBot } from '../lib/dailyDialBot';
import { CustomerBot } from '../lib/customerBot';
import { RecordingManager } from '../lib/recordingManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../frontend/.env.local') });

async function generateAutomatedDemo() {
  console.log('🎬 Starting Automated Demo Video Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const dailyApiKey = process.env.DAILY_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!dailyApiKey || !openaiApiKey) {
    console.error('❌ Error: Missing API keys');
    console.error('Please set DAILY_API_KEY and OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  let customerBot: CustomerBot | null = null;
  let roomName = '';

  try {
    // Step 1: Create Daily.co room
    console.log('📹 Step 1: Creating Daily.co room...');
    const dialBot = new DailyDialBot({
      dailyApiKey,
      openaiApiKey,
    });

    const room = await dialBot.createDemoRoom(`demo-${Date.now()}`);
    roomName = room.roomName;
    console.log(`✅ Room created: ${room.roomUrl}\n`);
    
    // Show room URL for observer to join
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 JOIN AS OBSERVER (KC - Founder)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n🔗 Room URL: ${room.roomUrl}`);
    console.log('\n📋 Instructions:');
    console.log('   1. Open the URL above in your browser');
    console.log('   2. Enter name: "KC - Founder"');
    console.log('   3. Join with camera/mic OFF (you\'ll be muted)');
    console.log('   4. Watch the AI agents demonstrate the product');
    console.log('   5. Demo will start in 15 seconds...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Wait 15 seconds for user to join
    console.log('⏳ Waiting 15 seconds for you to join the room...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Step 2: Start AI Presenter (JARVIS)
    console.log('🤖 Step 2: Starting AI Presenter (JARVIS)...');
    const dialBotId = await dialBot.startDialBot({
      roomUrl: room.roomUrl,
      customerName: 'Sarah Chen',
    });
    console.log(`✅ JARVIS is ready (Bot ID: ${dialBotId})\n`);

    // Step 3: Start recording
    console.log('🎥 Step 3: Starting recording...');
    const recordingId = await dialBot.startRecording(room.roomName);
    console.log(`✅ Recording started (ID: ${recordingId})\n`);

    // Step 4: Wait for presenter to fully join
    console.log('⏳ Step 4: Waiting for presenter to join room...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    console.log('✅ Presenter joined\n');

    // Step 5: Start customer bot
    console.log('👤 Step 5: Starting AI Customer (Sarah Chen)...');
    customerBot = new CustomerBot(openaiApiKey);
    await customerBot.joinRoom(room.roomUrl);
    console.log('✅ Customer joined\n');

    // Step 6: Run the demo conversation
    console.log('🎭 Step 6: Running demo conversation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 DEMO IN PROGRESS - This will take ~3 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await customerBot.runDemoScript();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo conversation completed!\n');

    // Step 7: Wait a bit before ending
    console.log('⏳ Step 7: Wrapping up...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 8: Customer leaves
    console.log('👋 Step 8: Customer leaving room...');
    await customerBot.leaveRoom();
    console.log('✅ Customer left\n');

    // Step 9: Wait for recording to capture everything
    console.log('⏳ Step 9: Finalizing recording...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 10: Stop recording
    console.log('🛑 Step 10: Stopping recording...');
    await dialBot.stopRecording(recordingId);
    console.log('✅ Recording stopped\n');

    // Step 11: Wait for recording to be ready and download
    console.log('⏳ Step 11: Waiting for recording to process...');
    const recordingManager = new RecordingManager(dailyApiKey);
    
    const recording = await recordingManager.waitForRecording(recordingId, 120);
    console.log('✅ Recording ready!\n');

    // Step 12: Download and save recording
    console.log('💾 Step 12: Downloading and saving video...');
    const videoPath = await recordingManager.downloadRecording(
      recordingId,
      `ai-demo-${Date.now()}.mp4`
    );
    console.log(`✅ Video saved locally: ${videoPath}\n`);

    // Step 13: Cleanup
    console.log('🧹 Step 13: Cleaning up...');
    await dialBot.deleteRoom(room.roomName);
    console.log('✅ Room deleted\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Demo video generated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📹 Recording Details:');
    console.log(`   Duration: ${Math.round(recording.duration / 60)} minutes`);
    console.log(`   Local File: ${videoPath}`);
    console.log(`   Download Link: ${recording.download_link}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All done! Your demo video is ready to play.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return { videoPath, downloadLink: recording.download_link };

  } catch (error: any) {
    console.error('\n❌ Error generating demo:', error.message);
    
    // Cleanup on error
    if (customerBot) {
      try {
        await customerBot.leaveRoom();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    if (roomName) {
      try {
        const dialBot = new DailyDialBot({
          dailyApiKey: dailyApiKey!,
          openaiApiKey: openaiApiKey!,
        });
        await dialBot.deleteRoom(roomName);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateAutomatedDemo()
    .then((downloadLink) => {
      console.log('🎬 Demo video ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to generate demo:', error);
      process.exit(1);
    });
}

export { generateAutomatedDemo };
