'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { parseError, logError } from '@/lib/errors';
import { 
  Brain, TrendingUp, MessageSquare, Award, Target, AlertCircle, 
  ThumbsUp, ThumbsDown, Minus, Clock, Users, BarChart3, 
  Zap, CheckCircle, XCircle, Activity, Lightbulb
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function CallIntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [sentimentTrends, setSentimentTrends] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [liveCalls, setLiveCalls] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch summary
      const summaryRes = await fetch('/api/call-intelligence/summary');
      if (!summaryRes.ok) throw new Error('Failed to fetch summary');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // Fetch sentiment trends
      const trendsRes = await fetch('/api/call-intelligence/sentiment-trends?days=30');
      if (!trendsRes.ok) throw new Error('Failed to fetch sentiment trends');
      const trendsData = await trendsRes.json();
      setSentimentTrends(trendsData.trends || []);

      // Fetch quality metrics
      const qualityRes = await fetch('/api/call-intelligence/quality-metrics');
      if (!qualityRes.ok) throw new Error('Failed to fetch quality metrics');
      const qualityData = await qualityRes.json();
      setQualityMetrics(qualityData);

      // Fetch live calls
      const liveRes = await fetch('/api/call-intelligence/live-calls');
      if (!liveRes.ok) throw new Error('Failed to fetch live calls');
      const liveData = await liveRes.json();
      setLiveCalls(liveData.active_calls || []);

    } catch (err) {
      const appError = parseError(err);
      logError(appError, 'CallIntelligencePage.fetchData');
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading call intelligence..." fullScreen />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <ErrorMessage 
            message={error} 
            type="error"
            dismissible
            onRetry={fetchData}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-neutral-900">Call Intelligence</h1>
          </div>
          <p className="text-neutral-600">AI-powered insights from your customer conversations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-neutral-700">Quality Score</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{summary?.avg_quality_score?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-neutral-600 mt-1">out of 10</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-neutral-700">Sentiment</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">
              {summary?.avg_sentiment_score ? (summary.avg_sentiment_score * 100).toFixed(0) : '0'}%
            </p>
            <p className="text-sm text-neutral-600 mt-1">positive sentiment</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-neutral-700">Avg Duration</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">
              {Math.floor((summary?.avg_duration || 0) / 60)}:{String((summary?.avg_duration || 0) % 60).padStart(2, '0')}
            </p>
            <p className="text-sm text-neutral-600 mt-1">minutes</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-neutral-700">Total Calls</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-neutral-900">{summary?.total_calls || 0}</p>
            <p className="text-sm text-neutral-600 mt-1">last 7 days</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-200">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'live', label: 'Live Calls', icon: Activity },
              { id: 'sentiment', label: 'Sentiment Analysis', icon: TrendingUp },
              { id: 'quality', label: 'Quality Metrics', icon: Award },
              { id: 'coaching', label: 'Coaching Insights', icon: Lightbulb }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Sentiment Distribution */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Sentiment Distribution</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Positive', value: summary?.sentiment_distribution?.positive || 0 },
                          { name: 'Neutral', value: summary?.sentiment_distribution?.neutral || 0 },
                          { name: 'Negative', value: summary?.sentiment_distribution?.negative || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-neutral-900">Positive</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {summary?.sentiment_distribution?.positive || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Minus className="w-6 h-6 text-gray-600" />
                      <span className="font-semibold text-neutral-900">Neutral</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-600">
                      {summary?.sentiment_distribution?.neutral || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ThumbsDown className="w-6 h-6 text-red-600" />
                      <span className="font-semibold text-neutral-900">Negative</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {summary?.sentiment_distribution?.negative || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Topics */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Top Conversation Topics</h3>
              <div className="space-y-3">
                {summary?.top_topics?.map((topic: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-900">{topic.topic}</span>
                        <span className="text-sm text-neutral-600">{topic.count} calls</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(topic.count / summary.total_calls) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900">Active Calls</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-neutral-600">{liveCalls.length} active</span>
                </div>
              </div>

              {liveCalls.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active calls at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveCalls.map((call) => (
                    <div key={call.call_sid} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-neutral-900">{call.customer_name}</h4>
                          <p className="text-sm text-neutral-600">{call.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(call.current_sentiment)}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSentimentColor(call.current_sentiment)}`}>
                            {call.current_sentiment}
                          </span>
                        </div>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-3 mb-2">
                        <p className="text-sm text-neutral-700 italic">"{call.last_transcript}"</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Duration: {Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, '0')}</span>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          View Full Transcript →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Sentiment Trends (30 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" />
                    <Area type="monotone" dataKey="neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                    <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quality' && qualityMetrics && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Quality Metrics Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(qualityMetrics.metrics).map(([key, metric]: [string, any]) => (
                  <div key={key} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-neutral-900 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <span className={`text-2xl font-bold ${
                        metric.score >= 9 ? 'text-green-600' :
                        metric.score >= 7 ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {metric.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${
                          metric.score >= 9 ? 'bg-green-600' :
                          metric.score >= 7 ? 'bg-blue-600' :
                          'bg-orange-600'
                        }`}
                        style={{ width: `${metric.score * 10}%` }}
                      />
                    </div>
                    <div className="text-xs text-neutral-600 space-y-1">
                      {Object.entries(metric).filter(([k]) => k !== 'score').map(([k, v]: [string, any]) => (
                        <div key={k} className="flex justify-between">
                          <span>{k.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Improvement Opportunities</h3>
              <div className="space-y-4">
                {qualityMetrics.improvement_areas?.map((area: any, index: number) => (
                  <div key={index} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">{area.area}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">Current: {area.current_score}</span>
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Target: {area.target_score}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{area.recommendation}</p>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(area.current_score / area.target_score) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coaching' && (
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">AI-Powered Coaching Insights</h3>
              <p className="text-neutral-600 mb-6">
                Based on analysis of recent calls, here are personalized coaching recommendations
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths to Maintain
                  </h4>
                  <div className="space-y-3">
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">Empathy & Active Listening</span>
                        <span className="text-green-600 font-bold">9.2</span>
                      </div>
                      <p className="text-sm text-neutral-600">Consistently acknowledges customer concerns and uses reflective statements</p>
                    </div>
                    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">Problem Resolution</span>
                        <span className="text-green-600 font-bold">8.8</span>
                      </div>
                      <p className="text-sm text-neutral-600">Provides clear solutions quickly and follows up on action items</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-600 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Growth Opportunities
                  </h4>
                  <div className="space-y-3">
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">Upselling & Cross-selling</span>
                        <span className="text-orange-600 font-bold">6.5</span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">Identify maintenance plan opportunities in repair calls</p>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View Training Resources →
                      </button>
                    </div>
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-900">Handling Objections</span>
                        <span className="text-orange-600 font-bold">7.2</span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">Use the 'Feel, Felt, Found' technique more consistently</p>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View Training Resources →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
