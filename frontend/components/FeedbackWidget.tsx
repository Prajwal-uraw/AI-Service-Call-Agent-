'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Bug, Lightbulb, ThumbsUp } from 'lucide-react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Send to backend
    console.log('Feedback submitted:', { feedbackType, message });
    
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setMessage('');
      setFeedbackType('general');
    }, 2000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Open feedback widget"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-neutral-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />
              <h3 className="font-semibold">Send Feedback</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
              aria-label="Close feedback widget"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Thank you!</h4>
                <p className="text-sm text-neutral-600">Your feedback has been submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Feedback Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    What would you like to share?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackType('bug')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        feedbackType === 'bug'
                          ? 'border-red-500 bg-red-50'
                          : 'border-neutral-200 hover:border-red-300'
                      }`}
                    >
                      <Bug className={`w-5 h-5 mx-auto mb-1 ${
                        feedbackType === 'bug' ? 'text-red-600' : 'text-neutral-600'
                      }`} />
                      <div className="text-xs font-medium">Bug</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFeedbackType('feature')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        feedbackType === 'feature'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-200 hover:border-blue-300'
                      }`}
                    >
                      <Lightbulb className={`w-5 h-5 mx-auto mb-1 ${
                        feedbackType === 'feature' ? 'text-blue-600' : 'text-neutral-600'
                      }`} />
                      <div className="text-xs font-medium">Feature</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFeedbackType('general')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        feedbackType === 'general'
                          ? 'border-green-500 bg-green-50'
                          : 'border-neutral-200 hover:border-green-300'
                      }`}
                    >
                      <MessageSquare className={`w-5 h-5 mx-auto mb-1 ${
                        feedbackType === 'general' ? 'text-green-600' : 'text-neutral-600'
                      }`} />
                      <div className="text-xs font-medium">General</div>
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={4}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send size={18} />
                  Send Feedback
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-neutral-50 px-4 py-3 rounded-b-lg border-t border-neutral-200">
            <p className="text-xs text-neutral-600 text-center">
              We read every piece of feedback and use it to improve Kestrel
            </p>
          </div>
        </div>
      )}
    </>
  );
}
