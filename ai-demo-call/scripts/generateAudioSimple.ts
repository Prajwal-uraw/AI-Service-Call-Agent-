/**
 * Generate AI Demo Audio - Simplified Version
 * No module imports, just generates audio for the 8 slides
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const slides = [
  {
    title: "The Problem",
    subtitle: "2:47 AM • Denver, Colorado",
    content: "Water heater burst. Customer panicking. Called Bob's HVAC. Got voicemail. Called next company on Google. They picked up. Bob lost $4,200. Actually lost $28,000 lifetime value."
  },
  {
    title: "Industry Reality",
    subtitle: "2024 HVAC Industry Study",
    content: "Average HVAC company misses 30% of calls during business hours. 90% of calls after hours. But here's what's wild: After-hours emergencies are your HIGHEST MARGIN calls. You're sleeping through your most profitable leads."
  },
  {
    title: "Old Solutions Don't Work",
    content: "Answering services? They're just expensive voicemail. Hiring someone? That's $40K a year minimum. On-call rotation? Your techs resent it. None of these actually solve the problem."
  },
  {
    title: "What if your phone just answered itself?",
    content: "No hiring. No training. No payroll. No scheduling. 24 hours a day. 7 days a week. 365 days a year. Every. Single. Call. Answered. That's what we built."
  },
  {
    title: "How It Works",
    content: "Customer calls. AI answers in under 1 second. If it's an emergency, AI instantly transfers to your on-call tech. If they want to book an appointment, AI checks your calendar in real-time, finds the next available slot, books it, sends a confirmation text. Done. While you're eating lunch."
  },
  {
    title: "Why We're Different",
    subtitle: "Competitors vs Warlord",
    content: "Other AI phone systems are slow. 2, 3 seconds before they respond. They sound robotic. And they make YOU set it up. We built something different. Our system responds in 200 milliseconds. Customers can't even tell. And we don't sell you software. We build your entire AI agent custom for your business."
  },
  {
    title: "One More Thing",
    content: "Every call your AI takes? It learns from it. We transcribe every conversation. Analyze the sentiment. Categorize the intent. And give you insights you've never had before. You finally get data on the one channel that's been a black box: your phone line."
  },
  {
    title: "Real Results",
    content: "Bob's HVAC in Denver installed this 6 months ago. First month, they captured 31 after-hours calls that would've gone to voicemail. That's $18,400 in additional revenue. Maria in Phoenix hasn't missed a single call in 90 days. Her customer satisfaction score went from 4.3 to 4.9. These aren't outliers. This is normal."
  }
];

async function main() {
  console.log('🎙️ Generating AI Demo Audio\n');

  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.error('❌ Error: OPENAI_API_KEY not set');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  console.log(`📋 Generating narration for ${slides.length} slides...\n`);

  // Create output directory
  const audioDir = path.join(__dirname, '../recordings/audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    console.log(`[${i + 1}/${slides.length}] ${slide.title}`);

    // Create narration text
    const narrationText = `${slide.title}. ${slide.subtitle || ''}. ${slide.content}`;
    
    console.log(`   Generating audio...`);

    try {
      // Generate audio with OpenAI TTS
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'alloy',
        input: narrationText,
        speed: 0.9,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const audioPath = path.join(audioDir, `slide-${i + 1}.mp3`);
      fs.writeFileSync(audioPath, buffer);

      console.log(`   ✅ Saved (${(buffer.length / 1024).toFixed(1)} KB)\n`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Audio generation complete!\n');
  console.log('📂 Files saved to:', audioDir);
  console.log('\n🎬 Next steps:');
  console.log('   1. Review audio files in recordings/audio/');
  console.log('   2. Visit http://localhost:3000/demo to see the presentation');
  console.log('   3. Play audio files manually while presenting');
  console.log('   4. Or use Daily.co to record video (see DAILY_RECORDING_SETUP.md)');
}

main().catch(console.error);
