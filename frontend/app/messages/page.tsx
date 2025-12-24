'use client';

import AdminLayout from '@/components/AdminLayout';
import { MessageSquare, Send, Plus } from 'lucide-react';

export default function MessagesPage() {
  const conversations = [
    { id: 1, name: 'Sales Team', lastMessage: 'Great job on the new lead!', time: '5m ago', unread: 2 },
    { id: 2, name: 'Support Team', lastMessage: 'Customer issue resolved', time: '1h ago', unread: 0 },
    { id: 3, name: 'Management', lastMessage: 'Monthly review scheduled', time: '3h ago', unread: 1 },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Team Messages</h1>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-900">Conversations</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {conversations.map((conv) => (
                <div key={conv.id} className="p-4 hover:bg-neutral-50 cursor-pointer">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-neutral-900">{conv.name}</span>
                    {conv.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{conv.unread}</span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600 truncate">{conv.lastMessage}</div>
                  <div className="text-xs text-neutral-500 mt-1">{conv.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white border border-neutral-200 rounded-lg flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-900">Sales Team</h2>
            </div>
            <div className="flex-1 p-6">
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-sm text-neutral-600">Select a conversation to view messages</p>
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" aria-label="Send message">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
