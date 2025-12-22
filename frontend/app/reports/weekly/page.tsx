"use client";

import { useState, useEffect } from "react";
import { Phone, TrendingUp, Clock, AlertCircle, Download, Calendar, Users, Zap } from "lucide-react";

interface WeeklyReport {
  week_start: string;
  week_end: string;
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  dropped_calls: number;
  after_hours_calls: number;
  total_duration_seconds: number;
  avg_duration_seconds: number;
  ai_handled_calls: number;
  human_transferred_calls: number;
  ai_calls_remaining: number;
  issues: {
    ac: number;
    heating: number;
    maintenance: number;
    emergency: number;
  };
  busiest_hours: Array<{ hour: number; calls: number }>;
  avg_sentiment_score: number;
}

export default function WeeklyReportPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  useEffect(() => {
    fetchReport();
  }, [selectedWeek]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const url = selectedWeek 
        ? `http://localhost:8000/api/call-workflow/reports/weekly?week_start=${selectedWeek}`
        : "http://localhost:8000/api/call-workflow/reports/weekly";
      
      const response = await fetch(url);
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "pdf" | "csv") => {
    try {
      const url = `http://localhost:8000/api/call-workflow/reports/weekly/export?format=${format}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.download_url) {
        window.open(data.download_url, "_blank");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getAnswerRate = () => {
    if (!report) return 0;
    return ((report.answered_calls / report.total_calls) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No report data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Call Report</h1>
            <p className="text-gray-600">
              {new Date(report.week_start).toLocaleDateString()} - {new Date(report.week_end).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => exportReport("pdf")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => exportReport("csv")}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Phone className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{report.total_calls}</span>
            </div>
            <p className="text-sm text-gray-600">Total Calls</p>
            <p className="text-xs text-green-600 mt-1">+12% vs last week</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{getAnswerRate()}%</span>
            </div>
            <p className="text-sm text-gray-600">Answer Rate</p>
            <p className="text-xs text-gray-500 mt-1">{report.answered_calls} answered</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{formatDuration(report.avg_duration_seconds)}</span>
            </div>
            <p className="text-sm text-gray-600">Avg Duration</p>
            <p className="text-xs text-gray-500 mt-1">{formatDuration(report.total_duration_seconds)} total</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{report.ai_calls_remaining}</span>
            </div>
            <p className="text-sm text-gray-600">AI Calls Remaining</p>
            <p className="text-xs text-gray-500 mt-1">{report.ai_handled_calls} used this week</p>
          </div>
        </div>

        {/* Call Breakdown */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Call Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Call Status Breakdown</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Answered</span>
                  <span className="font-semibold text-green-600">{report.answered_calls}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(report.answered_calls / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Missed</span>
                  <span className="font-semibold text-orange-600">{report.missed_calls}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${(report.missed_calls / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Dropped</span>
                  <span className="font-semibold text-red-600">{report.dropped_calls}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(report.dropped_calls / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">After Hours</span>
                  <span className="font-semibold text-blue-600">{report.after_hours_calls}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(report.after_hours_calls / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Issue Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Issue Types</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">AC Issues</span>
                  <span className="font-semibold text-blue-600">{report.issues.ac}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(report.issues.ac / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Heating Issues</span>
                  <span className="font-semibold text-orange-600">{report.issues.heating}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${(report.issues.heating / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Maintenance</span>
                  <span className="font-semibold text-green-600">{report.issues.maintenance}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(report.issues.maintenance / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Emergency</span>
                  <span className="font-semibold text-red-600">{report.issues.emergency}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${(report.issues.emergency / report.total_calls) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Busiest Hours */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Busiest Hours</h2>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const hour = i + 8; // 8am to 7pm
              const hourData = report.busiest_hours.find(h => h.hour === hour);
              const calls = hourData?.calls || 0;
              const maxCalls = Math.max(...report.busiest_hours.map(h => h.calls));
              const height = (calls / maxCalls) * 100;

              return (
                <div key={hour} className="text-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <div 
                      className="w-full bg-blue-600 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${calls} calls`}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{hour}:00</p>
                  <p className="text-xs font-semibold text-gray-900">{calls}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI vs Human */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">AI vs Human Handling</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-blue-600 mb-2">{report.ai_handled_calls}</p>
              <p className="text-gray-700">AI Handled</p>
              <p className="text-sm text-gray-600 mt-1">
                {((report.ai_handled_calls / report.total_calls) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <Phone className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-orange-600 mb-2">{report.human_transferred_calls}</p>
              <p className="text-gray-700">Human Transferred</p>
              <p className="text-sm text-gray-600 mt-1">
                {((report.human_transferred_calls / report.total_calls) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
