/**
 * OBS-Ready Demo Generator
 * Creates podcast-style assets for OBS Studio recording
 * No meeting UI, no fake webcams - just clean audio + visuals
 */

import * as fs from 'fs';
import * as path from 'path';
import { createCanvas } from 'canvas';

interface ConversationTurn {
  speaker: 'SARAH' | 'JARVIS';
  text: string;
  audioFile?: string;
  timestamp: number;
}

async function generateOBSDemo() {
  console.log('🎬 OBS Demo Asset Generator');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const outputDir = path.join(__dirname, '../obs-assets');
  const audioDir = path.join(outputDir, 'audio');
  const visualsDir = path.join(outputDir, 'visuals');
  const slidesDir = path.join(outputDir, 'slides');

  // Create directories
  [outputDir, audioDir, visualsDir, slidesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Read transcript
  const transcriptPath = path.join(__dirname, '../temp/transcript.txt');
  if (!fs.existsSync(transcriptPath)) {
    console.error('❌ No transcript found. Run generate-demo first.');
    process.exit(1);
  }

  const transcript = fs.readFileSync(transcriptPath, 'utf-8');
  const lines = transcript.split('\n\n').filter(line => line.trim());

  const conversation: ConversationTurn[] = [];
  const tempDir = path.join(__dirname, '../temp');
  const audioFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.mp3')).sort();

  let timestamp = 0;
  lines.forEach((line) => {
    const match = line.match(/^(SARAH|JARVIS): (.+)$/s);
    if (match) {
      const speaker = match[1] as 'SARAH' | 'JARVIS';
      const audioFile = audioFiles.find(f => f.startsWith(match[1].toLowerCase()));
      
      if (audioFile) {
        audioFiles.splice(audioFiles.indexOf(audioFile), 1);
      }

      conversation.push({
        speaker,
        text: match[2],
        audioFile: audioFile ? path.join(tempDir, audioFile) : undefined,
        timestamp,
      });

      // Estimate duration
      timestamp += Math.max(3, match[2].length * 0.06);
    }
  });

  console.log(`✅ Loaded ${conversation.length} conversation turns\n`);

  // Step 1: Generate Avatars
  console.log('🎨 Step 1: Generating avatars...');
  await generateAvatar('SARAH', '#f093fb', visualsDir);
  await generateAvatar('JARVIS', '#667eea', visualsDir);
  await generateBackground(visualsDir);
  console.log('✅ Avatars created\n');

  // Step 2: Copy and organize audio files
  console.log('🔊 Step 2: Organizing audio files...');
  const audioPlaylist: { file: string; speaker: string; text: string; duration: number }[] = [];
  
  conversation.forEach((turn, index) => {
    if (turn.audioFile && fs.existsSync(turn.audioFile)) {
      const newFileName = `${String(index + 1).padStart(3, '0')}_${turn.speaker.toLowerCase()}.mp3`;
      const destPath = path.join(audioDir, newFileName);
      fs.copyFileSync(turn.audioFile, destPath);
      
      audioPlaylist.push({
        file: newFileName,
        speaker: turn.speaker,
        text: turn.text.substring(0, 100),
        duration: Math.max(3, turn.text.length * 0.06),
      });
      
      console.log(`  ✓ ${newFileName}`);
    }
  });
  console.log('✅ Audio files organized\n');

  // Step 3: Generate slide images
  console.log('📊 Step 3: Generating slide images...');
  const slides = [
    {
      title: 'The Problem',
      icon: '⚠️',
      points: [
        '30% of calls missed during business hours',
        '90% missed after-hours',
        '$28K lifetime value lost per missed call'
      ]
    },
    {
      title: 'The Solution',
      icon: '⚡',
      points: [
        '200ms response time (10x faster)',
        '24/7 availability',
        'Real-time calendar booking'
      ]
    },
    {
      title: 'Real Results',
      icon: '📈',
      points: [
        '$18,400 additional revenue (month 1)',
        'Zero missed calls in 90 days',
        '4.9★ customer satisfaction'
      ]
    }
  ];

  for (let i = 0; i < slides.length; i++) {
    await generateSlideImage(slides[i], i + 1, slidesDir);
    console.log(`  ✓ Slide ${i + 1}: ${slides[i].title}`);
  }
  console.log('✅ Slides created\n');

  // Step 4: Generate OBS scene configuration
  console.log('⚙️  Step 4: Generating OBS configuration...');
  const obsConfig = generateOBSConfig(audioPlaylist);
  fs.writeFileSync(
    path.join(outputDir, 'obs-setup.json'),
    JSON.stringify(obsConfig, null, 2)
  );
  console.log('✅ OBS config created\n');

  // Step 5: Generate audio timeline script
  console.log('📝 Step 5: Creating audio timeline...');
  const timeline = generateTimeline(audioPlaylist);
  fs.writeFileSync(path.join(outputDir, 'audio-timeline.txt'), timeline);
  console.log('✅ Timeline created\n');

  // Step 6: Generate setup instructions
  console.log('📖 Step 6: Creating setup guide...');
  const instructions = generateInstructions(outputDir);
  fs.writeFileSync(path.join(outputDir, 'OBS-SETUP-GUIDE.md'), instructions);
  console.log('✅ Setup guide created\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 OBS Assets Ready!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📁 Assets location: ${outputDir}`);
  console.log('📖 Read: OBS-SETUP-GUIDE.md for instructions\n');
  console.log('Next steps:');
  console.log('  1. Install OBS Studio (free)');
  console.log('  2. Follow OBS-SETUP-GUIDE.md');
  console.log('  3. Import scenes and audio');
  console.log('  4. Record your demo!\n');
}

async function generateAvatar(name: string, color: string, outputDir: string): Promise<void> {
  const canvas = createCanvas(640, 640);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 640, 640);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color === '#f093fb' ? '#f5576c' : '#764ba2');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 640, 640);

  // Letter
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 280px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name[0], 320, 320);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, `avatar_${name.toLowerCase()}.png`), buffer);
}

async function generateBackground(outputDir: string): Promise<void> {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0F1115';
  ctx.fillRect(0, 0, 1920, 1080);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'background.png'), buffer);
}

async function generateSlideImage(slide: any, index: number, outputDir: string): Promise<void> {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0F1115';
  ctx.fillRect(0, 0, 1920, 1080);

  // Icon
  ctx.font = '120px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(slide.icon, 960, 200);

  // Title with gradient effect (simulate with solid color)
  ctx.fillStyle = '#764ba2';
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(slide.title, 960, 320);

  // Points
  ctx.fillStyle = '#ffffff';
  ctx.font = '42px Arial, sans-serif';
  ctx.textAlign = 'left';
  
  slide.points.forEach((point: string, i: number) => {
    const y = 450 + (i * 100);
    
    // Checkmark
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('✓', 400, y);
    
    // Point text
    ctx.fillStyle = '#ffffff';
    ctx.font = '42px Arial, sans-serif';
    ctx.fillText(point, 480, y);
  });

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, `slide_${index}.png`), buffer);
}

function generateOBSConfig(audioPlaylist: any[]): any {
  return {
    scenes: [
      {
        name: 'SCENE_01_PODCAST_INTRO',
        sources: [
          {
            name: 'Background',
            type: 'image_source',
            settings: {
              file: 'visuals/background.png',
            },
            transform: { pos: { x: 0, y: 0 }, scale: { x: 1, y: 1 } }
          },
          {
            name: 'Avatar_Sarah',
            type: 'image_source',
            settings: {
              file: 'visuals/avatar_sarah.png',
            },
            transform: { pos: { x: 280, y: 220 }, scale: { x: 1, y: 1 } }
          },
          {
            name: 'Avatar_Jarvis',
            type: 'image_source',
            settings: {
              file: 'visuals/avatar_jarvis.png',
            },
            transform: { pos: { x: 1000, y: 220 }, scale: { x: 1, y: 1 } }
          },
          {
            name: 'Label_Sarah',
            type: 'text_gdiplus_v2',
            settings: {
              text: 'Sarah - AI Customer',
              font: { face: 'Inter', size: 42 },
              color: 0xFFFFFFFF,
              opacity: 85
            },
            transform: { pos: { x: 450, y: 900 } }
          },
          {
            name: 'Label_Jarvis',
            type: 'text_gdiplus_v2',
            settings: {
              text: 'JARVIS - AI Presenter',
              font: { face: 'Inter', size: 42 },
              color: 0xFFFFFFFF,
              opacity: 85
            },
            transform: { pos: { x: 1150, y: 900 } }
          }
        ]
      },
      {
        name: 'SCENE_02_PPT_DEMO',
        sources: [
          {
            name: 'Slide_Display',
            type: 'image_source',
            settings: {
              file: 'slides/slide_1.png',
            },
            transform: { pos: { x: 0, y: 0 }, scale: { x: 1, y: 1 } }
          },
          {
            name: 'Avatar_Jarvis_Small',
            type: 'image_source',
            settings: {
              file: 'visuals/avatar_jarvis.png',
            },
            transform: { 
              pos: { x: 1652, y: 812 }, 
              scale: { x: 0.34375, y: 0.34375 }
            }
          }
        ]
      }
    ],
    audioSources: audioPlaylist.map((item, index) => ({
      name: `Audio_${String(index + 1).padStart(3, '0')}`,
      type: 'ffmpeg_source',
      settings: {
        local_file: `audio/${item.file}`,
        is_local_file: true
      },
      monitoring: 'monitor_and_output',
      track: 1
    }))
  };
}

function generateTimeline(audioPlaylist: any[]): string {
  let timeline = 'AUDIO TIMELINE FOR OBS\n';
  timeline += '═══════════════════════════════════════════════\n\n';
  
  let currentTime = 0;
  audioPlaylist.forEach((item, index) => {
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    timeline += `[${timeStr}] ${item.speaker}\n`;
    timeline += `File: ${item.file}\n`;
    timeline += `Text: ${item.text}...\n`;
    timeline += `Duration: ~${Math.floor(item.duration)}s\n\n`;
    
    currentTime += item.duration;
  });

  timeline += `\nTotal Duration: ~${Math.floor(currentTime / 60)}m ${Math.floor(currentTime % 60)}s\n`;
  return timeline;
}

function generateInstructions(outputDir: string): string {
  return `# OBS Studio Setup Guide - AI Demo Recording

## 📋 Prerequisites

1. **Install OBS Studio** (Free)
   - Download: https://obsproject.com/
   - Version: 30.0 or later

2. **Optional Plugins** (Free, recommended)
   - obs-shaderfilter: Rounded corners, shadows
   - obs-move-transition: Smooth scene transitions

## 🎬 Quick Setup (5 minutes)

### Step 1: Create New Scene Collection

1. Open OBS Studio
2. Scene Collection → New → "AI Demo"

### Step 2: Import Scene 1 - Podcast Intro

1. Click **"+"** under Scenes
2. Name: **SCENE_01_PODCAST_INTRO**
3. Add sources (in order):

   **Background:**
   - Source: Image
   - File: \`visuals/background.png\` (create solid #0F1115 if missing)
   - Transform: Fit to screen (1920x1080)

   **Avatar - Kylie:**
   - Source: Image
   - File: \`visuals/avatar_kylie.png\`
   - Position: X=280, Y=220
   - Size: 640x640

   **Avatar - Kyle:**
   - Source: Image
   - File: \`visuals/avatar_kyle.png\`
   - Position: X=1000, Y=220
   - Size: 640x640

   **Label - Kylie:**
   - Source: Text (GDI+)
   - Text: "Kylie - AI Customer"
   - Font: Inter/Roboto, 42px
   - Color: White, 85% opacity
   - Position: X=450, Y=900

   **Label - Kyle:**
   - Source: Text (GDI+)
   - Text: "Kyle - AI Presenter"
   - Font: Inter/Roboto, 42px
   - Color: White, 85% opacity
   - Position: X=1150, Y=900

### Step 3: Import Scene 2 - PPT Demo

1. Click **"+"** under Scenes
2. Name: **SCENE_02_PPT_DEMO**
3. Add sources:

   **Slide Display:**
   - Source: Image
   - File: \`slides/slide_1.png\`
   - Transform: Fit to screen (1920x1080)

   **Avatar - Kyle (Small):**
   - Source: Image
   - File: \`visuals/avatar_kyle.png\`
   - Position: X=1652, Y=812
   - Size: 220x220

### Step 4: Add Audio Sources

**CRITICAL: Do NOT use Desktop Audio or Microphone**

For each audio file in \`audio/\` folder:

1. Click **"+"** under Sources
2. Select: **Media Source**
3. Name: \`Audio_001\`, \`Audio_002\`, etc.
4. Settings:
   - ✅ Local File: Browse to \`audio/001_kylie.mp3\`
   - ✅ Restart playback when source becomes active
   - ❌ Loop (unchecked)
5. Audio Settings:
   - Audio Monitoring: **Monitor and Output**
   - Track: **1**

Repeat for all audio files (001-019).

### Step 5: Configure Transitions

1. Scene Transitions → Add → **Fade**
2. Duration: **400ms**
3. Hotkeys:
   - Scene 1: Ctrl+1
   - Scene 2: Ctrl+2

### Step 6: Recording Settings

1. Settings → Output
   - Output Mode: Simple
   - Recording Quality: High Quality, Medium File Size
   - Recording Format: MP4
   - Encoder: x264

2. Settings → Video
   - Base Resolution: 1920x1080
   - Output Resolution: 1920x1080
   - FPS: 30

3. Settings → Audio
   - Sample Rate: 48kHz
   - Channels: Stereo

## 🎥 Recording Workflow

### Preparation

1. Open OBS Studio
2. Select Scene: **SCENE_01_PODCAST_INTRO**
3. Verify all avatars and labels visible
4. Check audio levels (should be silent until you play media)

### Recording Process

1. **Start Recording** (Ctrl+R or button)

2. **Play Audio Files in Order:**
   - Right-click \`Audio_001\` → Restart
   - Wait for completion
   - Right-click \`Audio_002\` → Restart
   - Continue through all files

3. **Switch to Slides:**
   - When conversation mentions "30% missed calls"
   - Press **Ctrl+2** (switch to SCENE_02_PPT_DEMO)
   - Change slide source to \`slide_1.png\`

4. **Continue Audio:**
   - Keep playing audio files in order
   - Switch slides manually when topics change:
     - Slide 1: Problem (30% missed calls)
     - Slide 2: Solution (200ms response)
     - Slide 3: Results ($18K revenue)

5. **Stop Recording** (Ctrl+R)

### Post-Recording

- Video saved to: \`Videos/\` folder (default)
- Review and trim if needed (DaVinci Resolve Free)

## 📊 Audio Timeline Reference

See \`audio-timeline.txt\` for:
- Exact file order
- Speaker for each file
- Estimated durations
- When to switch scenes/slides

## 🎨 Optional Enhancements

### Rounded Corners (obs-shaderfilter)

1. Right-click Avatar → Filters → Add → Shader Filter
2. Load shader: \`rounded_corners.shader\`
3. Adjust radius: 40px

### Smooth Transitions (obs-move-transition)

1. Scene Transitions → Add → Move
2. Duration: 400ms
3. Easing: Cubic In/Out

## ⚠️ Troubleshooting

**No Audio:**
- Check Audio Monitoring: Monitor and Output
- Verify audio files exist in \`audio/\` folder
- Check OBS audio mixer (should show levels when playing)

**Avatars Cut Off:**
- Verify positions: Kylie X=280, Kyle X=1000
- Check canvas size: 1920x1080
- Reset transform if needed

**Slides Not Showing:**
- Verify \`slides/\` folder has slide_1.png, slide_2.png, slide_3.png
- Check source path in OBS

## 📁 Asset Structure

\`\`\`
obs-assets/
├── audio/
│   ├── 001_kylie.mp3
│   ├── 002_kyle.mp3
│   └── ... (all conversation audio)
├── visuals/
│   ├── avatar_kylie.png (640x640)
│   ├── avatar_kyle.png (640x640)
│   └── background.png (1920x1080, #0F1115)
├── slides/
│   ├── slide_1.png (1920x1080)
│   ├── slide_2.png (1920x1080)
│   └── slide_3.png (1920x1080)
├── obs-setup.json (scene config reference)
├── audio-timeline.txt (playback order)
└── OBS-SETUP-GUIDE.md (this file)
\`\`\`

## ✅ Final Checklist

- [ ] OBS Studio installed
- [ ] Scene 1 created with both avatars
- [ ] Scene 2 created with slides
- [ ] All audio files added as Media Sources
- [ ] Audio monitoring set to "Monitor and Output"
- [ ] Recording settings configured (1080p, 30fps)
- [ ] Transitions configured (400ms fade)
- [ ] Hotkeys assigned (Ctrl+1, Ctrl+2)
- [ ] Test recording (30 seconds)

## 🎉 You're Ready!

Press **Ctrl+R** to start recording your AI demo.

---

**Questions?** Check audio-timeline.txt for exact playback order.
`;
}

if (require.main === module) {
  generateOBSDemo()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

export { generateOBSDemo };
