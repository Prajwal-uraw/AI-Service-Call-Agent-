/**
 * Generate Audio-Only Demo (No Video)
 * Uses OpenAI TTS to create narration for all slides
 */

import OpenAI from 'openai';
import { demoSlides } from '../slides/slide-definitions.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🎙️ Generating AI Demo Audio (Audio Only)\n');

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  console.log('📋 Configuration:');
  console.log(`   Slides: ${demoSlides.length}`);
  console.log(`   Total duration: ~${demoSlides.reduce((sum, s) => sum + s.duration, 0)}s`);
  console.log('');

  // Create output directory
  const audioDir = path.join(__dirname, '../recordings/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  console.log('🎙️ Generating narration for each slide...\n');

  for (let i = 0; i < demoSlides.length; i++) {
    const slide = demoSlides[i];
    console.log(`Slide ${i + 1}/${demoSlides.length}: ${slide.title}`);

    // Create narration text
    const narrationText = `${slide.title}. ${slide.subtitle || ''}. ${slide.content.filter(c => c).join('. ')}`;
    
    console.log(`   Generating audio (${narrationText.length} characters)...`);

    // Generate audio
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: narrationText,
      speed: 0.9,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const audioPath = path.join(audioDir, `slide-${i + 1}.mp3`);
    fs.writeFileSync(audioPath, buffer);

    console.log(`   ✅ Saved: ${audioPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    console.log('');
  }

  console.log('🎉 Audio generation complete!\n');
  console.log('📊 Summary:');
  console.log(`   Files: ${demoSlides.length} MP3 files`);
  console.log(`   Location: ${audioDir}`);
  console.log('');
  console.log('🎬 Next steps:');
  console.log('   1. Review audio files');
  console.log('   2. Use with demo presentation at http://localhost:3000/demo');
  console.log('   3. Or record video with Daily.co (see DAILY_RECORDING_SETUP.md)');
  console.log('');
}

main().catch(console.error);
