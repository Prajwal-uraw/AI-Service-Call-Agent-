'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Bot,
  Save,
  Settings,
  Volume2,
  Lightbulb,
  MessageSquare,
  Target,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface AIConfig {
  enabled: boolean;
  mode: 'listening' | 'suggesting' | 'active';
  voice_enabled: boolean;
  auto_respond: boolean;
  suggestion_frequency: 'low' | 'medium' | 'high';
  focus_areas: string[];
  custom_prompts: string[];
  objection_handling: boolean;
  competitor_detection: boolean;
  buying_signal_alerts: boolean;
  sentiment_tracking: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AIShadowConfigPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const resolvedParams = use(params);
  const meetingId = resolvedParams.meetingId;
  
  const [config, setConfig] = useState<AIConfig>({
    enabled: true,
    mode: 'suggesting',
    voice_enabled: false,
    auto_respond: false,
    suggestion_frequency: 'medium',
    focus_areas: ['pricing', 'features', 'competitors'],
    custom_prompts: [],
    objection_handling: true,
    competitor_detection: true,
    buying_signal_alerts: true,
    sentiment_tracking: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [meetingId]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}/ai-config`);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/ai-demo-meetings/${meetingId}/ai-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      alert('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addCustomPrompt = () => {
    if (newPrompt.trim()) {
      setConfig({
        ...config,
        custom_prompts: [...config.custom_prompts, newPrompt.trim()]
      });
      setNewPrompt('');
    }
  };

  const removePrompt = (index: number) => {
    setConfig({
      ...config,
      custom_prompts: config.custom_prompts.filter((_, i) => i !== index)
    });
  };

  const toggleFocusArea = (area: string) => {
    if (config.focus_areas.includes(area)) {
      setConfig({
        ...config,
        focus_areas: config.focus_areas.filter(a => a !== area)
      });
    } else {
      setConfig({
        ...config,
        focus_areas: [...config.focus_areas, area]
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading configuration...</div>
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6" />
              AI Shadow Configuration
            </h1>
            <p className="text-muted-foreground">Configure AI assistant for this demo</p>
          </div>
        </div>
        <Button onClick={saveConfig} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Enable AI Shadow</Label>
                <p className="text-sm text-muted-foreground">Turn AI assistant on/off for this demo</p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">AI Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={config.mode === 'listening' ? 'default' : 'outline'}
                  onClick={() => setConfig({ ...config, mode: 'listening' })}
                  className="flex flex-col h-auto py-3"
                >
                  <Volume2 className="h-5 w-5 mb-1" />
                  <span className="text-xs">Listening</span>
                </Button>
                <Button
                  variant={config.mode === 'suggesting' ? 'default' : 'outline'}
                  onClick={() => setConfig({ ...config, mode: 'suggesting' })}
                  className="flex flex-col h-auto py-3"
                >
                  <Lightbulb className="h-5 w-5 mb-1" />
                  <span className="text-xs">Suggesting</span>
                </Button>
                <Button
                  variant={config.mode === 'active' ? 'default' : 'outline'}
                  onClick={() => setConfig({ ...config, mode: 'active' })}
                  className="flex flex-col h-auto py-3"
                >
                  <Bot className="h-5 w-5 mb-1" />
                  <span className="text-xs">Active</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Suggestion Frequency</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((freq) => (
                  <Button
                    key={freq}
                    variant={config.suggestion_frequency === freq ? 'default' : 'outline'}
                    onClick={() => setConfig({ ...config, suggestion_frequency: freq })}
                    className="capitalize"
                  >
                    {freq}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Voice Responses</Label>
                <p className="text-sm text-muted-foreground">Allow AI to speak during the call</p>
              </div>
              <Switch
                checked={config.voice_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, voice_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Respond</Label>
                <p className="text-sm text-muted-foreground">AI responds automatically to common questions</p>
              </div>
              <Switch
                checked={config.auto_respond}
                onCheckedChange={(checked) => setConfig({ ...config, auto_respond: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Detection Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Objection Handling</p>
                  <p className="text-sm text-muted-foreground">Detect and suggest responses to objections</p>
                </div>
              </div>
              <Switch
                checked={config.objection_handling}
                onCheckedChange={(checked) => setConfig({ ...config, objection_handling: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Competitor Detection</p>
                  <p className="text-sm text-muted-foreground">Alert when competitors are mentioned</p>
                </div>
              </div>
              <Switch
                checked={config.competitor_detection}
                onCheckedChange={(checked) => setConfig({ ...config, competitor_detection: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Buying Signal Alerts</p>
                  <p className="text-sm text-muted-foreground">Highlight positive buying indicators</p>
                </div>
              </div>
              <Switch
                checked={config.buying_signal_alerts}
                onCheckedChange={(checked) => setConfig({ ...config, buying_signal_alerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Sentiment Tracking</p>
                  <p className="text-sm text-muted-foreground">Monitor attendee sentiment in real-time</p>
                </div>
              </div>
              <Switch
                checked={config.sentiment_tracking}
                onCheckedChange={(checked) => setConfig({ ...config, sentiment_tracking: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Areas</CardTitle>
            <CardDescription>Select topics for AI to prioritize</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['pricing', 'features', 'competitors', 'integration', 'support', 'security', 'scalability', 'timeline'].map((area) => (
                <Badge
                  key={area}
                  variant={config.focus_areas.includes(area) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleFocusArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Prompts</CardTitle>
            <CardDescription>Add specific instructions for the AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a custom instruction..."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomPrompt()}
              />
              <Button onClick={addCustomPrompt}>Add</Button>
            </div>
            <div className="space-y-2">
              {config.custom_prompts.map((prompt, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <span className="text-sm">{prompt}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrompt(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {config.custom_prompts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No custom prompts added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Configuration Tips</p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Start with &quot;Suggesting&quot; mode for your first few demos to get comfortable</li>
              <li>• Enable &quot;Buying Signal Alerts&quot; to never miss closing opportunities</li>
              <li>• Add custom prompts for industry-specific terminology or objections</li>
              <li>• Use &quot;Active&quot; mode only when you&apos;re confident with the AI responses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
