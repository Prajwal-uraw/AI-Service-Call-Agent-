'use client';

import { useState, useEffect } from 'react';
import { Phone, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface CallInsight {
  call_sid: string;
  from_number: string;
  to_number: string;
  status: string;
  duration: number;
  start_time: string;
  price: string | null;
  direction: string;
  recording_url: string | null;
}

interface NumberStatus {
  phone_number: string;
  friendly_name: string;
  status: string;
  is_active: boolean;
  last_call: string | null;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

interface CostSummary {
  total_calls: number;
  total_duration_minutes: number;
  total_cost: number;
  average_cost_per_call: number;
  currency: string;
}

interface UptimeMetrics {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  uptime_percentage: number;
}

export default function TwilioInsightsPage() {
  const [callHistory, setCallHistory] = useState<CallInsight[]>([]);
  const [numberStatus, setNumberStatus] = useState<NumberStatus | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [uptimeMetrics, setUptimeMetrics] = useState<UptimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Try to get phone number from environment or prompt user
    const defaultNumber = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER;
    if (defaultNumber) {
      setPhoneNumber(defaultNumber);
      fetchAllData(defaultNumber);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAllData = async (number: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel using local API routes
      const [historyRes, statusRes, costRes, uptimeRes] = await Promise.all([
        fetch(`/api/twilio/insights/call-history?phone_number=${encodeURIComponent(number)}&days=7`),
        fetch(`/api/twilio/insights/number-status/${encodeURIComponent(number)}`),
        fetch(`/api/twilio/insights/cost-summary?phone_number=${encodeURIComponent(number)}&days=30`),
        fetch(`/api/twilio/insights/uptime-metrics?phone_number=${encodeURIComponent(number)}&days=7`)
      ]);

      if (historyRes.ok) {
        const data = await historyRes.json();
        setCallHistory(data);
      }

      if (statusRes.ok) {
        const data = await statusRes.json();
        setNumberStatus(data);
      }

      if (costRes.ok) {
        const data = await costRes.json();
        setCostSummary(data);
      }

      if (uptimeRes.ok) {
        const data = await uptimeRes.json();
        setUptimeMetrics(data);
      }

    } catch (err) {
      setError('Failed to fetch Twilio insights. Make sure Twilio credentials are configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber) {
      fetchAllData(phoneNumber);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(Math.abs(amount));
  };

  if (loading && !phoneNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Enter Twilio Phone Number</h2>
          <form onSubmit={handlePhoneNumberSubmit}>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Load Insights
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Twilio Call Insights</h1>
          <p className="text-sm text-gray-600">Real-time analytics from Twilio</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Number Status Card */}
        {numberStatus && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Phone Number Status</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                numberStatus.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {numberStatus.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-lg font-semibold">{numberStatus.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Friendly Name</p>
                <p className="text-lg font-semibold">{numberStatus.friendly_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Call</p>
                <p className="text-lg font-semibold">
                  {numberStatus.last_call 
                    ? new Date(numberStatus.last_call).toLocaleString()
                    : 'No calls yet'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {numberStatus.capabilities.voice && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Voice</span>
              )}
              {numberStatus.capabilities.sms && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">SMS</span>
              )}
              {numberStatus.capabilities.mms && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">MMS</span>
              )}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Calls */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {uptimeMetrics?.total_calls || 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Calls (7 days)</p>
          </div>

          {/* Total Cost */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {costSummary ? formatCurrency(costSummary.total_cost, costSummary.currency) : '$0.00'}
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Cost (30 days)</p>
          </div>

          {/* Average Duration */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {costSummary ? Math.round(costSummary.total_duration_minutes) : 0}m
            </div>
            <p className="text-sm text-gray-600 mt-1">Total Duration</p>
          </div>

          {/* Uptime */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {uptimeMetrics ? uptimeMetrics.uptime_percentage.toFixed(1) : 100}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Uptime</p>
          </div>

        </div>

        {/* Call Status Breakdown */}
        {uptimeMetrics && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Call Status Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {uptimeMetrics.successful_calls}
                </div>
                <div className="text-sm font-medium text-gray-700">Successful</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="mx-auto mb-2 text-red-600" size={32} />
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {uptimeMetrics.failed_calls}
                </div>
                <div className="text-sm font-medium text-gray-700">Failed</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Phone className="mx-auto mb-2 text-blue-600" size={32} />
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {costSummary ? formatCurrency(costSummary.average_cost_per_call, costSummary.currency) : '$0.00'}
                </div>
                <div className="text-sm font-medium text-gray-700">Avg Cost/Call</div>
              </div>

            </div>
          </div>
        )}

        {/* Recent Call History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Call History</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recording</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No calls found
                    </td>
                  </tr>
                ) : (
                  callHistory.map((call) => (
                    <tr key={call.call_sid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {call.from_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          call.status === 'completed' ? 'bg-green-100 text-green-700' :
                          call.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {call.price ? formatCurrency(parseFloat(call.price), 'USD') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(call.start_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {call.recording_url ? (
                          <a 
                            href={call.recording_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Listen
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
