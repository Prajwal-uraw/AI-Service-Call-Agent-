/**
 * Daily.co Video Recording Infrastructure
 * Integrates Daily API for video calls with OpenAI for AI-powered demos
 */

import OpenAI from 'openai';

interface DailyRoomConfig {
  name?: string;
  privacy?: 'public' | 'private';
  properties?: {
    enable_recording?: 'cloud' | 'local';
    enable_chat?: boolean;
    start_video_off?: boolean;
    start_audio_off?: boolean;
  };
}

interface RecordingConfig {
  openaiApiKey: string;
  dailyApiKey: string;
  presenterPrompt: string;
  customerPrompt: string;
  slides: any[];
}

/**
 * Daily Video Recorder
 * Creates video calls and records AI-powered demos
 */
export class DailyVideoRecorder {
  private openai: OpenAI;
  private dailyApiKey: string;
  private dailyApiUrl = 'https://api.daily.co/v1';

  constructor(config: RecordingConfig) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.dailyApiKey = config.dailyApiKey;
  }

  /**
   * Create a Daily room for recording
   */
  async createRoom(config?: DailyRoomConfig): Promise<any> {
    const response = await fetch(`${this.dailyApiUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        name: config?.name || `demo-${Date.now()}`,
        privacy: config?.privacy || 'private',
        properties: {
          enable_recording: 'cloud',
          enable_chat: false,
          start_video_off: false,
          start_audio_off: false,
          ...config?.properties,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Daily room: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Start recording a Daily room
   */
  async startRecording(roomName: string): Promise<any> {
    const response = await fetch(`${this.dailyApiUrl}/recordings/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        room_name: roomName,
        layout: {
          preset: 'default',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start recording: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stop recording
   */
  async stopRecording(recordingId: string): Promise<any> {
    const response = await fetch(`${this.dailyApiUrl}/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to stop recording: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get recording download URL
   */
  async getRecording(recordingId: string): Promise<any> {
    const response = await fetch(`${this.dailyApiUrl}/recordings/${recordingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get recording: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate AI narration using OpenAI TTS
   */
  async generateNarration(text: string, voice: string = 'alloy'): Promise<Buffer> {
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: voice as any,
      input: text,
      speed: 0.9,
    });

    return Buffer.from(await mp3.arrayBuffer());
  }

  /**
   * Generate conversation using OpenAI
   */
  async generateConversation(
    presenterPrompt: string,
    customerPrompt: string,
    scenario: string
  ): Promise<{ presenter: string; customer: string }> {
    // Generate customer question
    const customerResponse = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: customerPrompt },
        { role: 'user', content: scenario },
      ],
      temperature: 0.8,
    });

    const customerText = customerResponse.choices[0].message.content || '';

    // Generate presenter response
    const presenterResponse = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: presenterPrompt },
        { role: 'user', content: `Customer said: "${customerText}". Respond professionally.` },
      ],
      temperature: 0.7,
    });

    const presenterText = presenterResponse.choices[0].message.content || '';

    return {
      customer: customerText,
      presenter: presenterText,
    };
  }

  /**
   * Delete a Daily room
   */
  async deleteRoom(roomName: string): Promise<void> {
    await fetch(`${this.dailyApiUrl}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
    });
  }
}

/**
 * Helper function to create and record a demo
 */
export async function recordDemoWithDaily(config: RecordingConfig) {
  const recorder = new DailyVideoRecorder(config);

  console.log('🎬 Creating Daily room...');
  const room = await recorder.createRoom({
    name: `ai-demo-${Date.now()}`,
    privacy: 'private',
    properties: {
      enable_recording: 'cloud',
    },
  });

  console.log(`✅ Room created: ${room.url}`);
  console.log(`📹 Room name: ${room.name}`);

  console.log('\n🎙️ Starting recording...');
  const recording = await recorder.startRecording(room.name);
  console.log(`✅ Recording started: ${recording.id}`);

  // Simulate demo duration (you would actually join the room and present here)
  console.log('\n⏳ Recording demo (this would be your actual presentation)...');
  console.log('   In production, you would:');
  console.log('   1. Join the Daily room');
  console.log('   2. Share screen with slides');
  console.log('   3. Play AI-generated narration');
  console.log('   4. Record the full presentation');

  // For now, wait a bit to simulate recording
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n🛑 Stopping recording...');
  await recorder.stopRecording(recording.id);

  console.log('\n⏳ Waiting for recording to process...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('\n📥 Fetching recording...');
  const finalRecording = await recorder.getRecording(recording.id);

  console.log('\n✅ Recording complete!');
  console.log(`   Download URL: ${finalRecording.download_link}`);
  console.log(`   Duration: ${finalRecording.duration}s`);

  // Clean up
  console.log('\n🧹 Cleaning up room...');
  await recorder.deleteRoom(room.name);

  return {
    recordingId: recording.id,
    downloadUrl: finalRecording.download_link,
    duration: finalRecording.duration,
    roomUrl: room.url,
  };
}
