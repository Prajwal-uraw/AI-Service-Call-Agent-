"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  RefreshCw,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SourcePerformance {
  source: string;
  total_signals: number;
  avg_score: number;
  converted_count: number;
  conversion_rate: number;
  top_tier_count: number;
}

interface ScoreCorrelation {
  score_range: string;
  count: number;
  avg_keyword_score: number;
  avg_ai_score: number;
  conversion_rate: number;
}

interface IntentAnalysis {
  intent: string;
  count: number;
  avg_score: number;
  conversion_rate: number;
  top_sentiment: string;
}

interface TrendData {
  date: string;
  total_signals: number;
  avg_score: number;
  hot_leads: number;
  converted: number;
}

interface ConversionStats {
  total_signals: number;
  converted_signals: number;
  conversion_rate: number;
  avg_score_converted: number;
  avg_score_not_converted: number;
  by_source: Record<string, any>;
}

export default function AnalyticsPage() {
  const [sourcePerformance, setSourcePerformance] = useState<SourcePerformance[]>([]);
  const [scoreCorrelation, setScoreCorrelation] = useState<ScoreCorrelation[]>([]);
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysis[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAllAnalytics();
  }, [days]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSourcePerformance(),
        fetchScoreCorrelation(),
        fetchIntentAnalysis(),
        fetchTrends(),
        fetchConversionStats()
      ]);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSourcePerformance = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/source-performance?days=${days}`
      );
      const data = await response.json();

      setSourcePerformance(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.sources)
          ? data.sources
          : []
      );
    } catch (error) {
      console.error("Failed to fetch source performance:", error);
      setSourcePerformance([]);
    }
  };

  const fetchScoreCorrelation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/analytics/score-correlation?days=${days}`);
      const data = await response.json();
      setScoreCorrelation(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.correlations)
          ? data.correlations
          : []
      );
      
    } catch (error) {
      console.error("Failed to fetch score correlation:", error);
    }
  };

  const fetchIntentAnalysis = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/analytics/intent-analysis?days=${days}`
      );

      if (!response.ok) {
        throw new Error(`Intent API failed: ${response.status}`);
      }

      const data = await response.json();

      setIntentAnalysis(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.intents)
          ? data.intents
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error("Failed to fetch intent analysis:", error);
      setIntentAnalysis([]);
    }
  };


  

  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/analytics/trends?days=${days}`);
      const data = await response.json();
      setTrends((data?.trends ?? []).slice(0, 14)); // Safely get trends array and take last 14 days
    } catch (error) {
      console.error("Failed to fetch trends:", error);
      setTrends([]); // Ensure trends is set to empty array on error
    }
  };

  const fetchConversionStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/conversion/stats?days=${days}`);
      const data = await response.json();
      setConversionStats(data);
    } catch (error) {
      console.error("Failed to fetch conversion stats:", error);
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      reddit: "bg-orange-500",
      job_board: "bg-blue-500",
      licensing: "bg-green-500",
      facebook: "bg-purple-500"
    };
    return colors[source] || "bg-gray-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Performance insights and conversion analytics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Select number of days"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={fetchAllAnalytics} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Conversion Stats Overview */}
          {conversionStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionStats?.total_signals ?? 0}</div>
                  <p className="text-xs text-gray-500">Last {days} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Converted to Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{conversionStats?.converted_signals ?? 0}</div>
                  <p className="text-xs text-gray-500">{(conversionStats?.conversion_rate || 0).toFixed(1)}% conversion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Score (Converted)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{(conversionStats?.avg_score_converted ?? 0).toFixed(1)}</div>
                  <p className="text-xs text-gray-500">Signals that converted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Score (Not Converted)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(conversionStats?.avg_score_not_converted ?? 0).toFixed(1)}</div>
                  <p className="text-xs text-gray-500">Signals not converted</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Source Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Source Performance
              </CardTitle>
              <CardDescription>Performance metrics by signal source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(sourcePerformance) && sourcePerformance.map((source) => (
                  <div key={source.source} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getSourceColor(source.source)} text-white`}>
                          {source.source}
                        </Badge>
                        <span className="font-semibold">{source.total_signals} signals</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">Avg Score: {source.avg_score}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Converted</div>
                        <div className="font-semibold">{source.converted_count} ({source.conversion_rate.toFixed(1)}%)</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Hot Leads</div>
                        <div className="font-semibold text-red-600">{source.top_tier_count}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Conversion Rate</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(source.conversion_rate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Score Correlation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Score Correlation Analysis
              </CardTitle>
              <CardDescription>Keyword vs AI scoring comparison by score ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.isArray(scoreCorrelation) && scoreCorrelation.map((range) => (
                  <div key={range.score_range} className="border rounded-lg p-4">
                    <div className="text-center mb-3">
                      <div className="text-lg font-bold">{range.score_range}</div>
                      <div className="text-sm text-gray-600">{range.count} signals</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Keyword Avg:</span>
                        <span className="font-semibold">{range.avg_keyword_score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Avg:</span>
                        <span className="font-semibold">{range.avg_ai_score.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversion:</span>
                        <span className="font-semibold text-green-600">{range.conversion_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Intent Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Intent Analysis
              </CardTitle>
              <CardDescription>Signal performance by intent type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(intentAnalysis) && intentAnalysis.map((intent) => (
                  <div key={intent.intent} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{intent.intent.replace(/_/g, " ")}</span>
                          <Badge variant="outline">{intent.count} signals</Badge>
                          <Badge variant="secondary">{intent.top_sentiment}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Avg Score: <strong>{intent.avg_score.toFixed(1)}</strong></span>
                          <span>Conversion: <strong className="text-green-600">{intent.conversion_rate.toFixed(1)}%</strong></span>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(intent.conversion_rate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Trends
              </CardTitle>
              <CardDescription>Signal volume and conversion trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trends.map((day) => (
                  <div key={day.date} className="flex items-center gap-4 border-b pb-2">
                    <div className="w-24 text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span><strong>{day.total_signals}</strong> signals</span>
                        <span>Avg: <strong>{day.avg_score.toFixed(1)}</strong></span>
                        <span className="text-red-600"><strong>{day.hot_leads}</strong> hot</span>
                        <span className="text-green-600"><strong>{day.converted}</strong> converted</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min((day.total_signals / Math.max(...trends.map(t => t.total_signals))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
