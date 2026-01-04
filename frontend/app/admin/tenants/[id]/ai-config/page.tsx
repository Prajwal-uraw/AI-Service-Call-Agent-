"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { parseError, logError } from "@/lib/errors";
import { 
  Bot, Save, ArrowLeft, Sparkles, MessageSquare, Calendar, 
  Settings, Phone, Clock, AlertCircle, Plus, Trash2, Copy 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.kestrel.ai";

interface Service {
  name: string;
  description: string;
  price_range?: string;
  duration?: number;
}

interface AppointmentType {
  name: string;
  duration: number;
  description?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface AIConfig {
  id: string;
  tenant_id: string;
  agent_name: string;
  agent_personality: string;
  language: string;
  voice_type: string;
  business_name: string;
  business_type: string;
  business_description: string;
  timezone: string;
  services: Service[];
  service_areas: string[];
  system_prompt: string;
  greeting_message: string;
  fallback_message: string;
  closing_message: string;
  max_conversation_duration: number;
  transfer_keywords: string[];
  prohibited_topics: string[];
  appointment_enabled: boolean;
  appointment_duration: number;
  appointment_buffer: number;
  appointment_types: AppointmentType[];
  calendar_provider: string;
  crm_provider: string;
  transfer_phone_number: string;
  business_phone_number: string;
  after_hours_behavior: string;
  faqs: FAQ[];
  record_calls: boolean;
  gdpr_compliant: boolean;
  hipaa_compliant: boolean;
  call_recording_disclaimer: string;
  sentiment_analysis_enabled: boolean;
  lead_qualification_enabled: boolean;
  lead_qualification_questions: string[];
}

const INDUSTRIES = [
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "legal", label: "Legal Services" },
  { value: "medical", label: "Medical/Healthcare" },
  { value: "dental", label: "Dental" },
  { value: "retail", label: "Retail" },
  { value: "restaurant", label: "Restaurant" },
  { value: "real_estate", label: "Real Estate" },
  { value: "automotive", label: "Automotive" },
  { value: "general", label: "General Business" }
];

const PERSONALITIES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" }
];

const VOICE_TYPES = [
  { value: "alloy", label: "Alloy (Neutral)" },
  { value: "echo", label: "Echo (Male)" },
  { value: "fable", label: "Fable (British Male)" },
  { value: "onyx", label: "Onyx (Deep Male)" },
  { value: "nova", label: "Nova (Female)" },
  { value: "shimmer", label: "Shimmer (Soft Female)" }
];

export default function AIConfigPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    fetchConfig();
  }, [tenantId]);

  const fetchConfig = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/ai-config/tenant/${tenantId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch AI configuration");
      }

      const data = await response.json();
      setConfig(data);
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "AIConfigPage.fetchConfig");
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/ai-config/tenant/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      setSuccess("AI configuration saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "AIConfigPage.handleSave");
      setError(appError.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    if (!config) return;
    setConfig({
      ...config,
      services: [...config.services, { name: "", description: "", price_range: "" }]
    });
  };

  const removeService = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      services: config.services.filter((_, i) => i !== index)
    });
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    if (!config) return;
    const newServices = [...config.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setConfig({ ...config, services: newServices });
  };

  const addAppointmentType = () => {
    if (!config) return;
    setConfig({
      ...config,
      appointment_types: [...config.appointment_types, { name: "", duration: 60 }]
    });
  };

  const removeAppointmentType = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      appointment_types: config.appointment_types.filter((_, i) => i !== index)
    });
  };

  const addFAQ = () => {
    if (!config) return;
    setConfig({
      ...config,
      faqs: [...config.faqs, { question: "", answer: "" }]
    });
  };

  const removeFAQ = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      faqs: config.faqs.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </AdminShell>
    );
  }

  if (!config) {
    return (
      <AdminShell>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
          <p className="text-slate-300">No AI configuration found for this tenant.</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push(`/admin/tenants/${tenantId}`)}
              variant="outline"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
                <Bot size={32} />
                AI Agent Configuration
              </h1>
              <p className="text-slate-400 mt-1">Customize AI behavior and instructions</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="mr-2" size={16} />
                Save Configuration
              </>
            )}
          </Button>
        </div>

        {error && <ErrorMessage message={error} type="error" dismissible onDismiss={() => setError("")} />}
        {success && <ErrorMessage message={success} type="success" dismissible onDismiss={() => setSuccess("")} />}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {[
            { id: "basic", label: "Basic Settings", icon: Settings },
            { id: "business", label: "Business Info", icon: Sparkles },
            { id: "messages", label: "Messages & Prompts", icon: MessageSquare },
            { id: "appointments", label: "Appointments", icon: Calendar },
            { id: "routing", label: "Call Routing", icon: Phone },
            { id: "advanced", label: "Advanced", icon: AlertCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Settings Tab */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">Agent Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={config.agent_name}
                    onChange={(e) => setConfig({ ...config, agent_name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="AI Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Personality
                  </label>
                  <select
                    value={config.agent_personality}
                    onChange={(e) => setConfig({ ...config, agent_personality: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  >
                    {PERSONALITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Voice Type
                  </label>
                  <select
                    value={config.voice_type}
                    onChange={(e) => setConfig({ ...config, voice_type: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  >
                    {VOICE_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="en-US"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">Conversation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Max Conversation Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.max_conversation_duration}
                    onChange={(e) => setConfig({ ...config, max_conversation_duration: parseInt(e.target.value) })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Transfer Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config.transfer_keywords.join(", ")}
                    onChange={(e) => setConfig({ ...config, transfer_keywords: e.target.value.split(",").map(k => k.trim()) })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="emergency, urgent, manager"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.sentiment_analysis_enabled}
                      onChange={(e) => setConfig({ ...config, sentiment_analysis_enabled: e.target.checked })}
                      className="rounded"
                    />
                    Enable Sentiment Analysis
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.lead_qualification_enabled}
                      onChange={(e) => setConfig({ ...config, lead_qualification_enabled: e.target.checked })}
                      className="rounded"
                    />
                    Enable Lead Qualification
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Business Info Tab */}
        {activeTab === "business" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={config.business_name}
                      onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Industry/Business Type
                    </label>
                    <select
                      value={config.business_type}
                      onChange={(e) => setConfig({ ...config, business_type: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={config.business_description}
                    onChange={(e) => setConfig({ ...config, business_description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="Describe your business..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Service Areas (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config.service_areas.join(", ")}
                    onChange={(e) => setConfig({ ...config, service_areas: e.target.value.split(",").map(a => a.trim()) })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="Boston, Cambridge, Somerville"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center justify-between">
                  Services Offered
                  <Button onClick={addService} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={16} className="mr-1" />
                    Add Service
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.services.map((service, index) => (
                  <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-slate-200 font-medium">Service {index + 1}</h4>
                      <button
                        onClick={() => removeService(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        placeholder="Service name"
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                      />
                      <input
                        type="text"
                        value={service.price_range || ""}
                        onChange={(e) => updateService(index, "price_range", e.target.value)}
                        placeholder="Price range (e.g., $100-$500)"
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                      />
                    </div>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(index, "description", e.target.value)}
                      placeholder="Service description"
                      rows={2}
                      className="w-full mt-3 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                ))}
                {config.services.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No services added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Messages & Prompts Tab */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">AI Instructions & Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    System Prompt (Custom AI Instructions)
                  </label>
                  <textarea
                    value={config.system_prompt}
                    onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                    rows={6}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 font-mono text-sm"
                    placeholder="You are a helpful AI assistant for [business name]. Your role is to..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This is the core instruction that defines how your AI behaves. Be specific about tone, capabilities, and limitations.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Greeting Message
                  </label>
                  <textarea
                    value={config.greeting_message}
                    onChange={(e) => setConfig({ ...config, greeting_message: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fallback Message
                  </label>
                  <textarea
                    value={config.fallback_message}
                    onChange={(e) => setConfig({ ...config, fallback_message: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Closing Message
                  </label>
                  <textarea
                    value={config.closing_message}
                    onChange={(e) => setConfig({ ...config, closing_message: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center justify-between">
                  FAQs
                  <Button onClick={addFAQ} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={16} className="mr-1" />
                    Add FAQ
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-slate-200 font-medium">FAQ {index + 1}</h4>
                      <button
                        onClick={() => removeFAQ(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...config.faqs];
                        newFaqs[index].question = e.target.value;
                        setConfig({ ...config, faqs: newFaqs });
                      }}
                      placeholder="Question"
                      className="w-full mb-2 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...config.faqs];
                        newFaqs[index].answer = e.target.value;
                        setConfig({ ...config, faqs: newFaqs });
                      }}
                      placeholder="Answer"
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                    />
                  </div>
                ))}
                {config.faqs.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No FAQs added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">Appointment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.appointment_enabled}
                      onChange={(e) => setConfig({ ...config, appointment_enabled: e.target.checked })}
                      className="rounded"
                    />
                    Enable Appointment Scheduling
                  </label>
                </div>

                {config.appointment_enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Default Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={config.appointment_duration}
                          onChange={(e) => setConfig({ ...config, appointment_duration: parseInt(e.target.value) })}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Buffer Between Appointments (minutes)
                        </label>
                        <input
                          type="number"
                          value={config.appointment_buffer}
                          onChange={(e) => setConfig({ ...config, appointment_buffer: parseInt(e.target.value) })}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Calendar Provider
                      </label>
                      <select
                        value={config.calendar_provider || ""}
                        onChange={(e) => setConfig({ ...config, calendar_provider: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                      >
                        <option value="">None</option>
                        <option value="google">Google Calendar</option>
                        <option value="outlook">Microsoft Outlook</option>
                        <option value="calendly">Calendly</option>
                        <option value="acuity">Acuity Scheduling</option>
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center justify-between">
                  Appointment Types
                  <Button onClick={addAppointmentType} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={16} className="mr-1" />
                    Add Type
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.appointment_types.map((type, index) => (
                  <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-slate-200 font-medium">Type {index + 1}</h4>
                      <button
                        onClick={() => removeAppointmentType(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={type.name}
                        onChange={(e) => {
                          const newTypes = [...config.appointment_types];
                          newTypes[index].name = e.target.value;
                          setConfig({ ...config, appointment_types: newTypes });
                        }}
                        placeholder="Appointment type name"
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                      />
                      <input
                        type="number"
                        value={type.duration}
                        onChange={(e) => {
                          const newTypes = [...config.appointment_types];
                          newTypes[index].duration = parseInt(e.target.value);
                          setConfig({ ...config, appointment_types: newTypes });
                        }}
                        placeholder="Duration (minutes)"
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                      />
                    </div>
                  </div>
                ))}
                {config.appointment_types.length === 0 && (
                  <p className="text-slate-400 text-center py-4">No appointment types defined</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call Routing Tab */}
        {activeTab === "routing" && (
          <Card className="bg-slate-800/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-100">Call Routing & Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Transfer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={config.transfer_phone_number}
                    onChange={(e) => setConfig({ ...config, transfer_phone_number: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-slate-500 mt-1">Number to transfer urgent calls</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Phone Number
                  </label>
                  <input
                    type="tel"
                    value={config.business_phone_number}
                    onChange={(e) => setConfig({ ...config, business_phone_number: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  After Hours Behavior
                </label>
                <select
                  value={config.after_hours_behavior}
                  onChange={(e) => setConfig({ ...config, after_hours_behavior: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                >
                  <option value="voicemail">Take Voicemail</option>
                  <option value="transfer">Transfer to Number</option>
                  <option value="message">Leave Message Only</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">Compliance & Legal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.record_calls}
                      onChange={(e) => setConfig({ ...config, record_calls: e.target.checked })}
                      className="rounded"
                    />
                    Record Calls
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.gdpr_compliant}
                      onChange={(e) => setConfig({ ...config, gdpr_compliant: e.target.checked })}
                      className="rounded"
                    />
                    GDPR Compliant
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={config.hipaa_compliant}
                      onChange={(e) => setConfig({ ...config, hipaa_compliant: e.target.checked })}
                      className="rounded"
                    />
                    HIPAA Compliant (Healthcare)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Call Recording Disclaimer
                  </label>
                  <textarea
                    value={config.call_recording_disclaimer}
                    onChange={(e) => setConfig({ ...config, call_recording_disclaimer: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                    placeholder="This call may be recorded for quality and training purposes..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100">CRM Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CRM Provider
                  </label>
                  <select
                    value={config.crm_provider || ""}
                    onChange={(e) => setConfig({ ...config, crm_provider: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100"
                  >
                    <option value="">None</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="zoho">Zoho CRM</option>
                    <option value="custom">Custom API</option>
                  </select>
                </div>

                {config.crm_provider && (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-yellow-400 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      CRM integration requires API keys. Contact support for setup assistance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
