"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, Clock, User, Building2, Search, History, Play, Download } from "lucide-react";

interface CallLog {
  call_sid: string;
  to_number: string;
  contact_name?: string;
  contact_company?: string;
  status: string;
  duration?: number;
  started_at: string;
  recording_url?: string;
}

export default function ClickToCallPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/click-to-call/history");
      const data = await response.json();
      setCallHistory(data.calls || []);
    } catch (error) {
      console.error("Error fetching call history:", error);
    }
  };

  const initiateCall = async () => {
    if (!phoneNumber) {
      alert("Please enter a phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/click-to-call/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": "admin@kestrel.ai"
        },
        body: JSON.stringify({
          to_number: phoneNumber,
          contact_name: contactName || null,
          contact_company: contactCompany || null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }

      const callLog = await response.json();
      setActiveCall(callLog);

      // Poll for call status
      pollCallStatus(callLog.call_sid);

    } catch (error) {
      console.error("Error initiating call:", error);
      alert("Failed to initiate call. Please check your Twilio configuration.");
    } finally {
      setLoading(false);
    }
  };

  const pollCallStatus = async (callSid: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/click-to-call/status/${callSid}`);
        const status = await response.json();

        setActiveCall((prev: any) => ({
          ...prev,
          status: status.status,
          duration: status.duration
        }));

        if (status.status === "completed" || status.status === "failed") {
          clearInterval(interval);
          setActiveCall(null);
          fetchCallHistory();
        }
      } catch (error) {
        console.error("Error polling call status:", error);
        clearInterval(interval);
      }
    }, 2000);
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      await fetch(`http://localhost:8000/api/click-to-call/end/${activeCall.call_sid}`, {
        method: "POST"
      });

      setActiveCall(null);
      fetchCallHistory();
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredHistory = callHistory.filter(call => 
    call.to_number.includes(searchQuery) ||
    call.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.contact_company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Click-to-Call Dialer</h1>
          <p className="text-gray-600">Call from anywhere, auto-log everything</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Dialer Panel */}
          <div className="col-span-5">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Make a Call</h2>

              {!activeCall ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building2 className="inline w-4 h-4 mr-2" />
                      Company
                    </label>
                    <input
                      type="text"
                      value={contactCompany}
                      onChange={(e) => setContactCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={initiateCall}
                    disabled={loading || !phoneNumber}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{loading ? "Calling..." : "Start Call"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Phone className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {activeCall.contact_name || "Unknown"}
                    </h3>
                    <p className="text-gray-600">{activeCall.to_number}</p>
                    {activeCall.contact_company && (
                      <p className="text-sm text-gray-500">{activeCall.contact_company}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {activeCall.status}
                    </p>
                    {activeCall.duration && (
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {formatDuration(activeCall.duration)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={endCall}
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>End Call</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600">Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">0m</p>
                  <p className="text-sm text-gray-600">Talk Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">0%</p>
                  <p className="text-sm text-gray-600">Connect Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call History */}
          <div className="col-span-7">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Call History
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search calls..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No calls yet</p>
                  <p className="text-sm text-gray-400 mt-2">Your call history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map((call) => (
                    <div
                      key={call.call_sid}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              call.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <Phone className={`w-5 h-5 ${
                                call.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {call.contact_name || call.to_number}
                              </p>
                              {call.contact_company && (
                                <p className="text-sm text-gray-600">{call.contact_company}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 ml-13">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(call.started_at).toLocaleString()}
                            </span>
                            {call.duration && (
                              <span>{formatDuration(call.duration)}</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              call.status === 'completed' ? 'bg-green-100 text-green-800' :
                              call.status === 'no-answer' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {call.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {call.recording_url && (
                            <button title="Play recording" aria-label="Play recording" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Play className="w-5 h-5" />
                            </button>
                          )}
                          <button title="Download recording" aria-label="Download recording" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
