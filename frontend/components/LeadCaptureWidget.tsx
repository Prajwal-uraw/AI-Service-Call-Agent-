'use client';

import { useState } from 'react';
import { Phone, Mail, Send, CheckCircle, Sparkles } from 'lucide-react';

export default function LeadCaptureWidget() {
  const [captureType, setCaptureType] = useState<'phone' | 'email' | null>(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/lead-capture/phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          name: name,
          source: 'website_lead_widget'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to capture phone number');
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error capturing phone:', error);
      alert('Please call our AI Voice Agent directly: (938) 839-6504');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/lead-capture/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'website_lead_widget'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please call our AI Voice Agent: (938) 839-6504');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Thank you, {name}!</h3>
        <p className="text-neutral-600 mb-6">
          {captureType === 'phone' 
            ? "Here's your AI Voice Agent number:" 
            : "Check your email for our case study and AI agent details."}
        </p>
        {captureType === 'phone' && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 mb-4">
            <div className="text-sm font-medium text-neutral-600 mb-3">Call Now - Experience AI in 30 Seconds</div>
            <a 
              href="tel:+19388396504"
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-xl text-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Phone className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              (938) 839-6504
            </a>
            <div className="text-xs text-neutral-500 mt-3">No signup required • Instant demo • Free to call</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-neutral-200 rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Get Started in 30 Seconds</span>
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Choose Your Experience
        </h3>
        <p className="text-neutral-600">
          Try our AI agent or get more information
        </p>
      </div>

      {!captureType ? (
        <div className="space-y-3">
          {/* Option 1: Call AI Agent (Zero Friction) */}
          <a
            href="tel:+19388396504"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-bold">Call AI Agent Now</div>
                  <div className="text-xs opacity-90">(938) 839-6504 • Instant demo</div>
                </div>
              </div>
              <div className="text-xs bg-white/20 px-2 py-1 rounded">FREE</div>
            </div>
          </a>

          {/* Option 2: Text Me the Number (Low Friction) */}
          <button
            onClick={() => setCaptureType('phone')}
            className="block w-full bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-200 hover:border-blue-300 px-6 py-4 rounded-lg font-semibold transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold">Text Me the Number</div>
                <div className="text-xs text-neutral-600">Get AI agent number via SMS</div>
              </div>
            </div>
          </button>

          {/* Option 3: Send Case Study (Medium Friction) */}
          <button
            onClick={() => setCaptureType('email')}
            className="block w-full bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-200 hover:border-blue-300 px-6 py-4 rounded-lg font-semibold transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold">Email Me Case Study</div>
                <div className="text-xs text-neutral-600">See how HVAC companies save $180K+</div>
              </div>
            </div>
          </button>

          {/* Option 4: Book Full Demo (High Friction) */}
          <a
            href="/calendar"
            className="block w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-6 py-4 rounded-lg font-semibold transition-all text-center"
          >
            Book Full Demo with Team
          </a>
        </div>
      ) : captureType === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 123-4567"
              required
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCaptureType(null)}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-3 rounded-lg font-semibold transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4" />
                  Get Number
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCaptureType(null)}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-3 rounded-lg font-semibold transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Sending...' : (
                <>
                  <Send className="w-4 h-4" />
                  Send Case Study
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
        We respect your privacy. No spam, ever.
      </div>
    </div>
  );
}
