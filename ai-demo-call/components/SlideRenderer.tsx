'use client';

import { SlideData } from '../slides/slide-definitions';

interface SlideRendererProps {
  slide: SlideData;
  isActive: boolean;
}

/**
 * Slide Renderer Component
 * Renders individual slides with animations and styling
 */
export default function SlideRenderer({ slide, isActive }: SlideRendererProps) {
  if (!isActive) return null;

  return (
    <div
      className={`slide-container ${slide.animation || 'fade'}`}
      style={{
        width: '100%',
        height: '100%',
        background: slide.backgroundColor || 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
        position: 'relative',
      }}
    >
      {/* Title */}
      <h1
        style={{
          color: slide.textColor || '#00FFB4',
          fontSize: slide.id === 4 || slide.id === 7 ? '72px' : '56px',
          fontWeight: 'bold',
          marginBottom: slide.subtitle ? '20px' : '60px',
          textAlign: 'center',
          maxWidth: '1200px',
          lineHeight: '1.2',
        }}
      >
        {slide.title}
      </h1>

      {/* Subtitle */}
      {slide.subtitle && (
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '24px',
            marginBottom: '60px',
            textAlign: 'center',
          }}
        >
          {slide.subtitle}
        </p>
      )}

      {/* Content */}
      <div
        style={{
          color: slide.textColor || '#e0e0e0',
          fontSize: slide.id === 4 || slide.id === 7 ? '32px' : '28px',
          lineHeight: '1.8',
          maxWidth: '1000px',
          textAlign: slide.id === 4 || slide.id === 7 ? 'center' : 'left',
        }}
      >
        {slide.content.map((line, index) => (
          <div
            key={index}
            style={{
              marginBottom: line === '' ? '20px' : '8px',
              opacity: line === '' ? 0 : 1,
              fontWeight: line.startsWith('✅') || line.startsWith('❌') || line.startsWith('📊') || line.startsWith('📞') || line.startsWith('🔥') ? 'bold' : 'normal',
            }}
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>

      {/* Image (if provided) */}
      {slide.imageUrl && (
        <img
          src={slide.imageUrl}
          alt={slide.title}
          style={{
            maxWidth: '600px',
            maxHeight: '400px',
            objectFit: 'contain',
            marginTop: '40px',
            borderRadius: '12px',
          }}
        />
      )}

      <style jsx>{`
        .slide-container {
          animation-duration: 800ms;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
        }

        .fade {
          animation-name: fadeIn;
        }

        .slide {
          animation-name: slideIn;
        }

        .zoom {
          animation-name: zoomIn;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
