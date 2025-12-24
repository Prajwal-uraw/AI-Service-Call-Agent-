'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Shield, Users, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const plans = [
  {
    id: 'starter',
    name: 'Autonomous Intake',
    price: 999,
    priceId: 'price_starter', // Replace with actual Stripe Price ID
    description: 'Deterministic appointment & lead workflows',
    features: [
      'Up to 500 calls/month',
      'Autonomous intake & qualification',
      'Email support',
      'Basic CRM integration',
      'Operational telemetry dashboard',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Integrated Operations',
    price: 1997,
    priceId: 'price_professional', // Replace with actual Stripe Price ID
    setupFee: 4997,
    description: 'Enterprise routing, CRM sync, multi-location',
    features: [
      'Up to 2,000 calls/month',
      'Deterministic workflows',
      'Priority support (2-hour response)',
      'ServiceTitan/Housecall Pro integration',
      'Operational telemetry',
      'Outcome-anchored routing',
      '12-hour deployment',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'VoiceOps Premium',
    price: 'Custom',
    priceId: 'price_enterprise', // Replace with actual Stripe Price ID
    description: 'Custom workflow encoding, SLA, voice variants',
    features: [
      'Unlimited calls',
      'Custom workflow encoding',
      '24/7 support (30-min SLA)',
      'RESTful API & custom integrations',
      'Multi-location support',
      'White-glove onboarding',
      'Dedicated success manager',
      'Custom voice variants',
    ],
    popular: false,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planId: string) => {
    if (planId === 'enterprise') {
      router.push('/contact');
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          metadata: {
            plan: planId,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative bg-neutral-900 text-white py-24 mt-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Choose Your Plan
              </h1>
              <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Deploy voice operations infrastructure proven in HVAC
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border-2 ${
                      plan.popular
                        ? 'border-neutral-900 shadow-2xl scale-105'
                        : 'border-neutral-200 shadow-sm'
                    } p-8 transition-all hover:shadow-xl`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-neutral-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                      <p className="text-neutral-600 text-sm mb-6">{plan.description}</p>
                      
                      <div className="mb-4">
                        {typeof plan.price === 'number' ? (
                          <>
                            <div className="flex items-baseline justify-center gap-2">
                              <span className="text-5xl font-bold text-neutral-900">${plan.price}</span>
                              <span className="text-neutral-600">/month</span>
                            </div>
                            {plan.setupFee && (
                              <p className="text-sm text-neutral-600 mt-2">
                                + ${plan.setupFee.toLocaleString()} one-time setup
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-4xl font-bold text-neutral-900">{plan.price}</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleCheckout(plan.priceId, plan.id)}
                        disabled={loading === plan.id}
                        className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group ${
                          plan.popular
                            ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                            : 'border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                        } disabled:opacity-50`}
                      >
                        {loading === plan.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-neutral-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Secure & Compliant</h3>
                  <p className="text-sm text-neutral-600">Bank-level encryption and HIPAA compliant</p>
                </div>
                <div>
                  <div className="bg-green-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">48-Hour Setup</h3>
                  <p className="text-sm text-neutral-600">Live and answering calls in 2 business days</p>
                </div>
                <div>
                  <div className="bg-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Expert Support</h3>
                  <p className="text-sm text-neutral-600">Dedicated team to ensure your success</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-2">Can I cancel anytime?</h3>
                  <p className="text-neutral-600">
                    Yes, all plans are month-to-month with no long-term contracts. Cancel anytime with 30 days notice.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-2">What happens if I exceed my call limit?</h3>
                  <p className="text-neutral-600">
                    We'll notify you at 80% usage. Additional calls are billed at $0.50/call or you can upgrade your plan.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                  <h3 className="font-semibold text-neutral-900 mb-2">Is there a free trial?</h3>
                  <p className="text-neutral-600">
                    We offer a 14-day money-back guarantee. Try Kestrel risk-free and get a full refund if you're not satisfied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
