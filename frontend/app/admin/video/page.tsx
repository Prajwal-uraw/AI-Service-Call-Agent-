'use client';

import AdminShell from '@/components/AdminShell';
import { Video, Clock, Users, TrendingUp, Play, Calendar } from 'lucide-react';

export default function VideoSessionsPage() {
  const sessions = [
    {
      id: '1',
      title: 'Sales Demo - Acme Corp',
      participants: 3,
      duration: '45:23',
      status: 'completed',
      date: '2025-12-22 10:00',
      recording: true
    },
    {
      id: '2',
      title: 'Team Standup',
      participants: 8,
      duration: '15:42',
      status: 'completed',
      date: '2025-12-22 09:00',
      recording: false
    },
    {
      id: '3',
      title: 'Client Onboarding - TechStart',
      participants: 5,
      duration: '32:18',
      status: 'in-progress',
      date: '2025-12-22 14:30',
      recording: true
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Video Sessions</h1>
            <p className="text-slate-400 mt-2">Manage and monitor video calls</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Start New Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">342</p>
              </div>
              <Video className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Now</p>
                <p className="text-2xl font-bold text-green-400 mt-1">3</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Duration</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">28:45</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Recordings</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">218</p>
              </div>
              <Play className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Sessions</h2>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-100">{session.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {session.recording && (
                    <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-medium rounded-full">
                      Recorded
                    </span>
                  )}
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    session.status === 'in-progress' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {session.status === 'in-progress' ? 'Live' : 'Completed'}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
