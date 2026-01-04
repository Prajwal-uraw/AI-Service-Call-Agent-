'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
  User,
  ArrowRight,
  RefreshCw,
  Plus,
  BarChart3,
  Settings
} from 'lucide-react';

const toast = {
  success: (msg: string) => console.log(msg),
  error: (msg: string) => console.error(msg),
};

interface AIDemoMeeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  attendee_name: string;
  attendee_email: string;
  attendee_company: string;
  ai_shadow_enabled: boolean;
  ai_shadow_mode: string;
  outcome: string;
  room_url: string;
  created_at: string;
}

interface DemoStats {
  total_demos: number;
  upcoming_demos: number;
  completed_demos: number;
  conversion_rate: number;
  avg_duration_minutes: number;
  ai_shadow_usage: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AIDemosPage() {
  const [meetings, setMeetings] = useState<AIDemoMeeting[]>([]);
  const [stats, setStats] = useState<DemoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchMeetings();
    fetchStats();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-demo-meetings`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      toast.error('Failed to load AI demo meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-demo-meetings/analytics`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-green-500"><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><AlertCircle className="h-3 w-3 mr-1" />No Show</Badge>;
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
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return outcome ? <Badge variant="outline">{outcome}</Badge> : null;
    }
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled' && new Date(m.scheduled_at) > new Date());
  const pastMeetings = meetings.filter(m => m.status === 'completed' || new Date(m.scheduled_at) <= new Date());
  const inProgressMeetings = meetings.filter(m => m.status === 'in_progress');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Demo Meetings</h1>
          <p className="text-muted-foreground">Manage AI-powered sales demos and shadow sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchMeetings(); fetchStats(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/ai-demos/analytics">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/book-demo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Demo
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Demos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_demos || meetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inProgressMeetings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.conversion_rate ? `${(stats.conversion_rate * 100).toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Shadow Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.ai_shadow_usage ? `${(stats.ai_shadow_usage * 100).toFixed(0)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {inProgressMeetings.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Play className="h-5 w-5" />
              Live Demos ({inProgressMeetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">{meeting.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.attendee_name} - {meeting.attendee_company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.ai_shadow_enabled && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Shadow Active
                      </Badge>
                    )}
                    <Link href={`/admin/ai-demos/${meeting.id}/control`}>
                      <Button size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Control Panel
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            <CheckCircle className="h-4 w-4 mr-2" />
            Past ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No upcoming demos scheduled.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Demo</TableHead>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>AI Shadow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className="text-sm text-muted-foreground">{meeting.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{meeting.attendee_name}</p>
                            <p className="text-sm text-muted-foreground">{meeting.attendee_company}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(meeting.scheduled_at)}</TableCell>
                        <TableCell>{meeting.duration_minutes} min</TableCell>
                        <TableCell>
                          {meeting.ai_shadow_enabled ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              <Bot className="h-3 w-3 mr-1" />
                              {meeting.ai_shadow_mode}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <User className="h-3 w-3 mr-1" />
                              Manual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(meeting.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/ai-demos/${meeting.id}/ai-shadow`}>
                              <Button variant="outline" size="sm">
                                <Bot className="h-4 w-4 mr-1" />
                                Configure
                              </Button>
                            </Link>
                            {meeting.room_url && (
                              <Button 
                                size="sm"
                                onClick={() => window.open(meeting.room_url, '_blank')}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardContent className="p-0">
              {pastMeetings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No past demos found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Demo</TableHead>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>AI Shadow</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{meeting.title}</p>
                            <p className="text-sm text-muted-foreground">{meeting.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{meeting.attendee_name}</p>
                            <p className="text-sm text-muted-foreground">{meeting.attendee_company}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(meeting.scheduled_at)}</TableCell>
                        <TableCell>{meeting.duration_minutes} min</TableCell>
                        <TableCell>
                          {meeting.ai_shadow_enabled ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              <Bot className="h-3 w-3 mr-1" />
                              Used
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getOutcomeBadge(meeting.outcome)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/ai-demos/${meeting.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
