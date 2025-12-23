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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface SourcePerformance {
  source: string;
  total_signals: number;
  avg_score: number;
  converted_count: number;
  conversion_rate: number;
  top_tier_count: number;
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
}

export default function AnalyticsEnhancedPage() {
  const [sourcePerformance, setSourcePerformance] = useState<SourcePerformance[]>([]);
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
      const response = await fetch(`${API_URL}/api/admin/analytics/source-performance?days=${days}`);
      const data = await response.json();
      setSourcePerformance(data);
    } catch (error) {
      console.error("Failed to fetch source performance:", error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/analytics/trends?days=${days}`);
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    }
  };

  const fetchConversionStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/analytics/conversion-stats?days=${days}`);
      const data = await response.json();
      setConversionStats(data);
    } catch (error) {
      console.error("Failed to fetch conversion stats:", error);
    }
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Signals', conversionStats?.total_signals || 0],
      ['Converted Signals', conversionStats?.converted_signals || 0],
      ['Conversion Rate', `${conversionStats?.conversion_rate.toFixed(2)}%` || '0%'],
      ['', ''],
      ['Source', 'Total Signals', 'Avg Score', 'Converted', 'Conversion Rate'],
      ...sourcePerformance.map(s => [
        s.source,
        s.total_signals,
        s.avg_score.toFixed(1),
        s.converted_count,
        `${s.conversion_rate.toFixed(1)}%`
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Visual insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Select number of days"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={fetchAllAnalytics} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {conversionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionStats.total_signals}</div>
              <p className="text-xs text-gray-500">Last {days} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Converted to Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{conversionStats.converted_signals}</div>
              <p className="text-xs text-gray-500">{conversionStats.conversion_rate.toFixed(1)}% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Score (Converted)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{conversionStats.avg_score_converted.toFixed(1)}</div>
              <p className="text-xs text-gray-500">Signals that converted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Score (Not Converted)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionStats.avg_score_not_converted.toFixed(1)}</div>
              <p className="text-xs text-gray-500">Signals not converted</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Signal Trends Over Time
          </CardTitle>
          <CardDescription>Daily signal volume and conversion metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_signals" stroke="#3b82f6" name="Total Signals" strokeWidth={2} />
              <Line type="monotone" dataKey="hot_leads" stroke="#ef4444" name="Hot Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="converted" stroke="#10b981" name="Converted" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Source Performance Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Source Performance Comparison
          </CardTitle>
          <CardDescription>Signal volume and conversion by source</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourcePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_signals" fill="#3b82f6" name="Total Signals" />
              <Bar dataKey="converted_count" fill="#10b981" name="Converted" />
              <Bar dataKey="top_tier_count" fill="#ef4444" name="Hot Leads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Rate Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Conversion Breakdown
            </CardTitle>
            <CardDescription>Converted vs Not Converted</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={[
                    { name: 'Converted', value: conversionStats?.converted_signals || 0 },
                    { name: 'Not Converted', value: (conversionStats?.total_signals || 0) - (conversionStats?.converted_signals || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#94a3b8" />
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Source Distribution
            </CardTitle>
            <CardDescription>Signal volume by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={sourcePerformance.map(s => ({ name: s.source, value: s.total_signals }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(((percent ?? 0) as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourcePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Source Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Source Metrics</CardTitle>
          <CardDescription>Complete performance breakdown by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Source</th>
                  <th className="text-right p-3">Total Signals</th>
                  <th className="text-right p-3">Avg Score</th>
                  <th className="text-right p-3">Converted</th>
                  <th className="text-right p-3">Conversion Rate</th>
                  <th className="text-right p-3">Hot Leads</th>
                </tr>
              </thead>
              <tbody>
                {sourcePerformance.map((source) => (
                  <tr key={source.source} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <Badge className="bg-blue-600 text-white">{source.source}</Badge>
                    </td>
                    <td className="text-right p-3 font-semibold">{source.total_signals}</td>
                    <td className="text-right p-3">{source.avg_score.toFixed(1)}</td>
                    <td className="text-right p-3 text-green-600 font-semibold">{source.converted_count}</td>
                    <td className="text-right p-3">
                      <div className="flex items-center justify-end gap-2">
                        <span>{source.conversion_rate.toFixed(1)}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(source.conversion_rate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right p-3 text-red-600 font-semibold">{source.top_tier_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
