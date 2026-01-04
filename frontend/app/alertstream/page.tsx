'use client';

import Link from 'next/link';
import { MessageSquare, Zap, Shield, TrendingUp, CheckCircle, ArrowRight, Smartphone, Code, Plug, Clock } from 'lucide-react';

export default function AlertStreamHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Coming Soon Banner */}
      <div className="bg-blue-600 text-white py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">Coming Soon - Currently in Development</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">AlertStream</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">Coming Soon</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/alertstream/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/alertstream/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/alertstream/onboarding"
                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Never Miss a Critical
            <span className="text-sky-500"> Website Event</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant SMS alerts when important things happen on your website.
            Form submissions, new orders, errors - delivered straight to your phone in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/alertstream/onboarding"
              className="bg-sky-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-sky-600 transition-colors inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/alertstream/pricing"
              className="bg-white text-sky-500 border-2 border-sky-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-sky-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            50 free SMS per month • No credit card required
          </p>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg p-8 text-left">
            <div className="flex items-start space-x-4">
              <Smartphone className="h-12 w-12 text-sky-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 mb-2">New SMS Alert</p>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  🎉 New form submission from John Doe!
                </p>
                <p className="text-gray-600">
                  Email: john@example.com<br />
                  Message: "Interested in your product"
                </p>
                <p className="text-xs text-gray-400 mt-2">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AlertStream?
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup, powerful features, reliable delivery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instant Delivery
              </h3>
              <p className="text-gray-600">
                SMS alerts delivered in under 3 seconds. Never miss a critical event again.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                5-Minute Setup
              </h3>
              <p className="text-gray-600">
                Add one line of code or install our WordPress plugin. Start receiving alerts immediately.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                TCPA Compliant
              </h3>
              <p className="text-gray-600">
                Built-in compliance features. Double opt-in, DNC checks, and automatic STOP handling.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Plug className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Multiple Integrations
              </h3>
              <p className="text-gray-600">
                WordPress plugin, JavaScript SDK, Zapier app, or direct API. Choose what works for you.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600">
                Track delivery rates, costs, and performance. Export data for deeper analysis.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                99.9% Uptime
              </h3>
              <p className="text-gray-600">
                Enterprise-grade infrastructure. Your alerts are delivered reliably, every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect For Every Business
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'E-commerce', desc: 'New orders, abandoned carts, low inventory' },
              { title: 'SaaS', desc: 'New signups, trial expirations, errors' },
              { title: 'Real Estate', desc: 'New leads, showing requests, offers' },
              { title: 'Healthcare', desc: 'Appointment bookings, cancellations' },
            ].map((useCase, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sky-500 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-sky-100 mb-8">
            Join thousands of businesses using AlertStream to stay connected
          </p>
          <Link
            href="/alertstream/onboarding"
            className="bg-white text-sky-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-sky-100 mt-4 text-sm">
            50 free SMS • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-6 w-6 text-sky-500" />
                <span className="text-xl font-bold text-white">AlertStream</span>
              </div>
              <p className="text-sm">
                Instant SMS notifications for your website events.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/alertstream/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/alertstream/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/alertstream/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <p className="text-sm">
                Part of the <Link href="/" className="text-sky-400 hover:text-sky-300">KestrelVoice</Link> family
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 AlertStream. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
