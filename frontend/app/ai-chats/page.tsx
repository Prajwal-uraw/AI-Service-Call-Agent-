'use client';

import AdminLayout from '@/components/AdminLayout';
import { Bot, MessageSquare, TrendingUp, Users, Plus } from 'lucide-react';

export default function AiChatsPage() {
  const chats = [
    { id: 1, customer: 'John Smith', status: 'active', messages: 12, lastMessage: 'Looking for AC repair quote', time: '2m ago' },
    { id: 2, customer: 'Sarah Johnson', status: 'resolved', messages: 8, lastMessage: 'Appointment confirmed, thank you!', time: '15m ago' },
    { id: 3, customer: 'Mike Davis', status: 'active', messages: 5, lastMessage: 'What are your service hours?', time: '1h ago' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">AI Chats</h1>
            <p className="text-sm text-neutral-600 mt-1">Monitor AI-powered customer conversations</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Chats</span>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">24</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Resolved Today</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">156</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Satisfaction</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">98%</div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-base font-semibold text-neutral-900">Recent Conversations</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {chats.map((chat) => (
              <div key={chat.id} className="p-6 hover:bg-neutral-50 cursor-pointer transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{chat.customer}</div>
                      <div className="text-sm text-neutral-600 mt-1">{chat.lastMessage}</div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                        <span>{chat.messages} messages</span>
                        <span>•</span>
                        <span>{chat.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    chat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {chat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
