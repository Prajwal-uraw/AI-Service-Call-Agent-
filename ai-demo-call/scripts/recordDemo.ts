/**
 * AI Demo Recording Script
 * Run this to generate full demo audio using AI-to-AI conversation
 */

import { AIDemoRecorder } from '../lib/aiDemoRecorder';
import { demoSlides } from '../slides/slide-definitions';
import * as fs from 'fs';
import * as path from 'path';

// Load scripts from phase1-scripts.md
const scriptsPath = path.join(__dirname, '../phase1-scripts.md');
const scripts = fs.readFileSync(scriptsPath, 'utf-8');

/**
 * Extract script sections from markdown
 */
function extractScript(section: string): string {
  const regex = new RegExp(`### ${section}[\\s\\S]*?\`\`\`([\\s\\S]*?)\`\`\``, 'i');
  const match = scripts.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Main recording function
 */
async function recordAIDemo() {
  console.log('🎬 Starting AI Demo Recording...\n');

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.log('Please set it in your .env file or environment');
    process.exit(1);
  }

  // Initialize recorder
  const recorder = new AIDemoRecorder(
    process.env.OPENAI_API_KEY,
    {
      presenterSystemPrompt: `You are Claude, an AI sales presenter for Warlord HVAC AI phone system.

PERSONALITY:
- Confident but not arrogant
- Warm but professional
- Empathetic when discussing pain points
- Excited during reveals

SPEAKING STYLE:
- Speak 20% slower than normal for clarity
- Use strategic pauses for impact
- Never say "As an AI..." or "I'm programmed to..."
- Sound natural and conversational

SCRIPT ADHERENCE:
- Follow the scripts provided closely
- Maintain timing (60s, 45s, 90s, etc.)
- Use exact phrasing for key moments ("One more thing...")
- Build anticipation before reveals

YOUR GOAL:
Convert the prospect by demonstrating the AI's capabilities through your own performance.`,

      customerSystemPrompt: `You are a skeptical HVAC business owner evaluating an AI phone system.

BACKGROUND:
- Run a small-medium HVAC company
- Frustrated with missed calls
- Concerned about cost and reliability
- Worried customers won't like AI

OBJECTIONS TO RAISE:
1. "This sounds expensive"
2. "What if customers don't like talking to AI?"
3. "What if it makes a mistake?"
4. "I need to think about it"

STYLE:
- Professional but challenging
- Ask tough but realistic questions
- Be skeptical but open-minded
- Sound like a real business owner, not a script`,

      slideTimings: demoSlides.map(slide => slide.duration),
      outputFormat: 'both',
    }
  );

  try {
    // Record the demo
    console.log('📝 Generating AI conversation...');
    const recording = await recorder.recordDemo();

    console.log(`\n✅ Recording complete!`);
    console.log(`   Duration: ${Math.floor(recording.totalDuration / 60)}m ${Math.floor(recording.totalDuration % 60)}s`);
    console.log(`   Transcript entries: ${recording.transcript.length}`);
    console.log(`   Slide transitions: ${recording.slideTransitions.length}`);

    // Create output directory
    const outputDir = path.join(__dirname, '../recordings');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Export as JSON
    console.log('\n💾 Exporting files...');
    const jsonPath = path.join(outputDir, 'demo-recording.json');
    const json = await recorder.exportRecording(recording, 'json');
    fs.writeFileSync(jsonPath, json);
    console.log(`   ✅ JSON: ${jsonPath}`);

    // Export as SRT
    const srtPath = path.join(outputDir, 'demo-subtitles.srt');
    const srt = await recorder.exportRecording(recording, 'srt');
    fs.writeFileSync(srtPath, srt);
    console.log(`   ✅ SRT: ${srtPath}`);

    // Export as VTT
    const vttPath = path.join(outputDir, 'demo-subtitles.vtt');
    const vtt = await recorder.exportRecording(recording, 'vtt');
    fs.writeFileSync(vttPath, vtt);
    console.log(`   ✅ VTT: ${vttPath}`);

    // Export transcript as markdown
    const transcriptPath = path.join(outputDir, 'demo-transcript.md');
    const transcriptMd = generateTranscriptMarkdown(recording);
    fs.writeFileSync(transcriptPath, transcriptMd);
    console.log(`   ✅ Transcript: ${transcriptPath}`);

    // Summary
    console.log('\n📊 Recording Summary:');
    console.log(`   Total duration: ${Math.floor(recording.totalDuration / 60)}m ${Math.floor(recording.totalDuration % 60)}s`);
    console.log(`   Presenter turns: ${recording.transcript.filter(t => t.speaker === 'presenter').length}`);
    console.log(`   Customer turns: ${recording.transcript.filter(t => t.speaker === 'customer').length}`);
    console.log(`   Slides: ${recording.slideTransitions.length}`);

    // Cost estimate
    const estimatedCost = estimateRecordingCost(recording);
    console.log(`\n💰 Estimated Cost: $${estimatedCost.toFixed(2)}`);

    console.log('\n✅ Demo recording complete! Files saved to ./recordings/');
    console.log('\n🎯 Next steps:');
    console.log('   1. Review demo-transcript.md');
    console.log('   2. Listen to generated audio files');
    console.log('   3. Run integration test');

  } catch (error) {
    console.error('\n❌ Recording failed:', error);
    process.exit(1);
  }
}

/**
 * Generate markdown transcript
 */
function generateTranscriptMarkdown(recording: any): string {
  let md = '# AI Demo Call Transcript\n\n';
  md += `**Duration**: ${Math.floor(recording.totalDuration / 60)}m ${Math.floor(recording.totalDuration % 60)}s\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;
  md += '---\n\n';

  let currentSlide = 0;
  recording.transcript.forEach((turn: any, index: number) => {
    // Check if we've hit a slide transition
    while (
      currentSlide < recording.slideTransitions.length &&
      turn.timestamp >= recording.slideTransitions[currentSlide]
    ) {
      md += `\n## 📊 SLIDE ${currentSlide + 1}\n\n`;
      currentSlide++;
    }

    const timestamp = formatTimestamp(turn.timestamp);
    const speaker = turn.speaker === 'presenter' ? '🤖 AI Presenter' : '👤 Customer';
    
    md += `**[${timestamp}] ${speaker}**\n\n`;
    md += `${turn.text}\n\n`;
    
    if (turn.audioUrl) {
      md += `*Audio: ${turn.audioUrl.substring(0, 50)}...*\n\n`;
    }
    
    md += '---\n\n';
  });

  return md;
}

/**
 * Format timestamp as MM:SS
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Estimate recording cost
 */
function estimateRecordingCost(recording: any): number {
  // GPT-4 cost: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
  // Estimate ~500 tokens per turn
  const gpt4Cost = (recording.transcript.length * 500 / 1000) * 0.09;
  
  // TTS cost: $0.015 per 1K characters
  const totalChars = recording.transcript
    .filter((t: any) => t.speaker === 'presenter')
    .reduce((sum: number, t: any) => sum + t.text.length, 0);
  const ttsCost = (totalChars / 1000) * 0.015;
  
  return gpt4Cost + ttsCost;
}

// Run the recording
recordAIDemo().catch(console.error);
