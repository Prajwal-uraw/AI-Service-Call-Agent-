'use client';

import { useState, useEffect } from 'react';
import JarvisAvatar from './JarvisAvatar';

interface Slide {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  duration: number; // seconds
}

interface DemoPresentationProps {
  slides: Slide[];
  onComplete?: () => void;
}

/**
 * Demo Presentation Controller
 * 
 * Features:
 * - Hides AI avatar during slide presentation
 * - Shows Jarvis pulse during warm-up/close
 * - Auto-advances slides based on script timing
 * - Syncs with AI narration
 */
export default function DemoPresentation({
  slides,
  onComplete,
}: DemoPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(-1); // -1 = warm-up phase
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [presentationMode, setPresentationMode] = useState<'warmup' | 'slides' | 'close'>('warmup');

  // Start presentation
  const startPresentation = () => {
    setPresentationMode('warmup');
    setIsSpeaking(true);
  };

  // Move to slides phase
  const startSlides = () => {
    setPresentationMode('slides');
    setCurrentSlide(0);
  };

  // Move to close phase
  const startClose = () => {
    setPresentationMode('close');
    setCurrentSlide(-1);
    setIsSpeaking(false);
  };

  // Auto-advance slides
  useEffect(() => {
    if (presentationMode !== 'slides' || currentSlide < 0) return;

    const currentSlideData = slides[currentSlide];
    if (!currentSlideData) return;

    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else {
        startClose();
      }
    }, currentSlideData.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentSlide, presentationMode, slides]);

  return (
    <div className="demo-presentation" style={{
      width: '100%',
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Warm-up Phase: Show Jarvis Avatar */}
      {presentationMode === 'warmup' && (
        <div className="warmup-phase" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}>
          <JarvisAvatar 
            isSpeaking={isSpeaking}
            isVisible={true}
            size={300}
          />
          <div style={{
            color: '#00FFB4',
            fontSize: '24px',
            fontFamily: 'monospace',
            textAlign: 'center',
          }}>
            AI Co-Presenter Initializing...
          </div>
          <button
            onClick={startSlides}
            style={{
              background: 'rgba(0, 255, 180, 0.2)',
              border: '2px solid #00FFB4',
              color: '#00FFB4',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: 'monospace',
            }}
          >
            Start Presentation
          </button>
        </div>
      )}

      {/* Slides Phase: Hide Avatar, Show Slides */}
      {presentationMode === 'slides' && currentSlide >= 0 && slides[currentSlide] && (
        <div className="slide-container" style={{
          width: '90%',
          maxWidth: '1200px',
          height: '80%',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderRadius: '20px',
          padding: '60px',
          boxShadow: '0 20px 60px rgba(0, 255, 180, 0.1)',
          border: '1px solid rgba(0, 255, 180, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <h1 style={{
            color: '#00FFB4',
            fontSize: '48px',
            marginBottom: '40px',
            fontWeight: 'bold',
          }}>
            {slides[currentSlide].title}
          </h1>
          
          {slides[currentSlide].imageUrl && (
            <img 
              src={slides[currentSlide].imageUrl}
              alt={slides[currentSlide].title}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                marginBottom: '40px',
              }}
            />
          )}

          <div style={{
            color: '#e0e0e0',
            fontSize: '24px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}>
            {slides[currentSlide].content}
          </div>

          {/* Progress indicator */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
          }}>
            {slides.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: index === currentSlide 
                    ? '#00FFB4' 
                    : 'rgba(255, 255, 255, 0.3)',
                  transition: 'all 300ms ease',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Close Phase: Show Jarvis Avatar Again */}
      {presentationMode === 'close' && (
        <div className="close-phase" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}>
          <JarvisAvatar 
            isSpeaking={isSpeaking}
            isVisible={true}
            size={300}
          />
          <div style={{
            color: '#00FFB4',
            fontSize: '28px',
            fontFamily: 'monospace',
            textAlign: 'center',
            maxWidth: '600px',
          }}>
            Presentation Complete
          </div>
          <button
            onClick={() => onComplete?.()}
            style={{
              background: 'rgba(0, 255, 180, 0.2)',
              border: '2px solid #00FFB4',
              color: '#00FFB4',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: 'monospace',
            }}
          >
            End Demo
          </button>
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#00FFB4',
          fontSize: '14px',
          fontFamily: 'monospace',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00FFB4',
            animation: 'pulse 1s infinite',
          }} />
          AI Speaking...
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
