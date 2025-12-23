'use client';

import AdminShell from '@/components/AdminShell';
import { Database, HardDrive, Activity, Zap, AlertTriangle } from 'lucide-react';

export default function DatabasePage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Database Management</h1>
          <p className="text-slate-400 mt-2">Monitor database performance and health</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Records</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">1.2M</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Storage Used</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">24.5GB</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Query Time</p>
                <p className="text-2xl font-bold text-green-400 mt-1">12ms</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Connections</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">47/100</p>
              </div>
              <Activity className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Table Statistics</h2>
            <div className="space-y-3">
              {[
                { name: 'tenants', rows: 87, size: '2.4MB' },
                { name: 'calls', rows: 124567, size: '18.2GB' },
                { name: 'users', rows: 1243, size: '856KB' },
                { name: 'video_sessions', rows: 3421, size: '3.8GB' },
              ].map((table) => (
                <div key={table.name} className="flex items-center justify-between p-3 bg-slate-900/30 backdrop-blur-md rounded-xl border border-white/5">
                  <span className="text-sm font-medium text-slate-100">{table.name}</span>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>{table.rows.toLocaleString()} rows</span>
                    <span>{table.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Queries</h2>
            <div className="space-y-3">
              {[
                { query: 'SELECT * FROM calls WHERE...', time: '8ms', status: 'success' },
                { query: 'UPDATE tenants SET...', time: '15ms', status: 'success' },
                { query: 'INSERT INTO video_sessions...', time: '23ms', status: 'success' },
                { query: 'DELETE FROM temp_data...', time: '145ms', status: 'slow' },
              ].map((query, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs text-slate-300 font-mono">{query.query}</code>
                    <span className={`text-xs font-medium ${
                      query.status === 'success' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {query.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 backdrop-blur-md border border-yellow-600/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Maintenance Scheduled</h3>
              <p className="text-sm text-slate-300">
                Database maintenance window scheduled for Sunday, 2:00 AM - 4:00 AM UTC. 
                Expected downtime: 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
