'use client';

import AdminLayout from '@/components/AdminLayout';
import { Inbox, Star, Archive, Trash2, Search } from 'lucide-react';

export default function InboxPage() {
  const messages = [
    { id: 1, from: 'AI Agent', subject: 'New appointment booked', preview: 'John Smith scheduled for tomorrow at 10 AM', time: '5m ago', unread: true },
    { id: 2, from: 'Sarah Johnson', subject: 'Quote request follow-up', preview: 'Following up on the HVAC quote sent last week', time: '1h ago', unread: true },
    { id: 3, from: 'System', subject: 'Weekly report ready', preview: 'Your weekly performance report is now available', time: '3h ago', unread: false },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${msg.unread ? 'text-neutral-900' : 'text-neutral-600'}`}>{msg.from}</span>
                    {msg.unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  <div className={`text-sm ${msg.unread ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>{msg.subject}</div>
                  <div className="text-sm text-neutral-500 mt-1">{msg.preview}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">{msg.time}</span>
                  <button className="p-1 hover:bg-neutral-200 rounded" aria-label="Star message"><Star className="w-4 h-4 text-neutral-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
