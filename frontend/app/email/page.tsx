'use client';

import { useState, useCallback, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Mail, Send, Inbox, Star, Archive, Plus, X } from 'lucide-react';

interface EmailContent {
  to: string;
  subject: string;
  body: string;
}

export default function EmailPage() {
  const [isEmailConnected, setIsEmailConnected] = useState<boolean>(false);
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [emailContent, setEmailContent] = useState<EmailContent>({
    to: '',
    subject: '',
    body: ''
  });

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const toggleEmailConnection = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    console.log('Toggling email connection');
    setIsEmailConnected(prev => {
      console.log('Previous state:', prev, 'New state:', !prev);
      return !prev;
    });
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('isEmailConnected state changed to:', isEmailConnected);
  }, [isEmailConnected]);

  const handleCompose = useCallback(() => {
    if (!isEmailConnected) {
      alert('Please connect your email first');
      return;
    }
    setShowComposeModal(true);
  }, [isEmailConnected]);

  const handleSendEmail = useCallback(async () => {
    if (!emailContent.to || !emailContent.subject || !emailContent.body) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsSending(true);
      // TODO: Implement actual email sending logic
      console.log('Sending email:', emailContent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setEmailContent({ to: '', subject: '', body: '' });
      setShowComposeModal(false);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [emailContent]);

  const updateEmailContent = useCallback((field: keyof EmailContent, value: string) => {
    setEmailContent(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Email</h1>
          <button 
            onClick={handleCompose}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isEmailConnected 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!isEmailConnected}
          >
            <Plus className="w-4 h-4" />
            Compose
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 bg-white border border-neutral-200 rounded-lg p-4">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-lg">
                <Inbox className="w-4 h-4" />
                Inbox
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">12</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Star className="w-4 h-4" />
                Starred
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Send className="w-4 h-4" />
                Sent
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Archive className="w-4 h-4" />
                Archive
              </button>
            </nav>
          </div>

          {!isEmailConnected ? (
            <div className="col-span-3 bg-white border border-neutral-200 rounded-lg p-6">
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Email Integration</h3>
                <p className="text-sm text-neutral-600 mb-6">Connect your email to manage all communications in one place</p>
                <button 
                  onClick={toggleEmailConnection}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{ userSelect: 'none' }}
                >
                  Connect Email
                </button>
              </div>
            </div>
          ) : (
            <div className="col-span-3 bg-white border border-neutral-200 rounded-lg p-6">
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Email Connected</h3>
                <p className="text-sm text-neutral-600 mb-6">You can now send and receive emails</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={handleCompose}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Compose New Email
                  </button>
                  <button 
                    onClick={toggleEmailConnection}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compose Email Modal */}
        {showComposeModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !isSending && setShowComposeModal(false)}
          >
            <div 
              className="bg-white rounded-lg w-full max-w-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200">
                <h3 className="font-semibold text-lg">New Message</h3>
                <button 
                  onClick={() => !isSending && setShowComposeModal(false)}
                  className="text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
                  disabled={isSending}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="To"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={emailContent.to}
                    onChange={(e) => updateEmailContent('to', e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={emailContent.subject}
                    onChange={(e) => updateEmailContent('subject', e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Compose your email here..."
                    rows={10}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={emailContent.body}
                    onChange={(e) => updateEmailContent('body', e.target.value)}
                    disabled={isSending}
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 rounded-b-lg flex justify-end space-x-2">
                <button
                  onClick={() => !isSending && setShowComposeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md disabled:opacity-50"
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center gap-2 ${
                    isSending || !emailContent.to || !emailContent.subject || !emailContent.body
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={isSending || !emailContent.to || !emailContent.subject || !emailContent.body}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
