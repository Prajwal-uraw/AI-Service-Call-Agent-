'use client';

import AdminShell from '@/components/AdminShell';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { id: '1', name: 'Monthly Performance', type: 'Performance', date: '2025-12-01', size: '2.4MB' },
    { id: '2', name: 'Call Analytics', type: 'Analytics', date: '2025-12-15', size: '1.8MB' },
    { id: '3', name: 'Revenue Report', type: 'Financial', date: '2025-12-10', size: '856KB' },
    { id: '4', name: 'Customer Satisfaction', type: 'Survey', date: '2025-12-05', size: '1.2MB' },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Reports</h1>
            <p className="text-slate-400 mt-2">Generate and download system reports</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Reports</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">48</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">This Month</p>
                <p className="text-2xl font-bold text-green-400 mt-1">12</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Downloads</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">234</p>
              </div>
              <Download className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Scheduled</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">5</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-slate-100">{report.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Scheduled Reports</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-100">Weekly Performance Summary</h3>
                <p className="text-sm text-slate-400 mt-1">Every Monday at 9:00 AM</p>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Edit Schedule
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-100">Monthly Revenue Report</h3>
                <p className="text-sm text-slate-400 mt-1">1st of every month at 8:00 AM</p>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Edit Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
