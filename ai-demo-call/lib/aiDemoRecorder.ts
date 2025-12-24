/**
 * AI-to-AI Demo Recording System
 * 
 * Records live demo calls between AI presenter and simulated customer
 * No human audio recording needed - AI generates both sides
 */

import OpenAI from 'openai';

interface RecordingConfig {
  presenterSystemPrompt: string;
  customerSystemPrompt: string;
  slideTimings: number[]; // Duration of each slide in seconds
  outputFormat: 'audio' | 'transcript' | 'both';
}

interface DemoRecording {
  audioUrl?: string;
  transcript: ConversationTurn[];
  slideTransitions: number[]; // Timestamps when slides change
  totalDuration: number;
}

interface ConversationTurn {
  speaker: 'presenter' | 'customer';
  text: string;
  timestamp: number;
  audioUrl?: string;
}

/**
 * AI Demo Recorder
 * Uses OpenAI Realtime API to simulate customer + presenter conversation
 */
export class AIDemoRecorder {
  private openai: OpenAI;
  private config: RecordingConfig;

  constructor(apiKey: string, config: RecordingConfig) {
    this.openai = new OpenAI({ apiKey });
    this.config = config;
  }

  /**
   * Record a full demo presentation
   * AI plays both presenter and customer roles
   */
  async recordDemo(): Promise<DemoRecording> {
    const transcript: ConversationTurn[] = [];
    const slideTransitions: number[] = [];
    let currentTime = 0;

    // Phase 1: Warm-up (AI presenter only)
    console.log('Recording Phase 1: Warm-up...');
    const warmup = await this.generatePresenterSpeech(
      'Opening script - introduce yourself and build rapport',
      currentTime
    );
    transcript.push(...warmup.turns);
    currentTime = warmup.endTime;

    // Phase 2-3: Slides (AI narration only, no customer)
    console.log('Recording Phase 2-3: Slide presentation...');
    for (let i = 0; i < this.config.slideTimings.length; i++) {
      slideTransitions.push(currentTime);
      
      const slideNarration = await this.generatePresenterSpeech(
        `Slide ${i + 1} narration`,
        currentTime
      );
      transcript.push(...slideNarration.turns);
      currentTime = slideNarration.endTime;
    }

    // Phase 4: Close (AI presenter + simulated customer Q&A)
    console.log('Recording Phase 4: Q&A and close...');
    const close = await this.generateConversation(
      'Handle objections and close the sale',
      currentTime,
      3 // 3 customer questions
    );
    transcript.push(...close.turns);
    currentTime = close.endTime;

    return {
      transcript,
      slideTransitions,
      totalDuration: currentTime,
    };
  }

  /**
   * Generate presenter speech (no customer interaction)
   */
  private async generatePresenterSpeech(
    prompt: string,
    startTime: number
  ): Promise<{ turns: ConversationTurn[]; endTime: number }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: this.config.presenterSystemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const text = response.choices[0].message.content || '';
    const estimatedDuration = this.estimateSpeechDuration(text);

    // Generate audio using TTS
    let audioUrl: string | undefined;
    if (this.config.outputFormat === 'audio' || this.config.outputFormat === 'both') {
      audioUrl = await this.generateAudio(text, 'alloy'); // OpenAI TTS voice
    }

    return {
      turns: [{
        speaker: 'presenter',
        text,
        timestamp: startTime,
        audioUrl,
      }],
      endTime: startTime + estimatedDuration,
    };
  }

  /**
   * Generate conversation between presenter and customer
   */
  private async generateConversation(
    scenario: string,
    startTime: number,
    numExchanges: number
  ): Promise<{ turns: ConversationTurn[]; endTime: number }> {
    const turns: ConversationTurn[] = [];
    let currentTime = startTime;

    for (let i = 0; i < numExchanges; i++) {
      // Customer asks question
      const customerQuestion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.config.customerSystemPrompt },
          { role: 'user', content: `Ask objection #${i + 1} about the AI phone system` },
        ],
        temperature: 0.8,
      });

      const questionText = customerQuestion.choices[0].message.content || '';
      const questionDuration = this.estimateSpeechDuration(questionText);
      
      turns.push({
        speaker: 'customer',
        text: questionText,
        timestamp: currentTime,
      });
      currentTime += questionDuration;

      // Presenter responds
      const presenterResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.config.presenterSystemPrompt },
          { role: 'user', content: `Customer asked: "${questionText}". Respond professionally.` },
        ],
        temperature: 0.7,
      });

      const responseText = presenterResponse.choices[0].message.content || '';
      const responseDuration = this.estimateSpeechDuration(responseText);

      let audioUrl: string | undefined;
      if (this.config.outputFormat === 'audio' || this.config.outputFormat === 'both') {
        audioUrl = await this.generateAudio(responseText, 'alloy');
      }

      turns.push({
        speaker: 'presenter',
        text: responseText,
        timestamp: currentTime,
        audioUrl,
      });
      currentTime += responseDuration;
    }

    return { turns, endTime: currentTime };
  }

  /**
   * Generate audio using OpenAI TTS
   */
  private async generateAudio(text: string, voice: string): Promise<string> {
    const mp3 = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as any,
      input: text,
      speed: 0.9, // Slightly slower for clarity
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    // In production, upload to S3/CDN and return URL
    // For now, return base64 data URL
    const base64 = buffer.toString('base64');
    return `data:audio/mp3;base64,${base64}`;
  }

  /**
   * Estimate speech duration based on text length
   * Average speaking rate: ~150 words per minute
   */
  private estimateSpeechDuration(text: string): number {
    const words = text.split(/\s+/).length;
    const wordsPerSecond = 150 / 60; // 2.5 words per second
    return words / wordsPerSecond;
  }

  /**
   * Export recording to file
   */
  async exportRecording(recording: DemoRecording, format: 'json' | 'srt' | 'vtt'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(recording, null, 2);
      
      case 'srt':
        return this.generateSRT(recording.transcript);
      
      case 'vtt':
        return this.generateVTT(recording.transcript);
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate SRT subtitle file
   */
  private generateSRT(transcript: ConversationTurn[]): string {
    return transcript.map((turn, index) => {
      const startTime = this.formatSRTTime(turn.timestamp);
      const endTime = this.formatSRTTime(
        transcript[index + 1]?.timestamp || turn.timestamp + 5
      );
      
      return `${index + 1}\n${startTime} --> ${endTime}\n${turn.text}\n`;
    }).join('\n');
  }

  /**
   * Generate WebVTT subtitle file
   */
  private generateVTT(transcript: ConversationTurn[]): string {
    const entries = transcript.map((turn, index) => {
      const startTime = this.formatVTTTime(turn.timestamp);
      const endTime = this.formatVTTTime(
        transcript[index + 1]?.timestamp || turn.timestamp + 5
      );
      
      return `${startTime} --> ${endTime}\n${turn.text}`;
    }).join('\n\n');

    return `WEBVTT\n\n${entries}`;
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  private formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }
}

/**
 * Example usage
 */
export async function recordAIDemo() {
  const recorder = new AIDemoRecorder(
    process.env.OPENAI_API_KEY!,
    {
      presenterSystemPrompt: `You are Claude, an AI sales presenter for Warlord HVAC AI phone system.
        Speak naturally, confidently, and persuasively. Use the scripts provided in phase1-scripts.md.
        Pace yourself 20% slower than normal for clarity. Use strategic pauses for impact.`,
      
      customerSystemPrompt: `You are a skeptical HVAC business owner evaluating an AI phone system.
        Ask tough but realistic questions about cost, reliability, and customer acceptance.
        Be professional but challenging.`,
      
      slideTimings: [60, 45, 45, 90, 120, 60, 90, 60], // 8 slides
      outputFormat: 'both',
    }
  );

  console.log('Starting AI demo recording...');
  const recording = await recorder.recordDemo();
  
  console.log(`Recording complete! Duration: ${recording.totalDuration}s`);
  console.log(`Transcript entries: ${recording.transcript.length}`);
  
  // Export as JSON
  const json = await recorder.exportRecording(recording, 'json');
  console.log('JSON export ready');
  
  // Export as subtitles
  const srt = await recorder.exportRecording(recording, 'srt');
  console.log('SRT subtitles ready');
  
  return recording;
}
