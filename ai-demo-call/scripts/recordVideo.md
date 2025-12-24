# Record AI Demo Video - Quick Guide

**Goal**: Create a 3-4 minute video of AI giving sales pitch

---

## 🎬 Option 1: Simple Screen Recording (Recommended)

### Using Windows Built-in Game Bar

1. **Open the demo page**
   - Visit `http://localhost:3000/demo`
   - Press `F11` for fullscreen (optional)

2. **Start recording**
   - Press `Win + G` to open Game Bar
   - Click the **Record** button (or press `Win + Alt + R`)
   - You'll see a small recording indicator

3. **Start the demo**
   - Click "Start Demo" button
   - Audio plays automatically
   - Let it run for 3-4 minutes (first 4-5 slides)

4. **Stop recording**
   - Press `Win + Alt + R` again
   - Or click the stop button in Game Bar

5. **Find your video**
   - Location: `C:\Users\[YourName]\Videos\Captures\`
   - File: `[AppName] [Date].mp4`

---

## 🎬 Option 2: OBS Studio (Professional Quality)

### Setup (One-time)

1. **Download OBS**
   - Visit: https://obsproject.com/download
   - Install OBS Studio (free)

2. **Configure OBS**
   ```
   Scene Setup:
   - Add Source → Display Capture (for full screen)
   OR
   - Add Source → Window Capture (for just browser)
   
   Audio:
   - Desktop Audio: Enabled (captures system audio)
   - Mic: Disabled (we don't need it)
   
   Output Settings:
   - Format: MP4
   - Quality: High Quality, Medium File Size
   - Resolution: 1920x1080 (or 1280x720)
   ```

### Recording

1. **Open demo**: `http://localhost:3000/demo`
2. **In OBS**: Click "Start Recording"
3. **In browser**: Click "Start Demo"
4. **Wait**: Let it run for 3-4 minutes
5. **In OBS**: Click "Stop Recording"
6. **Find video**: `C:\Users\[YourName]\Videos\` (default)

---

## 🎬 Option 3: Automated Browser Recording

### Using Playwright (Code-based)

I can create a script that automatically:
- Opens the demo page
- Starts recording
- Plays the demo
- Stops after 3-4 minutes
- Saves the video

**Would you like me to create this automated script?**

---

## 📝 Recommended Settings

### For Best Quality

**Resolution**: 1920x1080 (Full HD)  
**Frame Rate**: 30 FPS  
**Bitrate**: 5000 kbps  
**Audio**: 192 kbps  
**Format**: MP4 (H.264)

### For Smaller File Size

**Resolution**: 1280x720 (HD)  
**Frame Rate**: 30 FPS  
**Bitrate**: 2500 kbps  
**Audio**: 128 kbps  
**Format**: MP4 (H.264)

---

## ⏱️ Timing for 3-4 Minutes

**Option A**: First 4 slides (~3 min)
- Slide 1: The Problem (30s)
- Slide 2: Industry Reality (35s)
- Slide 3: Old Solutions (25s)
- Slide 4: The Solution (25s)
- **Total**: ~2 minutes

**Option B**: First 5 slides (~3.5 min)
- Slides 1-4 (above)
- Slide 5: How It Works (40s)
- **Total**: ~2.5 minutes

**Option C**: First 6 slides (~4 min)
- Slides 1-5 (above)
- Slide 6: Why Different (45s)
- **Total**: ~3.5 minutes

---

## 🚀 Quick Start (Easiest Method)

```powershell
# 1. Open demo in browser
start http://localhost:3000/demo

# 2. Press Win + G (Game Bar)
# 3. Click Record button
# 4. Click "Start Demo" in browser
# 5. Wait 3-4 minutes
# 6. Press Win + Alt + R to stop
# 7. Video saved to Videos\Captures folder
```

---

## 📹 After Recording

### Find Your Video
```powershell
# Open Videos folder
explorer C:\Users\$env:USERNAME\Videos\Captures
```

### Copy to Project
```powershell
# Copy to frontend
Copy-Item "C:\Users\$env:USERNAME\Videos\Captures\[YourVideo].mp4" "frontend\public\videos\demo.mp4"
```

### Add to Website
```tsx
// In your component
<video controls className="w-full rounded-lg shadow-xl">
  <source src="/videos/demo.mp4" type="video/mp4" />
</video>
```

---

## 💡 Pro Tips

1. **Close unnecessary apps** - Less CPU usage = smoother recording
2. **Use fullscreen** - Press F11 for clean recording
3. **Hide cursor** (optional) - Some tools have this option
4. **Test first** - Do a 10-second test recording
5. **Check audio** - Make sure system audio is being captured

---

## ✅ What You'll Get

- **Duration**: 3-4 minutes
- **Content**: AI sales pitch with slides
- **Audio**: Professional AI narration
- **Visuals**: Smooth slide transitions
- **Quality**: HD video ready for website

---

**Recommendation**: Start with **Windows Game Bar** (Win + G). It's already installed and works great for this!
