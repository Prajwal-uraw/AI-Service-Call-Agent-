'use client';

import AdminShell from '@/components/AdminShell';
import { Zap, CheckCircle, XCircle, Settings } from 'lucide-react';

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Supabase', status: 'connected', description: 'Database and authentication', icon: '🗄️' },
    { name: 'OpenAI', status: 'connected', description: 'AI voice and intelligence', icon: '🤖' },
    { name: 'Twilio', status: 'connected', description: 'Phone calls and SMS', icon: '📞' },
    { name: 'Daily.co', status: 'connected', description: 'Video conferencing', icon: '📹' },
    { name: 'Resend', status: 'connected', description: 'Email delivery', icon: '📧' },
    { name: 'Slack', status: 'disconnected', description: 'Team notifications', icon: '💬' },
    { name: 'ServiceTitan', status: 'disconnected', description: 'HVAC CRM integration', icon: '🔧' },
    { name: 'Housecall Pro', status: 'disconnected', description: 'Field service management', icon: '🏠' },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Integrations</h1>
          <p className="text-slate-400 mt-2">Manage third-party service connections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div key={integration.name} className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-slate-800/60 hover:border-white/20 transition-all shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{integration.icon}</div>
                {integration.status === 'connected' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{integration.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{integration.description}</p>
              <div className="flex items-center gap-2">
                {integration.status === 'connected' ? (
                  <>
                    <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-medium rounded-full">
                      Connected
                    </span>
                    <button className="ml-auto text-slate-400 hover:text-slate-200 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-100 mb-4">API Usage</h2>
          <div className="space-y-4">
            {[
              { service: 'OpenAI', calls: 45234, cost: '$234.56', limit: '100K/month' },
              { service: 'Twilio', calls: 12456, cost: '$89.23', limit: 'Unlimited' },
              { service: 'Daily.co', calls: 3421, cost: '$45.67', limit: '10K/month' },
            ].map((usage) => (
              <div key={usage.service} className="flex items-center justify-between p-4 bg-slate-900/30 backdrop-blur-md rounded-xl border border-white/5">
                <div>
                  <h3 className="font-semibold text-slate-100">{usage.service}</h3>
                  <p className="text-sm text-slate-400 mt-1">{usage.calls.toLocaleString()} calls this month</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-100">{usage.cost}</p>
                  <p className="text-xs text-slate-400">{usage.limit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
