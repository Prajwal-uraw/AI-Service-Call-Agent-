"""
OpenAI Service for AI Demo Agent
Handles STT (Whisper), LLM (GPT-4o), and TTS for real-time streaming
"""

import os
import asyncio
from typing import Optional, AsyncGenerator, Dict, Any, List
from openai import AsyncOpenAI
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    """
    Unified OpenAI service for AI Demo Agent
    - STT: Whisper for speech-to-text
    - LLM: GPT-4o and GPT-4o-mini for conversation
    - TTS: OpenAI TTS for text-to-speech
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.fast_model = "gpt-4o-mini"  # For intent detection
        self.premium_model = "gpt-4o"     # For AI responses
        self.tts_model = "tts-1"          # For speech synthesis
        self.tts_voice = "alloy"          # Voice: alloy, echo, fable, onyx, nova, shimmer
        
    # ==================== SPEECH-TO-TEXT (STT) ====================
    
    async def transcribe_audio(
        self, 
        audio_data: bytes, 
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Transcribe audio using Whisper API
        
        Args:
            audio_data: Audio bytes (WAV, MP3, etc.)
            language: Language code (default: 'en')
            
        Returns:
            {
                "text": "transcribed text",
                "duration": 2.5,
                "language": "en",
                "cost": 0.006
            }
        """
        try:
            # Whisper API expects a file-like object
            from io import BytesIO
            audio_file = BytesIO(audio_data)
            audio_file.name = "audio.wav"
            
            response = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=language,
                response_format="verbose_json"
            )
            
            # Calculate cost: $0.006 per minute
            duration = response.duration if hasattr(response, 'duration') else 0
            cost = (duration / 60) * 0.006
            
            return {
                "text": response.text,
                "duration": duration,
                "language": response.language if hasattr(response, 'language') else language,
                "cost": cost
            }
            
        except Exception as e:
            logger.error(f"STT error: {e}")
            raise
    
    async def transcribe_streaming(
        self, 
        audio_stream: AsyncGenerator[bytes, None]
    ) -> AsyncGenerator[str, None]:
        """
        Stream audio chunks and get real-time transcription
        Note: OpenAI Whisper doesn't support true streaming yet
        This batches chunks for near-real-time processing
        """
        buffer = bytearray()
        chunk_size = 16000 * 2  # 1 second of 16kHz 16-bit audio
        
        async for chunk in audio_stream:
            buffer.extend(chunk)
            
            # Process when buffer is large enough
            if len(buffer) >= chunk_size:
                result = await self.transcribe_audio(bytes(buffer))
                yield result["text"]
                buffer.clear()
        
        # Process remaining buffer
        if buffer:
            result = await self.transcribe_audio(bytes(buffer))
            yield result["text"]
    
    # ==================== LANGUAGE MODEL (LLM) ====================
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        use_premium: bool = True,
        max_tokens: int = 150,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Generate AI response using GPT-4o or GPT-4o-mini
        
        Args:
            messages: Conversation history
            system_prompt: System instructions
            use_premium: Use GPT-4o (True) or GPT-4o-mini (False)
            max_tokens: Max response length
            temperature: Creativity (0-1)
            
        Returns:
            {
                "text": "AI response",
                "tokens_used": 120,
                "cost": 0.0012,
                "model": "gpt-4o",
                "finish_reason": "stop"
            }
        """
        try:
            model = self.premium_model if use_premium else self.fast_model
            
            response = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Calculate cost
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            
            if model == "gpt-4o":
                # GPT-4o: $2.50/1M input, $10/1M output
                cost = (prompt_tokens / 1_000_000 * 2.50) + (completion_tokens / 1_000_000 * 10.00)
            else:
                # GPT-4o-mini: $0.15/1M input, $0.60/1M output
                cost = (prompt_tokens / 1_000_000 * 0.15) + (completion_tokens / 1_000_000 * 0.60)
            
            return {
                "text": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens,
                "cost": cost,
                "model": model,
                "finish_reason": response.choices[0].finish_reason
            }
            
        except Exception as e:
            logger.error(f"LLM error: {e}")
            raise
    
    async def detect_intent(
        self,
        user_message: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Fast intent detection using GPT-4o-mini
        
        Returns:
            {
                "intent": "pricing_question",
                "confidence": 0.95,
                "requires_human": False,
                "urgency": "medium"
            }
        """
        system_prompt = """You are an intent classifier for sales calls.
Classify the user's message into one of these intents:
- pricing_question
- technical_question
- objection
- ready_to_buy
- needs_more_info
- wants_human
- off_topic

Respond in JSON format:
{
    "intent": "intent_name",
    "confidence": 0.0-1.0,
    "requires_human": true/false,
    "urgency": "low/medium/high"
}"""
        
        messages = [{"role": "user", "content": user_message}]
        
        response = await self.generate_response(
            messages=messages,
            system_prompt=system_prompt,
            use_premium=False,  # Use fast model
            max_tokens=100,
            temperature=0.3
        )
        
        # Parse JSON response
        import json
        try:
            intent_data = json.loads(response["text"])
            intent_data["cost"] = response["cost"]
            return intent_data
        except:
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "requires_human": False,
                "urgency": "low",
                "cost": response["cost"]
            }
    
    # ==================== TEXT-TO-SPEECH (TTS) ====================
    
    async def synthesize_speech(
        self,
        text: str,
        voice: Optional[str] = None,
        speed: float = 1.0
    ) -> Dict[str, Any]:
        """
        Convert text to speech using OpenAI TTS
        
        Args:
            text: Text to synthesize
            voice: Voice name (alloy, echo, fable, onyx, nova, shimmer)
            speed: Speech speed (0.25 to 4.0)
            
        Returns:
            {
                "audio_data": bytes,
                "duration": 3.2,
                "cost": 0.015,
                "voice": "alloy"
            }
        """
        try:
            voice = voice or self.tts_voice
            
            response = await self.client.audio.speech.create(
                model=self.tts_model,
                voice=voice,
                input=text,
                speed=speed
            )
            
            audio_data = response.content
            
            # Estimate duration (rough: 150 words per minute)
            word_count = len(text.split())
            duration = (word_count / 150) * 60 / speed
            
            # Calculate cost: $15 per 1M characters
            char_count = len(text)
            cost = (char_count / 1_000_000) * 15.00
            
            return {
                "audio_data": audio_data,
                "duration": duration,
                "cost": cost,
                "voice": voice
            }
            
        except Exception as e:
            logger.error(f"TTS error: {e}")
            raise
    
    async def synthesize_streaming(
        self,
        text: str,
        voice: Optional[str] = None
    ) -> AsyncGenerator[bytes, None]:
        """
        Stream TTS audio in chunks (if supported)
        Currently OpenAI TTS doesn't support streaming, so we return full audio
        """
        result = await self.synthesize_speech(text, voice)
        
        # Chunk the audio for streaming effect
        audio_data = result["audio_data"]
        chunk_size = 4096
        
        for i in range(0, len(audio_data), chunk_size):
            yield audio_data[i:i + chunk_size]
            await asyncio.sleep(0.01)  # Small delay for streaming effect
    
    # ==================== COST TRACKING ====================
    
    def estimate_call_cost(
        self,
        duration_minutes: int = 15,
        ai_speaking_percentage: float = 0.35
    ) -> Dict[str, float]:
        """
        Estimate total cost for a demo call
        
        Args:
            duration_minutes: Call duration
            ai_speaking_percentage: % of time AI speaks (default 35%)
            
        Returns:
            {
                "stt_cost": 0.09,
                "llm_cost": 1.20,
                "tts_cost": 0.45,
                "total_cost": 1.74
            }
        """
        # STT: Customer speaks ~65% of time
        customer_speaking_minutes = duration_minutes * (1 - ai_speaking_percentage)
        stt_cost = customer_speaking_minutes * 0.006
        
        # LLM: Assume 20 turns, avg 100 tokens per turn
        # 70% fast model, 30% premium model
        fast_turns = 14
        premium_turns = 6
        
        fast_cost = (fast_turns * 100 / 1_000_000) * 0.60  # Output tokens
        premium_cost = (premium_turns * 100 / 1_000_000) * 10.00  # Output tokens
        llm_cost = fast_cost + premium_cost
        
        # TTS: AI speaks ~35% of time, ~150 words/min, ~5 chars/word
        ai_speaking_minutes = duration_minutes * ai_speaking_percentage
        char_count = ai_speaking_minutes * 150 * 5
        tts_cost = (char_count / 1_000_000) * 15.00
        
        total_cost = stt_cost + llm_cost + tts_cost
        
        return {
            "stt_cost": round(stt_cost, 4),
            "llm_cost": round(llm_cost, 4),
            "tts_cost": round(tts_cost, 4),
            "total_cost": round(total_cost, 4)
        }


# Singleton instance
_openai_service: Optional[OpenAIService] = None

def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service instance"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
