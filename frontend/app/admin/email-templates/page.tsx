'use client';

import AdminShell from '@/components/AdminShell';
import { Mail, Edit, Copy, Trash2 } from 'lucide-react';

export default function EmailTemplatesPage() {
  const templates = [
    { id: '1', name: 'Welcome Email', subject: 'Welcome to Kestrel AI', status: 'active', lastUsed: '2 hours ago' },
    { id: '2', name: 'Appointment Confirmation', subject: 'Your appointment is confirmed', status: 'active', lastUsed: '15 min ago' },
    { id: '3', name: 'Follow-up Reminder', subject: 'Don\'t forget your appointment', status: 'active', lastUsed: '1 hour ago' },
    { id: '4', name: 'Quote Request', subject: 'Your quote is ready', status: 'active', lastUsed: '3 hours ago' },
    { id: '5', name: 'Service Completed', subject: 'Thank you for choosing us', status: 'draft', lastUsed: 'Never' },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Email Templates</h1>
            <p className="text-slate-400 mt-2">Manage automated email templates</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Templates</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">12</p>
              </div>
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Emails Sent Today</p>
                <p className="text-2xl font-bold text-green-400 mt-1">342</p>
              </div>
              <Mail className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Open Rate</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">68%</p>
              </div>
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-100">{template.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {template.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        template.status === 'active' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {template.lastUsed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-400 hover:text-blue-300 p-1" title="Edit template">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-300 p-1" title="Duplicate template">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300 p-1" title="Delete template">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
