'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DialerKeypad from '@/components/DialerKeypad';
import LeadsPreview from '@/components/LeadsPreview';
import { 
  Phone, PhoneCall, PhoneOff, Clock, Mic, MicOff, Pause, Play,
  PhoneForwarded, Settings, Waves, Delete
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  notes?: string;
}

export default function OutboundCallsPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [recordCall, setRecordCall] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Call control states
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'ready' | 'calling' | 'connected' | 'ended'>('ready');
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Voice quality settings (Twilio built-in)
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Current time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Start call timer
  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format current time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  // Handle lead selection
  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setPhoneNumber(lead.phone);
    setContactName(lead.name);
  };

  // Handle dialpad press
  const handleDialpadPress = (digit: string) => {
    if (digit === 'backspace') {
      setPhoneNumber(prev => prev.slice(0, -1));
    } else {
      setPhoneNumber(prev => prev + digit);
    }
  };

  // Initiate call
  const initiateCall = async () => {
    if (!phoneNumber) {
      alert('Please enter a phone number');
      return;
    }

    setLoading(true);
    setCallStatus('calling');
    
    try {
      const response = await fetch('/api/outbound-calls/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_number: phoneNumber,
          contact_name: contactName,
          call_purpose: 'outbound_sales',
          use_ai_agent: useAI,
          record_call: recordCall,
          voice_settings: {
            noise_suppression: noiseSuppression,
            echo_cancellation: echoCancellation
          }
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsInCall(true);
        setCallStatus('connected');
        startCallTimer();
        
        // Mark lead as contacted if selected
        if (selectedLead) {
          await fetch(`/api/scraped-leads/${selectedLead.id}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        alert(`Failed to initiate call: ${data.error}`);
        setCallStatus('ready');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to initiate call. Please try again.');
      setCallStatus('ready');
    } finally {
      setLoading(false);
    }
  };

  // End call
  const endCall = () => {
    setIsInCall(false);
    setCallStatus('ended');
    stopCallTimer();
    setIsMuted(false);
    setIsOnHold(false);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCallStatus('ready');
      setPhoneNumber('');
      setContactName('');
      setSelectedLead(null);
      setCallDuration(0);
    }, 2000);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle hold
  const toggleHold = () => {
    setIsOnHold(!isOnHold);
  };

  // Transfer call
  const transferCall = () => {
    alert('Call transfer feature coming soon!');
  };

  // Get status color
  const getStatusColor = () => {
    switch (callStatus) {
      case 'ready': return 'text-green-600';
      case 'calling': return 'text-blue-600';
      case 'connected': return 'text-green-600';
      case 'ended': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (callStatus) {
      case 'ready': return '🟢 Ready to Call';
      case 'calling': return '🔵 Calling...';
      case 'connected': return '🟢 Connected';
      case 'ended': return '⚪ Call Ended';
      default: return '⚪ Ready';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Professional Dialer</h1>
          <p className="text-neutral-600">Make calls with AI-powered intelligence and live leads feed</p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: Dialer */}
          <div className="space-y-6">
            
            {/* Dialer Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
              
              {/* Clock Display */}
              <div className="text-center mb-6 pb-4 border-b border-blue-200">
                <div className="flex items-center justify-center gap-2 text-neutral-600 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Current Time</span>
                </div>
                <div className="text-4xl font-bold text-neutral-900 font-mono">
                  {formatTime(currentTime)}
                </div>
              </div>

              {/* Phone Number Display */}
              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600 font-medium">Phone Number</span>
                  <button
                    onClick={() => setPhoneNumber('')}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Clear phone number"
                    title="Clear phone number"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full text-2xl font-mono font-semibold text-neutral-900 bg-transparent border-none outline-none"
                />
                {contactName && (
                  <div className="mt-2 text-sm text-neutral-600">
                    📞 {contactName}
                  </div>
                )}
              </div>

              {/* Call Status & Timer */}
              <div className="bg-white rounded-xl p-4 mb-6 border-2 border-neutral-200">
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-semibold ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                  {isInCall && (
                    <div className="text-2xl font-mono font-bold text-neutral-900">
                      ⏱️ {formatDuration(callDuration)}
                    </div>
                  )}
                </div>
                {isOnHold && (
                  <div className="mt-2 text-xs text-orange-600 font-medium">
                    ⏸️ Call on hold
                  </div>
                )}
                {isMuted && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    🔇 Microphone muted
                  </div>
                )}
              </div>

              {/* Dialpad */}
              <div className="mb-6">
                <DialerKeypad 
                  onDigitPress={handleDialpadPress}
                  disabled={loading}
                />
              </div>

              {/* Call Controls */}
              {!isInCall ? (
                <button
                  onClick={initiateCall}
                  disabled={loading || !phoneNumber}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <PhoneCall className="w-6 h-6" />
                  {loading ? 'Calling...' : 'Start Call'}
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {/* Mute */}
                  <button
                    onClick={toggleMute}
                    className={`aspect-square rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 ${
                      isMuted
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-neutral-700 border-2 border-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {isMuted ? <MicOff className="w-6 h-6 mb-1" /> : <Mic className="w-6 h-6 mb-1" />}
                      <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </div>
                  </button>

                  {/* Hold */}
                  <button
                    onClick={toggleHold}
                    className={`aspect-square rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 ${
                      isOnHold
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-neutral-700 border-2 border-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      {isOnHold ? <Play className="w-6 h-6 mb-1" /> : <Pause className="w-6 h-6 mb-1" />}
                      <span className="text-xs">{isOnHold ? 'Resume' : 'Hold'}</span>
                    </div>
                  </button>

                  {/* Transfer */}
                  <button
                    onClick={transferCall}
                    className="aspect-square rounded-xl bg-white text-neutral-700 border-2 border-neutral-300 font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <PhoneForwarded className="w-6 h-6 mb-1" />
                      <span className="text-xs">Transfer</span>
                    </div>
                  </button>

                  {/* End Call */}
                  <button
                    onClick={endCall}
                    className="aspect-square rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <PhoneOff className="w-6 h-6 mb-1" />
                      <span className="text-xs">End</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Voice Settings Toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full mt-4 text-sm text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {showSettings ? 'Hide' : 'Show'} Voice Settings
              </button>

              {/* Voice Settings Panel */}
              {showSettings && (
                <div className="mt-4 bg-white rounded-xl p-4 border-2 border-neutral-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Waves className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-neutral-900">Voice Quality (Twilio)</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-neutral-700">Noise Suppression</label>
                      <button
                        onClick={() => setNoiseSuppression(!noiseSuppression)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          noiseSuppression ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-label={`Noise suppression ${noiseSuppression ? 'enabled' : 'disabled'}`}
                        title={`Toggle noise suppression`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            noiseSuppression ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm text-neutral-700">Echo Cancellation</label>
                      <button
                        onClick={() => setEchoCancellation(!echoCancellation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          echoCancellation ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-label={`Echo cancellation ${echoCancellation ? 'enabled' : 'disabled'}`}
                        title={`Toggle echo cancellation`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            echoCancellation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm text-neutral-700">AI Call Intelligence</label>
                      <button
                        onClick={() => setUseAI(!useAI)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          useAI ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-label={`AI call intelligence ${useAI ? 'enabled' : 'disabled'}`}
                        title={`Toggle AI call intelligence`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useAI ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm text-neutral-700">Record Call</label>
                      <button
                        onClick={() => setRecordCall(!recordCall)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          recordCall ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-label={`Call recording ${recordCall ? 'enabled' : 'disabled'}`}
                        title={`Toggle call recording`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            recordCall ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Leads Preview */}
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6 shadow-lg max-h-[900px]" style={{ height: 'fit-content' }}>
            <LeadsPreview 
              onSelectLead={handleLeadSelect}
              selectedLeadId={selectedLead?.id}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
