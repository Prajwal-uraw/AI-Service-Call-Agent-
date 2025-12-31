'use client';

import { TestEmailButton } from '@/components/TestEmailButton';

export default function EmailTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Email Testing</h1>
      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Test Email Sending</h2>
          <p className="text-sm text-gray-600 mb-6">
            Click the button below to send a test email. Make sure to update the recipient email in the component.
          </p>
          <TestEmailButton />
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">How to Use</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
            <li>Open <code className="bg-gray-100 px-1.5 py-0.5 rounded">components/TestEmailButton.tsx</code></li>
            <li>Update the email address in the <code className="bg-gray-100 px-1.5 py-0.5 rounded">to</code> field</li>
            <li>Click the "Send Test Email" button</li>
            <li>Check the recipient's inbox for the test email</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
