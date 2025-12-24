"use client";

import { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertCircle, Target, Zap, Phone, Users, DollarSign, Clock, CheckCircle2, XCircle, Volume2 } from "lucide-react";

interface CallAnalysis {
  call_id: string;
  customer_name: string;
  company_name: string;
  deal_score: number;
  missing_signals: string[];
  risks: string[];
  next_action: string;
  duration: number;
  ai_cost: number;
  analyzed_at: string;
}

export default function CallIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"live" | "history" | "analytics">("live");
  const [aiListening, setAiListening] = useState(false);
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<CallAnalysis[]>([]);
  const [signals, setSignals] = useState<any[]>([]);

  const toggleAIListening = () => {
    setAiListening(!aiListening);
    if (!aiListening) {
      // Simulate AI signals
      setTimeout(() => {
        addSignal("nudge", "Ask about budget now");
      }, 5000);
      setTimeout(() => {
        addSignal("insight", "Decision maker confirmed - high ICP fit");
      }, 15000);
      setTimeout(() => {
        addSignal("warning", "Customer talking >70% - ask clarifying question");
      }, 25000);
    }
  };

  const addSignal = (type: string, message: string) => {
    const signal = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
      dismissed: false
    };
    setSignals(prev => [signal, ...prev].slice(0, 10));
  };

  const dismissSignal = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? {...s, dismissed: true} : s));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operational Telemetry</h1>
              <p className="text-gray-600 mt-1">Real-time voice ops metrics: resolution rate, escalation load, revenue impact</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleAIListening}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  aiListening 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Brain className="w-5 h-5" />
                <span>{aiListening ? "Telemetry Active" : "Start Monitoring"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "live"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Live Coaching
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Call History
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Live Coaching Tab */}
        {activeTab === "live" && (
          <div className="grid grid-cols-12 gap-6">
            {/* AI Signals Panel */}
            <div className="col-span-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-purple-600" />
                    Real-Time Coaching Signals
                  </h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    aiListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {aiListening ? "Active" : "Inactive"}
                  </span>
                </div>

                {signals.filter(s => !s.dismissed).length === 0 ? (
                  <div className="text-center py-16">
                    {aiListening ? (
                      <>
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                        <p className="text-gray-500 text-lg">Listening to call...</p>
                        <p className="text-sm text-gray-400 mt-2">AI signals will appear here</p>
                      </>
                    ) : (
                      <>
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">AI Listening Disabled</p>
                        <p className="text-sm text-gray-400 mt-2">Enable AI listening to get real-time coaching</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signals.filter(s => !s.dismissed).map(signal => (
                      <div
                        key={signal.id}
                        className={`p-6 rounded-lg border-l-4 ${
                          signal.type === 'nudge' ? 'bg-blue-50 border-blue-500' :
                          signal.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                          'bg-purple-50 border-purple-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {signal.type === 'nudge' && <Target className="w-6 h-6 text-blue-600 mt-1" />}
                            {signal.type === 'warning' && <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />}
                            {signal.type === 'insight' && <CheckCircle2 className="w-6 h-6 text-purple-600 mt-1" />}
                            <div className="flex-1">
                              <p className="text-lg font-semibold text-gray-900">{signal.message}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(signal.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => dismissSignal(signal.id)}
                            title="Dismiss signal"
                            aria-label="Dismiss signal"
                            className="text-gray-400 hover:text-gray-600 ml-4"
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* How It Works */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">How AI Call Intelligence Works</h3>
                <button title="Adjust volume" aria-label="Adjust volume" className="p-2 hover:bg-gray-100 rounded-lg">
                  <Volume2 className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Listen</h4>
                    <p className="text-sm text-gray-600">AI analyzes call audio in real-time</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Score</h4>
                    <p className="text-sm text-gray-600">Calculates deal health & risks</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Coach</h4>
                    <p className="text-sm text-gray-600">Provides actionable nudges</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="col-span-4 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Calls Analyzed</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Avg Deal Score</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Signals Sent</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{signals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-600">AI Cost</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Cost-Efficient Design</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Batches audio every 30 seconds. Max 1 signal per 30-45 seconds. Toggle on/off anytime.
                </p>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs text-blue-100 mb-1">Estimated Cost</p>
                  <p className="text-2xl font-bold">~$0.10</p>
                  <p className="text-xs text-blue-100">per 15-min call</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Call Analyses</h2>
            <div className="text-center py-16">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No calls analyzed yet</p>
              <p className="text-sm text-gray-400 mt-2">Start AI listening on your next call</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Deal Score Distribution</h3>
              <div className="text-center py-8">
                <p className="text-gray-500">No data yet</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Risks</h3>
              <div className="text-center py-8">
                <p className="text-gray-500">No data yet</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Signal Effectiveness</h3>
              <div className="text-center py-8">
                <p className="text-gray-500">No data yet</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
