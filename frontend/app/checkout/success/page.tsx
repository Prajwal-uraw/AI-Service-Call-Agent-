'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-neutral-900 mx-auto mb-4" />
            <p className="text-neutral-600">Verifying your payment...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-50 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
              <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Welcome to Kestrel VoiceOps!
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8">
                Your subscription is now active. Let's get you set up.
              </p>

              <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-semibold text-neutral-900 mb-4">What happens next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-neutral-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Check your email</p>
                      <p className="text-sm text-neutral-600">We've sent you a confirmation and next steps</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-neutral-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Schedule onboarding call</p>
                      <p className="text-sm text-neutral-600">Our team will reach out within 2 hours to schedule your setup</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-neutral-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Go live in 48 hours</p>
                      <p className="text-sm text-neutral-600">Your AI voice agent will be live and answering calls</p>
                    </div>
                  </div>
                </div>
              </div>

              {sessionId && (
                <p className="text-sm text-neutral-500 mb-8">
                  Session ID: {sessionId}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors gap-2 group"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Start Setup
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-neutral-600 mb-4">Need help getting started?</p>
              <a href="/contact" className="text-neutral-900 font-semibold hover:underline">
                Contact our support team →
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <>
        <Navigation />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-neutral-900 mx-auto mb-4" />
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
