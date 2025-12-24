"use client";

import { useState } from "react";
import { Mail, Send, Edit, Copy, CheckCircle2, Clock, TrendingUp, Zap, Linkedin } from "lucide-react";

export default function FollowUpAutopilotPage() {
  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: "John Smith",
    companyName: "Acme HVAC",
    callSummary: "Discussed AI voice agent for after-hours calls",
    painPoints: "missed calls, after-hours coverage, hiring challenges",
    objections: "setup time concerns",
    dealStage: "discovery",
    ctaAgreed: "technical walkthrough"
  });

  const generateFollowUp = async () => {
    setGenerating(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockEmail = {
        email: {
          subject: "Next steps from today's discussion",
          body: `Thanks for the time today, ${formData.customerName}. Based on what you shared about ${formData.painPoints.split(',')[0]}, the AI demo we discussed would directly reduce lead loss after hours.\n\nYou raised concerns around setup time — this is typically under 30 minutes with our team's help.\n\nSuggested next step: a 15-min technical walkthrough this week. Does Thursday work?`,
          word_count: 67
        },
        linkedin: {
          message: `Great talking today about reducing missed calls. Let's schedule that technical walkthrough - does Thursday work?`
        }
      };

      setGeneratedEmail(mockEmail);

    } catch (error) {
      console.error("Error generating follow-up:", error);
      alert("Failed to generate follow-up");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Deterministic Follow-up Workflows</h1>
          <p className="text-gray-600 mt-1">Automated, verifiable follow-up sequences that ensure consistent outcomes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Input Form */}
          <div className="col-span-5">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Call Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Summary
                  </label>
                  <textarea
                    value={formData.callSummary}
                    onChange={(e) => setFormData({...formData, callSummary: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pain Points (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.painPoints}
                    onChange={(e) => setFormData({...formData, painPoints: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objections
                  </label>
                  <input
                    type="text"
                    value={formData.objections}
                    onChange={(e) => setFormData({...formData, objections: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Stage
                  </label>
                  <select
                    value={formData.dealStage}
                    onChange={(e) => setFormData({...formData, dealStage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="demo">Demo</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Agreed
                  </label>
                  <input
                    type="text"
                    value={formData.ctaAgreed}
                    onChange={(e) => setFormData({...formData, ctaAgreed: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={generateFollowUp}
                  disabled={generating}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>{generating ? "Generating..." : "Generate Follow-Up"}</span>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What Makes It Great</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Context-Specific</p>
                    <p className="text-sm text-gray-600">Tailored to their pain points</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Addresses Objections</p>
                    <p className="text-sm text-gray-600">Tackles concerns head-on</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Clear Next Step</p>
                    <p className="text-sm text-gray-600">Always includes deadline</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Max 120 Words</p>
                    <p className="text-sm text-gray-600">Concise and scannable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Output */}
          <div className="col-span-7 space-y-6">
            {!generatedEmail ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No follow-up generated yet</p>
                <p className="text-sm text-gray-400 mt-2">Fill in the call details and click Generate</p>
              </div>
            ) : (
              <>
                {/* Email */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Mail className="w-6 h-6 mr-2 text-blue-600" />
                      Email Follow-Up
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {generatedEmail.email.word_count} words
                      </span>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${generatedEmail.email.subject}\n\n${generatedEmail.email.body}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Subject:</p>
                      <p className="font-semibold text-gray-900">{generatedEmail.email.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Body:</p>
                      <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {generatedEmail.email.body}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-4">
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>Send Email</span>
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2">
                      <Edit className="w-5 h-5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Linkedin className="w-6 h-6 mr-2 text-blue-700" />
                      LinkedIn Message
                    </h2>
                    <button
                      onClick={() => copyToClipboard(generatedEmail.linkedin.message)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-900 leading-relaxed">
                      {generatedEmail.linkedin.message}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 mt-4">
                    <button className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2">
                      <Linkedin className="w-5 h-5" />
                      <span>Send on LinkedIn</span>
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2">
                      <Edit className="w-5 h-5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">Why This Works</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">4-Part</div>
                      <div className="text-sm text-green-100">Structure</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">≤120</div>
                      <div className="text-sm text-green-100">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">100%</div>
                      <div className="text-sm text-green-100">Context</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
