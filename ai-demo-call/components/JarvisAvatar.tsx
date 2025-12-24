'use client';

import { useEffect, useState } from 'react';

interface JarvisAvatarProps {
  isSpeaking: boolean;
  isVisible?: boolean;
  className?: string;
  size?: number;
}

/**
 * Jarvis-Style Pulse Avatar
 * 
 * Free animated pulse/beat visualization
 * No video required - pure CSS/SVG animation
 * Hides during slide presentation
 */
export default function JarvisAvatar({
  isSpeaking,
  isVisible = true,
  className = '',
  size = 200,
}: JarvisAvatarProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (!isSpeaking) {
      setPulseIntensity(0);
      return;
    }

    // Simulate audio-reactive pulsing
    const interval = setInterval(() => {
      setPulseIntensity(Math.random() * 0.5 + 0.5); // 0.5 to 1.0
    }, 100);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  if (!isVisible) return null;

  return (
    <div 
      className={`jarvis-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer glow rings */}
      <div
        className="glow-ring outer"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '2px solid rgba(0, 255, 180, 0.3)',
          opacity: isSpeaking ? pulseIntensity * 0.8 : 0.3,
          transform: `scale(${isSpeaking ? 1 + pulseIntensity * 0.2 : 1})`,
          transition: 'all 100ms ease-out',
        }}
      />

      {/* Middle ring */}
      <div
        className="glow-ring middle"
        style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          border: '3px solid rgba(0, 255, 180, 0.5)',
          opacity: isSpeaking ? pulseIntensity : 0.4,
          transform: `scale(${isSpeaking ? 1 + pulseIntensity * 0.15 : 1})`,
          transition: 'all 100ms ease-out',
          boxShadow: isSpeaking 
            ? `0 0 ${20 * pulseIntensity}px rgba(0, 255, 180, 0.6)` 
            : 'none',
        }}
      />

      {/* Inner core */}
      <div
        className="core"
        style={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: isSpeaking
            ? `radial-gradient(circle, rgba(0, 255, 180, ${pulseIntensity}) 0%, rgba(0, 200, 150, ${pulseIntensity * 0.6}) 50%, rgba(0, 150, 120, 0.3) 100%)`
            : 'radial-gradient(circle, rgba(0, 255, 180, 0.4) 0%, rgba(0, 200, 150, 0.2) 50%, rgba(0, 150, 120, 0.1) 100%)',
          boxShadow: isSpeaking
            ? `0 0 ${40 * pulseIntensity}px rgba(0, 255, 180, 0.8), inset 0 0 ${20 * pulseIntensity}px rgba(0, 255, 180, 0.4)`
            : '0 0 10px rgba(0, 255, 180, 0.3)',
          transition: 'all 100ms ease-out',
        }}
      />

      {/* Center dot */}
      <div
        className="center-dot"
        style={{
          position: 'absolute',
          width: '20%',
          height: '20%',
          borderRadius: '50%',
          background: '#00FFB4',
          opacity: isSpeaking ? 1 : 0.6,
          transform: `scale(${isSpeaking ? 1 + pulseIntensity * 0.3 : 1})`,
          transition: 'all 100ms ease-out',
          boxShadow: `0 0 ${15 * (isSpeaking ? pulseIntensity : 0.5)}px rgba(0, 255, 180, 1)`,
        }}
      />

      {/* Particle effects when speaking */}
      {isSpeaking && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(0, 255, 180, 0.8)',
                transform: `rotate(${i * 45}deg) translateY(${-size * 0.4}px)`,
                opacity: pulseIntensity * 0.7,
                transition: 'all 100ms ease-out',
              }}
            />
          ))}
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        .jarvis-avatar {
          filter: drop-shadow(0 0 20px rgba(0, 255, 180, 0.3));
        }
      `}</style>
    </div>
  );
}
