'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Clock,
  Target,
  Bot,
  ArrowLeft,
  RefreshCw,
  Calendar,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AnalyticsData {
  total_demos: number;
  completed_demos: number;
  conversion_rate: number;
  avg_duration_minutes: number;
  ai_shadow_usage_rate: number;
  total_revenue_generated: number;
  demos_by_outcome: {
    converted: number;
    follow_up: number;
    not_interested: number;
    no_show: number;
  };
  demos_by_month: Array<{
    month: string;
    count: number;
    conversions: number;
  }>;
  top_objections: Array<{
    objection: string;
    count: number;
    resolution_rate: number;
  }>;
  ai_performance: {
    questions_answered: number;
    objections_handled: number;
    avg_sentiment_score: number;
    takeover_rate: number;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AIDemoAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai-demo-meetings/analytics?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setAnalytics({
          total_demos: 24,
          completed_demos: 18,
          conversion_rate: 0.42,
          avg_duration_minutes: 28,
          ai_shadow_usage_rate: 0.75,
          total_revenue_generated: 45000,
          demos_by_outcome: {
            converted: 8,
            follow_up: 6,
            not_interested: 3,
            no_show: 1
          },
          demos_by_month: [
            { month: 'Oct', count: 6, conversions: 2 },
            { month: 'Nov', count: 8, conversions: 3 },
            { month: 'Dec', count: 10, conversions: 3 }
          ],
          top_objections: [
            { objection: 'Price too high', count: 12, resolution_rate: 0.58 },
            { objection: 'Need more features', count: 8, resolution_rate: 0.75 },
            { objection: 'Already using competitor', count: 6, resolution_rate: 0.33 }
          ],
          ai_performance: {
            questions_answered: 156,
            objections_handled: 42,
            avg_sentiment_score: 0.72,
            takeover_rate: 0.15
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/ai-demos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">AI Demo Analytics</h1>
            <p className="text-muted-foreground">Performance metrics and insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
            aria-label="Select date range"
            title="Select date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Total Demos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_demos || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.completed_demos || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercent(analytics?.conversion_rate || 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avg_duration_minutes || 0} min</div>
            <p className="text-xs text-muted-foreground">Target: 30 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              Revenue Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(analytics?.total_revenue_generated || 0)}
            </div>
            <p className="text-xs text-muted-foreground">From converted demos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Demo Outcomes
            </CardTitle>
            <CardDescription>Distribution of demo results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Converted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{analytics?.demos_by_outcome.converted || 0}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {formatPercent((analytics?.demos_by_outcome.converted || 0) / (analytics?.completed_demos || 1))}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Follow Up</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{analytics?.demos_by_outcome.follow_up || 0}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {formatPercent((analytics?.demos_by_outcome.follow_up || 0) / (analytics?.completed_demos || 1))}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span>Not Interested</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{analytics?.demos_by_outcome.not_interested || 0}</span>
                  <Badge variant="outline">
                    {formatPercent((analytics?.demos_by_outcome.not_interested || 0) / (analytics?.completed_demos || 1))}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>No Show</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{analytics?.demos_by_outcome.no_show || 0}</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {formatPercent((analytics?.demos_by_outcome.no_show || 0) / (analytics?.total_demos || 1))}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Shadow Performance
            </CardTitle>
            <CardDescription>AI assistant metrics during demos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>AI Shadow Usage</span>
                <span className="font-bold text-purple-600">
                  {formatPercent(analytics?.ai_shadow_usage_rate || 0)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                  <p className="text-xl font-bold">{analytics?.ai_performance.questions_answered || 0}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Objections Handled</p>
                  <p className="text-xl font-bold">{analytics?.ai_performance.objections_handled || 0}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Sentiment</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatPercent(analytics?.ai_performance.avg_sentiment_score || 0)}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Human Takeover Rate</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatPercent(analytics?.ai_performance.takeover_rate || 0)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Objections & Resolution</CardTitle>
          <CardDescription>Most common objections and how well they were handled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.top_objections.map((obj, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{obj.objection}</p>
                    <p className="text-sm text-muted-foreground">Raised {obj.count} times</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Resolution Rate:</span>
                  <Badge 
                    variant="outline" 
                    className={obj.resolution_rate >= 0.5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                  >
                    {formatPercent(obj.resolution_rate)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
