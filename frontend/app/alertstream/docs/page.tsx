'use client';

import Link from 'next/link';
import { MessageSquare, Code, Plug, Zap, Book, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('quickstart');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/alertstream" className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-sky-500" />
              <span className="text-2xl font-bold text-gray-900">AlertStream</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/alertstream" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/alertstream/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              <button
                onClick={() => setActiveTab('quickstart')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'quickstart' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Quick Start
              </button>
              <button
                onClick={() => setActiveTab('javascript')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'javascript' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                JavaScript SDK
              </button>
              <button
                onClick={() => setActiveTab('wordpress')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'wordpress' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                WordPress Plugin
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'api' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                REST API
              </button>
              <button
                onClick={() => setActiveTab('zapier')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'zapier' ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Zapier Integration
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'quickstart' && (
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Get started with AlertStream in 5 minutes
                </p>

                <div className="space-y-8">
                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sky-600 font-bold">1</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Create an Account</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Sign up for a free account at AlertStream. You'll get 50 free SMS per month.
                    </p>
                    <Link
                      href="/alertstream/onboarding"
                      className="inline-flex items-center text-sky-500 hover:text-sky-600 font-medium"
                    >
                      Sign Up Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sky-600 font-bold">2</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Add Your Website</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Register your website in the dashboard to get your unique API key.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">You'll receive:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• API Key (starts with js_)</li>
                        <li>• HMAC Secret (for secure webhooks)</li>
                        <li>• Integration code snippet</li>
                      </ul>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sky-600 font-bold">3</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Install the Code</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Add the AlertStream JavaScript snippet to your website:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">
                        {`<script src="https://cdn.alertstream.io/js/v1.js"></script>
<script>
  AlertStream.init('YOUR_API_KEY');
</script>`}
                      </code>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sky-600 font-bold">4</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Create a Trigger</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Set up your first trigger to start receiving SMS alerts.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Example: Form Submission Alert</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Event Type: form_submit</li>
                        <li>• Message: &quot;New form from {'{{'} name {'}'}!&quot;</li>
                        <li>• Phone: Your number</li>
                      </ul>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-sky-600 font-bold">5</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900">Test It Out</h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Send a test event to make sure everything works:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">
                        {`AlertStream.track('form_submit', {
  name: 'John Doe',
  email: 'john@example.com'
});`}
                      </code>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'javascript' && (
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">JavaScript SDK</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Track events directly from your website
                </p>

                <div className="space-y-8">
                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Installation</h2>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                      <code className="text-green-400 text-sm">
                        {`<script src="https://cdn.alertstream.io/js/v1.js"></script>
<script>
  AlertStream.init('YOUR_API_KEY');
</script>`}
                      </code>
                    </div>
                    <p className="text-gray-600">
                      Add this code before the closing &lt;/body&gt; tag on every page.
                    </p>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Track Events</h2>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                      <code className="text-green-400 text-sm">
                        {`// Basic event
AlertStream.track('form_submit', {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
});

// E-commerce event
AlertStream.track('order_created', {
  order_id: '12345',
  amount: 299.99,
  customer_name: 'Jane Smith'
});

// Custom event
AlertStream.track('custom_event', {
  custom_field: 'value'
});`}
                      </code>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Auto-Track Forms</h2>
                    <p className="text-gray-600 mb-4">
                      Automatically track form submissions:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">
                        {`AlertStream.autoTrackForms({
  selector: 'form',
  eventType: 'form_submit'
});`}
                      </code>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'wordpress' && (
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">WordPress Plugin</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Easy integration for WordPress sites
                </p>

                <div className="space-y-8">
                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Installation</h2>
                    <ol className="space-y-3 text-gray-700">
                      <li>1. Download the AlertStream WordPress plugin</li>
                      <li>2. Go to Plugins → Add New → Upload Plugin</li>
                      <li>3. Upload the .zip file and activate</li>
                      <li>4. Go to Settings → AlertStream</li>
                      <li>5. Enter your API key</li>
                    </ol>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Supported Events</h2>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Contact Form 7 submissions</li>
                      <li>• Gravity Forms submissions</li>
                      <li>• WooCommerce orders</li>
                      <li>• New user registrations</li>
                      <li>• New comments</li>
                      <li>• Custom post types</li>
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">REST API</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Send events from any platform
                </p>

                <div className="space-y-8">
                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Authentication</h2>
                    <p className="text-gray-600 mb-4">
                      Include your API key in the Authorization header:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">
                        {`Authorization: Bearer YOUR_API_KEY`}
                      </code>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Send Event</h2>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">
                        {`POST https://api.alertstream.io/v1/events

{
  "event_type": "form_submit",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }
}`}
                      </code>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Example: cURL</h2>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <code className="text-green-400 text-sm">
                        {`curl -X POST https://api.alertstream.io/v1/events \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "form_submit",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'`}
                      </code>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'zapier' && (
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Zapier Integration</h1>
                <p className="text-xl text-gray-600 mb-8">
                  Connect AlertStream to 5,000+ apps
                </p>

                <div className="space-y-8">
                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Setup</h2>
                    <ol className="space-y-3 text-gray-700">
                      <li>1. Search for "AlertStream" in Zapier</li>
                      <li>2. Connect your AlertStream account</li>
                      <li>3. Choose a trigger app (e.g., Google Forms)</li>
                      <li>4. Select "Send SMS Alert" action</li>
                      <li>5. Map your fields and test</li>
                    </ol>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Popular Zaps</h2>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Google Forms → AlertStream</li>
                      <li>• Typeform → AlertStream</li>
                      <li>• Stripe → AlertStream</li>
                      <li>• Shopify → AlertStream</li>
                      <li>• Gmail → AlertStream</li>
                    </ul>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
