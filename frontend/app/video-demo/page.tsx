'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users, Settings } from 'lucide-react';
import { demoSlides } from '@/lib/slides/slide-definitions';

export default function VideoCallDemo() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
        setIsSpeaking(true);
      } catch (error) {
        console.error('Audio playback failed:', error);
      }
    };

    playAudio();

    const updateProgress = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
      }
    };

    progressIntervalRef.current = setInterval(updateProgress, 100);

    const handleAudioEnd = () => {
      setIsSpeaking(false);
      if (currentSlide < demoSlides.length - 1) {
        setTimeout(() => {
          setCurrentSlide(currentSlide + 1);
          setProgress(0);
        }, 500);
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
    setIsPlaying(true);
    setCurrentSlide(0);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Video Call Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-white font-medium">AI Sales Demo Meeting</span>
          <span className="text-gray-400 text-sm">• {isPlaying ? 'In Progress' : 'Ready to Start'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-gray-400 text-sm font-mono">
            {Math.floor((currentSlide * 60 + (progress / 100) * 60) / 60)}:
            {String(Math.floor((currentSlide * 60 + (progress / 100) * 60) % 60)).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Video Call Area */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Slides Presentation (Main Screen) */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">AI Sales Presentation</h2>
                <p className="text-gray-400 mb-6">Click Start to begin the demo</p>
                <button
                  onClick={startDemo}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                >
                  Start Presentation
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col bg-gradient-to-br from-black via-gray-900 to-black p-12">
              {/* Slide Content */}
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
                  {demoSlides[currentSlide]?.title}
                </h1>
                {demoSlides[currentSlide]?.subtitle && (
                  <p className="text-2xl text-gray-400 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    {demoSlides[currentSlide].subtitle}
                  </p>
                )}
                <div className="space-y-4 text-xl text-gray-300">
                  {demoSlides[currentSlide]?.content.map((line, index) => (
                    <p
                      key={index}
                      className="animate-slide-in"
                      style={{
                        opacity: line === '' ? 0 : 1,
                        animationDelay: `${300 + index * 100}ms`
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Slide Progress */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Slide {currentSlide + 1} of {demoSlides.length}</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Screen Share Indicator */}
          {isPlaying && (
            <div className="absolute top-4 left-4 bg-green-500/20 border border-green-500 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Presenting</span>
            </div>
          )}
        </div>

        {/* Sidebar with Participants */}
        <div className="w-80 flex flex-col gap-4">
          {/* AI Avatar Video Window */}
          <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video relative">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              {/* Jarvis Heartbeat Avatar */}
              <div className="relative">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transition-all duration-300 ${
                  isSpeaking ? 'scale-110 shadow-2xl shadow-blue-500/50' : 'scale-100'
                }`}>
                  <div className={`w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center transition-all duration-300 ${
                    isSpeaking ? 'animate-pulse' : ''
                  }`}>
                    <div className="relative w-20 h-20">
                      {/* Outer ring */}
                      <div className={`absolute inset-0 rounded-full border-2 border-blue-400 transition-all duration-500 ${
                        isSpeaking ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
                      }`} style={{ animation: isSpeaking ? 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none' }}></div>
                      
                      {/* Middle ring */}
                      <div className={`absolute inset-2 rounded-full border-2 border-purple-400 transition-all duration-300 ${
                        isSpeaking ? 'scale-110' : 'scale-100'
                      }`}></div>
                      
                      {/* Inner core */}
                      <div className={`absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200 ${
                        isSpeaking ? 'scale-110 shadow-lg shadow-blue-500/50' : 'scale-100'
                      }`}>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-spin" style={{ animationDuration: '3s' }}></div>
                      </div>
                      
                      {/* Center dot */}
                      <div className="absolute inset-6 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>

                {/* Speaking indicator */}
                {isSpeaking && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Speaking
                  </div>
                )}
              </div>
            </div>

            {/* Participant Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-white text-sm font-medium">AI Presenter</span>
              </div>
            </div>
          </div>

          {/* Your Video Window (Simulated) */}
          <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video relative">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <span className="text-gray-500 text-sm">You (Muted)</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-white text-sm font-medium">You</span>
              </div>
            </div>
          </div>

          {/* Meeting Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Meeting Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Participants</span>
                <span className="text-white">2</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Duration</span>
                <span className="text-white">
                  {Math.floor((currentSlide * 60 + (progress / 100) * 60) / 60)}:
                  {String(Math.floor((currentSlide * 60 + (progress / 100) * 60) % 60)).padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Status</span>
                <span className="text-green-400">{isPlaying ? 'Active' : 'Waiting'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-all ${
              !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOn ? 'Stop Video' : 'Start Video'}
          >
            {isVideoOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
          </button>

          <button
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentSlide(0);
              setProgress(0);
            }}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
            title="Leave Meeting"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="auto" />

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
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

        .animate-slide-in {
          animation: slide-in 0.7s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
