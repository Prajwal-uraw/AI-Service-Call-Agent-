'use client';

import AdminLayout from '@/components/AdminLayout';
import { Video, Calendar, Clock, Users, Plus } from 'lucide-react';
import { useMeetings } from './useMeetings';
import { useState } from 'react';
import { MeetingToast } from './MeetingToast';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';

export default function MeetingsPage() {
  const { data: meetings, isLoading, error, refetch } = useMeetings();
  const [toast, setToast] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <AdminLayout>
      <MeetingToast message={toast} onClose={() => setToast("")} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Video Meetings</h1>
            <p className="text-sm text-neutral-600 mt-1">Schedule and manage video conferences</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
          <ScheduleMeetingModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onSchedule={async (title) => {
              const res = await fetch('/api/video/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
              });
              const data = await res.json();
              setToast(data?.message || 'Meeting scheduled!');
              setShowModal(false);
              refetch();
            }}
          />
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
            {isLoading ? (
              <div className="p-6 text-center text-neutral-500">Loading meetings...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">Failed to load meetings</div>
            ) : !meetings || meetings.length === 0 ? (
              <div className="p-6 text-center text-neutral-400">No meetings scheduled</div>
            ) : (
              meetings.map((meeting: any) => (
                <div key={meeting.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{meeting.title || meeting.name || meeting.room_name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meeting.time || meeting.scheduled_time || (meeting.created_at ? new Date(meeting.created_at).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            }) : 'TBD')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meeting.participants || (meeting.participant_count ?? 0) || 0} participants
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      onClick={async () => {
                        const res = await fetch('/api/video/meeting-token', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ meetingId: meeting.id }),
                        });
                        const data = await res.json();
                        setToast(data?.token ? `Join token: ${data.token}` : (data?.message || 'Could not join meeting'));
                      }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
