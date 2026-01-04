'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/alertstream/stripe';

interface UpgradeButtonProps {
  plan: 'starter' | 'pro' | 'business';
  className?: string;
}

export default function UpgradeButton({ plan, className = '' }: UpgradeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const priceId = STRIPE_PRICE_IDS[plan];
      
      if (!priceId) {
        throw new Error('Invalid plan selected');
      }

      const { sessionId, url } = await createCheckoutSession(priceId);
      
      if (url) {
        window.location.href = url;
      } else if (sessionId) {
        // Redirect to Stripe checkout using session ID
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert(error.message || 'Failed to start upgrade process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`flex items-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Zap className="h-5 w-5" />
      <span>{loading ? 'Processing...' : 'Upgrade Now'}</span>
    </button>
  );
}
