"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  TrendingUp, 
  MessageSquare, 
  ExternalLink,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Signal {
  id: string;
  source: string;
  signal_id: string;
  title: string | null;
  content_preview: string;
  keyword_score: number;
  ai_score: number | null;
  combined_score: number | null;
  tier: string | null;
  sentiment: string | null;
  intent: string | null;
  recommended_action: string | null;
  location: string | null;
  created_at: string;
  alerted: boolean;
  url: string | null;
}

interface Stats {
  total_signals: number;
  by_source: Record<string, number>;
  by_tier: Record<string, number>;
  by_intent: Record<string, number>;
  by_sentiment: Record<string, number>;
  avg_keyword_score: number;
  avg_ai_score: number;
  high_value_count: number;
  alerted_count: number;
  pending_count: number;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  
  // Filters
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [alertedFilter, setAlertedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minScore, setMinScore] = useState<number>(0);

  useEffect(() => {
    fetchStats();
    fetchSignals();
  }, [tierFilter, intentFilter, alertedFilter, minScore]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/signals/stats?days=7`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tierFilter !== "all") params.append("tier", tierFilter);
      if (intentFilter !== "all") params.append("intent", intentFilter);
      if (alertedFilter !== "all") params.append("alerted", alertedFilter);
      if (minScore > 0) params.append("min_score", minScore.toString());
      params.append("limit", "50");

      const response = await fetch(`${API_URL}/api/admin/signals/list?${params}`);
      const data = await response.json();
      setSignals(data);
    } catch (error) {
      console.error("Failed to fetch signals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case "hot": return "bg-red-500";
      case "warm": return "bg-orange-500";
      case "qualified": return "bg-yellow-500";
      case "cold": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "desperate": return "text-red-600";
      case "frustrated": return "text-orange-600";
      case "negative": return "text-yellow-600";
      case "neutral": return "text-gray-600";
      case "positive": return "text-green-600";
      default: return "text-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-red-600 font-bold";
    if (score >= 70) return "text-orange-600 font-semibold";
    if (score >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pain Signals</h1>
          <p className="text-gray-600">Monitor and manage HVAC business pain signals</p>
        </div>
        <Button onClick={fetchSignals} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_signals}</div>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">High Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.high_value_count}</div>
              <p className="text-xs text-gray-500">Score ≥ 70</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pending_count}</div>
              <p className="text-xs text-gray-500">Not yet alerted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg AI Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_ai_score.toFixed(1)}</div>
              <p className="text-xs text-gray-500">GPT-4o-mini analysis</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tier</label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Intent</label>
              <Select value={intentFilter} onValueChange={setIntentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intents</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="seeking_help">Seeking Help</SelectItem>
                  <SelectItem value="comparing_options">Comparing Options</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="complaining">Complaining</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={alertedFilter} onValueChange={setAlertedFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                  <SelectItem value="true">Alerted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min Score</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search signals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <Card>
        <CardHeader>
          <CardTitle>Signals ({signals.length})</CardTitle>
          <CardDescription>
            Click on a signal to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading signals...</p>
            </div>
          ) : signals.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No signals found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {signals
                .filter(signal => 
                  searchQuery === "" || 
                  signal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  signal.content_preview.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((signal) => (
                  <div
                    key={signal.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedSignal(signal.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {signal.source}
                          </Badge>
                          {signal.tier && (
                            <Badge className={`${getTierColor(signal.tier)} text-white text-xs`}>
                              {signal.tier}
                            </Badge>
                          )}
                          {signal.alerted && (
                            <Badge variant="secondary" className="text-xs">
                              Alerted
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">
                          {signal.title || "Untitled Signal"}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {signal.content_preview}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {signal.location && (
                            <span>📍 {signal.location}</span>
                          )}
                          {signal.sentiment && (
                            <span className={getSentimentColor(signal.sentiment)}>
                              😊 {signal.sentiment}
                            </span>
                          )}
                          {signal.intent && (
                            <span>🎯 {signal.intent.replace(/_/g, " ")}</span>
                          )}
                          {signal.recommended_action && (
                            <span>💡 {signal.recommended_action.replace(/_/g, " ")}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className={`text-2xl font-bold ${getScoreColor(signal.combined_score || signal.keyword_score)}`}>
                          {Math.round(signal.combined_score || signal.keyword_score)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {signal.ai_score ? (
                            <>
                              <div>Keyword: {signal.keyword_score}</div>
                              <div>AI: {Math.round(signal.ai_score)}</div>
                            </>
                          ) : (
                            <div>Keyword only</div>
                          )}
                        </div>
                        {signal.url && (
                          <a
                            href={signal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SignalDetailModal
        signalId={selectedSignal}
        isOpen={selectedSignal !== null}
        onClose={() => setSelectedSignal(null)}
      />
    </div>
  );
}
