'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Copy, CheckCircle, Download } from 'lucide-react';

export default function JavaScriptSDKPage() {
  const [copied, setCopied] = useState<string>('');
  const apiKey = 'js_abc123def456ghi789';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const cdnCode = `<!-- Add before closing </body> tag -->
<script src="https://cdn.alertstream.io/js/v1.js"></script>
<script>
  AlertStream.init('${apiKey}');
</script>`;

  const npmCode = `npm install @alertstream/sdk`;

  const npmUsage = `import AlertStream from '@alertstream/sdk';

AlertStream.init('${apiKey}');

// Track custom events
AlertStream.track('form_submit', {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
});`;

  const autoTrackCode = `// Automatically track all form submissions
AlertStream.autoTrackForms({
  selector: 'form',
  eventType: 'form_submit'
});

// Track specific forms
AlertStream.autoTrackForms({
  selector: '#contact-form',
  eventType: 'contact_form_submit'
});`;

  const customEventCode = `// E-commerce example
AlertStream.track('order_created', {
  order_id: '12345',
  amount: 299.99,
  customer_name: 'Jane Smith',
  items: 3
});

// User signup
AlertStream.track('user_signup', {
  email: 'user@example.com',
  plan: 'pro'
});

// Custom button click
document.getElementById('cta-button').addEventListener('click', () => {
  AlertStream.track('cta_clicked', {
    button_text: 'Get Started',
    page: window.location.pathname
  });
});`;

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
      >
        {copied === id ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/alertstream/dashboard/integrations"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Integrations</span>
        </Link>
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <Code className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">JavaScript SDK</h1>
            <p className="text-gray-600">Track events from your website</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Installation Methods */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Installation</h2>

          {/* CDN Method */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Method 1: CDN (Recommended)</h3>
            <p className="text-gray-600 mb-4">
              Add this code snippet to your website before the closing &lt;/body&gt; tag:
            </p>
            <CodeBlock code={cdnCode} id="cdn" />
          </div>

          {/* NPM Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Method 2: NPM Package</h3>
            <p className="text-gray-600 mb-4">
              For modern JavaScript applications:
            </p>
            <CodeBlock code={npmCode} id="npm" />
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Then in your code:</p>
              <CodeBlock code={npmUsage} id="npm-usage" />
            </div>
          </div>
        </div>

        {/* Auto-Track Forms */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Auto-Track Forms</h2>
          <p className="text-gray-600 mb-4">
            Automatically capture form submissions without writing custom code:
          </p>
          <CodeBlock code={autoTrackCode} id="auto-track" />
        </div>

        {/* Custom Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Track Custom Events</h2>
          <p className="text-gray-600 mb-4">
            Send custom events with any data you want:
          </p>
          <CodeBlock code={customEventCode} id="custom" />
        </div>

        {/* API Reference */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Reference</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-mono text-sm text-purple-600 mb-2">AlertStream.init(apiKey, options)</h3>
              <p className="text-gray-700 text-sm">
                Initialize the SDK with your API key. Call this once when your page loads.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-mono text-sm text-purple-600 mb-2">AlertStream.track(eventType, data)</h3>
              <p className="text-gray-700 text-sm">
                Send a custom event with optional data object.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-mono text-sm text-purple-600 mb-2">AlertStream.autoTrackForms(options)</h3>
              <p className="text-gray-700 text-sm">
                Automatically track form submissions. Options: selector, eventType.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-mono text-sm text-purple-600 mb-2">AlertStream.identify(userId, traits)</h3>
              <p className="text-gray-700 text-sm">
                Associate events with a specific user.
              </p>
            </div>
          </div>
        </div>

        {/* Download SDK */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-3">Download SDK</h3>
          <p className="text-purple-800 text-sm mb-4">
            Want to self-host? Download the SDK files:
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/downloads/alertstream.min.js"
              download
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              <span>alertstream.min.js</span>
            </a>
            <a
              href="/downloads/alertstream.js"
              download
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              <span>alertstream.js (dev)</span>
            </a>
            <a
              href="/downloads/alertstream.d.ts"
              download
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              <span>TypeScript definitions</span>
            </a>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-sky-50 rounded-lg border border-sky-200 p-6">
          <h3 className="font-semibold text-sky-900 mb-3">Next Steps</h3>
          <ol className="space-y-2 text-sky-800 text-sm list-decimal list-inside">
            <li>Add the SDK to your website</li>
            <li>Create triggers to define when to send SMS alerts</li>
            <li>Test by triggering events on your site</li>
            <li>Monitor SMS delivery in your dashboard</li>
          </ol>
          <Link
            href="/alertstream/dashboard/triggers/new"
            className="inline-block mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
          >
            Create Your First Trigger
          </Link>
        </div>
      </div>
    </div>
  );
}
