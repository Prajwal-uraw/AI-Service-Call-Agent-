'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Bot,
  User,
  Calendar,
  Clock,
  Building2,
  Mail,
  Phone,
  Target,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  ExternalLink
} from 'lucide-react';

interface MeetingDetails {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  status: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  attendee_company: string;
  host_name: string;
  host_email: string;
  ai_shadow_enabled: boolean;
  ai_shadow_mode: string;
  outcome: string;
  outcome_notes: string;
  room_url: string;
  source: string;
}

interface MeetingAnalytics {
  total_duration_seconds: number;
  ai_speaking_seconds: number;
  human_speaking_seconds: number;
  questions_asked: number;
  questions_answered: number;
  objections_handled: number;
  overall_sentiment: string;
  key_moments: Array<{ time: string; event: string; importance: string }>;
  pain_points_identified: string[];
  ai_recommendations: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function MeetingDetailPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.meetingId;
  
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [analytics, setAnalytics] = useState<MeetingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      const [meetingRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}`),
        fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}/analytics`)
      ]);

      if (meetingRes.ok) {
        setMeeting(await meetingRes.json());
      } else {
        setMeeting({
          id: meetingId,
          title: 'Product Demo - Enterprise Plan',
          description: 'Full product demonstration for enterprise features',
          scheduled_at: '2024-01-15T14:00:00Z',
          started_at: '2024-01-15T14:02:00Z',
          ended_at: '2024-01-15T14:35:00Z',
          duration_minutes: 33,
          status: 'completed',
          attendee_name: 'John Smith',
          attendee_email: 'john@acmecorp.com',
          attendee_phone: '+1 555-123-4567',
          attendee_company: 'Acme Corp',
          host_name: 'Sarah Johnson',
          host_email: 'sarah@kestrel.ai',
          ai_shadow_enabled: true,
          ai_shadow_mode: 'suggesting',
          outcome: 'follow_up',
          outcome_notes: 'Interested in enterprise plan. Needs approval from CFO. Follow up scheduled for next week.',
          room_url: 'https://kestrel.daily.co/demo-123',
          source: 'website'
        });
      }

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      } else {
        setAnalytics({
          total_duration_seconds: 1980,
          ai_speaking_seconds: 120,
          human_speaking_seconds: 1500,
          questions_asked: 12,
          questions_answered: 11,
          objections_handled: 3,
          overall_sentiment: 'positive',
          key_moments: [
            { time: '5:23', event: 'Strong interest in automation features', importance: 'high' },
            { time: '12:45', event: 'Price objection raised', importance: 'high' },
            { time: '18:30', event: 'Competitor comparison requested', importance: 'medium' },
            { time: '25:10', event: 'Asked about implementation timeline', importance: 'high' }
          ],
          pain_points_identified: [
            'Current system is too slow',
            'Manual processes taking too much time',
            'Lack of real-time analytics'
          ],
          ai_recommendations: [
            'Send ROI calculator with custom inputs',
            'Schedule follow-up with technical team',
            'Provide case study from similar industry'
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch meeting details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><AlertTriangle className="h-3 w-3 mr-1" />No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'converted':
        return <Badge className="bg-green-500">Converted</Badge>;
      case 'follow_up':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Follow Up</Badge>;
      case 'not_interested':
        return <Badge variant="secondary">Not Interested</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading meeting details...</div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-xl font-bold">Meeting not found</h2>
          <Link href="/admin/ai-demos">
            <Button className="mt-4">Back to Demos</Button>
          </Link>
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              {getStatusBadge(meeting.status)}
            </div>
            <p className="text-muted-foreground">{meeting.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {meeting.room_url && (
            <Button variant="outline" onClick={() => window.open(meeting.room_url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Recording
            </Button>
          )}
          {getOutcomeBadge(meeting.outcome)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold">{meeting.duration_minutes} min</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Questions Asked</p>
                <p className="text-xl font-bold">{analytics?.questions_asked || 0}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Objections Handled</p>
                <p className="text-xl font-bold">{analytics?.objections_handled || 0}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Sentiment</p>
                <p className="text-xl font-bold capitalize text-green-600">{analytics?.overall_sentiment || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Moments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.key_moments.map((moment, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    moment.importance === 'high' ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{moment.time}</Badge>
                        <span>{moment.event}</span>
                      </div>
                      <Badge variant={moment.importance === 'high' ? 'default' : 'secondary'}>
                        {moment.importance}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pain Points Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics?.pain_points_identified.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analytics?.ai_recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {meeting.outcome_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Outcome Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{meeting.outcome_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Attendee Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">{meeting.attendee_name}</p>
                  <p className="text-sm text-muted-foreground">{meeting.attendee_company}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{meeting.attendee_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{meeting.attendee_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{meeting.attendee_company}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled</span>
                <span>{new Date(meeting.scheduled_at).toLocaleString()}</span>
              </div>
              {meeting.started_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span>{new Date(meeting.started_at).toLocaleString()}</span>
                </div>
              )}
              {meeting.ended_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ended</span>
                  <span>{new Date(meeting.ended_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <Badge variant="outline" className="capitalize">{meeting.source}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Shadow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={meeting.ai_shadow_enabled ? 'default' : 'secondary'}>
                  {meeting.ai_shadow_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="capitalize">{meeting.ai_shadow_mode}</span>
              </div>
              {analytics && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Speaking Time</span>
                  <span>{formatDuration(analytics.ai_speaking_seconds)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Follow-up Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Next Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add to CRM
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
