"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { 
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff, 
  Users, Clock, DollarSign, TrendingUp, AlertCircle,
  CheckCircle2, XCircle, Zap, Brain, Target
} from "lucide-react";

interface AISignal {
  id: string;
  timestamp: Date;
  type: "nudge" | "warning" | "insight";
  message: string;
  dismissed: boolean;
}

interface MeetingData {
  meeting_id: string;
  customer_name: string;
  company_name: string;
  status: string;
  current_phase: string;
  elapsed_time: number;
  ai_cost: number;
  icp_score: number;
}

export default function ShadowDashboardPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;

  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [aiSignals, setAiSignals] = useState<AISignal[]>([]);
  const [aiListening, setAiListening] = useState(false);
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, timestamp: string}>>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [takingOver, setTakingOver] = useState(false);

  const dailyFrameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Fetch meeting data
    fetchMeetingData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchMeetingData, 5000);

    return () => clearInterval(interval);
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/ai-demo/meeting/${meetingId}/status`);
      const data = await response.json();
      setMeetingData(data);
    } catch (error) {
      console.error("Error fetching meeting data:", error);
    }
  };

  const toggleAIListening = () => {
    setAiListening(!aiListening);
    
    if (!aiListening) {
      // Start AI listening
      addAISignal("insight", "AI listening enabled - analyzing conversation");
    } else {
      // Stop AI listening
      addAISignal("insight", "AI listening disabled");
    }
  };

  const addAISignal = (type: "nudge" | "warning" | "insight", message: string) => {
    const signal: AISignal = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message,
      dismissed: false
    };
    setAiSignals(prev => [signal, ...prev].slice(0, 10)); // Keep last 10
  };

  const dismissSignal = (id: string) => {
    setAiSignals(prev => prev.map(s => s.id === id ? {...s, dismissed: true} : s));
  };

  const handleTakeover = async () => {
    if (!confirm("Are you sure you want to take over this call? The AI will mute immediately.")) {
      return;
    }

    setTakingOver(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/ai-demo/meeting/${meetingId}/takeover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          takeover_user: "admin@kestrel.ai",
          takeover_reason: "Manual takeover from shadow dashboard"
        })
      });

      if (response.ok) {
        addAISignal("warning", "You are now in control - AI muted");
      }
    } catch (error) {
      console.error("Error taking over:", error);
      alert("Failed to take over call");
    } finally {
      setTakingOver(false);
    }
  };

  // Simulate AI signals (in production, these come from WebSocket)
  useEffect(() => {
    if (!aiListening) return;

    const simulateSignals = () => {
      const signals = [
        { type: "nudge" as const, message: "Ask about daily call volume" },
        { type: "insight" as const, message: "Customer mentioned 'after hours' - pain point detected" },
        { type: "nudge" as const, message: "Good time to ask about budget" },
        { type: "warning" as const, message: "Customer talking >70% - ask clarifying question" },
        { type: "insight" as const, message: "Decision maker confirmed - high ICP fit" }
      ];

      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      addAISignal(randomSignal.type, randomSignal.message);
    };

    const interval = setInterval(simulateSignals, 45000); // Every 45 seconds

    return () => clearInterval(interval);
  }, [aiListening]);

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      framing: "bg-blue-100 text-blue-800",
      discovery: "bg-purple-100 text-purple-800",
      pitch: "bg-green-100 text-green-800",
      close: "bg-orange-100 text-orange-800",
      exit: "bg-gray-100 text-gray-800"
    };
    return colors[phase] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Demo Shadow Dashboard</h1>
            <p className="text-sm text-gray-600">Meeting ID: {meetingId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAIListening}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                aiListening 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Brain className="w-5 h-5" />
              <span>{aiListening ? "AI Listening" : "AI Off"}</span>
            </button>
            <button
              onClick={handleTakeover}
              disabled={takingOver}
              className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Zap className="w-5 h-5" />
              <span>{takingOver ? "Taking Over..." : "Take Over Call"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Main Video Area */}
        <div className="col-span-8 space-y-6">
          {/* Video Frame */}
          <div className="bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
            <iframe
              ref={dailyFrameRef}
              src={`https://kestrel.daily.co/${meetingId}?t=SHADOW_TOKEN_HERE`}
              allow="camera; microphone; fullscreen; display-capture"
              className="w-full h-full"
            />
          </div>

          {/* AI Signals Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Sales Shadow
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                aiListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {aiListening ? "Active" : "Inactive"}
              </span>
            </div>

            {aiSignals.filter(s => !s.dismissed).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {aiListening ? (
                  <p>Listening... AI signals will appear here</p>
                ) : (
                  <p>Enable AI listening to get real-time insights</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {aiSignals.filter(s => !s.dismissed).slice(0, 3).map(signal => (
                  <div
                    key={signal.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      signal.type === 'nudge' ? 'bg-blue-50 border-blue-500' :
                      signal.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                      'bg-purple-50 border-purple-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {signal.type === 'nudge' && <Target className="w-5 h-5 text-blue-600 mt-0.5" />}
                        {signal.type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />}
                        {signal.type === 'insight' && <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />}
                        <div>
                          <p className="font-medium text-gray-900">{signal.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {signal.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissSignal(signal.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transcript Toggle */}
          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-lg font-bold text-gray-900">Live Transcript</h2>
              <span className="text-sm text-gray-600">
                {showTranscript ? "Hide" : "Show"}
              </span>
            </button>
            
            {showTranscript && (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {transcript.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transcript yet</p>
                ) : (
                  transcript.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <span className={`font-semibold ${
                        item.speaker === 'AI' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {item.speaker}:
                      </span>
                      <span className="text-gray-700 ml-2">{item.text}</span>
                      <span className="text-xs text-gray-400 ml-2">{item.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Meeting Info */}
        <div className="col-span-4 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">{meetingData?.customer_name || "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold text-gray-900">{meetingData?.company_name || "Loading..."}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  meetingData?.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {meetingData?.status || "scheduled"}
                </span>
              </div>
            </div>
          </div>

          {/* Call Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Call Metrics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Elapsed Time</span>
                </div>
                <span className="font-bold text-lg text-gray-900">
                  {formatTime(meetingData?.elapsed_time || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">AI Cost</span>
                </div>
                <span className="font-bold text-lg text-gray-900">
                  ${(meetingData?.ai_cost || 0).toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">ICP Score</span>
                </div>
                <span className="font-bold text-lg text-gray-900">
                  {meetingData?.icp_score || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Current Phase */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Current Phase</h2>
            <div className="space-y-2">
              {['framing', 'discovery', 'pitch', 'close', 'exit'].map(phase => (
                <div
                  key={phase}
                  className={`px-4 py-2 rounded-lg ${
                    meetingData?.current_phase === phase
                      ? getPhaseColor(phase)
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{phase}</span>
                    {meetingData?.current_phase === phase && (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Full Transcript
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Download Recording
              </button>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Export Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
