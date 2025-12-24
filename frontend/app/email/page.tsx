'use client';

import AdminLayout from '@/components/AdminLayout';
import { Mail, Send, Inbox, Star, Archive, Plus } from 'lucide-react';

export default function EmailPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Email</h1>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Compose
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-1 bg-white border border-neutral-200 rounded-lg p-4">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-900 rounded-lg">
                <Inbox className="w-4 h-4" />
                Inbox
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">12</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Star className="w-4 h-4" />
                Starred
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Send className="w-4 h-4" />
                Sent
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg">
                <Archive className="w-4 h-4" />
                Archive
              </button>
            </nav>
          </div>

          <div className="col-span-3 bg-white border border-neutral-200 rounded-lg p-6">
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Email Integration</h3>
              <p className="text-sm text-neutral-600 mb-6">Connect your email to manage all communications in one place</p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Connect Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
