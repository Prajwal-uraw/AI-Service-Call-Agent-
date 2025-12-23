'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-50 py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-sm">
              <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-orange-600" />
              </div>

              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Checkout Cancelled
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8">
                No worries! Your payment was not processed.
              </p>

              <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-semibold text-neutral-900 mb-4">Have questions about our plans?</h2>
                <div className="space-y-3 text-neutral-600">
                  <p>• Not sure which plan is right for you?</p>
                  <p>• Need a custom solution for your business?</p>
                  <p>• Want to see a demo before committing?</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/checkout')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors gap-2 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Back to Pricing
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-colors gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Talk to Sales
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-neutral-600 mb-4">Still interested? Schedule a free consultation</p>
              <a href="/calendar" className="text-neutral-900 font-semibold hover:underline">
                Book a demo call →
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
