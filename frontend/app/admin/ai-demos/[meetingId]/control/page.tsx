'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Bot,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX,
  Hand,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';

interface MeetingDetails {
  id: string;
  title: string;
  attendee_name: string;
  attendee_company: string;
  status: string;
  ai_shadow_enabled: boolean;
  ai_shadow_mode: string;
  started_at: string;
  duration_minutes: number;
}

interface LiveInsight {
  type: 'suggestion' | 'objection' | 'buying_signal' | 'competitor';
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AIControlPanelPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.meetingId;
  
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiMode, setAiMode] = useState<'listening' | 'suggesting' | 'active'>('suggesting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [insights, setInsights] = useState<LiveInsight[]>([]);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; time: string }>>([]);

  useEffect(() => {
    fetchMeetingDetails();
    const interval = setInterval(fetchLiveInsights, 5000);
    return () => clearInterval(interval);
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}`);
      if (response.ok) {
        const data = await response.json();
        setMeeting(data);
        setAiEnabled(data.ai_shadow_enabled);
        setAiMode(data.ai_shadow_mode || 'suggesting');
      } else {
        setMeeting({
          id: meetingId,
          title: 'Product Demo - Enterprise Plan',
          attendee_name: 'John Smith',
          attendee_company: 'Acme Corp',
          status: 'in_progress',
          ai_shadow_enabled: true,
          ai_shadow_mode: 'suggesting',
          started_at: new Date().toISOString(),
          duration_minutes: 15
        });
      }
    } catch (error) {
      console.error('Failed to fetch meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveInsights = async () => {
    setInsights([
      {
        type: 'buying_signal',
        message: 'Attendee asked about pricing tiers - strong buying signal',
        timestamp: new Date().toISOString(),
        priority: 'high'
      },
      {
        type: 'suggestion',
        message: 'Mention the 30-day free trial to address hesitation',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        priority: 'medium'
      },
      {
        type: 'objection',
        message: 'Price concern detected - consider offering annual discount',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        priority: 'high'
      }
    ]);

    setTranscript([
      { speaker: 'You', text: 'Let me show you our enterprise features...', time: '2 min ago' },
      { speaker: 'John', text: 'That looks great. What about pricing?', time: '1 min ago' },
      { speaker: 'You', text: 'We have flexible pricing tiers...', time: '30 sec ago' }
    ]);
  };

  const handleTakeover = async () => {
    try {
      await fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual takeover requested' })
      });
      setAiEnabled(false);
      setAiMode('listening');
    } catch (error) {
      console.error('Failed to takeover:', error);
    }
  };

  const handleModeChange = async (mode: 'listening' | 'suggesting' | 'active') => {
    setAiMode(mode);
    try {
      await fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}/ai-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
    } catch (error) {
      console.error('Failed to change mode:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'buying_signal': return <Target className="h-4 w-4 text-green-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'objection': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'competitor': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading control panel...</div>
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
              <h1 className="text-2xl font-bold">{meeting?.title}</h1>
              <Badge variant="default" className="bg-green-500 animate-pulse">
                LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {meeting?.attendee_name} - {meeting?.attendee_company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {meeting?.duration_minutes || 0} min
          </Badge>
          <Button variant="destructive" onClick={handleTakeover}>
            <Hand className="h-4 w-4 mr-2" />
            Take Over
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Shadow Controls
                </span>
                <Switch
                  checked={aiEnabled}
                  onCheckedChange={setAiEnabled}
                />
              </CardTitle>
              <CardDescription>Configure AI assistant behavior during the demo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={aiMode === 'listening' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('listening')}
                  className="flex-1"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listening Only
                </Button>
                <Button
                  variant={aiMode === 'suggesting' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('suggesting')}
                  className="flex-1"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Suggestions
                </Button>
                <Button
                  variant={aiMode === 'active' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('active')}
                  className="flex-1"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Active Assist
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  {aiMode === 'listening' && 'AI is listening and analyzing the conversation but not providing suggestions.'}
                  {aiMode === 'suggesting' && 'AI will provide real-time suggestions and insights during the call.'}
                  {aiMode === 'active' && 'AI will actively assist with responses and can speak on your behalf when prompted.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {transcript.map((entry, index) => (
                  <div key={index} className={`p-3 rounded-lg ${entry.speaker === 'You' ? 'bg-blue-50 ml-8' : 'bg-muted mr-8'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{entry.speaker}</span>
                      <span className="text-xs text-muted-foreground">{entry.time}</span>
                    </div>
                    <p className="text-sm">{entry.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Live Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      insight.priority === 'high' ? 'border-red-200 bg-red-50' :
                      insight.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <p className="text-sm">{insight.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Mark as Converted
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600">
                <PhoneOff className="h-4 w-4 mr-2" />
                End Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4">
                <Button
                  variant={isMuted ? 'destructive' : 'outline'}
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant={!isVideoOn ? 'destructive' : 'outline'}
                  size="icon"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
