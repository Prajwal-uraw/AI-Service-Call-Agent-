'use client';

import { useState, useEffect, useRef } from 'react';
import JarvisAvatar from './JarvisAvatar';
import SlideRenderer from './SlideRenderer';
import { demoSlides, SlideData } from '../slides/slide-definitions';

interface DemoRecording {
  transcript: ConversationTurn[];
  slideTransitions: number[];
  totalDuration: number;
}

interface ConversationTurn {
  speaker: 'presenter' | 'customer';
  text: string;
  timestamp: number;
  audioUrl?: string;
}

interface FullDemoPresentationProps {
  recordingPath?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

/**
 * Full Demo Presentation with Audio Sync
 * 
 * Integrates:
 * - Jarvis avatar (warm-up & close)
 * - Slides (hidden avatar)
 * - AI-generated audio playback
 * - Automatic timing sync
 */
export default function FullDemoPresentation({
  recordingPath,
  autoPlay = false,
  onComplete,
}: FullDemoPresentationProps) {
  const [phase, setPhase] = useState<'warmup' | 'slides' | 'close'>('warmup');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recording, setRecording] = useState<DemoRecording | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recording
  useEffect(() => {
    if (recordingPath) {
      fetch(recordingPath)
        .then(res => res.json())
        .then(data => setRecording(data))
        .catch(err => console.error('Failed to load recording:', err));
    }
  }, [recordingPath]);

  // Auto-play if enabled
  useEffect(() => {
    if (autoPlay && recording) {
      startPresentation();
    }
  }, [autoPlay, recording]);

  // Update current slide based on time
  useEffect(() => {
    if (!recording || phase !== 'slides') return;

    const slideIndex = recording.slideTransitions.findIndex(
      (transition, index) => {
        const nextTransition = recording.slideTransitions[index + 1];
        return currentTime >= transition && (!nextTransition || currentTime < nextTransition);
      }
    );

    if (slideIndex >= 0 && slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }

    // Check if slides are complete
    const lastTransition = recording.slideTransitions[recording.slideTransitions.length - 1];
    const slideDuration = demoSlides.reduce((sum, slide) => sum + slide.duration, 0);
    if (currentTime >= lastTransition + slideDuration) {
      setPhase('close');
    }
  }, [currentTime, recording, phase, currentSlide]);

  // Update speaking status based on audio playback
  useEffect(() => {
    if (!recording) return;

    const currentTurn = recording.transcript.find(
      (turn, index) => {
        const nextTurn = recording.transcript[index + 1];
        return currentTime >= turn.timestamp && (!nextTurn || currentTime < nextTurn.timestamp);
      }
    );

    setIsSpeaking(currentTurn?.speaker === 'presenter' || false);
  }, [currentTime, recording]);

  // Start presentation
  const startPresentation = () => {
    setIsPlaying(true);
    setPhase('warmup');
    
    // Start timer
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 0.1);
    }, 100);

    // Transition to slides after warm-up (3 minutes)
    setTimeout(() => {
      setPhase('slides');
      setCurrentSlide(0);
    }, 180000); // 3 minutes
  };

  // Pause/Resume
  const togglePlayback = () => {
    if (isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
    } else {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Stop presentation
  const stopPresentation = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
    setPhase('warmup');
    setCurrentSlide(0);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="full-demo-presentation" style={{
      width: '100%',
      height: '100vh',
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Warm-up Phase: Show Jarvis Avatar */}
      {phase === 'warmup' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}>
          <JarvisAvatar 
            isSpeaking={isSpeaking}
            isVisible={true}
            size={300}
          />
          <div style={{
            color: '#00FFB4',
            fontSize: '32px',
            fontFamily: 'monospace',
            textAlign: 'center',
            maxWidth: '800px',
          }}>
            {isPlaying ? 'AI Co-Presenter Active' : 'Ready to Begin'}
          </div>
          {!isPlaying && (
            <button
              onClick={startPresentation}
              style={{
                background: 'rgba(0, 255, 180, 0.2)',
                border: '2px solid #00FFB4',
                color: '#00FFB4',
                padding: '16px 32px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            >
              Start Demo
            </button>
          )}
        </div>
      )}

      {/* Slides Phase: Hide Avatar, Show Slides */}
      {phase === 'slides' && (
        <SlideRenderer 
          slide={demoSlides[currentSlide]}
          isActive={true}
        />
      )}

      {/* Close Phase: Show Jarvis Avatar Again */}
      {phase === 'close' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}>
          <JarvisAvatar 
            isSpeaking={isSpeaking}
            isVisible={true}
            size={300}
          />
          <div style={{
            color: '#00FFB4',
            fontSize: '32px',
            fontFamily: 'monospace',
            textAlign: 'center',
            maxWidth: '800px',
          }}>
            Demo Complete - Questions?
          </div>
          <button
            onClick={() => {
              stopPresentation();
              onComplete?.();
            }}
            style={{
              background: 'rgba(0, 255, 180, 0.2)',
              border: '2px solid #00FFB4',
              color: '#00FFB4',
              padding: '16px 32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            End Demo
          </button>
        </div>
      )}

      {/* Control Panel */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(0, 255, 180, 0.3)',
          borderRadius: '12px',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          backdropFilter: 'blur(10px)',
        }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlayback}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00FFB4',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Time Display */}
          <div style={{
            color: '#00FFB4',
            fontSize: '18px',
            fontFamily: 'monospace',
            minWidth: '120px',
          }}>
            {formatTime(currentTime)} / {formatTime(recording?.totalDuration || 0)}
          </div>

          {/* Phase Indicator */}
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '14px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}>
            {phase === 'warmup' && 'Warm-up'}
            {phase === 'slides' && `Slide ${currentSlide + 1}/${demoSlides.length}`}
            {phase === 'close' && 'Q&A'}
          </div>

          {/* Stop */}
          <button
            onClick={stopPresentation}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff4444',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ⏹
          </button>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && isPlaying && (
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 180, 0.3)',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00FFB4',
            animation: 'pulse 1s infinite',
          }} />
          <span style={{
            color: '#00FFB4',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}>
            AI Speaking
          </span>
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
