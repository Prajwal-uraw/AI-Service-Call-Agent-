'use client';

import AdminLayout from '@/components/AdminLayout';
import { Video, Calendar, Clock, Users, Plus } from 'lucide-react';

export default function MeetingsPage() {
  const meetings = [
    { id: 1, title: 'Sales Review', participants: 5, time: 'Today at 2:00 PM', duration: '30 min', status: 'upcoming' },
    { id: 2, title: 'Client Demo', participants: 3, time: 'Today at 4:00 PM', duration: '45 min', status: 'upcoming' },
    { id: 3, title: 'Team Standup', participants: 8, time: 'Tomorrow at 9:00 AM', duration: '15 min', status: 'scheduled' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Video Meetings</h1>
            <p className="text-sm text-neutral-600 mt-1">Schedule and manage video conferences</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Today</span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">2</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">This Week</span>
              <Video className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">8</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Hours</span>
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">12.5</div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-base font-semibold text-neutral-900">Upcoming Meetings</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{meeting.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.participants} participants
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
