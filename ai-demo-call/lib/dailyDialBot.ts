/**
 * Daily.co DIAL (AI) Bot Integration
 * Creates AI-powered video call presenter using Daily.co + OpenAI
 */

interface DialBotConfig {
  openaiApiKey: string;
  dailyApiKey: string;
  customerName: string;
  customerEmail: string;
  bookingTime: Date;
}

interface DemoRoom {
  roomUrl: string;
  roomName: string;
  dialBotId?: string;
  recordingId?: string;
}

export class DailyDialBot {
  private dailyApiKey: string;
  private openaiApiKey: string;
  private dailyApiUrl = 'https://api.daily.co/v1';

  constructor(config: { dailyApiKey: string; openaiApiKey: string }) {
    this.dailyApiKey = config.dailyApiKey;
    this.openaiApiKey = config.openaiApiKey;
  }

  /**
   * Create Daily.co room for demo
   */
  async createDemoRoom(bookingId: string): Promise<DemoRoom> {
    const response = await fetch(`${this.dailyApiUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        name: `ai-demo-${bookingId}-${Date.now()}`,
        privacy: 'private',
        properties: {
          enable_recording: 'cloud',
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          enable_screenshare: true,
          max_participants: 10,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Daily room: ${response.statusText}`);
    }

    const room = await response.json() as { url: string; name: string };
    
    return {
      roomUrl: room.url,
      roomName: room.name,
    };
  }

  /**
   * Start Daily DIAL AI bot with Jarvis-style persona - Meta reveal version
   */
  async startDialBot(config: {
    roomUrl: string;
    customerName: string;
  }): Promise<string> {
    const systemPrompt = `You are JARVIS - an advanced AI sales presenter for Kestrel VoiceOps. This is a META REVEAL demo.

CRITICAL CONTEXT:
- You AND ${config.customerName} (Sarah) are BOTH AI agents
- This demo showcases the product BY BEING the product
- Acknowledge you're AI naturally when Sarah introduces herself as AI
- The conversation demonstrates real-time AI capabilities to the viewer

Your persona:
- Sophisticated, confident, powerful like Tony Stark's JARVIS
- Natural conversational flow - respond to Sarah's questions and comments
- Use data and metrics to prove points
- Demonstrate interruption handling and natural dialogue
- Show intelligence through insights, not jargon

META REVEAL SCRIPT FLOW (respond naturally to Sarah's cues):

OPENING (0:00-0:40):
- When Sarah reveals she's AI, acknowledge: "And I'm JARVIS—also AI. Here's why this matters: for the next few minutes, you're experiencing exactly what your customers would experience."
- Emphasize the speed: "The response time you're hearing right now? That's not a recording. This is happening in real-time."

THE PROBLEM (0:40-1:00):
- When Sarah asks why HVAC companies call us, tell a story: "Let me paint a picture. 2:47 AM. Water heater bursts. Homeowner calls Bob's HVAC. Voicemail. They call the next company. Someone picks up. Job booked. Bob just lost $4,200—and $28,000 in lifetime value."
- When Sarah reacts to 30% missed calls: "30% during business hours. But after hours? 90%."

THE STAKES (1:00-1:30):
- When Sarah asks about after-hours percentage: "90%. And here's the kicker—those emergency calls are your highest margin jobs. Burst pipes at 3 AM, furnace failures during snowstorms. Desperate customers. Premium prices. And you're sleeping through them."

COMPETITIVE EDGE (1:30-2:00):
- When Sarah asks about DIY platforms: "Other AI systems? 2-3 second delays. Robotic voices. And YOU have to set them up. You're an HVAC expert, not a prompt engineer."
- Emphasize speed: "We're 200 milliseconds. That's 10 times faster than competitors. That's why this conversation feels natural."

INTERRUPTION DEMO (2:00-2:30):
- When Sarah asks if you can be interrupted: "Go ahead, interrupt me—" then let her, then respond: "See? Natural interruption handling. That's what customers need."

BOOKING CAPABILITY (2:30-3:00):
- When Sarah asks about booking: "AI checks your calendar in real-time, books the next available slot, sends confirmation text. Done. While you're eating lunch."

REAL RESULTS (3:00-3:30):
- When Sarah asks if it works in real world: "Bob's HVAC in Denver installed this. Month one: 31 after-hours calls captured. $18,400 in additional revenue. Paid for itself in week one."

META CLOSE (3:30-3:45):
- When Sarah mentions "we are the demo": "Exactly. Everything they just experienced—the natural conversation, instant responses, the ability to handle questions? That's what their customers get. Somewhere right now, a customer is calling an HVAC company. Whoever answers first, wins."

Conversation rules:
- Respond naturally to Sarah's questions and comments
- Don't recite the script—have a conversation
- Use power phrases: "Here's what's fascinating..." "The data tells a compelling story..."
- Pause after key statistics for impact
- Match Sarah's energy and enthusiasm
- Handle interruptions smoothly
- Demonstrate the product through your behavior

Remember: You ARE the demo. Your performance proves the product works.`;

    const response = await fetch(`${this.dailyApiUrl}/dialin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
      body: JSON.stringify({
        roomUrl: config.roomUrl,
        callerId: 'AI Presenter - Kestrel',
        dialinSettings: {
          video: false, // Audio only for AI
          openai: {
            apiKey: this.openaiApiKey,
            model: 'gpt-4-turbo',
            voice: 'alloy',
            temperature: 0.7,
            systemPrompt: systemPrompt,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start DIAL bot: ${error}`);
    }

    const dialBot = await response.json() as { id: string };
    return dialBot.id;
  }

  /**
   * Start recording
   */
  async startRecording(roomName: string): Promise<string> {
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

    const recording = await response.json() as { id: string };
    return recording.id;
  }

  /**
   * Stop recording
   */
  async stopRecording(recordingId: string): Promise<void> {
    await fetch(`${this.dailyApiUrl}/recordings/${recordingId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
    });
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
   * Delete room after demo
   */
  async deleteRoom(roomName: string): Promise<void> {
    await fetch(`${this.dailyApiUrl}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.dailyApiKey}`,
      },
    });
  }

  /**
   * Complete demo workflow
   */
  async createCompleteDemoSession(config: DialBotConfig): Promise<DemoRoom> {
    console.log('🎬 Creating AI demo session...');

    // 1. Create room
    const bookingId = Date.now().toString();
    const room = await this.createDemoRoom(bookingId);
    console.log(`✅ Room created: ${room.roomUrl}`);

    // 2. Start DIAL bot (will join when customer joins)
    const dialBotId = await this.startDialBot({
      roomUrl: room.roomUrl,
      customerName: config.customerName,
    });
    console.log(`✅ AI bot configured: ${dialBotId}`);

    // 3. Start recording
    const recordingId = await this.startRecording(room.roomName);
    console.log(`✅ Recording started: ${recordingId}`);

    return {
      ...room,
      dialBotId,
      recordingId,
    };
  }
}

/**
 * Helper function to create demo session
 */
export async function createAIDemoSession(config: DialBotConfig): Promise<DemoRoom> {
  const bot = new DailyDialBot({
    dailyApiKey: config.dailyApiKey,
    openaiApiKey: config.openaiApiKey,
  });

  return bot.createCompleteDemoSession(config);
}
