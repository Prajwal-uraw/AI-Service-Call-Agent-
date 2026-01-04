'use client';

import { useState, useEffect, useRef } from 'react';
import { demoSlides } from '@/lib/slides/slide-definitions';

export default function DemoPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playback and slide sync
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;

    const audio = audioRef.current;
    audio.src = `/audio/slide-${currentSlide + 1}.mp3`;
    
    const playAudio = async () => {
      try {
        await audio.play();
        setAudioLoaded(true);
      } catch (error) {
        console.error('Audio playback failed:', error);
      }
    };

    playAudio();

    // Update progress based on audio time
    const updateProgress = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
      }
    };

    progressIntervalRef.current = setInterval(updateProgress, 100);

    // Handle audio end - move to next slide
    const handleAudioEnd = () => {
      if (currentSlide < demoSlides.length - 1) {
        setCurrentSlide(currentSlide + 1);
        setProgress(0);
      } else {
        setIsPlaying(false);
        setProgress(100);
      }
    };

    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleAudioEnd);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentSlide]);

  const startDemo = () => {
    console.log('Starting demo...');
    setCurrentSlide(0);
    setProgress(0);
    setAudioLoaded(false);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error('Play failed:', err));
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current && audioRef.current.duration) {
          const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(progressPercent);
        }
      }, 100);
      setIsPlaying(true);
    }
  };

  const nextSlide = () => {
    if (currentSlide < demoSlides.length - 1) {
      if (audioRef.current) {
        audioRef.current.pause();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
      setCurrentSlide(currentSlide + 1);
      setProgress(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
      setCurrentSlide(currentSlide - 1);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {!isPlaying ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="text-center max-w-3xl px-6">
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 mb-6">
                Enterprise Demo Experience
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Transform Your Sales Process
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">
              Experience how AI-powered conversations drive 3x higher conversion rates
            </p>
            <button
              onClick={startDemo}
              className="group relative px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/20 inline-flex items-center gap-3"
            >
              <span>Start Demo</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen flex items-center justify-center p-8 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
          
          <div className="relative max-w-6xl w-full z-10">
            <div className="mb-12 transition-all duration-700 ease-out animate-fade-in">
              <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight transition-all duration-700 animate-slide-up">
                {demoSlides[currentSlide]?.title}
              </h2>
              {demoSlides[currentSlide]?.subtitle && (
                <p className="text-2xl md:text-3xl text-gray-400 mb-8 transition-all duration-500 animate-fade-in" style={{ animationDelay: '200ms' }}>
                  {demoSlides[currentSlide].subtitle}
                </p>
              )}
            </div>

            <div className="space-y-6 text-xl md:text-2xl leading-relaxed text-gray-300">
              {demoSlides[currentSlide]?.content.map((line, index) => (
                <p
                  key={index}
                  className="transition-all duration-700 ease-out animate-slide-in"
                  style={{
                    opacity: line === '' ? 0 : 1,
                    marginBottom: line === '' ? '2rem' : '0.75rem',
                    animationDelay: `${300 + index * 100}ms`
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Hidden audio element */}
          <audio ref={audioRef} preload="auto" />

          <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="fixed top-8 right-8 text-sm text-gray-500 font-mono bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            {currentSlide + 1} / {demoSlides.length}
          </div>

          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10">
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-300 transition-colors p-2"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-gray-300 transition-colors p-2"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="text-white hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-gray-400 font-mono min-w-[80px] text-center">
                {Math.floor((currentSlide * 60 + (progress / 100) * 60) / 60)}:
                {String(Math.floor((currentSlide * 60 + (progress / 100) * 60) % 60)).padStart(2, '0')}
              </span>
              <button
                onClick={nextSlide}
                disabled={currentSlide === demoSlides.length - 1}
                className="text-white hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.7s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.7s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.7s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
