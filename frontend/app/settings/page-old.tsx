"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Phone, 
  Bot, 
  Clock, 
  Save,
  TestTube,
  Sparkles,
  Volume2,
  MessageSquare
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Company Info
    company_name: "Acme HVAC Services",
    industry: "hvac",
    website_url: "https://acmehvac.com",
    owner_email: "john@acmehvac.com",
    owner_phone: "+1-555-123-4567",
    
    // Voice Agent Config
    twilio_phone_number: "+1-555-ACME-123",
    forward_to_number: "+1-555-999-8888",
    emergency_phone: "+1-555-911-HVAC",
    
    // AI Settings
    ai_model: "gpt-4o-mini",
    ai_voice: "alloy",
    use_elevenlabs: false,
    ai_temperature: 0.7,
    
    // Custom Prompts
    greeting_message: "Thank you for calling Acme HVAC! I'm your AI assistant. How can I help you today?",
    custom_system_prompt: "You are a professional HVAC receptionist for Acme HVAC Services. Be friendly, efficient, and always prioritize emergency situations.",
    
    // Business Hours
    timezone: "America/Chicago",
    business_hours: {
      mon: { open: "08:00", close: "17:00", closed: false },
      tue: { open: "08:00", close: "17:00", closed: false },
      wed: { open: "08:00", close: "17:00", closed: false },
      thu: { open: "08:00", close: "17:00", closed: false },
      fri: { open: "08:00", close: "17:00", closed: false },
      sat: { open: "09:00", close: "14:00", closed: false },
      sun: { open: "00:00", close: "00:00", closed: true }
    },
    
    // SECRET TIP #7: Sandbox Mode
    is_test_mode: false,
    
    // SECRET TIP #2: Feature Flags
    features: {
      voice_cloning: false,
      advanced_analytics: true,
      sentiment_analysis: false,
      call_recording: true,
      voicemail: true,
      sms_notifications: true,
      email_notifications: true,
      white_label: false
    }
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateFeature = (feature: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: enabled }
    }));
    setSaved(false);
  };

  const updateBusinessHours = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: { ...prev.business_hours[day as keyof typeof prev.business_hours], [field]: value }
      }
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const aiModels = [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cost-Effective)" },
    { value: "gpt-4o", label: "GPT-4o (Most Capable)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo (Balanced)" }
  ];

  const aiVoices = [
    { value: "alloy", label: "Alloy (Neutral)" },
    { value: "echo", label: "Echo (Male)" },
    { value: "shimmer", label: "Shimmer (Female)" },
    { value: "nova", label: "Nova (Energetic)" },
    { value: "onyx", label: "Onyx (Deep)" }
  ];

  const days = [
    { key: "mon", label: "Monday" },
    { key: "tue", label: "Tuesday" },
    { key: "wed", label: "Wednesday" },
    { key: "thu", label: "Thursday" },
    { key: "fri", label: "Friday" },
    { key: "sat", label: "Saturday" },
    { key: "sun", label: "Sunday" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600">Manage your voice agent configuration</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>Saving...</>
            ) : saved ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => updateSetting("company_name", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      value={settings.industry}
                      onChange={(e) => updateSetting("industry", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      <option value="hvac">HVAC</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="both">HVAC & Plumbing</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={settings.website_url}
                      onChange={(e) => updateSetting("website_url", e.target.value)}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Twilio Phone Number</label>
                  <input
                    type="tel"
                    value={settings.twilio_phone_number}
                    onChange={(e) => updateSetting("twilio_phone_number", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="+1-555-123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your dedicated voice agent number</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Forward To Number</label>
                  <input
                    type="tel"
                    value={settings.forward_to_number}
                    onChange={(e) => updateSetting("forward_to_number", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="+1-555-999-8888"
                  />
                  <p className="text-xs text-gray-500 mt-1">Transfer calls here when AI can't handle</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Emergency Phone</label>
                  <input
                    type="tel"
                    value={settings.emergency_phone}
                    onChange={(e) => updateSetting("emergency_phone", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="+1-555-911-HVAC"
                  />
                  <p className="text-xs text-gray-500 mt-1">For urgent situations (gas leaks, no heat, etc.)</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">AI Model</label>
                  <select
                    value={settings.ai_model}
                    onChange={(e) => updateSetting("ai_model", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {aiModels.map(model => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">AI Voice</label>
                  <select
                    value={settings.ai_voice}
                    onChange={(e) => updateSetting("ai_voice", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {aiVoices.map(voice => (
                      <option key={voice.value} value={voice.value}>{voice.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Greeting Message</label>
                  <textarea
                    value={settings.greeting_message}
                    onChange={(e) => updateSetting("greeting_message", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 h-24"
                    placeholder="Thank you for calling..."
                  />
                  <p className="text-xs text-gray-500 mt-1">First thing customers hear</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Custom System Prompt</label>
                  <textarea
                    value={settings.custom_system_prompt}
                    onChange={(e) => updateSetting("custom_system_prompt", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 h-32"
                    placeholder="You are a professional HVAC receptionist..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Instructions for AI behavior</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {days.map(day => (
                  <div key={day.key} className="flex items-center gap-4">
                    <div className="w-24 font-medium">{day.label}</div>
                    
                    <Switch
                      checked={!settings.business_hours[day.key as keyof typeof settings.business_hours].closed}
                      onCheckedChange={(checked) => updateBusinessHours(day.key, "closed", !checked)}
                    />
                    
                    {!settings.business_hours[day.key as keyof typeof settings.business_hours].closed ? (
                      <>
                        <input
                          type="time"
                          value={settings.business_hours[day.key as keyof typeof settings.business_hours].open}
                          onChange={(e) => updateBusinessHours(day.key, "open", e.target.value)}
                          className="border rounded px-3 py-1"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={settings.business_hours[day.key as keyof typeof settings.business_hours].close}
                          onChange={(e) => updateBusinessHours(day.key, "close", e.target.value)}
                          className="border rounded px-3 py-1"
                        />
                      </>
                    ) : (
                      <span className="text-gray-400">Closed</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* SECRET TIP #7: Sandbox Mode */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <TestTube className="h-5 w-5" />
                  Sandbox Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">Test Mode</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Test without affecting production data or billing
                      </p>
                    </div>
                    <Switch
                      checked={settings.is_test_mode}
                      onCheckedChange={(checked) => updateSetting("is_test_mode", checked)}
                    />
                  </div>
                  
                  {settings.is_test_mode && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                      <p className="text-xs text-yellow-800 font-medium mb-2">⚠️ Sandbox Active</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Calls won't be billed</li>
                        <li>• SMS won't be sent</li>
                        <li>• Data marked as TEST</li>
                        <li>• Safe to experiment</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SECRET TIP #2: Feature Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Beta Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Voice Cloning */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">AI Voice Cloning</p>
                      <Badge variant="outline" className="text-xs">BETA</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Use ElevenLabs to clone your voice
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.voice_cloning}
                    onCheckedChange={(checked) => updateFeature("voice_cloning", checked)}
                  />
                </div>

                {/* Advanced Analytics */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Advanced Analytics</p>
                      <Badge className="bg-green-100 text-green-800 text-xs">ACTIVE</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Detailed call insights & trends
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.advanced_analytics}
                    onCheckedChange={(checked) => updateFeature("advanced_analytics", checked)}
                  />
                </div>

                {/* Sentiment Analysis */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Sentiment Analysis</p>
                      <Badge variant="outline" className="text-xs">BETA</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Detect customer emotions in calls
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.sentiment_analysis}
                    onCheckedChange={(checked) => updateFeature("sentiment_analysis", checked)}
                  />
                </div>

                {/* White Label */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">White Label</p>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">PRO</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Custom domain & branding
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.white_label}
                    onCheckedChange={(checked) => updateFeature("white_label", checked)}
                    disabled={true}
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    💡 Beta features are tested on 10% of customers first
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Standard Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Standard Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Call Recording</span>
                  <Switch
                    checked={settings.features.call_recording}
                    onCheckedChange={(checked) => updateFeature("call_recording", checked)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Voicemail</span>
                  <Switch
                    checked={settings.features.voicemail}
                    onCheckedChange={(checked) => updateFeature("voicemail", checked)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">SMS Notifications</span>
                  <Switch
                    checked={settings.features.sms_notifications}
                    onCheckedChange={(checked) => updateFeature("sms_notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email Notifications</span>
                  <Switch
                    checked={settings.features.email_notifications}
                    onCheckedChange={(checked) => updateFeature("email_notifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
