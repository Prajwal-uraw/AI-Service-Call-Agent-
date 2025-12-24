'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Database, RefreshCw, Trash2, Phone, Video, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Force dynamic rendering to avoid build-time Supabase client creation
export const dynamic = 'force-dynamic';

interface Signal {
  id: number;
  title: string;
  source: string;
  url: string;
  pain_score: number;
  urgency_score: number;
  created_at: string;
  content: string;
  business_name: string;
  contact_phone: string;
  contact_email: string;
  location: string;
}

interface Analytics {
  total_signals: number;
  average_pain_score: number;
  high_value_count: number;
  medium_value_count: number;
  low_value_count: number;
  by_source: Record<string, number>;
}

export default function ScrapingDashboardSupabase() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      // Fetch signals from Supabase
      const { data: signalsData, error: signalsError } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (signalsError) {
        console.error('Error fetching signals:', signalsError);
      } else if (signalsData) {
        setSignals(signalsData);
        
        // Calculate analytics
        const total = signalsData.length;
        const avgPain = signalsData.reduce((sum, s) => sum + (s.pain_score || 0), 0) / total || 0;
        const highValue = signalsData.filter(s => s.pain_score >= 70).length;
        const mediumValue = signalsData.filter(s => s.pain_score >= 40 && s.pain_score < 70).length;
        const lowValue = signalsData.filter(s => s.pain_score < 40).length;
        
        // Count by source
        const bySource: Record<string, number> = {};
        signalsData.forEach(s => {
          bySource[s.source] = (bySource[s.source] || 0) + 1;
        });

        setAnalytics({
          total_signals: total,
          average_pain_score: avgPain,
          high_value_count: highValue,
          medium_value_count: mediumValue,
          low_value_count: lowValue,
          by_source: bySource
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSignal = async (id: number) => {
    if (!confirm('Delete this signal?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('signals')
        .delete()
        .eq('id', id);

      if (!error) {
        setSignals(signals.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
  };

  const makeCall = (phone: string) => {
    if (!phone) {
      alert('No phone number available');
      return;
    }
    // Integrate with Twilio click-to-call
    window.open(`tel:${phone}`, '_self');
  };

  const startVideoCall = async (signalId: number) => {
    // Integrate with Daily.co
    try {
      const response = await fetch('/api/create-video-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId })
      });
      
      if (response.ok) {
        const { roomUrl } = await response.json();
        window.open(roomUrl, '_blank');
      }
    } catch (error) {
      console.error('Error creating video room:', error);
      alert('Video call feature coming soon!');
    }
  };

  const sendEmail = (email: string, businessName: string) => {
    if (!email) {
      alert('No email available');
      return;
    }
    const subject = encodeURIComponent(`Follow-up from Kestrel - ${businessName}`);
    const body = encodeURIComponent(`Hi,\n\nI noticed you might need help with your HVAC services.\n\nBest regards,\nKestrel Team`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading signals from Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lead Signals Dashboard</h1>
              <p className="text-sm text-gray-600">AI-scored business opportunities from scraping pipeline</p>
            </div>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{analytics?.total_signals || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Total Signals</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="text-red-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600">{analytics?.high_value_count || 0}</div>
            <p className="text-sm text-gray-600 mt-1">High Value (≥70)</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600">{analytics?.medium_value_count || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Medium Value (40-69)</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {analytics ? analytics.average_pain_score.toFixed(1) : 0}
            </div>
            <p className="text-sm text-gray-600 mt-1">Avg Pain Score</p>
          </div>

        </div>

        {/* Analytics */}
        {analytics && analytics.by_source && Object.keys(analytics.by_source).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Signal Distribution</h2>
            
            {/* By Source */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">By Source</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.by_source).map(([source, count]) => (
                  <div key={source} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Signals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Signals</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pain Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {signals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Database size={48} className="text-gray-300" />
                        <div>
                          <p className="font-medium">No signals yet</p>
                          <p className="text-sm">Run the scraper to collect business signals</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  signals.map((signal) => (
                    <tr key={signal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <div className="text-sm font-medium text-gray-900">
                            {signal.business_name || signal.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{signal.location}</div>
                          <p className="text-xs text-gray-400 mt-1 truncate">{signal.content?.substring(0, 100)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                          {signal.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full ${
                            signal.pain_score >= 70 ? 'bg-red-500' :
                            signal.pain_score >= 40 ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="text-sm font-medium">{signal.pain_score?.toFixed(0) || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          {signal.contact_phone && <div>📞 {signal.contact_phone}</div>}
                          {signal.contact_email && <div>✉️ {signal.contact_email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {signal.contact_phone && (
                            <button
                              onClick={() => makeCall(signal.contact_phone)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => startVideoCall(signal.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Video Call"
                          >
                            <Video size={16} />
                          </button>
                          {signal.contact_email && (
                            <button
                              onClick={() => sendEmail(signal.contact_email, signal.business_name || signal.title)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Email"
                            >
                              <Mail size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteSignal(signal.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
