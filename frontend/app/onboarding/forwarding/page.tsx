"use client";

import { useState } from "react";
import { Phone, Check, AlertCircle, Settings, TestTube, Save, XCircle } from "lucide-react";

export default function ForwardingOnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [forwardNumber, setForwardNumber] = useState("");
  const [enableRecording, setEnableRecording] = useState(true);
  const [missedCallSms, setMissedCallSms] = useState(true);
  const [smsTemplate, setSmsTemplate] = useState(
    "Sorry we missed your call! We'll call you back during business hours (8am-6pm). - KC Comfort Air"
  );
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phone) {
      setErrors({ phone: "Phone number is required" });
      return false;
    }
    if (!phoneRegex.test(phone.replace(/[\s()-]/g, ""))) {
      setErrors({ phone: "Invalid phone number format. Use E.164 format (e.g., +1234567890)" });
      return false;
    }
    setErrors({});
    return true;
  };

  const testForwarding = async () => {
    if (!validatePhoneNumber(forwardNumber)) {
      setNotification({type: "error", message: "Please enter a valid phone number"});
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setTesting(true);
    try {
      const response = await fetch("http://localhost:8000/api/call-workflow/forwarding/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: forwardNumber })
      });

      if (response.ok) {
        setTestSuccess(true);
        setNotification({type: "success", message: "Test call initiated successfully!"});
        setTimeout(() => {
          setNotification(null);
          setStep(3);
        }, 2000);
      } else {
        const error = await response.json();
        setNotification({type: "error", message: error.detail || "Test call failed"});
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Test failed:", error);
      setNotification({type: "error", message: "Failed to initiate test call. Please check your connection."});
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!validatePhoneNumber(forwardNumber)) {
      setNotification({type: "error", message: "Please enter a valid phone number"});
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (missedCallSms && smsTemplate.length > 160) {
      setNotification({type: "error", message: "SMS template must be 160 characters or less"});
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("http://localhost:8000/api/call-workflow/forwarding/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forward_number: forwardNumber,
          enable_recording: enableRecording,
          missed_call_sms_enabled: missedCallSms,
          missed_call_sms_template: smsTemplate
        })
      });

      if (response.ok) {
        setNotification({type: "success", message: "Configuration saved successfully!"});
        setTimeout(() => {
          window.location.href = "/admin/portal";
        }, 1500);
      } else {
        const error = await response.json();
        setNotification({type: "error", message: error.detail || "Failed to save configuration"});
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Save failed:", error);
      setNotification({type: "error", message: "Failed to save configuration. Please try again."});
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md flex items-start space-x-3 animate-fade-in`}>
          {notification.type === 'success' ? <Check className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
          <p className="flex-1 text-sm text-gray-900">{notification.message}</p>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Forwarding Setup</h1>
          <p className="text-gray-600">Configure where calls should be forwarded when AI can't handle them</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Enter Number */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Phone className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Enter Forwarding Number</h2>
            </div>

            <p className="text-gray-600 mb-6">
              This is the phone number where calls will be forwarded when:
            </p>

            <ul className="list-disc list-inside text-gray-600 mb-8 space-y-2">
              <li>Customer requests to speak with a human</li>
              <li>Emergency is detected</li>
              <li>AI reaches its call limit (20 calls)</li>
              <li>Call requires human intervention</li>
            </ul>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forwarding Phone Number *
              </label>
              <input
                type="tel"
                value={forwardNumber}
                onChange={(e) => {
                  setForwardNumber(e.target.value);
                  if (errors.phone) setErrors({});
                }}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Use E.164 format (e.g., +1234567890)
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!forwardNumber}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Test
            </button>
          </div>
        )}

        {/* Step 2: Test Call */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center space-x-3 mb-6">
              <TestTube className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Test Forwarding</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-blue-900 font-semibold mb-2">Test Call Details:</p>
              <p className="text-blue-800">We'll call: <span className="font-mono font-bold">{forwardNumber}</span></p>
              <p className="text-sm text-blue-700 mt-2">
                Answer the call to verify the number is correct
              </p>
            </div>

            {testSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-600" />
                <p className="text-green-800 font-semibold">Test call successful!</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={testForwarding}
                disabled={testing}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Calling...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    <span>Start Test Call</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configure Settings */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Additional Settings</h2>
            </div>

            <div className="space-y-6 mb-8">
              {/* Recording Toggle */}
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="recording"
                  checked={enableRecording}
                  onChange={(e) => setEnableRecording(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="recording" className="font-semibold text-gray-900 cursor-pointer">
                    Enable Call Recording
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Record all calls for quality assurance and training purposes
                  </p>
                </div>
              </div>

              {/* Missed Call SMS Toggle */}
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  id="missed-sms"
                  checked={missedCallSms}
                  onChange={(e) => setMissedCallSms(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="missed-sms" className="font-semibold text-gray-900 cursor-pointer">
                    Send SMS on Missed Calls
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically text customers when their call is missed
                  </p>
                </div>
              </div>

              {/* SMS Template */}
              {missedCallSms && (
                <div className="ml-9">
                  <label htmlFor="sms-template" className="block text-sm font-medium text-gray-700 mb-2">
                    Missed Call SMS Template
                  </label>
                  <textarea
                    id="sms-template"
                    value={smsTemplate}
                    onChange={(e) => setSmsTemplate(e.target.value)}
                    rows={3}
                    maxLength={160}
                    aria-label="Missed Call SMS Template"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {smsTemplate.length}/160 characters
                  </p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Configuration Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Forwarding Number:</span>
                  <span className="font-mono font-semibold">{forwardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Call Recording:</span>
                  <span className={enableRecording ? "text-green-600" : "text-gray-400"}>
                    {enableRecording ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Missed Call SMS:</span>
                  <span className={missedCallSms ? "text-green-600" : "text-gray-400"}>
                    {missedCallSms ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={saveConfiguration}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI will handle the first 20 calls automatically</li>
                <li>• After 20 calls, all calls will forward to your number</li>
                <li>• You can reset the AI call counter anytime</li>
                <li>• Missed calls will automatically receive an SMS if enabled</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
