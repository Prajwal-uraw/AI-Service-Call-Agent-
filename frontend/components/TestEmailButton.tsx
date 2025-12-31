'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { sendEmail } from '@/lib/email';

export function TestEmailButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    try {
      setLoading(true);
      setStatus(null);
      
      await sendEmail({
        to: 'prajwal.uraw@haiec.com',
        subject: 'Test Email from HVAC Service',
        html: `
          <h1>Hello from HVAC Service!</h1>
          <p>This is a test email sent from your application.</p>
        `,
      });
      
      setStatus('Test email sent successfully!');
    } catch (error) {
      console.error('Failed to send test email:', error);
      
      let errorMessage = 'Failed to send test email';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        if ((error as any).details) {
          errorMessage += ` (Status: ${(error as any).details.status})`;
        }
      }
      setStatus(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Email Test</h2>
      <Button 
        onClick={handleSendTestEmail}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Test Email'}
      </Button>
      {status && (
        <p className={`mt-2 ${status.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
          {status}
        </p>
      )}
    </div>
  );
}
