'use client';

import { useEffect, useRef, useState } from 'react';

interface StaticAvatarVideoProps {
  videoSrc: string;
  isSpeaking: boolean;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Static Video Loop Avatar Component
 * 
 * Uses a looping video with a speaking indicator ring
 * No lip-sync required - just shows when AI is speaking
 * 
 * Free stock video sources:
 * - Pexels.com → "professional portrait listening"
 * - Mixkit.co → "customer service portrait"
 * - Pixabay.com/videos → "person looking at camera neutral"
 */
export default function StaticAvatarVideo({
  videoSrc,
  isSpeaking,
  className = '',
  width = 280,
  height = 360,
}: StaticAvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch(err => {
        console.error('Video autoplay failed:', err);
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, []);

  return (
    <div 
      className={`avatar-container ${className}`}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Video Loop */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Speaking Indicator Ring */}
      <div
        className={`speaking-ring ${isSpeaking ? 'speaking' : ''}`}
        style={{
          position: 'absolute',
          inset: '-6px',
          borderRadius: '20px',
          border: '3px solid rgba(0, 255, 180, 0.0)',
          transition: 'border-color 120ms ease',
          pointerEvents: 'none',
        }}
      />

      {/* Loading State */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
          }}
        >
          Loading avatar...
        </div>
      )}

      <style jsx>{`
        .speaking-ring.speaking {
          border-color: rgba(0, 255, 180, 0.9) !important;
          box-shadow: 0 0 20px rgba(0, 255, 180, 0.5);
        }
      `}</style>
    </div>
  );
}
