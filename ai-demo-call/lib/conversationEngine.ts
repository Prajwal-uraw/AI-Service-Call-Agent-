/**
 * Conversation Engine - ChatGPT-powered bot conversation
 * Bots talk to each other using ChatGPT API, Daily.co just displays it
 */

import { OpenAI } from 'openai';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationTurn {
  speaker: 'sarah' | 'jarvis';
  text: string;
  timestamp: number;
}

export class ConversationEngine {
  private openai: OpenAI;
  private conversationHistory: Message[] = [];
  private turns: ConversationTurn[] = [];

  constructor(openaiApiKey: string) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
  }

  /**
   * Initialize conversation with system prompts
   */
  async initialize(): Promise<void> {
    // Sarah's system prompt
    const sarahPrompt = `You are Sarah, an AI voice agent for Kestrel VoiceOps. You're having a conversation with JARVIS (another AI) to demonstrate the product.

META REVEAL: You both acknowledge you're AI at the start.

Your role:
- Start by revealing you're AI: "Hi! I'm Sarah. I should be upfront—I'm not human. I'm one of Kestrel's AI voice agents."
- Ask natural questions about the product
- React with genuine interest and excitement
- Keep responses conversational and brief (1-2 sentences)
- Build excitement throughout the conversation

Topics to cover:
1. Meta reveal (you're both AI)
2. The problem (30% missed calls, 90% after-hours)
3. Competitive advantage (200ms response time)
4. Booking capability
5. Real results ($18K in month one)
6. Close with "We are the demo"

Keep it natural, conversational, and under 4 minutes total.`;

    // JARVIS system prompt
    const jarvisPrompt = `You are JARVIS, an AI sales presenter for Kestrel VoiceOps. You're demonstrating the product to Sarah (another AI).

Your persona:
- Confident, data-driven, powerful like Tony Stark's JARVIS
- Use specific metrics and stories
- Keep responses concise but impactful (2-3 sentences)
- Build credibility with data

Key talking points:
- Bob's HVAC story (2:47 AM, lost $4,200 and $28K lifetime value)
- 30% missed during business hours, 90% after-hours
- 200ms response time (10x faster than competitors)
- Real-time calendar booking
- $18,400 in month one for Bob's HVAC

Style:
- "Let me paint a picture..."
- "Here's what's fascinating..."
- "The data tells a compelling story..."

Keep responses powerful but concise.`;

    this.conversationHistory = [
      { role: 'system', content: sarahPrompt },
    ];
  }

  /**
   * Generate Sarah's next response
   */
  async getSarahResponse(jarvisLastMessage?: string): Promise<string> {
    if (jarvisLastMessage) {
      this.conversationHistory.push({
        role: 'assistant',
        content: jarvisLastMessage,
      });
    }

    // Get Sarah's response
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: this.conversationHistory,
      max_tokens: 150,
      temperature: 0.8,
    });

    const sarahMessage = response.choices[0].message.content || '';
    
    this.conversationHistory.push({
      role: 'user',
      content: sarahMessage,
    });

    this.turns.push({
      speaker: 'sarah',
      text: sarahMessage,
      timestamp: Date.now(),
    });

    return sarahMessage;
  }

  /**
   * Generate JARVIS's response to Sarah
   */
  async getJarvisResponse(sarahMessage: string): Promise<string> {
    // Create JARVIS conversation context
    const jarvisHistory: Message[] = [
      {
        role: 'system',
        content: `You are JARVIS, an AI sales presenter for Kestrel VoiceOps. Respond to Sarah's question or comment with data-driven, confident answers. Keep it concise (2-3 sentences).`,
      },
      {
        role: 'user',
        content: sarahMessage,
      },
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: jarvisHistory,
      max_tokens: 200,
      temperature: 0.7,
    });

    const jarvisMessage = response.choices[0].message.content || '';

    this.turns.push({
      speaker: 'jarvis',
      text: jarvisMessage,
      timestamp: Date.now(),
    });

    return jarvisMessage;
  }

  /**
   * Run full conversation (meta reveal script)
   */
  async runConversation(): Promise<ConversationTurn[]> {
    console.log('🎭 Starting ChatGPT-powered conversation...\n');

    await this.initialize();

    // Turn 1: Sarah's meta reveal
    const sarah1 = await this.getSarahResponse();
    console.log(`💬 SARAH: ${sarah1}\n`);
    await this.delay(2000);

    // Turn 2: JARVIS responds
    const jarvis1 = await this.getJarvisResponse(sarah1);
    console.log(`🤖 JARVIS: ${jarvis1}\n`);
    await this.delay(2000);

    // Turn 3: Sarah asks about the problem
    const sarah2 = await this.getSarahResponse(jarvis1);
    console.log(`💬 SARAH: ${sarah2}\n`);
    await this.delay(2000);

    // Turn 4: JARVIS explains the problem
    const jarvis2 = await this.getJarvisResponse(sarah2);
    console.log(`🤖 JARVIS: ${jarvis2}\n`);
    await this.delay(2000);

    // Turn 5: Sarah asks about after-hours
    const sarah3 = await this.getSarahResponse(jarvis2);
    console.log(`💬 SARAH: ${sarah3}\n`);
    await this.delay(2000);

    // Turn 6: JARVIS gives the 90% stat
    const jarvis3 = await this.getJarvisResponse(sarah3);
    console.log(`🤖 JARVIS: ${jarvis3}\n`);
    await this.delay(2000);

    // Turn 7: Sarah asks about competitors
    const sarah4 = await this.getSarahResponse(jarvis3);
    console.log(`💬 SARAH: ${sarah4}\n`);
    await this.delay(2000);

    // Turn 8: JARVIS explains competitive edge
    const jarvis4 = await this.getJarvisResponse(sarah4);
    console.log(`🤖 JARVIS: ${jarvis4}\n`);
    await this.delay(2000);

    // Turn 9: Sarah asks about booking
    const sarah5 = await this.getSarahResponse(jarvis4);
    console.log(`💬 SARAH: ${sarah5}\n`);
    await this.delay(2000);

    // Turn 10: JARVIS explains booking
    const jarvis5 = await this.getJarvisResponse(sarah5);
    console.log(`🤖 JARVIS: ${jarvis5}\n`);
    await this.delay(2000);

    // Turn 11: Sarah asks about results
    const sarah6 = await this.getSarahResponse(jarvis5);
    console.log(`💬 SARAH: ${sarah6}\n`);
    await this.delay(2000);

    // Turn 12: JARVIS gives results
    const jarvis6 = await this.getJarvisResponse(sarah6);
    console.log(`🤖 JARVIS: ${jarvis6}\n`);
    await this.delay(2000);

    // Turn 13: Sarah's "we are the demo" close
    const sarah7 = await this.getSarahResponse(jarvis6);
    console.log(`💬 SARAH: ${sarah7}\n`);
    await this.delay(2000);

    // Turn 14: JARVIS final close
    const jarvis7 = await this.getJarvisResponse(sarah7);
    console.log(`🤖 JARVIS: ${jarvis7}\n`);

    console.log('\n✅ Conversation complete!\n');

    return this.turns;
  }

  /**
   * Get conversation transcript
   */
  getTranscript(): string {
    return this.turns
      .map(turn => `${turn.speaker.toUpperCase()}: ${turn.text}`)
      .join('\n\n');
  }

  /**
   * Save conversation to file
   */
  saveTranscript(filepath: string): void {
    const fs = require('fs');
    fs.writeFileSync(filepath, this.getTranscript());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
