'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Building2, Phone, Bot, Clock, Save, Bell, Shield, CreditCard, Users } from 'lucide-react';

type TabType = 'company' | 'voice' | 'ai' | 'hours' | 'notifications' | 'billing' | 'team';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: 'Acme HVAC Services',
    industry: 'hvac',
    website_url: 'https://acmehvac.com',
    owner_email: 'john@acmehvac.com',
    owner_phone: '+1-555-123-4567',
    twilio_phone_number: '+1-555-ACME-123',
    forward_to_number: '+1-555-999-8888',
    emergency_phone: '+1-555-911-HVAC',
    ai_model: 'gpt-4o-mini',
    ai_voice: 'alloy',
    use_elevenlabs: false,
    ai_temperature: 0.7,
    greeting_message: 'Thank you for calling Acme HVAC! How can I help you today?',
    timezone: 'America/Chicago',
  });

  const tabs = [
    { id: 'company' as TabType, label: 'Company', icon: Building2 },
    { id: 'voice' as TabType, label: 'Voice Agent', icon: Phone },
    { id: 'ai' as TabType, label: 'AI Settings', icon: Bot },
    { id: 'hours' as TabType, label: 'Business Hours', icon: Clock },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
    { id: 'team' as TabType, label: 'Team', icon: Users },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-600 mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white border border-neutral-200 rounded-lg">
              {/* Company Settings */}
              {activeTab === 'company' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Company Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={settings.company_name}
                          onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Industry</label>
                        <select
                          value={settings.industry}
                          onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="hvac">HVAC</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="general">General Contractor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Website URL</label>
                        <input
                          type="url"
                          value={settings.website_url}
                          onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Owner Email</label>
                          <input
                            type="email"
                            value={settings.owner_email}
                            onChange={(e) => setSettings({ ...settings, owner_email: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">Owner Phone</label>
                          <input
                            type="tel"
                            value={settings.owner_phone}
                            onChange={(e) => setSettings({ ...settings, owner_phone: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Agent Settings */}
              {activeTab === 'voice' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Voice Agent Configuration</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Twilio Phone Number</label>
                        <input
                          type="tel"
                          value={settings.twilio_phone_number}
                          onChange={(e) => setSettings({ ...settings, twilio_phone_number: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Your main business phone number</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Forward To Number</label>
                        <input
                          type="tel"
                          value={settings.forward_to_number}
                          onChange={(e) => setSettings({ ...settings, forward_to_number: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Where to forward calls when AI can't handle them</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Emergency Phone</label>
                        <input
                          type="tel"
                          value={settings.emergency_phone}
                          onChange={(e) => setSettings({ ...settings, emergency_phone: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <p className="text-xs text-neutral-500 mt-1">Emergency contact number</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Settings */}
              {activeTab === 'ai' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">AI Configuration</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">AI Model</label>
                        <select
                          value={settings.ai_model}
                          onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                          <option value="gpt-4o">GPT-4o (Advanced)</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Voice</label>
                        <select
                          value={settings.ai_voice}
                          onChange={(e) => setSettings({ ...settings, ai_voice: e.target.value })}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="alloy">Alloy (Neutral)</option>
                          <option value="echo">Echo (Male)</option>
                          <option value="nova">Nova (Female)</option>
                          <option value="shimmer">Shimmer (Warm)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Greeting Message</label>
                        <textarea
                          value={settings.greeting_message}
                          onChange={(e) => setSettings({ ...settings, greeting_message: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                        <p className="text-xs text-neutral-500 mt-1">First message customers hear when calling</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <div className="font-medium text-neutral-900">Use ElevenLabs Voice</div>
                          <div className="text-sm text-neutral-600">Higher quality, additional cost</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.use_elevenlabs}
                            onChange={(e) => setSettings({ ...settings, use_elevenlabs: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Hours */}
              {activeTab === 'hours' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Business Hours</h2>
                  <div className="space-y-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg">
                        <div className="w-28 font-medium text-neutral-900">{day}</div>
                        <input type="time" defaultValue="08:00" className="px-3 py-2 border border-neutral-300 rounded-lg" />
                        <span className="text-neutral-500">to</span>
                        <input type="time" defaultValue="17:00" className="px-3 py-2 border border-neutral-300 rounded-lg" />
                        <label className="flex items-center gap-2 ml-auto">
                          <input type="checkbox" className="w-4 h-4" />
                          <span className="text-sm text-neutral-600">Closed</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notification Preferences</h2>
                  {[
                    { title: 'Missed Calls', desc: 'Get notified when a call is missed' },
                    { title: 'New Appointments', desc: 'Alert when new appointment is booked' },
                    { title: 'High-Value Leads', desc: 'Notify for leads over $5,000' },
                    { title: 'System Alerts', desc: 'Important system notifications' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div>
                        <div className="font-medium text-neutral-900">{item.title}</div>
                        <div className="text-sm text-neutral-600">{item.desc}</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  ))}
                </div>
              )}

              {/* Billing */}
              {activeTab === 'billing' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">Billing & Subscription</h2>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-neutral-900">Professional Plan</div>
                        <div className="text-neutral-600">$299/month</div>
                      </div>
                      <button className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                        Change Plan
                      </button>
                    </div>
                    <div className="text-sm text-neutral-600">Next billing date: January 1, 2025</div>
                  </div>
                  <button className="text-sm text-neutral-600 hover:text-neutral-900 font-medium">
                    View billing history →
                  </button>
                </div>
              )}

              {/* Team */}
              {activeTab === 'team' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900">Team Members</h2>
                    <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
                      Invite Member
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'John Doe', email: 'john@acmehvac.com', role: 'Owner' },
                      { name: 'Jane Smith', email: 'jane@acmehvac.com', role: 'Admin' },
                    ].map((member) => (
                      <div key={member.email} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{member.name}</div>
                            <div className="text-sm text-neutral-600">{member.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-neutral-600">{member.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-neutral-200 p-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
