// Stripe client-side utilities for AlertStream
// Note: @stripe/stripe-js not installed - using server-side Stripe only

export const getStripe = () => {
  // TODO: Install @stripe/stripe-js if client-side Stripe needed
  return null;
};

export async function createCheckoutSession(priceId: string) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function createPortalSession() {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}

export const STRIPE_PRICE_IDS = {
  free: null,
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
  business: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || 'price_business',
};
