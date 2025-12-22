'use client';

import AdminShell from '@/components/AdminShell';
import { Phone, Clock, User, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function CallLogsPage() {
  const calls = [
    {
      id: '1',
      customer: 'John Smith',
      phone: '+1 (555) 123-4567',
      duration: '5:23',
      status: 'completed',
      timestamp: '2025-12-22 14:35:00',
      location: 'New York, NY',
      outcome: 'Appointment Booked'
    },
    {
      id: '2',
      customer: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      duration: '3:12',
      status: 'completed',
      timestamp: '2025-12-22 14:20:00',
      location: 'Los Angeles, CA',
      outcome: 'Quote Requested'
    },
    {
      id: '3',
      customer: 'Mike Wilson',
      phone: '+1 (555) 345-6789',
      duration: '0:45',
      status: 'missed',
      timestamp: '2025-12-22 14:05:00',
      location: 'Chicago, IL',
      outcome: 'No Answer'
    },
    {
      id: '4',
      customer: 'Emily Davis',
      phone: '+1 (555) 456-7890',
      duration: '7:18',
      status: 'completed',
      timestamp: '2025-12-22 13:50:00',
      location: 'Houston, TX',
      outcome: 'Emergency Service'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'missed': return 'text-red-400';
      case 'in-progress': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'missed': return XCircle;
      case 'in-progress': return AlertCircle;
      default: return Phone;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Call Logs</h1>
            <p className="text-slate-400 mt-2">Monitor all incoming and outgoing calls</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Export Logs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Calls</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">1,247</p>
              </div>
              <Phone className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">1,189</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Missed</p>
                <p className="text-2xl font-bold text-red-400 mt-1">58</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Duration</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">4:32</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {calls.map((call) => {
                  const StatusIcon = getStatusIcon(call.status);
                  return (
                    <tr key={call.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-100">{call.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {call.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {call.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`w-4 h-4 mr-2 ${getStatusColor(call.status)}`} />
                          <span className={`text-sm font-medium capitalize ${getStatusColor(call.status)}`}>
                            {call.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {call.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {call.outcome}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
