/**
 * Record AI Demo with Daily.co Video Infrastructure
 * 
 * This script:
 * 1. Creates a Daily room
 * 2. Generates AI narration using OpenAI TTS
 * 3. Records the presentation
 * 4. Downloads the final video
 */

import { DailyVideoRecorder, recordDemoWithDaily } from '../lib/dailyVideoRecorder';
import { demoSlides } from '../slides/slide-definitions';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🎬 AI Demo Video Recording with Daily.co\n');

  // Check for required API keys
  const openaiKey = process.env.OPENAI_API_KEY;
  const dailyKey = process.env.DAILY_API_KEY;

  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.log('\nSet it with:');
    console.log('$env:OPENAI_API_KEY="sk-..."');
    process.exit(1);
  }

  if (!dailyKey) {
    console.error('❌ Error: DAILY_API_KEY environment variable not set');
    console.log('\nGet your Daily API key from: https://dashboard.daily.co/developers');
    console.log('Then set it with:');
    console.log('$env:DAILY_API_KEY="your-daily-api-key"');
    process.exit(1);
  }

  try {
    // Initialize recorder
    const recorder = new DailyVideoRecorder({
      openaiApiKey: openaiKey,
      dailyApiKey: dailyKey,
      presenterPrompt: `You are Claude, an AI sales presenter for Warlord HVAC AI phone system.
        Speak naturally, confidently, and persuasively. Use the scripts provided.
        Pace yourself 20% slower than normal for clarity.`,
      customerPrompt: `You are a skeptical HVAC business owner evaluating an AI phone system.
        Ask tough but realistic questions about cost, reliability, and customer acceptance.`,
      slides: demoSlides,
    });

    console.log('📋 Demo Configuration:');
    console.log(`   Slides: ${demoSlides.length}`);
    console.log(`   Total duration: ~${demoSlides.reduce((sum, s) => sum + s.duration, 0)}s`);
    console.log('');

    // Step 1: Generate AI narration for all slides
    console.log('🎙️ Step 1: Generating AI narration...\n');
    const narrations: { slide: number; text: string; audioBuffer: Buffer }[] = [];

    for (let i = 0; i < demoSlides.length; i++) {
      const slide = demoSlides[i];
      console.log(`   Generating narration for Slide ${i + 1}: ${slide.title}`);
      
      // Create narration text from slide content
      const narrationText = `${slide.title}. ${slide.subtitle || ''}. ${slide.content.filter(c => c).join('. ')}`;
      
      // Generate audio
      const audioBuffer = await recorder.generateNarration(narrationText, 'alloy');
      
      narrations.push({
        slide: i + 1,
        text: narrationText,
        audioBuffer,
      });

      // Save audio file
      const audioDir = path.join(__dirname, '../recordings/audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      
      const audioPath = path.join(audioDir, `slide-${i + 1}.mp3`);
      fs.writeFileSync(audioPath, audioBuffer);
      console.log(`   ✅ Saved: ${audioPath}`);
    }

    console.log(`\n✅ Generated ${narrations.length} narrations\n`);

    // Step 2: Create Daily room and start recording
    console.log('🎬 Step 2: Creating Daily room...\n');
    
    const room = await recorder.createRoom({
      name: `ai-demo-${Date.now()}`,
      privacy: 'private',
      properties: {
        enable_recording: 'cloud',
        enable_chat: false,
      },
    });

    console.log(`✅ Room created!`);
    console.log(`   Room URL: ${room.url}`);
    console.log(`   Room name: ${room.name}`);
    console.log('');

    // Step 3: Start recording
    console.log('📹 Step 3: Starting recording...\n');
    
    const recording = await recorder.startRecording(room.name);
    console.log(`✅ Recording started!`);
    console.log(`   Recording ID: ${recording.id}`);
    console.log('');

    // Step 4: Instructions for manual recording
    console.log('📝 Step 4: Record your demo\n');
    console.log('   INSTRUCTIONS:');
    console.log('   1. Open the room URL in your browser: ' + room.url);
    console.log('   2. Share your screen showing the slides at http://localhost:3000/demo');
    console.log('   3. Play the generated audio files in order:');
    narrations.forEach((n, i) => {
      console.log(`      - Slide ${i + 1}: recordings/audio/slide-${i + 1}.mp3`);
    });
    console.log('   4. When finished, press Enter here to stop recording...');
    console.log('');

    // Wait for user to press Enter
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => resolve());
    });

    // Step 5: Stop recording
    console.log('\n🛑 Step 5: Stopping recording...\n');
    await recorder.stopRecording(recording.id);
    console.log('✅ Recording stopped!');
    console.log('');

    // Step 6: Wait for processing
    console.log('⏳ Step 6: Waiting for Daily to process recording...\n');
    console.log('   This may take 1-2 minutes...');
    
    let finalRecording;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        finalRecording = await recorder.getRecording(recording.id);
        
        if (finalRecording.download_link) {
          console.log('✅ Recording processed!');
          break;
        }
      } catch (error) {
        // Still processing
      }
      
      attempts++;
      console.log(`   Attempt ${attempts}/${maxAttempts}...`);
    }

    if (!finalRecording?.download_link) {
      console.error('❌ Recording processing timed out');
      console.log('   Check Daily dashboard: https://dashboard.daily.co/recordings');
      process.exit(1);
    }

    // Step 7: Download recording
    console.log('\n📥 Step 7: Downloading recording...\n');
    
    const videoResponse = await fetch(finalRecording.download_link);
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    
    const videoDir = path.join(__dirname, '../recordings/video');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    
    const videoPath = path.join(videoDir, `demo-${Date.now()}.mp4`);
    fs.writeFileSync(videoPath, videoBuffer);
    
    console.log(`✅ Video saved: ${videoPath}`);
    console.log(`   Duration: ${finalRecording.duration}s`);
    console.log(`   Size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    // Step 8: Clean up
    console.log('🧹 Step 8: Cleaning up...\n');
    await recorder.deleteRoom(room.name);
    console.log('✅ Room deleted');
    console.log('');

    // Summary
    console.log('🎉 Demo recording complete!\n');
    console.log('📊 Summary:');
    console.log(`   Video: ${videoPath}`);
    console.log(`   Audio files: ${narrations.length} files in recordings/audio/`);
    console.log(`   Duration: ${finalRecording.duration}s`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Review the video');
    console.log('   2. Copy to frontend/public/videos/');
    console.log('   3. Add to website CTA');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
