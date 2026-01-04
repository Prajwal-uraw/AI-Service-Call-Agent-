'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Linkedin, Chrome, Download, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function LinkedInIntegrationPage() {
  const [installed, setInstalled] = useState(false);

  const features = [
    {
      title: 'Profile Views',
      description: 'Get notified when someone views your LinkedIn profile',
      icon: '👀',
    },
    {
      title: 'Messages',
      description: 'Instant alerts for new LinkedIn messages',
      icon: '💬',
    },
    {
      title: 'Connection Requests',
      description: 'Know immediately when someone wants to connect',
      icon: '🤝',
    },
    {
      title: 'Post Mentions',
      description: 'Track when you are mentioned in posts or comments',
      icon: '📢',
    },
  ];

  const monitoringRules = [
    {
      id: 'profile-views',
      name: 'Profile Views from Recruiters',
      description: 'Alert when profiles containing "recruiter" or "hiring" view your profile',
      enabled: true,
    },
    {
      id: 'messages-vip',
      name: 'VIP Messages',
      description: 'Priority alerts for messages from connections with specific titles',
      enabled: true,
    },
    {
      id: 'connection-requests',
      name: 'All Connection Requests',
      description: 'Get notified for every new connection request',
      enabled: false,
    },
  ];

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
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <Linkedin className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LinkedIn Monitor</h1>
            <p className="text-gray-600">Track LinkedIn activity via browser extension</p>
          </div>
        </div>
      </div>

      {/* Installation Status */}
      {!installed ? (
        <div className="max-w-3xl">
          {/* Features */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What You Can Monitor</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Installation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Install Browser Extension</h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Chrome className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-2">Chrome Extension</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      Install our extension from the Chrome Web Store
                    </p>
                    <a
                      href="https://chrome.google.com/webstore"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Add to Chrome</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Chrome className="h-6 w-6 text-orange-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">Firefox Add-on</h3>
                    <p className="text-orange-800 text-sm mb-3">
                      Also available for Firefox users
                    </p>
                    <a
                      href="https://addons.mozilla.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Add to Firefox</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-900">After Installation:</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Click the AlertStream extension icon in your browser</li>
                <li>Sign in with your AlertStream account</li>
                <li>Grant permission to monitor LinkedIn</li>
                <li>Configure your monitoring rules below</li>
              </ol>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Privacy & Permissions</h4>
                <p className="text-yellow-800 text-sm">
                  The extension only monitors LinkedIn pages when you're actively browsing.
                  We never access your LinkedIn password or store your LinkedIn data.
                  All monitoring happens locally in your browser.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setInstalled(true)}
            className="mt-6 w-full bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
          >
            I've Installed the Extension
          </button>
        </div>
      ) : (
        <div className="max-w-3xl">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Extension Connected!</h3>
                <p className="text-green-800 text-sm">
                  Your LinkedIn monitoring is now active. Configure rules below to customize your alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Monitoring Rules */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Monitoring Rules</h2>
            
            <div className="space-y-4">
              {monitoringRules.map(rule => (
                <div key={rule.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{rule.name}</h3>
                    <p className="text-gray-600 text-sm">{rule.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors">
              Add New Rule
            </button>
          </div>

          {/* Test */}
          <div className="mt-6 bg-sky-50 rounded-lg border border-sky-200 p-6">
            <h3 className="font-semibold text-sky-900 mb-3">Test Your Setup</h3>
            <p className="text-sky-800 text-sm mb-4">
              Visit LinkedIn to test if alerts are working correctly.
            </p>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
            >
              <span>Open LinkedIn</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
