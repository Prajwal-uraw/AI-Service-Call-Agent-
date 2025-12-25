import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KestrelVoice Production Pilot - $199 Live HVAC Call Evaluation';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '50px',
            padding: '12px 24px',
            marginBottom: '40px',
          }}
        >
          <span style={{ color: '#93c5fd', fontSize: '20px', fontWeight: '600' }}>
            Live Production Evaluation
          </span>
        </div>

        {/* Main Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: 'white',
              margin: '0 0 20px 0',
              lineHeight: '1.1',
            }}
          >
            $199 Production Pilot
          </h1>
          <p
            style={{
              fontSize: '36px',
              color: '#cbd5e1',
              margin: '0',
              maxWidth: '900px',
              lineHeight: '1.3',
            }}
          >
            Test KestrelVoice on Your Live HVAC Phone Line
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✓
            </div>
            <span style={{ color: '#e2e8f0', fontSize: '24px' }}>7-Day Evaluation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✓
            </div>
            <span style={{ color: '#e2e8f0', fontSize: '24px' }}>Executive Report</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✓
            </div>
            <span style={{ color: '#e2e8f0', fontSize: '24px' }}>Credit if You Continue</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            KestrelVoice
          </span>
          <span style={{ color: '#64748b', fontSize: '24px' }}>|</span>
          <span style={{ color: '#94a3b8', fontSize: '24px' }}>
            Built for HVAC Operators
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
