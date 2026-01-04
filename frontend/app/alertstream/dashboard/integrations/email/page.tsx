'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, Copy, ExternalLink, AlertCircle } from 'lucide-react';

export default function EmailIntegrationPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [forwardEmail, setForwardEmail] = useState('alert+user123@monitor.alertstream.com');
  const [copied, setCopied] = useState(false);

  const methods = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'One-click setup with Gmail forwarding',
      setupTime: '2 minutes',
      difficulty: 'Easy',
    },
    {
      id: 'outlook',
      name: 'Outlook / Hotmail',
      description: 'Auto-forward from Outlook.com',
      setupTime: '3 minutes',
      difficulty: 'Easy',
    },
    {
      id: 'office365',
      name: 'Office 365',
      description: 'OAuth integration for corporate email',
      setupTime: '5 minutes',
      difficulty: 'Medium',
    },
    {
      id: 'yahoo',
      name: 'Yahoo Mail',
      description: 'Forward important emails to AlertStream',
      setupTime: '3 minutes',
      difficulty: 'Easy',
    },
    {
      id: 'other',
      name: 'Other Email Provider',
      description: 'Manual forwarding setup',
      setupTime: '5 minutes',
      difficulty: 'Medium',
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(forwardEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGmailInstructions = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Quick Setup (Recommended)</h4>
        <a
          href={`https://mail.google.com/mail/u/0/#settings/fwdandpop`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <span>Open Gmail Settings</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Step-by-Step Instructions:</h4>
        <ol className="space-y-3 list-decimal list-inside text-gray-700">
          <li>Click the button above to open Gmail settings</li>
          <li>Click on the "Forwarding and POP/IMAP" tab</li>
          <li>Click "Add a forwarding address"</li>
          <li>
            Enter this email address:
            <div className="mt-2 flex items-center space-x-2">
              <code className="bg-gray-100 px-3 py-2 rounded flex-1">{forwardEmail}</code>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-sky-500 text-white rounded hover:bg-sky-600"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </li>
          <li>Click "Next" then "Proceed"</li>
          <li>Check your inbox for a confirmation email from Gmail</li>
          <li>Click the confirmation link in that email</li>
          <li>Return to Gmail settings and select "Forward a copy of incoming mail"</li>
          <li>Choose whether to keep Gmail's copy or archive it</li>
          <li>Click "Save Changes"</li>
        </ol>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">What happens next?</h4>
            <p className="text-green-800 text-sm">
              Once setup is complete, you'll receive SMS alerts for emails matching your rules.
              You can configure which emails trigger alerts in the Rules section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const getOutlookInstructions = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Quick Setup</h4>
        <a
          href="https://outlook.live.com/mail/options/mail/rules"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <span>Open Outlook Rules</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Setup Instructions:</h4>
        <ol className="space-y-3 list-decimal list-inside text-gray-700">
          <li>Sign in to Outlook.com</li>
          <li>Click the button above to open Rules settings</li>
          <li>Click "Add new rule"</li>
          <li>Name your rule (e.g., "AlertStream Forwarding")</li>
          <li>Add conditions for which emails to forward</li>
          <li>
            Set action to "Forward to":
            <div className="mt-2 flex items-center space-x-2">
              <code className="bg-gray-100 px-3 py-2 rounded flex-1">{forwardEmail}</code>
              <button
                onClick={copyToClipboard}
                className="p-2 bg-sky-500 text-white rounded hover:bg-sky-600"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </li>
          <li>Click "Save"</li>
        </ol>
      </div>
    </div>
  );

  const getOffice365Instructions = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Admin Approval Required</h4>
            <p className="text-yellow-800 text-sm">
              Office 365 integration requires OAuth authentication. Your IT administrator may need to approve this integration.
            </p>
          </div>
        </div>
      </div>

      <button className="w-full bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors">
        Connect Office 365 Account
      </button>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">What we'll access:</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Read email messages (Mail.Read)</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Read basic email properties (Mail.ReadBasic)</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600">
          We never store your emails. We only analyze them for keywords and send SMS alerts.
        </p>
      </div>
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
          <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Monitoring</h1>
            <p className="text-gray-600">Get SMS alerts for important emails</p>
          </div>
        </div>
      </div>

      {/* Method Selection */}
      {!selectedMethod ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Email Provider</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {methods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className="text-left bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-sky-500 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">⏱️ {method.setupTime}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    method.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {method.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <button
            onClick={() => setSelectedMethod('')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Choose different provider</span>
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Setup {methods.find(m => m.id === selectedMethod)?.name}
            </h2>

            {selectedMethod === 'gmail' && getGmailInstructions()}
            {selectedMethod === 'outlook' && getOutlookInstructions()}
            {selectedMethod === 'office365' && getOffice365Instructions()}
            {(selectedMethod === 'yahoo' || selectedMethod === 'other') && getOutlookInstructions()}
          </div>

          {/* Next Steps */}
          <div className="mt-6 bg-sky-50 rounded-lg border border-sky-200 p-6">
            <h3 className="font-semibold text-sky-900 mb-3">After Setup</h3>
            <ol className="space-y-2 text-sky-800 text-sm list-decimal list-inside">
              <li>Configure email monitoring rules</li>
              <li>Set keywords to watch for</li>
              <li>Choose which senders to monitor</li>
              <li>Test with a sample email</li>
            </ol>
            <Link
              href="/alertstream/dashboard/integrations/email/rules"
              className="inline-block mt-4 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
            >
              Configure Rules
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
