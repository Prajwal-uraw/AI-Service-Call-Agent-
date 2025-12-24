'use client';

import FullDemoPresentation from '../../components/FullDemoPresentation';
import { useRouter } from 'next/navigation';

/**
 * AI Demo Call Page
 * 
 * Full presentation with:
 * - Jarvis avatar (warm-up & close)
 * - 8 slides (avatar hidden)
 * - AI-generated audio
 * - Automatic timing
 */
export default function DemoPage() {
  const router = useRouter();

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <FullDemoPresentation
        recordingPath="/recordings/demo-recording.json"
        autoPlay={false}
        onComplete={() => {
          console.log('Demo complete!');
          // Could redirect to booking page, etc.
        }}
      />
    </div>
  );
}
