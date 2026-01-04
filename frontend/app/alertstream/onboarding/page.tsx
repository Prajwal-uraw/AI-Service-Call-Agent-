'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, CheckCircle, ArrowRight, ArrowLeft, Smartphone, Globe, Zap, Code, TestTube, PartyPopper } from 'lucide-react';

type Step = 'welcome' | 'phone' | 'verify' | 'website' | 'integration' | 'trigger' | 'test' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
    websiteName: '',
    websiteDomain: '',
    eventType: '',
    smsTemplate: '',
  });

  const steps: { id: Step; title: string; icon: React.ElementType }[] = [
    { id: 'welcome', title: 'Welcome', icon: MessageSquare },
    { id: 'phone', title: 'Phone', icon: Smartphone },
    { id: 'verify', title: 'Verify', icon: CheckCircle },
    { id: 'website', title: 'Website', icon: Globe },
    { id: 'integration', title: 'Integration', icon: Code },
    { id: 'trigger', title: 'Trigger', icon: Zap },
    { id: 'test', title: 'Test', icon: TestTube },
    { id: 'complete', title: 'Complete', icon: PartyPopper },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleComplete = () => {
    router.push('/alertstream/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-sky-500" />
            <span className="text-2xl font-bold text-gray-900">AlertStream</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500' : isActive ? 'bg-sky-500' : 'bg-gray-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-white" />
                    ) : (
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === 'welcome' && (
          <div className="text-center">
            <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-10 w-10 text-sky-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to AlertStream!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Let's get you set up in just a few minutes. You'll be receiving SMS alerts in no time.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What we'll do:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Verify your phone number</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Connect your website</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Create your first trigger</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Send a test SMS</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleNext}
              className="bg-sky-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-sky-600 transition-colors inline-flex items-center"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {currentStep === 'phone' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verify Your Phone Number</h2>
            <p className="text-gray-600 mb-8">
              This is where you'll receive SMS alerts. We'll send a verification code to confirm.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent mb-4"
              />
              <p className="text-sm text-gray-500 mb-6">
                Include country code (e.g., +1 for US)
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.phone}
                  className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Code
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'verify' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Enter Verification Code</h2>
            <p className="text-gray-600 mb-8">
              We sent a 6-digit code to {formData.phone}
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code *
              </label>
              <input
                type="text"
                id="code"
                value={formData.verificationCode}
                onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-center text-2xl tracking-widest mb-4"
              />
              <button className="text-sky-500 hover:text-sky-600 text-sm mb-6">
                Resend code
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={formData.verificationCode.length !== 6}
                  className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'website' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Add Your Website</h2>
            <p className="text-gray-600 mb-8">
              Connect the website where you want to track events and send alerts.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="websiteName" className="block text-sm font-medium text-gray-700 mb-2">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    id="websiteName"
                    value={formData.websiteName}
                    onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                    placeholder="My Website"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="websiteDomain" className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <input
                    type="text"
                    id="websiteDomain"
                    value={formData.websiteDomain}
                    onChange={(e) => setFormData({ ...formData, websiteDomain: e.target.value })}
                    placeholder="example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.websiteName || !formData.websiteDomain}
                  className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'integration' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Install Integration</h2>
            <p className="text-gray-600 mb-8">
              Add this code snippet to your website to start tracking events.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<script src="https://cdn.alertstream.io/js/v1.js"></script>
<script>
  AlertStream.init('js_abc123def456');
</script>`}
                </code>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Copy this code and paste it before the closing &lt;/body&gt; tag on your website.
              </p>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-sky-900">
                  <strong>Don't worry!</strong> You can always find this code later in your dashboard.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
                >
                  I've Added the Code
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'trigger' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your First Trigger</h2>
            <p className="text-gray-600 mb-8">
              Set up when and how you want to receive SMS alerts.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Select event type</option>
                    <option value="form_submit">Form Submission</option>
                    <option value="order_created">New Order</option>
                    <option value="user_signup">User Signup</option>
                    <option value="custom">Custom Event</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                    Message Template *
                  </label>
                  <textarea
                    id="template"
                    value={formData.smsTemplate}
                    onChange={(e) => setFormData({ ...formData, smsTemplate: e.target.value })}
                    placeholder="New form submission from {{name}}!"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use {'{{'} variable {'}'} to insert dynamic data
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.eventType || !formData.smsTemplate}
                  className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Trigger
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'test' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Test Your Setup</h2>
            <p className="text-gray-600 mb-8">
              Let's send a test SMS to make sure everything is working correctly.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Test message will be sent to:</p>
                <p className="text-lg font-semibold text-gray-900">{formData.phone}</p>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-sky-900">
                  This will count toward your monthly SMS limit.
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center justify-center"
                >
                  <TestTube className="h-5 w-5 mr-2" />
                  Send Test SMS
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You're All Set! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your AlertStream account is ready. You'll start receiving SMS alerts when events happen on your website.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-left mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Create more triggers for different events</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">View your SMS history and analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Add more websites to monitor</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Upgrade your plan as you grow</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleComplete}
              className="bg-sky-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-sky-600 transition-colors inline-flex items-center"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
