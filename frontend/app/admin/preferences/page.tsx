'use client';

import AdminShell from '@/components/AdminShell';
import { Bell, Moon, Globe, Zap } from 'lucide-react';

export default function PreferencesPage() {
  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Preferences</h1>
          <p className="text-slate-400 mt-2">Customize your experience</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <Bell className="w-6 h-6 text-blue-400 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-2">Notifications</h2>
              <p className="text-sm text-slate-400 mb-4">
                Choose what notifications you want to receive
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Email notifications', description: 'Receive email updates about your account' },
              { label: 'SMS notifications', description: 'Get text messages for important alerts' },
              { label: 'Push notifications', description: 'Browser notifications for real-time updates' },
              { label: 'Weekly reports', description: 'Receive weekly performance summaries' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-100">{item.label}</h3>
                  <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <Moon className="w-6 h-6 text-blue-400 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-2">Appearance</h2>
              <p className="text-sm text-slate-400 mb-4">
                Customize how the interface looks
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Light', 'Dark', 'Auto'].map((theme) => (
                  <button
                    key={theme}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme === 'Dark'
                        ? 'border-blue-600 bg-slate-900/50'
                        : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-100">{theme}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <Globe className="w-6 h-6 text-blue-400 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-100 mb-2">Regional Settings</h2>
              <p className="text-sm text-slate-400 mb-4">
                Set your timezone and language preferences
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timezone
              </label>
              <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 outline-none">
                <option>America/New_York (EST)</option>
                <option>America/Chicago (CST)</option>
                <option>America/Denver (MST)</option>
                <option>America/Los_Angeles (PST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 outline-none">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
